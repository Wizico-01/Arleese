import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { MessageCircle } from 'lucide-react'

export default function WhatsAppButton() {
  const [num, setNum] = useState('')
  useEffect(() => {
    supabase.rpc('public_config').then(({ data }) => setNum(data?.support_whatsapp || ''))
  }, [])
  if (!num) return null
  const text = encodeURIComponent('Hello Arleece, I need help.')
  return (
    <a
      href={`https://wa.me/${num}?text=${text}`}
      target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"
      style={{
        position: 'fixed', left: 12, bottom: 78, zIndex: 1000,
        width: 52, height: 52, borderRadius: '50%', background: '#25D366',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(0,0,0,.28)',
      }}
    >
      <MessageCircle size={26} color="#fff" />
    </a>
  )
}
