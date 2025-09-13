// src/models/userModel.js
// const { pool } = require("../db");
import { pool } from '../db.js';

async function createUser(email, passwordHash, displayName) {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, display_name)
     VALUES ($1,$2,$3)
     RETURNING id,email,display_name,last_seen`,
    [email, passwordHash, displayName]
  );
  return result.rows[0];
}

async function getUserByEmail(email) {
  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );
  return result.rows[0] || null;
}

async function getUserById(id) {
  const result = await pool.query(
    "SELECT id,email,display_name,last_seen FROM users WHERE id=$1",
    [id]
  );
  return result.rows[0] || null;
}

async function updateLastSeen(id) {
  await pool.query(
    "UPDATE users SET last_seen=now() WHERE id=$1",
    [id]
  );
}

export {
  createUser,
  getUserByEmail,
  getUserById,
  updateLastSeen,
};
