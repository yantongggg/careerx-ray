#!/usr/bin/env python3
"""Generate CareerX-Ray architecture diagrams as standalone SVG."""

from html import escape as _esc

SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"
MONO = "'SF Mono', SFMono-Regular, Menlo, Consolas, monospace"

INK    = "#0E1614"
INK2   = "#3A4744"
MUTED  = "#6B7A76"
RULE   = "#C9D2CF"
PAPER  = "#FFFFFF"
WASH   = "#F4F6F5"
TEAL   = "#115E50"
TEALBG = "#E7F0ED"
BRASS  = "#8A7038"
BRSBG  = "#F5EFE1"
BLUE   = "#1B5CA3"
BLUEBG = "#E8F0F8"
RED    = "#A32015"
REDBG  = "#FAEDEB"
GREEN  = "#15803D"


def esc(s):
    return _esc(str(s), quote=True)


class Svg:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.o = []

    def rect(self, x, y, w, h, fill=PAPER, stroke=None, sw=1, rx=3, dash=None, op=None):
        a = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"'
        if stroke:
            a += f' stroke="{stroke}" stroke-width="{sw}"'
        if dash:
            a += f' stroke-dasharray="{dash}"'
        if op is not None:
            a += f' fill-opacity="{op}"'
        self.o.append(a + "/>")

    def text(self, x, y, s, size=12, fill=INK, font=MONO, weight="normal",
             anchor="start", spacing=None, upper=False):
        s = s.upper() if upper else s
        a = (f'<text x="{x}" y="{y}" font-family="{font}" font-size="{size}" '
             f'fill="{fill}" font-weight="{weight}" text-anchor="{anchor}"')
        if spacing:
            a += f' letter-spacing="{spacing}"'
        self.o.append(a + f'>{esc(s)}</text>')

    def line(self, x1, y1, x2, y2, stroke=MUTED, sw=1.2, dash=None, marker=True):
        a = f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}"'
        if dash:
            a += f' stroke-dasharray="{dash}"'
        if marker:
            a += ' marker-end="url(#ar)"'
        self.o.append(a + "/>")

    def path(self, d, stroke=MUTED, sw=1.2, dash=None, marker=True):
        a = f'<path d="{d}" fill="none" stroke="{stroke}" stroke-width="{sw}"'
        if dash:
            a += f' stroke-dasharray="{dash}"'
        if marker:
            a += ' marker-end="url(#ar)"'
        self.o.append(a + "/>")

    def out(self):
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" height="{self.h}" '
            f'viewBox="0 0 {self.w} {self.h}">'
            f'<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" '
            f'markerHeight="6" orient="auto-start-reverse">'
            f'<path d="M 0 0 L 10 5 L 0 10 z" fill="{MUTED}"/></marker></defs>'
            f'<rect width="{self.w}" height="{self.h}" fill="{PAPER}"/>'
            + "".join(self.o) + "</svg>"
        )


def box(s, x, y, w, h, title, lines=None, fill=PAPER, accent=INK, tone=None,
        badge=None, title_size=13, line_size=11, lh=15):
    """A labelled box with an accent top edge."""
    s.rect(x, y, w, h, fill=fill, stroke=RULE, sw=1)
    s.rect(x, y, w, 3, fill=accent, rx=0)
    ty = y + 22
    s.text(x + 12, ty, title, size=title_size, fill=accent, font=SANS, weight="700")
    if badge:
        s.text(x + w - 12, ty, badge, size=9.5, fill=accent, font=MONO,
               weight="700", anchor="end", spacing="0.08em", upper=True)
    if lines:
        cy = ty + 17
        for ln in lines:
            col, txt = (tone or {}).get(ln, (INK2, ln)) if isinstance(tone, dict) else (INK2, ln)
            s.text(x + 12, cy, txt, size=line_size, fill=col, font=MONO)
            cy += lh


def zone(s, x, y, w, h, label, sub=None, stroke=RULE, dash="5 4", wash=None):
    if wash:
        s.rect(x, y, w, h, fill=wash, stroke=None, rx=4)
    s.rect(x, y, w, h, fill="none", stroke=stroke, sw=1.4, dash=dash, rx=4)
    s.text(x + 14, y + 20, label, size=10.5, fill=stroke, font=MONO,
           weight="700", spacing="0.14em", upper=True)
    if sub:
        s.text(x + 14, y + 36, sub, size=10.5, fill=MUTED, font=MONO)


def masthead(s, title, sub, stamp, w):
    s.rect(0, 0, w, 4, fill=TEAL, rx=0)
    s.text(60, 60, title, size=27, fill=INK, font=SANS, weight="700")
    s.text(60, 84, sub, size=13, fill=INK2, font=SANS)
    s.text(w - 60, 60, stamp[0], size=10.5, fill=MUTED, font=MONO, anchor="end",
           spacing="0.1em", upper=True)
    s.text(w - 60, 84, stamp[1], size=10.5, fill=MUTED, font=MONO, anchor="end")
    s.line(60, 104, w - 60, 104, stroke=RULE, sw=1, marker=False)


# ══════════════════════════════════════════════════════════════════
# DIAGRAM 1 — As-built, with trust boundary
# ══════════════════════════════════════════════════════════════════
def diagram1():
    W, H = 1680, 900
    s = Svg(W, H)
    masthead(s, "CareerX-Ray — As-Built Architecture",
             "Client-only React SPA · zero backend · trust boundary and verified posture",
             ("AS-BUILT / PROTOTYPE", "repo: yantongggg/careerx-ray @ 9b32e60"), W)

    CX, CY, CW, CH = 60, 132, 1080, 708
    zone(s, CX, CY, CW, CH, "Client trust zone",
         "Everything executes on the user's device. There is no server-side component to trust it.",
         stroke=RED, wash=WASH)

    ix = CX + 26
    iw = CW - 52

    # Delivery
    box(s, ix, CY + 52, iw, 60, "Vercel Edge CDN — static asset delivery",
        ["HTTPS / TLS 1.3 · HSTS · immutable hashed assets · no cookies set · no server-side render"],
        accent=TEAL, badge="transport")

    s.line(CX + CW / 2, CY + 112, CX + CW / 2, CY + 138)

    # Shell
    box(s, ix, CY + 140, iw, 82, "App.tsx — state-machine router",
        ["appState · role · page · history[]   ·   29 pages mapped to 3 role surfaces",
         "Gate: candidate pages unreachable until hasScanned === true",
         "Auth screen renders but enforces nothing — sign-in is optional by design (demo mode)"],
        accent=INK, badge="shell")

    # Surfaces
    sy = CY + 254
    sw_ = (iw - 40) / 3
    box(s, ix, sy, sw_, 74, "CANDIDATE",
        ["18 pages", "Command Center, DNA,", "Blind Spots, Decision Lab"],
        accent=BLUE, fill=BLUEBG, badge="reader")
    box(s, ix + sw_ + 20, sy, sw_, 74, "EMPLOYER",
        ["6 pages", "Hiring Pipeline, Matching,", "SLA, Resilience"],
        accent=BRASS, fill=BRSBG, badge="writer")
    box(s, ix + 2 * (sw_ + 20), sy, sw_, 74, "UNIVERSITY",
        ["5 pages", "Ecosystem Insights,", "Curriculum Engine"],
        accent=BLUE, fill=BLUEBG, badge="reader")

    # Provider
    py = sy + 132
    box(s, ix, py, iw, 108, "IntelligenceProvider — React Context (process memory)",
        ["HiringSignal[]  { skill · reason · role · employer · stage · live }",
         "normalizeSkill(reason) → 1 of 9 canonical skills, keyword rules + passthrough fallback",
         "Sole writer in the entire codebase: HiringPipeline → emitSignal()",
         "Readers: CommandCenter (aggregate) · PatternAlert (clusters) · CurriculumEngine (gap rows)"],
        accent=TEAL, fill=TEALBG, badge="career intelligence graph")

    # Flow arrows employer -> provider -> readers
    ex = ix + sw_ + 20 + sw_ / 2
    s.path(f"M {ex} {sy + 74} L {ex} {py - 6}", stroke=BRASS, sw=1.8)
    s.text(ex + 10, py - 16, "emitSignal()  — write", size=10.5, fill=BRASS, font=MONO, weight="700")

    cx1 = ix + sw_ / 2
    s.path(f"M {cx1} {py} L {cx1} {sy + 80}", stroke=BLUE, sw=1.5, dash="4 3")
    s.text(cx1 + 10, py - 16, "aggregate counts only", size=10.5, fill=BLUE, font=MONO)
    ux = ix + 2 * (sw_ + 20) + sw_ / 2
    s.path(f"M {ux} {py} L {ux} {sy + 80}", stroke=BLUE, sw=1.5, dash="4 3")
    s.text(ux + 10, py - 16, "skill clusters only", size=10.5, fill=BLUE, font=MONO)

    # Logic + data
    ly = py + 132
    hw = (iw - 20) / 2
    box(s, ix, ly, hw, 86, "Deterministic logic — pure functions",
        ["careerDna.js · 6 dimensions → 12 archetypes",
         "conflict gap = aspiration − evidence, surfaced ≥ 15",
         "explainRoleGap() · useClusters() · liveGaps"],
        accent=TEAL, badge="reproducible")
    box(s, ix + hw + 20, ly, hw, 86, "Authored datasets — compiled into the bundle",
        ["Salary benchmarks · role-shift corpora ×5 families",
         "218 baseline outcomes + 2 seed signals",
         "100% synthetic — no real person appears in the repo"],
        accent=BRASS, badge="static")

    s.line(CX + CW / 2, ly + 86, CX + CW / 2, ly + 112, marker=False)

    # No persistence
    ny = ly + 112
    s.rect(ix, ny, iw, 56, fill=REDBG, stroke=RED, sw=1.2, rx=3)
    s.text(ix + 14, ny + 24, "NO PERSISTENCE LAYER", size=12.5, fill=RED,
           font=SANS, weight="700")
    s.text(ix + 14, ny + 42,
           "0 × localStorage / sessionStorage / IndexedDB / cookie.  Process memory only — all state dies with the tab.",
           size=11, fill=INK2, font=MONO)

    # ── Right rail ────────────────────────────────────────────────
    RX, RW = 1180, 440
    s.text(RX, CY + 20, "Verified posture", size=15, fill=INK, font=SANS, weight="700")
    s.text(RX, CY + 38, "Measured by static analysis of the repository, not claimed.",
           size=10.5, fill=MUTED, font=MONO)

    good = [
        ("0", "network egress", "no fetch / axios / WebSocket anywhere"),
        ("0", "secrets in bundle", "no .env, no process.env, no API key"),
        ("0", "real personal data", "every record is authored synthetic"),
        ("0", "data at rest", "no storage API of any kind is called"),
        ("0", "third-party runtime", "no analytics, tag manager or remote script"),
        ("0", "model inference", "output is deterministic and reproducible"),
    ]
    y = CY + 58
    s.rect(RX, y, RW, 40 + len(good) * 40, fill=TEALBG, stroke=TEAL, sw=1, rx=3)
    s.text(RX + 14, y + 20, "ATTACK SURFACE ELIMINATED BY CONSTRUCTION", size=9.5,
           fill=TEAL, font=MONO, weight="700", spacing="0.1em")
    yy = y + 44
    for n, k, d in good:
        s.text(RX + 14, yy + 12, n, size=19, fill=TEAL, font=SANS, weight="700")
        s.text(RX + 42, yy + 5, k, size=12, fill=INK, font=SANS, weight="600")
        s.text(RX + 42, yy + 21, d, size=10, fill=MUTED, font=MONO)
        yy += 40

    y2 = y + 40 + len(good) * 40 + 26
    risks = [
        ("Privacy is a render boundary, not a control",
         "employer / stage / individual are present in the store and",
         "withheld by display logic. Client-side logic is advisory."),
        ("No authorization exists",
         "Role switching is a local setState. Any visitor can open",
         "the employer and university consoles."),
        ("Whole-system bundle is public",
         "All three roles' code and datasets ship in one public",
         "JS file. Acceptable only because the data is synthetic."),
    ]
    s.rect(RX, y2, RW, 34 + len(risks) * 62, fill=REDBG, stroke=RED, sw=1, rx=3)
    s.text(RX + 14, y2 + 22, "ACCEPTED RISKS — PROTOTYPE SCOPE", size=9.5,
           fill=RED, font=MONO, weight="700", spacing="0.1em")
    yy = y2 + 48
    for t, l1, l2 in risks:
        s.text(RX + 14, yy, t, size=11.5, fill=RED, font=SANS, weight="700")
        s.text(RX + 14, yy + 16, l1, size=10, fill=INK2, font=MONO)
        s.text(RX + 14, yy + 30, l2, size=10, fill=INK2, font=MONO)
        yy += 62

    y3 = y2 + 34 + len(risks) * 62 + 20
    s.rect(RX, y3, RW, 52, fill=WASH, stroke=RULE, sw=1, rx=3)
    s.text(RX + 14, y3 + 21, "All three are closed by the production design.",
           size=11.5, fill=INK, font=SANS, weight="700")
    s.text(RX + 14, y3 + 38, "The boundaries do not move — they move server-side.",
           size=10.5, fill=MUTED, font=MONO)

    s.line(60, H - 34, W - 60, H - 34, stroke=RULE, sw=1, marker=False)
    s.text(60, H - 16, "CareerX-Ray · Talentbank Tech Hackathon 2026 — Grand Finale",
           size=10, fill=MUTED, font=MONO)
    s.text(W - 60, H - 16, "Diagram 1 of 2 — as built", size=10, fill=MUTED,
           font=MONO, anchor="end")
    return s.out()


# ══════════════════════════════════════════════════════════════════
# DIAGRAM 2 — Production security architecture
# ══════════════════════════════════════════════════════════════════
def diagram2():
    W, H = 1680, 1074
    s = Svg(W, H)
    masthead(s, "CareerX-Ray — Production Security Architecture",
             "Defence in depth · PDPA 2010 (Malaysia) aligned · the prototype's boundaries, enforced server-side",
             ("TARGET STATE", "trust increases downward · no client-side authorization"), W)

    LX, LW = 60, 1180
    RX, RW = 1272, 348

    def band(y, h, num, name, sub, stroke, wash, boxes):
        zone(s, LX, y, LW, h, f"Zone {num} · {name}", sub, stroke=stroke, wash=wash)
        return y + h

    y = 132

    # Zone 0 — client
    h = 110
    zone(s, LX, y, LW, h, "Zone 0 · Client — untrusted",
         "Assume fully compromised. No authorization decision is ever made or enforced here.",
         stroke=RED, wash=REDBG)
    bw = (LW - 52 - 40) / 3
    for i, (t, d) in enumerate([("Candidate SPA", "scoped session token"),
                                ("Employer console", "org-bound, MFA required"),
                                ("University console", "staff SSO, read-only")]):
        box(s, LX + 26 + i * (bw + 20), y + 46, bw, 46, t, [d],
            accent=RED, fill=PAPER, title_size=12, line_size=10)
    s.line(LX + LW / 2, y + h, LX + LW / 2, y + h + 22)
    y += h + 24

    # Zone 1 — edge
    h = 96
    zone(s, LX, y, LW, h, "Zone 1 · Edge", "Terminate, filter, throttle before anything reaches application code.",
         stroke=BRASS, wash=BRSBG)
    bw = (LW - 52 - 60) / 4
    for i, (t, d) in enumerate([("WAF + DDoS", "OWASP ruleset"),
                                ("TLS 1.3 → mTLS", "to origin only"),
                                ("Rate limit", "per identity + per IP"),
                                ("CSP · HSTS · SRI", "no inline, no eval")]):
        box(s, LX + 26 + i * (bw + 20), y + 40, bw, 42, t, [d],
            accent=BRASS, fill=PAPER, title_size=11.5, line_size=10)
    s.line(LX + LW / 2, y + h, LX + LW / 2, y + h + 22)
    y += h + 24

    # Zone 2 — identity
    h = 96
    zone(s, LX, y, LW, h, "Zone 2 · Identity & session",
         "Who is calling, in what role, for how long.", stroke=BLUE, wash=BLUEBG)
    for i, (t, d) in enumerate([("OIDC provider", "external IdP, no local passwords"),
                                ("MFA", "mandatory: employer + university staff"),
                                ("Short-lived scoped JWT", "role + scope claims, 15 min TTL"),
                                ("Session binding", "device + IP anomaly detection")]):
        box(s, LX + 26 + i * (bw + 20), y + 40, bw, 42, t, [d],
            accent=BLUE, fill=PAPER, title_size=11.5, line_size=9.5)
    s.line(LX + LW / 2, y + h, LX + LW / 2, y + h + 22)
    y += h + 24

    # Zone 3 — projection (the key control)
    h = 186
    zone(s, LX, y, LW, h, "Zone 3 · Authorization — role-scoped projections",
         "Three separate read models. Not one model with filters applied on top.",
         stroke=TEAL, wash=TEALBG)
    s.text(LX + LW - 14, y + 20, "★ PRIMARY CONTROL", size=10.5, fill=TEAL,
           font=MONO, weight="700", anchor="end", spacing="0.1em")
    bw3 = (LW - 52 - 40) / 3
    box(s, LX + 26, y + 52, bw3, 84, "candidate_projection",
        ["SELECT canonical_skill,", "         aggregate_count",
         "employer_id and stage are NOT", "columns in this view."],
        accent=TEAL, fill=PAPER, title_size=12, line_size=10, lh=14)
    box(s, LX + 26 + bw3 + 20, y + 52, bw3, 84, "employer_projection",
        ["Own organisation's pipeline only.", "Row-level security keyed on org_id.",
         "Cannot read other employers'", "outcomes or network aggregates."],
        accent=TEAL, fill=PAPER, title_size=12, line_size=10, lh=14)
    box(s, LX + 26 + 2 * (bw3 + 20), y + 52, bw3, 84, "university_projection",
        ["Cluster aggregates only.", "No candidate_id, no employer_id.",
         "Cohort-level rows are the", "smallest addressable unit."],
        accent=TEAL, fill=PAPER, title_size=12, line_size=10, lh=14)
    s.rect(LX + 26, y + 146, LW - 52, 28, fill=PAPER, stroke=TEAL, sw=1, rx=3)
    s.text(LX + 38, y + 165,
           "A client-side filter is a display choice. A server-side projection is a control — the field cannot be returned, because it is not in the view.",
           size=11, fill=TEAL, font=SANS, weight="600")
    s.line(LX + LW / 2, y + h, LX + LW / 2, y + h + 22)
    y += h + 24

    # Zone 4 — intelligence core
    h = 156
    zone(s, LX, y, LW, h, "Zone 4 · Intelligence core",
         "Where a rejection becomes a signal — and where re-identification is prevented.",
         stroke=TEAL, wash=WASH)
    bw4 = (LW - 52 - 60) / 4
    box(s, LX + 26, y + 46, bw4, 96, "1 · Pseudonymise at ingest",
        ["employer_id → opaque token", "at write time. Raw identity", "never enters the signal path.",
         "Vault holds the mapping."],
        accent=TEAL, fill=PAPER, title_size=11.5, line_size=10, lh=14)
    box(s, LX + 26 + bw4 + 20, y + 46, bw4, 96, "2 · Canonicalise",
        ["Claude maps free-text reason", "→ canonical skill node.",
         "Extraction only. The model", "never produces a score."],
        accent=BLUE, fill=PAPER, title_size=11.5, line_size=10, lh=14)
    box(s, LX + 26 + 2 * (bw4 + 20), y + 46, bw4, 96, "3 · k-anonymity gate",
        ["Suppress any aggregate until", "n ≥ 20 outcomes across ≥ 3",
         "employers. Small cells are", "withheld, never rounded."],
        accent=RED, fill=REDBG, title_size=11.5, line_size=10, lh=14)
    box(s, LX + 26 + 3 * (bw4 + 20), y + 46, bw4, 96, "4 · Deterministic scoring",
        ["Rules engine, versioned.", "Same input → same score.",
         "This is what makes", "'why this score?' answerable."],
        accent=TEAL, fill=PAPER, title_size=11.5, line_size=10, lh=14)
    for i in range(3):
        x0 = LX + 26 + (i + 1) * bw4 + i * 20
        s.line(x0, y + 94, x0 + 20, y + 94, sw=1.4)
    s.line(LX + LW / 2, y + h, LX + LW / 2, y + h + 22)
    y += h + 24

    # Zone 5 — data
    h = 118
    zone(s, LX, y, LW, h, "Zone 5 · Data — highest trust, no client route",
         "Reachable only from Zone 4. No public network path exists to this tier.",
         stroke=INK, wash=WASH)
    bw5 = (LW - 52 - 60) / 4
    for i, (t, d1, d2) in enumerate([
        ("Outcome event log", "Append-only, hash-chained.", "Corrections are new events."),
        ("Pseudonym vault", "Separate KMS key,", "break-glass access only."),
        ("Encryption", "AES-256 at rest; field-level", "on free-text reason."),
        ("Retention jobs", "Automated erasure on", "consent withdrawal / expiry."),
    ]):
        box(s, LX + 26 + i * (bw5 + 20), y + 46, bw5, 58, t, [d1, d2],
            accent=INK, fill=PAPER, title_size=11.5, line_size=10, lh=13)
    y += h

    # ── Right rail: governance ───────────────────────────────────
    gy = 132
    s.text(RX, gy + 16, "Governance", size=15, fill=INK, font=SANS, weight="700")
    s.text(RX, gy + 34, "Spans every zone. Not a layer — a control plane.",
           size=10.5, fill=MUTED, font=MONO)

    items = [
        (BLUE, "PDPA 2010 — Malaysia", [
            "Consent registry with purpose",
            "limitation. Notice & choice at",
            "onboarding; disclosure limited to",
            "the stated purpose."]),
        (BLUE, "Right to erasure", [
            "Cascades to the pseudonym vault.",
            "Aggregates survive; the link from",
            "aggregate to person does not."]),
        (TEAL, "Immutable audit log", [
            "Who read which projection, when,",
            "under which scope. Written to a",
            "separate account; append-only."]),
        (TEAL, "Data residency", [
            "Malaysia region. No cross-border",
            "transfer of raw outcome records."]),
        (BRASS, "Secrets & supply chain", [
            "No secret in any client bundle.",
            "KMS-issued, short-lived creds.",
            "SBOM + dependency scanning in CI."]),
        (BRASS, "Assurance cadence", [
            "Quarterly access review.",
            "Annual third-party penetration",
            "test before any cohort onboarding."]),
    ]
    yy = gy + 50
    for col, title, lines in items:
        bh = 30 + len(lines) * 14
        s.rect(RX, yy, RW, bh, fill=PAPER, stroke=RULE, sw=1, rx=3)
        s.rect(RX, yy, 3, bh, fill=col, rx=0)
        s.text(RX + 14, yy + 20, title, size=11.5, fill=col, font=SANS, weight="700")
        cy2 = yy + 36
        for ln in lines:
            s.text(RX + 14, cy2, ln, size=10, fill=INK2, font=MONO)
            cy2 += 14
        yy += bh + 12

    # Threat note
    s.rect(RX, yy + 6, RW, 108, fill=REDBG, stroke=RED, sw=1, rx=3)
    s.text(RX + 14, yy + 27, "PRIMARY THREAT MODELLED", size=9.5, fill=RED,
           font=MONO, weight="700", spacing="0.1em")
    for i, ln in enumerate([
        "Re-identification by inference —",
        "a candidate deducing which employer",
        "rejected them from a small-cohort",
        "aggregate. Mitigated by the k-anonymity",
        "gate, not by policy."]):
        s.text(RX + 14, yy + 48 + i * 13, ln, size=10, fill=INK2, font=MONO)

    s.line(60, H - 34, W - 60, H - 34, stroke=RULE, sw=1, marker=False)
    s.text(60, H - 16, "CareerX-Ray · Talentbank Tech Hackathon 2026 — Grand Finale",
           size=10, fill=MUTED, font=MONO)
    s.text(W - 60, H - 16, "Diagram 2 of 2 — target state", size=10, fill=MUTED,
           font=MONO, anchor="end")
    return s.out()


import os
OUT = os.path.dirname(os.path.abspath(__file__))
for name, fn in [("careerxray-architecture-asbuilt", diagram1),
                 ("careerxray-architecture-security", diagram2)]:
    p = os.path.join(OUT, name + ".svg")
    with open(p, "w") as f:
        f.write(fn())
    print("wrote", p)
