import { demoToast } from "./toast";
import { useState } from "react";
import {
  Globe,
  FileText,
  Github,
  Linkedin,
  Palette,
  Layout,
  Sparkles,
  Download,
  ExternalLink,
  Eye,
  GripVertical,
  Check,
  Upload,
  Code2,
  Briefcase,
  GraduationCap,
  Copy,
  Zap,
  Search,
  FileCheck,
  User,
  FolderGit2,
  Award,
  MessageSquare,
  Mail,
  FileDown,
  File,
  X,
  ArrowRight,
} from "lucide-react";

const templates = [
  { id: "minimal", name: "Minimal", desc: "Clean, whitespace-focused", colors: ["#f8fafc", "#e2e8f0", "#94a3b8"] },
  { id: "creative", name: "Creative", desc: "Bold colors, asymmetric layout", colors: ["#7c3aed", "#f59e0b", "#ec4899"] },
  { id: "corporate", name: "Corporate", desc: "Professional, structured", colors: ["#1e3a5f", "#2563eb", "#f1f5f9"] },
  { id: "developer", name: "Developer", desc: "Dark theme, code-inspired", colors: ["#0f172a", "#22d3ee", "#a78bfa"] },
  { id: "academic", name: "Academic", desc: "Research & publication focused", colors: ["#fefce8", "#854d0e", "#365314"] },
  { id: "startup", name: "Startup", desc: "Modern, gradient-heavy", colors: ["#6366f1", "#8b5cf6", "#ec4899"] },
];

const defaultSections = [
  { id: "about", name: "About Me", desc: "Auto-generated from Career DNA", icon: User, enabled: true },
  { id: "experience", name: "Experience", desc: "From LinkedIn/Resume", icon: Briefcase, enabled: true },
  { id: "projects", name: "Projects", desc: "From GitHub", icon: FolderGit2, enabled: true },
  { id: "skills", name: "Skills & Certifications", desc: "Aggregated from all sources", icon: Award, enabled: true },
  { id: "testimonials", name: "Testimonials", desc: "References & endorsements", icon: MessageSquare, enabled: false },
  { id: "contact", name: "Contact", desc: "Email, social links, calendar", icon: Mail, enabled: true },
];

export function PortfolioBuilder() {
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [dnaImported, setDnaImported] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [sections, setSections] = useState(defaultSections);
  const [aiPolished, setAiPolished] = useState(false);
  const [seoOptimized, setSeoOptimized] = useState(false);
  const [atsGenerated, setAtsGenerated] = useState(false);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [customDomain, setCustomDomain] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [resumeFormat, setResumeFormat] = useState<"pdf" | "word">("pdf");
  const [resumeTemplate, setResumeTemplate] = useState("professional");
  const [resumeGenerated, setResumeGenerated] = useState(false);

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleCopyLink = () => {
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            AI-Powered Builder
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Resume & Portfolio Website Builder
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Create a stunning portfolio website from your LinkedIn, GitHub, and existing resume in minutes
          </p>
          <button
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#16284B] text-white font-semibold text-base hover:bg-[#1e3a6a] transition-all shadow-lg shadow-[#16284B]/25 hover:shadow-xl hover:shadow-[#16284B]/30 hover:-translate-y-0.5 mt-2"
          >
            <Eye className="w-5 h-5" />
            Preview Portfolio Website
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Import Sources */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold">1</span>
            <h2 className="text-xl font-semibold text-foreground">Import Your Sources</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* LinkedIn */}
            <div
              className={`relative rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-md ${
                linkedinConnected ? "border-green-400 bg-green-50" : "border-border bg-card"
              }`}
              onClick={() => setLinkedinConnected(!linkedinConnected)}
            >
              {linkedinConnected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="w-10 h-10 rounded-lg bg-[#0A66C2] flex items-center justify-center mb-3">
                <Linkedin className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">Connect LinkedIn</h3>
              <p className="text-sm text-muted-foreground mt-1">Import experience & skills</p>
              <button onClick={() => { setLinkedinConnected(true); demoToast("LinkedIn connected — experience & skills imported \u2713"); }} className="mt-3 text-sm font-medium text-[#0A66C2] hover:underline">
                {linkedinConnected ? "Connected" : "Connect"}
              </button>
            </div>

            {/* GitHub */}
            <div
              className={`relative rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-md ${
                githubConnected ? "border-green-400 bg-green-50" : "border-border bg-card"
              }`}
              onClick={() => setGithubConnected(!githubConnected)}
            >
              {githubConnected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="w-10 h-10 rounded-lg bg-[#24292e] flex items-center justify-center mb-3">
                <Github className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">Connect GitHub</h3>
              <p className="text-sm text-muted-foreground mt-1">Showcase your projects</p>
              <button onClick={() => { setGithubConnected(true); demoToast("GitHub connected — 12 repos scanned for project evidence \u2713"); }} className="mt-3 text-sm font-medium text-[#24292e] hover:underline">
                {githubConnected ? "Connected" : "Connect"}
              </button>
            </div>

            {/* Upload Resume */}
            <div
              className={`relative rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-md ${
                resumeUploaded ? "border-green-400 bg-green-50" : "border-border bg-card border-dashed"
              }`}
              onClick={() => setResumeUploaded(!resumeUploaded)}
            >
              {resumeUploaded && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
                <Upload className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-foreground">Upload Resume</h3>
              <p className="text-sm text-muted-foreground mt-1">Drag & drop PDF or DOCX</p>
              <button onClick={() => { setResumeUploaded(true); demoToast("Resume uploaded and parsed \u2713"); }} className="mt-3 text-sm font-medium text-orange-600 hover:underline">
                {resumeUploaded ? "Uploaded" : "Upload"}
              </button>
            </div>

            {/* Career DNA */}
            <div
              className={`relative rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-md ${
                dnaImported ? "border-green-400 bg-green-50" : "border-border bg-card"
              }`}
              onClick={() => setDnaImported(!dnaImported)}
            >
              {dnaImported && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="font-semibold text-foreground">CareerX-Ray DNA</h3>
              <p className="text-sm text-muted-foreground mt-1">Auto-pull from your profile</p>
              <button onClick={() => { setDnaImported(true); demoToast("Career DNA imported — archetype and strengths added \u2713"); }} className="mt-3 text-sm font-medium text-violet-600 hover:underline">
                {dnaImported ? "Imported" : "Import"}
              </button>
            </div>
          </div>
        </div>

        {/* Step 2: Choose Style */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold">2</span>
            <h2 className="text-xl font-semibold text-foreground">Choose Your Style</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => (
              <div
                key={t.id}
                className={`rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate === t.id ? "border-blue-500 ring-2 ring-blue-200" : "border-border bg-card"
                }`}
                onClick={() => setSelectedTemplate(t.id)}
              >
                {/* Mini preview */}
                <div className="h-32 rounded-lg overflow-hidden mb-3 relative" style={{ background: t.colors[0] }}>
                  <div className="absolute top-3 left-3 right-3 h-3 rounded" style={{ background: t.colors[1] }} />
                  <div className="absolute top-9 left-3 w-16 h-2 rounded" style={{ background: t.colors[2] }} />
                  <div className="absolute top-14 left-3 right-8 h-2 rounded opacity-50" style={{ background: t.colors[1] }} />
                  <div className="absolute top-19 left-3 right-12 h-2 rounded opacity-30" style={{ background: t.colors[1] }} />
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <div className="w-8 h-8 rounded" style={{ background: t.colors[2], opacity: 0.6 }} />
                    <div className="w-8 h-8 rounded" style={{ background: t.colors[2], opacity: 0.4 }} />
                    <div className="w-8 h-8 rounded" style={{ background: t.colors[2], opacity: 0.2 }} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{t.name}</h3>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                  <button onClick={() => setSelectedTemplate(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedTemplate === t.id
                        ? "bg-blue-600 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {selectedTemplate === t.id ? "Selected" : "Select"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Customize Sections */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold">3</span>
            <h2 className="text-xl font-semibold text-foreground">Customize Sections</h2>
          </div>
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.id} className="flex items-center gap-4 p-4">
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab shrink-0" />
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground">{section.name}</h4>
                    <p className="text-xs text-muted-foreground">{section.desc}</p>
                  </div>
                  <button onClick={() => demoToast(`Editing \u201c${section.name}\u201d \u2014 inline editor opens in the full version`)} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                    Edit
                  </button>
                  {/* Toggle */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                      section.enabled ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        section.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 4: AI Enhancement */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold">4</span>
            <h2 className="text-xl font-semibold text-foreground">AI Enhancement</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => { setAiPolished(!aiPolished); setShowBeforeAfter(true); }}
              className={`rounded-xl border-2 p-5 text-left transition-all hover:shadow-md ${
                aiPolished ? "border-violet-400 bg-violet-50" : "border-border bg-card"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="font-semibold text-foreground">AI Polish</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Let AI rewrite your bio and project descriptions for impact
              </p>
              {aiPolished && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs text-violet-600 font-medium">
                  <Check className="w-3 h-3" /> Applied
                </span>
              )}
            </button>

            <button
              onClick={() => { setSeoOptimized(!seoOptimized); setShowBeforeAfter(true); }}
              className={`rounded-xl border-2 p-5 text-left transition-all hover:shadow-md ${
                seoOptimized ? "border-emerald-400 bg-emerald-50" : "border-border bg-card"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
                <Search className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-foreground">SEO Optimize</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Optimize for recruiter search and discoverability
              </p>
              {seoOptimized && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-600 font-medium">
                  <Check className="w-3 h-3" /> Applied
                </span>
              )}
            </button>

            <button
              onClick={() => { setAtsGenerated(!atsGenerated); setShowBeforeAfter(true); }}
              className={`rounded-xl border-2 p-5 text-left transition-all hover:shadow-md ${
                atsGenerated ? "border-blue-400 bg-blue-50" : "border-border bg-card"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                <FileCheck className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-foreground">ATS-Friendly Resume</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Generate a parallel ATS resume from the same data
              </p>
              {atsGenerated && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 font-medium">
                  <Check className="w-3 h-3" /> Applied
                </span>
              )}
            </button>
          </div>

          {/* Before/After Preview */}
          {showBeforeAfter && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Before & After Preview
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted p-4">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Before</span>
                  <p className="text-sm text-foreground mt-2">
                    Software engineer with 5 years experience. Worked on various projects including web apps and APIs. Good at JavaScript and Python.
                  </p>
                </div>
                <div className="rounded-lg bg-violet-50 border border-violet-200 p-4">
                  <span className="text-xs font-medium text-violet-600 uppercase tracking-wide">After (AI Enhanced)</span>
                  <p className="text-sm text-foreground mt-2">
                    Full-stack engineer with 5+ years of shipping production software at scale. Architected high-throughput APIs serving 2M+ requests/day and led frontend modernization initiatives that reduced load times by 40%.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 5: Traditional Resume Generator */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold">5</span>
            <h2 className="text-xl font-semibold text-foreground">Generate Traditional Resume</h2>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <p className="text-sm text-muted-foreground">
              Generate a professional, ATS-friendly resume document (Word or PDF) from the same data used for your portfolio website.
            </p>

            {/* Format selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Output Format</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setResumeFormat("pdf")}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 transition-all ${
                    resumeFormat === "pdf"
                      ? "border-red-400 bg-red-50 text-red-700"
                      : "border-border bg-white text-muted-foreground hover:border-red-200"
                  }`}
                >
                  <FileDown className="w-5 h-5" />
                  <div className="text-left">
                    <p className="text-sm font-semibold">PDF</p>
                    <p className="text-xs opacity-70">Best for submitting applications</p>
                  </div>
                </button>
                <button
                  onClick={() => setResumeFormat("word")}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 transition-all ${
                    resumeFormat === "word"
                      ? "border-blue-400 bg-blue-50 text-blue-700"
                      : "border-border bg-white text-muted-foreground hover:border-blue-200"
                  }`}
                >
                  <File className="w-5 h-5" />
                  <div className="text-left">
                    <p className="text-sm font-semibold">Word (.docx)</p>
                    <p className="text-xs opacity-70">Easy to edit & customize further</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Resume template styles */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Resume Style</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "professional", name: "Professional", color: "bg-slate-800" },
                  { id: "modern", name: "Modern", color: "bg-blue-600" },
                  { id: "classic", name: "Classic", color: "bg-stone-700" },
                  { id: "creative-resume", name: "Creative", color: "bg-violet-600" },
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setResumeTemplate(style.id)}
                    className={`rounded-xl border-2 p-3 transition-all ${
                      resumeTemplate === style.id
                        ? "border-primary ring-2 ring-blue-200"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    {/* Mini resume preview */}
                    <div className="h-24 rounded-lg bg-white border border-gray-200 p-2 mb-2 relative overflow-hidden">
                      <div className={`h-2 w-16 rounded ${style.color} mb-1.5`} />
                      <div className="h-1 w-full rounded bg-gray-200 mb-1" />
                      <div className="h-1 w-4/5 rounded bg-gray-200 mb-2" />
                      <div className={`h-1.5 w-12 rounded ${style.color} opacity-60 mb-1`} />
                      <div className="h-1 w-full rounded bg-gray-100 mb-0.5" />
                      <div className="h-1 w-3/4 rounded bg-gray-100 mb-0.5" />
                      <div className="h-1 w-5/6 rounded bg-gray-100" />
                    </div>
                    <p className="text-xs font-medium text-foreground text-center">{style.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => setResumeGenerated(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Generate Resume ({resumeFormat === "pdf" ? "PDF" : "Word"})
              </button>
              {resumeGenerated && (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                    <Check className="w-4 h-4" /> Resume ready!
                  </span>
                  <button
                    onClick={() => {}}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-white text-foreground text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download {resumeFormat === "pdf" ? ".pdf" : ".docx"}
                  </button>
                </div>
              )}
            </div>

            {/* Resume preview */}
            {resumeGenerated && (
              <div className="rounded-xl border border-border bg-white p-6 mt-4 shadow-sm">
                <div className="max-w-[600px] mx-auto space-y-4">
                  <div className="text-center border-b border-gray-200 pb-4">
                    <h3 className="text-lg font-bold text-slate-800">Jordan Kim</h3>
                    <p className="text-sm text-slate-600">Senior Data Analyst · Kuala Lumpur, Malaysia</p>
                    <p className="text-xs text-slate-500 mt-1">jordan.kim@email.com · linkedin.com/in/jordankim · github.com/jordankim</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Professional Summary</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Data analyst with 5+ years of experience in digital banking and fintech. Skilled in SQL, Python, and Tableau with a track record of delivering actionable insights that drove 23% revenue growth. Career DNA: Forge Beaver — high execution, technical ownership.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Experience</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between items-baseline">
                          <p className="text-xs font-semibold text-slate-800">Senior Data Analyst — Maybank</p>
                          <p className="text-xs text-slate-500">2022 – Present</p>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">Led analytics for digital banking products, built dashboards serving 200+ stakeholders.</p>
                      </div>
                      <div>
                        <div className="flex justify-between items-baseline">
                          <p className="text-xs font-semibold text-slate-800">Data Analyst — Grab</p>
                          <p className="text-xs text-slate-500">2020 – 2022</p>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">Owned rider-demand forecasting models, reducing supply mismatch by 18%.</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {["SQL", "Python", "Tableau", "Power BI", "dbt", "BigQuery", "Stakeholder Storytelling"].map(s => (
                        <span key={s} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview & Publish */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Preview & Publish</h2>
          {/* Mock Preview */}
          <div className="rounded-xl bg-slate-950 p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-blue-600/10" />
            <div className="relative space-y-4">
              {/* Mock browser chrome */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 ml-3 h-7 rounded-md bg-slate-800 flex items-center px-3">
                  <Globe className="w-3 h-3 text-slate-500 mr-2" />
                  <span className="text-xs text-slate-400">careerxray.me/johndoe</span>
                </div>
              </div>
              {/* Mock site content */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-blue-500" />
                  <div>
                    <div className="h-4 w-32 rounded bg-slate-700" />
                    <div className="h-3 w-48 rounded bg-slate-800 mt-1.5" />
                  </div>
                </div>
                <div className="h-3 w-full rounded bg-slate-800 opacity-60" />
                <div className="h-3 w-4/5 rounded bg-slate-800 opacity-40" />
                <div className="flex gap-3 mt-4">
                  <div className="h-20 flex-1 rounded-lg bg-slate-800/60 border border-slate-700" />
                  <div className="h-20 flex-1 rounded-lg bg-slate-800/60 border border-slate-700" />
                  <div className="h-20 flex-1 rounded-lg bg-slate-800/60 border border-slate-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setPreviewOpen(!previewOpen)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview Full Site
            </button>
            <button onClick={() => demoToast("Portfolio exported as PDF \u2713")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors">
              <Download className="w-4 h-4" />
              Download as PDF
            </button>
            <button onClick={() => demoToast("Published to careerxray.me/jordankim \u2713 \u2014 link is live")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition-colors">
              <ExternalLink className="w-4 h-4" />
              Publish to careerxray.me/username
            </button>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors"
            >
              {linkCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {linkCopied ? "Copied!" : "Copy Link"}
            </button>
          </div>

          {/* Custom Domain */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="Enter custom domain (e.g., johndoe.dev)"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button onClick={() => demoToast(customDomain ? `${customDomain} connected \u2713` : "Enter a domain first, then connect")} className="px-4 py-2.5 rounded-lg bg-card border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors whitespace-nowrap">
              Connect Domain
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="rounded-xl border border-border bg-card p-5 text-center">
            <p className="text-2xl font-bold text-foreground">2,847</p>
            <p className="text-sm text-muted-foreground mt-1">Portfolios created</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 text-center">
            <p className="text-2xl font-bold text-emerald-600">68%</p>
            <p className="text-sm text-muted-foreground mt-1">More interview callbacks</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 text-center">
            <p className="text-2xl font-bold text-foreground">4.2 min</p>
            <p className="text-sm text-muted-foreground mt-1">Avg time to create</p>
          </div>
        </div>
      </div>

      {/* ── Full-Screen Portfolio Preview Modal ── */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex flex-col">
          {/* Close button */}
          <button
            onClick={() => setPreviewOpen(false)}
            className="fixed top-4 right-4 z-[60] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-sm border border-white/10"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Preview badge */}
          <div className="fixed top-4 left-4 z-[60] inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 text-xs font-medium">
            <Eye className="w-3.5 h-3.5" />
            Portfolio Preview
          </div>

          {/* Scrollable preview content */}
          <div className="flex-1 overflow-y-auto">
            <div className="min-h-full bg-slate-950">

              {/* ── NAV BAR ── */}
              <nav className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-white tracking-tight">
                    Jordan<span className="text-violet-400">.</span>Kim
                  </span>
                  <div className="hidden sm:flex items-center gap-8">
                    {["About", "Skills", "Experience", "Projects", "Contact"].map((link) => (
                      <span
                        key={link}
                        className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {link}
                      </span>
                    ))}
                  </div>
                  <button onClick={() => demoToast("Preview only \u2014 this button is live on your published site")} className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors">
                    Hire Me
                  </button>
                </div>
              </nav>

              {/* ── HERO SECTION ── */}
              <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a]" />
                <div className="absolute inset-0">
                  <div className="absolute top-20 left-10 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl" />
                  <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
                  <div className="absolute top-40 right-40 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-6xl mx-auto px-6 py-24 sm:py-32">
                  <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm mb-6">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Available for opportunities
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-bold text-white mb-4 tracking-tight">
                      Jordan Kim
                    </h1>
                    <p className="text-xl sm:text-2xl text-violet-300 font-medium mb-6">
                      Data Analyst & Analytics Professional
                    </p>
                    <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mb-10">
                      Transforming complex data into actionable business insights. 5+ years of experience
                      in digital banking, fintech, and e-commerce analytics. Passionate about building
                      data-driven cultures and delivering measurable impact through storytelling and
                      visualization.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <button onClick={() => demoToast("Preview only \u2014 this button is live on your published site")} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/25">
                        <FolderGit2 className="w-4 h-4" />
                        View Projects
                      </button>
                      <button onClick={() => demoToast("Preview only \u2014 this button is live on your published site")} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all">
                        <Mail className="w-4 h-4" />
                        Contact Me
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── SKILLS SECTION ── */}
              <section className="bg-[#0f172a] py-20 border-t border-slate-800/50">
                <div className="max-w-6xl mx-auto px-6">
                  <div className="text-center mb-14">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Technical Skills</h2>
                    <p className="text-slate-400 max-w-xl mx-auto">
                      Core competencies honed across multiple industries and data-intensive roles
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { name: "SQL", level: 95, color: "from-blue-500 to-cyan-400", bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
                      { name: "Python", level: 90, color: "from-emerald-500 to-teal-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
                      { name: "Tableau", level: 80, color: "from-orange-500 to-amber-400", bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400" },
                      { name: "Storytelling", level: 85, color: "from-violet-500 to-purple-400", bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400" },
                      { name: "Power BI", level: 70, color: "from-yellow-500 to-amber-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400" },
                      { name: "dbt", level: 60, color: "from-rose-500 to-pink-400", bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400" },
                      { name: "BigQuery", level: 60, color: "from-sky-500 to-blue-400", bg: "bg-sky-500/10", border: "border-sky-500/20", text: "text-sky-400" },
                      { name: "Excel", level: 70, color: "from-green-500 to-emerald-400", bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400" },
                    ].map((skill) => (
                      <div
                        key={skill.name}
                        className={`rounded-xl ${skill.bg} border ${skill.border} p-5 hover:scale-[1.02] transition-transform`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-white text-sm">{skill.name}</h3>
                          <span className={`text-xs font-bold ${skill.text}`}>{skill.level}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${skill.color}`}
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* ── EXPERIENCE SECTION ── */}
              <section className="bg-slate-950 py-20 border-t border-slate-800/50">
                <div className="max-w-6xl mx-auto px-6">
                  <div className="text-center mb-14">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Experience</h2>
                    <p className="text-slate-400 max-w-xl mx-auto">
                      A track record of turning data into business outcomes
                    </p>
                  </div>
                  <div className="relative max-w-3xl mx-auto">
                    {/* Timeline line */}
                    <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-violet-500 via-blue-500 to-slate-700" />

                    <div className="space-y-10">
                      {[
                        {
                          role: "Data Analyst",
                          company: "Maybank",
                          period: "2024 - Present",
                          description: "Analyzed customer data patterns across digital banking products, built executive dashboards serving 200+ stakeholders, and identified cross-selling opportunities that drove 23% revenue growth in targeted segments.",
                          color: "bg-violet-500",
                          tags: ["SQL", "Tableau", "Python"],
                        },
                        {
                          role: "Analytics Intern",
                          company: "Grab",
                          period: "2023 - 2024",
                          description: "Supported the analytics engineering team in building rider-demand forecasting models, reducing supply-demand mismatch by 18%. Developed automated reporting pipelines using dbt and BigQuery.",
                          color: "bg-blue-500",
                          tags: ["dbt", "BigQuery", "Python"],
                        },
                        {
                          role: "Data Intern",
                          company: "Petronas Digital",
                          period: "2023",
                          description: "Assisted in data pipeline development and maintenance for upstream operations analytics. Built data quality monitoring dashboards and contributed to the migration of legacy ETL processes.",
                          color: "bg-cyan-500",
                          tags: ["SQL", "Power BI", "Excel"],
                        },
                      ].map((exp, i) => (
                        <div key={i} className="relative pl-12">
                          {/* Timeline dot */}
                          <div className={`absolute left-2.5 top-1.5 w-4 h-4 rounded-full ${exp.color} border-4 border-slate-950 shadow-lg`} />
                          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6 hover:border-slate-700 transition-colors">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-white">{exp.role}</h3>
                              <span className="text-slate-500">--</span>
                              <span className="text-violet-400 font-medium">{exp.company}</span>
                            </div>
                            <p className="text-sm text-slate-500 mb-3">{exp.period}</p>
                            <p className="text-slate-400 leading-relaxed text-sm mb-4">{exp.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {exp.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* ── PROJECTS SECTION ── */}
              <section className="bg-[#0f172a] py-20 border-t border-slate-800/50">
                <div className="max-w-6xl mx-auto px-6">
                  <div className="text-center mb-14">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Featured Projects</h2>
                    <p className="text-slate-400 max-w-xl mx-auto">
                      Selected work showcasing analytical thinking and technical execution
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        title: "Customer Churn Prediction Model",
                        tags: ["Python", "SQL"],
                        description: "Built a machine learning model achieving 87% accuracy in predicting customer churn for a digital banking product, enabling proactive retention campaigns that saved an estimated RM 2.4M annually.",
                        gradient: "from-violet-600/20 to-blue-600/20",
                        border: "border-violet-500/30",
                        icon: "from-violet-500 to-blue-500",
                      },
                      {
                        title: "Executive Analytics Dashboard",
                        tags: ["Tableau", "Power BI"],
                        description: "Designed and deployed a real-time KPI dashboard for C-suite executives, consolidating data from 12+ sources into a single pane of glass with automated daily refreshes and anomaly alerts.",
                        gradient: "from-orange-600/20 to-amber-600/20",
                        border: "border-orange-500/30",
                        icon: "from-orange-500 to-amber-500",
                      },
                      {
                        title: "Data Pipeline Automation",
                        tags: ["dbt", "BigQuery"],
                        description: "Automated ETL workflows reducing manual data processing work by 60%, improving data freshness from T+2 to near-real-time, and establishing data quality checks across 50+ critical tables.",
                        gradient: "from-cyan-600/20 to-teal-600/20",
                        border: "border-cyan-500/30",
                        icon: "from-cyan-500 to-teal-500",
                      },
                    ].map((project, i) => (
                      <div
                        key={i}
                        className={`group rounded-xl bg-gradient-to-br ${project.gradient} border ${project.border} p-6 hover:scale-[1.02] transition-all duration-300`}
                      >
                        {/* Project icon */}
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${project.icon} flex items-center justify-center mb-5 shadow-lg`}>
                          <Code2 className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{project.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-xs font-medium border border-white/10"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed mb-5">{project.description}</p>
                        <span className="inline-flex items-center gap-1.5 text-sm text-violet-400 font-medium group-hover:gap-2.5 transition-all cursor-pointer">
                          View Details <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* ── CONTACT SECTION ── */}
              <section className="bg-slate-950 py-20 border-t border-slate-800/50">
                <div className="max-w-6xl mx-auto px-6">
                  <div className="text-center mb-14">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Get In Touch</h2>
                    <p className="text-slate-400 max-w-xl mx-auto">
                      Interested in working together? Feel free to reach out through any of these channels.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                    <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6 text-center hover:border-slate-700 transition-colors group">
                      <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Mail className="w-5 h-5 text-violet-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1">Email</h3>
                      <p className="text-sm text-slate-400">jordan.kim@email.com</p>
                    </div>
                    <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6 text-center hover:border-slate-700 transition-colors group">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Linkedin className="w-5 h-5 text-blue-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1">LinkedIn</h3>
                      <p className="text-sm text-slate-400">linkedin.com/in/jordankim</p>
                    </div>
                    <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6 text-center hover:border-slate-700 transition-colors group">
                      <div className="w-12 h-12 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Github className="w-5 h-5 text-slate-300" />
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1">GitHub</h3>
                      <p className="text-sm text-slate-400">github.com/jordankim</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── FOOTER ── */}
              <footer className="bg-[#0f172a] border-t border-slate-800/50 py-8">
                <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Built with <span className="text-violet-400">CareerX-Ray</span> Portfolio Builder
                  </span>
                  <span className="text-sm text-slate-600">
                    &copy; 2026 Jordan Kim. All rights reserved.
                  </span>
                </div>
              </footer>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
