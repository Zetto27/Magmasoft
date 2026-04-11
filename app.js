// 1 Invocamos Exprress
const express = require("express");
const app = express();

// 2 Seteamos urlencoded y json para que el servidor pueda interpretar los datos que le llegan
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 3 Invocamos a dotenv para cargar las variables de entorno
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("Server is running in http://localhost:3000");
});
