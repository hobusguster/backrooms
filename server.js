import http from 'node:http';
import fs from 'node/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { WebSocketServer } from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8080);
const rooms = new Map();
const spawns = [
  { x: 1.5, y: 1.5 },
  { x: 2.5, y: 1.5 },
  { x: 1.5, y: 2.5 },
  { x: 2.5, y: 2.5 },
];
const KEY = { x: 9.5, y: 7.5 };
const EXIT = { x: 16.5, y: 16.5 };

function getRoom(name) {
  if (!rooms.has(name)) rooms.set(name, { clients: new Set(), keyCollected: false, winner: null });
  return rooms.get(name);
}

function membersPayload(room) {
  return [...room.clients].map((client) => ({
    id: client.id,
    name: client.name || 'Guest',
    x: client.x,
    y: client.y,
    angle: client.angle,
    health: client.health,
  }));
}

function send(socket, payload) {
  if (socket.readyState === 1) socket.send(JSON.stringify(payload));
}

function broadcast(room, payload, except = null) {
  for (const client of room.clients) if (client !== except) send(client, payload);
}

function broadcastGameState(roomName, room) {
  broadcast(room, {
    type: 'game_state',
    keyCollected: room.keyCollected,
    winner: room.winner,
    winnerName: room.winnerName || null,
  });
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end('Bad request'); return; }

  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(__dirname, relativePath);
  if (filePath !== __dirname && !filePath.startsWith(`${__dirname}${path.sep}`)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const contents = await fs.readFile(filePath);
    res.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(contents);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
  }
});

const wss = new WebSocketServer({ server });
wss.on('connection', (socket) => {
  socket.id = randomUUID();
  socket.x = spawns[0].x;
  socket.y = spawns[0].y;
  socket.angle = 0;
  socket.health = 100;

  socket.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }
    if (!msg || typeof msg.type !== 'string') return;

    if (msg.type === 'hello') {
      const roomName = String(msg.room || 'main').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'main';
      const room = getRoom(roomName);
      const spawn = spawns[room.clients.size % spawns.length];
      socket.x = spawn.x;
      socket.y = spawn.y;
      socket.roomName = roomName;
      socket.name = String(msg.name || 'Guest').trim().slice(0, 24) || 'Guest';
      room.clients.add(socket);
      send(socket, {
        type: 'welcome', id: socket.id, room: roomName,
        members: membersPayload(room), keyCollected: room.keyCollected,
        winner: room.winner, winnerName: room.winnerName || null,
      });
      broadcast(room, {
        type: 'member_joined',
        member: { id: socket.id, name: socket.name, x: socket.x, y: socket.y, angle: socket.angle, health: socket.health },
      }, socket);
      return;
    }

    if (!socket.roomName) return;
    const room = getRoom(socket.roomName);

    if (msg.type === 'player') {
      const x = Number(msg.x), y = Number(msg.y), angle = Number(msg.angle);
      if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(angle)) return;
      socket.x = Math.max(0, Math.min(20, x));
      socket.y = Math.max(0, Math.min(19, y));
      socket.angle = angle;
      const health = Number(msg.health);
      if (Number.isFinite(health)) socket.health = Math.max(0, Math.min(100, health));
      broadcast(room, {
        type: 'player_update', id: socket.id, name: socket.name,
        x: socket.x, y: socket.y, angle: socket.angle, health: socket.health,
      }, socket);
      return;
    }

    if (msg.type === 'collect_key' && !room.keyCollected) {
      if (Math.hypot(socket.x - KEY.x, socket.y - KEY.y) <= 1.15) {
        room.keyCollected = true;
        broadcastGameState(socket.roomName, room);
      }
      return;
    }

    if (msg.type === 'win' && room.keyCollected && !room.winner) {
      if (Math.hypot(socket.x - EXIT.x, socket.y - EXIT.y) <= 1.25) {
        room.winner = socket.id;
        room.winnerName = socket.name;
        broadcastGameState(socket.roomName, room);
      }
      return;
    }

    if (msg.type === 'reset_room' && socket.id === room.ownerId) {
      room.keyCollected = false;
      room.winner = null;
      room.winnerName = null;
      broadcastGameState(socket.roomName, room);
      return;
    }

    if (msg.type === 'chat') {
      broadcast(room, {
        type: 'chat', id: socket.id, name: socket.name || 'Guest',
        text: String(msg.text || '').slice(0, 140),
      });
    }
  });

  socket.on('close', () => {
    if (!socket.roomName) return;
    const room = rooms.get(socket.roomName);
    if (!room) return;
    room.clients.delete(socket);
    broadcast(room, { type: 'member_left', id: socket.id, name: socket.name || 'Guest' });
    if (room.clients.size === 0) rooms.delete(socket.roomName);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backrooms multiplayer server listening on port ${PORT}`);
});
