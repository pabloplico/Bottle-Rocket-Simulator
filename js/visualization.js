// Visualization for Water Bottle Rocket Lab (Chart.js 4+)
// Access Chart from global window object (loaded via script tag)
const Chart = window.Chart;

// Draw Velocity vs Time
export function drawVelocityChart(ctx, chartData, darkMode = null) {
  if (!ctx) return;
  if (window._velocityChart) window._velocityChart.destroy();
  const data = chartData.time.map((t, i) => ({ x: t, y: chartData.velocity[i] }))
    .filter(pt => isFinite(pt.x) && isFinite(pt.y));
  let minX = Math.min(...data.map(pt => pt.x));
  let maxX = Math.max(...data.map(pt => pt.x));
  let minY = Math.min(...data.map(pt => pt.y));
  let maxY = Math.max(...data.map(pt => pt.y));
  const xPad = (maxX - minX) * 0.05 || 0.2;
  const yPad = (maxY - minY) * 0.05 || 0.2;
  minX = Math.min(0, minX);
  maxX = maxX + xPad;
  minY = Math.min(0, minY);
  maxY = maxY + yPad;
  if (darkMode === null) {
    darkMode = document.documentElement.getAttribute('data-theme') === 'dark';
  }
  const color = {
    line: '#f59e42',
    point: '#f59e42',
    pointBorder: darkMode ? '#23272b' : '#fff',
    grid: darkMode ? '#374151' : '#e5e7eb',
    text: darkMode ? '#e5e7eb' : '#222',
    tooltipBg: darkMode ? '#23272b' : '#fff',
    tooltipText: darkMode ? '#e5e7eb' : '#222',
    tooltipBorder: '#f59e42',
  };
  window._velocityChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Velocity',
          data,
          borderColor: color.line,
          backgroundColor: color.point,
          showLine: true,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointBorderWidth: 1.5,
          pointBorderColor: color.pointBorder,
          pointBackgroundColor: color.point,
          clip: false,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `t = ${Number(context.parsed.x).toFixed(2)} s, Velocity = ${Number(context.parsed.y).toFixed(2)} m/s`;
            }
          },
          backgroundColor: color.tooltipBg,
          titleColor: color.tooltipText,
          bodyColor: color.tooltipText,
          borderColor: color.tooltipBorder,
          borderWidth: 1,
          displayColors: false
        },
      },
      layout: {
        padding: { top: 8, right: 8, bottom: 8, left: 8 }
      },
      scales: {
        x: {
          type: 'linear',
          title: {
            display: true,
            text: 'Time (s)',
            color: color.text,
          },
          min: minX,
          max: maxX,
          grid: { color: color.grid, drawTicks: false, drawBorder: true },
          ticks: {
            color: color.text,
            callback: v => Number(v).toFixed(1),
            maxTicksLimit: 8
          }
        },
        y: {
          title: {
            display: true,
            text: 'Velocity (m/s)',
            color: color.text,
          },
          min: Math.min(0, minY),
          max: maxY + 0.05 * (maxY - minY),
          grid: { color: color.grid, drawTicks: false, drawBorder: true },
          ticks: {
            color: color.text,
            callback: v => Number(v).toFixed(1),
            maxTicksLimit: 8
          }
        }
      }
    }
  });
  setTimeout(() => {
    if (window._velocityChart) {
      window._velocityChart.resize();
      window._velocityChart.update('none');
    }
  }, 0);
}

// Draw Thrust vs Time
export function drawThrustChart(ctx, chartData, darkMode = null) {
  if (!ctx) return;
  if (window._thrustChart) window._thrustChart.destroy();
  const data = chartData.time.map((t, i) => ({ x: t, y: chartData.thrust[i] }))
    .filter(pt => isFinite(pt.x) && isFinite(pt.y));
  let minX = Math.min(...data.map(pt => pt.x));
  let maxX = Math.max(...data.map(pt => pt.x));
  let minY = Math.min(...data.map(pt => pt.y));
  let maxY = Math.max(...data.map(pt => pt.y));
  const xPad = (maxX - minX) * 0.05 || 0.2;
  const yPad = (maxY - minY) * 0.05 || 0.2;
  minX = Math.min(0, minX);
  maxX = maxX + xPad;
  minY = Math.min(0, minY);
  maxY = maxY + yPad;
  if (darkMode === null) {
    darkMode = document.documentElement.getAttribute('data-theme') === 'dark';
  }
  const color = {
    line: '#22c55e',
    point: '#22c55e',
    pointBorder: darkMode ? '#23272b' : '#fff',
    grid: darkMode ? '#374151' : '#e5e7eb',
    text: darkMode ? '#e5e7eb' : '#222',
    tooltipBg: darkMode ? '#23272b' : '#fff',
    tooltipText: darkMode ? '#e5e7eb' : '#222',
    tooltipBorder: '#22c55e',
  };
  window._thrustChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Thrust',
          data,
          borderColor: color.line,
          backgroundColor: color.point,
          showLine: true,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointBorderWidth: 1.5,
          pointBorderColor: color.pointBorder,
          pointBackgroundColor: color.point,
          clip: false,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `t = ${Number(context.parsed.x).toFixed(2)} s, Thrust = ${Number(context.parsed.y).toFixed(2)} N`;
            }
          },
          backgroundColor: color.tooltipBg,
          titleColor: color.tooltipText,
          bodyColor: color.tooltipText,
          borderColor: color.tooltipBorder,
          borderWidth: 1,
          displayColors: false
        },
      },
      layout: {
        padding: { top: 8, right: 8, bottom: 8, left: 8 }
      },
      scales: {
        x: {
          type: 'linear',
          title: {
            display: true,
            text: 'Time (s)',
            color: color.text,
          },
          min: 0,
          max: 0.35,
          grid: { color: color.grid, drawTicks: false, drawBorder: true },
          ticks: {
            color: color.text,
            callback: v => Number(v).toFixed(1),
            maxTicksLimit: 8
          }
        },
        y: {
          title: {
            display: true,
            text: 'Thrust (N)',
            color: color.text,
          },
          min: Math.min(0, minY),
          max: maxY + 0.05 * (maxY - minY),
          grid: { color: color.grid, drawTicks: false, drawBorder: true },
          ticks: {
            color: color.text,
            callback: v => Number(v).toFixed(1),
            maxTicksLimit: 8
          }
        }
      }
    }
  });
  setTimeout(() => {
    if (window._thrustChart) {
      window._thrustChart.resize();
      window._thrustChart.update('none');
    }
  }, 0);
}

// Draw Acceleration vs Time
export function drawAccelChart(ctx, chartData, darkMode = null) {
  if (!ctx) return;
  if (window._accelChart) window._accelChart.destroy();
  // Calculate acceleration from velocity (finite difference)
  const accel = chartData.velocity.map((v, i, arr) => {
    if (i === 0) return 0;
    const dt = chartData.time[i] - chartData.time[i - 1];
    if (!isFinite(dt) || dt === 0) return 0;
    return (v - arr[i - 1]) / dt;
  });
  const data = chartData.time.map((t, i) => ({ x: t, y: accel[i] }))
    .filter(pt => isFinite(pt.x) && isFinite(pt.y));
  let minX = Math.min(...data.map(pt => pt.x));
  let maxX = Math.max(...data.map(pt => pt.x));
  let minY = Math.min(...data.map(pt => pt.y));
  let maxY = Math.max(...data.map(pt => pt.y));
  const xPad = (maxX - minX) * 0.05 || 0.2;
  const yPad = (maxY - minY) * 0.05 || 0.2;
  minX = Math.min(0, minX);
  maxX = maxX + xPad;
  minY = Math.min(0, minY);
  maxY = maxY + yPad;
  if (darkMode === null) {
    darkMode = document.documentElement.getAttribute('data-theme') === 'dark';
  }
  const color = {
    line: '#a855f7',
    point: '#a855f7',
    pointBorder: darkMode ? '#23272b' : '#fff',
    grid: darkMode ? '#374151' : '#e5e7eb',
    text: darkMode ? '#e5e7eb' : '#222',
    tooltipBg: darkMode ? '#23272b' : '#fff',
    tooltipText: darkMode ? '#e5e7eb' : '#222',
    tooltipBorder: '#a855f7',
  };
  window._accelChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Acceleration',
          data,
          borderColor: color.line,
          backgroundColor: color.point,
          showLine: true,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointBorderWidth: 1.5,
          pointBorderColor: color.pointBorder,
          pointBackgroundColor: color.point,
          clip: false,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `t = ${Number(context.parsed.x).toFixed(2)} s, Accel = ${Number(context.parsed.y).toFixed(2)} m/s²`;
            }
          },
          backgroundColor: color.tooltipBg,
          titleColor: color.tooltipText,
          bodyColor: color.tooltipText,
          borderColor: color.tooltipBorder,
          borderWidth: 1,
          displayColors: false
        },
      },
      layout: {
        padding: { top: 8, right: 8, bottom: 8, left: 8 }
      },
      scales: {
        x: {
          type: 'linear',
          title: {
            display: true,
            text: 'Time (s)',
            color: color.text,
          },
          min: minX,
          max: maxX,
          grid: { color: color.grid, drawTicks: false, drawBorder: true },
          ticks: {
            color: color.text,
            callback: v => Number(v).toFixed(1),
            maxTicksLimit: 8
          }
        },
        y: {
          title: {
            display: true,
            text: 'Acceleration (m/s²)',
            color: color.text,
          },
          min: Math.min(0, minY),
          max: maxY + 0.05 * (maxY - minY),
          grid: { color: color.grid, drawTicks: false, drawBorder: true },
          ticks: {
            color: color.text,
            callback: v => Number(v).toFixed(1),
            maxTicksLimit: 8
          }
        }
      }
    }
  });
  setTimeout(() => {
    if (window._accelChart) {
      window._accelChart.resize();
      window._accelChart.update('none');
    }
  }, 0);
}
// Visualization for Water Bottle Rocket Lab (Chart.js 4+)
// Only Altitude vs Time scatter chart, minimal and clear

export function drawAltitudeChart(ctx, chartData, darkMode = null) {
  if (!ctx) return;
  if (window._altitudeChart) window._altitudeChart.destroy();
  // Prepare scatter data: {x: time, y: altitude}
  const data = chartData.time.map((t, i) => ({ x: t, y: chartData.altitude[i] }))
    .filter(pt => isFinite(pt.x) && isFinite(pt.y));
  // Axis bounds (add padding to avoid clipping, but not below y=0)
  let minX = Math.min(...data.map(pt => pt.x));
  let maxX = Math.max(...data.map(pt => pt.x));
  let minY = Math.min(...data.map(pt => pt.y));
  let maxY = Math.max(...data.map(pt => pt.y));
  // Add 5% padding to x and only to y max
  const xPad = (maxX - minX) * 0.05 || 0.2;
  const yPad = (maxY - minY) * 0.05 || 0.2;
  minX = Math.min(0, minX); // never pad below 0 on x axis
  maxX = maxX + xPad;
  minY = Math.min(0, minY); // never pad below 0
  maxY = maxY + yPad;

  // Detect dark mode if not provided
  if (darkMode === null) {
    darkMode = document.documentElement.getAttribute('data-theme') === 'dark';
  }
  // Colors for light/dark
  const color = {
    line: '#3b82f6',
    point: '#3b82f6',
    pointBorder: darkMode ? '#23272b' : '#fff',
    grid: darkMode ? '#374151' : '#e5e7eb',
    text: darkMode ? '#e5e7eb' : '#222',
    tooltipBg: darkMode ? '#23272b' : '#fff',
    tooltipText: darkMode ? '#e5e7eb' : '#222',
    tooltipBorder: '#3b82f6',
  };

  window._altitudeChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Altitude',
          data,
          borderColor: color.line,
          backgroundColor: color.point,
          showLine: true,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointBorderWidth: 1.5,
          pointBorderColor: color.pointBorder,
          pointBackgroundColor: color.point,
          clip: false,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `t = ${Number(context.parsed.x).toFixed(2)} s, Altitude = ${Number(context.parsed.y).toFixed(2)} m`;
            }
          },
          backgroundColor: color.tooltipBg,
          titleColor: color.tooltipText,
          bodyColor: color.tooltipText,
          borderColor: color.tooltipBorder,
          borderWidth: 1,
          displayColors: false
        },
      },
      layout: {
        padding: { top: 8, right: 8, bottom: 8, left: 8 }
      },
      scales: {
        x: {
          type: 'linear',
          title: {
            display: true,
            text: 'Time (s)',
            color: color.text,
          },
          min: minX,
          max: maxX,
          grid: { color: color.grid, drawTicks: false, drawBorder: true },
          ticks: {
            color: color.text,
            callback: v => Number(v).toFixed(1),
            maxTicksLimit: 8
          }
        },
        y: {
          title: {
            display: true,
            text: 'Altitude (m)',
            color: color.text,
          },
          min: Math.min(0, minY),
          max: maxY + 0.05 * (maxY - minY),
          grid: { color: color.grid, drawTicks: false, drawBorder: true },
          ticks: {
            color: color.text,
            callback: v => Number(v).toFixed(1),
            maxTicksLimit: 8
          }
        }
      }
    }
  });
  // Ensure Chart.js recalculates size and re-renders after data is set
  setTimeout(() => {
    if (window._altitudeChart) {
      window._altitudeChart.resize();
      window._altitudeChart.update('none');
    }
  }, 0);
}
