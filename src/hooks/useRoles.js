import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useRoles() {
  const { user } = useAuth()
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRoles = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('roles')
      .select('*')
      .order('created_at', { ascending: true })
    if (err) setError(err.message)
    else setRoles(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const addRole = async (name, description, permissions) => {
    const { data, error: err } = await supabase
      .from('roles')
      .insert([{ name, description, type: 'Custom', permissions }])
      .select()
      .single()
    if (err) { setError(err.message); return null }
    await fetchRoles()
    return data
  }

  const updateRole = async (id, updates) => {
    const { error: err } = await supabase
      .from('roles')
      .update(updates)
      .eq('id', id)
    if (err) { setError(err.message); return false }
    await fetchRoles()
    return true
  }

  const deleteRole = async (id) => {
    const { error: err } = await supabase
      .from('roles')
      .delete()
      .eq('id', id)
    if (err) { setError(err.message); return false }
    await fetchRoles()
    return true
  }

  return { roles, loading, error, addRole, updateRole, deleteRole, refetch: fetchRoles }
}
