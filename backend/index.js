// index.js
// -----------------------------
// Core imports & env setup
// -----------------------------
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config(); // Load .env at the very top
console.log('Booting backend from:', __filename);

// -----------------------------
// App init & middleware
// -----------------------------
const app = express();
app.use(cors());
app.use(express.json());
app.use((req, _res, next) => {
  console.log('➡️  ', req.method, req.url);
  next();
});


// -----------------------------
// Minimal landing page (inline HTML)
// -----------------------------
const landingHTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Consultancy Backend</title>
<style>
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'; margin:0; padding:2rem; background:#0b1220; color:#e6f0ff; }
  .card { max-width:720px; margin:auto; padding:2rem; border-radius:16px; background:#111a2b; box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
  h1 { margin:0 0 0.5rem 0; font-size:1.75rem; }
  p { margin:0.25rem 0 1rem 0; color:#c7d7ff; }
  code, .tag { background:#0b1220; padding:0.15rem 0.4rem; border-radius:6px; }
  .row { margin-top:1rem; display:flex; gap:0.75rem; flex-wrap:wrap; }
  .pill { background:#1b2a44; color:#cfe0ff; padding:0.5rem 0.75rem; border-radius:999px; font-size:0.9rem; }
  a { color:#9bd1ff; text-decoration: none; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>
  <div class="card">
    <h1>✅ Consultancy backend is running</h1>
    <p>Welcome! Your Express server is live and connected to MongoDB.</p>
    <div class="row">
      <span class="pill">Health: <a href="/api/health"><code>/api/health</code></a></span>
      <span class="pill">Auth: <code>/api/auth</code></span>
      <span class="pill">Clients: <code>/api/clients</code></span>
      <span class="pill">Consultants: <code>/api/consultants</code></span>
      <span class="pill">Projects: <code>/api/projects</code></span>
      <span class="pill">Tasks: <code>/api/tasks</code></span>
      <span class="pill">Ratings: <code>/api/ratings</code></span>
      <span class="pill">Messages: <code>/api/messages</code></span>
      <span class="pill">Appointments: <code>/api/appointments</code></span>
      <span class="pill">Payments: <code>/api/payments</code></span>
      <span class="pill">Notifications: <code>/api/notifications</code></span>
    </div>
    <p style="margin-top:1rem;opacity:.8">This page is served by <code>index.js</code> to avoid the “Cannot GET /” message.</p>
  </div>
</body>
</html>`;

// -----------------------------
// Health endpoints (guaranteed)
// -----------------------------
app.get('/', (_req, res) => {
  console.log('GET / hit');
  res.status(200).send(landingHTML);
});

app.get('/api/health', (_req, res) => {
  console.log('GET /api/health hit');
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

// -----------------------------
// Routes (require once, then mount)
// -----------------------------
const authRoutes = require('./routes/auth.js');
const clientRoutes = require('./routes/clients.js');            // clients.js
const consultantRoutes = require('./routes/consultants.js');    // consultants.js
const projectRoutes = require('./routes/projects.js');          // projects.js
const taskRoutes = require('./routes/task.js');                 // task.js
const paymentRoutes = require('./routes/payment.js');           // payment.js
const ratingRoutes = require('./routes/ratings.js');            // ratings.js
const notificationRoutes = require('./routes/Notification.js'); // case-sensitive
const messageRoutes = require('./routes/message.js');           // message.js
const appointmentRoutes = require('./routes/appointment.js');   // appointment.js

// Mount API route modules
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/consultants', consultantRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// -----------------------------
// Catch-all routing behavior
// -----------------------------
// 1) For ANY non-API path, serve the landing page (prevents "Cannot GET /something")
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.status(200).send(landingHTML);
});

// 2) For unknown API routes, return JSON 404
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('💥 Global error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// -----------------------------
// DB connect & server start
// -----------------------------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ Missing MONGO_URI (or MONGODB_URI) in .env');
  process.exit(1);
}

let server;

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected');

    server = app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
})();

// -----------------------------
// Graceful shutdown
// -----------------------------
const shutdown = async (signal) => {
  try {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
    console.log('👋 Closed HTTP server and MongoDB connection. Bye!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  shutdown('uncaughtException');
});
