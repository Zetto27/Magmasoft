const { generarQR } = require("./qrService");
const { enviarNuevaOrden, enviarCambioEstado } = require("./emailService");

// =========================
// Nueva orden
// =========================

async function notificarNuevaOrden(trabajo) {
  const qr = await generarQR(trabajo.codigo);
  await enviarNuevaOrden(trabajo, qr);
}

// =========================
// Cambio de etapa
// =========================

async function notificarCambioEstado(trabajo) {
  // Solo notificamos cuando el pedido está listo
  if (trabajo.etapa_actual_id !== 7) {
    return;
  }

  const qr = await generarQR(trabajo.codigo);

  await enviarCambioEstado(trabajo, qr);
}

module.exports = {
  notificarNuevaOrden,
  notificarCambioEstado,
};
