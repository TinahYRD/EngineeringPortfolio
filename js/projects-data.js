/* ===============================================================
   PROJECTS DATA
   Structured content for each project detail page.
   Fields:
     overview       – technical summary (problem → approach → result)
     metrics        – 2-3 headline numbers shown as chips on the cards
     specs          – key-numbers table rendered on the detail page
     decisions      – design decision log (decision → options → choice → rationale)
     keyFeatures    – icon cards
     designProcess  – ordered steps (HTML allowed)
   All figures come from the original project write-ups / resume.
   =============================================================== */

var PROJECTS_ORDER = ["cooling-sim", "cooling-loop", "drivetrain", "maple-structures", "nose-gear", "arming-housing", "red-lamp", "planet-shafts", "pg-marketing", "face-tracking-robot"];

var PROJECTS = {
  "cooling-sim": {
    id: "cooling-sim",
    number: "01",
    title: `Dual Cooling Loop System Simulation`,
    category: "fsae",
    categoryLabel: `Formula SAE`,
    org: `University of Toronto Formula SAE Racing`,
    date: `April 2026 — May 2026`,
    award: null,
    overview: `The cooling system for the team's AWD EV needed a defensible heat-load number before any radiator, pump, or hose could be sized. I built a physics-based MATLAB/Simulink thermal model of the dual-inverter cooling loop and drove it with a motor efficiency that varies with operating point. The Fischer motor's power-efficiency map was digitized into a high-resolution lookup table with automated MATLAB tooling and integrated into the Simulink vehicle model, so efficiency is evaluated continuously across a simulated endurance event. Losses were computed as P_loss = P_input(1 − η): the run returned a mean motor efficiency of 95.84% (range 86.09%–97.97%) and an average thermal loss of ~5.5 kW — the heat-rejection boundary condition the cooling system was sized against. The model was checked against measured endurance-run temperatures and is reusable for evaluating future cooling changes.`,
    metrics: [
      { v: `95.84%`, l: `mean η` },
      { v: `~5.5 kW`, l: `avg heat load` },
      { v: `86–98%`, l: `η range` }
    ],
    specs: [
      [`Modelling environment`, `MATLAB + Simulink`],
      [`Efficiency source`, `Fischer motor power-efficiency map → digitized lookup table`],
      [`Mean motor efficiency`, `95.84%`],
      [`Efficiency range`, `86.09% – 97.97%`],
      [`Loss model`, `P<sub>loss</sub> = P<sub>input</sub>(1 − η)`],
      [`Average thermal loss`, `≈ 5.5 kW (sizing target)`],
      [`Validation`, `Simulated vs. measured endurance-run motor temperatures`]
    ],
    decisions: [
      {
        q: `How should motor efficiency enter the thermal model?`,
        options: [],
        choice: `Digitized manufacturer efficiency map → high-resolution lookup table, evaluated continuously in Simulink`,
        why: `Efficiency depends on the operating point — it ranged from 86.09% to 97.97% across the simulated endurance run — so it is interpolated from the map at each point rather than assumed.`
      },
      {
        q: `What heat load is the cooling system sized to?`,
        options: [],
        choice: `Reject at least ≈ 5.5 kW, plus an appropriate safety margin`,
        why: `The average motor thermal loss over the simulated endurance event (≈ 5.5 kW) represents the required heat removal; the margin is there to maintain safe operating temperatures.`
      },
      {
        q: `How is the model checked?`,
        options: [],
        choice: `Compare simulated motor temperatures with measured endurance-run data`,
        why: `Historical endurance telemetry and component data supplied realistic operating inputs and thermal loading, and the measured temperatures provide the comparison — making the model a framework for analyzing future cooling-system modifications.`
      }
    ],
    keyFeatures: [
      { icon: `🌡️`, name: `Physics-Based Thermal Model`, desc: `Full-circuit heat transfer: heat addition from powertrain components and rejection through the radiator` },
      { icon: `📊`, name: `Efficiency-Map Digitization`, desc: `Automated MATLAB tool converts the 2-D manufacturer map into a high-resolution lookup table` },
      { icon: `🔄`, name: `Endurance Event Simulation`, desc: `Motor efficiency evaluated continuously across a full simulated endurance run` },
      { icon: `✅`, name: `Telemetry Correlation`, desc: `Simulated motor temperatures compared against measured endurance-run data` },
    ],
    designProcess: [
      `<strong>Define the objective.</strong> Size the cooling system from the thermal load the motors and inverters generate during operation.`,
      `<strong>Gather performance data.</strong> Manufacturer efficiency maps plus endurance lap-simulation results define the operating points throughout the event.`,
      `<strong>Digitize the efficiency map.</strong> Convert the manufacturer map into a high-resolution MATLAB lookup table for accurate interpolation.`,
      `<strong>Integrate into Simulink.</strong> Import the lookup table into the vehicle model so efficiency is evaluated continuously through the endurance simulation.`,
      `<strong>Extract efficiency statistics.</strong> Mean η = 95.84%, minimum = 86.09%, maximum = 97.97%.`,
      `<strong>Compute electrical losses.</strong> P<sub>loss</sub> = P<sub>input</sub> × (1 − η), using instantaneous efficiency.`,
      `<strong>Set the thermal boundary condition.</strong> Average motor thermal loss ≈ 5.5 kW — the required heat removal.`,
      `<strong>Size the cooling system.</strong> Reject at least 5.5 kW with an appropriate safety margin to hold safe operating temperatures.`
    ],
    techUsed: ["Simulink", "MATLAB", "Thermal Management", "Simulation"],
    media: [
      { type: "image", src: "https://i.imgur.com/8qLKQCk.png", alt: `cooling sim` },
      { type: "image", src: "https://i.imgur.com/SCPSP5B.png", alt: `motor temp` },
    ],
    gallery: [
      { src: "https://i.imgur.com/8qLKQCk.png", alt: `Simulink cooling loop model`, wide: false },
      { src: "https://i.imgur.com/SCPSP5B.png", alt: `Motor temperature simulation output`, wide: false },
    ],
  },
  "cooling-loop": {
    id: "cooling-loop",
    number: "02",
    title: `Dual Series Cooling Loop`,
    category: "fsae",
    categoryLabel: `Formula SAE`,
    org: `University of Toronto Formula SAE Racing`,
    date: `2025 — 2026`,
    award: null,
    overview: `Physical design, build, and commissioning of the EV powertrain cooling system. The architecture is two independent series loops — one per side of the car — each ordered Pump → Radiator → Inverter → Motor cooling jackets so the temperature-sensitive inverter is prioritized for cooling. The radiator sits at the rear, where the aerodynamics team identified high-energy airflow without compromising front aero. A parallel configuration was evaluated and rejected for routing complexity, extra firewall requirements, mass, and uncertain flow distribution. I cut and routed tubing, installed sensors, fittings and pumps, then primed, leak-checked, and flow-verified the system on the bench before vehicle integration.`,
    metrics: [
      { v: `2`, l: `independent loops` },
      { v: `Series`, l: `topology` },
      { v: `Rear`, l: `radiator` }
    ],
    specs: [
      [`Architecture`, `Dual independent loops (left / right)`],
      [`Loop topology`, `Series`],
      [`Component order`, `Pump → Radiator → Inverter → Motor jackets`],
      [`Radiator location`, `Rear of vehicle (with aero team)`],
      [`Model benchmark`, `MATLAB cooling sim vs. UT23 data`],
      [`Commissioning`, `Priming, leak checks, flow verification, bench tests`]
    ],
    decisions: [
      {
        q: `One shared loop, a parallel configuration, or two independent loops?`,
        options: [`Single shared loop`, `Parallel configuration`, `Dual independent series loops`],
        choice: `Dual independent series loops (left / right)`,
        why: `Independent loops improve redundancy and simplify routing by avoiding long coolant runs. The parallel option was rejected for added routing complexity, extra firewall requirements, higher mass, reduced reliability, and uncertain flow distribution. Trade-off accepted: a minor thermal imbalance between sides in exchange for robustness and packaging efficiency.`
      },
      {
        q: `In what order should components see the coolant?`,
        options: [],
        choice: `Pump → Radiator → Inverter → Motor jackets`,
        why: `The inverter is temperature-sensitive, so it is positioned directly downstream of the radiator to be prioritized for cooling.`
      },
      {
        q: `Where does the pump go?`,
        options: [],
        choice: `Upstream of the radiator`,
        why: `Maintains positive pressure at the pump inlet, reducing cavitation risk and improving reliability.`
      },
      {
        q: `Where does the radiator go?`,
        options: [],
        choice: `Rear of the vehicle, chosen with the aerodynamics team`,
        why: `Access to high-energy airflow while preserving front aerodynamic performance.`
      }
    ],
    keyFeatures: [
      { icon: `♻️`, name: `Dual Independent Loops`, desc: `Separate L/R circuits improve redundancy and minimize coolant run length` },
      { icon: `🏎️`, name: `Aero-Informed Radiator Placement`, desc: `Rear placement per aero team — high-energy airflow, front aero preserved` },
      { icon: `⚡`, name: `Inverter-Priority Ordering`, desc: `Pump → Radiator → Inverter → Motor jackets; inverter prioritized` },
      { icon: `🔧`, name: `Hands-On Commissioning`, desc: `Tubing, fittings, sensor install, pump priming, leak checks, and flow verification` },
    ],
    designProcess: [
      `<strong>Architecture definition.</strong> Dual independent loops selected over a single shared loop to improve reliability, simplify packaging, and reduce long coolant runs.`,
      `<strong>Radiator placement.</strong> Rear of the vehicle, chosen with the aerodynamics team to access high-energy airflow while preserving front aero performance.`,
      `<strong>Component ordering.</strong> Pump → Radiator → Inverter → Motor cooling jackets, prioritizing the temperature-sensitive inverter.`,
      `<strong>Pump placement.</strong> Upstream of the radiator to maintain positive inlet pressure and reduce cavitation risk.`,
      `<strong>Topology trade study.</strong> Parallel cooling evaluated and rejected (routing complexity, firewall requirements, mass, reliability, uncertain flow split); minor L/R thermal imbalance accepted for robustness.`,
      `<strong>Simulation benchmark.</strong> MATLAB cooling simulations benchmarked against UT23 data to verify model accuracy.`,
      `<strong>Build &amp; bench test.</strong> Tubing cut and routed, sensors and fittings installed, pumps commissioned, system leak-checked and flow-verified on the bench before vehicle integration.`
    ],
    techUsed: ["SolidWorks", "Thermal Management", "Manufacturing"],
    media: [
      { type: "image", src: "https://i.imgur.com/JLfQIhv.png", alt: `cooling loop render` },
      { type: "image", src: "https://i.imgur.com/I6R2xE2.jpeg", alt: `cooling loop` },
      { type: "video", src: "https://i.imgur.com/BbGiFTU.mp4" },
    ],
    gallery: [
      { src: "https://i.imgur.com/JLfQIhv.png", alt: `CAD render of cooling loop`, wide: true },
      { src: "https://i.imgur.com/I6R2xE2.jpeg", alt: `Physical cooling loop assembly`, wide: false },
      { src: "https://i.imgur.com/JLbGdYR.png", alt: `Cooling loop bench test video`, wide: false },
    ],
  },
  "drivetrain": {
    id: "drivetrain",
    number: "03",
    title: `UT26 Drivetrain System`,
    category: "fsae",
    categoryLabel: `Formula SAE`,
    org: `University of Toronto Formula SAE Racing`,
    date: `2025 — 2026`,
    award: null,
    overview: `UT26 is the team's first AWD electric car: four identical in-hub corner assemblies, each pairing a permanent-magnet motor with an 11.97:1 compound planetary gearbox. The drivetrain was engineered against corner-level targets of < 40 kg mass, < 0.25 kg·m² moment of inertia, and < 3 h assembly time, and finished at 22.304 kg unsprung mass and 0.197 kg·m² mass moment of inertia. I co-led the architecture, performed PM motor assembly, designed a rotor-alignment tool to control the strong rotor–stator magnetic attraction during installation, and produced GD&T-compliant drawings, cost analysis, and manufacturing documentation for the inboard motor mount, planet shafts, and motor bearing. The inboard motor mount was FEA-validated to 9.24 MPa max von Mises stress (safety factor > 15). Presented the drivetrain to design judges at Formula SAE Michigan 2026.`,
    metrics: [
      { v: `22.304 kg`, l: `vs < 40 kg target` },
      { v: `0.197 kg·m²`, l: `vs < 0.25 target` },
      { v: `SF > 15`, l: `motor mount` }
    ],
    specs: [
      [`Layout`, `AWD, four identical in-hub corners`],
      [`Motor type`, `Permanent-magnet (PM)`],
      [`Gearbox`, `11.97:1 compound planetary`],
      [`Mass — target / achieved`, `< 40 kg / <strong>22.304 kg</strong> unsprung`],
      [`Moment of inertia — target / achieved`, `< 0.25 / <strong>0.197 kg·m²</strong>`],
      [`Assembly time target`, `< 3 h`],
      [`Inboard motor mount (FEA)`, `9.24 MPa max von Mises, SF > 15`],
      [`Documentation`, `GD&amp;T drawings, cost analysis, manufacturing process docs`]
    ],
    decisions: [
      {
        q: `How do we install a PM rotor safely and repeatably?`,
        options: [],
        choice: `Custom rotor-alignment tool, informed by research into industry assembly practices`,
        why: `Strong magnetic attraction between rotor and stator made rotor installation a safety challenge. The fixture makes rotor–stator engagement safe, precise, and repeatable.`
      },
      {
        q: `How do parts get from CAD to the shop floor?`,
        options: [],
        choice: `GD&amp;T-compliant drawings, cost analysis, and manufacturing process documentation`,
        why: `Produced for the inboard motor mount, planet shafts, and motor bearing to support accurate fabrication and machining.`
      }
    ],
    keyFeatures: [
      { icon: `⚙️`, name: `In-Hub AWD Architecture`, desc: `Four identical in-hub PM-motor corners — the team's first AWD EV` },
      { icon: `🧲`, name: `PM Rotor Alignment Tool`, desc: `Fixture controls rotor–stator magnetic attraction for safe, repeatable installation` },
      { icon: `📐`, name: `GD&T-Compliant Drawings`, desc: `Machining-ready drawings for the inboard motor mount, planet shafts, and motor bearing` },
      { icon: `🔬`, name: `FEA-Validated Mount`, desc: `Inboard motor mount: 9.24 MPa max von Mises stress, SF > 15` },
      { icon: `🏆`, name: `FSAE Michigan 2026`, desc: `Presented drivetrain architecture to industry design judges` },
    ],
    designProcess: [
      `<strong>Corner targets.</strong> < 40 kg mass, < 0.25 kg·m² moment of inertia, < 3 h assembly time per corner.`,
      `<strong>Identify the assembly risk.</strong> PM rotor installation flagged as a safety challenge due to strong magnetic attraction; researched industry assembly practices.`,
      `<strong>Design the fixture.</strong> Custom rotor-alignment tool enabling controlled, repeatable rotor–stator engagement.`,
      `<strong>Document for manufacture.</strong> GD&amp;T drawings, cost analysis, and process documentation for the inboard motor mount, planet shafts, and motor bearing.`,
      `<strong>Validate.</strong> Inboard motor mount analyzed in FEA: 9.24 MPa max von Mises, safety factor > 15.`,
      `<strong>Machine &amp; assemble.</strong> Machined components to drawing tolerances; assembled and verified gearbox fit and alignment across all four corners.`,
      `<strong>Close out.</strong> Final corner: 22.304 kg unsprung mass and 0.197 kg·m² mass moment of inertia.`
    ],
    techUsed: ["SolidWorks", "ANSYS", "GD&T", "Machining", "Hydraulic Press", "Gearbox"],
    media: [
      { type: "image", src: "https://i.imgur.com/KEhkIMK.jpeg", alt: `drivetrain render` },
      { type: "image", src: "https://i.imgur.com/7yG87nk.jpeg", alt: `drivetrain` },
      { type: "image", src: "https://i.imgur.com/kMlO5JT.jpeg", alt: `drivetrain` },
      { type: "image", src: "https://i.imgur.com/DMUPH1I.jpeg", alt: `drivetrain` },
      { type: "image", src: "https://i.imgur.com/FmMC2kx.jpeg", alt: `drivetrain` },
    ],
    gallery: [
      { src: "https://i.imgur.com/KEhkIMK.jpeg", alt: `Drivetrain render`, wide: false },
      { src: "https://i.imgur.com/7yG87nk.jpeg", alt: `Drivetrain assembly`, wide: false },
      { src: "https://i.imgur.com/kMlO5JT.jpeg", alt: `Motor mount detail`, wide: false },
      { src: "https://i.imgur.com/DMUPH1I.jpeg", alt: `Gearbox assembly`, wide: false },
      { src: "https://i.imgur.com/1qHliMT.png", alt: `UT26 drivetrain complete`, wide: false },
      { src: "https://i.imgur.com/MBaNdE8.png", alt: `UT26 drivetrain complete`, wide: false },
      { src: "https://i.imgur.com/FmMC2kx.jpeg", alt: `UT26 drivetrain complete`, wide: false },
      { src: "https://i.imgur.com/C4feEmi.jpeg", alt: `UT26 drivetrain complete`, wide: false },
      { src: "https://i.imgur.com/BGTsrcf.png", alt: `UT26 drivetrain complete`, wide: true },
    ],
  },
  "maple-structures": {
    id: "maple-structures",
    number: "04",
    title: `UT26 MAPLE — Structures`,
    category: "aero",
    categoryLabel: `Aerospace / UAS`,
    org: `University of Toronto Aerospace Team — UAS`,
    date: `2025 — 2026`,
    award: null,
    overview: `Structures work on MAPLE, the team's hybrid V/STOL UAS for SAE Aero Design. The focus was turning CAD into a repeatable build: I reviewed the models to set build sequence, tooling, and fixture setup, then designed laser-cut templates so fuselage geometry stayed consistent across fabrication steps. I built the fuselage (frame alignment, bonding, reinforcement), cut and drilled carbon-fibre tubes to dimension, applied heat-shrink Monokote covering, and integrated the landing gear mounts so landing loads had a clear structural path into the airframe.`,
    metrics: [
      { v: `V/STOL`, l: `hybrid airframe` },
      { v: `CF`, l: `tube structure` }
    ],
    specs: [
      [`Platform`, `Hybrid V/STOL UAS (SAE Aero Design)`],
      [`Scope`, `Fuselage + landing gear manufacture and assembly`],
      [`Materials`, `Carbon-fibre tubes, Monokote covering`],
      [`Tooling`, `Laser-cut templates and fabrication guides`],
      [`Tools`, `SolidWorks, AutoCAD, laser cutter, 3D printing`]
    ],
    decisions: [
      {
        q: `How do we keep hand-built fuselage geometry consistent?`,
        options: [],
        choice: `Precision laser-cut templates and fabrication guides`,
        why: `Templates guarantee consistent fuselage geometry and alignment across multiple fabrication steps, supporting accurate and repeatable construction.`
      },
      {
        q: `How is the landing gear integrated?`,
        options: [],
        choice: `Installed and bonded gear mounts into the airframe`,
        why: `Mounting was checked for structural load paths and alignment for expected landing loads, ensuring secure mounting and proper load distribution.`
      }
    ],
    keyFeatures: [
      { icon: `✈️`, name: `Hybrid V/STOL Airframe`, desc: `Fixed-wing structure supporting vertical/short takeoff and landing operations` },
      { icon: `🪨`, name: `Composite Construction`, desc: `Carbon-fibre tube fabrication, Monokote covering, and composite bonding` },
      { icon: `🛬`, name: `Landing Gear Integration`, desc: `Gear mounts installed for secure attachment and load distribution` },
      { icon: `✂️`, name: `Laser-Cut Fabrication Aids`, desc: `Templates and guides improve repeatability during construction` },
    ],
    designProcess: [
      `<strong>Plan the build.</strong> Reviewed CAD to establish build sequence, tooling requirements, and fixture setup for repeatable, accurate assembly.`,
      `<strong>Laser-cut templates.</strong> Designed and produced precision templates to guarantee consistent fuselage geometry and alignment.`,
      `<strong>Fuselage construction.</strong> Aligned and bonded frames, added reinforcement, and checked structural integrity before covering.`,
      `<strong>Carbon-fibre tubes.</strong> Cut and drilled structural tubes to dimension while preserving surface quality and cross-section.`,
      `<strong>Covering.</strong> Applied heat-shrink Monokote for a smooth aerodynamic finish and surface protection.`,
      `<strong>Landing gear.</strong> Installed and bonded gear mounts, verifying load paths and alignment for expected landing loads.`
    ],
    techUsed: ["SolidWorks", "3D Printing", "Laser Cutting", "Composites", "Aircraft Construction", "AutoCAD"],
    media: [
      { type: "image", src: "https://i.imgur.com/nBqKiDG.jpeg", alt: `UAS structures` },
      { type: "video", src: "https://i.imgur.com/V2GeKK2.mp4" },
      { type: "image", src: "https://i.imgur.com/e1Jl9mT.jpeg", alt: `UAS structures` },
      { type: "image", src: "https://i.imgur.com/NxiYCGL.jpeg", alt: `UAS structures` },
      { type: "image", src: "https://i.imgur.com/Uuju7Zj.jpeg", alt: `UAS structures` },
    ],
    gallery: [
      { src: "https://i.imgur.com/nBqKiDG.jpeg", alt: `MAPLE airframe`, wide: false },
      { src: "https://i.imgur.com/e1Jl9mT.jpeg", alt: `Fuselage construction`, wide: false },
      { src: "https://i.imgur.com/NxiYCGL.jpeg", alt: `Landing gear detail`, wide: false },
      { src: "https://i.imgur.com/Uuju7Zj.jpeg", alt: `MAPLE assembly`, wide: false },
      { src: "https://i.imgur.com/xOntG65.jpeg", alt: `MAPLE assembly`, wide: false },
      { src: "https://i.imgur.com/paTgR5W.jpeg", alt: `MAPLE assembly`, wide: false },
      { src: "https://i.imgur.com/GoXziNw.jpeg", alt: `Landing gear detail`, wide: true },
    ],
  },
  "nose-gear": {
    id: "nose-gear",
    number: "05",
    title: `UT26 Nose Landing Gear Integration`,
    category: "aero",
    categoryLabel: `Aerospace / UAS`,
    org: `University of Toronto Aerospace Team — UAS`,
    date: `May 2026`,
    award: null,
    overview: `The original nose gear was integrated into the fuselage, which made maintenance, repair, and replacement slow and assembly-intensive. I redesigned it as a self-contained, modular subassembly with standardized attachment points: the gear can now be fabricated, tested, and installed independently, then bolted onto the aircraft. The mounting and interface parts were redesigned around that boundary, prototyped in PETG to check fit and geometry, and iterated to a second version based on testing, manufacturability, and feedback from the avionics, structures, and manufacturing subteams.`,
    metrics: [
      { v: `Modular`, l: `bolt-on subassembly` },
      { v: `v2`, l: `iterations` }
    ],
    specs: [
      [`Before`, `Fuselage-integrated nose gear`],
      [`After`, `Independent subassembly, standardized attachment points`],
      [`Prototype material`, `PETG (FDM 3D printing)`],
      [`Iterations`, `v1 → v2`],
      [`Interfaces coordinated with`, `Avionics, structures, manufacturing`]
    ],
    decisions: [
      {
        q: `Should the nose gear be part of the fuselage or its own module?`,
        options: [`Fuselage-integrated (original)`, `Modular, independent subassembly`],
        choice: `Modular subassembly with standardized attachment points`,
        why: `The integrated design carried a maintenance burden. A self-contained subassembly enables independent fabrication, testing, and installation, reducing maintenance, replacement, and aircraft turnaround time and simplifying future iterations.`
      },
      {
        q: `How do we validate fit?`,
        options: [],
        choice: `PETG 3D-printed prototype, then iterate to v2`,
        why: `The prototype validated fitment and geometry; testing feedback, manufacturability, and cross-team requirements fed into version 2.`
      }
    ],
    keyFeatures: [
      { icon: `🔧`, name: `Modular Subassembly`, desc: `From fuselage-integrated to independent, bolt-on/bolt-off subassembly` },
      { icon: `🔄`, name: `Iterative Design (v1 → v2)`, desc: `Driven by testing, manufacturability, and cross-team input` },
      { icon: `🖨️`, name: `3D-Printed Housing`, desc: `FDM-printed mounting housing for rapid iteration` },
      { icon: `🤝`, name: `Cross-Team Integration`, desc: `Coordinated with avionics, structures, and manufacturing` },
    ],
    designProcess: [
      `<strong>Problem definition.</strong> Documented the maintenance burden of the fuselage-integrated nose gear and the assembly/disassembly effort needed for repair.`,
      `<strong>Modular architecture.</strong> Redesigned the mounting interface into a self-contained subassembly with standardized attachment points.`,
      `<strong>Interface redesign.</strong> Reworked critical mounting components so the gear can be fabricated, tested, and installed independently.`,
      `<strong>Prototype.</strong> PETG 3D-printed prototype to validate fitment and geometry on the aircraft.`,
      `<strong>Iterate.</strong> Progressed to version 2 based on testing feedback, manufacturability, and cross-team requirements.`
    ],
    techUsed: ["SolidWorks", "3D Printing", "Mechanical Design"],
    media: [
      { type: "image", src: "https://i.imgur.com/erKFIL5.png", alt: `nose landing gear` },
      { type: "video", src: "https://i.imgur.com/S9GidPP.mp4" },
      { type: "video", src: "https://i.imgur.com/0AzJEpz.mp4" },
    ],
    gallery: [
      { src: "https://i.imgur.com/erKFIL5.png", alt: `Nose gear CAD`, wide: false },
      { src: "https://i.imgur.com/nlJp90o.png", alt: `Nose gear installation video`, wide: true },
      { src: "https://i.imgur.com/FXaOLFH.jpeg", alt: `Nose gear installation video`, wide: true },
    ],
  },
  "arming-housing": {
    id: "arming-housing",
    number: "06",
    title: `UT26 MAPLE — Arming Housing Design`,
    category: "aero",
    categoryLabel: `Aerospace / UAS`,
    org: `University of Toronto Aerospace Team — UAS`,
    date: `Mar 2026`,
    award: null,
    overview: `A modular housing for the UAS arming switch: it has to protect the switch and wiring from accidental activation and damage, stay accessible during pre-flight, and clamp securely to the tail boom. Requirements (access, wire routing, mounting location) were set with the avionics team, then modelled in SolidWorks with an integrated switch pocket, mounting features, and tail-boom clamps. Version 1 was printed in PETG and installed, which exposed wire-routing conflicts and access constraints; version 2 resolved them and added a cap that clamps the on/off switch in place.`,
    metrics: [
      { v: `v1 → v2`, l: `fit-driven redesign` },
      { v: `PETG`, l: `FDM` }
    ],
    specs: [
      [`Function`, `Protect arming switch + wiring; pre-flight access`],
      [`Mounting`, `Integrated tail-boom clamps`],
      [`Material / process`, `PETG, FDM 3D printing`],
      [`v1 → v2 changes`, `Resolved routing conflicts, improved access, added switch-retention cap`]
    ],
    decisions: [
      {
        q: `What changed between v1 and v2?`,
        options: [],
        choice: `Revised geometry and a cap that clamps the on/off switch in place`,
        why: `Installing the PETG v1 on the aircraft identified wire-routing conflicts and access constraints; v2 resolved the routing conflicts and improved installation access.`
      }
    ],
    keyFeatures: [
      { icon: `🔒`, name: `Secure Arming Interface`, desc: `Protects arming switch and wiring from accidental activation and damage` },
      { icon: `🤝`, name: `Avionics-Driven Requirements`, desc: `Access, routing clearance, and mounting location defined with avionics` },
      { icon: `🖨️`, name: `Rapid Prototyping`, desc: `FDM-printed for fast CAD-to-aircraft iteration` },
    ],
    designProcess: [
      `<strong>Requirements.</strong> Defined access requirements, wire-routing paths, and mounting location with the avionics team.`,
      `<strong>CAD.</strong> Modelled the housing in SolidWorks with integrated mounting features, arming-switch pocket, and tail-boom clamps.`,
      `<strong>v1 fit check.</strong> Printed in PETG and installed on the aircraft; identified wire-routing conflicts and access constraints.`,
      `<strong>v2.</strong> Revised geometry to resolve routing conflicts and improve installation access; added a cap to clamp the on/off switch in place.`
    ],
    techUsed: ["SolidWorks", "3D Printing", "Mechanical Design"],
    media: [
      { type: "image", src: "https://i.imgur.com/7kMY9MU.png", alt: `arming housing` },
      { type: "image", src: "https://i.imgur.com/jWDbH4I.jpeg", alt: `arming housing` },
      { type: "image", src: "https://i.imgur.com/u8x3Kvi.jpeg", alt: `arming housing` },
    ],
    gallery: [
      { src: "https://i.imgur.com/7kMY9MU.png", alt: `Arming housing CAD`, wide: false },
      { src: "https://i.imgur.com/jWDbH4I.jpeg", alt: `Arming housing installed`, wide: false },
      { src: "https://i.imgur.com/4xNadGX.jpeg", alt: `Arming housing installed`, wide: false },
      { src: "https://i.imgur.com/sz6JKhk.jpeg", alt: `Arming housing installed`, wide: false },
    ],
  },
  "red-lamp": {
    id: "red-lamp",
    number: "07",
    title: `Red Lamp — Companion Robot`,
    category: "other",
    categoryLabel: `Hackathons & Other`,
    org: `UofTHacks 13`,
    date: `Jan 2026`,
    award: "🏆 2nd Place · Hack the Human–Robot Experience",
    overview: `Red Lamp is a companion robot for students studying alone, built to provide emotionally aware encouragement against isolation and burnout. Starting from a LeLamp kit, we added a Raspberry Pi, sensors, LEDs, and custom 3D-printed parts. The hard part was hardware reliability under hackathon time pressure: power instability, loose wiring, and faulty components were isolated with voltage testing and iterative reassembly. When Raspberry Pi connectivity kept failing, we incorporated Arduino components to take over critical control functions — a mid-build architecture change that improved system stability The project placed 2nd in the Human–Robot Experience track.`,
    metrics: [
      { v: `2nd`, l: `HRX track` },
      { v: `Pi + Arduino`, l: `hybrid control` }
    ],
    specs: [
      [`Base platform`, `LeLamp kit`],
      [`Compute / control`, `Raspberry Pi + Arduino`],
      [`I/O`, `Sensors, LEDs`],
      [`Custom parts`, `3D-printed structural and aesthetic components`],
      [`Result`, `2nd Place — Hack the Human–Robot Experience`]
    ],
    decisions: [
      {
        q: `Raspberry Pi connectivity keeps failing mid-build — now what?`,
        options: [],
        choice: `Move critical control functions to Arduino-based components`,
        why: `To improve system reliability, simplify real-time control, and overcome persistent communication and setup issues.`
      },
      {
        q: `How do we track down hardware faults?`,
        options: [],
        choice: `Voltage testing and iterative assembly`,
        why: `Used to troubleshoot power instability, loose wiring, and faulty components until the robot responded reliably in real time.`
      }
    ],
    keyFeatures: [
      { icon: `💡`, name: `Emotionally Aware`, desc: `Responds to the student with encouragement during solo study` },
      { icon: `🤖`, name: `LeLamp Kit Extension`, desc: `Custom sensors, LEDs, and 3D-printed components` },
      { icon: `🔌`, name: `Hybrid Pi + Arduino`, desc: `Arduino adopted mid-build for stability and real-time control` },
      { icon: `🏆`, name: `2nd Place`, desc: `UofTHacks 13 — Human–Robot Experience track` },
    ],
    designProcess: [
      `<strong>Concept.</strong> A companion robot that feels present and personal — robotics as a source of connection, not just function.`,
      `<strong>Assembly.</strong> Built on the LeLamp kit with 3D-printed components and mechanical fasteners.`,
      `<strong>Debug.</strong> Raspberry Pi connection instability during setup required iterative configuration and debugging.`,
      `<strong>Architecture pivot.</strong> Persistent Pi failures → critical control functions moved to Arduino for reliability and simpler real-time control.`,
      `<strong>Hardware reliability.</strong> Power instability, loose wiring, and faulty components isolated with voltage testing and iterative reassembly.`,
      `<strong>Ship.</strong> Fully functional robot delivered within the hackathon timeframe.`,
      `<strong>Next.</strong> Body-language recognition for emotional awareness; tutoring and adaptive learning support.`
    ],
    techUsed: ["Raspberry Pi", "Arduino", "3D Printing", "Embedded Systems", "Sensor Integration"],
    media: [
      { type: "image", src: "https://i.imgur.com/uzTcc8S.png", alt: `red lamp` },
      { type: "image", src: "https://i.imgur.com/AFc0Zrx.jpeg", alt: `red lamp` },
    ],
    gallery: [
      { src: "https://i.imgur.com/uzTcc8S.png", alt: `Red Lamp robot`, wide: false },
      { src: "https://i.imgur.com/AFc0Zrx.jpeg", alt: `Red Lamp build`, wide: false },
    ],
  },
  "planet-shafts": {
    id: "planet-shafts",
    number: "08",
    title: `Planet Shafts Redesign`,
    category: "fsae",
    categoryLabel: `Formula SAE`,
    org: `University of Toronto Formula SAE Racing`,
    date: `Feb 2026 — April 2026`,
    award: null,
    overview: `Redesign of the planet shaft inside the drivetrain's 11.97:1 compound planetary gearbox (59 sun teeth, 23/84 planet teeth) to make it easier to machine, assemble, and service. The new geometry was checked in FEA under peak planetary-stage torque — contact loads applied at the needle-bearing interfaces, fixed supports at the pin-retention features across all planet pins — giving 77.99 MPa max von Mises stress and a minimum safety factor of 15. I also supported gearbox-wide webbing optimization in KISSsoft, which removed unnecessary material while preserving gear strength, contributing to a 14% weight reduction (830.7 g → 711.49 g) at a predicted gearbox fatigue life of 580 hours. The shaft was then machined in-house to tight tolerances.`,
    metrics: [
      { v: `77.99 MPa`, l: `max σ<sub>vM</sub>` },
      { v: `SF ≥ 15`, l: `min` },
      { v: `−14%`, l: `weight (webbing opt.)` }
    ],
    specs: [
      [`Gearbox`, `11.97:1 compound planetary`],
      [`Tooth counts`, `Sun 59 · Planet 23 / 84`],
      [`Load case`, `Peak planetary-stage torque`],
      [`Boundary conditions`, `Contact loads at needle-bearing interfaces; fixed at pin-retention features`],
      [`Max von Mises stress`, `77.99 MPa`],
      [`Minimum safety factor`, `15`],
      [`Weight reduction (webbing opt.)`, `830.7 g → 711.49 g (−14%)`],
      [`Predicted fatigue life`, `580 h`]
    ],
    decisions: [
      {
        q: `What load case is the new shaft checked against?`,
        options: [],
        choice: `Peak planetary-stage torque`,
        why: `Contact loads applied at the needle-bearing interfaces, fixed supports at the pin-retention features across all planet pins. Result: 77.99 MPa max von Mises, minimum safety factor 15.`
      },
      {
        q: `Where can weight come out?`,
        options: [],
        choice: `Gearbox-wide webbing optimization in KISSsoft (supporting role)`,
        why: `Removed unnecessary material while preserving gear strength, contributing to a 14% weight reduction (830.7 g → 711.49 g) with a predicted gearbox fatigue life of 580 h.`
      }
    ],
    keyFeatures: [
      { icon: `🔄`, name: `Manufacturable Geometry`, desc: `Redesigned for easier machining, assembly, and servicing` },
      { icon: `🔬`, name: `FEA at Peak Torque`, desc: `77.99 MPa max von Mises, minimum SF 15 — before any cutting` },
      { icon: `⚖️`, name: `14% Weight Reduction`, desc: `Supported KISSsoft webbing optimization; 580 h predicted gearbox fatigue life` },
      { icon: `⚙️`, name: `Tight-Tolerance Machining`, desc: `Machined in-house and fit-checked with mating drivetrain parts` },
    ],
    designProcess: [
      `<strong>Redesign intent.</strong> Improve assembly efficiency, manufacturability, and serviceability within the 11.97:1 compound planetary (59 sun teeth, 23/84 planet teeth).`,
      `<strong>Set up FEA.</strong> Peak planetary-stage torque; contact loads at needle-bearing interfaces; fixed supports at pin-retention features across all planet pins.`,
      `<strong>Verify.</strong> Max von Mises stress 77.99 MPa, minimum safety factor 15.`,
      `<strong>Optimize the gearbox.</strong> Supported KISSsoft webbing optimization: 14% weight reduction (830.7 g → 711.49 g), predicted fatigue life 580 h.`,
      `<strong>Machine &amp; fit.</strong> Machined the shaft within tight tolerances and confirmed fit with mating drivetrain components.`
    ],
    techUsed: ["SolidWorks", "ANSYS", "FEA", "KISSsoft", "Machining"],
    media: [
      { type: "image", src: "https://i.imgur.com/MBdr8uD.png", alt: `planet shaft` },
      { type: "image", src: "https://i.imgur.com/SifFkCD.png", alt: `planet shaft` },
      { type: "image", src: "https://i.imgur.com/vt1Wl1O.jpeg", alt: `planet shaft` },
    ],
    gallery: [
      { src: "https://i.imgur.com/MBdr8uD.png", alt: `Planet shaft CAD`, wide: false },
      { src: "https://i.imgur.com/SifFkCD.png", alt: `Planet shaft drawing`, wide: false },
      { src: "https://i.imgur.com/vt1Wl1O.jpeg", alt: `Machined planet shaft`, wide: false },
    ],
  },
  "pg-marketing": {
    id: "pg-marketing",
    number: "09",
    title: `P&G Marketing Campaign`,
    category: "other",
    categoryLabel: `Hackathons & Other`,
    org: `2025 Engineering Business Future Case Competition`,
    date: `Oct 2025`,
    award: "🏆 3rd Place",
    overview: `In a team of four engineering students, we built a campaign for Vicks Early Defense Nasal Spray with a goal of growing household penetration from 10% to 20% in one year. Porter's Five Forces and PESTLE analysis pointed to the core gap — a lack of exposure and reliability — and the strategy was built around closing it. The evidence-based presentation was recognized by judges for its clarity, feasibility, and analytical depth, placing 3rd.`,
    metrics: [
      { v: `10% → 20%`, l: `penetration goal` },
      { v: `3rd`, l: `place` }
    ],
    specs: [
      [`Team`, `4 engineering students`],
      [`Product`, `Vicks Early Defense Nasal Spray`],
      [`Objective`, `Household penetration 10% → 20% in one year`],
      [`Frameworks`, `Porter's Five Forces, PESTLE`],
      [`Result`, `3rd Place`]
    ],
    decisions: [],
    keyFeatures: [
      { icon: `📈`, name: `Penetration Strategy`, desc: `Goal: double household penetration (10% → 20%) in a year` },
      { icon: `🔍`, name: `Competitive Analysis`, desc: `Porter's Five Forces on the OTC respiratory-care market` },
      { icon: `🌍`, name: `PESTLE Framework`, desc: `Macro-environmental analysis informing the campaign` },
      { icon: `🎤`, name: `Clarity & Feasibility`, desc: `Recognized by judges for evidence-based reasoning` },
    ],
    designProcess: [
      `<strong>Diagnose.</strong> Used Porter's Five Forces and PESTLE to identify the key gap: lack of exposure and perceived reliability.`,
      `<strong>Strategize.</strong> Built the campaign around closing that gap to move penetration from 10% to 20%.`,
      `<strong>Present.</strong> Delivered an evidence-based pitch recognized for clarity, feasibility, and analytical depth.`
    ],
    techUsed: ["Marketing", "Public Speaking"],
    media: [
      { type: "image", src: "https://i.imgur.com/2ZwO3PV.png", alt: `P&G case competition` },
      { type: "image", src: "https://i.imgur.com/OIXbUgq.jpeg", alt: `P&G case competition` },
    ],
    gallery: [
      { src: "https://i.imgur.com/2ZwO3PV.png", alt: `P&G case competition presentation`, wide: false },
      { src: "https://i.imgur.com/OIXbUgq.jpeg", alt: `Competition team`, wide: false },
    ],
  },
  "face-tracking-robot": {
    id: "face-tracking-robot",
    number: "10",
    title: `Autonomous Face-Tracking Robot`,
    category: "other",
    categoryLabel: `Hackathons & Other`,
    org: `MakeUofT Hackathon 2026`,
    date: `Feb 2026`,
    award: null,
    overview: `"Cupid's Wingman" is an autonomous robot that finds a face, drives toward it, and reacts with expressive motion. The pipeline splits sensing, compute, and actuation: a Raspberry Pi streams camera video to a host computer running OpenCV face detection, and the results drive an Arduino that handles differential-drive steering and a servo head-tilt, while a smartphone shows an animated face. Pi and Arduino run on separate power rails to stay stable under combined compute and motor load. Key integration work included fixing Pi-to-host latency and dropped connections, tuning detection thresholds against false positives in varying light, and calibrating steering response and stopping distance so the approach felt natural.`,
    metrics: [
      { v: `Pi → host → Arduino`, l: `pipeline` },
      { v: `2`, l: `power rails` }
    ],
    specs: [
      [`Vision`, `OpenCV face detection (host computer)`],
      [`Camera / streaming`, `Raspberry Pi camera → host`],
      [`Actuation`, `Arduino differential drive + servo head tilt`],
      [`Display`, `Smartphone animated face`],
      [`Power`, `Separate Pi and Arduino rails`],
      [`Enclosure`, `Cardboard prototype + 3D-designed case`]
    ],
    decisions: [
      {
        q: `How is power distributed?`,
        options: [],
        choice: `Separate Pi and Arduino power rails`,
        why: `For stability under combined computational and motor load.`
      },
      {
        q: `How do we cut false detections?`,
        options: [],
        choice: `Calibrated detection thresholds and lighting robustness`,
        why: `Reduced false positives and improved tracking reliability under varying environments. Planned next: reduced resolution and HSV-based filtering for efficiency and accuracy.`
      }
    ],
    keyFeatures: [
      { icon: `👁️`, name: `Real-Time Face Detection`, desc: `OpenCV Haar cascade on a Pi camera stream` },
      { icon: `🤖`, name: `Differential Drive`, desc: `Arduino motor control steers toward the detected face` },
      { icon: `😄`, name: `Expressive Head Tilt`, desc: `Servo-driven tilt for non-verbal interaction cues` },
      { icon: `📱`, name: `Animated Face Display`, desc: `Smartphone-based face for visual feedback` },
      { icon: `⚡`, name: `Dual Power Rails`, desc: `Separate Pi and Arduino supplies for stability under load` },
    ],
    designProcess: [
      `<strong>Concept.</strong> An autonomous robot that makes people feel seen — navigation, face detection, and respectful interaction.`,
      `<strong>Vision pipeline.</strong> Raspberry Pi camera streaming with OpenCV; video sent to a host computer for real-time detection and decision logic.`,
      `<strong>Actuation.</strong> Vision outputs drive an Arduino motor controller for directional movement and controlled approach.`,
      `<strong>Expression.</strong> Servo head tilt plus an animated smartphone face for non-verbal cues.`,
      `<strong>Networking.</strong> Resolved Pi-to-host latency, dropped connections, and configuration instability over SSH.`,
      `<strong>Tuning.</strong> Calibrated detection thresholds for lighting robustness; tuned steering response and stopping distance.`,
      `<strong>Fabrication.</strong> Cardboard prototype plus a fully 3D-designed enclosure for future printed integration.`,
      `<strong>Next.</strong> Fully printed enclosure; reduced resolution and HSV filtering for computational efficiency and accuracy.`
    ],
    techUsed: ["OpenCV", "Raspberry Pi", "Arduino", "Computer Vision", "3D Printing"],
    media: [
      { type: "image", src: "https://i.imgur.com/OUoI3R9.jpeg", alt: `face tracking robot` },
      { type: "image", src: "https://i.imgur.com/8edXN5r.png", alt: `face tracking robot` },
    ],
    gallery: [
      { src: "https://i.imgur.com/OUoI3R9.jpeg", alt: `Face-tracking robot prototype`, wide: false },
      { src: "https://i.imgur.com/8edXN5r.png", alt: `Robot CAD design`, wide: false },
    ],
  },
};
