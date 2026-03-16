import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useStore } from '../lib/store'
import LoadingScreen from '../components/UI/LoadingScreen'

export default function StudentLogin() {
  const { classroomCode } = useParams()
  const navigate = useNavigate()
  const { setStudent, setClassroom } = useStore()
  const [classroom, setClassroomData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [isjoining, setIsJoining] = useState(false)

  // רשימת אימוג'ים חמודים לבחירה אקראית
  const emojis = ['🦁', '🦊', '🐻', '🐼', '🐨', '🐯', '🐸', '🦄', '🐝', '🐙', '🦖', '🐧']
  const [selectedEmoji] = useState(emojis[Math.floor(Math.random() * emojis.length)])

  useEffect(() => { loadClassroom() }, [classroomCode])

  async function loadClassroom() {
    setLoading(true)
    const { data: cls } = await supabase
      .from('classrooms')
      .select('*')
      .eq('invite_code', classroomCode?.toUpperCase())
      .single()

    if (!cls) { setError('קוד כיתה שגוי'); setLoading(false); return }
    setClassroomData(cls)
    setLoading(false)
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (!name.trim()) return
    setIsJoining(true)

    // יצירת תלמיד חדש בבסיס הנתונים
    const { data: newStudent, error: err } = await supabase
      .from('students')
      .insert([
        { 
          display_name: name.trim(), 
          avatar_emoji: selectedEmoji, 
          classroom_id: classroom.id,
          approved: true 
        }
      ])
      .select()
      .single()

    if (err) {
      console.error(err)
      setIsJoining(false)
      return
    }

    // סימון נוכחות
    await supabase.from('presence').upsert({
      student_id: newStudent.id,
      classroom_id: classroom.id,
      online: true,
      last_seen: new Date().toISOString(),
    })

    setStudent(newStudent)
    setClassroom(classroom)
    navigate('/lobby')
  }

  if (loading) return <LoadingScreen text="מתחבר לכיתה..." />
  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, color: 'white' }}>
      <div style={{ fontSize: '4rem' }}>😕</div>
      <div>{error}</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        style={{ textAlign: 'center', width: '100%', maxWidth: 400, background: 'var(--card)', padding: '40px 20px', borderRadius: 30, border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div style={{ fontSize: '5rem', marginBottom: 10 }}>{selectedEmoji}</div>
        <div className="title" style={{ marginBottom: 10, fontSize: '1.8rem', color: 'white' }}>{classroom?.name}</div>
        <div className="subtitle" style={{ marginBottom: 30, color: 'rgba(255,255,255,0.6)' }}>הכנס את השם שלך כדי להצטרף</div>

        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
           <input 
             type="text" 
             placeholder="השם שלך כאן..." 
             value={name}
             onChange={(e) => setName(e.target.value)}
             style={{
               padding: '18px',
               borderRadius: '15px',
               border: '2px solid rgba(255,215,0,0.3)',
               background: 'rgba(0,0,0,0.2)',
               color: 'white',
               fontSize: '1.3rem',
               textAlign: 'center',
               outline: 'none'
             }}
             autoFocus
           />

           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             disabled={!name.trim() || isjoining}
             style={{
               padding: '18px',
               borderRadius: '15px',
               background: 'linear-gradient(45deg, #FFD700, #FFA500)',
               color: 'black',
               fontWeight: '900',
               fontSize: '1.4rem',
               cursor: 'pointer',
               border: 'none',
               boxShadow: '0 10px 20px rgba(255,215,0,0.2)',
               opacity: name.trim() ? 1 : 0.5
             }}
           >
             {isjoining ? 'נכנס...' : 'אני מוכן! 🚀'}
           </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
