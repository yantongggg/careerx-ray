import { useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Edit3,
  MessageSquareWarning,
  Send,
  Smile,
  TrendingDown,
  Users,
  Zap,
} from "lucide-react";

const kpis = [
  { label: "Avg response time", value: "1.8d", icon: Clock },
  { label: "Overdue replies", value: "7", icon: AlertTriangle },
  { label: "SLA compliance", value: "82%", icon: CheckCircle },
  { label: "Candidate satisfaction", value: "4.2/5", icon: Smile },
];

type OverdueItem = {
  candidate: string;
  role: string;
  stage: string;
  timeOverdue: string;
  hoursOverdue: number;
  action: string;
  suggestedReply: string;
};

const overdueItems: OverdueItem[] = [
  {
    candidate: "Wei Lin Tan",
    role: "BI Associate",
    stage: "Post-interview",
    timeOverdue: "52h overdue",
    hoursOverdue: 52,
    action: "Send transparent rejection",
    suggestedReply:
      "Hi Wei Lin, thank you for your time during the interview process for our BI Associate role. After careful consideration, we've decided to move forward with another candidate whose experience more closely matches our current needs. Your data visualization skills were impressive, and we'd love to keep your profile for future opportunities. Would you be open to that?",
  },
  {
    candidate: "Priya Raman",
    role: "Analytics Engineer",
    stage: "Screening",
    timeOverdue: "36h overdue",
    hoursOverdue: 36,
    action: "Confirm screening slot",
    suggestedReply:
      "Hi Priya, thanks for your patience! I'd like to confirm your screening call for the Analytics Engineer position. Are you available this Thursday at 10am or Friday at 2pm? Looking forward to speaking with you.",
  },
  {
    candidate: "Jordan Kim",
    role: "Data Analyst",
    stage: "Interview",
    timeOverdue: "28h overdue",
    hoursOverdue: 28,
    action: "Send interview outcome",
    suggestedReply:
      "Hi Jordan, great news! We were impressed by your performance in the technical assessment. We'd like to invite you to a final round interview with our Head of Data. Could you share your availability for next week?",
  },
  {
    candidate: "Faiz Abdullah",
    role: "Cloud Engineer",
    stage: "Applied",
    timeOverdue: "49h overdue",
    hoursOverdue: 49,
    action: "Acknowledge application",
    suggestedReply:
      "Hi Faiz, thank you for applying to our Cloud Engineer role. We've received your application and our team is currently reviewing it. You can expect to hear from us within the next 5 business days regarding next steps.",
  },
  {
    candidate: "Nadia Ismail",
    role: "Product Manager",
    stage: "Offer",
    timeOverdue: "18h overdue",
    hoursOverdue: 18,
    action: "Send offer details",
    suggestedReply:
      "Hi Nadia, we're thrilled to extend an offer for the Product Manager position! I'm attaching the formal offer letter with details on compensation, benefits, and start date. Please feel free to reach out with any questions.",
  },
  {
    candidate: "Daniel Ooi",
    role: "Frontend Developer",
    stage: "Screening",
    timeOverdue: "8h overdue",
    hoursOverdue: 8,
    action: "Schedule technical test",
    suggestedReply:
      "Hi Daniel, congratulations on progressing to the technical assessment stage for our Frontend Developer role! We'd like to schedule a 90-minute coding exercise. Would any time between Monday-Wednesday next week work for you?",
  },
  {
    candidate: "Mei Chen Loh",
    role: "Data Scientist",
    stage: "Post-interview",
    timeOverdue: "4h overdue",
    hoursOverdue: 4,
    action: "Provide feedback",
    suggestedReply:
      "Hi Mei Chen, thank you for completing the case study for our Data Scientist role. Our panel was impressed with your analytical approach. We're finalizing our decision and will get back to you by end of this week.",
  },
];

const trendData = [
  { day: "Mon", hours: 14 },
  { day: "Tue", hours: 22 },
  { day: "Wed", hours: 18 },
  { day: "Thu", hours: 31 },
  { day: "Fri", hours: 26 },
  { day: "Sat", hours: 42 },
  { day: "Sun", hours: 38 },
];

function getOverdueColor(hours: number): { bg: string; text: string; border: string; label: string } {
  if (hours > 48) return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Critical" };
  if (hours > 24) return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Warning" };
  return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", label: "On-time" };
}

export function ReplySlaMonitor() {
  const [selectedCandidate, setSelectedCandidate] = useState<OverdueItem | null>(null);
  const [editingReply, setEditingReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sentReplies, setSentReplies] = useState<string[]>([]);

  const handleSelectCandidate = (item: OverdueItem) => {
    setSelectedCandidate(item);
    setReplyText(item.suggestedReply);
    setEditingReply(false);
  };

  const handleSendReply = () => {
    if (selectedCandidate) {
      setSentReplies((prev) => [...prev, selectedCandidate.candidate]);
      alert(`Reply sent to ${selectedCandidate.candidate}`);
      setSelectedCandidate(null);
      setReplyText("");
    }
  };

  const handleReplyNow = (item: OverdueItem) => {
    handleSelectCandidate(item);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-muted">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
              <MessageSquareWarning size={22} className="text-red-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Candidate Transparency SLA</h1>
                <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full font-semibold animate-pulse">
                  <AlertTriangle size={11} /> 7 overdue
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed mt-1">
                Monitor and improve your response times. Candidates deserve transparency - no reply, slow reply, or unclear progress damages your employer brand.
              </p>
            </div>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <kpi.icon size={17} className="text-muted-foreground" />
              <p className="text-2xl font-bold text-foreground mt-3">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Overdue Communications Table */}
        <section className="bg-white border border-border rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-foreground">Overdue Communications</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Click a candidate to see AI-suggested reply</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> &gt;48h
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> 24-48h
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> On-time
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {overdueItems.map((item) => {
              const color = getOverdueColor(item.hoursOverdue);
              const isSent = sentReplies.includes(item.candidate);
              return (
                <div
                  key={item.candidate}
                  onClick={() => handleSelectCandidate(item)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    selectedCandidate?.candidate === item.candidate
                      ? "border-primary bg-blue-50/50"
                      : `${color.bg} ${color.border} hover:border-primary/40`
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{item.candidate}</p>
                          {isSent && (
                            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                              Replied
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.role} - {item.stage}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-bold ${color.text}`}>{item.timeOverdue}</p>
                        <span className={`text-xs ${color.text} ${color.bg} ${color.border} border px-2 py-0.5 rounded-full font-medium`}>
                          {color.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground w-44 hidden lg:block">{item.action}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReplyNow(item);
                      }}
                      disabled={isSent}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isSent
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-primary text-white hover:bg-blue-700"
                      }`}
                    >
                      <Send size={12} /> {isSent ? "Sent" : "Reply Now"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* AI Suggested Reply */}
        {selectedCandidate && (
          <section className="bg-white border border-primary/30 rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-primary" />
              <h2 className="font-semibold text-foreground">AI-Suggested Reply for {selectedCandidate.candidate}</h2>
            </div>
            {editingReply ? (
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full border border-border rounded-xl p-4 text-sm text-foreground min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <div className="bg-muted/50 border border-border rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">{replyText}</p>
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSendReply}
                className="inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700"
              >
                <Send size={14} /> Send
              </button>
              <button
                onClick={() => setEditingReply(!editingReply)}
                className="inline-flex items-center gap-1.5 border border-border text-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:border-primary/40"
              >
                <Edit3 size={14} /> {editingReply ? "Preview" : "Edit"}
              </button>
            </div>
          </section>
        )}

        {/* Response Time Trends */}
        <section className="bg-white border border-border rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={16} className="text-muted-foreground" />
            <div>
              <h2 className="font-semibold text-foreground">Response Time Trends</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Average hours to first reply, past 7 days</p>
            </div>
          </div>
          <div className="flex items-end gap-3 h-40">
            {trendData.map((bar) => (
              <div key={bar.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-foreground">{bar.hours}h</span>
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    bar.hours > 36 ? "bg-red-400" : bar.hours > 24 ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                  style={{ height: `${(bar.hours / 48) * 100}%` }}
                ></div>
                <span className="text-xs text-muted-foreground">{bar.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
            <TrendingDown size={14} className="text-red-500" />
            <p className="text-xs text-muted-foreground">
              Response times increased 18% over the weekend. Consider assigning weekend coverage or auto-acknowledgment.
            </p>
          </div>
        </section>

        {/* Bottom Stats */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-slate-950 text-white rounded-xl p-5">
            <Users size={18} className="text-blue-300 mb-3" />
            <h3 className="font-bold">Impact on Employer Brand</h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Employers who reply within 24h see 3.2x more applications and 47% higher offer acceptance rates. Your current SLA compliance puts you in the top 30% of employers on CareerX-Ray.
            </p>
          </div>
          <div className="bg-white border border-border rounded-xl shadow-sm p-5">
            <CheckCircle size={18} className="text-emerald-500 mb-3" />
            <h3 className="font-bold text-foreground">Quick Actions</h3>
            <div className="mt-3 space-y-2">
              <button
                onClick={() => alert("Auto-acknowledgment enabled for all new applications")}
                className="w-full text-left border border-border rounded-lg p-3 hover:border-primary/40 transition-all"
              >
                <p className="text-sm font-semibold text-foreground">Enable auto-acknowledgment</p>
                <p className="text-xs text-muted-foreground mt-0.5">Automatically confirm receipt of all applications</p>
              </button>
              <button
                onClick={() => alert("Escalation alerts configured for 24h+ overdue items")}
                className="w-full text-left border border-border rounded-lg p-3 hover:border-primary/40 transition-all"
              >
                <p className="text-sm font-semibold text-foreground">Set escalation alerts</p>
                <p className="text-xs text-muted-foreground mt-0.5">Get notified when replies approach SLA deadline</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
