import {
  Download,
  Clock3,
  IndianRupee,
  Users,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "./Card";

export default function CourseSidebar() {
  const navigate = useNavigate();

  const handleDownloadBrochure = () => {
    toast.success("Curriculum syllabus syllabus and institutional prospectus exported.");
  };

  return (
    <aside className="space-y-6">
      {/* Admin Action Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-5 sm:p-6">
          <span className="text-[10px] uppercase tracking-wider font-semibold bg-white/20 px-2 py-0.5 rounded text-white">
            Department Administration
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-2">Course Intake Controls</h2>
          <p className="mt-1 text-xs text-indigo-100">
            Admissions and enrollment ledger for academic session 2026-27.
          </p>
        </div>

        <div className="space-y-3 p-5 sm:p-6">
          <button
            onClick={() => navigate("/admissions")}
            className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-indigo-600
            px-4
            py-2.5
            text-xs sm:text-sm
            font-semibold
            text-white
            shadow-lg shadow-indigo-600/20
            transition
            hover:bg-indigo-500
          "
          >
            <UserPlus size={16} /> Enroll Candidate
          </button>

          <button
            onClick={handleDownloadBrochure}
            className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-zinc-800
            bg-zinc-900
            px-4
            py-2.5
            text-xs sm:text-sm
            font-semibold
            text-zinc-200
            transition
            hover:bg-zinc-800 hover:text-white
          "
          >
            <Download size={16} /> Export Curriculum Syllabus
          </button>
        </div>
      </Card>

      {/* Quick Information */}
      <Card className="p-5 sm:p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          Institutional Specs
        </h3>

        <div className="mt-5 space-y-4">
          <InfoRow
            icon={<IndianRupee size={16} />}
            title="Standard Tuition Fee"
            value="₹75,000 / Year"
          />
          <InfoRow
            icon={<Clock3 size={16} />}
            title="Program Duration"
            value="3 Years (6 Semesters)"
          />
          <InfoRow
            icon={<GraduationCap size={16} />}
            title="Degree Conferred"
            value="Bachelor of Computer Applications"
          />
          <InfoRow
            icon={<Users size={16} />}
            title="Approved Intake"
            value="120 Sanctioned Seats"
          />
        </div>
      </Card>

      {/* Coordinator */}
      <Card className="p-5 sm:p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          Department Coordinator
        </h3>

        <div className="mt-4 flex items-center gap-3.5">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face"
            alt="Coordinator"
            className="h-12 w-12 rounded-full object-cover border-2 border-indigo-500/40 shrink-0"
          />

          <div className="min-w-0">
            <h4 className="font-bold text-sm text-white truncate">Dr. Rajesh Kumar</h4>
            <p className="text-xs text-indigo-400 truncate">HOD & Program Lead</p>
          </div>
        </div>
      </Card>

      {/* Contact */}
      <Card className="p-5 sm:p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Faculty Office</h3>

        <div className="mt-4 space-y-3.5">
          <InfoRow icon={<Phone size={16} />} title="Contact Desk" value="+91 96613 42993" />
          <InfoRow icon={<Mail size={16} />} title="Office Email" value="info@eduvanta.edu" />
          <InfoRow icon={<MapPin size={16} />} title="Campus Location" value="Dhanbad, Jharkhand" />
        </div>
      </Card>
    </aside>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

function InfoRow({ icon, title, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-indigo-600/20 p-2 text-indigo-400 shrink-0">{icon}</div>

      <div className="min-w-0">
        <p className="text-[11px] text-zinc-500">{title}</p>
        <h4 className="font-semibold text-xs sm:text-sm text-white truncate">{value}</h4>
      </div>
    </div>
  );
}
