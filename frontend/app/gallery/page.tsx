// frontend/app/(public)/gallery/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { galleryApi, GalleryItem } from "@/lib/api";
import {
  FaCamera,
  FaPlay,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import AnimatedSection from "@/components/ui/AnimatedSection";
import AnimatedStagger from "@/components/ui/AnimatedStagger";
import {
  AnimatedHero,
  AnimatedHeroItem,
  AnimatedHeroText,
} from "@/components/ui/AnimatedHero";

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("Zote");

  // ============================================
  // 📥 FETCH GALLERY
  // ============================================
  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await galleryApi.public({ limit: 100 });
        setImages(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("❌ Gallery fetch error:", err);
        setError(err.message || "Imeshindwa kupata picha");
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  // ============================================
  // 🎯 FILTERS
  // ============================================
  const categories = Array.from(
    new Set(images.map((img) => img.category).filter(Boolean))
  );
  const filters = ["Zote", ...categories];

  const filteredImages =
    activeCategory === "Zote"
      ? images
      : images.filter((img) => img.category === activeCategory);

  const getFullUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:8000${url}`;
  };

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
              Picha
            </div>
          </AnimatedHeroItem>

          <AnimatedHeroText>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold leading-tight mb-4">
              <span className="text-gold-300">Picha</span> za Kanisa
            </h1>
          </AnimatedHeroText>

          <AnimatedHeroItem>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl leading-relaxed">
              Tazama picha za matukio, ibada, na shughuli mbalimbali za kanisa letu.
            </p>
          </AnimatedHeroItem>
        </div>

        <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 opacity-10 text-[12rem] md:text-[18rem] select-none">
          📸
        </div>
      </AnimatedHero>

      {/* ===== ERROR ===== */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
        </div>
      )}

      {/* ===== CATEGORIES ===== */}
      {!loading && images.length > 0 && (
        <AnimatedSection className="flex flex-wrap gap-2 mb-8">
          {filters.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-church-500 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </AnimatedSection>
      )}

      {/* ===== LOADING ===== */}
      {loading ? (
        <div className="text-center py-16">
          <FaSpinner className="animate-spin text-5xl text-church-500 mx-auto" />
          <p className="text-gray-500 mt-4">Inapakia picha...</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <FaCamera className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-lg">
            {images.length === 0
              ? "Bado hakuna picha zilizowekwa"
              : "Hakuna picha kwenye kundi hili"}
          </p>
          <p className="text-sm mt-2">
            {images.length === 0
              ? "Picha zitaongezwa hivi karibuni"
              : "Jaribu kubadilisha kichujio"}
          </p>
        </div>
      ) : (
        <AnimatedStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredImages.map((image, index) => (
            <div
              key={image.id}
              onClick={() => setSelectedImage(index)}
              className="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer"
            >
              <div className="aspect-square bg-gradient-to-br from-church-400 to-church-600 flex items-center justify-center text-white">
                {image.image_url ? (
                  <img
                    src={getFullUrl(image.image_url)}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                    🖼️
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white font-bold text-lg px-4 text-center">
                    {image.title}
                  </span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-white text-sm font-medium truncate">
                  {image.title}
                </p>
                {image.category && (
                  <p className="text-white/70 text-xs">{image.category}</p>
                )}
              </div>
            </div>
          ))}
        </AnimatedStagger>
      )}

      {/* ===== CTA ===== */}
      <AnimatedSection className="mt-12 bg-gradient-to-r from-church-500 to-church-700 rounded-3xl p-8 md:p-12 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
          Je, Una Swali?
        </h2>
        <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
          Wasiliana nasi kwa maswali yoyote kuhusu picha za kanisa.
        </p>
        <Link
          href="/contact"
          className="btn-secondary inline-flex items-center gap-2 text-base px-8 py-3"
        >
          <FaCamera /> Wasiliana Nasi
        </Link>
      </AnimatedSection>

      {/* ===== LIGHTBOX ===== */}
      {selectedImage !== null && filteredImages[selectedImage] && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white text-3xl hover:scale-110 transition-transform z-10"
            aria-label="Close"
          >
            <FaTimes />
          </button>

          {filteredImages.length > 1 && (
            <>
              <button
                onClick={() =>
                  setSelectedImage((prev) =>
                    prev !== null && prev > 0 ? prev - 1 : filteredImages.length - 1
                  )
                }
                className="absolute left-4 text-white text-2xl bg-white/20 rounded-full p-3 hover:bg-white/30 transition-colors z-10"
                aria-label="Previous"
              >
                <FaChevronLeft />
              </button>

              <button
                onClick={() =>
                  setSelectedImage((prev) =>
                    prev !== null && prev < filteredImages.length - 1 ? prev + 1 : 0
                  )
                }
                className="absolute right-4 text-white text-2xl bg-white/20 rounded-full p-3 hover:bg-white/30 transition-colors z-10"
                aria-label="Next"
              >
                <FaChevronRight />
              </button>
            </>
          )}

          <div className="max-w-4xl max-h-[80vh] bg-white/10 rounded-2xl overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-church-400 to-church-600 flex items-center justify-center text-white text-8xl p-12">
              {filteredImages[selectedImage].image_url ? (
                <img
                  src={getFullUrl(filteredImages[selectedImage].image_url)}
                  alt={filteredImages[selectedImage].title}
                  className="w-full h-full object-contain"
                />
              ) : (
                "🖼️"
              )}
            </div>
            <div className="p-4 bg-white/10">
              <h3 className="text-white font-bold text-lg">
                {filteredImages[selectedImage].title}
              </h3>
              {filteredImages[selectedImage].category && (
                <p className="text-white/70">
                  {filteredImages[selectedImage].category}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}