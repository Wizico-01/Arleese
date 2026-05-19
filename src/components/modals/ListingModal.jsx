import { Ic, I } from '../Icons'
import { Btn, Badge } from '../UI'

export default function ListingModal({ listing: l, onClose, onUnlock, user, setPage }) {
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
        {/* IMAGE */}
        <div style={{ position: "relative" }}>
          <img src={l.images?.[0] || l.img || ""} alt={l.title}
            style={{
              width: "100%", height: 250,
              objectFit: "cover",
              borderRadius: "18px 18px 0 0",
              display: "block",
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
                ₦{l.price.toLocaleString()}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#9ca3af", textAlign: "right" }}>
                per year
              </div>
            </div>
          </div>

          {/* STATS */}
          <div style={{
            display: "flex", gap: 10, flexWrap: "wrap",
            paddingBottom: 14, borderBottom: "1px solid #f0efea", marginBottom: 16,
          }}>
            {[
              { d: null, v: `${l.kitchs || 0} Kitchen` },
              { d: null, v: `${l.baths || 0} Bathroom${l.baths > 1 ? "s" : ""}` },
              { d: null, v: l.size },
              { d: null, v: l.type },
            ].map(({ d, v }) => (
              <div key={v} style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "#f4f3ef", borderRadius: 8,
                padding: "6px 12px", fontSize: "0.82rem", color: "#374151",
              }}>
                {d && <Ic d={d} s={13} />} {v}
              </div>
            ))}
          </div>
  
{/* PHOTO GALLERY */}
{l.images?.length > 0 && (
  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 6, marginBottom: 14,
  }}>
    {l.images.map((img, idx) => (
      <img key={idx} src={img} alt=""
        style={{ width:"100%", height:80, objectFit:"cover", borderRadius:8 }}
      />
    ))}
  </div>
)}

{/* VIDEOS */}
{l.videos?.length > 0 && (
  <div style={{ marginBottom: 14 }}>
    <p style={{ fontSize:"0.78rem", fontWeight:600, color:"#374151", marginBottom:8 }}>
      Videos
    </p>
    {l.videos.map((vid, idx) => (
      <video key={idx} src={vid} controls
        style={{ width:"100%", borderRadius:10, marginBottom:8, maxHeight:200 }}
      />
    ))}
  </div>
)}

          {/* AMENITIES */}
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
                <div style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "0.96rem", marginBottom: 3 }}>
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