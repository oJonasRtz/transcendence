import axios from 'axios';

export default async function registerServer(io) {
	const users = new Map();
	let messages = [];
	let channels = [];

	async function reloadEverything () {
                try {
                        responseMessages = await axios.get("http://chat-service:3005/getAllMessages");
                        responseChannels = await axios.get("http://chat-service:3005/getAllChannels");
			messages = responseMessages?.data ?? [];
			channels = responseChannels?.data ?? [];
                        console.log("got all messages and channels");
                } catch (err) {
                        console.error(err);
                }
        };

	io.on("connection", (socket) => {
		socket.currentChannel = null;
		socket.on("join", async (user) => {
			let name = user?.trim() || "Anonymous";
			users.set(socket.id, name);
			await reloadEverything();
			console.log(`${name} joined to the chat`);
		})
	});
}
