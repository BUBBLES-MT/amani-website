// frontend/app/admin/offerings/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { offeringsApi } from "@/lib/api";
import {
  FaPlus,
  FaSpinner,
  FaExclamationTriangle,
  FaHands,
  FaCheckCircle,
  FaClock,
  FaSearch,
  FaEye,
  FaFilter,
  FaTimesCircle,
  FaUniversity,
  FaMoneyBillWave,
  FaWallet,
  FaArrowDown,
} from "react-icons/fa";

export default function OfferingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offerings, setOfferings] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ============================================
  // 📥 FETCH
  // ============================================
  useEffect(() => {
    const fetchOfferings = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await offeringsApi.list();

        if (Array.isArray(data)) {
          setOfferings(data);
        } else if (data && typeof data === "object") {
          const maybeItems = (data as any).items;
          setOfferings(Array.isArray(maybeItems) ? maybeItems : []);
        } else {
          setOfferings([]);
        }
      } catch (err: any) {
        console.error("❌ Offerings fetch error:", err);
        setError(err.message || "Imeshindwa kupata sadaka");
        setOfferings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOfferings();
  }, []);

  // ============================================
  // 🎨 FORMAT
  // ============================================
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("sw-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("sw-TZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // ============================================
  // 🔍 FILTER
  // ============================================
  const filtered = offerings.filter((o) => {
    const matchesSearch =
      !search ||
      (o.team_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.team_leader || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.recorded_by_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.service_type || "").toLowerCase().includes(search.toLowerCase()) ||
      String(o.amount || "").includes(search);

    const matchesType = !filterType || o.offering_type === filterType;
    const matchesStatus = !filterStatus || o.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // ✅ Aina na hali zilizopo kwenye data (kwa filters)
  const uniqueTypes = Array.from(
    new Set(offerings.map((o) => o.offering_type).filter(Boolean))
  );
  const uniqueStatuses = Array.from(
    new Set(offerings.map((o) => o.status).filter(Boolean))
  );

  // ============================================
  // ✅ TOTALS — Jumla ya sadaka, matumizi, salio
  // ============================================
  const totals = filtered.reduce(
    (acc, o) => ({
      amount: acc.amount + Number(o.amount || 0),
      total_expenses: acc.total_expenses + Number(o.total_expenses || 0),
      balance: acc.balance + Number(o.balance || 0),
    }),
    { amount: 0, total_expenses: 0, balance: 0 }
  );

  // ============================================
  // 🎨 STATUS BADGE
  // ============================================
  const statusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: any }> = {
      Imerekodiwa: { bg: "bg-yellow-100", text: "text-yellow-700", icon: FaClock },
      Imeidhinishwa: { bg: "bg-blue-100", text: "text-blue-700", icon: FaCheckCircle },
      "Imepelekwa Bank": { bg: "bg-green-100", text: "text-green-700", icon: FaUniversity },
      Imecheleweshwa: { bg: "bg-orange-100", text: "text-orange-700", icon: FaClock },
      Imekataliwa: { bg: "bg-red-100", text: "text-red-700", icon: FaTimesCircle },
    };
    const c = config[status] || config["Imerekodiwa"];
    const Icon = c.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
      >
        <Icon /> {status || "Imerekodiwa"}
      </span>
    );
  };

  // ============================================
  // 🖼️ RENDER
  // ============================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sadaka</h1>
          <p className="text-gray-500 text-sm mt-1">
            Orodha ya sadaka zote zilizorekodiwa
          </p>
        </div>
        <Link
          href="/admin/offerings/new"
          className="inline-flex items-center gap-2 bg-church-500 hover:bg-church-600 text-white px-5 py-2.5 rounded-xl transition-colors font-medium text-sm shadow-sm"
        >
          <FaPlus /> Rekodi Sadaka Mpya
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
        </div>
      )}

      {/* ============================================ */}
      {/* ✅ TOTALS — Jumla ya Sadaka, Matumizi, Salio */}
      {/* ============================================ */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Jumla ya Sadaka */}
          <div className="bg-gradient-to-br from-church-500 to-church-600 rounded-2xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider opacity-80 font-semibold">
                  Jumla ya Sadaka
                </p>
                <p className="text-2xl font-bold mt-2">
                  {formatCurrency(totals.amount)}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  {filtered.length} sadaka
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FaHands className="text-2xl" />
              </div>
            </div>
          </div>

          {/* Jumla ya Matumizi */}
          <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider opacity-80 font-semibold">
                  Jumla ya Matumizi
                </p>
                <p className="text-2xl font-bold mt-2">
                  {formatCurrency(totals.total_expenses)}
                </p>
                <p className="text-xs opacity-75 mt-1">Imetolewa</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FaMoneyBillWave className="text-2xl" />
              </div>
            </div>
          </div>

          {/* Salio Lililobaki */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider opacity-80 font-semibold">
                  Salio Lililobaki
                </p>
                <p className="text-2xl font-bold mt-2">
                  {formatCurrency(totals.balance)}
                </p>
                <p className="text-xs opacity-75 mt-1">Kinachopatikana</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FaWallet className="text-2xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tafuta kwa timu, kiongozi, au aliyerekodi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 focus:border-transparent text-sm"
            />
          </div>

          {/* Filter: Type */}
          <div className="relative">
            <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-11 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 focus:border-transparent text-sm bg-white min-w-[180px]"
            >
              <option value="">Aina zote</option>
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 focus:border-transparent text-sm bg-white min-w-[160px]"
          >
            <option value="">Hali zote</option>
            {uniqueStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <p className="text-xs text-gray-400">
          {filtered.length} kati ya {offerings.length} sadaka
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto" />
            <p className="text-gray-500 mt-3">Inapakia sadaka...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FaHands className="text-5xl text-gray-300 mx-auto mb-3" />
            <p className="font-medium">
              {offerings.length === 0
                ? "Hakuna sadaka zilizorekodiwa bado"
                : "Hakuna sadaka inayolingana na vichujio"}
            </p>
            {offerings.length === 0 && (
              <Link
                href="/admin/offerings/new"
                className="inline-flex items-center gap-2 mt-5 bg-church-500 text-white px-5 py-2.5 rounded-xl hover:bg-church-600 transition-colors"
              >
                <FaPlus /> Rekodi Sadaka
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Tarehe
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Ibada
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Aina
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Timu
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Kiasi
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Matumizi
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Salio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Hali
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Aliyerekodi
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Vitendo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => {
                  const totalExp = Number(item.total_expenses || 0);
                  const bal = Number(item.balance || 0);
                  const isFullyUsed = bal === 0 && totalExp > 0;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(item.service_date || item.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.service_type || item.service || "Ibada"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.offering_type || "Sadaka"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.team_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-rose-600 text-right">
                        {totalExp > 0 ? formatCurrency(totalExp) : "—"}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm font-bold text-right ${
                          isFullyUsed
                            ? "text-rose-600"
                            : bal > 0
                            ? "text-emerald-600"
                            : "text-gray-400"
                        }`}
                      >
                        {formatCurrency(bal)}
                      </td>
                      <td className="px-4 py-3">{statusBadge(item.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.recorded_by_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/offerings/${item.id}`}
                          className="inline-flex items-center gap-1.5 text-church-600 hover:text-church-800 text-sm font-medium transition-colors"
                        >
                          <FaEye /> Ona
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* ✅ TOTAL ROW */}
              <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-4 text-sm font-bold text-gray-800 uppercase tracking-wide"
                  >
                    <FaArrowDown className="inline mr-2 text-church-500" />
                    Jumla Kuu
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-800 text-right">
                    {formatCurrency(totals.amount)}
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-rose-600 text-right">
                    {formatCurrency(totals.total_expenses)}
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-emerald-600 text-right">
                    {formatCurrency(totals.balance)}
                  </td>
                  <td colSpan={3} className="px-4 py-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}