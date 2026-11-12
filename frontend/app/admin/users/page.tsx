// frontend/app/admin/users/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usersApi } from "@/lib/api";
import {
  FaPlus, FaSpinner, FaExclamationTriangle, FaUsers,
  FaSearch, FaEye, FaTrash, FaUserShield, FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

// ============================================
// ✅ ROLE LABELS — Pamoja na IT
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

// ============================================
// ✅ ROLE COLORS
// ============================================
const ROLE_COLORS: Record<string, string> = {
  muumini: "bg-gray-100 text-gray-700",
  mzee_kanisa: "bg-amber-100 text-amber-700",
  mhasibu: "bg-blue-100 text-blue-700",
  katibu_mkuu: "bg-indigo-100 text-indigo-700",
  mchungaji_msaidizi: "bg-teal-100 text-teal-700",
  mchungaji_kiongozi: "bg-emerald-100 text-emerald-700",
  mwinjilist: "bg-purple-100 text-purple-700",
  mwenyekiti: "bg-orange-100 text-orange-700",
  mwenyekiti_msaidizi: "bg-yellow-100 text-yellow-700",
  it: "bg-cyan-100 text-cyan-700",
  super_admin: "bg-rose-100 text-rose-700",
};

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await usersApi.list({ limit: 100 });
      const list = Array.isArray(data) ? data : [];

      // ✅ Defense-in-depth: ficha super_admin kwenye frontend pia
      const withoutSuperAdmin = list.filter(
        (u: any) => u.role !== "super_admin"
      );
      setUsers(withoutSuperAdmin);
    } catch (err: any) {
      console.error("❌ Users fetch error:", err);
      setError(err.message || "Imeshindwa kupata watumiaji");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Una uhakika unataka kufuta "${name}"?`)) return;

    setDeleting(id);
    try {
      await usersApi.delete(id);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err: any) {
      setError(err.message || "Imeshindwa kufuta mtumiaji");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || "").toLowerCase().includes(search.toLowerCase());
    const matchesRole = !filterRole || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // ✅ uniqueRoles pia haitajumuisha super_admin (kwa kuwa users tayari haina)
  const uniqueRoles = Array.from(
    new Set(
      users
        .map((u) => u.role)
        .filter((r) => r && r !== "super_admin")
    )
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("sw-TZ", {
        day: "2-digit", month: "short", year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Watumiaji</h1>
          <p className="text-gray-500 text-sm mt-1">Orodha ya watumiaji wote</p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex items-center gap-2 bg-church-500 hover:bg-church-600 text-white px-5 py-2.5 rounded-xl transition-colors font-medium text-sm shadow-sm"
        >
          <FaPlus /> Ongeza Mtumiaji
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tafuta kwa jina, barua pepe, simu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm bg-white min-w-[180px]"
          >
            <option value="">Roles zote</option>
            {uniqueRoles.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-400">
          {filtered.length} kati ya {users.length} watumiaji
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto" />
            <p className="text-gray-500 mt-3">Inapakia watumiaji...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FaUsers className="text-5xl text-gray-300 mx-auto mb-3" />
            <p className="font-medium">
              {users.length === 0 ? "Hakuna watumiaji bado" : "Hakuna watumiaji wanaolingana"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mtumiaji</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Barua Pepe</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Simu</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Hali</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tarehe</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Vitendo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-church-100 rounded-full flex items-center justify-center text-church-700 font-bold flex-shrink-0">
                          {user.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">{user.name}</p>
                          {user.church_name && (
                            <p className="text-xs text-gray-500 truncate">{user.church_name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role] || "bg-gray-100 text-gray-700"}`}>
                        {user.role === "super_admin" && <FaUserShield />}
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                          <FaCheckCircle /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-600">
                          <FaTimesCircle /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="p-2 text-gray-500 hover:text-church-600 hover:bg-church-50 rounded-lg transition-colors"
                          title="Ona"
                        >
                          <FaEye />
                        </Link>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          disabled={deleting === user.id}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Futa"
                        >
                          {deleting === user.id ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}