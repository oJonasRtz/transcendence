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

		const cookies = Object.fromEntries(cookie.split(';').map(c => c.trim().split("=")));

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
				username: data.username,
				public_id: data.public_id
			}

			socket.user_id = data.user_id;
			socket.email = data.email;
			socket.username = data.username;
			socket.public_id = data.public_id;

			return next();

		} catch (err) {
			return next(new Error("Invalid JWT"));
		}
	});

	let messages = [];
	let notifications = [];

	async function getTournamentAdvise() {
		try {
			const response = await axios.get("http://match-service:3004/tournaments");
			if (response?.data.tournament) {
				const match = `${response?.data.name} at ${response?.data.date}. Keep you posted about everything.`;
				await axios.post("http://chat-service:3005/storeMessage", { name: `SYSTEM`, isSystem: true, avatar: "/app/public/images/default_avatar.png" , isLink: false, msg: match });
			}
		} catch (err) {}
	};

	async function sendPrivateMessageServer(msg, user_id, name, public_id) {
		try {
                                const response = await axios.post("http://chat-service:3005/getAllPrivateMessages", { user_id: user_id, public_id: public_id });

                                let privateMessages = [];

				let data = Array.isArray(response?.data) ? response?.data : [];

                                privateMessages.push(...data);

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
			await getTournamentAdvise();
                        const responseMessages = await axios.post("http://chat-service:3005/getAllMessages", { username: owner });
			let data = Array.isArray(responseMessages?.data) ? responseMessages?.data : [];

			messages.length = 0; // erase the list

			messages.push(...data);

                } catch (err) {
                        console.error("Error in reloadEverything:", err);
                }
        };

	// connection and disconnection are the pattern, do not change the names!!!

	io.on("connection", (socket) => {
		socket.currentChannel = null; // the first channel is not a channel :D
		// connection

		socket.on("joinPrivate", async ({ target_id }) => {
			await axios.post("http://chat-service:3005/setTargetId", { user_id: socket.user_id, public_id: target_id });
			notifications.length = 0;
			// Kick any existing socket with the same username (stale connection)
			if (!socket.privateUserLock) {
				socket.privateUserLock = true;
				const toDelete = [];
				for (const [socketId, user] of privateUsers.entries()) {
					if (user.name === socket.username) {
						toDelete.push(socketId);
					}
				}
				for (const socketId of toDelete) {
					privateUsers.delete(socketId);
					io.to(socketId).emit("kicked", "Connected from another location");
					io.sockets.sockets.get(socketId)?.disconnect(true);
				}
				privateUsers.set(socket.id, { name: socket.username, public_id: socket.public_id, user_id: socket.user_id });
				socket.privateUserLock = false;
			}

			let official = new Map();

			official.set(socket.id, { name: socket.username, public_id: socket.public_id, avatar: `avatar_${socket.user_id}` });

			for (const [ socketId, user ] of privateUsers.entries()) {
				if (user.public_id === target_id) {

					official.set(socketId, { name: user.name, public_id: user.public_id, avatar: `avatar_${user.user_id}` });
					io.to(socketId).emit("updatePrivateUsers", Array.from(official.values()));
					break ;
				}
			}

			socket.emit("updateNotifications", notifications);
			io.to(socket.id).emit("updatePrivateUsers", Array.from(official.values()));

			let msg = null;
			try {
				await sendPrivateMessageServer(msg, socket.user_id, socket.username, target_id);
			} catch (err) {
				console.error("Error sending private message:", err);
			}
		});

		socket.on("join", async () => {
			// Kick any existing socket with the same username (stale connection)
			if (!socket.userLock) {
				socket.userLock = true;
				const toDelete = [];
				for (const [socketId, user] of users.entries()) {
					if (user.name === socket.username) {
						toDelete.push(socketId);
					}
				}
				for (const socketId of toDelete) {
					users.delete(socketId);
					io.to(socketId).emit("kicked", "Connected from another location");
					io.sockets.sockets.get(socketId)?.disconnect(true);
				}
				users.set(socket.id, { name: socket.username, public_id: socket.public_id, avatar: `avatar_${socket.user_id}` });
				socket.userLock = false;
			}
			try {
				notifications.length = 0;
				const res = await axios.post("http://users-service:3003/getUserAvatar", { user_id: socket.user_id, email: socket.email });
				await axios.post("http://chat-service:3005/storeMessage", { name: `${socket.username}`, isSystem: true, avatar: res?.data.avatar ?? "/app/public/images/default_avatar.png" , isLink: false, msg: `system: ${socket.username} joined to the chat` } );
				await reloadEverything(socket.username);
			} catch (err) { 
				console.error(`Error updating status of the user ${socket.username}:`, err);
			}
			const response = await axios.get("http://users-service:3003/getAllBlacklist");
                        const blacklist = response?.data ?? [];

                        const senderName = socket.username;

                        if (!senderName) return ;

                        /*const blockUserTargets = blacklist.filter(target => target.owner_username === senderName).map(user => user.target_username);

                        for (const [socketId, user] of users.entries()) {
                                if (blockUserTargets.includes(user.name)) {
                                        continue ;
                                }
                                io.to(socketId).emit("updateMessages", messages);
                        }*/

			io.emit("updateNotifications", notifications);
			io.emit("updateMessages", messages);
			io.emit("updateUsers", Array.from(users.values()));
		});

		//disconnection

		socket.on("disconnect", async () => {
			notifications.length = 0;
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
				const res = await axios.post("http://users-service:3003/getUserAvatar", { user_id: socket.user_id, email: socket.email });
				await axios.post("http://chat-service:3005/storeMessage", { name: `${data.name}`, isSystem: true, avatar: res?.data.avatar ?? "/app/public/images/default_avatar.png", isLink: false, msg: `system: ${data.name} left the chat` });
				await reloadEverything(data.name);
			} catch (err) {
				console.error(`Error updating status of the user ${data.name}:`, err);
			}
			const response = await axios.get("http://users-service:3003/getAllBlacklist");
                        const blacklist = response?.data ?? [];

                        const senderName = socket.username;

                        if (!senderName) return ;

                        /*const blockUserTargets = blacklist.filter(target => target.target_username === senderName).map(user => user.owner_username);

                        for (const [socketId, user] of users.entries()) {
                                if (blockUserTargets.includes(user.name)) {
                                        console.log("Blocked:", user.name);
                                        continue ;
                                }
                                io.to(socketId).emit("updateMessages", messages);
                        }*/
			io.emit("updateNotifications", notifications);
			io.emit("updateMessages", messages);
                        io.emit("updateUsers", Array.from(users.values()));
		});

		socket.on("sendPrivateInvite", async (target_id) => {
			let invitation = null;

                        let privateMessages = [];
			try {
				invitation = await axios.post("http://match-service:3004/invite", { userName: `${socket.username}`, public_id: target_id });

				 const userAvatar = await axios.post("http://users-service:3003/getUserAvatar", { user_id: socket.user_id, email: socket.email });

				console.log("INVITE:", invitation);

				await axios.post("http://chat-service:3005/storePrivateMessage", { user_id: socket.user_id, avatar: userAvatar?.data.avatar ?? "/app/public/images/default_avatar.png", isLink: true, msg: invitation?.data.link, public_id: target_id });

				const response = await axios.post("http://chat-service:3005/getAllPrivateMessages", { user_id: socket.user_id, public_id: target_id });


                                let data = Array.isArray(response?.data) ? response?.data : [];

                                privateMessages.push(...data);
				
                                const res = await axios.post("http://users-service:3003/getDataByPublicId", { public_id: target_id });
                                const target_name = res?.data.username;

                                for (const [socketId, user] of privateUsers.entries()) {
                                        if (user.name === `${socket.username}` || user.name === target_name) {
                                                io.to(socketId).emit("updateDirectMessages", privateMessages);
                                        }
                                }

                                let official = new Map();

                                official.set(socket.id, { name: `${socket.username}`, public_id: `${socket.public_id}`, avatar: `avatar_${socket.user_id}` });

                                for (const [ socketId, user ] of privateUsers.entries()) {
                                        if (user.public_id === target_id) {
                                                official.set(socketId, { name: user.name, public_id: user.public_id, avatar: `avatar_${user.user_id}` });
                                                io.to(socketId).emit("updatePrivateUsers", Array.from(official.values()));
                                                break ;
                                         }
                                }
                                io.to(socket.id).emit("updatePrivateUsers", Array.from(official.values()));

			} catch (err) {
				let res = null;
				let target_name = null;
				/*try {
                                	res = await axios.post("http://users-service:3003/getDataByPublicId", { public_id: target_id });
                                	target_name = res?.data.username;
				} catch (err) { return ; }*/

				//let response = null;
				/*try {
					response = await axios.post("http://chat-service:3005/getAllPrivateMessages", { user_id: socket.user_id, public_id: target_id });
				} catch (err) {}

				let data = Array.isArray(response?.data) ? response?.data : [];

				if (data)
                                	privateMessages.push(...data);*/

				if (!invitation?.data.link) {
					notifications.length = 0;
					notifications.push({isSystem: true, isLink: false, content: `system: You need to wait time to send another link`, username: "SYSTEM", avatar: '/public/images/system.png'});
					/*for (const [socketId, user] of privateUsers.entries()) {
                                        if (user.name === `${socket.username}` || user.name === target_name) {
                                                io.to(socketId).emit("updateDirectMessages", privateMessages);
                                        }
                                }*/
					socket.emit("updateNotifications", notifications);
					return ;
				}
				console.error("sendPrivateInvite ERROR:", err);
			}	
		});

		socket.on("sendInvite", async () => {
			let response = null;
			try {
				response = await axios.post("http://match-service:3004/invite", { userName: `${socket.username}`, public_id: socket.public_id });
					socket.emit("updateMessages", messages);
				
				 const res = await axios.post("http://users-service:3003/getUserAvatar", { user_id: socket.user_id, email: socket.email });
				await axios.post("http://chat-service:3005/storeMessage", { name: `${socket.username}`, isSystem: false, avatar: res?.data.avatar ?? '/app/public/images/default_avatar.png', isLink: true, msg: response?.data.link });
				await reloadEverything(socket.username);
			} catch (err) {
				if (!response?.data.link)
					await reloadEverything(socket.username);
					notifications.length = 0;
					notifications.push({isSystem: true, isLink: false, content: `system: You need to wait time to send another link`, username: "Anonymous", avatar: '/public/images/system.png'});
					socket.emit("updateNotifications", notifications);
				console.error(`Error sending the pong invite match, user: ${socket.username}:`, err);
			}

			const resp = await axios.get("http://users-service:3003/getAllBlacklist");
                        const blacklist = resp?.data ?? [];

                        const senderName = socket.username;

                        if (!senderName) return ;

                        /*const blockUserTargets = blacklist.filter(target => target.target_username === senderName).map(user => user.owner_username);

			for (const [socketId, user] of users.entries()) {
                                if (blockUserTargets.includes(user.name)) {
                                        continue ;
                                }
                                io.to(socketId).emit("updateMessages", messages);
                        }*/
			io.emit("updateMessages", messages);
			io.emit("updateUsers", Array.from(users.values()));
		});
		
		// Specif events only happens on socket
		socket.on("sendMessage", async (msg) => {
			let flag = true;
			let blockUserTargets = null;
			try {
				const response = await axios.get("http://users-service:3003/getAllBlacklist");
				const blacklist = response?.data ?? {};

				let input = msg?.trim();
				if (!input || input.length > 200)
					throw new Error("LENGTH_TOO_HIGH");

				const senderName = socket.username;

				if (!senderName) return ;

				blockUserTargets = blacklist.filter(target => target.owner_username === senderName).map(user => user.target_username); // obtain all the names of users' blocked

				const res = await axios.post("http://users-service:3003/getUserAvatar", { user_id: socket.user_id, email: socket.email });
				await axios.post("http://chat-service:3005/storeMessage", { name: `${socket.username}`, isSystem: false, avatar: res?.data.avatar ?? "/app/public/images/default_avatar.png", isLink: false, msg: input } );
				await reloadEverything(socket.username); // reload everything using the database
			} catch (err) {
				notifications.length = 0;
				if (err.message === "LENGTH_TOO_HIGH") {
					flag = false;
					try {
						await reloadEverything(`${socket.username}`);
					} catch (err) {}
					notifications.push({isSystem: true, isLink: false, isLimit: true, msg: "system: You cannot type a message above 200 characters", username: "SYSTEM", avatar: '/public/images/system.png'});
                                	socket.emit("updateNotifications", notifications);
                                	io.emit("updateUsers", Array.from(users.values()));
                                	console.error("Invalid input or message above to the allowed length");
				}
				console.error(`Error trying to send the message of user ${socket.username}:`, err);
			}

			/*for (const [socketId, user] of users.entries()) {
				if (blockUserTargets.includes(user.name)) {
					continue ;
				}
                                io.to(socketId).emit("updateMessages", messages);
			}*/

			if (flag)
				notifications.length = 0;
			
			socket.emit("updateNotifications", notifications);
			io.emit("updateMessages", messages);
			io.emit("updateUsers", Array.from(users.values()));
		});

		socket.on("sendPrivateMessage", async (msg, public_id) => {
			let privateMessages = [];
			notifications.length = 0;
			try {
				if(msg && msg.length > 200)
					throw new Error("TOO_HIGH_LENGTH");
				const ress = await axios.post("http://users-service:3003/getUserAvatar", { user_id: socket.user_id, email: socket.email });
				await axios.post("http://chat-service:3005/storePrivateMessage", { user_id: socket.user_id, avatar: ress?.data.avatar ?? "/app/public/images/default_avatar.png", isLink: false, msg: msg, public_id: public_id });
				const response = await axios.post("http://chat-service:3005/getAllPrivateMessages", { user_id: socket.user_id, public_id: public_id });
	
				let data = Array.isArray(response?.data) ? response?.data : [];

				//await axios.post("http://chat-service:3005/setTargetId", { user_id: socket.user_id, public_id: public_id });

				let allowed = true;
				const test = await axios.post("http://chat-service:3005/getTargetId", { public_id: public_id });
				if (test?.data.target_id !== socket.user_id)
					allowed = false;
                                privateMessages.push(...data);

				const res = await axios.post("http://users-service:3003/getDataByPublicId", { public_id: public_id });
				const target_name = res?.data.username;

				for (const [socketId, user] of privateUsers.entries()) {
                                	if (user.name === `${socket.username}`) 
                                        	io.to(socketId).emit("updateDirectMessages", privateMessages);
					else if (user.name === target_name && allowed)
						io.to(socketId).emit("updateDirectMessages", privateMessages);
                        	}

				let official = new Map();

                        	official.set(socket.id, { name: `${socket.username}`, public_id: `${socket.public_id}`, avatar: `avatar_${socket.user_id}` });

                        	for (const [ socketId, user ] of privateUsers.entries()) {
                                	if (user.public_id === public_id) {
                                        	official.set(socketId, { name: user.name, public_id: user.public_id,avatar: `avatar_${user.user_id}` });
						if (allowed)
							io.to(socketId).emit("updatePrivateUsers", Array.from(official.values()));
                                        	break ;
                               		 }
                        	}
				socket.emit("updateNotifications", notifications);
				io.to(socket.id).emit("updatePrivateUsers", Array.from(official.values()));

			} catch (err) {
				if (err.message === "TOO_HIGH_LENGTH") {
					notifications.length = 0;
					/*try {
						const response = await axios.post("http://chat-service:3005/getAllPrivateMessages", { user_id: socket.user_id, public_id: public_id });
						let data = Array.isArray(response?.data) ? response?.data : [];
                                		privateMessages.push(...data);
					} catch (err) {}*/
					notifications.push({isSystem: true, isLink: false, content: "system: You cannot type a message above 200 characters", username: "SYSTEM", avatar: '/public/images/system.png'});
                                	socket.emit("updateNotifications", notifications);
                                	console.error("Invalid input or message above to the allowed length");
				}
				console.error("Unfortunately we cannot send the private Message:", err);
			}
		});
});
}
