import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Btn, Card, Badge } from '../components/UI'
import { Ic, I } from '../components/Icons'
import AddListingForm from './AddListingForm'
// Added Eye and PhoneCall to the Lucide imports
import { Building2, CheckCircle2, Key, Unlock, AlertTriangle, Eye, PhoneCall } from 'lucide-react'

export default function DashboardPage({ user, setPage }) {
  const [tab, setTab] = useState("listings")
  const [rentedInput, setRentedInput] = useState({})
  const [rentedError, setRentedError] = useState({})
  const [showRentedBox, setShowRentedBox] = useState({})
  const [showAdd, setShowAdd] = useState(false)
  const [listings, setListings] = useState([])

  useEffect(() => {
    const fetchMyListings = async () => {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('landlord_id', user?.id)
        .order('created_at', { ascending: false })
      if (data) setListings(data)
    }
    fetchMyListings()
  }, [user])

  const remove = (id) => setListings(l => l.filter(x => x.id !== id))
  const toggleRentedBox = (id) => {
    setShowRentedBox(p => ({ ...p, [id]: !p[id] }))
    setRentedInput(p => ({ ...p, [id]: "" }))
    setRentedError(p => ({ ...p, [id]: "" }))
  }

  const confirmRented = async (id) => {
  const typed = rentedInput[id]?.trim().toUpperCase()
  if (typed !== "RENTED") {
    setRentedError(p => ({
      ...p,
      [id]: 'Type exactly "RENTED" in capital letters to confirm.'
    }))
    return
  }

  try {
    // Save to Supabase
    const { error } = await supabase
      .from('listings')
      .update({ status: 'rented' })
      .eq('id', id)

    if (error) {
      setRentedError(p => ({ ...p, [id]: 'Failed to update. Please try again.' }))
      return
    }

    // Update local state
    setListings(p => p.map(l =>
      l.id === id ? { ...l, status: "rented" } : l
    ))
    setShowRentedBox(p => ({ ...p, [id]: false }))
    setRentedInput(p => ({ ...p, [id]: "" }))
    setRentedError(p => ({ ...p, [id]: "" }))

  } catch (e) {
    setRentedError(p => ({ ...p, [id]: 'Something went wrong. Try again.' }))
  }
}

  const markAvailable = async (id) => {
  try {
    await supabase
      .from('listings')
      .update({ status: 'active' })
      .eq('id', id)

    setListings(p => p.map(l =>
      l.id === id ? { ...l, status: "active" } : l
    ))
  } catch (e) {
    console.log('Error marking available:', e)
  }
}
  const add = (l) => {
    setListings(p => [...p, {
      ...l,
      id: Date.now(),
      views: 0,
      unlocks: 0,
      status: "active",
    }])
    setShowAdd(false)
  }

  const stats = [
    { icon: <Building2 size={26} strokeWidth={1.5} style={{ color: "#0d1b5e" }} />, l: "Total Listings", v: listings.length },
    { icon: <CheckCircle2 size={26} strokeWidth={1.5} style={{ color: "#0d1b5e" }} />, l: "Active", v: listings.filter(l => l.status === "active").length },
    { icon: <Key size={26} strokeWidth={1.5} style={{ color: "#0d1b5e" }} />, l: "Rented Out", v: listings.filter(l => l.status === "rented").length },
    { icon: <Unlock size={26} strokeWidth={1.5} style={{ color: "#0d1b5e" }} />, l: "Contacts Unlocked", v: listings.reduce((s, l) => s + (l.unlocks || 0), 0) },
  ]

  if (showAdd) return <AddListingForm onBack={() => setShowAdd(false)} onSubmit={add} user={user} />

  return (
    <div style={{ background: "#f4f3ef", minHeight: "100vh" }}>

      {/* ── HEADER ── */}
      <div style={{ background: "linear-gradient(135deg,#060e33,#0d1b5e)", padding: "34px 24px 26px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display',serif", color: "#fff", fontSize: "1.6rem", marginBottom: 5 }}>
              Welcome, {user?.name?.split(" ")[0] || "Landlord"}
            </h1>
            {!user?.verified && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(253,224,71,.12)", border: "1px solid rgba(253,224,71,.3)", borderRadius: 8, padding: "4px 11px", color: "#fde047", fontSize: "0.76rem" }}>
                <Ic d={I.clock} s={12} /> ID Verification in progress (24–48 hrs)
              </div>
            )}
          </div>
          <Btn onClick={() => setShowAdd(true)}>
            <Ic d={I.plus} s={15} /> Add New Listing
          </Btn>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "26px 24px" }}>

        {/* ── STATS CARD GRID ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14, marginBottom: 24 }}>
          {stats.map(s => (
            <Card key={s.l} style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", height: 32, marginBottom: 7 }}>
                {s.icon}
              </div>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.75rem", color: "#0d1b5e", marginBottom: 3 }}>{s.v}</div>
              <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>{s.l}</div>
            </Card>
          ))}
        </div>

        {/* ── TABS ── */}
        <div style={{ display: "flex", gap: 4, background: "#e8e8e0", borderRadius: 10, padding: 4, width: "fit-content", marginBottom: 22 }}>
          {[["listings", "My Listings"], ["profile", "Profile & Verification"]].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? "#fff" : "transparent", color: tab === t ? "#0d1b5e" : "#6b7280", fontWeight: tab === t ? 700 : 400, border: "none", borderRadius: 8, padding: "7px 18px", fontSize: "0.84rem", cursor: "pointer", transition: "all .2s", fontFamily: "inherit" }}>
              {l}
            </button>
          ))}
        </div>

        {/* ── MY LISTINGS TAB ── */}
        {tab === "listings" && (
          listings.length === 0 ? (
            <Card style={{ padding: 44, textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                <Building2 size={48} strokeWidth={1.2} style={{ color: "#0d1b5e" }} />
              </div>
              <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.3rem", color: "#0d1b5e", marginBottom: 7 }}>
                No listings yet
              </h3>
              <p style={{ color: "#6b7280", fontSize: "0.86rem", marginBottom: 22 }}>
                Add your first apartment to start receiving tenant enquiries.
              </p>
              <Btn onClick={() => setShowAdd(true)}>
                <Ic d={I.plus} s={15} /> Add First Listing
              </Btn>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {listings.map(l => (
                <Card key={l.id} style={{ overflow: "hidden" }}>
                   <img
                      src={l.images?.[0] || l.img || ""}
                      alt={l.title}
                      style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                      />
                      <div style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                      <div>
                        <div style={{ marginBottom: 5 }}>
                          <Badge
                            color={
                              l.status === "active" ? "#166534" :
                              l.status === "rented" ? "#991b1b" : "#92400e"
                            }
                            bg={
                              l.status === "active" ? "#dcfce7" :
                              l.status === "rented" ? "#fee2e2" : "#fef3c7"
                            }
                          >
                            {l.status === "active" ? "● Active" :
                             l.status === "rented" ? "Rented Out" : "Pending Review"}
                          </Badge>
                        </div>
                        <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.05rem", color: "#0d1b5e", marginBottom: 3 }}>
                          {l.title}
                        </h3>
                        <div style={{ display: "flex", gap: 4, color: "#6b7280", fontSize: "0.76rem", alignItems: "center" }}>
                          <Ic d={I.pin} s={11} /> {l.area}, {l.state}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "1.05rem" }}>
                        ₦{l.price.toLocaleString()}/yr
                      </div>
                    </div>
                    
                    {/* UPDATED: Emojis completely replaced with matching muted line-art vector row */}
                    <div style={{ display: "flex", gap: 18, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: "0.76rem", color: "#6b7280", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Eye size={13} strokeWidth={1.8} style={{ color: "#6b7280" }} /> {l.views} views
                      </span>
                      <span style={{ fontSize: "0.76rem", color: "#6b7280", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <PhoneCall size={12} strokeWidth={1.8} style={{ color: "#6b7280" }} /> {l.unlocks} unlocks
                      </span>
                      <span style={{ fontSize: "0.76rem", color: "#6b7280" }}>
                        {l.beds} beds · {l.baths} baths · {l.size}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                      {/* ACTION BUTTONS ROW */}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Btn variant="secondary" sm>
                          <Ic d={I.edit} s={13} /> Edit
                        </Btn>
                        <Btn variant="danger" sm onClick={() => remove(l.id)}>
                          <Ic d={I.trash} s={13} /> Remove
                        </Btn>

                        {l.status !== "rented" && (
                          <Btn variant="accent" sm onClick={() => toggleRentedBox(l.id)}>
                            Mark as Rented
                          </Btn>
                        )}

                        {l.status === "rented" && (
                          <Btn variant="secondary" sm onClick={() => markAvailable(l.id)}>
                            Mark as Available
                          </Btn>
                        )}
                      </div>

                      {/* RENTED CONFIRMATION BOX */}
                      {showRentedBox[l.id] && (
                        <div style={{
                          background: "#fffbeb",
                          border: "1px solid #fde68a",
                          borderRadius: 10,
                          padding: "14px 16px",
                        }}>
                          <p style={{
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            color: "#92400e",
                            marginBottom: 8,
                            display: "flex",
                            alignItems: "center",
                            gap: 6
                          }}>
                            <AlertTriangle size={15} strokeWidth={2} style={{ color: "#b45309" }} />
                            To confirm this apartment is rented, type{" "}
                            <strong>RENTED</strong> below:
                          </p>
                          <div style={{ display: "flex", gap: 8 }}>
                            <input
                              type="text"
                              placeholder='Type RENTED here'
                              value={rentedInput[l.id] || ""}
                              onChange={e => setRentedInput(p => ({
                                ...p, [l.id]: e.target.value
                              }))}
                              style={{
                                flex: 1,
                                padding: "8px 12px",
                                border: "1.5px solid #fde68a",
                                borderRadius: 8,
                                fontSize: "0.88rem",
                                background: "#fff",
                                fontFamily: "inherit",
                              }}
                              onFocus={e => e.target.style.borderColor = "#0d1b5e"}
                              onBlur={e => e.target.style.borderColor = "#fde68a"}
                            />
                            <Btn sm onClick={() => confirmRented(l.id)}>
                              Confirm
                            </Btn>
                            <Btn variant="ghost" sm onClick={() => toggleRentedBox(l.id)}>
                              Cancel
                            </Btn>
                          </div>
                          {rentedError[l.id] && (
                            <p style={{
                              fontSize: "0.78rem",
                              color: "#b91c1c",
                              marginTop: 6,
                              display: "flex",
                              alignItems: "center",
                              gap: 6
                            }}>
                              <AlertTriangle size={14} strokeWidth={2} style={{ color: "#b91c1c" }} />
                              {rentedError[l.id]}
                            </p>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
        )}

        {/* ── PROFILE TAB ── */}
        {tab === "profile" && (
          <Card style={{ padding: 26, maxWidth: 520 }}>
            <h3 style={{ fontWeight: 700, color: "#0d1b5e", marginBottom: 18 }}>
              Profile & Verification
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #f0efea" }}>
              <div style={{ width: 54, height: 54, borderRadius: "50%", background: "#0d1b5e", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.35rem", fontWeight: 700, flexShrink: 0 }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#0d1b5e" }}>{user?.name}</div>
                <div style={{ color: "#6b7280", fontSize: "0.82rem" }}>{user?.email}</div>
                <div style={{ marginTop: 6 }}>
                  <Badge
                    color={user?.verified ? "#166534" : "#92400e"}
                    bg={user?.verified ? "#dcfce7" : "#fef3c7"}
                  >
                    {user?.verified ? "ID Verified" : "Verification Pending"}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}