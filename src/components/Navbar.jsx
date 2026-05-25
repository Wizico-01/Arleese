import Logo from './Logo'
import { Ic, I } from './Icons'
import { useState } from 'react'

export default function Navbar({ user, setPage, logout, page }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={{
      background: "#fff",
      borderBottom: "1px solid #e8e8e0",
      position: "sticky",
      top: 0,
      zIndex: 300,
      boxShadow: "0 1px 6px rgba(0,0,0,.05)",
      width: "100%",
    }}>
      <div style={{
        maxWidth: "100%",
        padding: "0 16px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* LOGO */}
        <button
          onClick={() => setPage('home')}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <Logo size="sm" style={{ height: 22 }} />
        </button>

        {/* RIGHT SIDE */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {!user ? (
            <>
              <button
                onClick={() => setPage('login')}
                style={{
                  background: "none", border: "none",
                  color: "#0d1b5e", padding: "7px 12px",
                  borderRadius: 8, cursor: "pointer",
                  fontSize: "0.78rem", fontWeight: 500,
                }}
              >
                Login
              </button>
              <button
                onClick={() => setPage('register')}
                style={{
                  background: "#0d1b5e", color: "#fff",
                  border: "none", borderRadius: 8,
                  padding: "8px 14px", cursor: "pointer",
                  fontSize: "0.82rem", fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                Sign Up Free
              </button>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button
                onClick={() => setPage('browse')}
                style={{
                  background: "none", border: "none",
                  color: page === 'browse' ? "#0d1b5e" : "#6b7280", 
                  fontSize: "0.85rem",
                  fontWeight: page === 'browse' ? 700 : 500,
                  cursor: "pointer",
                }}
              >
                Browse
              </button>

              {/* ✅ SHOW UNLOCKED TAB FOR TENANTS ONLY */}
              {user?.role !== 'landlord' && (
                <button
                  onClick={() => setPage('unlocked-contacts')}
                  style={{
                    background: "none", border: "none",
                    color: (page === 'unlocked-contacts' || page === 'saved') ? "#0d1b5e" : "#6b7280", 
                    fontSize: "0.85rem",
                    fontWeight: (page === 'unlocked-contacts' || page === 'saved') ? 700 : 500,
                    cursor: "pointer",
                  }}
                >
                  Unlocked
                </button>
              )}

              {/* SHOW DASHBOARD TAB FOR LANDLORDS ONLY */}
              {user?.role === 'landlord' && (
                <button
                  onClick={() => setPage('dashboard')}
                  style={{
                    background: "none", border: "none",
                    color: page === 'dashboard' ? "#0d1b5e" : "#6b7280", 
                    fontSize: "0.85rem",
                    fontWeight: page === 'dashboard' ? 700 : 500,
                    cursor: "pointer",
                  }}
                >
                  Dashboard
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}