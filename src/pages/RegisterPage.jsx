import { supabase } from '../lib/supabase'
import { useState, useRef } from 'react'
import Logo from '../components/Logo'
import { Btn, Field, Sel, Card, ErrBox } from '../components/UI'
import { Ic, I } from '../components/Icons'
import { NG_STATES } from '../data/constants'

export default function RegisterPage({ setPage, setUser }) {
  const [role, setRole] = useState("")
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    confirm: "", state: "", nin: "",
    ninFile: null, utilFile: null, terms: false,
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")
  const ninRef = useRef()
  const utilRef = useRef()
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const validateInfo = () => {
    if (!form.name || !form.email || !form.phone || !form.password || !form.confirm || !form.state) {
      setErr("All fields are required."); return false
    }
    if (form.password !== form.confirm) { setErr("Passwords do not match."); return false }
    if (form.password.length < 8) { setErr("Password must be at least 8 characters."); return false }
    if (!form.terms) { setErr("Please agree to the Terms of Service."); return false }
    setErr(""); return true
  }

  // STEP 1 NEXT — for tenant only, sign up immediately
  const next = async () => {
    if (!validateInfo()) return
    setLoading(true)
    setErr("")
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
            phone: form.phone,
            state: form.state,
            role: role,
          }
        }
      })

      if (error) {
        setErr(error.message)
        setLoading(false)
        return
      }

      if (role === 'landlord') {
        // Go to NIN verification step
        setLoading(false)
        setStep(2)
        return
      }

      // Tenant — done
      setUser({
        id: data.user?.id,
        name: form.name,
        email: form.email,
        role: 'tenant',
      })
      setStep(3)

    } catch (e) {
      setErr("Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  // STEP 2 SUBMIT — landlord NIN verification
  const submitLandlord = async () => {
    if (!form.nin || form.nin.length < 11) {
      setErr("Please enter a valid 11-digit NIN.")
      return
    }
    if (!form.ninFile) {
      setErr("Please upload your NIN card or slip.")
      return
    }
    setLoading(true)
    setErr("")
    try {
      // Get current user session
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Upload NIN document
        const filePath = `${user.id}/${Date.now()}-${form.ninFile.name}`
        await supabase.storage
          .from('nin-documents')
          .upload(filePath, form.ninFile)

        // Upload utility bill if provided
        if (form.utilFile) {
          const utilPath = `${user.id}/utility-${Date.now()}-${form.utilFile.name}`
          await supabase.storage
            .from('nin-documents')
            .upload(utilPath, form.utilFile)
        }

        // Save NIN to profile
        await supabase
          .from('profiles')
          .update({ nin: form.nin })
          .eq('id', user.id)
      }

      setUser({
        id: user?.id,
        name: form.name,
        email: form.email,
        role: 'landlord',
        verified: false,
      })
      setStep(3)

    } catch (e) {
      setErr("Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  // STEP 3 — SUCCESS
  if (step === 3) return (
    <div style={{
      minHeight: "100vh", background: "#f4f3ef",
      display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24,
    }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{
          width: 68, height: 68, borderRadius: "50%",
          background: "#0d1b5e", display: "flex",
          alignItems: "center", justifyContent: "center",
          margin: "0 auto 22px", color: "#fff",
        }}>
          <Ic d={I.check} s={30} sw={2.5} />
        </div>
        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: "1.9rem", color: "#0d1b5e", marginBottom: 10,
        }}>
          Account Created!
        </h2>
        {role === "landlord" ? (
          <p style={{ color: "#6b7280", lineHeight: 1.75, marginBottom: 26 }}>
            Your landlord account is under review. We'll verify your NIN within{" "}
            <strong>24–48 hours</strong> and notify you by email.
          </p>
        ) : (
          <p style={{ color: "#6b7280", lineHeight: 1.75, marginBottom: 26 }}>
            Welcome to Arleece! You can now browse apartments across
            Nigeria — zero agent fees.
          </p>
        )}
        <Btn full onClick={() => setPage(role === "landlord" ? "dashboard" : "browse")}>
          {role === "landlord" ? "Go to My Dashboard →" : "Browse Apartments →"}
        </Btn>
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: "100vh", background: "#f4f3ef",
      padding: "32px 16px 80px",
    }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <button
            onClick={() => setPage('home')}
            style={{ background: "none", border: "none", cursor: "pointer", marginBottom: 16 }}
          >
            <Logo size="lg" />
          </button>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "1.6rem", color: "#0d1b5e", marginBottom: 6,
          }}>
            Create Your Account
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
            Join thousands already using Arleece across Nigeria
          </p>
        </div>

        {/* STEP 0 — CHOOSE ROLE */}
        {step === 0 && (
          <div>
            <p style={{
              textAlign: "center", fontWeight: 600,
              color: "#374151", marginBottom: 16, fontSize: "0.9rem",
            }}>
              I am a…
            </p>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 14, marginBottom: 20,
            }}>
              {[
                { r: "tenant", e: "🔍", t: "Tenant", d: "Looking for an apartment to rent" },
                { r: "landlord", e: "🏠", t: "Landlord", d: "I have apartments to list and rent out" },
              ].map(({ r, e, t, d }) => (
                <div
                  key={r}
                  onClick={() => { setRole(r); setStep(1) }}
                  style={{
                    background: "#fff",
                    border: `2px solid ${role === r ? "#0d1b5e" : "#e8e8e0"}`,
                    borderRadius: 14, padding: "20px 14px",
                    cursor: "pointer", textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: 8 }}>{e}</div>
                  <div style={{ fontWeight: 700, color: "#0d1b5e", marginBottom: 4 }}>{t}</div>
                  <div style={{ fontSize: "0.76rem", color: "#6b7280" }}>{d}</div>
                </div>
              ))}
            </div>
            <p style={{ textAlign: "center", fontSize: "0.84rem", color: "#6b7280" }}>
              Already have an account?{" "}
              <span
                style={{ color: "#1e3db5", fontWeight: 600, cursor: "pointer" }}
                onClick={() => setPage('login')}
              >
                Sign in
              </span>
            </p>
          </div>
        )}

        {/* STEP 1 — PERSONAL INFO */}
        {step === 1 && (
          <Card style={{ padding: "24px 20px" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              {(role === "landlord"
                ? ["Account Info", "ID Verification"]
                : ["Account Info"]
              ).map((s, i) => (
                <div key={s} style={{ flex: 1 }}>
                  <div style={{
                    height: 3, borderRadius: 2,
                    background: "#0d1b5e", marginBottom: 4,
                  }} />
                  <span style={{
                    fontSize: "0.68rem",
                    color: "#0d1b5e", fontWeight: 700,
                  }}>
                    {s}
                  </span>
                </div>
              ))}
            </div>

            <ErrBox msg={err} />

            <Field
              label="Full Name"
              placeholder="e.g. Chukwuemeka Adeyemi"
              value={form.name}
              onChange={e => set("name", e.target.value)}
              icon={<Ic d={I.user} s={14} />}
              required
            />
            <Field
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => set("email", e.target.value)}
              icon={<Ic d={I.mail} s={14} />}
              required
            />
            <Field
              label="Phone Number"
              type="tel"
              placeholder="08012345678"
              value={form.phone}
              onChange={e => set("phone", e.target.value)}
              icon={<Ic d={I.phone} s={14} />}
              required
            />
            <Sel
              label="State of Residence"
              value={form.state}
              onChange={e => set("state", e.target.value)}
              options={NG_STATES}
              required
            />

            {/* PASSWORD */}
            <div style={{ marginBottom: 16 }}>
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
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={e => set("password", e.target.value)}
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
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={e => set("confirm", e.target.value)}
              icon={<Ic d={I.lock} s={14} />}
              required
            />

            <label style={{
              display: "flex", alignItems: "flex-start",
              gap: 9, cursor: "pointer", marginBottom: 20,
              fontSize: "0.82rem", color: "#374151",
            }}>
              <input
                type="checkbox"
                checked={form.terms}
                onChange={e => set("terms", e.target.checked)}
                style={{
                  marginTop: 2, accentColor: "#0d1b5e",
                  width: 14, height: 14, flexShrink: 0,
                }}
              />
              I agree to Arleece{" "}
              <span style={{ color: "#1e3db5", fontWeight: 600 }}>
                Terms of Service
              </span>{" "}
              and{" "}
              <span style={{ color: "#1e3db5", fontWeight: 600 }}>
                Privacy Policy
              </span>
            </label>

            <Btn full onClick={next} disabled={loading}>
              {loading
                ? "Processing…"
                : role === "landlord"
                  ? "Continue to Verification →"
                  : "Create Account"}
            </Btn>
            <button
              onClick={() => setStep(0)}
              style={{
                display: "block", textAlign: "center",
                background: "none", border: "none",
                color: "#9ca3af", fontSize: "0.81rem",
                cursor: "pointer", marginTop: 12,
                width: "100%", fontFamily: "inherit",
              }}
            >
              ← Go back
            </button>
          </Card>
        )}

        {/* STEP 2 — LANDLORD NIN VERIFICATION */}
        {step === 2 && (
          <Card style={{ padding: "24px 20px" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              {["Account Info", "ID Verification"].map(s => (
                <div key={s} style={{ flex: 1 }}>
                  <div style={{
                    height: 3, borderRadius: 2,
                    background: "#0d1b5e", marginBottom: 4,
                  }} />
                  <span style={{
                    fontSize: "0.68rem",
                    color: "#0d1b5e", fontWeight: 700,
                  }}>
                    {s}
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: 10, padding: "13px 15px", marginBottom: 18,
            }}>
              <p style={{
                fontWeight: 700, color: "#92400e",
                fontSize: "0.83rem", marginBottom: 3,
              }}>
                ⚠️ Identity Verification Required
              </p>
              <p style={{ fontSize: "0.8rem", color: "#78350f", lineHeight: 1.65 }}>
                All landlords must verify their NIN before listing.
                This protects tenants from fraud.
              </p>
            </div>

            <ErrBox msg={err} />

            <Field
              label="National Identification Number (NIN)"
              placeholder="11-digit NIN e.g. 12345678901"
              value={form.nin}
              onChange={e => set("nin", e.target.value)}
              icon={<Ic d={I.key} s={14} />}
              required
              note="Your NIN is encrypted and used for verification only."
            />

            {/* NIN UPLOAD */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: "block", fontSize: "0.79rem",
                fontWeight: 600, color: "#4b5563", marginBottom: 6,
              }}>
                NIN Card / Slip <span style={{ color: "#b91c1c" }}>*</span>
              </label>
              <div
                onClick={() => ninRef.current.click()}
                style={{
                  border: `2px dashed ${form.ninFile ? "#0d1b5e" : "#d1d5db"}`,
                  borderRadius: 10, padding: "18px", textAlign: "center",
                  cursor: "pointer",
                  background: form.ninFile ? "#f0f4ff" : "#fafafa",
                }}
              >
                <input
                  ref={ninRef}
                  type="file"
                  accept="image/*,.pdf"
                  style={{ display: "none" }}
                  onChange={e => set("ninFile", e.target.files[0])}
                />
                {form.ninFile ? (
                  <div style={{ color: "#0d1b5e" }}>
                    <Ic d={I.check} s={22} sw={2.5} />
                    <p style={{ fontWeight: 700, marginTop: 6, fontSize: "0.85rem" }}>
                      {form.ninFile.name}
                    </p>
                    <p style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: 2 }}>
                      Tap to change
                    </p>
                  </div>
                ) : (
                  <div style={{ color: "#9ca3af" }}>
                    <Ic d={I.upload} s={22} />
                    <p style={{ fontSize: "0.84rem", marginTop: 8 }}>
                      Tap to upload NIN card or slip
                    </p>
                    <p style={{ fontSize: "0.7rem", marginTop: 3 }}>
                      JPG, PNG or PDF · Max 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* UTILITY BILL */}
            <div style={{ marginBottom: 18 }}>
              <label style={{
                display: "block", fontSize: "0.79rem",
                fontWeight: 600, color: "#4b5563", marginBottom: 6,
              }}>
                Proof of Address{" "}
                <span style={{ fontWeight: 400, color: "#9ca3af" }}>
                  (optional)
                </span>
              </label>
              <div
                onClick={() => utilRef.current.click()}
                style={{
                  border: `2px dashed ${form.utilFile ? "#0d1b5e" : "#d1d5db"}`,
                  borderRadius: 10, padding: "14px", textAlign: "center",
                  cursor: "pointer",
                  background: form.utilFile ? "#f0f4ff" : "#fafafa",
                }}
              >
                <input
                  ref={utilRef}
                  type="file"
                  accept="image/*,.pdf"
                  style={{ display: "none" }}
                  onChange={e => set("utilFile", e.target.files[0])}
                />
                {form.utilFile ? (
                  <div style={{ color: "#0d1b5e" }}>
                    <Ic d={I.check} s={18} sw={2.5} />
                    <p style={{ fontWeight: 700, marginTop: 4, fontSize: "0.82rem" }}>
                      {form.utilFile.name}
                    </p>
                  </div>
                ) : (
                  <div style={{ color: "#9ca3af" }}>
                    <Ic d={I.upload} s={18} />
                    <p style={{ fontSize: "0.8rem", marginTop: 5 }}>
                      NEPA bill, bank statement, or water bill
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 10, padding: "12px 14px",
              marginBottom: 20, fontSize: "0.8rem",
              color: "#166534", lineHeight: 1.65,
            }}>
              ✅ Your submission is reviewed within <strong>24–48 hours</strong>.
              You'll get an email once verified.
            </div>

            <Btn full onClick={submitLandlord} disabled={loading}>
              {loading ? "Submitting…" : "Submit & Create Account"}
            </Btn>
            <button
              onClick={() => setStep(1)}
              style={{
                display: "block", textAlign: "center",
                background: "none", border: "none",
                color: "#9ca3af", fontSize: "0.81rem",
                cursor: "pointer", marginTop: 12,
                width: "100%", fontFamily: "inherit",
              }}
            >
              ← Back
            </button>
          </Card>
        )}
      </div>
    </div>
  )
}