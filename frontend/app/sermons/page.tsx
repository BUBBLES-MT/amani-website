// frontend/app/(public)/sermons/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { publicApi, Sermon } from "@/lib/api";
import {
  FaPlay, FaDownload, FaCalendar, FaUser, FaClock,
  FaSearch, FaFilter, FaSpinner, FaExclamationTriangle,
} from "react-icons/fa";

export default function SermonsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // 🔥 FETCH SERMONS (Bila Auth)
  // ============================================================
  useEffect(() => {
    const fetchSermons = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await publicApi.sermons(50);
        setSermons(Array.isArray(data) ? data : []);
        console.log("✅ Sermons loaded:", data);
      } catch (err: any) {
        console.error("❌ Sermons fetch error:", err);
        setError(err.message || "Imeshindwa kupata mahubiri");
      } finally {
        setLoading(false);
      }
    };

    fetchSermons();
  }, []);

  // ============================================================
  // 🎯 FILTERS (Kutoka sermons halisi)
  // ============================================================
  const preachers = Array.from(new Set(sermons.map((s) => s.preacher).filter(Boolean)));
  const filters = ["All", ...preachers];

  const filteredSermons = sermons.filter((sermon) => {
    const matchesSearch =
      sermon.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sermon.preacher?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "All" || sermon.preacher === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
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

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-church-600 via-church-700 to-church-900 text-white p-8 md:p-16 mb-12 shadow-2xl">
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 text-sm font-medium">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Mahubiri
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold leading-tight mb-4">
            Mahubiri <span className="text-gold-300">Yetu</span>
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl leading-relaxed">
            Sikiliza na ujifunze kutoka kwa neno la Mungu kupitia mahubiri yetu.
          </p>
        </div>

        <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 opacity-10 text-[12rem] md:text-[18rem] select-none">
          🎙️
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
            >
              Jaribu tena
            </button>
          </div>
        </div>
      )}

      {/* SEARCH & FILTER */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:border-church-500 focus:outline-none focus:ring-2 focus:ring-church-500 transition-all"
            placeholder="Tafuta mahubiri..."
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FaFilter className="text-gray-400 text-lg mt-2 mr-1" />
          {filters.slice(0, 5).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeFilter === filter
                  ? "bg-church-500 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filter === "All" ? "Zote" : filter}
            </button>
          ))}
        </div>
      </div>

      {/* SERMONS GRID */}
      {loading ? (
        <div className="text-center py-16">
          <FaSpinner className="animate-spin text-5xl text-church-500 mx-auto" />
          <p className="text-gray-500 mt-4">Inapakia mahubiri...</p>
        </div>
      ) : filteredSermons.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <FaPlay className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-lg">Hakuna mahubiri yaliyopatikana</p>
          <p className="text-sm mt-2">
            {sermons.length === 0 ? "Bado hakuna mahubiri yaliyowekwa" : "Jaribu kubadilisha utafutaji"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSermons.map((sermon) => (
            <div key={sermon.id} className="card group hover:scale-[1.02] transition-all duration-300">
              {/* Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-church-400 to-church-600 flex items-center justify-center text-6xl text-white relative overflow-hidden">
                🎙️
                <Link
                  href={`/sermons/${sermon.id}`}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                >
                  <FaPlay className="text-4xl text-white" />
                </Link>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <FaCalendar className="text-church-500" />
                  <span>{formatDate(sermon.date)}</span>
                  {sermon.duration && (
                    <>
                      <span className="w-px h-3 bg-gray-300"></span>
                      <FaClock className="text-church-500" />
                      <span>{formatDuration(sermon.duration)}</span>
                    </>
                  )}
                </div>

                <Link href={`/sermons/${sermon.id}`}>
                  <h3 className="text-xl font-serif font-bold text-gray-800 mb-2 group-hover:text-church-600 transition-colors line-clamp-2">
                    {sermon.title}
                  </h3>
                </Link>

                <p className="text-sm text-gray-600 flex items-center gap-2 mb-3">
                  <FaUser className="text-church-500 text-xs" />
                  <span className="font-medium">{sermon.preacher}</span>
                </p>

                {sermon.scripture && (
                  <p className="text-xs text-gray-500 mb-3 truncate">
                    📖 {sermon.scripture}
                  </p>
                )}

                <div className="flex items-center gap-3">
                  <Link
                    href={`/sermons/${sermon.id}`}
                    className="flex-1 btn-primary text-sm py-2 px-3 flex items-center justify-center gap-2"
                  >
                    <FaPlay /> Soma
                  </Link>
                  {sermon.audio_url && (
                    <a
                      href={sermon.audio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 btn-outline text-sm py-2 px-3 flex items-center justify-center gap-2"
                    >
                      <FaDownload /> Pakua
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <section className="mt-12 bg-gradient-to-r from-church-500 to-church-700 rounded-3xl p-8 md:p-12 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">Je, Una Swali?</h2>
        <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
          Wasiliana nasi kwa maswali yoyote kuhusu mahubiri yetu.
        </p>
        <Link href="/contact" className="btn-secondary inline-flex items-center gap-2 text-base px-8 py-3">
          <FaUser /> Wasiliana Nasi
        </Link>
      </section>
    </div>
  );
}