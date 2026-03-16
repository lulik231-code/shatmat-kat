// src/pages/GamePage.jsx
import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Chess } from 'chess.js'
import { supabase } from '../lib/supabase'
import { useStore } from '../lib/store'
import ChessBoard from '../components/Board/ChessBoard'
import PlayerBar from '../components/Board/PlayerBar'
import HourglassTimer from '../components/Board/HourglassTimer'
import WinModal from '../components/UI/WinModal'
import BackButton from '../components/UI/BackButton'
import LoadingScreen from '../components/UI/LoadingScreen'
import { useOnlineGame } from '../hooks/useOnlineGame'

const PIECE_VALUES = { p:1, n:3, b:3, r:5, q:9 }
const EMOJIS = ['👏','😊','🤔','👍','🌟']

export default function GamePage() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const { student } = useStore()
  const [game, setGame] = useState(null)
  const [chess] = useState(() => new Chess())
  const [fen, setFen] = useState(chess.fen())
  const [lastMove, setLastMove] = useState(null)
  const [scores, setScores] = useState({ white: 0, black: 0 })
  const [winData, setWinData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [floatingEmoji, setFloatingEmoji] = useState(null)
  const [opponent, setOpponent] = useState(null)
  const [playerColor, setPlayerColor] = useState('w')
  const [timerKey, setTimerKey] = useState(0)

  const { pushMove } = useOnlineGame({
    gameId,
    onUpdate: (updatedGame) => {
      // Opponent made a move — sync board
      if (updatedGame.fen && updatedGame.fen !== chess.fen()) {
        chess.load(updatedGame.fen)
        setFen(updatedGame.fen)
        setLastMove(updatedGame.last_move)
        setTimerKey(k => k + 1)
      }
      if (updatedGame.status === 'finished') {
        loadWinner(updatedGame.winner_id)
      }
    }
  })

  useEffect(() => { loadGame() }, [gameId])

  async function loadGame() {
    const { data } = await supabase.from('games').select(`
      *, 
      white:white_student_id(*),
      black:black_student_id(*)
    `).eq('id', gameId).single()
    if (!data) { navigate('/'); return }
    setGame(data)
    chess.load(data.fen || chess.fen())
    setFen(chess.fen())
    setLastMove(data.last_move)

    // Determine my color
    const color = data.white_student_id === student?.id ? 'w' : 'b'
    setPlayerColor(color)
    setOpponent(color === 'w' ? data.black : data.white)
    setLoading(false)
  }

  async function loadWinner(winnerId) {
    const { data: winner } = await supabase.from('students').select('*').eq('id', winnerId).single()
    const isMe = winnerId === student?.id
    setWinData({
      isDraw: false,
      winnerEmoji: winner?.avatar_emoji,
      winnerName: winner?.display_name,
    })
  }

  const handleMove = useCallback(async (move) => {
    if (move.captured) {
      const val = PIECE_VALUES[move.captured] || 1
      setScores(s => ({
        ...s,
        [playerColor === 'w' ? 'white' : 'black']: s[playerColor === 'w' ? 'white' : 'black'] + val,
      }))
    }
    setLastMove({ from: move.from, to: move.to })
    setFen(chess.fen())
    setTimerKey(k => k + 1)

    // Check game over
    let status = 'active', winnerId = null
    if (chess.isCheckmate()) {
      status = 'finished'
      winnerId = student?.id
      setWinData({ isDraw: false, winnerEmoji: student?.avatar_emoji, winnerName: student?.display_name })
    } else if (chess.isDraw() || chess.isStalemate()) {
      status = 'draw'
      setWinData({ isDraw: true })
    }

    await pushMove({ fen: chess.fen(), lastMove: { from: move.from, to: move.to }, turn: chess.turn(), status, winnerId })
  }, [chess, pushMove, student, playerColor])

  function handleTimerExpire() {
    // Gently auto-pass turn by making first legal move
    const moves = chess.moves({ verbose: true })
    if (moves.length && chess.turn() === playerColor) {
      const autoMove = moves[0]
      chess.move(autoMove)
      setFen(chess.fen())
      pushMove({ fen: chess.fen(), lastMove: { from: autoMove.from, to: autoMove.to }, turn: chess.turn(), status: 'active' })
    }
    setTimerKey(k => k + 1)
  }

  function sendEmoji(emoji) {
    setFloatingEmoji(emoji)
    setTimeout(() => setFloatingEmoji(null), 2200)
  }

  if (loading) return <LoadingScreen text="טוען משחק..." />

  const isMyTurn = chess.turn() === playerColor
  const myStudent = playerColor === 'w' ? game?.white : game?.black
  const myScore = playerColor === 'w' ? scores.white : scores.black
  const oppScore = playerColor === 'w' ? scores.black : scores.white

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '70px 12px 20px' }}>
      <BackButton to="/lobby" />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%', maxWidth: 500 }}>

        {/* Opponent bar (top) */}
        <PlayerBar
          emoji={opponent?.avatar_emoji || '👤'}
          name={opponent?.display_name || 'יריב'}
          isActive={!isMyTurn}
          score={oppScore}
        />

        {/* Timer */}
        <HourglassTimer
          key={timerKey}
          seconds={45}
          active={isMyTurn}
          onExpire={handleTimerExpire}
        />

        {/* Board */}
        <ChessBoard
          fen={fen}
          playerColor={playerColor}
          onMove={handleMove}
          disabled={!isMyTurn || !!winData}
          lastMove={lastMove}
        />

        {/* My bar (bottom) */}
        <PlayerBar
          emoji={student?.avatar_emoji || '⭐'}
          name={student?.display_name || 'אתה'}
          isActive={isMyTurn}
          score={myScore}
        />

        {/* Emoji reaction panel */}
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          {EMOJIS.map(e => (
            <motion.button key={e} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.85 }}
              onClick={() => sendEmoji(e)}
              style={{ flex: 1, background: 'var(--card)', border: '1.5px solid rgba(255,255,255,0.06)',
                borderRadius: 14, padding: '10px 4px', cursor: 'pointer', fontSize: '1.6rem',
                textAlign: 'center' }}>
              {e}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Floating emoji */}
      <AnimatePresence>
        {floatingEmoji && (
          <motion.div key={floatingEmoji + Date.now()}
            initial={{ y: 0, opacity: 1, scale: 0.5 }}
            animate={{ y: -220, opacity: 0, scale: 1.4 }}
            exit={{}}
            transition={{ duration: 2, ease: 'easeOut' }}
            style={{ position: 'fixed', bottom: 140, left: '50%', transform: 'translateX(-50%)',
              fontSize: '3.5rem', pointerEvents: 'none', zIndex: 100 }}>
            {floatingEmoji}
          </motion.div>
        )}
      </AnimatePresence>

      <WinModal
        show={!!winData}
        isDraw={winData?.isDraw}
        winnerEmoji={winData?.winnerEmoji}
        winnerName={winData?.winnerName}
        onPlayAgain={() => navigate('/lobby')}
        onHome={() => navigate('/')}
      />
    </div>
  )
}
