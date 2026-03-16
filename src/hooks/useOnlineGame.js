// src/hooks/useOnlineGame.js
import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useOnlineGame({ gameId, onUpdate }) {
  const channelRef = useRef(null)

  useEffect(() => {
    if (!gameId) return

    // Subscribe to game row changes
    const channel = supabase
      .channel(`game:${gameId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`,
      }, (payload) => {
        onUpdate && onUpdate(payload.new)
      })
      .subscribe()

    channelRef.current = channel
    return () => supabase.removeChannel(channel)
  }, [gameId])

  const pushMove = useCallback(async ({ fen, lastMove, turn, status, winnerId }) => {
    if (!gameId) return
    await supabase.from('games').update({
      fen,
      last_move: lastMove,
      turn,
      status: status || 'active',
      winner_id: winnerId || null,
      updated_at: new Date().toISOString(),
    }).eq('id', gameId)
  }, [gameId])

  return { pushMove }
}
