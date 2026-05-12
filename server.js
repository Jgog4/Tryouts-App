const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data.json');

// ── Seed data ─────────────────────────────────────────────────────────────────
const SEED_PLAYERS = [
  { name: 'Cameron Coulson',     division: 'Majors B', batting_avg: 0.478, plate_appearances: 30,  group_num: 1 },
  { name: 'Lewys Edmonds',       division: 'Minors',   batting_avg: 0.615, plate_appearances: 14,  group_num: 1 },
  { name: 'Johnny Khakh',        division: 'Majors B', batting_avg: 0.273, plate_appearances: 29,  group_num: 1 },
  { name: 'Marin Stimac',        division: 'Minors',   batting_avg: 0.818, plate_appearances: 11,  group_num: 1 },
  { name: 'Maximo Rodriguez',    division: 'Majors B', batting_avg: 0.308, plate_appearances: 18,  group_num: 1 },
  { name: 'Elliott Cheng',       division: 'Minors',   batting_avg: 0.667, plate_appearances: 16,  group_num: 1 },
  { name: 'Hunter Le Poidevin',  division: 'Minors',   batting_avg: 0.714, plate_appearances: 15,  group_num: 1 },
  { name: 'Jamie Blackadar',     division: 'Minors',   batting_avg: 0.538, plate_appearances: 14,  group_num: 1 },
  { name: 'Jude Murray',         division: 'Minors',   batting_avg: 0.700, plate_appearances: 11,  group_num: 1 },
  { name: 'Ryker Ing',           division: 'Majors B', batting_avg: 0.400, plate_appearances: 28,  group_num: 2 },
  { name: 'Kyser Jiang',         division: 'Majors B', batting_avg: 0.318, plate_appearances: 27,  group_num: 2 },
  { name: 'Joey Narodowski',     division: 'Majors B', batting_avg: 0.417, plate_appearances: 31,  group_num: 2 },
  { name: 'Gabriel Fernandes',   division: 'Majors B', batting_avg: 0.273, plate_appearances: 20,  group_num: 2 },
  { name: 'Bennett Fox',         division: 'Majors B', batting_avg: 0.357, plate_appearances: 27,  group_num: 2 },
  { name: 'Antonio Cardoso',     division: 'Majors B', batting_avg: 0.278, plate_appearances: 31,  group_num: 2 },
  { name: 'Jaxon Mumford',       division: 'Majors B', batting_avg: 0.125, plate_appearances: 26,  group_num: 2 },
  { name: 'Felix Goranson',      division: 'Majors A', batting_avg: null,  plate_appearances: null, group_num: 2 },
  { name: 'Marcus Chiang',       division: 'Majors A', batting_avg: null,  plate_appearances: null, group_num: 2 },
  { name: 'Brady Schroeder',     division: 'Majors A', batting_avg: null,  plate_appearances: null, group_num: 3 },
  { name: 'Max Klassen',         division: 'Majors B', batting_avg: 0.667, plate_appearances: 28,  group_num: 3 },
  { name: 'Nathan Wee Pham',     division: 'Majors B', batting_avg: 0.409, plate_appearances: 29,  group_num: 3 },
  { name: 'Connor Hawkins',      division: 'Minors',   batting_avg: 0.667, plate_appearances: 10,  group_num: 3 },
  { name: 'Dylan Truong',        division: 'Minors',   batting_avg: 0.500, plate_appearances: 18,  group_num: 3 },
  { name: 'Isaac Shopsowitz',    division: 'Majors B', batting_avg: 0.438, plate_appearances: 23,  group_num: 3 },
  { name: 'Ore Ade-Malomo',      division: 'Minors',   batting_avg: 0.125, plate_appearances: 16,  group_num: 3 },
  { name: 'Mason Elliott',       division: 'Minors',   batting_avg: 0.875, plate_appearances: 16,  group_num: 3 },
  { name: 'Samuel Wong',         division: 'Minors',   batting_avg: 0.667, plate_appearances: 17,  group_num: 3 },
  { name: 'Simon Yong',          division: 'Majors A', batting_avg: null,  plate_appearances: null, group_num: 4 },
  { name: 'Shunto Kuo',          division: 'Majors B', batting_avg: 0.625, plate_appearances: 16,  group_num: 4 },
  { name: 'Nicolas Lamb',        division: 'Minors',   batting_avg: 0.636, plate_appearances: 12,  group_num: 4 },
  { name: 'Jude Murray (G4)',    division: 'Minors',   batting_avg: 0.700, plate_appearances: 11,  group_num: 4 },
  { name: 'Saajan Aadmi Sawa',   division: 'Majors B', batting_avg: 0.250, plate_appearances: 22,  group_num: 4 },
  { name: 'Noah Karan',          division: 'Minors',   batting_avg: 0.455, plate_appearances: 12,  group_num: 4 },
  { name: 'Nolan Richards',      division: 'Minors',   batting_avg: 0.500, plate_appearances: 15,  group_num: 4 },
  { name: 'Sayvin RaiMann',      division: 'Minors',   batting_avg: 0.667, plate_appearances: 9,   group_num: 4 },
  { name: 'Steve Le',            division: 'Majors B', batting_avg: 0.385, plate_appearances: 27,  group_num: 4 },
];

// ── JSON file store ───────────────────────────────────────────────────────────
let db = { players: [], nextId: 1 };

function loadDb() {
  if (fs.existsSync(DB_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      console.log(`✅ Loaded ${db.players.length} players from data.json`);
      return;
    } catch (e) {
      console.log('⚠️  Could not parse data.json, re-seeding.');
    }
  }
  // Seed fresh
  db.players = SEED_PLAYERS.map((p, i) => ({
    id: i + 1,
    name: p.name,
    division: p.division || '',
    batting_avg: p.batting_avg,
    plate_appearances: p.plate_appearances,
    group_num: p.group_num,
    checked_in: false,
    tryout_type: '',       // '' | 'allstars' | 'select9'
    wants_catcher: false,
    wants_pitcher: false,
    notes: [],
  }));
  db.nextId = db.players.length + 1;
  saveDb();
  console.log(`✅ Seeded ${db.players.length} players`);
}

let saveTimer = null;
function saveDb() {
  // Debounce writes — flush at most every 300ms
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }
    catch (e) { console.error('Save error:', e.message); }
  }, 300);
}

loadDb();

// ── Helpers ───────────────────────────────────────────────────────────────────
function findPlayer(id) {
  return db.players.find(p => p.id === parseInt(id));
}

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  });
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── REST API ──────────────────────────────────────────────────────────────────

// GET all players
app.get('/api/players', (req, res) => {
  res.json(db.players);
});

// GET export as CSV
app.get('/api/export.csv', (req, res) => {
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const headers = ['Name','Division','Group','Batting Avg','Plate Appearances','Checked In','Tryout Type','Pitcher','Catcher','Notes'];
  const rows = db.players.map(p => {
    const notesText = (p.notes || [])
      .map(n => `[${n.coach} ${new Date(n.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}] ${n.text}`)
      .join(' | ');
    return [
      escape(p.name),
      escape(p.division),
      escape(p.group_num || ''),
      escape(p.batting_avg != null ? p.batting_avg.toFixed(3) : ''),
      escape(p.plate_appearances),
      escape(p.checked_in ? 'Yes' : 'No'),
      escape(p.tryout_type === 'allstars' ? 'All Stars' : p.tryout_type === 'select9' ? 'Select 9 Only' : ''),
      escape(p.wants_pitcher ? 'Yes' : 'No'),
      escape(p.wants_catcher ? 'Yes' : 'No'),
      escape(notesText),
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const filename = `tryouts-${new Date().toISOString().slice(0,10)}.csv`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
});

// PATCH player (check_in, tryout_type, wants_catcher, wants_pitcher, name, division, group_num)
app.patch('/api/players/:id', (req, res) => {
  const p = findPlayer(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });

  const allowed = ['checked_in', 'tryout_type', 'wants_catcher', 'wants_pitcher', 'name', 'division', 'group_num'];
  for (const key of allowed) {
    if (key in req.body) p[key] = req.body[key];
  }
  saveDb();
  broadcast({ type: 'player_updated', player: p });
  res.json(p);
});

// POST new player
app.post('/api/players', (req, res) => {
  const { name, division, group_num } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });

  const player = {
    id: db.nextId++,
    name,
    division: division || '',
    batting_avg: null,
    plate_appearances: null,
    group_num: parseInt(group_num) || 0,
    checked_in: false,
    tryout_type: '',
    wants_catcher: false,
    wants_pitcher: false,
    notes: [],
    manually_added: true,
  };
  db.players.push(player);
  saveDb();
  broadcast({ type: 'player_added', player });
  res.json(player);
});

// DELETE manually added player
app.delete('/api/players/:id', (req, res) => {
  const idx = db.players.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  if (!db.players[idx].manually_added) return res.status(403).json({ error: 'Can only delete manually added players' });
  db.players.splice(idx, 1);
  saveDb();
  broadcast({ type: 'player_deleted', player_id: parseInt(req.params.id) });
  res.json({ ok: true });
});

// POST note for player
app.post('/api/players/:id/notes', (req, res) => {
  const p = findPlayer(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });

  const { coach, text } = req.body;
  if (!coach || !text) return res.status(400).json({ error: 'coach and text required' });

  const note = {
    id: Date.now(),
    coach,
    text,
    created_at: new Date().toISOString(),
  };
  if (!p.notes) p.notes = [];
  p.notes.push(note);
  saveDb();
  broadcast({ type: 'note_added', player_id: p.id, note });
  res.json(note);
});

// ── WebSocket ─────────────────────────────────────────────────────────────────
wss.on('connection', (ws) => {
  console.log(`Coach connected — ${wss.clients.size} online`);
  ws.send(JSON.stringify({ type: 'init', players: db.players, coaches: wss.clients.size }));
  broadcast({ type: 'coaches_online', count: wss.clients.size });

  ws.on('close', () => {
    broadcast({ type: 'coaches_online', count: wss.clients.size });
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`⚾  Tryout Manager → http://localhost:${PORT}`);
});
