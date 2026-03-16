// src/lib/store.js
import { create } from 'zustand'
import { supabase } from './supabase'

export const useStore = create((set, get) => ({
  // Auth
  user: null,
  profile: null,
  student: null,        // current student record (if role=student)
  classroom: null,      // active classroom

  // Game
  gameId: null,
  fen: null,
  turn: 'w',
  lastMove: null,
  gameStatus: null,

  // UI
  loading: false,
  error: null,

  // ── Auth actions ──
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setStudent: (student) => set({ student }),
  setClassroom: (classroom) => set({ classroom }),

  // ── Game actions ──
  setGame: (data) => set({
    gameId: data.id,
    fen: data.fen,
    turn: data.turn,
    lastMove: data.last_move,
    gameStatus: data.status,
  }),
  clearGame: () => set({ gameId: null, fen: null, turn: 'w', lastMove: null, gameStatus: null }),

  // ── Helpers ──
  setLoading: (v) => set({ loading: v }),
  setError: (e) => set({ error: e }),

  // ── Sign out ──
  signOut: async () => {
    const { student } = get()
    if (student) {
      await supabase.from('presence').upsert({ student_id: student.id, online: false })
    }
    await supabase.auth.signOut()
    set({ user: null, profile: null, student: null, classroom: null })
  },
}))
