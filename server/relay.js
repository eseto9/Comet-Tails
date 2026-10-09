// Comet Tails relay server: room codes, quick match and signalling. Optional.
//
// The game works without it (copy/paste invite codes). With it, players get
// 4-letter room codes and one-click Quick Match. The relay only forwards WebRTC
// offers/answers; gameplay still flows peer-to-peer between browsers.
//
//   npm install && npm start        -> http://localhost:8787 (serves the game too)
//
// Environment:
//   PORT         port to listen on (default 8787)
//   ICE_SERVERS  JSON array of RTCIceServer, e.g. to add TURN for strict NATs:
//                [{"urls":"stun:stun.l.google.com:19302"},
//                 {"urls":"turn:turn.example.com:3478","username":"u","credential":"p"}]
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = +process.env.PORT || 8787;
const MAX_PLAYERS = 4;
const ICE = (() => { try { return JSON.parse(process.env.ICE_SERVERS || 'null'); } catch (e) { return null; } })()
  || [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }];

// ---- HTTP: serve the game, pointed at this relay automatically ----
const GAME = path.join(__dirname, '..', 'index.html');
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url.startsWith('/index.html') || req.url.startsWith('/?')) {
    fs.readFile(GAME, 'utf8', (err, html) => {
      if (err) { res.writeHead(500); return res.end('index.html not found'); }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      res.end(html.replace("RELAY_URL: '',", "RELAY_URL: 'auto',"));
    });
  } else if (req.url === '/health') { res.writeHead(200); res.end('ok'); }
  else { res.writeHead(404); res.end(); }
});

// ---- rooms ----
const rooms = new Map(); // code -> { code, host, guests: Map<id, ws>, public }
let nextId = 1;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
function newCode() {
  for (;;) { let c = ''; for (let i = 0; i < 4; i++) c += ALPHABET[Math.random() * ALPHABET.length | 0]; if (!rooms.has(c)) return c; }
}
const send = (ws, m) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(m)); };

function createRoom(ws, isPublic) {
  leave(ws);
  const room = { code: newCode(), host: ws, guests: new Map(), public: !!isPublic };
  rooms.set(room.code, room); ws.room = room; ws.role = 'host';
  send(ws, { t: 'room', code: room.code, public: room.public, ice: ICE });
}
function joinRoom(ws, room) {
  leave(ws);
  if (!room) return send(ws, { t: 'error', msg: 'No room with that code' });
  if (room.guests.size + 1 >= MAX_PLAYERS) return send(ws, { t: 'error', msg: 'That room is full' });
  room.guests.set(ws.id, ws); ws.room = room; ws.role = 'guest';
  send(ws, { t: 'joined', code: room.code, ice: ICE });
  send(room.host, { t: 'peer', id: ws.id });
}
function leave(ws) {
  const room = ws.room; if (!room) return;
  ws.room = null;
  if (ws.role === 'host') {
    for (const g of room.guests.values()) { send(g, { t: 'room-closed' }); g.room = null; }
    rooms.delete(room.code);
  } else {
    room.guests.delete(ws.id);
    send(room.host, { t: 'peer-left', id: ws.id });
  }
}

const wss = new WebSocketServer({ server, maxPayload: 64 * 1024 });
wss.on('connection', ws => {
  ws.id = nextId++; ws.alive = true;
  ws.on('pong', () => { ws.alive = true; });
  ws.on('message', raw => {
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    switch (m.t) {
      case 'host': createRoom(ws, m.public); break;
      case 'join': joinRoom(ws, rooms.get(String(m.code || '').toUpperCase())); break;
      case 'quick': {
        // join the oldest public room with space, otherwise open one and wait
        const room = [...rooms.values()].find(r => r.public && r.host !== ws && r.guests.size + 1 < MAX_PLAYERS);
        if (room) joinRoom(ws, room); else createRoom(ws, true);
        break;
      }
      case 'signal': { // host -> guest (to = id) or guest -> host
        const room = ws.room; if (!room || !m.data) return;
        if (ws.role === 'host') send(room.guests.get(m.to), { t: 'signal', data: m.data });
        else send(room.host, { t: 'signal', from: ws.id, data: m.data });
        break;
      }
    }
  });
  ws.on('close', () => leave(ws));
});

// drop dead sockets
setInterval(() => {
  for (const ws of wss.clients) { if (!ws.alive) { ws.terminate(); continue; } ws.alive = false; ws.ping(); }
}, 15000);

server.listen(PORT, () => console.log(`Comet Tails relay on http://localhost:${PORT}  (rooms + quick match + signalling)`));
