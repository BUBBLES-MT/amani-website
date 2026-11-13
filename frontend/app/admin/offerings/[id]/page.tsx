// frontend/app/admin/offerings/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { offeringsApi } from "@/lib/api";
import {
  FaArrowLeft, FaSpinner, FaExclamationTriangle,
  FaCheckCircle, FaClock, FaUsers, FaUserTie,
  FaUser, FaCalendar, FaMoneyBillWave, FaInfoCircle,
  FaHistory, FaCheck, FaTimes, FaUniversity,
} from "react-icons/fa";
import AnimatedSection from "@/components/ui/AnimatedSection";
import AnimatedStagger from "@/components/ui/AnimatedStagger";

export default function OfferingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offering, setOffering] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const fetchOffering = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await offeringsApi.get(id);
        setOffering(data);
      } catch (err: any) {
        console.error("❌ Fetch offering error:", err);
        setError(err.message || "Imeshindwa kupata sadaka");
      } finally {
        setLoading(false);
      }
    };
    fetchOffering();
  }, [id]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("sw-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString("sw-TZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
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
          <p className="text-gray-500 mt-3">Inapakia maelezo...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ❌ ERROR
  // ============================================
  if (error || !offering) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Link
          href="/admin/offerings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
        >
          <FaArrowLeft /> Rudi kwenye orodha
        </Link>
        <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-xl">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Imeshindwa kupata sadaka</p>
              <p className="text-sm text-red-700 mt-1">{error || "Sadaka haipatikani"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // ✅ HALI YA SADAKA
  // ============================================
  const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
    Imerekodiwa: { color: "text-yellow-700", bg: "bg-yellow-100", icon: FaClock },
    Imeidhinishwa: { color: "text-blue-700", bg: "bg-blue-100", icon: FaCheckCircle },
    "Imepelekwa Bank": { color: "text-green-700", bg: "bg-green-100", icon: FaUniversity },
    Imecheleweshwa: { color: "text-orange-700", bg: "bg-orange-100", icon: FaClock },
    Imekataliwa: { color: "text-red-700", bg: "bg-red-100", icon: FaTimes },
  };
  const status = statusConfig[offering.status] || statusConfig["Imerekodiwa"];
  const StatusIcon = status.icon;

  const teamMembers = Array.isArray(offering.team_members)
    ? offering.team_members
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* ===== HEADER ===== */}
      <AnimatedSection>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/offerings"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">Maelezo ya Sadaka</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Taarifa kamili za sadaka na timu
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.bg} ${status.color}`}
          >
            <StatusIcon /> {offering.status}
          </span>
        </div>
      </AnimatedSection>

      {/* ===== TAARIFA ZA SADAKA ===== */}
      <AnimatedSection delay={0.1}>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-church-50 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Kiasi</p>
                <p className="text-3xl font-bold text-church-700 mt-1">
                  {formatCurrency(offering.amount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-semibold">Aina</p>
                <p className="text-lg font-semibold text-gray-800 mt-1">
                  {offering.offering_type}
                </p>
              </div>
            </div>
          </div>

          <AnimatedStagger className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <DetailRow
              icon={FaCalendar}
              label="Tarehe ya Ibada"
              value={formatDateTime(offering.service_date)}
            />
            <DetailRow
              icon={FaInfoCircle}
              label="Aina ya Ibada"
              value={offering.service_type}
            />
            <DetailRow
              icon={FaMoneyBillWave}
              label="Kiasi"
              value={formatCurrency(offering.amount)}
            />
            <DetailRow
              icon={FaUsers}
              label="Idadi ya Wanachama"
              value={String(offering.number_of_members || 0)}
            />
          </AnimatedStagger>

          {offering.description && (
            <div className="px-5 pb-5">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                Maelezo
              </p>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl">
                {offering.description}
              </p>
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* ===== TAARIFA ZA TIMU ===== */}
      <AnimatedSection>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <FaUsers className="text-church-500" /> Taarifa za Timu
            </h2>
          </div>

          <AnimatedStagger className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <DetailRow
              icon={FaUsers}
              label="Jina la Timu"
              value={offering.team_name || "—"}
            />
            <DetailRow
              icon={FaUserTie}
              label="Kiongozi wa Timu"
              value={offering.team_leader || "—"}
            />
          </AnimatedStagger>

          <div className="px-5 pb-5">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-3">
              Wanachama ({teamMembers.length})
            </p>
            {teamMembers.length === 0 ? (
              <p className="text-sm text-gray-400">Hakuna wanachama</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {teamMembers.map((name: string, i: number) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 bg-church-50 text-church-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                  >
                    <FaUser className="text-xs" /> {name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </AnimatedSection>

      {/* ===== AUDIT TRAIL ===== */}
      <AnimatedSection>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <FaHistory className="text-church-500" /> Historia ya Sadaka
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Nani alirekodi, alidhinisha, na kupeleka bank — na lini
            </p>
          </div>

          <div className="p-5 space-y-4">
            <TimelineItem
              icon={FaUser}
              color="text-blue-600 bg-blue-100"
              title="Ilirekodiwa"
              person={offering.recorded_by_name || "—"}
              date={offering.created_at}
            />

            {offering.approved_by_name && (
              <TimelineItem
                icon={FaCheck}
                color="text-green-600 bg-green-100"
                title="Ilidhinishwa"
                person={offering.approved_by_name}
                date={offering.approved_at}
              />
            )}

            {offering.bank_reference && (
              <TimelineItem
                icon={FaUniversity}
                color="text-purple-600 bg-purple-100"
                title="Ilipelekwa Benki"
                person={offering.deposited_by || "—"}
                date={offering.deposited_at}
                extra={`Kumbukumbu: ${offering.bank_reference}`}
              />
            )}

            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Mwisho kubadilishwa:{" "}
                {formatDateTime(offering.updated_at || offering.created_at)}
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}

// ============================================
// 🧩 COMPONENTS
// ============================================

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 bg-church-50 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="text-church-600 text-sm" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5 break-words">{value}</p>
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
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="text-sm" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-sm text-gray-600">
          na <span className="font-medium text-gray-800">{person}</span>
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{formatted}</p>
        {extra && <p className="text-xs text-gray-500 mt-1 italic">{extra}</p>}
      </div>
    </div>
  );
}