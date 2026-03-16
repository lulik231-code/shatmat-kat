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
  const emojis = ['🦁', '🦊', '🐻', '🐼', '🐨', '🐯', '🐸', '🦄', '🐝', '🐙', '🦖', '🐧', '🐢', '🐘', '🦒', '🐹']
  const [selectedEmoji] = useState(emojis[Math.floor(Math.random() * emojis.length)])

  useEffect(() => {
    if (classroomCode) {
      loadClassroom()
    }
  }, [classroomCode])

  async function loadClassroom() {
    setLoading(true)
    try {
      const { data: cls, error: clsError } = await supabase
        .from('classrooms')
        .select('*')
        .eq('invite_code', classroomCode.trim())
        .maybeSingle()

      if (clsError || !cls) {
        setError('קוד כיתה לא נמצא')
      } else {
        setClassroomData(cls)
      }
    } catch (err) {
      setError('שגיאה בטעינת הכיתה')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (!name.trim() || isjoining) return
    setIsJoining(true)

    try {
      // 1. יצירת תלמיד חדש
      const { data: newStudent, error: studentError } = await supabase
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

      if (studentError) throw studentError

      // 2. עדכון נוכחות
      await supabase.from('presence').upsert({
        student_id: newStudent.id,
        classroom_id: classroom.id,
        online: true,
        last_seen: new Date().toISOString(),
      })

      // 3. שמירה ומעבר ללובי
      setStudent(newStudent)
      setClassroom(classroom)
      navigate('/lobby')

    } catch (err) {
      console.error("Error joining:", err)
      alert("אופס, קרתה תקלה קטנה")
      setIsJoining(false)
    }
  }

  if (loading) return <LoadingScreen text="מחפש את הכיתה שלך..." />
  
  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, color: 'white', background: '#1a1a2e' }}>
      <div style={{ fontSize: '4rem' }}>😕</div>
      <div style={{ fontSize: '1.5rem' }}>{error}</div>
      <button onClick={() => navigate('/')} style={{ color: '#FFD700', background: 'none', border: '1px solid #FFD700', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' }}>חזרה</button>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#1a1a2e' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        style={{ 
          textAlign: 'center', 
          width: '100%', 
          maxWidth: 400, 
          background: '#16213e', 
          padding: '40px 20px', 
          borderRadius: 30, 
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ fontSize: '5rem', marginBottom: 10 }}>{selectedEmoji}</div>
        <div style={{ marginBottom: 10, fontSize: '1.8rem', color: 'white', fontWeight: 'bold' }}>{classroom?.name}</div>
        <div style={{ marginBottom: 30, color: 'rgba(255,255,255,0.6)' }}>איך קוראים לך?</div>

        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
           <input 
             type="text" 
             placeholder="הקלד שם כאן..." 
             value={name}
             onChange={(e) => setName(e.target.value)}
             maxLength={15}
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
               fontWeight: 'bold',
               fontSize: '1.4rem',
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
