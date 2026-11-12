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
    roles: ["super_admin","mchungaji_kiongozi", "mchungaji_msaidizi"],
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);  // ✅ MPYA

  // 🔐 AUTH CHECK
  useEffect(() => {
    // ✅ Ruhusu login page bila auth
    if (pathname === "/admin/login") {
      setIsAuthorized(true);
      setIsChecking(false);
      return;
    }

    const token = tokenStorage.get();
    const currentUser = userStorage.get();

    if (!token || !currentUser) {
      // ❌ Hakuna auth — elekeza login
      setIsAuthorized(false);
      setIsChecking(false);
      router.replace("/admin/login");  // ✅ replace badala ya push
      return;
    }

    // ✅ Auth ipo sawa
    setUser(currentUser);
    setIsAuthorized(true);
    setIsChecking(false);
  }, [router, pathname]);

  // 🚪 LOGOUT
  const handleLogout = () => {
    tokenStorage.remove();
    userStorage.remove();
    window.location.href = "/admin/login";
  };

  // ✅ Filter nav items kulingana na role
  const userRole = user?.role?.toLowerCase() || "";
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.roles.includes("all")) return true;
    return item.roles.includes(userRole);
  });

  // ⏳ LOADING — kabla auth check haijakamilika
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-church-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Inathibitisha...</p>
        </div>
      </div>
    );
  }

  // ✅ LOGIN PAGE — bila sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // ❌ HAUJARUHUSIWA
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Inakuelekeza kwenye login...</p>
        </div>
      </div>
    );
  }

  // ✅ RENDER DASHBOARD
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== SIDEBAR ===== */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-xl z-50 transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-100">
            <div
              className={`flex items-center gap-3 ${
                !isSidebarOpen && "justify-center"
              }`}
            >
              <div className="w-10 h-10 bg-church-500 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                ✝️
              </div>
              {isSidebarOpen && (
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">
                    Amani Luthelani
                  </p>
                  <p className="text-xs text-gray-400">Admin Panel</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {visibleNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-church-50 text-church-700"
                      : "text-gray-600 hover:bg-gray-100"
                  } ${!isSidebarOpen && "justify-center"}`}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <item.icon className="text-lg flex-shrink-0" />
                  {isSidebarOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 w-full ${
                !isSidebarOpen && "justify-center"
              }`}
              title={!isSidebarOpen ? "Toka" : undefined}
            >
              <FaSignOutAlt className="text-lg flex-shrink-0" />
              {isSidebarOpen && (
                <span className="text-sm font-medium">Toka</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main
        className={`transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isSidebarOpen ? (
                  <FaTimes className="w-5 h-5" />
                ) : (
                  <FaBars className="w-5 h-5" />
                )}
              </button>
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-church-600 transition-colors"
              >
                ← Rudi Nyumbani
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <FaBell className="text-lg" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-church-100 rounded-full flex items-center justify-center text-church-700 font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {user?.role?.replace(/_/g, " ") || "Admin"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}