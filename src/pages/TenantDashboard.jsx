import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  Phone, MapPin, Tag, User, Copy, Check, Lock, Home, Truck, LifeBuoy,
} from 'lucide-react'

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

const idState = (u) => {
  if (u.status === 'redeemed') return 'used'
  if (u.expires_at && new Date(u.expires_at) < new Date()) return 'expired'
  return 'active'
}

export default function TenantDashboard({ user, setPage }) {
  const [unlocks, setUnlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState("")
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    fetchUnlocks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchUnlocks = async () => {
    setLoading(true)
    setErr("")
    try {
      const { data: unlockRows, error: unlockError } = await supabase
        .from('unlocks')
        .select('id, amount, paid_at, listing_id, code, status, expires_at, redeemed_at')
        .eq('tenant_id', user.id)
        .order('paid_at', { ascending: false })

      if (unlockError) {
        setErr("Could not load your unlocked contacts. Please try again.")
        setLoading(false)
        return
      }

      if (!unlockRows || unlockRows.length === 0) {
        setUnlocks([])
        setLoading(false)
        return
      }

      const listingIds = unlockRows.map(u => u.listing_id).filter(Boolean)
      const { data: listingRows } = await supabase
        .from('listings')
        .select('id, title, area, state, price, images, landlord_phone, landlord_address, landlord_id, listing_type')
        .in('id', listingIds)

      const guideIds = (listingRows || []).map(l => l.landlord_id).filter(Boolean)
      let profileRows = []
      if (guideIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, phone')
          .in('id', guideIds)
        profileRows = profiles || []
      }

      const combined = unlockRows.map(u => {
        const listing = (listingRows || []).find(l => l.id === u.listing_id) || null
        const profile = profileRows.find(p => p.id === listing?.landlord_id) || null
        return { ...u, listing, profile }
      })

      setUnlocks(combined)
    } catch (e) {
      setErr("Something went wrong. Please refresh the page.")
    }
    setLoading(false)
  }

  const copyCode = async (u) => {
    try {
      await navigator.clipboard.writeText(u.code)
      setCopiedId(u.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch { /* ignore */ }
  }

  if (!user) return (
    <div style={{
      minHeight: "100vh", background: "#f4f3ef",
      display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24,
      flexDirection: "column", gap: 16,
    }}>
      <Lock size={40} strokeWidth={1.5} color="#0d1b5e" />
      <h2 style={{
        fontFamily: "'DM Serif Display',serif",
        color: "#0d1b5e", fontSize: "1.4rem", textAlign: "center",
      }}>
        Sign in to view your unlocked contacts
      </h2>
      <button
        onClick={() => setPage('login')}
        style={{
          background: "#0d1b5e", color: "#fff", border: "none",
          borderRadius: 9, padding: "12px 32px", cursor: "pointer",
          fontSize: "0.9rem", fontWeight: 600, fontFamily: "inherit",
        }}
      >
        Sign In
      </button>
    </div>
  )

  return (
    <div style={{ background: "#f4f3ef", minHeight: "100vh", paddingBottom: 80 }}>

      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg,#060e33,#0d1b5e)",
        padding: "36px 20px 28px",
      }}>
        <h1 style={{
          fontFamily: "'DM Serif Display',serif",
          color: "#fff", fontSize: "1.7rem", marginBottom: 6,
        }}>
          My Unlocked Contacts
        </h1>
        <p style={{ color: "rgba(255,255,255,.6)", fontSize: "0.85rem" }}>
          {unlocks.length} Home Guide contact{unlocks.length !== 1 ? "s" : ""} unlocked
        </p>
      </div>

      <div style={{ padding: "20px 16px" }}>

        {err && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fca5a5",
            borderRadius: 10, padding: "12px 16px",
            color: "#991b1b", fontSize: "0.84rem", marginBottom: 16,
          }}>
            {err}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
            Loading your contacts…
          </div>
        )}

<div style={{
  background: "#fff", border: "1px solid #e8e8e0", borderRadius: 12,
  padding: "12px 14px", marginBottom: 16,
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
}}>
  <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#4b5563", fontSize: "0.8rem", lineHeight: 1.5 }}>
    <LifeBuoy size={16} color="#0d1b5e" style={{ flexShrink: 0 }} />
    Paid but your contact is missing?
  </span>
  <button
    onClick={() => setPage('unlock-help')}
    style={{
      background: "#0d1b5e", color: "#fff", border: "none", borderRadius: 8,
      padding: "8px 14px", fontSize: "0.78rem", fontWeight: 600,
      cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
    }}
  >
    Contact us
  </button>
</div>
        {!loading && unlocks.length === 0 && !err && (
          <div style={{
            background: "#fff", borderRadius: 16, padding: "40px 24px",
            textAlign: "center", border: "1px solid #e8e8e0",
          }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <Home size={40} strokeWidth={1.4} color="#0d1b5e" />
            </div>
            <h3 style={{
              fontFamily: "'DM Serif Display',serif",
              color: "#0d1b5e", fontSize: "1.2rem", marginBottom: 8,
            }}>
              No unlocked contacts yet
            </h3>
            <p style={{ color: "#6b7280", fontSize: "0.85rem", marginBottom: 20 }}>
              Browse apartments and unlock a Home Guide's contact for ₦200.
            </p>
            <button
              onClick={() => setPage('browse')}
              style={{
                background: "#0d1b5e", color: "#fff", border: "none",
                borderRadius: 9, padding: "12px 24px", cursor: "pointer",
                fontSize: "0.9rem", fontWeight: 600, fontFamily: "inherit",
              }}
            >
              Browse Apartments
            </button>
          </div>
        )}

        {!loading && unlocks.map(u => {
          const listing = u.listing
          const profile = u.profile
          const guideName = profile?.full_name || null
          const phone = listing?.landlord_phone || profile?.phone || null
          const areaState = listing?.area && listing?.state
            ? `${listing.area}, ${listing.state}`
            : null
          const address = listing?.landlord_address || areaState || "Address not provided"
          const st = idState(u)
          const sale = listing?.listing_type === 'sale'

          const chip = {
            active: { bg: "#dcfce7", color: "#166534", text: `Valid until ${fmtDate(u.expires_at)}` },
            used: { bg: "#e5e7eb", color: "#374151", text: `Discount used on ${fmtDate(u.redeemed_at)}` },
            expired: { bg: "#fee2e2", color: "#991b1b", text: `Expired on ${fmtDate(u.expires_at)}` },
          }[st]

          return (
            <div key={u.id} style={{
              background: "#fff", borderRadius: 16,
              overflow: "hidden", border: "1px solid #e8e8e0",
              boxShadow: "0 2px 6px rgba(0,0,0,.04)",
              marginBottom: 16,
            }}>
              {listing?.images?.[0] && (
                <img
                  src={listing.images[0]}
                  alt={listing?.title}
                  style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                />
              )}

              <div style={{ padding: 16 }}>
                <h3 style={{
                  fontFamily: "'DM Serif Display',serif",
                  color: "#0d1b5e", fontSize: "1.1rem", marginBottom: 4,
                }}>
                  {listing?.title || "Apartment"}
                </h3>
                {areaState && (
                  <p style={{
                    color: "#6b7280", fontSize: "0.78rem", marginBottom: 14,
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <MapPin size={13} /> {areaState}
                  </p>
                )}

                {/* ARLEECE ID */}
                {u.code && (
                  <div style={{
                    background: "#0d1b5e", borderRadius: 12,
                    padding: "14px 16px", marginBottom: 14, color: "#fff",
                  }}>
                    <div style={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.1em", color: "#9db7ff", marginBottom: 6 }}>
                      YOUR ARLEECE ID
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ fontFamily: "'Courier New', monospace", fontSize: "1.6rem", fontWeight: 700, letterSpacing: "0.12em" }}>
                        {u.code}
                      </div>
                      <button
                        onClick={() => copyCode(u)}
                        style={{
                          background: "rgba(255,255,255,.14)", color: "#fff",
                          border: "1px solid rgba(255,255,255,.3)", borderRadius: 8,
                          padding: "7px 12px", fontSize: "0.78rem", fontWeight: 600,
                          cursor: "pointer", fontFamily: "inherit",
                          display: "flex", alignItems: "center", gap: 6,
                        }}
                      >
                        {copiedId === u.id ? <Check size={14} /> : <Copy size={14} />}
                        {copiedId === u.id ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <div style={{
                      display: "inline-block", marginTop: 10,
                      background: chip.bg, color: chip.color,
                      borderRadius: 6, padding: "3px 10px",
                      fontSize: "0.72rem", fontWeight: 700,
                    }}>
                      {chip.text}
                    </div>
                    <div style={{
                      display: "flex", gap: 8, alignItems: "flex-start",
                      marginTop: 10, fontSize: "0.76rem",
                      color: "rgba(255,255,255,.75)", lineHeight: 1.5,
                    }}>
                      <Truck size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                      Show this ID to the Arleece logistics partner for 30% off your move.
                    </div>
                  </div>
                )}

                {/* HOME GUIDE CONTACT */}
                <div style={{
                  background: "#f0f7ff", border: "1px solid #c7d4fd",
                  borderRadius: 12, padding: "14px 16px", marginBottom: 14,
                }}>
                  <div style={{
                    fontSize: "0.68rem", fontWeight: 700,
                    color: "#1e3db5", letterSpacing: "0.08em", marginBottom: 12,
                  }}>
                    VERIFIED HOME GUIDE CONTACT
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {guideName && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <User size={18} strokeWidth={1.7} color="#0d1b5e" />
                        <div>
                          <div style={{ fontSize: "0.68rem", color: "#9ca3af", marginBottom: 2 }}>HOME GUIDE</div>
                          <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0d1b5e" }}>{guideName}</div>
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Phone size={18} strokeWidth={1.7} color="#0d1b5e" />
                      <div>
                        <div style={{ fontSize: "0.68rem", color: "#9ca3af", marginBottom: 2 }}>PHONE NUMBER</div>
                        {phone ? (
                          <a href={`tel:${phone}`} style={{ fontSize: "1rem", fontWeight: 700, color: "#1e3db5", textDecoration: "none" }}>
                            {phone}
                          </a>
                        ) : (
                          <span style={{ fontSize: "0.85rem", color: "#b91c1c", fontWeight: 600 }}>
                            Not provided. Contact Arleece support
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <MapPin size={18} strokeWidth={1.7} color="#0d1b5e" style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: "0.68rem", color: "#9ca3af", marginBottom: 2 }}>PROPERTY ADDRESS</div>
                        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#0d1b5e" }}>{address}</div>
                      </div>
                    </div>

                    {listing?.price && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Tag size={18} strokeWidth={1.7} color="#0d1b5e" />
                        <div>
                          <div style={{ fontSize: "0.68rem", color: "#9ca3af", marginBottom: 2 }}>
                            {sale ? "PRICE" : "ANNUAL RENT"}
                          </div>
                          <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0d1b5e" }}>
                            ₦{listing.price.toLocaleString()}{sale ? "" : "/year"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{
                    background: "#dcfce7", color: "#166534",
                    borderRadius: 8, padding: "4px 10px",
                    fontSize: "0.76rem", fontWeight: 700,
                  }}>
                    Paid ₦{u.amount?.toLocaleString() || 200}
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>
                    {fmtDate(u.paid_at)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}