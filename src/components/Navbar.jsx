import Logo from './Logo'
import { Ic, I } from './Icons'

export default function Navbar({ user, setPage, logout, page }) {
  return (
    <nav style={{
      background: "#fff",
      borderBottom: "1px solid #e8e8e0",
      position: "sticky",
      top: 0,
      zIndex: 300,
      boxShadow: "0 1px 6px rgba(26, 20, 20, 0.05)",
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        // ✅ FIX 1: Reduced horizontal padding on mobile
        padding: "0 12px",
        height: 56, // slightly shorter on mobile
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        boxSizing: "border-box", // ✅ FIX 2: prevent overflow
      }}>

        {/* LOGO */}
        <button
          onClick={() => setPage('home')}
          style={{
            background: "none", border: "none",
            cursor: "pointer", padding: 0,
            flexShrink: 0, // ✅ FIX 3: logo never shrinks
          }}
        >
          <Logo />
        </button>

        {/* NAV LINKS */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 2, // ✅ FIX 4: tighter gap on mobile
          flexShrink: 0,
        }}>
          <button
            onClick={() => setPage('browse')}
            style={{
              background: page === 'browse' ? "#f0f3ff" : "none",
              color: page === 'browse' ? "#0d1b5e" : "#6b7280",
              fontWeight: page === 'browse' ? 700 : 500,
              border: "none",
              borderRadius: 8,
              padding: "7px 10px", // ✅ FIX 5: less padding
              fontSize: "0.82rem", // ✅ FIX 6: slightly smaller text
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Browse
          </button>

          {user?.role === 'landlord' && (
            <button
              onClick={() => setPage('dashboard')}
              style={{
                background: page === 'dashboard' ? "#f0f3ff" : "none",
                color: page === 'dashboard' ? "#0d1b5e" : "#6b7280",
                fontWeight: page === 'dashboard' ? 700 : 500,
                border: "none",
                borderRadius: 8,
                padding: "7px 10px",
                fontSize: "0.82rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Dashboard
            </button>
          )}

          {!user ? (
            <div style={{ display: "flex", gap: 4, marginLeft: 4 }}>
              <button
                onClick={() => setPage('login')}
                style={{
                  background: "none", border: "none",
                  color: "#0d1b5e", padding: "7px 10px",
                  borderRadius: 8, cursor: "pointer",
                  fontSize: "0.82rem", fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                Login
              </button>
              <button
                onClick={() => setPage('register')}
                style={{
                  background: "#0d1b5e", color: "#fff",
                  border: "none", borderRadius: 8,
                  // ✅ FIX 7: reduced padding so button fits on screen
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontSize: "0.82rem", fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                Sign Up Free
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "#0d1b5e", color: "#fff",
                display: "flex", alignItems: "center",
                justifyContent: "center", fontWeight: 700,
                fontSize: "0.85rem", flexShrink: 0,
              }}>
                {user.email?.[0]?.toUpperCase()}
              </div>
              <button
                onClick={logout}
                style={{
                  background: "none", border: "none",
                  color: "#9ca3af", cursor: "pointer",
                  display: "flex", alignItems: "center",
                  gap: 4, fontSize: "0.8rem",
                  whiteSpace: "nowrap",
                }}
              >
                <Ic d={I.logout} s={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}