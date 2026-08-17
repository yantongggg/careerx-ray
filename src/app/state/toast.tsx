import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

/* Minimal demo-feedback toast: every button in the demo gives visible
   feedback, even where the full feature isn't built yet. */

let listener: ((msg: string) => void) | null = null;

export function demoToast(msg: string) {
  listener?.(msg);
}

export function ToastHost() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    listener = m => {
      setMsg(m);
      clearTimeout(timer);
      timer = setTimeout(() => setMsg(null), 2600);
    };
    return () => { listener = null; clearTimeout(timer); };
  }, []);

  if (!msg) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-950 text-white text-sm px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 max-w-[90vw]">
      <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
      <span className="leading-snug">{msg}</span>
    </div>
  );
}
