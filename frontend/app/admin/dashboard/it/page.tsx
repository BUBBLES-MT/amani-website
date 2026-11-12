// frontend/app/admin/dashboard/it/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { eventsApi, sermonsApi, galleryApi, userStorage } from "@/lib/api";
import {
  FaCalendar, FaBook, FaImage, FaCog, FaPlus, FaSpinner,
  FaExclamationTriangle, FaCheckCircle, FaEye, FaArrowRight,
} from "react-icons/fa";

export default function ITDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalSermons: 0,
    totalGallery: 0,
  });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [recentSermons, setRecentSermons] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  // ============================================
  // 📥 FETCH
  // ============================================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      setUser(userStorage.get());

      try {
        const [eventsData, sermonsData, galleryData] = await Promise.all([
          eventsApi.list({ limit: 100 }),
          sermonsApi.list({ limit: 100 }),
          galleryApi.list({ limit: 100 }),
        ]);

        const events = Array.isArray(eventsData) ? eventsData : [];
        const sermons = Array.isArray(sermonsData) ? sermonsData : [];
        const gallery = Array.isArray(galleryData) ? galleryData : [];

        setStats({
          totalEvents: events.length,
          totalSermons: sermons.length,
          totalGallery: gallery.length,
        });

        setRecentEvents(events.slice(0, 5));
        setRecentSermons(sermons.slice(0, 5));
      } catch (err: any) {
        console.error("❌ Dashboard fetch error:", err);
        setError(err.message || "Imeshindwa kupata data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("sw-TZ", {
        day: "2-digit", month: "2-digit", year: "numeric",
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

  // ============================================
  // 🎨 STAT CARDS
  // ============================================
  const statCards = [
    {
      label: "Matukio Yote",
      value: stats.totalEvents,
      color: "text-church-500",
      bg: "bg-church-50",
      icon: FaCalendar,
      href: "/admin/events",
    },
    {
      label: "Mahubiri Yote",
      value: stats.totalSermons,
      color: "text-purple-500",
      bg: "bg-purple-50",
      icon: FaBook,
      href: "/admin/sermons",
    },
    {
      label: "Picha Zote",
      value: stats.totalGallery,
      color: "text-rose-500",
      bg: "bg-rose-50",
      icon: FaImage,
      href: "/admin/gallery",
    },
    {
      label: "Mipangilio",
      value: "Simamia",
      color: "text-gray-500",
      bg: "bg-gray-50",
      icon: FaCog,
      href: "/admin/settings",
    },
  ];

  // ============================================
  // 🎯 QUICK ACTIONS
  // ============================================
  const quickActions = [
    {
      label: "Ongeza Tukio",
      description: "Tangaza tukio jipya la kanisa",
      icon: FaCalendar,
      color: "from-church-500 to-church-700",
      href: "/admin/events/new",
    },
    {
      label: "Ongeza Mahubiri",
      description: "Pakia video/audio ya mahubiri",
      icon: FaBook,
      color: "from-purple-500 to-purple-700",
      href: "/admin/sermons/new",
    },
    {
      label: "Pakia Picha",
      description: "Ongeza picha kwenye gallery",
      icon: FaImage,
      color: "from-rose-500 to-rose-700",
      href: "/admin/gallery/new",
    },
    {
      label: "Mipangilio",
      description: "Badilisha taarifa za kanisa",
      icon: FaCog,
      color: "from-gray-500 to-gray-700",
      href: "/admin/settings",
    },
  ];

  // ============================================
  // ⏳ LOADING
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto" />
          <p className="text-gray-500 mt-3">Inapakia data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard ya IT
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Karibu, {user?.name || "IT"}! Simamia matangazo, mahubiri, picha, na mipangilio ya kanisa.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700 flex-1">{error}</p>
        </div>
      )}

      {/* ============================================ */}
      {/* STAT CARDS — Clickable */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Link
            key={i}
            href={stat.href}
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-300 hover:scale-[1.02] group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bg} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                <stat.icon className={`${stat.color} text-xl`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ============================================ */}
      {/* QUICK ACTIONS — Zaidi ya haraka */}
      {/* ============================================ */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">
          Vitendo vya Haraka
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className={`bg-gradient-to-br ${action.color} rounded-2xl shadow-lg p-5 text-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <action.icon className="text-lg" />
                </div>
                <FaArrowRight className="ml-auto opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="font-bold text-sm">{action.label}</p>
              <p className="text-xs opacity-85 mt-0.5">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ============================================ */}
      {/* TWO COLUMNS: RECENT EVENTS + RECENT SERMONS */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ============================================ */}
        {/* RECENT EVENTS */}
        {/* ============================================ */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-base text-gray-800 flex items-center gap-2">
              <FaCalendar className="text-church-500" />
              Matukio ya Hivi Karibuni
            </h3>
            <Link
              href="/admin/events"
              className="text-church-600 text-xs hover:text-church-800 transition-colors font-medium"
            >
              Ona Zote
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentEvents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FaCalendar className="text-4xl text-gray-300 mx-auto mb-2" />
                <p className="text-sm">Hakuna matukio bado</p>
                <Link
                  href="/admin/events/new"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs bg-church-500 text-white px-4 py-1.5 rounded-lg hover:bg-church-600 transition-colors"
                >
                  <FaPlus /> Ongeza
                </Link>
              </div>
            ) : (
              recentEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/admin/events/${event.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    {event.image_url ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={getFullUrl(event.image_url)}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-church-50 flex items-center justify-center flex-shrink-0">
                        <FaCalendar className="text-church-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-church-600 transition-colors truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <span>{formatDate(event.start_date || event.date)}</span>
                        {event.category && (
                          <>
                            <span>•</span>
                            <span>{event.category}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <FaEye className="text-gray-300 group-hover:text-church-500 transition-colors text-sm mt-1" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* ============================================ */}
        {/* RECENT SERMONS */}
        {/* ============================================ */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-base text-gray-800 flex items-center gap-2">
              <FaBook className="text-purple-500" />
              Mahubiri ya Hivi Karibuni
            </h3>
            <Link
              href="/admin/sermons"
              className="text-purple-600 text-xs hover:text-purple-800 transition-colors font-medium"
            >
              Ona Zote
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentSermons.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FaBook className="text-4xl text-gray-300 mx-auto mb-2" />
                <p className="text-sm">Hakuna mahubiri bado</p>
                <Link
                  href="/admin/sermons/new"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs bg-purple-500 text-white px-4 py-1.5 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <FaPlus /> Ongeza
                </Link>
              </div>
            ) : (
              recentSermons.map((sermon) => (
                <Link
                  key={sermon.id}
                  href={`/admin/sermons/${sermon.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    {sermon.thumbnail_url ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={getFullUrl(sermon.thumbnail_url)}
                          alt={sermon.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <FaBook className="text-purple-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-purple-600 transition-colors truncate">
                        {sermon.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {sermon.preacher} • {formatDate(sermon.date)}
                      </p>
                    </div>
                    <FaEye className="text-gray-300 group-hover:text-purple-500 transition-colors text-sm mt-1" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* INFO CARD */}
      {/* ============================================ */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <FaCheckCircle className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-purple-900">
              Wajibu Wako kama IT wa Kanisa
            </p>
            <p className="text-sm text-purple-700 mt-1">
              Unasimamia matangazo ya kanisa (matukio, mahubiri, gallery) na mipangilio.
              Viongozi wa juu pia wanaweza kusimamia haya, lakini wewe ndiye mtaalamu wa mfumo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}