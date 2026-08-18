#!/usr/bin/env python3
"""CareerX-Ray — technical architecture: components, boundaries, typed data flow."""

import os
from html import escape as _esc

BG      = "#051715"
BG2     = "#08231f"
PANEL   = "#0b302b"
PANEL2  = "#0e3a33"
INK     = "#edf8f5"
MUTED   = "#a6c5bf"
FAINT   = "#6f9690"
LINE    = "#2f4f4a"
GOLD    = "#ffcb0c"
TEAL    = "#55e3d2"
RED     = "#ff7870"
GREEN   = "#75e4a8"
BLUE    = "#7db9ff"
VIOLET  = "#c4a7ff"

MONO = "'JetBrains Mono','SF Mono',SFMono-Regular,Menlo,Consolas,monospace"
SANS = "'PingFang SC','Hiragino Sans GB','Noto Sans SC',-apple-system,'Helvetica Neue',sans-serif"

ARROW_COLORS = {"gold": GOLD, "teal": TEAL, "red": RED, "muted": FAINT, "blue": BLUE, "violet": VIOLET}


def esc(s):
    return _esc(str(s), quote=True)


class Svg:
    def __init__(self, w, h):
        self.w, self.h, self.o = w, h, []

    def rect(self, x, y, w, h, fill=None, stroke=None, sw=1, rx=10, dash=None, op=None):
        a = f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}"'
        a += f' fill="{fill}"' if fill else ' fill="none"'
        if op is not None:
            a += f' fill-opacity="{op}"'
        if stroke:
            a += f' stroke="{stroke}" stroke-width="{sw}"'
        if dash:
            a += f' stroke-dasharray="{dash}"'
        self.o.append(a + "/>")

    def text(self, x, y, s, size=12, fill=INK, font=SANS, weight="400",
             anchor="start", spacing=None):
        a = (f'<text x="{x:.1f}" y="{y:.1f}" font-family="{font}" font-size="{size}" '
             f'fill="{fill}" font-weight="{weight}" text-anchor="{anchor}"')
        if spacing:
            a += f' letter-spacing="{spacing}"'
        self.o.append(a + f'>{esc(s)}</text>')

    def path(self, d, stroke=FAINT, sw=1.4, dash=None, marker="muted"):
        a = f'<path d="{d}" fill="none" stroke="{stroke}" stroke-width="{sw}"'
        if dash:
            a += f' stroke-dasharray="{dash}"'
        if marker:
            a += f' marker-end="url(#ar-{marker})"'
        self.o.append(a + "/>")

    def line(self, x1, y1, x2, y2, stroke=LINE, sw=1, dash=None):
        a = f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{stroke}" stroke-width="{sw}"'
        if dash:
            a += f' stroke-dasharray="{dash}"'
        self.o.append(a + "/>")

    def out(self):
        markers = "".join(
            f'<marker id="ar-{k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" '
            f'markerHeight="6.5" orient="auto-start-reverse">'
            f'<path d="M 0 0 L 10 5 L 0 10 z" fill="{v}"/></marker>'
            for k, v in ARROW_COLORS.items())
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" height="{self.h}" '
            f'viewBox="0 0 {self.w} {self.h}"><defs>{markers}'
            '<pattern id="dots" width="56" height="56" patternUnits="userSpaceOnUse">'
            f'<circle cx="2" cy="2" r="1" fill="{GOLD}" fill-opacity="0.07"/></pattern></defs>'
            f'<rect width="{self.w}" height="{self.h}" fill="{BG}"/>'
            f'<rect width="{self.w}" height="{self.h}" fill="url(#dots)"/>'
            + "".join(self.o) + "</svg>")


def zone(s, x, y, w, h, label, sub=None, color=LINE, dash="6 5"):
    s.rect(x, y, w, h, fill=BG2, op=0.5, rx=14)
    s.rect(x, y, w, h, stroke=color, sw=1.4, dash=dash, rx=14)
    s.text(x + 18, y + 24, label, size=10, fill=color, font=MONO, weight="700", spacing="0.15em")
    if sub:
        s.text(x + 18 + len(label) * 7.6 + 18, y + 24, sub, size=10, fill=FAINT, font=MONO)


def box(s, x, y, w, h, title, path=None, lines=(), accent=TEAL, fill=PANEL, chip=None):
    s.rect(x, y, w, h, fill=fill, stroke=accent, sw=1.2, rx=10)
    s.rect(x, y, 3, h, fill=accent, rx=0)
    s.text(x + 16, y + 25, title, size=14, fill=INK, font=SANS, weight="700", spacing="-0.01em")
    ty = y + 25
    if path:
        ty += 17
        s.text(x + 16, ty, path, size=9.5, fill=accent, font=MONO)
    for ln in lines:
        ty += 16
        s.text(x + 16, ty, ln, size=10.5, fill=MUTED, font=MONO)
    if chip:
        cw = len(chip) * 5.8 + 14
        s.rect(x + w - cw - 12, y + 11, cw, 17, fill=BG, stroke=accent, sw=1, rx=5)
        s.text(x + w - cw / 2 - 12, y + 23, chip, size=8, fill=accent, font=MONO,
               weight="700", anchor="middle", spacing="0.06em")


def elbow(s, x1, y1, x2, y2, label=None, color="muted", dash=None, mid=None, side="right"):
    """Orthogonal connector: vertical, horizontal, vertical."""
    c = ARROW_COLORS[color]
    my = mid if mid is not None else (y1 + y2) / 2
    d = f"M {x1:.1f} {y1:.1f} L {x1:.1f} {my:.1f} L {x2:.1f} {my:.1f} L {x2:.1f} {y2:.1f}"
    s.path(d, stroke=c, dash=dash, marker=color)
    if label:
        lx = (x1 + x2) / 2
        anchor = "middle"
        s.text(lx, my - 7, label, size=9.5, fill=c, font=MONO, anchor=anchor)


def vline(s, x, y1, y2, label=None, color="muted", dash=None, lx=None, la="start"):
    c = ARROW_COLORS[color]
    s.path(f"M {x:.1f} {y1:.1f} L {x:.1f} {y2:.1f}", stroke=c, dash=dash, marker=color)
    if label:
        s.text(lx if lx is not None else x + 10, (y1 + y2) / 2 + 4, label,
               size=9.5, fill=c, font=MONO, anchor=la)


def hline(s, x1, x2, y, label=None, color="muted", dash=None):
    c = ARROW_COLORS[color]
    s.path(f"M {x1:.1f} {y:.1f} L {x2:.1f} {y:.1f}", stroke=c, dash=dash, marker=color)
    if label:
        s.text((x1 + x2) / 2, y - 8, label, size=9.5, fill=c, font=MONO, anchor="middle")


# ══════════════════════════════════════════════════════════════════
W, H = 2040, 1560
s = Svg(W, H)
M = 60
CW = W - 2 * M

# ── Title ────────────────────────────────────────────────────────
s.rect(M, 46, 9, 9, fill=GOLD, rx=0)
s.text(M + 20, 55, "TECHNICAL ARCHITECTURE", size=10.5, fill=GOLD, font=MONO,
       weight="700", spacing="0.2em")
s.text(M, 96, "CareerX-Ray", size=34, fill=INK, font=SANS, weight="700", spacing="-0.03em")
s.text(M + 232, 96, "React 18 · TypeScript · Vite 6 · one Vercel function",
       size=14, fill=MUTED, font=SANS)
s.text(W - M, 96, "commit 9e4ec89", size=11, fill=FAINT, font=MONO, anchor="end")
s.line(M, 118, W - M, 118, stroke=LINE)

# ── Zone: delivery ───────────────────────────────────────────────
dz_y, dz_h = 140, 96
zone(s, M, dz_y, CW, dz_h, "DELIVERY", "static · no origin server", color=FAINT)
box(s, M + 22, dz_y + 36, 470, 46, "Vite 6 build", None,
    ["hashed immutable assets"], accent=FAINT)
box(s, M + 528, dz_y + 36, 470, 46, "Vercel Edge CDN", None,
    ["TLS 1.3 · HSTS · no cookies"], accent=FAINT)
box(s, M + 1034, dz_y + 36, CW - 1056, 46, "index.html", None,
    ["single entry · client-side routing only"], accent=FAINT)

# ── Zone: browser runtime ────────────────────────────────────────
bz_y, bz_h = 274, 742
zone(s, M, bz_y, CW, bz_h, "BROWSER RUNTIME", "untrusted · all product logic executes here", color=RED)
ix, iw = M + 24, CW - 48

# App shell
app_y, app_h = bz_y + 44, 66
box(s, ix, app_y, iw, app_h, "App.tsx — state-machine router", "src/app/App.tsx",
    ["appState: landing → auth → role-select → onboarding → app     ·     role: candidate | employer | university     ·     page: 29     ·     history: Page[]"],
    accent=GOLD, chip="SHELL")

# Providers
pv_y, pv_h = app_y + app_h + 58, 132
pw = (iw - 24) / 2
box(s, ix, pv_y, pw, pv_h, "IntelligenceProvider", "src/app/state/intelligence.tsx",
    ["state   HiringSignal[]  { skill, reason, role,",
     "                          employer, stage, live }",
     "write   emitSignal()      — HiringPipeline only",
     "pure    normalizeSkill()  — free text → 1 of 9"],
    accent=TEAL, chip="CONTEXT")
box(s, ix + pw + 24, pv_y, pw, pv_h, "CareerProfileProvider", "src/app/state/careerProfile.tsx",
    ["state   CareerProfile  { dnaScores, resume,",
     "                         evidence[], calibration }",
     "derive  risks · targetGaps · scorecard  (useMemo)",
     "write   setProfile() · addEvidence() · setResume()"],
    accent=TEAL, chip="CONTEXT")

vline(s, ix + iw / 2, app_y + app_h, pv_y - 4, "mounts", "muted")

# Surfaces
sf_y, sf_h = pv_y + pv_h + 62, 84
sw_ = (iw - 2 * 20) / 3
box(s, ix, sf_y, sw_, sf_h, "Candidate surface", "18 pages",
    ["Command Center · Dashboard · DNA · Blind Spots",
     "Decision Lab · Offers · Prescription · Coach · Jobs"],
    accent=BLUE, chip="READS")
box(s, ix + sw_ + 20, sf_y, sw_, sf_h, "Employer surface", "6 pages",
    ["Hiring Pipeline · Smart Matching · SLA Monitor",
     "Re-engagement · Workforce Resilience"],
    accent=GOLD, chip="WRITES")
box(s, ix + 2 * (sw_ + 20), sf_y, sw_, sf_h, "University surface", "5 pages",
    ["Ecosystem Insights · Curriculum Engine",
     "Outcome Loop · Internships · Learning Wallet"],
    accent=BLUE, chip="READS")

# provider ↔ surface edges
emp_cx = ix + sw_ + 20 + sw_ / 2
cand_cx = ix + sw_ / 2
uni_cx = ix + 2 * (sw_ + 20) + sw_ / 2
ix_cx = ix + pw / 2
cp_cx = ix + pw + 24 + pw / 2

elbow(s, emp_cx, sf_y, ix_cx, pv_y + pv_h + 4, "emitSignal(reason, role, employer, stage)",
      color="gold", mid=sf_y - 34)
# Candidate sits directly under the provider, so this one is a straight drop.
vline(s, cand_cx, pv_y + pv_h, sf_y - 4, "aggregate counts only", "teal",
      dash="4 3", lx=cand_cx - 14, la="end")
elbow(s, ix_cx + 150, pv_y + pv_h, uni_cx, sf_y - 4, "skill clusters only",
      color="teal", dash="4 3", mid=sf_y - 26)
vline(s, cp_cx, pv_y + pv_h, sf_y - 4, "CareerProfile · risks · scorecard", "teal", lx=cp_cx + 10)

# Pure logic
lg_y, lg_h = sf_y + sf_h + 60, 118
lw = (iw - 4 * 16) / 5
libs = [
    ("roleFamily.ts", "detectRoleFamily()", ["8 families · one regex set", "toMarketFamily / toSkillFamily"]),
    ("careerRisk.ts", "deriveRisks()", ["deriveTargetGaps()", "deriveScorecard() · parseMonthlyRM()"]),
    ("careerDna.js", "getArchetypeForScores()", ["6 dimensions → 12 archetypes", "getTopDimensions()"]),
    ("resumeParse.ts", "analyzeResume()", ["extractPdfText() · rejectReasonFor()", "parseResumeRuleBased()"]),
    ("resumeGen.ts", "buildResumeForRole()", ["buildResumeForJob()", "buildCoverLetterForJob()"]),
]
for i, (name, fn, ls) in enumerate(libs):
    x = ix + i * (lw + 16)
    box(s, x, lg_y, lw, lg_h, name, fn, ls, accent=GREEN, chip="PURE" if i != 3 else "I/O")

s.text(ix, lg_y - 16, "src/app/lib — pure functions, no state, no I/O except the marked one",
       size=10, fill=FAINT, font=MONO)
vline(s, cand_cx, sf_y + sf_h, lg_y - 4, "calls", "muted")

# unpdf
up_y = lg_y + lg_h + 26
box(s, ix + 3 * (lw + 16), up_y, lw, 46, "unpdf (pdf.js)", None,
    ["PDF → text, in-page"], accent=VIOLET, chip="VENDOR")
vline(s, ix + 3 * (lw + 16) + lw / 2, lg_y + lg_h, up_y - 4, None, "violet")

# ── Network boundary ─────────────────────────────────────────────
CORRIDOR = bz_y + bz_h            # bottom of the browser zone
REQ_Y = CORRIDOR + 26             # horizontal run: request
RES_Y = CORRIDOR + 56             # horizontal run: response
nb_y = CORRIDOR + 86              # the boundary itself
sz_y, sz_h = nb_y + 30, 158

s.line(M, nb_y, W - M, nb_y, stroke=RED, sw=1.2, dash="8 6")
s.rect(W - M - 560, nb_y - 15, 560, 30, fill=BG, stroke=RED, sw=1, rx=8)
s.text(W - M - 280, nb_y + 5, "NETWORK BOUNDARY — extracted text only, never the file",
       size=10.5, fill=RED, font=MONO, weight="700", anchor="middle", spacing="0.05em")

fn_cx = M + 24 + 3 * (lw + 16) + lw / 2     # resumeParse.ts / unpdf column
api_x, api_w = M + 24, 880
req_x, res_x = api_x + 380, api_x + 500

# request: resumeParse → function
s.path(f"M {fn_cx - 40} {up_y + 46} L {fn_cx - 40} {REQ_Y} L {req_x} {REQ_Y} L {req_x} {sz_y + 40}",
       stroke=GOLD, marker="gold")
s.text(fn_cx - 54, REQ_Y - 9, "POST /api/analyze-resume   { text: string }  ≤ 24k chars",
       size=9.5, fill=GOLD, font=MONO, anchor="end")

# response: function → resumeParse
s.path(f"M {res_x} {sz_y + 40} L {res_x} {RES_Y} L {fn_cx + 40} {RES_Y} L {fn_cx + 40} {up_y + 46}",
       stroke=GREEN, dash="4 3", marker="teal")
s.text(fn_cx + 54, RES_Y + 15, "200 → fields merged over the rule-based baseline   ·   503 / 502 → rule engine stands",
       size=9.5, fill=GREEN, font=MONO, anchor="end")

# ── Zone: serverless ─────────────────────────────────────────────
zone(s, M, sz_y, CW, sz_h, "VERCEL SERVERLESS (NODE)", "the only server-side code in the project", color=GOLD)
box(s, M + 24, sz_y + 40, 880, 100, "api/analyze-resume.ts", "Node runtime",
    ["reads  process.env.ANTHROPIC_API_KEY  (never shipped to client)",
     "503 when unset → client falls back to its rule engine",
     "502 on any model/transport failure → same fallback"],
    accent=GOLD, chip="FUNCTION")
box(s, M + 936, sz_y + 40, CW - 960, 100, "Anthropic Messages API", "claude-sonnet-5",
    ["tool_choice: { type: 'tool', name: 'record_resume_fields' }",
     "extraction only — the model never produces a score",
     "system prompt forbids inventing employers or credentials"],
    accent=VIOLET, chip="EXTERNAL")
hline(s, M + 906, M + 930, sz_y + 96, None, "violet")
s.text(M + 918, sz_y + 32, "messages.create", size=9, fill=VIOLET, font=MONO, anchor="middle")

# ── Derivation chain ─────────────────────────────────────────────
dv_y = sz_y + sz_h + 62
s.text(M, dv_y + 4, "DERIVATION CHAIN — every screen number resolves through this path",
       size=10, fill=GOLD, font=MONO, weight="700", spacing="0.14em")
chain = [
    ("PDF File", "user picks it", VIOLET),
    ("string", "extractPdfText()", VIOLET),
    ("ParsedResume", "AI or rule engine", GREEN),
    ("CareerProfile", "+ calibration + evidence", TEAL),
    ("Risk[] · TargetGap[]", "deriveRisks / deriveTargetGaps", GOLD),
    ("Scorecard", "deriveScorecard()", GOLD),
    ("Rendered UI", "one source, no duplicates", BLUE),
]
cy = dv_y + 26
cwid = (CW - 6 * 46) / 7
for i, (t, sub, c) in enumerate(chain):
    x = M + i * (cwid + 46)
    s.rect(x, cy, cwid, 58, fill=PANEL, stroke=c, sw=1.2, rx=9)
    s.text(x + 14, cy + 24, t, size=12.5, fill=INK, font=MONO, weight="700")
    s.text(x + 14, cy + 42, sub, size=9.5, fill=MUTED, font=MONO)
    if i < 6:
        hline(s, x + cwid + 6, x + cwid + 40, cy + 29, None, "muted")

# ── Legend ───────────────────────────────────────────────────────
lg2_y = cy + 58 + 40
s.line(M, lg2_y, W - M, lg2_y, stroke=LINE)
legend = [
    ("solid arrow", "writes / calls", FAINT),
    ("dashed arrow", "reads a narrowed projection", TEAL),
    ("dashed border", "trust boundary", RED),
    ("PURE", "no state, no I/O — deterministic", GREEN),
    ("EXTERNAL", "third party, outside our control", VIOLET),
]
for i, (k, v, c) in enumerate(legend):
    x = M + i * (CW / 5)
    s.rect(x, lg2_y + 18, 8, 8, fill=c, rx=2)
    s.text(x + 16, lg2_y + 26, k, size=9.5, fill=c, font=MONO, weight="700")
    s.text(x + 16, lg2_y + 41, v, size=9.5, fill=FAINT, font=MONO)

fy = lg2_y + 66
s.line(M, fy, W - M, fy, stroke=LINE)
s.text(M, fy + 24, "CareerX-Ray · Talentbank Tech Hackathon 2026", size=10, fill=FAINT, font=MONO)
s.text(W - M, fy + 24, "github.com/yantongggg/careerx-ray", size=10, fill=FAINT,
       font=MONO, anchor="end")

FINAL_H = fy + 56
out = s.out().replace(f'height="{H}"', f'height="{FINAL_H}"', 1)
out = out.replace(f"0 0 {W} {H}", f"0 0 {W} {FINAL_H}")
out = out.replace(f'<rect width="{W}" height="{H}"', f'<rect width="{W}" height="{FINAL_H}"')

OUT = os.path.dirname(os.path.abspath(__file__))
p = os.path.join(OUT, "careerxray-technical-architecture.svg")
open(p, "w").write(out)
print("wrote", p, W, FINAL_H)
