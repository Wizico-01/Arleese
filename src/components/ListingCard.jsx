import { Ic, I } from './Icons'
import { Badge } from './UI'

export default function ListingCard({ listing, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #e8e8e0",
        boxShadow: "0 2px 6px rgba(0,0,0,.05)",
        cursor: "pointer",
        transition: "transform .2s, box-shadow .2s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-3px)"
        e.currentTarget.style.boxShadow = "0 8px 22px rgba(0,0,0,.1)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "none"
        e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,.05)"
      }}
    >
      {/* IMAGE */}
      <div style={{ position: "relative" }}>
        <img
          src={listing.img}
          alt={listing.title}
          style={{ width: "100%", height: 196, objectFit: "cover", display: "block" }}
        />
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
  {listing.verified && (
    <Badge color="#fff" bg="#0d1b5e">
      <Ic d={I.shield} s={10} fill="#fff" stroke="none" />
      Verified
    </Badge>
  )}
  {listing.status === "rented" && (
    <Badge color="#fff" bg="#b91c1c">
      🔑 Rented
    </Badge>
  )}
</div>
        <div style={{
          position: "absolute", bottom: 10, right: 10,
          background: "rgba(0,0,0,.55)", color: "#fff",
          borderRadius: 6, padding: "2px 9px", fontSize: "0.7rem",
        }}>
          {listing.days === 0 ? "Today" : listing.days === 1 ? "Yesterday" : `${listing.days}d ago`}
        </div>
      </div>

      {/* DETAILS */}
      <div style={{ padding: "16px 18px 18px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          color: "#6b7280", fontSize: "0.76rem", marginBottom: 5,
        }}>
          <Ic d={I.pin} s={12} />
          {listing.area}, {listing.state}
        </div>

        <h3 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: "1.06rem", color: "#0d1b5e",
          marginBottom: 10, lineHeight: 1.3,
        }}>
          {listing.title}
        </h3>

        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#6b7280", fontSize: "0.77rem" }}>
            <Ic d={I.bed} s={12} /> {listing.beds} Bed
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#6b7280", fontSize: "0.77rem" }}>
            <Ic d={I.bath} s={12} /> {listing.baths} Bath
          </span>
          <span style={{ color: "#6b7280", fontSize: "0.77rem" }}>{listing.size}</span>
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", borderTop: "1px solid #f0efea", paddingTop: 12,
        }}>
          <div>
            <div style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "1.06rem" }}>
              ₦{listing.price.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>per year</div>
          </div>
          {listing.status === "rented" ? (
  <Badge color="#991b1b" bg="#fee2e2">
    🔑 No Longer Available
  </Badge>
) : (
  <Badge color="#1e3db5" bg="#eef2ff">
    Unlock ₦100
  </Badge>
)}
        </div>
      </div>
    </div>
  )
}