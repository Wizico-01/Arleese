import Logo from './Logo'

export default function Footer({ setPage }) {
  return (
    <footer style={{
      background: "#060e33",
      padding: "32px 20px 40px",
    }}>
      {/* LOGO */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: 16,
      }}>
        <Logo light />
      </div>

      {/* LINKS */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "8px 20px",
        marginBottom: 20,
      }}>
        {[
          { label: "About", pg: "home" },
          { label: "Terms of Service", pg: "terms" },
          { label: "Privacy Policy", pg: "terms" },
          { label: "Contact Us", pg: "home" },
        ].map(({ label, pg }) => (
          <span
            key={label}
            onClick={() => setPage(pg)}
            style={{
              color: "rgba(255,255,255,.55)",
              fontSize: "0.8rem",
              cursor: "pointer",
              textDecoration: "underline",
              textDecorationColor: "rgba(255,255,255,.2)",
            }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* COPYRIGHT */}
      <p style={{
        textAlign: "center",
        color: "rgba(255,255,255,.35)",
        fontSize: "0.72rem",
        lineHeight: 1.6,
      }}>
        © {new Date().getFullYear()} Arleese{"\n"}
        Fighting unfair agent fees, one listing at a time.
      </p>
    </footer>
  )
}