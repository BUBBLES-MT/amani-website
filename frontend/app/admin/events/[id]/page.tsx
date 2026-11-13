// frontend/app/admin/events/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { eventsApi } from "@/lib/api";
import {
  FaArrowLeft, FaSpinner, FaExclamationTriangle,
  FaCalendar, FaClock, FaMapMarkerAlt, FaGlobe,
  FaUser, FaPhone, FaEnvelope, FaUsers, FaTimes,
  FaCheckCircle, FaTimesCircle, FaInfoCircle,
} from "react-icons/fa";
import AnimatedSection from "@/components/ui/AnimatedSection";
import AnimatedStagger from "@/components/ui/AnimatedStagger";

const STATUS_CONFIG: Record<string, {
  label: string; color: string; bg: string; border: string; icon: any;
}> = {
  upcoming: {
    label: "Inakuja",
    color: "text-emerald-800",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    icon: FaClock,
  },
  ongoing: {
    label: "Inaendelea",
    color: "text-blue-800",
    bg: "bg-blue-50",
    border: "border-blue-300",
    icon: FaCheckCircle,
  },
  completed: {
    label: "Imekamilika",
    color: "text-gray-800",
    bg: "bg-gray-50",
    border: "border-gray-300",
    icon: FaCheckCircle,
  },
  cancelled: {
    label: "Imefutwa",
    color: "text-rose-800",
    bg: "bg-rose-50",
    border: "border-rose-300",
    icon: FaTimesCircle,
  },
};

export default function EventDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await eventsApi.get(id);
        setEvent(data);
      } catch (err: any) {
        console.error("❌ Fetch event error:", err);
        setError(err.message || "Imeshindwa kupata tukio");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

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

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString("sw-TZ", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto" />
          <p className="text-gray-500 mt-3">Inapakia tukio...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
        >
          <FaArrowLeft /> Rudi kwenye matukio
        </Link>
        <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-xl">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-red-500 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Imeshindwa kupata tukio</p>
              <p className="text-sm text-red-700 mt-1">{error || "Tukio haipatikani"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[event.status] || STATUS_CONFIG["upcoming"];
  const StatusIcon = status.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* ===== HEADER ===== */}
      <AnimatedSection>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/events"
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <FaArrowLeft className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Maelezo ya Tukio</h1>
              <p className="text-gray-500 text-sm mt-0.5">Taarifa kamili za tukio</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${status.bg} ${status.color} ${status.border}`}
          >
            <StatusIcon /> {status.label}
          </span>
        </div>
      </AnimatedSection>

      {/* ===== HERO ===== */}
      <AnimatedSection delay={0.1}>
        <div className="bg-gradient-to-br from-church-600 via-church-500 to-church-400 rounded-2xl shadow-lg overflow-hidden">
          {event.image_url && (
            <div className="h-48 sm:h-64 overflow-hidden bg-gray-200">
              <img
                src={getFullUrl(event.image_url)}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6 text-white">
            <div className="flex flex-wrap items-center gap-3 text-sm opacity-90 mb-2">
              {event.category && (
                <span className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs">
                  📁 {event.category}
                </span>
              )}
              {event.is_online ? (
                <span className="inline-flex items-center gap-1">
                  <FaGlobe /> Mtandaoni
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <FaMapMarkerAlt /> {event.location || "—"}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">{event.title}</h2>
            {event.description && (
              <p className="mt-3 text-sm opacity-90 leading-relaxed">
                {event.description}
              </p>
            )}
          </div>
        </div>
      </AnimatedSection>

      {/* ===== DATE & TIME ===== */}
      <AnimatedSection>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <FaCalendar className="text-church-500" /> Tarehe na Muda
            </h3>
          </div>
          <AnimatedStagger className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <DetailRow
              icon={FaCalendar}
              label="Tarehe ya Kuanza"
              value={formatDate(event.start_date)}
            />
            {event.end_date && (
              <DetailRow
                icon={FaCalendar}
                label="Tarehe ya Mwisho"
                value={formatDate(event.end_date)}
              />
            )}
            {event.start_time && (
              <DetailRow
                icon={FaClock}
                label="Muda wa Kuanza"
                value={event.start_time}
              />
            )}
            {event.end_time && (
              <DetailRow
                icon={FaClock}
                label="Muda wa Mwisho"
                value={event.end_time}
              />
            )}
          </AnimatedStagger>
        </div>
      </AnimatedSection>

      {/* ===== LOCATION ===== */}
      {(event.location || event.venue || event.meeting_link) && (
        <AnimatedSection>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <FaMapMarkerAlt className="text-church-500" /> Mahali
              </h3>
            </div>
            <AnimatedStagger className="p-5 space-y-4">
              {event.location && (
                <DetailRow
                  icon={FaMapMarkerAlt}
                  label="Mahali"
                  value={event.location}
                />
              )}
              {event.venue && (
                <DetailRow
                  icon={FaMapMarkerAlt}
                  label="Ukumbi"
                  value={event.venue}
                />
              )}
              {event.is_online && event.meeting_link && (
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Kiungo cha Mtandaoni</p>
                  <a
                    href={event.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-blue-600 hover:underline mt-1 inline-block break-all"
                  >
                    {event.meeting_link}
                  </a>
                </div>
              )}
            </AnimatedStagger>
          </div>
        </AnimatedSection>
      )}

      {/* ===== ORGANIZER ===== */}
      {(event.organizer || event.organizer_contact || event.organizer_email) && (
        <AnimatedSection>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <FaUser className="text-church-500" /> Mratibu
              </h3>
            </div>
            <AnimatedStagger className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {event.organizer && (
                <DetailRow icon={FaUser} label="Jina" value={event.organizer} />
              )}
              {event.organizer_contact && (
                <DetailRow icon={FaPhone} label="Simu" value={event.organizer_contact} />
              )}
              {event.organizer_email && (
                <DetailRow icon={FaEnvelope} label="Barua Pepe" value={event.organizer_email} />
              )}
            </AnimatedStagger>
          </div>
        </AnimatedSection>
      )}

      {/* ===== CAPACITY ===== */}
      {(event.max_attendees || event.current_attendees > 0) && (
        <AnimatedSection>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <FaUsers className="text-church-500" /> Washiriki
              </h3>
            </div>
            <div className="p-5 space-y-3">
              {event.max_attendees && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Idadi ya Washiriki</span>
                    <span className="text-sm font-bold text-gray-800">
                      {event.current_attendees || 0} / {event.max_attendees}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-church-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(((event.current_attendees || 0) / event.max_attendees) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
              {!event.max_attendees && (
                <p className="text-sm text-gray-600">
                  Washiriki waliojiandikisha: <strong>{event.current_attendees || 0}</strong>
                </p>
              )}
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ===== META ===== */}
      <AnimatedSection>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <FaInfoCircle className="text-church-500" /> Taarifa za Mfumo
            </h3>
          </div>
          <AnimatedStagger className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <DetailRow icon={FaUser} label="Aliyeunda" value={event.created_by_name || "—"} />
            <DetailRow icon={FaCalendar} label="Tarehe ya Kuundwa" value={formatDateTime(event.created_at)} />
          </AnimatedStagger>
          <div className="px-5 pb-5 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Mwisho kubadilishwa: {formatDateTime(event.updated_at || event.created_at)}
            </p>
          </div>
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