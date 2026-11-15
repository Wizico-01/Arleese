import Logo from '../components/Logo'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

export default function EmailConfirmedPage({ user, status, setPage }) {
  const ok = status === 'success'
  const next =
    user?.role === 'landlord' ? 'dashboard' :
    user?.role === 'logistics' ? 'logistics' :
    'browse'

  const primaryBtn = {
    width: "100%", background: "#0d1b5e", color: "#fff",
    border: "none", borderRadius: 10, padding: "14px 0",
    fontSize: "0.95rem", fontWeight: 700, cursor: "pointer",
    fontFamily: "inherit",
  }
  const secondaryBtn = {
    width: "100%", background: "#fff", color: "#0d1b5e",
    border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "13px 0",
    fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
    fontFamily: "inherit", marginTop: 10,
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#f4f3ef",
      display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
        <div style={{ marginBottom: 28 }}>
          <Logo size="lg" />
        </div>

        <div style={{
          background: "#fff", border: "1px solid #e8e8e0",
          borderRadius: 18, padding: "34px 26px",
        }}>
          <div style={{
            width: 68, height: 68, borderRadius: "50%",
            background: ok ? "#0d1b5e" : "#fef3c7",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            {ok
              ? <CheckCircle2 size={32} strokeWidth={2} color="#fff" />
              : <AlertTriangle size={30} strokeWidth={2} color="#92400e" />}
          </div>

          <h1 style={{
            fontFamily: "'DM Serif Display',serif",
            fontSize: "1.7rem", color: "#0d1b5e", marginBottom: 10,
          }}>
            {ok ? "Email confirmed" : "This link is no longer valid"}
          </h1>

          <p style={{
            color: "#6b7280", fontSize: "0.9rem",
            lineHeight: 1.75, marginBottom: 26,
          }}>
            {ok
              ? "Your email address has been verified and your Arleece account is now active."
              : "It may have expired or already been used. If you just created your account, try signing in. If you were resetting your password, request a new link."}
          </p>

          {ok ? (
            <button
              onClick={() => setPage(user ? next : 'login')}
              style={primaryBtn}
            >
              {user ? "Continue" : "Sign In"}
            </button>
          ) : (
            <>
              <button onClick={() => setPage('login')} style={primaryBtn}>
                Sign In
              </button>
              <button onClick={() => setPage('reset-password')} style={secondaryBtn}>
                Reset password
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}