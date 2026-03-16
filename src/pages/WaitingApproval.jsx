// src/pages/WaitingApproval.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function WaitingApproval() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          style={{ fontSize: '5rem', marginBottom: 20 }}>⏳</motion.div>
        <div className="title" style={{ marginBottom: 12 }}>ממתין לאישור</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32, lineHeight: 1.7 }}>
          בקשת ההרשמה שלך נשלחה למנהל.<br />
          תקבל אישור בקרוב!
        </div>
        <button className="btn-secondary" onClick={async () => {
          await supabase.auth.signOut()
          navigate('/')
        }}>חזור לדף הבית</button>
      </motion.div>
    </div>
  )
}
