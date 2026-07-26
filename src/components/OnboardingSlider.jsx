import { useState, useEffect, useRef } from 'react'

const slides = [
  {
    video: "https://res.cloudinary.com/dbge3ag4t/video/upload/v1785065740/InShot_20260725_203651211_yluexu.mp4",
    headline: "Rent a Home Directly from the Landlord.",
    subtext: "No agents. No 20% commission. No inspection fees. Just you and the landlord.",
    cta: "Get Started",
    ctaAction: "register",
    secondaryCta: "Sign In",
    secondaryAction: "login",
  },
  {
    video: "https://res.cloudinary.com/dbge3ag4t/video/upload/v1785065740/InShot_20260726_013916377_xays0n.mp4",
    headline: "Browse Verified Apartments Across All 36 States.",
    subtext: "Thousands of real listings uploaded directly by landlords. What you see is what you get.",
    cta: "Browse Apartments",
    ctaAction: "browse",
    secondaryCta: "Skip",
    secondaryAction: "skip",
  },
  {
    video: "https://res.cloudinary.com/dbge3ag4t/video/upload/v1785065740/InShot_20260725_203202198_uytkox.mp4",
    headline: "Pay ₦200. Get the Landlord's Direct Contact.",
    subtext: "One flat fee. No recurring charges. Call the landlord yourself, negotiate your own terms, move in your way.",
    cta: "Create Free Account",
    ctaAction: "register",
    secondaryCta: "Sign In",
    secondaryAction: "login",
  },
  {
    video: "https://res.cloudinary.com/dbge3ag4t/video/upload/v1785065739/InShot_20260725_202314668_jihvi1.mp4",
    headline: "Sell or Rent Your Property Directly to Buyers.",
    subtext: "Landlords list for free. Tenants and buyers contact you directly. Zero agent commission. Ever.",
    cta: "List Your Property Free",
    ctaAction: "register-landlord",
    secondaryCta: "Browse First",
    secondaryAction: "browse",
  },
]

export default function OnboardingSlider({ setPage, onDismiss }) {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const videoRefs = useRef([])
  const autoPlayRef = useRef(null)

  useEffect(() => {
    startAutoPlay()
    return () => clearAutoPlay()
  }, [current])

  useEffect(() => {
    // Play current video, pause others
    videoRefs.current.forEach((video, idx) => {
      if (!video) return
      if (idx === current) {
        video.currentTime = 0
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    })
  }, [current])

  const startAutoPlay = () => {
    clearAutoPlay()
    autoPlayRef.current = setTimeout(() => {
      goToNext()
    }, 6000) // Auto advance every 6 seconds
  }

  const clearAutoPlay = () => {
    if (autoPlayRef.current) {
      clearTimeout(autoPlayRef.current)
    }
  }

  const goToNext = () => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setCurrent(prev => (prev + 1) % slides.length)
      setAnimating(false)
    }, 300)
  }

  const goToSlide = (idx) => {
    if (animating || idx === current) return
    clearAutoPlay()
    setAnimating(true)
    setTimeout(() => {
      setCurrent(idx)
      setAnimating(false)
    }, 300)
  }

  const handleCta = (action) => {
    clearAutoPlay()
    if (action === 'skip') {
      onDismiss()
      return
    }
    onDismiss()
    setPage(action)
  }

  const slide = slides[current]

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      background: "#000",
      overflow: "hidden",
    }}>

      {/* VIDEO BACKGROUNDS */}
      {slides.map((s, idx) => (
        <video
          key={idx}
          ref={el => videoRefs.current[idx] = el}
          src={s.video}
          muted
          loop
          playsInline
          autoPlay={idx === 0}
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

      {/* DARK OVERLAY — makes text readable over any video */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.75) 75%, rgba(0,0,0,0.92) 100%)",
        zIndex: 2,
      }} />

      {/* TOP BAR — Logo + Skip */}
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
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}>

        {/* SLIDE DOTS */}
        <div style={{
          display: "flex",
          gap: 6,
          marginBottom: 28,
        }}>
          {slides.map((_, idx) => (
            <div
              key={idx}
              onClick={() => goToSlide(idx)}
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

        {/* HEADLINE */}
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

        {/* SUBTEXT */}
        <p style={{
          color: "rgba(255,255,255,0.82)",
          fontSize: "0.9rem",
          lineHeight: 1.7,
          marginBottom: 32,
          maxWidth: 420,
        }}>
          {slide.subtext}
        </p>

        {/* PRIMARY CTA BUTTON */}
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
            letterSpacing: "0.01em",
          }}
        >
          {slide.cta}
        </button>

        {/* SECONDARY CTA BUTTON */}
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

      {/* SWIPE GESTURE AREA */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          cursor: "pointer",
        }}
        onClick={(e) => {
          const x = e.clientX
          const width = window.innerWidth
          if (x < width / 2) {
            // Tapped left — go back
            clearAutoPlay()
            setAnimating(true)
            setTimeout(() => {
              setCurrent(prev => prev === 0 ? slides.length - 1 : prev - 1)
              setAnimating(false)
            }, 300)
          } else {
            // Tapped right — go forward
            clearAutoPlay()
            goToNext()
          }
        }}
      />
    </div>
  )
      }
