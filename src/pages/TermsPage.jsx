export default function TermsPage({ setPage }) {
  return (
    <div style={{ padding: "40px 20px", maxWidth: 700, margin: "0 auto" }}>
      <button
        onClick={() => setPage('home')}
        style={{ background: "none", border: "none", color: "#0d1b5e",
          fontWeight: 600, cursor: "pointer", marginBottom: 24,
          fontSize: "0.9rem", fontFamily: "inherit" }}
      >
        ← Back
      </button>
      <h1 style={{ fontFamily: "'DM Serif Display',serif",
        fontSize: "1.8rem", color: "#0d1b5e", marginBottom: 16 }}>
        Terms of Service
      </h1>
      <p style={{ color: "#374151", lineHeight: 1.8, marginBottom: 24 }}>
        Add your terms here...
      </p>
      <h2 style={{ fontFamily: "'DM Serif Display',serif",
        fontSize: "1.4rem", color: "#0d1b5e", marginBottom: 12 }}>
        Privacy Policy
      </h2>
      <p style={{ color: "#374151", lineHeight: 1.8 }}>
        Add your privacy policy here...
      </p>
    </div>
  )
}