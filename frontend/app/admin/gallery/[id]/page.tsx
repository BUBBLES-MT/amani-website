// frontend/app/admin/gallery/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { galleryApi } from "@/lib/api";
import {
  FaArrowLeft, FaSpinner, FaExclamationTriangle,
  FaEye, FaDownload, FaStar, FaCalendar, FaUser,
  FaTag, FaImage, FaCheckCircle,
} from "react-icons/fa";
import AnimatedSection from "@/components/ui/AnimatedSection";
import AnimatedStagger from "@/components/ui/AnimatedStagger";

export default function GalleryDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [item, setItem] = useState<any>(null);

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  // ============================================
  // 📥 FETCH
  // ============================================
  useEffect(() => {
    if (!id) return;

    const fetchItem = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await galleryApi.get(id);
        setItem(data);
      } catch (err: any) {
        console.error("❌ Fetch gallery error:", err);
        setError(err.message || "Imeshindwa kupata picha");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  // ============================================
  // 🎨 FORMAT
  // ============================================
  const getFullUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:8000${url}`;
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString("sw-TZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // ============================================
  // 📥 DOWNLOAD — fetch + blob
  // ============================================
  const handleDownload = async () => {
    if (!item) return;

    setDownloading(true);
    setDownloadError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:8000/api/v1/gallery/${id}/download`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) {
        throw new Error(`Download failed: ${res.status}`);
      }

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeTitle = (item.title || "picha").replace(/\s+/g, "_").replace(/\//g, "_");
      const ext = (item.image_url || "").split(".").pop() || "jpg";
      link.download = `${safeTitle}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setItem((prev: any) => ({
        ...prev,
        downloads: (prev.downloads || 0) + 1,
      }));
    } catch (err: any) {
      console.error("Download error:", err);
      setDownloadError(err.message || "Imeshindwa kupakua picha");

      try {
        window.open(getFullUrl(item.image_url), "_blank");
      } catch {}
    } finally {
      setDownloading(false);
    }
  };

  // ============================================
  // ⏳ LOADING
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto" />
          <p className="text-gray-500 mt-3">Inapakia picha...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ❌ ERROR
  // ============================================
  if (error || !item) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Link
          href="/admin/gallery"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
        >
          <FaArrowLeft /> Rudi kwenye gallery
        </Link>
        <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-xl">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-red-500 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Imeshindwa kupata picha</p>
              <p className="text-sm text-red-700 mt-1">{error || "Picha haipatikani"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* ===== HEADER ===== */}
      <AnimatedSection>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/gallery"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">Maelezo ya Picha</h1>
            <p className="text-gray-500 text-sm mt-0.5">Taarifa kamili za picha</p>
          </div>
          {item.is_featured && (
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-xl text-sm font-semibold">
              <FaStar /> Featured
            </span>
          )}
          {!item.is_published && (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1.5 rounded-xl text-sm font-semibold">
              Rasimu
            </span>
          )}
        </div>
      </AnimatedSection>

      {/* ===== DOWNLOAD ERROR ===== */}
      {downloadError && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{downloadError}</p>
          <button
            onClick={() => setDownloadError("")}
            className="text-red-400 hover:text-red-600 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* ===== IMAGE ===== */}
      <AnimatedSection delay={0.1}>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <img
            src={getFullUrl(item.image_url)}
            alt={item.title}
            className="w-full h-auto max-h-[70vh] object-contain bg-gray-100"
          />
        </div>
      </AnimatedSection>

      {/* ===== INFO ===== */}
      <AnimatedSection>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-lg text-gray-800">{item.title}</h2>
            {item.description && (
              <p className="text-sm text-gray-600 mt-2">{item.description}</p>
            )}
          </div>
          <AnimatedStagger className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <DetailRow icon={FaImage} label="Kategoria" value={item.category || "—"} />
            <DetailRow icon={FaEye} label="Views" value={String(item.views || 0)} />
            <DetailRow icon={FaDownload} label="Downloads" value={String(item.downloads || 0)} />
            <DetailRow icon={FaUser} label="Aliyeongeza" value={item.created_by_name || "—"} />
            <DetailRow icon={FaCalendar} label="Tarehe" value={formatDateTime(item.created_at)} />
            {item.tags && (
              <DetailRow icon={FaTag} label="Tags" value={item.tags} />
            )}
          </AnimatedStagger>
          {item.event_id && (
            <div className="px-5 pb-5">
              <Link
                href={`/admin/events/${item.event_id}`}
                className="inline-flex items-center gap-2 text-church-600 hover:text-church-800 text-sm font-medium"
              >
                <FaCheckCircle /> Ona tukio linalohusika
              </Link>
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* ===== ACTIONS ===== */}
      <AnimatedSection>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 bg-church-500 hover:bg-church-600 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-colors"
          >
            {downloading ? (
              <>
                <FaSpinner className="animate-spin" /> Inapakua...
              </>
            ) : (
              <>
                <FaDownload /> Pakua Picha
              </>
            )}
          </button>
          <a
            href={getFullUrl(item.image_url)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            <FaEye /> Fungua
          </a>
        </div>
      </AnimatedSection>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-church-50 rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon className="text-church-600 text-sm" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 font-medium uppercase">{label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-1 break-words">{value}</p>
      </div>
    </div>
  );
}