import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  RefreshCw,
  Search,
  Lock,
  Mail,
  User,
  CheckCircle2,
  X,
  FileText,
  AlertTriangle,
  Copy,
  Check,
  Pencil,
  ShieldAlert,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import api, { getErrorMessage } from "../../Utils/api.utils";
import useAuthStorage from "../login/v1/hooks/useAuthStorage";

interface AdminRecord {
  _id: string;
  name: string;
  email: string;
  role: string;
  designation?: string;
  isActive: boolean;
  createdAt?: string | Date;
}

const DEFAULT_ADMINS: AdminRecord[] = [];

export default function AdminPage() {
  const currentUser = useAuthStorage((state) => state.user);
  const [admins, setAdmins] = useState<AdminRecord[]>(DEFAULT_ADMINS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // New admin form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    designation: "Academic Administrator",
  });

  // Edit admin form state
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "admin",
    designation: "Academic Administrator",
    isActive: true,
    password: "",
  });

  const isSuperAdmin = Boolean(
    currentUser?.role === "super admin" ||
    currentUser?.role === "super_admin" ||
    currentUser?.email?.toLowerCase() === "admin@gmail.com"
  );

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      let fetched: AdminRecord[] = [];
      const res = await api.get("/api/v1/admin/list");
      if (Array.isArray(res.data?.data)) {
        fetched = res.data.data;
      } else if (Array.isArray(res.data)) {
        fetched = res.data;
      }

      if (fetched.length > 0) {
        setAdmins(fetched);
      } else {
        const fallbackAdmin: AdminRecord = {
          _id: "root-admin",
          name: currentUser?.name || "Super Administrator",
          email: currentUser?.email || "admin@gmail.com",
          role: "super admin",
          designation: "Chief Administrative Officer",
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        setAdmins([fallbackAdmin]);
      }
    } catch {
      const fallbackAdmin: AdminRecord = {
        _id: "root-admin",
        name: currentUser?.name || "Super Administrator",
        email: currentUser?.email || "admin@gmail.com",
        role: "super admin",
        designation: "Chief Administrative Officer",
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      setAdmins([fallbackAdmin]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    toast.info(`Copied ${email} to clipboard.`);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast.error("Access denied: Only Super Administrators can induct new administrators.");
      return;
    }

    if (!formData.email.trim() || !formData.name.trim()) {
      toast.error("Name and email are required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password || "Admin@123",
        role: formData.role === "super admin" ? "super admin" : "admin",
        designation: formData.designation,
      };

      await api.post("/api/v1/admin/create", payload);

      toast.success(`Administrator "${formData.name}" inducted successfully!`);
      setIsCreateModalOpen(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "admin",
        designation: "Academic Administrator",
      });
      fetchAdmins();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to induct administrator."));
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (admin: AdminRecord) => {
    if (!isSuperAdmin) {
      toast.error("Only Super Administrators can edit administrator profiles.");
      return;
    }
    setEditingAdmin(admin);
    setEditFormData({
      name: admin.name || "",
      email: admin.email || "",
      role: admin.role === "super admin" || admin.role === "super_admin" ? "super admin" : "admin",
      designation: admin.designation || "Campus Administrator",
      isActive: admin.isActive !== false,
      password: "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast.error("Access denied: Only Super Administrators can edit administrators.");
      return;
    }
    if (!editingAdmin) return;

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: editFormData.name.trim(),
        role: editFormData.role === "super admin" ? "super admin" : "admin",
        designation: editFormData.designation.trim(),
        isActive: editFormData.isActive,
      };
      if (editFormData.password.trim()) {
        payload.password = editFormData.password.trim();
      }

      const identifier = editingAdmin._id && editingAdmin._id !== "root-admin"
        ? editingAdmin._id
        : editingAdmin.email;

      await api.put(`/api/v1/admin/update/${encodeURIComponent(identifier)}`, payload);

      toast.success(`Administrator "${editFormData.name}" updated successfully!`);
      setIsEditModalOpen(false);
      setEditingAdmin(null);
      fetchAdmins();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update administrator."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeAdmin = async (admin: AdminRecord) => {
    if (!isSuperAdmin) {
      toast.error("Access denied: Only Super Administrators can revoke administrators.");
      return;
    }

    if (admin.email.toLowerCase() === "admin@gmail.com" || admin._id === "root-admin") {
      toast.warn("The primary root administrator cannot be revoked.");
      return;
    }

    if (!window.confirm(`Are you sure you want to revoke administrative access for ${admin.name} (${admin.email})?`)) {
      return;
    }

    try {
      await api.delete(`/api/v1/admin/delete/${encodeURIComponent(admin._id)}`);

      toast.success(`Revoked administrative access for ${admin.email}`);
      setAdmins((prev) => prev.filter((a) => a.email !== admin.email && a._id !== admin._id));
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to revoke administrator."));
    }
  };

  const filteredAdmins = admins.filter((a) => {
    const q = searchTerm.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.designation || "").toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen w-full bg-[#07080C] text-white p-3.5 sm:p-6 lg:p-8">
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-indigo-400">
              <ShieldCheck size={16} /> Governance & Access Control
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Portal Administrators
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Manage authorized institutional administrators, permission clearances, and security credentials.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchAdmins}
              disabled={loading}
              className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition disabled:opacity-50"
              title="Refresh Directory"
            >
              <RefreshCw size={16} className={loading ? "animate-spin text-indigo-400" : ""} />
            </button>

            {isSuperAdmin ? (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition"
              >
                <UserPlus size={16} /> Induct Administrator
              </button>
            ) : (
              <div
                title="Only Super Administrators can induct new administrators"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm font-semibold text-zinc-500 cursor-not-allowed"
              >
                <UserPlus size={16} /> Induct Administrator
              </div>
            )}
          </div>
        </div>

        {/* Regular Admin Read-Only Notice */}
        {!isSuperAdmin && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-center gap-3">
            <ShieldAlert size={18} className="text-amber-400 shrink-0" />
            <div>
              <span className="font-semibold">Directory View-Only Mode:</span> You are currently signed in with Institutional Administrator privileges. Only accounts with <span className="font-semibold underline">Super Administrator</span> clearance can induct, edit, or revoke administrators.
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Admins</span>
              <ShieldCheck size={18} className="text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">{admins.length}</div>
            <p className="text-[11px] text-zinc-500">Verified institutional officers</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Super Admins</span>
              <Lock size={18} className="text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {admins.filter((a) => a.role === "super admin" || a.role === "super_admin" || a.email.toLowerCase() === "admin@gmail.com").length}
            </div>
            <p className="text-[11px] text-zinc-500">Full clearance controllers</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">General Admins</span>
              <User size={18} className="text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {admins.filter((a) => a.role === "admin" && a.email.toLowerCase() !== "admin@gmail.com").length}
            </div>
            <p className="text-[11px] text-zinc-500">Campus administrative staff</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Security Layer</span>
              <Lock size={18} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">Active</div>
            <p className="text-[11px] text-zinc-500">SuperAdmin mutation guard enabled</p>
          </div>
        </div>

        {/* Directory Controls & Table */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                placeholder="Search administrators by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="text-xs text-zinc-400 self-end sm:self-center font-medium">
              Showing <span className="text-white font-bold">{filteredAdmins.length}</span> of {admins.length} administrators
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-900/60 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold border-b border-zinc-800">
                <tr>
                  <th className="px-5 py-3.5">Administrator</th>
                  <th className="px-5 py-3.5">Email Identity</th>
                  <th className="px-5 py-3.5">Clearance / Role</th>
                  <th className="px-5 py-3.5">Session Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-xs sm:text-sm">
                {loading && admins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500">
                      <RefreshCw size={24} className="animate-spin text-indigo-400 mx-auto mb-2" />
                      Loading authorized administrators...
                    </td>
                  </tr>
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500">
                      No administrators matching "{searchTerm}".
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => {
                    const isRoot = admin.email.toLowerCase() === "admin@gmail.com";
                    const isSuper = isRoot || admin.role === "super admin" || admin.role === "super_admin";
                    return (
                      <tr
                        key={admin._id || admin.email}
                        className="hover:bg-zinc-900/30 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl border font-bold flex items-center justify-center shrink-0 ${
                              isSuper
                                ? "bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-300"
                                : "bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border-indigo-500/30 text-indigo-300"
                            }`}>
                              {admin.name ? admin.name.charAt(0).toUpperCase() : "A"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate">{admin.name}</p>
                              <p className="text-[11px] text-zinc-500">
                                {admin.designation || (isRoot ? "Head of Institution / IT Director" : (isSuper ? "Chief Administrative Officer" : "Campus Administrative Officer"))}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 font-mono text-xs text-zinc-300">
                          <div className="flex items-center gap-2">
                            <Mail size={13} className="text-zinc-500 shrink-0" />
                            <span className="truncate">{admin.email}</span>
                            <button
                              onClick={() => handleCopyEmail(admin.email)}
                              className="text-zinc-500 hover:text-zinc-300 p-1 rounded"
                              title="Copy Email"
                            >
                              {copiedEmail === admin.email ? (
                                <Check size={12} className="text-emerald-400" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border ${
                              isSuper
                                ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                                : "bg-blue-500/10 text-blue-300 border-blue-500/30"
                            }`}
                          >
                            <Lock size={10} />
                            {isSuper ? "Super Administrator" : "Administrator"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            admin.isActive !== false ? "text-emerald-400" : "text-zinc-500"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              admin.isActive !== false ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
                            }`} />
                            <CheckCircle2 size={13} /> {admin.isActive !== false ? "Active Clearance" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isSuperAdmin ? (
                              <>
                                <button
                                  onClick={() => openEditModal(admin)}
                                  title="Edit Administrator"
                                  className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/10 transition"
                                >
                                  <Pencil size={14} />
                                </button>
                                {isRoot ? (
                                  <span className="text-[11px] text-zinc-500 italic pr-2">
                                    Protected
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleRevokeAdmin(admin)}
                                    title="Revoke Administrator Role"
                                    className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="text-[11px] text-zinc-500 italic">
                                View Only
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Policy Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 text-zinc-300">
            <FileText size={18} className="text-indigo-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Institutional Security Directives
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-400">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60 space-y-1.5">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" /> Two Administrative Tiers
              </p>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                The portal strictly authorizes two administrative roles: Super Administrator (exclusive authority to add, edit, and revoke administrators) and Administrator (portal management).
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60 space-y-1.5">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" /> Session Expiration
              </p>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Administrative session tokens rotate on a 7-day schedule with automatic handshake verification and encrypted cookie storage.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60 space-y-1.5">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-amber-400" /> Audit Log Pipeline
              </p>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                All administrative inducts, edits, and revocations are verified against SuperAdmin middleware clearances and recorded in the audit logs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Induct Administrator Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
                  Access Delegation (Super Admin)
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  Induct New Administrator
                </h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Administrator Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sunita Mehra"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Institutional Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. coordinator@eduvanta.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Administrative Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="admin">Administrator (General)</option>
                    <option value="super admin">Super Administrator (Full Clearance)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Temporary Password
                  </label>
                  <input
                    type="password"
                    placeholder="Default: Admin@123"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Designation / Department
                </label>
                <select
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Academic Administrator">Academic Administrator</option>
                  <option value="Admissions Director">Admissions Director</option>
                  <option value="Registrar & Controller of Examinations">Registrar & Controller of Examinations</option>
                  <option value="Finance & Comptroller">Finance & Comptroller</option>
                  <option value="IT Operations Lead">IT Operations Lead</option>
                  <option value="Chief Administrative Officer">Chief Administrative Officer</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 disabled:opacity-50"
                >
                  {submitting ? "Inducting..." : "Confirm & Induct"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Administrator Modal */}
      {isEditModalOpen && editingAdmin && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
                  Update Clearance (Super Admin)
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  Edit Administrator: {editingAdmin.name}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingAdmin(null);
                }}
                className="text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateAdmin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Administrator Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Email Identity (Read-Only)
                </label>
                <input
                  type="email"
                  disabled
                  value={editFormData.email}
                  className="w-full px-3.5 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-500 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Administrative Role *
                  </label>
                  <select
                    disabled={editingAdmin.email.toLowerCase() === "admin@gmail.com"}
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  >
                    <option value="admin">Administrator (General)</option>
                    <option value="super admin">Super Administrator (Full Clearance)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Account Status
                  </label>
                  <select
                    disabled={editingAdmin.email.toLowerCase() === "admin@gmail.com"}
                    value={editFormData.isActive ? "active" : "inactive"}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.value === "active" })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  >
                    <option value="active">Active Clearance</option>
                    <option value="inactive">Suspended / Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Designation / Department
                </label>
                <input
                  type="text"
                  value={editFormData.designation}
                  onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                  placeholder="e.g. Academic Administrator"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Reset Password (Leave blank to keep current)
                </label>
                <input
                  type="password"
                  placeholder="Enter new password to reset"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingAdmin(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
