import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import BottomNav from './components/BottomNav'
import TenantDashboard from './pages/TenantDashboard'
import TermsPage from './pages/TermsPage'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import BrowsePage from './pages/BrowsePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import ResetPasswordPage from './pages/ResetPasswordPage'

export default function App() {
  const [page, setPage] = useState(() => {
    const hash = window.location.hash.replace('#', '').split('?')[0].split('&')[0]
    // ✅ Whitelisted 'unlocked-contacts' so page state persists correctly on refresh
    const validPages = ['home', 'browse', 'login', 'register', 'dashboard', 'profile', 'terms', 'saved', 'unlocked-contacts']
    return validPages.includes(hash) ? hash : 'home'
  })
  const [user, setUser] = useState(null)
  const [pageHistory, setPageHistory] = useState(['home'])

  useEffect(() => {
    // STEP 1: Check for password recovery token in URL
    const urlParams = new URLSearchParams(window.location.search)
    const hashString = window.location.hash

    if (
      hashString.includes('type=recovery') ||
      hashString.includes('access_token') ||
      urlParams.get('type') === 'recovery'
    ) {
      setPage('reset-password')
      return
    }

    // STEP 2: Load session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              setUser({
                id: session.user.id,
                email: session.user.email,
                name: profile.full_name,
                role: profile.role,
                verified: profile.nin_verified,
              })
            }
          })
      }
    })

    // STEP 3: Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPage('reset-password')
        return
      }
      if (!session) {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Handle browser back button
  useEffect(() => {
    const handlePop = () => {
      setPageHistory(prev => {
        if (prev.length > 1) {
          const newHistory = prev.slice(0, -1)
          const prevPage = newHistory[newHistory.length - 1]
          setPage(prevPage)
          return newHistory
        }
        return prev
      })
    }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [])

  const navigateTo = (newPage) => {
    window.history.pushState({}, '', `#${newPage}`)
    setPageHistory(prev => [...prev, newPage])
    setPage(newPage)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setPageHistory(['home'])
    setPage('home')
    window.location.hash = 'home'
  }

  const renderPage = () => {
    switch (page) {
      case 'login':             return <LoginPage setPage={navigateTo} setUser={setUser} />
      case 'register':          return <RegisterPage setPage={navigateTo} setUser={setUser} />
      case 'register-landlord': return <RegisterPage setPage={navigateTo} setUser={setUser} defaultRole="landlord" />
      case 'browse':            return <BrowsePage user={user} setPage={navigateTo} />
      case 'dashboard':         return <DashboardPage user={user} setPage={navigateTo} />
      case 'saved':             return <TenantDashboard user={user} setPage={navigateTo} />
      // ✅ Added immediate redirect route handling to map directly into the Tenant dashboard interface
      case 'unlocked-contacts': return <TenantDashboard user={user} setPage={navigateTo} defaultTab="unlocked" />
      case 'terms':             return <TermsPage setPage={navigateTo} />
      case 'profile':           return <ProfilePage user={user} setPage={navigateTo} logout={logout} />
      case 'reset-password':    return <ResetPasswordPage setPage={navigateTo} />
      default:                  return <HomePage setPage={navigateTo} user={user} />
    }
  }

  const hideNav    = ['login', 'register', 'register-landlord'].includes(page)
  const hideBottom = ['login', 'register', 'register-landlord'].includes(page)

  return (
    <div style={{
      width: "100%",
      maxWidth: "100vw",
      overflowX: "hidden",
      paddingBottom: hideBottom ? 0 : 65,
    }}>
      {!hideNav && (
        <Navbar user={user} setPage={navigateTo} logout={logout} page={page} />
      )}
      {renderPage()}
      {!hideBottom && (
        <BottomNav page={page} setPage={navigateTo} user={user} />
      )}
    </div>
  )
}