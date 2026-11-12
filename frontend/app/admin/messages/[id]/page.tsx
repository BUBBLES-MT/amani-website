// frontend/app/admin/messages/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { messagesApi } from "@/lib/api";
import {
  FaArrowLeft, FaSpinner, FaExclamationTriangle,
  FaEnvelope, FaEnvelopeOpen, FaReply, FaCheckCircle,
  FaUser, FaPhone, FaCalendar, FaTag, FaTrash, FaArchive,
  FaClock, FaSave, FaTimes,
} from "react-icons/fa";

const STATUS_LABELS: Record<string, string> = {
  new: "Mpya",
  read: "Imesomwa",
  replied: "Imejibiwa",
  archived: "Kumbukumbu",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; icon: any }> = {
  new: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-300", icon: FaEnvelope },
  read: { bg: "bg-gray-50", text: "text-gray-800", border: "border-gray-300", icon: FaEnvelopeOpen },
  replied: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-300", icon: FaCheckCircle },
  archived: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-300", icon: FaArchive },
};

export default function MessageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // ============================================
  // 📥 FETCH
  // ============================================
  useEffect(() => {
    if (!id) return;

    const fetchMessage = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await messagesApi.get(id);
        setMessage(data);
        setReplyText(data.reply_text || "");
      } catch (err: any) {
        console.error("❌ Fetch message error:", err);
        setError(err.message || "Imeshindwa kupata ujumbe");
      } finally {
        setLoading(false);
      }
    };
    fetchMessage();
  }, [id]);

  // ============================================
  // 🎨 FORMAT
  // ============================================
  const formatDateTime = (d: string) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleString("sw-TZ", {
        day: "2-digit", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch {
      return d;
    }
  };

  // ============================================
  // 📤 SUBMIT REPLY
  // ============================================
  const handleReply = async () => {
    if (!replyText.trim()) {
      setSaveError("Andika jibu kwanza");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const updated = await messagesApi.update(id, {
        reply_text: replyText.trim(),
      });
      setMessage(updated);
    } catch (err: any) {
      console.error("Reply error:", err);
      setSaveError(err.message || "Imeshindwa kutuma jibu");
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // 📦 ARCHIVE
  // ============================================
  const handleArchive = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const updated = await messagesApi.update(id, {
        is_archived: true,
        status: "archived",
      });
      setMessage(updated);
    } catch (err: any) {
      setSaveError(err.message || "Imeshindwa kuweka kwenye kumbukumbu");
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // 🗑️ DELETE
  // ============================================
  const handleDelete = async () => {
    if (!confirm("Una uhakika unataka kufuta ujumbe huu?")) return;
    setDeleting(true);
    try {
      await messagesApi.delete(id);
      router.push("/admin/messages");
    } catch (err: any) {
      setSaveError(err.message || "Imeshindwa kufuta ujumbe");
      setDeleting(false);
    }
  };

  // ============================================
  // ⏳ LOADING
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto" />
          <p className="text-gray-500 mt-3">Inapakia ujumbe...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ❌ ERROR
  // ============================================
  if (error || !message) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Link
          href="/admin/messages"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
        >
          <FaArrowLeft /> Rudi kwenye ujumbe
        </Link>
        <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-xl">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-red-500 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Imeshindwa kupata ujumbe</p>
              <p className="text-sm text-red-700 mt-1">{error || "Ujumbe haipatikani"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const status = STATUS_COLORS[message.status] || STATUS_COLORS["read"];
  const StatusIcon = status.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/messages"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Maelezo ya Ujumbe</h1>
            <p className="text-gray-500 text-sm mt-0.5">Ujumbe kutoka kwa mtumiaji</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${status.bg} ${status.text} ${status.border}`}>
          <StatusIcon /> {STATUS_LABELS[message.status] || message.status}
        </span>
      </div>

      {saveError && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{saveError}</p>
          <button onClick={() => setSaveError("")} className="text-red-400 hover:text-red-600">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Sender info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-lg text-gray-800">Mtumaji</h2>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <DetailRow icon={FaUser} label="Jina" value={message.name} />
          <DetailRow icon={FaEnvelope} label="Barua Pepe" value={message.email} />
          <DetailRow icon={FaPhone} label="Simu" value={message.phone || "—"} />
          <DetailRow icon={FaTag} label="Kategoria" value={message.category} />
        </div>
      </div>

      {/* Message content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-gray-800">
              {message.subject || "Ujumbe"}
            </h2>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <FaClock /> {formatDateTime(message.created_at)}
            </p>
          </div>
        </div>
        <div className="p-5">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {message.message}
          </p>
        </div>
      </div>

      {/* Reply section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <FaReply className="text-church-500" />
            {message.reply_text ? "Jibu" : "Jibu Ujumbe"}
          </h2>
          {message.replied_by_name && message.replied_at && (
            <p className="text-xs text-gray-500 mt-1">
              Ilijibiwa na <strong>{message.replied_by_name}</strong> • {formatDateTime(message.replied_at)}
            </p>
          )}
        </div>
        <div className="p-5 space-y-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={5}
            placeholder="Andika jibu lako hapa..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm resize-none"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleReply}
              disabled={saving || !replyText.trim()}
              className="inline-flex items-center gap-2 bg-church-500 hover:bg-church-600 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-colors"
            >
              {saving ? (
                <><FaSpinner className="animate-spin" /> Inatuma...</>
              ) : (
                <><FaReply /> {message.reply_text ? "Sasisha Jibu" : "Tuma Jibu"}</>
              )}
            </button>
            {!message.is_archived && (
              <button
                onClick={handleArchive}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-800 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
              >
                <FaArchive /> Weka Kumbukumbu
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
            >
              {deleting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
              Futa
            </button>
          </div>
        </div>
      </div>
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