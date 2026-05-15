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
      boxShadow: "0 1px 6px rgba(0,0,0,.05)",
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 24px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>

        {/* LOGO */}
        <button
          onClick={() => setPage('home')}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <Logo />
        </button>

        {/* NAV LINKS */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            onClick={() => setPage('browse')}
            style={{
              background: page === 'browse' ? "#f0f3ff" : "none",
              color: page === 'browse' ? "#0d1b5e" : "#6b7280",
              fontWeight: page === 'browse' ? 700 : 500,
              border: "none",
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: "0.87rem",
              cursor: "pointer",
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
                padding: "7px 14px",
                fontSize: "0.87rem",
                cursor: "pointer",
              }}
            >
              Dashboard
            </button>
          )}

          {/* NOT LOGGED IN */}
          {!user ? (
            <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
              <button
                onClick={() => setPage('login')}
                style={{
                  background: "none", border: "none",
                  color: "#0d1b5e", padding: "7px 14px",
                  borderRadius: 8, cursor: "pointer",
                  fontSize: "0.87rem", fontWeight: 500,
                }}
              >
                Login
              </button>
              <button
                onClick={() => setPage('register')}
                style={{
                  background: "#0d1b5e", color: "#fff",
                  border: "none", borderRadius: 8,
                  padding: "8px 18px", cursor: "pointer",
                  fontSize: "0.87rem", fontWeight: 600,
                }}
              >
                Sign Up Free
              </button>
            </div>
          ) : (
            /* LOGGED IN */
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "#0d1b5e", color: "#fff",
                display: "flex", alignItems: "center",
                justifyContent: "center", fontWeight: 700, fontSize: "0.88rem",
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