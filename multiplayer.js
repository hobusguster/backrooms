(() => {
  const peers = new Map();
  const params = new URLSearchParams(location.search);
  const roomInput = document.createElement('input');
  roomInput.value = (params.get('room') || 'main').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'main';
  roomInput.maxLength = 40;
  roomInput.placeholder = 'Room name';
  roomInput.setAttribute('aria-label', 'Room name');

  const nameInput = document.createElement('input');
  try { nameInput.value = localStorage.getItem('backrooms-player-name') || ''; } catch { /* storage may be disabled */ }
  nameInput.maxLength = 24;
  nameInput.placeholder = 'Your name';
  nameInput.setAttribute('aria-label', 'Your player name');

  const roomSelect = document.createElement('select');
  roomSelect.setAttribute('aria-label', 'Active rooms');
  const refreshRooms = document.createElement('button');
  refreshRooms.type = 'button';
  refreshRooms.textContent = 'ROOMS';
  refreshRooms.className = 'secondary';
  const inviteButton = document.createElement('button');
  inviteButton.type = 'button';
  inviteButton.textContent = 'COPY ROOM LINK';
  inviteButton.className = 'secondary';
  const panel = document.querySelector('#screen .panel');
  const roomControls = document.createElement('div');
  roomControls.className = 'controls';
  roomControls.append(nameInput, roomInput, roomSelect, refreshRooms, inviteButton);
  panel.insertBefore(roomControls, panel.querySelector('.hint'));

  const status = document.createElement('div');
  status.style.cssText = 'position:fixed;top:82px;left:20px;z-index:6;padding:6px 9px;background:rgba(0,0,0,.72);border:1px solid rgba(240,199,95,.35);color:#d9d2ba;font:12px system-ui;pointer-events:none';
  status.textContent = 'MULTIPLAYER: NOT CONNECTED';
  document.body.appendChild(status);

  const chat = document.createElement('form');
  chat.style.cssText = 'position:fixed;left:20px;top:120px;z-index:7;display:none;gap:6px;max-width:min(420px,90vw)';
  const chatInput = document.createElement('input');
  chatInput.maxLength = 140;
  chatInput.placeholder = 'Chat message (Enter)';
  chatInput.setAttribute('aria-label', 'Chat message');
  const chatButton = document.createElement('button');
  chatButton.type = 'submit';
  chatButton.textContent = 'SEND';
  chat.append(chatInput, chatButton);
  document.body.appendChild(chat);

  const roomStyle = document.createElement('style');
  roomStyle.textContent = `
    #screen input, #screen select, #multiplayer-chat input {
      min-width: 115px; max-width: 180px; padding: 10px; color: #d9d2ba;
      background: rgba(0,0,0,.65); border: 1px solid rgba(240,199,95,.45); font: 14px system-ui;
    }
    #multiplayer-chat input { min-width: 220px; max-width: min(320px,65vw); }
    #multiplayer-chat button { padding: 8px 12px; }
  `;
  document.head.appendChild(roomStyle);
  chat.id = 'multiplayer-chat';

  let socket = null;
  let clientId = null;
  let ownerId = null;
  let currentRoom = 'main';
  let retryDelay = 1000;
  let lastSent = 0;
  let connected = false;
  let reconnectTimer = null;

  function updateStatus(text, color = '#d9d2ba') {
    status.textContent = text;
    status.style.color = color;
  }

  function send(data) {
    if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(data));
  }

  async function loadRooms() {
    try {
      const response = await fetch('/api/rooms', { cache: 'no-store' });
      if (!response.ok) return;
      const activeRooms = await response.json();
      const previous = roomSelect.value;
      roomSelect.replaceChildren();
      const own = document.createElement('option');
      own.value = '';
      own.textContent = 'Join active room…';
      roomSelect.append(own);
      for (const room of activeRooms) {
        const option = document.createElement('option');
        option.value = room.name;
        option.textContent = `${room.name} (${room.players})`;
        roomSelect.append(option);
      }
      if ([...roomSelect.options].some((option) => option.value === previous)) roomSelect.value = previous;
    } catch { /* room discovery is optional */ }
  }

  roomSelect.addEventListener('change', () => {
    if (roomSelect.value) roomInput.value = roomSelect.value;
  });
  refreshRooms.addEventListener('click', loadRooms);
  inviteButton.addEventListener('click', async () => {
    const roomName = roomInput.value.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'main';
    const inviteUrl = new URL(location.href);
    inviteUrl.searchParams.set('room', roomName);
    try {
      await navigator.clipboard.writeText(inviteUrl.href);
      updateStatus(`ROOM LINK COPIED · ${roomName}`, '#78d78d');
    } catch {
      window.prompt('Copy this room link for your friends:', inviteUrl.href);
    }
  });

  function applyGameState(state) {
    if (!state) return;
    keyPickup.collected = Boolean(state.keyCollected);
    player.keys = state.keyCollected ? 1 : 0;
    if (Array.isArray(state.enemies)) {
      for (let i = 0; i < enemies.length; i++) {
        const shared = state.enemies[i];
        if (shared) Object.assign(enemies[i], shared);
      }
    }
    updateHud();
    if (state.winner) {
      win = true;
      started = false;
      const panelElement = screen.querySelector('.panel');
      panelElement.innerHTML = `
        <h1><span class="small">${state.winner === clientId ? 'You survived' : `${state.winnerName || 'A player'} survived`}</span>ESCAPED</h1>
        <p>${state.winnerName || 'A player'} reached the exit. The room has been completed.</p>
        <div class="controls"><button id="roomAgainBtn">PLAY AGAIN</button></div>
      `;
      screen.classList.remove('hidden');
      document.getElementById('roomAgainBtn').addEventListener('click', () => {
        if (clientId === ownerId) send({ type: 'game_reset' });
        else updateStatus('Only the room host can restart this round.', '#ff8b7d');
      });
    } else if (win) {
      win = false;
      gameOver = false;
      started = true;
      resetGame();
    }
  }

  function handleMessage(message) {
    if (message.type === 'welcome') {
      clientId = message.id;
      ownerId = message.ownerId;
      peers.clear();
      for (const member of message.members || []) if (member.id !== clientId) peers.set(member.id, member);
      applyGameState(message.state);
      connected = true;
      updateStatus(`ONLINE · ${currentRoom} · ${peers.size + 1} PLAYER${peers.size ? 'S' : ''}`, '#78d78d');
      chat.style.display = 'flex';
      loadRooms();
    } else if (message.type === 'member_joined' && message.member) {
      peers.set(message.member.id, message.member);
      updateStatus(`ONLINE · ${currentRoom} · ${peers.size + 1} PLAYER${peers.size ? 'S' : ''}`, '#78d78d');
    } else if (message.type === 'player_update' && message.id) {
      peers.set(message.id, message);
    } else if (message.type === 'member_left' && message.id) {
      peers.delete(message.id);
      updateStatus(`ONLINE · ${currentRoom} · ${peers.size + 1} PLAYER${peers.size ? 'S' : ''}`, '#78d78d');
    } else if (message.type === 'owner_changed') {
      ownerId = message.ownerId;
    } else if (message.type === 'game_state') {
      applyGameState(message);
    } else if (message.type === 'chat') {
      updateStatus(`${message.name}: ${message.text}`, '#7dd3fc');
      window.setTimeout(() => {
        if (connected) updateStatus(`ONLINE · ${currentRoom} · ${peers.size + 1} PLAYER${peers.size ? 'S' : ''}`, '#78d78d');
      }, 3500);
    }
  }

  function connect() {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;
    currentRoom = roomInput.value.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'main';
    const name = nameInput.value.trim().slice(0, 24) || `Guest-${Math.floor(1000 + Math.random() * 9000)}`;
    nameInput.value = name;
    try { localStorage.setItem('backrooms-player-name', name); } catch { /* storage may be disabled */ }
    updateStatus(`CONNECTING · ${currentRoom}…`);
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    socket = new WebSocket(`${protocol}//${location.host}`);
    socket.addEventListener('open', () => {
      retryDelay = 1000;
      send({ type: 'hello', room: currentRoom, name });
    });
    socket.addEventListener('message', (event) => {
      let message;
      try { message = JSON.parse(event.data); } catch { return; }
      handleMessage(message);
    });
    socket.addEventListener('close', () => {
      connected = false;
      peers.clear();
      chat.style.display = 'none';
      updateStatus('DISCONNECTED · RECONNECTING…', '#ff8b7d');
      clearTimeout(reconnectTimer);
      reconnectTimer = window.setTimeout(connect, retryDelay);
      retryDelay = Math.min(retryDelay * 2, 15000);
    });
    socket.addEventListener('error', () => socket.close());
  }

  function drawRemotePlayers() {
    for (const peer of peers.values()) {
      const dx = peer.x - player.x;
      const dy = peer.y - player.y;
      const distance = Math.hypot(dx, dy);
      let angleTo = Math.atan2(dy, dx) - player.angle;
      angleTo = Math.atan2(Math.sin(angleTo), Math.cos(angleTo));
      if (Math.abs(angleTo) >= Math.PI / 2 + 0.85 || distance < 0.3) continue;
      const screenX = (canvas.width / 2) + (Math.tan(angleTo) * canvas.width * 0.7) / Math.tan(Math.PI / 6);
      const size = Math.max(10, (canvas.height / distance) * 0.75);
      const screenY = canvas.height / 2;
      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size);
      ctx.fillStyle = '#fff';
      ctx.font = `${Math.max(12, Math.min(24, size * 0.35))}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(`${peer.name || 'Guest'}${peer.health <= 0 ? ' (DOWN)' : ''}`, screenX, screenY - size / 2 - 6);
    }
  }

  const originalDrawEnemies = drawEnemies;
  drawEnemies = function () {
    originalDrawEnemies();
    drawRemotePlayers();
  };

  function onGameMessage(text) {
    if (text.startsWith('Key acquired')) send({ type: 'collect_key' });
    if (text.startsWith('You escaped')) send({ type: 'win' });
  }
  const originalSetMessage = setMessage;
  setMessage = function (text, duration) {
    originalSetMessage(text, duration);
    onGameMessage(String(text));
  };

  startBtn.addEventListener('click', () => {
    if (!connected) connect();
  });
  restartBtn.addEventListener('click', () => {
    if (clientId === ownerId) send({ type: 'game_reset' });
  });
  chat.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = chatInput.value.trim();
    if (text) send({ type: 'chat', text });
    chatInput.value = '';
    chatInput.focus();
  });

  window.setInterval(() => {
    const now = performance.now();
    if (!connected || now - lastSent < 100) return;
    lastSent = now;
    send({ type: 'player', x: player.x, y: player.y, angle: player.angle, health: player.health });
  }, 50);

  loadRooms();
  window.addEventListener('beforeunload', () => {
    clearTimeout(reconnectTimer);
    if (socket) socket.close();
  });
})();
