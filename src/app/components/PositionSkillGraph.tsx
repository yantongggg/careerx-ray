import { useState, useEffect, useRef } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

const TAU = Math.PI * 2;

interface SkillEntry {
  id: string;
  label: string;
  fit: number;
  proficiency: number;
  colors: string[];
  glow: string;
}

interface GapEntry {
  id: string;
  label: string;
  importance: number;
  colors: string[];
  glow: string;
}

const SKILL_META: Record<string, { label: string; proficiency: number; colors: string[]; glow: string }> = {
  sql:        { label: "SQL",         proficiency: 95, colors: ["#64B5F6","#1565C0","#0D47A1"], glow: "rgba(100,181,246,0.5)" },
  python:     { label: "Python",      proficiency: 90, colors: ["#4DB6AC","#00897B","#004D40"], glow: "rgba(77,182,172,0.5)" },
  tableau:    { label: "Tableau",     proficiency: 80, colors: ["#FF8A65","#E64A19","#BF360C"], glow: "rgba(255,138,101,0.45)" },
  storytell:  { label: "Storytelling", proficiency: 85, colors: ["#CE93D8","#8E24AA","#4A148C"], glow: "rgba(206,147,216,0.45)" },
  powerbi:    { label: "Power BI",    proficiency: 70, colors: ["#FFF176","#F9A825","#F57F17"], glow: "rgba(255,241,118,0.4)" },
  dbt:        { label: "dbt",         proficiency: 60, colors: ["#80DEEA","#00ACC1","#006064"], glow: "rgba(128,222,234,0.4)" },
  bigquery:   { label: "BigQuery",    proficiency: 60, colors: ["#A5D6A7","#2E7D32","#1B5E20"], glow: "rgba(165,214,167,0.35)" },
  teamwork:   { label: "Teamwork",    proficiency: 70, colors: ["#FFAB91","#D84315","#BF360C"], glow: "rgba(255,171,145,0.35)" },
  excel:      { label: "Excel",       proficiency: 70, colors: ["#C5E1A5","#558B2F","#33691E"], glow: "rgba(197,225,165,0.3)" },
  leadership: { label: "Leadership",  proficiency: 50, colors: ["#EF9A9A","#C62828","#B71C1C"], glow: "rgba(239,154,154,0.3)" },
};

const GAP_META: Record<string, { label: string; colors: string[]; glow: string }> = {
  aws:    { label: "AWS",        colors: ["#EF5350","#C62828"], glow: "rgba(239,83,80,0.5)" },
  docker: { label: "Docker",     colors: ["#EF5350","#C62828"], glow: "rgba(239,83,80,0.45)" },
  mlops:  { label: "MLOps",      colors: ["#EF5350","#C62828"], glow: "rgba(239,83,80,0.45)" },
  k8s:    { label: "Kubernetes", colors: ["#EF5350","#C62828"], glow: "rgba(239,83,80,0.4)" },
  spark:  { label: "Spark",      colors: ["#EF5350","#C62828"], glow: "rgba(239,83,80,0.4)" },
};

interface PositionData {
  skills: { skillId: string; fit: number }[];
  gaps: { skillId: string; importance: number }[];
}

const POSITIONS: Record<string, PositionData> = {
  "maybank|Data Analyst": {
    skills: [{ skillId: "sql", fit: 95 }, { skillId: "python", fit: 72 }, { skillId: "tableau", fit: 85 }, { skillId: "excel", fit: 60 }, { skillId: "storytell", fit: 65 }],
    gaps: [{ skillId: "aws", importance: 40 }],
  },
  "grab|Analytics Engineer": {
    skills: [{ skillId: "sql", fit: 88 }, { skillId: "dbt", fit: 92 }, { skillId: "python", fit: 80 }, { skillId: "bigquery", fit: 75 }],
    gaps: [{ skillId: "k8s", importance: 55 }, { skillId: "docker", importance: 50 }],
  },
  "petronas|AI Product Analyst": {
    skills: [{ skillId: "sql", fit: 90 }, { skillId: "python", fit: 78 }, { skillId: "tableau", fit: 82 }, { skillId: "storytell", fit: 55 }],
    gaps: [{ skillId: "aws", importance: 50 }, { skillId: "mlops", importance: 88 }, { skillId: "docker", importance: 65 }],
  },
};

function makeStars(count: number, W: number, H: number) {
  const stars: { x: number; y: number; r: number; o: number }[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.2 + 0.3, o: Math.random() * 0.5 + 0.15 });
  }
  return stars;
}

interface Props {
  companyId: string;
  position: string;
  companyLabel: string;
  companyColors: string[];
  companyGlow: string;
}

export function PositionSkillGraph({ companyId, position, companyLabel, companyColors, companyGlow }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mouseInGraph, setMouseInGraph] = useState(false);
  const anglesRef = useRef<Map<string, number>>(new Map());
  const [, setTick] = useState(0);
  const animRef = useRef(0);

  const W = expanded ? 1100 : 800;
  const H = expanded ? 550 : 420;
  const CX = W * 0.45;
  const CY = H * 0.5;

  const starsRef = useRef(makeStars(180, W, H));

  const key = `${companyId}|${position}`;
  const posData = POSITIONS[key];

  const matchedSkills: SkillEntry[] = (posData?.skills || []).map(s => {
    const meta = SKILL_META[s.skillId];
    return meta ? { id: s.skillId, label: meta.label, fit: s.fit, proficiency: meta.proficiency, colors: meta.colors, glow: meta.glow } : null;
  }).filter(Boolean) as SkillEntry[];

  const gapSkills: GapEntry[] = (posData?.gaps || []).map(g => {
    const meta = GAP_META[g.skillId];
    return meta ? { id: g.skillId, label: meta.label, importance: g.importance, colors: meta.colors, glow: meta.glow } : null;
  }).filter(Boolean) as GapEntry[];

  const allSkillIds = new Set([...matchedSkills.map(s => s.id), ...gapSkills.map(g => g.id)]);
  const unrelatedSkills = Object.entries(SKILL_META).filter(([id]) => !allSkillIds.has(id)).map(([id, meta]) => ({ id, ...meta }));

  const overallMatch = matchedSkills.length > 0
    ? Math.round(matchedSkills.reduce((sum, s) => sum + s.fit, 0) / matchedSkills.length)
    : 0;

  useEffect(() => {
    const map = new Map<string, number>();
    matchedSkills.forEach((s, i) => map.set(s.id, (i / Math.max(matchedSkills.length, 1)) * TAU));
    gapSkills.forEach((g, i) => map.set(g.id, ((i + 0.3) / Math.max(gapSkills.length, 1)) * TAU + 0.5));
    anglesRef.current = map;
  }, [key]);

  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      if (!mouseInGraph) {
        anglesRef.current.forEach((angle, id) => {
          anglesRef.current.set(id, angle + 0.0018);
        });
      }
      setTick(t => t + 1);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, [mouseInGraph]);

  const getPos = (id: string, orbit: number) => {
    const angle = anglesRef.current.get(id) || 0;
    return { x: CX + Math.cos(angle) * orbit, y: CY + Math.sin(angle) * orbit * 0.45 };
  };

  const matchOrbit = 140;
  const gapOrbit = 220;

  const getMatchOrbit = (fit: number) => {
    if (fit >= 85) return matchOrbit - 20;
    if (fit >= 70) return matchOrbit;
    return matchOrbit + 25;
  };

  return (
    <div className={`border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-lg overflow-hidden transition-all ${expanded ? "col-span-full" : ""}`}
      style={{ background: "linear-gradient(135deg, #06080f 0%, #0c1220 40%, #0f1729 100%)" }}>

      <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
            Skill Match — {position}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {matchedSkills.length} matched skills · {gapSkills.length} gaps · {overallMatch}% overall fit
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: companyColors[1] }} />
            <span className="text-xs text-white font-medium">{companyLabel}</span>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
            {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      <div className="relative" style={{ height: H }}
        onMouseEnter={() => setMouseInGraph(true)}
        onMouseLeave={() => { setMouseInGraph(false); setHovered(null); }}
      >
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} className="select-none">
          <defs>
            <radialGradient id="psg-sun" cx="50%" cy="50%">
              <stop offset="0%" stopColor={companyColors[0]} />
              <stop offset="35%" stopColor={companyColors[1]} />
              <stop offset="70%" stopColor={companyColors[2]} />
              <stop offset="100%" stopColor={companyColors[3] || companyColors[2]} />
            </radialGradient>
            <radialGradient id="psg-corona" cx="50%" cy="50%">
              <stop offset="0%" stopColor={companyGlow} />
              <stop offset="50%" stopColor={companyGlow.replace(/[\d.]+\)$/, "0.06)")} />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
            <filter id="psg-blur" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="12" />
            </filter>
            <filter id="psg-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
            <filter id="psg-star" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <style>{`
              @keyframes psgPulse { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
              @keyframes psgTwinkle { 0%,100% { opacity:0.2; } 50% { opacity:0.8; } }
              @keyframes psgGap { 0%,100% { opacity:0.35; } 50% { opacity:0.75; } }
              .psg-pulse { animation: psgPulse 3s ease-in-out infinite; }
              .psg-twinkle { animation: psgTwinkle 3s ease-in-out infinite; }
              .psg-gap { animation: psgGap 2s ease-in-out infinite; }
            `}</style>
          </defs>

          {/* Stars */}
          {starsRef.current.map((s, i) => (
            <circle key={`s${i}`} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.o}
              className={i % 7 === 0 ? "psg-twinkle" : undefined}
              style={i % 7 === 0 ? { animationDelay: `${(i * 0.4) % 5}s` } : undefined}
            />
          ))}

          {/* Orbit rings */}
          <ellipse cx={CX} cy={CY} rx={matchOrbit - 20} ry={(matchOrbit - 20) * 0.45} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          <ellipse cx={CX} cy={CY} rx={matchOrbit} ry={matchOrbit * 0.45} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          <ellipse cx={CX} cy={CY} rx={matchOrbit + 25} ry={(matchOrbit + 25) * 0.45} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          <ellipse cx={CX} cy={CY} rx={gapOrbit} ry={gapOrbit * 0.45} fill="none" stroke="rgba(239,83,80,0.08)" strokeWidth={1} strokeDasharray="4,8" />

          {/* Connection lines on hover */}
          {hovered && (() => {
            const ms = matchedSkills.find(s => s.id === hovered);
            const gs = gapSkills.find(g => g.id === hovered);
            if (ms) {
              const pos = getPos(ms.id, getMatchOrbit(ms.fit));
              return <line x1={pos.x} y1={pos.y} x2={CX} y2={CY} stroke={`${companyColors[1]}44`} strokeWidth={1.5} />;
            }
            if (gs) {
              const pos = getPos(gs.id, gapOrbit);
              return <line x1={pos.x} y1={pos.y} x2={CX} y2={CY} stroke="rgba(239,83,80,0.35)" strokeWidth={1.5} strokeDasharray="5,4" />;
            }
            return null;
          })()}

          {/* Sun corona */}
          <circle cx={CX} cy={CY} r={85} fill="url(#psg-corona)" className="psg-pulse" />
          <circle cx={CX} cy={CY} r={55} fill={companyGlow.replace(/[\d.]+\)$/, "0.1)")} filter="url(#psg-blur)" />

          {/* Sun — the position */}
          <g style={{ cursor: "default" }}>
            <circle cx={CX} cy={CY} r={40} fill="url(#psg-sun)" />
            <circle cx={CX} cy={CY} r={40} fill="none" stroke={`${companyColors[0]}66`} strokeWidth={1.5} />
            <text x={CX} y={CY - 2} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff"
              style={{ pointerEvents: "none", fontFamily: "var(--font-sans)", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>
              {position.split(" ").map(w => w[0]).join("")}
            </text>
            <text x={CX} y={CY + 12} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.6)"
              style={{ pointerEvents: "none", fontFamily: "var(--font-sans)" }}>
              {companyLabel}
            </text>
            <text x={CX} y={CY + 56} textAnchor="middle" fontSize={11} fontWeight={600}
              fill={companyColors[1]}
              style={{ pointerEvents: "none", fontFamily: "var(--font-display)" }}>
              {position}
            </text>
          </g>

          {/* Matched skills */}
          {matchedSkills.map(skill => {
            const orbit = getMatchOrbit(skill.fit);
            const pos = getPos(skill.id, orbit);
            const isHov = hovered === skill.id;
            const highlighted = !hovered || hovered === skill.id;
            const r = isHov ? 17 : 11 + (skill.fit / 100) * 5;
            const gradId = `psg-g-${skill.id}`;

            return (
              <g key={skill.id}
                onPointerEnter={() => setHovered(skill.id)}
                onPointerLeave={() => setHovered(null)}
                style={{ cursor: "pointer", opacity: highlighted ? 1 : 0.2, transition: "opacity 0.25s" }}
              >
                <defs>
                  <radialGradient id={gradId} cx="35%" cy="35%">
                    <stop offset="0%" stopColor={skill.colors[0]} />
                    <stop offset="60%" stopColor={skill.colors[1]} />
                    <stop offset="100%" stopColor={skill.colors[2]} />
                  </radialGradient>
                </defs>

                {isHov && <circle cx={pos.x} cy={pos.y} r={r + 12} fill={skill.glow} filter="url(#psg-glow)" />}
                <circle cx={pos.x} cy={pos.y} r={r} fill={`url(#${gradId})`} />
                <circle cx={pos.x - r * 0.25} cy={pos.y - r * 0.25} r={r * 0.3} fill="rgba(255,255,255,0.2)" />

                {isHov && (
                  <>
                    <circle cx={pos.x} cy={pos.y} r={r + 5} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
                    <circle cx={pos.x} cy={pos.y} r={r + 5} fill="none" stroke={skill.colors[0]} strokeWidth={2}
                      strokeDasharray={`${(skill.proficiency / 100) * TAU * (r + 5)} ${TAU * (r + 5)}`}
                      strokeLinecap="round" transform={`rotate(-90 ${pos.x} ${pos.y})`}
                    />
                  </>
                )}

                <text x={pos.x} y={pos.y + r + 13} textAnchor="middle" fontSize={9.5} fontWeight={600}
                  fill="rgba(255,255,255,0.85)" style={{ pointerEvents: "none", fontFamily: "var(--font-sans)" }}>
                  {skill.label}
                </text>
                <text x={pos.x} y={pos.y + r + 24} textAnchor="middle" fontSize={8} fontWeight={500}
                  fill={skill.fit >= 85 ? "rgba(129,199,132,0.8)" : skill.fit >= 70 ? "rgba(255,213,79,0.7)" : "rgba(255,138,101,0.6)"}
                  style={{ pointerEvents: "none", fontFamily: "var(--font-sans)" }}>
                  {skill.fit}% fit
                </text>
              </g>
            );
          })}

          {/* Gap skills */}
          {gapSkills.map((gap, i) => {
            const pos = getPos(gap.id, gapOrbit);
            const isHov = hovered === gap.id;
            const highlighted = !hovered || hovered === gap.id;
            const r = isHov ? 12 : 8 + (gap.importance / 100) * 3;

            return (
              <g key={gap.id}
                onPointerEnter={() => setHovered(gap.id)}
                onPointerLeave={() => setHovered(null)}
                style={{ cursor: "pointer", opacity: highlighted ? 1 : 0.25, transition: "opacity 0.25s" }}
              >
                <circle cx={pos.x} cy={pos.y} r={r + 8} fill={gap.glow}
                  filter="url(#psg-glow)" className="psg-gap"
                  style={{ animationDelay: `${i * 0.4}s` }}
                />
                <circle cx={pos.x} cy={pos.y} r={r} fill={gap.colors[1]} />
                <circle cx={pos.x - r * 0.3} cy={pos.y - r * 0.2} r={r * 0.3} fill={gap.colors[0]} opacity={0.5} />
                <circle cx={pos.x} cy={pos.y} r={r + 2} fill="none" stroke="rgba(239,83,80,0.35)" strokeWidth={1} strokeDasharray="3,3" />

                <text x={pos.x} y={pos.y + r + 13} textAnchor="middle" fontSize={9} fontWeight={600}
                  fill="rgba(239,83,80,0.8)" style={{ pointerEvents: "none", fontFamily: "var(--font-sans)" }}>
                  {gap.label}
                </text>
                <text x={pos.x} y={pos.y + r + 23} textAnchor="middle" fontSize={7.5} fontWeight={500}
                  fill="rgba(239,83,80,0.5)" style={{ pointerEvents: "none", fontFamily: "var(--font-sans)" }}>
                  {gap.importance}% needed
                </text>
              </g>
            );
          })}

          {/* Unrelated skills — dim but readable */}
          {unrelatedSkills.map((s, i) => {
            const angle = (i / Math.max(unrelatedSkills.length, 1)) * Math.PI - Math.PI / 4;
            const ux = W * 0.82 + Math.cos(angle) * 50;
            const uy = H * 0.18 + i * (H * 0.64 / Math.max(unrelatedSkills.length, 1));
            return (
              <g key={s.id} style={{ opacity: 0.45 }}>
                <circle cx={ux} cy={uy} r={8} fill={s.colors[1]} opacity={0.35} />
                <circle cx={ux} cy={uy} r={5.5} fill={s.colors[1]} opacity={0.6} />
                <circle cx={ux - 1.5} cy={uy - 1.5} r={2} fill={s.colors[0]} opacity={0.3} />
                <text x={ux} y={uy + 16} textAnchor="middle" fontSize={9} fontWeight={600}
                  fill="rgba(255,255,255,0.35)" style={{ pointerEvents: "none", fontFamily: "var(--font-sans)" }}>
                  {s.label}
                </text>
              </g>
            );
          })}

          {/* Labels */}
          {gapSkills.length > 0 && (
            <text x={CX} y={CY - gapOrbit * 0.45 - 10} textAnchor="middle" fontSize={9} fontWeight={600}
              fill="rgba(239,83,80,0.4)" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.12em" }}>
              SKILLS TO LEARN
            </text>
          )}
          {unrelatedSkills.length > 0 && (
            <text x={W * 0.84} y={H * 0.1} textAnchor="middle" fontSize={9} fontWeight={600}
              fill="rgba(255,255,255,0.18)" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.1em" }}>
              NOT REQUIRED
            </text>
          )}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
          {[
            { emoji: "☀", label: position, color: companyColors[1] },
            { emoji: "🪐", label: "Matched Skills", color: "#64B5F6" },
            { emoji: "☄", label: "Need to Learn", color: "#EF5350" },
            { emoji: "✦", label: "Not Required", color: "rgba(255,255,255,0.35)" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1">
              <span className="text-[10px]">{l.emoji}</span>
              <span className="text-[10px] font-medium" style={{ color: l.color }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Pause indicator */}
        {mouseInGraph && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1">
            <div className="flex gap-0.5">
              <div className="w-1 h-3 bg-white/50 rounded-sm" />
              <div className="w-1 h-3 bg-white/50 rounded-sm" />
            </div>
            <span className="text-[10px] text-white/50 font-medium">Paused</span>
          </div>
        )}

        {/* Tooltip */}
        {hovered && (
          <div className="absolute top-3 right-3 bg-[rgba(10,14,26,0.95)] backdrop-blur border border-white/10 rounded-xl shadow-2xl p-4 w-56 pointer-events-none">
            {(() => {
              const ms = matchedSkills.find(s => s.id === hovered);
              if (ms) {
                return (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded-full" style={{ background: ms.colors[0] }} />
                      <span className="text-sm font-bold text-white">{ms.label}</span>
                      <span className="ml-auto text-xs font-medium" style={{ color: ms.colors[0] }}>{ms.proficiency}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                      <div className="h-full rounded-full" style={{ width: `${ms.proficiency}%`, background: `linear-gradient(90deg, ${ms.colors[0]}, ${ms.colors[1]})` }} />
                    </div>
                    <div className="border-t border-white/10 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Match to {position}</span>
                        <span className="font-bold" style={{ color: ms.fit >= 85 ? "#81C784" : ms.fit >= 70 ? "#FFD54F" : "#FF8A65" }}>{ms.fit}%</span>
                      </div>
                    </div>
                  </>
                );
              }
              const gs = gapSkills.find(g => g.id === hovered);
              if (gs) {
                return (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded-full bg-red-500" />
                      <span className="text-sm font-bold text-white">{gs.label}</span>
                    </div>
                    <p className="text-xs text-red-400 mb-1">You don't have this skill yet</p>
                    <div className="border-t border-white/10 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Importance for {position}</span>
                        <span className="font-bold text-red-400">{gs.importance}%</span>
                      </div>
                    </div>
                  </>
                );
              }
              return null;
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
