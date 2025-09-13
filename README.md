# ChatApp

ChatApp is a real-time messaging application built with React, Zustand, Tailwind, and shadcn/ui on the frontend, and Node.js, Express, PostgreSQL, and Socket.IO on the backend.  
It is designed to feel similar to WhatsApp, with features like live messaging, presence updates, typing indicators, and message statuses (sent, delivered, read).

Only basic chatting features are present. Uses auto-refershing accessToken for security. 
---

## Features

- Real-time messaging with Socket.IO  
- Online/offline user presence tracking  
- Typing indicators  
- Message statuses (sent, delivered, read)  
- One-to-one conversations (DMs)  
- Modern UI with TailwindCSS and shadcn/ui  
- State management with Zustand  
- PostgreSQL for persistence  

---

## Tech Stack

**Frontend**
- React  
- Zustand (state management)  
- TailwindCSS  
- shadcn/ui  
- Socket.IO client  

**Backend**
- Node.js + Express  
- PostgreSQL (using `pg`)  
- Socket.IO  
- JWT authentication (if enabled)  

---

## Getting Started

### Clone the repository
```bash 
cd client
npm install
cd server
npm install
```
git clone https://github.com/troyboy95/chatapp-test.git
cd chatapp-test

### Create an env in the server to replace these
```bash
PORT=4000
DATABASE_URL=postgres://{username}:{password}@localhost:5432/{DB_Name}
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
```
