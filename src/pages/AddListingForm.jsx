import { supabase } from '../lib/supabase'
import { useState, useRef } from 'react'
import { Btn, Field, Sel, Card, ErrBox } from '../components/UI'
import { Ic, I } from '../components/Icons'
import { NG_STATES, PROP_TYPES, SALE_PROP_TYPES, AMENITIES } from '../data/constants'

export default function AddListingForm({ onBack, onSubmit, user }) {
  const [listingType, setListingType] = useState(null) // 'rent' or 'sale'
  const [step, setStep] = useState(1)
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: "", type: "", state: "", area: "",
    price: "", kitchs: "", baths: "",
    desc: "", landlord_phone: "", landlord_address: "",
    amenities: [], images: [], imageFiles: [],
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
    if (!form.landlord_phone) {
      setErr("Please add your phone number so tenants can contact you."); return false
    }
    if (!form.landlord_address) {
      setErr("Please add the exact property address."); return false
    }
    setErr(""); return true
  }

  const validateStep2 = () => {
    if (form.type === 'Land') {
      setErr(""); return true
    }
    if (!form.kitchs || !form.baths) {
      setErr("Please specify kitchen and bathrooms."); return false
    }
    setErr(""); return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    setErr("")
    try {
      let imageUrls = []

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

      let videoUrls = []
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

      const { data, error } = await supabase.from('listings').insert({
        title: form.title,
        type: form.type,
        state: form.state,
        area: form.area,
        price: Number(form.price),
        kitchs: form.type === 'Land' ? 0 : Number(form.kitchs),
        baths: form.type === 'Land' ? 0 : Number(form.baths),
        description: form.desc,
        landlord_phone: form.landlord_phone,
        landlord_address: form.landlord_address,
        amenities: form.amenities,
        images: imageUrls,
        videos: videoUrls,
        status: 'active',
        landlord_id: user.id,
        listing_type: listingType,
      })

      if (error) {
        setErr(error.message)
        setLoading(false)
        return
      }

      onSubmit({
        title: form.title,
        type: form.type,
        state: form.state,
        area: form.area,
        price: Number(form.price),
        kitchs: form.type === 'Land' ? 0 : Number(form.kitchs),
        baths: form.type === 'Land' ? 0 : Number(form.baths),
        description: form.desc,
        amenities: form.amenities,
        images: imageUrls,
        img: imageUrls[0] || "",
        status: 'active',
        verified: true,
        views: 0,
        unlocks: 0,
        listing_type: listingType,
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

  // SHOW CHOICE SCREEN FIRST — before any form steps
  if (!listingType) {
    return (
      <div style={{
        background: "#f4f3ef", minHeight: "100vh",
        display: "flex", alignItems: "center",
        justifyContent: "center", padding: 24,
      }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          <button
            onClick={onBack}
            style={{
              background: "none", border: "none", color: "#6b7280",
              cursor: "pointer", fontSize: "0.85rem",
              marginBottom: 20, fontFamily: "inherit",
            }}
          >
            ← Back to Dashboard
          </button>

          <h2 style={{
            fontFamily: "'DM Serif Display',serif",
            color: "#0d1b5e", fontSize: "1.5rem",
            marginBottom: 8, textAlign: "center",
          }}>
            What would you like to list?
          </h2>
          <p style={{
            color: "#6b7280", fontSize: "0.85rem",
            textAlign: "center", marginBottom: 28,
          }}>
            Choose whether this property is for rent or for sale
          </p>

          <div
            onClick={() => setListingType('rent')}
            style={{
              background: "#fff", border: "2px solid #e8e8e0",
              borderRadius: 16, padding: "22px 20px",
              cursor: "pointer", marginBottom: 14,
              display: "flex", alignItems: "center", gap: 16,
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: "#eef2ff", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "1.6rem", flexShrink: 0,
            }}>
              🏠
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "1.02rem", marginBottom: 3 }}>
                Rent Your Apartment
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                List a vacant apartment for tenants to rent
              </div>
            </div>
          </div>

          <div
            onClick={() => setListingType('sale')}
            style={{
              background: "#fff", border: "2px solid #e8e8e0",
              borderRadius: 16, padding: "22px 20px",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 16,
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: "#fef3c7", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "1.6rem", flexShrink: 0,
            }}>
              🏷️
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "1.02rem", marginBottom: 3 }}>
                Sell Your Property
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                List a property for buyers to purchase
              </div>
            </div>
          </div>
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
            onClick={() => setListingType(null)}
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
            {listingType === 'sale' ? "List Property for Sale" : "Add New Rental Listing"}
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
                placeholder={listingType === 'sale'
                  ? "e.g. 4-Bedroom Duplex in Lekki Phase 1"
                  : "e.g. 2-Bedroom Flat in Lekki Phase 1"}
                value={form.title}
                onChange={e => set("title", e.target.value)}
                required
              />

              <Sel
                label="Property Type"
                value={form.type}
                onChange={e => set("type", e.target.value)}
                options={listingType === 'sale' ? SALE_PROP_TYPES : PROP_TYPES}
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
                label={listingType === 'sale' ? "Sale Price (₦)" : "Annual Rent (₦)"}
                type="number"
                placeholder={listingType === 'sale' ? "e.g. 25000000" : "e.g. 650000"}
                value={form.price}
                onChange={e => set("price", e.target.value)}
                required
                note={listingType === 'sale'
                  ? "Enter the one-time sale price in Naira."
                  : "Enter the yearly rent in Naira."}
              />

              <Field
                label="Property Description"
                placeholder="Describe the property, location, condition, nearby landmarks…"
                value={form.desc}
                onChange={e => set("desc", e.target.value)}
                rows={4}
              />

              <Field
                label="Your Phone Number"
                placeholder="e.g. 08012345678"
                type="tel"
                value={form.landlord_phone}
                onChange={e => set("landlord_phone", e.target.value)}
                required
                note="Tenants/buyers will see this after paying ₦200 unlock fee."
              />

              <Field
                label="Exact Property Address"
                placeholder="e.g. 14B Harmony Close, Lekki Phase 1, Lagos"
                value={form.landlord_address}
                onChange={e => set("landlord_address", e.target.value)}
                required
                note="Full address shown after they unlock contact."
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

              {form.type === 'Land' && (
                <div style={{
                  background: "#eef2ff", borderRadius: 10,
                  padding: "12px 14px", marginBottom: 18,
                  fontSize: "0.82rem", color: "#1e3db5",
                }}>
                  ℹ️ Kitchen and bathroom details are skipped for Land listings.
                </div>
              )}

              {form.type !== 'Land' && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field
                    label="Kitchen"
                    type="number"
                    placeholder="e.g. 2"
                    value={form.kitchs}
                    onChange={e => set("kitchs", e.target.value)}
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
                </div>
              )}

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
                Upload up to 7 photos and videos of the property.
                Good media attracts more {listingType === 'sale' ? 'buyers' : 'tenants'}.
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
            
