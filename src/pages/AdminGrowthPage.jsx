import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { AlertTriangle } from 'lucide-react'

const naira = (k) => `₦${Math.round((k || 0) / 100).toLocaleString()}`
const METRICS = [
  ['tenants', 'Tenants'], ['guides', 'Home Guides'], ['estate_devs', 'Estate developers'],
  ['visits', 'Website visits'], ['unlocks', 'Unlocks'], ['apt_codes', 'Apartment codes'],
  ['discount_ids', 'Discount IDs'], ['revenue_kobo', 'Revenue'],
]

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
  const max = Math.max(1, ...series.map(s => Number(s[metric] || 0)))
  const all = data?.all_time

  const card = { background: '#fff', border: '1px solid #e8e8e0', borderRadius: 14, padding: '14px 16px' }

  return (
    <div style={{ background: '#f4f3ef', minHeight: '100vh', paddingBottom: 90 }}>
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
              <div style={{ fontWeight: 700, color: '#0d1b5e', fontSize: '0.9rem', marginBottom: 12 }}>{METRICS.find(m => m[0] === metric)[1]} over time</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 120, overflowX: 'auto' }}>
                {series.map((s, i) => (
                  <div key={i} title={`${s.label}: ${fmt(metric, s[metric])}`} style={{ flex: 1, minWidth: 6, background: '#0d1b5e', borderRadius: '3px 3px 0 0', height: `${Math.max(2, (Number(s[metric] || 0) / max) * 100)}%`, opacity: Number(s[metric]) ? 1 : 0.2 }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#9ca3af', marginTop: 6 }}>
                <span>{series[0]?.label}</span><span>{series[series.length - 1]?.label}</span>
              </div>
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
              Revenue counts money received through Paystack for Arleece IDs. Credit-covered IDs add ₦0. Estate developers show 0 until that role exists. Visits start counting from the day you deploy this.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
