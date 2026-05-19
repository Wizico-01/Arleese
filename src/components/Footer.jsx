import Logo from './Logo'

export default function Footer({ setPage }) {

  const handleNav = (pg) => {
    if (typeof setPage === 'function') {
      setPage(pg)
    }
  }

  return (
    <footer style={{
      background: "#060e33",
      padding: "32px 20px 40px",
      width: "100%",
    }}>

      {/* LINKS */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "10px 24px",
        marginBottom: 20,
      }}>
        {[
          { label: "About", pg: "home" },
          { label: "Terms of Service", pg: "terms" },
          { label: "Privacy Policy", pg: "terms" },
          { label: "Contact Us", pg: "home" },
        ].map(({ label, pg }) => (
          <button
            key={label}
            onClick={() => handleNav(pg)}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,.65)",
              fontSize: "0.82rem",
              cursor: "pointer",
              fontFamily: "inherit",
              padding: "4px 0",
              textDecoration: "underline",
              textDecorationColor: "rgba(255,255,255,.25)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* COPYRIGHT */}
      <p style={{
        textAlign: "center",
        color: "rgba(255,255,255,.35)",
        fontSize: "0.72rem",
        lineHeight: 1.7,
      }}>
        © {new Date().getFullYear()} Arleece.
        <br />
        Fighting unfair agent fees, one listing at a time.
      </p>
    </footer>
  )
}