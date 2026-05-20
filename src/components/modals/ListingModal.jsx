import { useState } from 'react'
import { Ic, I } from '../Icons'
import { Btn, Badge } from '../UI'

export default function ListingModal({ listing: l, onClose, onUnlock, user, setPage }) {
  const [mainImg, setMainImg] = useState(l.images?.[0] || l.img || "")
  const [showFullImg, setShowFullImg] = useState(false)

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

          {/* UNLOCK BANNER */}
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
                <div style={{
                  fontWeight: 700, color: "#0d1b5e",
                  fontSize: "0.96rem", marginBottom: 3,
                }}>
                  Get Direct Landlord Contact
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.79rem" }}>
                  One-time ₦100 fee. No agent. No recurring charges.
                </div>
              </div>
              <Btn onClick={() => { if (!user) { setPage('login') } else { onUnlock() } }}>
                <Ic d={I.lock} s={14} /> Unlock for ₦100
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}