import { io } from "socket.io-client";
export function helloWorld() {
    document.getElementById("msg").innerText = "Hello, World";
}
export function chat() {
    const SOCKET_URL = "https://localhost";
    const socket = io(SOCKET_URL, {
        transports: ["websocket"],
    });
    socket.on("connect", () => {
        console.log("Connected with id:", socket.id);
        socket.emit("join");
    });
    socket.on("serverMessage", (msg) => {
        console.log("SERVER MESSAGE:", msg);
    });
    socket.on("updateUsers", (users) => {
        console.log("USERS:", users);
    });
    socket.on("sendMessage", (messages) => {
        console.log("MESSAGES:", messages);
    });
    socket.on("updateChannels", (channels) => {
        console.log("CHANNELS:", channels);
    });
    socket.on("disconnect", () => {
        console.log("Disconnected.");
    });
}
