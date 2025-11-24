import { MatchMaking } from "../services/MatchMaking.class";

const matchMaking = new MatchMaking();

//Template. Fill with routes later
const routes = [
    {
        path: '/matchMaking',
        handler: matchMaking.newMatch().bind(matchMaking),
    },
];

export function matchRoutes(fastify, options) {
    for (const route of routes)
        fastify.post(route.path, route.handler);
}
