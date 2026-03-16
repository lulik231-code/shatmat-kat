// src/components/UI/WinModal.jsx
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'

export default function WinModal({ show, winnerEmoji, winnerName, isDraw, onPlayAgain, onHome }) {
  if (!show) return null
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.88)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
      >
        <Confetti recycle={false} numberOfPieces={250} gravity={0.15} />
        <motion.div
          initial={{ scale: 0.7, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          style={{
            background: 'var(--card2)',
            borderRadius: 28, padding: '40px 32px',
            maxWidth: 380, width: '100%', textAlign: 'center',
            border: '2px solid rgba(255,215,0,0.4)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}
        >
          {isDraw ? (
            <>
              <div style={{ fontSize: '5rem', marginBottom: 8 }}>🤝</div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', color: 'var(--gold)', marginBottom: 12 }}>
                תיקו!
              </div>
              <p style={{ color: '#aaa', marginBottom: 28 }}>שני השחקנים שיחקו נהדר! 🌟</p>
            </>
          ) : (
            <>
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                style={{ fontSize: '3.5rem', marginBottom: 4 }}
              >👑</motion.div>
              <div style={{ fontSize: '4rem', marginBottom: 8 }}>{winnerEmoji}</div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', color: 'var(--gold)', marginBottom: 12 }}>
                {winnerName} ניצח!
              </div>
              <p style={{ color: '#aaa', marginBottom: 28 }}>כל הכבוד! שיחה מדהימה! 🎉</p>
            </>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="btn-primary" onClick={onPlayAgain}>שחק שוב! 🎮</button>
            <button className="btn-secondary" onClick={onHome}>חזור לבית 🏠</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
