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

  // רשימת אימוג'ים לבחירה אקראית
  const emojis = ['🦁', '🦊', '🐻', '🐼', '🐨', '🐯', '🐸', '🦄', '🐝', '🐙']
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

    // 1. יצירת תלמיד חדש בבסיס הנתונים
    const { data: newStudent, error: err } = await supabase
      .from('students')
      .insert([
        { 
          display_name: name, 
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

    // 2. סימון נוכחות אונליין
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

  if (loading) return <LoadingScreen text="מחבר אותך לכיתה..." />
  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: '4rem' }}>😕</div>
      <div className="error-msg">{error}</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', width: '100%', maxWidth: 400 }}>
        <div style={{ fontSize: '4rem', marginBottom: 10 }}>{classroom?.emoji}</div>
        <div className="title" style={{ marginBottom: 6, fontSize: '2rem' }}>{classroom?.name}</div>
        <div className="subtitle" style={{ marginBottom: 32 }}>ברוכים הבאים לשחמט-קט!</div>

        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
           <div style={{ fontSize: '5rem', marginBottom: 10 }}>{selectedEmoji}</div>
           
           <input 
             type="text" 
             placeholder="איך קוראים לך?" 
             value={name}
             onChange={(e) => setName(e.target.value)}
             style={{
               padding: '15px',
               borderRadius: '12px',
               border: '2px solid rgba(255,255,255,0.1)',
               background: 'rgba(255,255,255,0.05)',
               color: 'white',
               fontSize: '1.2rem',
               textAlign: 'center',
               outline: 'none'
             }}
             autoFocus
           />

           <motion.button
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             disabled={!name.trim() || isjoining}
             style={{
               padding: '15px',
               borderRadius: '12px',
               background: 'var(--gold, #FFD700)',
               color: 'black',
               fontWeight: 'bold',
               fontSize: '1.2rem',
               cursor: 'pointer',
               border: 'none',
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
