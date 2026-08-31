// 1 Invocamos Exprress
const express = require("express");
const app = express();

// 2 Seteamos urlencoded y json para que el servidor pueda interpretar los datos que le llegan
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 3 Invocamos a dotenv para cargar las variables de entorno
const dotenv = require("dotenv");
dotenv.config({ path: "./env/.env" });

// 4 Dirección de la carpeta pública
app.use("/resources", express.static("public"));
app.use("/resources", express.static(__dirname + "/public"));

// 5 Motor de plantillas
app.set("view engine", "ejs");

// 7 var de sesiones
const session = require("express-session");
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  }),
);
// 8 Invocamos a la conexion de la BD
const connection = require("./Database/db");
const authRoutes = require("./routes/auth");
const usuariosRoutes = require("./routes/usuarios");
const trabajosRoutes = require("./routes/trabajos");
const estadoRoutes = require("./routes/estado");

// Rutas de autenticación
app.use("/", authRoutes);

// Rutas para la gestión de usuarios
app.use("/", usuariosRoutes);

// ==========================================
// FUNCIÓN PARA CONSULTAS A LA BASE DE DATOS
// ==========================================

function queryDB(sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

// ==========================================
// DASHBOARD
// ==========================================

app.get("/", async (req, res) => {
  if (!req.session.loggedin) {
    return res.render("index");
  }

  try {
    // ==========================================
    // 1. ÓRDENES TOTALES
    // ==========================================

    const [totalOrdenes] = await queryDB(`
      SELECT COUNT(*) AS total
      FROM trabajos
    `);

    // ==========================================
    // 2. ÓRDENES PENDIENTES
    // ==========================================

    const [ordenesPendientes] = await queryDB(`
      SELECT COUNT(*) AS total
      FROM trabajos
      WHERE estado = 'Pendiente'
    `);

    // ==========================================
    // 3. ÓRDENES EN PRODUCCIÓN
    // ==========================================

    const [ordenesProduccion] = await queryDB(`
      SELECT COUNT(*) AS total
      FROM trabajos
      WHERE estado = 'En proceso'
    `);

    // ==========================================
    // 4. ÓRDENES ENTREGADAS
    // ==========================================

    const [ordenesEntregadas] = await queryDB(`
      SELECT COUNT(*) AS total
      FROM trabajos
      WHERE estado = 'Entregado'
    `);

    // ==========================================
    // 5. ÓRDENES POR ETAPA
    // ==========================================

    const ordenesPorEtapa = await queryDB(`
      SELECT
        ep.nombre AS etapa,
        COUNT(t.id) AS cantidad
      FROM etapas_proceso ep
      LEFT JOIN trabajos t
        ON t.etapa_actual_id = ep.id
      GROUP BY
        ep.id,
        ep.nombre,
        ep.orden_etapa
      ORDER BY ep.orden_etapa
    `);

    // ==========================================
    // 6. ÓRDENES POR TIPO DE LENTE
    // ==========================================

    const ordenesPorLente = await queryDB(`
      SELECT
        tipo_lente,
        COUNT(*) AS cantidad
      FROM trabajos
      GROUP BY tipo_lente
      ORDER BY cantidad DESC
    `);
    // ==========================================
    // 7. TRABAJOS ASIGNADOS POR OPERARIO
    // ==========================================

    const trabajosPorOperario = await queryDB(`
        SELECT
          COALESCE(u.user, 'Sin asignar') AS operario,
          COUNT(t.id) AS cantidad
        FROM trabajos t
        LEFT JOIN users u
          ON t.operario_actual_id = u.id
        GROUP BY
          t.operario_actual_id,
          u.user
        ORDER BY cantidad DESC
      `);

    // ==========================================
    // 7. ÓRDENES EN PRODUCCIÓN
    // ==========================================

    const trabajosProduccion = await queryDB(`
      SELECT
        id,
        codigo,
        cliente_nombre,
        tipo_lente,
        etapa_actual,
        operario_nombre,
        fecha_estimada_entrega
      FROM vista_trabajos_completa
      WHERE estado = 'En proceso'
      ORDER BY fecha_creacion DESC
      LIMIT 5
    `);

    // ==========================================
    // 8. PRÓXIMAS ENTREGAS
    // ==========================================

    const proximasEntregas = await queryDB(`
      SELECT
        id,
        codigo,
        cliente_nombre,
        tipo_lente,
        fecha_estimada_entrega
      FROM vista_trabajos_completa
      WHERE fecha_estimada_entrega IS NOT NULL
        AND estado <> 'Entregado'
      ORDER BY fecha_estimada_entrega ASC
      LIMIT 5
    `);
    // ==========================================
    // 9. ACTIVIDAD RECIENTE
    // ==========================================

    const actividadReciente = await queryDB(`
      SELECT
        he.id,
        he.fecha_inicio,
        he.fecha_fin,
        ep.nombre AS etapa,
        u.user AS usuario,
        t.codigo,
        he.observacion
      FROM historial_etapas he
      LEFT JOIN etapas_proceso ep
        ON he.etapa_id = ep.id
      LEFT JOIN users u
        ON he.usuario_id = u.id
      LEFT JOIN trabajos t
        ON he.trabajo_id = t.id
      ORDER BY he.fecha_inicio DESC
      LIMIT 8
    `);
    // ==========================================
    // ENVIAR TODO AL DASHBOARD
    // ==========================================

    res.render("dashboard", {
      user: req.session.user,
      rol_id: req.session.rol_id,
      page: "dashboard",

      dashboard: {
        totalOrdenes: totalOrdenes.total,
        ordenesPendientes: ordenesPendientes.total,
        ordenesProduccion: ordenesProduccion.total,
        ordenesEntregadas: ordenesEntregadas.total,

        ordenesPorEtapa,
        ordenesPorLente,
        trabajosPorOperario,
        trabajosProduccion,
        proximasEntregas,
        actividadReciente,
      },
    });
  } catch (error) {
    console.error("Error cargando Dashboard:", error);

    res.status(500).send("Error al cargar el Dashboard");
  }
});

// RUTA ESPRES

app.get("/users", (req, res) => {
  if (!req.session.loggedin) {
    return res.redirect("/login");
  }

  connection.query(
    `
    SELECT
        u.id,
        u.user,
        u.rol_id,
        r.nombre AS rol,
        u.document,
        u.email,
        u.celular
    FROM users u
    INNER JOIN roles r
        ON u.rol_id = r.id
    ORDER BY u.id DESC
    `,
    (error, results) => {
      if (error) {
        console.log(error);
        return res.send("Error al consultar usuarios");
      }

      res.render("users", {
        user: req.session.user,
        usuarios: results,
        page: "users",
      });
    },
  );
});

app.get("/reportes", async (req, res) => {
  if (!req.session.loggedin) {
    return res.redirect("/login");
  }

  try {
    const [usuario] = await queryDB(
      `
      SELECT
        u.id,
        u.user,
        u.rol_id,
        r.nombre AS rol
      FROM users u
      INNER JOIN roles r
        ON u.rol_id = r.id
      WHERE u.id = ?
    `,
      [req.session.user_id],
    );

    let reporteOrdenes;

    if (usuario.rol === "Administrador") {
      reporteOrdenes = await queryDB(`
    SELECT
      t.id,
      t.codigo,
      t.cliente_nombre,
      t.tipo_lente,
      t.estado,
      ep.nombre AS etapa_actual,
      u.user AS operario,
      t.fecha_creacion,
      t.fecha_estimada_entrega
    FROM trabajos t

    LEFT JOIN etapas_proceso ep
      ON t.etapa_actual_id = ep.id

    LEFT JOIN users u
      ON t.operario_actual_id = u.id

    ORDER BY t.fecha_creacion DESC
  `);
    } else {
      reporteOrdenes = await queryDB(
        `
    SELECT
      t.id,
      t.codigo,
      t.cliente_nombre,
      t.tipo_lente,
      t.estado,
      ep.nombre AS etapa_actual,
      u.user AS operario,
      t.fecha_creacion,
      t.fecha_estimada_entrega
    FROM trabajos t

    LEFT JOIN etapas_proceso ep
      ON t.etapa_actual_id = ep.id

    LEFT JOIN users u
      ON t.operario_actual_id = u.id

    WHERE t.operario_actual_id = ?

    ORDER BY t.fecha_creacion DESC
  `,
        [req.session.user_id],
      );
    }

    // ==========================================
    // PRODUCCIÓN POR ETAPA
    // ==========================================

    let produccionPorEtapa;

    if (req.session.rol_id == 1) {
      // Administrador: todas las órdenes
      produccionPorEtapa = await queryDB(`
    SELECT
      ep.nombre AS etapa,
      COUNT(t.id) AS cantidad
    FROM etapas_proceso ep
    LEFT JOIN trabajos t
      ON t.etapa_actual_id = ep.id
    GROUP BY
      ep.id,
      ep.nombre,
      ep.orden_etapa
    ORDER BY ep.orden_etapa
  `);
    } else {
      // Operario: solamente sus órdenes
      produccionPorEtapa = await queryDB(
        `
    SELECT
      ep.nombre AS etapa,
      COUNT(t.id) AS cantidad
    FROM etapas_proceso ep
    LEFT JOIN trabajos t
      ON t.etapa_actual_id = ep.id
      AND t.operario_actual_id = ?
    GROUP BY
      ep.id,
      ep.nombre,
      ep.orden_etapa
    ORDER BY ep.orden_etapa
  `,
        [req.session.user_id],
      );
    }

    // ==========================================
    // ÓRDENES POR OPERARIO
    // ==========================================

    let trabajosPorOperario;

    if (req.session.rol_id == 1) {
      // Administrador: puede ver todos los operarios
      trabajosPorOperario = await queryDB(`
    SELECT
      COALESCE(u.user, 'Sin asignar') AS operario,
      COUNT(t.id) AS cantidad
    FROM trabajos t
    LEFT JOIN users u
      ON t.operario_actual_id = u.id
    GROUP BY
      t.operario_actual_id,
      u.user
    ORDER BY cantidad DESC
  `);
    } else {
      // Operario: solamente sus propias órdenes
      trabajosPorOperario = await queryDB(
        `
    SELECT
      COALESCE(u.user, 'Sin asignar') AS operario,
      COUNT(t.id) AS cantidad
    FROM trabajos t
    LEFT JOIN users u
      ON t.operario_actual_id = u.id
    WHERE t.operario_actual_id = ?
    GROUP BY
      t.operario_actual_id,
      u.user
    ORDER BY cantidad DESC
  `,
        [req.session.user_id],
      );
    }
    // ==========================================
    // INDICADORES DE RENDIMIENTO
    // ==========================================

    let indicadoresRendimiento;

    if (usuario.rol === "Administrador") {
      // ========================================
      // ADMINISTRADOR
      // ========================================

      const [totalOrdenes] = await queryDB(`
    SELECT COUNT(*) AS total
    FROM trabajos
  `);

      const [ordenesEntregadas] = await queryDB(`
    SELECT COUNT(*) AS total
    FROM trabajos
    WHERE estado = 'Entregado'
  `);

      const [ordenesProduccion] = await queryDB(`
    SELECT COUNT(*) AS total
    FROM trabajos
    WHERE estado = 'En proceso'
  `);

      const [ordenesPendientes] = await queryDB(`
    SELECT COUNT(*) AS total
    FROM trabajos
    WHERE estado = 'Pendiente'
  `);

      indicadoresRendimiento = {
        total: totalOrdenes.total,
        entregadas: ordenesEntregadas.total,
        produccion: ordenesProduccion.total,
        pendientes: ordenesPendientes.total,
      };
    } else {
      // ========================================
      // OPERARIO
      // ========================================

      const [totalOrdenes] = await queryDB(
        `
    SELECT COUNT(*) AS total
    FROM trabajos
    WHERE operario_actual_id = ?
    `,
        [usuario.id],
      );

      const [ordenesEntregadas] = await queryDB(
        `
    SELECT COUNT(*) AS total
    FROM trabajos
    WHERE operario_actual_id = ?
      AND estado = 'Entregado'
    `,
        [usuario.id],
      );

      const [ordenesProduccion] = await queryDB(
        `
    SELECT COUNT(*) AS total
    FROM trabajos
    WHERE operario_actual_id = ?
      AND estado = 'En proceso'
    `,
        [usuario.id],
      );

      const [ordenesPendientes] = await queryDB(
        `
    SELECT COUNT(*) AS total
    FROM trabajos
    WHERE operario_actual_id = ?
      AND estado = 'Pendiente'
    `,
        [usuario.id],
      );

      indicadoresRendimiento = {
        total: totalOrdenes.total,
        entregadas: ordenesEntregadas.total,
        produccion: ordenesProduccion.total,
        pendientes: ordenesPendientes.total,
      };
    }

    res.render("reportes", {
      user: req.session.user,
      rol_id: usuario.rol_id,
      rol: usuario.rol,
      page: "reportes",
      reporteOrdenes,
      produccionPorEtapa,
      trabajosPorOperario,
      indicadoresRendimiento,
    });
  } catch (error) {
    console.error("Error cargando Reportes:", error);
    res.status(500).send("Error al cargar Reportes");
  }
});

app.get("/mensajes", (req, res) => {
  if (!req.session.loggedin) return res.redirect("/login");

  res.render("mensajes", {
    user: req.session.user,
    page: "mensajes",
  });
});

app.get("/configuracion", (req, res) => {
  if (!req.session.loggedin) return res.redirect("/login");

  res.render("configuracion", {
    user: req.session.user,
    page: "configuracion",
  });
});

app.use("/", trabajosRoutes);
app.use("/", estadoRoutes);

app.listen(3000, () => {
  console.log("Server is running in http://localhost:3000");
});
