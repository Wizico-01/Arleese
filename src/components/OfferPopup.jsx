import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { KeyRound, Unlock, BadgePercent } from 'lucide-react'

export default function OfferPopup({ context, onGetId, onSkip }) {
  const [price, setPrice] = useState(200)

  useEffect(() => {
    supabase.rpc('public_config').then(({ data }) => {
      if (data?.id_price_kobo) setPrice(Math.round(data.id_price_kobo / 100))
    })
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onSkip() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onSkip])

  return (
    <div
      onClick={onSkip}
      style={{
        position: "fixed", inset: 0, zIndex: 1200,
        background: "rgba(0,0,0,.62)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20, width: "100%", maxWidth: 400,
          padding: "30px 24px 22px", textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,.35)",
        }}
      >
        <div style={{
          width: 60, height: 60, borderRadius: "50%", background: "#0d1b5e",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
        }}>
          <KeyRound size={28} color="#fff" strokeWidth={1.8} />
        </div>

        <h2 style={{
          fontFamily: "'DM Serif Display',serif", color: "#0d1b5e",
          fontSize: "1.45rem", marginBottom: 8, lineHeight: 1.25,
        }}>
          {context === 'unlock' ? "Moving soon?" : "Welcome to Arleece"}
        </h2>
        <p style={{ color: "#6b7280", fontSize: "0.86rem", lineHeight: 1.7, marginBottom: 18 }}>
          Get 30% off your move with your Arleece ID.
        </p>

        <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
          {[
            { icon: <Unlock size={18} color="#0d1b5e" />, text: "Unlocking Home Guide contacts and addresses is free." },
            { icon: <KeyRound size={18} color="#0d1b5e" />, text: `One-time ₦${price} gives you a unique Arleece ID.` },
            { icon: <BadgePercent size={18} color="#0d1b5e" />, text: "Show your ID to our logistics partner for 30% off moving." },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: "0.84rem", color: "#374151", lineHeight: 1.55 }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}>{r.icon}</span>
              {r.text}
            </div>
          ))}
        </div>

        <button
          onClick={onGetId}
          style={{
            width: "100%", background: "#0d1b5e", color: "#fff", border: "none",
            borderRadius: 11, padding: "14px 0", fontSize: "0.95rem",
            fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: 10,
          }}
        >
          Get my ID
        </button>
        <button
          onClick={onSkip}
          style={{
            width: "100%", background: "none", color: "#6b7280", border: "none",
            padding: "10px 0", fontSize: "0.86rem", fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}