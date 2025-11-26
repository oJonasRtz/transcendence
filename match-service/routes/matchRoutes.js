import {matchMaking} from '../app.js';

const routes = [
    {
        path: '/matchMaking',
        handler: matchMaking.newMatch.bind(matchMaking),
    },
    {
        path: '/stopMatchMaking',
        handler: matchMaking.stopQueue.bind(matchMaking),
    }
];

export function matchRoutes(fastify, options) {
    for (const route of routes)
        fastify.post(route.path, route.handler);
}
