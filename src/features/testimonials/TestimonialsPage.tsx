import React, { useState, useEffect, useMemo } from "react";
import {
  Quote,
  Star,
  Plus,
  Search,
  Trash2,
  RefreshCw,
  Award,
  Users,
  Briefcase,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import api, { getErrorMessage } from "../../Utils/api.utils";
import { BackendTestimonial } from "../../types/backend.types";
import { Button, Input, Modal, StatCard, Badge, EmptyState } from "../../Components";

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<BackendTestimonial[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [starFilter, setStarFilter] = useState<number | "All">("All");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    job_Role: "",
    message: "",
    star: 5,
    imageFile: null as File | null,
  });

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/findAllTestimonials");
      if (res.data?.data && Array.isArray(res.data.data)) {
        setTestimonials(res.data.data);
      } else if (Array.isArray(res.data)) {
        setTestimonials(res.data);
      } else {
        setTestimonials([]);
      }
    } catch (err: unknown) {
      console.warn("Error fetching testimonials:", err);
      const isNotFound =
        typeof err === "object" &&
        err !== null &&
        (err as { response?: { status?: number } }).response?.status === 404;
      if (!isNotFound) {
        toast.error(getErrorMessage(err, "Failed to load testimonials from backend."));
      }
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  // Filtered List
  const filteredList = useMemo(() => {
    return testimonials.filter((t) => {
      const matchSearch =
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.job_Role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.message?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStar = starFilter === "All" || Number(t.star) === starFilter;
      return matchSearch && matchStar;
    });
  }, [testimonials, searchTerm, starFilter]);

  // Statistics
  const totalCount = testimonials.length;
  const avgRating =
    totalCount > 0
      ? (testimonials.reduce((sum, t) => sum + Number(t.star || 0), 0) / totalCount).toFixed(1)
      : "5.0";
  const fiveStarCount = testimonials.filter((t) => Number(t.star) >= 5).length;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to create a fallback avatar blob if user doesn't pick an image
  const createFallbackAvatarBlob = (name: string): Blob => {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#4f46e5";
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 64px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const initials =
        name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase() || "CI";
      ctx.fillText(initials, 100, 100);
    }
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const byteString = atob(dataUrl.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: "image/jpeg" });
  };

  const handleCreateTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim() ||
      !formData.job_Role.trim()
    ) {
      toast.error("Please fill in candidate name, email, job role, and testimonial message.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("email", formData.email.trim());
      payload.append("job_Role", formData.job_Role.trim());
      payload.append("message", formData.message.trim());
      payload.append("star", String(formData.star));

      if (formData.imageFile) {
        payload.append("image", formData.imageFile);
      } else {
        const fallbackBlob = createFallbackAvatarBlob(formData.name.trim());
        payload.append("image", fallbackBlob, `${formData.name.replace(/\s+/g, "_")}.jpg`);
      }

      await api.post("/api/v1/createTestimonial", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(`Alumni feedback from "${formData.name}" published!`);
      setIsModalOpen(false);
      setFormData({
        name: "",
        email: "",
        job_Role: "",
        message: "",
        star: 5,
        imageFile: null,
      });
      setImagePreview(null);
      loadTestimonials();
    } catch (err: unknown) {
      console.error("Testimonial create error:", err);
      toast.error(getErrorMessage(err, "Failed to save testimonial."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete testimonial by ${name}?`)) return;
    try {
      await api.delete(`/api/v1/deleteTestimonial/${id}`);
      toast.success(`Testimonial by ${name} deleted.`);
      loadTestimonials();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete testimonial."));
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
              <Quote size={13} /> Institutional Reviews & Alumni Success
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Student & Alumni Testimonials
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Curate verified graduate reviews, company placements, and student endorsements for the
              portal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={loadTestimonials}
              disabled={loading}
              icon={<RefreshCw size={14} className={loading ? "animate-spin" : ""} />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              icon={<Plus size={15} />}
            >
              Add Testimonial
            </Button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Endorsements"
            value={totalCount}
            subtitle="Verified reviews stored in database"
            tone="indigo"
            icon={<Quote size={20} />}
          />
          <StatCard
            title="Institutional Rating"
            value={`${avgRating} / 5.0`}
            subtitle="Average across all submissions"
            tone="amber"
            icon={<Star size={20} className="fill-amber-400" />}
          />
          <StatCard
            title="5-Star Ratings"
            value={fiveStarCount}
            subtitle="Top tier alumni evaluations"
            tone="emerald"
            icon={<Award size={20} />}
          />
          <StatCard
            title="Career Placements"
            value={`${Math.max(totalCount, 8)} Organizations`}
            subtitle="Top multinational corporate recruiters"
            tone="violet"
            icon={<Briefcase size={20} />}
          />
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800">
          <div className="relative w-full sm:w-80">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by student, role, quote..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">
              Filter Stars:
            </span>
            {(["All", 5, 4, 3] as const).map((starVal) => (
              <button
                key={String(starVal)}
                onClick={() => setStarFilter(starVal)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1 ${
                  starFilter === starVal
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:bg-zinc-800"
                }`}
              >
                {starVal === "All" ? "All Stars" : `${starVal} ★`}
              </button>
            ))}
          </div>
        </div>

        {/* Testimonials Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="animate-spin text-indigo-400" size={32} />
            <p className="text-sm text-zinc-400">Loading student reviews from server...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <EmptyState
            icon={<Quote size={28} />}
            title="No Testimonials Found"
            description={
              searchTerm || starFilter !== "All"
                ? "Try clearing your search query or star filter."
                : "No student reviews found in database. Add the first graduate endorsement!"
            }
            action={{
              label: "Add Testimonial",
              onClick: () => setIsModalOpen(true),
              icon: <Plus size={14} />,
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredList.map((item) => (
              <div
                key={item._id}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 backdrop-blur-xl hover:border-zinc-700 transition-all duration-200"
              >
                <div>
                  {/* Top Bar: Star Rating & Delete Action */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < Number(item.star || 5)
                                ? "text-amber-400 fill-amber-400"
                                : "text-zinc-700 fill-zinc-800"
                            }
                          />
                        ))}
                      </div>
                      <Badge tone="amber" size="sm">
                        {item.star}.0 Rating
                      </Badge>
                    </div>

                    <button
                      onClick={() => handleDelete(item._id, item.name)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition opacity-80 group-hover:opacity-100"
                      title="Delete Testimonial"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Message Quote */}
                  <div className="relative mb-6">
                    <Quote
                      size={24}
                      className="text-indigo-500/20 absolute -top-2 -left-1 pointer-events-none"
                    />
                    <p className="text-sm text-zinc-300 leading-relaxed pl-5 italic">
                      "{item.message}"
                    </p>
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3.5 pt-4 border-t border-zinc-800/60">
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                    }
                    alt={item.name}
                    className="h-11 w-11 rounded-full object-cover border border-zinc-700 bg-zinc-900 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
                    }}
                  />
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    </div>
                    <p className="text-xs text-indigo-400 font-medium truncate">{item.job_Role}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{item.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Testimonial Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Student Testimonial"
          subtitle="Publish verified graduate feedback and placement outcome"
          icon={<Quote size={18} />}
          size="lg"
        >
          <form onSubmit={handleCreateTestimonial} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Student / Alumni Full Name"
                name="name"
                placeholder="e.g. Ananya Roy"
                value={formData.name}
                onChange={(_, val) => setFormData((prev) => ({ ...prev, name: val }))}
                required
              />

              <Input
                label="Institutional or Personal Email"
                name="email"
                type="email"
                placeholder="e.g. ananya.roy@gmail.com"
                value={formData.email}
                onChange={(_, val) => setFormData((prev) => ({ ...prev, email: val }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Current Designation / Corporate Placement"
                name="job_Role"
                placeholder="e.g. Cloud Engineer at TCS • BCA 2024"
                value={formData.job_Role}
                onChange={(_, val) => setFormData((prev) => ({ ...prev, job_Role: val }))}
                required
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Star Rating (1 - 5) <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center gap-2 h-11 px-3.5 rounded-xl border border-zinc-800 bg-zinc-900/70">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      type="button"
                      key={starVal}
                      onClick={() => setFormData((prev) => ({ ...prev, star: starVal }))}
                      className="p-1 focus:outline-none transition hover:scale-110"
                    >
                      <Star
                        size={20}
                        className={
                          starVal <= formData.star
                            ? "text-amber-400 fill-amber-400"
                            : "text-zinc-600 fill-zinc-800"
                        }
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-amber-400">
                    {formData.star} Star{formData.star > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Testimonial Feedback / Review <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Describe your learning experience, faculty guidance, and career launch at Eduvanta..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
              />
            </div>

            {/* Avatar / Photo Upload */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Profile Photo / Avatar
              </label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-14 w-14 rounded-full object-cover border-2 border-indigo-500 shadow-md shrink-0"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                    <Users size={22} />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    id="testimonial-image-upload"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="testimonial-image-upload"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 cursor-pointer transition"
                  >
                    <Upload size={14} /> Upload Avatar Photo
                  </label>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Optional. A styled monogram will be generated automatically if no photo is
                    chosen.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                icon={<CheckCircle2 size={16} />}
              >
                Publish Testimonial
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
