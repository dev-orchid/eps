import { useState, useMemo } from 'react';
import { useStudySessions } from '../hooks/useStudySessions';
import { useExams } from '../hooks/useExams';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Plus, Trash2, Clock, X, ChevronDown, ChevronUp, ExternalLink, GraduationCap, BookOpen, PenTool, Target, BarChart3 } from 'lucide-react';

// UPSC-relevant subjects grouped by GS Paper
const UPSC_SUBJECTS = [
  { group: 'GS-I', subjects: ['Indian History', 'World History', 'Geography', 'Indian Society'] },
  { group: 'GS-II', subjects: ['Polity & Constitution', 'Governance', 'International Relations', 'Social Justice'] },
  { group: 'GS-III', subjects: ['Indian Economy', 'Science & Technology', 'Environment & Ecology', 'Internal Security', 'Disaster Management'] },
  { group: 'GS-IV', subjects: ['Ethics & Integrity', 'Aptitude', 'Case Studies'] },
  { group: 'Optional', subjects: ['Optional Subject'] },
  { group: 'Others', subjects: ['CSAT', 'Essay Writing', 'Current Affairs', 'Answer Writing Practice', 'Mock Test Review', 'NCERT Reading', 'Revision'] },
];

const STUDY_TYPES = [
  { label: 'Reading', icon: '📖', color: '#3b82f6' },
  { label: 'Revision', icon: '🔄', color: '#f59e0b' },
  { label: 'Answer Writing', icon: '✍️', color: '#8b5cf6' },
  { label: 'Mock Test', icon: '📝', color: '#ef4444' },
  { label: 'Note Making', icon: '📒', color: '#22c55e' },
  { label: 'PYQ Practice', icon: '🎯', color: '#ec4899' },
];

const QUICK_DURATIONS = [
  { label: '30m', value: 30 },
  { label: '1h', value: 60 },
  { label: '1.5h', value: 90 },
  { label: '2h', value: 120 },
  { label: '3h', value: 180 },
];

// Subject to color mapping
const SUBJECT_COLORS = {
  'Indian History': '#ef4444', 'World History': '#f87171', 'Geography': '#22c55e', 'Indian Society': '#ec4899',
  'Polity & Constitution': '#3b82f6', 'Governance': '#6366f1', 'International Relations': '#a855f7', 'Social Justice': '#f472b6',
  'Indian Economy': '#f59e0b', 'Science & Technology': '#0ea5e9', 'Environment & Ecology': '#10b981', 'Internal Security': '#64748b', 'Disaster Management': '#78716c',
  'Ethics & Integrity': '#8b5cf6', 'Aptitude': '#06b6d4', 'Case Studies': '#a78bfa',
  'Optional Subject': '#6366f1',
  'CSAT': '#14b8a6', 'Essay Writing': '#f97316', 'Current Affairs': '#0d9488', 'Answer Writing Practice': '#8b5cf6',
  'Mock Test Review': '#ef4444', 'NCERT Reading': '#22c55e', 'Revision': '#f59e0b',
};

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
  return `${hrs}h ${min}m`;
}

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekStart() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseSubjectDisplay(subject) {
  // Parse "Subject — Type" format or just show as-is
  if (subject?.includes(' — ')) {
    const [subj, type] = subject.split(' — ');
    return { subject: subj, type };
  }
  // Legacy: "Current Affairs (GS-II): Polity" format
  if (subject?.startsWith('Current Affairs')) {
    return { subject: 'Current Affairs', type: 'Reading' };
  }
  return { subject, type: null };
}

export default function StudyLog() {
  const { sessions, addSession, deleteSession, loading } = useStudySessions();
  const { exams } = useExams();
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [studyType, setStudyType] = useState('Reading');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [notes, setNotes] = useState('');
  const [examId, setExamId] = useState('');
  const [hoveredDelete, setHoveredDelete] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [viewFilter, setViewFilter] = useState('today');

  const examMap = {};
  (exams || []).forEach(e => { examMap[e.id] = e });

  const todayStr = getTodayString();
  const weekStart = getWeekStart();

  // Stats
  const todayMinutes = (sessions || [])
    .filter((s) => s.date === todayStr)
    .reduce((sum, s) => sum + Number(s.duration_minutes || 0), 0);

  const weekMinutes = (sessions || [])
    .filter((s) => s.date >= weekStart)
    .reduce((sum, s) => sum + Number(s.duration_minutes || 0), 0);

  const totalMinutes = (sessions || [])
    .reduce((sum, s) => sum + Number(s.duration_minutes || 0), 0);

  // Subject-wise breakdown for this week
  const subjectBreakdown = useMemo(() => {
    const map = {};
    (sessions || []).filter(s => s.date >= weekStart).forEach(s => {
      const { subject: subj } = parseSubjectDisplay(s.subject);
      const key = subj || 'Other';
      map[key] = (map[key] || 0) + Number(s.duration_minutes || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [sessions, weekStart]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    let list = [...(sessions || [])];
    if (viewFilter === 'today') {
      list = list.filter(s => s.date === todayStr);
    } else if (viewFilter === 'week') {
      list = list.filter(s => s.date >= weekStart);
    }
    return list.sort((a, b) => b.date.localeCompare(a.date) || b.created_at?.localeCompare(a.created_at));
  }, [sessions, viewFilter, todayStr, weekStart]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !durationMinutes || !date) return;
    const fullSubject = studyType ? `${subject.trim()} — ${studyType}` : subject.trim();
    addSession(fullSubject, Number(durationMinutes), date, notes.trim(), examId || null);
    setSubject('');
    setStudyType('Reading');
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

  const DAILY_TARGET = 8 * 60; // 8 hours in minutes
  const todayProgress = Math.min((todayMinutes / DAILY_TARGET) * 100, 100);

  return (
    <div style={{ color: '#1e293b', paddingTop: 20, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#1e293b' }}>Study Log</h1>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Track your UPSC preparation progress</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 18px', backgroundColor: '#14b8a6', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={18} />
          Log Session
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
        marginBottom: 20,
      }}>
        {/* Today's Study */}
        <div style={{
          backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12,
          padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Clock size={14} color="#14b8a6" />
            <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Today</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#14b8a6', lineHeight: 1.1 }}>
            {formatDurationLarge(todayMinutes)}
          </div>
          <div style={{
            marginTop: 8, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${todayProgress}%`,
              background: todayProgress >= 100 ? '#22c55e' : 'linear-gradient(90deg, #14b8a6, #0ea5e9)',
              borderRadius: 2, transition: 'width 0.3s',
            }} />
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
            {todayProgress >= 100 ? 'Daily target reached!' : `${Math.round(todayProgress)}% of 8hr target`}
          </div>
        </div>

        {/* This Week */}
        <div style={{
          backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12,
          padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <BarChart3 size={14} color="#3b82f6" />
            <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>This Week</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#3b82f6', lineHeight: 1.1 }}>
            {formatDurationLarge(weekMinutes)}
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
            ~{Math.round(weekMinutes / 7)}min avg/day
          </div>
        </div>

        {/* Total */}
        <div style={{
          backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12,
          padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Target size={14} color="#8b5cf6" />
            <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Total</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#8b5cf6', lineHeight: 1.1 }}>
            {formatDurationLarge(totalMinutes)}
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
            {(sessions || []).length} sessions logged
          </div>
        </div>
      </div>

      {/* Subject-wise Breakdown (this week) */}
      {subjectBreakdown.length > 0 && (
        <div style={{
          backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12,
          padding: '14px 18px', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
            This Week — Subject Breakdown
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {subjectBreakdown.slice(0, 6).map(([subj, mins]) => {
              const pct = Math.round((mins / weekMinutes) * 100);
              const color = SUBJECT_COLORS[subj] || '#64748b';
              return (
                <div key={subj} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#475569', minWidth: 140, flexShrink: 0 }}>{subj}</span>
                  <div style={{ flex: 1, height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: 3, minWidth: 4 }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, minWidth: 50, textAlign: 'right' }}>{formatDuration(mins)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Session Form */}
      {showForm && (
        <div style={{
          backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12,
          padding: 20, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1e293b' }}>Log Study Session</h2>
            <button
              onClick={() => setShowForm(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            {/* Study Type Selection */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>What did you do?</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {STUDY_TYPES.map(t => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setStudyType(t.label)}
                    style={{
                      padding: '6px 12px', fontSize: 12, fontWeight: 600,
                      border: studyType === t.label ? `2px solid ${t.color}` : '1px solid #e2e8f0',
                      borderRadius: 8, cursor: 'pointer',
                      backgroundColor: studyType === t.label ? `${t.color}12` : '#ffffff',
                      color: studyType === t.label ? t.color : '#475569',
                      display: 'flex', alignItems: 'center', gap: 4,
                      transition: 'all 0.15s',
                    }}
                  >
                    <span>{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Selection */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Subject / Topic</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                style={inputStyle}
              >
                <option value="">Select subject...</option>
                {UPSC_SUBJECTS.map(g => (
                  <optgroup key={g.group} label={g.group}>
                    {g.subjects.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </optgroup>
                ))}
                <option value="__custom">Other (type below)</option>
              </select>
              {subject === '__custom' && (
                <input
                  type="text"
                  placeholder="e.g. Laxmikanth Ch. 5 — Parliament"
                  onChange={(e) => setSubject(e.target.value)}
                  style={{ ...inputStyle, marginTop: 8 }}
                  autoFocus
                />
              )}
            </div>

            {/* Duration + Date row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Duration</label>
                <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                  {QUICK_DURATIONS.map(d => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDurationMinutes(String(d.value))}
                      style={{
                        padding: '4px 10px', fontSize: 11, fontWeight: 600,
                        border: Number(durationMinutes) === d.value ? '2px solid #14b8a6' : '1px solid #e2e8f0',
                        borderRadius: 6, cursor: 'pointer',
                        backgroundColor: Number(durationMinutes) === d.value ? '#e0f7f0' : '#ffffff',
                        color: Number(durationMinutes) === d.value ? '#0d9488' : '#475569',
                        transition: 'all 0.15s',
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="Custom minutes"
                  min="1"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Date</label>
                <div
                  onClick={(e) => { e.currentTarget.querySelector('input').showPicker() }}
                  style={{ ...inputStyle, cursor: 'pointer', padding: 0, marginTop: 26 }}
                >
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    style={{ border: 'none', background: 'transparent', fontSize: 14, color: '#1e293b', cursor: 'pointer', outline: 'none', width: '100%', padding: '10px 12px' }}
                  />
                </div>
              </div>
            </div>

            {/* Exam link */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Linked Exam (optional)</label>
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

            {/* Notes */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key topics covered, doubts, page numbers..."
                rows={2}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                style={{
                  flex: 1, padding: '10px 16px', backgroundColor: '#14b8a6', color: '#fff',
                  border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Log Session
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  flex: 1, padding: '10px 16px', backgroundColor: '#ffffff', color: '#475569',
                  border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Filter Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {[
          { key: 'today', label: 'Today' },
          { key: 'week', label: 'This Week' },
          { key: 'all', label: 'All Sessions' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setViewFilter(tab.key)}
            style={{
              padding: '7px 16px', fontSize: 13, fontWeight: 600,
              border: 'none', borderRadius: 8, cursor: 'pointer',
              backgroundColor: viewFilter === tab.key ? '#14b8a6' : '#f1f5f9',
              color: viewFilter === tab.key ? '#ffffff' : '#475569',
              transition: 'background-color 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Session List */}
      {filteredSessions.length === 0 ? (
        <EmptyState
          emoji="📚"
          title={viewFilter === 'today' ? 'No sessions logged today' : 'No study sessions yet'}
          subtitle={viewFilter === 'today' ? 'Start studying and log your first session!' : 'Tap Log Session to track your preparation.'}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredSessions.map((session) => {
            const isExpanded = expandedId === session.id;
            const hasNotes = !!session.notes;
            const { subject: displaySubject, type: displayType } = parseSubjectDisplay(session.subject);
            const isLongNotes = hasNotes && session.notes.length > 100;
            const subjectColor = SUBJECT_COLORS[displaySubject] || '#64748b';
            const typeInfo = STUDY_TYPES.find(t => t.label === displayType);

            return (
              <div
                key={session.id}
                style={{
                  backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
                  borderLeft: `3px solid ${subjectColor}`,
                  borderRadius: '4px 12px 12px 4px', overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}
              >
                <div style={{
                  padding: '14px 16px',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                      {displayType && typeInfo && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: typeInfo.color,
                          background: `${typeInfo.color}15`, padding: '2px 8px', borderRadius: 6,
                          flexShrink: 0,
                        }}>
                          {typeInfo.icon} {displayType}
                        </span>
                      )}
                      {displayType && !typeInfo && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: '#64748b',
                          background: '#f1f5f9', padding: '2px 8px', borderRadius: 6,
                          flexShrink: 0,
                        }}>
                          {displayType}
                        </span>
                      )}
                      <span style={{ fontWeight: 600, fontSize: 15, color: '#1e293b' }}>
                        {displaySubject}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#475569', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, color: '#14b8a6' }}>
                        <Clock size={12} />
                        {formatDuration(session.duration_minutes)}
                      </span>
                      <span style={{ color: '#94a3b8' }}>{session.date}</span>
                      {session.exam_id && examMap[session.exam_id] && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          fontSize: 10, fontWeight: 600, color: '#6366f1',
                          background: '#eef2ff', padding: '1px 8px', borderRadius: 6,
                        }}>
                          <GraduationCap size={10} />
                          {examMap[session.exam_id].name}
                        </span>
                      )}
                    </div>
                    {hasNotes && !isExpanded && (
                      <div style={{
                        fontSize: 12, color: '#94a3b8', marginTop: 6, lineHeight: 1.5,
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
                        color: hoveredDelete === session.id ? '#ef4444' : '#94a3b8',
                        cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center',
                        transition: 'color 0.15s ease',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Expanded notes */}
                {isExpanded && hasNotes && (() => {
                  const urlMatch = session.notes.match(/https?:\/\/[^\s]+/);
                  const articleUrl = urlMatch ? urlMatch[0] : null;
                  const notesText = articleUrl ? session.notes.replace(articleUrl, '').trimEnd() : session.notes;

                  return (
                    <div style={{
                      padding: '0 16px 14px', borderTop: '1px solid #f1f5f9',
                    }}>
                      <div style={{
                        fontSize: 13, color: '#334155', lineHeight: 1.7,
                        paddingTop: 12, whiteSpace: 'pre-line',
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
                            marginTop: 10, padding: '6px 14px', borderRadius: 8,
                            background: '#e0f7f0', color: '#0d9488',
                            fontSize: 12, fontWeight: 600, textDecoration: 'none',
                          }}
                        >
                          <ExternalLink size={12} />
                          Read full article
                        </a>
                      )}
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
