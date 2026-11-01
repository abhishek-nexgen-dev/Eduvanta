import { useState, useEffect } from "react";
import { Filter, Search, RotateCcw } from "lucide-react";
import useStudentStore from "../../../Course/v1/store/student.store";
import api from "../../../../Utils/api.utils";
import { toast } from "react-toastify";
import { BackendStudent } from "../../../../types/backend.types";
import DropDown from "../../../../Components/DropDown";

interface StudentFiltersProps {
  semesters: number[];
  courses: string[];
}

export function StudentFilters({ semesters, courses }: StudentFiltersProps) {
  const setStudents = useStudentStore((state) => state.setStudents);

  const [semester, setSemester] = useState<number>(semesters[0] ?? 1);
  const [course, setCourse] = useState(courses[0] || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!course && courses.length > 0) {
      setCourse(courses[0]);
    }
  }, [courses, course]);

  const searchStudents = async () => {
    const targetCourse = course || courses[0];
    if (!targetCourse) {
      toast.warn("Please select an academic course to search.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.get("/api/v1/Student/FindByCourseAndSemester", {
        params: {
          course: targetCourse,
          semester,
          PerPage: 1,
          Limit: 50,
        },
      });

      if (res.data?.data && Array.isArray(res.data.data)) {
        let list = res.data.data;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          list = list.filter((s: BackendStudent) => {
            const fullName = `${s.student?.firstName || ""} ${s.student?.lastName || ""}`.toLowerCase();
            const uid = (s.uniqueId || "").toLowerCase();
            const email = (s.student?.email?.[0] || "").toLowerCase();
            return fullName.includes(q) || uid.includes(q) || email.includes(q);
          });
        }
        setStudents(list);
        if (list.length > 0) {
          toast.success(`Found ${list.length} student record(s) for ${targetCourse} (Sem ${semester}).`);
        } else {
          toast.info(`No students enrolled in ${targetCourse} for Semester ${semester}.`);
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to search students.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCourse(courses[0] || "");
    setSemester(1);
    setSearchQuery("");
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5 shadow-xl">
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 items-end">
        {/* Course */}
        <div className="lg:col-span-4">
          <DropDown
            label="Academic Course"
            options={courses}
            value={course}
            onSelect={(val) => setCourse(String(val))}
            className="w-full"
          />
        </div>

        {/* Semester */}
        <div className="lg:col-span-2">
          <DropDown
            label="Semester"
            options={semesters.map((item) => ({
              label: `Semester ${item}`,
              value: item,
            }))}
            value={semester}
            onSelect={(val) => setSemester(Number(val))}
            className="w-full"
          />
        </div>

        {/* Keyword Filter */}
        <div className="lg:col-span-3">
          <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Search Name / ID</label>
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Sanjeev or EDUVANTA_906953"
              className="h-11 w-full pl-9 pr-3 rounded-xl border border-zinc-800 bg-zinc-900/90 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="lg:col-span-3 flex items-center gap-2">
          <button
            onClick={searchStudents}
            disabled={loading}
            className="flex-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs sm:text-sm text-white shadow-lg shadow-indigo-600/20 transition active:scale-95 disabled:opacity-50"
          >
            <Filter size={15} />
            <span>{loading ? "Searching..." : "Apply Filters"}</span>
          </button>
          <button
            onClick={handleReset}
            title="Reset Filters"
            className="h-11 px-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
