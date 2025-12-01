import { lobby, server } from "./app.js";

const PORT = process.env.PORT || 3004;

server.listen(PORT);
lobby.connect();