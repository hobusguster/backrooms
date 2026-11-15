import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { WebSocketServer } from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8080);
const rooms = new Map();
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function getRoom(name) {
  let room = rooms.get(name);
  if (!room) {
    room = { name, clients: new Set(), level: null, seed: null };
    rooms.set(name, room);
  }
  return room;
}

function send(socket, payload) {
  if (socket.readyState === 1) socket.send(JSON.stringify(payload));
}

function broadcast(room, payload, except = null) {
  for (const client of room.clients) if (client !== except) send(client, payload);
}

function broadcastPlayers(room) {
  const payload = {
    t: 'players',
    list: [...room.clients].map((client) => ({
      id: client.id,
      name: client.playerName,
      x: client.x,
      y: client.y,
      ang: client.ang,
      lvl: client.level,
      san: client.sanity,
    })),
  };
  broadcast(room, payload);
}

function sendCurrentLevel(socket, room) {
  if (room.level !== null && room.seed !== null) {
    send(socket, { t: 'seed', lvl: room.level, seed: room.seed });
  }
}

const server = http.createServer(async (req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }

  if (pathname === '/api/rooms') {
    const activeRooms = [...rooms.values()]
      .filter((room) => room.clients.size > 0)
      .map((room) => ({ name: room.name, players: room.clients.size }));
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(JSON.stringify(activeRooms));
    return;
  }

  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(__dirname, relativePath);
  if (filePath !== __dirname && !filePath.startsWith(`${__dirname}${path.sep}`)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  try {
    const contents = await fs.readFile(filePath);
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(contents);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
  }
});

const wss = new WebSocketServer({ server, maxPayload: 16 * 1024 });
wss.on('connection', (socket) => {
  socket.id = randomUUID();
  socket.x = 1.5;
  socket.y = 1.5;
  socket.ang = 0;
  socket.level = 0;
  socket.sanity = 100;
  socket.lastChatAt = 0;
  socket.ignoreJoinStartRequest = false;

  socket.on('message', (raw) => {
    let message;
    try { message = JSON.parse(raw.toString()); } catch { return; }
    if (!message || typeof message.t !== 'string') return;

    if (message.t === 'join') {
      if (socket.room) return;
      const roomName = String(message.room || 'main').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'main';
      const room = getRoom(roomName);
      const joiningRunningRoom = room.level !== null;
      socket.room = room;
      socket.playerName = String(message.name || 'Player').trim().slice(0, 24) || 'Player';
      room.clients.add(socket);
      send(socket, { t: 'welcome', id: socket.id, room: room.name });
      broadcast(room, { t: 'join', id: socket.id, name: socket.playerName }, socket);
      broadcastPlayers(room);

      // Joining an active game puts this player into the current level/map. The
      // client's start button also sends nextLevel(0), so ignore that initial
      // request to prevent a late joiner from resetting everyone to level 0.
      if (joiningRunningRoom) {
        socket.ignoreJoinStartRequest = true;
        sendCurrentLevel(socket, room);
      }
      return;
    }

    const room = socket.room;
    if (!room) return;

    if (message.t === 'nextLevel') {
      const requestedLevel = Number(message.lvl);
      if (!Number.isInteger(requestedLevel) || requestedLevel < 0 || requestedLevel > 10) return;

      if (socket.ignoreJoinStartRequest) {
        socket.ignoreJoinStartRequest = false;
        if (room.level !== requestedLevel) {
          sendCurrentLevel(socket, room);
          return;
        }
      }

      if (room.level === null || room.level !== requestedLevel) {
        room.level = requestedLevel;
        room.seed = Math.floor(Math.random() * 0x7fffffff);
        broadcast(room, { t: 'seed', lvl: room.level, seed: room.seed });
      } else {
        sendCurrentLevel(socket, room);
      }
      return;
    }

    if (message.t === 'move') {
      const x = Number(message.x);
      const y = Number(message.y);
      const ang = Number(message.ang);
      const level = Number(message.lvl);
      const sanity = Number(message.san);
      if (![x, y, ang, level, sanity].every(Number.isFinite)) return;
      socket.x = Math.max(0, Math.min(100, x));
      socket.y = Math.max(0, Math.min(100, y));
      socket.ang = ang;
      socket.level = level;
      socket.sanity = Math.max(0, Math.min(100, sanity));
      broadcastPlayers(room);
      return;
    }

    if (message.t === 'chat') {
      const now = Date.now();
      if (now - socket.lastChatAt < 400) return;
      socket.lastChatAt = now;
      const text = String(message.text || '').trim().slice(0, 140);
      if (text) broadcast(room, { t: 'chat', id: socket.id, name: socket.playerName, text });
    }
  });

  socket.on('close', () => {
    const room = socket.room;
    if (!room) return;
    room.clients.delete(socket);
    broadcast(room, { t: 'leave', id: socket.id, name: socket.playerName });
    if (room.clients.size === 0) rooms.delete(room.name);
    else broadcastPlayers(room);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backrooms server listening on port ${PORT}`);
});
