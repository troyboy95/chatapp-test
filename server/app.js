import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import { pool, runMigrations } from './src/db.js'
import authRoutes from '../server/src/routes/auth.js';
import contactsRoutes from './src/routes/contacts.js';
import convRoutes from './src/routes/conversations.js';
import { authenticateSocket } from './src/midleware/auth.js';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/contacts", contactsRoutes);
app.use("/conversations", convRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const online = new Map();

io.use(authenticateSocket);

io.on("connection", (socket) => {
  const user = socket.user; // {id, email}
  const uid = user.id;
  // add socket to online map
  if (!online.has(uid)) online.set(uid, new Set());
  online.get(uid).add(socket.id);

  // broadcast online event for first connection
  if (online.get(uid).size === 1) {
    io.emit("user:online", { userId: uid });
  }

  // helper: join rooms for conversations the user is participant of
  (async () => {
    const r = await pool.query("SELECT conversation_id FROM participants WHERE user_id=$1", [uid]);
    for (const row of r.rows) socket.join(row.conversation_id);
  })();

  // update last_seen as now (online)
  (async () => {
    await pool.query("UPDATE users SET last_seen = now() WHERE id=$1", [uid]);
  })();

  // message send flow: saves message + create per-user statuses + emit
  socket.on("message:send", async ({ conversationId, content }) => {
    try {
      // verify membership (quick check)
      const mem = await pool.query(
        "SELECT user_id FROM participants WHERE conversation_id=$1",
        [conversationId]
      );
      const participants = mem.rows.map(r => r.user_id);
      if (!participants.includes(uid)) return socket.emit("error", { error: "not a participant" });

      // insert message
      const mRes = await pool.query(
        `INSERT INTO messages (conversation_id, sender_id, content)
         VALUES ($1, $2, $3) RETURNING *`,
        [conversationId, uid, content]
      );
      const message = mRes.rows[0];

      // for each participant, insert message_statuses
      // sender -> set 'read' (they wrote it), others -> 'sent'
      const statusInserts = [];
      const params = [];
      let idx = 1;
      for (const p of participants) {
        const st = (p === uid) ? "read" : "sent";
        params.push(`(${message.id}, $${idx++}, '${st}')`);
        statusInserts.push(p);
      }
      // bulk insert
      const insertValues = participants.map((p, i) => `(${message.id}, $${i + 1}, '${participants[i] === uid ? "read" : "sent"}')`).join(",");
      await pool.query(`INSERT INTO message_statuses (message_id, user_id, status) VALUES ${insertValues}`, participants);

      // emit new message to conversation room (everyone connected)
      io.to(conversationId).emit("message:new", {
        ...message,
        statuses: participants.map(p => ({ user_id: p, status: p === uid ? "read" : "sent" }))
      });
    } catch (err) {
      console.error("message:send err", err);
      socket.emit("error", { error: "message_send_failed" });
    }
  });

  // client acknowledges status updates (delivered/read)
  socket.on("message:status", async ({ messageId, status }) => {
    if (!["delivered", "read"].includes(status)) return;
    try {
      await pool.query(
        `UPDATE message_statuses SET status=$1, updated_at=now()
         WHERE message_id=$2 AND user_id=$3`,
        [status, messageId, uid]
      );
      // fetch message to find conversation and emit to room
      const m = await pool.query("SELECT conversation_id FROM messages WHERE id=$1", [messageId]);
      if (m.rowCount === 0) return;
      const convId = m.rows[0].conversation_id;
      io.to(convId).emit("message:status", { messageId, userId: uid, status });
    } catch (err) {
      console.error("message:status err", err);
    }
  });

  socket.on("join:conversation", async ({ conversationId }) => {
    try {
      const mem = await pool.query(
        "SELECT 1 FROM participants WHERE conversation_id=$1 AND user_id=$2",
        [conversationId, uid]
      );
      if (mem.rowCount === 0) {
        return socket.emit("error", { error: "not a participant" });
      }

      socket.join(conversationId);

      const updated = await pool.query(
        `UPDATE message_statuses
       SET status='delivered', updated_at=now()
       WHERE user_id=$1 AND status='sent'
       AND message_id IN (
         SELECT id FROM messages WHERE conversation_id=$2
       )
       RETURNING message_id`,
        [uid, conversationId]
      );

      if (updated.rowCount > 0) {
        for (const row of updated.rows) {
          io.to(conversationId).emit("message:status", {
            messageId: row.message_id,
            userId: uid,
            status: "delivered",
          });
        }
      }
    } catch (err) {
      console.error("join:conversation err", err);
      socket.emit("error", { error: "join_failed" });
    }
  });

  socket.on("typing", ({ conversationId, isTyping }) => {
    socket.to(conversationId).emit("typing", { conversationId, userId: uid, isTyping });
  });

  socket.on("disconnect", async () => {
    // remove socket
    const set = online.get(uid);
    if (set) {
      set.delete(socket.id);
      if (set.size === 0) {
        online.delete(uid);
        // update last_seen to now in DB and announce offline
        await pool.query("UPDATE users SET last_seen = now() WHERE id=$1", [uid]);
        io.emit("user:offline", { userId: uid, lastSeen: new Date().toISOString() });
      }
    }
  });
});

const PORT = process.env.PORT || 4000;
app.get("/", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: Date.now() });
});
(async () => {
  await runMigrations();
  server.listen(PORT, () =>
    console.log(`Server running on PORT: ${PORT}`)
  );
})();
