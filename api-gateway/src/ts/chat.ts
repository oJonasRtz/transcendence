import { io } from "socket.io-client";

export function chat() {

const SOCKET_URL = "https://localhost";

const socket = io(SOCKET_URL, {
    transports: ["websocket"], 
});

socket.on("connect", () => {
    console.log("Connected with id:", socket.id);

    socket.emit("join");
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

