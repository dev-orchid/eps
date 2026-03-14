import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function usePayments() {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPayments = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    else setPayments(data || [])
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const recordPayment = async (payment) => {
    const { error: err } = await supabase
      .from('payments')
      .insert([{ ...payment, user_id: user.id }])
    if (err) { setError(err.message); return false }
    await fetchPayments()
    return true
  }

  return { payments, loading, error, recordPayment, refetch: fetchPayments }
}
