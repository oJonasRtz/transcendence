export function chat() {

const SOCKET_URL = "http://localhost:3000";

const socket = io(SOCKET_URL, {
    transports: ["websocket"], 
    withCredentials: true
});

// Capture the form and also the input

const username = document.body.dataset.username;
const public_id = document.body.dataset.public_id;

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

console.log("Username:", username);
console.log("Public_id:", public_id);
//console.log("Avatar:", avatar);


socket.on("connect", () => {
    console.log("Connected:", socket.id, "as", username);
    socket.emit("join", { username, public_id });
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
		const a = document.createElement("a");
		a.textContent = `${user.name}`;
		a.href = `/seeProfile?user=${user.public_id}`;
		a.style.fontWeight = "bold";
		a.style.padding = "4px 0";
		usersDiv.appendChild(a);
		usersDiv.appendChild(document.createElement("br"));
		usersDiv.scrollTop = usersDiv.scrollHeight;
	})
	
    console.log("USERS:", users);
});

socket.on("updateMessages", (msgs: any[]) => {

	const messagesDiv = document.getElementById("messages");

	messagesDiv.innerHTML = ""; // extremely IMPORTANT!!! You need to clean everything before to add more

	msgs.forEach(msg => {
		const p = document.createElement("p");
		p.textContent = msg;
		p.style.fontWeight = "bold";
		p.style.padding = "4px 0";
		messagesDiv.appendChild(p);
	});

	console.log("MESSAGES:", msgs);
});

socket.on("updateChannels", (channels: any[]) => {
    console.log("CHANNELS:", channels);
});

socket.on("disconnect", () => {
    console.log("Disconnected.");
});

}

