console.log("trabajos.js cargado");

// =======================================
// Flujo de producción
// =======================================

const flujoProduccion = {
  1: {
    siguiente: 2,
    textoBoton: "Iniciar Tallado",
  },

  2: {
    siguiente: 3,
    textoBoton: "Iniciar Tratamiento",
  },

  3: {
    siguiente: 4,
    textoBoton: "Iniciar Pulido",
  },

  4: {
    siguiente: 5,
    textoBoton: "Iniciar Control de Calidad",
  },

  5: {
    siguiente: 6,
    textoBoton: "Iniciar Ensamble",
  },

  6: {
    siguiente: 7,
    textoBoton: "Marcar como listo para entrega",
  },

  7: {
    siguiente: 8,
    textoBoton: "Confirmar entrega al cliente",
  },

  8: {
    siguiente: null,
    textoBoton: "Orden finalizada",
  },
};

// Función para filtrar los trabajos en la tabla
const buscadorTrabajo = document.getElementById("buscarTrabajo");

buscadorTrabajo.addEventListener("keyup", function () {
  const texto = this.value.toLowerCase();

  const filas = document.querySelectorAll("tbody .fila-trabajo");

  let encontrados = 0;

  filas.forEach((fila) => {
    const contenido = fila.textContent.toLowerCase();

    if (contenido.includes(texto)) {
      fila.style.display = "";
      encontrados++;
    } else {
      fila.style.display = "none";
    }
  });

  const mensaje = document.getElementById("sinTrabajos");

  if (encontrados === 0) {
    mensaje.style.display = "";
  } else {
    mensaje.style.display = "none";
  }
});

// Función para seleccionar un trabajo y mostrar sus detalles
let trabajoSeleccionado = null;
function seleccionarTrabajo(fila) {
  document
    .querySelectorAll(".fila-trabajo")
    .forEach((f) => f.classList.remove("fila-seleccionada"));

  fila.classList.add("fila-seleccionada");

  trabajoSeleccionado = fila.dataset;
  // Guardar la última orden seleccionada
  localStorage.setItem("trabajoSeleccionado", fila.dataset.id);

  actualizarPanelMaestro(fila);
  cargarHistorial(fila.dataset.id);
  cargarComentarios(fila.dataset.id);
}

// actualizar el panel maestro con los detalles del trabajo seleccionado

function actualizarPanelMaestro(fila) {
  document.getElementById("pmCodigo").textContent = fila.dataset.codigo;

  document.getElementById("btnEditarTrabajo").href =
    "/trabajos/edit/" + fila.dataset.id;
  document.getElementById("pmCliente").textContent = fila.dataset.cliente;
  document.getElementById("pmNombre").textContent = fila.dataset.cliente;
  document.getElementById("pmDocumento").textContent = fila.dataset.documento;
  document.getElementById("pmDireccion").textContent = fila.dataset.direccion;
  document.getElementById("pmCorreo").textContent = fila.dataset.correo;
  document.getElementById("pmTelefono").textContent = fila.dataset.telefono;
  document.getElementById("pmOperario").textContent = fila.dataset.operario;
  document.getElementById("pmEstado").textContent = fila.dataset.estado;
  document.getElementById("pmEstadoProduccion").textContent =
    fila.dataset.estado;
  const entrega = document.getElementById("pmEntrega");

  if (fila.dataset.entrega) {
    entrega.textContent = new Date(fila.dataset.entrega).toLocaleDateString(
      "es-CO",
    );
  } else {
    entrega.textContent = "--";
  }

  document.getElementById("pmObservaciones").textContent =
    fila.dataset.observaciones || "Sin observaciones";

  document.getElementById("pmOD").textContent =
    `${fila.dataset.esferaod} / ${fila.dataset.cilindrood} / ${fila.dataset.ejeod}`;

  document.getElementById("pmOI").textContent =
    `${fila.dataset.esferaoi} / ${fila.dataset.cilindrooi} / ${fila.dataset.ejeoi}`;

  document.getElementById("pmDP").textContent = fila.dataset.dp;
  document.getElementById("pmLente").textContent = fila.dataset.tipo;
  document.getElementById("pmTratamiento").textContent =
    fila.dataset.tratamiento;
  document.getElementById("pmColor").textContent = fila.dataset.color;
  document.getElementById("pmMaterial").textContent = fila.dataset.material;
  // ===============================
  // Actualizar botón de producción
  // ===============================

  const etapaId = Number(fila.dataset.etapaId);

  const btnProduccion = document.getElementById("btnCambioEtapa");
  if (btnProduccion && flujoProduccion[etapaId]) {
    btnProduccion.innerHTML = `
        <i class="fas fa-play"></i>
        ${flujoProduccion[etapaId].textoBoton}
    `;

    if (etapaId === 8) {
      btnProduccion.disabled = true;

      btnProduccion.classList.add("btn-disabled");
    } else {
      btnProduccion.disabled = false;

      btnProduccion.classList.remove("btn-disabled");
    }
  }
  actualizarTimeline(etapaId);
}

// =======================================
// Actualizar Timeline
// =======================================

// =======================================
// Actualizar Timeline
// =======================================

function actualizarTimeline(etapaActual) {
  const totalEtapas = 8; // Total de etapas en el flujo de producción

  // Reiniciar todas las etapas
  for (let i = 1; i <= totalEtapas; i++) {
    const step = document.getElementById("step" + i);

    if (!step) continue;

    step.classList.remove("done");
    step.classList.remove("active");
  }

  // Pintar etapas
  for (let i = 1; i <= totalEtapas; i++) {
    const step = document.getElementById("step" + i);

    if (!step) continue;

    if (i < etapaActual) {
      step.classList.add("done");
    } else if (i === etapaActual) {
      step.classList.add("active");
    }
  }

  // ==========================
  // Barra de progreso
  // ==========================

  const porcentaje = ((etapaActual - 1) / (totalEtapas - 1)) * 100;

  document.getElementById("barraProduccion").style.width = porcentaje + "%";

  document.getElementById("textoProgreso").textContent =
    `${Math.min(etapaActual, totalEtapas)} de ${totalEtapas} etapas`;
}
// Función para inicializar el panel maestro con el primer trabajo de la lista
function inicializarPanelMaestro() {
  const filasTrabajo = document.querySelectorAll(".fila-trabajo");

  filasTrabajo.forEach((fila) => {
    fila.addEventListener("click", () => {
      seleccionarTrabajo(fila);
    });
  });
  // =====================================
  // Restaurar última orden seleccionada
  // =====================================

  const ultimoTrabajo = localStorage.getItem("trabajoSeleccionado");

  if (ultimoTrabajo) {
    const fila = document.querySelector(
      `.fila-trabajo[data-id="${ultimoTrabajo}"]`,
    );

    if (fila) {
      seleccionarTrabajo(fila);
    }
  }
}
inicializarPanelMaestro();
// =========================
// Modal Asignar Operario
// =========================

function abrirModalAsignarOperario() {
  if (!trabajoSeleccionado) {
    Swal.fire({
      icon: "warning",
      title: "Seleccione un trabajo",
      text: "Debe seleccionar una orden antes de continuar.",
    });
    return;
  }

  document.getElementById("asignarTrabajoId").value = trabajoSeleccionado.id;

  document.getElementById("modalAsignarOperario").style.display = "flex";
}

function cerrarModalAsignarOperario() {
  document.getElementById("modalAsignarOperario").style.display = "none";
}
function iniciarProduccion() {
  if (!trabajoSeleccionado) {
    Swal.fire({
      icon: "warning",
      title: "Seleccione un trabajo",
      text: "Debe seleccionar una orden antes de continuar.",
    });

    return;
  }

  if (trabajoSeleccionado.operario === "Sin asignar") {
    Swal.fire({
      icon: "warning",
      title: "Operario no asignado",
      text: "Debe asignar un operario antes de iniciar la producción.",
    });

    return;
  }

  Swal.fire({
    title: "¿Iniciar producción?",
    text: "El estado del trabajo cambiará a 'En proceso'.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, iniciar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#2563eb",
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "/trabajos/iniciar/" + trabajoSeleccionado.id;
    }
  });
}
// =========================
// Cargar historial
// =========================

async function cargarHistorial(idTrabajo) {
  try {
    const respuesta = await fetch(`/trabajos/${idTrabajo}/historial`);

    const historial = await respuesta.json();

    const contenedor = document.getElementById("historialTrabajo");

    if (historial.length === 0) {
      contenedor.innerHTML = `
        <div class="timeline-empty">
          <i class="fas fa-clock-rotate-left"></i>

          <p>Este trabajo aún no tiene historial.</p>
        </div>
      `;

      return;
    }

    let html = `
      <div class="historial-timeline">
    `;

    historial.forEach((item) => {
      const fecha = new Date(item.fecha);

      const fechaTexto = fecha.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const horaTexto = fecha.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
      });

      html += `
    <div class="historial-evento">

      <div class="historial-punto">
        <span></span>
      </div>

      <div class="historial-contenido">

        <div class="historial-top">

          <span class="historial-accion">
            ${item.accion}
          </span>

          <span class="historial-fecha">
            ${fechaTexto} · ${horaTexto}
          </span>

        </div>

        <div class="historial-usuario">
          <i class="fas fa-user"></i>
          ${item.usuario}
        </div>

        ${
          item.detalle
            ? `
              <p class="historial-detalle">
                ${item.detalle}
              </p>
            `
            : ""
        }

      </div>

    </div>
  `;
    });

    html += `
      </div>
    `;

    contenedor.innerHTML = html;
  } catch (error) {
    console.error("Error al cargar historial:", error);
  }
}

// =========================
// Cargar comentarios
// =========================

async function cargarComentarios(idTrabajo) {
  try {
    const respuesta = await fetch(`/trabajos/${idTrabajo}/comentarios`);

    const comentarios = await respuesta.json();

    const contenedor = document.getElementById("comentariosTrabajo");

    if (comentarios.length === 0) {
      contenedor.innerHTML = `
        <p class="text-muted">
          No existen comentarios registrados.
        </p>
      `;

      return;
    }

    let html = "";

    comentarios.forEach((item) => {
      const fecha = new Date(item.fecha);

      const fechaTexto = fecha.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const horaTexto = fecha.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
      });

      html += `
        <div class="comentario-evento">

          <div class="comentario-punto">
            <span></span>
          </div>

          <div class="comentario-contenido">

            <div class="comentario-top">

              <span class="comentario-etapa">
                ${item.etapa || "Proceso"}
              </span>

              <span class="comentario-fecha">
                ${fechaTexto} · ${horaTexto}
              </span>

            </div>

            <div class="comentario-usuario">
              <i class="fas fa-user"></i>
              ${item.usuario}
            </div>

            <p class="comentario-texto">
              ${item.comentario}
            </p>

          </div>

        </div>
      `;
    });

    contenedor.innerHTML = html;
  } catch (error) {
    console.error("Error al cargar comentarios:", error);
  }
}
// =========================
// Eliminar trabajo
// =========================

function eliminarTrabajo(id) {
  Swal.fire({
    title: "¿Eliminar orden?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "/trabajos/delete/" + id;
    }
  });
}
// =======================================
// Cambiar etapa del trabajo
// =======================================

function cambiarEtapa() {
  if (!trabajoSeleccionado) {
    Swal.fire({
      icon: "warning",
      title: "Seleccione una orden",
      text: "Debe seleccionar una orden.",
    });

    return;
  }
  if (
    !trabajoSeleccionado.operario ||
    trabajoSeleccionado.operario === "Sin asignar"
  ) {
    Swal.fire({
      icon: "warning",

      title: "Operario no asignado",

      text: "Debe asignar un operario antes de continuar.",
    });

    return;
  }

  const etapaId = Number(trabajoSeleccionado.etapaId);

  const siguiente = flujoProduccion[etapaId];

  if (!siguiente) {
    Swal.fire({
      icon: "info",
      title: "El trabajo ya terminó.",
    });

    return;
  }

  document.getElementById("modalCodigo").textContent =
    trabajoSeleccionado.codigo;

  document.getElementById("modalCliente").textContent =
    trabajoSeleccionado.cliente;

  document.getElementById("modalEtapaActual").textContent =
    trabajoSeleccionado.etapa;

  document.getElementById("modalEtapaSiguiente").textContent =
    siguiente.textoBoton.replace("▶ ", "").replace("📦 ", "");

  document.getElementById("comentarioProceso").value = "";

  document.getElementById("modalCambioEtapa").classList.add("active");
}
function cerrarModalEtapa() {
  document.getElementById("modalCambioEtapa").classList.remove("active");
}
//  =======================================
// Confirmar cambio de etapa
// =======================================
async function confirmarCambioEtapa() {
  const comentario = document.getElementById("comentarioProceso").value.trim();

  const etapaActual = Number(trabajoSeleccionado.etapaId);

  try {
    const respuesta = await fetch("/trabajos/cambiar-etapa", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        trabajo_id: trabajoSeleccionado.id,

        etapa_actual: etapaActual,

        comentario: comentario,
      }),
    });

    const resultado = await respuesta.json();

    if (!resultado.ok) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No fue posible cambiar la etapa.",
      });

      return;
    }

    // Cerrar modal
    cerrarModalEtapa();

    // Recargar historial
    await cargarHistorial(trabajoSeleccionado.id);

    // Refrescar la página
    location.reload();
  } catch (error) {
    console.error(error);
  }
}
function devolverEtapa() {
  if (!trabajoSeleccionado) {
    Swal.fire({
      icon: "warning",
      title: "Seleccione una orden",
      text: "Debe seleccionar una orden.",
    });

    return;
  }

  const etapaActual = Number(trabajoSeleccionado.etapaId);

  if (etapaActual === 1) {
    Swal.fire({
      icon: "info",
      title: "No es posible devolver",
      text: "La orden ya se encuentra en Recepción.",
    });

    return;
  }

  const etapas = {
    1: "Recepción",
    2: "Tallado",
    3: "Tratamiento",
    4: "Pulido",
    5: "Control de Calidad",
    6: "Entregado",
  };

  document.getElementById("devolverCodigo").textContent =
    trabajoSeleccionado.codigo;

  document.getElementById("devolverCliente").textContent =
    trabajoSeleccionado.cliente;

  document.getElementById("devolverActual").textContent = etapas[etapaActual];

  document.getElementById("devolverAnterior").textContent =
    etapas[etapaActual - 1];

  document.getElementById("motivoDevolucion").value = "";

  document.getElementById("modalDevolverEtapa").classList.add("active");
}

function cerrarModalDevolver() {
  document.getElementById("modalDevolverEtapa").classList.remove("active");
}

async function confirmarDevolucion() {
  const motivo = document.getElementById("motivoDevolucion").value.trim();

  if (motivo === "") {
    cerrarModalDevolver();

    setTimeout(() => {
      Swal.fire({
        icon: "warning",
        title: "Campo obligatorio",
        text: "Debe escribir el motivo de la devolución.",
      });
    }, 150);

    return;
  }

  const respuesta = await fetch("/trabajos/devolver-etapa", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      trabajo_id: trabajoSeleccionado.id,

      etapa_actual: trabajoSeleccionado.etapaId,

      comentario: motivo,
    }),
  });
  const resultado = await respuesta.json();

  if (resultado.ok) {
    location.reload();
  }
}
