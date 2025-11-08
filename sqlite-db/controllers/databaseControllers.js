import axios from 'axios';

const databaseControllers = {
	hello: function testDatabaseConnection(req, reply) => {
		return reply.send("The sqlite-db is working perfectly");
	}
};

export default databaseControllers;
