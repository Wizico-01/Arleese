import { supabase } from '../lib/supabase'
import { useState, useRef } from 'react'
import { Btn, Field, Sel, Card, ErrBox } from '../components/UI'
import { Ic, I } from '../components/Icons'
import { NG_STATES, PROP_TYPES, AMENITIES } from '../data/constants'

export default function AddListingForm({ onBack, onSubmit, user }) {
  const [step, setStep] = useState(1)
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
  title: "", type: "", state: "", area: "",
  price: "", beds: "", baths: "", size: "",
  desc: "", amenities: [], images: [], imageFiles: [],
  videos: [], videoFiles: [],
})
  const imgRef = useRef()
  const videoRef = useRef()
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
    setErr("")
    try {
      let imageUrls = []

      // Upload each image to Supabase Storage
      for (const imgFile of form.imageFiles || []) {
        const filePath = `${Date.now()}-${imgFile.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('apartment-images')
          .upload(filePath, imgFile)

        if (uploadData) {
          const { data: urlData } = supabase.storage
            .from('apartment-images')
            .getPublicUrl(filePath)
          imageUrls.push(urlData.publicUrl)
        }
      }

      let videoUrls = []

// Upload each video to Supabase Storage
for (const vidFile of form.videoFiles || []) {
  const filePath = `videos/${Date.now()}-${vidFile.name}`
  const { data: uploadData } = await supabase.storage
    .from('apartment-images')
    .upload(filePath, vidFile)

  if (uploadData) {
    const { data: urlData } = supabase.storage
      .from('apartment-images')
      .getPublicUrl(filePath)
    videoUrls.push(urlData.publicUrl)
  }
}

      // Save listing to database
      const { data, error } = await supabase.from('listings').insert({
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
        videos: videoUrls,
        status: 'active',
        landlord_id: user.id,
})

      if (error) {
        setErr(error.message)
        setLoading(false)
        return
      }

      // Pass the new listing back to dashboard immediately
      onSubmit({
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
        img: imageUrls[0] || "",
        status: 'active',
        verified: true,
        views: 0,
        unlocks: 0,
      })

    } catch (e) {
      setErr("Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  const STEPS = ["Basic Info", "Details & Amenities", "Photos & Review"]

  // BLOCK unverified landlords
  if (!user?.verified) {
    return (
      <div style={{
        background: "#f4f3ef",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}>
        <div style={{ textAlign: "center", maxWidth: 380 }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>⏳</div>
          <h3 style={{
            fontFamily: "'DM Serif Display',serif",
            color: "#0d1b5e",
            fontSize: "1.4rem",
            marginBottom: 10,
          }}>
            Verification Pending
          </h3>
          <p style={{
            color: "#6b7280",
            fontSize: "0.87rem",
            lineHeight: 1.75,
            marginBottom: 24,
          }}>
            Your NIN is currently under review by the Arleece team.
            You will receive an email within <strong>10–30 minutes</strong> once
            your account is verified. Only verified landlords can list apartments.
          </p>
          <button
            onClick={onBack}
            style={{
              background: "#0d1b5e", color: "#fff",
              border: "none", borderRadius: 9,
              padding: "12px 26px", cursor: "pointer",
              fontSize: "0.9rem", fontWeight: 600,
              fontFamily: "inherit",
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: "#f4f3ef", minHeight: "100vh", paddingBottom: 80 }}>

      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg,#060e33,#0d1b5e)",
        padding: "26px 20px",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}>
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
          <h1 style={{
            fontFamily: "'DM Serif Display',serif",
            color: "#fff", fontSize: "1.3rem",
          }}>
            Add New Listing
          </h1>
        </div>
      </div>

      <div style={{ padding: "20px 16px" }}>

        {/* PROGRESS BAR */}
        <div style={{
          display: "flex",
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 20,
          border: "1px solid #e8e8e0",
        }}>
          {STEPS.map((s, i) => (
            <div
              key={s}
              style={{
                flex: 1, padding: "10px 4px", textAlign: "center",
                background: step === i + 1 ? "#0d1b5e" : step > i + 1 ? "#1e3db5" : "#fff",
                color: step >= i + 1 ? "#fff" : "#9ca3af",
                fontSize: "0.7rem",
                fontWeight: step === i + 1 ? 700 : 500,
                transition: "all .3s",
                borderRight: i < 2 ? "1px solid #e8e8e0" : "none",
              }}
            >
              {s}
            </div>
          ))}
        </div>

        <Card style={{ padding: "20px 16px" }}>
          <ErrBox msg={err} />

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h3 style={{
                fontWeight: 700, color: "#0d1b5e",
                marginBottom: 16, fontSize: "1rem",
              }}>
                Basic Information
              </h3>

              <Field
                label="Property Title"
                placeholder="e.g. 2-Bedroom Flat in Lekki Phase 1"
                value={form.title}
                onChange={e => set("title", e.target.value)}
                required
              />

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

              <Field
                label="Area / Neighbourhood"
                placeholder="e.g. Lekki Phase 1"
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
                note="Enter the yearly rent in Naira."
              />

              <Field
                label="Property Description"
                placeholder="Describe the apartment, location, condition, nearby landmarks…"
                value={form.desc}
                onChange={e => set("desc", e.target.value)}
                rows={4}
              />

              <Btn full onClick={() => { if (validateStep1()) setStep(2) }}>
                Continue →
              </Btn>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h3 style={{
                fontWeight: 700, color: "#0d1b5e",
                marginBottom: 16, fontSize: "1rem",
              }}>
                Details & Amenities
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field
                  label="Kitchen"
                  type="number"
                  placeholder="e.g. 2"
                  value={form.kitchs}
                  onChange={e => set("beds", e.target.value)}
                  required
                />
                <Field
                  label="Bathroom"
                  type="number"
                  placeholder="e.g. 1"
                  value={form.baths}
                  onChange={e => set("kiths", e.target.value)}
                  required
                />
              </div>

              {/* AMENITIES */}
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block", fontSize: "0.79rem",
                  fontWeight: 600, color: "#4b5563", marginBottom: 10,
                }}>
                  Amenities
                  <span style={{ fontWeight: 400, color: "#9ca3af" }}>
                    {" "}(select all that apply)
                  </span>
                </label>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
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
                          padding: "8px 10px",
                          border: `1.5px solid ${on ? "#0d1b5e" : "#e5e7eb"}`,
                          borderRadius: 8, cursor: "pointer",
                          background: on ? "#eef2ff" : "#fafafa",
                          fontSize: "0.78rem",
                          color: on ? "#0d1b5e" : "#374151",
                          fontWeight: on ? 600 : 400,
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

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h3 style={{
                fontWeight: 700, color: "#0d1b5e",
                marginBottom: 6, fontSize: "1rem",
              }}>
                Photos & Review
              </h3>
              <p style={{ color: "#6b7280", fontSize: "0.83rem", marginBottom: 14 }}>
               Upload up to 7 photos and videos of the apartment.
               Good media attracts more tenants.
               </p>

              {/* UPLOAD AREA */}
              <div
                onClick={() => imgRef.current.click()}
                style={{
                  border: "2px dashed #d1d5db", borderRadius: 12,
                  padding: "28px 16px", textAlign: "center",
                  cursor: "pointer", background: "#fafafa",
                  marginBottom: 14,
                }}
              >
                <input
  ref={imgRef}
  type="file"
  accept="image/*"
  multiple
  style={{ display: "none" }}
  onChange={e => {
    const files = Array.from(e.target.files)
    const combined = [...form.imageFiles, ...files]
    if (combined.length > 7) {
      setErr("Maximum 7 photos allowed.")
      return
    }
    const urls = files.map(f => URL.createObjectURL(f))
    set("images", [...form.images, ...urls])
    set("imageFiles", [...form.imageFiles, ...files])
  }}
/>
                <Ic d={I.img} s={30} stroke="#9ca3af" />
                <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: 8, fontWeight: 500 }}>
  Tap to upload photos
                </p>
                <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: 3 }}>
                JPG or PNG · Max 10MB each · Up to 7 photos
                </p>
              </div>

              {/* IMAGE PREVIEWS */}
              {form.images.length > 0 && (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 8, marginBottom: 16,
                }}>
                  {form.images.map((img, idx) => (
                    <div key={idx} style={{
                      position: "relative",
                      borderRadius: 8, overflow: "hidden",
                    }}>
                      <img
                        src={img} alt=""
                        style={{
                          width: "100%", height: 80,
                          objectFit: "cover", display: "block",
                        }}
                      />
                      <button
                        onClick={() => {
                          set("images", form.images.filter((_, j) => j !== idx))
                          set("imageFiles", form.imageFiles.filter((_, j) => j !== idx))
                        }}
                        style={{
                          position: "absolute", top: 3, right: 3,
                          width: 20, height: 20, borderRadius: "50%",
                          background: "rgba(0,0,0,.6)", border: "none",
                          color: "#fff", cursor: "pointer",
                          display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: "0.7rem",
                        }}
                      >
                        ✕
                      </button>
                      {idx === 0 && (
                        <div style={{
                          position: "absolute", bottom: 3, left: 3,
                          background: "#0d1b5e", color: "#fff",
                          fontSize: "0.6rem", padding: "1px 5px",
                          borderRadius: 3, fontWeight: 700,
                        }}>
                          COVER
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {/* VIDEO UPLOAD AREA */}
               <p style={{
               fontWeight: 600, color: "#374151",
              fontSize: "0.82rem", marginTop: 18, marginBottom: 8,
              }}>
              Upload Videos (optional)
             </p>
             <div
             onClick={() => videoRef.current.click()}
             style={{
    border: "2px dashed #d1d5db", borderRadius: 12,
    padding: "22px 16px", textAlign: "center",
    cursor: "pointer", background: "#fafafa",
    marginBottom: 12,
  }}
>
  <input
    ref={videoRef}
    type="file"
    accept="video/*"
    multiple
    style={{ display: "none" }}
    onChange={e => {
      const files = Array.from(e.target.files)
      const combined = [...form.videoFiles, ...files]
      if (combined.length > 3) {
        setErr("Maximum 3 videos allowed.")
        return
      }
      // Check each video is under 50MB
      const tooBig = files.find(f => f.size > 50 * 1024 * 1024)
      if (tooBig) {
        setErr(`${tooBig.name} is too large. Max size is 50MB per video.`)
        return
      }
      const urls = files.map(f => URL.createObjectURL(f))
      set("videos", [...form.videos, ...urls])
      set("videoFiles", [...form.videoFiles, ...files])
    }}
  />
  <div style={{ fontSize: "1.8rem", marginBottom: 6 }}>🎥</div>
  <p style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: 500 }}>
    Tap to upload videos
  </p>
  <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: 3 }}>
    MP4 or MOV · Max 50MB each · Up to 3 videos
  </p>
</div>

{/* VIDEO PREVIEWS */}
{form.videos.length > 0 && (
  <div style={{
    display: "flex", flexDirection: "column",
    gap: 10, marginBottom: 16,
  }}>
    {form.videos.map((vid, idx) => (
      <div key={idx} style={{
        position: "relative",
        borderRadius: 10, overflow: "hidden",
        background: "#000",
      }}>
        <video
          src={vid}
          controls
          style={{
            width: "100%", maxHeight: 200,
            display: "block", objectFit: "cover",
          }}
        />
        <button
          onClick={() => {
            set("videos", form.videos.filter((_, j) => j !== idx))
            set("videoFiles", form.videoFiles.filter((_, j) => j !== idx))
          }}
          style={{
            position: "absolute", top: 8, right: 8,
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(0,0,0,.7)", border: "none",
            color: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "0.8rem",
            fontWeight: 700,
          }}
        >
          ✕
        </button>
        <div style={{
          position: "absolute", bottom: 8, left: 8,
          background: "rgba(0,0,0,.6)", color: "#fff",
          fontSize: "0.65rem", padding: "2px 7px",
          borderRadius: 4, fontWeight: 600,
        }}>
          VIDEO {idx + 1}
        </div>
      </div>
    ))}
  </div>
)}
                
              {/* SUMMARY */}
              <div style={{
                background: "#f4f3ef", borderRadius: 12,
                padding: 14, marginBottom: 18,
              }}>
                <h4 style={{
                  fontWeight: 700, color: "#374151",
                  fontSize: "0.8rem", marginBottom: 8,
                }}>
                  📋 LISTING SUMMARY
                </h4>
                {[
                  ["Title", form.title],
                  ["Type", form.type],
                  ["Location", `${form.area}, ${form.state}`],
                  ["Annual Rent", form.price ? `₦${Number(form.price).toLocaleString()}` : "—"],
                  ["Bedrooms", form.beds || "—"],
                  ["Bathrooms", form.baths || "—"],
                  ["Photos", `${form.images.length} uploaded`],
                  ["Videos", form.videos.length > 0 ? `${form.videos.length} uploaded` : "None"],
                  ["Amenities", form.amenities.length > 0
                    ? `${form.amenities.length} selected`
                    : "None"],
                ].map(([k, v]) => (
                  <div key={k} style={{
                    display: "flex", gap: 8,
                    fontSize: "0.8rem", padding: "4px 0",
                    borderBottom: "1px solid #e8e8e0",
                  }}>
                    <span style={{ color: "#9ca3af", minWidth: 75 }}>{k}:</span>
                    <span style={{ color: "#0d1b5e", fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <Btn variant="secondary" onClick={() => setStep(2)}>← Back</Btn>
                <Btn full onClick={handleSubmit} disabled={loading}>
                  {loading ? "Submitting…" : <><Ic d={I.check} s={15} /> Submit Listing</>}
                </Btn>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}