const mysql = require('mysql2/promise');
const constants = require('./constants');

module.exports = {
  query: async (query) => {
    const connection = await mysql.createConnection(constants.db);
    const [rows] = await connection.execute(query);
    return rows;
  }
};
