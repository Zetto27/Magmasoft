const connection = require("../Database/db");

// ======================================
// Obtener toda la información de una orden
// ======================================

async function obtenerTrabajoCompleto(idTrabajo) {
  const db = connection.promise();

  const [rows] = await db.query(
    `
    SELECT
        t.*,
        o.nombre AS optica,
        e.nombre AS etapa
    FROM trabajos t
    INNER JOIN opticas o
        ON t.optica_id = o.id
    INNER JOIN etapas_proceso e
        ON t.etapa_actual_id = e.id
    WHERE t.id = ?
    `,
    [idTrabajo],
  );

  if (rows.length === 0) {
    throw new Error("No se encontró el trabajo.");
  }

  return rows[0];
}

module.exports = {
  obtenerTrabajoCompleto,
};
