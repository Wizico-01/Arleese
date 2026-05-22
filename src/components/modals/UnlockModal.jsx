import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Ic, I } from '../Icons'
import { Btn, ErrBox } from '../UI'

export default function UnlockModal({ listing: l, onClose, user, setPage }) {
  const [method, setMethod] = useState("")
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [err, setErr] = useState("")

  const pay = async () => {
    // 🌟 GLOBAL SECURITY CHECK: Block unauthenticated users instantly
    if (!user?.id) {
      setErr("Please log in to unlock contacts.")
      return
    }

    setLoading(true)
    setErr("")

    try {
      if (method === "transfer") {
        // REAL DB INSERTION: Save manual transfer to Supabase unlocks schema
        const { error } = await supabase
          .from('unlocks')
          .insert({
            tenant_id: user.id,
            listing_id: l.id,
            amount: 100, // Matches your displayed ₦100 price value
            payment_method: 'bank_transfer',
            payment_ref: `MANUAL-${Date.now()}`,
          })

        if (error) {
          setErr(error.message)
          setLoading(false)
          return
        }
      } else {
        // Paystack mock simulation (Upgrade this hook once your Paystack Webhook or Popup is configured)
        await new Promise(resolve => setTimeout(resolve, 1400))
      }

      setDone(true)
    } catch (e) {
      setErr("Failed to process payment. Please verify your connection.")
    } finally {
      setLoading(false)
    }
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
        {/* CLOSE BUTTON */}
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

        {/* SUCCESS STATE */}
        {done ? (
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
              Here are the direct details for <strong>{l.title}</strong>:
            </p>
            <div style={{
              background: "#f4f3ef", borderRadius: 12,
              padding: 18, textAlign: "left",
              display: "flex", flexDirection: "column",
              gap: 14, marginBottom: 20,
            }}>
              {[
                ["Landlord", l.landlord || "Property Owner"],
                ["Phone", "+234 801 234 5678"],
                ["Address", `14B Harmony Close, ${l.area}, ${l.state}`],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{
                    fontSize: "0.7rem", fontWeight: 700,
                    color: "#9ca3af", letterSpacing: "0.06em",
                  }}>
                    {k.toUpperCase()}
                  </div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#0d1b5e", marginTop: 2 }}>
                    {v}
                  </div>
                </div>
              ))}
            </div>
            <Btn full onClick={onClose}>Done</Btn>
          </div>

        ) : !method ? (
          /* CHOOSE PAYMENT METHOD */
          <>
            <h3 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "1.35rem", color: "#0d1b5e", marginBottom: 5,
            }}>
              Unlock Landlord Contact
            </h3>

            {/* PROPERTY SNIPPET */}
            <div style={{
              display: "flex", gap: 12, background: "#f4f3ef",
              borderRadius: 10, padding: 12, alignItems: "center", marginBottom: 20,
            }}>
              <img
                src={l.img || (l.images?.[0] || "")} 
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

            <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 12 }}>
              Choose payment method:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => { setMethod("paystack"); setErr(""); }}
                style={{
                  background: "#0d1b5e", color: "#fff", border: "none",
                  borderRadius: 10, padding: "15px 18px", cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  fontFamily: "inherit",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>Pay with Paystack</div>
                  <div style={{ fontSize: "0.73rem", opacity: .65, marginTop: 2 }}>
                    Card · Bank Transfer · USSD
                  </div>
                </div>
                <Ic d={I.chevR} s={16} />
              </button>

              <button
                onClick={() => { setMethod("transfer"); setErr(""); }}
                style={{
                  background: "#fff", color: "#0d1b5e",
                  border: "2px solid #0d1b5e", borderRadius: 10,
                  padding: "15px 18px", cursor: "pointer",
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", fontFamily: "inherit",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>Manual Bank Transfer</div>
                  <div style={{ fontSize: "0.73rem", color: "#6b7280", marginTop: 2 }}>
                    GTBank · Opay · Kuda · any bank
                  </div>
                </div>
                <Ic d={I.chevR} s={16} />
              </button>
            </div>
          </>

        ) : method === "paystack" ? (
          /* PAYSTACK */
          <>
            <button
              onClick={() => { setMethod(""); setErr(""); }}
              style={{
                background: "none", border: "none", color: "#6b7280",
                cursor: "pointer", fontSize: "0.8rem", marginBottom: 14,
                display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit",
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
              You will be redirected to Paystack's secure checkout to complete your ₦1,000 payment.
            </div>
            <div style={{ background: "#f4f3ef", borderRadius: 10, padding: 14, marginBottom: 18 }}>
              {[
                ["Amount", "₦1,000"],
                ["Reference", `RD-${l.id}-${Date.now().toString().slice(-5)}`],
                ["Purpose", "Landlord Contact Unlock"],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "7px 0", borderBottom: "1px solid #e8e8e0",
                  fontSize: "0.82rem",
                }}>
                  <span style={{ color: "#6b7280" }}>{k}</span>
                  <span style={{ fontWeight: 600, color: "#0d1b5e" }}>{v}</span>
                </div>
              ))}
            </div>
            <Btn full onClick={pay} disabled={loading}>
              {loading ? "Processing…" : "Proceed to Paystack →"}
            </Btn>
          </>

        ) : (
          /* BANK TRANSFER */
          <>
            <button
              onClick={() => { setMethod(""); setErr(""); }}
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
              overflow: "hidden", marginBottom: 16,
            }}>
              {[
                ["Bank", "Guarantee Trust Bank (GTB)"],
                ["Account Name", "Arleece Nigeria Ltd"],
                ["Account Number", "0123456789"],
                ["Amount", "₦1,000"],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", padding: "11px 14px",
                  borderBottom: "1px solid #e8e8e0", fontSize: "0.83rem",
                }}>
                  <span style={{ color: "#6b7280" }}>{k}</span>
                  <span style={{ fontWeight: 700, color: "#0d1b5e" }}>{v}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.76rem", color: "#6b7280", marginBottom: 14 }}>
              Use your account email address as the transfer description narration so we can confirm your account quickly.
            </p>
            <label style={{
              display: "flex", alignItems: "center", gap: 9,
              cursor: "pointer", marginBottom: 16,
              fontSize: "0.83rem", color: "#374151",
            }}>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
                style={{ accentColor: "#0d1b5e", width: 15, height: 15 }}
              />
              I have completed the transfer of ₦100
            </label>
            <Btn full onClick={pay} disabled={!confirmed || loading}>
              {loading ? "Verifying…" : "Confirm Transfer & Unlock"}
            </Btn>
          </>
        )}
      </div>
    </div>
  )
}