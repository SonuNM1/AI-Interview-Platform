import { io } from "socket.io-client";
import readline from "node:readline";

const socket = io("http://localhost:5005");

const conversationId = "6a6c760eef70db28b1cdf7da";
const userId = "Sonu NM";

socket.on("connect", () => {

    console.log("================================");
    console.log(`✅ Connected as ${userId}`);
    console.log(`Socket ID : ${socket.id}`);
    console.log("================================");

    // Mark user online
    socket.emit("user_connected", {
        userId,
    });

    // Join chat room
    socket.emit(
        "join_conversation",
        conversationId
    );

    console.log("Joined Conversation:", conversationId);
    console.log("Commands:");
    console.log("/presence");
    console.log("Type any message and press Enter.\n");

    rl.prompt();

});

// New message
socket.on("receive_message", (message) => {

    console.log("\n📩 New Message");
    console.log(message);

    rl.prompt();

});

// Typing
socket.on("typing", ({ userId }) => {

    console.log(`\n⌨️ ${userId} is typing...`);

    rl.prompt();

});

// Stop typing
socket.on("stop_typing", ({ userId }) => {

    console.log(`\n✋ ${userId} stopped typing`);

    rl.prompt();

});

// Message edited
socket.on("message_edited", (message) => {

    console.log("\n✏️ Message Edited");

    console.log(message);

    rl.prompt();

});

// Message deleted
socket.on("message_deleted", (message) => {

    console.log("\n🗑️ Message Deleted");

    console.log(message);

    rl.prompt();

});

// User came online
socket.on("user_connected", ({ userId }) => {

    console.log(`\n🟢 ${userId} came online`);

    rl.prompt();

});

// User disconnected
socket.on("user_disconnected", ({ userId }) => {

    console.log(`\n⚫ ${userId} went offline`);

    rl.prompt();

});

// Presence response

socket.on("presence", (data) => {

    console.log("\n👀 Presence");

    console.log(data);

    rl.prompt();
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> "
});

rl.on("line", (text) => {

    text = text.trim();

    if (!text) {
        rl.prompt();
        return;
    }

    // Check presence

    if (text === "/presence") {

        socket.emit("get_presence", {
            userId: "Garima"
        });

        rl.prompt();
        return;
    }

    // Typing

    socket.emit("typing", {
        conversationId,
        userId
    });

    // Send message

    socket.emit("send_message", {
        conversationId,
        senderId: userId,
        text,
        attachments: []
    });

    // Stop typing

    socket.emit("stop_typing", {
        conversationId,
        userId
    });

    rl.prompt();
});