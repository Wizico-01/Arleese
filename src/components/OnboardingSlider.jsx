import { useState, useEffect, useRef } from 'react'

const slides = [
  {
    video: "https://res.cloudinary.com/dbge3ag4t/video/upload/v1785065740/InShot_20260725_203651211_yluexu.mp4",
    headline: "Find Your Next Home.",
    subtext: "Browse available apartments across all 36 states and connect with a verified Arleece Home Guide.",
    cta: "Get Started",
    ctaAction: "register",
    secondaryCta: "Sign In",
    secondaryAction: "login",
  },
  {
    video: "https://res.cloudinary.com/dbge3ag4t/video/upload/v1785065740/InShot_20260726_013916377_xays0n.mp4",
    headline: "Browse Apartments Across Nigeria.",
    subtext: "Real listings and real photos, posted by verified Arleece Home Guides.",
    cta: "Browse Apartments",
    ctaAction: "browse",
    secondaryCta: "Skip",
    secondaryAction: "skip",
  },
  {
    video: "https://res.cloudinary.com/dbge3ag4t/video/upload/v1785065740/InShot_20260725_203202198_uytkox.mp4",
    headline: "Unlock Your Home Guide's Contact for ₦200.",
    subtext: "Pay once and get your Home Guide's phone number plus your personal Arleece ID.",
    cta: "Create Free Account",
    ctaAction: "register",
    secondaryCta: "Sign In",
    secondaryAction: "login",
  },
  {
    video: "https://res.cloudinary.com/dbge3ag4t/video/upload/v1785065739/InShot_20260725_202314668_jihvi1.mp4",
    headline: "Move In With 30% Off.",
    subtext: "Show your Arleece ID to our logistics partner and enjoy 30% off your move.",
    cta: "Start Browsing",
    ctaAction: "browse",
    secondaryCta: "Join as a Home Guide",
    secondaryAction: "register-landlord",
  },
]

const AUTO_ADVANCE_MS = 6000

export default function OnboardingSlider({ setPage, onDismiss }) {
  const [current, setCurrent] = useState(0)
  const [prevIdx, setPrevIdx] = useState(null)
  const [currentReady, setCurrentReady] = useState(false)
  const [animating, setAnimating] = useState(false)
  const videoRefs = useRef([])
  const total = slides.length
  const nextIdx = (current + 1) % total

  // Only the current video loads first. The next one loads after the current is ready.
  const shouldLoad = (idx) =>
    idx === current || idx === prevIdx || (currentReady && idx === nextIdx)

  const goTo = (idx) => {
    if (animating || idx === current) return
    setAnimating(true)
    setTimeout(() => {
      setPrevIdx(current)
      setCurrent(idx)
      setAnimating(false)
    }, 250)
  }

  // Play the current video, pause the rest
  useEffect(() => {
    const v = videoRefs.current[current]
    if (v && v.readyState >= 2) {
      setCurrentReady(true)
      v.currentTime = 0
      v.play().catch(() => {})
    } else {
      setCurrentReady(false)
    }
    videoRefs.current.forEach((vid, i) => {
      if (vid && i !== current) vid.pause()
    })
  }, [current])

  // Auto-advance
  useEffect(() => {
    const t = setTimeout(() => goTo((current + 1) % total), AUTO_ADVANCE_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  const handleCta = (action) => {
    if (action === 'skip') {
      onDismiss()
      return
    }
    setPage(action)
  }

  const slide = slides[current]

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      background: "linear-gradient(160deg,#060e33 0%,#0d1b5e 60%,#1a3bdb 100%)",
      overflow: "hidden",
    }}>

      {/* VIDEO BACKGROUNDS */}
      {slides.map((s, idx) => (
        <video
          key={idx}
          ref={el => (videoRefs.current[idx] = el)}
          src={shouldLoad(idx) ? s.video : undefined}
          poster={s.poster}
          muted
          loop
          playsInline
          preload={idx === current ? "auto" : "metadata"}
          onLoadedData={() => {
            if (idx === current) {
              setCurrentReady(true)
              videoRefs.current[idx]?.play().catch(() => {})
            }
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: idx === current ? 1 : 0,
            transition: "opacity 0.6s ease",
            zIndex: 1,
          }}
        />
      ))}

      {/* DARK OVERLAY so text stays readable */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.75) 75%, rgba(0,0,0,0.92) 100%)",
        zIndex: 2,
      }} />

      {/* TAP LEFT / RIGHT TO MOVE BETWEEN SLIDES */}
      <div
        style={{ position: "absolute", inset: 0, zIndex: 2, cursor: "pointer" }}
        onClick={(e) => {
          if (e.clientX < window.innerWidth / 2) {
            goTo((current - 1 + total) % total)
          } else {
            goTo((current + 1) % total)
          }
        }}
      />

      {/* TOP BAR */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        padding: "52px 24px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 3,
        pointerEvents: "none",
      }}>
        <div style={{
          fontFamily: "'DM Serif Display', serif",
          color: "#fff",
          fontSize: "1.4rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
        }}>
          ARLEECE
        </div>
        <button
          onClick={() => handleCta('skip')}
          style={{
            pointerEvents: "auto",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "#fff",
            borderRadius: 20,
            padding: "6px 16px",
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            backdropFilter: "blur(8px)",
          }}
        >
          Skip
        </button>
      </div>

      {/* SLIDE CONTENT */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "0 24px 52px",
        zIndex: 3,
        opacity: animating ? 0 : 1,
        transform: animating ? "translateY(12px)" : "translateY(0)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
      }}>

        {/* DOTS */}
        <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
          {slides.map((_, idx) => (
            <div
              key={idx}
              onClick={() => goTo(idx)}
              style={{
                height: 4,
                borderRadius: 2,
                background: idx === current ? "#fff" : "rgba(255,255,255,0.35)",
                width: idx === current ? 28 : 8,
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
            />
          ))}
        </div>

        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          color: "#fff",
          fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
          lineHeight: 1.2,
          marginBottom: 14,
          fontWeight: 700,
        }}>
          {slide.headline}
        </h1>

        <p style={{
          color: "rgba(255,255,255,0.82)",
          fontSize: "0.9rem",
          lineHeight: 1.7,
          marginBottom: 32,
          maxWidth: 420,
        }}>
          {slide.subtext}
        </p>

        <button
          onClick={() => handleCta(slide.ctaAction)}
          style={{
            width: "100%",
            background: "#fff",
            color: "#0d1b5e",
            border: "none",
            borderRadius: 12,
            padding: "16px 0",
            fontSize: "1rem",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            marginBottom: 12,
          }}
        >
          {slide.cta}
        </button>

        <button
          onClick={() => handleCta(slide.secondaryAction)}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.12)",
            color: "#fff",
            border: "1.5px solid rgba(255,255,255,0.3)",
            borderRadius: 12,
            padding: "15px 0",
            fontSize: "0.92rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            backdropFilter: "blur(8px)",
          }}
        >
          {slide.secondaryCta}
        </button>
      </div>
    </div>
  )
}