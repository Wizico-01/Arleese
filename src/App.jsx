import { useState, useEffect, useRef } from 'react'
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
import MyIdPage from './pages/MyIdPage'
import OfferPopup from './components/OfferPopup'
import OnboardingSlider from './components/OnboardingSlider'
import GuideFindPage from './pages/GuideFindPage'
import AdminGuidesPage from './pages/AdminGuidesPage'
import AdminGrowthPage from './pages/AdminGrowthPage'
import WhatsAppButton from './components/WhatsAppButton'


// Read the link type BEFORE Supabase clears the URL hash
const LANDING_HASH = window.location.hash
const IS_RECOVERY = LANDING_HASH.includes('type=recovery')
const IS_EMAIL_CONFIRM =
  !IS_RECOVERY &&
  (LANDING_HASH.includes('type=signup') || LANDING_HASH.includes('type=email'))
const IS_LINK_ERROR =
  !IS_RECOVERY && !IS_EMAIL_CONFIRM && LANDING_HASH.includes('error_code=')
const LINK_STATUS = IS_LINK_ERROR ? 'expired' : 'success'

const NO_OFFER_PAGES = ['login', 'register', 'register-landlord', 'reset-password', 'email-confirmed', 'my-id']

export default function App() {
  const [page, setPage] = useState(() => {
    if (IS_RECOVERY) return 'reset-password'
    if (IS_EMAIL_CONFIRM || IS_LINK_ERROR) return 'email-confirmed'
    const hash = window.location.hash.replace('#', '').split('?')[0].split('&')[0]
    const validPages = [
      'home', 'browse', 'login', 'register', 'register-landlord',
      'dashboard', 'profile', 'terms', 'saved', 'unlocked-contacts',
      'my-id', 'logistics', 'find-apartment', 'reset-password', 'admin-guides', 'admin-growth',
    ]
    return validPages.includes(hash) ? hash : 'home'
  })
  const [user, setUser] = useState(null)
  const [pageHistory, setPageHistory] = useState(['home'])
  const [payNotice, setPayNotice] = useState("")
  const [offer, setOffer] = useState(null) // null | 'login' | 'unlock'

  const userRef = useRef(null) const offeredFor = useRef(null)
  const pageRef = useRef(page)
  userRef.current = user
  pageRef.current = page

  const [showOnboarding, setShowOnboarding] = useState(
    !(IS_RECOVERY || IS_EMAIL_CONFIRM || IS_LINK_ERROR)
  )

  // Shows the Arleece ID offer: once per session per trigger, never to people who already have an ID
  const maybeOffer = async (uid, role, context) => {
  if (!uid || role === 'logistics' || role === 'landlord') return

  if (context === 'login') {
    // once per login or app open; tab-switching does not repeat it
    if (offeredFor.current === uid) return
    offeredFor.current = uid
  } else {
    try { if (sessionStorage.getItem('arl_offer_unlock')) return } catch { /* ignore */ }
  }

  // skip only people who already hold an active Arleece ID
  const { data } = await supabase
    .from('arleece_ids')
    .select('id')
    .eq('user_id', uid)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .limit(1)
  if (data && data.length) return

  let tries = 0
  const attempt = () => {
    if (userRef.current?.id !== uid) return
    if (NO_OFFER_PAGES.includes(pageRef.current)) {
      if (tries++ < 10) setTimeout(attempt, 700)
      return
    }
    if (context === 'unlock') {
      try { sessionStorage.setItem('arl_offer_unlock', '1') } catch { /* ignore */ }
    }
    setOffer(context)
  }
  setTimeout(attempt, context === 'login' ? 1200 : 400)
  }

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
          maybeOffer(session.user.id, profile.role, 'login')
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
  offeredFor.current = null
  setUser(null)
}
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Offer again right after a free unlock (once per session)
  useEffect(() => {
    const onUnlocked = () => {
      const u = userRef.current
      if (u) maybeOffer(u.id, u.role, 'unlock')
    }
    window.addEventListener('arleece:unlocked', onUnlocked)
    return () => window.removeEventListener('arleece:unlocked', onUnlocked)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setPayNotice("Your payment was confirmed. Your Arleece ID is ready in My ID.")
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

  useEffect(() => {
  let v = null
  try { v = localStorage.getItem('arl_visitor') } catch { /* ignore */ }
  if (!v) {
    v = crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + String(Date.now())
    try { localStorage.setItem('arl_visitor', v) } catch { /* ignore */ }
  }
  supabase.rpc('track_visit', { p_visitor: v }).then(() => {}, () => {})
}, [])

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

  const closeOffer = (skipped) => {
    if (skipped) {
      try { localStorage.setItem('arl_offer_skipped_at', String(Date.now())) } catch { /* ignore */ }
    }
    setOffer(null)
  }

  const dismissOnboarding = () => {
    setShowOnboarding(false)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setPayNotice("")
    setOffer(null)
    offeredFor.current = null
try { sessionStorage.removeItem('arl_offer_unlock') } catch { /* ignore */ } catch { /* ignore */ }
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
      case 'my-id':
        return <MyIdPage user={user} setPage={navigateTo} />
      case 'terms':
        return <TermsPage setPage={navigateTo} />
      case 'profile':
        return <ProfilePage user={user} setPage={navigateTo} logout={logout} />
      case 'logistics':
        return <LogisticsPage user={user} setPage={navigateTo} />
      case 'email-confirmed':
        return <EmailConfirmedPage user={user} status={LINK_STATUS} setPage={navigateTo} />
      case 'reset-password':
        return <ResetPasswordPage setPage={navigateTo} />
      case 'find-apartment':
  return <GuideFindPage user={user} setPage={navigateTo} />
        case 'admin-guides':
  return <AdminGuidesPage user={user} setPage={navigateTo} />
case 'admin-growth':
  return <AdminGrowthPage user={user} setPage={navigateTo} />
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

      <WhatsAppButton />

      {user?.isAdmin && (
        <div style={{ position: 'fixed', right: 12, bottom: 78, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[['admin-guides', 'Verify guides'], ['admin-growth', 'Growth']].map(([id, l]) => (
            <button key={id} onClick={() => navigateTo(id)}
              style={{ background: '#0d1b5e', color: '#fff', border: 'none', borderRadius: 20, padding: '9px 16px', fontSize: '0.76rem', fontWeight: 700, fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(0,0,0,.25)' }}>
              {l}
            </button>
          ))}
        </div>
      )}

      {offer && (
        <OfferPopup
          context={offer}
          onSkip={() => closeOffer(true)}
          onGetId={() => { closeOffer(false); navigateTo('my-id') }}
        />
      )}

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
              onClick={() => { setPayNotice(""); navigateTo('my-id') }}
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
