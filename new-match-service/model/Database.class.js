import axios from "axios";

const RED = '\x1b[31m';
const RESET = '\x1b[0m';

export class DataBase {
  async sendRequest(endpoint, payload = {}) {
    let end = String(endpoint).trim();

    if (end.startsWith('/'))
      end = end.slice(1);

    const url = `https://users-service:3003/${end}`;

    try {
      console.log(`DataBase: Sending request with payload:`, payload);
      const res = await axios.post(url, payload);
      return res.data;
    } catch (error) {
      console.error(`${RED}AXIOS ERROR${RESET}`);
      console.error(`${RED}STATUS:${RESET}`, error.response?.status);
      console.error(
        `${RED}DATA:${RESET}`,
        JSON.stringify(error.response?.data)
      );
      return null;
    }
  }
}
