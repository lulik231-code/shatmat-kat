// src/components/UI/LoadingScreen.jsx
import React from 'react'
import { motion } from 'framer-motion'

export default function LoadingScreen({ text = 'טוען...' }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        style={{ fontSize: '4rem' }}
      >♟️</motion.div>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }}>{text}</p>
    </div>
  )
}
