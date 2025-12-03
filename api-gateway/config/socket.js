import axios from 'axios';

export default async function registerServer(io) {
	const users = new Map();
	let messages = [];
	let notifications = [];

	async function reloadEverything () {
                try {
                        const responseMessages = await axios.get("http://chat-service:3005/getAllMessages");
			let tmp = responseMessages?.data ?? [];
			let input;
			messages.length = 0; // erase the list
			tmp.forEach(msg => {
				if (!msg.isSystem)
					input = `${msg.username}: ${msg.content}`;
				else
					input = `${msg.content}`;

				messages.push(input);
			});
                        console.log("got all messages");
                } catch (err) {
                        console.error(err);
                }
        };

	// connection and disconnection are the pattern, do not change the names!!!

	io.on("connection", (socket) => {
		socket.currentChannel = null; // the first channel is not a channel :D
		// connection
		socket.on("join", async ({ username, public_id }) => {
			let name = username?.trim() || "Anonymous";
			socket.name = name; // use the socket.name name
			const exist = Array.from(users.values()).some(u => u.name === name);
			if (exist) return ;
			users.set(socket.id, { name, public_id });
			try {
				await axios.post("http://chat-service:3005/storeMessage", { name: `${name}`, isSystem: true, msg: `system: ${name} joined to the chat` } );
				await reloadEverything();
			} catch (err) { 
				console.error(`Error updating status of the user ${name}`);
			}
			io.emit("updateUsers", Array.from(users.values()));
			io.emit("updateMessages", messages); // send the current messages to the user 
		});

		//disconnection
		socket.on("disconnect", async () => {
			let data = users.get(socket.id);
			if (!data)
				data = { name: "Anonymous" };
			users.delete(socket.id);
			try {
				await axios.post("http://chat-service:3005/storeMessage", { name: `${data.name}`, isSystem: false, msg: `system: ${data.name} left the chat` } );
				await reloadEverything;
			} catch (err) {
				console.error(`Error updating status of the user ${data.name}`);
			}
			io.emit("updateUsers", Array.from(users.values()));
			io.emit("updateMessages", messages); // send the current messages to the user 
		});
		
		// Specif events only happens on socket
		socket.on("sendMessage", async (msg) => {
			let input = msg?.trim();
			if (!input || input.length > 200) {
				console.error("Invalid input or message above to the allowed length");
				return ;
			}
			try {
				await axios.post("http://chat-service:3005/storeMessage", { name: `${socket.name}`, isSystem: false, msg: input } );
				await reloadEverything(); // reload everything using the database
			} catch (err) {
				console.error(`Error trying to send the message of user ${socket.name}`);
			}
			io.emit("updateMessages", messages);
			io.emit("updateUsers", Array.from(users.values()));
		});
});
}
