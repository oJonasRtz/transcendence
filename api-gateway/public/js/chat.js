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
