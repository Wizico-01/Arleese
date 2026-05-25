import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Card, Badge } from '../components/UI'
import { Ic, I } from '../components/Icons'

export default function TenantDashboard({ user, setPage }) {
  const [unlocks, setUnlocks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUnlocks = async () => {
      if (!user?.id) return
      setLoading(true)
      
      try {
        // ✅ FIXED: Deep relational select to pull listing data AND landlord profile contacts seamlessly
        const { data, error } = await supabase
          .from('unlocks')
          .select(`
            id,
            created_at,
            listing_id,
            listings (
              id, title, area, state, price,
              beds, baths, size, images, type, landlord_id,
              profiles:landlord_id (
                full_name,
                phone
              )
            )
          `)
          .eq('tenant_id', user.id)
          // Using created_at fallback to prevent ordering bugs
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching unlocks:', error)
        } else if (data) {
          setUnlocks(data)
        }
      } catch (err) {
        console.error('Unexpected error:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUnlocks()
  }, [user])

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

      <div style={{ padding: "20px 16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
            Loading your history...
          </div>
        ) : unlocks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔍</div>
            <p style={{ fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              No unlocked contacts yet
            </p>
            <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
              Browse apartments and pay ₦200 to unlock a landlord's contact
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {unlocks.map(u => {
              // Extract the nested profiles metadata smoothly safely
              const listing = u.listings
              const landlordProfile = listing?.profiles

              // Fallback calculations if custom data is pending sync mapping
              const landlordName = landlordProfile?.full_name || "Verified Landlord"
              const landlordPhone = landlordProfile?.phone || "No phone listed"
              const displayPrice = listing?.price ? listing.price.toLocaleString() : "0"

              return (
                <Card key={u.id} style={{ overflow: "hidden" }}>
                  {/* APARTMENT IMAGE */}
                  {listing?.images?.[0] && (
                    <img
                      src={listing.images[0]}
                      alt={listing?.title}
                      style={{ width: "100%", height: 160, objectFit: "cover" }}
                    />
                  )}
                  <div style={{ padding: "14px 16px" }}>
                    <h3 style={{
                      fontFamily: "'DM Serif Display',serif",
                      fontSize: "1rem", color: "#0d1b5e", marginBottom: 4,
                    }}>
                      {listing?.title || "Apartment Listing"}
                    </h3>
                    <div style={{
                      display: "flex", gap: 4,
                      color: "#6b7280", fontSize: "0.76rem",
                      alignItems: "center", marginBottom: 10,
                    }}>
                      <Ic d={I.pin} s={12} />
                      {listing?.area || "N/A"}, {listing?.state || ""}
                    </div>

                    {/* LANDLORD CONTACT CONTAINER */}
                    <div style={{
                      background: "#f0f4ff",
                      borderRadius: 10,
                      padding: "12px 14px",
                      marginBottom: 10,
                    }}>
                      <p style={{
                        fontSize: "0.7rem", fontWeight: 700,
                        color: "#9ca3af", letterSpacing: "0.05em",
                        marginBottom: 6,
                      }}>
                        LANDLORD CONTACT
                      </p>
                      <div style={{
                        fontSize: "0.88rem", fontWeight: 600,
                        color: "#0d1b5e", display: "flex",
                        flexDirection: "column", gap: 4,
                      }}>
                        {/* ✅ TRIGGER DEEP TELEPHONE CALL LINK DIRECTLY */}
                        <a href={`tel:${landlordPhone}`} style={{ textDecoration: "none", color: "#0d1b5e", display: "flex", alignItems: "center", gap: 6 }}>
                          📞 {landlordPhone}
                        </a>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          👤 {landlordName}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "#4b5563", fontWeight: 400 }}>
                          💰 ₦{displayPrice}/year
                        </span>
                      </div>
                    </div>

                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <Badge color="#166534" bg="#dcfce7">
                        ✅ Access Unlocked
                      </Badge>
                      <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>
                        {new Date(u.created_at || Date.now()).toLocaleDateString('en-NG', {
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