import Logo from './Logo'

export default function Footer({ setPage }) {
  return (
    <footer style={{
      background: "#060e33",
      color: "rgba(255,255,255,.45)",
      padding: "36px 24px",
      textAlign: "center",
    }}>
      {/* ✅ FIX: wrap logo in a div with filter to force it white */}
      <div style={{ filter: "brightness(0) invert(1)", display: "inline-block" }}>
        <Logo />
      </div>

      <p style={{ fontSize: "0.78rem", marginTop: 14 }}>
        © {new Date().getFullYear()} Arleece &nbsp;·&nbsp;
        Fighting unfair agent fees, one listing at a time.
      </p>
      <div style={{
        display: "flex", gap: 20,
        justifyContent: "center", marginTop: 10, flexWrap: "wrap",
      }}>
        {[
          { label: "About", page: "home" },
          { label: "Terms of Service", page: "terms" },
          { label: "Privacy Policy", page: "terms" },
          { label: "Contact Us", page: "home" },
        ].map(({ label, page }) => (
          <span
            key={label}
            onClick={() => setPage(page)}
            style={{
              fontSize: "0.76rem", cursor: "pointer",
              // ✅ FIX: slightly brighter so links are visible
              color: "rgba(255,255,255,.6)",
              textDecoration: "underline",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </footer>
  )
}