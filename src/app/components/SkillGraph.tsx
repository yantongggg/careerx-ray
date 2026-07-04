import { useState, useEffect, useRef, useCallback } from "react";
import { Maximize2, Minimize2, RotateCcw } from "lucide-react";

/* ── Solar system data ── */

interface Planet {
  id: string;
  label: string;
  type: "sun" | "planet" | "moon" | "station" | "asteroid";
  orbit: number;       // distance from sun
  angle: number;       // current angle in radians
  speed: number;       // rotation speed
  r: number;           // radius
  colors: string[];    // gradient stops
  glow: string;
  ringColor?: string;  // Saturn-style ring
  parent?: string;     // orbit around parent instead of sun
  proficiency?: number;
}

interface Link {
  from: string;
  to: string;
  strength: number;
  dashed?: boolean;
}

const TAU = Math.PI * 2;

function makePlanets(): Planet[] {
  return [
    // ☀ SUN — the candidate
    { id: "me", label: "Jordan Kim", type: "sun", orbit: 0, angle: 0, speed: 0, r: 38,
      colors: ["#FFE082", "#FFB300", "#FF8F00", "#E65100"], glow: "rgba(255,179,0,0.6)" },

    // 🪐 PLANETS — core skills (orbiting the sun)
    { id: "sql",       label: "SQL",          type: "planet", orbit: 105, angle: 0.3,  speed: 0.003,  r: 18, proficiency: 95,
      colors: ["#64B5F6", "#1565C0", "#0D47A1"], glow: "rgba(100,181,246,0.5)" },
    { id: "python",    label: "Python",       type: "planet", orbit: 105, angle: 3.5,  speed: 0.0028, r: 16, proficiency: 90,
      colors: ["#4DB6AC", "#00897B", "#004D40"], glow: "rgba(77,182,172,0.5)" },
    { id: "tableau",   label: "Tableau",      type: "planet", orbit: 155, angle: 1.1,  speed: 0.002,  r: 14, proficiency: 80,
      colors: ["#FF8A65", "#E64A19", "#BF360C"], glow: "rgba(255,138,101,0.45)" },
    { id: "storytell", label: "Storytelling",  type: "planet", orbit: 155, angle: 4.2,  speed: 0.0022, r: 15, proficiency: 85,
      colors: ["#CE93D8", "#8E24AA", "#4A148C"], glow: "rgba(206,147,216,0.45)",
      ringColor: "rgba(206,147,216,0.3)" },
    { id: "powerbi",   label: "Power BI",     type: "planet", orbit: 200, angle: 2.0,  speed: 0.0015, r: 12, proficiency: 70,
      colors: ["#FFF176", "#F9A825", "#F57F17"], glow: "rgba(255,241,118,0.4)" },
    { id: "dbt",       label: "dbt",          type: "planet", orbit: 200, angle: 5.1,  speed: 0.0017, r: 11, proficiency: 60,
      colors: ["#80DEEA", "#00ACC1", "#006064"], glow: "rgba(128,222,234,0.4)" },
    { id: "bigquery",  label: "BigQuery",     type: "planet", orbit: 240, angle: 0.8,  speed: 0.0012, r: 11, proficiency: 60,
      colors: ["#A5D6A7", "#2E7D32", "#1B5E20"], glow: "rgba(165,214,167,0.35)" },
    { id: "teamwork",  label: "Teamwork",     type: "planet", orbit: 240, angle: 3.9,  speed: 0.0013, r: 10, proficiency: 70,
      colors: ["#FFAB91", "#D84315", "#BF360C"], glow: "rgba(255,171,145,0.35)" },
    { id: "excel",     label: "Excel",        type: "planet", orbit: 275, angle: 1.5,  speed: 0.001,  r: 9, proficiency: 70,
      colors: ["#C5E1A5", "#558B2F", "#33691E"], glow: "rgba(197,225,165,0.3)" },
    { id: "leadership",label: "Leadership",   type: "planet", orbit: 275, angle: 4.6,  speed: 0.0011, r: 9, proficiency: 50,
      colors: ["#EF9A9A", "#C62828", "#B71C1C"], glow: "rgba(239,154,154,0.3)" },

    // 🌙 MOONS — positions (orbit their parent skill planet)
    { id: "p-da",  label: "Data Analyst",      type: "moon", orbit: 30, angle: 0.5,  speed: 0.008,  r: 7, parent: "sql",
      colors: ["#B0BEC5", "#546E7A", "#37474F"], glow: "rgba(176,190,197,0.4)" },
    { id: "p-ae",  label: "Analytics Eng.",     type: "moon", orbit: 28, angle: 2.1,  speed: 0.009,  r: 6, parent: "dbt",
      colors: ["#B0BEC5", "#546E7A", "#37474F"], glow: "rgba(176,190,197,0.4)" },
    { id: "p-bi",  label: "BI Associate",      type: "moon", orbit: 26, angle: 3.8,  speed: 0.01,   r: 6, parent: "powerbi",
      colors: ["#B0BEC5", "#546E7A", "#37474F"], glow: "rgba(176,190,197,0.4)" },
    { id: "p-mle", label: "ML Engineer",       type: "moon", orbit: 28, angle: 1.0,  speed: 0.007,  r: 6, parent: "python",
      colors: ["#B0BEC5", "#546E7A", "#37474F"], glow: "rgba(176,190,197,0.4)" },
    { id: "p-pm",  label: "Product Analyst",   type: "moon", orbit: 28, angle: 4.5,  speed: 0.008,  r: 6, parent: "storytell",
      colors: ["#B0BEC5", "#546E7A", "#37474F"], glow: "rgba(176,190,197,0.4)" },

    // 🛰 STATIONS — companies (far orbit)
    { id: "maybank",  label: "Maybank",         type: "station", orbit: 330, angle: 0.6,  speed: 0.0006, r: 12,
      colors: ["#FFD54F", "#FF8F00", "#E65100"], glow: "rgba(255,213,79,0.35)" },
    { id: "grab",     label: "Grab",            type: "station", orbit: 330, angle: 2.0,  speed: 0.0007, r: 11,
      colors: ["#81C784", "#2E7D32", "#1B5E20"], glow: "rgba(129,199,132,0.35)" },
    { id: "shopee",   label: "Shopee",          type: "station", orbit: 330, angle: 3.4,  speed: 0.0005, r: 11,
      colors: ["#FF8A65", "#D84315", "#BF360C"], glow: "rgba(255,138,101,0.35)" },
    { id: "petronas", label: "Petronas",        type: "station", orbit: 330, angle: 4.8,  speed: 0.0006, r: 10,
      colors: ["#4FC3F7", "#0277BD", "#01579B"], glow: "rgba(79,195,247,0.35)" },
    { id: "deloitte", label: "Deloitte",        type: "station", orbit: 330, angle: 5.8,  speed: 0.0005, r: 10,
      colors: ["#A5D6A7", "#388E3C", "#1B5E20"], glow: "rgba(165,214,167,0.3)" },

    // ☄ ASTEROIDS — skill gaps (scattered right side)
    { id: "aws",    label: "AWS",     type: "asteroid", orbit: 0, angle: 0, speed: 0, r: 10,
      colors: ["#EF5350", "#C62828", "#B71C1C"], glow: "rgba(239,83,80,0.5)" },
    { id: "docker", label: "Docker",  type: "asteroid", orbit: 0, angle: 0, speed: 0, r: 8,
      colors: ["#EF5350", "#C62828", "#B71C1C"], glow: "rgba(239,83,80,0.45)" },
    { id: "mlops",  label: "MLOps",   type: "asteroid", orbit: 0, angle: 0, speed: 0, r: 9,
      colors: ["#EF5350", "#C62828", "#B71C1C"], glow: "rgba(239,83,80,0.45)" },
    { id: "k8s",    label: "Kubernetes", type: "asteroid", orbit: 0, angle: 0, speed: 0, r: 7,
      colors: ["#EF5350", "#C62828", "#B71C1C"], glow: "rgba(239,83,80,0.4)" },
    { id: "spark",  label: "Spark",   type: "asteroid", orbit: 0, angle: 0, speed: 0, r: 8,
      colors: ["#EF5350", "#C62828", "#B71C1C"], glow: "rgba(239,83,80,0.4)" },
  ];
}

const LINKS: Link[] = [
  { from: "sql", to: "p-da", strength: 0.95 },
  { from: "python", to: "p-da", strength: 0.7 },
  { from: "tableau", to: "p-da", strength: 0.8 },
  { from: "dbt", to: "p-ae", strength: 0.9 },
  { from: "sql", to: "p-ae", strength: 0.8 },
  { from: "bigquery", to: "p-ae", strength: 0.7 },
  { from: "powerbi", to: "p-bi", strength: 0.85 },
  { from: "excel", to: "p-bi", strength: 0.6 },
  { from: "python", to: "p-mle", strength: 0.9 },
  { from: "storytell", to: "p-pm", strength: 0.9 },
  { from: "tableau", to: "p-pm", strength: 0.7 },
  { from: "p-da", to: "maybank", strength: 0.9 },
  { from: "p-da", to: "petronas", strength: 0.6 },
  { from: "p-ae", to: "grab", strength: 0.85 },
  { from: "p-ae", to: "deloitte", strength: 0.6 },
  { from: "p-bi", to: "shopee", strength: 0.8 },
  { from: "p-bi", to: "maybank", strength: 0.5 },
  { from: "p-mle", to: "grab", strength: 0.7 },
  { from: "p-mle", to: "petronas", strength: 0.65 },
  { from: "p-pm", to: "shopee", strength: 0.7 },
  { from: "p-pm", to: "deloitte", strength: 0.65 },
  // Gap links (dashed)
  { from: "aws", to: "p-mle", strength: 0.8, dashed: true },
  { from: "docker", to: "p-mle", strength: 0.7, dashed: true },
  { from: "mlops", to: "p-mle", strength: 0.9, dashed: true },
  { from: "k8s", to: "p-ae", strength: 0.5, dashed: true },
  { from: "spark", to: "p-da", strength: 0.4, dashed: true },
];

/* ── Stars background ── */
function makeStars(count: number, W: number, H: number) {
  const stars: { x: number; y: number; r: number; o: number }[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.3,
      o: Math.random() * 0.6 + 0.2,
    });
  }
  return stars;
}

/* ── Component ── */

export function SkillGraph() {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [planets] = useState<Planet[]>(() => makePlanets());
  const planetsRef = useRef(planets);
  const [, setTick] = useState(0);
  const animRef = useRef(0);

  const W = expanded ? 1200 : 860;
  const H = expanded ? 600 : 460;
  const CX = W * 0.38;
  const CY = H * 0.5;

  const starsRef = useRef(makeStars(200, W, H));

  // Asteroid positions (fixed, scattered on right)
  const asteroidPositions = useRef<Map<string, { x: number; y: number; twinkle: number }>>(new Map());
  useEffect(() => {
    const asteroids = planets.filter(p => p.type === "asteroid");
    const map = new Map<string, { x: number; y: number; twinkle: number }>();
    asteroids.forEach((a, i) => {
      map.set(a.id, {
        x: W * 0.72 + (i % 3) * 55 + (Math.random() - 0.5) * 40,
        y: H * 0.2 + i * 65 + (Math.random() - 0.5) * 30,
        twinkle: Math.random() * TAU,
      });
    });
    asteroidPositions.current = map;
  }, [W, H, planets]);

  // Animation loop
  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      for (const p of planetsRef.current) {
        if (p.speed > 0) p.angle += p.speed;
      }
      setTick(t => t + 1);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, []);

  const getPos = useCallback((p: Planet): { x: number; y: number } => {
    if (p.type === "sun") return { x: CX, y: CY };
    if (p.type === "asteroid") {
      const ap = asteroidPositions.current.get(p.id);
      return ap ? { x: ap.x, y: ap.y } : { x: W * 0.8, y: H * 0.5 };
    }
    if (p.parent) {
      const parentPlanet = planetsRef.current.find(pp => pp.id === p.parent);
      if (parentPlanet) {
        const pp = getPos(parentPlanet);
        return {
          x: pp.x + Math.cos(p.angle) * p.orbit,
          y: pp.y + Math.sin(p.angle) * p.orbit * 0.45,
        };
      }
    }
    return {
      x: CX + Math.cos(p.angle) * p.orbit,
      y: CY + Math.sin(p.angle) * p.orbit * 0.45,
    };
  }, [CX, CY, W, H]);

  const map = new Map(planets.map(p => [p.id, p]));

  const connectedTo = (id: string) => {
    const set = new Set<string>();
    for (const l of LINKS) {
      if (l.from === id) set.add(l.to);
      if (l.to === id) set.add(l.from);
    }
    // Also add sun connection for planets
    const p = map.get(id);
    if (p?.type === "planet") set.add("me");
    if (id === "me") planets.filter(pp => pp.type === "planet").forEach(pp => set.add(pp.id));
    return set;
  };

  const hoveredConns = hovered ? connectedTo(hovered) : null;
  const isHighlighted = (id: string) => !hovered || id === hovered || (hoveredConns && hoveredConns.has(id));

  const hoveredPlanet = hovered ? map.get(hovered) : null;
  const hoveredLinks = hovered ? LINKS.filter(l => l.from === hovered || l.to === hovered) : [];

  const totalSkills = planets.filter(p => p.type === "planet").length;
  const totalGaps = planets.filter(p => p.type === "asteroid").length;
  const totalPositions = planets.filter(p => p.type === "moon").length;

  const resetGraph = () => {
    for (const p of planetsRef.current) {
      p.angle = makePlanets().find(pp => pp.id === p.id)?.angle || 0;
    }
    setHovered(null);
  };

  const orbits = [105, 155, 200, 240, 275, 330];

  return (
    <div className={`border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-lg overflow-hidden transition-all ${expanded ? "col-span-full" : ""}`}
      style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #0f1628 40%, #111827 100%)" }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Skill Solar System</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {totalSkills} skills orbiting · {totalGaps} gaps in asteroid belt · {totalPositions} positions mapped
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={resetGraph} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><RotateCcw size={15} /></button>
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
            {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      <div className="relative" style={{ height: H }}>
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} className="select-none">
          <defs>
            {/* Sun glow */}
            <radialGradient id="sun-grad" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#FFF8E1" />
              <stop offset="30%" stopColor="#FFB300" />
              <stop offset="65%" stopColor="#FF8F00" />
              <stop offset="100%" stopColor="#E65100" />
            </radialGradient>
            <radialGradient id="sun-corona" cx="50%" cy="50%">
              <stop offset="0%" stopColor="rgba(255,179,0,0.25)" />
              <stop offset="50%" stopColor="rgba(255,143,0,0.08)" />
              <stop offset="100%" stopColor="rgba(255,143,0,0)" />
            </radialGradient>
            <filter id="sun-blur" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="12" />
            </filter>
            <filter id="planet-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
            <filter id="star-glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="2" />
            </filter>
            <style>{`
              @keyframes sunPulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
              @keyframes twinkle { 0%,100% { opacity: 0.3; } 50% { opacity: 0.9; } }
              @keyframes asteroidGlow { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
              .sun-pulse { animation: sunPulse 3s ease-in-out infinite; }
              .twinkle { animation: twinkle 3s ease-in-out infinite; }
              .asteroid-pulse { animation: asteroidGlow 2s ease-in-out infinite; }
            `}</style>
          </defs>

          {/* Stars */}
          {starsRef.current.map((s, i) => (
            <circle key={`star-${i}`} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.o}
              className={i % 5 === 0 ? "twinkle" : undefined}
              style={i % 5 === 0 ? { animationDelay: `${(i * 0.3) % 4}s` } : undefined}
            />
          ))}

          {/* Orbit rings */}
          {orbits.map((orbit, i) => (
            <ellipse key={`orbit-${i}`} cx={CX} cy={CY} rx={orbit} ry={orbit * 0.45}
              fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1}
              strokeDasharray={i === orbits.length - 1 ? "4,8" : undefined}
            />
          ))}

          {/* Asteroid belt zone label */}
          <text x={W * 0.74} y={H * 0.09} textAnchor="middle"
            fontSize={11} fill="rgba(239,83,80,0.6)" fontWeight={600}
            style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Skill Gaps
          </text>
          <text x={W * 0.74} y={H * 0.09 + 16} textAnchor="middle"
            fontSize={9} fill="rgba(239,83,80,0.35)"
            style={{ fontFamily: "var(--font-sans)" }}>
            Acquire to unlock new orbits
          </text>

          {/* Links (when hovered) */}
          {hovered && hoveredLinks.map((l, i) => {
            const fromP = map.get(l.from);
            const toP = map.get(l.to);
            if (!fromP || !toP) return null;
            const fp = getPos(fromP);
            const tp = getPos(toP);
            return (
              <line key={`link-${i}`} x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y}
                stroke={l.dashed ? "rgba(239,83,80,0.5)" : "rgba(255,255,255,0.25)"}
                strokeWidth={l.strength * 2}
                strokeDasharray={l.dashed ? "6,4" : undefined}
              />
            );
          })}

          {/* Sun corona */}
          <circle cx={CX} cy={CY} r={90} fill="url(#sun-corona)" className="sun-pulse" />
          <circle cx={CX} cy={CY} r={55} fill="rgba(255,179,0,0.12)" filter="url(#sun-blur)" />

          {/* Sun */}
          <g onPointerEnter={() => setHovered("me")} onPointerLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
            <circle cx={CX} cy={CY} r={38} fill="url(#sun-grad)" />
            <circle cx={CX} cy={CY} r={38} fill="none" stroke="rgba(255,248,225,0.4)" strokeWidth={1.5} />
            <text x={CX} y={CY + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="#fff"
              style={{ pointerEvents: "none", fontFamily: "var(--font-sans)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
              JK
            </text>
            <text x={CX} y={CY + 52} textAnchor="middle" fontSize={11} fontWeight={600} fill="rgba(255,213,79,0.9)"
              style={{ pointerEvents: "none", fontFamily: "var(--font-display)" }}>
              Jordan Kim
            </text>
          </g>

          {/* Planets, Moons, Stations */}
          {planets.filter(p => p.type !== "sun" && p.type !== "asteroid").map(planet => {
            const pos = getPos(planet);
            const highlighted = isHighlighted(planet.id);
            const isHov = hovered === planet.id;
            const r = isHov ? planet.r * 1.2 : planet.r;
            const opacity = highlighted ? 1 : 0.25;
            const gradId = `grad-${planet.id}`;

            return (
              <g key={planet.id}
                onPointerEnter={() => setHovered(planet.id)}
                onPointerLeave={() => setHovered(null)}
                style={{ cursor: "pointer", opacity, transition: "opacity 0.3s" }}
              >
                <defs>
                  <radialGradient id={gradId} cx="35%" cy="35%">
                    <stop offset="0%" stopColor={planet.colors[0]} />
                    <stop offset="60%" stopColor={planet.colors[1]} />
                    <stop offset="100%" stopColor={planet.colors[2] || planet.colors[1]} />
                  </radialGradient>
                </defs>

                {/* Glow */}
                {isHov && <circle cx={pos.x} cy={pos.y} r={r + 10} fill={planet.glow} filter="url(#planet-glow)" />}

                {/* Moon orbit ring */}
                {planet.type === "planet" && planets.some(m => m.parent === planet.id) && (
                  <ellipse cx={pos.x} cy={pos.y}
                    rx={planets.find(m => m.parent === planet.id)!.orbit}
                    ry={planets.find(m => m.parent === planet.id)!.orbit * 0.45}
                    fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={0.5}
                  />
                )}

                {/* Saturn ring */}
                {planet.ringColor && (
                  <ellipse cx={pos.x} cy={pos.y} rx={r * 2} ry={r * 0.5}
                    fill="none" stroke={planet.ringColor} strokeWidth={2.5}
                  />
                )}

                {/* Planet body */}
                <circle cx={pos.x} cy={pos.y} r={r} fill={`url(#${gradId})`} />

                {/* Light reflection */}
                <circle cx={pos.x - r * 0.25} cy={pos.y - r * 0.25} r={r * 0.3}
                  fill="rgba(255,255,255,0.2)" />

                {/* Shadow crescent */}
                <circle cx={pos.x + r * 0.15} cy={pos.y + r * 0.15} r={r}
                  fill="rgba(0,0,0,0.15)" clipPath={`circle(${r}px at ${pos.x}px ${pos.y}px)`}
                  style={{ clipPath: `circle(${r}px at ${pos.x}px ${pos.y}px)` }}
                />

                {/* Station icon (hexagon hint) */}
                {planet.type === "station" && (
                  <rect x={pos.x - 2} y={pos.y - 2} width={4} height={4} rx={0.5}
                    fill="rgba(255,255,255,0.5)" style={{ pointerEvents: "none" }} />
                )}

                {/* Label */}
                <text x={pos.x} y={pos.y + r + (planet.type === "moon" ? 10 : 14)}
                  textAnchor="middle"
                  fontSize={planet.type === "moon" ? 8 : planet.type === "station" ? 9 : 10}
                  fontWeight={600}
                  fill={planet.type === "moon" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.85)"}
                  style={{ pointerEvents: "none", fontFamily: "var(--font-sans)" }}
                >
                  {planet.label}
                </text>

                {/* Proficiency ring */}
                {planet.type === "planet" && planet.proficiency && isHov && (
                  <>
                    <circle cx={pos.x} cy={pos.y} r={r + 5} fill="none"
                      stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
                    <circle cx={pos.x} cy={pos.y} r={r + 5} fill="none"
                      stroke={planet.colors[0]} strokeWidth={2}
                      strokeDasharray={`${(planet.proficiency / 100) * TAU * (r + 5)} ${TAU * (r + 5)}`}
                      strokeLinecap="round"
                      transform={`rotate(-90 ${pos.x} ${pos.y})`}
                    />
                  </>
                )}
              </g>
            );
          })}

          {/* Asteroids (gap skills) */}
          {planets.filter(p => p.type === "asteroid").map((a, i) => {
            const ap = asteroidPositions.current.get(a.id);
            if (!ap) return null;
            const highlighted = isHighlighted(a.id);
            const isHov = hovered === a.id;
            const r = isHov ? a.r * 1.3 : a.r;

            return (
              <g key={a.id}
                onPointerEnter={() => setHovered(a.id)}
                onPointerLeave={() => setHovered(null)}
                style={{ cursor: "pointer", opacity: highlighted ? 1 : 0.3, transition: "opacity 0.3s" }}
              >
                {/* Glow */}
                <circle cx={ap.x} cy={ap.y} r={r + 6} fill={a.glow}
                  filter="url(#planet-glow)" className="asteroid-pulse"
                  style={{ animationDelay: `${i * 0.5}s` }}
                />

                {/* Asteroid body — irregular look */}
                <circle cx={ap.x} cy={ap.y} r={r}
                  fill={a.colors[1]} />
                <circle cx={ap.x - r * 0.3} cy={ap.y - r * 0.2} r={r * 0.35}
                  fill={a.colors[0]} opacity={0.6} />

                {/* Dashed border */}
                <circle cx={ap.x} cy={ap.y} r={r + 2}
                  fill="none" stroke="rgba(239,83,80,0.4)" strokeWidth={1} strokeDasharray="3,3" />

                {/* Label */}
                <text x={ap.x} y={ap.y + r + 13} textAnchor="middle"
                  fontSize={9} fontWeight={600} fill="rgba(239,83,80,0.8)"
                  style={{ pointerEvents: "none", fontFamily: "var(--font-sans)" }}>
                  {a.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
          {[
            { emoji: "☀", label: "You (Sun)", color: "#FFB300" },
            { emoji: "🪐", label: "Skills", color: "#64B5F6" },
            { emoji: "🌙", label: "Positions", color: "#B0BEC5" },
            { emoji: "🛰", label: "Companies", color: "#FFD54F" },
            { emoji: "☄", label: "Skill Gaps", color: "#EF5350" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1">
              <span className="text-[10px]">{l.emoji}</span>
              <span className="text-[10px] font-medium" style={{ color: l.color }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Hover tooltip */}
        {hoveredPlanet && hoveredPlanet.type !== "sun" && (
          <div className="absolute top-3 right-3 bg-[rgba(15,22,40,0.95)] backdrop-blur border border-white/10 rounded-xl shadow-2xl p-4 w-56 pointer-events-none">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full" style={{ background: hoveredPlanet.colors[0] }} />
              <span className="text-sm font-bold text-white">{hoveredPlanet.label}</span>
            </div>
            <p className="text-xs text-slate-400 capitalize mb-1">
              {hoveredPlanet.type === "asteroid" ? "⚠ Missing skill — needed for target roles" :
               hoveredPlanet.type === "planet" ? `Skill · ${hoveredPlanet.proficiency}% proficiency` :
               hoveredPlanet.type === "moon" ? "Target position" :
               "Hiring company"}
            </p>
            {hoveredPlanet.type === "planet" && hoveredPlanet.proficiency && (
              <div className="mt-2 mb-2">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${hoveredPlanet.proficiency}%`,
                    background: `linear-gradient(90deg, ${hoveredPlanet.colors[0]}, ${hoveredPlanet.colors[1]})`
                  }} />
                </div>
              </div>
            )}
            {hoveredLinks.length > 0 && (
              <div className="space-y-1 border-t border-white/10 pt-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Connections</p>
                {hoveredLinks.slice(0, 5).map((l, i) => {
                  const otherId = l.from === hovered ? l.to : l.from;
                  const other = map.get(otherId);
                  return (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: other?.colors[0] || "#ccc" }} />
                      <span className="text-xs text-slate-300">{other?.label}</span>
                      {l.dashed && <span className="text-[9px] text-red-400 font-semibold">GAP</span>}
                      <span className="ml-auto text-[10px] text-slate-500">{Math.round(l.strength * 100)}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
