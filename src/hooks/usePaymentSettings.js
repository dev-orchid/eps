import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function usePaymentSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSettings = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('payment_settings')
      .select('*')
    if (err) setError(err.message)
    else {
      const map = {}
      ;(data || []).forEach(row => { map[row.key] = row.value })
      setSettings(map)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const updateSetting = async (key, value) => {
    const { error: err } = await supabase
      .from('payment_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)
    if (err) { setError(err.message); return false }
    setSettings(prev => ({ ...prev, [key]: value }))
    return true
  }

  const updateMultiple = async (updates) => {
    for (const [key, value] of Object.entries(updates)) {
      const ok = await updateSetting(key, value)
      if (!ok) return false
    }
    return true
  }

  return { settings, loading, error, updateSetting, updateMultiple, refetch: fetchSettings }
}
