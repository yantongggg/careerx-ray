import { useState } from "react";
import {
  Calendar,
  Clock,
  Mail,
  MessageCircle,
  RefreshCw,
  RotateCcw,
  Send,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";

const kpis = [
  { label: "Warm candidates", value: "218", icon: Users },
  { label: "Re-contactable now", value: "42", icon: UserPlus },
  { label: "Open rate on outreach", value: "67%", icon: Mail },
];

type Candidate = {
  name: string;
  previousRole: string;
  reason: string;
  status: string;
  lastActive: string;
};

const silverMedalists: Candidate[] = [
  {
    name: "Aisyah Rahman",
    previousRole: "Data Analyst",
    reason: "Narrowly missed - another candidate had more SQL experience",
    status: "Active on platform (2 days ago)",
    lastActive: "2 days ago",
  },
  {
    name: "Jordan Kim",
    previousRole: "Software Engineer",
    reason: "Role was paused due to budget freeze",
    status: "Updated profile recently",
    lastActive: "1 week ago",
  },
  {
    name: "Daniel Ooi",
    previousRole: "Frontend Developer",
    reason: "Timing - accepted another offer before final round",
    status: "Open to opportunities",
    lastActive: "3 days ago",
  },
  {
    name: "Mei Chen Loh",
    previousRole: "Product Manager",
    reason: "Great culture fit but needed more domain experience",
    status: "Completed new certification",
    lastActive: "5 days ago",
  },
];

const careerFairLeads: Candidate[] = [
  {
    name: "Faiz Abdullah",
    previousRole: "Cloud Engineer (booth interest)",
    reason: "Engaged at career fair but didn't complete application",
    status: "Graduating this semester",
    lastActive: "1 week ago",
  },
  {
    name: "Sarah Tan",
    previousRole: "UX Designer (portfolio review)",
    reason: "Showed strong portfolio at booth, no follow-up sent",
    status: "Active job seeker",
    lastActive: "4 days ago",
  },
  {
    name: "Raj Patel",
    previousRole: "Data Science (QR scan)",
    reason: "Scanned booth QR but didn't receive outreach",
    status: "Completing final year project",
    lastActive: "2 weeks ago",
  },
];

const pastApplicants: Candidate[] = [
  {
    name: "Nadia Ismail",
    previousRole: "Business Analyst (6 months ago)",
    reason: "Under-qualified at time - lacked Power BI experience",
    status: "Now certified in Power BI",
    lastActive: "1 day ago",
  },
  {
    name: "Wei Lin Tan",
    previousRole: "Analytics Engineer (8 months ago)",
    reason: "Team was restructured before hiring",
    status: "Gained relevant internship experience",
    lastActive: "3 days ago",
  },
  {
    name: "Priya Raman",
    previousRole: "Data Engineer (1 year ago)",
    reason: "Salary expectations misaligned at the time",
    status: "Open to negotiation per profile update",
    lastActive: "1 week ago",
  },
];

const reengagementTimeline = [
  { time: "Monday AM", activity: "Silver medalists check new roles", score: 92 },
  { time: "Wednesday PM", activity: "Career fair leads browse employer profiles", score: 78 },
  { time: "Friday AM", activity: "Past applicants update portfolios", score: 85 },
  { time: "Sunday PM", activity: "All segments most responsive to outreach", score: 95 },
];

type TabKey = "silver" | "fair" | "past";

export function TalentReengagement() {
  const [activeTab, setActiveTab] = useState<TabKey>("silver");
  const [reengagedCandidates, setReengagedCandidates] = useState<string[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [composerTarget, setComposerTarget] = useState<string>("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "silver", label: "Silver Medalists", count: silverMedalists.length },
    { key: "fair", label: "Career Fair Leads", count: careerFairLeads.length },
    { key: "past", label: "Past Applicants", count: pastApplicants.length },
  ];

  const getCandidates = (): Candidate[] => {
    switch (activeTab) {
      case "silver":
        return silverMedalists;
      case "fair":
        return careerFairLeads;
      case "past":
        return pastApplicants;
    }
  };

  const handleReengage = (name: string) => {
    setComposerTarget(name);
    setShowComposer(true);
    setGeneratedMessage("");
  };

  const handleGenerateMessage = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const messages: Record<string, string> = {
        "Aisyah Rahman": `Hi Aisyah, I hope you're doing well! We were genuinely impressed with your analytical skills during our Data Analyst interview process. We now have a new Senior Analyst opening that would be a great match for your SQL and Python expertise. Would you be open to a quick chat this week?`,
        "Jordan Kim": `Hi Jordan, I wanted to reach out because we've reopened the Software Engineer role that was previously paused. Your technical skills and collaborative approach left a strong impression on our team. The role now includes cloud architecture work - would this interest you?`,
        default: `Hi ${composerTarget}, I'm reaching out from Maybank's talent team. We've been reviewing our candidate pipeline and your profile stood out. We have new opportunities that align with your skills and career goals. Would you be interested in reconnecting?`,
      };
      setGeneratedMessage(messages[composerTarget] || messages.default);
      setIsGenerating(false);
    }, 800);
  };

  const handleSendOutreach = () => {
    setReengagedCandidates((prev) => [...prev, composerTarget]);
    alert(`Outreach sent to ${composerTarget}`);
    setShowComposer(false);
    setComposerTarget("");
    setGeneratedMessage("");
  };

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
              <RotateCcw size={22} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Talent Re-Engagement Engine</h1>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed mt-1">
                Re-engage silver medalist candidates, career fair leads, and past applicants before competitors do.
                These are warm candidates who already know your brand.
              </p>
            </div>
            <button
              onClick={() => alert("Bulk re-engagement campaign started for 42 candidates")}
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700"
            >
              <RefreshCw size={14} /> Bulk Re-engage
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid sm:grid-cols-3 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <kpi.icon size={17} className="text-muted-foreground" />
              <p className="text-2xl font-bold text-foreground mt-3">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <section className="bg-white border border-border rounded-xl shadow-sm">
          <div className="flex border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-4 py-3.5 text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? "text-primary border-b-2 border-primary bg-blue-50/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {tab.label}
                <span className="ml-2 text-xs bg-muted border border-border px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Candidate List */}
          <div className="p-5 space-y-3">
            {getCandidates().map((candidate) => {
              const isReengaged = reengagedCandidates.includes(candidate.name);
              return (
                <div
                  key={candidate.name}
                  className="border border-border rounded-xl p-4 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">{candidate.name}</p>
                        {isReengaged && (
                          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                            Outreach sent
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Previously: {candidate.previousRole}</p>
                      <p className="text-xs text-foreground mt-2">
                        <span className="font-medium">Why not selected:</span> {candidate.reason}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                          <TrendingUp size={11} /> {candidate.status}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock size={11} /> {candidate.lastActive}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleReengage(candidate.name)}
                      disabled={isReengaged}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isReengaged
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-purple-600 text-white hover:bg-purple-700"
                      }`}
                    >
                      <MessageCircle size={12} /> {isReengaged ? "Sent" : "Re-engage"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* AI Outreach Composer */}
        {showComposer && (
          <section className="bg-white border border-purple-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-purple-600" />
              <h2 className="font-semibold text-foreground">AI Outreach Composer</h2>
              <span className="text-xs text-muted-foreground">for {composerTarget}</span>
            </div>

            {generatedMessage ? (
              <div className="space-y-4">
                <textarea
                  value={generatedMessage}
                  onChange={(e) => setGeneratedMessage(e.target.value)}
                  className="w-full border border-border rounded-xl p-4 text-sm text-foreground min-h-[120px] focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSendOutreach}
                    className="inline-flex items-center gap-1.5 bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700"
                  >
                    <Send size={14} /> Send Outreach
                  </button>
                  <button
                    onClick={handleGenerateMessage}
                    className="inline-flex items-center gap-1.5 border border-border text-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:border-purple-300"
                  >
                    <RefreshCw size={14} /> Regenerate
                  </button>
                  <button
                    onClick={() => {
                      setShowComposer(false);
                      setGeneratedMessage("");
                    }}
                    className="inline-flex items-center gap-1.5 border border-border text-muted-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted/50 border border-border rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">
                    Generate a personalized re-engagement message based on {composerTarget}&apos;s history, skills, and current activity.
                  </p>
                </div>
                <button
                  onClick={handleGenerateMessage}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-60"
                >
                  <Zap size={14} /> {isGenerating ? "Generating..." : "Generate Personalized Message"}
                </button>
              </div>
            )}
          </section>
        )}

        {/* Re-engagement Timeline */}
        <section className="bg-white border border-border rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <Calendar size={16} className="text-muted-foreground" />
            <div>
              <h2 className="font-semibold text-foreground">Best Times to Re-engage</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Based on candidate activity patterns</p>
            </div>
          </div>
          <div className="space-y-3">
            {reengagementTimeline.map((item) => (
              <div key={item.time} className="flex items-center gap-4 border border-border rounded-xl p-4">
                <div className="w-28 shrink-0">
                  <p className="text-sm font-semibold text-foreground">{item.time}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{item.activity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-foreground w-8">{item.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Insight */}
        <div className="bg-slate-950 text-white rounded-xl p-5">
          <Sparkles size={18} className="text-purple-300 mb-3" />
          <h3 className="font-bold">Re-engagement Impact</h3>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Companies that re-engage silver medalists within 90 days see 4.7x higher conversion rates vs cold outreach.
            Your warm candidate pool represents RM 2.1M in saved recruitment costs.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              ["4.7x", "vs cold outreach"],
              ["RM 2.1M", "cost savings"],
              ["23 days", "avg time-to-hire"],
            ].map(([value, label]) => (
              <div key={label} className="bg-white/10 border border-white/10 rounded-xl p-3">
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
