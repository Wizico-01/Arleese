import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Card, Badge } from '../components/UI'
import { Ic, I } from '../components/Icons'

export default function TenantDashboard({ user, setPage }) {
  const [unlocks, setUnlocks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    fetchUnlocks()
  }, [user?.id])

  const fetchUnlocks = async () => {
    setLoading(true)
    try {
      // Clean single network call replacing the former multi-step state mapping
      const { data, error } = await supabase
        .from('unlocks')
        .select(`
          id,
          amount,
          payment_method,
          paid_at,
          listings (
            id,
            title,
            area,
            state,
            price,
            images,
            landlord_phone,
            landlord_address,
            profiles!inner (
              full_name,
              phone
            )
          )
        `)
        .eq('tenant_id', user.id)
        .order('paid_at', { ascending: false })

      if (error) {
        console.error('Fetch error:', error.message)
      }
      if (data) setUnlocks(data)
    } catch (e) {
      console.error('Dashboard query catch:', e)
    }
    setLoading(false)
  }

  if (!user) return (
    <div style={{
      minHeight: "100vh", background: "#f4f3ef",
      display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24,
      flexDirection: "column", gap: 16,
    }}>
      <div style={{ fontSize: "3rem" }}>🔒</div>
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
        padding: "34px 20px 26px",
      }}>
        <h1 style={{
          fontFamily: "'DM Serif Display',serif",
          color: "#fff", fontSize: "1.5rem", marginBottom: 5,
        }}>
          My Unlocked Contacts
        </h1>
        <p style={{ color: "rgba(255,255,255,.6)", fontSize: "0.83rem" }}>
          All landlord contacts you have paid to unlock
        </p>
      </div>

      {/* CONTENT AREA */}
      <div style={{ padding: "20px 16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
            Loading your unlocked history...
          </div>
        ) : unlocks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔍</div>
            <p style={{ fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              No unlocked contacts yet
            </p>
            <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
              Browse apartments and pay ₦200 to unlock a landlord's contact instantly.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {unlocks.map(u => {
              const listing = u.listings
              
              // Fallback logic resolving explicit over profile records safely
              const phone = listing?.landlord_phone || listing?.profiles?.phone || null
              const address = listing?.landlord_address || `${listing?.area || 'N/A'}, ${listing?.state || ''}`
              const landlordName = listing?.profiles?.full_name || "Verified Landlord"
              const displayPrice = listing?.price ? listing.price.toLocaleString() : "0"

              return (
                <Card key={u.id} style={{ overflow: "hidden", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff" }}>
                  {/* IMAGE */}
                  {listing?.images?.[0] && (
                    <img
                      src={listing.images[0]}
                      alt={listing?.title}
                      style={{ width: "100%", height: 170, objectFit: "cover" }}
                    />
                  )}
                  
                  <div style={{ padding: "16px" }}>
                    <h3 style={{
                      fontFamily: "'DM Serif Display',serif",
                      fontSize: "1.1rem", color: "#0d1b5e", marginBottom: 4,
                    }}>
                      {listing?.title || "Apartment Unit"}
                    </h3>
                    
                    <div style={{
                      display: "flex", gap: 4,
                      color: "#6b7280", fontSize: "0.78rem",
                      alignItems: "center", marginBottom: 12,
                    }}>
                      <Ic d={I.pin} s={12} />
                      {listing?.area || "N/A"}, {listing?.state || ""}
                    </div>

                    {/* LANDLORD SPECIFICS BOX */}
                    <div style={{
                      background: "#f0f4ff",
                      borderRadius: 10,
                      padding: "14px",
                      marginBottom: 12,
                      border: "1px solid #dbeafe"
                    }}>
                      <p style={{
                        fontSize: "0.68rem", fontWeight: 700,
                        color: "#3b82f6", letterSpacing: "0.06em",
                        marginBottom: 8,
                      }}>
                        VERIFIED LANDLORD CONTACT
                      </p>
                      
                      <div style={{
                        fontSize: "0.9rem", fontWeight: 600,
                        color: "#0d1b5e", display: "flex",
                        flexDirection: "column", gap: 6,
                      }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          👤 Name: <span style={{ color: "#1e293b", fontWeight: 700 }}>{landlordName}</span>
                        </span>
                        
                        {phone ? (
                          <a href={`tel:${phone}`} style={{ textDecoration: "none", color: "#0d1b5e", display: "flex", alignItems: "center", gap: 6 }}>
                            📞 Phone: <span style={{ color: "#2563eb", textDecoration: "underline", fontWeight: 700 }}>{phone}</span>
                          </a>
                        ) : (
                          <span style={{ color: "#b91c1c", fontSize: "0.85rem" }}>📞 Phone: No contact listed</span>
                        )}
                        
                        <span style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: "0.85rem", color: "#4b5563", fontWeight: 400 }}>
                          📍 Address: <span style={{ color: "#0d1b5e", fontWeight: 600 }}>{address}</span>
                        </span>

                        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", color: "#4b5563", fontWeight: 400, marginTop: 4 }}>
                          💰 Price: ₦{displayPrice}/year
                        </span>
                      </div>
                    </div>

                    {/* STATUS AND TIME BADGES */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid #f3f4f6",
                      paddingTop: 12
                    }}>
                      <Badge color="#166534" bg="#dcfce7">
                        ✅ Paid ₦{(u.amount || 200).toLocaleString()}
                      </Badge>
                      <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>
                        {new Date(u.paid_at || u.created_at || Date.now()).toLocaleDateString('en-NG', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}