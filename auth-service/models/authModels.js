import axios from 'axios';

const authModels = {
	registerNewUser: async function registerNewUser(data) {
		await axios.post("http://sqlite-db:3002/registerNewUser", data);
		return ;
	}
}

export default authModels;
