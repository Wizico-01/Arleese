import { supabase } from '../lib/supabase'
import { useState, useRef } from 'react'
import { Btn, Field, Sel, Card, ErrBox } from '../components/UI'
import { Ic, I } from '../components/Icons'
import { NG_STATES, PROP_TYPES, AMENITIES } from '../data/constants'

export default function AddListingForm({ onBack, onSubmit }) {
  const [step, setStep] = useState(1)
  const [err, setErr] = useState("")
  const [form, setForm] = useState({
    title: "", type: "", state: "", area: "",
    price: "", beds: "", baths: "", size: "",
    desc: "", amenities: [], images: [],
  })
  const imgRef = useRef()
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const toggleAmenity = (a) => {
    set("amenities", form.amenities.includes(a)
      ? form.amenities.filter(x => x !== a)
      : [...form.amenities, a]
    )
  }

  const validateStep1 = () => {
    if (!form.title || !form.type || !form.state || !form.area || !form.price) {
      setErr("Please fill all required fields."); return false
    }
    setErr(""); return true
  }

  const validateStep2 = () => {
    if (!form.beds || !form.baths) {
      setErr("Please specify bedrooms and bathrooms."); return false
    }
    setErr(""); return true
  }

  const handleSubmit = async () => {
  setLoading(true)
  try {
    let imageUrls = []

    // Upload each image to Supabase Storage
    for (const imgFile of form.imageFiles || []) {
      const filePath = `${Date.now()}-${imgFile.name}`
      const { data: uploadData } = await supabase.storage
        .from('apartment-images')
        .upload(filePath, imgFile)

      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('apartment-images')
          .getPublicUrl(filePath)
        imageUrls.push(urlData.publicUrl)
      }
    }

    // Save listing to database
    const { error } = await supabase.from('listings').insert({
      title: form.title,
      type: form.type,
      state: form.state,
      area: form.area,
      price: Number(form.price),
      beds: Number(form.beds),
      baths: Number(form.baths),
      size: form.size,
      description: form.desc,
      amenities: form.amenities,
      images: imageUrls,
      status: 'active',
      landlord_id: user.id,
    })

    if (error) { setErr(error.message); setLoading(false); return }
    onSubmit()
  } catch (e) {
    setErr("Something went wrong. Please try again.")
  }
  setLoading(false)
}

  const STEPS = ["Basic Info", "Details & Amenities", "Photos & Review"]

  return (
    <div style={{ background: "#f4f3ef", minHeight: "100vh" }}>

      {/* ── HEADER ── */}
      <div style={{ background: "linear-gradient(135deg,#060e33,#0d1b5e)", padding: "26px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,.1)", border: "none",
              color: "#fff", borderRadius: 8, padding: "7px 14px",
              cursor: "pointer", fontSize: "0.82rem", fontFamily: "inherit",
            }}
          >
            ← Back
          </button>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", color: "#fff", fontSize: "1.45rem" }}>
            Add New Listing
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "28px 24px" }}>

        {/* ── PROGRESS BAR ── */}
        <div style={{ display: "flex", borderRadius: 12, overflow: "hidden", marginBottom: 26, border: "1px solid #e8e8e0" }}>
          {STEPS.map((s, i) => (
            <div
              key={s}
              style={{
                flex: 1, padding: "10px 4px", textAlign: "center",
                background: step === i + 1 ? "#0d1b5e" : step > i + 1 ? "#1e3db5" : "#fff",
                color: step >= i + 1 ? "#fff" : "#9ca3af",
                fontSize: "0.76rem",
                fontWeight: step === i + 1 ? 700 : 500,
                transition: "all .3s",
                borderRight: i < 2 ? "1px solid #e8e8e0" : "none",
              }}
            >
              {s}
            </div>
          ))}
        </div>

        <Card style={{ padding: "28px 26px" }}>
          <ErrBox msg={err} />

          {/* ══ STEP 1: BASIC INFO ══ */}
          {step === 1 && (
            <div>
              <h3 style={{ fontWeight: 700, color: "#0d1b5e", marginBottom: 18, fontSize: "1.05rem" }}>
                Basic Information
              </h3>

              <Field
                label="Property Title"
                placeholder="e.g. Spacious 2-Bedroom Flat in Lekki Phase 1"
                value={form.title}
                onChange={e => set("title", e.target.value)}
                required
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Sel
                  label="Property Type"
                  value={form.type}
                  onChange={e => set("type", e.target.value)}
                  options={PROP_TYPES}
                  required
                />
                <Sel
                  label="State"
                  value={form.state}
                  onChange={e => set("state", e.target.value)}
                  options={NG_STATES}
                  required
                />
              </div>

              <Field
                label="Area / Neighbourhood"
                placeholder="e.g. Lekki Phase 1, Chevron Drive"
                value={form.area}
                onChange={e => set("area", e.target.value)}
                required
              />

              <Field
                label="Annual Rent (₦)"
                type="number"
                placeholder="e.g. 650000"
                value={form.price}
                onChange={e => set("price", e.target.value)}
                required
                note="Enter the yearly rent in Naira. This is the exact amount shown to tenants."
              />

              <Field
                label="Property Description"
                placeholder="Describe the apartment — location, condition, compound type, nearby landmarks…"
                value={form.desc}
                onChange={e => set("desc", e.target.value)}
                rows={4}
              />

              <Btn full onClick={() => { if (validateStep1()) setStep(2) }}>
                Continue →
              </Btn>
            </div>
          )}

          {/* ══ STEP 2: DETAILS & AMENITIES ══ */}
          {step === 2 && (
            <div>
              <h3 style={{ fontWeight: 700, color: "#0d1b5e", marginBottom: 18, fontSize: "1.05rem" }}>
                Details & Amenities
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <Field
                  label="Bedrooms"
                  type="number"
                  placeholder="e.g. 2"
                  value={form.beds}
                  onChange={e => set("beds", e.target.value)}
                  required
                />
                <Field
                  label="Bathrooms"
                  type="number"
                  placeholder="e.g. 1"
                  value={form.baths}
                  onChange={e => set("baths", e.target.value)}
                  required
                />
                <Field
                  label="Size"
                  placeholder="e.g. 80sqm"
                  value={form.size}
                  onChange={e => set("size", e.target.value)}
                />
              </div>

              {/* AMENITIES CHECKLIST */}
              <div style={{ marginBottom: 22 }}>
                <label style={{
                  display: "block", fontSize: "0.79rem",
                  fontWeight: 600, color: "#4b5563", marginBottom: 10,
                }}>
                  Amenities{" "}
                  <span style={{ fontWeight: 400, color: "#9ca3af" }}>
                    (select all that apply)
                  </span>
                </label>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(162px,1fr))",
                  gap: 7,
                }}>
                  {AMENITIES.map(a => {
                    const on = form.amenities.includes(a)
                    return (
                      <div
                        key={a}
                        onClick={() => toggleAmenity(a)}
                        style={{
                          display: "flex", alignItems: "center", gap: 7,
                          padding: "8px 11px",
                          border: `1.5px solid ${on ? "#0d1b5e" : "#e5e7eb"}`,
                          borderRadius: 8, cursor: "pointer",
                          background: on ? "#eef2ff" : "#fafafa",
                          fontSize: "0.8rem",
                          color: on ? "#0d1b5e" : "#374151",
                          fontWeight: on ? 600 : 400,
                          transition: "all .18s",
                          userSelect: "none",
                        }}
                      >
                        <div style={{
                          width: 15, height: 15, borderRadius: 4,
                          border: `2px solid ${on ? "#0d1b5e" : "#d1d5db"}`,
                          background: on ? "#0d1b5e" : "transparent",
                          display: "flex", alignItems: "center",
                          justifyContent: "center", flexShrink: 0,
                        }}>
                          {on && <Ic d={I.check} s={9} stroke="#fff" sw={3} />}
                        </div>
                        {a}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <Btn variant="secondary" onClick={() => setStep(1)}>← Back</Btn>
                <Btn full onClick={() => { if (validateStep2()) setStep(3) }}>Continue →</Btn>
              </div>
            </div>
          )}

          {/* ══ STEP 3: PHOTOS & REVIEW ══ */}
          {step === 3 && (
            <div>
              <h3 style={{ fontWeight: 700, color: "#0d1b5e", marginBottom: 6, fontSize: "1.05rem" }}>
                Photos & Review
              </h3>
              <p style={{ color: "#6b7280", fontSize: "0.83rem", marginBottom: 16 }}>
                Upload clear photos of the apartment. Good photos attract more tenants.
                Minimum 3 photos recommended.
              </p>

              {/* UPLOAD AREA */}
              <div
                onClick={() => imgRef.current.click()}
                style={{
                  border: "2px dashed #d1d5db", borderRadius: 12,
                  padding: "32px", textAlign: "center",
                  cursor: "pointer", background: "#fafafa",
                  transition: "all .2s", marginBottom: 16,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#0d1b5e"
                  e.currentTarget.style.background = "#f0f4ff"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "#d1d5db"
                  e.currentTarget.style.background = "#fafafa"
                }}
              >
                <input
                  ref={imgRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={e => {
                    const urls = Array.from(e.target.files).map(f => URL.createObjectURL(f))
                    set("images", [...form.images, ...urls])
                  }}
                />
                <Ic d={I.img} s={34} stroke="#9ca3af" />
                <p style={{ fontSize: "0.88rem", color: "#6b7280", marginTop: 9, fontWeight: 500 }}>
                  Click to upload apartment photos
                </p>
                <p style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 3 }}>
                  JPG or PNG · Max 10MB each · Multiple allowed
                </p>
              </div>

              {/* IMAGE PREVIEWS */}
              {form.images.length > 0 && (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(90px,1fr))",
                  gap: 8, marginBottom: 18,
                }}>
                  {form.images.map((img, idx) => (
                    <div key={idx} style={{ position: "relative", borderRadius: 8, overflow: "hidden" }}>
                      <img src={img} alt="" style={{ width: "100%", height: 72, objectFit: "cover", display: "block" }} />
                      <button
                        onClick={() => set("images", form.images.filter((_, j) => j !== idx))}
                        style={{
                          position: "absolute", top: 3, right: 3,
                          width: 18, height: 18, borderRadius: "50%",
                          background: "rgba(0,0,0,.6)", border: "none",
                          color: "#fff", cursor: "pointer",
                          display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: "0.65rem",
                        }}
                      >
                        ✕
                      </button>
                      {idx === 0 && (
                        <div style={{
                          position: "absolute", bottom: 3, left: 3,
                          background: "#0d1b5e", color: "#fff",
                          fontSize: "0.58rem", padding: "1px 5px",
                          borderRadius: 3, fontWeight: 700,
                        }}>
                          COVER
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* LISTING SUMMARY */}
              <div style={{ background: "#f4f3ef", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <h4 style={{
                  fontWeight: 700, color: "#374151",
                  fontSize: "0.82rem", marginBottom: 10, letterSpacing: "0.03em",
                }}>
                  📋 LISTING SUMMARY
                </h4>
                {[
                  ["Title", form.title],
                  ["Type", form.type],
                  ["Location", form.area && form.state ? `${form.area}, ${form.state}` : "—"],
                  ["Annual Rent", form.price ? `₦${Number(form.price).toLocaleString()}` : "—"],
                  ["Bedrooms", form.beds || "—"],
                  ["Bathrooms", form.baths || "—"],
                  ["Size", form.size || "—"],
                  ["Photos", form.images.length > 0 ? `${form.images.length} uploaded` : "None"],
                  ["Amenities", form.amenities.length > 0
                    ? form.amenities.slice(0, 4).join(", ") + (form.amenities.length > 4 ? ` +${form.amenities.length - 4} more` : "")
                    : "None selected"],
                ].map(([k, v]) => (
                  <div key={k} style={{
                    display: "flex", gap: 10,
                    fontSize: "0.81rem", padding: "5px 0",
                    borderBottom: "1px solid #e8e8e0",
                  }}>
                    <span style={{ color: "#9ca3af", minWidth: 80 }}>{k}:</span>
                    <span style={{ color: "#0d1b5e", fontWeight: 600, flex: 1 }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <Btn variant="secondary" onClick={() => setStep(2)}>← Back</Btn>
                <Btn full onClick={handleSubmit}>
                  <Ic d={I.check} s={15} /> Submit Listing
                </Btn>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}