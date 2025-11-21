import axios from 'axios';

const usersModel = {
	createNewUser: async function createNewUser(data) {

		await axios.post("http://sqlite-db:3002/createNewUser", data);

		return (true);
	}
}

export default usersModel;
