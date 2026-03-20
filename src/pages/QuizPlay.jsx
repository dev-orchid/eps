import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuiz } from '../hooks/useQuiz'
import { ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle, Flag, Languages, Loader2 } from 'lucide-react'

const C = {
  teal: '#14b8a6', tealDark: '#0d9488', tealLight: '#e0f7f0',
  navy: '#0f172a', slate: '#334155', muted: '#94a3b8',
  border: '#e2e8f0', bg: '#f8fafc', white: '#ffffff',
  green: '#22c55e', greenLight: '#f0fdf4',
  red: '#dc2626', redLight: '#fef2f2',
  orange: '#f59e0b',
}

const OPTIONS = ['A', 'B', 'C', 'D']

async function translateToHindi(text) {
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(text)}`
    )
    const data = await res.json()
    return data[0].map(s => s[0]).join('')
  } catch {
    return null
  }
}

export default function QuizPlay() {
  const location = useLocation()
  const navigate = useNavigate()
  const { submitAnswer, submitAnswersBulk, completeAttempt, fetchQuestions } = useQuiz()

  const quizData = location.state
  const [questions, setQuestions] = useState(quizData?.questions || [])
  const [fullQuestions, setFullQuestions] = useState([]) // with correct answers (loaded after answer)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({}) // { questionId: 'A' }
  const [revealed, setRevealed] = useState({}) // { questionId: true } for practice mode
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const finishingRef = useRef(false)
  const startTimeRef = useRef(Date.now())
  const questionStartRef = useRef(Date.now())

  const [showHindi, setShowHindi] = useState(false)
  const [hindiCache, setHindiCache] = useState({}) // { questionId: { question_text, option_a, ... } }
  const [translating, setTranslating] = useState(false)

  const attemptId = quizData?.attempt_id
  const timeLimit = quizData?.time_limit_minutes
  const total = questions.length

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Time limit check
  useEffect(() => {
    if (timeLimit && elapsedSeconds >= timeLimit * 60 && !quizComplete) {
      handleFinish()
    }
  }, [elapsedSeconds, timeLimit, quizComplete])

  // Redirect if no data
  useEffect(() => {
    if (!quizData) navigate('/quiz', { replace: true })
  }, [quizData, navigate])

  // Translate current question to Hindi when toggle is on
  useEffect(() => {
    if (!showHindi || !questions[currentIndex]) return
    const qId = questions[currentIndex].id
    if (hindiCache[qId]) return // already translated
    let cancelled = false
    ;(async () => {
      setTranslating(true)
      const q = questions[currentIndex]
      const [qText, oA, oB, oC, oD] = await Promise.all([
        translateToHindi(q.question_text),
        translateToHindi(q.option_a),
        translateToHindi(q.option_b),
        translateToHindi(q.option_c),
        translateToHindi(q.option_d),
      ])
      if (!cancelled) {
        setHindiCache(prev => ({
          ...prev,
          [qId]: { question_text: qText, option_a: oA, option_b: oB, option_c: oC, option_d: oD },
        }))
        setTranslating(false)
      }
    })()
    return () => { cancelled = true }
  }, [showHindi, currentIndex, questions])

  // Translate explanation when revealed and Hindi is on
  const revealedExplanation = fullQuestions.find(f => f.id === questions[currentIndex]?.id)?.explanation
  useEffect(() => {
    if (!showHindi || !revealedExplanation || !questions[currentIndex]) return
    const qId = questions[currentIndex].id
    if (hindiCache[qId]?.explanation) return
    let cancelled = false
    ;(async () => {
      const hindiExp = await translateToHindi(revealedExplanation)
      if (!cancelled && hindiExp) {
        setHindiCache(prev => ({
          ...prev,
          [qId]: { ...prev[qId], explanation: hindiExp },
        }))
      }
    })()
    return () => { cancelled = true }
  }, [showHindi, revealedExplanation, currentIndex, questions])

  const currentQ = questions[currentIndex]
  const questionId = currentQ?.id

  const selectOption = (opt) => {
    if (revealed[questionId] || quizComplete) return
    setAnswers(prev => ({ ...prev, [questionId]: opt }))
  }

  const checkingRef = useRef(false)
  const checkAnswer = useCallback(async () => {
    if (!questionId || revealed[questionId] || checkingRef.current) return
    checkingRef.current = true

    try {
      // Fetch the full question with correct answer
      const full = await fetchQuestions([questionId])
      if (full.length > 0) {
        setFullQuestions(prev => [...prev, ...full])
      }
      setRevealed(prev => ({ ...prev, [questionId]: true }))

      // Record answer
      const correctOption = full[0]?.correct_option
      const isCorrect = answers[questionId] === correctOption
      const timeSpent = Math.floor((Date.now() - questionStartRef.current) / 1000)

      if (attemptId) {
        await submitAnswer(attemptId, questionId, answers[questionId] || null, isCorrect, timeSpent)
      }
    } finally {
      checkingRef.current = false
    }
  }, [questionId, answers, revealed, attemptId, fetchQuestions, submitAnswer])

  const goNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1)
      questionStartRef.current = Date.now()
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      questionStartRef.current = Date.now()
    }
  }

  const handleFinish = useCallback(async () => {
    if (finishingRef.current || quizComplete) return
    finishingRef.current = true
    setFinishing(true)

    try {
      // 1. Collect all question IDs we still need correct answers for (single fetch)
      const alreadyFetchedIds = new Set(fullQuestions.map(f => f.id))
      const missingIds = questions.map(q => q.id).filter(id => !alreadyFetchedIds.has(id))
      const newFull = missingIds.length > 0 ? await fetchQuestions(missingIds) : []
      const allFull = [...fullQuestions, ...newFull]
      const fullMap = Object.fromEntries(allFull.map(f => [f.id, f]))

      // 2. Bulk-submit all unrevealed answers in one DB call
      const unrevealed = questions.filter(q => !revealed[q.id] && answers[q.id])
      if (unrevealed.length > 0) {
        const bulkRows = unrevealed.map(q => ({
          question_id: q.id,
          selected_option: answers[q.id],
          is_correct: answers[q.id] === fullMap[q.id]?.correct_option,
        }))
        await submitAnswersBulk(attemptId, bulkRows)
      }

      // 3. Calculate results
      let correct = 0, wrong = 0, skipped = 0
      questions.forEach(q => {
        if (!answers[q.id]) { skipped++; return }
        if (fullMap[q.id] && answers[q.id] === fullMap[q.id].correct_option) correct++
        else wrong++
      })

      setQuizComplete(true)

      await completeAttempt(attemptId, {
        correct, wrong, skipped,
        timeTaken: Math.floor((Date.now() - startTimeRef.current) / 1000),
      })

      navigate('/quiz/results', {
        state: { attemptId, correct, wrong, skipped, total, timeTaken: elapsedSeconds },
        replace: true,
      })
    } catch {
      finishingRef.current = false
      setFinishing(false)
    }
  }, [quizComplete, questions, answers, revealed, fullQuestions, attemptId, elapsedSeconds])

  if (!quizData || !currentQ) return null

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const answeredCount = Object.keys(answers).length
  const revealedQ = fullQuestions.find(f => f.id === questionId)
  const isRevealed = revealed[questionId]
  const selectedOpt = answers[questionId]

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 80 }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.teal }}>
            Q {currentIndex + 1}/{total}
          </span>
          <span style={{ fontSize: 13, color: C.muted }}>
            · {answeredCount} answered
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 600, color: C.slate }}>
            <Clock size={16} color={C.muted} />
            {formatTime(timeLimit ? Math.max(0, timeLimit * 60 - elapsedSeconds) : elapsedSeconds)}
          </div>
          <button
            onClick={handleFinish}
            disabled={finishing}
            style={{
              padding: '8px 18px', borderRadius: 10, border: 'none',
              background: finishing ? C.muted : C.red, color: C.white, fontSize: 13, fontWeight: 700,
              cursor: finishing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              opacity: finishing ? 0.8 : 1, transition: 'all 0.15s',
            }}
          >
            {finishing ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Finishing...</> : <><Flag size={14} /> Finish</>}
          </button>
        </div>
      </div>

      {/* Question Palette */}
      <div style={{
        display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20,
      }}>
        {questions.map((q, i) => {
          const isAnswered = !!answers[q.id]
          const isCurrent = i === currentIndex
          const wasRevealed = revealed[q.id]
          const fullQ = fullQuestions.find(f => f.id === q.id)
          const wasCorrect = wasRevealed && fullQ && answers[q.id] === fullQ.correct_option

          let bg = '#f1f5f9'
          let color = C.muted
          if (isCurrent) { bg = C.teal; color = C.white }
          else if (wasRevealed && wasCorrect) { bg = C.green; color = C.white }
          else if (wasRevealed && !wasCorrect && isAnswered) { bg = C.red; color = C.white }
          else if (isAnswered) { bg = C.tealLight; color = C.tealDark }

          return (
            <button
              key={q.id}
              onClick={() => { setCurrentIndex(i); questionStartRef.current = Date.now() }}
              style={{
                width: 34, height: 34, borderRadius: 8, border: 'none',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: bg, color, transition: 'all 0.1s',
              }}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      {/* Question Card */}
      <div style={{
        background: C.white, border: `1px solid ${C.border}`, borderRadius: 16,
        padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 20,
      }}>
        {/* Tags + Hindi Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {currentQ.tags?.map(t => (
              <span key={t} style={{
                fontSize: 11, fontWeight: 600, color: C.teal,
                background: C.tealLight, padding: '2px 8px', borderRadius: 6,
              }}>
                {t}
              </span>
            ))}
          </div>
          <button
            onClick={() => setShowHindi(prev => !prev)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 8,
              border: `1.5px solid ${showHindi ? C.teal : C.border}`,
              background: showHindi ? C.tealLight : C.white,
              color: showHindi ? C.tealDark : C.slate,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            title={showHindi ? 'Show English only' : 'Show Hindi translation'}
          >
            <Languages size={14} />
            {showHindi ? 'हिंदी ✓' : 'हिंदी'}
          </button>
        </div>

        {/* Question Text */}
        <div style={{
          fontSize: 16, fontWeight: 600, color: C.navy, lineHeight: 1.7,
          marginBottom: 24, whiteSpace: 'pre-line',
        }}>
          {currentQ.question_text}
          {showHindi && hindiCache[questionId]?.question_text && (
            <div style={{ marginTop: 8, color: '#6b21a8', fontSize: 15, fontWeight: 500 }}>
              {hindiCache[questionId].question_text}
            </div>
          )}
          {showHindi && translating && !hindiCache[questionId] && (
            <div style={{ marginTop: 8, color: C.muted, fontSize: 13, fontStyle: 'italic' }}>
              अनुवाद हो रहा है...
            </div>
          )}
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {OPTIONS.map(opt => {
            const optKey = `option_${opt.toLowerCase()}`
            const optText = currentQ[optKey]
            const isSelected = selectedOpt === opt
            const isCorrectOpt = isRevealed && revealedQ?.correct_option === opt
            const isWrongSelected = isRevealed && isSelected && !isCorrectOpt

            let borderColor = C.border
            let bg = C.white
            let textColor = C.navy

            if (isRevealed) {
              if (isCorrectOpt) { borderColor = C.green; bg = C.greenLight; textColor = '#166534' }
              else if (isWrongSelected) { borderColor = C.red; bg = C.redLight; textColor = '#991b1b' }
            } else if (isSelected) {
              borderColor = C.teal; bg = C.tealLight; textColor = C.tealDark
            }

            return (
              <button
                key={opt}
                onClick={() => selectOption(opt)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '14px 16px', borderRadius: 12,
                  border: `2px solid ${borderColor}`, background: bg,
                  cursor: isRevealed ? 'default' : 'pointer',
                  textAlign: 'left', transition: 'all 0.15s',
                  fontSize: 14, color: textColor, fontWeight: isSelected ? 600 : 500,
                  lineHeight: 1.5,
                }}
                onMouseEnter={e => { if (!isRevealed && !isSelected) { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.background = '#f0fdfa' } }}
                onMouseLeave={e => { if (!isRevealed && !isSelected) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.white } }}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                  background: isSelected ? (isRevealed ? (isCorrectOpt ? C.green : C.red) : C.teal) : '#f1f5f9',
                  color: isSelected ? C.white : C.slate,
                }}>
                  {opt}
                </span>
                <span style={{ paddingTop: 3 }}>
                  {optText}
                  {showHindi && hindiCache[questionId]?.[optKey] && (
                    <span style={{ display: 'block', color: '#6b21a8', fontSize: 13, fontWeight: 400, marginTop: 2 }}>
                      {hindiCache[questionId][optKey]}
                    </span>
                  )}
                </span>
                {isRevealed && isCorrectOpt && <CheckCircle size={20} color={C.green} style={{ marginLeft: 'auto', flexShrink: 0, marginTop: 3 }} />}
                {isRevealed && isWrongSelected && <XCircle size={20} color={C.red} style={{ marginLeft: 'auto', flexShrink: 0, marginTop: 3 }} />}
              </button>
            )
          })}
        </div>

        {/* Check Answer Button */}
        {!isRevealed && selectedOpt && (
          <button
            onClick={checkAnswer}
            style={{
              marginTop: 20, width: '100%', padding: '12px', borderRadius: 10,
              border: 'none', background: C.teal, color: C.white,
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Check Answer
          </button>
        )}

        {/* Explanation */}
        {isRevealed && revealedQ?.explanation && (
          <div style={{
            marginTop: 20, padding: 16, borderRadius: 12,
            background: '#fffbeb', border: '1px solid #fde68a',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <AlertCircle size={16} color={C.orange} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>Explanation</span>
            </div>
            <div style={{ fontSize: 14, color: '#78350f', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {revealedQ.explanation}
              {showHindi && hindiCache[questionId]?.explanation && (
                <div style={{ marginTop: 8, color: '#6b21a8', fontSize: 13 }}>
                  {hindiCache[questionId].explanation}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          style={{
            flex: 1, padding: '12px', borderRadius: 10,
            border: `1px solid ${C.border}`, background: C.white,
            color: currentIndex === 0 ? C.muted : C.slate,
            fontSize: 14, fontWeight: 600, cursor: currentIndex === 0 ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <ChevronLeft size={18} /> Previous
        </button>
        {currentIndex < total - 1 ? (
          <button
            onClick={goNext}
            style={{
              flex: 1, padding: '12px', borderRadius: 10,
              border: 'none', background: C.teal, color: C.white,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            Next <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={finishing}
            style={{
              flex: 1, padding: '12px', borderRadius: 10,
              border: 'none', background: finishing ? C.muted : C.green, color: C.white,
              fontSize: 14, fontWeight: 700, cursor: finishing ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              opacity: finishing ? 0.8 : 1, transition: 'all 0.15s',
            }}
          >
            {finishing ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Finishing...</> : 'Finish Quiz'}
          </button>
        )}
      </div>
    </div>
  )
}
