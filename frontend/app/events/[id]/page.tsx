// frontend/app/(public)/events/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { publicApi, Event } from "@/lib/api";
import {
  FaCalendar, FaClock, FaMapMarkerAlt, FaUser, FaArrowLeft,
  FaShare, FaUsers, FaPhone, FaEnvelope, FaGlobe,
  FaSpinner, FaExclamationTriangle, FaCheckCircle,
  FaVideo, FaMusic, FaFilePdf, FaDownload,
} from "react-icons/fa";

export default function EventDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [event, setEvent] = useState<Event | null>(null);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [copied, setCopied] = useState(false);

  // ============================================
  // 📥 FETCH
  // ============================================
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await publicApi.events(50);
        const list = Array.isArray(data) ? data : [];
        setAllEvents(list);

        const found = list.find((e) => e.id === id);
        if (found) {
          setEvent(found);
        } else {
          setError("Tukio haipatikani");
        }
      } catch (err: any) {
        console.error("❌ Fetch event error:", err);
        setError(err.message || "Imeshindwa kupata tukio");
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

  // ============================================
  // 📤 SHARE
  // ============================================
  const handleShare = async () => {
    const url = window.location.href;
    const text = event
      ? `${event.title} - ${formatDate(event.start_date || event.date)}`
      : "";

    if (navigator.share) {
      try {
        await navigator.share({ title: event?.title, text, url });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {}
    }
  };

  const relatedEvents = allEvents.filter((e) => e.id !== id).slice(0, 3);

  // ============================================
  // ⏳ LOADING
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-church-500 mx-auto" />
          <p className="text-gray-500 mt-4">Inapakia tukio...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ❌ ERROR
  // ============================================
  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-church-600 mb-6 text-sm"
        >
          <FaArrowLeft /> Rudi kwenye Matukio
        </Link>
        <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-xl">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-red-500 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Imeshindwa kupata tukio</p>
              <p className="text-sm text-red-700 mt-1">
                {error || "Tukio haipatikani"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      {/* Back */}
      <Link
        href="/events"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-church-600 mb-6 text-sm"
      >
        <FaArrowLeft /> Rudi kwenye Matukio
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* ============================================ */}
            {/* ✅ HEADER IMAGE — h-64 md:h-80 (fixed) */}
            {/* ============================================ */}
            {event.image_url ? (
              <div className="relative w-full h-64 md:h-80 bg-gray-100 overflow-hidden">
                <img
                  src={getFullUrl(event.image_url)}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                {event.category && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-gray-800 shadow-sm">
                      {event.category}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative h-64 md:h-80 bg-gradient-to-br from-church-400 to-church-600 flex items-center justify-center text-5xl text-white">
                📅
                {event.category && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-white">
                      {event.category}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ============================================ */}
            {/* ✅ VIDEO PLAYER — kama ipo */}
            {/* ============================================ */}
            {event.video_url && (
              <div className="px-6 md:px-8 pt-6">
                <div className="max-w-3xl mx-auto bg-black rounded-2xl overflow-hidden shadow-lg">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs">
                    <FaVideo className="text-rose-400" />
                    <span className="font-medium">Video ya Tukio</span>
                  </div>
                  <video
                    controls
                    className="w-full h-auto max-h-[70vh]"
                    preload="metadata"
                    playsInline
                  >
                    <source src={getFullUrl(event.video_url)} type="video/mp4" />
                    Kivinjari chako hakiwezi kuonyesha video hii.
                  </video>
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* ✅ AUDIO PLAYER — kama ipo */}
            {/* ============================================ */}
            {event.audio_url && (
              <div className="px-6 md:px-8 pt-4">
                <div className="max-w-2xl mx-auto bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 shadow-lg border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                      <FaMusic className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="font-semibold text-purple-900 text-sm">Audio ya Tukio</p>
                      <p className="text-xs text-purple-600">Sikiliza audio ya tukio</p>
                    </div>
                  </div>
                  <audio
                    controls
                    className="w-full"
                    preload="metadata"
                    src={getFullUrl(event.audio_url)}
                  >
                    Kivinjari chako hakiwezi kuonyesha audio hii.
                  </audio>
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* ✅ PDF DOWNLOAD — kama ipo */}
            {/* ============================================ */}
            {event.pdf_url && (
              <div className="px-6 md:px-8 pt-4">
                <div className="max-w-2xl mx-auto bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 shadow-lg border border-red-200">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                        <FaFilePdf className="text-white text-lg" />
                      </div>
                      <div>
                        <p className="font-semibold text-red-900 text-sm">PDF ya Tukio</p>
                        <p className="text-xs text-red-600">Pakua PDF ya tukio</p>
                      </div>
                    </div>
                    <a
                      href={getFullUrl(event.pdf_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    >
                      <FaDownload /> Pakua
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Details */}
            <div className="p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 mb-4">
                {event.title}
              </h1>

              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <InfoItem
                  icon={FaCalendar}
                  label="Tarehe"
                  value={formatDate(event.start_date || event.date)}
                />
                {event.start_time && (
                  <InfoItem
                    icon={FaClock}
                    label="Muda"
                    value={`${event.start_time}${
                      event.end_time ? ` - ${event.end_time}` : ""
                    }`}
                  />
                )}
                <InfoItem
                  icon={event.is_online ? FaGlobe : FaMapMarkerAlt}
                  label={event.is_online ? "Mtandaoni" : "Mahali"}
                  value={
                    event.is_online
                      ? "Mtandaoni"
                      : event.location || event.venue || "—"
                  }
                />
                {event.organizer && (
                  <InfoItem
                    icon={FaUser}
                    label="Mratibu"
                    value={event.organizer}
                  />
                )}
              </div>

              {/* Description */}
              {event.description && (
                <div className="mb-6">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Online link */}
              {event.is_online && event.meeting_link && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Kiungo cha Mtandaoni
                  </p>
                  <a
                    href={event.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {event.meeting_link}
                  </a>
                </div>
              )}

              {/* Attendees */}
              {(event.max_attendees || event.current_attendees) && (
                <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaUsers className="text-church-500 text-xl" />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {event.current_attendees || 0}
                        {event.max_attendees ? ` / ${event.max_attendees}` : ""}
                      </p>
                      <p className="text-xs text-gray-400">Washiriki</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 bg-church-500 hover:bg-church-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
                >
                  <FaShare /> Shiriki
                </button>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-church-500 text-church-600 hover:bg-church-50 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
                >
                  <FaEnvelope /> Wasiliana
                </Link>
              </div>

              {/* Copied toast */}
              {copied && (
                <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl text-sm">
                  <FaCheckCircle /> Link imenakiliwa!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Organizer */}
          {(event.organizer ||
            event.organizer_contact ||
            event.organizer_email) && (
            <div className="bg-gradient-to-br from-church-50 to-blue-50 rounded-2xl p-5">
              <h3 className="font-serif font-bold text-gray-800 text-lg mb-4">
                Wasiliana na Mratibu
              </h3>
              <div className="space-y-3">
                {event.organizer_contact && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <FaPhone className="text-church-500 flex-shrink-0" />
                    <span className="break-all">{event.organizer_contact}</span>
                  </div>
                )}
                {event.organizer_email && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <FaEnvelope className="text-church-500 flex-shrink-0" />
                    <span className="break-all">{event.organizer_email}</span>
                  </div>
                )}
                {event.organizer && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <FaUser className="text-church-500 flex-shrink-0" />
                    <span>{event.organizer}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Related */}
          {relatedEvents.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <h3 className="font-serif font-bold text-gray-800 text-lg mb-4">
                Matukio Mengine
              </h3>
              <div className="space-y-2">
                {relatedEvents.map((e) => (
                  <Link
                    key={e.id}
                    href={`/events/${e.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-church-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                      {e.image_url ? (
                        <img
                          src={getFullUrl(e.image_url)}
                          alt={e.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        "📅"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-church-600 transition-colors truncate">
                        {e.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {formatDate(e.start_date || e.date)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-r from-church-500 to-church-700 rounded-2xl p-5 text-center text-white">
            <h3 className="text-lg font-bold mb-2">Umebarikiwa?</h3>
            <p className="text-xs text-white/90 mb-3">
              Shiriki tukio hili na wapendwa wako
            </p>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 bg-white text-church-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-100 transition-colors text-sm"
            >
              <FaShare /> Shiriki
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 text-gray-600">
      <div className="w-10 h-10 bg-church-50 rounded-xl flex items-center justify-center text-church-500 flex-shrink-0">
        <Icon />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="font-medium text-sm break-words">{value}</p>
      </div>
    </div>
  );
}