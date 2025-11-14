import axios from 'axios';

const usersModel = {
	createNewUser: async function createNewUser(data) {

		await axios.post("https://sqlite-db:3002/createNewUser", data);

		return reply.code(201).send("Success");
	}
}

export default usersModel;
