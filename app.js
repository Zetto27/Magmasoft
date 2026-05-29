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
        ruta: "/users",
      });
    },
  );
});
app.post("/users/create", async (req, res) => {
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
    (error) => {
      if (error) {
        console.log(error);
        return res.redirect("/users");
      }

      res.redirect("/users");
    },
  );
});
// Editar usuario creado
app.get("/users/edit/:id", (req, res) => {
  if (!req.session.loggedin) {
    return res.redirect("/login");
  }

  const id = req.params.id;

  connection.query("SELECT * FROM users WHERE id = ?", [id], (error, results) => {
    if (error) {
      console.log(error);
      return res.send("Error");
    }

    if (results.length === 0) {
      return res.redirect("/users");
    }

    res.render("edit-user", {
      usuario: results[0],
    });
  });
});

app.post("/users/update/:id", async (req, res) => {
  const id = req.params.id;

  const { user, rol, document, email, celular, pass } = req.body;

  try {
    // Si no escribieron contraseña
    if (!pass || pass.trim() === "") {
      connection.query(
        `
        UPDATE users
        SET
          user = ?,
          rol = ?,
          document = ?,
          email = ?,
          celular = ?
        WHERE id = ?
        `,
        [user, rol, document, email, celular, id],
        (error) => {
          if (error) {
            console.log(error);
            return res.send("Error al actualizar");
          }

          res.redirect("/users");
        },
      );
    } else {
      // Si escribieron nueva contraseña
      const passwordHash = await bcryptjs.hash(pass, 8);

      connection.query(
        `
        UPDATE users
        SET
          user = ?,
          rol = ?,
          document = ?,
          email = ?,
          celular = ?,
          pass = ?
        WHERE id = ?
        `,
        [user, rol, document, email, celular, passwordHash, id],
        (error) => {
          if (error) {
            console.log(error);
            return res.send("Error al actualizar");
          }

          res.redirect("/users");
        },
      );
    }
  } catch (error) {
    console.log(error);
    res.send("Error al actualizar usuario");
  }
});

// Elimiar usuario
app.get("/users/delete/:id", (req, res) => {
  const id = req.params.id;

  connection.query("DELETE FROM users WHERE id = ?", [id], (error) => {
    if (error) {
      console.log(error);

      return res.redirect("/users");
    }

    res.redirect("/users");
  });
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
          ruta: "/",
        });
      }
      req.session.loggedin = true;
      req.session.rol = results[0].rol;
      req.session.user = results[0].user;

      return res.render("login", {
        alert: true,
        alertTitle: "Conexión exitosa",
        alertMessage: "¡Bienvenido " + results[0].user,
        alertIcon: "success",
        showConfirmButton: false,
        timer: 1500,
        ruta: "",
      });
    });
  } else {
    return res.send("Faltan datos");
  }
});

// 12 Ruta para cerrar sesión
app.get("/", (req, res) => {
  if (req.session.loggedin) {
    res.render("index", {
      login: true,
      rol: req.session.rol,
      user: req.session.user,
    });
  } else {
    res.render("index", {
      login: false,
      message: "Debe iniciar sesión para acceder",
    });
  }
});
// 13 Iniciamos el servidor
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// RUTA ESPRES

app.get("/users", (req, res) => {
  if (!req.session.loggedin) {
    return res.redirect("/login");
  }

  connection.query("SELECT id,user,rol,document,email,celular FROM users ORDER BY id DESC", (error, results) => {
    if (error) {
      console.log(error);
      return res.send("Error al consultar usuarios");
    }

    res.render("users", {
      user: req.session.user,
      page: "users",
      usuarios: results,
    });
  });
});

app.get("/trabajos", (req, res) => {
  if (!req.session.loggedin) return res.redirect("/login");

  res.render("trabajos", {
    user: req.session.user,
    page: "trabajos",
  });
});

app.get("/reportes", (req, res) => {
  if (!req.session.loggedin) return res.redirect("/login");

  res.render("reportes", {
    user: req.session.user,
    page: "reportes",
  });
});

app.get("/mensajes", (req, res) => {
  if (!req.session.loggedin) return res.redirect("/login");

  res.render("mensajes", {
    user: req.session.user,
    page: "mensajes",
  });
});

app.get("/configuracion", (req, res) => {
  if (!req.session.loggedin) return res.redirect("/login");

  res.render("configuracion", {
    user: req.session.user,
    page: "configuracion",
  });
});

app.listen(3000, () => {
  console.log("Server is running in http://localhost:3000");
});
