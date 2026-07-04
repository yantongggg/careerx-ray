import { MapPin, Briefcase, GraduationCap, Award, Code, Star, ExternalLink, Edit3, Plus, ArrowRight } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

const dnaData = [
  { subject: "Analytical", A: 92 },
  { subject: "Creative", A: 58 },
  { subject: "Leadership", A: 74 },
  { subject: "Communication", A: 82 },
  { subject: "Strategic", A: 65 },
  { subject: "Technical", A: 88 },
];

const experience = [
  {
    company: "Stripe",
    role: "Senior Data Analyst",
    period: "Mar 2023 – Present",
    location: "San Francisco, CA",
    desc: "Lead analytics for the payments intelligence team. Built real-time fraud detection dashboards used by 14 ops team members. Reduced false-positive rate by 23% through statistical model improvements.",
    skills: ["Python", "SQL", "dbt", "Looker", "Stripe APIs"],
    logo: "S",
    logoColor: "bg-indigo-600",
  },
  {
    company: "Airbnb",
    role: "Data Analyst",
    period: "Jul 2021 – Mar 2023",
    location: "Remote",
    desc: "Owned supply-side analytics for the APAC market. Built cohort analyses and pricing models that informed $2M in host acquisition decisions. Mentored 2 junior analysts.",
    skills: ["Python", "SQL", "Tableau", "A/B Testing", "Spark"],
    logo: "A",
    logoColor: "bg-rose-500",
  },
  {
    company: "Deloitte",
    role: "Business Intelligence Analyst",
    period: "Jun 2019 – Jul 2021",
    location: "New York, NY",
    desc: "Delivered BI solutions for Fortune 500 financial services clients. Created executive dashboards and automated reporting workflows, saving 20+ hours per week across teams.",
    skills: ["SQL", "Tableau", "Power BI", "Excel", "VBA"],
    logo: "D",
    logoColor: "bg-green-600",
  },
];

const education = [
  {
    school: "University of Michigan",
    degree: "B.S. Statistics & Computer Science",
    period: "2015 – 2019",
    gpa: "3.8 / 4.0",
    logo: "M",
    logoColor: "bg-blue-700",
  },
];

const certifications = [
  { name: "Google Data Analytics Professional", issuer: "Google", year: "2022", status: "active" },
  { name: "dbt Analytics Engineering", issuer: "dbt Labs", year: "2023", status: "active" },
  { name: "Tableau Desktop Specialist", issuer: "Tableau", year: "2021", status: "active" },
];

const skills = [
  { name: "SQL", level: 95 }, { name: "Python", level: 84 }, { name: "dbt", level: 72 },
  { name: "Tableau", level: 80 }, { name: "Statistics", level: 88 }, { name: "Looker", level: 70 },
  { name: "Spark", level: 48 }, { name: "ML/AI", level: 38 }, { name: "Cloud", level: 30 },
];

const projects = [
  { name: "Fraud Pattern Classifier", desc: "Trained a gradient boosting model on 2M+ transactions. Achieved 0.94 AUC.", tech: ["Python", "XGBoost", "Snowflake"], stars: 142 },
  { name: "dbt Metrics Dashboard", desc: "Open-source dbt package for automated metric reporting across data warehouses.", tech: ["dbt", "SQL", "GitHub Actions"], stars: 89 },
];

const achievements = [
  { label: "Data Impact Award", issuer: "Stripe, 2024", icon: Star },
  { label: "Top 5% Analyst", issuer: "Airbnb 2022 Calibration", icon: Award },
  { label: "Hackathon Winner", issuer: "Stripe ML Summit 2023", icon: Award },
];

export function UserProfile() {
  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
        {/* Profile header */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              JK
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">Jordan Kim</h1>
                  <p className="text-base text-muted-foreground mt-0.5">Senior Data Analyst · Stripe</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin size={12} /> San Francisco, CA
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Briefcase size={12} /> 6 years experience
                    </div>
                  </div>
                </div>
                <button className="flex items-center gap-2 border border-border text-foreground text-sm px-4 py-2 rounded-lg hover:bg-muted transition-colors font-medium">
                  <Edit3 size={14} /> Edit Profile
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {["Data Analytics", "Python", "SQL", "dbt", "Statistics", "FinTech"].map(t => (
                  <span key={t} className="text-xs bg-blue-50 text-primary border border-blue-100 px-3 py-1 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Experience */}
            <div className="bg-white rounded-xl border border-border shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Briefcase size={16} className="text-muted-foreground" /> Experience
                </h2>
                <button className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Plus size={12} /> Add
                </button>
              </div>
              <div className="space-y-6">
                {experience.map((e, i) => (
                  <div key={i} className={i < experience.length - 1 ? "pb-6 border-b border-border" : ""}>
                    <div className="flex gap-4">
                      <div className={`w-10 h-10 rounded-lg ${e.logoColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {e.logo}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{e.role}</p>
                            <p className="text-sm text-muted-foreground">{e.company} · {e.location}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{e.period}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{e.desc}</p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {e.skills.map(s => (
                            <span key={s} className="text-xs bg-muted border border-border text-foreground px-2 py-0.5 rounded-md">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-xl border border-border shadow-sm p-6">
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-5">
                <GraduationCap size={16} className="text-muted-foreground" /> Education
              </h2>
              {education.map((e, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-lg ${e.logoColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {e.logo}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{e.degree}</p>
                    <p className="text-sm text-muted-foreground">{e.school}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{e.period} · GPA {e.gpa}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Projects */}
            <div className="bg-white rounded-xl border border-border shadow-sm p-6">
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-5">
                <Code size={16} className="text-muted-foreground" /> Projects
              </h2>
              <div className="space-y-4">
                {projects.map((p) => (
                  <div key={p.name} className="p-4 rounded-xl border border-border hover:bg-muted transition-colors group">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-foreground">{p.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star size={11} className="text-amber-400 fill-amber-400" /> {p.stars}
                        <ExternalLink size={11} className="ml-1 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{p.desc}</p>
                    <div className="flex gap-1.5">
                      {p.tech.map(t => <span key={t} className="text-xs bg-blue-50 text-primary border border-blue-100 px-2 py-0.5 rounded-md">{t}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Career DNA */}
            <div className="bg-white rounded-xl border border-border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-foreground">Career DNA</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Primary type: Forge Beaver</p>
                </div>
                <span className="text-xs bg-blue-50 text-primary border border-blue-100 px-2 py-1 rounded-full font-semibold">82%</span>
              </div>
              <div style={{ width: "100%", height: 208 }}>
                <ResponsiveContainer width="100%" height={208}>
                  <RadarChart data={dnaData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#94A3B8" }} />
                    <Radar dataKey="A" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-foreground">Forge Beaver</p>
                <p className="text-xs text-muted-foreground mt-1">A practical builder who turns complex ideas into working solutions.</p>
                <button className="mt-3 text-xs text-primary font-semibold inline-flex items-center gap-1">
                  Open full DNA map <ArrowRight size={12} />
                </button>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl border border-border shadow-sm p-6">
              <h2 className="font-semibold text-foreground mb-4">Skills</h2>
              <div className="space-y-3">
                {skills.map((s) => (
                  <div key={s.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{s.name}</span>
                      <span className="text-xs text-muted-foreground">{s.level}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${s.level}%`, opacity: s.level < 50 ? 0.5 : 1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-xl border border-border shadow-sm p-6">
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <Award size={16} className="text-muted-foreground" /> Certifications
              </h2>
              <div className="space-y-3">
                {certifications.map((c) => (
                  <div key={c.name} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Award size={13} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground leading-snug">{c.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.issuer} · {c.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl border border-border shadow-sm p-6">
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <Star size={16} className="text-muted-foreground" /> Achievements
              </h2>
              <div className="space-y-3">
                {achievements.map((a) => (
                  <div key={a.label} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <a.icon size={14} className="text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-foreground">{a.label}</p>
                      <p className="text-xs text-muted-foreground">{a.issuer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
