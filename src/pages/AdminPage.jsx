import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react'

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : ''

export default function AdminPage({ user, setPage }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState({})
  const [working, setWorking] = useState(null)
  const [msg, setMsg] = useState("")

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_list_requests')
    if (error) setMsg("Could not load requests.")
    else setRows(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (user?.isAdmin) load()
  }, [user?.isAdmin])

  const resolve = async (id, action) => {
    setWorking(id)
    setMsg("")
    const { data, error } = await supabase.rpc('admin_resolve_request', {
      p_request_id: id,
      p_action: action,
      p_note: notes[id]?.trim() || null,
    })
    setWorking(null)
    if (error) { setMsg("Action failed. Please try again."); return }
    setMsg(
      data?.result === 'approved' ? `Approved. ID created: ${data.code}` :
      data?.result === 'rejected' ? "Request rejected." :
      "This request was already handled."
    )
    load()
  }

  if (!user?.isAdmin) {
    return (
      <div style={{ minHeight: "100vh", background: "#f4f3ef", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, flexDirection: "column", gap: 12, textAlign: "center" }}>
        <AlertTriangle size={36} strokeWidth={1.5} color="#92400e" />
        <h2 style={{ fontFamily: "'DM Serif Display',serif", color: "#0d1b5e", fontSize: "1.3rem" }}>
          This page is for Arleece admins only
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

  const open = rows.filter(r => r.status === 'open')
  const closed = rows.filter(r => r.status !== 'open')

  const Card = ({ r }) => (
    <div style={{ background: "#fff", border: "1px solid #e8e8e0", borderRadius: 14, padding: "16px 16px", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
        <div style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "0.95rem" }}>{r.user_name || "Unknown user"}</div>
        <div style={{ color: "#9ca3af", fontSize: "0.72rem", flexShrink: 0 }}>{fmtDate(r.created_at)}</div>
      </div>
      <div style={{ fontSize: "0.8rem", color: "#4b5563", lineHeight: 1.7, marginBottom: 10 }}>
        <div>Email: {r.user_email}</div>
        <div>Phone: {r.user_phone || "Not provided"}</div>
        <div>Apartment: <strong>{r.listing_title}</strong> ({[r.listing_area, r.listing_state].filter(Boolean).join(", ")})</div>
        {r.payment_ref && <div>Reference: {r.payment_ref}</div>}
        {r.message && <div>Message: {r.message}</div>}
      </div>

      {r.already_unlocked && (
        <div style={{ background: "#fef3c7", color: "#92400e", borderRadius: 8, padding: "8px 12px", fontSize: "0.76rem", marginBottom: 10 }}>
          This user already has an unlock for this apartment.
        </div>
      )}

      {r.status === 'open' ? (
        <>
          <input
            value={notes[r.id] || ""}
            onChange={e => setNotes(p => ({ ...p, [r.id]: e.target.value }))}
            placeholder="Note to the user (optional)"
            style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: "0.82rem", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 10 }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => resolve(r.id, 'approve')}
              disabled={working === r.id || r.already_unlocked}
              style={{
                flex: 1, background: (working === r.id || r.already_unlocked) ? "#9ca3af" : "#166534",
                color: "#fff", border: "none", borderRadius: 8, padding: "11px 0",
                fontSize: "0.84rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Approve and unlock
            </button>
            <button
              onClick={() => resolve(r.id, 'reject')}
              disabled={working === r.id}
              style={{
                flex: 1, background: "#fff", color: "#b91c1c",
                border: "1.5px solid #fca5a5", borderRadius: 8, padding: "11px 0",
                fontSize: "0.84rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Reject
            </button>
          </div>
        </>
      ) : (
        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: r.status === 'approved' ? "#166534" : "#991b1b" }}>
          {r.status === 'approved' ? "Approved" : "Rejected"}{r.admin_note ? ` · ${r.admin_note}` : ""}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ background: "#f4f3ef", minHeight: "100vh", paddingBottom: 90 }}>
      <div style={{ background: "linear-gradient(135deg,#060e33,#0d1b5e)", padding: "36px 20px 28px" }}>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", color: "#fff", fontSize: "1.6rem", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
          <ShieldCheck size={24} /> Unlock requests
        </h1>
        <p style={{ color: "rgba(255,255,255,.65)", fontSize: "0.84rem", lineHeight: 1.6 }}>
          Check the payment in your Paystack dashboard before approving.
        </p>
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 560, margin: "0 auto" }}>
        {msg && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#eef2ff", border: "1px solid #c7d4fd", color: "#1e3db5", borderRadius: 10, padding: "10px 14px", fontSize: "0.82rem", marginBottom: 14 }}>
            <CheckCircle2 size={16} /> {msg}
          </div>
        )}

        {loading && <p style={{ textAlign: "center", color: "#9ca3af", padding: "30px 0" }}>Loading…</p>}

        {!loading && open.length === 0 && (
          <p style={{ textAlign: "center", color: "#9ca3af", padding: "30px 0", fontSize: "0.88rem" }}>
            No open requests.
          </p>
        )}

        {open.map(r => <Card key={r.id} r={r} />)}

        {closed.length > 0 && (
          <>
            <h3 style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "0.9rem", margin: "22px 0 10px" }}>
              Resolved
            </h3>
            {closed.map(r => <Card key={r.id} r={r} />)}
          </>
        )}
      </div>
    </div>
  )
}