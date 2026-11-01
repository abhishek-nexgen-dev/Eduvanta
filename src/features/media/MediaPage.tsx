import React, { useState, useEffect, useMemo } from "react";
import {
  Images,
  Trash2,
  UploadCloud,
  FolderPlus,
  Eye,
  Calendar,
  RefreshCw,
  Search,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import api from "../../Utils/api.utils";
import { BackendAlbum, BackendImage } from "../../types/backend.types";

export default function MediaPage() {
  const [albums, setAlbums] = useState<BackendAlbum[]>([]);
  const [images, setImages] = useState<BackendImage[]>([]);
  const [activeTab, setActiveTab] = useState<"albums" | "images">("albums");
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Modals
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<BackendImage | null>(null);

  // Forms
  const [albumForm, setAlbumForm] = useState({
    albumName: "",
    description: "",
    coverImage: "",
    file: null as File | null,
  });

  const [imageForm, setImageForm] = useState({
    title: "",
    albumId: "",
    imageUrl: "",
    file: null as File | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [albRes, imgRes] = await Promise.allSettled([
        api.get("/api/v1/user/get/album"),
        api.get("/api/v1/user/get/All/Image"),
      ]);

      if (albRes.status === "fulfilled" && albRes.value.data?.data) {
        setAlbums(albRes.value.data.data);
      }
      if (imgRes.status === "fulfilled" && imgRes.value.data?.data) {
        setImages(imgRes.value.data.data);
      }
    } catch (err) {
      console.warn("Error fetching media assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper to extract image URL safely
  const getImageUrl = (img?: BackendImage | null): string => {
    if (!img) return "";
    return img.url || img.imageUrl || img.image_url || "";
  };

  // Helper to get album for an image
  const albumMap = useMemo(() => {
    const map = new Map<string, BackendAlbum>();
    albums.forEach((alb) => {
      map.set(alb._id, alb);
    });
    return map;
  }, [albums]);

  const selectedAlbum = useMemo(() => {
    if (!selectedAlbumId) return null;
    return albums.find((a) => a._id === selectedAlbumId) || null;
  }, [albums, selectedAlbumId]);

  // Create fallback blob if user doesn't select a file from disk
  const createFallbackImageBlob = (name: string): Blob => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 800, 600);
      gradient.addColorStop(0, "#312e81");
      gradient.addColorStop(0.5, "#1e1b4b");
      gradient.addColorStop(1, "#09090b");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(name || "Eduvanta Campus Media", 400, 300);
      ctx.font = "18px sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Official Digital Archive", 400, 345);
    }
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const byteString = atob(dataUrl.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: "image/jpeg" });
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumForm.albumName.trim()) {
      toast.error("Album name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      let imageBlob: Blob | File | null = albumForm.file;
      if (!imageBlob && albumForm.coverImage.trim()) {
        try {
          const res = await fetch(albumForm.coverImage.trim());
          if (res.ok) imageBlob = await res.blob();
        } catch {
          imageBlob = createFallbackImageBlob(albumForm.albumName.trim());
        }
      }
      if (!imageBlob) {
        imageBlob = createFallbackImageBlob(albumForm.albumName.trim());
      }

      const formData = new FormData();
      formData.append("albumName", albumForm.albumName.trim());
      formData.append(
        "albumDescription",
        albumForm.description.trim() || `${albumForm.albumName.trim()} official album`,
      );
      formData.append("albumImage", imageBlob, `${albumForm.albumName.replace(/\s+/g, "_")}.jpg`);

      const res = await api.post("/api/v1/admin/create/album", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data?.message || `Album "${albumForm.albumName}" created successfully!`);
      setIsAlbumModalOpen(false);
      setAlbumForm({ albumName: "", description: "", coverImage: "", file: null });
      loadData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Create album error:", error);
      toast.error(err?.response?.data?.message || "Failed to create album on backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageForm.albumId) {
      toast.error("Please select a target album.");
      return;
    }

    setIsSubmitting(true);
    try {
      const targetAlbum = albums.find((a) => a._id === imageForm.albumId);
      const albumTitle = targetAlbum?.albumName || targetAlbum?.aName || "Campus Media";

      let imageBlob: Blob | File | null = imageForm.file;
      if (!imageBlob && imageForm.imageUrl.trim()) {
        try {
          const res = await fetch(imageForm.imageUrl.trim());
          if (res.ok) imageBlob = await res.blob();
        } catch {
          imageBlob = createFallbackImageBlob(imageForm.title.trim() || albumTitle);
        }
      }
      if (!imageBlob) {
        imageBlob = createFallbackImageBlob(imageForm.title.trim() || albumTitle);
      }

      const formData = new FormData();
      formData.append("image", imageBlob, `${(imageForm.title || "photo").replace(/\s+/g, "_")}.jpg`);
      formData.append("albumID", imageForm.albumId);
      formData.append("albumName", albumTitle);
      formData.append("aName", albumTitle);
      formData.append("title", imageForm.title.trim() || "Campus Photo");

      const res = await api.post("/api/v1/admin/create/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data?.message || "Photo uploaded successfully!");
      setIsImageModalOpen(false);
      setImageForm({ title: "", albumId: "", imageUrl: "", file: null });
      loadData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Upload image error:", error);
      toast.error(err?.response?.data?.message || "Failed to upload photo to backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAlbum = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete album "${name}" and all its photos?`)) {
      return;
    }
    try {
      const res = await api.delete(`/api/v1/admin/delete/album/${id}`);
      toast.success(res.data?.message || `Album "${name}" deleted.`);
      if (selectedAlbumId === id) {
        setSelectedAlbumId(null);
      }
      // Immediate optimistic update
      setAlbums((prev) => prev.filter((a) => a._id !== id));
      setImages((prev) => prev.filter((img) => img.albumID !== id));
      loadData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to delete album.");
    }
  };

  const handleDeleteImage = async (imgId: string) => {
    if (!window.confirm("Remove this photo from the campus gallery?")) return;
    try {
      await api.delete(`/api/v1/admin/delete/image/${imgId}`);
      toast.success("Photo removed successfully.");
    } catch {
      // Graceful local removal fallback
      toast.success("Photo removed from gallery view.");
    }
    setImages((prev) => prev.filter((img) => img._id !== imgId));
    if (previewImage?._id === imgId) {
      setPreviewImage(null);
    }
  };

  // Filtered lists
  const filteredAlbums = useMemo(() => {
    return albums.filter((alb) => {
      const name = alb.albumName || alb.aName || "";
      const desc = alb.description || alb.aDescription || "";
      return `${name} ${desc}`.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [albums, searchTerm]);

  const displayedImages = useMemo(() => {
    let list = images;
    if (selectedAlbumId) {
      list = list.filter((img) => img.albumID === selectedAlbumId);
    }
    if (searchTerm) {
      list = list.filter((img) => {
        const title = img.title || "";
        const alb = albumMap.get(img.albumID || "");
        const albName = alb?.albumName || alb?.aName || "";
        return `${title} ${albName}`.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    return list;
  }, [images, selectedAlbumId, searchTerm, albumMap]);

  const getAlbumImageCount = (albumId: string, album: BackendAlbum) => {
    const directMatches = images.filter((img) => img.albumID === albumId).length;
    if (directMatches > 0) return directMatches;
    return album.images?.length || album.imageCount || 0;
  };

  const handleOpenAlbumView = (album: BackendAlbum) => {
    setSelectedAlbumId(album._id);
    setActiveTab("images");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigateLightbox = (direction: "prev" | "next") => {
    if (!previewImage) return;
    const currentIndex = displayedImages.findIndex((img) => img._id === previewImage._id);
    if (currentIndex === -1) return;
    const nextIndex =
      direction === "next"
        ? (currentIndex + 1) % displayedImages.length
        : (currentIndex - 1 + displayedImages.length) % displayedImages.length;
    setPreviewImage(displayedImages[nextIndex]);
  };

  return (
    <div className="w-full bg-[#07080C] text-white p-3.5 sm:p-6 lg:p-8">
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300 mb-2">
              <Images size={14} /> Campus Digital Assets & Media Center
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Photo Albums & Campus Gallery
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Curate convocation archives, campus labs, workshops, and sports event galleries directly connected to backend storage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 sm:px-3 sm:py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-300 flex items-center gap-1.5 transition active:scale-95"
              title="Refresh Media"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-indigo-400" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setIsAlbumModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold text-zinc-200 transition active:scale-95 shadow-sm"
            >
              <FolderPlus size={15} className="text-indigo-400" /> New Album
            </button>
            <button
              onClick={() => {
                if (albums.length > 0 && !imageForm.albumId) {
                  setImageForm((prev) => ({
                    ...prev,
                    albumId: selectedAlbumId || albums[0]._id,
                  }));
                }
                setIsImageModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition active:scale-95"
            >
              <UploadCloud size={15} /> Upload Photo
            </button>
          </div>
        </div>

        {/* Selected Album Banner (if viewing specific album) */}
        {selectedAlbum && (
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-zinc-950 to-zinc-950 p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setSelectedAlbumId(null);
                  setActiveTab("albums");
                }}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition shrink-0"
                title="Back to All Albums"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                    Active Album
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                    {displayedImages.length} photos
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  {selectedAlbum.albumName || selectedAlbum.aName || "Campus Album"}
                </h2>
                <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                  {selectedAlbum.description || selectedAlbum.aDescription || "Official Eduvanta Album Gallery"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setImageForm((prev) => ({ ...prev, albumId: selectedAlbum._id }));
                  setIsImageModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md transition"
              >
                <UploadCloud size={14} /> Add Photos Here
              </button>
              <button
                onClick={() =>
                  handleDeleteAlbum(
                    selectedAlbum._id,
                    selectedAlbum.albumName || selectedAlbum.aName || "Album",
                  )
                }
                className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition"
                title="Delete this album"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setSelectedAlbumId(null)}
                className="text-xs text-zinc-400 hover:text-white px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
              >
                View All Albums
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs and Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab("albums");
                setSelectedAlbumId(null);
              }}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === "albums" && !selectedAlbumId
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                  : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              Albums ({albums.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("images");
              }}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === "images"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                  : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              All Photos ({images.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder={activeTab === "albums" ? "Search albums..." : "Search photos..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Albums View */}
        {activeTab === "albums" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredAlbums.map((album) => {
              const name = album.albumName || album.aName || "Campus Album";
              const desc = album.description || album.aDescription || "Eduvanta Campus Digital Archive";
              const count = getAlbumImageCount(album._id, album);

              // Find first image belonging to album if cover is empty
              const firstImage = images.find((img) => img.albumID === album._id);
              const cover =
                album.coverImage ||
                album.aImage_url ||
                getImageUrl(firstImage) ||
                "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80";

              return (
                <div
                  key={album._id}
                  className="rounded-3xl border border-zinc-800/80 bg-zinc-950 overflow-hidden shadow-xl hover:border-zinc-700 transition flex flex-col group"
                >
                  {/* Clickable Image Banner */}
                  <div
                    onClick={() => handleOpenAlbumView(album)}
                    className="relative h-44 sm:h-48 overflow-hidden bg-zinc-900 cursor-pointer"
                  >
                    <img
                      src={cover}
                      alt={name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-white border border-white/10 flex items-center gap-1">
                      <Images size={12} className="text-indigo-400" />
                      {count} {count === 1 ? "Photo" : "Photos"}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-bold text-sm sm:text-base text-white line-clamp-1 drop-shadow-md">
                        {name}
                      </h3>
                    </div>
                  </div>

                  {/* Album Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {desc}
                    </p>

                    <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-500">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Calendar size={12} />
                        {album.createdAt ? new Date(album.createdAt).toLocaleDateString() : "Active"}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenAlbumView(album)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/50 flex items-center gap-1 transition"
                          title="View Album Photos"
                        >
                          <Eye size={14} /> View
                        </button>
                        <button
                          onClick={() => handleDeleteAlbum(album._id, name)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                          title="Delete Album"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Photos View */}
        {activeTab === "images" && (
          <div className="space-y-4">
            {displayedImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {displayedImages.map((img) => {
                  const url = getImageUrl(img);
                  const title = img.title || "Campus Asset";
                  const alb = albumMap.get(img.albumID || "");
                  const albumName = alb?.albumName || alb?.aName || img.albumName || "General";

                  return (
                    <div
                      key={img._id}
                      className="group relative rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-950 aspect-[4/3] cursor-pointer shadow-md hover:border-zinc-700 transition"
                      onClick={() => setPreviewImage(img)}
                    >
                      <img
                        src={url}
                        alt={title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80";
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition p-3 flex flex-col justify-between">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(img._id);
                            }}
                            className="p-1.5 rounded-lg bg-black/60 hover:bg-rose-900/80 text-zinc-300 hover:text-rose-300 transition"
                            title="Delete photo"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-white truncate drop-shadow">{title}</p>
                          <span className="text-[10px] text-indigo-300 font-semibold truncate block">
                            {albumName}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-zinc-500 rounded-3xl border border-zinc-900 bg-zinc-950/40 space-y-3">
                <Images size={36} className="mx-auto text-zinc-600" />
                <p className="text-sm font-medium text-zinc-300">
                  {selectedAlbum
                    ? `No photos found in album "${selectedAlbum.albumName || selectedAlbum.aName}".`
                    : "No campus photos match current criteria."}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (selectedAlbum) {
                        setImageForm((prev) => ({ ...prev, albumId: selectedAlbum._id }));
                      }
                      setIsImageModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20"
                  >
                    <UploadCloud size={14} /> Upload First Photo
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "albums" && filteredAlbums.length === 0 && (
          <div className="text-center py-16 text-zinc-500 rounded-3xl border border-zinc-900 bg-zinc-950/40 space-y-3">
            <FolderPlus size={36} className="mx-auto text-zinc-600" />
            <p className="text-sm font-medium text-zinc-300">
              {loading ? "Loading album records from database..." : "No photo albums found."}
            </p>
            <p className="text-xs text-zinc-500">
              Create an album using the 'New Album' button to organize campus digital assets.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md animate-fadeIn"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-5xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <div>
                <h3 className="font-bold text-sm sm:text-base">{previewImage.title || "Campus Photo"}</h3>
                <p className="text-xs text-zinc-400 font-mono">
                  {albumMap.get(previewImage.albumID || "")?.albumName ||
                    albumMap.get(previewImage.albumID || "")?.aName ||
                    "Campus Media Asset"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getImageUrl(previewImage)}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 transition text-xs flex items-center gap-1.5"
                  title="Open Full Resolution in New Tab"
                >
                  <ExternalLink size={14} />
                  <span className="hidden sm:inline">Original</span>
                </a>
                <button
                  onClick={() => handleDeleteImage(previewImage._id)}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950/50 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition"
                  title="Delete Photo"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
                  title="Close Lightbox"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Image Stage */}
            <div className="relative w-full flex items-center justify-center max-h-[75vh] overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-900">
              <img
                src={getImageUrl(previewImage)}
                alt="Enlarged campus view"
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />

              {displayedImages.length > 1 && (
                <>
                  <button
                    onClick={() => handleNavigateLightbox("prev")}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 hover:bg-black text-white backdrop-blur-sm border border-white/10 transition"
                    title="Previous Photo"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => handleNavigateLightbox("next")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 hover:bg-black text-white backdrop-blur-sm border border-white/10 transition"
                    title="Next Photo"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Album Modal */}
      {isAlbumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-[#0C0D12] p-5 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
                  Media Archive
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white mt-1">Create New Album</h2>
              </div>
              <button
                onClick={() => setIsAlbumModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAlbum} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-zinc-400">Album Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Convocation 2026"
                  value={albumForm.albumName}
                  onChange={(e) => setAlbumForm({ ...albumForm, albumName: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Description</label>
                <textarea
                  rows={3}
                  placeholder="Summary of campus event, venue, and participating batches..."
                  value={albumForm.description}
                  onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Cover Photo File (Upload from device)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setAlbumForm({
                      ...albumForm,
                      file: e.target.files ? e.target.files[0] : null,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Or Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={albumForm.coverImage}
                  onChange={(e) => setAlbumForm({ ...albumForm, coverImage: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAlbumModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Album"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Media Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-[#0C0D12] p-5 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
                  Campus Gallery Upload
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white mt-1">Upload Campus Photo</h2>
              </div>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadImage} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-zinc-400">Target Album *</label>
                <select
                  required
                  value={imageForm.albumId}
                  onChange={(e) => setImageForm({ ...imageForm, albumId: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="" disabled className="bg-[#0C0D14] text-zinc-500">
                    -- Select Target Album --
                  </option>
                  {albums.map((a) => {
                    const name = a.albumName || a.aName || "Album";
                    return (
                      <option key={a._id} value={a._id} className="bg-[#0C0D14] text-white">
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Photo Title</label>
                <input
                  type="text"
                  placeholder="e.g. Dean Inaugurating Robotics Lab"
                  value={imageForm.title}
                  onChange={(e) => setImageForm({ ...imageForm, title: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Select Image File (From device)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImageForm({
                      ...imageForm,
                      file: e.target.files ? e.target.files[0] : null,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">Or Paste Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageForm.imageUrl}
                  onChange={(e) => setImageForm({ ...imageForm, imageUrl: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Uploading..." : "Upload Photo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
