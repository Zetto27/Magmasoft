const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((error) => {
  if (error) {
    console.log("Error al conectar a la base de datos:", error);
    return;
  }

  console.log("Conexión a la base de datos establecida");
});

module.exports = connection;
