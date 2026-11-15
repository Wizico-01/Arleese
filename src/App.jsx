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
import LogisticsPage from './pages/LogisticsPage'
import EmailConfirmedPage from './pages/EmailConfirmedPage'
import UnlockHelpPage from './pages/UnlockHelpPage'
import AdminPage from './pages/AdminPage'
import OnboardingSlider from './components/OnboardingSlider'

// Read the link type BEFORE Supabase clears the URL hash
const LANDING_HASH = window.location.hash
const IS_RECOVERY = LANDING_HASH.includes('type=recovery')
const IS_EMAIL_CONFIRM =
  !IS_RECOVERY &&
  (LANDING_HASH.includes('type=signup') || LANDING_HASH.includes('type=email'))
const IS_LINK_ERROR =
  !IS_RECOVERY && !IS_EMAIL_CONFIRM && LANDING_HASH.includes('error_code=')
const LINK_STATUS = IS_LINK_ERROR ? 'expired' : 'success'

export default function App() {
  const [page, setPage] = useState(() => {
    if (IS_RECOVERY) return 'reset-password'
    if (IS_EMAIL_CONFIRM || IS_LINK_ERROR) return 'email-confirmed'
    const hash = window.location.hash.replace('#', '').split('?')[0].split('&')[0]
    const validPages = [
      'home', 'browse', 'login', 'register', 'register-landlord',
      'dashboard', 'profile', 'terms', 'saved', 'unlocked-contacts',
      'logistics', 'unlock-help', 'admin', 'reset-password',
    ]
    return validPages.includes(hash) ? hash : 'home'
  })
  const [user, setUser] = useState(null)
  const [pageHistory, setPageHistory] = useState(['home'])
  const [payNotice, setPayNotice] = useState("")

  // Onboarding shows on every open, except when arriving from an email link
  const [showOnboarding, setShowOnboarding] = useState(
    !(IS_RECOVERY || IS_EMAIL_CONFIRM || IS_LINK_ERROR)
  )

  const loadProfile = (session) => {
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
            isAdmin: !!profile.is_admin,
          })
          if (profile.role === 'logistics') {
            setPage(p => (['home', 'browse', 'login'].includes(p) ? 'logistics' : p))
          }
        }
      })
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setShowOnboarding(false)
        if (!IS_RECOVERY) loadProfile(session)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPage('reset-password')
        setShowOnboarding(false)
        return
      }
      if (event === 'SIGNED_IN' && session) {
        setShowOnboarding(false)
        if (IS_RECOVERY) return
        loadProfile(session)
      }
      if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Confirm any payment that was started but never finished on screen
  useEffect(() => {
    if (!user?.id) return
    let cancelled = false

    const checkPending = async () => {
      const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      const { data: rows } = await supabase
        .from('pending_payments')
        .select('reference')
        .eq('tenant_id', user.id)
        .eq('status', 'pending')
        .gte('created_at', since)
        .limit(5)
      if (!rows?.length) return

      let confirmed = 0
      for (const r of rows) {
        try {
          const { data } = await supabase.functions.invoke('verify-payment', {
            body: { reference: r.reference },
          })
          if (data?.status === 'fulfilled') confirmed++
        } catch { /* ignore */ }
      }
      if (!cancelled && confirmed > 0) {
        setPayNotice(
          confirmed === 1
            ? "Your payment was confirmed. Your contact and Arleece ID are now in Unlocked."
            : `${confirmed} payments were confirmed. Your contacts and Arleece IDs are now in Unlocked.`
        )
      }
    }

    checkPending()
    const onVisible = () => {
      if (document.visibilityState === 'visible') checkPending()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [user?.id])

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

  const dismissOnboarding = () => {
    setShowOnboarding(false)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setPayNotice("")
    setPageHistory(['home'])
    setPage('home')
    window.location.hash = 'home'
    setShowOnboarding(true)
  }

  const renderPage = () => {
    switch (page) {
      case 'login':
        return <LoginPage setPage={navigateTo} setUser={setUser} />
      case 'register':
        return <RegisterPage setPage={navigateTo} setUser={setUser} />
      case 'register-landlord':
        return <RegisterPage setPage={navigateTo} setUser={setUser} defaultRole="landlord" />
      case 'browse':
        return <BrowsePage user={user} setPage={navigateTo} />
      case 'dashboard':
        return <DashboardPage user={user} setPage={navigateTo} />
      case 'saved':
      case 'unlocked-contacts':
        return <TenantDashboard user={user} setPage={navigateTo} />
      case 'terms':
        return <TermsPage setPage={navigateTo} />
      case 'profile':
        return <ProfilePage user={user} setPage={navigateTo} logout={logout} />
      case 'logistics':
        return <LogisticsPage user={user} setPage={navigateTo} />
      case 'unlock-help':
        return <UnlockHelpPage user={user} setPage={navigateTo} />
      case 'admin':
        return <AdminPage user={user} setPage={navigateTo} />
      case 'email-confirmed':
        return <EmailConfirmedPage user={user} status={LINK_STATUS} setPage={navigateTo} />
      case 'reset-password':
        return <ResetPasswordPage setPage={navigateTo} />
      default:
        return <HomePage setPage={navigateTo} user={user} />
    }
  }

  const hideNav = ['login', 'register', 'register-landlord', 'email-confirmed'].includes(page)
  const hideBottom = ['login', 'register', 'register-landlord', 'email-confirmed'].includes(page)

  if (showOnboarding && !user) {
    return (
      <OnboardingSlider
        setPage={(destination) => {
          dismissOnboarding()
          navigateTo(destination)
        }}
        onDismiss={() => dismissOnboarding()}
      />
    )
  }

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
          setPage={navigateTo}
          logout={logout}
          page={page}
        />
      )}
      {renderPage()}

      {payNotice && (
        <div style={{
          position: "fixed", left: 12, right: 12, bottom: 78, zIndex: 1100,
          background: "#0d1b5e", color: "#fff", borderRadius: 12,
          padding: "12px 14px", boxShadow: "0 8px 24px rgba(0,0,0,.25)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
          fontSize: "0.82rem", lineHeight: 1.5,
        }}>
          <span>{payNotice}</span>
          <span style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => { setPayNotice(""); navigateTo('saved') }}
              style={{ background: "#fff", color: "#0d1b5e", border: "none", borderRadius: 8, padding: "7px 12px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              View
            </button>
            <button
              onClick={() => setPayNotice("")}
              style={{ background: "none", color: "#fff", border: "none", fontSize: "1rem", cursor: "pointer", fontFamily: "inherit" }}
            >
              ✕
            </button>
          </span>
        </div>
      )}

      {!hideBottom && (
        <BottomNav
          page={page}
          setPage={navigateTo}
          user={user}
        />
      )}
    </div>
  )
}