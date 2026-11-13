// frontend/app/admin/users/new/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usersApi } from "@/lib/api";
import {
  FaArrowLeft, FaSave, FaSpinner, FaExclamationTriangle,
  FaEye, FaEyeSlash,
} from "react-icons/fa";
import AnimatedSection from "@/components/ui/AnimatedSection";

// ============================================
// ✅ ROLES
// ============================================
const ROLES = [
  { value: "muumini", label: "Muumini" },
  { value: "mzee_kanisa", label: "Mzee wa Kanisa" },
  { value: "mhasibu", label: "Mhasibu wa Kanisa" },
  { value: "katibu_mkuu", label: "Katibu Mkuu" },
  { value: "mchungaji_msaidizi", label: "Mchungaji Msaidizi" },
  { value: "mchungaji_kiongozi", label: "Mchungaji Kiongozi" },
  { value: "mwinjilist", label: "Mwinjilist" },
  { value: "mwenyekiti", label: "Mwenyekiti" },
  { value: "mwenyekiti_msaidizi", label: "Mwenyekiti Msaidizi" },
  { value: "it", label: "IT wa Kanisa" },
  { value: "super_admin", label: "Super Admin" },
];

export default function NewUserPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "muumini",
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

    if (!form.name.trim()) return setError("Weka jina");
    if (!form.email.trim()) return setError("Weka barua pepe");
    if (!form.password || form.password.length < 8)
      return setError("Nenosiri liwe angalau herufi 8");

    setSaving(true);
    try {
      await usersApi.create({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone || undefined,
        password: form.password,
        role: form.role,
        church_name: form.church_name || undefined,
        church_location: form.church_location || undefined,
      });
      router.push("/admin/users");
    } catch (err: any) {
      console.error("Create user error:", err);
      setError(err.message || "Imeshindwa kuunda mtumiaji");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      {/* ===== HEADER ===== */}
      <AnimatedSection>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/users"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Ongeza Mtumiaji</h1>
            <p className="text-gray-500 text-sm mt-0.5">Sajili mtumiaji mpya</p>
          </div>
        </div>
      </AnimatedSection>

      {/* ===== ERROR ===== */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
        </div>
      )}

      {/* ===== FORM ===== */}
      <AnimatedSection delay={0.1}>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm p-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm bg-white"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-church-500 hover:bg-church-600 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-xl transition-colors font-medium text-sm shadow-sm"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin" /> Inahifadhi...
                </>
              ) : (
                <>
                  <FaSave /> Hifadhi Mtumiaji
                </>
              )}
            </button>
            <Link
              href="/admin/users"
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium text-sm text-center"
            >
              Ghairi
            </Link>
          </div>
        </form>
      </AnimatedSection>
    </div>
  );
}