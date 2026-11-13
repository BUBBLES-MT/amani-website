// frontend/app/admin/expenses/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { expensesApi, userStorage } from "@/lib/api";
import {
  FaArrowLeft, FaSpinner, FaExclamationTriangle, FaCheckCircle,
  FaClock, FaUniversity, FaUser, FaMoneyBillWave, FaInfoCircle,
  FaHistory, FaTimes, FaCheck, FaLock,
} from "react-icons/fa";
import AnimatedSection from "@/components/ui/AnimatedSection";
import AnimatedStagger from "@/components/ui/AnimatedStagger";

// ============================================
// 🎨 STATUS CONFIG
// ============================================
const STATUS_CONFIG: Record<string, {
  label: string; color: string; bg: string; border: string; icon: any;
}> = {
  Imeombwa: {
    label: "Imeombwa",
    color: "text-amber-800",
    bg: "bg-amber-50",
    border: "border-amber-300",
    icon: FaClock,
  },
  Imeidhinishwa: {
    label: "Imeidhinishwa",
    color: "text-blue-800",
    bg: "bg-blue-50",
    border: "border-blue-300",
    icon: FaCheckCircle,
  },
  Imetolewa: {
    label: "Imetolewa",
    color: "text-emerald-800",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    icon: FaUniversity,
  },
};

// ============================================
// ✅ ROLES — Internal Control
// ⚠️ MHASIBU HAYUPO kwenye APPROVE_ROLES!
// ============================================
const APPROVE_ROLES = [
  "super_admin",
  "mchungaji_kiongozi",
  "mchungaji_msaidizi",
  "mwinjilist",
  "mwenyekiti",
  "mwenyekiti_msaidizi",
  "katibu_mkuu",
];

const WITHDRAW_ROLES = [
  "super_admin",
  "mhasibu",
  "mchungaji_kiongozi",
  "katibu_mkuu",
];

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expense, setExpense] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawalReference, setWithdrawalReference] = useState("");

  // ============================================
  // 📥 FETCH
  // ============================================
  useEffect(() => {
    setUser(userStorage.get());
    if (!id) return;

    const fetchExpense = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await expensesApi.get(id);
        setExpense(data);
      } catch (err: any) {
        setError(err.message || "Imeshindwa kupata matumizi");
      } finally {
        setLoading(false);
      }
    };
    fetchExpense();
  }, [id]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("sw-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(n || 0);

  const formatDateTime = (d: string) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleString("sw-TZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return d;
    }
  };

  const handleApprove = async () => {
    if (!confirm("Una uhakika unataka kuidhinisha matumizi haya?")) return;

    setActionLoading(true);
    setActionError("");
    try {
      await expensesApi.approve(id);
      const data = await expensesApi.get(id);
      setExpense(data);
    } catch (err: any) {
      setActionError(err.message || "Imeshindwa kuidhinisha");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      await expensesApi.withdraw(id, {
        withdrawal_reference: withdrawalReference.trim() || undefined,
      });
      setShowWithdrawModal(false);
      setWithdrawalReference("");
      const data = await expensesApi.get(id);
      setExpense(data);
    } catch (err: any) {
      setActionError(err.message || "Imeshindwa kutoa fedha");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto" />
          <p className="text-gray-500 mt-3">Inapakia...</p>
        </div>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Link
          href="/admin/expenses"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
        >
          <FaArrowLeft /> Rudi
        </Link>
        <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-xl">
          <p className="font-medium text-red-800">Imeshindwa kupata matumizi</p>
          <p className="text-sm text-red-700 mt-1">{error || "Haipatikani"}</p>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[expense.status] || STATUS_CONFIG["Imeombwa"];
  const StatusIcon = status.icon;

  const userRole = (user?.role || "").toLowerCase();
  const userId = user?.id || "";
  const isRequester = expense.requested_by === userId;
  const isMhasibu = userRole === "mhasibu";

  const canApprove =
    expense.status === "Imeombwa" &&
    APPROVE_ROLES.includes(userRole) &&
    !isRequester;

  const canWithdraw =
    expense.status === "Imeidhinishwa" && WITHDRAW_ROLES.includes(userRole);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* ===== HEADER ===== */}
      <AnimatedSection>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/expenses"
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <FaArrowLeft className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Maelezo ya Matumizi
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Taarifa kamili za matumizi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${status.bg} ${status.color} ${status.border}`}
            >
              <StatusIcon /> {status.label}
            </span>

            {canApprove && (
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors"
              >
                {actionLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaCheckCircle />
                )}
                Idhinisha
              </button>
            )}

            {isMhasibu && expense.status === "Imeombwa" && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-amber-50 text-amber-800 border border-amber-300">
                <FaLock className="text-xs" />
                Inasubiri Idhini ya Mchungaji
              </div>
            )}

            {!isMhasibu && isRequester && expense.status === "Imeombwa" && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-50 text-gray-600 border border-gray-300">
                <FaLock className="text-xs" />
                Hauwezi Kuidhinisha Yako
              </div>
            )}

            {canWithdraw && (
              <button
                onClick={() => setShowWithdrawModal(true)}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors"
              >
                <FaUniversity /> Toa Fedha
              </button>
            )}
          </div>
        </div>
      </AnimatedSection>

      {/* Action error */}
      {actionError && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{actionError}</p>
          <button
            onClick={() => setActionError("")}
            className="text-red-400 hover:text-red-600"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* ===== HERO ===== */}
      <AnimatedSection delay={0.1}>
        <div className="bg-gradient-to-br from-church-600 via-church-500 to-church-400 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider opacity-80 font-semibold">
                Kiasi
              </p>
              <p className="text-4xl font-bold mt-2">
                {formatCurrency(expense.amount)}
              </p>
              <p className="text-sm opacity-90 mt-1">{expense.category}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs uppercase tracking-wider opacity-80 font-semibold">
                Tarehe ya Ombi
              </p>
              <p className="text-lg font-semibold mt-1">
                {formatDateTime(expense.created_at)}
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ===== TAARIFA ===== */}
      <AnimatedSection>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <FaInfoCircle className="text-church-500" /> Taarifa
            </h2>
          </div>
          <AnimatedStagger className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <DetailRow
              icon={FaMoneyBillWave}
              label="Kiasi"
              value={formatCurrency(expense.amount)}
            />
            <DetailRow
              icon={FaInfoCircle}
              label="Aina"
              value={expense.category}
            />
            {expense.receipt_number && (
              <DetailRow
                icon={FaInfoCircle}
                label="Namba ya Risiti"
                value={expense.receipt_number}
              />
            )}
            <DetailRow
              icon={FaInfoCircle}
              label="Sadaka Inayohusika"
              value={expense.offering_id}
            />
          </AnimatedStagger>
          <div className="px-5 pb-5">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
              Maelezo
            </p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl leading-relaxed">
              {expense.description}
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* ===== HISTORIA ===== */}
      <AnimatedSection>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <FaHistory className="text-church-500" /> Historia
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <TimelineItem
              icon={FaUser}
              color="text-blue-600 bg-blue-100 border border-blue-200"
              title="Iliombwa"
              person={expense.requested_by_name || "—"}
              date={expense.created_at}
            />
            {expense.approved_by_name && (
              <TimelineItem
                icon={FaCheckCircle}
                color="text-blue-600 bg-blue-100 border border-blue-200"
                title="Ilidhinishwa"
                person={expense.approved_by_name}
                date={expense.approved_at}
              />
            )}
            {expense.withdrawn_at && (
              <TimelineItem
                icon={FaUniversity}
                color="text-emerald-600 bg-emerald-100 border border-emerald-200"
                title="Imetolewa"
                person={expense.withdrawn_by_name || "—"}
                date={expense.withdrawn_at}
                extra={
                  expense.withdrawal_reference
                    ? `Kumbukumbu: ${expense.withdrawal_reference}`
                    : undefined
                }
              />
            )}
          </div>
          <div className="px-5 pb-5 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Mwisho kubadilishwa:{" "}
              {formatDateTime(expense.updated_at || expense.created_at)}
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* ===== WITHDRAW MODAL ===== */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <FaUniversity className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Toa Fedha</h3>
                  <p className="text-xs text-gray-500">
                    Thibitisha utoaji wa fedha
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawalReference("");
                }}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-xs text-emerald-800 uppercase font-semibold">
                  Kiasi cha Kutolewa
                </p>
                <p className="text-2xl font-bold text-emerald-900 mt-1">
                  {formatCurrency(expense.amount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kumbukumbu ya Malipo (hiari)
                </label>
                <input
                  type="text"
                  value={withdrawalReference}
                  onChange={(e) => setWithdrawalReference(e.target.value)}
                  placeholder="Mfano: Cheque Na. 12345"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
                  autoFocus
                />
              </div>

              <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                ⚠️ Uthibitisho huu utabadilisha hali ya matumizi kuwa{" "}
                <strong>Imetolewa</strong> — hatua hii haiwezi kurudishwa.
              </p>
            </div>

            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawalReference("");
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium"
              >
                Ghairi
              </button>
              <button
                onClick={handleWithdraw}
                disabled={actionLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-4 py-2.5 rounded-xl text-sm font-medium"
              >
                {actionLoading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Inatoa...
                  </>
                ) : (
                  <>
                    <FaCheck /> Thibitisha
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

// ============================================
// 🧩 COMPONENTS
// ============================================

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-church-50 rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon className="text-church-600 text-sm" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 font-medium uppercase">{label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-1 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

function TimelineItem({
  icon: Icon,
  color,
  title,
  person,
  date,
  extra,
}: {
  icon: any;
  color: string;
  title: string;
  person: string;
  date: string;
  extra?: string;
}) {
  const formatted = date
    ? new Date(date).toLocaleString("sw-TZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}
      >
        <Icon className="text-xs" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-sm text-gray-600">
          na <span className="font-medium text-gray-800">{person}</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">{formatted}</p>
        {extra && <p className="text-xs text-gray-500 mt-1 italic">{extra}</p>}
      </div>
    </div>
  );
}