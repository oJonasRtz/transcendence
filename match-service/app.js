import fastify from "fastify";
import fs from "fs";

//Temp config to ignore TLS certificate errors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const https = {
	key:  fs.readFileSync('./ssl/server.key'),
	cert: fs.readFileSync('./ssl/server.cert')
};
const	app = fastify({https});


export default app;