// src/pages/SoloPage.jsx
import React, { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Chess } from 'chess.js'
import ChessBoard from '../components/Board/ChessBoard'
import PlayerBar from '../components/Board/PlayerBar'
import WinModal from '../components/UI/WinModal'
import BackButton from '../components/UI/BackButton'
import { useBot } from '../hooks/useBot'

const AVATARS = [
  {emoji:'🦁',name:'אריה'},{emoji:'🐯',name:'נמר'},{emoji:'🦊',name:'שועל'},
  {emoji:'🐻',name:'דב'},{emoji:'🐼',name:'פנדה'},{emoji:'🐸',name:'צפרדע'},
  {emoji:'🦋',name:'פרפר'},{emoji:'🐬',name:'דולפין'},{emoji:'🦄',name:'חד-קרן'},
  {emoji:'🐲',name:'דרקון'},{emoji:'⭐',name:'כוכב'},{emoji:'🌈',name:'קשת'},
]

const STEP = { AVATAR: 'avatar', DIFF: 'diff', GAME: 'game' }

export default function SoloPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(STEP.AVATAR)
  const [playerAv, setPlayerAv] = useState(null)
  const [difficulty, setDifficulty] = useState('easy')
  const [chess] = useState(() => new Chess())
  const [fen, setFen] = useState(chess.fen())
  const [lastMove, setLastMove] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [scores, setScores] = useState({ player: 0, bot: 0 })
  const [winData, setWinData] = useState(null)
  const [historyStack, setHistoryStack] = useState([])
  const botRef = useRef(difficulty)
  botRef.current = difficulty
  const { getBotMove } = useBot(difficulty)

  const PIECE_VALUES = { p:1, n:3, b:3, r:5, q:9 }

  const handleMove = useCallback((move) => {
    // Update score
    if (move.captured) {
      setScores(s => ({ ...s, player: s.player + (PIECE_VALUES[move.captured] || 1) }))
    }
    setHistoryStack(h => [...h, chess.fen()])
    setLastMove({ from: move.from, to: move.to })
    setFen(chess.fen())

    if (chess.isGameOver()) {
      handleGameOver(); return
    }

    // Bot moves after short delay
    setTimeout(() => {
      const botMove = getBotMove(chess)
      if (!botMove) return
      const result = chess.move(botMove)
      if (!result) return
      if (result.captured) {
        setScores(s => ({ ...s, bot: s.bot + (PIECE_VALUES[result.captured] || 1) }))
      }
      setLastMove({ from: result.from, to: result.to })
      setFen(chess.fen())
      if (chess.isGameOver()) handleGameOver()
    }, 600)
  }, [chess, getBotMove])

  function handleGameOver() {
    if (chess.isCheckmate()) {
      const winnerIsPlayer = chess.turn() === 'b' // player is white, if black to move = white won
      setWinData({
        isDraw: false,
        winnerEmoji: winnerIsPlayer ? playerAv?.emoji : '🤖',
        winnerName: winnerIsPlayer ? playerAv?.name : (difficulty === 'easy' ? 'הרובוט המבולבל' : 'הרובוט החכם'),
      })
    } else {
      setWinData({ isDraw: true })
    }
  }

  function undoMove() {
    chess.undo() // undo bot
    chess.undo() // undo player
    setFen(chess.fen())
    setLastMove(null)
  }

  function resetGame() {
    chess.reset()
    setFen(chess.fen())
    setLastMove(null)
    setScores({ player: 0, bot: 0 })
    setWinData(null)
    setHistoryStack([])
  }

  // ── AVATAR STEP ──
  if (step === STEP.AVATAR) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <BackButton to="/" />
        <div className="title" style={{ marginBottom: 8 }}>👤 מי אתה?</div>
        <div className="subtitle" style={{ marginBottom: 28 }}>בחר את הדמות שלך</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, maxWidth: 380, width: '100%', marginBottom: 24 }}>
          {AVATARS.map((av, i) => (
            <motion.button key={i} whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}
              onClick={() => setPlayerAv(av)}
              style={{
                background: playerAv?.emoji === av.emoji ? 'rgba(255,215,0,0.15)' : 'var(--card)',
                border: `2px solid ${playerAv?.emoji === av.emoji ? 'var(--gold)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 16, padding: '14px 6px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                boxShadow: playerAv?.emoji === av.emoji ? '0 0 20px rgba(255,215,0,0.25)' : 'none',
              }}>
              <span style={{ fontSize: '2.5rem' }}>{av.emoji}</span>
              <span style={{ fontSize: '0.7rem', color: '#ccc' }}>{av.name}</span>
            </motion.button>
          ))}
        </div>
        {playerAv && (
          <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="btn-primary" style={{ maxWidth: 300 }}
            onClick={() => setStep(STEP.DIFF)}>
            המשך → {playerAv.emoji}
          </motion.button>
        )}
      </div>
    )
  }

  // ── DIFFICULTY STEP ──
  if (step === STEP.DIFF) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <BackButton />
        <div className="title" style={{ marginBottom: 8 }}>🎮 בחר רובוט</div>
        <div className="subtitle" style={{ marginBottom: 32 }}>איזה רובוט תרצה לשחק נגדו?</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 380 }}>
          {[
            { id: 'easy', icon: '🤪', label: 'רובוט מבולבל', desc: 'עושה טעויות — אתה תנצח!', color: '#00e676' },
            { id: 'hard', icon: '🤖', label: 'רובוט חכם', desc: 'קצת יותר מאתגר', color: '#e94560' },
          ].map(d => (
            <motion.button key={d.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setDifficulty(d.id); setStep(STEP.GAME) }}
              style={{
                background: 'var(--card2)', border: `2px solid ${d.color}44`,
                borderRadius: 20, padding: '22px 20px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 16, color: 'white',
                fontFamily: 'var(--font)', transition: 'all 0.2s',
              }}>
              <span style={{ fontSize: '3rem' }}>{d.icon}</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{d.label}</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{d.desc}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // ── GAME STEP ──
  const botName = difficulty === 'easy' ? 'רובוט מבולבל 🤪' : 'רובוט חכם 🤖'
  const isPlayerTurn = chess.turn() === 'w'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '70px 12px 20px' }}>
      <BackButton to="/" />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%', maxWidth: 500 }}>

        {/* Bot bar (top) */}
        <PlayerBar emoji="🤖" name={botName} isActive={!isPlayerTurn} score={scores.bot} />

        {/* Board */}
        <ChessBoard
          fen={fen}
          playerColor="w"
          onMove={handleMove}
          disabled={!isPlayerTurn || !!winData}
          lastMove={lastMove}
          showHints={showHint}
        />

        {/* Player bar (bottom) */}
        <PlayerBar emoji={playerAv?.emoji || '⭐'} name={playerAv?.name || 'אתה'} isActive={isPlayerTurn} score={scores.player} />

        {/* Controls */}
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          {[
            { icon: '↩️', label: 'ביטול', onClick: undoMove },
            { icon: '💡', label: 'רמז', onClick: () => { setShowHint(true); setTimeout(() => setShowHint(false), 2500) } },
            { icon: '🔄', label: 'מחדש', onClick: resetGame },
          ].map(btn => (
            <motion.button key={btn.label} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={btn.onClick}
              style={{
                flex: 1, background: 'var(--card)', border: '1.5px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '12px 8px', cursor: 'pointer', color: 'white',
                fontFamily: 'var(--font)', fontSize: '0.8rem', display: 'flex',
                flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
              <span style={{ fontSize: '1.5rem' }}>{btn.icon}</span>{btn.label}
            </motion.button>
          ))}
        </div>
      </div>

      <WinModal
        show={!!winData}
        isDraw={winData?.isDraw}
        winnerEmoji={winData?.winnerEmoji}
        winnerName={winData?.winnerName}
        onPlayAgain={resetGame}
        onHome={() => navigate('/')}
      />
    </div>
  )
}
