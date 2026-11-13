// frontend/app/(public)/about/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { publicApi, User } from "@/lib/api";
import {
  FaChurch, FaHands, FaHeart, FaPray, FaUsers,
  FaSpinner, FaExclamationTriangle,
} from "react-icons/fa";
import { FiTarget, FiCompass } from "react-icons/fi";
import { BiHeart } from "react-icons/bi";
import AnimatedSection from "@/components/ui/AnimatedSection";
import AnimatedStagger from "@/components/ui/AnimatedStagger";
import {
  AnimatedHero,
  AnimatedHeroItem,
  AnimatedHeroText,
} from "@/components/ui/AnimatedHero";

export default function AboutPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    total_members: 0,
    total_events: 0,
    total_sermons: 0,
  });
  const [leaders, setLeaders] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [statsData, leadersData] = await Promise.all([
          publicApi.stats().catch(() => null),
          publicApi.leaders().catch(() => []),
        ]);

        if (statsData) setStats(statsData);
        setLeaders(Array.isArray(leadersData) ? leadersData : []);
      } catch (err: any) {
        console.error("About page error:", err);
        setError(err.message || "Imeshindwa kupata data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ============================================================
  // 📊 STATS (Kutoka API)
  // ============================================================
  const statsData = [
    { icon: FaUsers, value: stats.total_members > 0 ? stats.total_members.toLocaleString() : "—", label: "Waumini", color: "text-church-500" },
    { icon: FaChurch, value: stats.total_events > 0 ? stats.total_events : "—", label: "Matukio", color: "text-gold-500" },
    { icon: FaHands, value: stats.total_sermons > 0 ? stats.total_sermons : "—", label: "Mahubiri", color: "text-green-500" },
    { icon: FaHeart, value: "10+", label: "Miaka ya Huduma", color: "text-red-500" },
  ];

  // ============================================================
  // 🎨 VALUES (Static - maandishi ya kanisa)
  // ============================================================
  const values = [
    { icon: BiHeart, title: "Dhamira Yetu", desc: "Kueneza injili na kuwahudumia watu kwa upendo wa Mungu." },
    { icon: FiTarget, title: "Maono Yetu", desc: "Kuwa kanisa linaloongoza katika kueneza upendo na imani." },
    { icon: FiCompass, title: "Historia Yetu", desc: "Tumeanzishwa mwaka 2015 na tumehudumu jamii kwa imani." },
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* ===== HERO ===== */}
      <AnimatedHero className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-church-600 via-church-700 to-church-900 text-white p-8 md:p-16 mb-12 shadow-2xl">
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl">
          <AnimatedHeroItem>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 text-sm font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Kuhusu Sisi
            </div>
          </AnimatedHeroItem>

          <AnimatedHeroText>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold leading-tight mb-4">
              Kujua <span className="text-gold-300">Amani Luthelani Church</span>
            </h1>
          </AnimatedHeroText>

          <AnimatedHeroItem>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl leading-relaxed">
              Tumejitolea kuhudumia jamii kwa upendo, imani, na kujitolea kwa Mungu.
            </p>
          </AnimatedHeroItem>
        </div>

        <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 opacity-10 text-[12rem] md:text-[18rem] select-none">
          ✝️
        </div>
      </AnimatedHero>

      {/* ===== ERROR ===== */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* ===== STATS ===== */}
      <AnimatedSection className="mb-12">
        <AnimatedStagger className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {statsData.map((stat, i) => (
            <div key={i} className="card p-6 text-center hover:scale-105 transition-all duration-300">
              <stat.icon className={`text-4xl md:text-5xl ${stat.color} mx-auto mb-3`} />
              <h4 className="text-2xl md:text-3xl font-bold text-gray-800">
                {loading ? <FaSpinner className="animate-spin inline text-church-500" /> : stat.value}
              </h4>
              <p className="text-sm md:text-base text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </AnimatedStagger>
      </AnimatedSection>

      {/* ===== VALUES ===== */}
      <AnimatedSection className="mb-12">
        <AnimatedStagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((item, i) => (
            <div key={i} className="card p-6 text-center hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-church-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-church-500 group-hover:text-white transition-colors duration-300">
                <item.icon className="text-3xl text-church-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </AnimatedStagger>
      </AnimatedSection>

      {/* ===== TEAM ===== */}
      <AnimatedSection className="mb-12">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="section-title">Timu Yetu</h2>
          <p className="section-subtitle">Viongozi wanaohudumu katika Amani Luthelani Church</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <FaSpinner className="animate-spin text-4xl text-church-500 mx-auto" />
            <p className="text-gray-500 mt-3">Inapakia viongozi...</p>
          </div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaUsers className="text-5xl text-gray-300 mx-auto mb-3" />
            <p>Hakuna viongozi waliowekwa bado</p>
          </div>
        ) : (
          <AnimatedStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leaders.map((member, i) => (
              <div key={member.id || i} className="card p-6 text-center hover:scale-105 transition-all duration-300 group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-church-400 to-church-600 flex items-center justify-center mx-auto mb-4 text-4xl text-white group-hover:scale-110 transition-transform duration-300">
                  {member.name?.charAt(0)?.toUpperCase() || "👤"}
                </div>
                <h4 className="text-lg font-bold text-gray-800">{member.name}</h4>
                <p className="text-sm text-church-600 font-semibold capitalize">{member.role?.replace("_", " ")}</p>
                {member.church_location && (
                  <p className="text-sm text-gray-500 mt-2">{member.church_location}</p>
                )}
              </div>
            ))}
          </AnimatedStagger>
        )}
      </AnimatedSection>

      {/* ===== CTA ===== */}
      <AnimatedSection className="bg-gradient-to-r from-church-500 to-church-700 rounded-3xl p-8 md:p-12 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">Je, Unataka Kujua Zaidi?</h2>
        <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
          Karibu uje kanisani, tutakukaribisha kwa upendo na furaha.
        </p>
        <Link href="/contact" className="btn-secondary inline-flex items-center gap-2 text-base px-8 py-3">
          <FaHeart /> Wasiliana Nasi
        </Link>
      </AnimatedSection>
    </div>
  );
}