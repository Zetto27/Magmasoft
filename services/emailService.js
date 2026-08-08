const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ======================================
// Enviar correo de nueva orden
// ======================================

async function enviarNuevaOrden(trabajo, qr) {
  const url = `${process.env.APP_URL}/estado/${trabajo.codigo}`;

  const rutaPlantilla = path.resolve(
    __dirname,
    "../views/emails/nuevaOrden.ejs",
  );
  const fechaEntrega = trabajo.fecha_estimada_entrega
    ? new Date(trabajo.fecha_estimada_entrega).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Por definir";
  try {
    const html = await ejs.renderFile(rutaPlantilla, {
      trabajo,
      qr,
      url,
      fechaEntrega,
    });

    await transporter.sendMail({
      from: `"MagmaSoft" <${process.env.EMAIL_USER}>`,
      to: trabajo.cliente_correo,
      subject: `MagmaSoft | Orden ${trabajo.codigo}`,
      html,

      attachments: [
        {
          filename: `${trabajo.codigo}.png`,
          path: qr,
          cid: "codigoQR",
        },
      ],
    });
    try {
      fs.unlinkSync(qr);
    } catch (err) {
      console.warn("No se pudo eliminar el QR:", err.message);
    }
  } catch (error) {
    console.error("Error al enviar el correo:");
    console.error(error);
    throw error;
  }
}

// ======================================
// Enviar correo cambio de estado
// ======================================

async function enviarCambioEstado(trabajo, qr) {
  const url = `${process.env.APP_URL}/estado/${trabajo.codigo}`;

  let fechaEntrega = "Pendiente de asignar";

  if (trabajo.fecha_estimada_entrega) {
    fechaEntrega = new Date(trabajo.fecha_estimada_entrega).toLocaleDateString(
      "es-CO",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
    );
  }
  const mensaje =
    "🎉 ¡Buenas noticias! Su pedido ya se encuentra listo para ser entregado en la óptica seleccionada.";
  const asunto = `🎉 ¡Su pedido ${trabajo.codigo} está listo para entrega!`;
  const plantilla = "pedidoListo.ejs";

  const html = await ejs.renderFile(
    path.join(__dirname, `../views/emails/${plantilla}`),
    {
      trabajo,
      url,
      fechaEntrega,
      mensaje,
    },
  );
  await transporter.sendMail({
    from: `"MagmaSoft" <${process.env.EMAIL_USER}>`,
    to: trabajo.cliente_correo,
    subject: asunto,
    html,

    attachments: [
      {
        filename: `${trabajo.codigo}.png`,
        path: qr,
        cid: "codigoQR",
      },
    ],
  });
  try {
    fs.unlinkSync(qr);
  } catch (err) {
    console.log("No se pudo eliminar el QR:", err.message);
  }
}

module.exports = {
  enviarNuevaOrden,
  enviarCambioEstado,
};
