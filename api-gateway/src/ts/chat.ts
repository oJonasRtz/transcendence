import { io } from "socket.io-client";

export function chat() {

const SOCKET_URL = "http://localhost:3000";

const username = document.body.dataset.username;
console.log("O username:", username);

const socket = io(SOCKET_URL, {
    transports: ["websocket"], 
});

socket.on("connect", () => {
    console.log("Connected:", socket.id, "as", username);
    socket.emit("join", username);
});

socket.on("serverMessage", (msg: string) => {
    console.log("SERVER MESSAGE:", msg);
});

socket.on("updateUsers", (users: string[]) => {
    console.log("USERS:", users);
});

socket.on("sendMessage", (messages: any[]) => {
    console.log("MESSAGES:", messages);
});

socket.on("updateChannels", (channels: any[]) => {
    console.log("CHANNELS:", channels);
});

socket.on("disconnect", () => {
    console.log("Disconnected.");
});

}

