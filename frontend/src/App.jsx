import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Events from './pages/Events'
import Favorites from './pages/Favorites'
import Auth from './pages/Auth'
import Recommendations from './pages/Recommendations'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
