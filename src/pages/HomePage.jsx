import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Btn, Badge } from '../components/UI'
import { Ic, I } from '../components/Icons'
import ListingCard from '../components/ListingCard'
import ListingModal from '../components/modals/ListingModal'
import UnlockModal from '../components/modals/UnlockModal'
import Footer from '../components/Footer'
import {
  Search, ShieldCheck, Phone, ArrowRight,
  Building2, Star, Users, BadgePercent
} from 'lucide-react'

export default function HomePage({ setPage, user }) {
  const [listings, setListings] = useState([])
  const [selected, setSelected] = useState(null)
  const [unlocking, setUnlocking] = useState(null)

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

  return (
    <div style={{ background: "#f4f3ef", minHeight: "100vh" }}>

      {/* HERO */}
      <section style={{
        background: "linear-gradient(160deg,#060e33 0%,#0d1b5e 60%,#1a3bdb 100%)",
        padding: "80px 20px 70px",
        textAlign: "center",
        width: "100%",
        overflow: "hidden",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.15)",
            borderRadius: 30, padding: "6px 16px",
            fontSize: "0.75rem", color: "rgba(255,255,255,.8)",
            fontWeight: 600, letterSpacing: "0.06em",
            marginBottom: 24, textTransform: "uppercase",
          }}>
            Zero Agent Fees Across Nigeria
          </div>

          <h1 style={{
            fontFamily: "'DM Serif Display',serif",
            fontSize: "clamp(2rem, 6vw, 3.2rem)",
            color: "#fff",
            lineHeight: 1.18,
            marginBottom: 20,
          }}>
            Rent a Home Directly
            <br />
            <span style={{ color: "#7eb3ff", fontStyle: "italic" }}>
              from the Landlord
            </span>
          </h1>

          <p style={{
            color: "rgba(255,255,255,.72)",
            fontSize: "clamp(0.9rem, 2.5vw, 1.05rem)",
            lineHeight: 1.75,
            marginBottom: 36,
            maxWidth: 520,
            margin: "0 auto 36px",
          }}>
            No agents. No 20% commission. No inspection fees.
            Browse verified landlord listings across all 36 states
            and unlock direct contact for just ₦200.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 340, margin: "0 auto" }}>
            <button
              onClick={() => {
                if (!user) {
                  setPage('register')
                } else {
                  setPage('browse')
                }
              }}
              style={{
                background: "#fff",
                color: "#0d1b5e",
                border: "none",
                borderRadius: 10,
                padding: "14px 28px",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {user ? "Browse Apartments" : "Sign Up to View Apartments"}
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>

            {!user && (
              <button
                onClick={() => setPage('register-landlord')}
                style={{
                  background: "transparent",
                  color: "#fff",
                  border: "1.5px solid rgba(255,255,255,.32)",
                  borderRadius: 10,
                  padding: "13px 26px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                List Your Property Free
              </button>
            )}

            {user?.role === 'landlord' && (
              <button
                onClick={() => setPage('dashboard')}
                style={{
                  background: "transparent",
                  color: "#fff",
                  border: "1.5px solid rgba(255,255,255,.32)",
                  borderRadius: 10,
                  padding: "13px 26px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Go to Dashboard
              </button>
            )}
          </div>

          {/* STATS */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginTop: 52,
            maxWidth: 480,
            margin: "52px auto 0",
          }}>
            {[
              { icon: <Building2 size={20} color="#7eb3ff" strokeWidth={1.6} />, val: "₦200", label: "Flat Unlock Fee" },
              { icon: <Users size={20} color="#7eb3ff" strokeWidth={1.6} />, val: "36", label: "States Covered" },
              { icon: <BadgePercent size={20} color="#7eb3ff" strokeWidth={1.6} />, val: "0%", label: "Agent Commission" },
              { icon: <ShieldCheck size={20} color="#7eb3ff" strokeWidth={1.6} />, val: "100%", label: "Direct to Landlord" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
                  {s.icon}
                </div>
                <div style={{
                  fontFamily: "'DM Serif Display',serif",
                  fontSize: "1.8rem",
                  color: "#7eb3ff",
                  fontWeight: 700,
                  lineHeight: 1,
                }}>
                  {s.val}
                </div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,.55)", marginTop: 3 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNUP NUDGE — only for non-logged-in users */}
      {!user && (
        <div style={{
          background: "#0d1b5e",
          padding: "32px 20px",
          textAlign: "center",
        }}>
          <p style={{
            color: "rgba(255,255,255,.8)",
            fontSize: "0.9rem",
            marginBottom: 16,
            lineHeight: 1.7,
          }}>
            Hundreds of verified apartments and properties are waiting —
            completely free to browse once you sign up.
          </p>
          <button
            onClick={() => setPage('register')}
            style={{
              background: "#fff",
              color: "#0d1b5e",
              border: "none",
              borderRadius: 10,
              padding: "13px 28px",
              fontWeight: 700,
              fontSize: "0.92rem",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Create Free Account
          </button>
          <p style={{
            color: "rgba(255,255,255,.5)",
            fontSize: "0.75rem",
            marginTop: 10,
          }}>
            Already have an account?{" "}
            <span
              onClick={() => setPage('login')}
              style={{
                color: "#fff",
                textDecoration: "underline",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Sign In
            </span>
          </p>
        </div>
      )}

      {/* HOW IT WORKS */}
      <section style={{ padding: "64px 20px", background: "#f4f3ef" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "'DM Serif Display',serif",
            fontSize: "2rem",
            color: "#0d1b5e",
            textAlign: "center",
            marginBottom: 10,
          }}>
            How Arleece Works
          </h2>
          <p style={{
            textAlign: "center",
            color: "#6b7280",
            fontSize: "0.9rem",
            marginBottom: 44,
          }}>
            Three steps to your next home. No agent required.
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 20,
          }}>
            {[
              {
                icon: <Search size={28} strokeWidth={1.6} color="#0d1b5e" />,
                step: "01",
                title: "Browse Listings",
                desc: "Search verified apartments and properties across all 36 states in Nigeria for free.",
              },
              {
                icon: <Phone size={28} strokeWidth={1.6} color="#0d1b5e" />,
                step: "02",
                title: "Unlock Contact",
                desc: "Pay a one-time ₦200 fee to get the landlord's direct phone number and property address.",
              },
              {
                icon: <ShieldCheck size={28} strokeWidth={1.6} color="#0d1b5e" />,
                step: "03",
                title: "Move In Your Way",
                desc: "Call the landlord directly. Negotiate your terms. Move in without any agent in between.",
              },
            ].map(s => (
              <div key={s.step} style={{
                background: "#fff",
                borderRadius: 16,
                padding: "28px 22px",
                border: "1px solid #e8e8e0",
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}>
                  {s.icon}
                  <span style={{
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    color: "#e5e7eb",
                    letterSpacing: "0.08em",
                  }}>
                    {s.step}
                  </span>
                </div>
                <h3 style={{
                  fontWeight: 700,
                  color: "#0d1b5e",
                  fontSize: "1rem",
                  marginBottom: 8,
                }}>
                  {s.title}
                </h3>
                <p style={{
                  color: "#6b7280",
                  fontSize: "0.83rem",
                  lineHeight: 1.7,
                }}>
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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 26,
            }}>
              <h2 style={{
                fontFamily: "'DM Serif Display',serif",
                fontSize: "1.75rem",
                color: "#0d1b5e",
              }}>
                Latest Listings
              </h2>
              <button
                onClick={() => user ? setPage('browse') : setPage('register')}
                style={{
                  background: "#fff",
                  color: "#0d1b5e",
                  border: "1.5px solid #0d1b5e",
                  borderRadius: 9,
                  padding: "9px 18px",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                View All <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div>

            {!user && (
              <div style={{
                background: "#eef2ff",
                border: "1px solid #c7d4fd",
                borderRadius: 12,
                padding: "14px 18px",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}>
                <p style={{ color: "#1e3db5", fontSize: "0.85rem", fontWeight: 600 }}>
                  Sign up to view all available listings across Nigeria
                </p>
                <button
                  onClick={() => setPage('register')}
                  style={{
                    background: "#0d1b5e",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "9px 18px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Sign Up Free
                </button>
              </div>
            )}

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(285px,1fr))",
              gap: 20,
              filter: !user ? "blur(4px)" : "none",
              pointerEvents: !user ? "none" : "auto",
              userSelect: !user ? "none" : "auto",
            }}>
              {listings.map(l => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  onClick={() => user ? setSelected(l) : setPage('register')}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LANDLORD CTA — only for non-landlords */}
      {user?.role !== 'landlord' && (
        <section style={{
          background: "linear-gradient(135deg,#0d1b5e,#1e3db5)",
          padding: "56px 20px",
          textAlign: "center",
        }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <h2 style={{
              fontFamily: "'DM Serif Display',serif",
              color: "#fff",
              fontSize: "1.9rem",
              marginBottom: 12,
            }}>
              Are You a Landlord?
            </h2>
            <p style={{
              color: "rgba(255,255,255,.72)",
              fontSize: "0.9rem",
              lineHeight: 1.75,
              marginBottom: 28,
            }}>
              List your apartment or property for free. Verified tenants
              will contact you directly — no agent taking commission from either side.
            </p>
            <button
              onClick={() => setPage('register-landlord')}
              style={{
                background: "#fff",
                color: "#0d1b5e",
                border: "none",
                borderRadius: 10,
                padding: "14px 28px",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              List Your Apartment for Free
            </button>
          </div>
        </section>
      )}

      <Footer setPage={setPage} />

      {selected && (
        <ListingModal
          listing={selected}
          onClose={() => setSelected(null)}
          onUnlock={() => { setUnlocking(selected); setSelected(null) }}
          user={user}
          setPage={setPage}
        />
      )}
      {unlocking && (
        <UnlockModal
          listing={unlocking}
          onClose={() => setUnlocking(null)}
          user={user}
          setPage={setPage}
        />
      )}
    </div>
  )
}