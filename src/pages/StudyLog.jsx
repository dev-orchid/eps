import { useState } from 'react';
import { useStudySessions } from '../hooks/useStudySessions';
import { useExams } from '../hooks/useExams';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Plus, Trash2, BookOpen, Clock, X, ChevronDown, ChevronUp, ExternalLink, GraduationCap } from 'lucide-react';

function formatDuration(minutes) {
  const hrs = Math.floor(minutes / 60);
  const min = minutes % 60;
  if (hrs === 0) return `${min}min`;
  if (min === 0) return `${hrs}hr`;
  return `${hrs}hr ${min}min`;
}

function formatDurationLarge(minutes) {
  const hrs = Math.floor(minutes / 60);
  const min = minutes % 60;
  if (hrs === 0) return `${min} min`;
  if (min === 0) return `${hrs} hrs`;
  return `${hrs} hrs ${min} min`;
}

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

export default function StudyLog() {
  const { sessions, addSession, deleteSession, loading } = useStudySessions();
  const { exams } = useExams();
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [notes, setNotes] = useState('');
  const [examId, setExamId] = useState('');
  const [hoveredDelete, setHoveredDelete] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const examMap = {};
  (exams || []).forEach(e => { examMap[e.id] = e });

  const todayStr = getTodayString();
  const todayMinutes = (sessions || [])
    .filter((s) => s.date === todayStr)
    .reduce((sum, s) => sum + Number(s.duration_minutes || 0), 0);

  const sortedSessions = [...(sessions || [])].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !durationMinutes || !date) return;
    addSession(subject.trim(), Number(durationMinutes), date, notes.trim(), examId || null);
    setSubject('');
    setDurationMinutes('');
    setDate(getTodayString());
    setNotes('');
    setExamId('');
    setShowForm(false);
  };

  if (loading) return <LoadingSpinner />;

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    color: '#1e293b',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: 4,
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: 500,
  };

  return (
    <div style={{ color: '#1e293b', paddingTop: 20, paddingBottom: 80 }}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1e293b' }}>Study Log</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 18px',
              backgroundColor: '#14b8a6',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={18} />
            Add
          </button>
        </div>

        {/* Today's Study Time */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '28px 24px',
            marginBottom: 24,
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <Clock size={20} color="#14b8a6" />
            <span style={{ fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
              Today's Study Time
            </span>
          </div>
          <div style={{ fontSize: 42, fontWeight: 800, color: '#14b8a6', lineHeight: 1.2 }}>
            {formatDurationLarge(todayMinutes)}
          </div>
          <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>studied today</div>
        </div>

        {/* Add Session Form */}
        {showForm && (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1e293b' }}>New Session</h2>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Mathematics"
                  required
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Duration (minutes)</label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="e.g. 45"
                  min="1"
                  required
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Exam (optional)</label>
                <select
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">No exam linked</option>
                  {(exams || []).map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What did you study?"
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    backgroundColor: '#14b8a6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Session List */}
        {sortedSessions.length === 0 ? (
          <EmptyState
            emoji="📚"
            title="No study sessions yet"
            subtitle="Tap Add to log your first study session."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sortedSessions.map((session) => {
              const isExpanded = expandedId === session.id
              const hasNotes = !!session.notes
              const isCurrentAffairs = session.subject?.startsWith('Current Affairs')
              const isLongNotes = hasNotes && session.notes.length > 100

              return (
                <div
                  key={session.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  }}
                >
                  <div style={{
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
                      }}>
                        {isCurrentAffairs && (
                          <span style={{
                            fontSize: 11, fontWeight: 700, color: '#14b8a6',
                            background: '#e0f7f0', padding: '2px 8px', borderRadius: 6,
                            flexShrink: 0,
                          }}>
                            Current Affairs
                          </span>
                        )}
                        <span style={{ fontWeight: 700, fontSize: 16, color: '#1e293b' }}>
                          {isCurrentAffairs
                            ? session.subject.replace(/^Current Affairs \([^)]+\): /, '')
                            : session.subject}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#475569', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={14} color="#14b8a6" />
                          {formatDuration(session.duration_minutes)}
                        </span>
                        <span>{session.date}</span>
                        {session.exam_id && examMap[session.exam_id] && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            fontSize: 11, fontWeight: 600, color: '#6366f1',
                            background: '#eef2ff', padding: '1px 8px', borderRadius: 6,
                          }}>
                            <GraduationCap size={10} />
                            {examMap[session.exam_id].name}
                          </span>
                        )}
                      </div>
                      {hasNotes && !isExpanded && (
                        <div style={{
                          fontSize: 13, color: '#94a3b8', marginTop: 8, lineHeight: 1.5,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {session.notes.split('\n')[0]}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      {hasNotes && isLongNotes && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : session.id)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: 6, display: 'flex', alignItems: 'center',
                            color: '#14b8a6', transition: 'color 0.15s',
                          }}
                          title={isExpanded ? 'Collapse' : 'Read more'}
                        >
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      )}
                      <button
                        onClick={() => deleteSession(session.id)}
                        onMouseEnter={() => setHoveredDelete(session.id)}
                        onMouseLeave={() => setHoveredDelete(null)}
                        style={{
                          background: 'none', border: 'none',
                          color: hoveredDelete === session.id ? '#ef4444' : '#64748b',
                          cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center',
                          transition: 'color 0.15s ease',
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded notes section */}
                  {isExpanded && hasNotes && (() => {
                    const urlMatch = session.notes.match(/https?:\/\/[^\s]+/)
                    const articleUrl = urlMatch ? urlMatch[0] : null
                    const notesText = articleUrl
                      ? session.notes.replace(articleUrl, '').trimEnd()
                      : session.notes

                    return (
                      <div style={{
                        padding: '0 18px 16px',
                        borderTop: '1px solid #f1f5f9',
                        marginTop: 0,
                      }}>
                        <div style={{
                          fontSize: 14, color: '#334155', lineHeight: 1.7,
                          paddingTop: 14, whiteSpace: 'pre-line',
                        }}>
                          {notesText}
                        </div>
                        {articleUrl && (
                          <a
                            href={articleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              marginTop: 12, padding: '8px 16px', borderRadius: 8,
                              background: '#e0f7f0', color: '#0d9488',
                              fontSize: 13, fontWeight: 600, textDecoration: 'none',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#ccfbf1'}
                            onMouseLeave={e => e.currentTarget.style.background = '#e0f7f0'}
                          >
                            <ExternalLink size={14} />
                            Read full article
                          </a>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
