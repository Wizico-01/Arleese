import { supabase } from '../lib/supabase'
import { useState, useRef, useEffect } from 'react'
import { Btn, Field, Sel, Card, ErrBox } from '../components/UI'
import { Ic, I } from '../components/Icons'
import { NG_STATES, PROP_TYPES, SALE_PROP_TYPES, AMENITIES } from '../data/constants'

export default function AddListingForm({ onBack, onSubmit, user }) {
  const [listingType, setListingType] = useState(null) 
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

  // Cleanup local Object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      form.images.forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url)
      })
      form.videos.forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url)
      })
    }
  }, [form.images, form.videos])

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

    // --- MEDIA VALIDATION RULES ---
    const hasImages = form.imageFiles && form.imageFiles.length > 0
    const hasVideos = form.videoFiles && form.videoFiles.length > 0

    if (listingType === 'rent' && !hasImages) {
      setErr("You must upload at least one photo to list an apartment for rent.")
      setLoading(false)
      return
    }

    if (listingType === 'sale' && !hasImages && !hasVideos) {
      setErr("Please upload at least one photo or video tour to list your property for sale.")
      setLoading(false)
      return
    }

    try {
      let imageUrls = []
      let idx = 0

      // Handle Optional/Compulsory Images
      if (hasImages) {
        for (const imgFile of form.imageFiles) {
          const uniqueId = `${Date.now()}-${idx}-${Math.random().toString(36).substring(5)}`
          const filePath = `${uniqueId}-${imgFile.name}`
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('apartment-images')
            .upload(filePath, imgFile)

          if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)

          if (uploadData) {
            const { data: urlData } = supabase.storage
              .from('apartment-images')
              .getPublicUrl(filePath)
            imageUrls.push(urlData.publicUrl)
          }
          idx++
        }
      }

      let videoUrls = []
      let vIdx = 0
      
      // Handle Optional Videos
      if (hasVideos) {
        for (const vidFile of form.videoFiles) {
          const uniqueId = `${Date.now()}-${vIdx}-${Math.random().toString(36).substring(5)}`
          const filePath = `videos/${uniqueId}-${vidFile.name}`
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('apartment-images')
            .upload(filePath, vidFile)

          if (uploadError) throw new Error(`Video upload failed: ${uploadError.message}`)

          if (uploadData) {
            const { data: urlData } = supabase.storage
              .from('apartment-images')
              .getPublicUrl(filePath)
            videoUrls.push(urlData.publicUrl)
          }
          vIdx++
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
        landlord_id: user?.id,
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
      setErr(e.message || "Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  const STEPS = ["Basic Info", "Details & Amenities", "Photos & Review"]

  if (!user?.verified) {
    return (
      <div style={{ background: "#f4f3ef", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 380 }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>⏳</div>
          <h3 style={{ fontFamily: "'DM Serif Display',serif", color: "#0d1b5e", fontSize: "1.4rem", marginBottom: 10 }}>
            Verification Pending
          </h3>
          <p style={{ color: "#6b7280", fontSize: "0.87rem", lineHeight: 1.75, marginBottom: 24 }}>
            Your NIN is currently under review by the Arleece team.
            You will receive an email within <strong>10–30 minutes</strong> once your account is verified. Only verified landlords can list apartments.
          </p>
          <button onClick={onBack} style={{ background: "#0d1b5e", color: "#fff", border: "none", borderRadius: 9, padding: "12px 26px", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, fontFamily: "inherit" }}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!listingType) {
    return (
      <div style={{ background: "#f4f3ef", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "0.85rem", marginBottom: 20, fontFamily: "inherit" }}>
            ← Back to Dashboard
          </button>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", color: "#0d1b5e", fontSize: "1.5rem", marginBottom: 8, textAlign: "center" }}>
            What would you like to list?
          </h2>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", textAlign: "center", marginBottom: 28 }}>
            Choose whether this property is for rent or for sale
          </p>
          <div onClick={() => setListingType('rent')} style={{ background: "#fff", border: "2px solid #e8e8e0", borderRadius: 16, padding: "22px 20px", cursor: "pointer", marginBottom: 14, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", flexShrink: 0 }}>🏠</div>
            <div>
              <div style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "1.02rem", marginBottom: 3 }}>Rent Your Apartment</div>
              <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>List a vacant apartment for tenants to rent</div>
            </div>
          </div>
          <div onClick={() => setListingType('sale')} style={{ background: "#fff", border: "2px solid #e8e8e0", borderRadius: 16, padding: "22px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", flexShrink: 0 }}>🏷️</div>
            <div>
              <div style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "1.02rem", marginBottom: 3 }}>Sell Your Property</div>
              <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>List a property for buyers to purchase</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: "#f4f3ef", minHeight: "100vh", paddingBottom: 80 }}>
      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg,#060e33,#0d1b5e)", padding: "26px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => setListingType(null)} style={{ background: "rgba(255,255,255,.1)", border: "none", color: "#fff", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: "0.82rem", fontFamily: "inherit" }}>
            ← Back
          </button>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", color: "#fff", fontSize: "1.3rem" }}>
            {listingType === 'sale' ? "List Property for Sale" : "Add New Rental Listing"}
          </h1>
        </div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        {/* PROGRESS BAR */}
        <div style={{ display: "flex", borderRadius: 12, overflow: "hidden", marginBottom: 20, border: "1px solid #e8e8e0" }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, padding: "10px 4px", textAlign: "center", background: step === i + 1 ? "#0d1b5e" : step > i + 1 ? "#1e3db5" : "#fff", color: step >= i + 1 ? "#fff" : "#9ca3af", fontSize: "0.7rem", fontWeight: step === i + 1 ? 700 : 500, transition: "all .3s", borderRight: i < 2 ? "1px solid #e8e8e0" : "none" }}>
              {s}
            </div>
          ))}
        </div>

        <Card style={{ padding: "20px 16px" }}>
          <ErrBox msg={err} />

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h3 style={{ fontWeight: 700, color: "#0d1b5e", marginBottom: 16, fontSize: "1rem" }}>Basic Information</h3>
              <Field label="Property Title" placeholder={listingType === 'sale' ? "e.g. 4-Bedroom Duplex" : "e.g. 2-Bedroom Flat"} value={form.title} onChange={e => set("title", e.target.value)} required />
              <Sel label="Property Type" value={form.type} onChange={e => set("type", e.target.value)} options={listingType === 'sale' ? SALE_PROP_TYPES : PROP_TYPES} required />
              <Sel label="State" value={form.state} onChange={e => set("state", e.target.value)} options={NG_STATES} required />
              <Field label="Area / Neighbourhood" placeholder="e.g. Lekki Phase 1" value={form.area} onChange={e => set("area", e.target.value)} required />
              <Field label={listingType === 'sale' ? "Sale Price (₦)" : "Annual Rent (₦)"} type="number" placeholder={listingType === 'sale' ? "e.g. 25000000" : "e.g. 650000"} value={form.price} onChange={e => set("price", e.target.value)} required />
              <Field label="Property Description" placeholder="Describe the property..." value={form.desc} onChange={e => set("desc", e.target.value)} rows={4} />
              <Field label="Your Phone Number" placeholder="e.g. 08012345678" type="tel" value={form.landlord_phone} onChange={e => set("landlord_phone", e.target.value)} required />
              <Field label="Exact Property Address" placeholder="e.g. 14B Harmony Close" value={form.landlord_address} onChange={e => set("landlord_address", e.target.value)} required />
              <Btn full onClick={() => { if (validateStep1()) setStep(2) }}>Continue →</Btn>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h3 style={{ fontWeight: 700, color: "#0d1b5e", marginBottom: 16, fontSize: "1rem" }}>Details & Amenities</h3>
              {form.type === 'Land' && (
                <div style={{ background: "#eef2ff", borderRadius: 10, padding: "12px 14px", marginBottom: 18, fontSize: "0.82rem", color: "#1e3db5" }}>
                  ℹ️ Kitchen and bathroom details are skipped for Land listings.
                </div>
              )}
              {form.type !== 'Land' && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Kitchen" type="number" value={form.kitchs} onChange={e => set("kitchs", e.target.value)} required />
                  <Field label="Bathrooms" type="number" value={form.baths} onChange={e => set("baths", e.target.value)} required />
                </div>
              )}
              {/* AMENITIES MAPPING PLACEHOLDER */}
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <Btn variant="secondary" onClick={() => setStep(1)}>← Back</Btn>
                <Btn full onClick={() => { if (validateStep2()) setStep(3) }}>Continue →</Btn>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h3 style={{ fontWeight: 700, color: "#0d1b5e", marginBottom: 6, fontSize: "1rem" }}>
                Photos {listingType === 'sale' ? <span style={{ fontWeight: 400, color: "#6b7280", fontSize: "0.85rem" }}>(Optional if video is attached)</span> : <span style={{ color: "#dc2626", fontSize: "0.85rem" }}>* Compulsory</span>}
              </h3>
              
              <div onClick={() => imgRef.current.click()} style={{ border: "2px dashed #d1d5db", borderRadius: 12, padding: "28px 16px", textAlign: "center", cursor: "pointer", background: "#fafafa", marginBottom: 14 }}>
                <input ref={imgRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => {
                  const files = Array.from(e.target.files)
                  const combined = [...form.imageFiles, ...files]
                  if (combined.length > 7) { setErr("Maximum 7 photos allowed."); return }
                  const urls = files.map(f => URL.createObjectURL(f))
                  set("images", [...form.images, ...urls])
                  set("imageFiles", combined)
                }} />
                <p>📸 Tap to upload photos</p>
              </div>
              
              {form.images.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
                  {form.images.map((img, i) => (
                    <img key={i} src={img} style={{ width: "100%", height: 60, objectFit: "cover", borderRadius: 6 }} alt="Preview" />
                  ))}
                </div>
              )}

              <h3 style={{ fontWeight: 700, color: "#0d1b5e", marginBottom: 6, marginTop: 20, fontSize: "1rem" }}>
                Property Video Tour {listingType === 'sale' ? <span style={{ fontWeight: 400, color: "#6b7280", fontSize: "0.85rem" }}>(Optional if photos are attached)</span> : <span style={{ fontWeight: 400, color: "#6b7280", fontSize: "0.85rem" }}>(Optional)</span>}
              </h3>
              
              <div onClick={() => videoRef.current.click()} style={{ border: "2px dashed #d1d5db", borderRadius: 12, padding: "28px 16px", textAlign: "center", cursor: "pointer", background: "#fafafa", marginBottom: 14 }}>
                <input ref={videoRef} type="file" accept="video/*" multiple style={{ display: "none" }} onChange={e => {
                  const files = Array.from(e.target.files)
                  const combined = [...form.videoFiles, ...files]
                  if (combined.length > 2) { setErr("Maximum 2 videos allowed."); return }
                  const urls = files.map(f => URL.createObjectURL(f))
                  set("videos", [...form.videos, ...urls])
                  set("videoFiles", combined)
                }} />
                <p>🎥 Tap to upload videos</p>
              </div>

              {form.videos.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 20 }}>
                  {form.videos.map((vid, i) => (
                    <video key={i} src={vid} controls style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 6 }} />
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <Btn variant="secondary" onClick={() => setStep(2)}>← Back</Btn>
                <Btn full onClick={handleSubmit} loading={loading}>Submit Listing</Btn>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
      }
