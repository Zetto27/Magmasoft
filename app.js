// 1 Invocamos Exprress
const express = require("express");
const app = express();

// 2 Seteamos urlencoded y json para que el servidor pueda interpretar los datos que le llegan
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 3 Invocamos a dotenv para cargar las variables de entorno
const dotenv = require("dotenv");
dotenv.config({ path: "./env/.env" });

// 4 Dirección de la carpeta pública
app.use("/resources", express.static("public"));
app.use("/resources", express.static(__dirname + "/public"));

// 5 Motor de plantillas
coapp.set("view engine", "ejs");

// 6 invocamos a bcryptjs para encriptar las contraseñas
const bcryptjs = require("bcryptjs");

// 7 var de sesiones
const session = require("express-session");
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  }),
);

console.log(__dirname);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("Server is running in http://localhost:3000");
});
