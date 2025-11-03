// index.js
import "dotenv/config";
import { connectDB } from "./config/db.js";
import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Chat from "./models/Chat.js";
import { notifyChatMessage } from "./utils/notification.js"; // { changed code }

const PORT = process.env.PORT || 5000;

// Connect DB
await connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Join a chat room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(socket.id, "joined room", roomId);
  });

  // Leave a room
  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    console.log(socket.id, "left room", roomId);
  });

  // Send message
  socket.on("sendMessage", async (msgData) => {
    try {
      const { posterId, acceptedUserId, jobId, senderId, text } = msgData;

      const posterObjId = new mongoose.Types.ObjectId(posterId);
      const acceptedObjId = new mongoose.Types.ObjectId(acceptedUserId);
      const senderObjId = new mongoose.Types.ObjectId(senderId);
      const jobObjId = new mongoose.Types.ObjectId(jobId);

      let chat = await Chat.findOne({
        $or: [
          { posterId: posterObjId, acceptedUserId: acceptedObjId },
          { posterId: acceptedObjId, acceptedUserId: posterObjId },
        ],
      });

      if (!chat) {
        chat = new Chat({
          posterId: posterObjId,
          acceptedUserId: acceptedObjId,
          messages: [],
        });
      }

      chat.messages.push({ senderId: senderObjId, text, jobId: jobObjId });
      await chat.save();

      const roomId = [posterId, acceptedUserId, jobId].sort().join("-");
      const newMsg = chat.messages[chat.messages.length - 1];

      io.to(roomId).emit("newMessage", newMsg);
      // Notify all other participants by email (non-blocking)
      try {
        const participantIds = [posterId, acceptedUserId].filter(Boolean).map(String);
        const recipients = participantIds.filter(id => id !== String(senderId));
        // fire notifications concurrently
        for (const rid of recipients) {
          notifyChatMessage({ senderId, recipientId: rid, jobId, text }).catch(console.error);
        }
      } catch (notifyErr) {
        console.error("Email notifyChatMessage failed:", notifyErr);
      }
    } catch (err) {
      console.error("Socket sendMessage error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
