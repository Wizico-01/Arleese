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
  const [sessionReady, setSessionReady] = useState(false)
  const [emailSent, setEmailSent] = useState(false) 

  useEffect(() => {
    // 1. Listen directly to Supabase's authentication event listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event Triggered:", event)
      
      // If the user clicked a recovery link, or already has an active authenticated session
      if (event === 'PASSWORD_RECOVERY' || session) {
        setSessionReady(true)
        // Clean up the URL parameters globally from the window view
        window.history.replaceState({}, '', window.location.pathname + '#reset-password')
      }
    })

    // 2. Backup check: see if a session is already parsed locally on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Action to send reset verification email
  const sendResetEmail = async () => {
    if (!email) {
      setErr("Please enter your email address.")
      return
    }
    setLoading(true)
    setErr("")

    try {
      // Clear any stale local sessions to ensure a fresh handshake
      await supabase.auth.signOut()

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://arleese.vercel.app/#reset-password',
      })
      if (error) {
        setErr(error.message)
      } else {
        setEmailSent(true)
      }
    } catch (e) {
      setErr("Failed to send email. Check connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const submit = async () => {
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
        // Sign out immediately so they have to log back in with the new password
        await supabase.auth.signOut()
      }
    } catch (e) {
      setErr("Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  // View State 1: Password Updated Successfully
  if (success) return (
    <div style={{ minHeight: "100vh", background: "#f4f3ef", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: "#0d1b5e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", color: "#fff" }}>
          <Ic d={I.check} s={30} sw={2.5} />
        </div>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.8rem", color: "#0d1b5e", marginBottom: 10 }}>Password Updated!</h2>
        <p style={{ color: "#6b7280", lineHeight: 1.75, marginBottom: 26 }}>Your password has been changed successfully. You can now sign in with your new password.</p>
        <Btn full onClick={() => setPage('login')}>Go to Sign In</Btn>
      </div>
    </div>
  )

  // View State 2: Request Link Email Sent Feedback
  if (emailSent) return (
    <div style={{ minHeight: "100vh", background: "#f4f3ef", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: "#0d1b5e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", color: "#fff" }}>
          <Ic d={I.mail} s={26} />
        </div>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.8rem", color: "#0d1b5e", marginBottom: 10 }}>Check Your Inbox</h2>
        <p style={{ color: "#6b7280", lineHeight: 1.75, marginBottom: 26 }}>We sent a secure validation recovery connection link directly to <strong>{email}</strong>. Open it to proceed.</p>
        <Btn full onClick={() => setPage('login')}>Back to Login</Btn>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "#f4f3ef", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <button onClick={() => setPage('login')} style={{ background: "none", border: "none", cursor: "pointer", marginBottom: 22 }}>
            <Logo size="lg" />
          </button>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.75rem", color: "#0d1b5e", marginBottom: 6 }}>
            {sessionReady ? "Set New Password" : "Reset Password"}
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.87rem" }}>
            {sessionReady ? "Choose a strong new password for your Arleece account" : "Enter your email to receive a recovery link"}
          </p>
        </div>

        <Card style={{ padding: "30px 26px" }}>
          <ErrBox msg={err} />

          {/* DYNAMIC FORM SWITCHING */}
          {!sessionReady ? (
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
                {loading ? "Sending link…" : "Send Reset Link"}
              </Btn>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: "0.79rem", fontWeight: 600, color: "#4b5563", marginBottom: 6 }}>
                  New Password <span style={{ color: "#b91c1c" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex", pointerEvents: "none" }}>
                    <Ic d={I.lock} s={14} />
                  </span>
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ width: "100%", padding: "10px 42px 10px 40px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: "0.88rem", background: "#fafafa" }}
                    onFocus={e => e.target.style.borderColor = "#0d1b5e"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                  />
                  <button
                    onClick={() => setShowPw(s => !s)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 0, display: "flex" }}
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

              <Btn full onClick={submit} disabled={loading}>
                {loading ? "Updating…" : "Update Password"}
              </Btn>
            </>
          )}

          <div style={{ marginTop: 16 }}>
            <Btn full style={{ background: "none", border: "1.5px solid #e5e7eb", color: "#4b5563" }} onClick={() => setPage('login')}>
              Back to Login
            </Btn>
          </div>
          
        </Card>
      </div>
    </div>
  )
}