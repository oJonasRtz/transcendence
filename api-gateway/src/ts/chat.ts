export function chat() {

const SOCKET_URL = window.location.origin;

const socket = io(SOCKET_URL, {
    transports: ["websocket"], 
    withCredentials: true
});

// Capture the form and also the input

const form = document.getElementById("sendForm") as HTMLFormElement;
const input = document.getElementById("message") as HTMLInputElement;
const invite = document.getElementById("sendInvite") as HTMLFormElement;

// e === event

if (invite instanceof HTMLFormElement) {
	invite.addEventListener("submit", (e) => {
		e.preventDefault();

		socket.emit("sendInvite");
	});
}

if (form instanceof HTMLFormElement && input instanceof HTMLInputElement) {
	form.addEventListener("submit", (e) => {
		e.preventDefault(); // Avoid to load again the webpage and make the HTTP request
	
		const msg = input.value.trim();
		if (!msg) return ;

		socket.emit("sendMessage", msg);
		input.value = ""; // erase the value
	});
}

//const avatar = document.body.dataset.avatar;

//console.log("Avatar:", avatar);

socket.on("connect", () => {
    socket.emit("join");
});

/*socket.on("serverMessage", (msg: string) => {
	const messagesDiv = document.getElementById("messages");
	
	if (!messagesDiv) return ;

	const p = document.createElement("p");
	p.style.fontWeight = "bold";
	p.style.padding = "4px 0";
	p.textContent = msg;

	messagesDiv.appendChild(p);
	messagesDiv.scrollTop = messagesDiv.scrollHeight;

	console.log("SERVER MESSAGE:", msg);
});*/

socket.on("updateUsers", (users: chatUser[]) => {
	const usersDiv = document.getElementById("users");

	if (!usersDiv) return ;

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
	})
	
    console.log("USERS:", users);
});

socket.on("updateMessages", (msgs: any[]) => {

	const messagesDiv = document.getElementById("messages");

	if (!messagesDiv) return ;

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
			username.textContent = "SYSTEM"
		else
			username.textContent = msg.username || "Anonymous";
		username.style.display = "block";

		let contentEl: HTMLElement;

		if (msg.isLink) {
			const a = document.createElement("a");
			a.href = msg.content;
			a.textContent = "Pong Invitation";
			a.target = "_blank"; // Open the link in another page
			a.rel = "noopener noreferrer"; // protection to use _blank to avoid the page opened obtain access to our website and avoid the another page to know where the user come from
			a.style.color = "#4da3ff"; // vibrant blue
			contentEl = a;
		} else {
			const span = document.createElement("span");
			if (msg.isSystem && !msg.content && msg.isLimit !== true)
				span.textContent = `system: wait to send another invitation`;
			else if (msg.isSystem && !msg.content && msg.isLimit === true)
				span.textContent = `system: You cannot send a message above 200 characters`;
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

	console.log("MESSAGES:", msgs);
});

socket.on("updateNotifications", (notes: any[]) => {
	const notificationsDiv = document.getElementById("notifications");

        if (!notificationsDiv) return ;

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
                username.textContent = "SYSTEM"
                username.style.display = "block";

                let contentEl: HTMLElement;

                if (note.isLink) {
                        const a = document.createElement("a");
                        a.href = note.content;
                        a.textContent = "Pong Invitation";
                        a.target = "_blank"; // Open the link in another page
                        a.rel = "noopener noreferrer"; // protection to use _blank to avoid the page opened obtain access to our website and avoid the another page to know where the user come from
                        a.style.color = "#4da3ff"; // vibrant blue
                        contentEl = a;
                } else {
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

socket.on("updateChannels", (channels: any[]) => {
    console.log("CHANNELS:", channels);
});

socket.on("disconnect", () => {
    console.log("Disconnected.");
});

}

