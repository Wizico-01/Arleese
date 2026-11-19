import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ShieldCheck, CheckCircle2, AlertTriangle, BadgePercent } from 'lucide-react'

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

const TONES = {
  green: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" },
  amber: { bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
  red: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
}

const OUTCOMES = {
  valid: {
    tone: "green",
    title: "Valid Arleece ID",
    msg: "This ID was issued by Arleece. Confirm the name below matches your customer, then apply the 30% discount.",
  },
  expired: {
    tone: "amber",
    title: "This ID has expired",
    msg: "Arleece issued this ID, but it is past its validity date. Do not apply the discount.",
  },
  already_used: {
    tone: "red",
    title: "Discount already used",
    msg: "This ID has already been redeemed. Do not apply the discount again.",
  },
  refunded: {
    tone: "red",
    title: "This ID was refunded",
    msg: "The fee for this ID was returned as app credit, so it can no longer be used. Do not apply the discount.",
  },
  not_found: {
    tone: "red",
    title: "Not an Arleece ID",
    msg: "We have no record of this ID. Do not apply any discount.",
  },
  bad_format: {
    tone: "red",
    title: "Invalid format",
    msg: "An Arleece ID looks like ARL-K7M2P9XQ: ARL, a dash, then 8 letters or numbers.",
  },
  too_many_attempts: {
    tone: "amber",
    title: "Too many failed checks",
    msg: "Please wait 10 minutes before checking another ID.",
  },
}

export default function LogisticsPage({ user, setPage }) {
  const [code, setCode] = useState("")
  const [result, setResult] = useState(null)
  const [checking, setChecking] = useState(false)
  const [redeeming, setRedeeming] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState("")

  const clean = () => code.replace(/\s/g, '').toUpperCase()

  const check = async () => {
    const c = clean()
    if (!c) { setErr("Enter the ID the customer gave you."); return }
    setChecking(true)
    setErr("")
    setResult(null)
    setDone(false)
    const { data, error } = await supabase.rpc('verify_arleece_id', { p_code: c })
    setChecking(false)
    if (error) {
      setErr("Could not check this ID. Check your connection and try again.")
      return
    }
    setResult(data)
  }

  const redeem = async () => {
    setRedeeming(true)
    setErr("")
    const { data, error } = await supabase.rpc('redeem_arleece_id', { p_code: result.code })
    setRedeeming(false)
    if (error) {
      setErr("Could not apply the discount. Please try again.")
      return
    }
    if (data?.result === 'redeemed') {
      setDone(true)
    } else {
      setResult({ ...result, result: data?.result, used_at: data?.used_at })
    }
  }

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#f4f3ef", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, flexDirection: "column", gap: 16 }}>
        <ShieldCheck size={40} strokeWidth={1.4} color="#0d1b5e" />
        <h2 style={{ fontFamily: "'DM Serif Display',serif", color: "#0d1b5e", fontSize: "1.4rem", textAlign: "center" }}>
          Sign in to verify Arleece IDs
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

  if (user.role !== 'logistics') {
    return (
      <div style={{ minHeight: "100vh", background: "#f4f3ef", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, flexDirection: "column", gap: 12, textAlign: "center" }}>
        <AlertTriangle size={36} strokeWidth={1.5} color="#92400e" />
        <h2 style={{ fontFamily: "'DM Serif Display',serif", color: "#0d1b5e", fontSize: "1.3rem" }}>
          This page is for Arleece logistics partners only
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

  const outcome = result ? OUTCOMES[result.result] : null
  const tone = outcome ? TONES[outcome.tone] : null
  const showDetails = result && ['valid', 'expired', 'already_used'].includes(result.result)

  const rows = showDetails ? [
    ['ID issued on', fmtDate(result.issued_at)],
    [result.result === 'expired' ? 'Expired on' : 'Valid until', fmtDate(result.expires_at)],
    ...(result.result === 'already_used' ? [['Discount applied on', fmtDate(result.used_at)]] : []),
  ] : []

  return (
    <div style={{ background: "#f4f3ef", minHeight: "100vh", paddingBottom: 90 }}>

      <div style={{ background: "linear-gradient(135deg,#060e33,#0d1b5e)", padding: "36px 20px 28px" }}>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", color: "#fff", fontSize: "1.6rem", marginBottom: 6 }}>
          Verify Arleece ID
        </h1>
        <p style={{ color: "rgba(255,255,255,.65)", fontSize: "0.85rem", lineHeight: 1.6 }}>
          No confirmed ID, no discount. Check the customer's ID here before applying 30% off their move.
        </p>
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 520, margin: "0 auto" }}>

        <div style={{ background: "#fff", border: "1px solid #e8e8e0", borderRadius: 16, padding: "20px 18px", marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: "0.79rem", fontWeight: 600, color: "#4b5563", marginBottom: 8 }}>
            Customer's Arleece ID
          </label>
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && check()}
            maxLength={13}
            placeholder="ARL-K7M2P9XQ"
            autoCapitalize="characters"
            autoComplete="off"
            style={{
              width: "100%", padding: "14px 14px",
              border: "1.5px solid #e5e7eb", borderRadius: 10,
              fontSize: "1.3rem", fontFamily: "'Courier New', monospace",
              fontWeight: 700, letterSpacing: "0.1em",
              textAlign: "center", background: "#fafafa",
              boxSizing: "border-box",
            }}
            onFocus={e => e.target.style.borderColor = "#0d1b5e"}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          />

          {err && <p style={{ color: "#b91c1c", fontSize: "0.8rem", marginTop: 10 }}>{err}</p>}

          <button
            onClick={check}
            disabled={checking}
            style={{
              width: "100%", marginTop: 14,
              background: checking ? "#9ca3af" : "#0d1b5e",
              color: "#fff", border: "none", borderRadius: 10,
              padding: "14px 0", fontSize: "0.95rem", fontWeight: 700,
              cursor: checking ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}
          >
            {checking ? "Checking…" : "Check ID"}
          </button>
        </div>

        {outcome && !done && (
          <div style={{ background: tone.bg, border: `1px solid ${tone.border}`, borderRadius: 16, padding: "20px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: tone.text, fontSize: "1.02rem", marginBottom: 6 }}>
              {result.result === 'valid'
                ? <CheckCircle2 size={20} strokeWidth={2} />
                : <AlertTriangle size={20} strokeWidth={2} />}
              {outcome.title}
            </div>
            <p style={{ color: tone.text, fontSize: "0.83rem", lineHeight: 1.6, marginBottom: showDetails ? 16 : 0 }}>
              {outcome.msg}
            </p>

            {showDetails && (
              <>
                <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
                  <div style={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.1em", color: "#9ca3af", marginBottom: 4 }}>
                    CUSTOMER NAME
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0d1b5e", marginBottom: 14 }}>
                    {result.customer_name || 'Not available'}
                  </div>
                  {rows.map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderTop: "1px solid #f4f3ef", fontSize: "0.82rem" }}>
                      <span style={{ color: "#6b7280" }}>{k}</span>
                      <span style={{ color: "#0d1b5e", fontWeight: 600, textAlign: "right" }}>{v}</span>
                    </div>
                  ))}
                </div>

                {result.result === 'valid' && (
                  <button
                    onClick={redeem}
                    disabled={redeeming}
                    style={{
                      width: "100%",
                      background: redeeming ? "#9ca3af" : "#166534",
                      color: "#fff", border: "none", borderRadius: 10,
                      padding: "14px 0", fontSize: "0.95rem", fontWeight: 700,
                      cursor: redeeming ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", gap: 8,
                    }}
                  >
                    <BadgePercent size={18} />
                    {redeeming ? "Applying…" : "Confirm ID and apply 30% discount"}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {done && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 16, padding: "24px 18px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
              <CheckCircle2 size={36} strokeWidth={1.8} color="#166534" />
            </div>
            <div style={{ fontWeight: 700, color: "#166534", fontSize: "1.05rem", marginBottom: 6 }}>
              Discount applied
            </div>
            <p style={{ color: "#166534", fontSize: "0.83rem", lineHeight: 1.6, marginBottom: 16 }}>
              This ID is now marked as used and cannot be redeemed again.
            </p>
            <button
              onClick={() => { setCode(""); setResult(null); setDone(false) }}
              style={{ background: "#0d1b5e", color: "#fff", border: "none", borderRadius: 9, padding: "11px 24px", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
            >
              Check another ID
            </button>
          </div>
        )}

        <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.74rem", lineHeight: 1.6, marginTop: 20 }}>
          Customers pay your company directly for the move.
          Arleece only confirms that the ID is genuine.
        </p>
      </div>
    </div>
  )
        }
