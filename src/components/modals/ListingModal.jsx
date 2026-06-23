import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Ic, I } from '../Icons'
import { Btn, Badge } from '../UI'

export default function ListingModal({ listing: l, onClose, user, setPage }) {
  const [mainImg, setMainImg] = useState(l.images?.[0] || l.img || "")
  const [showFullImg, setShowFullImg] = useState(false)

  const [unlockedData, setUnlockedData] = useState(null)
  const [isPaid, setIsPaid] = useState(false)
  const [notice, setNotice] = useState(null) // { type: 'error'|'info', message: '' }

  const isSale = l.listing_type === 'sale'
  const isLand = l.type === 'Land'

  const saveUnlockToDatabase = async (referenceId) => {
    try {
      const { error: insertError } = await supabase
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

      if (insertError) {
        console.error('Database entry write block:', insertError.message);
        setNotice({
          type: 'error',
          message: `Payment cleared, but registration failed. Ref: ${referenceId}. Please contact support.`,
        });
        return;
      }

      const { data: listingData, error: fetchError } = await supabase
        .from('listings')
        .select('phone, landlord_phone, address, landlord_address, area, state, price')
        .eq('id', l.id)
        .single();

      if (!fetchError && listingData) {
        setUnlockedData(listingData);
        setIsPaid(true);
      } else {
        setIsPaid(true);
      }

    } catch (catchErr) {
      console.error('Error executing unlock initialization workflow:', catchErr);
      setNotice({
        type: 'error',
        message: 'Something went wrong saving your unlock. Please contact support.',
      });
    }
  };

  const handlePayment = () => {
    if (!user?.id || !user?.email) {
      setNotice({ type: 'error', message: "Please sign in to unlock this contact." });
      setTimeout(() => {
        if (typeof setPage === 'function') setPage('login');
      }, 1200);
      return;
    }

    if (!window.PaystackPop) {
      setNotice({ type: 'error', message: "Payment system loading. Please refresh the page." });
      return;
    }

    setNotice(null);

    try {
      const handler = window.PaystackPop.setup({
        key: 'pk_live_7e4040d2bf01ea308dfc657c49dc25b0e8206643',
        email: user.email,
        amount: 20000,
        currency: 'NGN',

        callback: function(response) {
          console.log('Payment Approved. Reference ID:', response.reference);
          saveUnlockToDatabase(response.reference);
        },
        onClose: function() {
          setNotice({
            type: 'info',
            message: 'Transaction cancelled. Your contact details remain hidden.',
          });
        }
      });

      handler.openIframe();
    } catch (paystackError) {
      console.error("Paystack initialization failed completely:", paystackError);
      setNotice({
        type: 'error',
        message: "Could not open payment window. Please try again.",
      });
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

        {/* CUSTOM NOTICE BANNER — replaces alert() */}
        {notice && (
          <div
            style={{
              position: "sticky", top: 0, zIndex: 50,
              background: notice.type === 'error' ? "#fee2e2" : "#eef2ff",
              borderBottom: `1px solid ${notice.type === 'error' ? "#fca5a5" : "#c7d4fd"}`,
              padding: "12px 18px",
              display: "flex", alignItems: "center",
              justifyContent: "space-between", gap: 12,
            }}
          >
            <span style={{
              fontSize: "0.84rem",
              color: notice.type === 'error' ? "#991b1b" : "#1e3db5",
              lineHeight: 1.5,
            }}>
              {notice.type === 'error' ? '⚠️ ' : 'ℹ️ '}
              {notice.message}
            </span>
            <button
              onClick={() => setNotice(null)}
              style={{
                background: "none", border: "none",
                color: notice.type === 'error' ? "#991b1b" : "#1e3db5",
                cursor: "pointer", fontSize: "1rem",
                fontWeight: 700, flexShrink: 0,
                fontFamily: "inherit",
              }}
            >
              ✕
            </button>
          </div>
        )}

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
            <img src={mainImg} alt="" style={{ maxWidth: "100%", maxHeight: "100vh", objectFit: "contain" }} />
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
          {isSale && (
            <div style={{ position: "absolute", top: 12, left: 12 }}>
              <Badge color="#fff" bg="#92400e">
                🏷️ For Sale
              </Badge>
            </div>
          )}
        </div>

        {/* THUMBNAIL STRIP */}
        {l.images?.length > 1 && (
          <div style={{ display: "flex", gap: 6, padding: "8px 12px", background: "#f4f3ef", overflowX: "auto" }}>
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
            <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 8 }}>
              Videos
            </p>
            {l.videos.map((vid, idx) => (
              <video key={idx} src={vid} controls style={{ width: "100%", borderRadius: 10, marginBottom: 8, maxHeight: 220, display: "block" }} />
            ))}
          </div>
        )}

        {/* CONTENT */}
        <div style={{ padding: "22px 26px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <div>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.45rem", color: "#0d1b5e", marginBottom: 5 }}>
                {l.title}
              </h2>
              <div style={{ display: "flex", gap: 4, color: "#6b7280", fontSize: "0.8rem", alignItems: "center" }}>
                <Ic d={I.pin} s={12} /> {l.area}, {l.state}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "1.35rem" }}>
                ₦{l.price?.toLocaleString()}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#9ca3af", textAlign: "right" }}>
                {isSale ? "one-time price" : "per year"}
              </div>
            </div>
          </div>

          {/* STATS PILLS */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingBottom: 14, borderBottom: "1px solid #f0efea", marginBottom: 16 }}>
            {[
              !isLand ? `${l.kitchs || 0} Kitchen` : null,
              !isLand ? `${l.baths || 0} Bathroom${l.baths > 1 ? "s" : ""}` : null,
              l.type,
            ].filter(Boolean).map(v => (
              <div key={v} style={{ background: "#f4f3ef", borderRadius: 8, padding: "6px 12px", fontSize: "0.82rem", color: "#374151" }}>
                {v}
              </div>
            ))}
          </div>

          {/* AMENITIES */}
          {l.amenities?.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <h4 style={{ fontWeight: 700, color: "#374151", fontSize: "0.8rem", letterSpacing: "0.05em", marginBottom: 9 }}>
                AMENITIES
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {l.amenities.map(a => (
                  <span key={a} style={{ display: "flex", alignItems: "center", gap: 4, background: "#eef2ff", color: "#0d1b5e", borderRadius: 6, padding: "4px 11px", fontSize: "0.76rem", fontWeight: 600 }}>
                    <Ic d={I.check} s={11} sw={2.5} /> {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* DYNAMIC ACTION SECTION */}
          {l.status === 'rented' ? (
            <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 13, padding: "18px 20px", textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>🔑</div>
              <div style={{ fontWeight: 700, color: "#991b1b", fontSize: "0.96rem", marginBottom: 4 }}>
                {isSale ? "This Property Has Been Sold" : "This Apartment Has Been Rented"}
              </div>
              <div style={{ color: "#b91c1c", fontSize: "0.82rem" }}>
                {isSale ? "This property is no longer available for purchase." : "This property is no longer available for rent."}
              </div>
            </div>
          ) : isPaid ? (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 13, padding: "18px 20px" }}>
              <div style={{ fontWeight: 700, color: "#166534", fontSize: "1rem", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                ✅ Contact Unlocked Successfully
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.92rem", color: "#1e293b" }}>
                  <span>📞</span>
                  <strong>Phone:</strong>
                  <a href={`tel:${unlockedData?.phone || unlockedData?.landlord_phone || l.phone || l.landlord_phone}`} style={{ color: "#0d1b5e", fontWeight: 600, textDecoration: "underline" }}>
                    {unlockedData?.phone || unlockedData?.landlord_phone || l.phone || l.landlord_phone || "N/A"}
                  </a>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.92rem", color: "#1e293b" }}>
                  <span>📍</span>
                  <strong>Address:</strong>
                  <span>{unlockedData?.address || unlockedData?.landlord_address || l.landlord_address || `${l.area}, ${l.state}`}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.92rem", color: "#1e293b" }}>
                  <span>💰</span>
                  <strong>Price:</strong>
                  <span>₦{(unlockedData?.price || l.price)?.toLocaleString()}{isSale ? "" : "/year"}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: "linear-gradient(135deg,#f0f3ff,#eaefff)", border: "1px solid #c7d4fd", borderRadius: 13, padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "0.96rem", marginBottom: 3 }}>
                    {isSale ? "Get Direct Seller Contact" : "Get Direct Landlord Contact"}
                  </div>
                  <div style={{ color: "#6b7280", fontSize: "0.79rem" }}>
                    {isSale
                      ? "One-time ₦200 fee to unlock the seller's direct contact."
                      : "One-time ₦200 fee. No agent. No recurring charges."}
                  </div>
                </div>
                <Btn onClick={handlePayment}>
                  <Ic d={I.lock} s={14} /> Unlock for ₦200
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
