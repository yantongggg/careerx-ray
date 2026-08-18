#!/usr/bin/env python3
"""CareerX-Ray system architecture, in the Malaysia blueprint visual language."""

from html import escape as _esc

# ── Palette lifted from technical-orchestration-malaysia.html ──
BG      = "#051715"
BG2     = "#08231f"
PANEL   = "#0a2d28"
PANEL2  = "#0d3731"
INK     = "#edf8f5"
MUTED   = "#a6c5bf"
FAINT   = "#6f9690"
LINE    = "#2f4f4a"
LINE_HI = "#3d635c"
GOLD    = "#ffcb0c"
GOLD_BG = "#1c2618"
TEAL    = "#55e3d2"
TEAL_BG = "#0d322f"
RED     = "#ff7870"
RED_BG  = "#26201f"
GREEN   = "#75e4a8"
BLUE    = "#7db9ff"

MONO = "'JetBrains Mono','SF Mono',SFMono-Regular,Menlo,Consolas,monospace"
SANS = "'PingFang SC','Hiragino Sans GB','Noto Sans SC','DM Sans',-apple-system,'Helvetica Neue',sans-serif"


def esc(s):
    return _esc(str(s), quote=True)


class Svg:
    def __init__(self, w, h):
        self.w, self.h, self.o = w, h, []

    def rect(self, x, y, w, h, fill=None, stroke=None, sw=1, rx=13, dash=None, op=None):
        a = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}"'
        a += f' fill="{fill}"' if fill else ' fill="none"'
        if op is not None:
            a += f' fill-opacity="{op}"'
        if stroke:
            a += f' stroke="{stroke}" stroke-width="{sw}"'
        if dash:
            a += f' stroke-dasharray="{dash}"'
        self.o.append(a + "/>")

    def text(self, x, y, s, size=12, fill=INK, font=SANS, weight="400",
             anchor="start", spacing=None, upper=False, op=None):
        s = s.upper() if upper else s
        a = (f'<text x="{x}" y="{y}" font-family="{font}" font-size="{size}" '
             f'fill="{fill}" font-weight="{weight}" text-anchor="{anchor}"')
        if spacing:
            a += f' letter-spacing="{spacing}"'
        if op is not None:
            a += f' fill-opacity="{op}"'
        self.o.append(a + f'>{esc(s)}</text>')

    def line(self, x1, y1, x2, y2, stroke=LINE, sw=1, dash=None):
        a = f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}"'
        if dash:
            a += f' stroke-dasharray="{dash}"'
        self.o.append(a + "/>")

    def diamond(self, cx, cy, r, fill):
        self.o.append(
            f'<rect x="{cx-r}" y="{cy-r}" width="{2*r}" height="{2*r}" fill="{fill}" '
            f'transform="rotate(45 {cx} {cy})"/>')

    def out(self):
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" height="{self.h}" '
            f'viewBox="0 0 {self.w} {self.h}">'
            '<defs>'
            f'<radialGradient id="glowGold" cx="80%" cy="0%" r="55%">'
            f'<stop offset="0%" stop-color="{GOLD}" stop-opacity="0.13"/>'
            f'<stop offset="100%" stop-color="{GOLD}" stop-opacity="0"/></radialGradient>'
            f'<radialGradient id="glowTeal" cx="0%" cy="55%" r="55%">'
            f'<stop offset="0%" stop-color="{TEAL}" stop-opacity="0.09"/>'
            f'<stop offset="100%" stop-color="{TEAL}" stop-opacity="0"/></radialGradient>'
            '<pattern id="dots" width="56" height="56" patternUnits="userSpaceOnUse">'
            f'<circle cx="2" cy="2" r="1.1" fill="{GOLD}" fill-opacity="0.09"/></pattern>'
            '</defs>'
            f'<rect width="{self.w}" height="{self.h}" fill="{BG}"/>'
            f'<rect width="{self.w}" height="{self.h}" fill="url(#glowGold)"/>'
            f'<rect width="{self.w}" height="{self.h}" fill="url(#glowTeal)"/>'
            f'<rect width="{self.w}" height="{self.h}" fill="url(#dots)"/>'
            + "".join(self.o) + "</svg>"
        )


def eyebrow(s, x, y, label, color=GOLD):
    """Gold rotated square + tracked mono label, as in the source page."""
    s.diamond(x + 4, y - 4, 4, color)
    s.text(x + 16, y, label, size=10.5, fill=color, font=MONO, weight="700",
           spacing="0.2em", upper=True)


def section_head(s, x, y, num, title, sub=None, w=None):
    s.text(x, y, num, size=10, fill=GOLD, font=MONO, weight="700", spacing="0.18em")
    s.text(x, y + 34, title, size=27, fill=INK, font=SANS, weight="700", spacing="-0.03em")
    if sub:
        s.text(x, y + 58, sub, size=13, fill=MUTED, font=SANS)
    if w:
        s.line(x, y + 76, x + w, y + 76, stroke=LINE)


def node(s, x, y, w, h, tag, title, lines, accent=GOLD, fill=PANEL, border=LINE,
         chip=None, chip_color=TEAL):
    s.rect(x, y, w, h, fill=fill, stroke=border, sw=1, rx=13)
    s.text(x + 18, y + 30, tag, size=9, fill=accent, font=MONO, weight="700",
           spacing="0.12em", upper=True)
    s.text(x + 18, y + 62, title, size=15.5, fill=INK, font=SANS, weight="700", spacing="-0.02em")
    cy = y + 84
    for ln in lines:
        s.text(x + 18, cy, ln, size=11, fill=MUTED, font=SANS)
        cy += 16
    if chip:
        cw = len(chip) * 5.6 + 16
        s.rect(x + w - cw - 16, y + 16, cw, 18, fill=BG2, stroke=chip_color, sw=1, rx=6)
        s.text(x + w - cw / 2 - 16, y + 29, chip, size=8, fill=chip_color, font=MONO,
               weight="700", anchor="middle", spacing="0.08em", upper=True)


def arrow(s, x, y, color=GOLD):
    s.text(x, y, "→", size=15, fill=color, font=MONO, weight="700", anchor="middle")


# ══════════════════════════════════════════════════════════════════
def build():
    W, H = 1900, 1420
    s = Svg(W, H)
    M = 64                      # page margin
    CW = W - 2 * M              # content width

    # ── Masthead ─────────────────────────────────────────────────
    eyebrow(s, M, 74, "System architecture · Malaysia validation build")
    s.text(M, 148, "先证明可信，再预测未来。", size=54, fill=INK, font=SANS,
           weight="700", spacing="-0.04em")
    s.text(M, 190, "Every number on screen can be traced back to something the candidate actually gave us.",
           size=16, fill=MUTED, font=SANS)

    # Truth line — three facts, as in the reference's .truth-line
    ty = 216
    tw = (CW - 2) / 3
    for i, (k, v) in enumerate([
        ("Runs in the browser", "React 18 · Vite 6 · one serverless function"),
        ("Scoring", "Deterministic rules. The model extracts, it never scores."),
        ("Market layer", "Authored Malaysian datasets · docs/data-sources.md"),
    ]):
        x = M + i * (tw + 1)
        s.rect(x, ty, tw, 62, fill=BG2, stroke=LINE, sw=1, rx=0 if 0 < i < 2 else 10)
        s.text(x + 18, ty + 24, k, size=9, fill=FAINT, font=MONO, weight="700",
               spacing="0.1em", upper=True)
        s.text(x + 18, ty + 45, v, size=12.5, fill=INK, font=SANS)

    # ── 01 · Complete flow ───────────────────────────────────────
    y = 330
    section_head(s, M, y, "01 / COMPLETE FLOW",
                 "从资料到结果，每一步都能被追问。",
                 "Seven stages. Each one names the file it lives in.", w=CW)

    fy = y + 100
    n = 7
    gap = 16
    nw = (CW - (n - 1) * gap) / n
    nh = 178
    flow = [
        ("01 · INTAKE", "候选人授权资料", [
            "Real PDF upload, read", "in the browser.", "Evidence doors written", "per role family.",
        ], "Onboarding.tsx"),
        ("02 · PARSE", "解析与验证", [
            "unpdf pulls the text.", "Claude extracts fields.", "Rule engine is the floor,", "never the pretence.",
        ], "resumeParse.ts"),
        ("03 · CANON", "统一职业语言", [
            "One classifier, eight", "role families.", "Free-text rejection →", "canonical skill node.",
        ], "roleFamily.ts"),
        ("04 · DIAGNOSE", "分开计算风险", [
            "Six risks, each scored", "on its own.", "No blended number", "hiding a weak input.",
        ], "careerRisk.ts"),
        ("05 · DECIDE", "比较未来路径", [
            "Three futures side by", "side.", "Offer fit as a weighted", "sum you can audit.",
        ], "DecisionLab.tsx"),
        ("06 · PRESCRIBE", "处方与证据", [
            "A plan, and a resume", "generated from the", "evidence actually on", "file.",
        ], "resumeGen.ts"),
        ("07 · APPLY", "申请与结果", [
            "Applications, rehearsal,", "and the outcome that", "comes back into the", "graph.",
        ], "JobMatchTracker.tsx"),
    ]
    for i, (tag, title, lines, src) in enumerate(flow):
        x = M + i * (nw + gap)
        accent = TEAL if i in (1, 6) else GOLD
        border = LINE_HI if i in (1, 6) else LINE
        node(s, x, fy, nw, nh, tag, title, lines, accent=accent, border=border)
        s.text(x + 18, fy + nh - 14, src, size=8.5, fill=FAINT, font=MONO, spacing="0.03em")
        if i < n - 1:
            arrow(s, x + nw + gap / 2, fy + 46)

    # Loop band
    ly = fy + nh + 18
    s.rect(M, ly, CW, 74, fill=TEAL_BG, stroke=TEAL, sw=1, rx=13)
    s.text(M + 26, ly + 30, "THE LOOP", size=10, fill=TEAL, font=MONO, weight="700", spacing="0.12em")
    s.text(M + 26, ly + 54,
           "An employer rejects with a reason. It is normalised, stripped of identity, and re-read by the candidate and the university in the same session.",
           size=13, fill=MUTED, font=SANS)
    s.text(W - M - 26, ly + 44, "218 → 219", size=19, fill=GOLD, font=MONO,
           weight="700", anchor="end")

    # ── 02 · Evidence pipeline  |  03 · Formula registry ─────────
    y2 = ly + 74 + 78
    left_w = CW * 0.485
    right_x = M + left_w + 44
    right_w = CW - left_w - 44

    section_head(s, M, y2, "02 / COLLECT + VERIFY",
                 "不要 chunk 一份 CV。", "Split it into evidence units.", w=left_w)
    py = y2 + 100
    stages = [
        ("Secure intake", "File never leaves the device"),
        ("Text layer", "unpdf · in-browser"),
        ("Section detect", "Header / body segmentation"),
        ("Claim extraction", "Claude, extraction only"),
        ("Deduplicate", "Same claim, one unit"),
        ("User confirm", "Nothing is assumed"),
    ]
    ph = 46
    for i, (t, d) in enumerate(stages):
        yy = py + i * (ph + 8)
        s.rect(M, yy, left_w, ph, fill=PANEL, stroke=LINE, sw=1, rx=10)
        s.text(M + 16, yy + 20, f"{i+1:02d}", size=9, fill=GOLD, font=MONO, weight="700")
        s.text(M + 48, yy + 20, t, size=13, fill=INK, font=SANS, weight="600")
        s.text(M + 48, yy + 36, d, size=11, fill=MUTED, font=SANS)

    # Trust levels
    tly = py + len(stages) * (ph + 8) + 14
    s.text(M, tly + 6, "TRUST LEVELS — WHAT WE WILL SAY OUT LOUD", size=9.5, fill=GOLD,
           font=MONO, weight="700", spacing="0.12em")
    trust = [
        ("VERIFIED", ["The issuer's own record", "confirms it."], GREEN),
        ("CORROBORATED", ["Costly to fake, but not", "issuer-confirmed."], GOLD),
        ("SELF-DECLARED", ["You gave it to us.", "Nobody has checked it."], RED),
    ]
    trw = (left_w - 2 * 10) / 3
    for i, (k, ls, c) in enumerate(trust):
        x = M + i * (trw + 10)
        s.rect(x, tly + 20, trw, 76, fill=PANEL, stroke=c, sw=1, rx=11, op=0.9)
        s.text(x + 14, tly + 44, k, size=9, fill=c, font=MONO, weight="700", spacing="0.08em")
        for j, ln in enumerate(ls):
            s.text(x + 14, tly + 65 + j * 15, ln, size=10.5, fill=MUTED, font=SANS)

    # ── 03 · Formula registry ────────────────────────────────────
    section_head(s, right_x, y2, "03 / DIAGNOSE FORMULA REGISTRY",
                 "一个总分不够。", "Six risks, computed separately.", w=right_w)
    ry = y2 + 100
    formulas = [
        ("AI Task Exposure",
         "base[family] − 0.35 × creative_shield − evidence_shield",
         "Innovation and Strategic scores reduce it.", "LIVE", GREEN),
        ("Salary Position",
         "(stated − median[family][seniority]) / median",
         "Flagged at −5% or worse.", "LIVE", GREEN),
        ("Promotion Blocker",
         "Leadership < 65 AND target role implies leading",
         "Only raised when the target actually needs it.", "LIVE", GREEN),
        ("Credential Gap",
         "count(evidence WHERE kind = 'certificate') = 0",
         "Named per role family.", "LIVE", GREEN),
        ("Market Demand Risk",
         "Δ postings for role family, 12-month window",
         "Needs a live posting corpus.", "PLANNED", GOLD),
        ("Skill Freshness",
         "months since newest evidence for a claimed skill",
         "Needs dated evidence at intake.", "PLANNED", GOLD),
    ]
    fh = 74
    for i, (name, eq, note, status, sc) in enumerate(formulas):
        yy = ry + i * (fh + 9)
        s.rect(right_x, yy, right_w, fh, fill=PANEL, stroke=LINE, sw=1, rx=11)
        s.text(right_x + 18, yy + 24, name, size=13.5, fill=INK, font=SANS, weight="700")
        cw = len(status) * 6.2 + 16
        s.rect(right_x + right_w - cw - 16, yy + 11, cw, 17, fill=BG2, stroke=sc, sw=1, rx=5)
        s.text(right_x + right_w - cw / 2 - 16, yy + 23, status, size=8, fill=sc,
               font=MONO, weight="700", anchor="middle", spacing="0.08em")
        s.rect(right_x + 18, yy + 32, right_w - 36, 21, fill=BG, stroke=None, rx=6)
        s.text(right_x + 26, yy + 47, eq, size=10.5, fill=TEAL, font=MONO, weight="500")
        s.text(right_x + 18, yy + 66, note, size=11, fill=MUTED, font=SANS)

    # ── 04 · Privacy boundary ────────────────────────────────────
    y3 = max(tly + 96, ry + len(formulas) * (fh + 9)) + 74
    section_head(s, M, y3, "04 / PRIVACY BOUNDARY",
                 "同一条 outcome，三种可见度。",
                 "The store holds more than any one reader is allowed to see. Enforced in the projection, not in the copy.", w=CW)

    by = y3 + 100
    boxes = [
        ("EMPLOYER · PRIVATE", "Raw rejection reason", [
            "The words the recruiter typed, the",
            "candidate, and the hiring stage.",
            "Never leaves the employer surface.",
        ], RED),
        ("CANDIDATE · AGGREGATE", "Two derived numbers", [
            "Canonical skill + share of applicants",
            "with the same gap. No employer name,",
            "no stage, nobody identified.",
        ], TEAL),
        ("UNIVERSITY · CLUSTERS", "Pattern, never person", [
            "Skill clusters and counts across",
            "employers. Cohort is the smallest",
            "addressable unit.",
        ], BLUE),
    ]
    bw = (CW - 2 * 16) / 3
    for i, (tag, title, lines, c) in enumerate(boxes):
        x = M + i * (bw + 16)
        s.rect(x, by, bw, 148, fill=PANEL, stroke=c, sw=1, rx=13, op=0.85)
        s.text(x + 20, by + 30, tag, size=9, fill=c, font=MONO, weight="700",
               spacing="0.12em")
        s.text(x + 20, by + 60, title, size=17, fill=INK, font=SANS, weight="700", spacing="-0.02em")
        cy = by + 86
        for ln in lines:
            s.text(x + 20, cy, ln, size=11.5, fill=MUTED, font=SANS)
            cy += 17
        if i < 2:
            arrow(s, x + bw + 8, by + 78, color=c)

    # Enforcement note
    ey = by + 148 + 16
    s.rect(M, ey, CW, 58, fill=GOLD_BG, stroke=GOLD, sw=1, rx=11)
    s.text(M + 24, ey + 24, "ENFORCEMENT", size=9, fill=GOLD, font=MONO, weight="700", spacing="0.12em")
    s.text(M + 24, ey + 45,
           "Today this is a render boundary — honest, but advisory. In production it becomes three separate read models: the candidate view cannot return an employer id, because the column is not in the view.",
           size=12.5, fill=MUTED, font=SANS)

    # ── Footer ───────────────────────────────────────────────────
    fy2 = ey + 58 + 40
    s.line(M, fy2, W - M, fy2, stroke=LINE)
    s.text(M, fy2 + 26, "CareerX-Ray · Talentbank Tech Hackathon 2026", size=10,
           fill=FAINT, font=MONO, spacing="0.05em")
    s.text(W - M, fy2 + 26, "github.com/yantongggg/careerx-ray", size=10,
           fill=FAINT, font=MONO, anchor="end", spacing="0.05em")

    return s.out(), W, fy2 + 60


import os
OUT = os.path.dirname(os.path.abspath(__file__))
svg, w, h = build()
# trim the canvas to the content we actually drew
svg = svg.replace(f'height="1420"', f'height="{h}"', 1).replace(f'0 0 1900 1420', f'0 0 1900 {h}')
svg = svg.replace(f'<rect width="1900" height="1420"', f'<rect width="1900" height="{h}"')
path = os.path.join(OUT, "careerxray-architecture-blueprint.svg")
open(path, "w").write(svg)
print("wrote", path, w, h)
