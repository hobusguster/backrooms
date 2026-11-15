(() => {
  const peers = new Map();
  const pageParams = new URLSearchParams(location.search);
  const room = (pageParams.get('room') || 'main').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'main';
  const savedName = localStorage.getItem('backrooms-player-name');
  const playerName = savedName || `Guest-${Math.floor(1000 + Math.random() * 9000)}`;
  if (!savedName) localStorage.setItem('backrooms-player-name', playerName);

  const status = document.createElement('div');
  status.style.cssText = 'position:fixed;top:82px;left:20px;z-index:6;padding:6px 9px;background:rgba(0,0,0,.65);border:1px solid rgba(240,199,95,.35);color:#d9d2ba;font:12px system-ui;pointer-events:none';
  status.textContent = 'MULTIPLAYER: CONNECTING…';
  document.body.appendChild(status);

  const websocketUrl = location.protocol === 'https:'
    ? `wss://${location.host}`
    : `ws://${location.host}`;
  let socket;
  let retryDelay = 1000;
  let lastSent = 0;

  function setStatus(text, color = '#d9d2ba') {
    status.textContent = text;
    status.style.color = color;
  }

  function send(data) {
    if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(data));
  }

  function connect() {
    setStatus('MULTIPLAYER: CONNECTING…');
    socket = new WebSocket(websocketUrl);
    socket.addEventListener('open', () => {
      retryDelay = 1000;
      send({ type: 'hello', room, name: playerName });
    });
    socket.addEventListener('message', (event) => {
      let message;
      try { message = JSON.parse(event.data); } catch { return; }
      if (message.type === 'welcome') {
        peers.clear();
        for (const member of message.members || []) {
          if (member.id !== message.id) peers.set(member.id, member);
        }
        setStatus(`MULTIPLAYER: ONLINE · ${peers.size + 1} PLAYER${peers.size ? 'S' : ''}`, '#78d78d');
      } else if (message.type === 'member_joined' && message.member) {
        if (message.member.id) peers.set(message.member.id, message.member);
        setStatus(`MULTIPLAYER: ONLINE · ${peers.size + 1} PLAYER${peers.size ? 'S' : ''}`, '#78d78d');
      } else if (message.type === 'player_update' && message.id) {
        peers.set(message.id, message);
      } else if (message.type === 'member_left' && message.id) {
        peers.delete(message.id);
        setStatus(`MULTIPLAYER: ONLINE · ${peers.size + 1} PLAYER${peers.size ? 'S' : ''}`, '#78d78d');
      } else if (message.type === 'chat') {
        setStatus(`${message.name}: ${message.text}`, '#7dd3fc');
        window.setTimeout(() => {
          if (socket && socket.readyState === WebSocket.OPEN) {
            setStatus(`MULTIPLAYER: ONLINE · ${peers.size + 1} PLAYER${peers.size ? 'S' : ''}`, '#78d78d');
          }
        }, 3500);
      }
    });
    socket.addEventListener('close', () => {
      peers.clear();
      setStatus('MULTIPLAYER: DISCONNECTED · RECONNECTING…', '#ff8b7d');
      window.setTimeout(connect, retryDelay);
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
      ctx.fillStyle = '#ffffff';
      ctx.font = `${Math.max(12, Math.min(24, size * 0.35))}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(peer.name || 'Guest', screenX, screenY - size / 2 - 6);
    }
  }

  // Add remote players to the existing game renderer without replacing its gameplay code.
  const originalDrawEnemies = drawEnemies;
  drawEnemies = function () {
    originalDrawEnemies();
    drawRemotePlayers();
  };

  window.setInterval(() => {
    const now = performance.now();
    if (now - lastSent < 100) return;
    lastSent = now;
    send({ type: 'player', x: player.x, y: player.y, angle: player.angle });
  }, 50);

  window.addEventListener('beforeunload', () => {
    if (socket) socket.close();
  });

  connect();
})();
