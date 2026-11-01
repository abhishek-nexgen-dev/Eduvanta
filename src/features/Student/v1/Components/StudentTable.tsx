import useStudentStore from "../../../Course/v1/store/student.store";
import { StudentRow } from "./StudentRow";
import { Eye, FileSpreadsheet, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export function StudentTable() {
  const students = useStudentStore((state) => state.students);

  const handleExportPDF = () => {
    toast.success(`Exporting ${students.length} student records to PDF...`);
  };

  const handleExportExcel = () => {
    toast.success(`Exporting ${students.length} student records to Excel spreadsheet...`);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-zinc-800 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-white">Student Enrollment List</h2>

          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
            {students.length} Enrolled
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
          >
            <FileText size={14} className="text-rose-400" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
          >
            <FileSpreadsheet size={14} className="text-emerald-400" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Mobile Card View (< md) */}
      <div className="md:hidden divide-y divide-zinc-800/80">
        {students.length > 0 ? (
          students.map((student) => {
            const firstName = student.student?.firstName || "Student";
            const lastName = student.student?.lastName || "";
            const initial = firstName.charAt(0).toUpperCase();
            const phone = student.student?.contactNumber || "N/A";
            const email = student.student?.email ? student.student.email[0] : "N/A";
            const feePaid =
              student.fee?.amount_paid !== undefined
                ? `₹${student.fee.amount_paid.toLocaleString()}`
                : "₹0";

            return (
              <div key={student._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {student.student?.avtar ? (
                      <img
                        src={student.student.avtar}
                        alt={firstName}
                        className="h-10 w-10 rounded-full object-cover border border-zinc-700 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600/30 border border-indigo-500/40 text-xs font-bold text-indigo-300 shrink-0">
                        {initial}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm text-white">
                        {firstName} {lastName}
                      </p>
                      <p className="font-mono text-xs text-indigo-400">{student.uniqueId}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                    {feePaid}
                  </span>
                </div>

                <div className="text-xs text-zinc-400 space-y-1 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/60">
                  <p className="truncate">
                    <span className="text-zinc-500">Email:</span> {email}
                  </p>
                  <p>
                    <span className="text-zinc-500">Phone:</span> {phone}
                  </p>
                  <p>
                    <span className="text-zinc-500">Course:</span> {student.course || "BCA Program"}{" "}
                    (Sem {student.semester || 1})
                  </p>
                </div>

                <div className="flex justify-end pt-1">
                  <Link
                    to={`/student/${student.uniqueId}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 py-2 text-xs font-semibold"
                  >
                    <Eye size={13} /> View Full Academic Profile
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-zinc-500">No students found.</div>
        )}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-zinc-900/95 border-b border-zinc-800">
            <tr>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-zinc-400">
                ID Number
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-zinc-400">
                Student Name
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-zinc-400">
                Date Of Birth
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-zinc-400">
                Contact
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase text-zinc-400">
                Fee Paid
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-900">
            {students.length > 0 ? (
              students.map((student) => (
                <StudentRow key={student._id || student.uniqueId} student={student} />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-zinc-500">
                  No students found matching current criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-zinc-800/80 p-4 text-xs text-zinc-400 bg-zinc-950/60">
        <p>
          Showing <span className="font-semibold text-white">{students.length}</span> enrolled
          student
          {students.length !== 1 ? "s" : ""}
        </p>
        <span className="text-[11px] text-zinc-500">Eduvanta Student Information System</span>
      </div>
    </section>
  );
}
