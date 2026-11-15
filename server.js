import http from 'node:http';
import fs from 'node:fs/promises';
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

function roomOf(socket) {
  return socket.room || 'main';
}

function listMembers(roomName) {
  const members = rooms.get(roomName) || new Set();
  return [...members].map((client) => ({
    id: client.id,
    name: client.name || 'Guest',
    room: roomName,
    x: client.x ?? 1.5,
    y: client.y ?? 1.5,
    angle: client.angle ?? 0,
  }));
}

function broadcast(roomName, payload, skipSocket = null) {
  for (const client of rooms.get(roomName) || []) {
    if (client !== skipSocket && client.readyState === 1) {
      client.send(JSON.stringify(payload));
    }
  }
}

const mimeTypes = {
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

const server = http.createServer(async (req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('Bad request');
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

  socket.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }
    if (!msg || typeof msg.type !== 'string') return;

    if (msg.type === 'hello') {
      const roomName = String(msg.room || 'main').slice(0, 40);
      const members = rooms.get(roomName) || new Set();
      const spawn = spawns[members.size % spawns.length];
      socket.x = spawn.x;
      socket.y = spawn.y;
      socket.room = roomName;
      socket.name = String(msg.name || 'Guest').trim().slice(0, 24) || 'Guest';
      members.add(socket);
      rooms.set(roomName, members);

      socket.send(JSON.stringify({
        type: 'welcome',
        id: socket.id,
        room: roomName,
        name: socket.name,
        members: listMembers(roomName),
      }));
      broadcast(roomName, {
        type: 'member_joined',
        member: {
          id: socket.id,
          name: socket.name,
          x: socket.x,
          y: socket.y,
          angle: socket.angle,
        },
      }, socket);
      return;
    }

    if (msg.type === 'player' && socket.room) {
      const x = Number(msg.x);
      const y = Number(msg.y);
      const angle = Number(msg.angle);
      if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(angle)) return;
      socket.x = Math.max(0, Math.min(20, x));
      socket.y = Math.max(0, Math.min(19, y));
      socket.angle = angle;
      broadcast(roomOf(socket), {
        type: 'player_update',
        id: socket.id,
        name: socket.name,
        x: socket.x,
        y: socket.y,
        angle: socket.angle,
      }, socket);
      return;
    }

    if (msg.type === 'chat' && socket.room) {
      broadcast(roomOf(socket), {
        type: 'chat',
        id: socket.id,
        name: socket.name || 'Guest',
        text: String(msg.text || '').slice(0, 140),
      });
    }
  });

  socket.on('close', () => {
    if (!socket.room) return;
    const room = rooms.get(socket.room);
    if (room) {
      room.delete(socket);
      if (room.size === 0) rooms.delete(socket.room);
    }
    broadcast(socket.room, {
      type: 'member_left',
      id: socket.id,
      name: socket.name || 'Guest',
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backrooms multiplayer server listening on port ${PORT}`);
});
