const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

// ======================================
// Generar QR y guardarlo como PNG
// ======================================

async function generarQR(codigo) {
  const url = `${process.env.APP_URL}/estado/${codigo}`;

  const carpetaQR = path.join(__dirname, "../public/qr");

  if (!fs.existsSync(carpetaQR)) {
    fs.mkdirSync(carpetaQR, { recursive: true });
  }

  const rutaArchivo = path.join(carpetaQR, `${codigo}.png`);

  await QRCode.toFile(rutaArchivo, url, {
    errorCorrectionLevel: "H",
    width: 350,
    margin: 2,
  });

  return rutaArchivo;
}

module.exports = {
  generarQR,
};
