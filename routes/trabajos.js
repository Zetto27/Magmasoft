const express = require("express");
const router = express.Router();

const connection = require("../Database/db");
const {
  notificarNuevaOrden,
  notificarCambioEstado,
} = require("../services/notificationService");
const { obtenerTrabajoCompleto } = require("../services/trabajoService");
router.post("/trabajos/asignar-operario", async (req, res) => {
  try {
    const { trabajo_id, operario_id } = req.body;

    const [operario] = await connection.promise().query(
      `
  SELECT user
  FROM users
  WHERE id = ?
  `,
      [operario_id],
    );
    // =========================
    // Actualizar operario
    // =========================

    await connection.promise().query(
      `
UPDATE trabajos
SET operario_actual_id = ?
WHERE id = ?
`,
      [operario_id, trabajo_id],
    );
    await connection.promise().query(
      `
  INSERT INTO historial_trabajos
  (
      trabajo_id,
      usuario_id,
      accion,
      detalle
  )
  VALUES (?, ?, ?, ?)
  `,
      [
        trabajo_id,
        req.session.user_id,
        "Operario asignado",
        `Se asignó el operario ${operario[0].user}`,
      ],
    );

    res.redirect("/trabajos");
  } catch (error) {
    console.error(error);

    res.status(500).send("Error al asignar el operario");
  }
});

router.get("/trabajos", (req, res) => {
  if (!req.session.loggedin) {
    return res.redirect("/login");
  }

  connection.query(
    `
    SELECT *
    FROM vista_trabajos_completa
    ORDER BY id DESC
    `,
    (error, trabajos) => {
      if (error) {
        console.log(error);
        return res.send("Error al cargar trabajos");
      }

      connection.query(
        `
SELECT
    u.id,
    u.user,
    u.rol_id,
    r.nombre AS rol
FROM users u
INNER JOIN roles r
    ON u.rol_id = r.id
WHERE u.rol_id IN (2,3)
ORDER BY u.user;
        `,
        (error, operarios) => {
          if (error) {
            console.log(error);
            return res.send("Error al cargar operarios");
          }

          connection.query(
            `
            SELECT *
            FROM opticas
            ORDER BY nombre
            `,
            (error, opticas) => {
              if (error) {
                console.log(error);
                return res.send("Error al cargar ópticas");
              }

              res.render("trabajos", {
                user: req.session.user,
                trabajos,
                operarios,
                opticas,
                trabajo: null,
                modo: "crear",
                page: "trabajos",
              });
            },
          );
        },
      );
    },
  );
});
module.exports = router;
//vistas

// editar orden de trabajo

router.get("/trabajos/edit/:id", (req, res) => {
  const id = req.params.id;

  connection.query(
    `
    SELECT *
    FROM trabajos
    WHERE id = ?
    `,
    [id],
    (error, trabajo) => {
      if (error) {
        console.log(error);
        return res.send("Error");
      }

      if (trabajo.length === 0) {
        return res.redirect("/trabajos");
      }

      connection.query(
        `
        SELECT *
        FROM opticas
        ORDER BY nombre
        `,
        (error, opticas) => {
          if (error) {
            console.log(error);
            return res.send("Error");
          }

          connection.query(
            `
SELECT
    u.id,
    u.user,
    u.rol_id,
    r.nombre AS rol
FROM users u
INNER JOIN roles r
    ON u.rol_id = r.id
WHERE u.rol_id IN (2,3)
ORDER BY u.user;
            `,
            (error, operarios) => {
              if (error) {
                console.log(error);
                return res.send("Error");
              }

              res.render("trabajo_edit", {
                user: req.session.user,
                page: "trabajos",
                trabajo: trabajo[0],
                opticas,
                operarios,
                modo: "editar",
              });
            },
          );
        },
      );
    },
  );
});

// elimiar orden de trabajo
router.get("/trabajos/delete/:id", (req, res) => {
  console.log("Eliminar trabajo:", req.params.id);
  const id = req.params.id;

  connection.query("DELETE FROM trabajos WHERE id = ?", [id], (error) => {
    if (error) {
      console.log(error);

      return res.send("Error al eliminar trabajo");
    }

    res.redirect("/trabajos");
  });
});

// crear
router.post("/trabajos/create", (req, res) => {
  const {
    cliente_nombre,
    cliente_documento,
    cliente_telefono,
    cliente_direccion,
    cliente_correo,
    optica_id,

    esfera_od,
    cilindro_od,
    eje_od,

    esfera_oi,
    cilindro_oi,
    eje_oi,

    adicion_val,
    dp,

    tipo_lente,
    material,
    color,
    tratamiento,

    fecha_estimada_entrega,

    observaciones,
  } = req.body;

  // Obtener el siguiente ID para generar el código
  connection.query(
    "SELECT IFNULL(MAX(id),0)+1 AS siguiente FROM trabajos",
    (error, resultado) => {
      if (error) {
        console.log(error);
        return res.send("Error al generar el código");
      }

      const codigo = "TR-" + String(resultado[0].siguiente).padStart(6, "0");
      connection.query(
        `
  INSERT INTO trabajos
  (
      codigo,
      cliente_nombre,
      cliente_documento,
      cliente_telefono,
      cliente_direccion,
      cliente_correo,
      optica_id,

      tipo_lente,
      tratamiento,
      color,
      material,

      esfera_od,
      esfera_oi,
      cilindro_od,
      cilindro_oi,

      eje_od,
      eje_oi,

      adicion_val,
      dp,

      observaciones,

      etapa_actual_id,
      estado,
      fecha_estimada_entrega
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
        [
          codigo,
          cliente_nombre,
          cliente_documento,
          cliente_telefono,
          cliente_direccion,
          cliente_correo,
          optica_id,

          tipo_lente,
          tratamiento,
          color,
          material,

          esfera_od,
          esfera_oi,
          cilindro_od,
          cilindro_oi,

          eje_od,
          eje_oi,

          adicion_val,
          dp,

          observaciones,

          1,
          "Pendiente",
          fecha_estimada_entrega || null,
        ],

        async (error, resultado) => {
          if (error) {
            console.log(error);
            return res.send(error.sqlMessage);
          }
          console.log("Usuario ID:", req.session.user_id);
          console.log("Usuario:", req.session.user);
          try {
            // =========================
            // Registrar primera etapa
            // =========================

            await connection.promise().query(
              `
    INSERT INTO historial_etapas
    (
        trabajo_id,
        etapa_id,
        usuario_id,
        fecha_inicio
    )
    VALUES (?, ?, ?, NOW())
    `,
              [resultado.insertId, 1, req.session.user_id],
            );

            // =========================
            // Registrar historial creación
            // =========================

            await connection.promise().query(
              `
    INSERT INTO historial_trabajos
    (
        trabajo_id,
        usuario_id,
        accion,
        detalle
    )
    VALUES (?, ?, ?, ?)
    `,
              [
                resultado.insertId,
                req.session.user_id,
                "Trabajo creado",
                `Se creó la orden ${codigo}`,
              ],
            );

            // =========================
            // Enviar correo al cliente
            // =========================

            const trabajo = await obtenerTrabajoCompleto(resultado.insertId);

            await notificarNuevaOrden(trabajo);

            console.log("✅ Correo enviado correctamente.");
          } catch (err) {
            console.log("Error al enviar el correo:");

            console.log(err);
          }

          res.redirect("/trabajos");
        },
      );
    },
  );
});
router.get("/trabajos/iniciar/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Consultar el estado actual
    const [trabajos] = await connection
      .promise()
      .query("SELECT estado FROM trabajos WHERE id = ?", [id]);

    if (trabajos.length === 0) {
      return res.status(404).send("Trabajo no encontrado");
    }

    if (trabajos[0].estado !== "Pendiente") {
      return res.redirect("/trabajos");
    }

    await connection.promise().query(
      `
      UPDATE trabajos
      SET
        estado = 'En proceso',
        fecha_inicio_produccion = NOW()
      WHERE id = ?
      `,
      [id],
    );
    await connection.promise().query(
      `
  INSERT INTO historial_trabajos
  (
      trabajo_id,
      usuario_id,
      accion,
      detalle
  )
  VALUES
  (?, ?, ?, ?)
  `,
      [
        id,
        req.session.user_id,
        "Producción iniciada",
        "El trabajo cambió de Pendiente a En proceso",
      ],
    );

    res.redirect("/trabajos");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al iniciar la producción");
  }
});
router.get("/trabajos/:id/historial", async (req, res) => {
  try {
    const { id } = req.params;

    const [historial] = await connection.promise().query(
      `
      SELECT
          h.id,
          h.accion,
          h.detalle,
          h.fecha,
          u.user AS usuario
      FROM historial_trabajos h
      INNER JOIN users u
          ON h.usuario_id = u.id
      WHERE h.trabajo_id = ?
      ORDER BY h.fecha DESC
      `,
      [id],
    );

    res.json(historial);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al consultar el historial",
    });
  }
});
// =========================
// Obtener comentarios
// =========================

router.get("/trabajos/:id/comentarios", async (req, res) => {
  try {
    const { id } = req.params;

    const [comentarios] = await connection.promise().query(
      `
      SELECT
          c.id,
          c.comentario,
          c.fecha,
          u.user AS usuario,
          e.nombre AS etapa
      FROM comentarios_trabajo c
      INNER JOIN users u
          ON c.usuario_id = u.id
      LEFT JOIN etapas_proceso e
          ON c.etapa_id = e.id
      WHERE c.trabajo_id = ?
      ORDER BY c.fecha DESC
      `,
      [id],
    );

    res.json(comentarios);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al consultar comentarios",
    });
  }
}); // =========================
// Obtener comentarios
// =========================

// =======================================
// Cambiar etapa del trabajo
// =======================================

router.post("/trabajos/cambiar-etapa", async (req, res) => {
  try {
    const { trabajo_id, etapa_actual, comentario } = req.body;

    // =========================
    // Validar si la orden ya fue finalizada
    // =========================

    if (Number(etapa_actual) >= 8) {
      return res.status(400).json({
        ok: false,
        mensaje: "La orden ya fue entregada y se encuentra finalizada.",
      });
    }

    const siguienteEtapa = Number(etapa_actual) + 1;

    // =========================
    // Guardar comentario
    // =========================

    if (comentario && comentario.trim() !== "") {
      await connection.promise().query(
        `
        INSERT INTO comentarios_trabajo
        (
            trabajo_id,
            usuario_id,
            etapa_id,
            comentario
        )
        VALUES (?, ?, ?, ?)
        `,
        [trabajo_id, req.session.user_id, etapa_actual, comentario],
      );
    }

    // =========================
    // Cerrar etapa anterior
    // =========================

    await connection.promise().query(
      `
      UPDATE historial_etapas
      SET fecha_fin = NOW()
      WHERE trabajo_id = ?
      AND fecha_fin IS NULL
      `,
      [trabajo_id],
    );

    // =========================
    // Registrar historial
    // =========================

    let nuevoEstado = "En proceso";

    if (siguienteEtapa === 8) {
      nuevoEstado = "Entregado";
    }

    await connection.promise().query(
      `
UPDATE trabajos
SET
    etapa_actual_id = ?,
    estado = ?
WHERE id = ?
`,
      [siguienteEtapa, nuevoEstado, trabajo_id],
    );
    // =========================
    // Guardar fecha de entrega real
    // =========================

    if (siguienteEtapa === 8) {
      await connection.promise().query(
        `
    UPDATE trabajos
    SET
        fecha_fin_produccion = NOW(),
        fecha_entrega_real = NOW(),
        fecha_entrega = NOW()
    WHERE id = ?
    `,
        [trabajo_id],
      );
    }
    const [etapa] = await connection.promise().query(
      `
SELECT nombre
FROM etapas_proceso
WHERE id = ?
`,
      [siguienteEtapa],
    );
    await connection.promise().query(
      `
INSERT INTO historial_trabajos
(
    trabajo_id,
    usuario_id,
    accion,
    detalle
)
VALUES (?, ?, ?, ?)
`,
      [
        trabajo_id,
        req.session.user_id,
        "Cambio de etapa",
        `El trabajo pasó a ${etapa[0].nombre}`,
      ],
    );
    // =========================
    // Crear nueva etapa
    // =========================

    if (siguienteEtapa <= 8) {
      await connection.promise().query(
        `
        INSERT INTO historial_etapas
        (
            trabajo_id,
            etapa_id,
            usuario_id
        )
        VALUES (?, ?, ?)
        `,
        [trabajo_id, siguienteEtapa, req.session.user_id],
      );
    }
    // =========================
    // Obtener información completa
    // =========================

    const [trabajoCorreo] = await connection.promise().query(
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
      [trabajo_id],
    );

    // =========================
    // Enviar correo
    // =========================

    // =========================
    // Enviar correo únicamente cuando el pedido esté listo
    // =========================

    if (siguienteEtapa === 7) {
      await notificarCambioEstado(trabajoCorreo[0]);
    }

    res.json({
      ok: true,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
    });
  }
});
// ======================================
// Devolver etapa
// ======================================

router.post("/trabajos/devolver-etapa", async (req, res) => {
  try {
    const { trabajo_id, etapa_actual, comentario } = req.body;

    const etapaAnterior = Number(etapa_actual) - 1;
    // =========================
    // Guardar comentario
    // =========================

    if (comentario && comentario.trim() !== "") {
      await connection.promise().query(
        `
    INSERT INTO comentarios_trabajo
    (
        trabajo_id,
        usuario_id,
        etapa_id,
        comentario
    )
    VALUES (?, ?, ?, ?)
    `,
        [trabajo_id, req.session.user_id, etapa_actual, comentario],
      );
    }

    console.log("Trabajo:", trabajo_id);

    console.log("Etapa actual:", etapa_actual);

    console.log("Etapa anterior:", etapaAnterior);

    console.log("Comentario:", comentario);
    // =========================
    // Actualizar trabajo
    // =========================

    await connection.promise().query(
      `
UPDATE trabajos
SET
    etapa_actual_id = ?,
    estado = 'En proceso'
WHERE id = ?
`,
      [etapaAnterior, trabajo_id],
    );
    // =========================
    // Cerrar etapa actual
    // =========================

    await connection.promise().query(
      `
UPDATE historial_etapas
SET fecha_fin = NOW()
WHERE trabajo_id = ?
AND etapa_id = ?
AND fecha_fin IS NULL
`,
      [trabajo_id, etapa_actual],
    );
    // =========================
    // Registrar historial
    // =========================

    const [etapaActualInfo] = await connection.promise().query(
      `
SELECT nombre
FROM etapas_proceso
WHERE id = ?
`,
      [etapa_actual],
    );

    const [etapaAnteriorInfo] = await connection.promise().query(
      `
SELECT nombre
FROM etapas_proceso
WHERE id = ?
`,
      [etapaAnterior],
    );

    await connection.promise().query(
      `
INSERT INTO historial_trabajos
(
    trabajo_id,
    usuario_id,
    accion,
    detalle
)
VALUES (?, ?, ?, ?)
`,
      [
        trabajo_id,
        req.session.user_id,
        "Trabajo devuelto",
        `El trabajo regresó de ${etapaActualInfo[0].nombre} a ${etapaAnteriorInfo[0].nombre}`,
      ],
    );
    // =========================
    // Reabrir etapa anterior
    // =========================

    await connection.promise().query(
      `
      INSERT INTO historial_etapas
      (
          trabajo_id,
          etapa_id,
          usuario_id,
          fecha_inicio
      )
      VALUES (?, ?, ?, NOW())
      `,
      [trabajo_id, etapaAnterior, req.session.user_id],
    );
    res.json({
      ok: true,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
    });
  }
});
// Ruta para crear orden de trabajo
router.post("/trabajos/update/:id", (req, res) => {
  const id = req.params.id;

  const {
    cliente_nombre,
    cliente_documento,
    cliente_telefono,
    cliente_direccion,
    cliente_correo,
    optica_id,

    esfera_od,
    cilindro_od,
    eje_od,

    esfera_oi,
    cilindro_oi,
    eje_oi,

    adicion_val,
    dp,

    tipo_lente,
    material,
    color,
    tratamiento,

    operario_actual_id,
    fecha_estimada_entrega,

    observaciones,
  } = req.body;

  connection.query(
    `
    UPDATE trabajos
    SET

      cliente_nombre = ?,
      cliente_documento = ?,
      cliente_telefono = ?,
      cliente_direccion = ?,
      cliente_correo = ?,
      optica_id = ?,

      esfera_od = ?,
      cilindro_od = ?,
      eje_od = ?,

      esfera_oi = ?,
      cilindro_oi = ?,
      eje_oi = ?,

      adicion_val = ?,
      dp = ?,

      tipo_lente = ?,
      material = ?,
      color = ?,
      tratamiento = ?,

      operario_actual_id = ?,
      fecha_estimada_entrega = ?,

      observaciones = ?

    WHERE id = ?
    `,
    [
      cliente_nombre,
      cliente_documento,
      cliente_telefono,
      cliente_direccion,
      cliente_correo,
      optica_id,

      esfera_od,
      cilindro_od,
      eje_od,

      esfera_oi,
      cilindro_oi,
      eje_oi,

      adicion_val,
      dp,

      tipo_lente,
      material,
      color,
      tratamiento,

      operario_actual_id,
      fecha_estimada_entrega,

      observaciones,

      id,
    ],

    (error) => {
      if (error) {
        console.log(error);
        return res.send("Error al actualizar el trabajo");
      }

      res.redirect("/trabajos");
    },
  );
});
