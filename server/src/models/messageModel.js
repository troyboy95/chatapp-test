// src/models/messageModel.js
import { pool } from '../db.js';

async function createMessage(conversationId, senderId, content) {
  const result = await pool.query(
    `INSERT INTO messages (conversation_id, sender_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [conversationId, senderId, content]
  );
  return result.rows[0];
}

async function addMessageStatuses(messageId, participants, senderId) {
  const values = participants
    .map(
      (userId, i) =>
        `(${messageId}, $${i + 1}, '${userId === senderId ? "read" : "sent"}')`
    )
    .join(", ");
  await pool.query(
    `INSERT INTO message_statuses (message_id, user_id, status) VALUES ${values}`,
    participants
  );
}

async function updateMessageStatus(messageId, userId, status) {
  await pool.query(
    `UPDATE message_statuses
     SET status=$1, updated_at=now()
     WHERE message_id=$2 AND user_id=$3`,
    [status, messageId, userId]
  );
}

async function getMessages(conversationId, limit = 200) {
  const result = await pool.query(
    `SELECT m.*,
       jsonb_agg(
         jsonb_build_object(
           'user_id', ms.user_id,
           'status', ms.status,
           'updated_at', ms.updated_at
         )
       ) FILTER (WHERE ms.user_id IS NOT NULL) AS statuses
     FROM messages m
     LEFT JOIN message_statuses ms ON ms.message_id = m.id
     WHERE m.conversation_id=$1
     GROUP BY m.id
     ORDER BY m.created_at ASC
     LIMIT $2`,
    [conversationId, limit]
  );
  return result.rows;
}

export {
  createMessage,
  addMessageStatuses,
  updateMessageStatus,
  getMessages,
};
