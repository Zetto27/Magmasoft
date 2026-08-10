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
