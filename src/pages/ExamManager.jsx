import { useState } from 'react'
import { useExams } from '../hooks/useExams'
import LoadingSpinner from '../components/LoadingSpinner'
import CountdownBadge from '../components/CountdownBadge'
import EmptyState from '../components/EmptyState'
import { Plus, Trash2, X } from 'lucide-react'

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  color: '#1e293b',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box'
}

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: '#475569',
  marginBottom: 6,
  display: 'block'
}

export default function ExamManager() {
  const { exams, loading, addExam, deleteExam } = useExams()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [examDate, setExamDate] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    await addExam(name, examDate || null, description || null)
    setName(''); setExamDate(''); setDescription('')
    setShowForm(false)
    setSubmitting(false)
  }

  const handleDelete = async (id, examName) => {
    if (window.confirm(`Delete "${examName}"?`)) {
      await deleteExam(id)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ paddingTop: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>Exam Manager</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 18px',
            background: showForm ? '#f1f5f9' : '#14b8a6',
            color: showForm ? '#475569' : '#fff',
            border: showForm ? '1px solid #e2e8f0' : 'none',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s',
            boxShadow: showForm ? 'none' : '0 1px 3px rgba(20,184,166,0.3)'
          }}
          onMouseEnter={e => {
            if (!showForm) e.currentTarget.style.background = '#0d9488'
          }}
          onMouseLeave={e => {
            if (!showForm) e.currentTarget.style.background = '#14b8a6'
          }}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Add Exam'}
        </button>
      </div>

      {/* Add Exam Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="animate-slide-up"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}
        >
          <div>
            <label style={labelStyle}>Exam Name *</label>
            <input
              type="text"
              placeholder="e.g. Calculus Final"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#14b8a6'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div>
            <label style={labelStyle}>Exam Date</label>
            <input
              type="date"
              value={examDate}
              onChange={e => setExamDate(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#14b8a6'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              placeholder="Optional notes about the exam..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={e => e.target.style.borderColor = '#14b8a6'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '11px',
              background: '#14b8a6',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              transition: 'background 0.2s',
              boxShadow: '0 1px 3px rgba(20,184,166,0.3)'
            }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#0d9488' }}
            onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = '#14b8a6' }}
          >
            {submitting ? 'Adding...' : 'Add Exam'}
          </button>
        </form>
      )}

      {/* Exam List */}
      {exams.length === 0 ? (
        <EmptyState emoji="🎓" title="No exams yet" subtitle="Add your first exam to start tracking" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {exams.map(exam => (
            <div
              key={exam.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '18px 20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#cbd5e1'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', margin: 0 }}>{exam.name}</h3>
                    {exam.exam_date && <CountdownBadge examDate={exam.exam_date} />}
                  </div>
                  {exam.description && (
                    <p style={{ fontSize: 13, color: '#475569', marginBottom: 6, lineHeight: 1.5 }}>{exam.description}</p>
                  )}
                  {exam.exam_date && (
                    <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                      {new Date(exam.exam_date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(exam.id, exam.name)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: 6,
                    borderRadius: 8,
                    transition: 'color 0.2s, background 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#ef4444'
                    e.currentTarget.style.background = '#fef2f2'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#94a3b8'
                    e.currentTarget.style.background = 'none'
                  }}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
