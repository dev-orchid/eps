import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useProfiles() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfiles = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    else setProfiles(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const updateProfile = async (id, updates) => {
    const { error: err } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
    if (err) { setError(err.message); return false }
    await fetchProfiles()
    return true
  }

  const deleteProfile = async (id) => {
    // Delete from auth (cascades to profiles)
    const { error: err } = await supabase.auth.admin.deleteUser(id)
    if (err) {
      // Fallback: just delete the profile row
      const { error: err2 } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id)
      if (err2) { setError(err2.message); return false }
    }
    await fetchProfiles()
    return true
  }

  const extendTrial = async (id, days) => {
    const profile = profiles.find(p => p.id === id)
    if (!profile) return false
    const base = profile.trial_end ? new Date(profile.trial_end) : new Date()
    const now = new Date()
    const start = base > now ? base : now
    start.setDate(start.getDate() + days)
    return updateProfile(id, {
      trial_end: start.toISOString().slice(0, 10),
      plan: 'Trial',
    })
  }

  return { profiles, loading, error, updateProfile, deleteProfile, extendTrial, refetch: fetchProfiles }
}
