const path = require('path');

const config = {
  database: {
    filename: path.join(__dirname, '../../../database.sqlite'),
    options: {
      verbose: console.log
    }
  }
};

module.exports = config;
