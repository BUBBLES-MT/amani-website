// frontend/app/admin/messages/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { messagesApi } from "@/lib/api";
import {
  FaSpinner, FaExclamationTriangle, FaEnvelope, FaEnvelopeOpen,
  FaSearch, FaEye, FaTrash, FaReply, FaCheckCircle, FaClock,
  FaArchive,
} from "react-icons/fa";
import AnimatedSection from "@/components/ui/AnimatedSection";

const STATUS_LABELS: Record<string, string> = {
  new: "Mpya",
  read: "Imesomwa",
  replied: "Imejibiwa",
  archived: "Kumbukumbu",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: any }> = {
  new: { bg: "bg-blue-100", text: "text-blue-700", icon: FaEnvelope },
  read: { bg: "bg-gray-100", text: "text-gray-700", icon: FaEnvelopeOpen },
  replied: { bg: "bg-emerald-100", text: "text-emerald-700", icon: FaCheckCircle },
  archived: { bg: "bg-amber-100", text: "text-amber-700", icon: FaArchive },
};

const CATEGORY_LABELS: Record<string, string> = {
  Swali: "Swali",
  Maombi: "Maombi",
  Ushauri: "Ushauri",
  Malalamiko: "Malalamiko",
  Pongezi: "Pongezi",
  Nyingine: "Nyingine",
};

export default function MessagesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await messagesApi.list({ limit: 100 });
      setMessages(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("❌ Messages fetch error:", err);
      setError(err.message || "Imeshindwa kupata ujumbe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Una uhakika unataka kufuta ujumbe kutoka kwa "${name}"?`)) return;

    setDeleting(id);
    try {
      await messagesApi.delete(id);
      setMessages(messages.filter((m) => m.id !== id));
    } catch (err: any) {
      setError(err.message || "Imeshindwa kufuta ujumbe");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = messages.filter((m) => {
    const matchesSearch =
      !search ||
      (m.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.subject || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.message || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filterStatus || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const uniqueStatuses = Array.from(
    new Set(messages.map((m) => m.status).filter(Boolean))
  );

  const formatDateTime = (d: string) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleString("sw-TZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return d;
    }
  };

  const statusBadge = (status: string) => {
    const c = STATUS_COLORS[status] || STATUS_COLORS["read"];
    const Icon = c.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
      >
        <Icon /> {STATUS_LABELS[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <AnimatedSection>
        <h1 className="text-2xl font-bold text-gray-800">Ujumbe</h1>
        <p className="text-gray-500 text-sm mt-1">
          Ujumbe kutoka kwa waumini na wageni
        </p>
      </AnimatedSection>

      {/* ===== ERROR ===== */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
        </div>
      )}

      {/* ===== SEARCH & FILTER ===== */}
      <AnimatedSection>
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tafuta kwa jina, barua pepe, kichwa..."
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
                <option key={s} value={s}>
                  {STATUS_LABELS[s] || s}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-400">
            {filtered.length} kati ya {messages.length} ujumbe
          </p>
        </div>
      </AnimatedSection>

      {/* ===== MESSAGES LIST ===== */}
      <AnimatedSection>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-16">
              <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto" />
              <p className="text-gray-500 mt-3">Inapakia ujumbe...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <FaEnvelope className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="font-medium">
                {messages.length === 0
                  ? "Hakuna ujumbe bado"
                  : "Hakuna ujumbe unaolingana"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/messages/${item.id}`}
                  className={`block p-4 hover:bg-gray-50 transition-colors ${
                    item.status === "new" ? "bg-blue-50/30" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-church-100 rounded-full flex items-center justify-center text-church-700 font-bold flex-shrink-0">
                      {item.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-800 truncate">
                              {item.name}
                            </p>
                            {item.status === "new" && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {item.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {statusBadge(item.status)}
                        </div>
                      </div>
                      {item.subject && (
                        <p className="text-sm font-medium text-gray-700 mt-1 truncate">
                          {item.subject}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {item.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <FaClock /> {formatDateTime(item.created_at)}
                        </span>
                        {item.category && (
                          <span>
                            📁 {CATEGORY_LABELS[item.category] || item.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </AnimatedSection>
    </div>
  );
}