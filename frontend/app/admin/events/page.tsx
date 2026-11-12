// frontend/app/admin/events/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { eventsApi } from "@/lib/api";
import {
  FaPlus, FaSpinner, FaExclamationTriangle, FaCalendar,
  FaCheckCircle, FaClock, FaSearch, FaEye, FaTimesCircle,
  FaMapMarkerAlt, FaGlobe,
} from "react-icons/fa";

export default function EventsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await eventsApi.list({ limit: 100 });
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

  const filtered = events.filter((e) => {
    const matchesSearch =
      !search ||
      (e.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.organizer || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.location || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filterStatus || e.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const uniqueStatuses = Array.from(new Set(events.map((e) => e.status).filter(Boolean)));

  const statusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: any; label: string }> = {
      upcoming: { bg: "bg-emerald-100", text: "text-emerald-700", icon: FaClock, label: "Inakuja" },
      ongoing: { bg: "bg-blue-100", text: "text-blue-700", icon: FaCheckCircle, label: "Inaendelea" },
      completed: { bg: "bg-gray-100", text: "text-gray-700", icon: FaCheckCircle, label: "Imekamilika" },
      cancelled: { bg: "bg-rose-100", text: "text-rose-700", icon: FaTimesCircle, label: "Imefutwa" },
    };
    const c = config[status] || config["upcoming"];
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        <Icon /> {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Matukio</h1>
          <p className="text-gray-500 text-sm mt-1">Orodha ya matukio yote</p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 bg-church-500 hover:bg-church-600 text-white px-5 py-2.5 rounded-xl transition-colors font-medium text-sm shadow-sm"
        >
          <FaPlus /> Ongeza Tukio
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tafuta kwa kichwa, mratibu, mahali..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm bg-white min-w-[160px]"
          >
            <option value="">Hali zote</option>
            {uniqueStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-400">
          {filtered.length} kati ya {events.length} matukio
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto" />
            <p className="text-gray-500 mt-3">Inapakia matukio...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FaCalendar className="text-5xl text-gray-300 mx-auto mb-3" />
            <p className="font-medium">
              {events.length === 0 ? "Hakuna matukio bado" : "Hakuna matukio yanayolingana"}
            </p>
            {events.length === 0 && (
              <Link
                href="/admin/events/new"
                className="inline-flex items-center gap-2 mt-5 bg-church-500 text-white px-5 py-2.5 rounded-xl hover:bg-church-600 transition-colors"
              >
                <FaPlus /> Ongeza Tukio
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tukio</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tarehe</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mahali</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mratibu</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Hali</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Vitendo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-church-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                          📅
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">{item.title}</p>
                          {item.category && (
                            <p className="text-xs text-gray-500 truncate">{item.category}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(item.start_date)}
                      {item.start_time && (
                        <span className="text-xs text-gray-400 block">{item.start_time}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        {item.is_online ? (
                          <><FaGlobe className="text-blue-500" /> Mtandaoni</>
                        ) : (
                          <><FaMapMarkerAlt className="text-rose-500" /> {item.location || "—"}</>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.organizer || "—"}
                    </td>
                    <td className="px-4 py-3">{statusBadge(item.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/events/${item.id}`}
                        className="inline-flex items-center gap-1.5 text-church-600 hover:text-church-800 text-sm font-medium"
                      >
                        <FaEye /> Ona
                      </Link>
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