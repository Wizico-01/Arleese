import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Ic, I } from '../components/Icons'
import { Badge } from '../components/UI'
import ListingCard from '../components/ListingCard'
import ListingModal from '../components/modals/ListingModal'
import UnlockModal from '../components/modals/UnlockModal'
import { NG_STATES, PROP_TYPES } from '../data/constants'

const isMobile = () => window.innerWidth < 768

export default function BrowsePage({ user, setPage }) {
  const [listingType, setListingType] = useState('rent') // 'rent' or 'sale'
  const [listings, setListings] = useState([])
  const [search, setSearch] = useState("")
  const [fState, setFState] = useState("")
  const [fType, setFType] = useState("")
  const [fMin, setFMin] = useState("")
  const [fMax, setFMax] = useState("")
  const [sort, setSort] = useState("newest")
  const [viewMode, setViewMode] = useState("grid")
  const [selected, setSelected] = useState(null)
  const [unlocking, setUnlocking] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [mobile, setMobile] = useState(isMobile())

  useEffect(() => {
    const fetchListings = async () => {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('listing_type', listingType)
        .order('created_at', { ascending: false })
      if (data) setListings(data)
    }
    fetchListings()

    const onResize = () => setMobile(isMobile())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [listingType])

  let results = listings.filter(l => {
    if (fState && l.state !== fState) return false
    if (fType && l.type !== fType) return false
    if (fMin && l.price < Number(fMin)) return false
    if (fMax && l.price > Number(fMax)) return false
    if (search && !`${l.title} ${l.area} ${l.state} ${l.type}`.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
  if (sort === "price-asc") results = [...results].sort((a, b) => a.price - b.price)
  if (sort === "price-desc") results = [...results].sort((a, b) => b.price - a.price)

  const clearFilters = () => { setFState(""); setFType(""); setFMin(""); setFMax("") }

  const FiltersPanel = (
    <div style={{
      background: "#fff", borderRadius: 16,
      border: "1px solid #e8e8e0", padding: 20,
      position: mobile ? "relative" : "sticky",
      top: 86,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <span style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "0.88rem" }}>Filters</span>
        <button onClick={clearFilters}
          style={{ background: "none", border: "none", color: "#1e3db5", fontSize: "0.73rem", cursor: "pointer", fontFamily: "inherit" }}>
          Clear all
        </button>
      </div>

      {[
        { label: "State", val: fState, set: setFState, opts: NG_STATES, placeholder: "All States" },
        { label: "Property Type", val: fType, set: setFType, opts: PROP_TYPES, placeholder: "All Types" },
      ].map(({ label, val, set: setter, opts, placeholder }) => (
        <div key={label} style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 600, color: "#4b5563", marginBottom: 5 }}>{label}</label>
          <select value={val} onChange={e => setter(e.target.value)}
            style={{ width: "100%", padding: "9px 11px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: "0.82rem", background: "#fafafa", fontFamily: "inherit", boxSizing: "border-box" }}>
            <option value="">{placeholder}</option>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      ))}

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 600, color: "#4b5563", marginBottom: 5 }}>
          {listingType === 'sale' ? "Min Price (₦)" : "Min Price (₦/yr)"}
        </label>
        <input type="number" value={fMin} onChange={e => setFMin(e.target.value)} placeholder="e.g. 200000"
          style={{ width: "100%", padding: "9px 11px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: "0.82rem", background: "#fafafa", boxSizing: "border-box" }} />
      </div>
      <div>
        <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 600, color: "#4b5563", marginBottom: 5 }}>
          {listingType === 'sale' ? "Max Price (₦)" : "Max Price (₦/yr)"}
        </label>
        <input type="number" value={fMax} onChange={e => setFMax(e.target.value)} placeholder="e.g. 1500000"
          style={{ width: "100%", padding: "9px 11px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: "0.82rem", background: "#fafafa", boxSizing: "border-box" }} />
      </div>
    </div>
  )

  return (
    <div style={{ background: "#f4f3ef", minHeight: "100vh" }}>

      {/* ── SEARCH BAR ── */}
      <div style={{ background: "linear-gradient(135deg,#060e33,#0d1b5e)", padding: "36px 24px 30px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", color: "#fff", fontSize: "1.75rem", marginBottom: 5 }}>
            Find Your Next Home
          </h1>
          <p style={{ color: "rgba(255,255,255,.56)", fontSize: "0.86rem", marginBottom: 18 }}>
            Direct from verified landlords, no agent fees.
          </p>

          {/* RENT / BUY TOGGLE */}
          <div style={{
            display: "flex", background: "rgba(255,255,255,.1)",
            borderRadius: 12, padding: 4,
            marginBottom: 16, maxWidth: 320,
          }}>
            <button
              onClick={() => setListingType('rent')}
              style={{
                flex: 1, padding: "10px 0",
                background: listingType === 'rent' ? "#fff" : "transparent",
                color: listingType === 'rent' ? "#0d1b5e" : "#fff",
                border: "none", borderRadius: 9,
                fontWeight: 700, fontSize: "0.86rem",
                cursor: "pointer", fontFamily: "inherit",
                transition: "all .2s",
              }}
            >
              🏠 Rent
            </button>
            <button
              onClick={() => setListingType('sale')}
              style={{
                flex: 1, padding: "10px 0",
                background: listingType === 'sale' ? "#fff" : "transparent",
                color: listingType === 'sale' ? "#0d1b5e" : "#fff",
                border: "none", borderRadius: 9,
                fontWeight: 700, fontSize: "0.86rem",
                cursor: "pointer", fontFamily: "inherit",
                transition: "all .2s",
              }}
            >
              🏷️ Buy
            </button>
          </div>

          <div style={{ display: "flex", background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 4px 18px rgba(0,0,0,.18)" }}>
            <span style={{ display: "flex", alignItems: "center", paddingLeft: 15, color: "#9ca3af", flexShrink: 0 }}>
              <Ic d={I.search} s={17} />
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search area, state, type…"
              style={{ flex: 1, border: "none", padding: "14px 10px", fontSize: "0.93rem", outline: "none", minWidth: 0 }}
            />
            <button style={{ background: "#0d1b5e", color: "#fff", border: "none", padding: "0 20px", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", flexShrink: 0, fontFamily: "inherit" }}>
              Search
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "26px 16px", boxSizing: "border-box" }}>

        {mobile && (
          <button
            onClick={() => setShowFilters(v => !v)}
            style={{
              width: "100%", marginBottom: 12,
              background: "#fff", border: "1.5px solid #e5e7eb",
              borderRadius: 10, padding: "11px 16px",
              fontSize: "0.86rem", fontWeight: 600,
              color: "#0d1b5e", cursor: "pointer",
              display: "flex", alignItems: "center",
              justifyContent: "space-between", fontFamily: "inherit",
            }}
          >
            <span>🔧 Filters</span>
            <span>{showFilters ? "▲ Hide" : "▼ Show"}</span>
          </button>
        )}

        {mobile && showFilters && (
          <div style={{ marginBottom: 16 }}>{FiltersPanel}</div>
        )}

        <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>

          {!mobile && (
            <aside style={{ width: 226, flexShrink: 0 }}>
              {FiltersPanel}
            </aside>
          )}

          {/* ── RESULTS ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
              <p style={{ fontSize: "0.86rem", color: "#374151" }}>
                <strong style={{ color: "#0d1b5e" }}>{results.length}</strong>{" "}
                {listingType === 'sale' ? "propert" : "apartment"}
                {results.length !== 1
                  ? (listingType === 'sale' ? "ies" : "s")
                  : (listingType === 'sale' ? "y" : "")
                } found{fState ? ` in ${fState}` : ""}
              </p>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <select value={sort} onChange={e => setSort(e.target.value)}
                  style={{ padding: "7px 11px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: "0.82rem", background: "#fff", fontFamily: "inherit" }}>
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                </select>
                <div style={{ display: "flex", border: "1.5px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                  {[["grid", I.grid], ["list", I.list]].map(([v, d]) => (
                    <button key={v} onClick={() => setViewMode(v)}
                      style={{ background: viewMode === v ? "#0d1b5e" : "#fff", color: viewMode === v ? "#fff" : "#6b7280", border: "none", padding: "7px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <Ic d={d} s={14} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {results.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
                <div style={{ fontSize: "2.8rem", marginBottom: 10 }}>🔍</div>
                <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                  No {listingType === 'sale' ? "properties" : "apartments"} found
                </p>
                <p style={{ fontSize: "0.84rem" }}>Try adjusting your filters or search</p>
              </div>
            ) : viewMode === "grid" ? (
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(auto-fill,minmax(285px,1fr))", gap: 20 }}>
                {results.map(l => <ListingCard key={l.id} listing={l} onClick={() => setSelected(l)} />)}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {results.map(l => (
                  <div key={l.id} onClick={() => setSelected(l)}
                    style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e8e0", display: "flex", overflow: "hidden", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,.04)", transition: "box-shadow .2s" }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,.09)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.04)"}>
                    {!mobile && <img src={l.images?.[0] || l.img || ""} alt="" style={{ width: 190, objectFit: "cover", flexShrink: 0 }} />}
                    <div style={{ padding: "16px 20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                          <div>
                            {l.verified && <div style={{ marginBottom: 5 }}><Badge color="#fff" bg="#0d1b5e"><Ic d={I.shield} s={9} fill="#fff" stroke="none" /> Verified</Badge></div>}
                            <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.05rem", color: "#0d1b5e", marginBottom: 4 }}>{l.title}</h3>
                            <div style={{ display: "flex", gap: 4, color: "#6b7280", fontSize: "0.76rem", alignItems: "center" }}><Ic d={I.pin} s={12} />{l.area}, {l.state}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontWeight: 700, color: "#0d1b5e", fontSize: "1.05rem" }}>₦{l.price.toLocaleString()}</div>
                            <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                              {l.listing_type === 'sale' ? 'one-time price' : 'per year'}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#6b7280", fontSize: "0.77rem" }}><Ic d={I.bath} s={12} />{l.kitchs || 0} Kitchen</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#6b7280", fontSize: "0.77rem" }}><Ic d={I.bath} s={12} />{l.baths || 0} Bath</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                        <Badge color="#1e3db5" bg="#eef2ff">Unlock Contact — ₦200</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <ListingModal listing={selected} onClose={() => setSelected(null)}
          onUnlock={() => { setUnlocking(selected); setSelected(null) }}
          user={user} setPage={setPage} />
      )}
      {unlocking && (
        <UnlockModal listing={unlocking} onClose={() => setUnlocking(null)}
          user={user} setPage={setPage} />
      )}
    </div>
  )
}
