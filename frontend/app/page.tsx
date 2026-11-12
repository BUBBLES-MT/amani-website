// frontend/app/(public)/page.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  publicApi,
  visitorsApi,
  Event,
  Sermon,
  VisitorStats,
} from "@/lib/api";
import {
  FaChurch,
  FaHands,
  FaHeart,
  FaPray,
  FaArrowRight,
  FaCalendar,
  FaVideo,
  FaUser,
  FaClock,
  FaSpinner,
  FaExclamationTriangle,
  FaLock,
  FaPlay,
  FaEye,
  FaUsers,
} from "react-icons/fa";
import { BiChevronRight } from "react-icons/bi";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    total_members: 0,
    total_events: 0,
    total_sermons: 0,
  });
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({
    total_visitors: 0,
    total_views: 0,
    unique_visitors_today: 0,
    unique_visitors_week: 0,
    unique_visitors_month: 0,
    total_members: 0,
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [sermons, setSermons] = useState<Sermon[]>([]);

  // ✅ Kuzuia track kuitwa mara mbili (React StrictMode)
  const trackedRef = useRef(false);

  // ============================================================
  // 🔥 FETCH PUBLIC DATA + TRACK VISIT
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [statsData, eventsData, sermonsData, visitorData] =
          await Promise.all([
            publicApi.stats().catch(() => null),
            publicApi.events(3).catch(() => []),
            publicApi.sermons(3).catch(() => []),
            visitorsApi.stats().catch(() => null),
          ]);

        if (statsData) {
          setStats({
            total_members: statsData.total_members || 0,
            total_events: statsData.total_events || 0,
            total_sermons: statsData.total_sermons || 0,
          });
        }

        if (visitorData) {
          setVisitorStats({
            total_visitors: visitorData.total_visitors || 0,
            total_views: visitorData.total_views || 0,
            unique_visitors_today: visitorData.unique_visitors_today || 0,
            unique_visitors_week: visitorData.unique_visitors_week || 0,
            unique_visitors_month: visitorData.unique_visitors_month || 0,
            total_members: visitorData.total_members || 0,
          });
        }

        setEvents(Array.isArray(eventsData) ? eventsData : []);
        setSermons(Array.isArray(sermonsData) ? sermonsData : []);
      } catch (err: any) {
        console.error("❌ Homepage fetch error:", err);
        setError(err.message || "Imeshindwa kupata data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // ✅ Rekodi tembeleo (mara moja tu)
    if (!trackedRef.current) {
      trackedRef.current = true;
      visitorsApi
        .track({
          page: "Homepage",
          path: "/",
        })
        .catch((err) => {
          // Kimya kimya — usivunje homepage kama track inashindikana
          console.warn("⚠️ Visitor track failed:", err);
        });
    }
  }, []);

  // ============================================================
  // 📊 QUICK STATS (na Visitor Counter)
  // ============================================================
  const quickStats = [
    {
      icon: FaUsers,
      value:
        visitorStats.total_visitors > 0
          ? visitorStats.total_visitors.toLocaleString()
          : "0",
      label: "Watembeleaji",
      color: "text-church-500",
    },
    {
      icon: FaChurch,
      value: stats.total_events > 0 ? stats.total_events : "0",
      label: "Matukio",
      color: "text-gold-500",
    },
    {
      icon: FaEye,
      value:
        visitorStats.total_views > 0
          ? visitorStats.total_views.toLocaleString()
          : "0",
      label: "Kurasa Zilizotazamwa",
      color: "text-green-500",
    },
    {
      icon: FaHeart,
      value:
        visitorStats.unique_visitors_today > 0
          ? visitorStats.unique_visitors_today.toString()
          : "0",
      label: "Watembeleaji Leo",
      color: "text-red-500",
    },
  ];

  // ============================================================
  // 🎨 MINISTRIES (Static)
  // ============================================================
  const ministries = [
    { name: "Waimbaji", description: "Timu ya waimbaji wa kanisa", icon: "🎵" },
    { name: "Wahudumu", description: "Timu ya wahudumu wa kanisa", icon: "🤲" },
    { name: "Vijana", description: "Timu ya vijana wa kanisa", icon: "🌟" },
    { name: "Wanawake", description: "Timu ya wanawake wa kanisa", icon: "👩" },
  ];

  // ============================================================
  // 🔧 HELPERS
  // ============================================================
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("sw-TZ", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      });
    } catch {
      return dateStr;
    }
  };

  const getFullUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:8000${url}`;
  };

  // ============================================================
  // 🎨 RENDER
  // ============================================================
  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-church-600 via-church-700 to-church-900 text-white p-8 md:p-16 mb-10 md:mb-16 shadow-2xl">
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 text-sm font-medium">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            KKKT Church, Usharika wa Amani Singida - Karibu Nyumbani
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-4">
            Karibu Kanisani
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl opacity-90 mb-6 max-w-2xl leading-relaxed">
            Mungu ni mwema, na upendo Wake unadumu milele.
            <span className="block text-gold-300 font-semibold mt-1">
              Pamoja tunakua katika imani
            </span>
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/about"
              className="btn-secondary inline-flex items-center gap-2 text-base px-6 py-3 rounded-xl shadow-lg hover:shadow-xl"
            >
              <FaChurch /> Jifunze Zaidi
              <BiChevronRight className="text-xl" />
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white/80 text-white hover:bg-white hover:text-church-700 px-6 py-3 rounded-xl transition-all duration-300 inline-flex items-center gap-2 text-base backdrop-blur-sm hover:shadow-xl"
            >
              <FaHeart /> Wasiliana Nasi
            </Link>
            {/* ✅ FIX: /login → /admin/login */}
            <Link
              href="/admin/login"
              className="bg-gradient-to-r from-gold-500 to-gold-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2 text-base font-bold"
            >
              <FaLock /> Ingia Kama Kiongozi
            </Link>
          </div>
        </div>

        <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 opacity-10 text-[12rem] md:text-[18rem] select-none">
          ✝️
        </div>
      </section>

      {/* ===== ERROR ===== */}
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

      {/* ===== QUICK STATS ===== */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10 md:mb-16">
        {quickStats.map((stat, i) => (
          <div
            key={i}
            className="card p-6 text-center hover:scale-105 transition-all duration-300"
          >
            <stat.icon
              className={`text-4xl md:text-5xl ${stat.color} mx-auto mb-3`}
            />
            <h4 className="text-2xl md:text-3xl font-bold text-gray-800">
              {loading ? (
                <FaSpinner className="animate-spin inline text-church-500" />
              ) : (
                stat.value
              )}
            </h4>
            <p className="text-sm md:text-base text-gray-500 font-medium">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      {/* ===== UPCOMING EVENTS ===== */}
      <section className="mb-10 md:mb-16">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="section-title">Matukio Yajayo</h2>
          <p className="section-subtitle">
            Jiunge nasi katika ibada na matukio mbalimbali ya Amani Luthelani Church
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto" />
            <p className="text-gray-500 mt-3">Inapakia matukio...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaCalendar className="text-5xl text-gray-300 mx-auto mb-3" />
            <p>Hakuna matukio yaliyopangwa bado</p>
            <Link
              href="/events"
              className="text-church-600 text-sm underline hover:text-church-800 mt-2 inline-block"
            >
              Ona matukio yote
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event, i) => (
              <div
                key={event.id || i}
                className="group card card-hover overflow-hidden"
              >
                {event.image_url ? (
                  <div className="relative w-full h-48 overflow-hidden">
                    <img
                      src={getFullUrl(event.image_url)}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold text-gray-800 shadow-sm">
                        {event.category || "Tukio"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-48 bg-gradient-to-br from-church-400 to-church-600 flex items-center justify-center text-5xl text-white">
                    📅
                  </div>
                )}

                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">
                    {event.title}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                    <FaClock className="text-xs" /> {formatDate(event.date)}
                    {event.start_time && ` • ${event.start_time}`}
                  </p>
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                    {event.description || "Karibu ujiunge nasi"}
                  </p>
                  <Link
                    href={`/events/${event.id}`}
                    className="text-church-600 font-semibold hover:text-church-800 transition-colors inline-flex items-center gap-1 group-hover:gap-2 transition-all text-sm"
                  >
                    Soma Zaidi <FaArrowRight className="text-xs" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== LATEST SERMONS ===== */}
      <section className="mb-10 md:mb-16">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="section-title">Mahubiri ya Hivi Karibuni</h2>
          <p className="section-subtitle">
            Sikiliza na ujifunze kutoka kwa neno la Mungu
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto" />
            <p className="text-gray-500 mt-3">Inapakia mahubiri...</p>
          </div>
        ) : sermons.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaVideo className="text-5xl text-gray-300 mx-auto mb-3" />
            <p>Hakuna mahubiri yaliyowekwa bado</p>
            <Link
              href="/sermons"
              className="text-church-600 text-sm underline hover:text-church-800 mt-2 inline-block"
            >
              Ona mahubiri yote
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sermons.map((sermon, i) => (
              <div
                key={sermon.id || i}
                className="group card card-hover overflow-hidden"
              >
                {sermon.thumbnail_url ? (
                  <div className="relative w-full h-40 overflow-hidden">
                    <img
                      src={getFullUrl(sermon.thumbnail_url)}
                      alt={sermon.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                        <FaPlay className="text-church-600 ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-40 bg-gradient-to-br from-church-400 to-church-600 flex items-center justify-center text-5xl text-white">
                    🎙️
                  </div>
                )}

                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-800 group-hover:text-church-700 transition-colors truncate mb-1">
                    {sermon.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <FaUser className="text-xs" />
                    <span className="truncate">{sermon.preacher}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <FaCalendar /> {formatDate(sermon.date)}
                    </span>
                    {sermon.scripture && (
                      <span className="flex items-center gap-1 truncate">
                        📖 {sermon.scripture}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/sermons/${sermon.id}`}
                      className="flex-1 btn-primary text-sm py-2 px-3 text-center"
                    >
                      <FaPlay className="inline mr-1" /> Soma
                    </Link>
                    <Link
                      href={`/sermons/${sermon.id}`}
                      className="flex-1 btn-outline text-sm py-2 px-3 text-center"
                    >
                      Maelezo
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== MINISTRIES ===== */}
      <section>
        <div className="text-center mb-8 md:mb-12">
          <h2 className="section-title">Huduma Zetu</h2>
          <p className="section-subtitle">
            Timu mbalimbali zinazohudumu katika Amani Luthelani Church
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {ministries.map((ministry, i) => (
            <div
              key={i}
              className="card p-6 text-center hover:scale-105 transition-all duration-300 group"
            >
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {ministry.icon}
              </div>
              <h4 className="font-bold text-gray-800">{ministry.name}</h4>
              <p className="text-sm text-gray-500 mt-1">
                {ministry.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}