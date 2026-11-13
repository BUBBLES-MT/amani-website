// frontend/app/admin/sermons/new/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sermonsApi, uploadApi, tokenStorage, userStorage } from "@/lib/api";
import {
  FaArrowLeft, FaSave, FaSpinner, FaExclamationTriangle, FaCheckCircle,
  FaUpload, FaTimes, FaMusic, FaVideo, FaFilePdf, FaImage,
} from "react-icons/fa";
import AnimatedSection from "@/components/ui/AnimatedSection";

// ============================================
// ✅ ROLES ZINAZORUHUSIWA
// ============================================
const ALLOWED_ROLES = [
  "super_admin",
  "mchungaji_kiongozi",
  "mchungaji_msaidizi",
  "mwenyekiti",
  "mwenyekiti_msaidizi",
  "katibu_mkuu",
  "mzee_kanisa",
  "it",
];

export default function NewSermonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    preacher: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    scripture: "",
    content: "",
    audio_url: "",
    video_url: "",
    pdf_url: "",
    thumbnail_url: "",
    duration: 0,
    status: "published",
  });

  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // ============================================
  // 🔐 AUTH CHECK
  // ============================================
  useEffect(() => {
    const token = tokenStorage.get();
    const user = userStorage.get();
    if (!token || !user) {
      router.replace("/admin/login");
      return;
    }
    const role = user.role?.toLowerCase() || "";
    if (!ALLOWED_ROLES.includes(role)) {
      router.replace("/admin/dashboard");
      return;
    }
    setIsAuthorized(true);
  }, [router]);

  // ============================================
  // 📝 HANDLE CHANGE
  // ============================================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration" ? parseInt(value) || 0 : value,
    }));
  };

  // ============================================
  // 📤 UPLOAD FILE
  // ============================================
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "audio_url" | "video_url" | "pdf_url" | "thumbnail_url",
    type: "audio" | "video" | "image" | "pdf"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(field);
    setUploadProgress((p) => ({ ...p, [field]: 0 }));
    setError("");

    try {
      setUploadProgress((p) => ({ ...p, [field]: 30 }));

      const result = await uploadApi.upload(file, type);

      setFormData((prev) => ({ ...prev, [field]: result.url }));
      setUploadProgress((p) => ({ ...p, [field]: 100 }));

      setTimeout(() => {
        setUploadProgress((p) => {
          const newP = { ...p };
          delete newP[field];
          return newP;
        });
      }, 2000);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Imeshindwa kupakia faili");
      setUploadProgress((p) => {
        const newP = { ...p };
        delete newP[field];
        return newP;
      });
    } finally {
      setUploading(null);
    }
  };

  const clearFile = (field: "audio_url" | "video_url" | "pdf_url" | "thumbnail_url") => {
    setFormData((prev) => ({ ...prev, [field]: "" }));
  };

  // ============================================
  // 📤 SUBMIT
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.title.trim()) {
      setError("Weka kichwa cha mahubiri");
      setLoading(false);
      return;
    }
    if (!formData.preacher.trim()) {
      setError("Weka jina la mchungaji");
      setLoading(false);
      return;
    }

    try {
      const dateISO = new Date(formData.date).toISOString();
      await sermonsApi.create({
        ...formData,
        date: dateISO,
        duration: formData.duration || undefined,
      } as any);

      setSuccess("✅ Mahubiri yameundwa kwa mafanikio!");
      setTimeout(() => router.push("/admin/sermons"), 1200);
    } catch (err: any) {
      console.error("Create sermon error:", err);
      setError(err.message || "Imeshindwa kuunda mahubiri");
      setLoading(false);
    }
  };

  // ============================================
  // ⏳ LOADING — auth check
  // ============================================
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto" />
          <p className="text-gray-500 mt-3">Inathibitisha...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* ===== BACK LINK ===== */}
      <AnimatedSection>
        <Link
          href="/admin/sermons"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-church-600 mb-6 transition-colors"
        >
          <FaArrowLeft /> Rudi kwenye Mahubiri
        </Link>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* ===== HEADER ===== */}
          <div className="bg-gradient-to-r from-church-500 to-church-700 p-6 text-white">
            <h1 className="text-2xl font-bold">Ongeza Mahubiri Mpya</h1>
            <p className="text-white/80 text-sm mt-1">
              Jaza fomu hapa chini kuunda mahubiri
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* ===== ERROR ===== */}
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
                <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 flex-1">{error}</p>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="text-red-400 hover:text-red-600"
                >
                  <FaTimes />
                </button>
              </div>
            )}

            {/* ===== SUCCESS ===== */}
            {success && (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-xl flex items-start gap-3">
                <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-700 flex-1">{success}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kichwa cha Mahubiri *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Mfano: Nguvu ya Imani"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-church-500 focus:outline-none focus:ring-2 focus:ring-church-500/20"
              />
            </div>

            {/* Preacher + Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mchungaji *
                </label>
                <input
                  type="text"
                  name="preacher"
                  value={formData.preacher}
                  onChange={handleChange}
                  required
                  placeholder="Mfano: Mchungaji John"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-church-500 focus:outline-none focus:ring-2 focus:ring-church-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tarehe *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-church-500 focus:outline-none focus:ring-2 focus:ring-church-500/20"
                />
              </div>
            </div>

            {/* Scripture */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Maandiko (Biblia)
              </label>
              <input
                type="text"
                name="scripture"
                value={formData.scripture}
                onChange={handleChange}
                placeholder="Mfano: Waebrania 11:1"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-church-500 focus:outline-none focus:ring-2 focus:ring-church-500/20"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Maelezo
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Maelezo mafupi ya mahubiri..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-church-500 focus:outline-none focus:ring-2 focus:ring-church-500/20 resize-none"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Maudhui Kamili
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={6}
                placeholder="Maudhui kamili ya mahubiri..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-church-500 focus:outline-none focus:ring-2 focus:ring-church-500/20 resize-none"
              />
            </div>

            {/* ===== FILE UPLOADS ===== */}
            <div className="border-t border-gray-100 pt-5 space-y-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-4 bg-church-500 rounded-full" />
                Faili za Mahubiri
              </h3>
              <p className="text-xs text-gray-500">
                Pakia faili kutoka simu au kompyuta yako
              </p>

              <FileUploadField
                label="Audio (Sauti)"
                icon={FaMusic}
                accept=".mp3,.wav,.m4a,.ogg,.aac"
                field="audio_url"
                value={formData.audio_url}
                uploading={uploading === "audio_url"}
                progress={uploadProgress.audio_url}
                onChange={(e) => handleFileUpload(e, "audio_url", "audio")}
                onClear={() => clearFile("audio_url")}
                hint="MP3, WAV, M4A, OGG, AAC • Hadi 50 MB"
              />

              <FileUploadField
                label="Video"
                icon={FaVideo}
                accept=".mp4,.mov,.avi,.mkv,.webm"
                field="video_url"
                value={formData.video_url}
                uploading={uploading === "video_url"}
                progress={uploadProgress.video_url}
                onChange={(e) => handleFileUpload(e, "video_url", "video")}
                onClear={() => clearFile("video_url")}
                hint="MP4, MOV, AVI, MKV, WEBM • Hadi 500 MB"
              />

              <FileUploadField
                label="PDF"
                icon={FaFilePdf}
                accept=".pdf"
                field="pdf_url"
                value={formData.pdf_url}
                uploading={uploading === "pdf_url"}
                progress={uploadProgress.pdf_url}
                onChange={(e) => handleFileUpload(e, "pdf_url", "pdf")}
                onClear={() => clearFile("pdf_url")}
                hint="PDF • Hadi 20 MB"
              />

              <FileUploadField
                label="Picha ya Jalada"
                icon={FaImage}
                accept=".jpg,.jpeg,.png,.webp,.gif"
                field="thumbnail_url"
                value={formData.thumbnail_url}
                uploading={uploading === "thumbnail_url"}
                progress={uploadProgress.thumbnail_url}
                onChange={(e) => handleFileUpload(e, "thumbnail_url", "image")}
                onClear={() => clearFile("thumbnail_url")}
                hint="JPG, PNG, WEBP, GIF • Hadi 10 MB"
              />
            </div>

            {/* Duration + Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Muda (sekunde)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="Mfano: 2700 (45 min)"
                  min={0}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-church-500 focus:outline-none focus:ring-2 focus:ring-church-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hali *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-church-500 focus:outline-none focus:ring-2 focus:ring-church-500/20 bg-white"
                >
                  <option value="published">Imechapishwa (Inaonekana kwa wote)</option>
                  <option value="draft">Rasimu (Haionekani kwa wote)</option>
                  <option value="archived">Imewekwa kwenye kumbukumbu</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Link
                href="/admin/sermons"
                className="flex-1 text-center px-6 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Ghairi
              </Link>
              <button
                type="submit"
                disabled={loading || !!uploading}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-church-500 to-church-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Inahifadhi...
                  </>
                ) : (
                  <>
                    <FaSave /> Hifadhi Mahubiri
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </AnimatedSection>
    </div>
  );
}

// ============================================
// 🧩 FILE UPLOAD FIELD COMPONENT
// ============================================
function FileUploadField({
  label, icon: Icon, accept, field, value, uploading, progress, onChange, onClear, hint,
}: {
  label: string;
  icon: any;
  accept: string;
  field: string;
  value: string;
  uploading: boolean;
  progress?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  hint: string;
}) {
  const isFullUrl = value?.startsWith("http");
  const displayUrl = isFullUrl
    ? value
    : value
    ? `http://localhost:8000${value}`
    : "";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Icon className="inline mr-1.5 text-church-500" />
        {label}
      </label>

      {value ? (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <FaCheckCircle className="text-emerald-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald-800 truncate">
              Faili imepakiwa
            </p>
            <a
              href={displayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-600 hover:underline truncate block"
            >
              {value}
            </a>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
            title="Ondoa"
          >
            <FaTimes />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            accept={accept}
            onChange={onChange}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            id={`file-${field}`}
          />
          <label
            htmlFor={`file-${field}`}
            className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors ${
              uploading
                ? "border-church-400 bg-church-50 cursor-wait"
                : "border-gray-300 hover:border-church-400 hover:bg-church-50"
            }`}
          >
            {uploading ? (
              <FaSpinner className="animate-spin text-church-500 text-xl" />
            ) : (
              <FaUpload className="text-church-500 text-xl" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">
                {uploading ? "Inapakia..." : "Bonyeza kuchagua faili"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{hint}</p>
            </div>
          </label>

          {uploading && progress !== undefined && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-church-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">{progress}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}