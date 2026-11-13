// frontend/app/admin/gallery/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { galleryApi } from "@/lib/api";
import {
  FaPlus, FaSpinner, FaExclamationTriangle, FaImage,
  FaSearch, FaEye, FaTrash, FaStar,
} from "react-icons/fa";
import AnimatedSection from "@/components/ui/AnimatedSection";
import AnimatedStagger from "@/components/ui/AnimatedStagger";

export default function GalleryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchGallery = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await galleryApi.list({ limit: 100 });
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("❌ Gallery fetch error:", err);
      setError(err.message || "Imeshindwa kupata picha");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Una uhakika unataka kufuta "${title}"?`)) return;
    setDeleting(id);
    try {
      await galleryApi.delete(id);
      setItems(items.filter((i) => i.id !== id));
    } catch (err: any) {
      setError(err.message || "Imeshindwa kufuta picha");
    } finally {
      setDeleting(null);
    }
  };

  const getFullUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:8000${url}`;
  };

  const filtered = items.filter((g) => {
    const matchesSearch =
      !search ||
      (g.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (g.tags || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !filterCategory || g.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = Array.from(
    new Set(items.map((i) => i.category).filter(Boolean))
  );

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <AnimatedSection>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gallery</h1>
            <p className="text-gray-500 text-sm mt-1">Picha zote za kanisa</p>
          </div>
          <Link
            href="/admin/gallery/new"
            className="inline-flex items-center gap-2 bg-church-500 hover:bg-church-600 text-white px-5 py-2.5 rounded-xl transition-colors font-medium text-sm shadow-sm"
          >
            <FaPlus /> Pakia Picha
          </Link>
        </div>
      </AnimatedSection>

      {/* ===== ERROR ===== */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
        </div>
      )}

      {/* ===== SEARCH & FILTER ===== */}
      <AnimatedSection>
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tafuta kwa kichwa au tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm bg-white min-w-[160px]"
            >
              <option value="">Kategoria zote</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-400">
            {filtered.length} kati ya {items.length} picha
          </p>
        </div>
      </AnimatedSection>

      {/* ===== GALLERY GRID ===== */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto" />
          <p className="text-gray-500 mt-3">Inapakia picha...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center text-gray-500">
          <FaImage className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="font-medium">
            {items.length === 0 ? "Hakuna picha bado" : "Hakuna picha inayolingana"}
          </p>
          {items.length === 0 && (
            <Link
              href="/admin/gallery/new"
              className="inline-flex items-center gap-2 mt-5 bg-church-500 text-white px-5 py-2.5 rounded-xl hover:bg-church-600 transition-colors"
            >
              <FaPlus /> Pakia Picha ya Kwanza
            </Link>
          )}
        </div>
      ) : (
        <AnimatedStagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg overflow-hidden transition-all"
            >
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                <img
                  src={getFullUrl(item.thumbnail_url || item.image_url)}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {item.is_featured && (
                  <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                    <FaStar /> Featured
                  </div>
                )}
                {!item.is_published && (
                  <div className="absolute top-2 right-2 bg-gray-900/80 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                    Rasimu
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Link
                    href={`/admin/gallery/${item.id}`}
                    className="p-2 bg-white text-church-600 rounded-lg hover:bg-church-50"
                    title="Ona"
                  >
                    <FaEye />
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    disabled={deleting === item.id}
                    className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                    title="Futa"
                  >
                    {deleting === item.id ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaTrash />
                    )}
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 truncate">{item.category}</p>
              </div>
            </div>
          ))}
        </AnimatedStagger>
      )}
    </div>
  );
}