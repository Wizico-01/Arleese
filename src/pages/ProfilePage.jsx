import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Card, Badge } from '../components/UI'
import { Ic, I } from '../components/Icons'

export default function ProfilePage({ user, setPage, logout }) {
  const [unlocks, setUnlocks] = useState([])
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }

    const fetchData = async () => {
      setLoading(true)
      try {
        if (user.role === 'tenant') {
          const { data, error } = await supabase
            .from('unlocks')
            .select(`
              id,
              amount,
              payment_method,
              paid_at,
              listing_id,
              listings (
                id, title, area, state, price, images
              )
            `)
            .eq('tenant_id', user.id)
            .order('paid_at', { ascending: false })

          if (error) console.log('Unlocks fetch error:', error)
          if (data) setUnlocks(data)
        }

        if (user.role === 'landlord') {
          const { data, error } = await supabase
            .from('listings')
            .select('*')
            .eq('landlord_id', user.id)
            .order('created_at', { ascending: false })

          if (error) console.log('Listings fetch error:', error)
          if (data) setListings(data)
        }
      } catch (e) {
        console.log('Profile fetch error:', e)
      }
      setLoading(false)
    }

    fetchData()
  }, [user])

  if (!user) return (
    <div style={{
      minHeight: "100vh", background: "#f4f3ef",
      display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24,
      flexDirection: "column", gap: 16,
    }}>
      <div style={{ fontSize: "3rem" }}>👤</div>
      <h2 style={{
        fontFamily: "'DM Serif Display',serif",
        color: "#0d1b5e", fontSize: "1.5rem",
      }}>
        You are not logged in
      </h2>
      <p style={{ color: "#6b7280", fontSize: "0.87rem", textAlign: "center" }}>
        Create an account or sign in to view your profile
      </p>
      <button onClick={() => setPage('login')} style={{
        background: "#0d1b5e", color: "#fff", border: "none",
        borderRadius: 9, padding: "12px 32px", cursor: "pointer",
        fontSize: "0.9rem", fontWeight: 600, fontFamily: "inherit",
      }}>
        Sign In
      </button>
      <button onClick={() => setPage('register')} style={{
        background: "none", color: "#0d1b5e",
        border: "1.5px solid #0d1b5e", borderRadius: 9,
        padding: "12px 32px", cursor: "pointer",
        fontSize: "0.9rem", fontWeight: 600, fontFamily: "inherit",
      }}>
        Create Account
      </button>
    </div>
  )

  return (
    <div style={{ background: "#f4f3ef", minHeight: "100vh", paddingBottom: 80 }}>

      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg,#060e33,#0d1b5e)",
        padding: "40px 20px 30px", textAlign: "center",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "#fff", color: "#0d1b5e",
          display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "1.8rem",
          fontWeight: 700, margin: "0 auto 14px",
        }}>
          {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
        </div>
        <h2 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, marginBottom: 4 }}>
          {user.name || "User"}
        </h2>
        <p style={{ color: "rgba(255,255,255,.6)", fontSize: "0.82rem" }}>
          {user.email}
        </p>
        <div style={{ marginTop: 10 }}>
          <Badge
            color={user.role === 'landlord' ? "#fde047" : "#7eb3ff"}
            bg="rgba(255,255,255,.1)"
          >
            {user.role === 'landlord' ? '🏠 Landlord' : '🔍 Tenant'}
          </Badge>
        </div>
      </div>

      <div style={{ padding: "20px 16px" }}>

        {loading && (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af" }}>
            Loading...
          </div>
        )}

        {/* TENANT VIEW */}
        {!loading && user.role === 'tenant' && (
          <div>
            <h3 style={{
              fontWeight: 700, color: "#0d1b5e",
              fontSize: "1rem", marginBottom: 14,
            }}>
              My Unlocked Contacts ({unlocks.length})
            </h3>

            {unlocks.length === 0 ? (
              <Card style={{ padding: 28, textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: 10 }}>🔒</div>
                <p style={{ color: "#6b7280", fontSize: "0.85rem", marginBottom: 16 }}>
                  You have not unlocked any landlord contacts yet.
                </p>
                <button onClick={() => setPage('browse')} style={{
                  background: "#0d1b5e", color: "#fff", border: "none",
                  borderRadius: 8, padding: "10px 20px", cursor: "pointer",
                  fontSize: "0.85rem", fontWeight: 600, fontFamily: "inherit",
                }}>
                  Browse Apartments
                </button>
              </Card>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {unlocks.map(u => (
                  <Card key={u.id} style={{ overflow: "hidden" }}>
                    {u.listings?.images?.[0] && (
                      <img
                        src={u.listings.images[0]}
                        alt={u.listings?.title}
                        style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }}
                      />
                    )}
                    <div style={{ padding: "12px 14px" }}>
                      <h4 style={{
                        fontFamily: "'DM Serif Display',serif",
                        color: "#0d1b5e", fontSize: "0.95rem", marginBottom: 4,
                      }}>
                        {u.listings?.title || "Apartment"}
                      </h4>
                      <p style={{ color: "#6b7280", fontSize: "0.78rem", marginBottom: 10 }}>
                        📍 {u.listings?.area}, {u.listings?.state}
                      </p>

                      {/* LANDLORD CONTACT DETAILS */}
                      <div style={{
                        background: "#f0f7ff",
                        borderRadius: 10, padding: "12px 14px",
                        marginBottom: 10,
                      }}>
                        <p style={{
                          fontSize: "0.7rem", fontWeight: 700,
                          color: "#9ca3af", letterSpacing: "0.06em",
                          marginBottom: 8,
                        }}>
                          LANDLORD CONTACT
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <span style={{ fontSize: "0.86rem", color: "#0d1b5e", fontWeight: 600 }}>
                            📞 {u.landlord_phone || "Contact saved — check your email"}
                          </span>
                          <span style={{ fontSize: "0.86rem", color: "#0d1b5e" }}>
                            📍 {u.listings?.area}, {u.listings?.state}
                          </span>
                        </div>
                      </div>

                      <div style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center",
                      }}>
                        <Badge color="#166534" bg="#dcfce7">
                          ✅ Paid ₦{u.amount?.toLocaleString()}
                        </Badge>
                        <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>
                          {new Date(u.paid_at).toLocaleDateString('en-NG', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LANDLORD VIEW */}
        {!loading && user.role === 'landlord' && (
          <div>
            <Card style={{ padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>
                  Verification Status
                </span>
                <Badge
                  color={user.verified ? "#166534" : "#92400e"}
                  bg={user.verified ? "#dcfce7" : "#fef3c7"}
                >
                  {user.verified ? "✅ Verified" : "⏳ Pending"}
                </Badge>
              </div>
            </Card>

            <h3 style={{
              fontWeight: 700, color: "#0d1b5e",
              fontSize: "1rem", marginBottom: 14,
            }}>
              My Listed Properties ({listings.length})
            </h3>

            {listings.length === 0 ? (
              <Card style={{ padding: 28, textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: 10 }}>🏠</div>
                <p style={{ color: "#6b7280", fontSize: "0.85rem", marginBottom: 16 }}>
                  You have not listed any properties yet.
                </p>
                <button onClick={() => setPage('dashboard')} style={{
                  background: "#0d1b5e", color: "#fff", border: "none",
                  borderRadius: 8, padding: "10px 20px", cursor: "pointer",
                  fontSize: "0.85rem", fontWeight: 600, fontFamily: "inherit",
                }}>
                  Go to Dashboard
                </button>
              </Card>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {listings.map(l => (
                  <Card key={l.id} style={{ overflow: "hidden" }}>
                    {l.images?.[0] && (
                      <img
                        src={l.images[0]}
                        alt={l.title}
                        style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }}
                      />
                    )}
                    <div style={{ padding: "12px 14px" }}>
                      <h4 style={{
                        fontFamily: "'DM Serif Display',serif",
                        color: "#0d1b5e", fontSize: "0.95rem", marginBottom: 4,
                      }}>
                        {l.title}
                      </h4>
                      <p style={{ color: "#6b7280", fontSize: "0.78rem", marginBottom: 8 }}>
                        📍 {l.area}, {l.state}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "0.9rem" }}>
                          ₦{l.price?.toLocaleString()}/yr
                        </span>
                        <Badge
                          color={l.status === 'active' ? "#166534" : "#92400e"}
                          bg={l.status === 'active' ? "#dcfce7" : "#fef3c7"}
                        >
                          {l.status === 'active' ? '● Active' : '🔑 Rented'}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SIGN OUT */}
        <button
          onClick={logout}
          style={{
            width: "100%", marginTop: 28,
            background: "#fff", color: "#b91c1c",
            border: "1.5px solid #fca5a5",
            borderRadius: 10, padding: "13px 0",
            cursor: "pointer", fontSize: "0.9rem",
            fontWeight: 600, fontFamily: "inherit",
            display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8,
          }}
        >
          <Ic d={I.logout} s={16} stroke="#b91c1c" />
          Sign Out
        </button>
      </div>
    </div>
  )
}