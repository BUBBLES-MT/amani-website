// frontend/app/admin/registrations/page.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { registrationsApi, User } from "@/lib/api";
import {
  FaUserPlus,
  FaSearch,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaChurch,
  FaClock,
  FaEye,
  FaUsers,
  FaUserShield,
  FaInfoCircle,
  FaRedo,
} from "react-icons/fa";

// ============================================================
// 🎨 ROLE LABELS
// ============================================================
const ROLE_LABELS: Record<string, string> = {
  mchungaji_kiongozi: "Mchungaji Kiongozi",
  mchungaji_msaidizi: "Mchungaji Msaidizi",
  mwinjilist: "Mwinjilist",
  mzee_kanisa: "Mzee wa Kanisa",
  mhasibu: "Mhasibu",
  katibu_mkuu: "Katibu Mkuu",
  mwenyekiti: "Mwenyekiti",
  mwenyekiti_msaidizi: "Mwenyekiti Msaidizi",
  it: "IT",
  muumini: "Muumini",
  super_admin: "Super Admin",
};

const getRoleLabel = (role: string) => ROLE_LABELS[role] || role;

// ============================================================
// 🎨 ROLE COLORS
// ============================================================
const ROLE_COLORS: Record<string, string> = {
  mchungaji_kiongozi: "bg-purple-100 text-purple-700",
  mchungaji_msaidizi: "bg-indigo-100 text-indigo-700",
  mwinjilist: "bg-blue-100 text-blue-700",
  mzee_kanisa: "bg-teal-100 text-teal-700",
  mhasibu: "bg-green-100 text-green-700",
  katibu_mkuu: "bg-amber-100 text-amber-700",
  mwenyekiti: "bg-orange-100 text-orange-700",
  mwenyekiti_msaidizi: "bg-yellow-100 text-yellow-700",
  it: "bg-cyan-100 text-cyan-700",
  muumini: "bg-gray-100 text-gray-700",
  super_admin: "bg-red-100 text-red-700",
};

const getRoleColor = (role: string) =>
  ROLE_COLORS[role] || "bg-gray-100 text-gray-700";

// ============================================================
// 🔧 HELPERS
// ============================================================
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("sw-TZ", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

// ============================================================
// 🚀 MAIN COMPONENT
// ============================================================
export default function RegistrationsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // ✅ Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectingUser, setRejectingUser] = useState<User | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ============================================================
  // 📥 FETCH PENDING REGISTRATIONS
  // ============================================================
  const fetchRegistrations = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await registrationsApi.list({ limit: 200 });
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("❌ Fetch registrations error:", err);
      setError(err.message || "Imeshindwa kupata maombi ya usajili");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // ============================================================
  // ✅ APPROVE
  // ============================================================
  const handleApprove = async (user: User) => {
    if (
      !confirm(
        `Unataka kumuidhinisha "${user.name}"? Ataweza kuingia mfumo mara moja.`
      )
    ) {
      return;
    }

    setActionLoading(user.id);
    setError("");
    setSuccessMsg("");

    try {
      await registrationsApi.approve(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setSuccessMsg(`✅ "${user.name}" ameidhinishwa kikamilifu!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      console.error("❌ Approve error:", err);
      setError(err.message || "Imeshindwa kumuidhinisha mtumiaji");
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // ❌ REJECT (FUNGUA MODAL)
  // ============================================================
  const openRejectModal = (user: User) => {
    setRejectingUser(user);
    setRejectionReason("");
  };

  const closeRejectModal = () => {
    setRejectingUser(null);
    setRejectionReason("");
  };

  // ============================================================
  // ❌ REJECT (THIBITISHA)
  // ============================================================
  const handleReject = async () => {
    if (!rejectingUser) return;

    setActionLoading(rejectingUser.id);
    setError("");
    setSuccessMsg("");

    try {
      await registrationsApi.reject(
        rejectingUser.id,
        rejectionReason.trim() || undefined
      );
      setUsers((prev) => prev.filter((u) => u.id !== rejectingUser.id));
      setSuccessMsg(
        `❌ "${rejectingUser.name}" amekataliwa na amefutwa kwenye database.`
      );
      setTimeout(() => setSuccessMsg(""), 4000);
      closeRejectModal();
    } catch (err: any) {
      console.error("❌ Reject error:", err);
      setError(err.message || "Imeshindwa kumkataa mtumiaji");
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // 🔍 FILTER + SEARCH
  // ============================================================
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (roleFilter !== "all" && u.role !== roleFilter) return false;

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone || "").toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [users, roleFilter, search]);

  // ============================================================
  // 📊 STATS
  // ============================================================
  const stats = useMemo(() => {
    const byRole: Record<string, number> = {};
    users.forEach((u) => {
      byRole[u.role] = (byRole[u.role] || 0) + 1;
    });

    // Top 3 roles
    const topRoles = Object.entries(byRole)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return {
      total: users.length,
      byRole,
      topRoles,
    };
  }, [users]);

  // ============================================================
  // 🎨 RENDER
  // ============================================================
  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FaUserPlus className="text-church-500" />
            Maombi ya Usajili
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Idhinisha au kataa maombi ya watumiaji wapya
          </p>
        </div>

        <button
          onClick={fetchRegistrations}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-church-500 hover:bg-church-600 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
        >
          {loading ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaRedo />
          )}
          Refresh
        </button>
      </div>

      {/* ===== SUCCESS ===== */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-xl flex items-start gap-3">
          <FaCheck className="text-emerald-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-emerald-700 flex-1">{successMsg}</p>
        </div>
      )}

      {/* ===== ERROR ===== */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={fetchRegistrations}
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
            >
              Jaribu tena
            </button>
          </div>
        </div>
      )}

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <FaUsers className="text-2xl text-church-500" />
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{stats.total}</h3>
          <p className="text-sm text-gray-500">Maombi Yote</p>
        </div>

        {stats.topRoles.map(([role, count]) => (
          <div key={role} className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <FaUserShield className="text-2xl text-gold-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{count}</h3>
            <p className="text-sm text-gray-500 truncate">
              {getRoleLabel(role)}
            </p>
          </div>
        ))}

        {stats.topRoles.length < 3 &&
          Array.from({ length: 3 - stats.topRoles.length }).map((_, i) => (
            <div key={`empty-${i}`} className="card p-5 opacity-50">
              <div className="flex items-center justify-between mb-2">
                <FaUserShield className="text-2xl text-gray-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-300">0</h3>
              <p className="text-sm text-gray-400">—</p>
            </div>
          ))}
      </div>

      {/* ===== SEARCH + FILTER ===== */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tafuta kwa jina, email, au simu..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm bg-white"
        >
          <option value="all">Roles zote</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* ===== LIST ===== */}
      {loading ? (
        <div className="card p-12 text-center">
          <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto mb-3" />
          <p className="text-gray-500">Inapakia maombi...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card p-12 text-center">
          <FaUserPlus className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-1">
            {users.length === 0
              ? "Hakuna maombi yanayosubiri"
              : "Hakuna matokeo ya utafutaji"}
          </p>
          <p className="text-sm text-gray-400">
            {users.length === 0
              ? "Maombi mapya yataonekana hapa"
              : "Jaribu kubadilisha filter au search"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="card p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Avatar + Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-church-400 to-church-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-gray-800 truncate">
                        {user.name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaEnvelope className="text-gray-400" />
                        {user.email}
                      </span>
                      {user.phone && (
                        <span className="flex items-center gap-1">
                          <FaPhone className="text-gray-400" />
                          {user.phone}
                        </span>
                      )}
                      {user.church_name && (
                        <span className="flex items-center gap-1">
                          <FaChurch className="text-gray-400" />
                          {user.church_name}
                          {user.church_location &&
                            ` • ${user.church_location}`}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <FaClock className="text-gray-400" />
                        {formatDate(user.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/admin/registrations/${user.id}`}
                    className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    <FaEye /> Maelezo
                  </Link>

                  <button
                    onClick={() => handleApprove(user)}
                    disabled={actionLoading === user.id}
                    className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    {actionLoading === user.id ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaCheck />
                    )}
                    Idhinisha
                  </button>

                  <button
                    onClick={() => openRejectModal(user)}
                    disabled={actionLoading === user.id}
                    className="inline-flex items-center gap-1.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    <FaTimes /> Kataa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== REJECT MODAL ===== */}
      {rejectingUser && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeRejectModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaExclamationTriangle className="text-red-500 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Kataa Usajili?
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  <strong>{rejectingUser.name}</strong> atafutwa moja kwa moja
                  kwenye database. Hatua hii haiwezi kurudishwa.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sababu ya kukataa (si lazima)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Mfano: Sio kiongozi halisi wa kanisa..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 text-sm resize-none"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              <p className="text-xs text-amber-800 flex items-start gap-2">
                <FaInfoCircle className="text-amber-500 mt-0.5 flex-shrink-0" />
                <span>
                  Mtumiaji atafutwa kabisa. Akitaka kujiunga tena, atalazimika
                  kujisajili upya.
                </span>
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={closeRejectModal}
                disabled={!!actionLoading}
                className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
              >
                Ghairi
              </button>
              <button
                onClick={handleReject}
                disabled={!!actionLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors inline-flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Inafuta...
                  </>
                ) : (
                  <>
                    <FaTimes /> Kataa & Futa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}