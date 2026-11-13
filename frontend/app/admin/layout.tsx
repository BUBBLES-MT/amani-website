// frontend/app/admin/layout.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { tokenStorage, userStorage, User } from "@/lib/api";
import {
  FaHome,
  FaHands,
  FaMoneyBillWave,
  FaUsers,
  FaCalendar,
  FaEnvelope,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaBars,
  FaTimes,
  FaBook,
  FaImage,
  FaUserPlus,
  FaChevronLeft,
} from "react-icons/fa";

// ============================================
// 🎯 NAV ITEMS kwa kila Role
// ============================================
const NAV_ITEMS = [
  {
    icon: FaHome,
    label: "Dashboard",
    href: "/admin/dashboard",
    roles: ["all"],
  },
  {
    icon: FaUserPlus,
    label: "Maombi",
    href: "/admin/registrations",
    roles: [
      "mchungaji_kiongozi",
      "mchungaji_msaidizi",
      "mwinjilist",
      "super_admin",
    ],
  },
  {
    icon: FaHands,
    label: "Sadaka",
    href: "/admin/offerings",
    roles: ["mzee_kanisa", "mhasibu", "mchungaji_kiongozi", "mchungaji_msaidizi", "mwinjilist", "mwenyekiti", "mwenyekiti_msaidizi", "katibu_mkuu", "super_admin"],
  },
  {
    icon: FaMoneyBillWave,
    label: "Matumizi",
    href: "/admin/expenses",
    roles: ["mhasibu", "mchungaji_kiongozi", "mchungaji_msaidizi", "mwinjilist", "mwenyekiti", "mwenyekiti_msaidizi", "katibu_mkuu", "super_admin"],
  },
  {
    icon: FaBook,
    label: "Mahubiri",
    href: "/admin/sermons",
    roles: ["it", "mchungaji_kiongozi", "mchungaji_msaidizi", "mwenyekiti", "super_admin"],
  },
  {
    icon: FaCalendar,
    label: "Matukio",
    href: "/admin/events",
    roles: ["it", "mchungaji_kiongozi", "mchungaji_msaidizi", "mwenyekiti", "super_admin"],
  },
  {
    icon: FaImage,
    label: "Gallery",
    href: "/admin/gallery",
    roles: ["it", "mchungaji_kiongozi", "mchungaji_msaidizi", "mwenyekiti", "super_admin"],
  },
  {
    icon: FaUsers,
    label: "Watumiaji",
    href: "/admin/users",
    roles: ["super_admin", "mchungaji_kiongozi", "mchungaji_msaidizi"],
  },
  {
    icon: FaEnvelope,
    label: "Ujumbe",
    href: "/admin/messages",
    roles: ["mchungaji_kiongozi", "mchungaji_msaidizi", "mwenyekiti", "super_admin"],
  },
  {
    icon: FaCog,
    label: "Mipangilio",
    href: "/admin/settings",
    roles: ["it", "super_admin"],
  },
];

// ============================================
// 🎯 COOKIE HELPERS
// ============================================
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // siku 7

const setRoleCookie = (role: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `user_role=${role}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};

const clearRoleCookie = () => {
  if (typeof document === "undefined") return;
  document.cookie = "user_role=; path=/; max-age=0; SameSite=Lax";
};

const hasRoleCookie = () => {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split("; ")
    .some((row) => row.startsWith("user_role="));
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  // ✅ Sidebar: desktop inaonekana, mobile imefichwa
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // ============================================
  // 🔐 AUTH CHECK + COOKIE FALLBACK
  // ============================================
  useEffect(() => {
    if (pathname === "/admin/login") {
      setIsAuthorized(true);
      setIsChecking(false);
      return;
    }

    const token = tokenStorage.get();
    const currentUser = userStorage.get();

    if (!token || !currentUser) {
      setIsAuthorized(false);
      setIsChecking(false);
      router.replace("/admin/login");
      return;
    }

    // 🔥 MUHIMU: Weka cookie kama haipo (kwa users walio-login kabla)
    //    Hii inahakikisha middleware inafanya kazi kwa kila mtu
    if (!hasRoleCookie()) {
      const role = currentUser.role?.toLowerCase() || "";
      if (role) {
        setRoleCookie(role);
      }
    }

    setUser(currentUser);
    setIsAuthorized(true);
    setIsChecking(false);
  }, [router, pathname]);

  // ============================================
  // 📱 DETECT MOBILE / DESKTOP
  // ============================================
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ============================================
  // 🚫 ZUIA BODY SCROLL sidebar ikifunguliwa mobile
  // ============================================
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, isSidebarOpen]);

  // ============================================
  // 🔄 FUNGA SIDEBAR KILA MARA PATHNAME INABADILIKA
  // ============================================
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  // ============================================
  // 🚪 LOGOUT — futa token, user, NA cookie
  // ============================================
  const handleLogout = () => {
    tokenStorage.remove();
    userStorage.remove();
    clearRoleCookie(); // 🔥 MPYA
    window.location.href = "/admin/login";
  };

  // ============================================
  // ✅ FILTER NAV ITEMS kwa role
  // ============================================
  const userRole = user?.role?.toLowerCase() || "";
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.roles.includes("all")) return true;
    return item.roles.includes(userRole);
  });

  // ============================================
  // ⏳ LOADING — kabla auth check haijakamilika
  // ============================================
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-blue-100 to-church-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-church-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 mt-4 font-medium">Inathibitisha...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ✅ LOGIN PAGE — bila sidebar wala background ya admin
  // ============================================
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // ============================================
  // ❌ HAUJARUHUSIWA
  // ============================================
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-blue-100 to-church-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 mt-4">Inakuelekeza kwenye login...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ✅ RENDER DASHBOARD
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-100 to-church-100 relative">
      {/* Decorative glow */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gold-200/30 rounded-full blur-3xl pointer-events-none z-0" />

      {/* ===== OVERLAY (mobile tu) ===== */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 shadow-2xl transition-transform duration-300 ease-out
          bg-white/95 backdrop-blur-xl border-r border-slate-200
          ${isMobile
            ? isSidebarOpen
              ? "translate-x-0 w-72"
              : "-translate-x-full w-72"
            : isSidebarOpen
              ? "translate-x-0 w-64"
              : "translate-x-0 w-20"
          }
        `}
      >
        <div className="flex flex-col h-full">
          {/* ===== LOGO ===== */}
          <div className="p-4 border-b border-slate-100">
            <div
              className={`flex items-center gap-3 ${
                !isMobile && !isSidebarOpen ? "justify-center" : ""
              }`}
            >
              <div className="w-11 h-11 bg-gradient-to-br from-church-500 to-church-700 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg shadow-church-500/30">
                ✝️
              </div>
              {(isMobile || isSidebarOpen) && (
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800 text-sm truncate">
                    Amani Luthelani
                  </p>
                  <p className="text-xs text-gold-600 font-medium">
                    Admin Panel
                  </p>
                </div>
              )}
              {isMobile && (
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                  aria-label="Funga sidebar"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* ===== NAVIGATION ===== */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {visibleNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname?.startsWith(item.href + "/");
              const collapsed = !isMobile && !isSidebarOpen;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative
                    ${isActive
                      ? "bg-gradient-to-r from-church-500 to-church-700 text-white shadow-lg shadow-church-500/30"
                      : "text-slate-600 hover:bg-slate-100 hover:text-church-600"
                    }
                    ${collapsed ? "justify-center" : ""}
                  `}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon
                    className={`text-lg flex-shrink-0 ${
                      isActive ? "text-white" : ""
                    }`}
                  />
                  {!collapsed && (
                    <span className="text-sm font-medium truncate">
                      {item.label}
                    </span>
                  )}

                  {collapsed && isActive && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ===== USER INFO (mobile) ===== */}
          {isMobile && (
            <div className="p-3 border-t border-slate-100">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
                <div className="w-10 h-10 bg-gradient-to-br from-church-500 to-church-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-slate-500 capitalize truncate">
                    {user?.role?.replace(/_/g, " ") || "Admin"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===== LOGOUT ===== */}
          <div className="p-3 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 w-full
                ${!isMobile && !isSidebarOpen ? "justify-center" : ""}
              `}
              title={!isMobile && !isSidebarOpen ? "Toka" : undefined}
            >
              <FaSignOutAlt className="text-lg flex-shrink-0" />
              {(isMobile || isSidebarOpen) && (
                <span className="text-sm font-medium">Toka</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main
        className={`transition-all duration-300 relative z-10
          ${isMobile ? "ml-0" : isSidebarOpen ? "ml-64" : "ml-20"}
        `}
      >
        {/* ===== TOP BAR ===== */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-slate-600 hover:text-church-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                aria-label="Fungua/funga sidebar"
              >
                {isMobile ? (
                  <FaBars className="w-5 h-5" />
                ) : isSidebarOpen ? (
                  <FaChevronLeft className="w-4 h-4" />
                ) : (
                  <FaBars className="w-5 h-5" />
                )}
              </button>

              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs md:text-sm text-slate-500 hover:text-church-600 transition-colors whitespace-nowrap"
              >
                ← Rudi Nyumbani
              </Link>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <button
                className="relative p-2 text-slate-500 hover:text-church-600 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Taarifa"
              >
                <FaBell className="text-lg" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              </button>

              <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-slate-200">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-church-500 to-church-700 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-church-500/30 ring-2 ring-white">
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div className="hidden md:block min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate max-w-[160px]">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-slate-500 capitalize truncate max-w-[160px]">
                    {user?.role?.replace(/_/g, " ") || "Admin"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ===== PAGE CONTENT ===== */}
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}