import axios from 'axios';

const authModels = {
	registerNewUser: async function registerNewUser(data) {
		await axios.post("https://sqlite-db:3002/registerNewUser", 
		data, 
		{ 
			headers: { 'Content-type': 'application/json' }
		})
		return ;
	},

	tryLoginTheUser: async function tryLoginTheUser(data) {
		await axios.post("https://sqlite-db:3002/tryLoginTheUser",
			data,
			{
				headers: { 'Content-type': 'application/json' }
			})
		return ;
	},

	getUserData: async function getUserData(email) {
		const response = await axios.post("https://sqlite-db:3002/getUserData",
			email,
			{
				headers: { 'Content-type': 'text/plain' }
			})
		return (response.data);
	}
};

export default authModels;
