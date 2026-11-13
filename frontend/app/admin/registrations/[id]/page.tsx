// frontend/app/admin/registrations/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { registrationsApi, User } from "@/lib/api";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaChurch,
  FaMapMarkerAlt,
  FaClock,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaUserShield,
  FaInfoCircle,
  FaCalendar,
  FaShieldAlt,
} from "react-icons/fa";
import AnimatedSection from "@/components/ui/AnimatedSection";
import AnimatedStagger from "@/components/ui/AnimatedStagger";

// ============================================================
// 🎨 ROLE LABELS
// ============================================================
const ROLE_LABELS: Record<string, string> = {
  mchungaji_kiongozi: "Mchungaji Kiongozi",
  mchungaji_msaidizi: "Mchungaji Msaidizi",
  mwinjilist: "Mwinjilist",
  mzee_kanisa: "Mzee wa Kanisa",
  mhasibu: "Mhasibu",
  katibu_mkuu: "Katibu Mkuu",
  mwenyekiti: "Mwenyekiti",
  mwenyekiti_msaidizi: "Mwenyekiti Msaidizi",
  it: "IT",
  muumini: "Muumini",
  super_admin: "Super Admin",
};

const getRoleLabel = (role: string) => ROLE_LABELS[role] || role;

const ROLE_COLORS: Record<string, string> = {
  mchungaji_kiongozi: "bg-purple-100 text-purple-700",
  mchungaji_msaidizi: "bg-indigo-100 text-indigo-700",
  mwinjilist: "bg-blue-100 text-blue-700",
  mzee_kanisa: "bg-teal-100 text-teal-700",
  mhasibu: "bg-green-100 text-green-700",
  katibu_mkuu: "bg-amber-100 text-amber-700",
  mwenyekiti: "bg-orange-100 text-orange-700",
  mwenyekiti_msaidizi: "bg-yellow-100 text-yellow-700",
  it: "bg-cyan-100 text-cyan-700",
  muumini: "bg-gray-100 text-gray-700",
  super_admin: "bg-red-100 text-red-700",
};

const getRoleColor = (role: string) =>
  ROLE_COLORS[role] || "bg-gray-100 text-gray-700";

// ============================================================
// 🔧 HELPERS
// ============================================================
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("sw-TZ", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

// ============================================================
// 🚀 MAIN COMPONENT
// ============================================================
export default function RegistrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Action states
  const [actionLoading, setActionLoading] = useState<"approve" | "reject" | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ============================================================
  // 📥 FETCH USER
  // ============================================================
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

      setLoading(true);
      setError("");
      try {
        const data = await registrationsApi.get(userId);
        setUser(data);
      } catch (err: any) {
        console.error("❌ Fetch registration error:", err);
        setError(err.message || "Imeshindwa kupata usajili huu");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // ============================================================
  // ✅ APPROVE
  // ============================================================
  const handleApprove = async () => {
    if (!user) return;

    if (
      !confirm(
        `Unataka kumuidhinisha "${user.name}"? Ataweza kuingia mfumo mara moja.`
      )
    ) {
      return;
    }

    setActionLoading("approve");
    setError("");
    setSuccessMsg("");

    try {
      await registrationsApi.approve(user.id);
      setSuccessMsg(`✅ "${user.name}" ameidhinishwa kikamilifu!`);

      setTimeout(() => {
        router.push("/admin/registrations");
      }, 1800);
    } catch (err: any) {
      console.error("❌ Approve error:", err);
      setError(err.message || "Imeshindwa kumuidhinisha mtumiaji");
      setActionLoading(null);
    }
  };

  // ============================================================
  // ❌ REJECT
  // ============================================================
  const handleReject = async () => {
    if (!user) return;

    setActionLoading("reject");
    setError("");
    setSuccessMsg("");

    try {
      await registrationsApi.reject(
        user.id,
        rejectionReason.trim() || undefined
      );
      setSuccessMsg(
        `❌ "${user.name}" amekataliwa na amefutwa kwenye database.`
      );
      setShowRejectModal(false);

      setTimeout(() => {
        router.push("/admin/registrations");
      }, 1800);
    } catch (err: any) {
      console.error("❌ Reject error:", err);
      setError(err.message || "Imeshindwa kumkataa mtumiaji");
      setActionLoading(null);
    }
  };

  // ============================================================
  // 🎨 RENDER — LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="card p-12 text-center">
        <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto mb-3" />
        <p className="text-gray-500">Inapakia maelezo ya usajili...</p>
      </div>
    );
  }

  // ============================================================
  // 🎨 RENDER — ERROR / NOT FOUND
  // ============================================================
  if (error || !user) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/registrations"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-church-600 text-sm font-medium transition-colors"
        >
          <FaArrowLeft /> Rudi kwenye Maombi
        </Link>

        <div className="card p-12 text-center">
          <FaExclamationTriangle className="text-5xl text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Haipatikani</h2>
          <p className="text-gray-500 mb-4">
            {error || "Usajili huu haupo au umeshafutwa."}
          </p>
          <Link
            href="/admin/registrations"
            className="inline-flex items-center gap-2 bg-church-500 hover:bg-church-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <FaArrowLeft /> Rudi kwenye Orodha
          </Link>
        </div>
      </div>
    );
  }

  const isApproved = !!user.is_approved;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ===== BACK LINK ===== */}
      <AnimatedSection>
        <Link
          href="/admin/registrations"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-church-600 text-sm font-medium transition-colors"
        >
          <FaArrowLeft /> Rudi kwenye Maombi
        </Link>
      </AnimatedSection>

      {/* ===== SUCCESS ===== */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-xl flex items-start gap-3">
          <FaCheck className="text-emerald-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-emerald-700 flex-1">{successMsg}</p>
        </div>
      )}

      {/* ===== ERROR ===== */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
        </div>
      )}

      {/* ===== HEADER CARD ===== */}
      <AnimatedSection delay={0.1}>
        <div className="card p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-church-400 to-church-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl flex-shrink-0 shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {user.name}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(
                    user.role
                  )}`}
                >
                  {getRoleLabel(user.role)}
                </span>
              </div>

              <p className="text-sm text-gray-500 flex items-center gap-2">
                <FaClock className="text-xs" />
                Ameomba: {formatDate(user.created_at)}
              </p>

              <div className="mt-3">
                {isApproved ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                    <FaCheck /> Ameidhinishwa
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                    <FaClock /> Inasubiri Idhini
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ===== DETAILS ===== */}
      <AnimatedSection>
        <AnimatedStagger className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              <FaEnvelope /> Barua Pepe
            </div>
            <p className="text-gray-800 font-medium break-all">{user.email}</p>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              <FaPhone /> Namba ya Simu
            </div>
            <p className="text-gray-800 font-medium">
              {user.phone || <span className="text-gray-400">—</span>}
            </p>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              <FaChurch /> Jina la Kanisa
            </div>
            <p className="text-gray-800 font-medium">
              {user.church_name || <span className="text-gray-400">—</span>}
            </p>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              <FaMapMarkerAlt /> Mahali
            </div>
            <p className="text-gray-800 font-medium">
              {user.church_location || <span className="text-gray-400">—</span>}
            </p>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              <FaUserShield /> Role
            </div>
            <p className="text-gray-800 font-medium">
              {getRoleLabel(user.role)}
            </p>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              <FaShieldAlt /> ID ya Mtumiaji
            </div>
            <p className="text-gray-800 font-mono text-xs break-all">
              {user.id}
            </p>
          </div>
        </AnimatedStagger>
      </AnimatedSection>

      {/* ===== APPROVED INFO ===== */}
      {isApproved && (
        <AnimatedSection>
          <div className="card p-5 bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-3">
              <FaCheck /> Taarifa za Idhini
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-emerald-600 text-xs mb-1">
                  Iliidhinishwa na
                </p>
                <p className="text-gray-800 font-medium">
                  {user.approved_by_name || "—"}
                </p>
              </div>
              <div>
                <p className="text-emerald-600 text-xs mb-1 flex items-center gap-1">
                  <FaCalendar /> Tarehe
                </p>
                <p className="text-gray-800 font-medium">
                  {formatDate(user.approved_at)}
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ===== ACTIONS ===== */}
      {!isApproved && !successMsg && (
        <AnimatedSection>
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaInfoCircle className="text-church-500" />
              Hatua Zinazofuata
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Chagua kuidhinisha usajili huu au kukataa. Ukikataa, mtumiaji
              atafutwa moja kwa moja kwenye database.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleApprove}
                disabled={actionLoading !== null}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors shadow-sm"
              >
                {actionLoading === "approve" ? (
                  <>
                    <FaSpinner className="animate-spin" /> Inaidhinisha...
                  </>
                ) : (
                  <>
                    <FaCheck /> Idhinisha Usajili
                  </>
                )}
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading !== null}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors shadow-sm"
              >
                <FaTimes /> Kataa & Futa
              </button>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ===== REJECT MODAL ===== */}
      {showRejectModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaExclamationTriangle className="text-red-500 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Kataa Usajili?
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  <strong>{user.name}</strong> atafutwa moja kwa moja kwenye
                  database. Hatua hii haiwezi kurudishwa.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sababu ya kukataa (si lazima)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Mfano: Sio kiongozi halisi wa kanisa..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 text-sm resize-none"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              <p className="text-xs text-amber-800 flex items-start gap-2">
                <FaInfoCircle className="text-amber-500 mt-0.5 flex-shrink-0" />
                <span>
                  Mtumiaji atafutwa kabisa. Akitaka kujiunga tena, atalazimika
                  kujisajili upya.
                </span>
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={actionLoading === "reject"}
                className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
              >
                Ghairi
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === "reject"}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors inline-flex items-center justify-center gap-2"
              >
                {actionLoading === "reject" ? (
                  <>
                    <FaSpinner className="animate-spin" /> Inafuta...
                  </>
                ) : (
                  <>
                    <FaTimes /> Kataa & Futa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}