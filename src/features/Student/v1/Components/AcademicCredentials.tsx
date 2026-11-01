import Card from "./Card";
import { GraduationCap } from "lucide-react";
import SectionTitle from "./SectionTitle";
import useStudentStore from "../../../Course/v1/store/student.store";

function AcademicCredentials() {
  const student = useStudentStore((state) => state.students[0]);

  if (!student) {
    return <div>Loading...</div>;
  }

  const tenthMarks = student?.tenth?.tenthMarks ?? 410;
  const tenthPercentage = ((tenthMarks / 500) * 100).toFixed(2);

  const twelfthMarks = student?.twelfth?.twelfthMarks ?? 425;
  const twelfthPercentage = ((twelfthMarks / 500) * 100).toFixed(2);

  return (
    <Card>
      <SectionTitle icon={<GraduationCap size={18} />} title="Academic Credentials" />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* 10th Details */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h3 className="font-semibold text-base sm:text-lg text-white">10th Board Examination</h3>

          <div className="mt-4 space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Board</span>
              <span className="text-zinc-200">{student?.tenth?.tenthBoard || "CBSE"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-500">Marks</span>
              <span className="text-zinc-200">{tenthMarks} / 500</span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-500">Percentage</span>
              <span className="text-emerald-400 font-semibold">{tenthPercentage}%</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Grade</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold text-xs border border-indigo-500/30">
                {student?.tenth?.tenthGrade || "A1"}
              </span>
            </div>
          </div>
        </div>

        {/* 12th Details */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h3 className="font-semibold text-base sm:text-lg text-white">12th Board Examination</h3>

          <div className="mt-4 space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Board</span>
              <span className="text-zinc-200">{student?.twelfth?.twelfthBoard || "CBSE"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-500">Marks</span>
              <span className="text-zinc-200">{twelfthMarks} / 500</span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-500">Percentage</span>
              <span className="text-emerald-400 font-semibold">{twelfthPercentage}%</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Grade</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold text-xs border border-indigo-500/30">
                {student?.twelfth?.twelfthGrade || "A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Institution */}
      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h3 className="font-semibold text-base sm:text-lg text-white">Current Academic Standing</h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 text-xs sm:text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Institution</span>
            <span className="text-zinc-200">{student?.university || "Eduvanta Academy"}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-500">Semester</span>
            <span className="text-zinc-200 font-semibold">Semester {student?.semester || 1}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-zinc-500">Mode</span>
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold text-xs border border-blue-500/30 capitalize">
              {student?.mode || "Regular"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-500">Admission Date</span>
            <span className="text-zinc-200">
              {student?.dateOfAdmission
                ? new Date(student.dateOfAdmission).toLocaleDateString()
                : new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default AcademicCredentials;
