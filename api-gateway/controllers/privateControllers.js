import axios from 'axios';
import jwt from 'jsonwebtoken';

const privateControllers = {
	helloDb: async function testPrivateRoute(req, reply) {
                try {
                        const result = await axios.get("http://auth-service:3001/helloDb");
                        return reply.send(`API GATEWAY - auth: ${result.data}`);
                } catch (err) {
                        return reply.send(`Unfortunately, the auth-service cannot access the database: ${err.message}`);
                }
	},

	getHomePage: async function getHomePage(req, reply) {
		try {
			const token = req.jwt;

			if (!token) {
				console.log("You are not authenticated");
				return reply.redirect("/login");
			}

			const username = req.user.username;

			return reply.view("home", { username } );
		} catch (err) {
			console.error("You are not authenticated");
			return reply.redirect("/login");
		}
	},

	logout: async function logoutTheUser(req, reply) {
		reply.clearCookie("jwt", {
			httpOnly: true,
			sameSite: "lax",
			path: "/"
		});
		return reply.redirect("/login");
	}
};

export default privateControllers;
