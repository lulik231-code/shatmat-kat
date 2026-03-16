// src/pages/TeacherRegister.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import BackButton from '../components/UI/BackButton'

export default function TeacherRegister() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { display_name: form.name, role: 'teacher' } }
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    navigate('/teacher/waiting')
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <BackButton to="/login" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 400 }}>
        <div className="title" style={{ marginBottom: 8 }}>✏️ הרשמת מורה</div>
        <div className="subtitle" style={{ marginBottom: 32 }}>לאחר ההרשמה המנהל יאשר את חשבונך</div>
        <div className="card2">
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">שם מלא</label>
              <input className="input" placeholder="שם המורה" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="label">אימייל</label>
              <input className="input" type="email" placeholder="teacher@school.com" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="label">סיסמה (לפחות 6 תווים)</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required minLength={6} />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? '⏳ שולח...' : '📨 שלח בקשת הרשמה'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
