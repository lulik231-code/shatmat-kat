import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useStore } from './lib/store'
import './index.css'

// Pages
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
import LoadingScreen   from './components/UI/LoadingScreen'

function App() {
  const { user, profile, student, setUser, setProfile, setStudent, loading, setLoading } = useStore()

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
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data)
  }

  if (loading) return <LoadingScreen />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/teacher/register" element={<TeacherRegister />} />
        <Route path="/teacher/waiting" element={<WaitingApproval />} />
        <Route path="/student/:classroomCode" element={<StudentLogin />} />
        <Route path="/solo" element={<SoloPage />} />

        {/* Protected routes */}
        <Route path="/admin/*" element={
          profile?.role === 'super_admin' ? <SuperAdminDash /> : <Navigate to="/login" />
        } />
        <Route path="/teacher/dashboard" element={
          profile?.role === 'teacher' && profile?.approved ? <TeacherDash /> : <Navigate to="/login" />
        } />
        
        {/* תיקון כאן: מאפשר כניסה ל-Lobby אם יש תלמיד או פרופיל */}
        <Route path="/lobby" element={(student || profile) ? <LobbyPage /> : <Navigate to="/" />} />
        
        <Route path="/game/:gameId" element={<GamePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
