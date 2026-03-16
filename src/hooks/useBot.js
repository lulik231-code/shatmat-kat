// src/hooks/useBot.js
import { useCallback } from 'react'

const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }

export function useBot(difficulty = 'easy') {
  const getBotMove = useCallback((chess) => {
    const moves = chess.moves({ verbose: true })
    if (!moves.length) return null

    if (difficulty === 'easy') {
      // Confused robot: 70% random, 30% worst move (avoids captures)
      if (Math.random() < 0.7) {
        return moves[Math.floor(Math.random() * moves.length)]
      }
      // Pick a non-capture move if possible
      const safe = moves.filter(m => !m.captured)
      return safe.length ? safe[Math.floor(Math.random() * safe.length)] : moves[0]
    }

    // Smart robot: minimax depth 2 (light)
    const sorted = [...moves].sort((a, b) => {
      const bv = b.captured ? PIECE_VALUES[b.captured] || 0 : 0
      const av = a.captured ? PIECE_VALUES[a.captured] || 0 : 0
      return bv - av
    })

    // 60% take best capture, else random among top 5
    if (sorted[0].captured && Math.random() < 0.6) return sorted[0]
    const pool = sorted.slice(0, Math.min(5, sorted.length))
    return pool[Math.floor(Math.random() * pool.length)]
  }, [difficulty])

  return { getBotMove }
}
