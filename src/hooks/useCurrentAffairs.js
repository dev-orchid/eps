import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useCurrentAffairs() {
  const { user } = useAuth()
  const [affairs, setAffairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAffairs = useCallback(async (showLoading = false) => {
    if (!user) return
    if (showLoading) setLoading(true)
    setError(null)

    // Fetch all shared articles
    const { data: articles, error: articlesErr } = await supabase
      .from('current_affairs')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (articlesErr) {
      setError(articlesErr.message)
      setLoading(false)
      return
    }

    // Fetch this user's status for all articles
    const { data: statuses, error: statusErr } = await supabase
      .from('user_affair_status')
      .select('affair_id, is_read, added_to_study')

    if (statusErr) {
      setError(statusErr.message)
      setLoading(false)
      return
    }

    // Merge status into articles
    const statusMap = {}
    ;(statuses || []).forEach((s) => {
      statusMap[s.affair_id] = s
    })

    const merged = (articles || []).map((a) => ({
      ...a,
      is_read: statusMap[a.id]?.is_read || false,
      added_to_study: statusMap[a.id]?.added_to_study || false,
    }))

    setAffairs(merged)
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchAffairs(true)
  }, [fetchAffairs])

  const addAffair = async (title, category, summary, source_url, date) => {
    const { error: err } = await supabase
      .from('current_affairs')
      .insert([{ title, category, summary, source_url: source_url || null, date: date || new Date().toISOString().split('T')[0] }])
    if (err) { setError(err.message); return false }
    await fetchAffairs()
    return true
  }

  const addBulkAffairs = async (items) => {
    if (!items.length) return 0
    const rows = items.map((item) => ({
      title: item.title,
      category: item.category,
      summary: item.summary || null,
      source_url: item.source_url || null,
      date: item.date || new Date().toISOString().split('T')[0],
    }))
    const { data, error: err } = await supabase
      .from('current_affairs')
      .insert(rows)
      .select()
    if (err) { setError(err.message); return 0 }
    await fetchAffairs()
    return data?.length || rows.length
  }

  const deleteAffair = async (id) => {
    const { error: err } = await supabase.from('current_affairs').delete().eq('id', id)
    if (err) { setError(err.message); return false }
    await fetchAffairs()
    return true
  }

  // Upsert user status for an affair
  const _upsertStatus = async (affairId, updates) => {
    // Try update first
    const { data: existing } = await supabase
      .from('user_affair_status')
      .select('id')
      .eq('affair_id', affairId)
      .maybeSingle()

    if (existing) {
      const { error: err } = await supabase
        .from('user_affair_status')
        .update(updates)
        .eq('affair_id', affairId)
        .eq('user_id', user.id)
      if (err) { setError(err.message); return false }
    } else {
      const { error: err } = await supabase
        .from('user_affair_status')
        .insert([{ affair_id: affairId, ...updates }])
      if (err) { setError(err.message); return false }
    }
    return true
  }

  const toggleRead = async (id, currentIsRead) => {
    const ok = await _upsertStatus(id, { is_read: !currentIsRead })
    if (ok) await fetchAffairs()
    return ok
  }

  const markAddedToStudy = async (id) => {
    const ok = await _upsertStatus(id, { added_to_study: true })
    if (ok) await fetchAffairs()
    return ok
  }

  return { affairs, loading, error, addAffair, addBulkAffairs, deleteAffair, toggleRead, markAddedToStudy, refetch: fetchAffairs }
}
