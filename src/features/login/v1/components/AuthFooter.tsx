import { toast } from "react-toastify";
import { LifeBuoy, ShieldAlert, FileText } from "lucide-react";

export function AuthFooter() {
  const showHelpdesk = () => {
    toast.info("Eduvanta IT Helpdesk: Contact support@eduvanta.edu or Ext. 104 (Mon-Sat, 9AM-6PM IST)");
  };

  const showPolicy = (title: string) => {
    toast.info(
      `${title}: Eduvanta Security Directive 2026. All administrator access attempts are audited.`,
    );
  };

  return (
    <div className="mt-6 space-y-3.5 text-center">
      <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400">
        <LifeBuoy size={14} className="text-indigo-400" />
        <span>Authentication assistance?</span>
        <button
          type="button"
          onClick={showHelpdesk}
          className="font-medium text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition"
        >
          Contact IT Helpdesk
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
        <button
          type="button"
          onClick={() => showPolicy("Privacy & Telemetry Policy")}
          className="hover:text-zinc-300 flex items-center gap-1 transition"
        >
          <ShieldAlert size={12} className="text-zinc-600" />
          <span>Security Policy</span>
        </button>
        <span aria-hidden="true" className="text-zinc-800">
          •
        </span>
        <button
          type="button"
          onClick={() => showPolicy("Master Institutional Service Agreement")}
          className="hover:text-zinc-300 flex items-center gap-1 transition"
        >
          <FileText size={12} className="text-zinc-600" />
          <span>Terms of Use</span>
        </button>
        <span aria-hidden="true" className="text-zinc-800">
          •
        </span>
        <span className="font-mono text-emerald-400/90 text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
          GATEWAY v4.2
        </span>
      </div>
    </div>
  );
}
