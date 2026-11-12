'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FaCamera, FaPlay, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const images = [
    { id: 1, src: '/images/gallery/worship1.jpg', title: 'Ibada ya Jumapili', category: 'Ibada', type: 'image' },
    { id: 2, src: '/images/gallery/worship2.jpg', title: 'Ibada ya Vijana', category: 'Vijana', type: 'image' },
    { id: 3, src: '/images/gallery/event1.jpg', title: 'Tamasha la Kanisa', category: 'Matukio', type: 'image' },
    { id: 4, src: '/images/gallery/event2.jpg', title: 'Sherehe ya Krismasi', category: 'Matukio', type: 'image' },
    { id: 5, src: '/images/gallery/group1.jpg', title: 'Kikundi cha Wanawake', category: 'Vikundi', type: 'image' },
    { id: 6, src: '/images/gallery/group2.jpg', title: 'Kikundi cha Vijana', category: 'Vikundi', type: 'image' },
    { id: 7, src: '/images/gallery/outreach1.jpg', title: 'Huduma ya Jamii', category: 'Huduma', type: 'image' },
    { id: 8, src: '/images/gallery/outreach2.jpg', title: 'Matunzo ya Hospitali', category: 'Huduma', type: 'image' },
    { id: 9, src: '/images/gallery/worship3.jpg', title: 'Ibada ya Asubuhi', category: 'Ibada', type: 'image' },
  ]

  const categories = ['Zote', 'Ibada', 'Vijana', 'Matukio', 'Vikundi', 'Huduma']
  const [activeCategory, setActiveCategory] = useState('Zote')

  const filteredImages = activeCategory === 'Zote' 
    ? images 
    : images.filter(img => img.category === activeCategory)

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-church-600 via-church-700 to-church-900 text-white p-8 md:p-16 mb-12 shadow-2xl">
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 text-sm font-medium">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Picha
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold leading-tight mb-4">
            <span className="text-gold-300">Picha</span> za Kanisa
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl leading-relaxed">
            Tazama picha za matukio, ibada, na shughuli mbalimbali za kanisa letu.
          </p>
        </div>

        <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 opacity-10 text-[12rem] md:text-[18rem] select-none">
          📸
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              activeCategory === cat
                ? 'bg-church-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ===== GALLERY GRID ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredImages.map((image, index) => (
          <div
            key={image.id}
            onClick={() => setSelectedImage(index)}
            className="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer"
          >
            <div className="aspect-square bg-gradient-to-br from-church-400 to-church-600 flex items-center justify-center text-white">
              <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                🖼️
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{image.title}</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-white text-sm font-medium">{image.title}</p>
              <p className="text-white/70 text-xs">{image.category}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ===== LIGHTBOX ===== */}
      {selectedImage !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white text-3xl hover:scale-110 transition-transform"
          >
            <FaTimes />
          </button>
          
          <button
            onClick={() => setSelectedImage((prev) => prev !== null && prev > 0 ? prev - 1 : prev)}
            className="absolute left-4 text-white text-2xl bg-white/20 rounded-full p-3 hover:bg-white/30 transition-colors"
          >
            <FaChevronLeft />
          </button>
          
          <div className="max-w-4xl max-h-[80vh] bg-white/10 rounded-2xl overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-church-400 to-church-600 flex items-center justify-center text-white text-8xl p-12">
              🖼️
            </div>
            <div className="p-4 bg-white/10">
              <h3 className="text-white font-bold text-lg">{filteredImages[selectedImage].title}</h3>
              <p className="text-white/70">{filteredImages[selectedImage].category}</p>
            </div>
          </div>
          
          <button
            onClick={() => setSelectedImage((prev) => prev !== null && prev < filteredImages.length - 1 ? prev + 1 : prev)}
            className="absolute right-4 text-white text-2xl bg-white/20 rounded-full p-3 hover:bg-white/30 transition-colors"
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  )
}