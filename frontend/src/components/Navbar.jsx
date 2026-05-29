import { Link, useNavigate } from 'react-router-dom'
import { Heart, Search, LogOut, LogIn } from 'lucide-react'
import logo from '../logo.png'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
        <img src={logo} alt="SONIK" className="h-12 w-auto object-contain max-w-[160px]" />
        <span className="text-white font-bold text-xl tracking-widest">SONIK</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6 text-sm text-gray-300">
          <Link to="/events" className="hover:text-white flex items-center gap-1 transition-colors">
            <Search size={15} /> Events
          </Link>
          {user && (
            <Link to="/favorites" className="hover:text-white flex items-center gap-1 transition-colors">
              <Heart size={15} /> Favorites
            </Link>
          )}
          {user ? (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 hover:text-red-400 transition-colors"
            >
              <LogOut size={15} /> Sign out
            </button>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-full transition-colors"
            >
              <LogIn size={15} /> Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
