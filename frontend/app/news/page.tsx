import Link from 'next/link'
import Image from 'next/image'
import { FaCalendar, FaUser,FaHeart, FaClock, FaTag, FaArrowRight } from 'react-icons/fa'

export default function NewsPage() {
  const news = [
    {
      id: 1,
      title: 'Sherehe ya Krismasi 2025',
      excerpt: 'Jiunge nasi katika sherehe ya Krismasi na kukaribisha mwaka mpya pamoja.',
      date: 'Desemba 25, 2025',
      author: 'Mchungaji John',
      category: 'Matukio',
      image: '/images/news/christmas.jpg',
      readTime: '3 min'
    },
    {
      id: 2,
      title: 'Kampeni ya Kuchangia Damu',
      excerpt: 'Kampeni ya kuchangia damu imefanikiwa kwa kiasi kikubwa katika kanisa letu.',
      date: 'Desemba 20, 2025',
      author: 'Bibi Grace',
      category: 'Huduma',
      image: '/images/news/blood-donation.jpg',
      readTime: '2 min'
    },
    {
      id: 3,
      title: 'Mafunzo ya Uongozi 2026',
      excerpt: 'Mafunzo ya uongozi kwa viongozi wa kanisa yameanza kwa nguvu.',
      date: 'Desemba 15, 2025',
      author: 'Bwana Peter',
      category: 'Mafunzo',
      image: '/images/news/leadership.jpg',
      readTime: '4 min'
    },
    {
      id: 4,
      title: 'Ibada ya Mwisho wa Mwaka',
      excerpt: 'Ibada ya kumshukuru Mungu kwa mwaka wote iliyofanyika kwa furaha.',
      date: 'Desemba 31, 2025',
      author: 'Mchungaji Mary',
      category: 'Ibada',
      image: '/images/news/worship.jpg',
      readTime: '2 min'
    },
  ]

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
            Habari
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold leading-tight mb-4">
            Habari na <span className="text-gold-300">Matukio</span>
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl leading-relaxed">
            Pata taarifa za hivi karibuni, matukio, na habari mbalimbali za kanisa letu.
          </p>
        </div>

        <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 opacity-10 text-[12rem] md:text-[18rem] select-none">
          📰
        </div>
      </section>

      {/* ===== NEWS GRID ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => (
          <div key={item.id} className="card group hover:scale-[1.02] transition-all duration-300">
            <div className="aspect-video bg-gradient-to-br from-church-400 to-church-600 flex items-center justify-center text-6xl text-white">
              📰
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-2 text-xs text-church-600 font-semibold mb-2">
                <FaTag className="text-xs" />
                <span>{item.category}</span>
              </div>
              
              <h3 className="text-xl font-serif font-bold text-gray-800 mb-2 group-hover:text-church-600 transition-colors">
                {item.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {item.excerpt}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <FaCalendar /> {item.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaClock /> {item.readTime}
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <FaUser /> {item.author}
                </span>
              </div>
              
              <Link 
                href={`/news/${item.id}`}
                className="mt-4 inline-flex items-center gap-2 text-church-600 font-semibold hover:text-church-800 transition-colors group-hover:gap-3 transition-all"
              >
                Soma Zaidi <FaArrowRight className="text-sm" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ===== CTA ===== */}
      <section className="mt-12 bg-gradient-to-r from-church-500 to-church-700 rounded-3xl p-8 md:p-12 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">Pata Habari Zaidi</h2>
        <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
          Jiandikisha ili upate taarifa za kila wiki kuhusu matukio na shughuli za kanisa.
        </p>
        <button className="btn-secondary inline-flex items-center gap-2 text-base px-8 py-3">
          <FaHeart /> Jiandikisha
        </button>
      </section>
    </div>
  )
}