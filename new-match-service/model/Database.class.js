import axios from "axios";

export class DataBase {
	async sendRequest(endpoint, payload = {}) {
		const res = await axios.post(`http://users-service:3003/${endpoint}`, payload);

		return res.data;
	}
}
