import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { AlertTriangle } from 'lucide-react'

const naira = (k) => `₦${Math.round((k || 0) / 100).toLocaleString()}`
const METRICS = [
  ['tenants', 'Tenants'], ['guides', 'Home Guides'], ['estate_devs', 'Estate developers'],
  ['visits', 'Website visits'], ['unlocks', 'Unlocks'], ['apt_codes', 'Apartment codes'],
  ['discount_ids', 'Discount IDs'], ['revenue_kobo', 'Revenue'],
]

function LineChart({ points, labels, format }) {
  const [sel, setSel] = useState(null)
  const n = points.length
  if (!n) return null
  const W = 320, H = 150, L = 10, R = 10, T = 12, B = 12
  const peak = Math.max(0, ...points)
  const max = Math.max(1, peak)
  const span = W - L - R
  const x = (i) => L + (n === 1 ? span / 2 : (i * span) / (n - 1))
  const y = (v) => T + (1 - v / max) * (H - T - B)
  const line = points.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const area = `${line} L${x(n - 1).toFixed(1)} ${H - B} L${x(0).toFixed(1)} ${H - B} Z`
  const i = sel == null ? n - 1 : sel

  const pick = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    const idx = n === 1 ? 0 : Math.round(((px - L) / span) * (n - 1))
    setSel(Math.min(n - 1, Math.max(0, idx)))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div style={{ fontSize: '0.82rem', color: '#0d1b5e' }}>
          <strong>{format(points[i])}</strong>{' '}
          <span style={{ color: '#9ca3af' }}>on {labels[i]}</span>
        </div>
        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Peak {format(peak)}</div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        onPointerDown={pick}
        onPointerMove={pick}
        style={{ width: '100%', height: 'auto', display: 'block', touchAction: 'pan-y' }}
      >
        {[0, 0.5, 1].map(f => (
          <line key={f} x1={L} x2={W - R} y1={T + f * (H - T - B)} y2={T + f * (H - T - B)} stroke="#eceae3" strokeWidth="1" />
        ))}
        <path d={area} fill="#0d1b5e" fillOpacity="0.08" />
        <path d={line} fill="none" stroke="#0d1b5e" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        {n <= 31 && points.map((v, k) => (
          <circle key={k} cx={x(k)} cy={y(v)} r="2.6" fill="#fff" stroke="#0d1b5e" strokeWidth="1.6" />
        ))}
        <line x1={x(i)} x2={x(i)} y1={T} y2={H - B} stroke="#0d1b5e" strokeOpacity="0.25" strokeDasharray="3 3" />
        <circle cx={x(i)} cy={y(points[i])} r="5" fill="#0d1b5e" stroke="#fff" strokeWidth="2" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#9ca3af', marginTop: 6 }}>
        <span>{labels[0]}</span><span>{labels[n - 1]}</span>
      </div>
    </div>
  )
}

export default function AdminGrowthPage({ user, setPage }) {
  const [period, setPeriod] = useState('week')
  const [data, setData] = useState(null)
  const [metric, setMetric] = useState('visits')
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!user?.isAdmin) return
    setLoading(true); setErr('')
    supabase.rpc('admin_growth', { p_period: period }).then(({ data, error }) => {
      if (error) setErr('Could not load the numbers.')
      else setData(data)
      setLoading(false)
    })
  }, [period, user?.isAdmin])

  if (!user?.isAdmin) return (
    <div style={{ minHeight: '100vh', background: '#f4f3ef', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, padding: 24 }}>
      <AlertTriangle size={36} color="#92400e" />
      <h2 style={{ fontFamily: "'DM Serif Display',serif", color: '#0d1b5e' }}>Admins only</h2>
      <button onClick={() => setPage('home')} style={{ background: '#0d1b5e', color: '#fff', border: 'none', borderRadius: 9, padding: '11px 28px', fontFamily: 'inherit', fontWeight: 600 }}>Back to Home</button>
    </div>
  )

  const series = data?.series || []
  const sum = (k) => series.reduce((a, s) => a + Number(s[k] || 0), 0)
  const fmt = (k, v) => k === 'revenue_kobo' ? naira(v) : Number(v).toLocaleString()
  const all = data?.all_time
  const card = { background: '#fff', border: '1px solid #e8e8e0', borderRadius: 14, padding: '14px 16px' }

  return (
    <div style={{ background: '#f4f3ef', minHeight: '100vh', paddingBottom: 190 }}>
      <div style={{ background: 'linear-gradient(135deg,#060e33,#0d1b5e)', padding: '36px 20px 24px' }}>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", color: '#fff', fontSize: '1.6rem', marginBottom: 4 }}>Growth dashboard</h1>
        <p style={{ color: 'rgba(255,255,255,.65)', fontSize: '0.84rem' }}>Lagos time. Your own visits are not counted.</p>
      </div>

      <div style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', background: '#e8e8e0', borderRadius: 10, padding: 3, marginBottom: 14 }}>
          {[['day', 'Today'], ['week', '7 days'], ['month', '30 days'], ['year', '12 months']].map(([id, l]) => (
            <button key={id} onClick={() => setPeriod(id)} style={{ flex: 1, padding: '9px 0', border: 'none', borderRadius: 8, background: period === id ? '#fff' : 'transparent', color: period === id ? '#0d1b5e' : '#6b7280', fontWeight: 700, fontSize: '0.76rem', fontFamily: 'inherit' }}>{l}</button>
          ))}
        </div>

        {err && <p style={{ color: '#b91c1c', fontSize: '0.84rem' }}>{err}</p>}
        {loading && <p style={{ textAlign: 'center', color: '#9ca3af', padding: 30 }}>Loading…</p>}

        {!loading && data && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {METRICS.map(([k, l]) => (
                <button key={k} onClick={() => setMetric(k)} style={{ ...card, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', borderColor: metric === k ? '#0d1b5e' : '#e8e8e0', borderWidth: metric === k ? 2 : 1 }}>
                  <div style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: 4 }}>{l}</div>
                  <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.5rem', color: '#0d1b5e' }}>{fmt(k, sum(k))}</div>
                </button>
              ))}
            </div>

            <div style={{ ...card, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: '#0d1b5e', fontSize: '0.9rem', marginBottom: 12 }}>
                {METRICS.find(m => m[0] === metric)[1]} over time
              </div>
              <LineChart
                key={`${metric}-${period}`}
                points={series.map(s => Number(s[metric] || 0))}
                labels={series.map(s => s.label)}
                format={(v) => fmt(metric, v)}
              />
            </div>

            <div style={card}>
              <div style={{ fontWeight: 700, color: '#0d1b5e', fontSize: '0.9rem', marginBottom: 10 }}>All time</div>
              {[
                ['Total users', all.users], ['Home Guides', `${all.guides} (${all.verified_guides} verified)`],
                ['Unlocks', all.unlocks], ['Discount IDs', `${all.ids} (${all.ids_used} used)`],
                ['Revenue', naira(all.revenue_kobo)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #f4f3ef', fontSize: '0.84rem' }}>
                  <span style={{ color: '#6b7280' }}>{k}</span><span style={{ color: '#0d1b5e', fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '0.74rem', color: '#9ca3af', lineHeight: 1.6, marginTop: 14 }}>
              Revenue counts money received through Paystack for Arleece IDs. Credit-covered IDs add ₦0. Estate developers show 0 until that role exists. Visits count from the day tracking went live.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
