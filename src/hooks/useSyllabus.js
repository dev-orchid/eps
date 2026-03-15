import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useSyllabus() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState([])
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    const [tRes, pRes] = await Promise.all([
      supabase.from('syllabus_templates').select('*').order('sort_order', { ascending: true }),
      supabase.from('syllabus_progress').select('*'),
    ])

    if (tRes.error) setError(tRes.error.message)
    else setTemplates(tRes.data || [])

    if (pRes.error) setError(pRes.error.message)
    else setProgress(pRes.data || [])

    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Map template_id -> progress record for quick lookup
  const progressMap = useMemo(() => {
    const map = {}
    progress.forEach(p => {
      if (p.template_id) map[p.template_id] = p
    })
    return map
  }, [progress])

  // Initialize progress for a template (first interaction)
  const initProgress = async (templateId, status) => {
    const { data, error: err } = await supabase
      .from('syllabus_progress')
      .insert([{ user_id: user.id, template_id: templateId, status }])
      .select()
    if (err) { setError(err.message); return null }
    await fetchData()
    return data?.[0]
  }

  // Update status of an existing progress record
  const updateStatus = async (progressId, status) => {
    const updates = { status, updated_at: new Date().toISOString() }
    if (status === 'revised' || status === 'done') {
      updates.last_studied = new Date().toISOString()
    }
    const { error: err } = await supabase
      .from('syllabus_progress')
      .update(updates)
      .eq('id', progressId)
    if (err) { setError(err.message); return false }
    await fetchData()
    return true
  }

  // Mark revision (increment count + update last_studied)
  const markRevision = async (progressId) => {
    const existing = progress.find(p => p.id === progressId)
    if (!existing) return false
    const { error: err } = await supabase
      .from('syllabus_progress')
      .update({
        revision_count: (existing.revision_count || 0) + 1,
        last_studied: new Date().toISOString(),
        status: 'revised',
        updated_at: new Date().toISOString(),
      })
      .eq('id', progressId)
    if (err) { setError(err.message); return false }
    await fetchData()
    return true
  }

  // Set status for a template (creates if not exists)
  const setTopicStatus = async (templateId, status) => {
    const existing = progressMap[templateId]
    if (existing) {
      return updateStatus(existing.id, status)
    } else {
      return initProgress(templateId, status)
    }
  }

  // Add a custom topic
  const addCustomTopic = async (paper, topic) => {
    const { error: err } = await supabase
      .from('syllabus_progress')
      .insert([{
        user_id: user.id,
        custom_paper: paper,
        custom_topic: topic,
        status: 'not_started',
      }])
    if (err) { setError(err.message); return false }
    await fetchData()
    return true
  }

  const deleteCustomTopic = async (progressId) => {
    const { error: err } = await supabase
      .from('syllabus_progress')
      .delete()
      .eq('id', progressId)
    if (err) { setError(err.message); return false }
    await fetchData()
    return true
  }

  return {
    templates,
    progress,
    progressMap,
    loading,
    error,
    setTopicStatus,
    markRevision,
    addCustomTopic,
    deleteCustomTopic,
    refetch: fetchData,
  }
}
