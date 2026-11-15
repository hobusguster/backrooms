import http from 'node:http';
import fs from 'node:promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { WebSocketServer } from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8080);
const rooms = new Map();
const SPAWNS = [
  { x: 1.5, y: 1.5 },
  { x: 2.5, y: 1.5 },
  { x: 1.5, y: 2.5 },
  { x: 2.5, y: 2.5 },
];
const INITIAL_ENEMIES = [
  { x: 5.5, y: 5.5, hp: 100, active: true },
  { x: 12.5, y: 9.5, hp: 100, active: true },
  { x: 15.5, y: 14.5, hp: 100, active: true },
];
const KEY = { x: 9.5, y: 7.5 };
const EXIT = { x: 16.5, y: 16.5 };

function createRoom(name) {
  return {
    name,
    clients: new Set(),
    ownerId: null,
    keyCollected: false,
    winner: null,
    winnerName: null,
    enemies: INITIAL_ENEMIES.map((enemy) => ({ ...enemy })),
  };
}

function getRoom(name) {
  if (!rooms.has(name)) rooms.set(name, createRoom(name));
  return rooms.get(name);
}

function send(socket, payload) {
  if (socket.readyState === 1) socket.send(JSON.stringify(payload));
}

function broadcast(room, payload, except = null) {
  for (const client of room.clients) if (client !== except) send(client, payload);
}

function roomState(room) {
  return {
    type: 'game_state',
    keyCollected: room.keyCollected,
    winner: room.winner,
    winnerName: room.winnerName,
    enemies: room.enemies,
  };
}

function members(room) {
  return [...room.clients].map((client) => ({
    id: client.id,
    name: client.name,
    x: client.x,
    y: client.y,
    angle: client.angle,
    health: client.health,
  }));
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

  if (pathname === '/api/rooms') {
    const activeRooms = [...rooms.values()]
      .filter((room) => room.clients.size > 0)
      .map((room) => ({ name: room.name, players: room.clients.size }));
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
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
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
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
  socket.health = 100;
  socket.lastChatAt = 0;

  socket.on('message', (raw) => {
    let message;
    try { message = JSON.parse(raw.toString()); } catch { return; }
    if (!message || typeof message.type !== 'string') return;

    if (message.type === 'hello') {
      if (socket.roomName) return;
      const roomName = String(message.room || 'main').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'main';
      const room = getRoom(roomName);
      const spawn = SPAWNS[room.clients.size % SPAWNS.length];
      socket.roomName = roomName;
      socket.name = String(message.name || 'Guest').trim().slice(0, 24) || 'Guest';
      socket.x = spawn.x;
      socket.y = spawn.y;
      socket.angle = 0;
      room.clients.add(socket);
      if (!room.ownerId) room.ownerId = socket.id;
      send(socket, {
        type: 'welcome', id: socket.id, room: roomName, ownerId: room.ownerId,
        members: members(room), state: roomState(room),
      });
      broadcast(room, {
        type: 'member_joined',
        member: { id: socket.id, name: socket.name, x: socket.x, y: socket.y, angle: socket.angle, health: socket.health },
      }, socket);
      return;
    }

    if (!socket.roomName) return;
    const room = rooms.get(socket.roomName);
    if (!room) return;

    if (message.type === 'player') {
      const x = Number(message.x), y = Number(message.y), angle = Number(message.angle);
      if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(angle)) return;
      socket.x = Math.max(0, Math.min(20, x));
      socket.y = Math.max(0, Math.min(19, y));
      socket.angle = angle;
      const health = Number(message.health);
      if (Number.isFinite(health)) socket.health = Math.max(0, Math.min(100, health));
      broadcast(room, {
        type: 'player_update', id: socket.id, name: socket.name,
        x: socket.x, y: socket.y, angle: socket.angle, health: socket.health,
      }, socket);
    } else if (message.type === 'collect_key' && !room.keyCollected) {
      if (Math.hypot(socket.x - KEY.x, socket.y - KEY.y) <= 1.2) {
        room.keyCollected = true;
        broadcast(room, roomState(room));
      }
    } else if (message.type === 'win' && room.keyCollected && !room.winner) {
      if (Math.hypot(socket.x - EXIT.x, socket.y - EXIT.y) <= 1.3) {
        room.winner = socket.id;
        room.winnerName = socket.name;
        broadcast(room, roomState(room));
      }
    } else if (message.type === 'game_reset' && socket.id === room.ownerId) {
      room.keyCollected = false;
      room.winner = null;
      room.winnerName = null;
      room.enemies = INITIAL_ENEMIES.map((enemy) => ({ ...enemy }));
      broadcast(room, roomState(room));
    } else if (message.type === 'chat') {
      const now = Date.now();
      if (now - socket.lastChatAt < 400) return;
      socket.lastChatAt = now;
      const text = String(message.text || '').trim().slice(0, 140);
      if (text) broadcast(room, { type: 'chat', id: socket.id, name: socket.name, text });
    }
  });

  socket.on('close', () => {
    if (!socket.roomName) return;
    const room = rooms.get(socket.roomName);
    if (!room) return;
    room.clients.delete(socket);
    broadcast(room, { type: 'member_left', id: socket.id, name: socket.name });
    if (room.clients.size === 0) rooms.delete(socket.roomName);
    else if (room.ownerId === socket.id) {
      room.ownerId = room.clients.values().next().value.id;
      broadcast(room, { type: 'owner_changed', ownerId: room.ownerId });
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backrooms server listening on port ${PORT}`);
});
