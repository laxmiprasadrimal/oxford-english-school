import { Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ScrollToTopReset from './components/ScrollToTopReset'
import Loader from './components/Loader'
import WhatsAppButton from './components/WhatsAppButton'

import Home from './pages/Home'
import About from './pages/About'
import Gallery from './pages/Gallery'
import Events from './pages/Events'
import Fees from './pages/Fees'
import Admission from './pages/Admission'
import Buses from './pages/Buses'
import Teachers from './pages/Teachers'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

// Admin Imports
import ProtectedRoute from './components/admin/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import EventManagement from './pages/admin/EventManagement'
import GalleryManagement from './pages/admin/GalleryManagement'
import ProfileManagement from './pages/admin/ProfileManagement'

function App() {
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Global Scroll Reveal Logic
  useEffect(() => {
    if (loading) return

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    }, observerOptions)

    // Initial observe
    document.querySelectorAll('[class*="reveal"]').forEach(el => observer.observe(el))

    // Watch for new elements dynamically added (like Data fetched from API)
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element Node
            if (node.className && typeof node.className === 'string' && node.className.includes('reveal')) {
              observer.observe(node)
            }
            if (node.querySelectorAll) {
              node.querySelectorAll('[class*="reveal"]').forEach(el => observer.observe(el))
            }
          }
        })
      })
    })

    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [loading, location.pathname]) // Re-run on route change or after loading

  if (loading) {
    return <Loader />
  }

  return (
    <>
      <ScrollToTopReset />
      {/* Hide Header/Footer/WhatsApp if routing to /admin */}
      {!location.pathname.startsWith('/admin') && <Header />}
      
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/events" element={<Events />} />
          <Route path="/fees" element={<Fees />} />
          <Route path="/admission" element={<Admission />} />
          <Route path="/buses" element={<Buses />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="events" element={<EventManagement />} />
            <Route path="gallery" element={<GalleryManagement />} />
            <Route path="profile" element={<ProfileManagement />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!location.pathname.startsWith('/admin') && (
        <>
          <Footer />
          <ScrollToTop />
          <WhatsAppButton />
        </>
      )}
    </>

  )
}

export default App
