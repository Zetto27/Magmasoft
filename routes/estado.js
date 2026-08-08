const express = require("express");
const router = express.Router();
const connection = require("../Database/db");
const { generarQR } = require("../services/qrService");
const { enviarCorreoPrueba } = require("../services/emailService");

// ===============================
// Consultar estado de una orden
// ===============================

router.get("/estado/:codigo", async (req, res) => {
  const codigo = req.params.codigo;

  try {
    const db = connection.promise();

    // ===========================
    // Información de la orden
    // ===========================

    const [trabajos] = await db.query(
      `
      SELECT
          t.*,
          o.nombre AS optica,
          e.nombre AS etapa,
          e.orden_etapa,
          e.color
      FROM trabajos t
      INNER JOIN opticas o
          ON t.optica_id = o.id
      INNER JOIN etapas_proceso e
          ON t.etapa_actual_id = e.id
      WHERE t.codigo = ?
      `,
      [codigo],
    );

    if (trabajos.length === 0) {
      return res.status(404).send("La orden no existe.");
    }

    // ===========================
    // Todas las etapas
    // ===========================

    const [etapas] = await db.query(`
        SELECT *
        FROM etapas_proceso
        ORDER BY orden_etapa
    `);

    res.render("estado", {
      trabajo: trabajos[0],
      etapas,
    });
  } catch (error) {
    console.log(error);
    res.send("Error del servidor");
  }
});
// ======================================
// Prueba del código QR
// ======================================

router.get("/qr-test/:codigo", async (req, res) => {
  try {
    const qr = await generarQR(req.params.codigo);

    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Prueba QR</title>
        <style>
          body{
            font-family:Arial,sans-serif;
            text-align:center;
            padding:40px;
            background:#f5f7fb;
          }

          img{
            width:300px;
            height:300px;
          }

          h2{
            color:#2563eb;
          }
        </style>
      </head>
      <body>

        <h2>QR generado correctamente</h2>

        <p><strong>${req.params.codigo}</strong></p>

        <img src="${qr}" alt="Código QR">

      </body>
      </html>
    `);
  } catch (error) {
    console.log(error);
    res.send("Error generando QR");
  }
});
// ======================================
// Prueba de correo
// ======================================

router.get("/email-test", async (req, res) => {
  try {
    await enviarCorreoPrueba();

    res.send("✅ Correo enviado correctamente.");
  } catch (error) {
    console.log(error);
    res.send("❌ Error enviando el correo.");
  }
});
module.exports = router;
