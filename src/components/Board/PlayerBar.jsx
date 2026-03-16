// src/components/Board/PlayerBar.jsx
import React from 'react'
import { motion } from 'framer-motion'

export default function PlayerBar({ emoji, name, isActive, score = 0, turnLabel }) {
  return (
    <motion.div
      animate={{ borderColor: isActive ? 'var(--gold)' : 'rgba(255,255,255,0.06)' }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--card)', borderRadius: 16, padding: '12px 16px',
        border: '2px solid rgba(255,255,255,0.06)',
        boxShadow: isActive ? '0 0 20px rgba(255,215,0,0.15)' : 'none',
        width: '100%', transition: 'box-shadow 0.3s',
      }}
    >
      <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{emoji}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{name}</div>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ fontSize: '0.8rem', color: 'var(--gold)', marginTop: 2 }}
          >
            ⭐ {turnLabel || 'התור שלך!'}
          </motion.div>
        )}
      </div>
      <div style={{
        background: 'var(--card2)', borderRadius: 10,
        padding: '4px 14px', fontSize: '1rem', color: '#ccc',
        minWidth: 40, textAlign: 'center',
      }}>
        {score}
      </div>
    </motion.div>
  )
}
