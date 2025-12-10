import axios from 'axios';

export default async function registerServer(io) {
	const users = new Map();
	//let official = new Map();
	const privateUsers = new Map();

	let messages = [];
	let notifications = [];

	async function sendPrivateMessageServer(msg, name, public_id) {
		try {
                                const response = await axios.post("http://chat-service:3005/getAllPrivateMessages", { username: name, public_id: public_id });
                                const dataPrivateMessages = response?.data || [];

                                let privateMessages = [];

                                dataPrivateMessages.forEach(msg => {
                                        let input = `${msg.sender_username}: ${msg.content}`;
                                        privateMessages.push(input);
                                });

                                const res = await axios.post("http://users-service:3003/getDataByPublicId", { public_id: public_id });
                                const target_name = res?.data.username;

                                for (const [socketId, user] of privateUsers.entries()) {
                                        if (user.name === name || user.name === target_name) {
                                                io.to(socketId).emit("updateDirectMessages", privateMessages);
                                        }
                                }
                        } catch (err) {
                                console.error("Unfortunately we cannot send the private Message:", err);
                        }
	};

	async function reloadEverything (owner) {
                try {
			if (!owner) return ;
                        const responseMessages = await axios.post("http://chat-service:3005/getAllMessages", { username: owner });
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

		socket.on("joinPrivate", async ({ username, owner_id, target_id }) => {
			let name = username?.trim();
			socket.name = name;
			socket.public_id = owner_id;
			const exist = Array.from(privateUsers.values()).some(u => u.name === name);
			if (exist) return ;
			let public_id = owner_id;
			privateUsers.set(socket.id, { name, public_id });

			let official = new Map();

			official.set(socket.id, { name, public_id });

			console.log("target_id:", target_id);

			for (const [ socketId, user ] of privateUsers.entries()) {
				if (user.public_id === target_id) {
					console.log("ACHEI");
					official.set(socketId, user);
					io.to(socketId).emit("updatePrivateUsers", Array.from(official.values()));
					break ;
				}
			}

			io.to(socket.id).emit("updatePrivateUsers", Array.from(official.values()));

			console.log("privateUsers:", Array.from(privateUsers.values()));
			console.log("official:", Array.from(official.values()));

			let msg = null;
			await sendPrivateMessageServer(msg, socket.name, target_id);
		});

		socket.on("join", async ({ username, public_id, avatar }) => {
			let name = username?.trim() || "Anonymous";
			socket.name = name; // use the socket.name name
			socket.public_id = public_id;
			const exist = Array.from(users.values()).some(u => u.name === name);
			if (exist) return ;
			users.set(socket.id, { name, public_id });
			try {
				await axios.post("http://chat-service:3005/storeMessage", { name: `${name}`, isSystem: true, msg: `system: ${name} joined to the chat` } );
				await reloadEverything(socket.name);
			} catch (err) { 
				console.error(`Error updating status of the user ${name}`);
			}
			const response = await axios.get("http://users-service:3003/getAllBlacklist");
                        const blacklist = response?.data ?? {};

                        const sender = users.get(socket.id); // who are you, sender?
                        const senderName = sender.name;

                        if (!sender || !senderName) return ;

                        const blockUserTargets = blacklist.filter(target => target.owner_username === senderName).map(user => user.target_username);

                        for (const [socketId, user] of users.entries()) {
                                console.log(`${socket.name} is starting filter ${user.name}`);
                                if (blockUserTargets.includes(user.name)) {
                                        console.log("Blocked:", user.name);
                                        continue ;
                                }
                                console.log(`${socket.name} is sending messages to ${user.name}`);
                                io.to(socketId).emit("updateMessages", messages);
                        }
			io.emit("updateUsers", Array.from(users.values()));
		});

		//disconnection

		socket.on("disconnect", async () => {
			let data = users.get(socket.id);
			const exist = privateUsers.get(socket.id);
			if (exist) {
				privateUsers.delete(socket.id);
				return ;
			}
			if (!data)
				data = { name: "Anonymous" };
			users.delete(socket.id);
			try {
				await axios.post("http://chat-service:3005/storeMessage", { name: `${data.name}`, isSystem: true, msg: `system: ${data.name} left the chat` } );
				await reloadEverything(data.name);
			} catch (err) {
				console.error(`Error updating status of the user ${data.name}`);
			}
			const response = await axios.get("http://users-service:3003/getAllBlacklist");
                        const blacklist = response?.data ?? {};

                        const sender = users.get(socket.id); // who are you, sender?
                        const senderName = sender.name;

                        if (!sender || !senderName) return ;

                        const blockUserTargets = blacklist.filter(target => target.owner_username === senderName).map(user => user.target_username);

                        for (const [socketId, user] of users.entries()) {
                                if (blockUserTargets.includes(user.name)) {
                                        console.log("Blocked:", user.name);
                                        continue ;
                                }
                                io.to(socketId).emit("updateMessages", messages);
                        }
                        io.emit("updateUsers", Array.from(users.values()));
		});

		socket.on("sendInvite", async () => {
			try {
				const response = await axios.post("http://localhost:3004/invite", { userName: socket.name, public_id: socket.public_id });
				if (!response?.data) {
					messages.push(`system: You need to wait time to send another link`);
					await reloadEverything(socket.name);
					socket.emit("updateMessages", messages);
				}
				await axios.post("http://chat-service:3005/storeMessage", { name: `${socket.name}`, isSystem: false, msg: response?.data } );
				await reloadEverything(socket.name);
			} catch (err) {
				console.error(`Error sending the pong invite match, user: ${socket.name}`);
			}

			const response = await axios.get("http://users-service:3003/getAllBlacklist");
                        const blacklist = response?.data ?? {};

			const sender = users.get(socket.id); // who are you, sender?
                        const senderName = sender.name;

                        if (!sender || !senderName) return ;

                        const blockUserTargets = blacklist.filter(target => target.owner_username === senderName).map(user => user.target_username);

			for (const [socketId, user] of users.entries()) {
                                if (blockUserTargets.includes(user.name)) {
                                        continue ;
                                }
                                io.to(socketId).emit("updateMessages", messages);
                        }
			io.emit("updateUsers", Array.from(users.values()));
		});
		
		// Specif events only happens on socket
		socket.on("sendMessage", async (msg) => {
			const response = await axios.get("http://users-service:3003/getAllBlacklist");
			const blacklist = response?.data ?? {};

			let input = msg?.trim();
			if (!input || input.length > 200) {
				messages.push("system: You cannot type a message above 200 characters");
				socket.emit("updateMessages", messages);
				io.emit("updateUsers", Array.from(users.values()));
				console.error("Invalid input or message above to the allowed length");
				return ;
			}
			const sender = users.get(socket.id); // who are you, sender?
			const senderName = sender.name;

			if (!sender || !senderName) return ;

			const blockUserTargets = blacklist.filter(target => target.owner_username === senderName).map(user => user.target_username); // obtain all the names of users' blocked

			try {
				await axios.post("http://chat-service:3005/storeMessage", { name: `${socket.name}`, isSystem: false, msg: input } );
				await reloadEverything(socket.name); // reload everything using the database
			} catch (err) {
				console.error(`Error trying to send the message of user ${socket.name}`);
			}

			for (const [socketId, user] of users.entries()) {
				if (blockUserTargets.includes(user.name)) {
					continue ;
				}
                                io.to(socketId).emit("updateMessages", messages);
			}

			//io.emit("updateMessages", messages);
			io.emit("updateUsers", Array.from(users.values()));
		});

		socket.on("sendPrivateMessage", async (msg, public_id) => {
			try {
				await axios.post("http://chat-service:3005/storePrivateMessage", { username: `${socket.name}`, msg: msg, public_id: public_id });
				const response = await axios.post("http://chat-service:3005/getAllPrivateMessages", { username: `${socket.name}`, public_id: public_id });
				const dataPrivateMessages = response?.data || [];

				let privateMessages = [];

				dataPrivateMessages.forEach(msg => {
                                       	let input = `${msg.sender_username}: ${msg.content}`; 
                                	privateMessages.push(input);
                        	});

				const res = await axios.post("http://users-service:3003/getDataByPublicId", { public_id: public_id });
				const target_name = res?.data.username;

				for (const [socketId, user] of privateUsers.entries()) {
                                	if (user.name === `${socket.name}` || user.name === target_name) {
                                        	io.to(socketId).emit("updateDirectMessages", privateMessages);
                                	}
                        	}

				let official = new Map();

                        	official.set(socket.id, { name: `${socket.name}`, public_id: `${socket.public_id}` });

                        	for (const [ socketId, user ] of privateUsers.entries()) {
                                	if (user.public_id === public_id) {
                                        	official.set(socketId, user);
						io.to(socketId).emit("updatePrivateUsers", Array.from(official.values()));
                                        	break ;
                               		 }
                        	}
				io.to(socket.id).emit("updatePrivateUsers", Array.from(official.values()));

			} catch (err) {
				console.error("Unfortunately we cannot send the private Message:", err);
			}
		});
});
}
