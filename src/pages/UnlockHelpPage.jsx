import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { LifeBuoy, Lock, CheckCircle2, Clock, XCircle } from 'lucide-react'

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

const STATUS = {
  open: { bg: "#fef3c7", color: "#92400e", text: "Under review", Icon: Clock },
  approved: { bg: "#dcfce7", color: "#166534", text: "Approved. See your Unlocked page", Icon: CheckCircle2 },
  rejected: { bg: "#fee2e2", color: "#991b1b", text: "Not approved", Icon: XCircle },
}

export default function UnlockHelpPage({ user, setPage }) {
  const [listings, setListings] = useState([])
  const [requests, setRequests] = useState([])
  const [listingId, setListingId] = useState("")
  const [paymentRef, setPaymentRef] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState("")
  const [sent, setSent] = useState(false)

  const loadRequests = async () => {
    const { data } = await supabase
      .from('unlock_requests')
      .select('id, status, created_at, admin_note, payment_ref, listings(title, area, state)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setRequests(data)
  }

  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('listings')
      .select('id, title, area, state')
      .order('created_at', { ascending: false })
      .limit(300)
      .then(({ data }) => { if (data) setListings(data) })
    loadRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const submit = async () => {
    setErr("")
    if (!listingId) { setErr("Choose the apartment you paid for."); return }
    setSending(true)

    // Already unlocked? Then there is nothing to request.
    const { data: existing } = await supabase
      .from('unlocks').select('id')
      .eq('tenant_id', user.id).eq('listing_id', listingId).maybeSingle()
    if (existing) {
      setSending(false)
      setErr("You have already unlocked this apartment. Open your Unlocked page to see the contact and ID.")
      return
    }

    const { error } = await supabase.from('unlock_requests').insert({
      user_id: user.id,
      listing_id: listingId,
      payment_ref: paymentRef.trim() || null,
      message: message.trim() || null,
    })
    setSending(false)

    if (error) {
      setErr(
        error.code === '23505'
          ? "You already have an open request for this apartment. We are reviewing it."
          : "Could not send your request. Please try again."
      )
      return
    }
    setSent(true)
    setListingId(""); setPaymentRef(""); setMessage("")
    loadRequests()
  }

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#f4f3ef", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, flexDirection: "column", gap: 16 }}>
        <Lock size={40} strokeWidth={1.5} color="#0d1b5e" />
        <h2 style={{ fontFamily: "'DM Serif Display',serif", color: "#0d1b5e", fontSize: "1.4rem", textAlign: "center" }}>
          Sign in to contact support
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

  const field = {
    width: "100%", padding: "11px 12px",
    border: "1.5px solid #e5e7eb", borderRadius: 8,
    fontSize: "0.88rem", background: "#fafafa",
    fontFamily: "inherit", boxSizing: "border-box",
  }
  const label = { display: "block", fontSize: "0.79rem", fontWeight: 600, color: "#4b5563", marginBottom: 6 }

  return (
    <div style={{ background: "#f4f3ef", minHeight: "100vh", paddingBottom: 90 }}>
      <div style={{ background: "linear-gradient(135deg,#060e33,#0d1b5e)", padding: "36px 20px 28px" }}>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", color: "#fff", fontSize: "1.6rem", marginBottom: 6 }}>
          Paid but no contact?
        </h1>
        <p style={{ color: "rgba(255,255,255,.65)", fontSize: "0.85rem", lineHeight: 1.6 }}>
          Tell us which apartment you paid for. We will check the payment and unlock your Home Guide's contact and Arleece ID.
        </p>
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 520, margin: "0 auto" }}>

        <div style={{ background: "#eef2ff", border: "1px solid #c7d4fd", borderRadius: 12, padding: "12px 14px", marginBottom: 16, fontSize: "0.8rem", color: "#1e3db5", lineHeight: 1.6 }}>
          First check your Unlocked page. Payments are usually confirmed automatically within a few minutes.
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => setPage('saved')}
              style={{ background: "#0d1b5e", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
            >
              Open Unlocked
            </button>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e8e8e0", borderRadius: 16, padding: "20px 18px", marginBottom: 20 }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                <CheckCircle2 size={34} strokeWidth={1.8} color="#166534" />
              </div>
              <div style={{ fontWeight: 700, color: "#166534", fontSize: "1rem", marginBottom: 6 }}>Request sent</div>
              <p style={{ color: "#6b7280", fontSize: "0.83rem", lineHeight: 1.6, marginBottom: 14 }}>
                We will review it and update the status below.
              </p>
              <button
                onClick={() => setSent(false)}
                style={{ background: "none", border: "1.5px solid #0d1b5e", color: "#0d1b5e", borderRadius: 8, padding: "9px 18px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              >
                Send another request
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "#0d1b5e", marginBottom: 16 }}>
                <LifeBuoy size={18} /> Request my unlock
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={label}>Apartment you paid for <span style={{ color: "#b91c1c" }}>*</span></label>
                <select value={listingId} onChange={e => setListingId(e.target.value)} style={field}>
                  <option value="">Select apartment</option>
                  {listings.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.area}, {l.state})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={label}>Payment reference or transfer details (optional)</label>
                <input
                  value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value)}
                  placeholder="e.g. ARL1A2B3C4D5E6F7G8 or the Opay transaction number"
                  style={field}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={label}>Message (optional)</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={3}
                  placeholder="When did you pay, and how much?"
                  style={{ ...field, resize: "vertical" }}
                />
              </div>

              {err && <p style={{ color: "#b91c1c", fontSize: "0.8rem", marginBottom: 12, lineHeight: 1.5 }}>{err}</p>}

              <button
                onClick={submit}
                disabled={sending}
                style={{
                  width: "100%", background: sending ? "#9ca3af" : "#0d1b5e",
                  color: "#fff", border: "none", borderRadius: 10,
                  padding: "14px 0", fontSize: "0.95rem", fontWeight: 700,
                  cursor: sending ? "not-allowed" : "pointer", fontFamily: "inherit",
                }}
              >
                {sending ? "Sending…" : "Send request"}
              </button>
            </>
          )}
        </div>

        {requests.length > 0 && (
          <>
            <h3 style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "0.95rem", marginBottom: 10 }}>
              My requests
            </h3>
            {requests.map(r => {
              const s = STATUS[r.status] || STATUS.open
              return (
                <div key={r.id} style={{ background: "#fff", border: "1px solid #e8e8e0", borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "0.9rem", marginBottom: 2 }}>
                    {r.listings?.title || "Apartment"}
                  </div>
                  <div style={{ color: "#6b7280", fontSize: "0.76rem", marginBottom: 10 }}>
                    {[r.listings?.area, r.listings?.state].filter(Boolean).join(", ")} · {fmtDate(r.created_at)}
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: s.bg, color: s.color, borderRadius: 6, padding: "4px 10px", fontSize: "0.74rem", fontWeight: 700 }}>
                    <s.Icon size={13} /> {s.text}
                  </div>
                  {r.admin_note && (
                    <p style={{ color: "#6b7280", fontSize: "0.78rem", marginTop: 8, lineHeight: 1.5 }}>
                      {r.admin_note}
                    </p>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}