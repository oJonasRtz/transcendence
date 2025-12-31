export function direct() {
    const SOCKET_URL = window.location.origin;
    const socket = io(SOCKET_URL, {
        transports: ["websocket"],
        withCredentials: true
    });
    // Capture the form and also the input
    const target_id = document.body.dataset.target_id;
    const form = document.getElementById("sendForm");
    const input = document.getElementById("message");
    const invite = document.getElementById("sendInvite");
    // e === event
    if (invite instanceof HTMLFormElement) {
        invite.addEventListener("submit", (e) => {
            e.preventDefault();
            socket.emit("sendPrivateInvite", target_id);
        });
    }
    if (form instanceof HTMLFormElement && input instanceof HTMLInputElement) {
        form.addEventListener("submit", (e) => {
            e.preventDefault(); // Avoid to load again the webpage and make the HTTP request
            const msg = input.value.trim();
            if (!msg)
                return;
            socket.emit("sendPrivateMessage", msg, target_id);
            input.value = ""; // erase the value
        });
    }
    //const avatar = document.body.dataset.avatar;
    socket.on("connect", () => {
        socket.emit("joinPrivate", { target_id });
    });
    socket.on("updatePrivateUsers", (users) => {
        const usersDiv = document.getElementById("users");
        if (!usersDiv)
            return;
        usersDiv.innerHTML = "";
        users.forEach(user => {
            const img = document.createElement("img");
            const a = document.createElement("a");
            img.src = `/public/uploads/${user.avatar}.png`;
            img.style.width = "60px";
            img.style.height = "60px";
            a.textContent = `${user.name}`;
            a.href = `/seeProfile?user=${user.public_id}`;
            a.style.fontWeight = "bold";
            a.style.padding = "4px 0";
            usersDiv.style.display = "flex";
            usersDiv.appendChild(img);
            usersDiv.appendChild(a);
            usersDiv.appendChild(document.createElement("br"));
            usersDiv.scrollTop = usersDiv.scrollHeight;
        });
        console.log("USERS:", users);
    });
    socket.on("updateDirectMessages", (msgs) => {
        const messagesDiv = document.getElementById("messages");
        if (!messagesDiv)
            return;
        messagesDiv.innerHTML = ""; // extremely IMPORTANT!!! You need to clean everything before to add more
        msgs.forEach(msg => {
            const div = document.createElement("div");
            div.style.display = "flex";
            div.style.alignItems = "flex-start";
            div.style.gap = "12px";
            div.style.padding = "8px 4px";
            const img = document.createElement("img");
            if (msg.isSystem)
                img.src = "/public/images/system.png";
            else
                img.src = msg.avatar || "/public/images/default_avatar.png";
            img.width = 60;
            img.height = 60;
            img.style.borderRadius = "50%";
            img.style.objectFit = "cover";
            const textBox = document.createElement("div");
            const username = document.createElement("strong");
            if (msg.isSystem)
                username.textContent = "SYSTEM";
            else
                username.textContent = msg.sender_username || "Anonymous";
            username.style.display = "block";
            let contentEl;
            if (msg.isLink) {
                const a = document.createElement("a");
                a.href = msg.content;
                a.textContent = "Pong Invitation";
                a.target = "_blank"; // Open the link in another page
                a.rel = "noopener noreferrer"; // protection to use _blank to avoid the page opened obtain access to our website and avoid the another page to know where the user come from
                a.style.color = "#4da3ff"; // vibrant blue
                contentEl = a;
            }
            else {
                const span = document.createElement("span");
                if (msg.isSystem && !msg.content && msg.isLimit !== true)
                    span.textContent = "You must need to wait to send another invitation";
                else if (msg.isSystem && !msg.content && msg.isLimit === true)
                    span.textContent = "You must input until 200 characters";
                else
                    span.textContent = msg.content;
                contentEl = span;
            }
            textBox.appendChild(username);
            textBox.appendChild(contentEl);
            div.appendChild(img);
            div.appendChild(textBox);
            messagesDiv.appendChild(div);
        });
    });
    socket.on("updateNotifications", (notes) => {
        const notificationsDiv = document.getElementById("notifications");
        if (!notificationsDiv)
            return;
        notificationsDiv.innerHTML = ""; // extremely IMPORTANT!!! You need to clean everything before to add more
        notes.forEach(note => {
            const div = document.createElement("div");
            div.style.display = "flex";
            div.style.alignItems = "flex-start";
            div.style.gap = "12px";
            div.style.padding = "8px 4px";
            const img = document.createElement("img");
            img.src = "/public/images/system.png";
            img.width = 60;
            img.height = 60;
            img.style.borderRadius = "50%";
            img.style.objectFit = "cover";
            const textBox = document.createElement("div");
            const username = document.createElement("strong");
            username.textContent = "SYSTEM";
            username.style.display = "block";
            let contentEl;
            if (note.isLink) {
                const a = document.createElement("a");
                a.href = note.content;
                a.textContent = "Pong Invitation";
                a.target = "_blank"; // Open the link in another page
                a.rel = "noopener noreferrer"; // protection to use _blank to avoid the page opened obtain access to our website and avoid the another page to know where the user come from
                a.style.color = "#4da3ff"; // vibrant blue
                contentEl = a;
            }
            else {
                const span = document.createElement("span");
                if (note.isSystem && !note.content && note.isLimit !== true)
                    span.textContent = `system: wait to send another invitation`;
                else if (note.isSystem && !note.content && note.isLimit === true)
                    span.textContent = `system: You cannot send a message above 200 characters`;
                else
                    span.textContent = note.content;
                contentEl = span;
            }
            textBox.appendChild(username);
            textBox.appendChild(contentEl);
            div.appendChild(img);
            div.appendChild(textBox);
            notificationsDiv.appendChild(div);
        });
    });
    socket.on("updateChannels", (channels) => {
        console.log("CHANNELS:", channels);
    });
    socket.on("disconnect", () => {
        console.log("Disconnecting...");
    });
}
