import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Ic, I } from '../Icons'
import { Btn, Badge } from '../UI'
import {
  Phone, MapPin, Tag, User, CheckCircle2,
  AlertTriangle, Info, Unlock, BadgePercent, KeyRound,
} from 'lucide-react'

export default function ListingModal({ listing: l, onClose, user, setPage }) {
  const [mainImg, setMainImg] = useState(l.images?.[0] || l.img || "")
  const [showFullImg, setShowFullImg] = useState(false)
  const [contact, setContact] = useState(null)
  const [checking, setChecking] = useState(!!user?.id)
  const [unlocking, setUnlocking] = useState(false)
  const [notice, setNotice] = useState(null) // { type: 'error' | 'info', message }

  const isSale = l.listing_type === 'sale'
  const isLand = l.type === 'Land'

  // Already unlocked earlier? Then show the contact straight away.
  useEffect(() => {
    let cancelled = false
    if (!user?.id) { setChecking(false); return }
    supabase.rpc('get_listing_contact', { p_listing_id: l.id }).then(({ data }) => {
      if (cancelled) return
      setContact(data || null)
      setChecking(false)
    })
    return () => { cancelled = true }
  }, [user?.id, l.id])

  const handleUnlock = async () => {
    if (!user?.id) {
      onClose()
      setPage('register')
      return
    }
    setNotice(null)
    setUnlocking(true)
    const { data, error } = await supabase.rpc('unlock_listing', { p_listing_id: l.id })
    setUnlocking(false)

    if (error || !data) {
      setNotice({
        type: 'error',
        message: error?.message?.includes('limit')
          ? 'You have reached the daily unlock limit. Please try again tomorrow.'
          : 'Could not unlock right now. Please try again.',
      })
      return
    }
    setContact(data)
    // The app listens for this to show the Arleece ID offer once per session
    if (data.is_new) window.dispatchEvent(new Event('arleece:unlocked'))
  }

  const goGetId = () => {
    onClose()
    setPage('my-id')
  }

  const renderAction = () => {
    if (contact) {
      return (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 13, padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "#166534", fontSize: "1rem", marginBottom: 14 }}>
            <CheckCircle2 size={18} strokeWidth={2} /> Contact unlocked
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {contact.guide_name && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.92rem", color: "#1e293b" }}>
                <User size={16} strokeWidth={1.8} color="#0d1b5e" style={{ marginTop: 2, flexShrink: 0 }} />
                <span><strong>Home Guide:</strong> {contact.guide_name}</span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.92rem", color: "#1e293b" }}>
              <Phone size={16} strokeWidth={1.8} color="#0d1b5e" style={{ marginTop: 2, flexShrink: 0 }} />
              <span><strong>Phone:</strong>{" "}
                {contact.phone ? (
                  <a href={`tel:${contact.phone}`} style={{ color: "#0d1b5e", fontWeight: 600, textDecoration: "underline" }}>
                    {contact.phone}
                  </a>
                ) : "Not provided"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.92rem", color: "#1e293b" }}>
              <MapPin size={16} strokeWidth={1.8} color="#0d1b5e" style={{ marginTop: 2, flexShrink: 0 }} />
              <span><strong>Address:</strong> {contact.address || `${l.area}, ${l.state}`}</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.92rem", color: "#1e293b" }}>
              <Tag size={16} strokeWidth={1.8} color="#0d1b5e" style={{ marginTop: 2, flexShrink: 0 }} />
              <span><strong>Price:</strong> ₦{l.price?.toLocaleString()}{isSale ? "" : "/year"}</span>
            </div>
          </div>

          <div style={{
            display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between",
            background: "#eef2ff", border: "1px solid #c7d4fd",
            borderRadius: 10, padding: "12px 14px", marginTop: 16,
          }}>
            <span style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: "0.8rem", color: "#1e3db5", lineHeight: 1.55 }}>
              <BadgePercent size={16} strokeWidth={1.8} style={{ marginTop: 2, flexShrink: 0 }} />
              Moving soon? Get 30% off your move with an Arleece ID.
            </span>
            <button
              onClick={goGetId}
              style={{
                background: "#0d1b5e", color: "#fff", border: "none", borderRadius: 8,
                padding: "8px 12px", fontSize: "0.76rem", fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
              }}
            >
              Get my ID
            </button>
          </div>
        </div>
      )
    }

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

    if (checking) {
      return (
        <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.84rem", padding: "18px 0" }}>
          Checking…
        </div>
      )
    }

    return (
      <div style={{ background: "linear-gradient(135deg,#f0f3ff,#eaefff)", border: "1px solid #c7d4fd", borderRadius: 13, padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "0.96rem", marginBottom: 3 }}>
              Unlock your Home Guide's contact
            </div>
            <div style={{ color: "#6b7280", fontSize: "0.79rem", lineHeight: 1.5 }}>
              Free for every signed-in user. You get the phone number and the home address.
            </div>
          </div>
          <Btn onClick={handleUnlock} disabled={unlocking}>
            <Unlock size={14} /> {unlocking ? "Unlocking…" : user ? "Unlock contact (free)" : "Sign up to unlock"}
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
