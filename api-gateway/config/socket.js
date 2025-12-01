import axios from 'axios';

export default async function registerServer(io) {
	const users = new Map();
	let messages = [];
	let channels = [];

	async function reloadEverything () {
                try {
                        const responseMessages = await axios.get("http://chat-service:3005/getAllMessages");
                        const responseChannels = await axios.get("http://chat-service:3005/getAllChannels");
			messages = responseMessages?.data ?? [];
			channels = responseChannels?.data ?? [];
                        console.log("got all messages and channels");
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
			const exist = Array.from(users.values()).some(u => u.name === name);
			if (exist) return ;
			users.set(socket.id, { name, public_id });
			//await reloadEverything();
			console.log(`system: ${name} joined to the chat`);
			io.emit("updateUsers", Array.from(users.values()));
			socket.broadcast.emit("serverMessage", `system: ${name} joined to the chat`);
		})
		//disconnection
		socket.on("disconnect", () => {
			let data = users.get(socket.id);
			if (!data)
				data = { name: "Anonymous" };
			users.delete(socket.id);
			//await reloadEverything;
			console.log(`system: ${data.name} left the chat`);
			io.emit("updateUsers", Array.from(users.values()));
			socket.broadcast.emit("serverMessage", `system: ${data.name} left the chat`);
		})
	});

}
