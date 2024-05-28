const mysql = require('mysql');

const connection = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost', 
  user: 'root', 
  password: 'root', 
  database: 'bibliotech' 
});

connection.getConnection((err, connection) => {
  if(err) {
    console.error("Erreur lors de la connexin à la base de données MySQL : ", err);
    return;
  }
  console.log("Connecté à la base de données MySQL.");
})

module.exports = connection;