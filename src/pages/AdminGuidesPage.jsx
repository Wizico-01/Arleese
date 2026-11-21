import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ShieldCheck, AlertTriangle, CheckCircle2, FileText, Search } from 'lucide-react'

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

const isImage = (n) => /\.(png|jpe?g|webp|gif)$/i.test(n)

export default function AdminGuidesPage({ user, setPage }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')
  const [q, setQ] = useState('')
  const [docs, setDocs] = useState({})
  const [confirm, setConfirm] = useState(null) // { id, verify }
  const [working, setWorking] = useState(null)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_list_guides')
    if (error) setMsg('Could not load Home Guides.')
    else setRows(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (user?.isAdmin) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.isAdmin])

  const viewDocs = async (g) => {
    setDocs(d => ({ ...d, [g.id]: { loading: true, items: [] } }))
    const { data: files, error } = await supabase.storage
      .from('nin-documents')
      .list(g.id, { limit: 20 })
    if (error) {
      setDocs(d => ({ ...d, [g.id]: { loading: false, items: [], error: 'Could not open this folder.' } }))
      return
    }
    const real = (files || []).filter(f => f.name && !f.name.startsWith('.'))
    const items = await Promise.all(real.map(async (f) => {
      const { data } = await supabase.storage
        .from('nin-documents')
        .createSignedUrl(`${g.id}/${f.name}`, 600)
      return {
        name: f.name,
        label: f.name.startsWith('utility-') ? 'Proof of address' : 'NIN document',
        url: data?.signedUrl || null,
        image: isImage(f.name),
      }
    }))
    setDocs(d => ({ ...d, [g.id]: { loading: false, items: items.filter(i => i.url) } }))
  }

  const setVerified = async (g, verify) => {
    setWorking(g.id)
    setMsg('')
    const { data, error } = await supabase.rpc('admin_set_guide_verified', {
      p_user: g.id,
      p_verified: verify,
    })
    setWorking(null)
    setConfirm(null)
    if (error || !data) { setMsg('Could not update. Please try again.'); return }
    setRows(r => r.map(x => (x.id === g.id ? { ...x, nin_verified: verify } : x)))
    setMsg(`${g.full_name || 'Home Guide'} is now ${verify ? 'verified' : 'unverified'}.`)
  }

  if (!user?.isAdmin) {
    return (
      <div style={{ minHeight: "100vh", background: "#f4f3ef", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, flexDirection: "column", gap: 12, textAlign: "center" }}>
        <AlertTriangle size={36} strokeWidth={1.5} color="#92400e" />
        <h2 style={{ fontFamily: "'DM Serif Display',serif", color: "#0d1b5e", fontSize: "1.3rem" }}>
          This page is for Arleece admins only
        </h2>
        <button
          onClick={() => setPage('home')}
          style={{ background: "#0d1b5e", color: "#fff", border: "none", borderRadius: 9, padding: "11px 28px", cursor: "pointer", fontSize: "0.88rem", fontWeight: 600, fontFamily: "inherit" }}
        >
          Back to Home
        </button>
      </div>
    )
  }

  const pendingCount = rows.filter(r => !r.nin_verified).length
  const verifiedCount = rows.length - pendingCount
  const term = q.trim().toLowerCase()
  const shown = rows.filter(r => {
    if (tab === 'pending' && r.nin_verified) return false
    if (tab === 'verified' && !r.nin_verified) return false
    if (!term) return true
    return [r.full_name, r.email, r.phone, r.nin].some(v => (v || '').toLowerCase().includes(term))
  })

  const tabBtn = (id, label) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      style={{
        flex: 1, padding: "9px 0", border: "none", borderRadius: 8,
        background: tab === id ? "#fff" : "transparent",
        color: tab === id ? "#0d1b5e" : "#6b7280",
        fontWeight: tab === id ? 700 : 500, fontSize: "0.8rem",
        cursor: "pointer", fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ background: "#f4f3ef", minHeight: "100vh", paddingBottom: 90 }}>
      <div style={{ background: "linear-gradient(135deg,#060e33,#0d1b5e)", padding: "
