// src/pages/LobbyPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useStore } from '../lib/store'
import BackButton from '../components/UI/BackButton'
import LoadingScreen from '../components/UI/LoadingScreen'

export default function LobbyPage() {
  const navigate = useNavigate()
  const { student, classroom } = useStore()
  const [classmates, setClassmates] = useState([])
  const [presence, setPresence] = useState({})
  const [loading, setLoading] = useState(true)
  const [pendingInvite, setPendingInvite] = useState(null) // incoming invite

  useEffect(() => {
    if (!student || !classroom) { navigate('/'); return }
    loadClassmates()
    markOnline()
    subscribeToInvites()
    subscribeToPresence()

    // Keep presence alive
    const heartbeat = setInterval(markOnline, 15000)
    return () => {
      clearInterval(heartbeat)
      supabase.from('presence').upsert({ student_id: student.id, online: false })
    }
  }, [])

  async function markOnline() {
    await supabase.from('presence').upsert({
      student_id: student.id,
      classroom_id: classroom.id,
      online: true,
      last_seen: new Date().toISOString(),
    })
  }

  async function loadClassmates() {
    setLoading(true)
    const { data: studs } = await supabase
      .from('students')
      .select('*, presence(*)')
      .eq('classroom_id', classroom.id)
      .eq('approved', true)

    setClassmates((studs || []).filter(s => s.id !== student.id))

    const pres = {}
    studs?.forEach(s => { pres[s.id] = s.presence?.[0]?.online || false })
    setPresence(pres)
    setLoading(false)
  }

  function subscribeToPresence() {
    supabase.channel('presence-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'presence',
        filter: `classroom_id=eq.${classroom.id}` },
        (payload) => {
          setPresence(p => ({ ...p, [payload.new.student_id]: payload.new.online }))
        })
      .subscribe()
  }

  function subscribeToInvites() {
    supabase.channel(`invites-${student.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_invites',
        filter: `to_student_id=eq.${student.id}` },
        async (payload) => {
          const inv = payload.new
          // Get sender info
          const { data: sender } = await supabase.from('students').select('*').eq('id', inv.from_student_id).single()
          setPendingInvite({ ...inv, sender })
        })
      .subscribe()
  }

  async function sendInvite(toStudent) {
    const { data: inv } = await supabase.from('game_invites').insert({
      from_student_id: student.id,
      to_student_id: toStudent.id,
      classroom_id: classroom.id,
    }).select().single()
    // Wait for acceptance (simple: subscribe to this invite)
    if (inv) {
      const chan = supabase.channel(`invite-ack-${inv.id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_invites',
          filter: `id=eq.${inv.id}` },
          async (payload) => {
            if (payload.new.status === 'accepted') {
              supabase.removeChannel(chan)
              await createAndJoinGame(student.id, toStudent.id)
            }
          })
        .subscribe()
    }
  }

  async function acceptInvite() {
    if (!pendingInvite) return
    await supabase.from('game_invites').update({ status: 'accepted' }).eq('id', pendingInvite.id)
    setPendingInvite(null)
    await createAndJoinGame(pendingInvite.from_student_id, student.id)
  }

  async function declineInvite() {
    if (!pendingInvite) return
    await supabase.from('game_invites').update({ status: 'declined' }).eq('id', pendingInvite.id)
    setPendingInvite(null)
  }

  async function createAndJoinGame(whiteId, blackId) {
    const { data: game } = await supabase.from('games').insert({
      classroom_id: classroom.id,
      white_student_id: whiteId,
      black_student_id: blackId,
      status: 'active',
    }).select().single()
    if (game) navigate(`/game/${game.id}`)
  }

  if (loading) return <LoadingScreen text="טוען כיתה..." />

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <BackButton to="/" />
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: 6 }}>{classroom?.emoji}</div>
        <div className="title" style={{ marginBottom: 4 }}>מי רוצה לשחק?</div>
        <div className="subtitle" style={{ marginBottom: 28 }}>
          שלום {student?.avatar_emoji} {student?.display_name}! לחץ על חבר מחובר לשחק איתו
        </div>
      </motion.div>

      {classmates.length === 0 && (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', padding: 40 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>😴</div>
          אין חברים בכיתה עדיין
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 420, width: '100%' }}>
        {classmates.map((s, i) => {
          const isOnline = presence[s.id]
          return (
            <motion.button key={s.id}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: isOnline ? 1 : 0.45, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              whileHover={isOnline ? { scale: 1.07, y: -4 } : {}}
              whileTap={isOnline ? { scale: 0.93 } : {}}
              onClick={() => isOnline && sendInvite(s)}
              style={{
                background: 'var(--card)',
                border: `2px solid ${isOnline ? 'rgba(0,230,118,0.45)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: 20, padding: '20px 10px',
                cursor: isOnline ? 'pointer' : 'not-allowed',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                color: 'white', fontFamily: 'var(--font)',
                boxShadow: isOnline ? '0 4px 20px rgba(0,230,118,0.1)' : 'none',
                position: 'relative',
              }}>
              {isOnline && (
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{ position: 'absolute', top: 10, left: 10, width: 10, height: 10,
                    borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }} />
              )}
              <span style={{ fontSize: '3rem', lineHeight: 1 }}>{s.avatar_emoji}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{s.display_name}</span>
              <span style={{ fontSize: '0.7rem', color: isOnline ? 'var(--green)' : 'rgba(255,255,255,0.3)' }}>
                {isOnline ? 'מחובר ✓' : 'לא מחובר'}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Incoming invite toast */}
      <AnimatePresence>
        {pendingInvite && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            style={{
              position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)',
              background: 'var(--card2)', border: '2px solid var(--green)',
              borderRadius: 20, padding: '20px 24px', display: 'flex',
              alignItems: 'center', gap: 14, zIndex: 200,
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              maxWidth: 360, width: '90%',
            }}>
            <span style={{ fontSize: '2.5rem' }}>{pendingInvite.sender?.avatar_emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{pendingInvite.sender?.display_name}</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>מזמין אותך לשחק!</div>
            </div>
            <button onClick={acceptInvite}
              style={{ fontSize: '2rem', background: 'none', border: 'none', cursor: 'pointer' }}>✅</button>
            <button onClick={declineInvite}
              style={{ fontSize: '2rem', background: 'none', border: 'none', cursor: 'pointer' }}>❌</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
