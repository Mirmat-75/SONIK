import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Music2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Auth() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin')   // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/events')
      } else {
        const { error } = await signUp(email, password)
        if (error) throw error
        setInfo('Check your email to confirm your account, then sign in.')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 text-white font-bold text-xl mb-6">
          <Music2 className="text-purple-400" size={22} />
          SONIK
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden border border-white/10 mb-6">
          {['signin', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setInfo('') }}
              className={`flex-1 py-2 text-sm font-medium transition-colors
                ${mode === m ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {m === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          {info && <p className="text-green-400 text-xs">{info}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
          >
            {loading ? 'Loading…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </main>
  )
}
