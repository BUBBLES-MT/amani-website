// components/common/Header.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from "react-icons/fa";
import { tokenStorage, userStorage, User } from "@/lib/api";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setUser(userStorage.get());
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Nyumbani", icon: "🏠" },
    { href: "/about", label: "Kuhusu Sisi", icon: "📖" },
    { href: "/sermons", label: "Mahubiri", icon: "🎙️" },
    { href: "/events", label: "Matukio", icon: "📅" },
    { href: "/gallery", label: "Picha", icon: "🖼️" },
    { href: "/contact", label: "Wasiliana", icon: "📞" },
    { href: "/donations", label: "Changia", icon: "❤️" },
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogout = () => {
    tokenStorage.remove();
    userStorage.remove();
    window.location.href = "/";
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-lg shadow-lg"
          : "bg-white shadow-md"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-church-500 to-church-700 rounded-2xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              ✝️
            </div>
            <div>
              <span className="font-bold text-lg md:text-xl text-church-700 hidden sm:inline">
                Amani Luthelani Church
              </span>
              <span className="block text-[10px] text-gray-400 font-medium -mt-0.5 hidden sm:block">
                Church Management System
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  isActive(link.href)
                    ? "bg-church-50 text-church-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-church-600"
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  href="/admin/dashboard"
                  className="btn-primary text-sm flex items-center gap-2 px-5 py-2.5"
                >
                  <FaUser className="text-sm" /> Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-colors"
                  title="Toka"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="btn-primary text-sm ml-2 flex items-center gap-2 px-5 py-2.5"
              >
                <FaUser className="text-sm" /> Ingia
              </Link>
            )}
          </div>

          <button
            className="lg:hidden text-2xl text-gray-700 p-2 hover:bg-gray-100 rounded-xl transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 animate-slide-down bg-white/95 backdrop-blur-lg">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-church-50 text-church-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-xl">{link.icon}</span>
                {link.label}
              </Link>
            ))}

            <div className="border-t border-gray-100 mt-2 pt-4 space-y-2">
              {user ? (
                <>
                  <Link
                    href="/admin/dashboard"
                    className="block w-full btn-primary text-center py-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUser className="inline mr-2" /> Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-center py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <FaSignOutAlt className="inline mr-2" /> Toka
                  </button>
                </>
              ) : (
                <Link
                  href="/admin/login"
                  className="block w-full btn-primary text-center py-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUser className="inline mr-2" /> Ingia
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}