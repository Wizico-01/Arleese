import { useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  KeyRound, ShieldCheck, AlertTriangle, CheckCircle2,
  MapPin, Tag, Users,
} from 'lucide-react'

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

export default function GuideFindPage({ user, setPage }) {
  const [code, setCode] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  const find = async () => {
    const c = code.replace(/\s/g, '').toUpperCase()
    if (!c) { setErr("Enter the apartment code the tenant showed you."); return }
    setLoading(true)
    setErr("")
    setResult(null)
    const { data, error } = await supabase.rpc('guide_lookup_apartment', { p_code: c })
    setLoading(false)
    if (error) {
      setErr("Could not check this code. Check your connection and try again.")
      return
    }
    setResult(data)
  }

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#f4f3ef", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, flexDirection: "column", gap: 16 }}>
        <ShieldCheck size={40} strokeWidth={1.4} color="#0d1b5e" />
        <h2 style={{ fontFamily: "'DM Serif Display',serif", color: "#0d1b5e", fontSize: "1.4rem", textAlign: "center" }}>
          Sign in to check an apartment code
        </h2>
        <button
          onClick={() => setPage('login')}
          style={{ background: "#0d1b5e", color: "#fff", border: "none", borderRadius: 9, padding: "12px 32px", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, fontFamily: "inherit" }}
        >
          Sign In
        </button>
      </div>
    )
  }

  if (user.role !== 'landlord') {
    return (
      <div style={{ minHeight: "100vh", background: "#f4f3ef", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, flexDirection: "column", gap: 12, textAlign: "center" }}>
        <AlertTriangle size={36} strokeWidth={1.5} color="#92400e" />
        <h2 style={{ fontFamily: "'DM Serif Display',serif", color: "#0d1b5e", fontSize: "1.3rem" }}>
          This page is for Arleece Home Guides only
        </h2>
        <button
          onClick={() => setPage('home')}
          style={{ background: "#0d1b5e", color: "#fff", border: "none", borderRadius: 9, padding: "11px 28px", cursor: "pointer", fontSize: "0.88rem", fontWeight: 600, fontFamily: "inherit" }}
        >
          Back to Home
        </button>
      </div>
    )
  }

  const found = result?.result === 'found'
  const sale = result?.listing_type === 'sale'

  return (
    <div style={{ background: "#f4f3ef", minHeight: "100vh", paddingBottom: 90 }}>
      <div style={{ background: "linear-gradient(135deg,#060e33,#0d1b5e)", padding: "36px 20px 28px" }}>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", color: "#fff", fontSize: "1.6rem", marginBottom: 6 }}>
          Check apartment code
        </h1>
        <p style={{ color: "rgba(255,255,255,.65)", fontSize: "0.85rem", lineHeight: 1.6 }}>
          Ask the tenant for the apartment code before you take them to inspect. It confirms they unlocked this apartment through Arleece.
        </p>
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 520, margin: "0 auto" }}>

        <div style={{ background: "#fff", border: "1px solid #e8e8e0", borderRadius: 16, padding: "20px 18px", marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: "0.79rem", fontWeight: 600, color: "#4b5563", marginBottom: 8 }}>
            Apartment code
          </label>
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && find()}
            maxLength={10}
            placeholder="APT-K7M2P9"
            autoCapitalize="characters"
            autoComplete="off"
            style={{
              width: "100%", padding: "14px 14px",
              border: "1.5px solid #e5e7eb", borderRadius: 10,
              fontSize: "1.3rem", fontFamily: "'Courier New', monospace",
              fontWeight: 700, letterSpacing: "0.1em",
              textAlign: "center", background: "#fafafa", boxSizing: "border-box",
            }}
            onFocus={e => e.target.style.borderColor = "#0d1b5e"}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          />
          {err && <p style={{ color: "#b91c1c", fontSize: "0.8rem", marginTop: 10 }}>{err}</p>}
          <button
            onClick={find}
            disabled={loading}
            style={{
              width: "100%", marginTop: 14,
              background: loading ? "#9ca3af" : "#0d1b5e",
              color: "#fff", border: "none", borderRadius: 10,
              padding: "14px 0", fontSize: "0.95rem", fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <KeyRound size={17} /> {loading ? "Checking…" : "Find apartment"}
          </button>
        </div>

        {result && !found && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 16, padding: "18px", color: "#991b1b" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, marginBottom: 6 }}>
              <AlertTriangle size={18} /> Code not found
            </div>
            <p style={{ fontSize: "0.83rem", lineHeight: 1.6 }}>
              None of your apartments match this code. Check the code with the tenant. Do not take them to inspect until it matches one of your listings.
            </p>
          </div>
        )}

        {found && (
          <div style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ background: "#f0fdf4", padding: "14px 18px", display: "flex", alignItems: "center", gap: 8, color: "#166534", fontWeight: 700 }}>
              <CheckCircle2 size={18} /> Apartment found
            </div>

            {result.image && (
              <img src={result.image} alt={result.title} style={{ width: "100%", height: 170, objectFit: "cover", display: "block" }} />
            )}

            <div style={{ padding: "16px 18px" }}>
              <h3 style={{ fontFamily: "'DM Serif Display',serif", color: "#0d1b5e", fontSize: "1.15rem", marginBottom: 8 }}>
                {result.title}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.86rem", color: "#374151", marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <MapPin size={16} color="#0d1b5e" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{result.address || `${result.area}, ${result.state}`}</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Tag size={16} color="#0d1b5e" style={{ flexShrink: 0 }} />
                  <span>₦{Number(result.price).toLocaleString()}{sale ? "" : "/year"}</span>
                </div>
              </div>

              {result.status === 'rented' && (
                <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "9px 12px", fontSize: "0.8rem", marginBottom: 14 }}>
                  This apartment is marked as no longer available.
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "#0d1b5e", fontSize: "0.9rem", marginBottom: 10 }}>
                <Users size={16} /> Tenants who unlocked this apartment
              </div>

              {result.unlockers?.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: "0.8rem" }}>No tenants have unlocked it yet.</p>
              ) : result.unlockers.map((u, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", gap: 10,
                  padding: "9px 0", borderTop: "1px solid #f4f3ef", fontSize: "0.84rem",
                }}>
                  <span style={{ color: "#0d1b5e", fontWeight: 600 }}>{u.name || "Tenant"}</span>
                  <span style={{ color: "#9ca3af", fontSize: "0.76rem" }}>{fmtDate(u.unlocked_at)}</span>
                </div>
              ))}

              <p style={{ color: "#6b7280", fontSize: "0.76rem", lineHeight: 1.6, marginTop: 12 }}>
                Match the tenant's name against this list before the inspection.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
