// src/models/contactModel.js
import { pool } from '../db.js';

async function addContact(ownerId, contactId, savedName) {
  const result = await pool.query(
    `INSERT INTO contacts (owner_id, contact_id, saved_name)
     VALUES ($1,$2,$3)
     ON CONFLICT (owner_id, contact_id)
     DO UPDATE SET saved_name=EXCLUDED.saved_name
     RETURNING *`,
    [ownerId, contactId, savedName]
  );
  return result.rows[0];
}

async function getContacts(ownerId) {
  const result = await pool.query(
    `SELECT u.id, u.email, u.display_name, c.saved_name, u.last_seen, c.contact_id
     FROM contacts c
     JOIN users u ON u.id = c.contact_id
     WHERE c.owner_id=$1`,
    [ownerId]
  );
  return result.rows;
}



export { addContact, getContacts };
