// frontend/app/admin/login/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi, tokenStorage, userStorage } from "@/lib/api";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaChurch,
  FaShieldAlt,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";

// ============================================
// ✅ ROLES ZINAZORUHUSIWA KUINGIA ADMIN
// ============================================
const ADMIN_ROLES = [
  "super_admin",
  "mchungaji_kiongozi",
  "mchungaji_msaidizi",
  "mwinjilist",
  "mzee_kanisa",
  "mhasibu",
  "katibu_mkuu",
  "mwenyekiti",
  "mwenyekiti_msaidizi",
  "it",
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ AUTH CHECK — Kama ame-login, mpeleke dashboard
  useEffect(() => {
    const token = tokenStorage.get();
    const user = userStorage.get();

    if (token && user) {
      const role = user.role?.toLowerCase() || "";
      if (ADMIN_ROLES.includes(role)) {
        router.replace("/admin/dashboard");
      }
      // Kama role haipo kwenye admin, acha abaki login
    }
  }, [router]);

  // 🔥 LOGIN HANDLER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await authApi.login(email, password);
      console.log("✅ Login successful:", data.user);

      const role = data.user.role?.toLowerCase() || "";

      // ✅ CHECK: Role inaruhusiwa admin?
      if (!ADMIN_ROLES.includes(role)) {
        setError(
          `Akaunti yako (${role}) hairuhusiwi kuingia admin panel. Wasiliana na mchungaji kiongozi.`
        );
        setIsLoading(false);
        // Futa token — usiruhusu aingie
        tokenStorage.remove();
        userStorage.remove();
        return;
      }

      setSuccess(`Karibu, ${data.user.name}!`);

      setTimeout(() => {
        router.replace("/admin/dashboard");
      }, 500);
    } catch (err: any) {
      console.error("❌ Login error:", err);
      setError(
        err.message || "Email au password si sahihi. Tafadhali jaribu tena."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-church-900 via-church-800 to-church-700 p-4">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-church-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-church-500 to-church-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4">
              <FaChurch className="text-white text-4xl" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white">
              Amani Luthelani Church
            </h1>
            <p className="text-white/60 text-sm">Admin Panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                <FaExclamationTriangle className="text-red-300 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border border-green-500/30 text-green-200 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                <FaCheckCircle className="text-green-300 mt-0.5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                <FaUser className="inline mr-2" /> Barua Pepe
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-church-500 focus:border-transparent transition-all"
                placeholder="admin@church.com"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                <FaLock className="inline mr-2" /> Nenosiri
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-church-500 focus:border-transparent transition-all pr-12"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-white/60 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-church-500 focus:ring-church-500"
                />
                <span>Nikumbuke</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-church-400 hover:text-church-300 transition-colors"
              >
                Nimechacha nenosiri?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-3 bg-gradient-to-r from-church-500 to-church-700 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Inaingiza...
                </>
              ) : (
                <>
                  <FaShieldAlt /> Ingia
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Huna akaunti?{" "}
              <Link
                href="/register"
                className="text-church-400 hover:text-church-300 font-medium transition-colors"
              >
                Jisajili Hapa
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 text-center text-white/40 text-xs flex items-center justify-center gap-4">
            <span className="flex items-center gap-1">
              <FaClock /> 24/7 Support
            </span>
            <span className="w-px h-4 bg-white/20"></span>
            <span>Secure Login</span>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          © 2026 Amani Luthelani Church • Mfumo wa Usimamizi wa Kanisa
        </p>
      </div>
    </div>
  );
}