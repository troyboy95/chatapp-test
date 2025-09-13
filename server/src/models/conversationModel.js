// src/models/conversationModel.js
import { pool } from '../db.js';

async function createConversation(type, participants) {
  const convRes = await pool.query(
    "INSERT INTO conversations (type) VALUES ($1) RETURNING *",
    [type]
  );
  const conv = convRes.rows[0];

  // Add participants
  const values = participants
    .map((_, i) => `($1, $${i + 2})`)
    .join(", ");
  await pool.query(
    `INSERT INTO participants (conversation_id, user_id) VALUES ${values}`,
    [conv.id, ...participants]
  );

  return conv;
}

async function getConversationsForUser(userId) {
  const result = await pool.query(
    `SELECT c.*
     FROM conversations c
     JOIN participants p ON p.conversation_id=c.id
     WHERE p.user_id=$1
     ORDER BY c.created_at DESC
     LIMIT 100`,
    [userId]
  );
  return result.rows;
}

async function isParticipant(conversationId, userId) {
  const r = await pool.query(
    "SELECT 1 FROM participants WHERE conversation_id=$1 AND user_id=$2",
    [conversationId, userId]
  );
  return r.rowCount > 0;
}

async function getParticipants(conversationId) {
  const r = await pool.query(
    "SELECT user_id FROM participants WHERE conversation_id=$1",
    [conversationId]
  );
  return r.rows.map(row => row.user_id);
}

export {
  createConversation,
  getConversationsForUser,
  isParticipant,
  getParticipants,
};
