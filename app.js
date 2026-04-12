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
app.set("view engine", "ejs");

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
// 8 Invocamos a la conexion de la BD
const connection = require("./Database/db");
const e = require("express");

// 9 Rutas

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/index", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/registro", (req, res) => {
  res.render("register");
});

// 10 Ruta para registrar usuarios
app.post("/register", async (req, res) => {
  console.log(req.body);
  const user = req.body.user;
  const rol = req.body.rol;
  const document = req.body.document;
  const email = req.body.email;
  const celular = req.body.celular;
  const pass = req.body.pass;

  let passwordHash = await bcryptjs.hash(pass, 8);

  connection.query(
    "INSERT INTO users SET ?",
    {
      user,
      rol,
      document,
      email,
      celular,
      pass: passwordHash,
    },
    (error, results) => {
      if (error) {
        if (error.code === "ER_DUP_ENTRY") {
          return res.render("register", {
            alert: true,
            alertTitle: "Dato duplicado",
            alertMessage: "Ya existe un registro con ese correo, documento o celular.",
            alertIcon: "warning",
            showConfirmButton: true,
            timer: false,
            ruta: "/registro",
          });
        }

        return res.render("register", {
          alert: true,
          alertTitle: "Error",
          alertMessage: "Ocurrió un error al registrar",
          alertIcon: "error",
          showConfirmButton: true,
          timer: false,
          ruta: "/registro",
        });
      }

      return res.render("register", {
        alert: true,
        alertTitle: "Registro exitoso",
        alertMessage: "Usuario creado correctamente",
        alertIcon: "success",
        showConfirmButton: false,
        timer: 1500,
        ruta: "/login",
      });
    },
  );
});

// 11 Ruta para autenticar usuarios
app.post("/auth", async (req, res) => {
  const document = req.body.document;
  const pass = req.body.pass;

  if (document && pass) {
    connection.query("SELECT * FROM users WHERE document = ?", [document], async (error, results) => {
      if (error) {
        console.log(error);
        return res.send("Error del servidor");
      }

      if (results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))) {
        return res.render("login", {
          alert: true,
          alertTitle: "Error",
          alertMessage: "Usuario o contraseña incorrecta",
          alertIcon: "error",
          showConfirmButton: true,
          timer: false,
          ruta: "/login",
        });
      }

      req.session.rol = results[0].rol;

      return res.render("login", {
        alert: true,
        alertTitle: "Conexión exitosa",
        alertMessage: "¡Bienvenido " + results[0].user,
        alertIcon: "success",
        showConfirmButton: false,
        timer: 1500,
        ruta: "/index",
      });
    });
  } else {
    return res.send("Faltan datos");
  }
});

app.listen(3000, () => {
  console.log("Server is running in http://localhost:3000");
});
