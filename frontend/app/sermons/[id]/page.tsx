// frontend/app/(public)/sermons/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { publicApi, sermonActionsApi, Sermon } from "@/lib/api";
import {
  FaArrowLeft, FaSpinner, FaExclamationTriangle,
  FaPlay, FaDownload, FaCalendar, FaUser, FaClock,
  FaBook, FaFilePdf, FaMusic, FaVideo, FaEye, FaShare,
  FaHeart,
} from "react-icons/fa";
import AnimatedSection from "@/components/ui/AnimatedSection";
import AnimatedStagger from "@/components/ui/AnimatedStagger";

export default function SermonDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [allSermons, setAllSermons] = useState<Sermon[]>([]);
  const [isLiked, setIsLiked] = useState(false);

  // ✅ LOCAL COUNTERS — zinaongezeka papo hapo
  const [localViews, setLocalViews] = useState(0);
  const [localDownloads, setLocalDownloads] = useState(0);
  const [localLikes, setLocalLikes] = useState(0);

  // ============================================
  // 📥 FETCH — tumia publicApi.sermon(id) (inaongeza views)
  // ============================================
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        let found: Sermon | null = null;
        try {
          found = await publicApi.sermon(id);
        } catch {
          const data = await publicApi.sermons(50);
          const list = Array.isArray(data) ? data : [];
          found = list.find((s) => s.id === id) || null;
        }

        if (found) {
          setSermon(found);
          setLocalViews(found.views || 0);
          setLocalDownloads(found.downloads || 0);
          setLocalLikes(found.likes || 0);

          try {
            const all = await publicApi.sermons(50);
            setAllSermons(Array.isArray(all) ? all : []);
          } catch {
            setAllSermons([]);
          }
        } else {
          setError("Mahubiri haipatikani");
        }
      } catch (err: any) {
        console.error("❌ Fetch sermon error:", err);
        setError(err.message || "Imeshindwa kupata mahubiri");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ============================================
  // 🎨 FORMAT
  // ============================================
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("sw-TZ", {
        weekday: "short",
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
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const getFullUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:8000${url}`;
  };

  // ============================================
  // 📥 DOWNLOAD HANDLER — inaongeza downloads
  // ============================================
  const handleDownload = async (url: string) => {
    try {
      const res = await sermonActionsApi.incrementDownload(id);
      setLocalDownloads(res.downloads);

      const link = document.createElement("a");
      link.href = getFullUrl(url);
      link.download = "";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
      window.open(getFullUrl(url), "_blank");
    }
  };

  // ============================================
  // ❤️ LIKE HANDLER — inaongeza likes
  // ============================================
  const handleLike = async () => {
    if (isLiked) return;

    setIsLiked(true);
    try {
      const res = await sermonActionsApi.like(id);
      setLocalLikes(res.likes);
    } catch (err) {
      console.error("Like error:", err);
      setIsLiked(false);
      setLocalLikes((prev) => Math.max(0, prev - 1));
    }
  };

  const relatedSermons = allSermons.filter((s) => s.id !== id).slice(0, 3);

  // ============================================
  // ⏳ LOADING
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl md:text-5xl text-church-500 mx-auto" />
          <p className="text-gray-500 mt-4 text-sm md:text-base">
            Inapakia mahubiri...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // ❌ ERROR
  // ============================================
  if (error || !sermon) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
        <Link
          href="/sermons"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-church-600 mb-4 md:mb-6 text-sm"
        >
          <FaArrowLeft /> Rudi kwenye Mahubiri
        </Link>
        <div className="p-4 md:p-6 bg-red-50 border-l-4 border-red-500 rounded-xl">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800 text-sm md:text-base">
                Imeshindwa kupata mahubiri
              </p>
              <p className="text-xs md:text-sm text-red-700 mt-1">
                {error || "Mahubiri haipatikani"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasAnyMedia = sermon.video_url || sermon.audio_url || sermon.pdf_url;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-6 lg:py-8 max-w-7xl">
        {/* ===== BACK LINK ===== */}
        <AnimatedSection>
          <Link
            href="/sermons"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-church-600 mb-4 md:mb-6 transition-colors text-sm"
          >
            <FaArrowLeft /> Rudi kwenye Mahubiri
          </Link>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* ============================================ */}
          {/* MAIN CONTENT */}
          {/* ============================================ */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* ===== HERO ===== */}
            <AnimatedSection>
              <div className="bg-gradient-to-br from-church-600 via-church-700 to-church-900 rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 text-white shadow-xl md:shadow-2xl">
                <div className="flex items-center gap-2 text-xs md:text-sm opacity-90 mb-2 md:mb-3 flex-wrap">
                  <FaCalendar className="text-[10px] md:text-xs" />
                  <span>{formatDate(sermon.date)}</span>
                  {sermon.duration && (
                    <>
                      <span className="w-px h-3 bg-white/40"></span>
                      <FaClock className="text-[10px] md:text-xs" />
                      <span>{formatDuration(sermon.duration)}</span>
                    </>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-bold leading-tight mb-2 md:mb-3">
                  {sermon.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm opacity-90">
                  <span className="inline-flex items-center gap-1.5 md:gap-2">
                    <FaUser className="text-[10px] md:text-xs" />
                    {sermon.preacher}
                  </span>
                  {sermon.scripture && (
                    <span className="inline-flex items-center gap-1.5 md:gap-2">
                      📖 {sermon.scripture}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 md:gap-2">
                    <FaEye className="text-[10px] md:text-xs" /> {localViews} views
                  </span>
                </div>

                {sermon.description && (
                  <p className="mt-3 md:mt-4 text-white/90 leading-relaxed text-xs md:text-sm">
                    {sermon.description}
                  </p>
                )}
              </div>
            </AnimatedSection>

            {/* ===== VIDEO ===== */}
            {sermon.video_url && (
              <AnimatedSection>
                <div className="flex justify-center">
                  <div className="w-full max-w-sm sm:max-w-md lg:max-w-2xl bg-black rounded-2xl overflow-hidden shadow-xl">
                    <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gray-900 text-white text-xs">
                      <FaVideo className="text-rose-400 text-[10px] md:text-xs" />
                      <span className="font-medium">Video</span>
                    </div>
                    <div className="relative bg-black">
                      <video
                        controls
                        className="w-full h-auto max-h-[50vh] md:max-h-[60vh] lg:max-h-[70vh]"
                        preload="metadata"
                        playsInline
                      >
                        <source src={getFullUrl(sermon.video_url)} type="video/mp4" />
                        Kivinjari chako hakiwezi kuonyesha video hii.
                      </video>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            )}

            {/* ===== AUDIO ===== */}
            {sermon.audio_url && (
              <AnimatedSection>
                <div className="flex justify-center">
                  <div className="w-full max-w-sm sm:max-w-md bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-3 md:p-4 lg:p-5 shadow-lg border border-purple-200">
                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-500 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                        <FaMusic className="text-white text-sm md:text-lg" />
                      </div>
                      <div>
                        <p className="font-semibold text-purple-900 text-xs md:text-sm">Audio</p>
                        <p className="text-[10px] md:text-xs text-purple-600">
                          Sikiliza mahubiri haya
                        </p>
                      </div>
                    </div>
                    <audio
                      controls
                      className="w-full"
                      preload="metadata"
                      src={getFullUrl(sermon.audio_url)}
                    >
                      Kivinjari chako hakiwezi kuonyesha audio hii.
                    </audio>
                    <button
                      onClick={() => handleDownload(sermon.audio_url!)}
                      className="inline-flex items-center gap-1.5 md:gap-2 mt-2 md:mt-3 text-[10px] md:text-xs text-purple-700 hover:text-purple-900 font-medium"
                    >
                      <FaDownload className="text-[10px] md:text-xs" /> Pakua Audio
                    </button>
                  </div>
                </div>
              </AnimatedSection>
            )}

            {/* ===== PDF ===== */}
            {sermon.pdf_url && (
              <AnimatedSection>
                <div className="flex justify-center">
                  <div className="w-full max-w-sm sm:max-w-md bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-3 md:p-4 lg:p-5 shadow-lg border border-red-200">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                          <FaFilePdf className="text-white text-sm md:text-lg" />
                        </div>
                        <div>
                          <p className="font-semibold text-red-900 text-xs md:text-sm">PDF</p>
                          <p className="text-[10px] md:text-xs text-red-600">
                            Pakua mahubiri kwa PDF
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(sermon.pdf_url!)}
                        className="inline-flex items-center gap-1.5 md:gap-2 bg-red-500 hover:bg-red-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-medium transition-colors"
                      >
                        <FaDownload className="text-[10px] md:text-xs" /> Pakua
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            )}

            {!hasAnyMedia && (
              <AnimatedSection>
                <div className="bg-gray-50 rounded-2xl p-6 md:p-8 text-center text-gray-500 border border-gray-200">
                  <FaPlay className="text-4xl md:text-5xl text-gray-300 mx-auto mb-3" />
                  <p className="font-medium text-sm md:text-base">
                    Hakuna media iliyopakiwa
                  </p>
                  <p className="text-xs md:text-sm mt-1">
                    Mahubiri haya hayana video, audio, au PDF bado
                  </p>
                </div>
              </AnimatedSection>
            )}

            {/* ===== CONTENT ===== */}
            {sermon.content && (
              <AnimatedSection>
                <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 lg:p-8 border border-gray-100">
                  <h2 className="text-base md:text-lg lg:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                    <FaBook className="text-church-500 text-sm md:text-base" /> Maudhui ya Mahubiri
                  </h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-xs md:text-sm lg:text-base">
                    {sermon.content}
                  </div>
                </div>
              </AnimatedSection>
            )}

            {/* ===== ACTIONS ===== */}
            <AnimatedSection>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {sermon.audio_url && (
                  <button
                    onClick={() => handleDownload(sermon.audio_url!)}
                    className="inline-flex items-center gap-1.5 md:gap-2 bg-church-500 hover:bg-church-600 text-white px-3 md:px-4 lg:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl font-medium transition-colors text-xs md:text-sm"
                  >
                    <FaDownload className="text-[10px] md:text-xs" /> Audio
                  </button>
                )}
                {sermon.video_url && (
                  <button
                    onClick={() => handleDownload(sermon.video_url!)}
                    className="inline-flex items-center gap-1.5 md:gap-2 border border-church-500 text-church-600 hover:bg-church-50 px-3 md:px-4 lg:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl font-medium transition-colors text-xs md:text-sm"
                  >
                    <FaDownload className="text-[10px] md:text-xs" /> Video
                  </button>
                )}
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: sermon.title,
                        text: sermon.description || "",
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link imenakiliwa!");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 md:gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 md:px-4 lg:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl font-medium transition-colors text-xs md:text-sm"
                >
                  <FaShare className="text-[10px] md:text-xs" /> Shiriki
                </button>
                <button
                  onClick={handleLike}
                  disabled={isLiked}
                  className={`inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 lg:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl font-medium transition-colors text-xs md:text-sm ${
                    isLiked
                      ? "bg-red-50 text-red-500 cursor-not-allowed"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  <FaHeart className="text-[10px] md:text-xs" /> {isLiked ? "Umependa" : "Penda"}
                </button>
              </div>
            </AnimatedSection>
          </div>

          {/* ============================================ */}
          {/* SIDEBAR */}
          {/* ============================================ */}
          <div className="space-y-4 md:space-y-6">
            {/* ===== STATS ===== */}
            <AnimatedSection delay={0.1}>
              <div className="bg-gradient-to-br from-church-50 to-blue-50 rounded-2xl p-4 md:p-5 lg:p-6">
                <h3 className="font-serif font-bold text-gray-800 text-sm md:text-base lg:text-lg mb-3 md:mb-4">
                  Takwimu
                </h3>
                <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <FaEye className="text-church-500 text-[10px] md:text-xs" /> Marudio
                    </span>
                    <span className="font-bold text-gray-800">{localViews}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <FaDownload className="text-church-500 text-[10px] md:text-xs" /> Kupakuliwa
                    </span>
                    <span className="font-bold text-gray-800">{localDownloads}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <FaHeart className="text-church-500 text-[10px] md:text-xs" /> Kupendwa
                    </span>
                    <span className="font-bold text-gray-800">{localLikes}</span>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* ===== RELATED ===== */}
            {relatedSermons.length > 0 && (
              <AnimatedSection>
                <div className="bg-white rounded-2xl shadow-lg p-4 md:p-5 lg:p-6">
                  <h3 className="font-serif font-bold text-gray-800 text-sm md:text-base lg:text-lg mb-3 md:mb-4">
                    Mahubiri Mengine
                  </h3>
                  <AnimatedStagger className="space-y-2 md:space-y-3">
                    {relatedSermons.map((s) => (
                      <Link
                        key={s.id}
                        href={`/sermons/${s.id}`}
                        className="flex items-center gap-2 md:gap-3 p-2 md:p-2.5 rounded-lg md:rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-church-100 rounded-lg md:rounded-xl flex items-center justify-center text-sm md:text-lg flex-shrink-0">
                          🎙️
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] md:text-xs font-medium text-gray-800 group-hover:text-church-600 transition-colors truncate">
                            {s.title}
                          </p>
                          <p className="text-[9px] md:text-[10px] text-gray-400 truncate">
                            {s.preacher}
                          </p>
                        </div>
                        <FaPlay className="text-church-500 text-[10px] md:text-xs flex-shrink-0" />
                      </Link>
                    ))}
                  </AnimatedStagger>
                </div>
              </AnimatedSection>
            )}

            {/* ===== CTA ===== */}
            <AnimatedSection>
              <div className="bg-gradient-to-r from-church-500 to-church-700 rounded-2xl p-4 md:p-5 lg:p-6 text-center text-white">
                <h3 className="text-sm md:text-base lg:text-lg font-bold mb-1.5 md:mb-2">
                  Umebarikiwa?
                </h3>
                <p className="text-[10px] md:text-xs text-white/90 mb-3 md:mb-4">
                  Shiriki neno hili na wapendwa wako
                </p>
                <Link
                  href="/donations"
                  className="inline-flex items-center gap-1.5 md:gap-2 bg-white text-church-700 px-3 md:px-4 lg:px-5 py-1.5 md:py-2 rounded-lg md:rounded-xl font-medium hover:bg-gray-100 transition-colors text-[10px] md:text-xs lg:text-sm"
                >
                  ❤️ Changia
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  );
}