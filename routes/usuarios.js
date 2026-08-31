const express = require("express");

const router = express.Router();

const {
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/usuariosController");

/**
 * Crea un nuevo usuario.
 */
router.post("/users/create", createUser);

/**
 * Actualiza la información de un usuario existente.
 */
router.post("/users/update/:id", updateUser);

/**
 * Elimina un usuario mediante su ID.
 */
router.get("/users/delete/:id", deleteUser);

module.exports = router;
