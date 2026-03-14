import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useExams() {
  const { user } = useAuth()
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchExams = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('exams')
      .select('*')
      .order('exam_date', { ascending: true })
    if (err) setError(err.message)
    else setExams(data || [])
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchExams()
  }, [fetchExams])

  const addExam = async (name, exam_date, description) => {
    const { error: err } = await supabase
      .from('exams')
      .insert([{ name, exam_date, description }])
    if (err) { setError(err.message); return false }
    await fetchExams()
    return true
  }

  const deleteExam = async (id) => {
    const { error: err } = await supabase.from('exams').delete().eq('id', id)
    if (err) { setError(err.message); return false }
    await fetchExams()
    return true
  }

  return { exams, loading, error, addExam, deleteExam, refetch: fetchExams }
}
