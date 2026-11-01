import { useCallback, useId, useState } from "react";
import { CheckCircle2, Search, ScanText } from "lucide-react";
import api from "../../../../Utils/api.utils";
import useStudentStore from "../../../Course/v1/store/student.store";
import { toast } from "react-toastify";

function StudentSearch() {
  const inputId = useId();
  const [studentId, setStudentId] = useState("EDUVANTA_906953");
  const [searching, setSearching] = useState(false);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!studentId.trim()) return;

      setSearching(true);
      try {
        const response = await api.get(
          `/api/v1/Student/FindByUniqueId?uniqueId=${encodeURIComponent(studentId.trim())}`,
        );
        const { data } = response.data;
        if (data) {
          useStudentStore.getState().setStudents([data]);
          toast.success(`Loaded financial profile for ${data.uniqueId}`);
        } else {
          toast.info("No student record found with that Unique ID.");
        }
      } catch {
        toast.error("Lookup failed. Please verify student ID.");
      } finally {
        setSearching(false);
      }
    },
    [studentId],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 sm:p-6 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/80">Student lookup</p>
          <label htmlFor={inputId} className="mt-1 block text-xs sm:text-sm text-zinc-300">
            Search student bursar records by unique ID
          </label>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
          <CheckCircle2 size={13} /> Active Bursar Query
        </span>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
          />

          <input
            id={inputId}
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            placeholder="e.g. EDUVANTA_906953"
            className="h-12 sm:h-14 w-full rounded-2xl border border-white/10 bg-black/40 px-11 text-sm sm:text-base font-mono text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-400/10"
          />
        </div>

        <button
          type="submit"
          disabled={searching}
          className="inline-flex h-12 sm:h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 font-semibold text-xs sm:text-sm text-black transition hover:bg-emerald-400 active:scale-[0.99] disabled:opacity-50"
        >
          <ScanText size={18} />
          {searching ? "Searching..." : "Lookup Ledger"}
        </button>
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        Current active student query: <span className="text-zinc-300 font-mono">{studentId}</span>
      </p>
    </form>
  );
}

export default StudentSearch;
