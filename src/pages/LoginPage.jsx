// src/pages/LoginPage.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import BackButton from '../components/UI/BackButton'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) { setError('אימייל או סיסמה שגויים'); return }

    // Load profile to decide where to go
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
    if (profile?.role === 'super_admin') navigate('/admin')
    else if (profile?.role === 'teacher' && profile?.approved) navigate('/teacher/dashboard')
    else if (profile?.role === 'teacher' && !profile?.approved) navigate('/teacher/waiting')
    else navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <BackButton to="/" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 400 }}>
        <div className="title" style={{ marginBottom: 8 }}>🔑 כניסה</div>
        <div className="subtitle" style={{ marginBottom: 32 }}>כניסת מורים ומנהלים</div>

        <div className="card2">
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">כתובת אימייל</label>
              <input className="input" type="email" placeholder="teacher@school.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">סיסמה</label>
              <input className="input" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? '⏳ מתחבר...' : '✅ כניסה'}
            </button>
          </form>
          <button className="btn-secondary" style={{ marginTop: 12 }}
            onClick={() => navigate('/teacher/register')}>
            אין לי חשבון — הרשמה
          </button>
        </div>
      </motion.div>
    </div>
  )
}
