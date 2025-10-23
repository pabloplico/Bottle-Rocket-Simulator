# Bottle Rocket Simulator

A simple, browser-based water bottle rocket lab. Adjust parameters (pressure, water fill, mass, drag, etc.), launch a simulated rocket, and visualize Altitude, Velocity, Thrust, and Acceleration over time. Results are logged and can be exported to CSV for analysis in Excel/Sheets.

## Features
- Interactive sliders for key launch parameters with unit-aware labels and tooltips
  - Launch Pressure (kPa)
  - Bottle Volume (L)
  - Water Fill (%)
  - Outer Diameter (cm)
  - Drag Coefficient (Cd)
  - Rocket Dry Mass (g)
- One-click Launch, Reset, and CSV export
- Live water/air volume preview and safety hints
- Charts (Chart.js) for:
  - Altitude vs Time
  - Velocity vs Time
  - Thrust vs Time
  - Acceleration vs Time
- Run Log table with key outputs and the inputs used for each run
- Dark mode toggle and UI zoom control

## Physics model (high level)
- SI units throughout (inputs in convenient units; converted internally)
- Two phases:
  1) Thrust phase using orifice flow from a 22 mm nozzle, adiabatic air expansion, mass changing as water is expelled
  2) Ballistic phase with gravity and quadratic drag
- Drag uses frontal area from the given outside diameter and a chosen drag coefficient
- Fixed vertical launch (no flight angle or wind), small time step integration (dt = 0.001 s)

Outputs include:
- Apogee (m) and time to apogee (s)
- Crashdown/impact time (s)
- Peak thrust (N)
- Downrange distance estimate (m)

## Scientific model and equations
This section summarizes the main equations and constants used in `js/simulation.js`. Units are SI unless noted.

### Constants and conversions
- Atmospheric pressure: $P_{atm} = 101{,}325\,\text{Pa}$
- Gravity: $g = 9.81\,\text{m/s}^2$
- Water density: $\rho_{w} = 1000\,\text{kg/m}^3$
- Air density (sea level): $\rho_{a} = 1.225\,\text{kg/m}^3$
- Ratio of specific heats (air): $\gamma = 1.4$
- Nozzle diameter: $d_n = 0.022\,\text{m}$, area $A_n = \pi\,(d_n/2)^2$
- Bottle volume: $V_{bottle}\,[\text{L}] \to V_b = V_{bottle}/1000\,[\text{m}^3]$
- Water fill: $f_w\,[\%] \to V_w = (f_w/100)\,V_b$, air volume $V_{air,0} = V_b - V_w$
- Rocket dry mass: $m_d\,[\text{g}] \to m_d = m_d/1000\,[\text{kg}]$
- Frontal area from outside diameter $OD\,[\text{cm}]$: $$A = \pi\,\left(\frac{OD}{200}\right)^2$$

### Thrust phase (water expulsion)
Internal absolute pressure starts at $P_0 = P_{atm} + P_{gauge}$. As water is expelled through the nozzle, the exit speed is modeled as orifice flow (discharge coefficient assumed 1.0):
$$v_e = \sqrt{\max\big(\tfrac{2\,(P_{int}-P_{atm})}{\rho_w},\,0\big)}$$
Mass flow: $$\dot m_w = \rho_w\,A_n\,v_e$$
Thrust uses momentum flux only (pressure term neglected): $$F_T = \dot m_w\,v_e$$

Air expansion is adiabatic with fixed gas mass: $$P_{int}\,V_{air}^{\,\gamma} = \text{const} = P_0\,V_{air,0}^{\,\gamma}$$
At each step, with current water volume $V_w$ the air volume is $V_{air}=V_b-V_w$ and $$P_{int} = P_0\left(\frac{V_{air,0}}{V_{air}}\right)^{\gamma}$$

Water mass updates as $$m_w(t+\Delta t) = m_w(t) - \dot m_w\,\Delta t,$$ with total mass $m(t)=m_d+m_w(t)$.

The thrust phase ends when $V_w\to 0$ or $P_{int}\le P_{atm}$.

### Ballistic phase (coast)
After burnout, $F_T=0$ and mass is constant $m=m_d$.

### Aerodynamic drag
Quadratic drag with constant coefficient $C_D$ and frontal area $A$. The code applies drag per component using the local velocity components $(v_x, v_y)$:
$$\begin{aligned}
F_{D,x} &= \tfrac{1}{2}\,\rho_a\,C_D\,A\,v_x\,|v_x|,\\
F_{D,y} &= \tfrac{1}{2}\,\rho_a\,C_D\,A\,v_y\,|v_y|.\\
\end{aligned}$$
Direction is opposite the component’s sign via $|v|\,v$.

### Equations of motion (vertical launch)
During thrust:
$$\begin{aligned}
a_x &= -\tfrac{F_{D,x}}{m},\\
a_y &= \tfrac{F_T - F_{D,y} - m\,g}{m}.
\end{aligned}$$
During coast: set $F_T=0$ and $m=m_d$.

State is integrated explicitly with fixed time step $\Delta t = 0.001\,\text{s}$:
$$\begin{aligned}
v_x^{k+1} &= v_x^k + a_x^k\,\Delta t, & x^{k+1} &= x^k + v_x^{k+1}\,\Delta t,\\
v_y^{k+1} &= v_y^k + a_y^k\,\Delta t, & y^{k+1} &= y^k + v_y^{k+1}\,\Delta t.
\end{aligned}$$

Impact time is refined by linear interpolation on the last step that crosses $y=0$.

### Termination and sampling
- Simulation advances until $y\le 0$ after launch or a maximum step count is reached.
- For plotting efficiency, points are down-sampled to a target count while retaining the full thrust phase.

### Simplifications and limitations
- No “compressed-air thrust” phase after water depletion; once water is gone or $P_{int}\le P_{atm}$ the model coasts.
- Pressure-thrust (nozzle exit pressure minus ambient times exit area) is neglected; only momentum thrust $\dot m v$ is used.
- No discharge losses: nozzle coefficient taken as 1.0.
- $C_D$ is constant; no Reynolds/Mach dependence; no wind; no rail/launch dynamics; purely vertical.
- Bottle geometry is simplified to a fixed frontal area from OD; nozzle diameter is fixed at 22 mm.
- Euler integration; for high accuracy, higher-order integrators or event detection could be used.

## Getting started
This is a static web app. Because it uses ES modules (`type="module"`), most browsers require serving it over HTTP rather than opening `index.html` from the file system.

1) Clone or download the repository.
2) Start a simple local web server from the project root, then open it in your browser.

Examples (choose one):

- Python 3 (Windows PowerShell):
  ```pwsh
  py -m http.server 8000
  ```
  Open http://localhost:8000

- Node.js (http-server):
  ```pwsh
  npx http-server . -p 8000
  ```
  Open http://localhost:8000

- Node.js (serve):
  ```pwsh
  npx serve -l 8000 .
  ```
  Open http://localhost:8000

Then navigate to the served `index.html` (root path). You should see the UI with controls, charts, and the run log.

## Usage
- Adjust sliders in the left sidebar. The preview shows current water and air volumes.
- Click "Launch" to run a simulation.
- Charts update for the latest run. The run is also added to the log at the top of the table.
- Click "Export as Excel Spreadsheet" to download a CSV file (compatible with Excel/Sheets).
- Use the moon/sun button to toggle dark mode. Use the resize slider to scale the UI.

### Notes and safety
- The UI includes warnings around high pressures and excessive water fill.
- The code caps simulation pressure at 420 kPa for safety. The UI also warns that ~345 kPa is a common recommended maximum for typical bottles; follow your local lab/school safety guidance.
- This is a simplified model: vertical flight only, no wind, constant Cd, and other idealizations.

## Project structure
```
index.html
css/
  style.css
  style.css.backup
  style_old.css
js/
  simulation.js        # Core physics simulation
  ui.js                # UI bindings, event handlers, run log, CSV export
  visualization.js     # Chart.js rendering for the four charts
  utils.js             # Small helpers
lib/
  chart.umd.js         # Chart.js (UMD build)
```

## Tech stack
- Vanilla JavaScript modules
- Chart.js (bundled UMD in `lib/chart.umd.js`)
- HTML/CSS (dark mode via CSS variables/data-theme)

## Development
- Most customization happens in `js/ui.js` and `js/visualization.js`.
- Styling is in `css/style.css`.
- The simulation model is in `js/simulation.js`.

### Ideas / future improvements
- Angle/launch rail and horizontal range modeling
- Wind and variable air density
- Parametric sweeps and multi-run comparison plots
- Better nozzle modeling and bottle geometry options
- Save/restore presets

## License
No license file is included yet. If you plan to distribute or modify this project, add a LICENSE file (e.g., MIT) at the repository root.

## Acknowledgements
- Charts powered by Chart.js (https://www.chartjs.org/)
