import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTasks = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true })
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    else setTasks(data || [])
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const addTask = async (title, due_date, priority, exam_id, due_time) => {
    const { error: err } = await supabase
      .from('tasks')
      .insert([{ title, due_date, priority, exam_id: exam_id || null, due_time: due_time || null }])
    if (err) { setError(err.message); return false }
    await fetchTasks()
    return true
  }

  const toggleTask = async (id, completed) => {
    const { error: err } = await supabase
      .from('tasks')
      .update({ completed: !completed })
      .eq('id', id)
    if (err) { setError(err.message); return false }
    await fetchTasks()
    return true
  }

  const deleteTask = async (id) => {
    const { error: err } = await supabase.from('tasks').delete().eq('id', id)
    if (err) { setError(err.message); return false }
    await fetchTasks()
    return true
  }

  return { tasks, loading, error, addTask, toggleTask, deleteTask, refetch: fetchTasks }
}
