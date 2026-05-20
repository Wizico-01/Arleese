export default function TermsPage({ setPage }) {
  return (
    <div style={{
      background: "#f4f3ef",
      minHeight: "100vh",
      paddingBottom: 80,
    }}>
      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg,#060e33,#0d1b5e)",
        padding: "30px 20px",
      }}>
        <button
          onClick={() => setPage('home')}
          style={{
            background: "rgba(255,255,255,.1)", border: "none",
            color: "#fff", borderRadius: 8, padding: "7px 14px",
            cursor: "pointer", fontSize: "0.82rem",
            fontFamily: "inherit", marginBottom: 14,
          }}
        >
          ← Back
        </button>
        <h1 style={{
          fontFamily: "'DM Serif Display',serif",
          color: "#fff", fontSize: "1.6rem",
        }}>
          Terms & Privacy
        </h1>
      </div>

      <div style={{ padding: "28px 20px", maxWidth: 700, margin: "0 auto" }}>

        {/* TERMS OF SERVICE */}
        <div style={{
          background: "#fff", borderRadius: 16,
          padding: "24px 20px", marginBottom: 20,
          border: "1px solid #e8e8e0",
        }}>
          <h2 style={{
            fontFamily: "'DM Serif Display',serif",
            fontSize: "1.4rem", color: "#0d1b5e", marginBottom: 16,
          }}>
            Terms of Service
          </h2>
          <p style={{ color: "#374151", lineHeight: 1.8, marginBottom: 16 }}>
            {/* PASTE YOUR TERMS OF SERVICE TEXT HERE */}
            By using Arleese, you agree to our terms and conditions.
            Arleese connects landlords and tenants directly.
            We are not responsible for any disputes between landlords and tenants.
          </p>
          <p style={{ color: "#374151", lineHeight: 1.8, marginBottom: 16 }}>
            {/* ADD MORE SECTIONS AS NEEDED */}
            The ₦100 unlock fee is non-refundable once a landlord contact has been revealed.
          </p>
        </div>

        {/* PRIVACY POLICY */}
        <div style={{
          background: "#fff", borderRadius: 16,
          padding: "24px 20px",
          border: "1px solid #e8e8e0",
        }}>
          <h2 style={{
            fontFamily: "'DM Serif Display',serif",
            fontSize: "1.4rem", color: "#0d1b5e", marginBottom: 16,
          }}>
            Privacy Policy
          </h2>
          <p style={{ color: "#374151", lineHeight: 1.8, marginBottom: 16 }}>
            {/* PASTE YOUR PRIVACY POLICY TEXT HERE */}
            Arleese collects your name, email, phone number and state of residence
            to create your account. Landlords also provide their NIN for verification.
          </p>
          <p style={{ color: "#374151", lineHeight: 1.8 }}>
            {/* ADD MORE SECTIONS AS NEEDED */}
            We do not sell your personal data to third parties.
            Your NIN is stored securely and used only for identity verification.
          </p>
        </div>
      </div>
    </div>
  )
}