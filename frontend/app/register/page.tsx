// frontend/app/register/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import {
  FaUser, FaEnvelope, FaPhone, FaLock, FaChurch,
  FaEye, FaEyeSlash, FaSpinner, FaExclamationTriangle,
  FaCheckCircle, FaUserShield, FaArrowLeft, FaInfoCircle,
} from "react-icons/fa";
import AnimatedSection from "@/components/ui/AnimatedSection";
import {
  AnimatedHero,
  AnimatedHeroItem,
  AnimatedHeroText,
} from "@/components/ui/AnimatedHero";

// ============================================
// ✅ ROLES ZINAZORUHUSIWA KWA PUBLIC REGISTRATION
// ============================================
const PUBLIC_ROLES = [
  { value: "mzee_kanisa", label: "Mzee wa Kanisa" },
  { value: "mhasibu", label: "Mhasibu wa Kanisa" },
  { value: "katibu_mkuu", label: "Katibu Mkuu" },
  { value: "mwenyekiti", label: "Mwenyekiti" },
  { value: "mwenyekiti_msaidizi", label: "Mwenyekiti Msaidizi" },
  { value: "it", label: "IT wa Kanisa" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "mzee_kanisa", // ✅ Badilisha kutoka "muumini" (haipo kwenye PUBLIC_ROLES)
    church_name: "",
    church_location: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Weka jina kamili");
    if (!form.email.trim()) return setError("Weka barua pepe");
    if (!form.password || form.password.length < 8) {
      return setError("Nenosiri liwe angalau herufi 8");
    }

    setLoading(true);
    try {
      await authApi.register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone || undefined,
        password: form.password,
        role: form.role,
        church_name: form.church_name || undefined,
        church_location: form.church_location || undefined,
      });

      setSuccess(true);
    } catch (err: any) {
      console.error("Register error:", err);
      setError(err.message || "Imeshindwa kujisajili");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ✅ SUCCESS SCREEN
  // ============================================
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <AnimatedSection className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-emerald-600 text-4xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Usajili Umepokelewa!
          </h1>
          <p className="text-gray-600 mb-6 text-sm">
            Maombi yako ya kujisajili yametumwa kwa viongozi wa kanisa. Utaweza
            kuingia baada ya kuidhinishwa.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left mb-6">
            <p className="text-sm text-amber-800 flex items-start gap-2">
              <FaExclamationTriangle className="text-amber-500 mt-0.5 flex-shrink-0" />
              <span>
                Viongozi watatu wanahitaji kudhibitisha usajili wako:{" "}
                <strong>
                  Mchungaji Kiongozi, Mchungaji Msaidizi, Mwinjilist
                </strong>
                .
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-church-500 hover:bg-church-600 text-white px-6 py-3 rounded-xl font-medium transition-colors w-full"
            >
              <FaArrowLeft /> Rudi Nyumbani
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  password: "",
                  role: "mzee_kanisa",
                  church_name: "",
                  church_location: "",
                });
              }}
              className="text-sm text-gray-500 hover:text-church-600 transition-colors"
            >
              Sajili mtumiaji mwingine
            </button>
          </div>
        </AnimatedSection>
      </div>
    );
  }

  // ============================================
  // 📝 FORM
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-church-50 via-white to-church-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-church-600 mb-6 text-sm font-medium"
        >
          <FaArrowLeft /> Rudi Nyumbani
        </Link>

        <AnimatedSection className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <AnimatedHero className="bg-gradient-to-r from-church-600 to-church-700 p-6 text-white">
            <AnimatedHeroItem>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaUserShield className="text-2xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Jisajili</h1>
                  <p className="text-sm opacity-90">Amani Luthelani Church</p>
                </div>
              </div>
            </AnimatedHeroItem>
            <AnimatedHeroItem>
              <p className="text-sm opacity-90 mt-2">
                Maombi yako yatadhibitishwa na viongozi wa kanisa kabla ya kuingia.
              </p>
            </AnimatedHeroItem>
          </AnimatedHero>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
                <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 flex-1">{error}</p>
              </div>
            )}

            {/* Jina */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUser className="inline mr-1.5 text-church-500" />
                Jina Kamili <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Mfano: John Doe"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaEnvelope className="inline mr-1.5 text-church-500" />
                Barua Pepe <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="email@example.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaPhone className="inline mr-1.5 text-church-500" />
                Namba ya Simu
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+255..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaLock className="inline mr-1.5 text-church-500" />
                Nenosiri <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Nenosiri (angalau herufi 8)"
                  className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Angalau herufi 8, herufi kubwa moja, ndogo moja, na namba moja
              </p>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUserShield className="inline mr-1.5 text-church-500" />
                Wewe ni nani? <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm bg-white"
              >
                {PUBLIC_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Kanisa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaChurch className="inline mr-1.5 text-church-500" />
                  Jina la Kanisa
                </label>
                <input
                  type="text"
                  name="church_name"
                  value={form.church_name}
                  onChange={handleChange}
                  placeholder="Mfano: Amani Luthelani"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mahali
                </label>
                <input
                  type="text"
                  name="church_location"
                  value={form.church_location}
                  onChange={handleChange}
                  placeholder="Mfano: Singida"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm"
                />
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800 flex items-start gap-2">
                <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
                <span>
                  Usajili wako utadhibitishwa na wachungaji au mwinjilisti wa kanisa. Utaweza kuingia baada
                  ya kuidhinishwa.
                </span>
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-church-500 hover:bg-church-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-medium text-sm shadow-sm transition-colors"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" /> Inatuma...
                </>
              ) : (
                <>
                  <FaUserShield /> Tuma Maombi ya Usajili
                </>
              )}
            </button>

            {/* Login link */}
            <p className="text-center text-sm text-gray-500">
              Una akaunti?{" "}
              <Link
                href="/admin/login"
                className="text-church-600 hover:text-church-800 font-medium"
              >
                Ingia Hapa
              </Link>
            </p>
          </form>
        </AnimatedSection>
      </div>
    </div>
  );
}