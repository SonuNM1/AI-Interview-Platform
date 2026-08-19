import "dotenv/config";
import { io } from "socket.io-client";

const token = process.env.TEST_TOKEN;

const socket = io("http://localhost:5005", {
  auth: {
    token,
  },
});

socket.on("connect", () => {
  console.log("✅ Socket connected");

  socket.emit("join_conversation", "6a8555596a79e34abf601bb5");

  setTimeout(() => {
    socket.emit("send_message", {
      conversationId: "6a8555596a79e34abf601bb5",
      text: "Socket.IO security test",
      attachments: [],
    });
  }, 1000);

  socket.on("receive_message", (message) => {
  console.log("📩 Message received:", message);
});
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection failed:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 Disconnected:", reason);
});

socket.on("error", (error) => {
  console.error("❌ Socket error:", error);
});
