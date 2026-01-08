import axios from "axios";

export class DataBase {
  async sendRequest(endpoint, payload = {}) {
    const res = await axios.post(
      `https://users-service:3003/${endpoint}`,
      payload
    );

    return res.data;
  }
}
