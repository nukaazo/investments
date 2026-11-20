(() => {
  const ORANGE = "#e85c1c";
  const TEAL = "#006363";
  const TEAL_SOFT = "#1a8f8a";
  const MUTED = "#899693";
  const INK = "#182220";

  const charts = new Map();
  const built = new Set();

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 8, right: 10, bottom: 4, left: 4 },
    },
    animation: {
      duration: 600,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        labels: {
          color: INK,
          boxWidth: 12,
          padding: 12,
          font: { family: "'Plus Jakarta Sans', system-ui, sans-serif", size: 11, weight: "600" },
        },
      },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: INK,
        bodyColor: "#32403d",
        borderColor: "rgba(0, 99, 99, 0.15)",
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        cornerRadius: 8,
        usePointStyle: true,
        titleFont: { family: "'Plus Jakarta Sans', system-ui, sans-serif", size: 12, weight: "700" },
        bodyFont: { family: "'Plus Jakarta Sans', system-ui, sans-serif", size: 11 },
      },
    },
  };

  function scaleOpts() {
    return {
      grid: {
        color: "rgba(0, 99, 99, 0.06)",
        tickColor: "transparent",
      },
      ticks: {
        color: "#5e6b68",
        font: { family: "'Plus Jakarta Sans', system-ui, sans-serif", size: 11, weight: "600" },
      },
      border: { color: "rgba(0, 99, 99, 0.1)" },
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
              backgroundColor: "rgba(232, 92, 28, 0.12)",
              borderWidth: 3,
              fill: true,
              tension: 0.35,
              pointRadius: 5,
              pointHoverRadius: 7,
              pointBackgroundColor: "#fff",
              pointBorderColor: ORANGE,
              pointBorderWidth: 2.5,
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
          labels: ["4% Commission (₹20)", "Payment Cost (₹10)", "Cloud & SMS (₹2)", "Contribution (₹8)"],
          datasets: [
            {
              label: "₹ per ₹500 order",
              data: [20, 10, 2, 8],
              backgroundColor: [ORANGE, "#94a3b8", "#cbd5e1", TEAL],
              borderRadius: 8,
              maxBarThickness: 62,
              categoryPercentage: 0.65,
              barPercentage: 0.85,
            },
          ],
        },
        options: {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            legend: { display: false },
            tooltip: {
              ...baseOptions.plugins.tooltip,
              callbacks: {
                label(ctx) {
                  return `₹${ctx.raw} (${((ctx.raw / 20) * 100).toFixed(0)}% of commission)`;
                },
              },
            },
          },
          scales: {
            x: {
              ...scaleOpts(),
              ticks: {
                ...scaleOpts().ticks,
                maxRotation: 0,
                autoSkip: false,
              },
            },
            y: {
              ...scaleOpts(),
              beginAtZero: true,
              suggestedMax: 24,
              ticks: {
                ...scaleOpts().ticks,
                callback: (v) => `₹${v}`,
              },
            },
          },
        },
      });
    },

    "chart-growth"() {
      make("chart-growth", {
        type: "bar",
        data: {
          labels: ["Fulfilment (≥95%)", "30-Day Repeat (≥30%)", "Local Margin (Positive)"],
          datasets: [
            {
              label: "Quality Gate Target",
              data: [95, 30, 100],
              backgroundColor: [TEAL, ORANGE, TEAL_SOFT],
              borderRadius: 6,
              maxBarThickness: 32,
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
                  const labels = [
                    "Threshold: ≥95% order fulfilment required",
                    "Threshold: ≥30% 30-day buyer retention required",
                    "Threshold: 3 consecutive months positive local contribution"
                  ];
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
            y: {
              ...scaleOpts(),
              ticks: {
                ...scaleOpts().ticks,
                font: { family: "'Plus Jakarta Sans', system-ui, sans-serif", size: 11, weight: "700" },
              },
            },
          },
        },
      });
    },

    "chart-roadmap"() {
      make("chart-roadmap", {
        type: "bar",
        data: {
          labels: ["Launch (Now)", "Month 6", "Month 12", "Month 18"],
          datasets: [
            {
              type: "bar",
              label: "Active Transacting Shops",
              data: [10, 100, 300, 700],
              backgroundColor: "rgba(0, 99, 99, 0.18)",
              borderColor: TEAL,
              borderWidth: 1.5,
              borderRadius: 8,
              maxBarThickness: 46,
              order: 2,
            },
            {
              type: "line",
              label: "Scaling Trajectory",
              data: [10, 100, 300, 700],
              borderColor: ORANGE,
              backgroundColor: ORANGE,
              borderWidth: 3,
              tension: 0.28,
              pointRadius: 6,
              pointHoverRadius: 8,
              pointBackgroundColor: "#ffffff",
              pointBorderColor: ORANGE,
              pointBorderWidth: 3,
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
              suggestedMax: 800,
              ticks: {
                ...scaleOpts().ticks,
                callback: (v) => `${v} shops`,
              },
            },
          },
        },
      });
    },

    "chart-ask"() {
      make("chart-ask", {
        type: "doughnut",
        data: {
          labels: ["Operating Plan ₹198L", "Setup & Proxy Pilot ₹38L", "Reserve Buffer ₹33.6L"],
          datasets: [
            {
              data: [198, 38, 33.6],
              backgroundColor: [TEAL, ORANGE, "#f0b090"],
              borderColor: "#ffffff",
              borderWidth: 3,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          ...baseOptions,
          cutout: "68%",
          layout: { padding: { top: 4, bottom: 4, left: 4, right: 4 } },
          plugins: {
            ...baseOptions.plugins,
            legend: {
              position: "bottom",
              labels: {
                color: INK,
                boxWidth: 10,
                padding: 12,
                font: { family: "'Plus Jakarta Sans', system-ui, sans-serif", size: 11, weight: "600" },
              },
            },
            tooltip: {
              ...baseOptions.plugins.tooltip,
              callbacks: {
                label(ctx) {
                  const total = 198 + 38 + 33.6;
                  const pct = ((ctx.raw / total) * 100).toFixed(1);
                  return ` ${ctx.label}: ${pct}%`;
                },
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
          labels: ["Commission Revenue", "Net Contribution", "Fixed Spend"],
          datasets: [
            {
              label: "Year 1 (₹L)",
              data: [28.44, 11.38, 108],
              backgroundColor: TEAL_SOFT,
              borderRadius: 6,
              maxBarThickness: 34,
            },
            {
              label: "Year 2 (₹L)",
              data: [301.44, 120.58, 213],
              backgroundColor: ORANGE,
              borderRadius: 6,
              maxBarThickness: 34,
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
              ticks: {
                ...scaleOpts().ticks,
                callback: (v) => `₹${v}L`,
              },
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
          const chart = charts.get(id);
          chart.resize();
          chart.update("none");
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
