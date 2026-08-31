const express = require("express");

const router = express.Router();

const {
  showLogin,
  showRegister,
  registerUser,
  authenticateUser,
  logoutUser,
} = require("../controllers/authController");

/**
 * Muestra la página de inicio de sesión.
 */
router.get("/login", showLogin);

/**
 * Muestra el formulario de registro de usuarios.
 */
router.get("/registro", showRegister);

/**
 * Registra un nuevo usuario en el sistema.
 */
router.post("/register", registerUser);

/**
 * Autentica al usuario mediante documento y contraseña.
 */
router.post("/auth", authenticateUser);

/**
 * Cierra la sesión del usuario actual.
 */
router.get("/logout", logoutUser);

module.exports = router;
