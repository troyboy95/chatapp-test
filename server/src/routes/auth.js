import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = express.Router();

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

// --- Register ---
router.post("/register", async (req, res) => {
  const { email, password, display_name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email+password required" });

  const hash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO users (email,password_hash,display_name) 
       VALUES ($1,$2,$3) RETURNING id,email,display_name,last_seen`,
      [email, hash, display_name]
    );

    const user = result.rows[0];
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    await pool.query("UPDATE users SET refresh_token=$1 WHERE id=$2", [refreshToken, user.id]);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,        // set true in production with HTTPS
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) {
    return res.status(400).json({ error: "user exists or invalid" });
  }
});

// --- Login ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const r = await pool.query(
    "SELECT id,email,password_hash,display_name FROM users WHERE email=$1",
    [email]
  );
  if (r.rowCount === 0) return res.status(400).json({ error: "invalid credentials" });

  const user = r.rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(400).json({ error: "invalid credentials" });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await pool.query("UPDATE users SET refresh_token=$1 WHERE id=$2", [refreshToken, user.id]);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // true on production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({ user, accessToken, refreshToken });
});

// --- Refresh ---
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(401).json({ error: "missing refresh token" });

  const r = await pool.query("SELECT id, email, refresh_token FROM users WHERE refresh_token=$1", [refreshToken]);
  if (r.rowCount === 0) return res.status(403).json({ error: "invalid refresh token" });

  const user = r.rows[0];

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err) => {
    if (err) return res.status(403).json({ error: "invalid refresh token" });

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  });
});

// --- Logout ---
router.post("/logout", async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(400).json({ error: "token required" });

  await pool.query("UPDATE users SET refresh_token=NULL WHERE refresh_token=$1", [refreshToken]);
  res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict", secure: false });
  
  res.status(200).json({ success: true });
});


export default router;
