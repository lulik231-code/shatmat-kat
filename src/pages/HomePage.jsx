// src/pages/HomePage.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } },
}

export default function HomePage() {
  const navigate = useNavigate()
  const { profile } = useStore()

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24, gap: 0,
    }}>
      <motion.div variants={containerVariants} initial="hidden" animate="show"
        style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>

        <motion.div variants={itemVariants}>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 'clamp(2.5rem,8vw,4rem)', color: 'var(--gold)',
            textAlign: 'center', textShadow: '0 0 30px rgba(255,215,0,0.3)', lineHeight: 1.1 }}>
            ♟️ שחמט לילדים
          </div>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: '1rem', marginTop: 6 }}>
            בחר איך לשחק!
          </div>
        </motion.div>

        {/* Solo */}
        <motion.button variants={itemVariants} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/solo')}
          style={bigBtnStyle('#00b4d8')}>
          <span style={{ fontSize: '4rem' }}>🤖</span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>שחק נגד רובוט</div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>תרגל ולמד שחמט לבד</div>
          </div>
        </motion.button>

        {/* Online */}
        <motion.button variants={itemVariants} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (profile?.role === 'teacher' && profile.approved) navigate('/teacher/dashboard')
            else if (profile?.role === 'student') navigate('/lobby')
            else navigate('/login')
          }}
          style={bigBtnStyle('#00e676')}>
          <span style={{ fontSize: '4rem' }}>👫</span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>שחק עם חבר</div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>כיתת השחמט שלי</div>
          </div>
        </motion.button>

        {/* Teacher / Admin links */}
        <motion.div variants={itemVariants} style={{ display: 'flex', gap: 10, width: '100%', marginTop: 4 }}>
          {!profile && (
            <>
              <button className="btn-secondary" onClick={() => navigate('/login')} style={{ flex: 1, fontSize: '0.9rem' }}>
                🔑 כניסת מורה
              </button>
              <button className="btn-secondary" onClick={() => navigate('/teacher/register')} style={{ flex: 1, fontSize: '0.9rem' }}>
                ✏️ הרשמת מורה
              </button>
            </>
          )}
          {profile?.role === 'teacher' && profile.approved && (
            <button className="btn-secondary" onClick={() => navigate('/teacher/dashboard')} style={{ flex: 1 }}>
              🏫 לוח מורה
            </button>
          )}
          {profile?.role === 'super_admin' && (
            <button className="btn-secondary" onClick={() => navigate('/admin')} style={{ flex: 1 }}>
              ⚙️ מנהל ראשי
            </button>
          )}
          {profile && (
            <button className="btn-secondary"
              onClick={() => useStore.getState().signOut()}
              style={{ flex: 0.5, fontSize: '0.9rem' }}>
              יציאה
            </button>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

function bigBtnStyle(glowColor) {
  return {
    width: '100%',
    background: 'var(--card2)',
    border: `2px solid ${glowColor}33`,
    borderRadius: 24,
    padding: '24px 20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    color: 'white',
    fontFamily: 'var(--font)',
    boxShadow: `0 4px 20px ${glowColor}15`,
    transition: 'box-shadow 0.2s',
  }
}
