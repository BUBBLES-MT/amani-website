// frontend/app/admin/dashboard/elder/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { offeringsApi, userStorage } from "@/lib/api";
import {
  FaHands, FaPlus, FaSpinner, FaExclamationTriangle,
  FaCheckCircle, FaClock, FaWallet, FaUsers,
} from "react-icons/fa";
import AnimatedSection from "@/components/ui/AnimatedSection";
import AnimatedStagger from "@/components/ui/AnimatedStagger";

export default function ElderDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalOfferings: 0,
    totalRecorded: 0,
    totalApproved: 0,
    totalBalance: 0,
  });
  const [recentOfferings, setRecentOfferings] = useState<any[]>([]);
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
        const offeringsData = await offeringsApi.list({ limit: 100 });
        const offerings = Array.isArray(offeringsData) ? offeringsData : [];

        const totalOfferings = offerings.reduce(
          (sum, o) => sum + Number(o.amount || 0), 0
        );

        const totalRecorded = offerings.filter(
          (o) => o.status === "Imerekodiwa"
        ).length;

        const totalApproved = offerings.filter(
          (o) => o.status === "Imeidhinishwa" || o.status === "Imepelekwa Bank"
        ).length;

        const totalBalance = offerings.reduce(
          (sum, o) => sum + Number(o.balance || 0), 0
        );

        setStats({
          totalOfferings,
          totalRecorded,
          totalApproved,
          totalBalance,
        });

        setRecentOfferings(offerings.slice(0, 5));
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
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
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
      label: "Zinazosubiri Idhini",
      value: stats.totalRecorded,
      color: "text-amber-500",
      bg: "bg-amber-50",
      icon: FaClock,
    },
    {
      label: "Zilizoidhinishwa",
      value: stats.totalApproved,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      icon: FaCheckCircle,
    },
    {
      label: "Salio la Sadaka",
      value: formatCurrency(stats.totalBalance),
      color: "text-blue-500",
      bg: "bg-blue-50",
      icon: FaWallet,
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
      {/* ===== HEADER ===== */}
      <AnimatedSection>
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard ya Mzee wa Kanisa
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Karibu, {user?.name || "Mzee wa Kanisa"}! Rekodi na uangalie sadaka za kanisa.
        </p>
      </AnimatedSection>

      {/* ===== ERROR ===== */}
      {error && (
        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700 flex-1">{error}</p>
        </div>
      )}

      {/* ===== STAT CARDS ===== */}
      <AnimatedSection>
        <AnimatedStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </AnimatedStagger>
      </AnimatedSection>

      {/* ===== QUICK ACTIONS ===== */}
      <AnimatedSection>
        <AnimatedStagger className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/offerings/new"
            className="bg-gradient-to-br from-church-500 to-church-700 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaPlus className="text-2xl" />
              </div>
              <div>
                <p className="font-bold text-lg">Rekodi Sadaka Mpya</p>
                <p className="text-sm opacity-90">Ongeza sadaka ya ibada</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/offerings"
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-300 hover:scale-[1.02] group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-church-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaHands className="text-2xl text-church-500" />
              </div>
              <div>
                <p className="font-bold text-lg text-gray-800">Ona Sadaka Zote</p>
                <p className="text-sm text-gray-500">Tazama historia ya sadaka</p>
              </div>
            </div>
          </Link>
        </AnimatedStagger>
      </AnimatedSection>

      {/* ===== RECENT OFFERINGS ===== */}
      <AnimatedSection>
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
                  <FaPlus /> Rekodi Sadaka ya Kwanza
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
                      Aina
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
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.offering_type || "Sadaka"}
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
      </AnimatedSection>

      {/* ===== INFO CARD ===== */}
      <AnimatedSection>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FaUsers className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Wajibu Wako kama Mzee wa Kanisa
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Unahusika na kurekodi sadaka za ibada pamoja na wazee wengine.
                Kila ibada ina wazee wawili au wanne wanaohusika.
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}