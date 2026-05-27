import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Ic, I } from '../Icons'
import { Btn, Badge } from '../UI'

export default function ListingModal({ listing: l, onClose, user, setPage }) {
  const [mainImg, setMainImg] = useState(l.images?.[0] || l.img || "")
  const [showFullImg, setShowFullImg] = useState(false)

  // ┌────────────────────────────────────────────────────────┐
  // │ STANDALONE DATABASE SAVER FUNCTION                     │
  // └────────────────────────────────────────────────────────┘
  const saveUnlockToDatabase = async (referenceId) => {
    try {
      const { error } = await supabase
        .from('unlocks')
        .insert([
          {
            tenant_id: user.id,
            listing_id: l.id,
            amount: 200,
            paid_at: new Date().toISOString(),
            payment_method: 'paystack'
          }
        ]);

      if (error) {
        console.error('Database entry write block:', error.message);
        alert('Payment cleared, but registration failed. Ref: ' + referenceId);
      } else {
        if (typeof onClose === 'function') onClose(); 
        if (typeof setPage === 'function') setPage('dashboard'); 
      }
    } catch (catchErr) {
      console.error('Error executing unlock initialization workflow:', catchErr);
    }
  };

  // ┌────────────────────────────────────────────────────────┐
  // │ OPTIMIZED ERROR-FREE PAYSTACK RUNTIME TRIGGER          │
  // └────────────────────────────────────────────────────────┘
  const handlePayment = () => {
    if (!user?.id || !user?.email) {
      alert("Please sign in to unlock this contact.");
      if (typeof setPage === 'function') setPage('login');
      return;
    }

    if (!window.PaystackPop) {
      alert("Paystack engine loading. Please refresh your page.");
      return;
    }

    try {
      const handler = window.PaystackPop.setup({
        key: 'pk_live_7e4040d2bf01ea308dfc657c49dc25b0e8206643', 
        email: user.email,
        amount: 20000, // ₦200 in kobo
        currency: 'NGN',
        
        callback: function(response) {
          console.log('Payment Approved. Reference ID:', response.reference);
          saveUnlockToDatabase(response.reference);
        },
        onClose: function() {
          alert('Transaction cancelled. Your contact details remain hidden.');
        }
      });

      handler.openIframe();
    } catch (paystackError) {
      console.error("Paystack initialization failed completely:", paystackError);
      alert("Could not open payment window. Error: " + paystackError.message);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,.58)", zIndex: 400,
        display: "flex", alignItems: "center",
        justifyContent: "center", padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: 18,
          width: "100%", maxWidth: 620,
          maxHeight: "92vh", overflowY: "auto",
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* FULL SCREEN IMAGE VIEWER */}
        {showFullImg && (
          <div
            onClick={() => setShowFullImg(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,.95)",
              zIndex: 600, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <img
              src={mainImg}
              alt=""
              style={{
                maxWidth: "100%", maxHeight: "100vh",
                objectFit: "contain",
              }}
            />
            <button
              onClick={() => setShowFullImg(false)}
              style={{
                position: "absolute", top: 20, right: 20,
                background: "rgba(255,255,255,.2)", border: "none",
                color: "#fff", width: 40, height: 40,
                borderRadius: "50%", fontSize: "1.2rem",
                cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* MAIN IMAGE */}
        <div style={{ position: "relative" }}>
          <img
            src={mainImg}
            alt={l.title}
            onClick={() => setShowFullImg(true)}
            style={{
              width: "100%", height: 250,
              objectFit: "cover",
              borderRadius: "18px 18px 0 0",
              display: "block",
              cursor: "pointer",
            }}
          />
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 12, right: 12,
              width: 34, height: 34, borderRadius: "50%",
              background: "rgba(0,0,0,.5)", border: "none",
              color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Ic d={I.x} s={16} />
          </button>
          {l.verified && (
            <div style={{ position: "absolute", bottom: 12, left: 12 }}>
              <Badge color="#fff" bg="#0d1b5e">
                <Ic d={I.shield} s={9} fill="#fff" stroke="none" /> Verified Landlord
              </Badge>
            </div>
          )}
        </div>

        {/* THUMBNAIL STRIP */}
        {l.images?.length > 1 && (
          <div style={{
            display: "flex", gap: 6,
            padding: "8px 12px",
            background: "#f4f3ef",
            overflowX: "auto",
          }}>
            {l.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt=""
                onClick={() => setMainImg(img)}
                style={{
                  width: 64, height: 52,
                  objectFit: "cover",
                  borderRadius: 8,
                  flexShrink: 0,
                  cursor: "pointer",
                  border: `2px solid ${mainImg === img ? "#0d1b5e" : "transparent"}`,
                  transition: "border .2s",
                }}
              />
            ))}
          </div>
        )}

        {/* VIDEOS */}
        {l.videos?.length > 0 && (
          <div style={{ padding: "10px 16px", background: "#f4f3ef" }}>
            <p style={{
              fontSize: "0.78rem", fontWeight: 600,
              color: "#374151", marginBottom: 8,
            }}>
              Videos
            </p>
            {l.videos.map((vid, idx) => (
              <video
                key={idx}
                src={vid}
                controls
                style={{
                  width: "100%", borderRadius: 10,
                  marginBottom: 8, maxHeight: 220,
                  display: "block",
                }}
              />
            ))}
          </div>
        )}

        {/* CONTENT */}
        <div style={{ padding: "22px 26px 28px" }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", flexWrap: "wrap",
            gap: 10, marginBottom: 14,
          }}>
            <div>
              <h2 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "1.45rem", color: "#0d1b5e", marginBottom: 5,
              }}>
                {l.title}
              </h2>
              <div style={{
                display: "flex", gap: 4, color: "#6b7280",
                fontSize: "0.8rem", alignItems: "center",
              }}>
                <Ic d={I.pin} s={12} /> {l.area}, {l.state}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "1.35rem" }}>
                ₦{l.price?.toLocaleString()}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#9ca3af", textAlign: "right" }}>
                per year
              </div>
            </div>
          </div>

          {/* STATS PILLS */}
          <div style={{
            display: "flex", gap: 10, flexWrap: "wrap",
            paddingBottom: 14, borderBottom: "1px solid #f0efea", marginBottom: 16,
          }}>
            {[
              `${l.kitchs || 0} Kitchen`,
              `${l.baths || 0} Bathroom${l.baths > 1 ? "s" : ""}`,
              l.type,
            ].filter(Boolean).map(v => (
              <div key={v} style={{
                background: "#f4f3ef", borderRadius: 8,
                padding: "6px 12px", fontSize: "0.82rem", color: "#374151",
              }}>
                {v}
              </div>
            ))}
          </div>

          {/* AMENITIES */}
          {l.amenities?.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <h4 style={{
                fontWeight: 700, color: "#374151",
                fontSize: "0.8rem", letterSpacing: "0.05em", marginBottom: 9,
              }}>
                AMENITIES
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {l.amenities.map(a => (
                  <span key={a} style={{
                    display: "flex", alignItems: "center", gap: 4,
                    background: "#eef2ff", color: "#0d1b5e",
                    borderRadius: 6, padding: "4px 11px",
                    fontSize: "0.76rem", fontWeight: 600,
                  }}>
                    <Ic d={I.check} s={11} sw={2.5} /> {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* DYNAMIC ACTION SECTION */}
          {l.status !== 'rented' ? (
            /* UNLOCK BANNER — only show if not rented */
            <div style={{
              background: "linear-gradient(135deg,#f0f3ff,#eaefff)",
              border: "1px solid #c7d4fd",
              borderRadius: 13, padding: "18px 20px",
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", flexWrap: "wrap", gap: 12,
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "0.96rem", marginBottom: 3 }}>
                    Get Direct Landlord Contact
                  </div>
                  <div style={{ color: "#6b7280", fontSize: "0.79rem" }}>
                    One-time ₦200 fee. No agent. No recurring charges.
                  </div>
                </div>
                {/* Linked button handler */}
                <Btn onClick={handlePayment}>
                  <Ic d={I.lock} s={14} /> Unlock for ₦200
                </Btn>
              </div>
            </div>
          ) : (
            /* RENTED NOTICE — show if property status is 'rented' */
            <div style={{
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: 13, padding: "18px 20px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>🔑</div>
              <div style={{ fontWeight: 700, color: "#991b1b", fontSize: "0.96rem", marginBottom: 4 }}>
                This Apartment Has Been Rented
              </div>
              <div style={{ color: "#b91c1c", fontSize: "0.82rem" }}>
                This property is no longer available for rent.
                Browse other listings to find your next home.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}