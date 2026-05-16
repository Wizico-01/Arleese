import { supabase } from '../lib/supabase'
import { useState } from 'react'
import Logo from '../components/Logo'
import { Btn, Field, Card, ErrBox } from '../components/UI'
import { Ic, I } from '../components/Icons'

export default function LoginPage({ setPage, setUser }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  const submit = async () => {
  if (!email || !password) { 
    setErr("Please fill in all fields.") 
    return 
  }
  setLoading(true)
  setErr("")

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      setErr(error.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setErr("Login failed. Please check your email and password.")
      setLoading(false)
      return
    }

    // Get the user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      // Profile not found, use basic user info
      setUser({ 
        id: data.user.id,
        name: data.user.email.split('@')[0], 
        email: data.user.email, 
        role: 'tenant' 
      })
      setPage('browse')
      setLoading(false)
      return
    }

    setUser({ 
      id: data.user.id,
      name: profile.full_name, 
      email: data.user.email, 
      role: profile.role,
      verified: profile.nin_verified,
    })
    setPage(profile.role === 'landlord' ? 'dashboard' : 'browse')

  } catch (e) {
    setErr("Connection failed. Check your internet and try again.")
  }
  setLoading(false)
}

  return (
    <div style={{
      minHeight: "100vh", background: "#f4f3ef",
      display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <button
            onClick={() => setPage('home')}
            style={{ background: "none", border: "none", cursor: "pointer", marginBottom: 22 }}
          >
            <Logo size="lg" />
          </button>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "1.75rem", color: "#0d1b5e", marginBottom: 6,
          }}>
            Welcome back
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.87rem" }}>
            Sign in to your Arleece account
          </p>
        </div>

        <Card style={{ padding: "30px 26px" }}>
          <ErrBox msg={err} />

          <Field
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={<Ic d={I.mail} s={14} />}
            required
          />

          {/* PASSWORD FIELD */}
          <div style={{ marginBottom: 6 }}>
            <label style={{
              display: "block", fontSize: "0.79rem",
              fontWeight: 600, color: "#4b5563", marginBottom: 6,
            }}>
              Password <span style={{ color: "#b91c1c" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 13, top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af", display: "flex", pointerEvents: "none",
              }}>
                <Ic d={I.lock} s={14} />
              </span>
              <input
                type={showPw ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
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
                  color: "#9ca3af", cursor: "pointer", padding: 0, display: "flex",
                }}
              >
                <Ic d={showPw ? I.eyeOff : I.eye} s={15} />
              </button>
            </div>
          </div>

          <div style={{ textAlign: "right", marginBottom: 18 }}>
            <span style={{ fontSize: "0.78rem", color: "#1e3db5", cursor: "pointer" }}>
              Forgot password?
            </span>
          </div>

          <Btn full onClick={submit} disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </Btn>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
            <span style={{ color: "#9ca3af", fontSize: "0.76rem" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          </div>

          <p style={{ textAlign: "center", fontSize: "0.84rem", color: "#6b7280" }}>
            Don't have an account?{" "}
            <span
              style={{ color: "#1e3db5", fontWeight: 600, cursor: "pointer" }}
              onClick={() => setPage('register')}
            >
              Create one
            </span>
          </p>
        </Card>

        <p style={{ textAlign: "center", fontSize: "0.72rem", color: "#9ca3af", marginTop: 16 }}>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}