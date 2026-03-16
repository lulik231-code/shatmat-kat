// src/pages/StudentLogin.jsx
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
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [entering, setEntering] = useState(null)

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

    const { data: studs } = await supabase
      .from('students')
      .select('*')
      .eq('classroom_id', cls.id)
      .eq('approved', true)
      .order('display_name')

    setStudents(studs || [])
    setLoading(false)
  }

  async function selectStudent(student) {
    setEntering(student.id)
    // Mark online presence
    await supabase.from('presence').upsert({
      student_id: student.id,
      classroom_id: classroom.id,
      online: true,
      last_seen: new Date().toISOString(),
    })
    setStudent(student)
    setClassroom(classroom)
    setTimeout(() => navigate('/lobby'), 800)
  }

  if (loading) return <LoadingScreen text="טוען כיתה..." />
  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: '4rem' }}>😕</div>
      <div className="error-msg">{error}</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: 10, fontSize: '2.5rem' }}>
          {classroom?.emoji}
        </div>
        <div className="title" style={{ marginBottom: 6 }}>{classroom?.name}</div>
        <div className="subtitle" style={{ marginBottom: 32 }}>מי אתה? לחץ על הפנים שלך!</div>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        width: '100%',
        maxWidth: 400,
      }}>
        {students.map((s, i) => (
          <motion.button key={s.id}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.08, y: -4 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => selectStudent(s)}
            style={{
              background: entering === s.id ? 'rgba(255,215,0,0.2)' : 'var(--card)',
              border: `2px solid ${entering === s.id ? 'var(--gold)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 20, padding: '20px 10px',
              cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 8, color: 'white', fontFamily: 'var(--font)',
              boxShadow: entering === s.id ? '0 0 25px rgba(255,215,0,0.3)' : 'none',
              transition: 'all 0.2s',
            }}>
            <motion.div
              animate={entering === s.id ? { rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
              style={{ fontSize: '3.2rem', lineHeight: 1 }}>
              {s.avatar_emoji}
            </motion.div>
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{s.display_name}</span>
          </motion.button>
        ))}
      </div>

      {students.length === 0 && (
        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 40 }}>
          אין תלמידים בכיתה הזו עדיין
        </div>
      )}
    </div>
  )
}
