import { useState, useEffect, useRef, useCallback } from "react";
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

/* ── Data ── */

interface GraphNode {
  id: string;
  label: string;
  type: "person" | "skill" | "company" | "position" | "gap";
  category?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  glow: string;
}

interface GraphLink {
  source: string;
  target: string;
  strength: number;
  dashed?: boolean;
}

const COLORS = {
  person:    { fill: "#D9C18A", glow: "rgba(217,193,138,0.5)" },
  technical: { fill: "#1B9E8B", glow: "rgba(27,158,139,0.4)" },
  data:      { fill: "#2E86D6", glow: "rgba(46,134,214,0.4)" },
  soft:      { fill: "#D97740", glow: "rgba(217,119,64,0.4)" },
  company:   { fill: "#16284B", glow: "rgba(22,40,75,0.4)" },
  position:  { fill: "#8A7038", glow: "rgba(138,112,56,0.4)" },
  gap:       { fill: "#DC3545", glow: "rgba(220,53,69,0.35)" },
};

function makeNodes(): GraphNode[] {
  const skillColor = (cat: string) => {
    if (cat === "data") return COLORS.data;
    if (cat === "soft") return COLORS.soft;
    return COLORS.technical;
  };

  return [
    { id: "me", label: "Jordan Kim", type: "person", r: 28, color: COLORS.person.fill, glow: COLORS.person.glow, category: "person", x: 0, y: 0, vx: 0, vy: 0 },

    { id: "python",    label: "Python",         type: "skill", category: "technical", r: 16, ...pos(), ...skillColor("technical") },
    { id: "sql",       label: "SQL",            type: "skill", category: "data",      r: 18, ...pos(), ...skillColor("data") },
    { id: "tableau",   label: "Tableau",        type: "skill", category: "data",      r: 14, ...pos(), ...skillColor("data") },
    { id: "powerbi",   label: "Power BI",       type: "skill", category: "data",      r: 13, ...pos(), ...skillColor("data") },
    { id: "dbt",       label: "dbt",            type: "skill", category: "technical", r: 12, ...pos(), ...skillColor("technical") },
    { id: "bigquery",  label: "BigQuery",       type: "skill", category: "data",      r: 12, ...pos(), ...skillColor("data") },
    { id: "storytell", label: "Storytelling",    type: "skill", category: "soft",      r: 14, ...pos(), ...skillColor("soft") },
    { id: "teamwork",  label: "Teamwork",       type: "skill", category: "soft",      r: 12, ...pos(), ...skillColor("soft") },
    { id: "leadership",label: "Leadership",     type: "skill", category: "soft",      r: 11, ...pos(), ...skillColor("soft") },
    { id: "excel",     label: "Excel",          type: "skill", category: "data",      r: 11, ...pos(), ...skillColor("data") },

    // Gap skills
    { id: "aws",       label: "AWS",            type: "gap", category: "gap", r: 14, ...pos(), color: COLORS.gap.fill, glow: COLORS.gap.glow },
    { id: "docker",    label: "Docker",         type: "gap", category: "gap", r: 11, ...pos(), color: COLORS.gap.fill, glow: COLORS.gap.glow },
    { id: "mlops",     label: "MLOps",          type: "gap", category: "gap", r: 12, ...pos(), color: COLORS.gap.fill, glow: COLORS.gap.glow },

    // Companies
    { id: "maybank",   label: "Maybank",        type: "company", r: 20, ...pos(), color: COLORS.company.fill, glow: COLORS.company.glow },
    { id: "grab",      label: "Grab",           type: "company", r: 18, ...pos(), color: COLORS.company.fill, glow: COLORS.company.glow },
    { id: "shopee",    label: "Shopee",         type: "company", r: 17, ...pos(), color: COLORS.company.fill, glow: COLORS.company.glow },
    { id: "petronas",  label: "Petronas Digital", type: "company", r: 16, ...pos(), color: COLORS.company.fill, glow: COLORS.company.glow },
    { id: "deloitte",  label: "Deloitte",       type: "company", r: 15, ...pos(), color: COLORS.company.fill, glow: COLORS.company.glow },

    // Positions
    { id: "p-da",      label: "Data Analyst",       type: "position", r: 14, ...pos(), color: COLORS.position.fill, glow: COLORS.position.glow },
    { id: "p-ae",      label: "Analytics Engineer",  type: "position", r: 13, ...pos(), color: COLORS.position.fill, glow: COLORS.position.glow },
    { id: "p-bi",      label: "BI Associate",        type: "position", r: 12, ...pos(), color: COLORS.position.fill, glow: COLORS.position.glow },
    { id: "p-mle",     label: "ML Engineer",         type: "position", r: 12, ...pos(), color: COLORS.position.fill, glow: COLORS.position.glow },
    { id: "p-pm",      label: "Product Analyst",     type: "position", r: 12, ...pos(), color: COLORS.position.fill, glow: COLORS.position.glow },
  ];
}

function pos() { return { x: (Math.random() - 0.5) * 500, y: (Math.random() - 0.5) * 400, vx: 0, vy: 0 }; }

const LINKS: GraphLink[] = [
  // Person → skills
  { source: "me", target: "python", strength: 0.9 },
  { source: "me", target: "sql", strength: 1 },
  { source: "me", target: "tableau", strength: 0.8 },
  { source: "me", target: "powerbi", strength: 0.7 },
  { source: "me", target: "dbt", strength: 0.6 },
  { source: "me", target: "bigquery", strength: 0.6 },
  { source: "me", target: "storytell", strength: 0.85 },
  { source: "me", target: "teamwork", strength: 0.7 },
  { source: "me", target: "leadership", strength: 0.5 },
  { source: "me", target: "excel", strength: 0.7 },
  // Person → gaps (dashed)
  { source: "me", target: "aws", strength: 0.3, dashed: true },
  { source: "me", target: "docker", strength: 0.2, dashed: true },
  { source: "me", target: "mlops", strength: 0.2, dashed: true },
  // Skills → positions
  { source: "sql", target: "p-da", strength: 0.9 },
  { source: "python", target: "p-da", strength: 0.7 },
  { source: "tableau", target: "p-da", strength: 0.8 },
  { source: "sql", target: "p-ae", strength: 0.8 },
  { source: "dbt", target: "p-ae", strength: 0.9 },
  { source: "python", target: "p-ae", strength: 0.8 },
  { source: "bigquery", target: "p-ae", strength: 0.7 },
  { source: "powerbi", target: "p-bi", strength: 0.8 },
  { source: "sql", target: "p-bi", strength: 0.7 },
  { source: "excel", target: "p-bi", strength: 0.6 },
  { source: "python", target: "p-mle", strength: 0.9 },
  { source: "aws", target: "p-mle", strength: 0.8, dashed: true },
  { source: "mlops", target: "p-mle", strength: 0.9, dashed: true },
  { source: "docker", target: "p-mle", strength: 0.7, dashed: true },
  { source: "sql", target: "p-pm", strength: 0.6 },
  { source: "storytell", target: "p-pm", strength: 0.9 },
  { source: "tableau", target: "p-pm", strength: 0.7 },
  // Positions → companies
  { source: "p-da", target: "maybank", strength: 0.9 },
  { source: "p-da", target: "petronas", strength: 0.6 },
  { source: "p-ae", target: "grab", strength: 0.9 },
  { source: "p-ae", target: "deloitte", strength: 0.6 },
  { source: "p-bi", target: "shopee", strength: 0.8 },
  { source: "p-bi", target: "maybank", strength: 0.5 },
  { source: "p-mle", target: "grab", strength: 0.7 },
  { source: "p-mle", target: "petronas", strength: 0.7 },
  { source: "p-pm", target: "shopee", strength: 0.7 },
  { source: "p-pm", target: "deloitte", strength: 0.7 },
];

/* ── Force simulation ── */

function simulate(nodes: GraphNode[], links: GraphLink[], W: number, H: number) {
  const map = new Map(nodes.map(n => [n.id, n]));

  // Center gravity
  for (const n of nodes) {
    n.vx += (W / 2 - n.x) * 0.003;
    n.vy += (H / 2 - n.y) * 0.003;
  }

  // Link forces
  for (const l of links) {
    const s = map.get(l.source);
    const t = map.get(l.target);
    if (!s || !t) continue;
    const dx = t.x - s.x;
    const dy = t.y - s.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const targetDist = (s.r + t.r) * 3.5;
    const force = (dist - targetDist) * 0.004 * l.strength;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;
    s.vx += fx;
    s.vy += fy;
    t.vx -= fx;
    t.vy -= fy;
  }

  // Repulsion
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distSq = dx * dx + dy * dy || 1;
      const minDist = (a.r + b.r) * 2.5;
      if (distSq < minDist * minDist * 4) {
        const dist = Math.sqrt(distSq);
        const force = Math.min(800 / distSq, 2);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }
  }

  // Damping & apply
  for (const n of nodes) {
    if ((n as any)._dragging) continue;
    n.vx *= 0.85;
    n.vy *= 0.85;
    n.x += n.vx;
    n.y += n.vy;
    n.x = Math.max(n.r + 10, Math.min(W - n.r - 10, n.x));
    n.y = Math.max(n.r + 10, Math.min(H - n.r - 10, n.y));
  }
}

/* ── Component ── */

export function SkillGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [hovered, setHovered] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>(() => makeNodes());
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const animRef = useRef<number>(0);
  const [tick, setTick] = useState(0);

  const W = expanded ? 1100 : 780;
  const H = expanded ? 620 : 420;

  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      simulate(nodesRef.current, LINKS, W, H);
      setTick(t => t + 1);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, [W, H]);

  const getNode = useCallback((id: string) => nodesRef.current.find(n => n.id === id), []);

  const handlePointerDown = useCallback((id: string, e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    const node = getNode(id);
    if (node) (node as any)._dragging = true;
    setDragging(id);
  }, [getNode]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const node = getNode(dragging);
    if (!node) return;
    const svg = (e.target as Element).closest("svg");
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    node.x = (e.clientX - rect.left) / zoom;
    node.y = (e.clientY - rect.top) / zoom;
    node.vx = 0;
    node.vy = 0;
  }, [dragging, zoom, getNode]);

  const handlePointerUp = useCallback(() => {
    if (dragging) {
      const node = getNode(dragging);
      if (node) (node as any)._dragging = false;
    }
    setDragging(null);
  }, [dragging, getNode]);

  const resetGraph = () => {
    const fresh = makeNodes();
    nodesRef.current = fresh;
    setNodes(fresh);
    setZoom(1);
    setHovered(null);
  };

  const map = new Map(nodes.map(n => [n.id, n]));

  const connectedTo = (id: string) => {
    const set = new Set<string>();
    for (const l of LINKS) {
      if (l.source === id) set.add(l.target);
      if (l.target === id) set.add(l.source);
    }
    return set;
  };

  const hoveredConns = hovered ? connectedTo(hovered) : null;
  const isHighlighted = (id: string) => !hovered || id === hovered || (hoveredConns && hoveredConns.has(id));
  const isLinkHighlighted = (l: GraphLink) => !hovered || l.source === hovered || l.target === hovered;

  const hoveredNode = hovered ? map.get(hovered) : null;
  const hoveredLinks = hovered ? LINKS.filter(l => l.source === hovered || l.target === hovered) : [];

  // Stats
  const totalSkills = nodes.filter(n => n.type === "skill").length;
  const totalGaps = nodes.filter(n => n.type === "gap").length;
  const totalPositions = nodes.filter(n => n.type === "position").length;
  const matchedPositions = nodes.filter(n => n.type === "position").filter(p => {
    const inLinks = LINKS.filter(l => l.target === p.id && !l.dashed);
    return inLinks.length > 0;
  }).length;

  return (
    <div className={`bg-white border border-border rounded-2xl shadow-sm overflow-hidden transition-all ${expanded ? "col-span-full" : ""}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Skill Knowledge Graph</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalSkills} skills · {totalGaps} gaps · {matchedPositions}/{totalPositions} positions reachable
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setZoom(z => Math.min(z + 0.15, 2))} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><ZoomIn size={15} /></button>
          <button onClick={() => setZoom(z => Math.max(z - 0.15, 0.5))} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><ZoomOut size={15} /></button>
          <button onClick={resetGraph} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><RotateCcw size={15} /></button>
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
            {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      <div ref={containerRef} className="relative bg-[#FAFAF6]" style={{ height: H * zoom, overflow: "hidden" }}>
        {/* SVG Graph */}
        <svg
          width={W * zoom}
          height={H * zoom}
          viewBox={`0 0 ${W} ${H}`}
          className="select-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ cursor: dragging ? "grabbing" : "default" }}
        >
          <defs>
            {/* Glow filters */}
            <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feFlood floodColor="#D9C18A" floodOpacity="0.5" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="shadow" />
              <feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-node" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="bg-gradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor="rgba(184,154,94,0.06)" />
              <stop offset="100%" stopColor="rgba(184,154,94,0)" />
            </radialGradient>
            {/* Animated dash */}
            <style>{`
              @keyframes dash { to { stroke-dashoffset: -20; } }
              .dash-animate { animation: dash 1.5s linear infinite; }
              @keyframes pulse-ring { 0% { r: 28; opacity: 0.4; } 100% { r: 42; opacity: 0; } }
              .pulse-ring { animation: pulse-ring 2s ease-out infinite; }
            `}</style>
          </defs>

          {/* Background glow */}
          <circle cx={W / 2} cy={H / 2} r={Math.min(W, H) * 0.4} fill="url(#bg-gradient)" />

          {/* Links */}
          {LINKS.map((l, i) => {
            const s = map.get(l.source);
            const t = map.get(l.target);
            if (!s || !t) return null;
            const highlighted = isLinkHighlighted(l);
            const opacity = highlighted ? (l.dashed ? 0.45 : 0.3 + l.strength * 0.4) : 0.06;
            const width = highlighted ? 1 + l.strength * 1.5 : 0.5;
            return (
              <line
                key={`link-${i}`}
                x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                stroke={l.dashed ? COLORS.gap.fill : s.color}
                strokeWidth={width}
                strokeOpacity={opacity}
                strokeDasharray={l.dashed ? "6,4" : undefined}
                className={l.dashed && highlighted ? "dash-animate" : undefined}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const highlighted = isHighlighted(node.id);
            const isHov = hovered === node.id;
            const scale = isHov ? 1.2 : 1;
            const r = node.r * scale;
            const opacity = highlighted ? 1 : 0.15;

            return (
              <g
                key={node.id}
                onPointerDown={e => handlePointerDown(node.id, e)}
                onPointerEnter={() => setHovered(node.id)}
                onPointerLeave={() => { if (!dragging) setHovered(null); }}
                style={{ cursor: "grab", opacity, transition: "opacity 0.2s" }}
              >
                {/* Outer glow */}
                {isHov && <circle cx={node.x} cy={node.y} r={r + 8} fill={node.glow} />}

                {/* Pulse for person */}
                {node.type === "person" && <circle cx={node.x} cy={node.y} r={node.r} fill="none" stroke="#D9C18A" strokeWidth={2} className="pulse-ring" />}

                {/* Node circle */}
                <circle
                  cx={node.x} cy={node.y} r={r}
                  fill={node.color}
                  stroke={isHov ? "#fff" : "rgba(255,255,255,0.6)"}
                  strokeWidth={isHov ? 2.5 : 1}
                  filter={node.type === "person" ? "url(#glow-gold)" : isHov ? "url(#glow-node)" : undefined}
                />

                {/* Gap pattern overlay */}
                {node.type === "gap" && (
                  <circle cx={node.x} cy={node.y} r={r} fill="none"
                    stroke="rgba(255,255,255,0.4)" strokeWidth={1}
                    strokeDasharray="3,3"
                  />
                )}

                {/* Label */}
                <text
                  x={node.x} y={node.y + r + 13}
                  textAnchor="middle"
                  fontSize={node.type === "person" ? 12 : 9.5}
                  fontWeight={node.type === "person" ? 700 : 600}
                  fill="#16284B"
                  style={{ pointerEvents: "none", fontFamily: "var(--font-sans)" }}
                >
                  {node.label}
                </text>

                {/* Type badge inside node */}
                {node.type === "gap" && (
                  <text x={node.x} y={node.y + 3.5} textAnchor="middle" fontSize={8} fontWeight={700} fill="#fff" style={{ pointerEvents: "none" }}>
                    GAP
                  </text>
                )}
                {node.type === "person" && (
                  <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff" style={{ pointerEvents: "none" }}>
                    JK
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
          {[
            { color: COLORS.person.fill, label: "You" },
            { color: COLORS.technical.fill, label: "Technical" },
            { color: COLORS.data.fill, label: "Data" },
            { color: COLORS.soft.fill, label: "Soft Skills" },
            { color: COLORS.gap.fill, label: "Skill Gap" },
            { color: COLORS.company.fill, label: "Company" },
            { color: COLORS.position.fill, label: "Position" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 bg-white/80 backdrop-blur border border-border rounded-full px-2 py-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
              <span className="text-[10px] font-medium text-foreground">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Hover tooltip */}
        {hoveredNode && (
          <div className="absolute top-3 right-3 bg-white border border-border rounded-xl shadow-lg p-4 w-56 pointer-events-none">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full" style={{ background: hoveredNode.color }} />
              <span className="text-sm font-bold text-foreground">{hoveredNode.label}</span>
            </div>
            <p className="text-xs text-muted-foreground capitalize mb-2">
              {hoveredNode.type === "gap" ? "Missing skill — needed for target roles" : hoveredNode.type}
            </p>
            {hoveredLinks.length > 0 && (
              <div className="space-y-1 border-t border-border pt-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Connections</p>
                {hoveredLinks.slice(0, 6).map((l, i) => {
                  const otherId = l.source === hovered ? l.target : l.source;
                  const other = map.get(otherId);
                  return (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: other?.color || "#ccc" }} />
                      <span className="text-xs text-foreground">{other?.label}</span>
                      {l.dashed && <span className="text-[9px] text-red-500 font-semibold">GAP</span>}
                      <span className="ml-auto text-[10px] text-muted-foreground">{Math.round(l.strength * 100)}%</span>
                    </div>
                  );
                })}
                {hoveredLinks.length > 6 && (
                  <p className="text-[10px] text-muted-foreground">+{hoveredLinks.length - 6} more</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
