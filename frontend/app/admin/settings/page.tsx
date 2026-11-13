// frontend/app/admin/settings/page.tsx

"use client";

import { useState, useEffect } from "react";
import { settingsApi } from "@/lib/api";
import {
  FaSpinner, FaExclamationTriangle, FaSave, FaCheckCircle,
  FaChurch, FaPhone, FaGlobe, FaCog, FaPalette,
} from "react-icons/fa";
import AnimatedSection from "@/components/ui/AnimatedSection";

type SettingsData = Record<string, string>;

const TABS = [
  { key: "church", label: "Kanisa", icon: FaChurch },
  { key: "contact", label: "Mawasiliano", icon: FaPhone },
  { key: "social", label: "Mitandao", icon: FaGlobe },
  { key: "general", label: "Jumla", icon: FaCog },
];

const FIELD_LABELS: Record<string, { label: string; type?: string; placeholder?: string }> = {
  church_name: { label: "Jina la Kanisa", placeholder: "Amani Luthelani Church" },
  church_location: { label: "Mahali", placeholder: "Moshi, Kilimanjaro" },
  church_motto: { label: "Motto", placeholder: "Kwa neema na amani" },
  church_logo: { label: "Logo (URL)", type: "url", placeholder: "https://..." },

  contact_phone: { label: "Simu", type: "tel", placeholder: "+255..." },
  contact_email: { label: "Barua Pepe", type: "email", placeholder: "info@..." },
  contact_whatsapp: { label: "WhatsApp", type: "tel", placeholder: "+255..." },
  contact_address: { label: "Anwani", placeholder: "Moshi, Kilimanjaro" },

  social_facebook: { label: "Facebook", type: "url", placeholder: "https://facebook.com/..." },
  social_instagram: { label: "Instagram", type: "url", placeholder: "https://instagram.com/..." },
  social_youtube: { label: "YouTube", type: "url", placeholder: "https://youtube.com/..." },
  social_twitter: { label: "Twitter / X", type: "url", placeholder: "https://twitter.com/..." },

  service_time_sunday: { label: "Saa za Ibada - Jumapili", placeholder: "8:00 AM - 12:00 PM" },
  service_time_wednesday: { label: "Saa za Ibada - Jumatano", placeholder: "5:00 PM - 7:00 PM" },
  announcement: { label: "Tangazo", placeholder: "Tangazo la kanisa..." },
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("church");
  const [settings, setSettings] = useState<SettingsData>({});
  const [initial, setInitial] = useState<SettingsData>({});

  // ============================================
  // 📥 FETCH
  // ============================================
  const fetchSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await settingsApi.getGrouped();
      const flat: SettingsData = {};
      for (const cat of Object.keys(data)) {
        const group = (data as any)[cat];
        if (group) {
          for (const [k, v] of Object.entries(group)) {
            flat[k] = v as string;
          }
        }
      }
      setSettings(flat);
      setInitial(flat);
    } catch (err: any) {
      console.error("❌ Settings fetch error:", err);
      setError(err.message || "Imeshindwa kupata mipangilio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // ============================================
  // 💾 SAVE
  // ============================================
  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await settingsApi.updateBulk(settings);
      setInitial(settings);
      setSuccess("✅ Mipangilio imehifadhiwa!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      console.error("Save settings error:", err);
      setError(err.message || "Imeshindwa kuhifadhi");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(initial);
    setError("");
    setSuccess("");
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(initial);

  const filteredKeys = Object.keys(settings).filter((key) => {
    if (activeTab === "church") return key.startsWith("church_");
    if (activeTab === "contact") return key.startsWith("contact_");
    if (activeTab === "social") return key.startsWith("social_");
    return (
      !key.startsWith("church_") &&
      !key.startsWith("contact_") &&
      !key.startsWith("social_")
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto" />
          <p className="text-gray-500 mt-3">Inapakia mipangilio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* ===== HEADER ===== */}
      <AnimatedSection>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mipangilio</h1>
            <p className="text-gray-500 text-sm mt-1">
              Badilisha mipangilio ya kanisa na mfumo
            </p>
          </div>
          <div className="flex gap-2">
            {hasChanges && (
              <button
                onClick={handleReset}
                disabled={saving}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium"
              >
                Ghairi
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="inline-flex items-center gap-2 bg-church-500 hover:bg-church-600 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-colors"
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
          </div>
        </div>
      </AnimatedSection>

      {/* ===== SUCCESS ===== */}
      {success && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-xl flex items-start gap-3">
          <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-emerald-800 flex-1">{success}</p>
        </div>
      )}

      {/* ===== ERROR ===== */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
        </div>
      )}

      {/* ===== TABS + FORM ===== */}
      <AnimatedSection delay={0.1}>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-100">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "text-church-600 border-b-2 border-church-500 bg-church-50/50"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <Icon /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Form */}
          <div className="p-6 space-y-5">
            {filteredKeys.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                Hakuna mipangilio kwenye sehemu hii
              </p>
            ) : (
              filteredKeys.map((key) => {
                const meta = FIELD_LABELS[key] || { label: key };
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {meta.label}
                    </label>
                    {key === "announcement" ? (
                      <textarea
                        value={settings[key] || ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                        rows={3}
                        placeholder={meta.placeholder}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm resize-none"
                      />
                    ) : (
                      <input
                        type={meta.type || "text"}
                        value={settings[key] || ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={meta.placeholder}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm"
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </AnimatedSection>

      {/* ===== INFO ===== */}
      <AnimatedSection>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="text-sm text-amber-800">
            ⚠️ <strong>Kumbuka:</strong> Mipangilio hii inatumika kwenye ukurasa wa public
            (header, footer, contact). Baada ya kuhifadhi, ongeza refresh ili uone mabadiliko.
          </p>
        </div>
      </AnimatedSection>
    </div>
  );
}