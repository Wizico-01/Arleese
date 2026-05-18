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

export default function App() {
  const [page, setPage] = useState(
  window.location.hash.replace('#', '') || 'home'
)
  const [user, setUser] = useState(null)

  useEffect(() => {
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

useEffect(() => {
  const handleBack = () => {
    const hash = window.location.hash.replace('#', '') || 'home'
    setPage(hash)
  }
  window.addEventListener('hashchange', handleBack)
  return () => window.removeEventListener('hashchange', handleBack)
}, [])

    supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null)
      }
    })
  }, [])

  const navigateTo = (newPage) => {
  window.location.hash = newPage
  navigateTo(newPage)
}
  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    navigateTo('home')
  }

  const renderPage = () => {
    switch (page) {
      case 'login':     return <LoginPage setPage={setPage} setUser={setUser} />
      case 'register':  return <RegisterPage setPage={setPage} setUser={setUser} />
      case 'browse':    return <BrowsePage user={user} setPage={setPage} />
      case 'dashboard': return <DashboardPage user={user} setPage={setPage} />
      case 'saved':     return <TenantDashboard user={user} setPage={setPage} />
      case 'terms':     return <TermsPage setPage={setPage} />
      case 'profile': return <ProfilePage user={user} setPage={setPage} logout={logout} />
      case 'register-landlord': return <RegisterPage setPage={setPage} setUser={setUser} defaultRole="landlord" />
      default: return <HomePage setPage={setPage} user={user} />
    }
  }

  const hideNav = ['login', 'register'].includes(page)
  const hideBottom = ['login', 'register'].includes(page)

  return (
    <div style={{
      width: "100%",
      maxWidth: "100vw",
      overflowX: "hidden",
      paddingBottom: hideBottom ? 0 : 65,
    }}>
      {!hideNav && (
        <Navbar
          user={user}
          setPage={setPage}
          logout={logout}
          page={page}
        />
      )}
      {renderPage()}
      {!hideBottom && (
        <BottomNav
          page={page}
          setPage={setPage}
          user={user}
        />
      )}
    </div>
  )
}