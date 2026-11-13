// frontend/app/admin/dashboard/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  reportsApi,
  offeringsApi,
  expensesApi,
  eventsApi,
  userStorage,
} from "@/lib/api";
import {
  FaUsers, FaHands, FaMoneyBillWave, FaCalendar,
  FaClock, FaCheckCircle, FaPlus, FaSpinner,
  FaExclamationTriangle, FaArrowRight, FaChartLine,
  FaWallet,
} from "react-icons/fa";
import AnimatedSection from "@/components/ui/AnimatedSection";
import AnimatedStagger from "@/components/ui/AnimatedStagger";

// ============================================
// 🎯 ROLES ZINAZORUHUSIWA KUONA DASHBOARD HII
// ============================================
const ALLOWED_ROLES = [
  "super_admin",
  "mchungaji_kiongozi",
  "mchungaji_msaidizi",
  "mwinjilist",
  "mwenyekiti",
  "mwenyekiti_msaidizi",
  "katibu_mkuu",
];

// ============================================
// 🎯 REDIRECT MAP — role → dashboard yake
// ============================================
const ROLE_REDIRECTS: Record<string, string> = {
  mhasibu: "/admin/dashboard/accountant",
  mzee_kanisa: "/admin/dashboard/elder",
  it: "/admin/dashboard/it",
};

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

  // ✅ MPYA: inazuia render ya dashboard kama redirect inaendelea
  const [isRedirecting, setIsRedirecting] = useState(false);

  // ============================================
  // 🚦 EFFECT #1 — AUTH + ROLE GATE (KABLA YA FETCH)
  // ============================================
  useEffect(() => {
    const currentUser = userStorage.get();

    // Hakuna user → login
    if (!currentUser) {
      router.replace("/admin/login");
      return;
    }

    const role = currentUser.role?.toLowerCase() || "";

    // ✅ Kama role sio ya dashboard hii → redirect PAPO HAPO
    //    Bila kuonyesha dashboard, bila kufetch data
    if (ROLE_REDIRECTS[role]) {
      setIsRedirecting(true);
      router.replace(ROLE_REDIRECTS[role]);
      return;
    }

    // ✅ Kama role haipo kwenye ALLOWED_ROLES → redirect dashboard kuu (salama)
    if (!ALLOWED_ROLES.includes(role)) {
      setIsRedirecting(true);
      router.replace("/admin/login");
      return;
    }

    // ✅ Role ipo sawa — ruhusu render
    setUser(currentUser);
    setIsRedirecting(false);
  }, [router]);

  // ============================================
  // 📥 EFFECT #2 — FETCH (INAENDESHA TU KAMA ROLE SAHIHI)
  // ============================================
  useEffect(() => {
    // ✅ USIFETCH kama redirect inaendelea
    if (isRedirecting) return;

    // ✅ USIFETCH kama user haipo bado
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");

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
  }, [user, isRedirecting]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("sw-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("sw-TZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // ============================================
  // 🚦 LOADING SCREEN — kabla ya kuamua role
  // ============================================
  if (isRedirecting || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-church-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 mt-4 font-medium">
            {isRedirecting ? "Inakuelekeza kwenye dashboard yako..." : "Inathibitisha..."}
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // 🎨 STAT CARDS
  // ============================================
  const statCards = [
    {
      label: "Viongozi",
      value: stats.members,
      gradient: "from-church-500 via-church-600 to-church-700",
      icon: FaUsers,
      hint: "Watumiaji waliosajiliwa",
    },
    {
      label: "Sadaka",
      value: formatCurrency(stats.offerings),
      gradient: "from-emerald-500 via-emerald-600 to-teal-700",
      icon: FaHands,
      hint: "Jumla ya michango",
    },
    {
      label: "Matumizi",
      value: formatCurrency(stats.expenses),
      gradient: "from-rose-500 via-rose-600 to-pink-700",
      icon: FaMoneyBillWave,
      hint: "Matumizi yaliyotumika",
    },
    {
      label: "Matukio",
      value: stats.events,
      gradient: "from-amber-500 via-orange-500 to-orange-600",
      icon: FaCalendar,
      hint: "Matukio yajayo",
    },
  ];

  // ============================================
  // 🎨 QUICK ACTIONS
  // ============================================
  const quickActions = [
    {
      label: "Rekodi Sadaka",
      desc: "Ongeza mchango mpya",
      icon: FaHands,
      gradient: "from-church-500 to-church-700",
      link: "/admin/offerings/new",
    },
    {
      label: "Rekodi Matumizi",
      desc: "Weka gharama mpya",
      icon: FaMoneyBillWave,
      gradient: "from-emerald-500 to-teal-700",
      link: "/admin/expenses/new",
    },
    {
      label: "Viongozi",
      desc: "Simamia watumiaji",
      icon: FaUsers,
      gradient: "from-blue-500 to-indigo-700",
      link: "/admin/users",
    },
    {
      label: "Matukio",
      desc: "Panga tukio jipya",
      icon: FaCalendar,
      gradient: "from-amber-500 to-orange-600",
      link: "/admin/events/new",
    },
  ];

  return (
    <div className="min-h-screen -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-6 md:py-8 bg-gradient-to-br from-sky-100 via-blue-100 to-church-100 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative space-y-6 md:space-y-8">
        {/* ============================================
            HERO HEADER
            ============================================ */}
        <AnimatedSection>
          <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-church-600 via-church-700 to-church-900 p-6 md:p-8 lg:p-10 text-white shadow-xl shadow-church-900/20">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gold-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="min-w-0">
                <p className="text-white/70 text-xs md:text-sm uppercase tracking-wider font-semibold">
                  Dashboard ya Kanisa
                </p>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold mt-2 leading-tight">
                  Karibu tena, {user?.name?.split(" ")[0] || "Admin"}! 👋
                </h1>
                <p className="text-white/80 text-sm md:text-base mt-2 max-w-xl">
                  Hii ni muhtasari wa kanisa lako. Angalia takwimu, simamia
                  sadaka, na fuatilia matukio — vyote mahali pamoja.
                </p>
              </div>
              <Link
                href="/admin/offerings/new"
                className="inline-flex items-center justify-center gap-2 bg-white text-church-700 hover:bg-gray-100 px-5 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all hover:scale-[1.02] whitespace-nowrap"
              >
                <FaPlus /> Rekodi Sadaka
              </Link>
            </div>
          </div>
        </AnimatedSection>

        {/* ============================================
            ERROR ALERT
            ============================================ */}
        {error && (
          <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-xl flex items-start gap-3 shadow-sm">
            <FaExclamationTriangle className="text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800 flex-1">
              Imeshindwa kupata takwimu rasmi. Data inaonyeshwa kutoka API nyingine.
            </p>
          </div>
        )}

        {/* ============================================
            STAT CARDS
            ============================================ */}
        <AnimatedSection>
          <AnimatedStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {statCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.gradient} p-5 md:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group`}
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none group-hover:bg-white/30 transition-all" />

                  <div className="relative space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 md:w-10 md:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="text-sm md:text-base" />
                      </div>
                      <p className="text-white/85 text-[11px] md:text-xs uppercase tracking-wider font-semibold">
                        {stat.label}
                      </p>
                    </div>

                    <p
                      className="text-xl sm:text-2xl md:text-[22px] lg:text-2xl xl:text-[26px] font-bold tracking-tight break-words leading-tight tabular-nums"
                      title={String(stat.value)}
                    >
                      {loading ? (
                        <FaSpinner className="animate-spin inline text-white/80" />
                      ) : (
                        stat.value
                      )}
                    </p>

                    <p className="text-white/70 text-[10px] md:text-xs">
                      {stat.hint}
                    </p>
                  </div>
                </div>
              );
            })}
          </AnimatedStagger>
        </AnimatedSection>

        {/* ============================================
            QUICK ACTIONS
            ============================================ */}
        <AnimatedSection>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-1 h-5 bg-church-500 rounded-full" />
              Vitendo vya Haraka
            </h2>
          </div>
          <AnimatedStagger className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <Link
                  key={i}
                  href={action.link}
                  className="group relative bg-white rounded-2xl p-4 md:p-5 border border-slate-200 hover:border-church-300 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="text-white text-base md:text-lg" />
                  </div>
                  <p className="text-sm md:text-base font-semibold text-slate-800 leading-tight">
                    {action.label}
                  </p>
                  <p className="text-[11px] md:text-xs text-slate-500 mt-1">
                    {action.desc}
                  </p>
                  <FaArrowRight className="absolute top-4 right-4 text-slate-300 group-hover:text-church-500 group-hover:translate-x-1 transition-all" />
                </Link>
              );
            })}
          </AnimatedStagger>
        </AnimatedSection>

        {/* ============================================
            RECENT OFFERINGS
            ============================================ */}
        <AnimatedSection>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-church-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaChartLine className="text-church-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm md:text-base truncate">
                    Sadaka za Hivi Karibuni
                  </h3>
                  <p className="text-[11px] md:text-xs text-slate-500">
                    Michango mitano ya mwisho
                  </p>
                </div>
              </div>
              <Link
                href="/admin/offerings"
                className="inline-flex items-center gap-1.5 text-church-600 hover:text-church-800 text-xs md:text-sm font-semibold transition-colors whitespace-nowrap"
              >
                Ona Zote <FaArrowRight className="text-[10px]" />
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto" />
                <p className="text-slate-500 mt-3 text-sm">Inapakia data...</p>
              </div>
            ) : recentOfferings.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                  <FaWallet className="text-2xl text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium text-sm">
                  Hakuna sadaka zilizorekodiwa bado
                </p>
                <Link
                  href="/admin/offerings/new"
                  className="inline-flex items-center gap-2 mt-4 bg-church-500 hover:bg-church-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
                >
                  <FaPlus /> Rekodi Sadaka ya Kwanza
                </Link>
              </div>
            ) : (
              <>
                {/* DESKTOP */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Tarehe
                        </th>
                        <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Ibada
                        </th>
                        <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Kiasi
                        </th>
                        <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Hali
                        </th>
                        <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Aliyerekodi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentOfferings.map((item) => {
                        const approved =
                          item.status === "Imeidhinishwa" ||
                          item.status === "Imepelekwa Bank";
                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-sky-50/60 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                              {formatDate(item.service_date || item.date)}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                              {item.service_type || item.service || "Ibada"}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-800 whitespace-nowrap tabular-nums">
                              {formatCurrency(item.amount)}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  approved
                                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                    : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                                }`}
                              >
                                {approved ? <FaCheckCircle /> : <FaClock />}
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {item.recorded_by_name || item.recorded_by || "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE */}
                <div className="md:hidden divide-y divide-slate-100">
                  {recentOfferings.map((item) => {
                    const approved =
                      item.status === "Imeidhinishwa" ||
                      item.status === "Imepelekwa Bank";
                    return (
                      <div key={item.id} className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {item.service_type || item.service || "Ibada"}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {formatDate(item.service_date || item.date)}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                              approved
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                            }`}
                          >
                            {approved ? <FaCheckCircle /> : <FaClock />}
                            {item.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-base font-bold text-church-700 tabular-nums">
                            {formatCurrency(item.amount)}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            na {item.recorded_by_name || item.recorded_by || "—"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}