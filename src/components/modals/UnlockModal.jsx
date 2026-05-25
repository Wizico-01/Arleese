import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Ic, I } from '../Icons'
import { Btn, ErrBox } from '../UI'
import { usePaystackPayment } from 'react-paystack'

export default function UnlockModal({ listing: l, onClose, user, setPage }) {
  const [method, setMethod] = useState("")
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [err, setErr] = useState("")
  const [unlockedContact, setUnlockedContact] = useState(null)

  // PAYSTACK CONFIG — 20000 kobo = ₦200
  const paystackConfig = {
    reference: `ARL-${Date.now()}`,
    email: user?.email || '',
    amount: 20000,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    currency: 'NGN',
    channels: ['card', 'bank', 'ussd', 'bank_transfer'],
  }

  const initializePayment = usePaystackPayment(paystackConfig)

  // Fetch landlord contact details safely
  const fetchAndShowContact = async () => {
    try {
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select(`
          *,
          profiles (
            full_name,
            phone
          )
        `)
        .eq('id', l.id)
        .single()

      if (listingError || !listing) {
        setUnlockedContact({
          landlord: listing?.profiles?.full_name || "Property Owner",
          phone: listing?.profiles?.phone || "Contact via Arleece support",
          address: `${l.area}, ${l.state}`,
        })
      } else {
        setUnlockedContact({
          landlord: listing.profiles?.full_name || "Property Owner",
          phone: listing.profiles?.phone || "Contact via Arleece support",
          address: `${l.area}, ${l.state}`,
        })
      }
    } catch (e) {
      setUnlockedContact({
        landlord: "Property Owner",
        phone: "Contact via Arleece support",
        address: `${l.area}, ${l.state}`,
      })
    }
    setDone(true)
  }

  // Save unlock registration to database, then show them details right here!
  const saveUnlockAndShow = async (paymentRef, paymentMethod) => {
    setLoading(true)
    try {
      const currentTimestamp = new Date().toISOString()

      const { error } = await supabase
        .from('unlocks')
        .insert({
          tenant_id: user.id,
          listing_id: l.id,
          amount: 200,
          payment_method: paymentMethod,
          payment_ref: paymentRef,
          paid_at: currentTimestamp,    // Keeps consistency with old code
          created_at: currentTimestamp, // Feeds dashboard engine filters instantly
        })

      if (error) {
        // If already unlocked (duplicate prevention), pull info to view immediately
        if (error.code === '23505') {
          await fetchAndShowContact()
          return
        }
        setErr(`Failed to save record: ${error.message}`)
        return
      }

      // Fetch contact criteria and pull up success state card inside modal window
      await fetchAndShowContact()

    } catch (e) {
      setErr("Payment received, but your profile unlock log lagged. Please reach out to Arleece support.")
    } finally {
      setLoading(false)
    }
  }

  // Paystack execution launcher
  const handlePaystack = () => {
    if (!user?.id) {
      setErr("Please log in to unlock contacts.")
      return
    }
    if (!user?.email) {
      setErr("Your account email is missing. Please log out and log in again.")
      return
    }
    setErr("")

    initializePayment(
      async (reference) => {
        await saveUnlockAndShow(reference.reference, 'paystack')
      },
      () => {
        setErr("Payment window closed. Let's try that again whenever you're ready.")
      }
    )
  }

  // Bank transfer execution launcher
  const handleBankTransfer = async () => {
    if (!user?.id) {
      setErr("Please log in to unlock contacts.")
      return
    }
    await saveUnlockAndShow(`MANUAL-${Date.now()}`, 'bank_transfer')
  }

  // Handle final finish button tap inside the inline card context layer
  const handleFinalizeClose = () => {
    if (setPage) {
      setPage('unlocked-contacts') // Smooth redirect back to updated profile directory dashboard
    }
    onClose()
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,.62)", zIndex: 500,
        display: "flex", alignItems: "center",
        justifyContent: "center", padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: 18,
          width: "100%", maxWidth: 430,
          padding: "28px 26px", position: "relative",
          maxHeight: "95vh", overflowY: "auto",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* CLOSE CONTROL */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 13, right: 13,
            width: 30, height: 30, borderRadius: "50%",
            background: "#f4f3ef", border: "none",
            cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", color: "#374151",
          }}
        >
          <Ic d={I.x} s={15} />
        </button>

        {/* ── SUCCESS STATE PANEL (Now stays open for instant viewing) ── */}
        {done && unlockedContact && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "#0d1b5e", display: "flex",
              alignItems: "center", justifyContent: "center",
              margin: "0 auto 18px", color: "#fff",
            }}>
              <Ic d={I.check} s={28} sw={2.5} />
            </div>
            <h3 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "1.45rem", color: "#0d1b5e", marginBottom: 7,
            }}>
              Contact Unlocked!
            </h3>
            <p style={{ color: "#6b7280", fontSize: "0.83rem", marginBottom: 20 }}>
              Direct landlord details for <strong>{l.title}</strong>:
            </p>

            {/* CONTACT CARD GRID */}
            <div style={{
              background: "#f0f7ff",
              border: "1px solid #c7d4fd",
              borderRadius: 12, padding: 18,
              textAlign: "left",
              display: "flex", flexDirection: "column",
              gap: 14, marginBottom: 20,
            }}>
              <div>
                <div style={{
                  fontSize: "0.68rem", fontWeight: 700,
                  color: "#9ca3af", letterSpacing: "0.08em",
                  marginBottom: 4,
                }}>
                  LANDLORD NAME
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0d1b5e" }}>
                  {unlockedContact.landlord}
                </div>
              </div>

              <div>
                <div style={{
                  fontSize: "0.68rem", fontWeight: 700,
                  color: "#9ca3af", letterSpacing: "0.08em",
                  marginBottom: 4,
                }}>
                  PHONE NUMBER
                </div>
                <a 
                  href={`tel:${unlockedContact.phone}`}
                  style={{
                    fontSize: "0.95rem", fontWeight: 700,
                    color: "#1e3db5", textDecoration: "none",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  📞 {unlockedContact.phone}
                </a>
              </div>

              <div>
                <div style={{
                  fontSize: "0.68rem", fontWeight: 700,
                  color: "#9ca3af", letterSpacing: "0.08em",
                  marginBottom: 4,
                }}>
                  PROPERTY ADDRESS
                </div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#0d1b5e" }}>
                  📍 {unlockedContact.address}
                </div>
              </div>
            </div>

            <div style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 10, padding: "10px 14px",
              fontSize: "0.78rem", color: "#166534",
              marginBottom: 18, textAlign: "left",
            }}>
              ✅ This contact has been added to your profile roster. Access it anytime on your Saved dashboard.
            </div>

            <Btn full onClick={handleFinalizeClose}>View in Dashboard</Btn>
          </div>
        )}

        {/* ── SELECTION METHOD INTERFACE ── */}
        {!done && !method && (
          <>
            <h3 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "1.35rem", color: "#0d1b5e", marginBottom: 5,
            }}>
              Unlock Landlord Contact
            </h3>

            {/* PROPERTY SUMMARY BANNER */}
            <div style={{
              display: "flex", gap: 12, background: "#f4f3ef",
              borderRadius: 10, padding: 12, alignItems: "center", marginBottom: 16,
            }}>
              <img
                src={l.images?.[0] || l.img || ""}
                alt=""
                style={{ width: 58, height: 52, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
              />
              <div>
                <div style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "0.88rem" }}>{l.title}</div>
                <div style={{ color: "#6b7280", fontSize: "0.76rem" }}>{l.area}, {l.state}</div>
                <div style={{ color: "#1e3db5", fontWeight: 700, fontSize: "0.88rem", marginTop: 2 }}>
                  ₦{l.price?.toLocaleString()}/yr
                </div>
              </div>
            </div>

            {/* BILLING ACCENT BOX */}
            <div style={{
              background: "#eef2ff", borderRadius: 10,
              padding: "12px 16px", marginBottom: 16,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ color: "#374151", fontSize: "0.85rem", fontWeight: 600 }}>
                One-time unlock fee
              </span>
              <span style={{ color: "#0d1b5e", fontSize: "1.1rem", fontWeight: 800 }}>
                ₦200
              </span>
            </div>

            {err && <ErrBox msg={err} />}

            <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 12 }}>
              Select payment pipeline:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => { setMethod("paystack"); setErr("") }}
                style={{
                  background: "#0d1b5e", color: "#fff", border: "none",
                  borderRadius: 10, padding: "15px 18px", cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  fontFamily: "inherit",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                    💳 Pay with Paystack
                  </div>
                  <div style={{ fontSize: "0.73rem", opacity: .65, marginTop: 2 }}>
                    Card · Bank Transfer · USSD · ₦200
                  </div>
                </div>
                <Ic d={I.chevR} s={16} />
              </button>

              <button
                onClick={() => { setMethod("transfer"); setErr("") }}
                style={{
                  background: "#fff", color: "#0d1b5e",
                  border: "2px solid #0d1b5e", borderRadius: 10,
                  padding: "15px 18px", cursor: "pointer",
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", fontFamily: "inherit",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                    🏦 Manual Bank Transfer
                  </div>
                  <div style={{ fontSize: "0.73rem", color: "#6b7280", marginTop: 2 }}>
                    GTBank · Opay · Kuda · ₦200
                  </div>
                </div>
                <Ic d={I.chevR} s={16} />
              </button>
            </div>
          </>
        )}

        {/* ── PAYSTACK RUNTIME SCREEN ── */}
        {!done && method === "paystack" && (
          <>
            <button
              onClick={() => { setMethod(""); setErr("") }}
              style={{
                background: "none", border: "none", color: "#6b7280",
                cursor: "pointer", fontSize: "0.8rem", marginBottom: 14,
                fontFamily: "inherit",
              }}
            >
              ← Back
            </button>
            <h3 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "1.3rem", color: "#0d1b5e", marginBottom: 18,
            }}>
              Pay via Paystack
            </h3>

            {err && <div style={{ marginBottom: 12 }}><ErrBox msg={err} /></div>}

            <div style={{
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              borderRadius: 10, padding: 13, marginBottom: 16,
              fontSize: "0.81rem", color: "#166534",
            }}>
              Paystack's secure portal will launch. Fulfill your ₦200 token payment to completely view the structural asset contact.
            </div>

            <div style={{ background: "#f4f3ef", borderRadius: 10, padding: 14, marginBottom: 20 }}>
              {[
                ["Amount", "₦200"],
                ["Listing", l.title],
                ["Purpose", "Landlord Contact Unlock"],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "8px 0", borderBottom: "1px solid #e8e8e0",
                  fontSize: "0.82rem",
                }}>
                  <span style={{ color: "#6b7280" }}>{k}</span>
                  <span style={{ fontWeight: 600, color: "#0d1b5e" }}>{v}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handlePaystack}
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "#9ca3af" : "#0d1b5e",
                color: "#fff", border: "none", borderRadius: 9,
                padding: "14px 0",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "0.95rem", fontWeight: 700,
                fontFamily: "inherit",
              }}
            >
              {loading ? "Securing connection..." : "Pay ₦200 with Paystack →"}
            </button>
          </>
        )}

        {/* ── MANUAL BANK ENTRY SCREEN ── */}
        {!done && method === "transfer" && (
          <>
            <button
              onClick={() => { setMethod(""); setErr("") }}
              style={{
                background: "none", border: "none", color: "#6b7280",
                cursor: "pointer", fontSize: "0.8rem",
                marginBottom: 14, fontFamily: "inherit",
              }}
            >
              ← Back
            </button>
            <h3 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "1.3rem", color: "#0d1b5e", marginBottom: 18,
            }}>
              Manual Bank Transfer
            </h3>

            {err && <div style={{ marginBottom: 12 }}><ErrBox msg={err} /></div>}

            <div style={{
              background: "#f4f3ef", borderRadius: 12,
              overflow: "hidden", marginBottom: 14,
            }}>
              {[
                ["Bank", "Guarantee Trust Bank (GTB)"],
                ["Account Name", "Arleece Nigeria Ltd"],
                ["Account Number", "0123456789"],
                ["Amount", "₦200"],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", padding: "12px 14px",
                  borderBottom: "1px solid #e8e8e0", fontSize: "0.83rem",
                }}>
                  <span style={{ color: "#6b7280" }}>{k}</span>
                  <span style={{ fontWeight: 700, color: "#0d1b5e" }}>{v}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: "0.76rem", color: "#6b7280", marginBottom: 14 }}>
              Include your core account registration email as the reference statement for manual reconciliation.
            </p>

            <label style={{
              display: "flex", alignItems: "center", gap: 9,
              cursor: "pointer", marginBottom: 18,
              fontSize: "0.83rem", color: "#374151",
            }}>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
                style={{ accentColor: "#0d1b5e", width: 15, height: 15 }}
              />
              I have transferred ₦200 to the corporate ledger listed above
            </label>

            <button
              onClick={handleBankTransfer}
              disabled={!confirmed || loading}
              style={{
                width: "100%",
                background: (!confirmed || loading) ? "#9ca3af" : "#0d1b5e",
                color: "#fff", border: "none", borderRadius: 9,
                padding: "14px 0",
                cursor: (!confirmed || loading) ? "not-allowed" : "pointer",
                fontSize: "0.95rem", fontWeight: 700,
                fontFamily: "inherit",
              }}
            >
              {loading ? "Registering Ledger..." : "Confirm Transfer & Unlock Contact"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}