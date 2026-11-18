import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ListingCard from '../components/ListingCard'
import ListingModal from '../components/modals/ListingModal'
import Footer from '../components/Footer'
import {
  UserCheck, Unlock, KeyRound, ArrowRight, MapPin,
  BadgePercent, Lock, ShieldCheck, Truck,
} from 'lucide-react'

function LockedCard({ s, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff", borderRadius: 16, overflow: "hidden",
        border: "1px solid #e8e8e0", cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,.05)",
      }}
    >
      <div style={{
        position: "relative", height: 180,
        background: "linear-gradient(135deg,#0d1b5e,#1e3db5)",
      }}>
        {s.thumb && (
          <img
            src={s.thumb}
            alt=""
            draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 8, background: "rgba(6,14,51,.38)", color: "#fff",
        }}>
          <Lock size={26} strokeWidth={1.8} />
          <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>Sign up free to view</span>
        </div>
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ fontSize: "0.76rem", color: "#6b7280", display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
          <MapPin size={12} /> {s.state}
        </div>
        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.05rem", color: "#0d1b5e", marginBottom: 8 }}>
          {s.type}
        </div>
        <div style={{ fontWeight: 700, color: "#0d1b5e" }}>₦{Number(s.price).toLocaleString()}</div>
        <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
          {s.listing_type === 'sale' ? "one-time price" : "per year"}
        </div>
      </div>
    </div>
  )
}

export default function HomePage({ setPage, user }) {
  const [listings, setListings] = useState([])
  const [samples, setSamples] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('listings')
          .select('*')
          .eq('status', 'active')
          .eq('listing_type', 'rent')
          .order('created_at', { ascending: false })
          .limit(3)
        if (!cancelled) setListings(data || [])
      } else {
        const { data } = await supabase.rpc('sample_listings', { p_limit: 3 })
        if (!cancelled) setSamples(data || [])
      }
    }
    load()
    return () => { cancelled = true }
  }, [user?.id])

  const dashboardTarget =
    !user ? 'login' :
    user.role === 'landlord' ? 'dashboard' :
    user.role === 'logistics' ? 'logistics' :
    'saved'

  const primaryBtn = {
    background: "#fff", color: "#0d1b5e", border: "none",
    borderRadius: 10, padding: "14px 28px", fontSize: "0.95rem",
    fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  }
  const secondaryBtn = {
    background: "transparent", color: "#fff",
    border: "1.5px solid rgba(255,255,255,.32)",
    borderRadius: 10, padding: "13px 26px", fontSize: "0.92rem",
    fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  }

  const showListings = user ? listings.length > 0 : samples.length > 0

  return (
    <div style={{ background: "#f4f3ef", minHeight: "100vh" }}>

      {/* HERO */}
      <section style={{
        background: "linear-gradient(160deg,#060e33 0%,#0d1b5e 60%,#1a3bdb 100%)",
        padding: "72px 20px 64px", textAlign: "center",
        width: "100%", overflow: "hidden",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h1 style={{
            fontFamily: "'DM Serif Display',serif",
            fontSize: "clamp(2.2rem, 6.5vw, 3.4rem)",
            color: "#fff", lineHeight: 1.15, marginBottom: 20, fontWeight: 400,
          }}>
            Find Your Next Home.
            <br />
            <em style={{ color: "#7eb3ff" }}>Move in with 30% off.</em>
          </h1>

          <p style={{
            color: "rgba(255,255,255,.72)",
            fontSize: "clamp(0.92rem, 2.5vw, 1.05rem)",
            lineHeight: 1.75, maxWidth: 540, margin: "0 auto 34px",
          }}>
            Browse available apartments, unlock your Home Guide's contact for free,
            and get 30% off your move with your Arleece ID.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 340, margin: "0 auto" }}>
            <button onClick={() => setPage(user ? 'browse' : 'register')} style={primaryBtn}>
              Browse Apartments <ArrowRight size={16} strokeWidth={2.5} />
            </button>
            <button onClick={() => setPage(dashboardTarget)} style={secondaryBtn}>
              Go to Dashboard <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 22, maxWidth: 440, margin: "48px auto 0",
          }}>
            {[
              { icon: <UserCheck size={20} color="#7eb3ff" strokeWidth={1.6} />, val: "Verified", label: "Home Guides" },
              { icon: <MapPin size={20} color="#7eb3ff" strokeWidth={1.6} />, val: "36", label: "States Covered" },
              { icon: <Unlock size={20} color="#7eb3ff" strokeWidth={1.6} />, val: "Free", label: "Unlocking" },
              { icon: <BadgePercent size={20} color="#7eb3ff" strokeWidth={1.6} />, val: "30%", label: "Off Moving" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>{s.icon}</div>
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
            fontFamily: "'DM Serif Display',serif", fontSize: "2rem",
            color: "#0d1b5e", textAlign: "center", marginBottom: 10,
          }}>
            How Arleece Works
          </h2>
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "0.9rem", marginBottom: 40 }}>
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
                icon: <UserCheck size={28} strokeWidth={1.6} color="#0d1b5e" />,
                title: "Sign up free",
                desc: "Create your free account in under a minute.",
              },
              {
                step: "02",
                icon: <Unlock size={28} strokeWidth={1.6} color="#0d1b5e" />,
                title: "Unlock apartments and Home Guide contacts free",
                desc: "Get the Home Guide's phone number and the home address at no cost.",
              },
              {
                step: "03",
                icon: <KeyRound size={28} strokeWidth={1.6} color="#0d1b5e" />,
                title: "Get your Arleece ID (₦200) for 30% off your move",
                desc: "One-time ₦200. Show your ID to our logistics partner to claim 30% off.",
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
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#d1d5db", letterSpacing: "0.08em" }}>
                    {s.step}
                  </span>
                </div>
                <h3 style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "1rem", marginBottom: 8, lineHeight: 1.4 }}>
                  {s.title}
                </h3>
                <p style={{ color: "#6b7280", fontSize: "0.83rem", lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST APARTMENTS */}
      {showListings && (
        <section style={{ padding: "0 20px 64px", background: "#f4f3ef" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 24,
            }}>
              <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.7rem", color: "#0d1b5e" }}>
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
                {user ? "View All" : "Sign Up to View"} <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(285px,1fr))",
              gap: 20,
            }}>
              {user
                ? listings.map(l => (
                    <ListingCard key={l.id} listing={l} onClick={() => setSelected(l)} />
                  ))
                : samples.map(s => (
                    <LockedCard key={s.id} s={s} onClick={() => setPage('register')} />
                  ))}
            </div>

            {!user && (
              <p style={{ textAlign: "center", color: "#6b7280", fontSize: "0.82rem", marginTop: 18 }}>
                Already have an account?{" "}
                <span
                  onClick={() => setPage('login')}
                  style={{ color: "#0d1b5e", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                >
                  Sign In
                </span>
              </p>
            )}
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section style={{
        background: "linear-gradient(135deg,#0d1b5e,#1e3db5)",
        padding: "56px 20px", textAlign: "center",
      }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 16, color: "#7eb3ff" }}>
            <ShieldCheck size={22} strokeWidth={1.7} />
            <Truck size={22} strokeWidth={1.7} />
          </div>
          <h2 style={{
            fontFamily: "'DM Serif Display',serif",
            color: "#fff", fontSize: "1.9rem", marginBottom: 12,
          }}>
            Ready to move? Start browsing.
          </h2>
          <p style={{ color: "rgba(255,255,255,.72)", fontSize: "0.9rem", lineHeight: 1.75, marginBottom: 26 }}>
            Create your free account, find an apartment you like and connect with a verified Home Guide today.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 300, margin: "0 auto" }}>
            <button onClick={() => setPage(user ? 'browse' : 'register')} style={primaryBtn}>
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