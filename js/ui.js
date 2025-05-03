// --- Zoom slider logic ---
document.addEventListener('DOMContentLoaded', () => {
  // --- Zoom slider logic ---
  const zoomSlider = document.getElementById('zoom-slider');
  const zoomOutput = document.getElementById('zoom-output');
  if (zoomSlider && zoomOutput) {
    function setZoom(val) {
      document.documentElement.style.fontSize = (val / 100 * 16) + 'px';
      zoomOutput.textContent = val + '%';
    }
    setZoom(zoomSlider.value);
    zoomSlider.addEventListener('change', e => setZoom(e.target.value));
  }

  // --- Dark mode toggle button logic ---
  const darkBtn = document.getElementById('darkmode-toggle-btn');
  const darkIcon = document.getElementById('darkmode-icon');
  function updateDarkIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    darkIcon.textContent = isDark ? '☀️' : '🌙';
    darkBtn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  }
  function updateChartForTheme() {
    if (window._lastChartData) {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      drawAltitudeChart(document.getElementById('altitude-chart').getContext('2d'), window._lastChartData, dark);
      drawVelocityChart(document.getElementById('velocity-chart').getContext('2d'), window._lastChartData, dark);
      drawThrustChart(document.getElementById('thrust-chart').getContext('2d'), window._lastChartData, dark);
      drawAccelChart(document.getElementById('accel-chart').getContext('2d'), window._lastChartData, dark);
    }
  }
  // Restore previous mode if set
  if (darkBtn && darkIcon) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const saved = localStorage.getItem('darkmode');
    if (saved === 'dark' || (saved === null && prefersDark)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    updateDarkIcon();
    darkBtn.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('darkmode', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('darkmode', 'dark');
      }
      updateDarkIcon();
      updateChartForTheme();
    });
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('darkmode')) {
        if (e.matches) {
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.removeAttribute('data-theme');
        }
        updateDarkIcon();
        updateChartForTheme();
      }
    });
  }
});
// UI logic for Water Bottle Rocket Lab
import { getSliderValue } from './utils.js';
import { simulateRocket } from './simulation.js';
import { drawAltitudeChart, drawVelocityChart, drawThrustChart, drawAccelChart } from './visualization.js';

function updateFlightMetrics(metrics) {
  // No-op: Flight Metric Summary card has been removed
  // (function retained for compatibility)
  return;
}

// DOM elements
const sliders = [
  { id: 'bottle-volume-slider', out: 'bottle-volume-output' },
  { id: 'water-fill-slider', out: 'water-fill-output' },
  { id: 'od-slider', out: 'od-output' },
  { id: 'drag-slider', out: 'drag-output' },
  { id: 'mass-slider', out: 'mass-output' },
  { id: 'pressure-slider', out: 'pressure-output' },
];

function updateSliderOutputs() {
  sliders.forEach(s => {
    const el = document.getElementById(s.id);
    const out = document.getElementById(s.out);
    if (el && out) out.textContent = el.value;
  });
}


// Format a value to a given number of decimal places (or integer)
function fmtFixed(val, digits) {
  if (typeof val !== 'number' || !isFinite(val)) return 'N/A';
  if (digits === 0) return Math.round(val).toString();
  return Number(val).toFixed(digits);
}

function fillMetricTable(id, rows) {
  const tbody = document.querySelector(`#${id} tbody`);
  tbody.innerHTML = '';
  rows.forEach(([k, v]) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${k}</td><td>${fmtOrNA(v)}</td>`;
    tbody.appendChild(tr);
  });
}

// Add a function to get all current slider values as an object
function getCurrentParams() {
  return {
    bottleVolume: getSliderValue('bottle-volume-slider'),
    waterFill: getSliderValue('water-fill-slider'),
    od: getSliderValue('od-slider'),
    drag: getSliderValue('drag-slider'),
    mass: getSliderValue('mass-slider'),
    pressure: getSliderValue('pressure-slider'),
  };
}

// Update addRunLogEntry to accept and display params
function addRunLogEntry(runNum, apogee, crashdown, distance, status, params) {
  const tbody = document.querySelector('#run-log-table tbody');
  const now = new Date().toLocaleTimeString();
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${runNum}</td>
    <td>${now}</td>
    <td>${fmtFixed(apogee, 2)}</td>
    <td>${fmtFixed(crashdown, 2)}</td>
    <td>${fmtFixed(params.bottleVolume, 1)}</td>
    <td>${fmtFixed(params.waterFill, 0)}</td>
    <td>${fmtFixed(params.pressure, 0)}</td>
    <td>${fmtFixed(params.od, 1)}</td>
    <td>${fmtFixed(params.drag, 1)}</td>
    <td>${fmtFixed(params.mass, 0)}</td>
    <td>${status}</td>
  `;
  tbody.prepend(tr);
  // No row highlighting
  // (Gradient fade removed)
}

function exportCSV(logTableId) {
  const rows = Array.from(document.querySelectorAll(`#${logTableId} tr`));
  const csv = rows.map(row =>
    Array.from(row.children).map(cell => '"' + cell.textContent + '"').join(',')
  ).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'run_log.csv';
  a.click();
}

// Main event handlers
let runCount = 0;
document.addEventListener('DOMContentLoaded', () => {
  updateSliderOutputs();

  // Show preview of water/air volumes after slider change or launch
  function updatePreview() {
    const bottleVolume = getSliderValue('bottle-volume-slider');
    const waterFill = getSliderValue('water-fill-slider');
    const pressure = getSliderValue('pressure-slider');
    const V_bottle = bottleVolume;
    const V_water = (waterFill / 100) * V_bottle;
    const V_air = V_bottle - V_water;
    let msg = `Water Volume: ${V_water.toFixed(2)} L, Air Volume: ${V_air.toFixed(2)} L`;
    if (waterFill > 80) {
      msg += ' ⚠️ Warning: Water fill > 80% is not efficient for launch';
    }
    if (pressure >= 345) {
      msg += ' ⚠️ Warning: Launch pressure at or above 345 kPa is not recommended for most bottles';
    }
    let preview = document.getElementById('water-air-preview');
    if (!preview) {
      preview = document.createElement('div');
      preview.id = 'water-air-preview';
      preview.style.margin = '0.5em 0 0.5em 0';
      preview.style.fontSize = '0.95em';
      document.querySelector('.sliders').prepend(preview);
    }
    preview.textContent = msg;
  }
  updatePreview();
  sliders.forEach(s => {
    document.getElementById(s.id).addEventListener('input', () => {
      updateSliderOutputs();
      updatePreview();
    });
  });

  // Update run log table header to include variable columns
  // const runLogHead = document.querySelector('#run-log-table thead tr');
  // if (runLogHead && runLogHead.children.length < 11) {
  //   runLogHead.innerHTML = `
  //   <th>#</th>
  //   <th>Time</th>
  //   <th>Apogee (m)</th>
  //   <th>Crashdown (s)</th>
  //   <th>Bottle Vol (L)</th>
  //   <th>Water Fill (%)</th>
  //   <th>Pressure (kPa)</th>
  //   <th>Outside Diameter (cm)</th>
  //   <th>Drag</th>
  //   <th>Mass (g)</th>
  //   <th>Simulation Status</th>
  //   `;
  // }

  document.getElementById('launch-btn').addEventListener('click', () => {
    try {
      const params = getCurrentParams();
      const result = simulateRocket(params);
      window._lastChartData = result.chartData;
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      drawAltitudeChart(document.getElementById('altitude-chart').getContext('2d'), result.chartData, dark);
      drawVelocityChart(document.getElementById('velocity-chart').getContext('2d'), result.chartData, dark);
      drawThrustChart(document.getElementById('thrust-chart').getContext('2d'), result.chartData, dark);
      drawAccelChart(document.getElementById('accel-chart').getContext('2d'), result.chartData, dark);
      updateFlightMetrics(result.metrics);
      addRunLogEntry(++runCount, result.metrics.apogee.y, result.metrics.crashdown.t, result.metrics.crashdown.x, 'OK', params);
    } catch (e) {
      alert('Simulation error: ' + e.message);
    }
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    window.location.reload();
  });

  document.getElementById('export-btn').addEventListener('click', () => {
    exportCSV('run-log-table');
  });
});
