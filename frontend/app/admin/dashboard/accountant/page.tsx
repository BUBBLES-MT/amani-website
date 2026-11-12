// frontend/app/admin/dashboard/accountant/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { reportsApi, offeringsApi, expensesApi, userStorage } from "@/lib/api";
import {
  FaHands, FaMoneyBillWave, FaPlus, FaSpinner, FaExclamationTriangle,
  FaCheckCircle, FaClock, FaWallet, FaArrowDown, FaUniversity,
  FaUsers,
} from "react-icons/fa";

export default function AccountantDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalOfferings: 0,
    totalExpenses: 0,
    balance: 0,
    pendingExpenses: 0,
  });
  const [recentOfferings, setRecentOfferings] = useState<any[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  // ============================================
  // 📥 FETCH
  // ============================================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      setUser(userStorage.get());

      try {
        // ✅ Pata takwimu kutoka API
        const [offeringsData, expensesData] = await Promise.all([
          offeringsApi.list({ limit: 100 }),
          expensesApi.list({ limit: 100 }),
        ]);

        const offerings = Array.isArray(offeringsData) ? offeringsData : [];
        const expenses = Array.isArray(expensesData) ? expensesData : [];

        // ✅ Hesabu
        const totalOfferings = offerings.reduce(
          (sum, o) => sum + Number(o.amount || 0), 0
        );
        const totalExpenses = expenses
          .filter((e) => e.status === "Imetolewa")
          .reduce((sum, e) => sum + Number(e.amount || 0), 0);
        const pendingExpenses = expenses
          .filter((e) => e.status === "Imeombwa").length;
        const balance = totalOfferings - totalExpenses;

        setStats({
          totalOfferings,
          totalExpenses,
          balance,
          pendingExpenses,
        });

        // ✅ Recent 5 offerings
        setRecentOfferings(offerings.slice(0, 5));

        // ✅ Recent 5 expenses
        setRecentExpenses(expenses.slice(0, 5));
      } catch (err: any) {
        console.error("❌ Dashboard fetch error:", err);
        setError(err.message || "Imeshindwa kupata data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("sw-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("sw-TZ", {
        day: "2-digit", month: "2-digit", year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // ============================================
  // 🎨 STAT CARDS
  // ============================================
  const statCards = [
    {
      label: "Jumla ya Sadaka",
      value: formatCurrency(stats.totalOfferings),
      color: "text-church-500",
      bg: "bg-church-50",
      icon: FaHands,
    },
    {
      label: "Matumizi Yaliyotolewa",
      value: formatCurrency(stats.totalExpenses),
      color: "text-rose-500",
      bg: "bg-rose-50",
      icon: FaMoneyBillWave,
    },
    {
      label: "Salio Lililobaki",
      value: formatCurrency(stats.balance),
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      icon: FaWallet,
    },
    {
      label: "Maombi Yanasubiri",
      value: stats.pendingExpenses,
      color: "text-amber-500",
      bg: "bg-amber-50",
      icon: FaClock,
    },
  ];

  // ============================================
  // ⏳ LOADING
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto" />
          <p className="text-gray-500 mt-3">Inapakia data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard ya Mhasibu
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Karibu, {user?.name || "Mhasibu"}! Hii ni muhtasari wa fedha za kanisa.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700 flex-1">{error}</p>
        </div>
      )}

      {/* ============================================ */}
      {/* STAT CARDS */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bg} p-3 rounded-xl`}>
                <stat.icon className={`${stat.color} text-xl`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================ */}
      {/* QUICK ACTIONS */}
      {/* ============================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/admin/offerings/new"
          className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-all duration-300 hover:scale-[1.02] group"
        >
          <div className="bg-church-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <FaPlus className="text-white text-xl" />
          </div>
          <p className="text-sm font-medium text-gray-700">Rekodi Sadaka</p>
        </Link>

        <Link
          href="/admin/expenses/new"
          className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-all duration-300 hover:scale-[1.02] group"
        >
          <div className="bg-rose-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <FaArrowDown className="text-white text-xl" />
          </div>
          <p className="text-sm font-medium text-gray-700">Omba Matumizi</p>
        </Link>

        <Link
          href="/admin/expenses"
          className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-all duration-300 hover:scale-[1.02] group"
        >
          <div className="bg-amber-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <FaCheckCircle className="text-white text-xl" />
          </div>
          <p className="text-sm font-medium text-gray-700">Idhinisha Matumizi</p>
        </Link>

        <Link
          href="/admin/offerings"
          className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-all duration-300 hover:scale-[1.02] group"
        >
          <div className="bg-emerald-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <FaUniversity className="text-white text-xl" />
          </div>
          <p className="text-sm font-medium text-gray-700">Ona Sadaka Zote</p>
        </Link>
      </div>

      {/* ============================================ */}
      {/* RECENT OFFERINGS */}
      {/* ============================================ */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg text-gray-800">
            Sadaka za Hivi Karibuni
          </h3>
          <Link
            href="/admin/offerings"
            className="text-church-600 text-sm hover:text-church-800 transition-colors"
          >
            Ona Zote
          </Link>
        </div>
        <div className="overflow-x-auto">
          {recentOfferings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FaHands className="text-5xl text-gray-300 mx-auto mb-3" />
              <p>Hakuna sadaka zilizorekodiwa bado</p>
              <Link
                href="/admin/offerings/new"
                className="inline-flex items-center gap-2 mt-4 bg-church-500 text-white px-5 py-2 rounded-xl hover:bg-church-600 transition-colors"
              >
                <FaPlus /> Rekodi Sadaka
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Tarehe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Ibada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Kiasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Hali
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Aliyerekodi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOfferings.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(item.service_date || item.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.service_type || item.service || "Ibada"}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.status === "Imeidhinishwa" || item.status === "Imepelekwa Bank"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status === "Imeidhinishwa" || item.status === "Imepelekwa Bank" ? (
                          <FaCheckCircle />
                        ) : (
                          <FaClock />
                        )}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.recorded_by_name || item.recorded_by || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* RECENT EXPENSES */}
      {/* ============================================ */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg text-gray-800">
            Matumizi ya Hivi Karibuni
          </h3>
          <Link
            href="/admin/expenses"
            className="text-church-600 text-sm hover:text-church-800 transition-colors"
          >
            Ona Zote
          </Link>
        </div>
        <div className="overflow-x-auto">
          {recentExpenses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FaMoneyBillWave className="text-5xl text-gray-300 mx-auto mb-3" />
              <p>Hakuna matumizi yaliyorekodiwa bado</p>
              <Link
                href="/admin/expenses/new"
                className="inline-flex items-center gap-2 mt-4 bg-rose-500 text-white px-5 py-2 rounded-xl hover:bg-rose-600 transition-colors"
              >
                <FaPlus /> Omba Matumizi
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Tarehe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Aina
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Maelezo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Kiasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Hali
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentExpenses.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.status === "Imetolewa"
                            ? "bg-emerald-100 text-emerald-700"
                            : item.status === "Imeidhinishwa"
                            ? "bg-blue-100 text-blue-700"
                            : item.status === "Imekataliwa"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.status === "Imetolewa" || item.status === "Imeidhinishwa" ? (
                          <FaCheckCircle />
                        ) : (
                          <FaClock />
                        )}
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}