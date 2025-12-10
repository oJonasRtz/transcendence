import axios from 'axios';
import jwt from 'jsonwebtoken';

export default async function registerServer(io) {
	const users = new Map();
	//let official = new Map();
	const privateUsers = new Map();

	io.use((socket, next) => {
		const cookie = socket.handshake.headers.cookie;

		if (!cookie)
			return next(new Error("No cookies sent"));

		const cookies = Object.fromEntries(cookie.split(';').map(c => c.split("=")));

		const token = cookies.jwt;

		if (!token) {
			console.error("Not found JWT");
			return next(new Error("You need JWT"));
		}

		try {
			const data = jwt.verify(token, process.env.JWT_SECRET);

			socket.user = {
				user_id: data.user_id,
				email: data.email,
				username: data.username
			}

			socket.user_id = data.user_id;
			socket.username = data.username;

			console.log("socket.user_id:", socket.user_id);
			console.log("socket.username:", socket.username);
			console.log("socket.user:", socket.user);
			return next();

		} catch (err) {
			console.error("ERROR NO IO USE:", err);
			return next(new Error("Invalid JWT"));
		}
	});

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

		socket.on("joinPrivate", async ({ owner_id, target_id }) => {
			socket.public_id = owner_id;
			const exist = Array.from(privateUsers.values()).some(u => u.name === socket.username);
			if (exist) return ;
			let public_id = owner_id;
			privateUsers.set(socket.id, { name: socket.username, public_id });

			let official = new Map();

			official.set(socket.id, { name: socket.username, public_id });

			for (const [ socketId, user ] of privateUsers.entries()) {
				if (user.public_id === target_id) {
					official.set(socketId, user);
					io.to(socketId).emit("updatePrivateUsers", Array.from(official.values()));
					break ;
				}
			}

			io.to(socket.id).emit("updatePrivateUsers", Array.from(official.values()));

			let msg = null;
			await sendPrivateMessageServer(msg, socket.username, target_id);
		});

		socket.on("join", async ({ public_id }) => {
			socket.public_id = public_id;
			const exist = Array.from(users.values()).some(u => u.name === socket.username);
			if (exist) return ;
			users.set(socket.id, { name, public_id });
			try {
				await axios.post("http://chat-service:3005/storeMessage", { name: `${socket.username}`, isSystem: true, msg: `system: ${socket.username} joined to the chat` } );
				await reloadEverything(socket.username);
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
                                if (blockUserTargets.includes(user.name)) {
                                        continue ;
                                }
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
				const response = await axios.post("http://localhost:3004/invite", { userName: socket.username, public_id: socket.public_id });
				if (!response?.data) {
					messages.push(`system: You need to wait time to send another link`);
					await reloadEverything(socket.username);
					socket.emit("updateMessages", messages);
				}
				await axios.post("http://chat-service:3005/storeMessage", { name: `${socket.username}`, isSystem: false, msg: response?.data } );
				await reloadEverything(socket.username);
			} catch (err) {
				console.error(`Error sending the pong invite match, user: ${socket.username}`);
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
				await axios.post("http://chat-service:3005/storeMessage", { name: `${socket.username}`, isSystem: false, msg: input } );
				await reloadEverything(socket.name); // reload everything using the database
			} catch (err) {
				console.error(`Error trying to send the message of user ${socket.username}`);
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
				await axios.post("http://chat-service:3005/storePrivateMessage", { username: `${socket.username}`, msg: msg, public_id: public_id });
				const response = await axios.post("http://chat-service:3005/getAllPrivateMessages", { username: `${socket.username}`, public_id: public_id });
				const dataPrivateMessages = response?.data || [];

				let privateMessages = [];

				dataPrivateMessages.forEach(msg => {
                                       	let input = `${msg.sender_username}: ${msg.content}`; 
                                	privateMessages.push(input);
                        	});

				const res = await axios.post("http://users-service:3003/getDataByPublicId", { public_id: public_id });
				const target_name = res?.data.username;

				for (const [socketId, user] of privateUsers.entries()) {
                                	if (user.name === `${socket.username}` || user.name === target_name) {
                                        	io.to(socketId).emit("updateDirectMessages", privateMessages);
                                	}
                        	}

				let official = new Map();

                        	official.set(socket.id, { name: `${socket.username}`, public_id: `${socket.public_id}` });

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
