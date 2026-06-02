import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'
import { Btn, Field, Card, ErrBox } from '../components/UI'
import { Ic, I } from '../components/Icons'

export default function ResetPasswordPage({ setPage }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")
  const [success, setSuccess] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(hash.replace('#', ''))
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const type = params.get('type')

    if (type === 'recovery' && accessToken) {
      // Set session from the recovery token
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      }).then(({ data, error }) => {
        if (error) {
          setErr("This reset link has expired. Please request a new one.")
        } else if (data?.session) {
          setSessionReady(true)
          // Clean URL
          window.history.replaceState({}, '', window.location.pathname + '#reset-password')
        }
        setChecking(false)
      })
    } else {
      // No token in URL — show the request form
      setChecking(false)
    }

    // Also listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
        setChecking(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const sendResetEmail = async () => {
    if (!email) {
      setErr("Please enter your email address.")
      return
    }
    setLoading(true)
    setErr("")
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://arleece.com',
      })
      if (error) {
        setErr(error.message)
      } else {
        setEmailSent(true)
      }
    } catch (e) {
      setErr("Failed to send. Check your connection.")
    }
    setLoading(false)
  }

  const submitNewPassword = async () => {
    if (!password || !confirm) {
      setErr("Please fill in both fields.")
      return
    }
    if (password !== confirm) {
      setErr("Passwords do not match.")
      return
    }
    if (password.length < 8) {
      setErr("Password must be at least 8 characters.")
      return
    }
    setLoading(true)
    setErr("")
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setErr(error.message)
      } else {
        setSuccess(true)
      }
    } catch (e) {
      setErr("Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  // SUCCESS SCREEN
  if (success) return (
    <div style={{
      minHeight: "100vh", background: "#f4f3ef",
      display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24,
    }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "#0d1b5e", display: "flex",
          alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", color: "#fff", fontSize: "2rem",
        }}>
          ✓
        </div>
        <h2 style={{
          fontFamily: "'DM Serif Display',serif",
          fontSize: "1.8rem", color: "#0d1b5e", marginBottom: 10,
        }}>
          Password Updated!
        </h2>
        <p style={{ color: "#6b7280", lineHeight: 1.75, marginBottom: 26 }}>
          Your password has been changed successfully.
          You can now sign in with your new password.
        </p>
        <Btn full onClick={() => setPage('login')}>Go to Sign In</Btn>
      </div>
    </div>
  )

  // EMAIL SENT SCREEN
  if (emailSent) return (
    <div style={{
      minHeight: "100vh", background: "#f4f3ef",
      display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24,
    }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "#0d1b5e", display: "flex",
          alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", color: "#fff", fontSize: "1.8rem",
        }}>
          ✉
        </div>
        <h2 style={{
          fontFamily: "'DM Serif Display',serif",
          fontSize: "1.8rem", color: "#0d1b5e", marginBottom: 10,
        }}>
          Check Your Email
        </h2>
        <p style={{ color: "#6b7280", lineHeight: 1.75, marginBottom: 8 }}>
          We sent a password reset link to:
        </p>
        <p style={{
          fontWeight: 700, color: "#0d1b5e",
          fontSize: "0.95rem", marginBottom: 20,
        }}>
          {email}
        </p>
        <div style={{
          background: "#fef3c7", border: "1px solid #fde68a",
          borderRadius: 10, padding: "12px 16px",
          fontSize: "0.82rem", color: "#92400e",
          marginBottom: 24, textAlign: "left",
        }}>
          ⚠️ If you don't see it in your inbox, check your <strong>Spam</strong> or <strong>Junk</strong> folder and mark it as Not Spam.
        </div>
        <Btn full onClick={() => setPage('login')}>Back to Login</Btn>
      </div>
    </div>
  )

  // CHECKING / LOADING
  if (checking) return (
    <div style={{
      minHeight: "100vh", background: "#f4f3ef",
      display: "flex", alignItems: "center",
      justifyContent: "center",
    }}>
      <p style={{ color: "#6b7280" }}>Verifying your reset link...</p>
    </div>
  )

  return (
    <div style={{
      minHeight: "100vh", background: "#f4f3ef",
      display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <button
            onClick={() => setPage('login')}
            style={{ background: "none", border: "none", cursor: "pointer", marginBottom: 22 }}
          >
            <Logo size="lg" />
          </button>
          <h1 style={{
            fontFamily: "'DM Serif Display',serif",
            fontSize: "1.75rem", color: "#0d1b5e", marginBottom: 6,
          }}>
            {sessionReady ? "Set New Password" : "Reset Password"}
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.87rem" }}>
            {sessionReady
              ? "Choose a strong new password for your Arleece account"
              : "Enter your email to receive a reset link"}
          </p>
        </div>

        <Card style={{ padding: "30px 26px" }}>
          <ErrBox msg={err} />

          {/* SHOW PASSWORD FORM if session is ready (came from email link) */}
          {sessionReady ? (
            <>
              <div style={{ marginBottom: 18 }}>
                <label style={{
                  display: "block", fontSize: "0.79rem",
                  fontWeight: 600, color: "#4b5563", marginBottom: 6,
                }}>
                  New Password <span style={{ color: "#b91c1c" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", left: 13, top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af", pointerEvents: "none", display: "flex",
                  }}>
                    <Ic d={I.lock} s={14} />
                  </span>
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                      width: "100%", padding: "10px 42px 10px 40px",
                      border: "1.5px solid #e5e7eb", borderRadius: 8,
                      fontSize: "0.88rem", background: "#fafafa",
                    }}
                    onFocus={e => e.target.style.borderColor = "#0d1b5e"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                  />
                  <button
                    onClick={() => setShowPw(s => !s)}
                    style={{
                      position: "absolute", right: 12, top: "50%",
                      transform: "translateY(-50%)",
                      background: "none", border: "none",
                      color: "#9ca3af", cursor: "pointer",
                      padding: 0, display: "flex",
                    }}
                  >
                    <Ic d={showPw ? I.eyeOff : I.eye} s={15} />
                  </button>
                </div>
              </div>

              <Field
                label="Confirm New Password"
                type="password"
                placeholder="Repeat your new password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                icon={<Ic d={I.lock} s={14} />}
                required
              />

              <Btn full onClick={submitNewPassword} disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Btn>
            </>
          ) : (
            /* SHOW EMAIL FORM if no session (user clicked Forgot Password) */
            <>
              <Field
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                icon={<Ic d={I.mail} s={14} />}
                required
              />

              <Btn full onClick={sendResetEmail} disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Btn>
            </>
          )}

          <button
            onClick={() => setPage('login')}
            style={{
              width: "100%", marginTop: 12,
              background: "none", border: "1.5px solid #e5e7eb",
              color: "#4b5563", borderRadius: 9, padding: "11px 0",
              cursor: "pointer", fontSize: "0.88rem",
              fontWeight: 600, fontFamily: "inherit",
            }}
          >
            ← Back to Login
          </button>
        </Card>
      </div>
    </div>
  )
}