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
              <button className="mt-3 text-sm font-medium text-[#0A66C2] hover:underline">
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
              <button className="mt-3 text-sm font-medium text-[#24292e] hover:underline">
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
              <button className="mt-3 text-sm font-medium text-orange-600 hover:underline">
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
              <button className="mt-3 text-sm font-medium text-violet-600 hover:underline">
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
                  <button
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
                  <button className="px-3 py-1.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
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
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors">
              <Download className="w-4 h-4" />
              Download as PDF
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition-colors">
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
            <button className="px-4 py-2.5 rounded-lg bg-card border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors whitespace-nowrap">
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
    </div>
  );
}
