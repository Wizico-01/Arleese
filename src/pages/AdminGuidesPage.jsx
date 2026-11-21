import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { AlertTriangle, FileText } from 'lucide-react'

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
const isImg = (n) => /\.(png|jpe?g|webp|gif)$/i.test(n)

export default function AdminGuidesPage({ user, setPage }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')
  const [q, setQ] = useState('')
  const [docs, setDocs] = useState({})
  const [confirm, setConfirm] = useState(null)
  const [working, setWorking] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_list_guides')
    if (error) setMsg('Could not load Home Guides.')
    else setRows(data || [])
    setLoading(false)
  }
  useEffect(() => { if (user?.isAdmin) load() }, [user?.isAdmin]) // eslint-disable-line

  const viewDocs = async (g) => {
    setDocs(d => ({ ...d, [g.id]: { loading: true, items: [] } }))
    const { data: files, error } = await supabase.storage.from('nin-documents').list(g.id, { limit: 20 })
    if (error) { setDocs(d => ({ ...d, [g.id]: { items: [], error: 'Could not open this folder.' } })); return }
    const items = await Promise.all((files || []).filter(f => f.name && !f.name.startsWith('.')).map(async f => {
      const { data } = await supabase.storage.from('nin-documents').createSignedUrl(`${g.id}/${f.name}`, 600)
      return { name: f.name, url: data?.signedUrl, image: isImg(f.name) }
    }))
    setDocs(d => ({ ...d, [g.id]: { items: items.filter(i => i.url) } }))
  }

  const setVerified = async () => {
    const { g, verify } = confirm
    setWorking(true)
    const { data, error } = await supabase.rpc('admin_set_guide_verified', { p_user: g.id, p_verified: verify })
    setWorking(false)
    setConfirm(null)
    if (error || !data) { setMsg('Could not update. Please try again.'); return }
    setRows(r => r.map(x => x.id === g.id ? { ...x, nin_verified: verify } : x))
    setMsg(`${g.full_name || 'Home Guide'} is now ${verify ? 'verified' : 'unverified'}.`)
  }

  if (!user?.isAdmin) return (
    <div style={{ minHeight: '100vh', background: '#f4f3ef', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, padding: 24, textAlign: 'center' }}>
      <AlertTriangle size={36} color="#92400e" />
      <h2 style={{ fontFamily: "'DM Serif Display',serif", color: '#0d1b5e' }}>Admins only</h2>
      <button onClick={() => setPage('home')} style={{ background: '#0d1b5e', color: '#fff', border: 'none', borderRadius: 9, padding: '11px 28px', fontFamily: 'inherit', fontWeight: 600 }}>Back to Home</button>
    </div>
  )

  const pending = rows.filter(r => !r.nin_verified).length
  const term = q.trim().toLowerCase()
  const shown = rows.filter(r =>
    (tab === 'pending' ? !r.nin_verified : r.nin_verified) &&
    (!term || [r.full_name, r.email, r.phone, r.nin].some(v => (v || '').toLowerCase().includes(term))))

  const row = (k, v) => v ? <div style={{ fontSize: '0.8rem', color: '#4b5563', lineHeight: 1.7 }}><span style={{ color: '#9ca3af' }}>{k}: </span>{v}</div> : null

  return (
    <div style={{ background: '#f4f3ef', minHeight: '100vh', paddingBottom: 90 }}>
      <div style={{ background: 'linear-gradient(135deg,#060e33,#0d1b5e)', padding: '36px 20px 24px' }}>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", color: '#fff', fontSize: '1.6rem', marginBottom: 4 }}>Home Guide verification</h1>
        <p style={{ color: 'rgba(255,255,255,.65)', fontSize: '0.84rem' }}>{pending} waiting · {rows.length - pending} verified</p>
      </div>

      <div style={{ padding: '16px', maxWidth: 560, margin: '0 auto' }}>
        <div style={{ display: 'flex', background: '#e8e8e0', borderRadius: 10, padding: 3, marginBottom: 12 }}>
          {[['pending', 'Waiting'], ['verified', 'Verified']].map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: '9px 0', border: 'none', borderRadius: 8, background: tab === id ? '#fff' : 'transparent', color: tab === id ? '#0d1b5e' : '#6b7280', fontWeight: 700, fontSize: '0.82rem', fontFamily: 'inherit' }}>{l}</button>
          ))}
        </div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email, phone or NIN"
          style={{ width: '100%', padding: '11px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: '0.86rem', boxSizing: 'border-box', marginBottom: 12, fontFamily: 'inherit' }} />

        {msg && <div style={{ background: '#eef2ff', border: '1px solid #c7d4fd', color: '#1e3db5', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem', marginBottom: 12 }}>{msg}</div>}
        {loading && <p style={{ textAlign: 'center', color: '#9ca3af', padding: 30 }}>Loading…</p>}
        {!loading && shown.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', padding: 30, fontSize: '0.86rem' }}>No Home Guides here.</p>}

        {shown.map(g => {
          const d = docs[g.id]
          return (
            <div key={g.id} style={{ background: '#fff', border: '1px solid #e8e8e0', borderRadius: 14, padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#0d1b5e', marginBottom: 6 }}>{g.full_name || 'No name'}</div>
              {row('Email', g.email)}{row('Phone', g.phone)}{row('State', g.state)}{row('NIN', g.nin)}{row('Signed up', fmt(g.created_at))}

              <button onClick={() => viewDocs(g)} style={{ marginTop: 10, background: '#f4f3ef', color: '#0d1b5e', border: 'none', borderRadius: 8, padding: '9px 14px', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={14} /> {d ? 'Reload documents' : 'View documents'}
              </button>

              {d?.loading && <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 8 }}>Loading…</p>}
              {d?.error && <p style={{ fontSize: '0.78rem', color: '#b91c1c', marginTop: 8 }}>{d.error}</p>}
              {d?.items && d.items.length === 0 && !d.loading && <p style={{ fontSize: '0.78rem', color: '#92400e', marginTop: 8 }}>No documents uploaded.</p>}
              {d?.items?.map(it => (
                <div key={it.name} style={{ marginTop: 10 }}>
                  {it.image
                    ? <a href={it.url} target="_blank" rel="noreferrer"><img src={it.url} alt={it.name} style={{ width: '100%', borderRadius: 8, border: '1px solid #e8e8e0' }} /></a>
                    : <a href={it.url} target="_blank" rel="noreferrer" style={{ color: '#1e3db5', fontSize: '0.82rem' }}>Open {it.name}</a>}
                </div>
              ))}

              <button onClick={() => setConfirm({ g, verify: !g.nin_verified })}
                style={{ width: '100%', marginTop: 14, background: g.nin_verified ? '#fff' : '#166534', color: g.nin_verified ? '#b91c1c' : '#fff', border: g.nin_verified ? '1.5px solid #fca5a5' : 'none', borderRadius: 9, padding: '12px 0', fontWeight: 700, fontSize: '0.88rem', fontFamily: 'inherit' }}>
                {g.nin_verified ? 'Remove verification' : 'Verify this Home Guide'}
              </button>
            </div>
          )
        })}
      </div>

      {confirm && (
        <div onClick={() => setConfirm(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 360, width: '100%' }}>
            <h3 style={{ color: '#0d1b5e', marginBottom: 8 }}>{confirm.verify ? 'Verify' : 'Unverify'} {confirm.g.full_name}?</h3>
            <p style={{ color: '#6b7280', fontSize: '0.84rem', lineHeight: 1.6, marginBottom: 18 }}>
              {confirm.verify ? 'Make sure the NIN document matches their name and NIN. They will be able to list apartments.' : 'They will no longer be able to list apartments.'}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirm(null)} style={{ flex: 1, background: '#f4f3ef', border: 'none', borderRadius: 9, padding: '12px 0', fontWeight: 600, fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={setVerified} disabled={working} style={{ flex: 1, background: '#0d1b5e', color: '#fff', border: 'none', borderRadius: 9, padding: '12px 0', fontWeight: 700, fontFamily: 'inherit' }}>{working ? 'Saving…' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
