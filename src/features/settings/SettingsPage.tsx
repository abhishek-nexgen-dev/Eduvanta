import React, { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  Globe,
  Share2,
  Mail,
  Phone,
  UserPlus,
  CheckCircle2,
  Lock,
  RefreshCw,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import api from "../../Utils/api.utils";
import { BackendSocialLinks, BackendFrontendSettings } from "../../types/backend.types";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"social" | "branding" | "admins">("social");
  const [socialLinks, setSocialLinks] = useState<BackendSocialLinks>({
    linkedin: "https://www.linkedin.com/school/eduvanta",
    facebook: "https://facebook.com/eduvanta",
    instagram: "https://instagram.com/eduvanta",
    email: "info@eduvanta.edu",
    number: "9661342993",
  });
  const [frontendSettings, setFrontendSettings] = useState<BackendFrontendSettings>({
    logo: "Eduvanta",
    landingPage: {
      HeroSection: {
        homeTitle: "Shape Tomorrow with Quality Education",
        homeParagraph: "Empowering students to achieve academic success and industry-standard technical skills.",
      },
    },
  });
  const [admins, setAdmins] = useState<AdminUser[]>([
    {
      _id: "6740b2f5a8c43d9124a87211",
      name: "Prof. R. K. Sharma",
      email: "admin@gmail.com",
      role: "admin",
      isActive: true,
    },
  ]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, fRes] = await Promise.allSettled([
        api.get("/api/v1/social/link"),
        api.get("/api/v1/frontend"),
      ]);

      if (sRes.status === "fulfilled" && sRes.value.data?.link) {
        setSocialLinks(sRes.value.data.link);
      }
      if (fRes.status === "fulfilled" && fRes.value.data?.data) {
        setFrontendSettings(fRes.value.data.data);
      }
    } catch (err) {
      console.warn("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put("/api/v1/social/link", socialLinks);
      toast.success("Institutional social media and contact channels updated!");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to update social channels.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put("/api/v1/frontend", frontendSettings);
      toast.success("Public landing page settings updated!");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to update branding settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;

    try {
      await api.post("/api/v1/role/create", { email: newAdminEmail.trim() });
      toast.success(`Admin privileges granted to ${newAdminEmail}!`);
      setAdmins((prev) => [
        ...prev,
        {
          _id: `adm_${Date.now()}`,
          name: newAdminEmail.split("@")[0],
          email: newAdminEmail,
          role: "admin",
          isActive: true,
        },
      ]);
      setNewAdminEmail("");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to assign role.");
    }
  };

  return (
    <div className="w-full bg-[#07080C] text-white p-3.5 sm:p-6 lg:p-8">
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300 mb-2">
              <Settings size={14} /> System & Institution Controls
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Portal & Website Configurations
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Configure communication channels, landing hero banners, and administrator access.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="self-start sm:self-center p-2 sm:px-3 sm:py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-300 flex items-center gap-1.5 transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3">
          <button
            onClick={() => setActiveTab("social")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "social"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            <Share2 size={14} /> Social Channels
          </button>
          <button
            onClick={() => setActiveTab("branding")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "branding"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            <Globe size={14} /> Dynamic Landing
          </button>
          <button
            onClick={() => setActiveTab("admins")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "admins"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            <Shield size={14} /> Administrator Roles
          </button>
        </div>

        {/* Social Links Panel */}
        {activeTab === "social" && (
          <form
            onSubmit={handleSaveSocial}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-8 shadow-xl space-y-5"
          >
            <div>
              <h2 className="text-base font-bold text-white">Social Media & Campus Contact Links</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Saved directly to the backend database at /api/v1/social/link.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-400">Institutional Email</label>
                <div className="relative mt-1">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    value={socialLinks.email || ""}
                    onChange={(e) => setSocialLinks({ ...socialLinks, email: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Campus Contact Phone</label>
                <div className="relative mt-1">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={String(socialLinks.number || "")}
                    onChange={(e) => setSocialLinks({ ...socialLinks, number: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">LinkedIn Profile URL</label>
                <input
                  type="text"
                  value={socialLinks.linkedin || ""}
                  onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Facebook Page URL</label>
                <input
                  type="text"
                  value={socialLinks.facebook || ""}
                  onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-zinc-400">Instagram Handle / URL</label>
                <input
                  type="text"
                  value={socialLinks.instagram || ""}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-900 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition active:scale-[0.98]"
              >
                {isSaving ? "Saving..." : "Save Communication Channels"}
              </button>
            </div>
          </form>
        )}

        {/* Dynamic Branding Panel */}
        {activeTab === "branding" && (
          <form
            onSubmit={handleSaveBranding}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-8 shadow-xl space-y-5"
          >
            <div>
              <h2 className="text-base font-bold text-white">Public Website Dynamic Hero & Branding</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Controls the live landing page slogans, banner titles, and institutional branding.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-400">Portal / Institution Brand Logo Text</label>
                <input
                  type="text"
                  value={frontendSettings.logo || ""}
                  onChange={(e) => setFrontendSettings({ ...frontendSettings, logo: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Landing Page Hero Title</label>
                <input
                  type="text"
                  value={frontendSettings.landingPage?.HeroSection?.homeTitle || ""}
                  onChange={(e) =>
                    setFrontendSettings({
                      ...frontendSettings,
                      landingPage: {
                        ...frontendSettings.landingPage,
                        HeroSection: {
                          ...frontendSettings.landingPage?.HeroSection,
                          homeTitle: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full mt-1 px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Landing Page Mission Paragraph</label>
                <textarea
                  rows={3}
                  value={frontendSettings.landingPage?.HeroSection?.homeParagraph || ""}
                  onChange={(e) =>
                    setFrontendSettings({
                      ...frontendSettings,
                      landingPage: {
                        ...frontendSettings.landingPage,
                        HeroSection: {
                          ...frontendSettings.landingPage?.HeroSection,
                          homeParagraph: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full mt-1 px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-900 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition active:scale-[0.98]"
              >
                {isSaving ? "Saving..." : "Update Landing Content"}
              </button>
            </div>
          </form>
        )}

        {/* Administrator Roles Panel */}
        {activeTab === "admins" && (
          <div className="space-y-5 sm:space-y-6">
            {/* Invite Form */}
            <form
              onSubmit={handleAssignAdmin}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-8 shadow-xl space-y-4"
            >
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <UserPlus size={16} className="text-indigo-400" /> Induct New Administrator
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Assign administrative role directly via /api/v1/role/create.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  placeholder="e.g. coordinator@eduvanta.edu"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition"
                >
                  Grant Admin Role
                </button>
              </div>
            </form>

            {/* Current Admins List */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-zinc-800 bg-zinc-900/60">
                <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-400">
                  Authorized Portal Administrators ({admins.length})
                </h3>
              </div>
              <div className="divide-y divide-zinc-900">
                {admins.map((admin) => (
                  <div key={admin._id} className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-sm text-indigo-300 shrink-0">
                        {admin.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-semibold text-white truncate">{admin.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{admin.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        <Lock size={10} /> Super Admin
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle2 size={13} /> Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
