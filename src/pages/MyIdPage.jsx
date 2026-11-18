import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import {
  KeyRound, Copy, Check, Clock, Lock, CheckCircle2,
  AlertTriangle, Info, Truck, BadgePercent, Phone,
} from 'lucide-react'

const PAYSTACK_KEY =
  import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ||
  'pk_live_7e4040d2bf01ea308dfc657c49dc25b0e8206643'

// Flip to true when Part 2 (logistics form) is installed
const MOVE_ENABLED = false

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
const naira = (kobo) => `₦${Math.round((kobo || 0) / 100).toLocaleString()}`

const effective = (r) =>
  r.status === 'active' && new Date(r.expires_at) < new Date() ? 'expired' : r.status

const CHIP = {
  active: { bg: "#dcfce7", color: "#166534", text: "Active" },
  used: { bg: "#e5e7eb", color: "#374151", text: "Used" },
  expired: { bg: "#fee2e2", color: "#991b1b", text: "Expired" },
  refunded: { bg: "#fef3c7", color: "#92400e", text: "Refunded as app credit" },
}

export default function MyIdPage({ user, setPage }) {
  const [cfg, setCfg] = useState({ id_price_kobo: 20000, id_expiry_days: 30, credit_validity_months: 12, support_whatsapp: "" })
  const [ids, setIds] = useState([])
  const [wallet, setWallet] = useState({ balance_kobo: 0, entries: [] })
  const [pending, setPending] = useState(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [copied, setCopied] = useState(false)
  const [notice, setNotice] = useState(null)
  const busy = useRef(false)
  const polls = useRef(0)

  const load = async () => {
    if (!user?.id) return
    const [{ data: conf }, { data: idRows }, { data: w }] = await Promise.all([
      supabase.rpc('public_config'),
      supabase
        .from('arleece_ids')
        .select('id, id_code, status, paid_at, used_at, expires_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase.rpc('my_wallet'),
    ])
    if (conf) setCfg(conf)
    setIds(idRows || [])
    if (w) setWallet(w)

    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    const { data: p } = await supabase
      .from('pending_payments')
      .select('reference')
      .eq('tenant_id', user.id)
      .eq('status', 'pending')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    setPending(p?.reference || null)
    setLoading(false)
  }

  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user?.id])

  const verifyPayment = async (reference, silent = false) => {
    if (!reference || busy.current) return false
    busy.current = true
    if (!silent) setVerifying(true)

    let result = { status: 'error' }
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', { body: { reference } })
      if (error) result = { status: 'error', message: error.message }
      else if (data?.status) result = data
    } catch (e) {
      result = { status: 'error', message: String(e) }
    }
    busy.current = false
    setVerifying(false)

    if (result.status === 'fulfilled') {
      setNotice(null)
      await load()
      return true
    }
    if (!silent) {
      const s = result.status
      setNotice({
        type: s === 'pending' ? 'info' : 'error',
        message:
          s === 'pending' ? 'We have not received your payment yet. Bank transfers can take a minute or two.'
          : s === 'failed' ? 'Paystack reports this payment as failed.'
          : s === 'amount_mismatch' ? 'The amount received is less than required. Please contact support.'
          : s === 'credit_unavailable' ? 'Your credit changed while paying. Please contact support. Your payment is safe.'
          : s === 'paystack_error' || s === 'config_error' ? 'Payment confirmation is not set up correctly yet. Your payment is safe. Please contact support.'
          : 'Could not check right now. Please try again in a moment.',
      })
    }
    return false
  }

  // While a payment is waiting, re-check every 6 seconds and when the app returns
  useEffect(() => {
    if (!pending) return
    polls.current = 0
    const tick = () => { if (polls.current++ < 40) verifyPayment(pending, true) }
    const timer = setInterval(tick, 6000)
    const onVisible = () => { if (document.visibilityState === 'visible') verifyPayment(pending, true) }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending])

  const buy = async () => {
    setNotice(null)
    setStarting(true)
    const { data, error } = await supabase.rpc('start_id_purchase')
    setStarting(false)

    if (error || !data) {
      const m = error?.message || ''
      setNotice({
        type: 'error',
        message: m.includes('Too many') ? 'Too many attempts. Please wait a while and try again.'
          : m.includes('already have') ? 'You already have an active Arleece ID.'
          : 'Could not start. Please try again.',
      })
      if (m.includes('already have')) load()
      return
    }

    if (data.status === 'issued') {
      await load()
      return
    }

    if (!window.PaystackPop) {
      setNotice({ type: 'error', message: "Payment system is loading. Please refresh the page." })
      return
    }

    setPending(data.reference)
    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: user.email,
        amount: data.amount_kobo,
        currency: 'NGN',
        ref: data.reference,
        callback: function () { verifyPayment(data.reference) },
        onClose: function () {
          setNotice({
            type: 'info',
            message: 'If you paid, or are paying by transfer, tap "Check payment". Your ID is created automatically once Paystack confirms it, even if you close the app.',
          })
        },
      })
      handler.openIframe()
    } catch {
      setNotice({ type: 'error', message: "Could not open the payment window. Please try again." })
    }
  }

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  if (!user) return (
    <div style={{
      minHeight: "100vh", background: "#f4f3ef", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 24,
      flexDirection: "column", gap: 16,
    }}>
      <Lock size={40} strokeWidth={1.5} color="#0d1b5e" />
      <h2 style={{ fontFamily: "'DM Serif Display',serif", color: "#0d1b5e", fontSize: "1.4rem", textAlign: "center" }}>
        Sign in to get your Arleece ID
      </h2>
      <button
        onClick={() => setPage('login')}
        style={{
          background: "#0d1b5e", color: "#fff", border: "none", borderRadius: 9,
          padding: "12px 32px", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, fontFamily: "inherit",
        }}
      >
        Sign In
      </button>
    </div>
  )

  const active = ids.find(r => effective(r) === 'active')
  const past = ids.filter(r => r !== active)
  const price = cfg.id_price_kobo
  const credit = Math.min(wallet.balance_kobo, price)
  const toPay = price - credit
  const supportLink = cfg.support_whatsapp ? `https://wa.me/${cfg.support_whatsapp}` : null

  const card = { background: "#fff", border: "1px solid #e8e8e0", borderRadius: 16, padding: "20px 18px", marginBottom: 16 }

  return (
    <div style={{ background: "#f4f3ef", minHeight: "100vh", paddingBottom: 90 }}>
      <div style={{ background: "linear-gradient(135deg,#060e33,#0d1b5e)", padding: "36px 20px 28px" }}>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", color: "#fff", fontSize: "1.7rem", marginBottom: 6 }}>
          My Arleece ID
        </h1>
        <p style={{ color: "rgba(255,255,255,.65)", fontSize: "0.85rem", lineHeight: 1.6 }}>
          Your ID gives you 30% off moving logistics with our partner.
        </p>
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 520, margin: "0 auto" }}>

        {notice && (
          <div style={{
            display: "flex", gap: 8, alignItems: "flex-start",
            background: notice.type === 'error' ? "#fee2e2" : "#eef2ff",
            border: `1px solid ${notice.type === 'error' ? "#fca5a5" : "#c7d4fd"}`,
            color: notice.type === 'error' ? "#991b1b" : "#1e3db5",
            borderRadius: 12, padding: "12px 14px", marginBottom: 16,
            fontSize: "0.83rem", lineHeight: 1.55,
          }}>
            {notice.type === 'error'
              ? <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              : <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />}
            {notice.message}
          </div>
        )}

        {loading && <p style={{ textAlign: "center", color: "#9ca3af", padding: "30px 0" }}>Loading…</p>}

        {/* ACTIVE ID */}
        {!loading && active && (
          <div style={{ ...card, background: "#0d1b5e", border: "none", color: "#fff" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: "#9db7ff", marginBottom: 8 }}>
              YOUR ARLEECE ID
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: "1.6rem", fontWeight: 700, letterSpacing: "0.1em" }}>
                {active.id_code}
              </div>
              <button
                onClick={() => copyCode(active.id_code)}
                style={{
                  background: "rgba(255,255,255,.14)", color: "#fff",
                  border: "1px solid rgba(255,255,255,.3)", borderRadius: 8,
                  padding: "7px 12px", fontSize: "0.78rem", fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div style={{ fontSize: "0.78rem", marginTop: 10, color: "rgba(255,255,255,.7)" }}>
              Valid until {fmtDate(active.expires_at)}. One use only.
            </div>
            <div style={{
              display: "flex", gap: 8, alignItems: "flex-start", marginTop: 14,
              fontSize: "0.78rem", color: "rgba(255,255,255,.78)", lineHeight: 1.6,
            }}>
              <Truck size={15} style={{ flexShrink: 0, marginTop: 2 }} />
              You pay the logistics company directly for your move. Arleece does not collect logistics payments.
            </div>
            {MOVE_ENABLED && (
              <button
                onClick={() => setPage('move')}
                style={{
                  width: "100%", marginTop: 16, background: "#fff", color: "#0d1b5e",
                  border: "none", borderRadius: 10, padding: "13px 0",
                  fontSize: "0.92rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Book my move
              </button>
            )}
          </div>
        )}

        {/* WAITING FOR PAYMENT */}
        {!loading && !active && pending && (
          <div style={{ ...card, background: "#fffbeb", border: "1px solid #fde68a" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "#92400e", marginBottom: 6 }}>
              <Clock size={18} /> Waiting for your payment
            </div>
            <p style={{ color: "#92400e", fontSize: "0.82rem", lineHeight: 1.65, marginBottom: 14 }}>
              Paid by transfer? It can take a minute or two. Your ID appears automatically once Paystack
              confirms it, even if you close the app.
            </p>
            <button
              onClick={() => verifyPayment(pending)}
              disabled={verifying}
              style={{
                background: verifying ? "#9ca3af" : "#0d1b5e", color: "#fff", border: "none",
                borderRadius: 9, padding: "12px 20px", fontSize: "0.88rem", fontWeight: 700,
                cursor: verifying ? "not-allowed" : "pointer", fontFamily: "inherit",
              }}
            >
              {verifying ? "Checking…" : "Check payment"}
            </button>
            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => setPending(null)}
                style={{ background: "none", border: "none", color: "#6b7280", fontSize: "0.78rem", cursor: "pointer", fontFamily: "inherit", padding: 0 }}
              >
                I have not paid. Start a new payment
              </button>
            </div>
          </div>
        )}

        {/* BUY AN ID */}
        {!loading && !active && !pending && (
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "#0d1b5e", fontSize: "1.02rem", marginBottom: 8 }}>
              <KeyRound size={20} /> Get your Arleece ID
            </div>
            <p style={{ color: "#4b5563", fontSize: "0.85rem", lineHeight: 1.7, marginBottom: 14 }}>
              A one-time payment of {naira(price)} gives you a unique Arleece ID. Show it to our logistics
              partner to get <strong>30% off</strong> your move. Unlocking Home Guide contacts stays free.
            </p>

            {credit > 0 && (
              <div style={{
                display: "flex", gap: 8, alignItems: "center", background: "#eef2ff",
                border: "1px solid #c7d4fd", borderRadius: 10, padding: "10px 12px",
                color: "#1e3db5", fontSize: "0.8rem", marginBottom: 14,
              }}>
                <BadgePercent size={16} style={{ flexShrink: 0 }} />
                {naira(credit)} of your app credit is applied first.
                {toPay === 0 ? " Your ID is free this time." : ` You pay ${naira(toPay)}.`}
              </div>
            )}

            <button
              onClick={buy}
              disabled={starting}
              style={{
                width: "100%", background: starting ? "#9ca3af" : "#0d1b5e", color: "#fff",
                border: "none", borderRadius: 10, padding: "14px 0", fontSize: "0.95rem",
                fontWeight: 700, cursor: starting ? "not-allowed" : "pointer", fontFamily: "inherit",
              }}
            >
              {starting ? "Starting…" : toPay === 0 ? "Get my ID with app credit" : `Pay ${naira(toPay)} and get my ID`}
            </button>

            <div style={{
              marginTop: 14, background: "#f4f3ef", borderRadius: 10, padding: "12px 14px",
              fontSize: "0.76rem", color: "#4b5563", lineHeight: 1.7,
            }}>
              <strong style={{ color: "#0d1b5e" }}>Connected or credit-back.</strong>{" "}
              If the logistics partner does not contact you within 24 hours of your request, we return the
              fee as <strong>Arleece app credit</strong>, not cash, valid for {cfg.credit_validity_months} months.
              Credit can only be used to get a new Arleece ID. Your ID is valid for {cfg.id_expiry_days} days.
              The move itself is paid directly to the logistics company.
            </div>
          </div>
        )}

        {/* WALLET */}
        {!loading && (
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "0.95rem" }}>App credit</div>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.5rem", color: "#0d1b5e" }}>
                {naira(wallet.balance_kobo)}
              </div>
            </div>
            {wallet.entries.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: "0.8rem" }}>No credit yet.</p>
            ) : wallet.entries.map(e => (
              <div key={e.id} style={{
                display: "flex", justifyContent: "space-between", gap: 10,
                padding: "9px 0", borderTop: "1px solid #f4f3ef", fontSize: "0.8rem",
              }}>
                <div>
                  <div style={{ color: "#374151" }}>{e.reason || (e.type === 'credit_issued' ? 'Credit added' : 'Credit used')}</div>
                  <div style={{ color: "#9ca3af", fontSize: "0.72rem" }}>{fmtDate(e.created_at)}</div>
                </div>
                <div style={{ fontWeight: 700, color: e.type === 'credit_issued' ? "#166534" : "#991b1b", flexShrink: 0 }}>
                  {e.type === 'credit_issued' ? "+" : "-"}{naira(e.amount_kobo)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* HISTORY */}
        {!loading && past.length > 0 && (
          <div style={card}>
            <div style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "0.95rem", marginBottom: 10 }}>Previous IDs</div>
            {past.map(r => {
              const st = effective(r)
              const c = CHIP[st]
              return (
                <div key={r.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  gap: 10, padding: "10px 0", borderTop: "1px solid #f4f3ef",
                }}>
                  <div>
                    <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, color: "#0d1b5e", letterSpacing: "0.06em" }}>
                      {r.id_code}
                    </div>
                    <div style={{ color: "#9ca3af", fontSize: "0.72rem" }}>{fmtDate(r.paid_at)}</div>
                  </div>
                  <span style={{ background: c.bg, color: c.color, borderRadius: 6, padding: "3px 9px", fontSize: "0.72rem", fontWeight: 700 }}>
                    {c.text}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* SUPPORT */}
        {!loading && (
          <div style={{ textAlign: "center", color: "#6b7280", fontSize: "0.8rem", lineHeight: 1.7 }}>
            Paid but no ID, or a payment problem?{" "}
            {supportLink ? (
              <a href={supportLink} target="_blank" rel="noreferrer" style={{ color: "#0d1b5e", fontWeight: 700 }}>
                <Phone size={12} style={{ verticalAlign: "-1px" }} /> Message us on WhatsApp
              </a>
            ) : (
              <span>Contact Arleece support.</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}