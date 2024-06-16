const mysql = require('mysql');

const connection = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'bibliotech'
});

connection.getConnection((err, connection) => {
  if(err) {
    console.error("Erreur lors de la connexin à la base de données MySQL : ", err);
    return;
  }
  console.log("Connecté à la base de données MySQL.");
})

module.exports = connection;