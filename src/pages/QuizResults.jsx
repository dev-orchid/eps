import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuiz } from '../hooks/useQuiz'
import { supabase } from '../lib/supabase'
import { Trophy, Target, XCircle, MinusCircle, Clock, RotateCcw, Home, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const C = {
  teal: '#14b8a6', tealDark: '#0d9488', tealLight: '#e0f7f0',
  navy: '#0f172a', slate: '#334155', muted: '#94a3b8',
  border: '#e2e8f0', bg: '#f8fafc', white: '#ffffff',
  green: '#22c55e', greenLight: '#f0fdf4',
  red: '#dc2626', redLight: '#fef2f2',
  orange: '#f59e0b',
}

export default function QuizResults() {
  const location = useLocation()
  const navigate = useNavigate()
  const stateData = location.state || {}

  const [attempt, setAttempt] = useState(null)
  const [answers, setAnswers] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReview, setShowReview] = useState(false)

  const attemptId = stateData.attemptId

  useEffect(() => {
    if (!attemptId) { navigate('/quiz', { replace: true }); return }

    async function load() {
      // Fetch attempt
      const { data: att } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('id', attemptId)
        .single()
      if (att) setAttempt(att)

      // Fetch answers
      const { data: ans } = await supabase
        .from('quiz_answers')
        .select('*')
        .eq('attempt_id', attemptId)
        .order('created_at')
      setAnswers(ans || [])

      // Fetch questions
      if (att?.question_ids?.length) {
        const { data: qs } = await supabase
          .from('quiz_questions')
          .select('*')
          .in('id', att.question_ids)
        // Maintain order
        const map = Object.fromEntries((qs || []).map(q => [q.id, q]))
        setQuestions(att.question_ids.map(id => map[id]).filter(Boolean))
      }

      setLoading(false)
    }
    load()
  }, [attemptId])

  if (loading) return <LoadingSpinner />
  if (!attempt) return null

  const correct = attempt.correct_answers || stateData.correct || 0
  const wrong = attempt.wrong_answers || stateData.wrong || 0
  const skipped = attempt.skipped || stateData.skipped || 0
  const total = attempt.total_questions || stateData.total || 0
  const score = total > 0 ? ((correct / total) * 100).toFixed(0) : 0
  const timeTaken = attempt.time_taken_seconds || stateData.timeTaken || 0

  // UPSC Prelims scoring: +2 for correct, -0.67 for wrong
  const upscScore = (correct * 2 - wrong * 0.67).toFixed(2)
  const upscMax = total * 2

  const scoreColor = score >= 70 ? C.green : score >= 40 ? C.orange : C.red

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 60 }}>
      {/* Back button */}
      <button onClick={() => navigate('/quiz')} style={{
        display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px',
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
        fontSize: 13, fontWeight: 500, color: '#334155', cursor: 'pointer',
        transition: 'all 0.15s', marginBottom: 16,
      }}
        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
      >
        <ArrowLeft size={15} /> Back to Quiz
      </button>

      {/* Score Card */}
      <div style={{
        background: C.white, border: `1px solid ${C.border}`, borderRadius: 20,
        padding: '36px 28px', textAlign: 'center', marginBottom: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%', margin: '0 auto 20px',
          background: `${scoreColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Trophy size={44} color={scoreColor} />
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 600, color: C.muted, margin: '0 0 8px' }}>Your Score</h2>
        <div style={{ fontSize: 56, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}%</div>
        <p style={{ fontSize: 14, color: C.muted, marginTop: 8 }}>
          {score >= 70 ? 'Excellent! Keep it up!' : score >= 40 ? 'Good effort. Keep practicing!' : 'Keep studying. You\'ll improve!'}
        </p>

        {/* Stats Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
          marginTop: 28, padding: '20px 0', borderTop: `1px solid ${C.border}`,
        }}>
          {[
            { label: 'Correct', value: correct, icon: CheckCircle, color: C.green },
            { label: 'Wrong', value: wrong, icon: XCircle, color: C.red },
            { label: 'Skipped', value: skipped, icon: MinusCircle, color: C.muted },
            { label: 'Time', value: `${Math.floor(timeTaken / 60)}m`, icon: Clock, color: C.teal },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label}>
              <Icon size={20} color={color} style={{ margin: '0 auto 6px', display: 'block' }} />
              <div style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>{value}</div>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* UPSC Score */}
        <div style={{
          marginTop: 16, padding: '12px 16px', borderRadius: 10,
          background: C.tealLight, display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          <Target size={16} color={C.tealDark} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.tealDark }}>
            UPSC Prelims Score: {upscScore} / {upscMax} (with -⅓ negative marking)
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setShowReview(!showReview)}
          style={{
            flex: 1, padding: '12px', borderRadius: 10,
            border: `1px solid ${C.border}`, background: C.white,
            color: C.navy, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {showReview ? 'Hide Review' : 'Review Answers'}
        </button>
        <button
          onClick={() => navigate('/quiz')}
          style={{
            flex: 1, padding: '12px', borderRadius: 10,
            border: 'none', background: C.teal, color: C.white,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <RotateCcw size={16} /> New Quiz
        </button>
      </div>

      {/* Question Review */}
      {showReview && questions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {questions.map((q, i) => {
            const ans = answers.find(a => a.question_id === q.id)
            const selected = ans?.selected_option
            const isCorrect = ans?.is_correct
            const wasSkipped = !selected

            return (
              <div key={q.id} style={{
                background: C.white, border: `1px solid ${C.border}`, borderRadius: 14,
                padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: C.white, padding: '2px 10px', borderRadius: 6,
                    background: wasSkipped ? C.muted : isCorrect ? C.green : C.red,
                  }}>
                    Q{i + 1}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: wasSkipped ? C.muted : isCorrect ? C.green : C.red }}>
                    {wasSkipped ? 'Skipped' : isCorrect ? 'Correct' : 'Wrong'}
                  </span>
                </div>

                <div style={{ fontSize: 15, fontWeight: 600, color: C.navy, lineHeight: 1.6, marginBottom: 14, whiteSpace: 'pre-line' }}>
                  {q.question_text}
                </div>

                {['A', 'B', 'C', 'D'].map(opt => {
                  const optText = q[`option_${opt.toLowerCase()}`]
                  const isCorrectOpt = q.correct_option === opt
                  const wasSelected = selected === opt

                  let bg = C.white
                  let border = C.border
                  if (isCorrectOpt) { bg = C.greenLight; border = C.green }
                  else if (wasSelected && !isCorrectOpt) { bg = C.redLight; border = C.red }

                  return (
                    <div key={opt} style={{
                      padding: '10px 14px', marginBottom: 6, borderRadius: 10,
                      border: `1.5px solid ${border}`, background: bg,
                      display: 'flex', alignItems: 'center', gap: 10,
                      fontSize: 14, color: C.navy,
                    }}>
                      <span style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700,
                        background: isCorrectOpt ? C.green : wasSelected ? C.red : '#f1f5f9',
                        color: isCorrectOpt || wasSelected ? C.white : C.slate,
                      }}>
                        {opt}
                      </span>
                      {optText}
                      {isCorrectOpt && <CheckCircle size={16} color={C.green} style={{ marginLeft: 'auto' }} />}
                      {wasSelected && !isCorrectOpt && <XCircle size={16} color={C.red} style={{ marginLeft: 'auto' }} />}
                    </div>
                  )
                })}

                {q.explanation && (
                  <div style={{
                    marginTop: 12, padding: 14, borderRadius: 10,
                    background: '#fffbeb', border: '1px solid #fde68a',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <AlertCircle size={14} color={C.orange} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>Explanation</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {q.explanation}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
