export default function TermsPage({ setPage }) {
  const Section = ({ title, children }) => (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "24px 20px",
      marginBottom: 20, border: "1px solid #e8e8e0",
    }}>
      <h2 style={{
        fontFamily: "'DM Serif Display',serif",
        fontSize: "1.4rem", color: "#0d1b5e", marginBottom: 16,
      }}>
        {title}
      </h2>
      {children}
    </div>
  )

  const P = ({ children }) => (
    <p style={{ color: "#374151", lineHeight: 1.8, marginBottom: 14, fontSize: "0.92rem" }}>
      {children}
    </p>
  )

  return (
    <div style={{ background: "#f4f3ef", minHeight: "100vh", paddingBottom: 90 }}>
      <div style={{
        background: "linear-gradient(135deg,#060e33,#0d1b5e)",
        padding: "30px 20px",
      }}>
        <button
          onClick={() => window.history.back()}
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

        <Section title="Terms of Service">
          <P>
            Arleece helps people find apartments and properties across Nigeria and connects them with
            verified Arleece Home Guides. By using Arleece you agree to these terms.
          </P>
          <P>
            <strong>Free contact unlocking.</strong> Signing up is free. Unlocking a Home Guide's contact
            and an apartment's address is free for signed-in users.
          </P>
          <P>
            <strong>Home Guides.</strong> Home Guides are independent. Arleece verifies them before they can
            list, but Arleece does not guarantee that any apartment will be available, suitable or
            secured by you, and Arleece is not a party to any agreement between you and a Home Guide or
            property owner.
          </P>
          <P>
            <strong>Apartment codes.</strong> Each apartment has a unique code that you see after unlocking
            it. Show it to the Home Guide before an inspection so they can confirm it is the apartment you unlocked.
          </P>
          <P>
            <strong>Arleece ID.</strong> A one-time payment of ₦200 gives you one Arleece ID, valid for 30
            days and usable once. It entitles you to 30% off moving logistics from our logistics partner.
            You pay the logistics company directly. Arleece does not collect or handle logistics payments.
            The logistics partner confirms your ID before applying the discount.
          </P>
          <P>
            <strong>Credit back.</strong> If the logistics partner does not contact you within 24 hours of
            your move request, the ID fee is returned as Arleece app credit, not cash. Credit is valid for
            12 months and can only be used to get a new Arleece ID. We may limit automatic credit
            returns per account and review accounts with repeated returns.
          </P>
          <P>
            <strong>Your account.</strong> Give accurate information and keep your login private. We may
            suspend accounts that misuse Arleece.
          </P>
        </Section>

        <Section title="Privacy Policy">
          <P>
            <strong>What we collect.</strong> Your name, email, phone number and state when you sign up.
            Home Guides also provide a NIN and documents so we can verify them. We record which apartments
            you unlock and the Arleece IDs and payments linked to your account.
          </P>
          <P>
            <strong>Payments.</strong> Payments are processed by Paystack. We do not see or store your card details.
          </P>
          <P>
            <strong>Who sees your information.</strong> Home Guides can see the names of tenants who unlocked
            their apartments. Our logistics partner sees your name and the status of your Arleece ID when
            they verify it. We share only what is needed for these purposes and we do not sell your personal data.
          </P>
          <P>
            <strong>Your NIN.</strong> A Home Guide's NIN is used for verification only and is not shown to other users.
          </P>
          <P>
            <strong>Your rights.</strong> You can ask to see, correct or delete your data. Contact us
            through the WhatsApp button or send us a mail with arleece1@gmail.com.
          </P>
        </Section>

      </div>
    </div>
  )
}
