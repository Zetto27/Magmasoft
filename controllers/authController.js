const bcryptjs = require("bcryptjs");
const connection = require("../Database/db");

/**
 * Muestra la vista de inicio de sesión.
 *
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 */
const showLogin = (req, res) => {
  res.render("login");
};

/**
 * Muestra la vista de registro de usuarios.
 *
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 */
const showRegister = (req, res) => {
  res.render("register");
};

/**
 * Registra un nuevo usuario en la base de datos.
 *
 * La contraseña se cifra mediante bcrypt antes de almacenarla.
 *
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 */
const registerUser = async (req, res) => {
  const { user, rol_id, document, email, celular, pass } = req.body;

  try {
    // Cifra la contraseña antes de almacenarla en la base de datos.
    const passwordHash = await bcryptjs.hash(pass, 8);

    connection.query(
      "INSERT INTO users SET ?",
      {
        user,
        rol_id,
        document,
        email,
        celular,
        pass: passwordHash,
      },
      (error) => {
        if (error) {
          // Controla los registros duplicados de correo, documento o celular.
          if (error.code === "ER_DUP_ENTRY") {
            return res.render("register", {
              alert: true,
              alertTitle: "Dato duplicado",
              alertMessage:
                "Ya existe un registro con ese correo, documento o celular.",
              alertIcon: "warning",
              showConfirmButton: true,
              timer: false,
              ruta: "/registro",
            });
          }

          console.error("Error al registrar usuario:", error);

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

        // Muestra el mensaje de registro exitoso.
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
  } catch (error) {
    console.error("Error procesando el registro:", error);

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
};

/**
 * Autentica un usuario utilizando su documento y contraseña.
 *
 * Si las credenciales son correctas, se almacenan los datos
 * necesarios del usuario en la sesión.
 *
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 */
const authenticateUser = (req, res) => {
  const { document, pass } = req.body;

  // Verifica que se hayan enviado las credenciales.
  if (!document || !pass) {
    return res.send("Faltan datos");
  }

  connection.query(
    "SELECT * FROM users WHERE document = ?",
    [document],
    async (error, results) => {
      if (error) {
        console.error("Error al consultar usuario:", error);
        return res.send("Error del servidor");
      }

      // Verifica que exista el usuario y que la contraseña sea correcta.
      if (
        results.length === 0 ||
        !(await bcryptjs.compare(pass, results[0].pass))
      ) {
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

      // Guarda la información del usuario autenticado en la sesión.
      req.session.loggedin = true;
      req.session.user_id = results[0].id;
      req.session.rol_id = results[0].rol_id;
      req.session.user = results[0].user;

      return res.render("login", {
        alert: true,
        alertTitle: "Conexión exitosa",
        alertMessage: `¡Bienvenido ${results[0].user}!`,
        alertIcon: "success",
        showConfirmButton: false,
        timer: 1500,
        ruta: "",
      });
    },
  );
};

/**
 * Cierra la sesión del usuario actual y redirige al inicio.
 *
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 */
const logoutUser = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Error al cerrar sesión:", error);
      return res.redirect("/");
    }

    return res.redirect("/");
  });
};

module.exports = {
  showLogin,
  showRegister,
  registerUser,
  authenticateUser,
  logoutUser,
};
