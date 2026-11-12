import Link from 'next/link'
import { FaFacebook, FaInstagram, FaYoutube, FaTwitter, FaHeart, FaClock, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-church-500 rounded-xl flex items-center justify-center text-xl font-bold">
                ✝️
              </div>
              <div>
                <h4 className="font-bold text-lg">Amani Luthelani Church</h4>
                <p className="text-xs text-gray-400">Church Management System</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Tukutane pamoja kumwabudu Mungu na kueneza upendo Wake. 
              Tumejitolea kuhudumia jamii yetu kwa imani na upendo.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-church-400 transition-all duration-300 hover:scale-110 transform text-xl">
                <FaFacebook />
              </a>
              <a href="#" className="text-gray-400 hover:text-church-400 transition-all duration-300 hover:scale-110 transform text-xl">
                <FaInstagram />
              </a>
              <a href="#" className="text-gray-400 hover:text-church-400 transition-all duration-300 hover:scale-110 transform text-xl">
                <FaYoutube />
              </a>
              <a href="#" className="text-gray-400 hover:text-church-400 transition-all duration-300 hover:scale-110 transform text-xl">
                <FaTwitter />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Viungo</h4>
            <ul className="space-y-3 text-gray-400">
              <li><Link href="/about" className="hover:text-church-400 transition-colors flex items-center gap-2"><span className="text-church-400">›</span> Kuhusu Sisi</Link></li>
              <li><Link href="/sermons" className="hover:text-church-400 transition-colors flex items-center gap-2"><span className="text-church-400">›</span> Mahubiri</Link></li>
              <li><Link href="/events" className="hover:text-church-400 transition-colors flex items-center gap-2"><span className="text-church-400">›</span> Matukio</Link></li>
              <li><Link href="/gallery" className="hover:text-church-400 transition-colors flex items-center gap-2"><span className="text-church-400">›</span> Picha</Link></li>
              <li><Link href="/contact" className="hover:text-church-400 transition-colors flex items-center gap-2"><span className="text-church-400">›</span> Wasiliana</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Huduma</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <FaClock className="text-church-400 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-300">Jumapili:</span>
                  <span className="block">8:00 AM - 12:00 PM</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <FaClock className="text-church-400 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-300">Jumatano:</span>
                  <span className="block">6:00 PM - 8:00 PM</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <FaClock className="text-church-400 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-300">Ijumaa:</span>
                  <span className="block">5:00 PM - 7:00 PM</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Wasiliana Nasi</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-church-400 mt-1 flex-shrink-0" />
                <span>Moshi, Kilimanjaro, Tanzania</span>
              </li>
              <li className="flex items-start gap-3">
                <FaPhone className="text-church-400 mt-1 flex-shrink-0" />
                <span>+255 712 345 678</span>
              </li>
              <li className="flex items-start gap-3">
                <FaEnvelope className="text-church-400 mt-1 flex-shrink-0" />
                <span>info@kanisaletu.com</span>
              </li>
              <li className="flex items-start gap-3">
                <FaHeart className="text-red-400 mt-1 flex-shrink-0" />
                <span>Huduma 24/7</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-gray-500">
            <p>
              &copy; {currentYear} Amani Luthelani Church. Haki zote zimehifadhiwa.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-church-400 transition-colors">Sera ya Faragha</Link>
              <span className="w-px h-4 bg-gray-700"></span>
              <Link href="/terms" className="hover:text-church-400 transition-colors">Masharti</Link>
              <span className="w-px h-4 bg-gray-700"></span>
              <Link href="/sitemap" className="hover:text-church-400 transition-colors">Ramani ya Tovuti</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}