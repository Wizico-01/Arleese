import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Ic, I } from '../Icons'
import { Btn, Badge } from '../UI'
import {
  Phone, MapPin, Tag, Copy, Check, CheckCircle2,
  Truck, AlertTriangle, Info,
} from 'lucide-react'

const PAYSTACK_KEY =
  import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ||
  'pk_live_7e4040d2bf01ea308dfc657c49dc25b0e8206643'

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

const idState = (u) => {
  if (!u) return null
  if (u.status === 'redeemed') return 'used'
  if (u.expires_at && new Date(u.expires_at) < new Date()) return 'expired'
  return 'active'
}

export default function ListingModal({ listing: l, onClose, user, setPage }) {
  const [mainImg, setMainImg] = useState(l.images?.[0] || l.img || "")
  const [showFullImg, setShowFullImg] = useState(false)
  const [unlock, setUnlock] = useState(null)
  const [checking, setChecking] = useState(!!user?.id)
  const [saving, setSaving] = useState(false)
  const [pendingRef, setPendingRef] = useState(null)
  const [copied, setCopied] = useState(false)
  const [notice, setNotice] = useState(null) // { type: 'error' | 'info', message }

  const isSale = l.listing_type === 'sale'
  const isLand = l.type === 'Land'
  const pendingKey = `arl_pending_${l.id}`

  const readPending = () => {
    try { return localStorage.getItem(pendingKey) } catch { return null }
  }
  const writePending = (ref) => {
    try { localStorage.setItem(pendingKey, ref) } catch { /* ignore */ }
  }
  const clearPending = () => {
    try { localStorage.removeItem(pendingKey) } catch { /* ignore */ }
  }

  // Has this tenant already unlocked this listing?
  useEffect(() => {
    let cancelled = false
    const check = async () => {
      if (!user?.id) return
      const { data } = await supabase
        .from('unlocks')
        .select('id, code, status, expires_at, paid_at, redeemed_at')
        .eq('tenant_id', user.id)
        .eq('listing_id', l.id)
        .maybeSingle()
      if (cancelled) return
      if (data) {
        setUnlock(data)
        clearPending()
      } else {
        const saved = readPending()
        if (saved) setPendingRef(saved)
      }
      setChecking(false)
    }
    check()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, l.id])

  // Create the unlock + Arleece ID on the server
  const createUnlock = async (reference) => {
    setSaving(true)
    setNotice(null)
    const { data, error } = await supabase.rpc('create_unlock', {
      p_listing_id: l.id,
      p_payment_ref: reference,
    })
    setSaving(false)

    if (error || !data) {
      console.error('create_unlock failed:', error)
      writePending(reference)
      setPendingRef(reference)
      setNotice({
        type: 'error',
        message: `Payment received (ref: ${reference}) but your ID was not generated yet. Tap "Finish unlock" to try again.`,
      })
      return
    }

    clearPending()
    setPendingRef(null)
    setUnlock(data)
  }

  const handlePayment = () => {
    if (!user?.id || !user?.email) {
      setNotice({ type: 'error', message: "Please sign in to unlock this contact." })
      setTimeout(() => {
        if (typeof setPage === 'function') setPage('login')
      }, 1200)
      return
    }

    if (!window.PaystackPop) {
      setNotice({ type: 'error', message: "Payment system is loading. Please refresh the page." })
      return
    }

    setNotice(null)

    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: user.email,
        amount: 20000, // ₦200 in kobo
        currency: 'NGN',
        callback: function (response) {
          createUnlock(response.reference)
        },
        onClose: function () {
          setNotice({
            type: 'info',
            message: 'Payment cancelled. Your Home Guide contact remains locked.',
          })
        },
      })
      handler.openIframe()
    } catch (e) {
      console.error('Paystack failed to open:', e)
      setNotice({ type: 'error', message: "Could not open the payment window. Please try again." })
    }
  }

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(unlock.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  const phone = l.landlord_phone || l.phone
  const address = l.landlord_address || `${l.area}, ${l.state}`
  const st = idState(unlock)
  const stText =
    st === 'used' ? `Discount used on ${fmtDate(unlock?.redeemed_at)}` :
    st === 'expired' ? `Expired on ${fmtDate(unlock?.expires_at)}` :
    `Valid until ${fmtDate(unlock?.expires_at)}`

  const renderAction = () => {
    // 1. Already unlocked: show contact + ID
    if (unlock) {
      return (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 13, padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "#166534", fontSize: "1rem", marginBottom: 14 }}>
            <CheckCircle2 size={18} strokeWidth={2} /> Contact unlocked
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.92rem", color: "#1e293b" }}>
              <Phone size={16} strokeWidth={1.8} color="#0d1b5e" style={{ marginTop: 2, flexShrink: 0 }} />
              <span><strong>Home Guide:</strong>{" "}
                {phone ? (
                  <a href={`tel:${phone}`} style={{ color: "#0d1b5e", fontWeight: 600, textDecoration: "underline" }}>
                    {phone}
                  </a>
                ) : "Not provided"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.92rem", color: "#1e293b" }}>
              <MapPin size={16} strokeWidth={1.8} color="#0d1b5e" style={{ marginTop: 2, flexShrink: 0 }} />
              <span><strong>Address:</strong> {address}</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.92rem", color: "#1e293b" }}>
              <Tag size={16} strokeWidth={1.8} color="#0d1b5e" style={{ marginTop: 2, flexShrink: 0 }} />
              <span><strong>Price:</strong> ₦{l.price?.toLocaleString()}{isSale ? "" : "/year"}</span>
            </div>
          </div>

          {/* ARLEECE ID */}
          <div style={{ background: "#0d1b5e", borderRadius: 12, padding: "16px 18px", marginTop: 16, color: "#fff" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: "#9db7ff", marginBottom: 6 }}>
              YOUR ARLEECE ID
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: "1.7rem", fontWeight: 700, letterSpacing: "0.12em" }}>
                {unlock.code}
              </div>
              <button
                onClick={copyId}
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
            <div style={{ fontSize: "0.76rem", marginTop: 8, color: "rgba(255,255,255,.7)" }}>
              {stText}
            </div>
          </div>

          <div style={{
            display: "flex", gap: 10, alignItems: "flex-start",
            background: "#eef2ff", border: "1px solid #c7d4fd",
            borderRadius: 10, padding: "12px 14px", marginTop: 12,
            fontSize: "0.8rem", color: "#1e3db5", lineHeight: 1.6,
          }}>
            <Truck size={16} strokeWidth={1.8} style={{ marginTop: 2, flexShrink: 0 }} />
            <span>
              Show this ID to the Arleece logistics partner to claim 30% off your move.
              You pay the logistics company directly. Arleece does not collect logistics payments.
            </span>
          </div>
        </div>
      )
    }

    // 2. Listing no longer available
    if (l.status === 'rented') {
      return (
        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 13, padding: "18px 20px", textAlign: "center" }}>
          <div style={{ fontWeight: 700, color: "#991b1b", fontSize: "0.96rem", marginBottom: 4 }}>
            {isSale ? "This property is no longer available" : "This apartment is no longer available"}
          </div>
          <div style={{ color: "#b91c1c", fontSize: "0.82rem" }}>
            Browse other listings to find your next home.
          </div>
        </div>
      )
    }

    // 3. Paid, but the ID still needs to be generated
    if (pendingRef) {
      return (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 13, padding: "18px 20px" }}>
          <div style={{ fontWeight: 700, color: "#92400e", fontSize: "0.96rem", marginBottom: 4 }}>
            Payment received
          </div>
          <div style={{ color: "#92400e", fontSize: "0.82rem", lineHeight: 1.6, marginBottom: 14 }}>
            Your payment (ref: {pendingRef}) went through, but your Arleece ID has not been generated yet.
          </div>
          <Btn onClick={() => createUnlock(pendingRef)} disabled={saving}>
            {saving ? "Generating…" : "Finish unlock"}
          </Btn>
        </div>
      )
    }

    // 4. Still checking
    if (checking) {
      return (
        <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.84rem", padding: "18px 0" }}>
          Checking your unlock status…
        </div>
      )
    }

    // 5. Not unlocked yet
    return (
      <div style={{ background: "linear-gradient(135deg,#f0f3ff,#eaefff)", border: "1px solid #c7d4fd", borderRadius: 13, padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "0.96rem", marginBottom: 3 }}>
              Unlock your Home Guide's contact
            </div>
            <div style={{ color: "#6b7280", fontSize: "0.79rem", lineHeight: 1.5 }}>
              One-time ₦200. You also get your personal Arleece ID for 30% off your move.
            </div>
          </div>
          <Btn onClick={handlePayment} disabled={saving}>
            <Ic d={I.lock} s={14} /> Unlock for ₦200
          </Btn>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,.58)", zIndex: 400,
        display: "flex", alignItems: "center",
        justifyContent: "center", padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: 18,
          width: "100%", maxWidth: 620,
          maxHeight: "92vh", overflowY: "auto",
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* NOTICE BANNER */}
        {notice && (
          <div
            style={{
              position: "sticky", top: 0, zIndex: 50,
              background: notice.type === 'error' ? "#fee2e2" : "#eef2ff",
              borderBottom: `1px solid ${notice.type === 'error' ? "#fca5a5" : "#c7d4fd"}`,
              padding: "12px 18px",
              display: "flex", alignItems: "flex-start",
              justifyContent: "space-between", gap: 12,
            }}
          >
            <span style={{
              display: "flex", gap: 8, alignItems: "flex-start",
              fontSize: "0.84rem", lineHeight: 1.5,
              color: notice.type === 'error' ? "#991b1b" : "#1e3db5",
            }}>
              {notice.type === 'error'
                ? <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                : <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />}
              {notice.message}
            </span>
            <button
              onClick={() => setNotice(null)}
              style={{
                background: "none", border: "none",
                color: notice.type === 'error' ? "#991b1b" : "#1e3db5",
                cursor: "pointer", fontSize: "1rem",
                fontWeight: 700, flexShrink: 0, fontFamily: "inherit",
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* FULL SCREEN IMAGE VIEWER */}
        {showFullImg && (
          <div
            onClick={() => setShowFullImg(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,.95)",
              zIndex: 600, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <img src={mainImg} alt="" style={{ maxWidth: "100%", maxHeight: "100vh", objectFit: "contain" }} />
            <button
              onClick={() => setShowFullImg(false)}
              style={{
                position: "absolute", top: 20, right: 20,
                background: "rgba(255,255,255,.2)", border: "none",
                color: "#fff", width: 40, height: 40,
                borderRadius: "50%", fontSize: "1.2rem",
                cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* MAIN IMAGE */}
        <div style={{ position: "relative" }}>
          <img
            src={mainImg}
            alt={l.title}
            onClick={() => setShowFullImg(true)}
            style={{
              width: "100%", height: 250,
              objectFit: "cover",
              borderRadius: "18px 18px 0 0",
              display: "block",
              cursor: "pointer",
            }}
          />
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 12, right: 12,
              width: 34, height: 34, borderRadius: "50%",
              background: "rgba(0,0,0,.5)", border: "none",
              color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Ic d={I.x} s={16} />
          </button>
          {l.verified && (
            <div style={{ position: "absolute", bottom: 12, left: 12 }}>
              <Badge color="#fff" bg="#0d1b5e">
                <Ic d={I.shield} s={9} fill="#fff" stroke="none" /> Verified Home Guide
              </Badge>
            </div>
          )}
          {isSale && (
            <div style={{ position: "absolute", top: 12, left: 12 }}>
              <Badge color="#fff" bg="#92400e">For Sale</Badge>
            </div>
          )}
        </div>

        {/* THUMBNAIL STRIP */}
        {l.images?.length > 1 && (
          <div style={{ display: "flex", gap: 6, padding: "8px 12px", background: "#f4f3ef", overflowX: "auto" }}>
            {l.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt=""
                onClick={() => setMainImg(img)}
                style={{
                  width: 64, height: 52,
                  objectFit: "cover",
                  borderRadius: 8,
                  flexShrink: 0,
                  cursor: "pointer",
                  border: `2px solid ${mainImg === img ? "#0d1b5e" : "transparent"}`,
                  transition: "border .2s",
                }}
              />
            ))}
          </div>
        )}

        {/* VIDEOS */}
        {l.videos?.length > 0 && (
          <div style={{ padding: "10px 16px", background: "#f4f3ef" }}>
            <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 8 }}>
              Videos
            </p>
            {l.videos.map((vid, idx) => (
              <video key={idx} src={vid} controls style={{ width: "100%", borderRadius: 10, marginBottom: 8, maxHeight: 220, display: "block" }} />
            ))}
          </div>
        )}

        {/* CONTENT */}
        <div style={{ padding: "22px 26px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <div>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.45rem", color: "#0d1b5e", marginBottom: 5 }}>
                {l.title}
              </h2>
              <div style={{ display: "flex", gap: 4, color: "#6b7280", fontSize: "0.8rem", alignItems: "center" }}>
                <Ic d={I.pin} s={12} /> {l.area}, {l.state}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "1.35rem" }}>
                ₦{l.price?.toLocaleString()}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#9ca3af", textAlign: "right" }}>
                {isSale ? "one-time price" : "per year"}
              </div>
            </div>
          </div>

          {/* STATS PILLS */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingBottom: 14, borderBottom: "1px solid #f0efea", marginBottom: 16 }}>
            {[
              !isLand ? `${l.kitchs || 0} Kitchen` : null,
              !isLand ? `${l.baths || 0} Bathroom${l.baths > 1 ? "s" : ""}` : null,
              l.type,
            ].filter(Boolean).map(v => (
              <div key={v} style={{ background: "#f4f3ef", borderRadius: 8, padding: "6px 12px", fontSize: "0.82rem", color: "#374151" }}>
                {v}
              </div>
            ))}
          </div>

          {/* AMENITIES */}
          {l.amenities?.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <h4 style={{ fontWeight: 700, color: "#374151", fontSize: "0.8rem", letterSpacing: "0.05em", marginBottom: 9 }}>
                AMENITIES
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {l.amenities.map(a => (
                  <span key={a} style={{ display: "flex", alignItems: "center", gap: 4, background: "#eef2ff", color: "#0d1b5e", borderRadius: 6, padding: "4px 11px", fontSize: "0.76rem", fontWeight: 600 }}>
                    <Ic d={I.check} s={11} sw={2.5} /> {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {renderAction()}
        </div>
      </div>
    </div>
  )
}