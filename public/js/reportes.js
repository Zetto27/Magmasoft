document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // PRODUCCIÓN POR ETAPA
  // ==========================================

  const canvasEtapas = document.getElementById("graficaProduccionEtapa");

  const produccionPorEtapa = window.produccionPorEtapa || [];

  if (canvasEtapas) {
    new Chart(canvasEtapas, {
      type: "bar",

      data: {
        labels: produccionPorEtapa.map((item) => item.etapa),

        datasets: [
          {
            label: "Órdenes",

            data: produccionPorEtapa.map((item) => item.cantidad),

            borderWidth: 1,

            borderRadius: 6,
          },
        ],
      },

      options: {
        responsive: true,

        maintainAspectRatio: false,

        plugins: {
          legend: {
            display: false,
          },
        },

        scales: {
          y: {
            beginAtZero: true,

            ticks: {
              precision: 0,
            },
          },
        },
      },
    });
  }

  // ==========================================
  // TRABAJOS POR OPERARIO
  // ==========================================

  const canvasOperarios = document.getElementById("graficaTrabajosOperario");

  const trabajosPorOperario = window.trabajosPorOperario || [];

  if (canvasOperarios) {
    new Chart(canvasOperarios, {
      type: "bar",

      data: {
        labels: trabajosPorOperario.map((item) => item.operario),

        datasets: [
          {
            label: "Trabajos asignados",

            data: trabajosPorOperario.map((item) => item.cantidad),

            borderWidth: 1,

            borderRadius: 6,
          },
        ],
      },

      options: {
        responsive: true,

        maintainAspectRatio: false,

        plugins: {
          legend: {
            display: false,
          },
        },

        scales: {
          y: {
            beginAtZero: true,

            ticks: {
              precision: 0,
            },
          },
        },
      },
    });
  }
});
// ==========================================
// FILTRO DE REPORTES
// ==========================================

const buscarInput = document.getElementById("buscarReporte");
const estadoSelect = document.getElementById("filtroEstado");
const operarioSelect = document.getElementById("filtroOperario");

function filtrarReportes() {
  const textoBusqueda = buscarInput
    ? buscarInput.value.toLowerCase().trim()
    : "";

  const estado = estadoSelect ? estadoSelect.value.toLowerCase() : "";

  const operario = operarioSelect ? operarioSelect.value.toLowerCase() : "";

  const filas = document.querySelectorAll("#tablaReportes tr");

  filas.forEach((fila) => {
    const codigo = fila.children[0]?.textContent.toLowerCase() || "";

    const cliente = fila.children[1]?.textContent.toLowerCase() || "";

    const estadoFila = fila.dataset.estado?.toLowerCase() || "";

    const operarioFila = fila.dataset.operario?.toLowerCase() || "";

    const coincideBusqueda =
      codigo.includes(textoBusqueda) || cliente.includes(textoBusqueda);

    const coincideEstado = !estado || estadoFila === estado;

    const coincideOperario = !operario || operarioFila === operario;

    fila.style.display =
      coincideBusqueda && coincideEstado && coincideOperario ? "" : "none";
  });
}

if (buscarInput) {
  buscarInput.addEventListener("input", filtrarReportes);
}

if (estadoSelect) {
  estadoSelect.addEventListener("change", filtrarReportes);
}

if (operarioSelect) {
  operarioSelect.addEventListener("change", filtrarReportes);
}
