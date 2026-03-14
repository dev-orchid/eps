import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useStudySessions() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSessions = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('study_sessions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    else setSessions(data || [])
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const addSession = async (subject, duration_minutes, date, notes) => {
    const { error: err } = await supabase
      .from('study_sessions')
      .insert([{ subject, duration_minutes: parseInt(duration_minutes), date, notes }])
    if (err) { setError(err.message); return false }
    await fetchSessions()
    return true
  }

  const deleteSession = async (id) => {
    const { error: err } = await supabase.from('study_sessions').delete().eq('id', id)
    if (err) { setError(err.message); return false }
    await fetchSessions()
    return true
  }

  return { sessions, loading, error, addSession, deleteSession, refetch: fetchSessions }
}
