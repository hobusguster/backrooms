(() => {
  const peers = new Map();
  const params = new URLSearchParams(location.search);
  const room = (params.get('room') || 'main').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'main';
  let playerName;
  try {
    playerName = localStorage.getItem('backrooms-player-name');
    if (!playerName) {
      playerName = `Guest-${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem('backrooms-player-name', playerName);
    }
  } catch {
    playerName = `Guest-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  // Keep the original game's title/menu intact; multiplayer indicators only appear in play.
  const status = document.createElement('div');
  status.style.cssText = 'position:fixed;top:82px;left:20px;z-index:6;padding:6px 9px;background:rgba(0,0,0,.72);border:1px solid rgba(240,199,95,.35);color:#d9d2ba;font:12px system-ui;pointer-events:none;display:none';
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
  const style = document.createElement('style');
  style.textContent = '#multiplayer-chat input{min-width:220px;max-width:min(320px,65vw);padding:9px;color:#d9d2ba;background:rgba(0,0,0,.8);border:1px solid rgba(240,199,95,.45);font:14px system-ui}#multiplayer-chat button{padding:8px 12px}';
  document.head.appendChild(style);
  chat.id = 'multiplayer-chat';

  let socket;
  let clientId = null;
  let ownerId = null;
  let connected = false;
  let retryDelay = 1000;
  let lastSent = 0;
  let reconnectTimer;

  function setStatus(text, color = '#d9d2ba') {
    status.textContent = text;
    status.style.color = color;
  }

  function send(data) {
    if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(data));
  }

  function updatePlayerCount() {
    setStatus(`MULTIPLAYER: ONLINE · ${room} · ${peers.size + 1} PLAYER${peers.size ? 'S' : ''}`, '#78d78d');
  }

  function connect() {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;
    setStatus(`MULTIPLAYER: CONNECTING · ${room}`);
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    socket = new WebSocket(`${protocol}//${location.host}`);
    socket.addEventListener('open', () => {
      retryDelay = 1000;
      send({ type: 'hello', room, name: playerName });
    });
    socket.addEventListener('message', (event) => {
      let message;
      try { message = JSON.parse(event.data); } catch { return; }
      if (message.type === 'welcome') {
        clientId = message.id;
        ownerId = message.ownerId;
        peers.clear();
        for (const peer of message.members || []) if (peer.id !== clientId) peers.set(peer.id, peer);
        applyGameState(message.state);
        connected = true;
        status.style.display = 'block';
        chat.style.display = started ? 'flex' : 'none';
        updatePlayerCount();
      } else if (message.type === 'member_joined' && message.member) {
        peers.set(message.member.id, message.member);
        updatePlayerCount();
      } else if (message.type === 'player_update' && message.id) {
        peers.set(message.id, message);
      } else if (message.type === 'member_left' && message.id) {
        peers.delete(message.id);
        updatePlayerCount();
      } else if (message.type === 'owner_changed') {
        ownerId = message.ownerId;
      } else if (message.type === 'game_state') {
        applyGameState(message);
      } else if (message.type === 'chat') {
        setStatus(`${message.name}: ${message.text}`, '#7dd3fc');
        window.setTimeout(() => { if (connected) updatePlayerCount(); }, 3500);
      }
    });
    socket.addEventListener('close', () => {
      connected = false;
      peers.clear();
      chat.style.display = 'none';
      setStatus('MULTIPLAYER: DISCONNECTED · RECONNECTING…', '#ff8b7d');
      clearTimeout(reconnectTimer);
      reconnectTimer = window.setTimeout(connect, retryDelay);
      retryDelay = Math.min(retryDelay * 2, 15000);
    });
    socket.addEventListener('error', () => socket.close());
  }

  function applyGameState(state) {
    if (!state) return;
    keyPickup.collected = Boolean(state.keyCollected);
    player.keys = state.keyCollected ? 1 : 0;
    if (Array.isArray(state.enemies)) {
      for (let i = 0; i < enemies.length; i++) if (state.enemies[i]) Object.assign(enemies[i], state.enemies[i]);
    }
    updateHud();
    if (state.winner) {
      win = true;
      started = false;
      const panel = screen.querySelector('.panel');
      panel.innerHTML = `<h1><span class="small">${state.winner === clientId ? 'You survived' : `${state.winnerName || 'A player'} survived`}</span>ESCAPED</h1><p>${state.winnerName || 'A player'} reached the exit. The room has been completed.</p><div class="controls"><button id="roomAgainBtn">PLAY AGAIN</button></div>`;
      screen.classList.remove('hidden');
      document.getElementById('roomAgainBtn').addEventListener('click', () => {
        if (clientId === ownerId) send({ type: 'game_reset' });
        else setStatus('Only the room host can restart this round.', '#ff8b7d');
      });
    } else if (win) {
      win = false;
      gameOver = false;
      resetGame();
    }
  }

  function drawRemotePlayers() {
    for (const peer of peers.values()) {
      const dx = peer.x - player.x;
      const dy = peer.y - player.y;
      const distance = Math.hypot(dx, dy);
      let angleTo = Math.atan2(dy, dx) - player.angle;
      angleTo = Math.atan2(Math.sin(angleTo), Math.cos(angleTo));
      if (Math.abs(angleTo) >= Math.PI / 2 + 0.85 || distance < 0.3) continue;
      const screenX = canvas.width / 2 + (Math.tan(angleTo) * canvas.width * 0.7) / Math.tan(Math.PI / 6);
      const size = Math.max(10, (canvas.height / distance) * 0.75);
      const screenY = canvas.height / 2;
      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size);
      ctx.fillStyle = '#fff';
      ctx.font = `${Math.max(12, Math.min(24, size * 0.35))}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(peer.name || 'Guest', screenX, screenY - size / 2 - 6);
    }
  }

  const originalDrawEnemies = drawEnemies;
  drawEnemies = function () {
    originalDrawEnemies();
    drawRemotePlayers();
  };

  const originalSetMessage = setMessage;
  setMessage = function (text, duration) {
    originalSetMessage(text, duration);
    if (String(text).startsWith('Key acquired')) send({ type: 'collect_key' });
    if (String(text).startsWith('You escaped')) send({ type: 'win' });
  };

  startBtn.addEventListener('click', () => {
    status.style.display = 'block';
    if (connected) chat.style.display = 'flex';
    else connect();
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

  window.addEventListener('beforeunload', () => {
    clearTimeout(reconnectTimer);
    if (socket) socket.close();
  });
})();
