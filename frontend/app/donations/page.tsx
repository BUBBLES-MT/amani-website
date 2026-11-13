// frontend/app/(public)/donations/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaHands,
  FaHeart,
  FaMoneyBillWave,
  FaMobile,
  FaUniversity,
  FaCheckCircle,
  FaArrowLeft,
  FaSpinner,
} from "react-icons/fa";
import { MdSend } from "react-icons/md";
import AnimatedSection from "@/components/ui/AnimatedSection";
import AnimatedStagger from "@/components/ui/AnimatedStagger";
import {
  AnimatedHero,
  AnimatedHeroItem,
  AnimatedHeroText,
} from "@/components/ui/AnimatedHero";

export default function DonationsPage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donationMethod, setDonationMethod] = useState("mpesa");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const presetAmounts = [5000, 10000, 20000, 50000, 100000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const methods = [
    { id: "mpesa", label: "M-Pesa", icon: FaMobile, color: "bg-green-500" },
    { id: "tigo", label: "Tigo Pesa", icon: FaMobile, color: "bg-blue-500" },
    { id: "bank", label: "Benki", icon: FaUniversity, color: "bg-church-500" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* ===== BACK LINK ===== */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-church-600 transition-colors text-sm font-medium"
        >
          <FaArrowLeft /> Rudi Nyumbani
        </Link>
      </div>

      {/* ===== HERO ===== */}
      <AnimatedHero className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-church-600 via-church-700 to-church-900 text-white p-8 md:p-16 mb-12 shadow-2xl">
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl">
          <AnimatedHeroItem>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 text-sm font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Kuchangia
            </div>
          </AnimatedHeroItem>

          <AnimatedHeroText>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold leading-tight mb-4">
              Changia <span className="text-gold-300">Amani Luthelani Church</span>
            </h1>
          </AnimatedHeroText>

          <AnimatedHeroItem>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl leading-relaxed">
              Mchango wako unatusaidia kuendeleza huduma na kuwafikia watu wengi zaidi.
            </p>
          </AnimatedHeroItem>
        </div>

        <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 opacity-10 text-[12rem] md:text-[18rem] select-none">
          💝
        </div>
      </AnimatedHero>

      {/* ===== DONATION FORM ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ===== FORM ===== */}
        <AnimatedSection className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">
              Fanya Mchango
            </h2>

            {isSubmitted ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="font-bold text-green-800 text-2xl mb-2">
                  Mchango Umepokelewa!
                </h3>
                <p className="text-green-600">
                  Asante kwa mchango wako. Mungu akubariki sana!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Amount Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Chagua Kiasi (TSh)
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {presetAmounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount("");
                        }}
                        className={`py-3 px-2 rounded-xl font-semibold transition-all duration-300 ${
                          selectedAmount === amount
                            ? "bg-church-500 text-white shadow-lg scale-105"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      className="input-field"
                      placeholder="Kiasi kingine (TSh)"
                      min="1"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Njia ya Malipo
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {methods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setDonationMethod(method.id)}
                        className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                          donationMethod === method.id
                            ? "border-church-500 bg-church-50 text-church-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <method.icon className="text-lg" />
                        <span className="text-sm">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Donor Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Jina Lako
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Jina kamili"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Barua Pepe
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Simu
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="+255 7XX XXX XXX"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Ujumbe (Hiari)
                  </label>
                  <textarea
                    className="input-field min-h-[80px]"
                    placeholder="Andika ujumbe wako..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Inachakata...
                    </>
                  ) : (
                    <>
                      <FaHeart /> Changia Sasa
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </AnimatedSection>

        {/* ===== SIDEBAR ===== */}
        <AnimatedSection delay={0.1} className="space-y-6">
          {/* Impact Card */}
          <div className="bg-gradient-to-br from-church-500 to-church-700 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-bold mb-2">Mchango Wako Una Athari</h3>
            <p className="text-sm opacity-90 mb-4">
              Kila mchango unatusaidia kuendeleza huduma zetu za kanisa.
            </p>
            <AnimatedStagger className="space-y-3 text-sm">
              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                <span className="text-2xl">📖</span>
                <div>
                  <p className="font-semibold">Kununua Biblia</p>
                  <p className="opacity-75">TSh 15,000</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                <span className="text-2xl">🍞</span>
                <div>
                  <p className="font-semibold">Kuwalisha Watu</p>
                  <p className="opacity-75">TSh 10,000</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                <span className="text-2xl">🎵</span>
                <div>
                  <p className="font-semibold">Vifaa vya Ibada</p>
                  <p className="opacity-75">TSh 25,000</p>
                </div>
              </div>
            </AnimatedStagger>
          </div>

          {/* Bank Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              Maelezo ya Benki
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Benki:</span> CRDB Bank
              </p>
              <p>
                <span className="font-semibold">Jina:</span> Amani Luthelani Church
              </p>
              <p>
                <span className="font-semibold">A/C No:</span> 1234567890
              </p>
              <p>
                <span className="font-semibold">Tawi:</span> Singida
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}