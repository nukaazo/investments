(() => {
  const ORANGE = "#e85c1c";
  const TEAL = "#006363";
  const TEAL_SOFT = "#2a8a86";
  const MUTED = "#9aa4a1";
  const INK = "#24302e";

  const charts = new Map();
  const built = new Set();

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 6, right: 8, bottom: 2, left: 2 },
    },
    animation: {
      duration: 700,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        labels: {
          color: INK,
          boxWidth: 12,
          font: { family: "'Plus Jakarta Sans', system-ui, sans-serif", size: 11 },
        },
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: INK,
        bodyColor: INK,
        borderColor: "#e2eae7",
        borderWidth: 1,
        padding: 10,
      },
    },
  };

  function scaleOpts() {
    return {
      grid: { color: "rgba(36, 48, 46, 0.06)" },
      ticks: {
        color: "#66706d",
        font: { family: "'Plus Jakarta Sans', system-ui, sans-serif", size: 11 },
      },
      border: { color: "rgba(36, 48, 46, 0.08)" },
    };
  }

  function make(id, config) {
    const el = document.getElementById(id);
    if (!el || typeof Chart === "undefined") return;
    const existing = charts.get(id);
    if (existing) existing.destroy();
    charts.set(id, new Chart(el, config));
    built.add(id);
  }

  const builders = {
    "chart-traction"() {
      make("chart-traction", {
        type: "line",
        data: {
          labels: ["W1", "W2", "W3", "W4", "W5", "W6"],
          datasets: [
            {
              label: "Transaction value (₹k / day avg)",
              data: [12, 15, 18, 21, 23, 25],
              borderColor: ORANGE,
              backgroundColor: "rgba(232, 92, 28, 0.14)",
              borderWidth: 3,
              fill: true,
              tension: 0.35,
              pointRadius: 5,
              pointHoverRadius: 7,
              pointBackgroundColor: "#fff",
              pointBorderColor: ORANGE,
              pointBorderWidth: 2,
            },
          ],
        },
        options: {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            legend: { display: false },
          },
          scales: {
            x: scaleOpts(),
            y: {
              ...scaleOpts(),
              beginAtZero: true,
              suggestedMax: 30,
            },
          },
        },
      });
    },

    "chart-economics"() {
      make("chart-economics", {
        type: "bar",
        data: {
          labels: ["Commission", "Payment cost", "Other variable", "Contribution"],
          datasets: [
            {
              label: "₹ on a ₹500 order",
              data: [20, 10, 2, 8],
              backgroundColor: [ORANGE, MUTED, "#c5cecb", TEAL],
              borderRadius: 10,
              maxBarThickness: 72,
              categoryPercentage: 0.7,
              barPercentage: 0.85,
            },
          ],
        },
        options: {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            legend: { display: false },
          },
          scales: {
            x: scaleOpts(),
            y: {
              ...scaleOpts(),
              beginAtZero: true,
              suggestedMax: 24,
            },
          },
        },
      });
    },

    "chart-growth"() {
      make("chart-growth", {
        type: "bar",
        data: {
          labels: ["Fulfilment", "30-day repeat", "Local contribution"],
          datasets: [
            {
              label: "Gate target",
              data: [95, 30, 100],
              backgroundColor: [TEAL, ORANGE, TEAL_SOFT],
              borderRadius: 8,
              maxBarThickness: 42,
            },
          ],
        },
        options: {
          indexAxis: "y",
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            legend: { display: false },
            tooltip: {
              ...baseOptions.plugins.tooltip,
              callbacks: {
                label(ctx) {
                  const labels = ["≥95% fulfilment", "≥30% buyer repeat", "Positive contribution"];
                  return labels[ctx.dataIndex] || ctx.formattedValue;
                },
              },
            },
          },
          scales: {
            x: {
              ...scaleOpts(),
              beginAtZero: true,
              max: 100,
              ticks: {
                ...scaleOpts().ticks,
                callback: (v) => `${v}%`,
              },
            },
            y: scaleOpts(),
          },
        },
      });
    },

    "chart-roadmap"() {
      make("chart-roadmap", {
        type: "bar",
        data: {
          labels: ["Now", "M6", "M12", "M18"],
          datasets: [
            {
              type: "bar",
              label: "Active shops",
              data: [10, 100, 300, 700],
              backgroundColor: "rgba(0, 99, 99, 0.22)",
              borderColor: TEAL,
              borderWidth: 1,
              borderRadius: 8,
              maxBarThickness: 46,
              order: 2,
            },
            {
              type: "line",
              label: "Target path",
              data: [10, 100, 300, 700],
              borderColor: ORANGE,
              backgroundColor: ORANGE,
              tension: 0.25,
              pointRadius: 5,
              pointBackgroundColor: ORANGE,
              order: 1,
            },
          ],
        },
        options: {
          ...baseOptions,
          scales: {
            x: scaleOpts(),
            y: {
              ...scaleOpts(),
              beginAtZero: true,
            },
          },
        },
      });
    },

    "chart-ask"() {
      make("chart-ask", {
        type: "doughnut",
        data: {
          labels: ["Ops ₹198L", "Setup + Proxy ₹38L", "Reserve ₹33.6L"],
          datasets: [
            {
              data: [198, 38, 33.6],
              backgroundColor: [TEAL, ORANGE, "#f0b090"],
              borderColor: "#fff",
              borderWidth: 3,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          ...baseOptions,
          cutout: "62%",
          layout: { padding: 4 },
          plugins: {
            ...baseOptions.plugins,
            legend: {
              position: "bottom",
              labels: {
                color: INK,
                boxWidth: 10,
                padding: 14,
                font: { family: "'Plus Jakarta Sans', system-ui, sans-serif", size: 11 },
              },
            },
          },
        },
      });
    },

    "chart-model"() {
      make("chart-model", {
        type: "bar",
        data: {
          labels: ["Commission", "Contribution", "Fixed spend"],
          datasets: [
            {
              label: "Year 1 (₹L)",
              data: [28.44, 11.38, 108],
              backgroundColor: TEAL_SOFT,
              borderRadius: 8,
              maxBarThickness: 36,
            },
            {
              label: "Year 2 (₹L)",
              data: [301.44, 120.58, 213],
              backgroundColor: ORANGE,
              borderRadius: 8,
              maxBarThickness: 36,
            },
          ],
        },
        options: {
          ...baseOptions,
          scales: {
            x: scaleOpts(),
            y: {
              ...scaleOpts(),
              beginAtZero: true,
            },
          },
        },
      });
    },
  };

  function ensureIn(slide) {
    if (!slide || typeof Chart === "undefined") return;
    slide.querySelectorAll("canvas[id^='chart-']").forEach((canvas) => {
      const id = canvas.id;
      if (!builders[id]) return;
      if (!built.has(id) || !charts.get(id)) {
        builders[id]();
      } else {
        try {
          charts.get(id).resize();
          charts.get(id).update("none");
        } catch (_) {
          builders[id]();
        }
      }
    });
  }

  function refreshVisible() {
    const active = document.querySelector(".slide.is-active");
    ensureIn(active);
  }

  function buildAll({ animate = true } = {}) {
    if (typeof Chart === "undefined") return;
    if (!animate) {
      baseOptions.animation = false;
    }
    Object.keys(builders).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      builders[id]();
    });
    charts.forEach((chart) => {
      try {
        if (!animate) chart.options.animation = false;
        chart.resize();
        chart.update(animate ? undefined : "none");
      } catch (_) {
        /* ignore */
      }
    });
  }

  window.NukaazoCharts = { ensureIn, refreshVisible, buildAll };
})();
