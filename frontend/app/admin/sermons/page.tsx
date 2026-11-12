// frontend/app/admin/sermons/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sermonsApi, Sermon, tokenStorage, userStorage } from "@/lib/api";
import {
  FaPlus, FaEdit, FaTrash, FaEye, FaSpinner,
  FaExclamationTriangle, FaBook, FaSearch,
  FaMusic, FaVideo, FaFilePdf, FaImage,
} from "react-icons/fa";

// ============================================================
// ✅ ROLES ZINAZORUHUSIWA KUSIMAMIA MAHUBIRI
// ============================================================
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

export default function AdminSermonsPage() {
  const router = useRouter();
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // ============================================================
  // 🔐 AUTH CHECK
  // ============================================================
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
    fetchSermons();
  }, [router]);

  // ============================================================
  // 🔥 FETCH SERMONS
  // ============================================================
  const fetchSermons = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await sermonsApi.list({ limit: 100 });
      setSermons(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("❌ Sermons fetch error:", err);
      setError(err.message || "Imeshindwa kupata mahubiri");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 🗑️ DELETE SERMON
  // ============================================================
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Una uhakika unataka kufuta "${title}"?`)) return;

    setDeleting(id);
    try {
      await sermonsApi.delete(id);
      setSermons(sermons.filter((s) => s.id !== id));
    } catch (err: any) {
      setError(err.message || "Imeshindwa kufuta mahubiri");
    } finally {
      setDeleting(null);
    }
  };

  // ============================================================
  // 🎯 FILTER
  // ============================================================
  const filteredSermons = sermons.filter(
    (s) =>
      s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.preacher?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("sw-TZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // ============================================================
  // 🎨 STATUS BADGE
  // ============================================================
  const statusBadge = (status: string | undefined) => {
    const s = (status || "").toLowerCase();
    const config: Record<string, { label: string; bg: string; text: string }> = {
      published: { label: "Imechapishwa", bg: "bg-emerald-100", text: "text-emerald-700" },
      imechapishwa: { label: "Imechapishwa", bg: "bg-emerald-100", text: "text-emerald-700" },
      draft: { label: "Rasimu", bg: "bg-amber-100", text: "text-amber-700" },
      rasimu: { label: "Rasimu", bg: "bg-amber-100", text: "text-amber-700" },
      archived: { label: "Kumbukumbu", bg: "bg-gray-100", text: "text-gray-700" },
      imewekwa_kwenye_kumbukumbu: { label: "Kumbukumbu", bg: "bg-gray-100", text: "text-gray-700" },
    };
    const c = config[s] || { label: status || "—", bg: "bg-gray-100", text: "text-gray-700" };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  // ============================================================
  // 🎨 FILE INDICATORS
  // ============================================================
  const fileIndicators = (sermon: Sermon) => {
    const files: { icon: any; color: string; label: string }[] = [];
    if (sermon.audio_url) files.push({ icon: FaMusic, color: "text-purple-600 bg-purple-50", label: "Audio" });
    if (sermon.video_url) files.push({ icon: FaVideo, color: "text-rose-600 bg-rose-50", label: "Video" });
    if (sermon.pdf_url) files.push({ icon: FaFilePdf, color: "text-red-600 bg-red-50", label: "PDF" });
    if (sermon.thumbnail_url) files.push({ icon: FaImage, color: "text-blue-600 bg-blue-50", label: "Picha" });

    if (files.length === 0) {
      return <span className="text-xs text-gray-400">Hakuna</span>;
    }

    return (
      <div className="flex items-center gap-1.5">
        {files.map((f, i) => (
          <span
            key={i}
            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${f.color}`}
            title={f.label}
          >
            <f.icon className="text-xs" />
          </span>
        ))}
      </div>
    );
  };

  // ============================================================
  // ⏳ LOADING — kabla auth check haijakamilika
  // ============================================================
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

  // ============================================================
  // 🎨 RENDER
  // ============================================================
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mahubiri</h1>
          <p className="text-gray-500 text-sm mt-1">
            Simamia mahubiri yote ya kanisa
          </p>
        </div>
        <Link
          href="/admin/sermons/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-church-500 to-church-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <FaPlus /> Ongeza Mahubiri
        </Link>
      </div>

      {/* ERROR */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* SEARCH */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tafuta kwa kichwa au mchungaji..."
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-church-500 focus:outline-none focus:ring-2 focus:ring-church-500/20"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto" />
            <p className="text-gray-500 mt-3">Inapakia mahubiri...</p>
          </div>
        ) : filteredSermons.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-lg">Hakuna mahubiri bado</p>
            <p className="text-sm mt-2">
              Bonyeza "Ongeza Mahubiri" kuanza
            </p>
            <Link
              href="/admin/sermons/new"
              className="inline-flex items-center gap-2 mt-4 bg-church-500 text-white px-5 py-2 rounded-xl hover:bg-church-600 transition-colors"
            >
              <FaPlus /> Ongeza Mahubiri ya Kwanza
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Kichwa
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Mchungaji
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Tarehe
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Faili
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Hali
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Vitendo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSermons.map((sermon) => (
                  <tr key={sermon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-church-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                          🎙️
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {sermon.title}
                          </p>
                          {sermon.scripture && (
                            <p className="text-xs text-gray-500 truncate">
                              📖 {sermon.scripture}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {sermon.preacher}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(sermon.date)}
                    </td>
                    <td className="px-6 py-4">
                      {fileIndicators(sermon)}
                    </td>
                    <td className="px-6 py-4">
                      {statusBadge(sermon.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/sermons/${sermon.id}`}
                          target="_blank"
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Tazama"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          href={`/admin/sermons/${sermon.id}/edit`}
                          className="p-2 text-gray-500 hover:text-church-600 hover:bg-church-50 rounded-lg transition-colors"
                          title="Hariri"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(sermon.id, sermon.title)}
                          disabled={deleting === sermon.id}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Futa"
                        >
                          {deleting === sermon.id ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <FaTrash />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}