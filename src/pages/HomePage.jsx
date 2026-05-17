import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Btn, Card } from '../components/UI'
import { Ic, I } from '../components/Icons'
import ListingCard from '../components/ListingCard'

export default function HomePage({ setPage, user }) {
  const [listings, setListings] = useState([])

  useEffect(() => {
    const fetchListings = async () => {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3)
      if (data) setListings(data)
    }
    fetchListings()
  }, [])

  return (
    <div>
      {/* ── HERO ── */}
      {/* FIX 1: Added position: "relative" so the absolute orb is contained */}
      <section style={{
        background: "linear-gradient(140deg,#060e33 0%,#0d1b5e 60%,#162484 100%)",
        padding: "60px 20px 60px",
        width: "100%",
        overflow: "hidden",
        position: "relative", // ← FIXED: was missing, causing orb to escape
      }}>
        <div style={{
          position: "absolute", top: -120, right: 0,
          width: "min(520px, 80vw)", height: 520, borderRadius: "50%",
          background: "rgba(255,255,255,.025)", pointerEvents: "none",
        }} />
        <div style={{ maxWidth: "100%", margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.14)",
            borderRadius: 24, padding: "5px 16px",
            fontSize: "0.76rem", fontWeight: 600,
            letterSpacing: "0.06em", color: "#a8c4ff", marginBottom: 26,
          }}>
            🇳🇬 &nbsp; ZERO AGENT FEES ACROSS NIGERIA
          </div>

          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(2.2rem,5.5vw,3.8rem)",
            color: "#fff", fontWeight: 400,
            lineHeight: 1.12, marginBottom: 20,
          }}>
            Rent a Home Directly<br />
            <em style={{ color: "#7eb3ff" }}>from the Landlord</em>
          </h1>

          <p style={{
            fontSize: "1.05rem", color: "rgba(255,255,255,.68)",
            lineHeight: 1.75, maxWidth: 520,
            margin: "0 auto 38px",
          }}>
            No agents. No 20% commission. No Inspection fees. Browse verified landlord listings
            across all 36 states and unlock their direct contacts.
          </p>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 28, width: "100%" }}>
            <Btn variant="white" onClick={() => setPage('browse')}>
              Browse Apartments <Ic d={I.arrow} s={16} />
            </Btn>

            {!user && (
              <button
                onClick={() => setPage('register')}
                style={{
                  background: "transparent", color: "#fff",
                  border: "1.5px solid rgba(255,255,255,.32)",
                  borderRadius: 9, padding: "12px 26px",
                  fontSize: "0.9rem", fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                  width: "100%",
                }}
              >
                List Your Property
              </button>
            )}

            {user?.role === 'landlord' && (
              <button
                onClick={() => setPage('dashboard')}
                style={{
                  background: "transparent", color: "#fff",
                  border: "1.5px solid rgba(255,255,255,.32)",
                  borderRadius: 9, padding: "12px 26px",
                  fontSize: "0.9rem", fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                  width: "100%",
                }}
              >
                Go to Dashboard →
              </button>
            )}
          </div>

          {/* STATS */}
          {/* FIX 2: Removed duplicate marginTop/margin conflict — use a single margin shorthand */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 20,
            maxWidth: 320,
            margin: "36px auto 0", // ← FIXED: was split across marginTop:36 AND margin:"36px auto 0";
                                   //   the second `margin` key silently overwrote the first.
                                   //   Now only one property handles all four sides.
          }}>
            {[
              ["1,200+", "Verified Listings"],
              ["36", "States Covered"],
              ["₦100", "Flat Unlock Fee"],
              ["0%", "Agent Commission"],
            ].map(([n, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "1.9rem", color: "#7eb3ff",
                }}>
                  {n}
                </div>
                <div style={{
                  fontSize: "0.73rem",
                  color: "rgba(255,255,255,.45)",
                  marginTop: 3, letterSpacing: "0.05em",
                }}>
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: "#f4f3ef", padding: "48px 16px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "2.1rem", color: "#0d1b5e", marginBottom: 10,
            }}>
              How Arleece Works
            </h2>
            <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>
              Simple, transparent, and built for Nigerian tenants.
            </p>
          </div>

          {/* FIX 3: Use a responsive column count instead of always "1fr" */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", // ← FIXED: was "1fr" (always single-column)
            gap: 14,
          }}>
            {[
              { n: "01", e: "🔍", t: "Browse Listings", d: "Filter verified apartments by state, type, and price range." },
              { n: "02", e: "🏠", t: "View Full Details", d: "See photos, amenities, and the exact rent — no hidden fees." },
              { n: "03", e: "🔒", t: "Pay ₦100", d: "One-time flat fee via Paystack or bank transfer to unlock contact." },
              { n: "04", e: "📞", t: "Call the Landlord", d: "Get direct phone and address. No middleman. Move in your way." },
            ].map(s => (
              <Card key={s.n} style={{ padding: 26 }}>
                <div style={{
                  fontSize: "0.68rem", fontWeight: 700,
                  color: "#1e3db5", letterSpacing: "0.12em", marginBottom: 12,
                }}>
                  {s.n}
                </div>
                <div style={{ fontSize: "1.9rem", marginBottom: 12 }}>{s.e}</div>
                <h3 style={{ fontSize: "0.96rem", fontWeight: 700, color: "#0d1b5e", marginBottom: 7 }}>
                  {s.t}
                </h3>
                <p style={{ fontSize: "0.82rem", color: "#6b7280", lineHeight: 1.65 }}>{s.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── LATEST LISTINGS ── */}
      <section style={{ background: "#fff", padding: "48px 16px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap",
            gap: 12, marginBottom: 32,
          }}>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "1.95rem", color: "#0d1b5e",
            }}>
              Latest Listings
            </h2>
            <Btn variant="secondary" sm onClick={() => setPage('browse')}>
              View All →
            </Btn>
          </div>

          {listings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>🏠</div>
              <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                No listings yet
              </p>
              <p style={{ fontSize: "0.85rem" }}>
                Be the first landlord to list an apartment!
              </p>
            </div>
          ) : (
            // FIX 3 (same pattern): responsive columns for listing cards too
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", // ← FIXED: was "1fr"
              gap: 16,
            }}>
              {listings.map(l => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  onClick={() => setPage('browse')}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── LANDLORD CTA ── */}
      {user?.role !== 'landlord' && (
        <section style={{
          background: "linear-gradient(135deg,#0d1b5e,#1e3db5)",
          padding: "48px 20px",
          textAlign: "center",
        }}>
          <div style={{ maxWidth: 560, margin: "0 auto", color: "#fff" }}>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "2.1rem", marginBottom: 14,
            }}>
              Are You a Landlord?
            </h2>
            <p style={{ color: "rgba(255,255,255,.7)", lineHeight: 1.75, marginBottom: 30 }}>
              List your vacant apartment and connect directly with thousands of
              verified tenants. Zero agent commission.
            </p>
            <Btn variant="white" onClick={() => setPage('register-landlord')}>
              List Your Apartment Free →
            </Btn>
          </div>
        </section>
      )}
    </div>
  )
}