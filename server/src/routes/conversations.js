// src/routes/conversations.js
// const express = require("express");
// const { pool } = require("../db");
// const { authenticateToken } = require("../middleware/auth");
import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from '../midleware/auth.js';
const router = express.Router();

// Create conversation (dm or group)
router.post("/", authenticateToken, async (req, res) => {
  const { type, participants } = req.body;
  if (!type || !participants || !Array.isArray(participants) || participants.length === 0) {
    return res.status(400).json({ error: "type and participants required" });
  }

  // create conv
  const convRes = await pool.query(
    "INSERT INTO conversations (type) VALUES ($1) RETURNING *",
    [type]
  );
  const conv = convRes.rows[0];

  // ensure current user is included
  const uniqueParticipants = Array.from(new Set([...participants, req.user.id]));

  const args = [];
  const values = [];
  uniqueParticipants.forEach((u, i) => {
    values.push(`($1, $${i + 2})`);
    args.push(u);
  });
  // Build parameterized insert
  const sql =
    `INSERT INTO participants (conversation_id, user_id) VALUES ` +
    uniqueParticipants.map((_, i) => `($1,$${i + 2})`).join(", ");

  await pool.query(sql, [conv.id, ...uniqueParticipants]);

  res.json(conv);
});

// Get conversations for current user
router.get("/", authenticateToken, async (req, res) => {
  const r = await pool.query(
    `SELECT c.id, c.type, c.created_at,
            json_agg(
              json_build_object(
                'id', u.id,
                'display_name', u.display_name,
                'email', u.email
              )
            ) FILTER (WHERE u.id <> $1) AS other_participants
     FROM conversations c
     JOIN participants p ON p.conversation_id = c.id
     JOIN users u ON u.id = p.user_id
     WHERE c.id IN (
       SELECT conversation_id FROM participants WHERE user_id = $1
     )
     GROUP BY c.id
     ORDER BY c.created_at DESC
     LIMIT 100`,
    [req.user.id]
  );

  res.json(r.rows);
});


// Get messages for conversation + per-user status
router.get("/:id/messages", authenticateToken, async (req, res) => {
  const convId = req.params.id;

  // verify membership
  const mem = await pool.query(
    "SELECT 1 FROM participants WHERE conversation_id=$1 AND user_id=$2",
    [convId, req.user.id]
  );
  if (mem.rowCount === 0) return res.status(403).json({ error: "not a participant" });

  const messages = await pool.query(
    `SELECT m.*, 
       jsonb_agg(jsonb_build_object('user_id', ms.user_id, 'status', ms.status, 'updated_at', ms.updated_at) ) FILTER (WHERE ms.user_id IS NOT NULL) AS statuses
     FROM messages m
     LEFT JOIN message_statuses ms ON ms.message_id = m.id
     WHERE m.conversation_id=$1
     GROUP BY m.id
     ORDER BY m.created_at ASC
     LIMIT 200`,
    [convId]
  );

  res.json(messages.rows);
});

router.post("/check", authenticateToken, async (req, res) => {
  const userId = req.user.id; // from JWT
  const { receiverId } = req.body;

  if (!receiverId) {
    return res.status(400).json({ error: "receiverId required" });
  }

  try {
    // 1. Check if conversation exists between userId & receiverId
    const existing = await pool.query(
      `
      SELECT c.id
      FROM conversations c
      JOIN participants p1 ON c.id = p1.conversation_id
      JOIN participants p2 ON c.id = p2.conversation_id
      WHERE p1.user_id = $1 AND p2.user_id = $2
      LIMIT 1
      `,
      [userId, receiverId]
    );

    if (existing.rows.length > 0) {
      return res.json({ conversationId: existing.rows[0].id });
    }

    res.json({ conversationId: null });
  } catch (err) {
    console.error("Error starting conversation:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// module.exports = router;
export default router;