// frontend/app/admin/offerings/new/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { offeringsApi } from "@/lib/api";
import {
  FaArrowLeft,
  FaSave,
  FaSpinner,
  FaExclamationTriangle,
  FaUsers,
  FaUserTie,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import AnimatedSection from "@/components/ui/AnimatedSection";

// ============================================
// ✅ EXACT VALUES KUTOKA BACKEND MODEL
// ============================================

const SERVICE_TYPES = [
  { value: "Jumapili", label: "Ibada ya Jumapili" },
  { value: "Jumatano", label: "Ibada ya Jumatano" },
  { value: "Ijumaa", label: "Ibada ya Ijumaa" },
  { value: "Jumamosi", label: "Ibada ya Jumamosi" },
  { value: "Sadaka Kuu", label: "Sadaka Kuu" },
  { value: "Ibada Maalum", label: "Ibada Maalum" },
  { value: "Nyingine", label: "Nyingine" },
];

const OFFERING_TYPES = [
  { value: "Sadaka Kuu", label: "Sadaka Kuu", group: "Takatifu" },
  { value: "Shukrani", label: "Shukrani", group: "Takatifu" },
  { value: "Msamaha", label: "Msamaha", group: "Takatifu" },
  { value: "Zaka", label: "Zaka", group: "Takatifu" },
  { value: "Fungu la Kumi", label: "Fungu la Kumi", group: "Takatifu" },

  { value: "Harambee", label: "Harambee", group: "Matukio" },
  { value: "Harusi", label: "Harusi", group: "Matukio" },
  { value: "Shukrani ya Pekee", label: "Shukrani ya Pekee", group: "Matukio" },
  { value: "Sikukuu", label: "Sikukuu", group: "Matukio" },
  { value: "Mchango wa Msiba", label: "Mchango wa Msiba", group: "Matukio" },

  { value: "Sunday School", label: "Sunday School", group: "Vikundi" },
  { value: "Jumuiya", label: "Jumuiya", group: "Vikundi" },
  { value: "Vijana", label: "Vijana", group: "Vikundi" },
  { value: "Wanawake", label: "Wanawake", group: "Vikundi" },
  { value: "Wanaume", label: "Wanaume", group: "Vikundi" },

  { value: "Ujenzi", label: "Ujenzi", group: "Maendeleo" },
  { value: "Mchango wa Ujenzi", label: "Mchango wa Ujenzi", group: "Maendeleo" },
  { value: "Mchango wa Magari", label: "Mchango wa Magari", group: "Maendeleo" },

  { value: "Toleo", label: "Toleo", group: "Mengineyo" },
  { value: "Mchango wa Shukrani", label: "Mchango wa Shukrani", group: "Mengineyo" },
  { value: "Nyingine", label: "Nyingine", group: "Mengineyo" },
];

export default function NewOfferingPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    service_date: new Date().toISOString().slice(0, 10),
    service_type: SERVICE_TYPES[0].value,
    offering_type: OFFERING_TYPES[0].value,
    amount: "",
    description: "",
    team_name: "",
    team_leader: "",
  });

  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [memberInput, setMemberInput] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ============================================
  // 👥 TEAM MEMBERS
  // ============================================
  const addMember = () => {
    const name = memberInput.trim();
    if (!name) return;
    if (teamMembers.includes(name)) {
      setMemberInput("");
      return;
    }
    setTeamMembers([...teamMembers, name]);
    setMemberInput("");
  };

  const removeMember = (name: string) => {
    setTeamMembers(teamMembers.filter((m) => m !== name));
  };

  const handleMemberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addMember();
    }
  };

  // ============================================
  // 📤 SUBMIT
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Tafadhali weka kiasi sahihi cha sadaka");
      return;
    }
    if (!form.team_name.trim()) {
      setError("Tafadhali weka jina la timu");
      return;
    }
    if (!form.team_leader.trim()) {
      setError("Tafadhali weka kiongozi wa timu");
      return;
    }
    if (teamMembers.length === 0) {
      setError("Tafadhali ongeza angalau mwanachama mmoja wa timu");
      return;
    }

    setSaving(true);
    try {
      await offeringsApi.create({
        service_date: form.service_date,
        service_type: form.service_type,
        offering_type: form.offering_type,
        amount: Number(form.amount),
        description: form.description || undefined,
        team_name: form.team_name.trim(),
        team_members: teamMembers,
        team_leader: form.team_leader.trim(),
      } as any);
      router.push("/admin/offerings");
    } catch (err: any) {
      console.error("❌ Create offering error:", err);
      setError(err.message || "Imeshindwa kurekodi sadaka");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Panga offering types kwa group kwa <optgroup>
  const groupedOfferingTypes = OFFERING_TYPES.reduce((acc, t) => {
    if (!acc[t.group]) acc[t.group] = [];
    acc[t.group].push(t);
    return acc;
  }, {} as Record<string, typeof OFFERING_TYPES>);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      {/* ===== HEADER ===== */}
      <AnimatedSection>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/offerings"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Rekodi Sadaka Mpya
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Jaza taarifa za sadaka na timu ili kuirekodi
            </p>
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
          className="bg-white rounded-2xl shadow-sm p-6 space-y-6"
        >
          {/* ===== TAARIFA ZA SADAKA ===== */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-4 bg-church-500 rounded-full" />
              Taarifa za Sadaka
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarehe ya Ibada <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="service_date"
                value={form.service_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 focus:border-transparent text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aina ya Ibada <span className="text-red-500">*</span>
                </label>
                <select
                  name="service_type"
                  value={form.service_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 focus:border-transparent text-sm bg-white"
                >
                  {SERVICE_TYPES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aina ya Sadaka <span className="text-red-500">*</span>
                </label>
                <select
                  name="offering_type"
                  value={form.offering_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 focus:border-transparent text-sm bg-white"
                >
                  {Object.entries(groupedOfferingTypes).map(([group, items]) => (
                    <optgroup key={group} label={group}>
                      {items.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kiasi (TZS) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                required
                min={1}
                placeholder="Mfano: 50000"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maelezo (hiari)
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={2}
                placeholder="Maelezo ya ziada..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 focus:border-transparent text-sm resize-none"
              />
            </div>
          </div>

          {/* ===== TAARIFA ZA TIMU ===== */}
          <div className="border-t border-gray-100 pt-6 space-y-5">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-4 bg-church-500 rounded-full" />
              Taarifa za Timu
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUsers className="inline mr-1.5 text-church-500" />
                  Jina la Timu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="team_name"
                  value={form.team_name}
                  onChange={handleChange}
                  required
                  placeholder="Mfano: Timu ya Vijana"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUserTie className="inline mr-1.5 text-church-500" />
                  Kiongozi wa Timu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="team_leader"
                  value={form.team_leader}
                  onChange={handleChange}
                  required
                  placeholder="Mfano: Juma Mkubwa"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wanachama wa Timu <span className="text-red-500">*</span>
                <span className="text-xs text-gray-400 font-normal ml-2">
                  ({teamMembers.length} wameongezwa)
                </span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  onKeyDown={handleMemberKeyDown}
                  placeholder="Andika jina la mwanachama..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 focus:border-transparent text-sm"
                />
                <button
                  type="button"
                  onClick={addMember}
                  className="inline-flex items-center gap-1.5 bg-church-500 hover:bg-church-600 text-white px-4 py-2.5 rounded-xl transition-colors text-sm font-medium"
                >
                  <FaPlus /> Ongeza
                </button>
              </div>

              {teamMembers.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {teamMembers.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1.5 bg-church-50 text-church-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                    >
                      {name}
                      <button
                        type="button"
                        onClick={() => removeMember(name)}
                        className="hover:bg-church-100 rounded-full p-0.5 transition-colors"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {teamMembers.length === 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  Bado hakuna mwanachama. Andika jina kisha bonyeza "Ongeza".
                </p>
              )}
            </div>
          </div>

          {/* ===== BUTTONS ===== */}
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
                  <FaSave /> Hifadhi Sadaka
                </>
              )}
            </button>
            <Link
              href="/admin/offerings"
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