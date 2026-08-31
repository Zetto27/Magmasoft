/**
 * ============================================================
 * MAGMASOFT - Aplicación principal
 * ============================================================
 *
 * Archivo principal de configuración y ejecución del servidor
 * web de MagmaSoft.
 *
 * Tecnologías utilizadas:
 * - Node.js
 * - Express
 * - EJS
 * - MySQL
 * - Express Session
 * - Dotenv
 *
 * Responsabilidades principales:
 * - Configurar el servidor Express.
 * - Configurar el motor de vistas EJS.
 * - Configurar sesiones de usuario.
 * - Cargar variables de entorno.
 * - Establecer la conexión con la base de datos.
 * - Registrar las rutas principales del sistema.
 * - Gestionar el Dashboard.
 * - Gestionar los reportes.
 *
 * Este archivo hace parte del módulo principal de la aplicación
 * y se encuentra relacionado con los requerimientos funcionales
 * de autenticación, gestión de usuarios, gestión de trabajos,
 * seguimiento de órdenes y generación de reportes.
 * ============================================================
 */

// ============================================================
// 1. IMPORTACIÓN DE DEPENDENCIAS
// ============================================================

const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");

// ============================================================
// 3. CONFIGURACIÓN DE VARIABLES DE ENTORNO
// ============================================================

/**
 * Carga las variables de configuración almacenadas
 * en el archivo de entorno de la aplicación.
 */
dotenv.config({
  path: "./env/.env",
});

const connection = require("./Database/db");

// Rutas de la aplicación.
const authRoutes = require("./routes/auth");
const usuariosRoutes = require("./routes/usuarios");
const trabajosRoutes = require("./routes/trabajos");
const estadoRoutes = require("./routes/estado");

// ============================================================
// 2. CONFIGURACIÓN INICIAL DE EXPRESS
// ============================================================

const app = express();

// ============================================================
// 4. MIDDLEWARES PARA PROCESAMIENTO DE DATOS
// ============================================================

/**
 * Permite procesar información enviada mediante formularios HTML.
 */
app.use(express.urlencoded({ extended: false }));

/**
 * Permite procesar solicitudes que contienen información
 * en formato JSON.
 */
app.use(express.json());

// ============================================================
// 5. CONFIGURACIÓN DE ARCHIVOS ESTÁTICOS
// ============================================================

/**
 * Define la carpeta pública de recursos de la aplicación.
 *
 * Los archivos CSS, JavaScript, imágenes y demás recursos
 * ubicados en la carpeta "public" pueden ser utilizados
 * desde las vistas mediante la ruta /resources.
 */
app.use("/resources", express.static("public"));
app.use("/resources", express.static(__dirname + "/public"));

// ============================================================
// 6. CONFIGURACIÓN DEL MOTOR DE PLANTILLAS
// ============================================================

/**
 * EJS permite generar las vistas HTML de forma dinámica
 * utilizando información proveniente del servidor.
 */
app.set("view engine", "ejs");

// ============================================================
// 7. CONFIGURACIÓN DE SESIONES
// ============================================================

/**
 * Configura las sesiones utilizadas para mantener la información
 * del usuario autenticado durante la navegación por el sistema.
 *
 * La sesión permite almacenar datos como:
 * - Estado de autenticación.
 * - Identificador del usuario.
 * - Rol del usuario.
 * - Nombre de usuario.
 */
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  }),
);

// ============================================================
// 8. REGISTRO DE RUTAS
// ============================================================

/**
 * Rutas relacionadas con:
 * - Inicio de sesión.
 * - Registro.
 * - Cierre de sesión.
 */
app.use("/", authRoutes);

/**
 * Rutas relacionadas con la gestión de usuarios.
 */
app.use("/", usuariosRoutes);

/**
 * Rutas relacionadas con la gestión de trabajos u órdenes
 * de producción.
 */
app.use("/", trabajosRoutes);

/**
 * Rutas relacionadas con la consulta del estado de las órdenes,
 * generación de códigos QR y pruebas de notificaciones.
 */
app.use("/", estadoRoutes);

// ============================================================
// 9. FUNCIÓN PARA CONSULTAS A LA BASE DE DATOS
// ============================================================

/**
 * Ejecuta una consulta SQL utilizando la conexión MySQL
 * y devuelve una Promesa para facilitar el uso de async/await.
 *
 * @param {string} sql - Consulta SQL que será ejecutada.
 * @param {Array} params - Parámetros utilizados por la consulta.
 * @returns {Promise<Array>} Resultado de la consulta.
 */
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

// ============================================================
// 10. DASHBOARD PRINCIPAL
// ============================================================

/**
 * Muestra el Dashboard principal de MagmaSoft.
 *
 * El Dashboard presenta información consolidada sobre:
 * - Órdenes totales.
 * - Órdenes pendientes.
 * - Órdenes en producción.
 * - Órdenes entregadas.
 * - Órdenes por etapa.
 * - Órdenes por tipo de lente.
 * - Trabajos asignados por operario.
 * - Trabajos actualmente en producción.
 * - Próximas entregas.
 * - Actividad reciente.
 *
 * El contenido presentado depende del estado de autenticación
 * del usuario.
 */
app.get("/", async (req, res) => {
  // Verifica que el usuario haya iniciado sesión.
  if (!req.session.loggedin) {
    return res.render("index");
  }

  try {
    // ========================================================
    // 10.1 ÓRDENES TOTALES
    // ========================================================

    const [totalOrdenes] = await queryDB(`
      SELECT COUNT(*) AS total
      FROM trabajos
    `);

    // ========================================================
    // 10.2 ÓRDENES PENDIENTES
    // ========================================================

    const [ordenesPendientes] = await queryDB(`
      SELECT COUNT(*) AS total
      FROM trabajos
      WHERE estado = 'Pendiente'
    `);

    // ========================================================
    // 10.3 ÓRDENES EN PRODUCCIÓN
    // ========================================================

    const [ordenesProduccion] = await queryDB(`
      SELECT COUNT(*) AS total
      FROM trabajos
      WHERE estado = 'En proceso'
    `);

    // ========================================================
    // 10.4 ÓRDENES ENTREGADAS
    // ========================================================

    const [ordenesEntregadas] = await queryDB(`
      SELECT COUNT(*) AS total
      FROM trabajos
      WHERE estado = 'Entregado'
    `);

    // ========================================================
    // 10.5 ÓRDENES POR ETAPA
    // ========================================================

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

    // ========================================================
    // 10.6 ÓRDENES POR TIPO DE LENTE
    // ========================================================

    const ordenesPorLente = await queryDB(`
      SELECT
        tipo_lente,
        COUNT(*) AS cantidad
      FROM trabajos
      GROUP BY tipo_lente
      ORDER BY cantidad DESC
    `);

    // ========================================================
    // 10.7 TRABAJOS ASIGNADOS POR OPERARIO
    // ========================================================

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

    // ========================================================
    // 10.8 TRABAJOS ACTUALMENTE EN PRODUCCIÓN
    // ========================================================

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

    // ========================================================
    // 10.9 PRÓXIMAS ENTREGAS
    // ========================================================

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

    // ========================================================
    // 10.10 ACTIVIDAD RECIENTE
    // ========================================================

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

    // ========================================================
    // 10.11 ENVÍO DE INFORMACIÓN A LA VISTA
    // ========================================================

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

    return res.status(500).send("Error al cargar el Dashboard");
  }
});

// ============================================================
// 11. GESTIÓN DE USUARIOS
// ============================================================

/**
 * Consulta y muestra la información de los usuarios registrados.
 *
 * La información se obtiene mediante una consulta SQL que
 * relaciona la tabla users con la tabla roles.
 */
app.get("/users", (req, res) => {
  // Verifica que el usuario esté autenticado.
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
        console.error("Error al consultar usuarios:", error);

        return res.status(500).send("Error al consultar usuarios");
      }

      // Envía los usuarios consultados a la vista.
      return res.render("users", {
        user: req.session.user,
        usuarios: results,
        page: "users",
      });
    },
  );
});

// ============================================================
// 12. REPORTES
// ============================================================

/**
 * Genera los reportes de producción de MagmaSoft.
 *
 * Los datos mostrados dependen del rol del usuario:
 *
 * - Administrador:
 *   Puede consultar todas las órdenes y estadísticas.
 *
 * - Operario:
 *   Consulta únicamente las órdenes asociadas a su usuario.
 */
app.get("/reportes", async (req, res) => {
  // Verifica que el usuario esté autenticado.
  if (!req.session.loggedin) {
    return res.redirect("/login");
  }

  try {
    // ========================================================
    // 12.1 CONSULTAR USUARIO Y ROL
    // ========================================================

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

    // ========================================================
    // 12.2 REPORTE DE ÓRDENES
    // ========================================================

    let reporteOrdenes;

    if (usuario.rol === "Administrador") {
      // El administrador puede consultar todas las órdenes.
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
      // El operario solamente consulta sus órdenes asignadas.
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

    // ========================================================
    // 12.3 PRODUCCIÓN POR ETAPA
    // ========================================================

    let produccionPorEtapa;

    if (req.session.rol_id === 1) {
      // Administrador: consulta todas las órdenes.
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
      // Operario: consulta únicamente sus órdenes.
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

    // ========================================================
    // 12.4 ÓRDENES POR OPERARIO
    // ========================================================

    let trabajosPorOperario;

    if (req.session.rol_id === 1) {
      // Administrador: puede consultar todos los operarios.
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
      // Operario: solamente consulta sus propias órdenes.
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

    // ========================================================
    // 12.5 INDICADORES DE RENDIMIENTO
    // ========================================================

    let indicadoresRendimiento;

    if (usuario.rol === "Administrador") {
      // ------------------------------------------------------
      // Indicadores para administrador
      // ------------------------------------------------------

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
      // ------------------------------------------------------
      // Indicadores para operario
      // ------------------------------------------------------

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

    // ========================================================
    // 12.6 ENVÍO DE DATOS A LA VISTA
    // ========================================================

    return res.render("reportes", {
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

    return res.status(500).send("Error al cargar el Reporte");
  }
});

// ============================================================
// 13. MENSAJES
// ============================================================

/**
 * Muestra el módulo de mensajes.
 */
app.get("/mensajes", (req, res) => {
  if (!req.session.loggedin) {
    return res.redirect("/login");
  }

  return res.render("mensajes", {
    user: req.session.user,
    page: "mensajes",
  });
});

// ============================================================
// 14. CONFIGURACIÓN
// ============================================================

/**
 * Muestra el módulo de configuración del sistema.
 */
app.get("/configuracion", (req, res) => {
  if (!req.session.loggedin) {
    return res.redirect("/login");
  }

  return res.render("configuracion", {
    user: req.session.user,
    page: "configuracion",
  });
});

// ============================================================
// 15. INICIO DEL SERVIDOR
// ============================================================

/**
 * Inicia el servidor web de MagmaSoft en el puerto 3000.
 */
app.listen(3000, () => {
  console.log("Servidor MagmaSoft ejecutándose en http://localhost:3000");
});
