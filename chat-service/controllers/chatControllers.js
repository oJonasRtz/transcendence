import axios from "axios";

const chatControllers = {
  storeMessage: async function storeMessage(req, reply) {
    try {
      if (!req.body || !req.body.name || !req.body.msg)
        return reply.code(400).send("You need to inform the msg and name here");
      if (req.body.isSystem === undefined) req.body.isSystem = false;
      await axios.post("https://sqlite-db:3002/storeMessage", req.body);
      return reply.code(204).send();
    } catch (err) {
      console.error("CHAT-SERVICE storeMessage ERROR:", err);
      return reply.code(500).send("An error happened");
    }
  },

  getAllMessages: async function getAllMessages(req, reply) {
    try {
      if (!req.body || !req.body.username)
        return reply.code(400).send("You need to inform the username here");
      const response = await axios.post(
        "https://sqlite-db:3002/getAllMessages",
        { username: req.body.username }
      );
      return reply.code(200).send(response?.data ?? null);
    } catch (err) {
      console.error("CHAT-SERVICE getAllMessages ERROR:", err);
      return reply.code(500).send("An error happened");
    }
  },

  getAllPrivateMessages: async function getAllPrivateMessages(req, reply) {
    try {
      if (!req.body || !req.body.user_id || !req.body.public_id)
        return reply
          .code(400)
          .send("You need to inform user_id and public_id here");
      const response = await axios.post(
        "https://sqlite-db:3002/getAllPrivateMessages",
        req.body
      );
      return reply.code(200).send(response?.data ?? []);
    } catch (err) {
      console.error(
        "CHAT-SERVICE getAllPrivateMessages ERROR:",
        err?.response?.data || err.message
      );
      return reply.code(500).send("An error happened");
    }
  },

  storePrivateMessage: async function storePrivateMessage(req, reply) {
    try {
      if (
        !req.body ||
        !req.body.user_id ||
        !req.body.msg ||
        !req.body.public_id
      )
        return reply
          .code(400)
          .send("You need to inform username and public_id here");
      await axios.post("https://sqlite-db:3002/storePrivateMessage", req.body);
      return reply.code(201).send("Success");
    } catch (err) {
      console.error(
        "CHAT-SERVICE storePrivateMessage ERROR:",
        err?.response?.data || err.message
      );
      return reply.code(500).send("An error happened");
    }
  },

  setTargetId: async function setTargetId(req, reply) {
    try {
      if (!req.body || !req.body.user_id || !req.body.public_id)
        return reply
          .code(400)
          .send("You need to inform user_id and public_id here");
      await axios.post("https://sqlite-db:3002/setTargetId", req.body);
      return reply.code(201).send("Success");
    } catch (err) {
      console.error(
        "CHAT-SERVICE setTargetId ERROR:",
        err?.response?.data || err.message
      );
      return reply.code(500).send("An error happened");
    }
  },

  getTargetId: async function getTargetId(req, reply) {
    try {
      if (!req.body || !req.body.public_id)
        return reply.code(400).send("You need to inform public_id here");
      const response = await axios.post("https://sqlite-db:3002/getTargetId", {
        public_id: req.body.public_id,
      });
      return reply.code(200).send(response?.data ?? null);
    } catch (err) {
      console.error(
        "CHAT-SERVICE getTargetId ERROR:",
        err?.response?.data || err.message
      );
      return reply.code(500).send("An error happened");
    }
  },
};

export default chatControllers;
