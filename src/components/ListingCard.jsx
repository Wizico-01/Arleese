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
          src={listing.images?.[0] || listing.img || ""}
          alt={listing.title}
          style={{ width: "100%", height: 196, objectFit: "cover", display: "block" }}
        />
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
          {listing.verified && listing.status !== 'rented' && (
            <Badge color="#fff" bg="#0d1b5e">
              <Ic d={I.shield} s={10} fill="#fff" stroke="none" />
              Verified
            </Badge>
          )}
          {listing.status === 'rented' && (
            /* REMOVED: Key emoji. Kept clean premium white text typography for top-image overlay */
            <Badge color="#fff" bg="#b91c1c">
              Rented Out
            </Badge>
          )}
        </div>
        
        <div style={{
          position: "absolute", bottom: 10, right: 10,
          background: "rgba(0,0,0,.55)", color: "#fff",
          borderRadius: 6, padding: "2px 9px", fontSize: "0.7rem",
        }}>
          {!listing.days && listing.days !== 0 ? "New" :
            listing.days === 0 ? "Today" :
            listing.days === 1 ? "Yesterday" :
            `${listing.days}d ago`}
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

        {/* METRICS ROW */}
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          {/* REPLACED: Frying pan emoji with your platform's vector icon system */}
          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#6b7280", fontSize: "0.77rem" }}>
            <Ic d={I.home} s={12} /> {listing.kitchs} Kitchen
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#6b7280", fontSize: "0.77rem" }}>
            <Ic d={I.bath} s={12} /> {listing.baths} Bath
          </span>
          <span style={{ color: "#6b7280", fontSize: "0.77rem", display: "flex", alignItems: "center" }}>
            {listing.size}
          </span>
        </div>

        {/* FOOTER VALUES */}
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

          {/* FIXED & REPLACED: Removed curly nesting loop and emoji structures completely */}
          {listing.status === "rented" ? (
            <Badge color="#991b1b" bg="#fee2e2">
              No Longer Available
            </Badge>
          ) : (
            <Badge color="#1e3db5" bg="#eef2ff">
              View Apartment
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}