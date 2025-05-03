// Water Bottle Rocket Simulation (realistic, SI units, orifice thrust, adiabatic, drag, phase separation)
// Returns { trajectory, metrics, chartData }
export function simulateRocket(params) {
  // --- Step 1: Inputs and Constants ---
  // Validate/cap pressure for safety
  if (params.pressure > 420) {
    alert("Launch pressure exceeds safe limit (420 kPa). Resetting to 420 kPa.");
    params.pressure = 420;
  }
  const bottleVolume = params.bottleVolume; // L
  const waterFillPercentage = params.waterFill; // %
  const V_bottle = bottleVolume / 1000; // L → m³
  const V_water = (waterFillPercentage / 100) * V_bottle;
  const V_air = V_bottle - V_water;
  const m_dry = params.mass / 1000; // g → kg
  const m_water = V_water * 1000; // m³ → kg
  let m_total = m_dry + m_water;
  const P_gauge = params.pressure * 1000; // kPa → Pa
  let P_internal = P_gauge + 101325; // Add atmospheric pressure
  const d_nozzle = 0.022; // 22mm nozzle, m
  const C_d = params.drag; // dimensionless
  const A = Math.PI * Math.pow(params.od / 200, 2); // od in cm → m, area
  const g = 9.81;
  const P_atm = 101325;
  const rho_air = 1.225;
  const rho_water = 1000;
  const gamma = 1.4;
  const dt = 0.001;
  const points = 3000; // Number of points to sample for the trajectory
  const max_steps = 100000;
  let sample_interval = Math.max(1, Math.ceil(max_steps / points));

  // --- Step 2: Initial Conditions ---
  let time = 0;
  let height = 0;
  let x = 0;
  // Angle is always vertical (90°)
  let angleRad = Math.PI / 2;
  let vx = 0;
  let vy = 0;
  let curr_V_water = V_water;
  let curr_m_water = m_water;
  m_total = m_dry + curr_m_water;
  P_internal = P_gauge + P_atm;

  // For graphing
  const trajectory = [];
  let max_height = 0;
  let apogee_time = 0;
  let burnout_time = null;
  let burnout_height = null;
  let burnout_vy = null;
  let crashdown_time = null;
  let thrust_peak = 0;

  // --- Step 3: Main Simulation Loop ---
  for (let i = 0; i < max_steps; ++i) {    let F_thrust = 0;
    // Calculate velocity magnitude for drag
    const vabs = Math.sqrt(vx * vx + vy * vy);
    let F_drag_x = 0, F_drag_y = 0;
    if (vabs > 0) {
      F_drag_x = 0.5 * rho_air * vx * vx * C_d * A * Math.sign(vx);
      F_drag_y = 0.5 * rho_air * vy * vy * C_d * A * Math.sign(vy);
    }
    if (curr_V_water > 0) {
      // Thrust phase
      const A_nozzle = Math.PI * Math.pow(d_nozzle / 2, 2);
      const v_exit = Math.sqrt(Math.max(2 * (P_internal - P_atm) / rho_water, 0));
      const m_dot_water = rho_water * A_nozzle * v_exit;
      F_thrust = m_dot_water * v_exit;
      if (F_thrust > thrust_peak) thrust_peak = F_thrust;
      // Thrust direction
      // Only vertical thrust
      const ax = (-F_drag_x) / m_total;
      const ay = (F_thrust - F_drag_y - m_total * g) / m_total;
      vx += ax * dt;
      vy += ay * dt;
      x += vx * dt;
      height += vy * dt;
      curr_m_water -= m_dot_water * dt;
      if (curr_m_water < 0) curr_m_water = 0;
      curr_V_water = curr_m_water / rho_water;
      m_total = m_dry + curr_m_water;
      // Adiabatic pressure decay
      const V_air_initial = V_air;
      const V_air_now = V_bottle - curr_V_water;
      P_internal = (P_gauge + P_atm) * Math.pow(V_air_initial / V_air_now, gamma);
      if (curr_V_water <= 0.00001 || P_internal <= P_atm) {
        burnout_time = time;
        burnout_height = height;
        burnout_vy = vy;
        curr_V_water = 0;
        curr_m_water = 0;
        m_total = m_dry;
        P_internal = P_atm;
      }
    } else {
      // Ballistic phase
      F_thrust = 0;
      const ax = -F_drag_x / m_dry;
      const ay = (-F_drag_y - m_dry * g) / m_dry;
      vx += ax * dt;
      vy += ay * dt;
      x += vx * dt;
      height += vy * dt;
    }
    // Store trajectory (down-sampled)
    if (curr_V_water > 0 || i % sample_interval === 0) {
    trajectory.push({ t: time, x, y: height, vx, vy, thrust: F_thrust });
    }

    // Track apogee
    if (height > max_height) {
      max_height = height;
      apogee_time = time;
    }    // End condition
    if (height <= 0 && time > 0.05) {
      // Interpolate to get the exact impact time at y=0
      const prev = trajectory.length > 0 ? trajectory[trajectory.length - 1] : null;
      if (prev) {
        const t1 = prev.t, y1 = prev.y;
        const t2 = time, y2 = height;
        // Linear interpolation for t at y=0
        const t_impact = t1 + (0 - y1) * (t2 - t1) / (y2 - y1);
        const vx_impact = prev.vx + (0 - y1) * (vx - prev.vx) / (y2 - y1);
        const vy_impact = prev.vy + (0 - y1) * (vy - prev.vy) / (y2 - y1);
        crashdown_time = t_impact;
        // Overwrite last trajectory point to be exactly at y=0
        trajectory.push({
          t: t_impact,
          x: x + (0 - height) * (x - prev.x) / (height - y1),
          y: 0,
          vx: vx_impact, // Interpolated velocity at impact
          vy: vy_impact, // Interpolated velocity at impact
          thrust: 0
        });
      } else {
        crashdown_time = time;
      }
      break;
    }
    time += dt;
  }
  // --- Step 4: Metrics ---
  // Ensure all chartData arrays are the same length
  const minLen = Math.min(
    trajectory.length,
    trajectory.length,
    trajectory.length,
    trajectory.length,
    trajectory.length
  );
  const chartData = {
    time: trajectory.slice(0, minLen).map(p => p.t),
    altitude: trajectory.slice(0, minLen).map(p => p.y),
    velocity: trajectory.slice(0, minLen).map(p => p.vy),
    thrust: trajectory.slice(0, minLen).map(p => p.thrust),
    distance: trajectory.slice(0, minLen).map(p => p.x),
  };
  return {
    trajectory: trajectory,
    metrics: {
      burnout: { t: burnout_time, y: burnout_height, vy: burnout_vy },
      thrust: { peak: thrust_peak },
      apogee: { t: apogee_time, y: max_height },
      crashdown: { t: crashdown_time, x: x, y: 0 }
    },
    chartData: chartData,
    preview: {
      waterVolumeL: +(V_water.toFixed(2)),
      airVolumeL: +(V_air.toFixed(2))
    }
  };
}


