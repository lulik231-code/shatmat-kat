// src/components/Board/HourglassTimer.jsx
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function HourglassTimer({ seconds = 45, active = true, onExpire }) {
  const [left, setLeft] = useState(seconds)

  useEffect(() => {
    setLeft(seconds)
  }, [seconds])

  useEffect(() => {
    if (!active) return
    if (left <= 0) { onExpire && onExpire(); return }
    const t = setTimeout(() => setLeft(l => l - 1), 1000)
    return () => clearTimeout(t)
  }, [left, active])

  const pct = Math.max(0, (left / seconds) * 100)
  const danger = pct < 25

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--card)', borderRadius: 14, padding: '10px 16px',
      width: '100%',
    }}>
      <motion.span
        animate={danger ? { rotate: [0, -10, 10, -10, 0] } : {}}
        transition={{ repeat: Infinity, duration: 0.6 }}
        style={{ fontSize: '1.5rem' }}
      >⏳</motion.span>
      <div style={{
        flex: 1, height: 10, borderRadius: 10,
        background: 'rgba(255,255,255,0.1)', overflow: 'hidden',
      }}>
        <motion.div
          animate={{ width: pct + '%' }}
          transition={{ duration: 1, ease: 'linear' }}
          style={{
            height: '100%', borderRadius: 10,
            background: danger
              ? 'linear-gradient(to right, #ff5722, var(--accent))'
              : 'linear-gradient(to right, var(--gold), #ffaa00)',
          }}
        />
      </div>
      <span style={{ fontSize: '0.9rem', color: danger ? 'var(--accent)' : '#aaa', minWidth: 28, textAlign: 'center' }}>
        {left}
      </span>
    </div>
  )
}
