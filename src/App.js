import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useStore } from './lib/store'
import './index.css'
import HomePage        from './pages/HomePage'
import LoginPage       from './pages/LoginPage'
import TeacherRegister from './pages/TeacherRegister'
import WaitingApproval from './pages/WaitingApproval'
import SuperAdminDash  from './pages/SuperAdminDash'
import TeacherDash     from './pages/TeacherDash'
import StudentLogin    from './pages/StudentLogin'
import LobbyPage       from './pages/LobbyPage'
import GamePage        from './pages/GamePage'
import SoloPage        from './pages/SoloPage'

function App() {
  const { user, profile, student, setUser, setProfile, loading, setLoading } = useStore()

  useEffect(() => {
    setLoading(true)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        await loadProfile(session.user.id)
      }
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await loadProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (data) setProfile(data)
    } catch(e) {
      console.log('no profile', e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'white',fontSize:'2rem'}}>♟️</div>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/teacher/register" element={<TeacherRegister />} />
        <Route path="/teacher/waiting" element={<WaitingApproval />} />
        <Route path="/student/:classroomCode" element={<StudentLogin />} />
        <Route path="/solo" element={<SoloPage />} />
        <Route path="/admin/*" element={
          profile?.role === 'super_admin' ? <SuperAdminDash /> : <Navigate to="/login" />
        } />
        <Route path="/teacher/dashboard" element={
          profile?.role === 'teacher' && profile?.approved ? <TeacherDash /> : <Navigate to="/login" />
        } />
        <Route path="/lobby" element={(student || profile) ? <LobbyPage /> : <Navigate to="/" />} />
        <Route path="/game/:gameId" element={<GamePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
