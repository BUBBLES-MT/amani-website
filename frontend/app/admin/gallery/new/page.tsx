// frontend/app/admin/gallery/new/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { galleryApi, uploadApi, eventsApi } from "@/lib/api";
import {
  FaArrowLeft, FaSave, FaSpinner, FaExclamationTriangle,
  FaUpload, FaTimes, FaCheckCircle, FaImage,
} from "react-icons/fa";

const CATEGORIES = ["Ibada", "Matukio", "Vikundi", "Huduma", "Nyingine"];

export default function NewGalleryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: CATEGORIES[0],
    image_url: "",
    tags: "",
    is_featured: false,
    is_published: true,
    event_id: "",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventsApi.list({ limit: 100 });
        setEvents(Array.isArray(data) ? data : []);
      } catch {}
    };
    fetchEvents();
  }, []);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const result = await uploadApi.image(file);
      setForm((f) => ({ ...f, image_url: result.url }));
    } catch (err: any) {
      setError(err.message || "Imeshindwa kupakia picha");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) return setError("Weka kichwa cha picha");
    if (!form.image_url) return setError("Pakia picha kwanza");

    setSaving(true);
    try {
      await galleryApi.create({
        title: form.title.trim(),
        description: form.description || undefined,
        category: form.category,
        image_url: form.image_url,
        tags: form.tags || undefined,
        is_featured: form.is_featured,
        is_published: form.is_published,
        event_id: form.event_id || undefined,
      } as any);
      router.push("/admin/gallery");
    } catch (err: any) {
      console.error("Create gallery error:", err);
      setError(err.message || "Imeshindwa kuhifadhi picha");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/admin/gallery" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <FaArrowLeft className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pakia Picha</h1>
          <p className="text-gray-500 text-sm mt-0.5">Ongeza picha kwenye gallery</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaImage className="inline mr-1.5 text-church-500" />
            Picha <span className="text-red-500">*</span>
          </label>

          {form.image_url ? (
            <div className="relative">
              <img
                src={form.image_url.startsWith("http") ? form.image_url : `http://localhost:8000${form.image_url}`}
                alt="Preview"
                className="w-full h-64 object-cover rounded-xl border border-gray-200"
              />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, image_url: "" }))}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <FaTimes />
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif"
                onChange={handleImageUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                id="gallery-image-upload"
              />
              <label
                htmlFor="gallery-image-upload"
                className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-12 cursor-pointer transition-colors ${
                  uploading
                    ? "border-church-400 bg-church-50 cursor-wait"
                    : "border-gray-300 hover:border-church-400 hover:bg-church-50"
                }`}
              >
                {uploading ? (
                  <FaSpinner className="animate-spin text-church-500 text-3xl" />
                ) : (
                  <FaUpload className="text-church-500 text-3xl" />
                )}
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">
                    {uploading ? "Inapakia..." : "Bonyeza kuchagua picha"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, WEBP, GIF • Hadi 10 MB
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kichwa <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Mfano: Ibada ya Jumapili"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maelezo
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={2}
            placeholder="Maelezo ya picha..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategoria <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tukio (hiari)
            </label>
            <select
              name="event_id"
              value={form.event_id}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm bg-white"
            >
              <option value="">Hakuna</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (zitenganishe kwa koma)
          </label>
          <input
            type="text"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="Mfano: ibada, vijana, kanisa"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="is_featured"
            checked={form.is_featured}
            onChange={handleChange}
            id="is_featured"
            className="w-4 h-4 text-church-500 rounded focus:ring-church-400"
          />
          <label htmlFor="is_featured" className="text-sm text-gray-700">
            Weka kama featured
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="is_published"
            checked={form.is_published}
            onChange={handleChange}
            id="is_published"
            className="w-4 h-4 text-church-500 rounded focus:ring-church-400"
          />
          <label htmlFor="is_published" className="text-sm text-gray-700">
            Chapisha picha (inaonekana kwa wote)
          </label>
        </div>

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-church-500 hover:bg-church-600 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-xl transition-colors font-medium text-sm shadow-sm"
          >
            {saving ? (
              <><FaSpinner className="animate-spin" /> Inahifadhi...</>
            ) : (
              <><FaSave /> Hifadhi Picha</>
            )}
          </button>
          <Link
            href="/admin/gallery"
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium text-sm text-center"
          >
            Ghairi
          </Link>
        </div>
      </form>
    </div>
  );
}