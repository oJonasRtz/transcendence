import fastify from "fastify";
import formbody from '@fastify/formbody';
import cookie from '@fastify/cookie';
import { Connection } from "./services/Connection.class";
import { matchRoutes } from "./routes/matchRoutes";
import { MatchMaking } from "./services/MatchMaking.class";

//Temp config to ignore TLS certificate errors
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const	con = new Connection();
const	matchMaking = new MatchMaking();
const	app = fastify();

app.register(cookie, {
		secret: process.env.COOKIE_SECRET || "purpleVoid",
		hook: "onRequest"
});

app.register(formbody);

app.register(matchRoutes, {});

export default {app, con, matchMaking};