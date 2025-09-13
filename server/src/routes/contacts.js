import express from 'express';
import {authenticateToken} from '../midleware/auth.js'
import { addContact, getContacts } from '../models/contactModel.js';
import { getUserByEmail } from '../models/userModel.js';
const router = express.Router();

// Add or update contact
router.post("/", authenticateToken, async (req, res) => {
  const { contact_id, saved_name } = req.body;
  if (!contact_id) return res.status(400).json({ error: "contact_id required" });

  try {
    const contact = await addContact(req.user.id, contact_id, saved_name || null);
    res.json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to add contact" });
  }
});

// Get contact list
router.get("/", authenticateToken, async (req, res) => {
  try {
    const contacts = await getContacts(req.user.id);
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch contacts" });
  }
});

router.post("/check", authenticateToken, async (req, res) => {
  const {email} = req.body;
  try {
    const contacts = await getUserByEmail(email);
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch contacts" });
  }
});


export default router;
