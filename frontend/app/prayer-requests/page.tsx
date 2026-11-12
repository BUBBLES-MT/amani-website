'use client'

import { useState } from 'react'
import { FaPray, FaHands, FaHeart, FaShare, FaUser } from 'react-icons/fa'
import { MdSend } from 'react-icons/md'

export default function PrayerRequestsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    request: '',
    isAnonymous: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
    setFormData({ name: '', email: '', request: '', isAnonymous: false })
    setTimeout(() => setIsSubmitted(false), 5000)
  }

  const recentRequests = [
    { id: 1, name: 'Maria J.', request: 'Naomba maombi kwa ajili ya familia yangu', date: 'Leo', prayCount: 12 },
    { id: 2, name: 'Peter K.', request: 'Ninaugua sana, naomba Mungu aniponye', date: 'Jana', prayCount: 8 },
    { id: 3, name: 'Anna M.', request: 'Naomba maombi kwa ajili ya mtoto wangu', date: 'Jana', prayCount: 5 },
    { id: 4, name: 'John D.', request: 'Nina matatizo ya kifedha, naomba maombi', date: '2 siku zilizopita', prayCount: 15 },
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
            Maombi
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold leading-tight mb-4">
            Tuma <span className="text-gold-300">Ombi Lako</span>
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl leading-relaxed">
            Mungu anasikiliza maombi yako. Tuma ombi lako, na tutakuombea kwa imani.
          </p>
        </div>

        <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 opacity-10 text-[12rem] md:text-[18rem] select-none">
          🙏
        </div>
      </section>

      {/* ===== FORM + RECENT REQUESTS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">Weka Ombi Lako</h2>
            
            {isSubmitted ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">🙏</div>
                <h3 className="font-bold text-green-800 text-2xl mb-2">Ombi Limepokelewa!</h3>
                <p className="text-green-600">Tutakuombea. Mungu akubariki sana!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Jina Lako</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Jina kamili"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Barua Pepe</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ombi Lako</label>
                  <textarea
                    name="request"
                    value={formData.request}
                    onChange={handleChange}
                    className="input-field min-h-[120px]"
                    placeholder="Andika ombi lako hapa..."
                    required
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="anonymous"
                    name="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                    className="w-4 h-4 text-church-500 rounded border-gray-300 focus:ring-church-500"
                  />
                  <label htmlFor="anonymous" className="text-sm text-gray-600">
                    Tuma kwa siri (jina halionekani)
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-sm"></span>
                      Inatuma...
                    </>
                  ) : (
                    <>
                      <MdSend /> Tuma Ombi
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-church-50 to-blue-50 rounded-3xl shadow-xl p-6">
            <h3 className="text-xl font-serif font-bold text-gray-800 mb-4">Maombi ya Hivi Karibuni</h3>
            
            <div className="space-y-4">
              {recentRequests.map((req) => (
                <div key={req.id} className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-church-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUser className="text-church-600 text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-gray-800 text-sm">{req.name}</h4>
                        <span className="text-xs text-gray-400">{req.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{req.request}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button className="text-xs bg-church-100 text-church-700 px-3 py-1 rounded-full hover:bg-church-200 transition-colors">
                          <FaPray className="inline mr-1 text-xs" /> Omba ({req.prayCount})
                        </button>
                        <button className="text-xs text-gray-400 hover:text-church-500 transition-colors">
                          <FaShare className="inline" /> Shiriki
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}