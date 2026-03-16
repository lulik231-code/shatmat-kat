// src/components/Board/ChessBoard.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chess } from 'chess.js'

const FILES = ['a','b','c','d','e','f','g','h']

const PIECE_EMOJI = {
  wP:'♙', wN:'♘', wB:'♗', wR:'♖', wQ:'♕', wK:'♔',
  bP:'♟', bN:'♞', bB:'♝', bR:'♜', bQ:'♛', bK:'♚',
}

function sqToCoords(sq) {
  const file = sq.charCodeAt(0) - 97   // a=0..h=7
  const rank = parseInt(sq[1]) - 1      // 1=0..8=7
  return { col: file, row: 7 - rank }
}

export default function ChessBoard({
  fen,
  playerColor = 'w',    // which side this player controls
  onMove,               // callback(move) after legal move
  disabled = false,
  lastMove = null,
  showHints = false,
}) {
  const [chess]      = useState(() => new Chess(fen || undefined))
  const [board, setBoard]       = useState(chess.board())
  const [selected, setSelected] = useState(null)    // square string
  const [highlights, setHighlights] = useState([])  // legal target squares
  const [hintSquares, setHintSquares] = useState([])
  const [bouncing, setBouncing]   = useState(null)
  const [capturing, setCapturing] = useState(null)

  // Sync external FEN changes (online game)
  useEffect(() => {
    if (fen && fen !== chess.fen()) {
      chess.load(fen)
      setBoard(chess.board())
      setSelected(null)
      setHighlights([])
    }
  }, [fen])

  // Hint: highlight 2-3 good source squares
  useEffect(() => {
    if (!showHints) { setHintSquares([]); return }
    const moves = chess.moves({ verbose: true }).filter(m => {
      const p = chess.get(m.from)
      return p && p.color === playerColor
    })
    const froms = [...new Set(moves.map(m => m.from))].slice(0, 2)
    setHintSquares(froms)
    const t = setTimeout(() => setHintSquares([]), 2500)
    return () => clearTimeout(t)
  }, [showHints])

  const handleSquareClick = useCallback((sq) => {
    if (disabled) return
    if (chess.turn() !== playerColor) return

    if (!selected) {
      const piece = chess.get(sq)
      if (!piece || piece.color !== playerColor) return
      setSelected(sq)
      const moves = chess.moves({ square: sq, verbose: true })
      setHighlights(moves.map(m => m.to))
      return
    }

    // Same square → deselect
    if (sq === selected) {
      setSelected(null); setHighlights([]); return
    }

    // Clicking another own piece → switch selection
    const piece = chess.get(sq)
    if (piece && piece.color === playerColor) {
      setSelected(sq)
      const moves = chess.moves({ square: sq, verbose: true })
      setHighlights(moves.map(m => m.to))
      return
    }

    // Try the move
    const wasCapture = chess.get(sq) !== null
    const result = chess.move({ from: selected, to: sq, promotion: 'q' })
    setSelected(null); setHighlights([])

    if (!result) {
      // Illegal — bounce
      setBouncing(selected)
      setTimeout(() => setBouncing(null), 500)
      return
    }

    // Capture animation
    if (wasCapture) {
      setCapturing(sq)
      setTimeout(() => setCapturing(null), 400)
    }

    setBoard(chess.board())
    onMove && onMove({ ...result, fen: chess.fen() })
  }, [selected, disabled, playerColor, chess, onMove])

  const inCheck = chess.inCheck()
  const kingPos = inCheck ? findKing(chess.board(), chess.turn()) : null

  return (
    <div style={{
      width: '100%',
      maxWidth: 480,
      aspectRatio: '1',
      display: 'grid',
      gridTemplateColumns: 'repeat(8, 1fr)',
      gridTemplateRows: 'repeat(8, 1fr)',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 12px 50px rgba(0,0,0,0.6)',
      userSelect: 'none',
    }}>
      {Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => {
          const sq = FILES[col] + (8 - row)
          const isLight = (row + col) % 2 === 0
          const isSelected = selected === sq
          const isHighlight = highlights.includes(sq)
          const isLastMove = lastMove && (sq === lastMove.from || sq === lastMove.to)
          const isCheck = sq === kingPos
          const isHint = hintSquares.includes(sq)
          const piece = board[row][col]
          const key = piece ? piece.color + piece.type.toUpperCase() : null
          const isBouncing = bouncing === sq
          const isCapturing = capturing === sq

          return (
            <div
              key={sq}
              onClick={() => handleSquareClick(sq)}
              style={{
                position: 'relative',
                background: isCheck
                  ? 'rgba(233,69,96,0.75)'
                  : isSelected
                  ? 'rgba(255,215,0,0.55)'
                  : isHighlight
                  ? (isLight ? '#a5e8b0' : '#6abf72')
                  : isLastMove
                  ? (isLight ? '#f6f669' : '#baca2b')
                  : isHint
                  ? 'rgba(120,120,255,0.55)'
                  : isLight ? 'var(--light-sq)' : 'var(--dark-sq)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.12s',
              }}
            >
              {/* Legal move dot (empty squares) */}
              {isHighlight && !piece && (
                <div style={{
                  width: '32%', height: '32%', borderRadius: '50%',
                  background: 'rgba(0,180,60,0.7)',
                  pointerEvents: 'none',
                }} />
              )}

              {/* Legal move ring (occupied squares) */}
              {isHighlight && piece && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 2,
                  border: '4px solid rgba(0,200,60,0.8)',
                  pointerEvents: 'none', zIndex: 1,
                }} />
              )}

              {/* Piece */}
              <AnimatePresence>
                {piece && !isCapturing && (
                  <motion.span
                    key={sq + key}
                    initial={{ scale: 0.8 }}
                    animate={
                      isBouncing
                        ? { scale: [1, 1.3, 0.85, 1.1, 1], rotate: [0, -8, 6, -3, 0] }
                        : inCheck && sq === kingPos
                        ? { scale: [1, 1.15, 1], transition: { repeat: Infinity, duration: 0.6 } }
                        : { scale: 1 }
                    }
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    style={{
                      fontSize: 'clamp(1.6rem, 5.5vw, 3rem)',
                      color: piece.color === 'w' ? '#fff8e1' : '#2d1a0e',
                      filter: piece.color === 'w'
                        ? 'drop-shadow(0 2px 3px rgba(0,0,0,0.45))'
                        : 'drop-shadow(0 1px 2px rgba(255,255,255,0.15))',
                      lineHeight: 1,
                      cursor: 'grab',
                      position: 'relative',
                      zIndex: 2,
                    }}
                  >
                    {PIECE_EMOJI[key]}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          )
        })
      )}
    </div>
  )
}

function findKing(board, color) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c]
      if (p && p.type === 'k' && p.color === color) {
        return FILES[c] + (8 - r)
      }
    }
  }
  return null
}
