// frontend/app/admin/dashboard/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { reportsApi, offeringsApi, expensesApi, eventsApi, userStorage } from "@/lib/api";
import {
  FaUsers, FaHands, FaMoneyBillWave, FaChurch, FaCalendar,
  FaClock, FaCheckCircle, FaPlus, FaSpinner, FaExclamationTriangle,
} from "react-icons/fa";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    members: 0,
    offerings: 0,
    expenses: 0,
    events: 0,
  });
  const [recentOfferings, setRecentOfferings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  // ============================================
  // ✅ REDIRECT kwa roles maalum
  // ============================================
  useEffect(() => {
    const currentUser = userStorage.get();
    setUser(currentUser);

    if (!currentUser) {
      router.replace("/admin/login");
      return;
    }

    const role = currentUser.role?.toLowerCase();

    // ✅ Redirect kwa roles maalum
    if (role === "mhasibu") {
      router.replace("/admin/dashboard/accountant");
      return;
    }
    if (role === "mzee_kanisa") {
      router.replace("/admin/dashboard/elder");
      return;
    }
    if (role === "it") {
      router.replace("/admin/dashboard/it");
      return;
    }
  }, [router]);

  // ============================================
  // ✅ FETCH DASHBOARD DATA
  // ============================================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      setUser(userStorage.get());

      try {
        const data = await reportsApi.dashboard();

        setStats({
          members: data.total_members || 0,
          offerings: data.total_offerings || 0,
          expenses: data.total_expenses || 0,
          events: data.total_events || 0,
        });
        setRecentOfferings(data.recent_offerings || []);
      } catch (err: any) {
        console.error("❌ Dashboard fetch error:", err);
        setError(err.message || "Imeshindwa kupata data");

        try {
          const [offerings, expenses, events] = await Promise.all([
            offeringsApi.list({ limit: 100 }),
            expensesApi.list({ limit: 100 }),
            eventsApi.list({ limit: 100 }),
          ]);

          const totalOfferings = Array.isArray(offerings)
            ? offerings.reduce((sum, o) => sum + Number(o.amount || 0), 0)
            : 0;
          const totalExpenses = Array.isArray(expenses)
            ? expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
            : 0;
          const totalEvents = Array.isArray(events) ? events.length : 0;

          setStats({
            members: 0,
            offerings: totalOfferings,
            expenses: totalExpenses,
            events: totalEvents,
          });

          if (Array.isArray(offerings)) {
            setRecentOfferings(offerings.slice(0, 5));
          }
        } catch (fallbackErr: any) {
          console.error("❌ Fallback fetch error:", fallbackErr);
        }
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

  const statCards = [
    { label: "Viongozi", value: stats.members, color: "text-church-500", bg: "bg-church-50", icon: FaUsers },
    { label: "Sadaka", value: formatCurrency(stats.offerings), color: "text-green-500", bg: "bg-green-50", icon: FaHands },
    { label: "Matumizi", value: formatCurrency(stats.expenses), color: "text-red-500", bg: "bg-red-50", icon: FaMoneyBillWave },
    { label: "Matukio", value: stats.events, color: "text-gold-500", bg: "bg-yellow-50", icon: FaCalendar },
  ];

  const quickActions = [
    { label: "Rekodi Sadaka", icon: FaHands, color: "bg-church-500", link: "/admin/offerings/new" },
    { label: "Rekodi Matumizi", icon: FaMoneyBillWave, color: "bg-green-500", link: "/admin/expenses/new" },
    { label: "Viongozi", icon: FaUsers, color: "bg-blue-500", link: "/admin/users" },
    { label: "Matukio", icon: FaCalendar, color: "bg-gold-500", link: "/admin/events/new" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Karibu, {user?.name || "Admin"}! Hii ni muhtasari wa kanisa.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700 flex-1">
            Imeshindwa kupata takwimu rasmi. Data inaonyeshwa kutoka API nyingine.
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {loading ? <FaSpinner className="animate-spin inline text-church-500" /> : stat.value}
                </p>
              </div>
              <div className={`${stat.bg} p-3 rounded-xl`}>
                <stat.icon className={`${stat.color} text-xl`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, i) => (
          <Link
            key={i}
            href={action.link}
            className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-all duration-300 hover:scale-[1.02] group"
          >
            <div className={`${action.color} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
              <action.icon className="text-white text-xl" />
            </div>
            <p className="text-sm font-medium text-gray-700">{action.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Offerings */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg text-gray-800">Sadaka za Hivi Karibuni</h3>
          <Link href="/admin/offerings" className="text-church-600 text-sm hover:text-church-800 transition-colors">
            Ona Zote
          </Link>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto" />
              <p className="text-gray-500 mt-3">Inapakia data...</p>
            </div>
          ) : recentOfferings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FaHands className="text-5xl text-gray-300 mx-auto mb-3" />
              <p>Hakuna sadaka zilizorekodiwa bado</p>
              <Link href="/admin/offerings/new" className="inline-flex items-center gap-2 mt-4 bg-church-500 text-white px-5 py-2 rounded-xl hover:bg-church-600 transition-colors">
                <FaPlus /> Rekodi Sadaka ya Kwanza
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tarehe</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ibada</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Kiasi</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Hali</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Aliyerekodi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOfferings.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(item.service_date || item.date)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.service_type || item.service || "Ibada"}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.status === "Imeidhinishwa" || item.status === "Imepelekwa Bank"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {item.status === "Imeidhinishwa" || item.status === "Imepelekwa Bank" ? <FaCheckCircle /> : <FaClock />}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.recorded_by_name || item.recorded_by || "—"}</td>
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