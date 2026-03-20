import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useQuiz } from '../hooks/useQuiz'
import { Plus, Trash2, Edit3, Search, Upload, X, Check, ChevronDown, ChevronUp, AlertCircle, Sparkles, Copy, CheckCheck } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const C = {
  teal: '#14b8a6', tealDark: '#0d9488', tealLight: '#e0f7f0',
  navy: '#0f172a', slate: '#334155', muted: '#94a3b8',
  border: '#e2e8f0', bg: '#f8fafc', white: '#ffffff',
  green: '#22c55e', greenLight: '#f0fdf4',
  red: '#dc2626', redLight: '#fef2f2',
  orange: '#f59e0b',
}

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: `1px solid ${C.border}`, fontSize: 14, color: C.navy,
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}

const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 600, color: C.slate, marginBottom: 6,
}

export default function QuestionBank() {
  const { subjects } = useQuiz()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterSubject, setFilterSubject] = useState('')
  const [filterPaper, setFilterPaper] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showBulk, setShowBulk] = useState(false)
  const [showGenerate, setShowGenerate] = useState(false)
  const [copied, setCopied] = useState(false)
  const [genConfig, setGenConfig] = useState({
    subject_id: '', difficulty: 'medium', count: 30,
    pyq_year: '', pyq_exam: 'UPSC Prelims',
  })
  const [editingId, setEditingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  const [form, setForm] = useState({
    subject_id: '', question_text: '',
    option_a: '', option_b: '', option_c: '', option_d: '',
    correct_option: 'A', explanation: '', difficulty: 'medium',
    source: 'manual', pyq_year: '', pyq_exam: '',
  })

  const [bulkText, setBulkText] = useState('')

  const fetchQuestions = async () => {
    setLoading(true)
    let allData = []
    const pageSize = 1000
    let from = 0
    while (true) {
      let query = supabase.from('quiz_questions').select('*').order('created_at', { ascending: false })
      if (filterSubject) query = query.eq('subject_id', filterSubject)
      const { data } = await query.range(from, from + pageSize - 1)
      allData = allData.concat(data || [])
      if (!data || data.length < pageSize) break
      from += pageSize
    }
    setQuestions(allData)
    setLoading(false)
  }

  useEffect(() => { fetchQuestions() }, [filterSubject])

  const resetForm = () => {
    setForm({
      subject_id: '', question_text: '',
      option_a: '', option_b: '', option_c: '', option_d: '',
      correct_option: 'A', explanation: '', difficulty: 'medium',
      source: 'manual', pyq_year: '', pyq_exam: '',
    })
    setEditingId(null)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.question_text || !form.option_a || !form.option_b || !form.option_c || !form.option_d || saving) return
    setSaving(true)
    setMsg(null)

    const data = {
      ...form,
      subject_id: form.subject_id || null,
      pyq_year: form.pyq_year ? parseInt(form.pyq_year) : null,
      pyq_exam: form.pyq_exam || null,
    }

    let err
    if (editingId) {
      const res = await supabase.from('quiz_questions').update(data).eq('id', editingId)
      err = res.error
    } else {
      const res = await supabase.from('quiz_questions').insert([data])
      err = res.error
    }

    setSaving(false)
    if (err) {
      setMsg({ type: 'error', text: err.message })
    } else {
      setMsg({ type: 'success', text: editingId ? 'Question updated!' : 'Question added!' })
      resetForm()
      setShowForm(false)
      fetchQuestions()
      setTimeout(() => setMsg(null), 3000)
    }
  }

  const handleEdit = (q) => {
    setForm({
      subject_id: q.subject_id || '',
      question_text: q.question_text,
      option_a: q.option_a, option_b: q.option_b,
      option_c: q.option_c, option_d: q.option_d,
      correct_option: q.correct_option,
      explanation: q.explanation || '',
      difficulty: q.difficulty || 'medium',
      source: q.source || 'manual',
      pyq_year: q.pyq_year || '',
      pyq_exam: q.pyq_exam || '',
    })
    setEditingId(q.id)
    setShowForm(true)
    setShowBulk(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return
    await supabase.from('quiz_questions').delete().eq('id', id)
    fetchQuestions()
  }

  // Bulk import: parse text format
  const handleBulkImport = async () => {
    if (!bulkText.trim() || saving) return
    setSaving(true)
    setMsg(null)

    try {
      // Try JSON format first
      let parsed
      try {
        parsed = JSON.parse(bulkText.trim())
      } catch {
        // Try line-based format:
        // Q: question text
        // A: option a
        // B: option b
        // C: option c
        // D: option d
        // Answer: A
        // Explanation: ...
        // Subject: Polity & Governance
        // ---
        // Split on --- (with optional whitespace around it)
        const blocks = bulkText.split(/\n\s*---\s*\n/).filter(b => b.trim())
        parsed = blocks.map(block => {
          const lines = block.trim().split('\n').map(l => l.trim())
          const get = (prefix) => {
            const line = lines.find(l => l.startsWith(prefix))
            return line ? line.slice(prefix.length).trim() : ''
          }
          // Get question text: everything from Q: line until A: line
          const qStart = lines.findIndex(l => l.match(/^Q:\s/))
          const aStart = lines.findIndex(l => l.match(/^A:\s/))
          let qText = ''
          if (qStart >= 0 && aStart > qStart) {
            qText = lines.slice(qStart, aStart).map(l => l.replace(/^Q:\s*/, '')).join('\n').trim()
          } else {
            qText = get('Q:')
          }
          // Get explanation: everything from Explanation: until Subject: or Difficulty: or Year: or end
          let explanation = ''
          const expStart = lines.findIndex(l => l.startsWith('Explanation:'))
          if (expStart >= 0) {
            const expEnd = lines.findIndex((l, i) => i > expStart && (l.startsWith('Subject:') || l.startsWith('Difficulty:') || l.startsWith('Year:') || l.startsWith('Exam:')))
            const expLines = lines.slice(expStart, expEnd > 0 ? expEnd : undefined)
            explanation = expLines.map(l => l.replace(/^Explanation:\s*/, '')).join(' ').trim()
          }

          return {
            question_text: qText,
            option_a: get('A:'), option_b: get('B:'),
            option_c: get('C:'), option_d: get('D:'),
            correct_option: get('Answer:').toUpperCase().charAt(0) || 'A',
            explanation: explanation || get('Explanation:'),
            subject_name: get('Subject:'),
            difficulty: get('Difficulty:') || 'medium',
            pyq_year: get('Year:'),
            pyq_exam: get('Exam:'),
          }
        }).filter(q => q.question_text && q.option_a)
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        setMsg({ type: 'error', text: 'Could not parse any questions. Check the format.' })
        setSaving(false)
        return
      }

      // Map subject names to IDs (use exam name to disambiguate duplicates)
      const examPaperMap = {
        'Bihar Daroga Mains (BPSSC SI)': 'BPSSC SI Mains',
        'BPSSC SI': 'BPSSC SI Mains',
        'BPSSC': 'BPSSC SI Mains',
      }
      const insertData = parsed.map(q => {
        let subjectId = q.subject_id || null
        if (!subjectId && q.subject_name) {
          const nameMatch = q.subject_name.toLowerCase().trim()
          const paperHint = q.pyq_exam ? examPaperMap[q.pyq_exam] : null
          const candidates = paperHint ? subjects.filter(s => s.paper === paperHint) : subjects
          // Exact match first
          let sub = candidates.find(s => s.name.toLowerCase() === nameMatch)
          // Partial match: subject name starts with the input (e.g. "General" → "General Knowledge & Current Affairs")
          if (!sub) sub = candidates.find(s => s.name.toLowerCase().startsWith(nameMatch))
          // Partial match: input starts with subject name
          if (!sub) sub = candidates.find(s => nameMatch.startsWith(s.name.toLowerCase()))
          // Fallback without paper filter
          if (!sub && paperHint) {
            sub = subjects.find(s => s.name.toLowerCase() === nameMatch)
            if (!sub) sub = subjects.find(s => s.name.toLowerCase().startsWith(nameMatch))
          }
          subjectId = sub?.id || null
        }
        return {
          subject_id: subjectId,
          question_text: q.question_text,
          option_a: q.option_a, option_b: q.option_b,
          option_c: q.option_c, option_d: q.option_d,
          correct_option: (q.correct_option || 'A').toUpperCase(),
          explanation: q.explanation || '',
          difficulty: q.difficulty || 'medium',
          source: q.pyq_year ? 'pyq' : 'manual',
          pyq_year: q.pyq_year ? parseInt(q.pyq_year) : null,
          pyq_exam: q.pyq_exam || null,
        }
      })

      const { error: insertErr } = await supabase.from('quiz_questions').insert(insertData)
      setSaving(false)
      if (insertErr) {
        setMsg({ type: 'error', text: insertErr.message })
      } else {
        setMsg({ type: 'success', text: `${insertData.length} questions imported!` })
        setBulkText('')
        setShowBulk(false)
        fetchQuestions()
        setTimeout(() => setMsg(null), 3000)
      }
    } catch (e) {
      setSaving(false)
      setMsg({ type: 'error', text: 'Parse error: ' + e.message })
    }
  }

  const filteredQuestions = questions.filter(q => {
    if (filterPaper) {
      const sub = subjects.find(s => s.id === q.subject_id)
      if (sub?.paper !== filterPaper) return false
    }
    if (searchQuery) {
      return q.question_text.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  const papers = [...new Set(subjects.map(s => s.paper))]

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navy, margin: 0 }}>
            Question Bank
          </h2>
          <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 0' }}>
            {questions.length} questions total
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => { setShowGenerate(!showGenerate); setShowBulk(false); setShowForm(false) }} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: C.white, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Sparkles size={16} /> Request from Claude
          </button>
          <button onClick={() => { setShowBulk(!showBulk); setShowForm(false); setShowGenerate(false) }} style={{
            padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`,
            background: C.white, color: C.slate, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Upload size={16} /> Bulk Import
          </button>
          <button onClick={() => { setShowForm(!showForm); setShowBulk(false); setShowGenerate(false); resetForm() }} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: C.teal, color: C.white, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Plus size={16} /> Add Question
          </button>
        </div>
      </div>

      {/* Request from Claude Panel */}
      {showGenerate && (() => {
        const genSub = subjects.find(s => s.id === genConfig.subject_id)
        const examName = genConfig.pyq_exam || 'UPSC Prelims'
        const prompt = `Generate ${genConfig.count} ${genConfig.difficulty} difficulty MCQ questions for the subject "${genSub?.name || 'all subjects'}" (${genSub?.paper || 'General Studies'}) for the ${examName} exam${genConfig.pyq_year ? ` in the style of ${examName} ${genConfig.pyq_year}` : ''}. Use the bulk import format:

Q: question text
A: option A
B: option B
C: option C
D: option D
Answer: B
Explanation: detailed explanation
Subject: ${genSub?.name || 'General'}
Difficulty: ${genConfig.difficulty}
Exam: ${examName}${genConfig.pyq_year ? `\nYear: ${genConfig.pyq_year}` : ''}
---

Generate real exam-quality questions with authentic ${examName} patterns. Include statement-based, match-the-following, and negative framing patterns. Each explanation must cite specific facts.`

        return (
          <div style={{
            background: C.white, border: '1px solid #c4b5fd', borderRadius: 14,
            padding: 20, marginBottom: 20, boxShadow: '0 1px 3px rgba(139,92,246,0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} color="#8b5cf6" />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, margin: 0 }}>Request Questions from Claude</h3>
              </div>
              <button onClick={() => setShowGenerate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
            </div>

            <p style={{ fontSize: 13, color: C.muted, margin: '0 0 16px', lineHeight: 1.6 }}>
              Configure what you need, copy the prompt, and paste it to Claude Code. Claude will generate questions in bulk import format that you can paste back here.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Subject</label>
                <select value={genConfig.subject_id} onChange={e => setGenConfig({ ...genConfig, subject_id: e.target.value })} style={inputStyle}>
                  <option value="">All Subjects</option>
                  {(() => {
                    const examPaperMap = {
                      'Bihar Daroga Mains (BPSSC SI)': 'BPSSC SI Mains',
                    }
                    const paperFilter = examPaperMap[genConfig.pyq_exam]
                    const filtered = paperFilter ? subjects.filter(s => s.paper === paperFilter) : subjects
                    return filtered.map(s => <option key={s.id} value={s.id}>{s.name} ({s.paper})</option>)
                  })()}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Difficulty</label>
                <select value={genConfig.difficulty} onChange={e => setGenConfig({ ...genConfig, difficulty: e.target.value })} style={inputStyle}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Count</label>
                <select value={genConfig.count} onChange={e => setGenConfig({ ...genConfig, count: parseInt(e.target.value) })} style={inputStyle}>
                  {[10, 20, 30, 50].map(n => <option key={n} value={n}>{n} questions</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>PYQ Year (optional)</label>
                <input type="number" value={genConfig.pyq_year} onChange={e => setGenConfig({ ...genConfig, pyq_year: e.target.value })} placeholder="e.g. 2023" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Exam</label>
                <select value={genConfig.pyq_exam} onChange={e => setGenConfig({ ...genConfig, pyq_exam: e.target.value })} style={inputStyle}>
                  {['UPSC Prelims', 'UPSC Mains', 'BPSC', 'Bihar Daroga Mains (BPSSC SI)', 'UPPSC', 'MPSC', 'RPSC', 'WBPSC', 'SSC CGL'].map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generated Prompt */}
            <div style={{ position: 'relative' }}>
              <label style={labelStyle}>Prompt (copy and paste to Claude Code)</label>
              <textarea
                readOnly
                value={prompt}
                rows={6}
                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12, background: '#faf5ff', border: '1px solid #c4b5fd', resize: 'vertical' }}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(prompt)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
                style={{
                  position: 'absolute', top: 30, right: 8,
                  padding: '6px 12px', borderRadius: 6, border: 'none',
                  background: copied ? C.green : '#8b5cf6', color: C.white,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                  transition: 'background 0.2s',
                }}
              >
                {copied ? <><CheckCheck size={14} /> Copied!</> : <><Copy size={14} /> Copy Prompt</>}
              </button>
            </div>

            <div style={{
              marginTop: 14, padding: 14, borderRadius: 10,
              background: '#faf5ff', border: '1px solid #e9d5ff',
            }}>
              <p style={{ fontSize: 13, color: '#6b21a8', margin: 0, lineHeight: 1.6 }}>
                <strong>How to use:</strong><br />
                1. Configure options above<br />
                2. Click "Copy Prompt" to copy<br />
                3. Paste it to Claude Code in your terminal<br />
                4. Claude will generate questions in bulk format<br />
                5. Copy the output and use "Bulk Import" to add them
              </p>
            </div>
          </div>
        )
      })()}

      {msg && (
        <div style={{
          padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 500,
          background: msg.type === 'success' ? C.greenLight : C.redLight,
          color: msg.type === 'success' ? C.green : C.red,
          border: `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {msg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {msg.text}
        </div>
      )}

      {/* Bulk Import */}
      {showBulk && (
        <div style={{
          background: C.white, border: `1px solid ${C.border}`, borderRadius: 14,
          padding: 20, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, margin: 0 }}>Bulk Import Questions</h3>
            <button onClick={() => setShowBulk(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
          </div>
          <p style={{ fontSize: 12, color: C.muted, margin: '0 0 12px', lineHeight: 1.6 }}>
            Paste questions in this format (separate multiple with <code>---</code>):
          </p>
          <pre style={{
            background: C.bg, padding: 12, borderRadius: 8, fontSize: 12,
            color: C.slate, margin: '0 0 12px', lineHeight: 1.6, overflow: 'auto',
          }}>{`Q: What is the capital of India?
A: Mumbai
B: New Delhi
C: Kolkata
D: Chennai
Answer: B
Explanation: New Delhi is the capital city of India.
Subject: Geography
Difficulty: easy
Year: 2020
Exam: UPSC Prelims
---
Q: Next question here...`}</pre>
          <textarea
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
            placeholder="Paste your questions here..."
            rows={10}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}
          />
          <button
            onClick={handleBulkImport}
            disabled={!bulkText.trim() || saving}
            style={{
              marginTop: 12, padding: '10px 20px', borderRadius: 8, border: 'none',
              background: C.teal, color: C.white, fontSize: 14, fontWeight: 600,
              cursor: saving ? 'wait' : 'pointer', opacity: !bulkText.trim() ? 0.5 : 1,
            }}
          >
            {saving ? 'Importing...' : 'Import Questions'}
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{
          background: C.white, border: `1px solid ${C.border}`, borderRadius: 14,
          padding: 20, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, margin: 0 }}>
              {editingId ? 'Edit Question' : 'Add Question'}
            </h3>
            <button onClick={() => { setShowForm(false); resetForm() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
          </div>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Subject</label>
                <select value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value })} style={inputStyle}>
                  <option value="">-- Select --</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.paper})</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Difficulty</label>
                <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} style={inputStyle}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Source</label>
                <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} style={inputStyle}>
                  <option value="manual">Manual</option>
                  <option value="pyq">PYQ</option>
                </select>
              </div>
            </div>

            {form.source === 'pyq' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>PYQ Year</label>
                  <input type="number" value={form.pyq_year} onChange={e => setForm({ ...form, pyq_year: e.target.value })} placeholder="2023" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Exam</label>
                  <input value={form.pyq_exam} onChange={e => setForm({ ...form, pyq_exam: e.target.value })} placeholder="UPSC Prelims" style={inputStyle} />
                </div>
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Question</label>
              <textarea value={form.question_text} onChange={e => setForm({ ...form, question_text: e.target.value })} rows={4} required style={{ ...inputStyle, resize: 'vertical' }} placeholder="Enter the question text..." />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              {['A', 'B', 'C', 'D'].map(opt => (
                <div key={opt}>
                  <label style={labelStyle}>
                    Option {opt}
                    {form.correct_option === opt && <span style={{ color: C.green, marginLeft: 6 }}>Correct</span>}
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      value={form[`option_${opt.toLowerCase()}`]}
                      onChange={e => setForm({ ...form, [`option_${opt.toLowerCase()}`]: e.target.value })}
                      required
                      style={{ ...inputStyle, flex: 1 }}
                      placeholder={`Option ${opt}`}
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, correct_option: opt })}
                      style={{
                        padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: form.correct_option === opt ? C.green : '#f1f5f9',
                        color: form.correct_option === opt ? C.white : C.muted,
                        fontSize: 12, fontWeight: 700,
                      }}
                    >
                      {form.correct_option === opt ? <Check size={14} /> : opt}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Explanation</label>
              <textarea value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Explain the correct answer with references..." />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={saving} style={{
                flex: 1, padding: '10px', borderRadius: 8, border: 'none',
                background: C.teal, color: C.white, fontSize: 14, fontWeight: 600,
                cursor: saving ? 'wait' : 'pointer',
              }}>
                {saving ? 'Saving...' : editingId ? 'Update Question' : 'Add Question'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm() }} style={{
                flex: 1, padding: '10px', borderRadius: 8,
                border: `1px solid ${C.border}`, background: C.white, color: C.slate,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} color={C.muted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            style={{ ...inputStyle, paddingLeft: 36 }}
          />
        </div>
        <select value={filterPaper} onChange={e => { setFilterPaper(e.target.value); setFilterSubject('') }} style={{ ...inputStyle, width: 'auto' }}>
          <option value="">All Papers</option>
          {papers.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="">All Subjects</option>
          {(filterPaper ? subjects.filter(s => s.paper === filterPaper) : subjects).map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Questions List */}
      {loading ? <LoadingSpinner /> : filteredQuestions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: C.muted, fontSize: 14 }}>
          No questions found. Add questions using the form above.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredQuestions.map(q => {
            const sub = subjects.find(s => s.id === q.subject_id)
            const isExpanded = expandedId === q.id
            return (
              <div key={q.id} style={{
                background: C.white, border: `1px solid ${C.border}`, borderRadius: 12,
                overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}>
                <div
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  style={{
                    padding: '14px 16px', cursor: 'pointer', display: 'flex',
                    alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                      {sub && <span style={{ fontSize: 11, fontWeight: 600, color: C.teal, background: C.tealLight, padding: '1px 8px', borderRadius: 6 }}>{sub.name}</span>}
                      {sub && <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, background: C.bg, padding: '1px 8px', borderRadius: 6 }}>{sub.paper}</span>}
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, background: C.bg, padding: '1px 8px', borderRadius: 6 }}>{q.difficulty}</span>
                      {q.pyq_year && <span style={{ fontSize: 11, fontWeight: 600, color: C.orange, background: '#fffbeb', padding: '1px 8px', borderRadius: 6 }}>PYQ {q.pyq_year}</span>}
                    </div>
                    <div style={{
                      fontSize: 14, color: C.navy, fontWeight: 500, lineHeight: 1.5,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {q.question_text}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    {isExpanded ? <ChevronUp size={16} color={C.muted} /> : <ChevronDown size={16} color={C.muted} />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${C.border}` }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                      {['A', 'B', 'C', 'D'].map(opt => (
                        <div key={opt} style={{
                          padding: '8px 12px', borderRadius: 8, fontSize: 13,
                          background: q.correct_option === opt ? C.greenLight : C.bg,
                          border: `1px solid ${q.correct_option === opt ? C.green : C.border}`,
                          color: q.correct_option === opt ? '#166534' : C.slate,
                          fontWeight: q.correct_option === opt ? 600 : 400,
                        }}>
                          <strong>{opt}.</strong> {q[`option_${opt.toLowerCase()}`]}
                          {q.correct_option === opt && <Check size={14} style={{ marginLeft: 6, verticalAlign: 'middle' }} />}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <div style={{ marginTop: 10, padding: 12, borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a', fontSize: 13, color: '#78350f', lineHeight: 1.6 }}>
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(q) }} style={{
                        padding: '6px 14px', borderRadius: 6, border: `1px solid ${C.border}`,
                        background: C.white, color: C.slate, fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <Edit3 size={13} /> Edit
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(q.id) }} style={{
                        padding: '6px 14px', borderRadius: 6, border: `1px solid #fecaca`,
                        background: C.redLight, color: C.red, fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <Trash2 size={13} /> Delete
                      </button>
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
