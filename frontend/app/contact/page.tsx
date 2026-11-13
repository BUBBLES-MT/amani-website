// frontend/app/(public)/contact/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { messagesApi } from "@/lib/api";
import {
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock,
  FaFacebook, FaInstagram, FaYoutube, FaTwitter,
  FaSpinner, FaExclamationTriangle, FaCheckCircle, FaArrowLeft,
} from "react-icons/fa";
import { MdSend } from "react-icons/md";
import AnimatedSection from "@/components/ui/AnimatedSection";
import AnimatedStagger from "@/components/ui/AnimatedStagger";
import {
  AnimatedHero,
  AnimatedHeroItem,
  AnimatedHeroText,
} from "@/components/ui/AnimatedHero";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ BACKEND INTEGRATION
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await messagesApi.create({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone || undefined,
        subject: formData.subject || undefined,
        category: "Nyingine",
        message: formData.message.trim(),
      });

      setIsSubmitted(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => setIsSubmitted(false), 8000);
    } catch (err: any) {
      console.error("Send message error:", err);
      setError(
        err.message || "Imeshindwa kutuma ujumbe. Tafadhali jaribu tena."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ TAARIFA SAHIHI — Singida, Ginery
  const contactInfo = [
    {
      icon: FaPhone,
      label: "Simu",
      value: "+255 763 298 338",
      href: "tel:+255763298338",
    },
    {
      icon: FaEnvelope,
      label: "Barua Pepe",
      value: "info@amanichurch.com",
      href: "mailto:info@amanichurch.com",
    },
    {
      icon: FaMapMarkerAlt,
      label: "Anwani",
      value: "Singida, Ginery, Tanzania",
      href: "#",
    },
    {
      icon: FaClock,
      label: "Saa za Ibada",
      value: "Jumapili 8:00 AM - 12:00 PM",
      href: "#",
    },
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
              Wasiliana Nasi
            </div>
          </AnimatedHeroItem>

          <AnimatedHeroText>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold leading-tight mb-4">
              Tupate <span className="text-gold-300">Habari</span>
            </h1>
          </AnimatedHeroText>

          <AnimatedHeroItem>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl leading-relaxed">
              Tutafurahi kusikia kutoka kwako. Wasiliana nasi kwa maswali, maombi, au ushauri.
            </p>
          </AnimatedHeroItem>
        </div>

        <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 opacity-10 text-[12rem] md:text-[18rem] select-none">
          ✝️
        </div>
      </AnimatedHero>

      {/* ===== CONTACT INFO + FORM ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* ===== INFO ===== */}
        <AnimatedSection>
          <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">
            Taarifa za Mawasiliano
          </h2>
          <AnimatedStagger className="space-y-4">
            {contactInfo.map((item, i) => (
              <a
                key={i}
                href={item.href}
                className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] group"
              >
                <div className="w-12 h-12 bg-church-100 rounded-xl flex items-center justify-center group-hover:bg-church-500 transition-colors duration-300">
                  <item.icon className="text-xl text-church-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="font-medium text-gray-800">{item.value}</p>
                </div>
              </a>
            ))}
          </AnimatedStagger>

          {/* Social */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Follow Us
            </h3>
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:bg-church-500 hover:text-white transition-all duration-300 hover:scale-110">
                <FaFacebook className="text-xl" />
              </a>
              <a href="#" className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:bg-church-500 hover:text-white transition-all duration-300 hover:scale-110">
                <FaInstagram className="text-xl" />
              </a>
              <a href="#" className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:bg-church-500 hover:text-white transition-all duration-300 hover:scale-110">
                <FaYoutube className="text-xl" />
              </a>
              <a href="#" className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:bg-church-500 hover:text-white transition-all duration-300 hover:scale-110">
                <FaTwitter className="text-xl" />
              </a>
            </div>
          </div>
        </AnimatedSection>

        {/* ===== FORM ===== */}
        <AnimatedSection delay={0.1}>
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">
              Tuma Ujumbe
            </h2>

            {/* Success */}
            {isSubmitted && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-3" />
                <h3 className="font-bold text-green-800 text-lg">Ujumbe Umetumwa!</h3>
                <p className="text-green-600 text-sm">
                  Tutakujibu haraka iwezekanavyo.
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 flex-1">{error}</p>
              </div>
            )}

            {/* Form */}
            {!isSubmitted && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Jina Lako <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Jina kamili"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Barua Pepe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="email@example.com"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Simu
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="+255 7XX XXX XXX"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Mada
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="input-field"
                    disabled={isSubmitting}
                  >
                    <option value="">Chagua Mada</option>
                    <option value="Maswali ya Jumla">Maswali ya Jumla</option>
                    <option value="Ombi la Maombi">Ombi la Maombi</option>
                    <option value="Ziara Kanisani">Ziara Kanisani</option>
                    <option value="Kuchangia">Kuchangia</option>
                    <option value="Nyingine">Nyingine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Ujumbe <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="input-field min-h-[120px]"
                    placeholder="Andika ujumbe wako hapa..."
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Inatumwa...
                    </>
                  ) : (
                    <>
                      <MdSend /> Tuma Ujumbe
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </AnimatedSection>
      </div>

      {/* ===== MAP ===== */}
      <AnimatedSection className="rounded-3xl overflow-hidden shadow-lg">
        <div className="bg-gray-200 h-64 md:h-96 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-lg font-semibold">Ramani ya Kanisa Letu</p>
            <p className="text-sm">Singida, Ginery, Tanzania</p>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}