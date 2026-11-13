// frontend/app/admin/users/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { usersApi, userStorage } from "@/lib/api";
import {
  FaArrowLeft, FaSpinner, FaExclamationTriangle,
  FaUser, FaEnvelope, FaPhone, FaChurch, FaMapMarkerAlt,
  FaCalendar, FaUserShield, FaCheckCircle, FaTimesCircle,
  FaEdit, FaSave, FaTimes,
} from "react-icons/fa";
import AnimatedSection from "@/components/ui/AnimatedSection";
import AnimatedStagger from "@/components/ui/AnimatedStagger";

// ============================================
// ✅ ROLE LABELS
// ============================================
const ROLE_LABELS: Record<string, string> = {
  muumini: "Muumini",
  mzee_kanisa: "Mzee wa Kanisa",
  mhasibu: "Mhasibu wa Kanisa",
  katibu_mkuu: "Katibu Mkuu",
  mchungaji_msaidizi: "Mchungaji Msaidizi",
  mchungaji_kiongozi: "Mchungaji Kiongozi",
  mwinjilist: "Mwinjilist",
  mwenyekiti: "Mwenyekiti",
  mwenyekiti_msaidizi: "Mwenyekiti Msaidizi",
  it: "IT wa Kanisa",
  super_admin: "Super Admin",
};

const ROLE_COLORS: Record<string, string> = {
  muumini: "bg-gray-100 text-gray-700 border-gray-300",
  mzee_kanisa: "bg-amber-100 text-amber-700 border-amber-300",
  mhasibu: "bg-blue-100 text-blue-700 border-blue-300",
  katibu_mkuu: "bg-indigo-100 text-indigo-700 border-indigo-300",
  mchungaji_msaidizi: "bg-teal-100 text-teal-700 border-teal-300",
  mchungaji_kiongozi: "bg-emerald-100 text-emerald-700 border-emerald-300",
  mwinjilist: "bg-purple-100 text-purple-700 border-purple-300",
  mwenyekiti: "bg-orange-100 text-orange-700 border-orange-300",
  mwenyekiti_msaidizi: "bg-yellow-100 text-yellow-700 border-yellow-300",
  it: "bg-cyan-100 text-cyan-700 border-cyan-300",
  super_admin: "bg-rose-100 text-rose-700 border-rose-300",
};

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

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    church_name: "",
    church_location: "",
    is_active: true,
  });

  // ============================================
  // 📥 FETCH
  // ============================================
  useEffect(() => {
    setCurrentUser(userStorage.get());
    if (!id) return;

    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await usersApi.get(id);
        setUser(data);
        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          role: data.role || "muumini",
          church_name: data.church_name || "",
          church_location: data.church_location || "",
          is_active: data.is_active !== false,
        });
      } catch (err: any) {
        console.error("❌ Fetch user error:", err);
        setError(err.message || "Imeshindwa kupata mtumiaji");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString("sw-TZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await usersApi.update(id, {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        role: form.role,
        church_name: form.church_name || undefined,
        church_location: form.church_location || undefined,
        is_active: form.is_active,
      });
      const updated = await usersApi.get(id);
      setUser(updated);
      setEditing(false);
    } catch (err: any) {
      console.error("Update user error:", err);
      setSaveError(err.message || "Imeshindwa kuhifadhi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto" />
          <p className="text-gray-500 mt-3">Inapakia mtumiaji...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
        >
          <FaArrowLeft /> Rudi kwenye watumiaji
        </Link>
        <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-xl">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-red-500 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Imeshindwa kupata mtumiaji</p>
              <p className="text-sm text-red-700 mt-1">{error || "Mtumiaji haipatikani"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isSuperAdmin = currentUser?.role === "super_admin";
  const isSelf = currentUser?.id === user.id;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      {/* ===== HEADER ===== */}
      <AnimatedSection>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/users"
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <FaArrowLeft className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Maelezo ya Mtumiaji</h1>
              <p className="text-gray-500 text-sm mt-0.5">Taarifa kamili</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${
                ROLE_COLORS[user.role] || ROLE_COLORS["muumini"]
              }`}
            >
              {user.role === "super_admin" && <FaUserShield />}
              {ROLE_LABELS[user.role] || user.role}
            </span>
          </div>
        </div>
      </AnimatedSection>

      {/* ===== SAVE ERROR ===== */}
      {saveError && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{saveError}</p>
          <button onClick={() => setSaveError("")} className="text-red-400 hover:text-red-600">
            <FaTimes />
          </button>
        </div>
      )}

      {/* ===== PROFILE CARD ===== */}
      <AnimatedSection delay={0.1}>
        <div className="bg-gradient-to-br from-church-600 via-church-500 to-church-400 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0">
              {user.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold truncate">{user.name}</h2>
              <p className="text-sm opacity-90 truncate">{user.email}</p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                {user.is_active ? (
                  <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg">
                    <FaCheckCircle /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-rose-500/30 px-2 py-1 rounded-lg">
                    <FaTimesCircle /> Inactive
                  </span>
                )}
                {isSelf && (
                  <span className="bg-white/20 px-2 py-1 rounded-lg">Ni wewe</span>
                )}
              </div>
            </div>
            {isSuperAdmin && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex-shrink-0"
              >
                <FaEdit /> Hariri
              </button>
            )}
          </div>
        </div>
      </AnimatedSection>

      {/* ===== INFO / EDIT FORM ===== */}
      {editing ? (
        <AnimatedSection>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-800">Hariri Taarifa</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jina</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Barua Pepe</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Simu</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  disabled={!isSuperAdmin}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm bg-white disabled:bg-gray-100"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kanisa</label>
                  <input
                    type="text"
                    value={form.church_name}
                    onChange={(e) => setForm({ ...form, church_name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mahali</label>
                  <input
                    type="text"
                    value={form.church_location}
                    onChange={(e) => setForm({ ...form, church_location: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 text-church-500 rounded focus:ring-church-400"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Akaunti ni active
                </label>
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-church-500 hover:bg-church-600 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-xl font-medium text-sm"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin" /> Inahifadhi...
                    </>
                  ) : (
                    <>
                      <FaSave /> Hifadhi
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setSaveError("");
                    setForm({
                      name: user.name || "",
                      email: user.email || "",
                      phone: user.phone || "",
                      role: user.role || "muumini",
                      church_name: user.church_name || "",
                      church_location: user.church_location || "",
                      is_active: user.is_active !== false,
                    });
                  }}
                  disabled={saving}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium text-sm"
                >
                  Ghairi
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      ) : (
        <AnimatedSection>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-800">Taarifa</h3>
            </div>
            <AnimatedStagger className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DetailRow icon={FaUser} label="Jina" value={user.name} />
              <DetailRow icon={FaEnvelope} label="Barua Pepe" value={user.email} />
              <DetailRow icon={FaPhone} label="Simu" value={user.phone || "—"} />
              <DetailRow
                icon={FaUserShield}
                label="Role"
                value={ROLE_LABELS[user.role] || user.role}
              />
              <DetailRow
                icon={FaChurch}
                label="Kanisa"
                value={user.church_name || "—"}
              />
              <DetailRow
                icon={FaMapMarkerAlt}
                label="Mahali"
                value={user.church_location || "—"}
              />
              <DetailRow
                icon={FaCalendar}
                label="Tarehe ya Kujisajili"
                value={formatDateTime(user.created_at)}
              />
              {user.updated_at && (
                <DetailRow
                  icon={FaCalendar}
                  label="Mwisho Kubadilishwa"
                  value={formatDateTime(user.updated_at)}
                />
              )}
            </AnimatedStagger>
          </div>
        </AnimatedSection>
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-church-50 rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon className="text-church-600 text-sm" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 font-medium uppercase">{label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-1 break-words">{value}</p>
      </div>
    </div>
  );
}