import { WebSocketServer } from 'ws';

const PORT = Number(process.env.PORT || 8080);
const wss = new WebSocketServer({ port: PORT });

const rooms = new Map();

function roomOf(socket) {
  return socket.room || 'main';
}

function joinRoom(socket, roomName, name) {
  const oldRoom = socket.room;
  if (oldRoom && oldRoom !== roomName) {
    const oldMembers = rooms.get(oldRoom) || new Set();
    oldMembers.delete(socket);
    if (oldMembers.size === 0) rooms.delete(oldRoom);
  }

  socket.room = roomName;
  if (!rooms.has(roomName)) rooms.set(roomName, new Set());
  rooms.get(roomName).add(socket);
  socket.name = name || 'Guest';
}

function broadcast(roomName, payload, skipSocket = null) {
  const members = rooms.get(roomName) || new Set();
  for (const client of members) {
    if (client !== skipSocket && client.readyState === 1) {
      client.send(JSON.stringify(payload));
    }
  }
}

function listMembers(roomName) {
  const members = rooms.get(roomName) || new Set();
  return [...members].map((client) => ({
    name: client.name || 'Guest',
    room: roomName,
    x: client.x ?? 0,
    y: client.y ?? 0,
    angle: client.angle ?? 0,
  }));
}

wss.on('connection', (socket) => {
  socket.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (!msg || !msg.type) return;

    if (msg.type === 'hello') {
      joinRoom(socket, msg.room || 'main', msg.name || 'Guest');
      socket.send(JSON.stringify({
        type: 'welcome',
        room: roomOf(socket),
        name: socket.name,
        members: listMembers(roomOf(socket)),
      }));
      broadcast(roomOf(socket), {
        type: 'member_joined',
        member: { name: socket.name, room: roomOf(socket) },
      }, socket);
      return;
    }

    if (msg.type === 'chat') {
      const roomName = roomOf(socket);
      broadcast(roomName, {
        type: 'chat',
        name: socket.name || 'Guest',
        text: String(msg.text || '').slice(0, 140),
      });
      return;
    }

    if (msg.type === 'player') {
      const roomName = roomOf(socket);
      socket.x = Number(msg.x ?? socket.x ?? 0);
      socket.y = Number(msg.y ?? socket.y ?? 0);
      socket.angle = Number(msg.angle ?? socket.angle ?? 0);
      broadcast(roomName, {
        type: 'player_update',
        name: socket.name || 'Guest',
        x: socket.x,
        y: socket.y,
        angle: socket.angle,
      }, socket);
      return;
    }
  });

  socket.on('close', () => {
    const roomName = roomOf(socket);
    const room = rooms.get(roomName);
    if (room) {
      room.delete(socket);
      if (room.size === 0) rooms.delete(roomName);
    }
    if (roomName) {
      broadcast(roomName, {
        type: 'member_left',
        name: socket.name || 'Guest',
      });
    }
  });
});

console.log(`Backrooms multiplayer server running on ws://localhost:${PORT}`);
