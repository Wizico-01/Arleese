export default function TermsPage({ setPage }) {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
      <button
        onClick={() => setPage('home')}
        style={{
          background: "none", border: "none",
          color: "#0d1b5e", fontWeight: 600,
          cursor: "pointer", marginBottom: 24,
          fontSize: "0.9rem", fontFamily: "inherit",
        }}
      >
        ← Back to Home
      </button>

      <h1 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: "2rem", color: "#0d1b5e", marginBottom: 8,
      }}>
        Terms of Service
      </h1>
      <p style={{ color: "#6b7280", marginBottom: 32 }}>
        Last updated: May 2025
      </p>

      {/* PASTE YOUR TERMS SECTIONS HERE LIKE THIS: */}
      <h2 style={{ color: "#0d1b5e", fontSize: "1.1rem", marginBottom: 8 }}>
        1. Introduction
      </h2>
      <p style={{ color: "#374151", lineHeight: 1.8, marginBottom: 24 }}>
        YOUR TERMS TEXT GOES HERE...
      </p>

      <h2 style={{ color: "#0d1b5e", fontSize: "1.1rem", marginBottom: 8 }}>
        2. User Responsibilities
      </h2>
      <p style={{ color: "#374151", lineHeight: 1.8, marginBottom: 24 }}>
        YOUR TERMS TEXT GOES HERE...
      </p>

      {/* ADD AS MANY SECTIONS AS YOU NEED */}

      {/* PRIVACY POLICY SECTION */}
      <h1 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: "2rem", color: "#0d1b5e",
        marginTop: 48, marginBottom: 8,
      }}>
        Privacy Policy
      </h1>
      <p style={{ color: "#374151", lineHeight: 1.8, marginBottom: 24 }}>
        YOUR PRIVACY POLICY TEXT GOES HERE...
      </p>
    </div>
  )
}