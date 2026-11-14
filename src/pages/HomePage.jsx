import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ListingCard from '../components/ListingCard'
import ListingModal from '../components/modals/ListingModal'
import Footer from '../components/Footer'
import {
  Search, UserCheck, Truck, ArrowRight, ShieldCheck,
  MapPin, BadgePercent, KeyRound, Clock,
} from 'lucide-react'

export default function HomePage({ setPage, user }) {
  const [listings, setListings] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const fetchLatest = async () => {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .eq('listing_type', 'rent')
        .order('created_at', { ascending: false })
        .limit(3)
      if (data) setListings(data)
    }
    fetchLatest()
  }, [])

  const dashboardTarget =
  user?.role === 'landlord' ? 'dashboard' :
  user?.role === 'logistics' ? 'logistics' :
  'saved'

  const primaryBtn = {
    background: "#fff", color: "#0d1b5e", border: "none",
    borderRadius: 10, padding: "14px 28px", fontSize: "0.95rem",
    fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
    display: "flex", alignItems: "center",
    justifyContent: "center", gap: 8,
  }

  const secondaryBtn = {
    background: "transparent", color: "#fff",
    border: "1.5px solid rgba(255,255,255,.32)",
    borderRadius: 10, padding: "13px 26px", fontSize: "0.92rem",
    fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
    display: "flex", alignItems: "center",
    justifyContent: "center", gap: 8,
  }

  return (
    <div style={{ background: "#f4f3ef", minHeight: "100vh" }}>

      {/* HERO */}
      <section style={{
        background: "linear-gradient(160deg,#060e33 0%,#0d1b5e 60%,#1a3bdb 100%)",
        padding: "72px 20px 64px",
        textAlign: "center",
        width: "100%",
        overflow: "hidden",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h1 style={{
            fontFamily: "'DM Serif Display',serif",
            fontSize: "clamp(2.2rem, 6.5vw, 3.4rem)",
            color: "#fff",
            lineHeight: 1.15,
            marginBottom: 20,
            fontWeight: 400,
          }}>
            Find Your Next Home.
            <br />
            <em style={{ color: "#7eb3ff" }}>Move in with 30% off.</em>
          </h1>

          <p style={{
            color: "rgba(255,255,255,.72)",
            fontSize: "clamp(0.92rem, 2.5vw, 1.05rem)",
            lineHeight: 1.75,
            maxWidth: 540,
            margin: "0 auto 34px",
          }}>
            Browse available apartments, connect with a verified Arleece
            Home Guide, and enjoy 30% off your move-in logistics.
          </p>

          <div style={{
            display: "flex", flexDirection: "column",
            gap: 12, maxWidth: 340, margin: "0 auto",
          }}>
            <button
              onClick={() => setPage(user ? 'browse' : 'register')}
              style={primaryBtn}
            >
              Browse Apartments <ArrowRight size={16} strokeWidth={2.5} />
            </button>

            {user ? (
              <button onClick={() => setPage(dashboardTarget)} style={secondaryBtn}>
                Go to Dashboard <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            ) : (
              <button onClick={() => setPage('login')} style={secondaryBtn}>
                Sign In
              </button>
            )}
          </div>

          {/* STATS */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 22,
            maxWidth: 440,
            margin: "48px auto 0",
          }}>
            {[
              { icon: <UserCheck size={20} color="#7eb3ff" strokeWidth={1.6} />, val: "Verified", label: "Home Guides" },
              { icon: <MapPin size={20} color="#7eb3ff" strokeWidth={1.6} />, val: "36", label: "States Covered" },
              { icon: <KeyRound size={20} color="#7eb3ff" strokeWidth={1.6} />, val: "₦200", label: "Unlock a Guide's Contact" },
              { icon: <BadgePercent size={20} color="#7eb3ff" strokeWidth={1.6} />, val: "30%", label: "Off Moving Logistics" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
                  {s.icon}
                </div>
                <div style={{
                  fontFamily: "'DM Serif Display',serif",
                  fontSize: "1.7rem", color: "#7eb3ff", lineHeight: 1.1,
                }}>
                  {s.val}
                </div>
                <div style={{ fontSize: "0.74rem", color: "rgba(255,255,255,.55)", marginTop: 4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "64px 20px", background: "#f4f3ef" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "'DM Serif Display',serif",
            fontSize: "2rem", color: "#0d1b5e",
            textAlign: "center", marginBottom: 10,
          }}>
            How Arleece Works
          </h2>
          <p style={{
            textAlign: "center", color: "#6b7280",
            fontSize: "0.9rem", marginBottom: 40,
          }}>
            Three steps from browsing to moving in.
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
            gap: 18,
          }}>
            {[
              {
                step: "01",
                icon: <Search size={28} strokeWidth={1.6} color="#0d1b5e" />,
                title: "Browse apartments",
                desc: "Search available apartments across all 36 states by location, type and price.",
              },
              {
                step: "02",
                icon: <KeyRound size={28} strokeWidth={1.6} color="#0d1b5e" />,
                title: "Unlock your Home Guide's contact",
                desc: "Pay ₦200 to get your Home Guide's phone number and your personal move-in code.",
              },
              {
                step: "03",
                icon: <Truck size={28} strokeWidth={1.6} color="#0d1b5e" />,
                title: "Book your move with 30% off",
                desc: "Use your code after your viewing to claim 30% off your moving logistics.",
              },
            ].map(s => (
              <div key={s.step} style={{
                background: "#fff", borderRadius: 16,
                padding: "26px 22px", border: "1px solid #e8e8e0",
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", marginBottom: 16,
                }}>
                  {s.icon}
                  <span style={{
                    fontSize: "0.72rem", fontWeight: 800,
                    color: "#d1d5db", letterSpacing: "0.08em",
                  }}>
                    {s.step}
                  </span>
                </div>
                <h3 style={{
                  fontWeight: 700, color: "#0d1b5e",
                  fontSize: "1rem", marginBottom: 8,
                }}>
                  {s.title}
                </h3>
                <p style={{ color: "#6b7280", fontSize: "0.83rem", lineHeight: 1.7 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST LISTINGS */}
      {listings.length > 0 && (
        <section style={{ padding: "0 20px 64px", background: "#f4f3ef" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 24,
            }}>
              <h2 style={{
                fontFamily: "'DM Serif Display',serif",
                fontSize: "1.7rem", color: "#0d1b5e",
              }}>
                Latest Apartments
              </h2>
              <button
                onClick={() => setPage(user ? 'browse' : 'register')}
                style={{
                  background: "#fff", color: "#0d1b5e",
                  border: "1.5px solid #0d1b5e", borderRadius: 9,
                  padding: "9px 18px", fontWeight: 600, fontSize: "0.82rem",
                  cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                View All <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(285px,1fr))",
              gap: 20,
              filter: !user ? "blur(4px)" : "none",
              pointerEvents: !user ? "none" : "auto",
              userSelect: !user ? "none" : "auto",
            }}>
              {listings.map(l => (
                <ListingCard key={l.id} listing={l} onClick={() => setSelected(l)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BENEFITS */}
      <section style={{ padding: "0 20px 64px", background: "#f4f3ef" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "'DM Serif Display',serif",
            fontSize: "1.8rem", color: "#0d1b5e",
            textAlign: "center", marginBottom: 32,
          }}>
            Why Tenants Choose Arleece
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
            gap: 16,
          }}>
            {[
              {
                icon: <ShieldCheck size={22} strokeWidth={1.7} color="#0d1b5e" />,
                title: "Verified Home Guides",
                desc: "Every Home Guide on Arleece is checked before they can list.",
              },
              {
                icon: <KeyRound size={22} strokeWidth={1.7} color="#0d1b5e" />,
                title: "Your personal move-in code",
                desc: "Each unlock gives you a unique code tied to your account and that apartment.",
              },
              {
                icon: <BadgePercent size={22} strokeWidth={1.7} color="#0d1b5e" />,
                title: "30% off your move",
                desc: "Redeem your code for 30% off moving logistics after your viewing.",
              },
              {
                icon: <Clock size={22} strokeWidth={1.7} color="#0d1b5e" />,
                title: "Connected or Free",
                desc: "If your Home Guide does not respond in time, your ₦200 comes back as app credit.",
              },
            ].map(b => (
              <div key={b.title} style={{
                background: "#fff", border: "1px solid #e8e8e0",
                borderRadius: 14, padding: "20px 18px",
                display: "flex", gap: 14, alignItems: "flex-start",
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: "#eef2ff", display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {b.icon}
                </div>
                <div>
                  <h3 style={{
                    fontWeight: 700, color: "#0d1b5e",
                    fontSize: "0.92rem", marginBottom: 4,
                  }}>
                    {b.title}
                  </h3>
                  <p style={{ color: "#6b7280", fontSize: "0.8rem", lineHeight: 1.65 }}>
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{
        background: "linear-gradient(135deg,#0d1b5e,#1e3db5)",
        padding: "56px 20px", textAlign: "center",
      }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "'DM Serif Display',serif",
            color: "#fff", fontSize: "1.9rem", marginBottom: 12,
          }}>
            Ready to move? Start browsing.
          </h2>
          <p style={{
            color: "rgba(255,255,255,.72)", fontSize: "0.9rem",
            lineHeight: 1.75, marginBottom: 26,
          }}>
            Create your free account, find an apartment you like and
            connect with a verified Home Guide today.
          </p>
          <div style={{
            display: "flex", flexDirection: "column",
            gap: 10, maxWidth: 300, margin: "0 auto",
          }}>
            <button
              onClick={() => setPage(user ? 'browse' : 'register')}
              style={primaryBtn}
            >
              Browse Apartments <ArrowRight size={16} strokeWidth={2.5} />
            </button>
            {!user && (
              <button onClick={() => setPage('register-landlord')} style={secondaryBtn}>
                Join as a Home Guide
              </button>
            )}
          </div>
        </div>
      </section>

      <Footer setPage={setPage} />

      {selected && (
        <ListingModal
          listing={selected}
          onClose={() => setSelected(null)}
          user={user}
          setPage={setPage}
        />
      )}
    </div>
  )
}