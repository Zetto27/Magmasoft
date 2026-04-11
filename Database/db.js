const mysql = require("mysql");
const connection = mysql.createConnection({
    hots: process.env.DB_HOTST,
    user: process.env.DB_USER,
    password: process.env.PASSWORD,
    database: process.env.DB_NAME,
});

connection.connect(('error')=>{
    if(error) {
        console.log('Error al conectar a la base de datos: ',+error);
        return;
    }
    console.log('Conexión a la base de datos establecida');
});

module.exports = connection;

