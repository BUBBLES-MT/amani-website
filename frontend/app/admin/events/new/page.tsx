// frontend/app/admin/events/new/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { eventsApi, uploadApi } from "@/lib/api";
import {
  FaArrowLeft, FaSave, FaSpinner, FaExclamationTriangle,
  FaUpload, FaTimes, FaCheckCircle, FaImage, FaVideo, FaMusic, FaFilePdf,
} from "react-icons/fa";
import AnimatedSection from "@/components/ui/AnimatedSection";

const CATEGORIES = [
  "Ibada", "Vijana", "Wanawake", "Mafunzo", "Huduma", "Nyingine",
];

const STATUSES = [
  { value: "upcoming", label: "Inakuja" },
  { value: "ongoing", label: "Inaendelea" },
  { value: "completed", label: "Imekamilika" },
  { value: "cancelled", label: "Imefutwa" },
];

export default function NewEventPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: CATEGORIES[0],
    start_date: new Date().toISOString().slice(0, 10),
    end_date: "",
    start_time: "",
    end_time: "",
    location: "",
    venue: "",
    is_online: false,
    meeting_link: "",
    organizer: "",
    organizer_contact: "",
    organizer_email: "",
    max_attendees: "",
    image_url: "",
    video_url: "",
    audio_url: "",
    pdf_url: "",
    status: "upcoming",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ✅ Universal upload handler
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "image_url" | "video_url" | "audio_url" | "pdf_url",
    type: "image" | "video" | "audio" | "pdf"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(field);
    setError("");
    try {
      const result = await uploadApi.upload(file, type);
      setForm((f) => ({ ...f, [field]: result.url }));
    } catch (err: any) {
      setError(err.message || "Imeshindwa kupakia faili");
    } finally {
      setUploading(null);
    }
  };

  const clearFile = (field: "image_url" | "video_url" | "audio_url" | "pdf_url") => {
    setForm((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) return setError("Weka kichwa cha tukio");
    if (!form.start_date) return setError("Weka tarehe ya kuanza");

    setSaving(true);
    try {
      const payload: any = {
        title: form.title.trim(),
        description: form.description || undefined,
        category: form.category,
        start_date: new Date(form.start_date).toISOString(),
        end_date: form.end_date ? new Date(form.end_date).toISOString() : undefined,
        start_time: form.start_time || undefined,
        end_time: form.end_time || undefined,
        location: form.location || undefined,
        venue: form.venue || undefined,
        is_online: form.is_online,
        meeting_link: form.meeting_link || undefined,
        organizer: form.organizer || undefined,
        organizer_contact: form.organizer_contact || undefined,
        organizer_email: form.organizer_email || undefined,
        max_attendees: form.max_attendees ? Number(form.max_attendees) : undefined,
        image_url: form.image_url || undefined,
        video_url: form.video_url || undefined,
        audio_url: form.audio_url || undefined,
        pdf_url: form.pdf_url || undefined,
        status: form.status,
      };
      await eventsApi.create(payload);
      router.push("/admin/events");
    } catch (err: any) {
      console.error("Create event error:", err);
      setError(err.message || "Imeshindwa kuunda tukio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      {/* ===== HEADER ===== */}
      <AnimatedSection>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/events"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Ongeza Tukio</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Jaza taarifa za tukio
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* ===== ERROR ===== */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
        </div>
      )}

      {/* ===== FORM ===== */}
      <AnimatedSection delay={0.1}>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kichwa cha Tukio <span className="text-red-500">*</span>
            </label>
            <input
              type="text" name="title" value={form.title} onChange={handleChange}
              required placeholder="Mfano: Mkutano wa Vijana"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Maelezo</label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              rows={3} placeholder="Maelezo ya tukio..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm resize-none"
            />
          </div>

          {/* Category + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aina <span className="text-red-500">*</span>
              </label>
              <select name="category" value={form.category} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm bg-white">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hali <span className="text-red-500">*</span>
              </label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm bg-white">
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarehe ya Kuanza <span className="text-red-500">*</span>
              </label>
              <input type="date" name="start_date" value={form.start_date} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tarehe ya Mwisho</label>
              <input type="date" name="end_date" value={form.end_date} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm" />
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Muda wa Kuanza</label>
              <input type="time" name="start_time" value={form.start_time} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Muda wa Mwisho</label>
              <input type="time" name="end_time" value={form.end_time} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm" />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mahali</label>
              <input type="text" name="location" value={form.location} onChange={handleChange}
                placeholder="Mfano: Kanisa Kuu"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ukumbi</label>
              <input type="text" name="venue" value={form.venue} onChange={handleChange}
                placeholder="Mfano: Ukumbi Mkubwa"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm" />
            </div>
          </div>

          {/* Online */}
          <div className="flex items-center gap-3">
            <input type="checkbox" name="is_online" checked={form.is_online} onChange={handleChange} id="is_online"
              className="w-4 h-4 text-church-500 rounded focus:ring-church-400" />
            <label htmlFor="is_online" className="text-sm text-gray-700">Tukio ni la mtandaoni</label>
          </div>

          {form.is_online && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kiungo cha Mtandaoni</label>
              <input type="url" name="meeting_link" value={form.meeting_link} onChange={handleChange}
                placeholder="https://zoom.us/..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm" />
            </div>
          )}

          {/* Organizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mratibu</label>
              <input type="text" name="organizer" value={form.organizer} onChange={handleChange}
                placeholder="Jina la mratibu"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Simu ya Mratibu</label>
              <input type="tel" name="organizer_contact" value={form.organizer_contact} onChange={handleChange}
                placeholder="+255..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Barua Pepe ya Mratibu</label>
            <input type="email" name="organizer_email" value={form.organizer_email} onChange={handleChange}
              placeholder="email@example.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Idadi ya Juu ya Washiriki</label>
            <input type="number" name="max_attendees" value={form.max_attendees} onChange={handleChange}
              min={0} placeholder="Mfano: 100"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm" />
          </div>

          {/* ===== FILE UPLOADS ===== */}
          <div className="border-t border-gray-100 pt-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-4 bg-church-500 rounded-full" />
              Faili za Tukio
            </h3>
            <p className="text-xs text-gray-500">
              Pakia picha, video, au audio — kwa matukio yaliyopita kama kwaya zilizoimba
            </p>

            {/* Image */}
            <FileUploadField
              label="Picha ya Tukio"
              icon={FaImage}
              accept=".jpg,.jpeg,.png,.webp,.gif"
              field="image_url"
              value={form.image_url}
              uploading={uploading === "image_url"}
              onChange={(e) => handleFileUpload(e, "image_url", "image")}
              onClear={() => clearFile("image_url")}
              hint="JPG, PNG, WEBP, GIF • Hadi 10 MB"
            />

            {/* Video */}
            <FileUploadField
              label="Video (Kwa Matukio Yaliyopita)"
              icon={FaVideo}
              accept=".mp4,.mov,.avi,.mkv,.webm"
              field="video_url"
              value={form.video_url}
              uploading={uploading === "video_url"}
              onChange={(e) => handleFileUpload(e, "video_url", "video")}
              onClear={() => clearFile("video_url")}
              hint="MP4, MOV, AVI, MKV, WEBM • Hadi 500 MB"
            />

            {/* Audio */}
            <FileUploadField
              label="Audio (Kwaya, Mahubiri, n.k.)"
              icon={FaMusic}
              accept=".mp3,.wav,.m4a,.ogg,.aac"
              field="audio_url"
              value={form.audio_url}
              uploading={uploading === "audio_url"}
              onChange={(e) => handleFileUpload(e, "audio_url", "audio")}
              onClear={() => clearFile("audio_url")}
              hint="MP3, WAV, M4A, OGG, AAC • Hadi 50 MB"
            />

            {/* PDF */}
            <FileUploadField
              label="PDF (Programu, n.k.)"
              icon={FaFilePdf}
              accept=".pdf"
              field="pdf_url"
              value={form.pdf_url}
              uploading={uploading === "pdf_url"}
              onChange={(e) => handleFileUpload(e, "pdf_url", "pdf")}
              onClear={() => clearFile("pdf_url")}
              hint="PDF • Hadi 20 MB"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button type="submit" disabled={saving || !!uploading}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-church-500 hover:bg-church-600 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-xl transition-colors font-medium text-sm shadow-sm">
              {saving ? <><FaSpinner className="animate-spin" /> Inahifadhi...</> : <><FaSave /> Hifadhi Tukio</>}
            </button>
            <Link href="/admin/events" className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium text-sm text-center">
              Ghairi
            </Link>
          </div>
        </form>
      </AnimatedSection>
    </div>
  );
}

// ============================================
// 🧩 FILE UPLOAD FIELD COMPONENT
// ============================================
function FileUploadField({
  label, icon: Icon, accept, field, value, uploading, onChange, onClear, hint,
}: {
  label: string;
  icon: any;
  accept: string;
  field: string;
  value: string;
  uploading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  hint: string;
}) {
  const getFullUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:8000${url}`;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Icon className="inline mr-1.5 text-church-500" /> {label}
      </label>
      {value ? (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <FaCheckCircle className="text-emerald-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald-800">Faili imepakiwa</p>
            <a href={getFullUrl(value)} target="_blank" rel="noopener noreferrer"
              className="text-xs text-emerald-600 hover:underline truncate block">
              {value}
            </a>
          </div>
          <button type="button" onClick={onClear}
            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors">
            <FaTimes />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input type="file" accept={accept} onChange={onChange} disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            id={`file-${field}`} />
          <label htmlFor={`file-${field}`}
            className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors ${
              uploading ? "border-church-400 bg-church-50 cursor-wait" : "border-gray-300 hover:border-church-400 hover:bg-church-50"
            }`}>
            {uploading ? <FaSpinner className="animate-spin text-church-500 text-xl" /> : <FaUpload className="text-church-500 text-xl" />}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">
                {uploading ? "Inapakia..." : "Bonyeza kuchagua faili"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{hint}</p>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}