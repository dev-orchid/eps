import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useAlarms() {
  const { user } = useAuth()
  const [alarms, setAlarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAlarms = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('alarms')
      .select('*')
      .order('alarm_time', { ascending: true })
    if (err) setError(err.message)
    else setAlarms(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchAlarms()
  }, [fetchAlarms])

  const addAlarm = async (title, alarm_time, days) => {
    const { error: err } = await supabase
      .from('alarms')
      .insert([{ title, alarm_time, days: days || [] }])
    if (err) { setError(err.message); return false }
    await fetchAlarms()
    return true
  }

  const toggleAlarm = async (id, active) => {
    const { error: err } = await supabase
      .from('alarms')
      .update({ active: !active })
      .eq('id', id)
    if (err) { setError(err.message); return false }
    await fetchAlarms()
    return true
  }

  const deleteAlarm = async (id) => {
    const { error: err } = await supabase.from('alarms').delete().eq('id', id)
    if (err) { setError(err.message); return false }
    await fetchAlarms()
    return true
  }

  return { alarms, loading, error, addAlarm, toggleAlarm, deleteAlarm, refetch: fetchAlarms }
}
