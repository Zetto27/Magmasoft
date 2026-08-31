const bcryptjs = require("bcryptjs");
const connection = require("../Database/db");

/**
 * Crea un nuevo usuario en la base de datos.
 *
 * Recibe los datos del formulario, encripta la contraseña
 * y almacena el nuevo usuario en la tabla users.
 */
const createUser = async (req, res) => {
  const { user, rol_id, document, email, celular, pass } = req.body;

  try {
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
          console.error("Error al crear usuario:", error);
          return res.redirect("/users");
        }

        res.redirect("/users");
      },
    );
  } catch (error) {
    console.error("Error al procesar la contraseña:", error);
    res.redirect("/users");
  }
};

/**
 * Actualiza los datos de un usuario existente.
 *
 * Si el campo de contraseña está vacío, conserva la contraseña actual.
 * Si se proporciona una nueva contraseña, esta se encripta antes de guardarla.
 */
const updateUser = async (req, res) => {
  const { id } = req.params;

  const { user, rol_id, document, email, celular, pass } = req.body;

  try {
    // Actualiza los datos sin modificar la contraseña.
    if (!pass || pass.trim() === "") {
      connection.query(
        `
        UPDATE users
        SET
          user = ?,
          rol_id = ?,
          document = ?,
          email = ?,
          celular = ?
        WHERE id = ?
        `,
        [user, rol_id, document, email, celular, id],
        (error) => {
          if (error) {
            console.error("Error al actualizar usuario:", error);
            return res.send("Error al actualizar");
          }

          res.redirect("/users");
        },
      );

      return;
    }

    // Encripta la nueva contraseña antes de actualizarla.
    const passwordHash = await bcryptjs.hash(pass, 8);

    connection.query(
      `
      UPDATE users
      SET
        user = ?,
        rol_id = ?,
        document = ?,
        email = ?,
        celular = ?,
        pass = ?
      WHERE id = ?
      `,
      [user, rol_id, document, email, celular, passwordHash, id],
      (error) => {
        if (error) {
          console.error("Error al actualizar usuario:", error);
          return res.send("Error al actualizar");
        }

        res.redirect("/users");
      },
    );
  } catch (error) {
    console.error("Error al procesar la actualización:", error);
    res.send("Error al actualizar usuario");
  }
};

/**
 * Elimina un usuario de la base de datos.
 *
 * Recibe el ID del usuario mediante los parámetros de la URL.
 */
const deleteUser = (req, res) => {
  const { id } = req.params;

  connection.query("DELETE FROM users WHERE id = ?", [id], (error) => {
    if (error) {
      console.error("Error al eliminar usuario:", error);
      return res.redirect("/users");
    }

    res.redirect("/users");
  });
};

module.exports = {
  createUser,
  updateUser,
  deleteUser,
};
