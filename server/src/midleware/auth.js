import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// HTTP middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "no token" });

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ error: "invalid token" });
    req.user = payload; // { id, email }
    next();
  });
}

// Socket.io middleware
function authenticateSocket(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Unauthorized"));

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      console.log("Socket auth failed:", err.message);
      return next(new Error("Token expired or invalid")); 
    }
    socket.user = payload; // attach { id, email } to socket
    next();
  });
}

export { authenticateToken, authenticateSocket };
