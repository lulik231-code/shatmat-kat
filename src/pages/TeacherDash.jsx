// src/pages/TeacherDash.jsx
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useStore } from '../lib/store'
import BackButton from '../components/UI/BackButton'
import LoadingScreen from '../components/UI/LoadingScreen'

const AVATARS = ['🦁','🐯','🦊','🐻','🐼','🐸','🦋','🐬','🦄','🐲','⭐','🌈','🦉','🐧','🦩','🐳']

export default function TeacherDash() {
  const { profile, signOut } = useStore()
  const [classrooms, setClassrooms] = useState([])
  const [activeClass, setActiveClass] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewClass, setShowNewClass] = useState(false)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [newClassEmoji, setNewClassEmoji] = useState('🌟')
  const [studentForm, setStudentForm] = useState({ name: '', emoji: '🦁', parentEmail: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadClassrooms() }, [])
  useEffect(() => { if (activeClass) loadStudents(activeClass.id) }, [activeClass])

  async function loadClassrooms() {
    setLoading(true)
    const { data } = await supabase
      .from('classrooms')
      .select('*')
      .eq('teacher_id', profile.id)
      .order('created_at')
    setClassrooms(data || [])
    if (data?.length) setActiveClass(data[0])
    setLoading(false)
  }

  async function loadStudents(classId) {
    const { data } = await supabase
      .from('students')
      .select('*')
      .eq('classroom_id', classId)
      .order('display_name')
    setStudents(data || [])
  }

  async function createClassroom() {
    if (!newClassName.trim()) return
    setSaving(true)
    const { data } = await supabase.from('classrooms').insert({
      teacher_id: profile.id,
      name: newClassName.trim(),
      emoji: newClassEmoji,
    }).select().single()
    setSaving(false)
    if (data) {
      setClassrooms(c => [...c, data])
      setActiveClass(data)
      setShowNewClass(false)
      setNewClassName('')
    }
  }

  async function addStudent() {
    if (!studentForm.name.trim() || !activeClass) return
    setSaving(true)
    // Create auth user for student (passwordless — they login via classroom link)
    // We store student record linked to classroom
    const { data } = await supabase.from('students').insert({
      classroom_id: activeClass.id,
      display_name: studentForm.name.trim(),
      avatar_emoji: studentForm.emoji,
      parent_email: studentForm.parentEmail || null,
      approved: true,
    }).select().single()
    setSaving(false)
    if (data) {
      setStudents(s => [...s, data])
      setShowAddStudent(false)
      setStudentForm({ name: '', emoji: '🦁', parentEmail: '' })
    }
  }

  async function toggleStudent(id, approved) {
    await supabase.from('students').update({ approved: !approved }).eq('id', id)
    setStudents(s => s.map(x => x.id === id ? { ...x, approved: !approved } : x))
  }

  async function deleteStudent(id) {
    await supabase.from('students').delete().eq('id', id)
    setStudents(s => s.filter(x => x.id !== id))
  }

  const classroomLink = activeClass
    ? `${window.location.origin}/student/${activeClass.invite_code}`
    : ''

  if (loading) return <LoadingScreen text="טוען כיתות..." />

  return (
    <div style={{ minHeight: '100vh', padding: 20, paddingTop: 80 }}>
      <BackButton to="/" />
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="title" style={{ marginBottom: 4 }}>🏫 לוח המורה</div>
        <div className="subtitle" style={{ marginBottom: 24 }}>שלום, {profile?.display_name}!</div>

        {/* Classrooms tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {classrooms.map(c => (
            <button key={c.id} onClick={() => setActiveClass(c)}
              style={{
                background: activeClass?.id === c.id ? 'var(--gold)' : 'var(--card)',
                color: activeClass?.id === c.id ? '#1a1a2e' : 'white',
                border: 'none', borderRadius: 12, padding: '8px 16px',
                cursor: 'pointer', fontFamily: 'var(--font)', fontSize: '0.95rem',
                fontWeight: activeClass?.id === c.id ? 700 : 400,
                transition: 'all 0.15s',
              }}>
              {c.emoji} {c.name}
            </button>
          ))}
          <button onClick={() => setShowNewClass(true)}
            style={{
              background: 'transparent', color: 'var(--gold)',
              border: '1.5px dashed rgba(255,215,0,0.4)', borderRadius: 12,
              padding: '8px 16px', cursor: 'pointer', fontFamily: 'var(--font)',
              fontSize: '0.95rem',
            }}>
            + כיתה חדשה
          </button>
        </div>

        {activeClass && (
          <>
            {/* Classroom link */}
            <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                  🔗 קישור כניסה לתלמידים
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--blue)', wordBreak: 'break-all' }}>
                  {classroomLink}
                </div>
              </div>
              <button onClick={() => navigator.clipboard.writeText(classroomLink)}
                style={{ background: 'var(--card2)', border: 'none', borderRadius: 10,
                  padding: '8px 14px', color: 'white', cursor: 'pointer', fontFamily: 'var(--font)', flexShrink: 0 }}>
                📋 העתק
              </button>
            </div>

            {/* Students */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                תלמידים ({students.length})
              </div>
              <button onClick={() => setShowAddStudent(true)}
                style={{ background: 'var(--green)', color: '#1a3a1a', border: 'none',
                  borderRadius: 10, padding: '8px 16px', cursor: 'pointer',
                  fontFamily: 'var(--font)', fontWeight: 700 }}>
                + הוסף תלמיד
              </button>
            </div>

            {students.length === 0 && (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 40 }}>
                אין תלמידים עדיין — הוסף את הראשון!
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {students.map(s => (
                <motion.div key={s.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: 'var(--card)',
                    border: `1.5px solid ${s.approved ? 'rgba(0,230,118,0.2)' : 'rgba(233,69,96,0.2)'}`,
                    borderRadius: 16, padding: '16px 12px', textAlign: 'center',
                    position: 'relative',
                  }}>
                  <div style={{ fontSize: '2.8rem', marginBottom: 6 }}>{s.avatar_emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.display_name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                    {s.approved ? '✅ פעיל' : '🚫 חסום'}
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                    <button onClick={() => toggleStudent(s.id, s.approved)}
                      style={miniBtn(s.approved ? '#e94560' : '#00e676')}>
                      {s.approved ? '🚫' : '✅'}
                    </button>
                    <button onClick={() => deleteStudent(s.id)}
                      style={miniBtn('#666')}>🗑️</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        <button className="btn-secondary" style={{ marginTop: 32 }} onClick={signOut}>
          יציאה
        </button>
      </div>

      {/* New Classroom Modal */}
      <AnimatePresence>
        {showNewClass && (
          <Modal onClose={() => setShowNewClass(false)} title="כיתה חדשה">
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {['🌟','🌈','🚀','🎯','🏆','🌺'].map(e => (
                <button key={e} onClick={() => setNewClassEmoji(e)}
                  style={{ fontSize: '1.8rem', background: newClassEmoji === e ? 'rgba(255,215,0,0.2)' : 'transparent',
                    border: newClassEmoji === e ? '2px solid var(--gold)' : '2px solid transparent',
                    borderRadius: 10, padding: 6, cursor: 'pointer' }}>
                  {e}
                </button>
              ))}
            </div>
            <input className="input" placeholder="שם הכיתה (למשל: כיתה א׳ – ניצנים)"
              value={newClassName} onChange={e => setNewClassName(e.target.value)}
              style={{ marginBottom: 16 }} />
            <button className="btn-primary" onClick={createClassroom} disabled={saving}>
              {saving ? '⏳...' : '✅ צור כיתה'}
            </button>
          </Modal>
        )}
      </AnimatePresence>

      {/* Add Student Modal */}
      <AnimatePresence>
        {showAddStudent && (
          <Modal onClose={() => setShowAddStudent(false)} title="הוסף תלמיד">
            <div style={{ marginBottom: 12 }}>
              <label className="label">שם התלמיד</label>
              <input className="input" placeholder="שם פרטי"
                value={studentForm.name}
                onChange={e => setStudentForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="label">בחר אוואטר</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {AVATARS.map(av => (
                  <button key={av} onClick={() => setStudentForm(f => ({ ...f, emoji: av }))}
                    style={{ fontSize: '1.8rem', background: studentForm.emoji === av ? 'rgba(255,215,0,0.2)' : 'transparent',
                      border: studentForm.emoji === av ? '2px solid var(--gold)' : '2px solid transparent',
                      borderRadius: 10, padding: 4, cursor: 'pointer' }}>
                    {av}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="label">אימייל הורה (אופציונלי)</label>
              <input className="input" type="email" placeholder="parent@email.com"
                value={studentForm.parentEmail}
                onChange={e => setStudentForm(f => ({ ...f, parentEmail: e.target.value }))} />
            </div>
            <button className="btn-primary" onClick={addStudent} disabled={saving}>
              {saving ? '⏳...' : '✅ הוסף תלמיד'}
            </button>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

function Modal({ children, title, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }} onClick={e => e.stopPropagation()}
        style={{ background: 'var(--card2)', borderRadius: 24, padding: '28px 24px',
          width: '100%', maxWidth: 400, border: '1.5px solid rgba(255,215,0,0.2)' }}>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', color: 'var(--gold)', marginBottom: 20 }}>
          {title}
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}

function miniBtn(color) {
  return {
    flex: 1, background: `${color}22`, border: `1px solid ${color}55`,
    borderRadius: 8, padding: '5px 0', cursor: 'pointer', fontSize: '0.9rem',
    transition: 'background 0.15s',
  }
}
