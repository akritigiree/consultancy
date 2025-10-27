// server_min.js (diagnostic)
const express = require('express');
const app = express();

app.get('/', (_req, res) => res.send('hello from min server'));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(5050, () => console.log('min server on http://localhost:5050'));
