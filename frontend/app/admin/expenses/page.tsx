// frontend/app/admin/expenses/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { expensesApi } from "@/lib/api";
import {
  FaPlus, FaSpinner, FaExclamationTriangle, FaMoneyBillWave,
  FaCheckCircle, FaClock, FaSearch, FaEye, FaUniversity,
  FaTimesCircle, FaFilter,
} from "react-icons/fa";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function ExpensesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await expensesApi.list();
        setExpenses(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("❌ Expenses fetch error:", err);
        setError(err.message || "Imeshindwa kupata matumizi");
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

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

  const filtered = expenses.filter((e) => {
    const matchesSearch =
      !search ||
      (e.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.requested_by_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.category || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filterStatus || e.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const uniqueStatuses = Array.from(
    new Set(expenses.map((e) => e.status).filter(Boolean))
  );

  const statusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: any }> = {
      Imeombwa: { bg: "bg-amber-100", text: "text-amber-800", icon: FaClock },
      Imeidhinishwa: { bg: "bg-blue-100", text: "text-blue-800", icon: FaCheckCircle },
      Imetolewa: { bg: "bg-emerald-100", text: "text-emerald-800", icon: FaUniversity },
    };
    const c = config[status] || config["Imeombwa"];
    const Icon = c.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
      >
        <Icon /> {status || "Imeombwa"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <AnimatedSection>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Matumizi</h1>
            <p className="text-gray-500 text-sm mt-1">
              Orodha ya matumizi yote
            </p>
          </div>
          <Link
            href="/admin/expenses/new"
            className="inline-flex items-center gap-2 bg-church-500 hover:bg-church-600 text-white px-5 py-2.5 rounded-xl transition-colors font-medium text-sm shadow-sm"
          >
            <FaPlus /> Omba Matumizi
          </Link>
        </div>
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
                placeholder="Tafuta kwa maelezo, aina, au aliyeomba..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 focus:border-transparent text-sm"
              />
            </div>
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
            {filtered.length} kati ya {expenses.length} matumizi
          </p>
        </div>
      </AnimatedSection>

      {/* ===== EXPENSES TABLE ===== */}
      <AnimatedSection>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-16">
              <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto" />
              <p className="text-gray-500 mt-3">Inapakia matumizi...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <FaMoneyBillWave className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="font-medium">
                {expenses.length === 0
                  ? "Hakuna matumizi bado"
                  : "Hakuna matumizi yanayolingana"}
              </p>
              {expenses.length === 0 && (
                <Link
                  href="/admin/expenses/new"
                  className="inline-flex items-center gap-2 mt-5 bg-church-500 text-white px-5 py-2.5 rounded-xl hover:bg-church-600 transition-colors"
                >
                  <FaPlus /> Omba Matumizi
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
                      Maelezo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Aina
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Kiasi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Hali
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Aliyeomba
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                      Vitendo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium max-w-xs truncate">
                        {item.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.category}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-4 py-3">{statusBadge(item.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.requested_by_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/expenses/${item.id}`}
                          className="inline-flex items-center gap-1.5 text-church-600 hover:text-church-800 text-sm font-medium transition-colors"
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
      </AnimatedSection>
    </div>
  );
}