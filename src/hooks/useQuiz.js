import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useQuiz() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSubjects = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('quiz_subjects')
      .select('*')
      .order('sort_order')
    if (err) setError(err.message)
    else setSubjects(data || [])
  }, [])

  const fetchAttempts = useCallback(async () => {
    if (!user) return
    const { data, error: err } = await supabase
      .from('quiz_attempts')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    else setAttempts(data || [])
  }, [user?.id])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchSubjects(), fetchAttempts()]).then(() => setLoading(false))
  }, [fetchSubjects, fetchAttempts])

  // Generate quiz by randomly picking questions from the bank
  // exclude_attempted: if true, prioritize questions user hasn't answered yet
  const generateQuiz = async ({ subject_id, paper, count = 10, difficulty, quiz_type = 'subject_practice', pyq_exam, pyq_year, exclude_attempted = false, set_number }) => {
    setError(null)

    // Build query to fetch random questions
    let query = supabase
      .from('quiz_questions')
      .select('id')
      .eq('is_active', true)

    if (subject_id) {
      query = query.eq('subject_id', subject_id)
    } else if (paper) {
      const subjectIds = subjects.filter(s => s.paper === paper).map(s => s.id)
      if (subjectIds.length > 0) {
        query = query.in('subject_id', subjectIds)
      }
    }

    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty)
    }

    if (pyq_exam) {
      query = query.eq('pyq_exam', pyq_exam)
    }

    if (pyq_year) {
      query = query.eq('pyq_year', pyq_year)
    }

    // For set-based practice, order deterministically by created_at
    if (set_number != null) {
      query = query.order('created_at', { ascending: true })
    }

    // Paginate to get all matching question IDs (Supabase default limit is 1000)
    let allQuestions = []
    let from = 0
    const pageSize = 1000
    while (true) {
      const { data: page, error: fetchErr } = await query.range(from, from + pageSize - 1)
      if (fetchErr) {
        setError(fetchErr.message)
        return { error: fetchErr.message }
      }
      allQuestions = allQuestions.concat(page || [])
      if (!page || page.length < pageSize) break
      from += pageSize
    }

    if (allQuestions.length === 0) {
      const msg = 'No questions available for this subject yet. Admin needs to add questions.'
      setError(msg)
      return { error: msg }
    }

    let questionIds

    if (set_number != null) {
      // Set-based: deterministic slicing (Set 1 = first 50, Set 2 = next 50, etc.)
      const setSize = count
      const startIdx = (set_number - 1) * setSize
      const setIds = allQuestions.map(q => q.id).slice(startIdx, startIdx + setSize)
      if (setIds.length === 0) {
        const msg = 'No questions in this set.'
        setError(msg)
        return { error: msg }
      }
      questionIds = setIds
    } else {
      // Random selection (original behavior)
      // Get previously attempted question IDs if exclude_attempted is enabled
      let attemptedIds = new Set()
      if (exclude_attempted && user) {
        const { data: prevAnswers } = await supabase
          .from('quiz_answers')
          .select('question_id')
          .eq('user_id', user.id)
        if (prevAnswers) {
          attemptedIds = new Set(prevAnswers.map(a => a.question_id))
        }
      }

      // Split into unattempted and attempted, prioritize unattempted
      const allIds = allQuestions.map(q => q.id)
      let unattempted = allIds.filter(id => !attemptedIds.has(id))
      let attempted = allIds.filter(id => attemptedIds.has(id))

      // Shuffle both pools
      unattempted = unattempted.sort(() => Math.random() - 0.5)
      attempted = attempted.sort(() => Math.random() - 0.5)

      // Pick from unattempted first, then fill with attempted if needed
      const selected = [...unattempted, ...attempted].slice(0, Math.min(count, allIds.length))
      questionIds = selected
    }

    // Fetch full question data (without correct_option for the client)
    const { data: questions, error: qErr } = await supabase
      .from('quiz_questions')
      .select('id, question_text, option_a, option_b, option_c, option_d, tags')
      .in('id', questionIds)

    if (qErr) {
      setError(qErr.message)
      return { error: qErr.message }
    }

    // Maintain shuffled order
    const qMap = Object.fromEntries((questions || []).map(q => [q.id, q]))
    const orderedQuestions = questionIds.map(id => qMap[id]).filter(Boolean)

    // Create quiz attempt
    const { data: attempt, error: attemptErr } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        quiz_type,
        paper,
        subject_id: subject_id || null,
        question_ids: questionIds,
        total_questions: questionIds.length,
        difficulty: difficulty || 'mixed',
        status: 'in_progress',
      })
      .select('id')
      .single()

    if (attemptErr) {
      setError(attemptErr.message)
      return { error: attemptErr.message }
    }

    return {
      data: {
        attempt_id: attempt.id,
        questions: orderedQuestions,
        total: orderedQuestions.length,
        time_limit_minutes: quiz_type === 'full_mock' ? 120 : null,
      }
    }
  }

  const fetchQuestions = async (questionIds) => {
    if (!questionIds?.length) return []
    const { data, error: err } = await supabase
      .from('quiz_questions')
      .select('*')
      .in('id', questionIds)
    if (err) { setError(err.message); return [] }
    const map = Object.fromEntries((data || []).map(q => [q.id, q]))
    return questionIds.map(id => map[id]).filter(Boolean)
  }

  const submitAnswer = async (attemptId, questionId, selectedOption, isCorrect, timeSpent) => {
    const { error: err } = await supabase
      .from('quiz_answers')
      .insert({
        user_id: user.id,
        attempt_id: attemptId,
        question_id: questionId,
        selected_option: selectedOption,
        is_correct: isCorrect,
        time_spent_seconds: timeSpent,
      })
    if (err) setError(err.message)
  }

  const completeAttempt = async (attemptId, { correct, wrong, skipped, timeTaken }) => {
    const total = correct + wrong + skipped
    const score = total > 0 ? (correct / total) * 100 : 0
    const { error: err } = await supabase
      .from('quiz_attempts')
      .update({
        correct_answers: correct,
        wrong_answers: wrong,
        skipped: skipped,
        score_percentage: score,
        time_taken_seconds: timeTaken,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', attemptId)
    if (err) setError(err.message)
    await fetchAttempts()
  }

  // Get question count per subject (paginated to handle >1000 rows)
  const getQuestionCounts = useCallback(async () => {
    const counts = {}
    const pageSize = 1000
    let from = 0
    let hasMore = true
    while (hasMore) {
      const { data, error: err } = await supabase
        .from('quiz_questions')
        .select('subject_id')
        .eq('is_active', true)
        .range(from, from + pageSize - 1)
      if (err) return counts
      ;(data || []).forEach(q => {
        if (q.subject_id) {
          counts[q.subject_id] = (counts[q.subject_id] || 0) + 1
        }
      })
      hasMore = data && data.length === pageSize
      from += pageSize
    }
    return counts
  }, [])

  // Get count of unique questions attempted by user per subject
  const getAttemptedCounts = useCallback(async () => {
    if (!user) return {}
    const { data, error: err } = await supabase
      .from('quiz_answers')
      .select('question_id, quiz_questions!inner(subject_id)')
      .eq('user_id', user.id)
    if (err) return {}
    // Count unique question_ids per subject
    const seen = {}
    const counts = {}
    ;(data || []).forEach(a => {
      const subId = a.quiz_questions?.subject_id
      if (!subId) return
      if (!seen[subId]) seen[subId] = new Set()
      if (!seen[subId].has(a.question_id)) {
        seen[subId].add(a.question_id)
        counts[subId] = (counts[subId] || 0) + 1
      }
    })
    return counts
  }, [user?.id])

  return {
    subjects,
    attempts,
    loading,
    error,
    generateQuiz,
    fetchQuestions,
    submitAnswer,
    completeAttempt,
    getQuestionCounts,
    getAttemptedCounts,
    refetch: fetchAttempts,
  }
}
