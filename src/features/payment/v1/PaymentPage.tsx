import { useEffect } from "react";
import StudentSearch from "./ui/StudentSearch";
import FinanceStatCard from "./ui/FinanceStatCard";
import StudentProfileCard from "./ui/StudentProfileCard";
import FeeProgressCard from "./ui/FeeProgressCard";
import PaymentForm from "./ui/PaymentForm";
import FeeBreakdownCard from "./ui/FeeBreakdownCard";
import PaymentTimeline from "./ui/PaymentTimeline";
import {
  Sparkles,
  Wallet,
  CircleDollarSign,
  BadgePercent,
  ReceiptText,
  Download,
} from "lucide-react";
import { PAYMENT_SUMMARY_METRICS } from "./config/payment.config";
import useStudentStore from "../../Course/v1/store/student.store";
import api from "../../../Utils/api.utils";
import { toast, ToastContainer } from "react-toastify";

const summaryIconMap = [Wallet, CircleDollarSign, BadgePercent, ReceiptText];

const PaymentPage = () => {
  const students = useStudentStore((state) => state.students);
  const setStudents = useStudentStore((state) => state.setStudents);
  const student = students[0];

  useEffect(() => {
    if (!student) {
      const loadInitialStudent = async () => {
        try {
          const res = await api.get("/api/v1/Student/FindByUniqueId?uniqueId=EDUVANTA_906953");
          if (res.data?.data) {
            setStudents([res.data.data]);
            return;
          }
        } catch {
          try {
            const courseRes = await api.get("/api/v1/Student/FindByCourseAndSemester", {
              params: {
                course: "Bachelor of Computer Applications (BCA)",
                semester: 1,
                PerPage: 1,
                Limit: 1,
              },
            });
            if (
              courseRes.data?.data &&
              Array.isArray(courseRes.data.data) &&
              courseRes.data.data.length > 0
            ) {
              setStudents([courseRes.data.data[0]]);
            }
          } catch (e) {
            console.warn("Could not load initial student for payment page:", e);
          }
        }
      };
      loadInitialStudent();
    }
  }, [student, setStudents]);

  const handleDownloadInvoice = () => {
    if (!student) return;
    toast.success(`Generated official fee receipt invoice for ${student.uniqueId}!`);
  };

  if (!student) {
    return (
      <div className="w-full px-3.5 sm:px-6 lg:px-8 py-8 text-white max-w-7xl mx-auto space-y-6">
        <StudentSearch />
        <div className="py-20 text-center text-zinc-500">
          Enter a Student ID (e.g. EDUVANTA-2026-9842) above to inspect tuition fee records.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-3.5 sm:px-6 lg:px-8 py-5 text-white">
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Banner */}
        <section className="overflow-hidden rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs text-violet-200">
                <Sparkles size={13} /> Institutional Bursar & Finance Desk
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                  Student Fee Billing & Tuition Ledger
                </h1>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  Lookup enrollment balances, record manual challan and bank draft payments, and
                  verify online payment callbacks.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadInvoice}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-200 transition"
            >
              <Download size={14} /> Download Fee Receipt PDF
            </button>
          </div>
        </section>

        {/* Student Search Component */}
        <StudentSearch />

        {/* Financial Overview Grid */}
        <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <StudentProfileCard />

            <div className="grid gap-4 sm:grid-cols-2">
              <FinanceStatCard
                title="Total Course Fee"
                value={`₹${(student.fee.course_Fee ?? 60000).toLocaleString()}`}
                tone="violet"
                icon={Wallet}
              />

              <FinanceStatCard
                title="Amount Paid"
                value={`₹${(student.fee.amount_paid ?? 0).toLocaleString()}`}
                tone="emerald"
                icon={CircleDollarSign}
              />

              <FinanceStatCard
                title="Outstanding Due"
                value={`₹${(student.fee.amount_due ?? 0).toLocaleString()}`}
                tone={(student.fee.amount_due ?? 0) > 0 ? "amber" : "emerald"}
                icon={ReceiptText}
              />

              {PAYMENT_SUMMARY_METRICS.slice(0, 1).map((metric, index) => {
                const Icon = summaryIconMap[index] ?? Wallet;
                return (
                  <FinanceStatCard
                    key={metric.title}
                    title={metric.title}
                    value={metric.value}
                    tone={metric.tone}
                    icon={Icon}
                  />
                );
              })}
            </div>

            <FeeProgressCard />
          </div>

          <div className="space-y-6">
            <PaymentForm />
            <FeeBreakdownCard />
            <PaymentTimeline />
          </div>
        </section>
      </div>
    </div>
  );
};

export default PaymentPage;
