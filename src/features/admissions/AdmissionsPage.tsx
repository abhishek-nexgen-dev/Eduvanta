import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Filter,
  Eye,
  Plus,
  FileCheck,
  RefreshCw,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import api from "../../Utils/api.utils";
import { BackendStudent, BackendCourse } from "../../types/backend.types";

export default function AdmissionsPage() {
  const [students, setStudents] = useState<BackendStudent[]>([]);
  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");
  const [selectedStudent, setSelectedStudent] = useState<BackendStudent | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newAdmissionModalOpen, setNewAdmissionModalOpen] = useState(false);
  const [statusRemarks, setStatusRemarks] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);

  // New admission form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    course: "Bachelor of Computer Applications (BCA)",
    semester: 1,
    gender: "Male",
    dateOfBirth: "2005-01-01",
    fatherName: "",
    motherName: "",
    address: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch courses
      const cRes = await api.get("/api/v1/user/findAllCourse");
      const loadedCourses: BackendCourse[] = cRes.data?.data || [];
      setCourses(loadedCourses);

      // 2. Fetch students using the course name or default
      const defaultCourse = loadedCourses[0]?.courseName || "Bachelor of Computer Applications (BCA)";
      const sRes = await api.get("/api/v1/Student/FindByCourseAndSemester", {
        params: {
          course: defaultCourse,
          semester: 1,
          PerPage: 1,
          Limit: 50,
        },
      });

      if (sRes.data?.data && Array.isArray(sRes.data.data)) {
        setStudents(sRes.data.data);
      }
    } catch (err) {
      console.warn("Error fetching admissions from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchUniqueId = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/Student/FindByUniqueId?uniqueId=${encodeURIComponent(id.trim())}`);
      if (res.data?.data) {
        setStudents([res.data.data]);
        toast.success(`Found record for ${res.data.data.uniqueId}`);
      } else {
        toast.info("No record found with that Unique ID.");
      }
    } catch {
      toast.error("Lookup failed. Please verify student ID.");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((stu) => {
    const matchesSearch =
      stu.uniqueId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${stu.student?.firstName || ""} ${stu.student?.lastName || ""}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stu.course || "").toLowerCase().includes(searchTerm.toLowerCase());

    const appStatus = stu.isAdmitted ? "Approved" : stu.applicationStatus || "Pending";
    const matchesStatus = statusFilter === "All" || appStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = students.filter((s) => !s.isAdmitted && s.applicationStatus !== "Rejected").length;
  const approvedCount = students.filter((s) => s.isAdmitted || s.applicationStatus === "Approved").length;
  const rejectedCount = students.filter((s) => s.applicationStatus === "Rejected").length;

  const handleOpenReview = (student: BackendStudent) => {
    setSelectedStudent(student);
    setStatusRemarks(student.statusMessage || "");
    setReviewModalOpen(true);
  };

  const handleUpdateStatus = async (newStatus: "Approved" | "Rejected") => {
    if (!selectedStudent) return;
    setIsProcessing(true);
    try {
      await api.put(`/api/v1/status/update/${selectedStudent.uniqueId}`, {
        applicationStatus: newStatus,
        message: statusRemarks || (newStatus === "Approved" ? "Enrollment approved by admissions council." : "Application rejected."),
      });

      toast.success(
        `Application ${selectedStudent.uniqueId} marked as ${newStatus}! Dispatching email notifications.`,
      );
      setReviewModalOpen(false);
      loadData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to update application status.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendTestEmail = async (email: string) => {
    try {
      await api.post("/api/v1/online/admission/testing-email", {
        recipientEmail: email,
      });
      toast.success(`Verification email dispatched to ${email}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || `Email dispatch failed.`);
    }
  };

  const handleCreateAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.phoneNumber) {
      toast.error("Please fill in candidate first name, email, and phone.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await api.post("/api/v1/online/admission", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber,
        course: formData.course,
        semester: Number(formData.semester),
        address: formData.address,
      });

      toast.success(`Application registered! Assigned ID: ${res.data.data?.uniqueId || "Success"}`);
      setNewAdmissionModalOpen(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        course: courses[0]?.courseName || "Bachelor of Computer Applications (BCA)",
        semester: 1,
        gender: "Male",
        dateOfBirth: "2005-01-01",
        fatherName: "",
        motherName: "",
        address: "",
      });
      loadData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Error submitting application.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full bg-[#07080C] text-white p-3.5 sm:p-6 lg:p-8">
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300 mb-2">
              <GraduationCap size={14} /> Admissions Control Center
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Student Application & Admission Review
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Verify credentials, review qualifying scores, and approve student admissions into Eduvanta.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 sm:px-3 sm:py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-300 flex items-center gap-1.5 transition"
              title="Refresh"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setNewAdmissionModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition active:scale-[0.98]"
            >
              <Plus size={16} /> New Admission
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] sm:text-xs uppercase font-semibold tracking-wider text-zinc-400">Total Records</p>
              <FileCheck size={16} className="text-zinc-400" />
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold text-white">{students.length}</p>
            <p className="mt-1 text-[11px] text-zinc-500">Academic Year 2026-27</p>
          </div>

          <div
            onClick={() => setStatusFilter("Pending")}
            className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 sm:p-5 shadow-sm cursor-pointer hover:border-amber-500/50 transition"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] sm:text-xs uppercase font-semibold tracking-wider text-amber-300">Pending Review</p>
              <Clock size={16} className="text-amber-400" />
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-200">{pendingCount}</p>
            <p className="mt-1 text-[11px] text-amber-400/80">Requires verification</p>
          </div>

          <div
            onClick={() => setStatusFilter("Approved")}
            className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 sm:p-5 shadow-sm cursor-pointer hover:border-emerald-500/50 transition"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] sm:text-xs uppercase font-semibold tracking-wider text-emerald-300">Enrolled & Approved</p>
              <CheckCircle2 size={16} className="text-emerald-400" />
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-200">{approvedCount}</p>
            <p className="mt-1 text-[11px] text-emerald-400/80">Admission confirmed</p>
          </div>

          <div
            onClick={() => setStatusFilter("Rejected")}
            className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 sm:p-5 shadow-sm cursor-pointer hover:border-rose-500/50 transition"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] sm:text-xs uppercase font-semibold tracking-wider text-rose-300">Rejected</p>
              <XCircle size={16} className="text-rose-400" />
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold text-rose-200">{rejectedCount}</p>
            <p className="mt-1 text-[11px] text-rose-400/80">Ineligible or withdrawn</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 bg-zinc-950/70 p-3 sm:p-4 rounded-2xl border border-zinc-800">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by Unique ID (EDUVANTA_906953), Candidate Name, or Course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (searchTerm.trim().startsWith("EDUVANTA") || searchTerm.trim().startsWith("EDNORA") || searchTerm.trim().startsWith("CIITM"))) {
                  handleSearchUniqueId(searchTerm);
                }
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-zinc-500 flex items-center gap-1 shrink-0">
              <Filter size={13} /> Filter:
            </span>
            {(["All", "Pending", "Approved", "Rejected"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  statusFilter === status
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Table for Tablet/Desktop & Cards for Mobile */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-zinc-800/80">
            {filteredStudents.map((stu) => {
              const appStatus = stu.isAdmitted ? "Approved" : stu.applicationStatus || "Pending";
              return (
                <div key={stu._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
                        {stu.student?.firstName?.charAt(0) || "S"}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-white">
                          {stu.student?.firstName} {stu.student?.lastName}
                        </p>
                        <p className="text-[11px] font-mono text-indigo-400">{stu.uniqueId}</p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        appStatus === "Approved"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : appStatus === "Pending"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {appStatus}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-400 space-y-1 bg-zinc-900/60 p-2.5 rounded-xl">
                    <p className="truncate"><span className="text-zinc-500">Program:</span> {stu.course || "BCA Program"}</p>
                    <p><span className="text-zinc-500">Contact:</span> {stu.student?.contactNumber || "N/A"}</p>
                    {stu.student?.email && stu.student.email[0] && (
                      <p className="truncate"><span className="text-zinc-500">Email:</span> {stu.student.email[0]}</p>
                    )}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleOpenReview(stu)}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2 text-xs font-semibold"
                    >
                      <Eye size={13} /> Review Application
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-900/90 text-xs uppercase font-semibold text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-4 px-5">Application ID</th>
                  <th className="py-4 px-5">Candidate Name</th>
                  <th className="py-4 px-5">Target Course</th>
                  <th className="py-4 px-5">Contact Details</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((stu) => {
                    const appStatus = stu.isAdmitted ? "Approved" : stu.applicationStatus || "Pending";
                    return (
                      <tr key={stu._id} className="hover:bg-zinc-900/40 transition">
                        <td className="py-4 px-5 font-mono text-xs text-indigo-300 font-semibold">
                          {stu.uniqueId}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
                              {stu.student?.firstName?.charAt(0) || "S"}
                            </div>
                            <div>
                              <p className="font-semibold text-zinc-100">
                                {stu.student?.firstName} {stu.student?.lastName}
                              </p>
                              <p className="text-xs text-zinc-500">DOB: {stu.student?.dateOfBirth ? String(stu.student.dateOfBirth).slice(0, 10) : "N/A"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <p className="text-zinc-200 line-clamp-1">{stu.course || "BCA Program"}</p>
                          <p className="text-xs text-zinc-500">Semester {stu.semester || 1}</p>
                        </td>
                        <td className="py-4 px-5 text-xs text-zinc-400">
                          <p className="text-zinc-200">{stu.student?.email ? stu.student.email[0] : "N/A"}</p>
                          <p className="text-zinc-500">{stu.student?.contactNumber || "N/A"}</p>
                        </td>
                        <td className="py-4 px-5">
                          {appStatus === "Approved" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 size={12} /> Approved
                            </span>
                          )}
                          {appStatus === "Pending" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <Clock size={12} /> Pending Review
                            </span>
                          )}
                          {appStatus === "Rejected" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <XCircle size={12} /> Rejected
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-right space-x-2">
                          <button
                            onClick={() => handleOpenReview(stu)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 text-xs font-medium transition"
                          >
                            <Eye size={13} /> Review
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                      {loading ? "Loading admission records from backend..." : "No applications found matching your criteria."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review & Status Update Modal */}
      {reviewModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-[#0C0D12] p-5 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
                  Application Review Dossier
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                  {selectedStudent.student?.firstName} {selectedStudent.student?.lastName}
                </h2>
                <p className="text-xs font-mono text-zinc-400">Unique ID: {selectedStudent.uniqueId}</p>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Applicant details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80">
              <div>
                <p className="text-xs text-zinc-500">Program Applied</p>
                <p className="font-semibold text-zinc-200">{selectedStudent.course || "BCA Program"}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Mode of Study</p>
                <p className="font-semibold text-zinc-200 capitalize">{selectedStudent.mode || "Online"} • Semester {selectedStudent.semester || 1}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Email Address</p>
                <p className="font-semibold text-zinc-200">{selectedStudent.student?.email ? selectedStudent.student.email[0] : "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Contact Number</p>
                <p className="font-semibold text-zinc-200">{selectedStudent.student?.contactNumber || "N/A"}</p>
              </div>
              {selectedStudent.student?.fatherName && (
                <div>
                  <p className="text-xs text-zinc-500">Father's Name</p>
                  <p className="font-semibold text-zinc-200">{selectedStudent.student.fatherName}</p>
                </div>
              )}
              {selectedStudent.address && (
                <div>
                  <p className="text-xs text-zinc-500">Location</p>
                  <p className="font-semibold text-zinc-200">
                    {selectedStudent.address.city}, {selectedStudent.address.state} - {selectedStudent.address.pinCode}
                  </p>
                </div>
              )}
            </div>

            {/* Status Remarks */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Official Review Notes & Feedback to Applicant
              </label>
              <textarea
                value={statusRemarks}
                onChange={(e) => setStatusRemarks(e.target.value)}
                placeholder="Enter document verification remarks or admission condition..."
                rows={3}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-zinc-800">
              {selectedStudent.student?.email && selectedStudent.student.email[0] ? (
                <button
                  type="button"
                  onClick={() => handleSendTestEmail(selectedStudent.student.email[0])}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-medium transition"
                >
                  <Mail size={14} /> Send Status Email
                </button>
              ) : <div />}

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleUpdateStatus("Rejected")}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-400 hover:bg-rose-600/30 text-xs sm:text-sm font-semibold transition"
                >
                  Reject Application
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleUpdateStatus("Approved")}
                  className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-600/20 transition"
                >
                  Approve Admission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Online Admission Modal */}
      {newAdmissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-[#0C0D12] p-5 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
                  New Candidate Enrollment
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-1">Submit Direct Admission</h2>
              </div>
              <button
                onClick={() => setNewAdmissionModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdmission} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Rahul"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Singh"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400">Primary Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="rahul.singh@gmail.com"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Contact Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="+91 98765 00000"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400">Program / Course</label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {courses.length > 0 ? (
                    courses.map((c) => (
                      <option key={c._id || c.courseCode} value={c.courseName} className="bg-[#0C0D14] text-white">
                        {c.courseName} ({c.courseCode})
                      </option>
                    ))
                  ) : (
                    <option value="Bachelor of Computer Applications (BCA)" className="bg-[#0C0D14] text-white">Bachelor of Computer Applications (BCA)</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400">Father's Full Name</label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setNewAdmissionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20"
                >
                  {isProcessing ? "Processing..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
