// frontend/app/admin/expenses/new/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { expensesApi, offeringsApi } from "@/lib/api";
import { FaArrowLeft, FaSave, FaSpinner, FaExclamationTriangle } from "react-icons/fa";

const CATEGORIES = [
  { value: "Ununuzi",     label: "Ununuzi" },
  { value: "Matengenezo", label: "Matengenezo" },
  { value: "Mishahara",   label: "Mishahara" },
  { value: "Karatasi",    label: "Karatasi" },
  { value: "Usafiri",     label: "Usafiri" },
  { value: "Nyingine",    label: "Nyingine" },
];

export default function NewExpensePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [offerings, setOfferings] = useState<any[]>([]);
  const [loadingOfferings, setLoadingOfferings] = useState(true);

  const [form, setForm] = useState({
    description: "",
    category: CATEGORIES[0].value,
    amount: "",
    offering_id: "",
    receipt_number: "",
  });

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const data = await offeringsApi.list();
        const arr = Array.isArray(data) ? data : [];
        setOfferings(arr);
        if (arr.length > 0) {
          setForm((f) => ({ ...f, offering_id: arr[0].id }));
        }
      } catch (err) {
        console.error("Fetch offerings error:", err);
      } finally {
        setLoadingOfferings(false);
      }
    };
    fetchOfferings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.description.trim()) return setError("Weka maelezo");
    if (!form.amount || Number(form.amount) <= 0) return setError("Weka kiasi sahihi");
    if (!form.offering_id) return setError("Chagua sadaka inayohusika");

    setSaving(true);
    try {
      await expensesApi.create({
        description: form.description.trim(),
        category: form.category,
        amount: Number(form.amount),
        offering_id: form.offering_id,
        receipt_number: form.receipt_number || undefined,
      });
      router.push("/admin/expenses");
    } catch (err: any) {
      console.error("Create expense error:", err);
      setError(err.message || "Imeshindwa kuomba matumizi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/admin/expenses" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <FaArrowLeft className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Omba Matumizi Mpya</h1>
          <p className="text-gray-500 text-sm mt-0.5">Jaza taarifa za matumizi</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maelezo <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Mfano: Kununua karatasi za ofisi"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aina <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
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
              placeholder="Mfano: 20000"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sadaka Inayohusika <span className="text-red-500">*</span>
          </label>
          {loadingOfferings ? (
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <FaSpinner className="animate-spin" /> Inapakia sadaka...
            </p>
          ) : offerings.length === 0 ? (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">
              Hakuna sadaka. Rekodi sadaka kwanza kabla ya kuomba matumizi.
            </p>
          ) : (
            <select
              name="offering_id"
              value={form.offering_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm bg-white"
            >
              {offerings.map((o: any) => (
                <option key={o.id} value={o.id}>
                  {o.offering_type} - TSh {Number(o.amount).toLocaleString()} ({new Date(o.service_date).toLocaleDateString("sw-TZ")})
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Namba ya Risiti (hiari)
          </label>
          <input
            type="text"
            name="receipt_number"
            value={form.receipt_number}
            onChange={handleChange}
            placeholder="Mfano: RCP-001"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-400 text-sm"
          />
        </div>

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving || offerings.length === 0}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-church-500 hover:bg-church-600 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-xl transition-colors font-medium text-sm shadow-sm"
          >
            {saving ? <><FaSpinner className="animate-spin" /> Inahifadhi...</> : <><FaSave /> Hifadhi</>}
          </button>
          <Link
            href="/admin/expenses"
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium text-sm text-center"
          >
            Ghairi
          </Link>
        </div>
      </form>
    </div>
  );
}