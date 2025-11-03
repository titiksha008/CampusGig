// index.js
import "dotenv/config";
import { connectDB } from "./config/db.js";
import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Chat from "./models/Chat.js";
import { notifyChatMessage } from "./utils/notification.js";

const PORT = process.env.PORT || 5000;

// ✅ Connect DB
await connectDB();

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Initialize Socket.IO
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});

const users = {}; // store userId -> socket.id mapping

io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);
  socket.emit("me", socket.id);

  // ---------------- CHAT EVENTS ----------------
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);
  });

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    console.log(`${socket.id} left room ${roomId}`);
  });

  // ✅ Single clean sendMessage handler
  socket.on("sendMessage", async (msgData) => {
    try {
      const { posterId, acceptedUserId, jobId, senderId, text, file, fileType } = msgData;

      const posterObjId = new mongoose.Types.ObjectId(posterId);
      const acceptedObjId = new mongoose.Types.ObjectId(acceptedUserId);
      const senderObjId = new mongoose.Types.ObjectId(senderId);
      const jobObjId = new mongoose.Types.ObjectId(jobId);

      // Find or create chat between these two participants
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

      // Push message (with file support)
      chat.messages.push({
        senderId: senderObjId,
        text: text || "",
        file: file || "",
        fileType: fileType || "",
        jobId: jobObjId,
      });

      await chat.save();

      const roomId = [posterId, acceptedUserId, jobId].sort().join("-");
      const newMsg = chat.messages[chat.messages.length - 1];

      // Emit to both participants
      io.to(roomId).emit("newMessage", newMsg);

      // ✅ Send email notification to other participant(s)
      try {
        const participantIds = [posterId, acceptedUserId]
          .filter(Boolean)
          .map(String);
        const recipients = participantIds.filter((id) => id !== String(senderId));

        for (const rid of recipients) {
          notifyChatMessage({ senderId, recipientId: rid, jobId, text }).catch(console.error);
        }
      } catch (notifyErr) {
        console.error("❌ Email notifyChatMessage failed:", notifyErr);
      }
    } catch (err) {
      console.error("❌ Socket sendMessage error:", err);
    }
  });

  // ✅ Message seen handler
  socket.on("messageSeen", async ({ posterId, acceptedUserId, jobId, viewerId }) => {
    try {
      const posterObjId = new mongoose.Types.ObjectId(posterId);
      const acceptedObjId = new mongoose.Types.ObjectId(acceptedUserId);

      const chat = await Chat.findOne({
        $or: [
          { posterId: posterObjId, acceptedUserId: acceptedObjId },
          { posterId: acceptedObjId, acceptedUserId: posterObjId },
        ],
      });

      if (!chat) return;

      chat.messages.forEach((msg) => {
        if (msg.senderId.toString() !== viewerId) {
          msg.seen = true;
        }
      });

      await chat.save();

      const roomId = [posterId, acceptedUserId, jobId].sort().join("-");
      io.to(roomId).emit("messageSeenUpdate", chat.messages);
    } catch (err) {
      console.error("❌ Socket messageSeen error:", err);
    }
  });

  // ---------------- VIDEO CALL EVENTS ----------------
  socket.on("registerUser", (userId) => {
    users[userId] = socket.id;
    console.log(`🟢 Registered user ${userId} with socket ${socket.id}`);
    io.emit("onlineUsers", Object.keys(users));
  });

  socket.on("callUser", (data) => {
    const targetSocket = users[data.userToCall];
    if (targetSocket) {
      console.log(`📞 Call initiated from ${data.from} to ${data.userToCall}`);
      io.to(targetSocket).emit("callIncoming", {
        signal: data.signal,
        from: data.from,
        name: data.name,
      });
    } else {
      console.log(`⚠️ User ${data.userToCall} not online`);
    }
  });

  socket.on("answerCall", (data) => {
    console.log(`✅ Call accepted by ${data.to}`);
    io.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("rejectCall", (data) => {
    console.log(`❌ Call rejected by ${data.to}`);
    io.to(data.to).emit("callRejected");
  });

  // ✅ End call for both sides
  socket.on("endCall", ({ from, to }) => {
    console.log(`📴 Call ended by ${from}`);

    const callerSocket = users[from];
    const receiverSocket = users[to];

    if (receiverSocket) {
      io.to(receiverSocket).emit("callEnded");
      console.log(`📤 Sent callEnded to receiver ${to}`);
    }

    if (callerSocket) {
      io.to(callerSocket).emit("callEnded");
      console.log(`📤 Sent callEnded to caller ${from}`);
    }

    console.log(`✅ Call fully ended between ${from} and ${to}`);
  });

  // ✅ Handle disconnection
  socket.on("disconnect", () => {
    for (const id in users) {
      if (users[id] === socket.id) {
        delete users[id];
        break;
      }
    }
    io.emit("onlineUsers", Object.keys(users));
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ✅ Start server
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
