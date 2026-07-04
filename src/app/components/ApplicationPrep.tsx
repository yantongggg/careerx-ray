import { useState } from "react";
import { ArrowRight, Briefcase, Building2, CheckCircle, Clock, FileText, GraduationCap, Link2, MapPin, Send, Shield, Upload, User } from "lucide-react";
import { PositionSkillGraph } from "./PositionSkillGraph";

export interface JobData {
  id: string;
  company: string;
  companyId: string;
  title: string;
  position: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  fit: number;
  successChance: number;
  companyColors: string[];
  companyGlow: string;
}

export const ALL_JOBS: JobData[] = [
  {
    id: "maybank-da",
    company: "Maybank",
    companyId: "maybank",
    title: "Data Analyst, Digital Banking",
    position: "Data Analyst",
    location: "Kuala Lumpur",
    type: "Full-time",
    salary: "RM 7,500 – 9,500",
    description: "Join Maybank's Digital Banking division to drive data-driven insights across our consumer products. You'll analyze customer behavior, build automated reporting dashboards, and collaborate closely with product and engineering teams to improve digital banking engagement across Southeast Asia.",
    requirements: ["3+ years in data analytics or BI", "Expert SQL and Python skills", "Experience with Tableau or Power BI", "Strong communication & storytelling", "Banking/fintech domain knowledge preferred"],
    fit: 91,
    successChance: 82,
    companyColors: ["#FFF8E1","#FFB300","#FF8F00","#E65100"],
    companyGlow: "rgba(255,179,0,0.5)",
  },
  {
    id: "grab-ae",
    company: "Grab",
    companyId: "grab",
    title: "Analytics Engineer",
    position: "Analytics Engineer",
    location: "Petaling Jaya / Hybrid",
    type: "Full-time",
    salary: "RM 9,000 – 12,000",
    description: "Grab is looking for an Analytics Engineer to build and maintain data pipelines powering real-time decision-making for our ride-hailing and delivery platforms. You'll work with dbt, BigQuery, and modern data stack tools to deliver reliable, tested data models at scale.",
    requirements: ["Strong SQL and dbt experience", "Python scripting proficiency", "BigQuery / cloud data warehouse experience", "CI/CD and version control (Git)", "Understanding of data modeling best practices"],
    fit: 86,
    successChance: 71,
    companyColors: ["#E8F5E9","#66BB6A","#2E7D32","#1B5E20"],
    companyGlow: "rgba(102,187,106,0.5)",
  },
  {
    id: "petronas-pm",
    company: "Petronas Digital",
    companyId: "petronas",
    title: "AI Product Analyst",
    position: "AI Product Analyst",
    location: "Kuala Lumpur",
    type: "Full-time",
    salary: "RM 8,000 – 11,000",
    description: "Petronas Digital seeks an AI Product Analyst to bridge technical AI capabilities with business stakeholders. You'll define product metrics, analyze model performance, and translate complex data patterns into actionable product recommendations for our energy digitalization initiatives.",
    requirements: ["Python and SQL proficiency", "Experience with ML model evaluation", "Strong storytelling & stakeholder communication", "Product analytics or PM experience", "Energy/industrial domain knowledge a plus"],
    fit: 78,
    successChance: 65,
    companyColors: ["#E3F2FD","#42A5F5","#1565C0","#0D47A1"],
    companyGlow: "rgba(66,165,245,0.5)",
  },
];

const CANDIDATE_DATA = {
  name: "Jordan Kim",
  email: "jordan.kim@email.com",
  phone: "+60 12-345 6789",
  location: "Kuala Lumpur, Malaysia",
  summary: "Data-driven analyst with 3+ years of experience in digital banking and e-commerce analytics. Skilled in SQL, Python, Tableau, and dbt. Passionate about turning complex data into clear business narratives.",
  education: [
    { school: "University of Malaya", degree: "BSc Computer Science (Data Analytics)", year: "2020-2024", gpa: "3.72" },
  ],
  experience: [
    { company: "Maybank", role: "Data Analyst Intern", period: "Jun 2023 – Dec 2023", desc: "Built customer segmentation dashboards, automated weekly KPI reports using Python & Tableau." },
    { company: "Grab", role: "Analytics Intern", period: "Jan 2023 – May 2023", desc: "Supported analytics engineering team with dbt model development and data quality monitoring." },
  ],
  skills: ["SQL", "Python", "Tableau", "Power BI", "dbt", "BigQuery", "Excel", "Storytelling", "Teamwork", "Leadership"],
  certifications: ["Google Data Analytics Professional Certificate", "dbt Fundamentals"],
  portfolio: ["github.com/jordankim", "linkedin.com/in/jordankim"],
  resumeFile: "Jordan_Kim_Resume_2024.pdf",
};

interface ApplicationPrepProps {
  jobId: string;
  onBack: () => void;
  onApply: (jobId: string) => void;
  onCoach: () => void;
}

export function ApplicationPrep({ jobId, onBack, onApply, onCoach }: ApplicationPrepProps) {
  const [submitted, setSubmitted] = useState(false);
  const job = ALL_JOBS.find(j => j.id === jobId);

  if (!job) return null;

  const handleApply = () => {
    setSubmitted(true);
    onApply(jobId);
  };

  if (submitted) {
    return (
      <div className="flex-1 overflow-y-auto bg-muted">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[900px] mx-auto space-y-6">
          <div className="bg-white border border-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Application Submitted!</h1>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Your application to <span className="font-semibold text-foreground">{job.title}</span> at <span className="font-semibold text-foreground">{job.company}</span> has been sent successfully.
            </p>

            <div className="mt-6 p-4 bg-accent rounded-xl border border-border inline-block">
              <div className="flex items-center gap-3 text-sm">
                <Clock size={14} className="text-primary" />
                <span className="text-muted-foreground">Applied:</span>
                <span className="font-semibold text-foreground">{new Date().toLocaleString("en-MY", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <button onClick={onBack} className="inline-flex items-center gap-2 border border-border px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-muted transition-colors">
                Back to Jobs
              </button>
              <button onClick={onCoach} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-colors">
                AI Interview Coaching <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1100px] mx-auto space-y-6">

        {/* Back button */}
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Job Listings
        </button>

        {/* Job Details */}
        <section className="bg-white border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-accent border border-border flex items-center justify-center">
                  <Building2 size={18} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{job.title}</h1>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                <span className="inline-flex items-center gap-1"><Briefcase size={12} /> {job.type}</span>
                <span className="inline-flex items-center gap-1"><Clock size={12} /> {job.salary}/month</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-3xl font-bold text-primary">{job.fit}%</div>
              <p className="text-xs text-muted-foreground">Skill Match</p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground mb-2">About the Role</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{job.description}</p>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Requirements</h3>
            <ul className="space-y-1.5">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle size={14} className="text-primary flex-shrink-0 mt-0.5" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 p-3 bg-accent rounded-lg border border-border flex items-center gap-3">
            <Shield size={16} className="text-primary" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground">AI Success Prediction</p>
              <p className="text-xs text-muted-foreground">Based on your profile, there's a <span className="font-bold text-primary">{job.successChance}%</span> chance of progressing to interview stage.</p>
            </div>
          </div>
        </section>

        {/* Skill Solar System */}
        <PositionSkillGraph
          companyId={job.companyId}
          position={job.position}
          companyLabel={job.company}
          companyColors={job.companyColors}
          companyGlow={job.companyGlow}
        />

        {/* Application Review — Auto-filled */}
        <section className="bg-white border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-foreground">Application Review</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Auto-filled from your CareerX-Ray profile — review and confirm</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">Auto-filled</span>
          </div>

          <div className="space-y-5">
            {/* Personal Info */}
            <div className="p-4 rounded-xl bg-accent/50 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <User size={14} className="text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium text-foreground">{CANDIDATE_DATA.name}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="font-medium text-foreground">{CANDIDATE_DATA.email}</span></div>
                <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium text-foreground">{CANDIDATE_DATA.phone}</span></div>
                <div><span className="text-muted-foreground">Location:</span> <span className="font-medium text-foreground">{CANDIDATE_DATA.location}</span></div>
              </div>
              <p className="text-sm text-muted-foreground mt-3 italic">"{CANDIDATE_DATA.summary}"</p>
            </div>

            {/* Resume */}
            <div className="p-4 rounded-xl bg-accent/50 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={14} className="text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Resume / CV</h3>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-border">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <FileText size={18} className="text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{CANDIDATE_DATA.resumeFile}</p>
                  <p className="text-xs text-muted-foreground">Uploaded 3 days ago · 2 pages</p>
                </div>
                <Upload size={14} className="text-muted-foreground" />
              </div>
            </div>

            {/* Education */}
            <div className="p-4 rounded-xl bg-accent/50 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap size={14} className="text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Education</h3>
              </div>
              {CANDIDATE_DATA.education.map((edu, i) => (
                <div key={i} className="text-sm">
                  <p className="font-medium text-foreground">{edu.degree}</p>
                  <p className="text-muted-foreground">{edu.school} · {edu.year} · GPA {edu.gpa}</p>
                </div>
              ))}
            </div>

            {/* Work Experience */}
            <div className="p-4 rounded-xl bg-accent/50 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase size={14} className="text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Work Experience</h3>
              </div>
              <div className="space-y-3">
                {CANDIDATE_DATA.experience.map((exp, i) => (
                  <div key={i} className="text-sm border-l-2 border-primary/30 pl-3">
                    <p className="font-medium text-foreground">{exp.role}</p>
                    <p className="text-muted-foreground">{exp.company} · {exp.period}</p>
                    <p className="text-muted-foreground mt-0.5">{exp.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="p-4 rounded-xl bg-accent/50 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={14} className="text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {CANDIDATE_DATA.skills.map(skill => (
                  <span key={skill} className="text-xs bg-white border border-border px-2.5 py-1 rounded-full font-medium text-foreground">{skill}</span>
                ))}
              </div>
            </div>

            {/* Certifications & Portfolio */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-accent/50 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={14} className="text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Certifications</h3>
                </div>
                <ul className="space-y-1">
                  {CANDIDATE_DATA.certifications.map((cert, i) => (
                    <li key={i} className="text-xs text-muted-foreground">• {cert}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-accent/50 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Link2 size={14} className="text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Portfolio Links</h3>
                </div>
                <ul className="space-y-1">
                  {CANDIDATE_DATA.portfolio.map((link, i) => (
                    <li key={i} className="text-xs text-primary font-medium">• {link}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="bg-white border border-border rounded-xl shadow-sm p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Ready to apply?</p>
            <p className="text-xs text-muted-foreground mt-0.5">All details will be sent to {job.company}'s hiring team</p>
          </div>
          <button
            onClick={handleApply}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md"
          >
            <Send size={15} />
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
}
