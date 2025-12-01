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
		socket.on("join", async (user) => {
			let name = user?.trim() || "Anonymous";
			users.set(socket.id, name);
			//await reloadEverything();
			console.log(`system: ${name} joined to the chat`);
		})
		//disconnection
		socket.on("disconnect", () => {
			let name = users.get(socket.id) || "Anonymous"; 
			users.delete(socket.id);
			//await reloadEverything;
			console.log(`system: ${name} left the chat`);
		})
	});
}
