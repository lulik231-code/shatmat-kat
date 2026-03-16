// src/pages/SuperAdminDash.jsx
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useStore } from '../lib/store'
import BackButton from '../components/UI/BackButton'
import LoadingScreen from '../components/UI/LoadingScreen'

export default function SuperAdminDash() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const { signOut } = useStore()

  useEffect(() => { loadTeachers() }, [])

  async function loadTeachers() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'teacher')
      .order('created_at', { ascending: false })
    setTeachers(data || [])
    setLoading(false)
  }

  async function setApproval(id, approved) {
    await supabase.from('profiles').update({ approved }).eq('id', id)
    setTeachers(t => t.map(x => x.id === id ? { ...x, approved } : x))
  }

  if (loading) return <LoadingScreen text="טוען מורים..." />

  return (
    <div style={{ minHeight: '100vh', padding: 24, paddingTop: 80 }}>
      <BackButton to="/" />
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="title" style={{ marginBottom: 6 }}>⚙️ לוח מנהל ראשי</div>
        <div className="subtitle" style={{ marginBottom: 28 }}>ניהול בקשות מורים</div>

        {teachers.length === 0 && (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: 40 }}>
            אין מורים רשומים עדיין
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {teachers.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              style={{
                background: 'var(--card)',
                border: `1.5px solid ${t.approved ? 'rgba(0,230,118,0.3)' : 'rgba(233,69,96,0.3)'}`,
                borderRadius: 16, padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
              <div style={{ fontSize: '2rem' }}>👩‍🏫</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{t.display_name}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  {t.approved ? '✅ מאושר' : '⏳ ממתין לאישור'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
                  {new Date(t.created_at).toLocaleDateString('he-IL')}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {!t.approved && (
                  <button onClick={() => setApproval(t.id, true)}
                    style={actionBtn('var(--green)', '#1a3a1a')}>
                    ✅ אשר
                  </button>
                )}
                {t.approved && (
                  <button onClick={() => setApproval(t.id, false)}
                    style={actionBtn('var(--accent)', '#3a1a1a')}>
                    🚫 בטל
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <button className="btn-secondary" style={{ marginTop: 32 }} onClick={signOut}>
          יציאה
        </button>
      </div>
    </div>
  )
}

function actionBtn(color, bg) {
  return {
    background: bg, color: color, border: `1.5px solid ${color}`,
    borderRadius: 10, padding: '6px 14px', fontSize: '0.85rem',
    cursor: 'pointer', fontFamily: 'var(--font)', whiteSpace: 'nowrap',
    transition: 'opacity 0.15s',
  }
}
