import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useQuizAnalytics() {
  const { user } = useAuth()
  const [attempts, setAttempts] = useState([])
  const [answers, setAnswers] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    const [aRes, ansRes, sRes] = await Promise.all([
      supabase
        .from('quiz_attempts')
        .select('*')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false }),
      supabase
        .from('quiz_answers')
        .select('*, quiz_questions(subject_id, difficulty, pyq_exam, pyq_year)'),
      supabase
        .from('quiz_subjects')
        .select('*')
        .order('sort_order', { ascending: true }),
    ])

    if (aRes.error) setError(aRes.error.message)
    else setAttempts(aRes.data || [])

    if (ansRes.error) setError(ansRes.error.message)
    else setAnswers(ansRes.data || [])

    if (sRes.error) setError(sRes.error.message)
    else setSubjects(sRes.data || [])

    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Subject lookup
  const subjectMap = useMemo(() => {
    const map = {}
    subjects.forEach(s => { map[s.id] = s })
    return map
  }, [subjects])

  // Overall stats
  const overallStats = useMemo(() => {
    if (attempts.length === 0) return null

    const totalAttempts = attempts.length
    const totalQuestions = attempts.reduce((s, a) => s + (a.total_questions || 0), 0)
    const totalCorrect = attempts.reduce((s, a) => s + (a.correct_answers || 0), 0)
    const totalWrong = attempts.reduce((s, a) => s + (a.wrong_answers || 0), 0)
    const totalSkipped = attempts.reduce((s, a) => s + (a.skipped || 0), 0)
    const avgScore = attempts.reduce((s, a) => s + (a.score_percentage || 0), 0) / totalAttempts
    const avgTime = attempts.reduce((s, a) => s + (a.time_taken_seconds || 0), 0) / totalAttempts
    const bestScore = Math.max(...attempts.map(a => a.score_percentage || 0))
    const accuracy = totalQuestions > 0 ? ((totalCorrect / (totalCorrect + totalWrong)) * 100) : 0

    return {
      totalAttempts, totalQuestions, totalCorrect, totalWrong, totalSkipped,
      avgScore: Math.round(avgScore * 10) / 10,
      avgTime: Math.round(avgTime),
      bestScore: Math.round(bestScore * 10) / 10,
      accuracy: Math.round(accuracy * 10) / 10,
    }
  }, [attempts])

  // Per-subject performance
  const subjectPerformance = useMemo(() => {
    const perf = {}
    answers.forEach(ans => {
      const subjectId = ans.quiz_questions?.subject_id
      if (!subjectId) return
      if (!perf[subjectId]) {
        perf[subjectId] = { total: 0, correct: 0, wrong: 0, skipped: 0, totalTime: 0 }
      }
      perf[subjectId].total++
      if (ans.selected_option === null) perf[subjectId].skipped++
      else if (ans.is_correct) perf[subjectId].correct++
      else perf[subjectId].wrong++
      perf[subjectId].totalTime += (ans.time_spent_seconds || 0)
    })

    return Object.entries(perf)
      .map(([subjectId, data]) => {
        const subj = subjectMap[subjectId]
        const accuracy = data.total > 0 ? ((data.correct / (data.correct + data.wrong || 1)) * 100) : 0
        const avgTime = data.total > 0 ? data.totalTime / data.total : 0
        return {
          subjectId,
          name: subj?.name || 'Unknown',
          paper: subj?.paper || '',
          ...data,
          accuracy: Math.round(accuracy * 10) / 10,
          avgTime: Math.round(avgTime),
        }
      })
      .sort((a, b) => a.accuracy - b.accuracy) // weakest first
  }, [answers, subjectMap])

  // Score trend (last 20 attempts)
  const scoreTrend = useMemo(() => {
    return attempts
      .slice(0, 20)
      .reverse()
      .map(a => ({
        date: a.completed_at ? new Date(a.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '',
        score: Math.round(a.score_percentage || 0),
        type: a.quiz_type,
        total: a.total_questions,
      }))
  }, [attempts])

  // Difficulty breakdown
  const difficultyStats = useMemo(() => {
    const stats = { easy: { total: 0, correct: 0 }, medium: { total: 0, correct: 0 }, hard: { total: 0, correct: 0 } }
    answers.forEach(ans => {
      const diff = ans.quiz_questions?.difficulty || 'medium'
      if (stats[diff]) {
        stats[diff].total++
        if (ans.is_correct) stats[diff].correct++
      }
    })
    return Object.entries(stats).map(([level, data]) => ({
      level,
      total: data.total,
      correct: data.correct,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    }))
  }, [answers])

  // Weak areas (subjects with accuracy < 50% and at least 5 questions attempted)
  const weakAreas = useMemo(() => {
    return subjectPerformance.filter(s => s.accuracy < 50 && s.total >= 3)
  }, [subjectPerformance])

  // Strong areas (accuracy >= 70%)
  const strongAreas = useMemo(() => {
    return subjectPerformance.filter(s => s.accuracy >= 70 && s.total >= 3)
  }, [subjectPerformance])

  // Recent attempts (last 10)
  const recentAttempts = useMemo(() => {
    return attempts.slice(0, 10).map(a => ({
      ...a,
      subjectName: a.subject_id ? subjectMap[a.subject_id]?.name : null,
    }))
  }, [attempts, subjectMap])

  return {
    loading, error, overallStats, subjectPerformance, scoreTrend,
    difficultyStats, weakAreas, strongAreas, recentAttempts,
    subjects, totalAttempts: attempts.length,
    refetch: fetchData,
  }
}
