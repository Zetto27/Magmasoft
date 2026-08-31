const mysql = require("mysql2");

/**
 * Configuración de conexión con la base de datos MySQL.
 *
 * Las credenciales se obtienen mediante variables de entorno
 * para evitar almacenarlas directamente en el código fuente.
 */
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.PASSWORD,
  database: process.env.DB_NAME,
});

/**
 * Establece la conexión inicial con MySQL y muestra
 * información en consola para facilitar la detección de errores.
 */
connection.connect((error) => {
  if (error) {
    console.error("Error al conectar a la base de datos:", error);
    return;
  }

  console.log("Conexión a la base de datos establecida correctamente.");
});

module.exports = connection;
