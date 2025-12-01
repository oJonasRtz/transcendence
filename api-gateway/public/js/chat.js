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
        const messagesDiv = document.getElementById("messages");
        if (!messagesDiv)
            return;
        const p = document.createElement("p");
        p.style.fontWeight = "bold";
        p.style.padding = "4px 0";
        p.textContent = msg;
        messagesDiv.appendChild(p);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        console.log("SERVER MESSAGE:", msg);
    });
    socket.on("updateUsers", (users) => {
        const usersDiv = document.getElementById("users");
        if (!usersDiv)
            return;
        usersDiv.innerHTML = "";
        users.forEach(user => {
            const p = document.createElement("p");
            p.style.fontWeight = "bold";
            p.style.padding = "4px 0";
            p.textContent = user;
            usersDiv.appendChild(p);
            usersDiv.scrollTop = usersDiv.scrollHeight;
        });
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
