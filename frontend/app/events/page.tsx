// frontend/app/(public)/events/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { publicApi, Event } from "@/lib/api";
import {
  FaCalendar, FaClock, FaMapMarkerAlt, FaArrowRight,
  FaFilter, FaSpinner, FaExclamationTriangle, FaGlobe,
} from "react-icons/fa";
import AnimatedSection from "@/components/ui/AnimatedSection";
import AnimatedStagger from "@/components/ui/AnimatedStagger";
import {
  AnimatedHero,
  AnimatedHeroItem,
  AnimatedHeroText,
} from "@/components/ui/AnimatedHero";
import { listItem } from "@/lib/animations";

export default function EventsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");

  // ============================================
  // 📥 FETCH
  // ============================================
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await publicApi.events(50);
        setEvents(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("❌ Events fetch error:", err);
        setError(err.message || "Imeshindwa kupata matukio");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // ============================================
  // 🎯 FILTERS
  // ============================================
  const categories = Array.from(
    new Set(events.map((e) => e.category).filter(Boolean))
  );
  const filters = ["All", ...categories];

  const filteredEvents =
    activeFilter === "All"
      ? events
      : events.filter((e) => e.category === activeFilter);

  // ============================================
  // 🎨 FORMAT
  // ============================================
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("sw-TZ", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
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

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* ===== HERO ===== */}
      <AnimatedHero className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-church-600 via-church-700 to-church-900 text-white p-8 md:p-16 mb-12 shadow-2xl">
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl">
          <AnimatedHeroItem>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 text-sm font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Matukio
            </div>
          </AnimatedHeroItem>

          <AnimatedHeroText>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold leading-tight mb-4">
              Matukio <span className="text-gold-300">Yajayo</span>
            </h1>
          </AnimatedHeroText>

          <AnimatedHeroItem>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl leading-relaxed">
              Jiunge nasi katika matukio mbalimbali ya ibada, mafunzo, na ushirika.
            </p>
          </AnimatedHeroItem>
        </div>

        <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 opacity-10 text-[12rem] md:text-[18rem] select-none">
          📅
        </div>
      </AnimatedHero>

      {/* ===== ERROR ===== */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
        </div>
      )}

      {/* ===== LOADING ===== */}
      {loading ? (
        <div className="text-center py-16">
          <FaSpinner className="animate-spin text-5xl text-church-500 mx-auto" />
          <p className="text-gray-500 mt-4">Inapakia matukio...</p>
        </div>
      ) : (
        <>
          {/* ===== FILTERS ===== */}
          {events.length > 0 && (
            <AnimatedSection className="flex flex-wrap gap-2 mb-8">
              <FaFilter className="text-gray-400 text-lg mt-2 mr-1" />
              {filters.map((filter) => (
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
            </AnimatedSection>
          )}

          {/* ===== EVENTS LIST ===== */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <FaCalendar className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-lg">
                {events.length === 0
                  ? "Bado hakuna matukio yaliyotangazwa"
                  : "Hakuna matukio yanayolingana"}
              </p>
              <p className="text-sm mt-2">
                {events.length === 0
                  ? "Viongozi wataongeza matukio hivi karibuni"
                  : "Jaribu kubadilisha kichujio"}
              </p>
            </div>
          ) : (
            <AnimatedStagger className="space-y-4">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="card p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Image / Emoji */}
                    <div className="flex-shrink-0 w-full md:w-32 h-32 md:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-church-400 to-church-600 flex items-center justify-center text-5xl text-white">
                      {event.image_url ? (
                        <img
                          src={getFullUrl(event.image_url)}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>📅</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-xl font-serif font-bold text-gray-800">
                          {event.title}
                        </h3>
                        {event.category && (
                          <span className="text-xs bg-church-100 text-church-700 px-2 py-1 rounded-full font-semibold">
                            {event.category}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-2">
                          <FaCalendar className="text-church-500" />
                          {formatDate(event.start_date || event.date)}
                        </span>
                        {event.start_time && (
                          <span className="flex items-center gap-2">
                            <FaClock className="text-church-500" />
                            {event.start_time}
                            {event.end_time && ` - ${event.end_time}`}
                          </span>
                        )}
                        <span className="flex items-center gap-2 sm:col-span-2">
                          {event.is_online ? (
                            <>
                              <FaGlobe className="text-blue-500" />
                              <span>Mtandaoni</span>
                            </>
                          ) : (
                            <>
                              <FaMapMarkerAlt className="text-church-500" />
                              <span>{event.location || event.venue || "—"}</span>
                            </>
                          )}
                        </span>
                      </div>

                      {event.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <Link
                        href={`/events/${event.id}`}
                        className="inline-flex items-center gap-2 text-church-600 font-semibold hover:text-church-800 transition-all hover:gap-3"
                      >
                        Soma Zaidi <FaArrowRight className="text-sm" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </AnimatedStagger>
          )}
        </>
      )}

      {/* ===== CTA ===== */}
      <AnimatedSection className="mt-12 bg-gradient-to-r from-church-500 to-church-700 rounded-3xl p-8 md:p-12 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
          Je, Una Swali?
        </h2>
        <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
          Wasiliana nasi kwa maswali yoyote kuhusu matukio yetu.
        </p>
        <Link
          href="/contact"
          className="btn-secondary inline-flex items-center gap-2 text-base px-8 py-3"
        >
          Wasiliana Nasi
        </Link>
      </AnimatedSection>
    </div>
  );
}