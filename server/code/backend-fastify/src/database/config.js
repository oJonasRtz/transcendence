import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  database: {
    filename: path.join(__dirname, '../../../database.sqlite'),
    options: {
      verbose: console.log
    }
  }
};

export default config;
