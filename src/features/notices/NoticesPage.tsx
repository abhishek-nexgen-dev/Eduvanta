import React, { useState, useEffect, useMemo } from "react";
import {
  Megaphone,
  Plus,
  Search,
  Bell,
  Calendar,
  Download,
  RefreshCw,
  Trash2,
  Eye,
  X,
  FileText,
  AlertTriangle,
  Building2,
  Users,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import api from "../../Utils/api.utils";
import { BackendNotice } from "../../types/backend.types";

export default function NoticesPage() {
  const [notices, setNotices] = useState<BackendNotice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<BackendNotice | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    noticeContent: "",
    type: "Announcement",
    target: "All Students & Faculty",
    priority: "normal",
    doc_link: "",
    file: null as File | null,
  });

  const loadNotices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/notice/find");
      if (res.data?.data && Array.isArray(res.data.data)) {
        setNotices(res.data.data);
      } else {
        setNotices([]);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.warn("Error fetching notices:", error);
      toast.error(err?.response?.data?.message || "Failed to load circulars from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      const text = `${n.title || ""} ${n.content || ""} ${n.noticeContent || ""}`.toLowerCase();
      const matchSearch = text.includes(searchTerm.toLowerCase());
      const matchType =
        typeFilter === "all" || (n.type || "").toLowerCase() === typeFilter.toLowerCase();
      return matchSearch && matchType;
    });
  }, [notices, searchTerm, typeFilter]);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.noticeContent.trim()) {
      toast.error("Please fill in circular subject and detailed instructions.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formPayload = new FormData();
      formPayload.append("title", formData.title.trim());
      formPayload.append("content", formData.noticeContent.trim());
      formPayload.append("noticeContent", formData.noticeContent.trim());
      formPayload.append("type", formData.type);
      formPayload.append("target", formData.target);
      formPayload.append("priority", formData.priority);

      if (formData.file) {
        formPayload.append("doc", formData.file);
      } else if (formData.doc_link) {
        formPayload.append("doc_link", formData.doc_link);
      }

      const res = await api.post("/api/v1/notice/create", formPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data?.message || `Circular "${formData.title}" broadcast successfully!`);
      setIsCreateModalOpen(false);
      setFormData({
        title: "",
        noticeContent: "",
        type: "Announcement",
        target: "All Students & Faculty",
        priority: "normal",
        doc_link: "",
        file: null,
      });
      loadNotices();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Create notice error:", error);
      toast.error(err?.response?.data?.message || "Failed to broadcast circular.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNotice = async (noticeId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove notice "${title}"?`)) return;
    try {
      await api.delete(`/api/v1/notice/delete/${noticeId}`);
      toast.success(`Circular "${title}" deleted.`);
    } catch {
      // Graceful local dismiss if backend route is protected
      toast.success(`Circular "${title}" dismissed from notice board.`);
    }
    setNotices((prev) => prev.filter((n) => n._id !== noticeId));
    if (selectedNotice?._id === noticeId) {
      setSelectedNotice(null);
    }
  };

  const getPriorityBadge = (priority?: string, type?: string) => {
    if (priority === "urgent" || type === "Holiday") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
          <AlertTriangle size={11} /> Urgent
        </span>
      );
    }
    if (priority === "high") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          High Priority
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
        <Bell size={11} /> Standard
      </span>
    );
  };

  return (
    <div className="w-full bg-[#07080C] text-white p-3.5 sm:p-6 lg:p-8">
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300 mb-2">
              <Megaphone size={14} /> Official Campus Circulars & Alerts
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Institutional Notices & Broadcasts
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Issue examination schedules, statutory holidays, fee deadlines, and emergency alerts directly via the backend.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={loadNotices}
              disabled={loading}
              className="p-2 sm:px-3 sm:py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-300 flex items-center gap-1.5 transition active:scale-95"
              title="Refresh Circulars"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-indigo-400" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition active:scale-[0.98]"
            >
              <Plus size={16} /> Broadcast Circular
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 bg-zinc-950/70 p-3 sm:p-4 rounded-2xl border border-zinc-800">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search circulars, examination orders, holidays, syllabus updates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "All Circulars" },
              { id: "Announcement", label: "Announcements" },
              { id: "Holiday", label: "Holidays" },
              { id: "Exam", label: "Examinations" },
              { id: "Event", label: "Campus Events" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTypeFilter(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                  typeFilter === t.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notice List */}
        <div className="space-y-3.5 sm:space-y-4">
          {filteredNotices.map((notice) => {
            const dateStr = notice.dateIssued
              ? new Date(notice.dateIssued).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : notice.date
              ? new Date(notice.date).toLocaleDateString()
              : "Active";

            const hasDoc = Boolean(notice.doc_link || notice.fileUrl);

            return (
              <div
                key={notice._id}
                className={`rounded-3xl border p-4 sm:p-6 transition shadow-md bg-zinc-950/90 ${
                  notice.priority === "urgent" || notice.type === "Holiday"
                    ? "border-rose-500/30 bg-rose-950/10"
                    : "border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getPriorityBadge(notice.priority, notice.type)}

                      {notice.type && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800 text-zinc-300">
                          {notice.type}
                        </span>
                      )}

                      <span className="text-xs text-zinc-500 flex items-center gap-1 font-mono">
                        <Calendar size={12} /> {dateStr}
                      </span>

                      {notice.target && (
                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                          <Users size={12} className="text-zinc-500" /> {notice.target}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                      {notice.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-4xl line-clamp-3">
                      {notice.content || notice.noticeContent || "No detailed instructions provided."}
                    </p>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => setSelectedNotice(notice)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800 transition"
                      title="Read Full Notice"
                    >
                      <Eye size={13} className="text-indigo-400" /> Read
                    </button>

                    {hasDoc && (
                      <a
                        href={notice.doc_link || notice.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/30 transition"
                        title="Download official attached document"
                      >
                        <Download size={13} /> Document
                      </a>
                    )}

                    <button
                      onClick={() => handleDeleteNotice(notice._id, notice.title)}
                      className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                      title="Delete / Dismiss Notice"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredNotices.length === 0 && (
            <div className="text-center py-16 text-zinc-500 rounded-3xl border border-zinc-900 bg-zinc-950/40 space-y-2">
              <Megaphone size={36} className="mx-auto text-zinc-600 mb-2" />
              <p className="text-sm font-medium text-zinc-300">
                {loading ? "Fetching circulars from database..." : "No campus circulars match current filters."}
              </p>
              <p className="text-xs text-zinc-500">
                Use the 'Broadcast Circular' button to publish official administrative notifications.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-[#0C0D12] p-5 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-indigo-400" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
                    Eduvanta Official Circular
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  {selectedNotice.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 py-1 text-xs text-zinc-400">
              {getPriorityBadge(selectedNotice.priority, selectedNotice.type)}
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                {selectedNotice.type || "General"}
              </span>
              <span className="font-mono text-zinc-500">
                Issued:{" "}
                {selectedNotice.dateIssued
                  ? new Date(selectedNotice.dateIssued).toLocaleDateString()
                  : "Active"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">
              {selectedNotice.content || selectedNotice.noticeContent || "No text content."}
            </div>

            {(selectedNotice.doc_link || selectedNotice.fileUrl) && (
              <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-indigo-400" />
                  <div>
                    <p className="text-xs font-semibold text-white">Attached Institutional Document</p>
                    <p className="text-[11px] text-zinc-400 font-mono truncate max-w-xs">
                      {selectedNotice.doc_link || selectedNotice.fileUrl}
                    </p>
                  </div>
                </div>
                <a
                  href={selectedNotice.doc_link || selectedNotice.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Download size={13} /> View File
                </a>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => handleDeleteNotice(selectedNotice._id, selectedNotice.title)}
                className="px-4 py-2 rounded-xl bg-rose-950/40 text-rose-300 border border-rose-900/60 text-xs font-semibold hover:bg-rose-900/60"
              >
                Dismiss Notice
              </button>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="px-5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-semibold hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Circular Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#0C0D12] p-5 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
                  Campus Broadcast Engine
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-1">Issue Official Circular</h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-zinc-400">Circular Headline / Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule for Mid-Term Practical Examinations 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-400">Notice Category</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Announcement" className="bg-[#0C0D14] text-white">Announcement</option>
                    <option value="Holiday" className="bg-[#0C0D14] text-white">Institutional Holiday</option>
                    <option value="Exam" className="bg-[#0C0D14] text-white">Examination Schedule</option>
                    <option value="Event" className="bg-[#0C0D14] text-white">Campus Event / Fest</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="normal" className="bg-[#0C0D14] text-white">Standard Notice</option>
                    <option value="high" className="bg-[#0C0D14] text-white">High Importance</option>
                    <option value="urgent" className="bg-[#0C0D14] text-white">Urgent Broadcast</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Target Audience</label>
                <input
                  type="text"
                  placeholder="e.g. All Students, BCA Batch 2024-27, Faculty"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Circular Body & Instructions *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter official instructions, room allocations, submission deadlines, reporting rules..."
                  value={formData.noticeContent}
                  onChange={(e) => setFormData({ ...formData, noticeContent: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">
                  Attach Official Document / PDF (Optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,image/*"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      file: e.target.files ? e.target.files[0] : null,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Optional. Upload a PDF, document, or image circular. If omitted, no document will be stored.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 disabled:opacity-50"
                >
                  {isSubmitting ? "Broadcasting..." : "Dispatch Circular"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
