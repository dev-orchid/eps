import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useNotes() {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchNotes = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false })
    if (err) setError(err.message)
    else setNotes(data || [])
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const addNote = async ({ title, content, subject, tags }) => {
    const { data, error: err } = await supabase
      .from('notes')
      .insert([{ title, content, subject, tags: tags || [], user_id: user.id }])
      .select()
    if (err) { setError(err.message); return null }
    await fetchNotes()
    return data?.[0] || null
  }

  const updateNote = async (id, updates) => {
    const { error: err } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (err) { setError(err.message); return false }
    await fetchNotes()
    return true
  }

  const deleteNote = async (id) => {
    const { error: err } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
    if (err) { setError(err.message); return false }
    await fetchNotes()
    return true
  }

  const togglePin = async (id, currentPinned) => {
    return updateNote(id, { pinned: !currentPinned })
  }

  return { notes, loading, error, addNote, updateNote, deleteNote, togglePin, refetch: fetchNotes }
}
