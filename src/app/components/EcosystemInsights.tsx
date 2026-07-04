import { BarChart3, Building2, GraduationCap, MapPin, ShieldCheck, TrendingUp, Users } from "lucide-react";

const faculties = [
  { name: "Computer Science", ready: 84, gap: "Cloud architecture" },
  { name: "Business Analytics", ready: 72, gap: "SQL case interviews" },
  { name: "Engineering", ready: 69, gap: "Product storytelling" },
  { name: "Finance", ready: 64, gap: "Python automation" },
];

const regions = [
  { name: "Klang Valley", demand: "High", roles: "12.4k", focus: "Data, AI, product ops" },
  { name: "Penang", demand: "Rising", roles: "3.1k", focus: "Semiconductor analytics" },
  { name: "Johor", demand: "Rising", roles: "2.6k", focus: "Supply chain, logistics" },
  { name: "Singapore", demand: "High", roles: "18.7k", focus: "Regional tech hub" },
];

export function EcosystemInsights() {
  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6">
        <div className="bg-slate-950 text-white rounded-2xl p-6 lg:p-7">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 px-2.5 py-1 rounded-full text-xs text-slate-200">
              <GraduationCap size={12} /> Institution + Policy View
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Career analytics for universities and national talent planning.</h1>
          <p className="text-sm text-slate-300 leading-relaxed mt-2 max-w-3xl">
            The prototype does not need ministry integration, but it shows the future platform: student readiness, graduate outcomes, employer engagement, skill gaps, and Malaysia-to-ASEAN opportunity flow.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Student readiness", value: "76/100", icon: ShieldCheck },
            { label: "Employed in 6 months", value: "88%", icon: TrendingUp },
            { label: "Median time to job", value: "47d", icon: BarChart3 },
            { label: "Career fair interactions", value: "9.8k", icon: Users },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <kpi.icon size={17} className="text-muted-foreground" />
              <p className="text-2xl font-bold text-foreground mt-3">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <section className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-foreground mb-4">Readiness by faculty</h2>
            <div className="space-y-4">
              {faculties.map(f => (
                <div key={f.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-semibold text-foreground">{f.name}</p>
                    <span className="text-xs text-muted-foreground">Top gap: {f.gap}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${f.ready}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-foreground mb-4">Companies students engage with</h2>
            <div className="space-y-3">
              {["Maybank", "Grab", "Petronas Digital", "Shopee", "Deloitte"].map((company, i) => (
                <div key={company} className="flex items-center gap-3 p-3 border border-border rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Building2 size={15} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{company}</p>
                    <p className="text-xs text-muted-foreground">{420 - i * 54} profile views · {86 - i * 7} applications</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="bg-white border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={17} className="text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Malaysia → ASEAN talent opportunity map</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {regions.map(region => (
              <div key={region.name} className="border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-foreground">{region.name}</p>
                  <span className="text-xs bg-blue-50 text-primary border border-blue-100 px-2 py-0.5 rounded-full">{region.demand}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{region.roles}</p>
                <p className="text-xs text-muted-foreground mt-1">{region.focus}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
