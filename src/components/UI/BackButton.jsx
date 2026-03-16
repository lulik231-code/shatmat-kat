// src/components/UI/BackButton.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function BackButton({ to }) {
  const navigate = useNavigate()
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => to ? navigate(to) : navigate(-1)}
      style={{
        position: 'fixed', top: 16, right: 16, zIndex: 100,
        width: 52, height: 52, borderRadius: '50%',
        background: 'var(--card2)', border: '2px solid rgba(255,255,255,0.1)',
        color: 'white', fontSize: '1.4rem', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
      }}
    >←</motion.button>
  )
}
