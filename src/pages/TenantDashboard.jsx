import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Phone, MapPin, Tag, User, Lock, Home, KeyRound, BadgePercent } from 'lucide-react'

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

export default function TenantDashboard({ user, setPage }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState("")
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    const load = async () => {
      setLoading(true)
      setErr("")
      try {
        const { data: contacts, error } = await supabase.rpc('my_unlocked_contacts')
        if (error) { setErr("Could not load your unlocked contacts. Please try again."); setLoading(false); return }

        const ids = (contacts || []).map(c => c.listing_id)
        let listingRows = []
        if (ids.length) {
          const { data } = await supabase
            .from('listings')
            .select('id, title, area, state, price, images, listing_type')
            .in('id', ids)
          listingRows = data || []
        }
        setRows((contacts || []).map(c => ({
          ...c,
          listing: listingRows.find(l => l.id === c.listing_id) || null,
        })))

        const { data: idRows } = await supabase
          .from('arleece_ids')
          .select('id_code, expires_at')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gt('expires_at', new Date().toISOString())
          .limit(1)
        setActiveId(idRows?.[0] || null)
      } catch {
        setErr("Something went wrong. Please refresh the page.")
      }
      setLoading(false)
    }
    load()
  }, [user?.id])

  if (!user) return (
    <div style={{
      minHeight: "100vh", background: "#f4f3ef",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, flexDirection: "column", gap: 16,
    }}>
      <Lock size={40} strokeWidth={1.5} color="#0d1b5e" />
      <h2 style={{ fontFamily: "'DM Serif Display',serif", color: "#0d1b5e", fontSize: "1.4rem", textAlign: "center" }}>
        Sign in to view your unlocked contacts
      </h2>
      <button
        onClick={() => setPage('login')}
        style={{
          background: "#0d1b5e", color: "#fff", border: "none", borderRadius: 9,
          padding: "12px 32px", cursor: "pointer", fontSize: "0.9rem",
          fontWeight: 600, fontFamily: "inherit",
        }}
      >
        Sign In
      </button>
    </div>
  )

  return (
    <div style={{ background: "#f4f3ef", minHeight: "100vh", paddingBottom: 80 }}>
      <div style={{ background: "linear-gradient(135deg,#060e33,#0d1b5e)", padding: "36px 20px 28px" }}>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", color: "#fff", fontSize: "1.7rem", marginBottom: 6 }}>
          My Unlocked Contacts
        </h1>
        <p style={{ color: "rgba(255,255,255,.6)", fontSize: "0.85rem" }}>
          {rows.length} Home Guide contact{rows.length !== 1 ? "s" : ""} unlocked
        </p>
      </div>

      <div style={{ padding: "20px 16px" }}>

        {/* ARLEECE ID BANNER */}
        <div style={{
          background: "#fff", border: "1px solid #e8e8e0", borderRadius: 14,
          padding: "14px 16px", marginBottom: 16,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
            {activeId
              ? <KeyRound size={20} color="#166534" style={{ flexShrink: 0 }} />
              : <BadgePercent size={20} color="#0d1b5e" style={{ flexShrink: 0 }} />}
            <div style={{ minWidth: 0 }}>
              {activeId ? (
                <>
                  <div style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 700, letterSpacing: "0.06em" }}>YOUR ARLEECE ID</div>
                  <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, color: "#0d1b5e", fontSize: "1.05rem", letterSpacing: "0.08em" }}>
                    {activeId.id_code}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: "0.82rem", color: "#4b5563", lineHeight: 1.5 }}>
                  Get an Arleece ID for 30% off your move.
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setPage('my-id')}
            style={{
              background: "#0d1b5e", color: "#fff", border: "none", borderRadius: 8,
              padding: "9px 14px", fontSize: "0.78rem", fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
            }}
          >
            {activeId ? "Open" : "Get my ID"}
          </button>
        </div>

        {err && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10,
            padding: "12px 16px", color: "#991b1b", fontSize: "0.84rem", marginBottom: 16,
          }}>
            {err}
          </div>
        )}

        {loading && <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>Loading your contacts…</div>}

        {!loading && rows.length === 0 && !err && (
          <div style={{
            background: "#fff", borderRadius: 16, padding: "40px 24px",
            textAlign: "center", border: "1px solid #e8e8e0",
          }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <Home size={40} strokeWidth={1.4} color="#0d1b5e" />
            </div>
            <h3 style={{ fontFamily: "'DM Serif Display',serif", color: "#0d1b5e", fontSize: "1.2rem", marginBottom: 8 }}>
              No unlocked contacts yet
            </h3>
            <p style={{ color: "#6b7280", fontSize: "0.85rem", marginBottom: 20 }}>
              Browse apartments and unlock a Home Guide's contact for free.
            </p>
            <button
              onClick={() => setPage('browse')}
              style={{
                background: "#0d1b5e", color: "#fff", border: "none", borderRadius: 9,
                padding: "12px 24px", cursor: "pointer", fontSize: "0.9rem",
                fontWeight: 600, fontFamily: "inherit",
              }}
            >
              Browse Apartments
            </button>
          </div>
        )}

        {!loading && rows.map(r => {
          const l = r.listing
          const sale = l?.listing_type === 'sale'
          return (
            <div key={r.listing_id} style={{
              background: "#fff", borderRadius: 16, overflow: "hidden",
              border: "1px solid #e8e8e0", boxShadow: "0 2px 6px rgba(0,0,0,.04)", marginBottom: 16,
            }}>
              {l?.images?.[0] && (
                <img src={l.images[0]} alt={l.title} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
              )}
              <div style={{ padding: 16 }}>
                <h3 style={{ fontFamily: "'DM Serif Display',serif", color: "#0d1b5e", fontSize: "1.1rem", marginBottom: 4 }}>
                  {l?.title || "Apartment"}
                </h3>
                {l?.area && (
                  <p style={{ color: "#6b7280", fontSize: "0.78rem", marginBottom: 14, display: "flex", alignItems: "center", gap: 5 }}>
                    <MapPin size={13} /> {l.area}, {l.state}
                  </p>
                )}
{r.apt_code && (
  <div style={{
    background: "#0d1b5e", color: "#fff", borderRadius: 12,
    padding: "12px 16px", marginBottom: 12,
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
  }}>
    <div>
      <div style={{ fontSize: "0.64rem", fontWeight: 700, letterSpacing: "0.1em", color: "#9db7ff", marginBottom: 4 }}>
        APARTMENT CODE
      </div>
      <div style={{ fontFamily: "'Courier New', monospace", fontSize: "1.25rem", fontWeight: 700, letterSpacing: "0.1em" }}>
        {r.apt_code}
      </div>
    </div>
    <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,.72)", maxWidth: 130, lineHeight: 1.5, textAlign: "right" }}>
      Show this to your Home Guide before the inspection.
    </div>
  </div>
)}
      
                
                <div style={{ background: "#f0f7ff", border: "1px solid #c7d4fd", borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#1e3db5", letterSpacing: "0.08em", marginBottom: 12 }}>
                    VERIFIED HOME GUIDE CONTACT
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {r.guide_name && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <User size={18} strokeWidth={1.7} color="#0d1b5e" />
                        <div>
                          <div style={{ fontSize: "0.68rem", color: "#9ca3af", marginBottom: 2 }}>HOME GUIDE</div>
                          <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0d1b5e" }}>{r.guide_name}</div>
                        </div>
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Phone size={18} strokeWidth={1.7} color="#0d1b5e" />
                      <div>
                        <div style={{ fontSize: "0.68rem", color: "#9ca3af", marginBottom: 2 }}>PHONE NUMBER</div>
                        {r.phone ? (
                          <a href={`tel:${r.phone}`} style={{ fontSize: "1rem", fontWeight: 700, color: "#1e3db5", textDecoration: "none" }}>
                            {r.phone}
                          </a>
                        ) : (
                          <span style={{ fontSize: "0.85rem", color: "#b91c1c", fontWeight: 600 }}>Not provided</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <MapPin size={18} strokeWidth={1.7} color="#0d1b5e" style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: "0.68rem", color: "#9ca3af", marginBottom: 2 }}>HOME ADDRESS</div>
                        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#0d1b5e" }}>
                          {r.address || (l ? `${l.area}, ${l.state}` : "Not provided")}
                        </div>
                      </div>
                    </div>
                    {l?.price && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Tag size={18} strokeWidth={1.7} color="#0d1b5e" />
                        <div>
                          <div style={{ fontSize: "0.68rem", color: "#9ca3af", marginBottom: 2 }}>
                            {sale ? "PRICE" : "ANNUAL RENT"}
                          </div>
                          <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0d1b5e" }}>
                            ₦{l.price.toLocaleString()}{sale ? "" : "/year"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: "0.72rem", color: "#9ca3af", textAlign: "right" }}>
                  Unlocked {fmtDate(r.unlocked_at)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
