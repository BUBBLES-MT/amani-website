// frontend/app/admin/login/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi, tokenStorage, userStorage } from "@/lib/api";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaChurch,
  FaShieldAlt,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaBook,
  FaCheck,
} from "react-icons/fa";

// ============================================
// ✅ ROLES ZINAZORUHUSIWA KUINGIA ADMIN
// ============================================
const ADMIN_ROLES = [
  "super_admin",
  "mchungaji_kiongozi",
  "mchungaji_msaidizi",
  "mwinjilist",
  "mzee_kanisa",
  "mhasibu",
  "katibu_mkuu",
  "mwenyekiti",
  "mwenyekiti_msaidizi",
  "it",
];

// ============================================
// 📖 BIBLIA SLIDES
// ============================================
interface BibleSlide {
  icon: string;
  title: string;
  description: string;
  verse: string;
  reference: string;
  features: string[];
}

const BIBLE_SLIDES: BibleSlide[] = [
  {
    icon: "✝️",
    title: "Karibu Nyumbani",
    description: "Kanisa la KKKT - Usharika Wa Amani, Singida",
    verse:
      "\"Njoni kwangu, ninyi nyote msumbukao na wenye kulemewa na mizigo, nami nitawapumzisha.\"",
    reference: "Mathayo 11:28",
    features: [
      "Ushirika wa Waumini",
      "Ibada za Kila Wiki",
      "Mahubiri ya Neno la Mungu",
      "Huduma kwa Jamii",
      "Vikundi vya Vijana",
      "Waimbaji na Kwaya",
    ],
  },
  {
    icon: "🕊️",
    title: "Nuru ya Ulimwengu",
    description: "Kueneza Injili na Upendo wa Kristo",
    verse:
      "\"Ninyi ni nuru ya ulimwengu. Mji uliowekwa juu ya mlima hauwezi kufichika.\"",
    reference: "Mathayo 5:14",
    features: [
      "Kuhubiri Injili",
      "Kuwafikia Wengine",
      "Maombi ya Ushirika",
      "Mafunzo ya Biblia",
      "Huduma za Uinjilisti",
      "Ushuhuda wa Imani",
    ],
  },
  {
    icon: "🙏",
    title: "Imani na Matumaini",
    description: "Kukua Pamoja Katika Imani",
    verse:
      "\"Basi imani ni kuwa na hakika ya mambo yatarajiwayo, ni uhakika wa mambo yasiyoonekana.\"",
    reference: "Waebrania 11:1",
    features: [
      "Kuimarisha Imani",
      "Matumaini ya Kesho",
      "Upendo wa Kristo",
      "Ushirika wa Waumini",
      "Huduma za Kiroho",
      "Maombi ya Pamoja",
    ],
  },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [currentSlide, setCurrentSlide] = useState(0);
  const [displayedTitle, setDisplayedTitle] = useState("");
  const [displayedVerse, setDisplayedVerse] = useState("");
  const [titleIndex, setTitleIndex] = useState(0);
  const [verseIndex, setVerseIndex] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // ============================================
  // 🔐 AUTH CHECK
  // ============================================
  useEffect(() => {
    const token = tokenStorage.get();
    const user = userStorage.get();

    if (token && user) {
      const role = user.role?.toLowerCase() || "";
      if (ADMIN_ROLES.includes(role)) {
        // ✅ Weka cookie kama haipo (kwa safety)
        document.cookie = `user_role=${role}; path=/; max-age=${
          60 * 60 * 24 * 7
        }; SameSite=Lax`;
        router.replace("/admin/dashboard");
      }
    }
  }, [router]);

  // ============================================
  // 🎬 AUTO SLIDE
  // ============================================
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BIBLE_SLIDES.length);
      setDisplayedTitle("");
      setDisplayedVerse("");
      setTitleIndex(0);
      setVerseIndex(0);
      setIsTypingComplete(false);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  // ============================================
  // ⌨️ TYPING — TITLE
  // ============================================
  useEffect(() => {
    const currentSlideData = BIBLE_SLIDES[currentSlide];
    const targetTitle = currentSlideData.title;

    if (titleIndex >= targetTitle.length) return;

    const timer = setTimeout(() => {
      setDisplayedTitle((prev) => prev + targetTitle[titleIndex]);
      setTitleIndex((prev) => prev + 1);
    }, 60);

    return () => clearTimeout(timer);
  }, [titleIndex, currentSlide]);

  // ============================================
  // ⌨️ TYPING — VERSE
  // ============================================
  useEffect(() => {
    const currentSlideData = BIBLE_SLIDES[currentSlide];
    const targetVerse = currentSlideData.verse;
    const titleLength = currentSlideData.title.length;

    if (titleIndex < titleLength) return;

    if (verseIndex >= targetVerse.length) {
      setIsTypingComplete(true);
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedVerse((prev) => prev + targetVerse[verseIndex]);
      setVerseIndex((prev) => prev + 1);
    }, 30);

    return () => clearTimeout(timer);
  }, [titleIndex, verseIndex, currentSlide]);

  // ============================================
  // 🔥 LOGIN
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await authApi.login(email, password);
      console.log("✅ Login successful:", data.user);

      const role = data.user.role?.toLowerCase() || "";

      if (!ADMIN_ROLES.includes(role)) {
        setError(
          `Akaunti yako (${role}) hairuhusiwi kuingia admin panel. Wasiliana na mchungaji kiongozi.`
        );
        setIsLoading(false);
        tokenStorage.remove();
        userStorage.remove();
        return;
      }

      // 🔥 MUHIMU: Weka cookie ya role kwa middleware
      //    Hii inaruhusu middleware ku-redirect IT/Mhasibu/Mzee
      //    kwenye dashboard zao PAPO HAPO bila kuonyesha dashboard ya admin
      document.cookie = `user_role=${role}; path=/; max-age=${
        60 * 60 * 24 * 7 // siku 7
      }; SameSite=Lax`;

      setSuccess(`Karibu, ${data.user.name}!`);

      setTimeout(() => {
        router.replace("/admin/dashboard");
      }, 500);
    } catch (err: any) {
      console.error("❌ Login error:", err);
      setError(
        err.message || "Email au password si sahihi. Tafadhali jaribu tena."
      );
      setIsLoading(false);
    }
  };

  const currentSlideData = BIBLE_SLIDES[currentSlide];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ===== BACKGROUND ===== */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-church-900 via-church-800 to-church-700"></div>

      <div className="fixed inset-0 z-[1] opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-church-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* ===== MAIN CONTAINER ===== */}
      <div className="relative z-10 flex justify-center items-center min-h-screen p-4 md:p-6">
        <div className="flex w-full max-w-3xl bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          {/* ============================================ */}
          {/* LEFT SIDE — BIBLIA SLIDES */}
          {/* ============================================ */}
          <div className="hidden md:block w-1/2 relative min-h-[520px] overflow-hidden">
            {/* Slides background */}
            {BIBLE_SLIDES.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-1000 ${
                  currentSlide === index
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-105"
                } bg-gradient-to-br from-church-600/80 via-church-700/80 to-church-900/80`}
              >
                <div className="absolute top-6 left-0 right-0 flex flex-col items-center text-white z-10 px-4">
                  <div className="text-7xl md:text-8xl mb-2 drop-shadow-lg">
                    {slide.icon}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-serif font-bold text-center drop-shadow-sm">
                    {slide.title}
                  </h3>
                  <p className="text-lg md:text-xl text-center text-white/80 mt-1">
                    {slide.description}
                  </p>
                </div>
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
            ))}

            {/* TYPING AREA */}
            <div className="absolute top-[270px] left-4 right-4 z-20">
              <h2 className="text-2xl md:text-3xl font-bold leading-tight drop-shadow-sm text-center text-white">
                {displayedTitle}
                {titleIndex < currentSlideData.title.length && (
                  <span className="inline-block w-[3px] h-6 bg-gold-400 ml-1 animate-blink align-middle"></span>
                )}
              </h2>

              <p className="mt-1 text-base md:text-lg italic leading-snug drop-shadow-sm text-center text-gold-200">
                {displayedVerse}
                {titleIndex >= currentSlideData.title.length &&
                  verseIndex < currentSlideData.verse.length && (
                    <span className="inline-block w-[2px] h-4 bg-gold-400/80 ml-1 animate-blink align-middle"></span>
                  )}
              </p>

              {isTypingComplete && (
                <div className="mt-1 text-center animate-fadeInUp">
                  <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-gold-300 text-base font-semibold border border-gold-500/30">
                    <FaBook className="text-sm" />
                    {currentSlideData.reference}
                  </span>
                </div>
              )}

              {isTypingComplete && (
                <div className="grid grid-cols-2 gap-1.5 animate-fadeInUp mt-1.5">
                  {currentSlideData.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 text-sm bg-white/10 backdrop-blur px-2.5 py-1.5 rounded-full text-white/90"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <FaCheck className="text-emerald-400 text-xs flex-shrink-0" />
                      <span className="leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* COPYRIGHT */}
            <div className="absolute bottom-3 left-0 right-0 z-20 text-center px-4">
              <p className="text-white/50 text-xs">
                © 2026 KKKT Usharika Wa Amani, Singida
              </p>
              <p className="text-white/40 text-[10px]">
                Mfumo wa Usimamizi wa Kanisa
              </p>
            </div>

            {/* INDICATORS */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {BIBLE_SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSlide(index);
                    setDisplayedTitle("");
                    setDisplayedVerse("");
                    setTitleIndex(0);
                    setVerseIndex(0);
                    setIsTypingComplete(false);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? "w-7 bg-gold-400"
                      : "w-3.5 bg-white/40"
                  }`}
                  aria-label={`Nenda kwenye slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* ============================================ */}
          {/* RIGHT SIDE — LOGIN FORM */}
          {/* ============================================ */}
          <div className="w-full md:w-1/2 p-6 md:p-10 bg-white/95 backdrop-blur">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-church-500 to-church-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4 animate-gentleGlow">
                <FaChurch className="text-white text-4xl" />
              </div>
              <h1 className="text-xl md:text-2xl font-serif font-bold text-gray-800">
                KKKT Church
              </h1>
              <p className="text-gray-500 text-sm">Usharika wa Amani, Singida</p>
            </div>

            <div className="text-center mb-5">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-church-600 to-church-800 bg-clip-text text-transparent">
                Karibu Tena!
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Ingia kwenye akaunti yako ya mfumo
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2 animate-slideDown">
                  <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2 animate-slideDown">
                  <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaUser className="inline mr-2 text-church-500" />
                  Barua Pepe
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-church-500 focus:outline-none focus:ring-2 focus:ring-church-500/20 transition-all bg-gray-50 text-sm"
                  placeholder="admin@church.com"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaLock className="inline mr-2 text-church-500" />
                  Nenosiri
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:border-church-500 focus:outline-none focus:ring-2 focus:ring-church-500/20 transition-all bg-gray-50 text-sm"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-church-500 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-church-500 focus:ring-church-500"
                  />
                  <span>Nikumbuke</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-church-600 hover:text-church-800 transition-colors font-medium"
                >
                  Nimechacha nenosiri?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full py-3 bg-gradient-to-r from-church-600 to-church-800 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Inaingiza...
                  </>
                ) : (
                  <>
                    <FaShieldAlt /> Ingia
                  </>
                )}
              </button>
            </form>

            {/* Register link */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Huna akaunti?{" "}
                <Link
                  href="/register"
                  className="text-church-600 hover:text-church-800 font-medium transition-colors"
                >
                  Jisajili Hapa
                </Link>
              </p>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center text-gray-400 text-xs flex items-center justify-center gap-4">
              <span className="flex items-center gap-1">
                <FaClock /> 24/7 Support
              </span>
              <span className="w-px h-4 bg-gray-300"></span>
              <span>Secure Login</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== STYLES ===== */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gentleGlow {
          0%, 100% { box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3); }
          50% { box-shadow: 0 15px 35px rgba(79, 70, 229, 0.5); }
        }
        .animate-blink {
          animation: blink 0.8s step-end infinite;
        }
        .animate-slideDown {
          animation: slideDown 0.4s ease;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease forwards;
        }
        .animate-gentleGlow {
          animation: gentleGlow 3s ease-in-out infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .delay-700 {
          animation-delay: 0.7s;
        }
      `}</style>
    </div>
  );
}