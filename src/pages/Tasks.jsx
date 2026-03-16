import { useState, useMemo } from 'react';
import { Plus, Trash2, CheckSquare, Square, X, GraduationCap, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useExams } from '../hooks/useExams';
import LoadingSpinner from '../components/LoadingSpinner';
import PriorityBadge from '../components/PriorityBadge';
import EmptyState from '../components/EmptyState';

// UPSC-relevant quick task templates
const QUICK_TASKS = [
  { label: 'Read NCERT', icon: '📖', template: 'Read NCERT — ' },
  { label: 'Answer Writing', icon: '✍️', template: 'Answer Writing Practice — ' },
  { label: 'Revise Notes', icon: '🔄', template: 'Revise — ' },
  { label: 'Solve PYQs', icon: '🎯', template: 'Solve PYQs — ' },
  { label: 'Read Newspaper', icon: '📰', template: 'Read & Note — The Hindu / Indian Express' },
  { label: 'Mock Test', icon: '📝', template: 'Attempt Mock Test — ' },
];

const UPSC_SUBJECTS = [
  'Indian History', 'World History', 'Geography', 'Indian Society',
  'Polity & Constitution', 'Governance', 'International Relations', 'Social Justice',
  'Indian Economy', 'Science & Technology', 'Environment & Ecology', 'Internal Security',
  'Ethics & Integrity', 'CSAT', 'Essay', 'Current Affairs', 'Optional Subject',
];

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekEnd() {
  const d = new Date();
  const daysUntilSunday = 7 - d.getDay();
  d.setDate(d.getDate() + (daysUntilSunday === 7 ? 0 : daysUntilSunday));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const today = getTodayString();
  if (dateStr === today) return 'Today';
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  if (dateStr === tomorrowStr) return 'Tomorrow';
  if (dateStr < today) return `Overdue (${dateStr})`;
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function isOverdue(dateStr) {
  return dateStr && dateStr < getTodayString();
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

export default function Tasks() {
  const { tasks, loading, addTask, toggleTask, deleteTask } = useTasks();
  const { exams } = useExams();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('today');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueTime, setDueTime] = useState('');
  const [examId, setExamId] = useState('');
  const [hoveredDelete, setHoveredDelete] = useState(null);

  const examMap = {};
  (exams || []).forEach(e => { examMap[e.id] = e });

  const today = getTodayString();
  const weekEnd = getWeekEnd();

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let list = tasks || [];
    if (filter === 'today') {
      list = list.filter(t => t.due_date === today || (isOverdue(t.due_date) && !t.completed));
    } else if (filter === 'week') {
      list = list.filter(t => (t.due_date >= today && t.due_date <= weekEnd) || (isOverdue(t.due_date) && !t.completed));
    } else if (filter === 'pending') {
      list = list.filter(t => !t.completed);
    }
    return list;
  }, [tasks, filter, today, weekEnd]);

  // Sort: overdue first, then by completion, then by date
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const aOverdue = isOverdue(a.due_date) && !a.completed;
      const bOverdue = isOverdue(b.due_date) && !b.completed;
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
      const dateCmp = (a.due_date || '').localeCompare(b.due_date || '');
      if (dateCmp !== 0) return dateCmp;
      // Within same date, sort by time (tasks with time first, then by time ascending)
      if (a.due_time && !b.due_time) return -1;
      if (!a.due_time && b.due_time) return 1;
      if (a.due_time && b.due_time) return a.due_time.localeCompare(b.due_time);
      return 0;
    });
  }, [filteredTasks]);

  const completedCount = filteredTasks.filter(t => t.completed).length;
  const totalCount = filteredTasks.length;
  const overdueCount = (tasks || []).filter(t => isOverdue(t.due_date) && !t.completed).length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title.trim(), dueDate || today, priority, examId || null, dueTime || null);
    setTitle('');
    setDueDate('');
    setDueTime('');
    setPriority('medium');
    setExamId('');
    setShowForm(false);
  };

  const handleQuickTask = (template) => {
    setTitle(template);
    setShowForm(true);
  };

  if (loading) return <LoadingSpinner />;

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: '#94a3b8',
    marginBottom: 6,
  };

  return (
    <div style={{ paddingTop: 20, paddingBottom: 80, color: '#1e293b' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1e293b' }}>Daily Tasks</h1>
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
              {completedCount}/{totalCount}
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Plan your UPSC preparation day</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', fontSize: 14, fontWeight: 600,
            backgroundColor: '#14b8a6', color: '#ffffff',
            border: 'none', borderRadius: 8, cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {/* Overdue Warning */}
      {overdueCount > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', marginBottom: 16,
          backgroundColor: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 8, fontSize: 13, color: '#dc2626',
        }}>
          <AlertTriangle size={15} />
          <span><strong>{overdueCount}</strong> overdue task{overdueCount > 1 ? 's' : ''} pending</span>
        </div>
      )}

      {/* Quick Add Templates */}
      {!showForm && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {QUICK_TASKS.map(qt => (
            <button
              key={qt.label}
              onClick={() => handleQuickTask(qt.template)}
              style={{
                padding: '5px 10px', fontSize: 11, fontWeight: 600,
                border: '1px solid #e2e8f0', borderRadius: 8,
                backgroundColor: '#ffffff', color: '#475569',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#14b8a6'; e.currentTarget.style.color = '#0d9488'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
            >
              <span>{qt.icon}</span> {qt.label}
            </button>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {[
          { key: 'today', label: 'Today' },
          { key: 'week', label: 'This Week' },
          { key: 'pending', label: 'Pending' },
          { key: 'all', label: 'All' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '7px 16px', fontSize: 13, fontWeight: 600,
              border: 'none', borderRadius: 8, cursor: 'pointer',
              backgroundColor: filter === tab.key ? '#14b8a6' : '#f1f5f9',
              color: filter === tab.key ? '#ffffff' : '#475569',
              transition: 'background-color 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <div style={{
          backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
          borderRadius: 12, padding: 20, marginBottom: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1e293b' }}>New Task</h3>
            <button
              onClick={() => { setShowForm(false); setTitle(''); }}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Task</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="e.g. Read Laxmikanth Ch.5 — Parliament"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Due Date</label>
                <div
                  onClick={(e) => { e.currentTarget.querySelector('input').showPicker() }}
                  style={{ ...inputStyle, cursor: 'pointer', padding: 0 }}
                >
                  <input
                    type="date"
                    value={dueDate || today}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={{ border: 'none', background: 'transparent', fontSize: 14, color: '#1e293b', cursor: 'pointer', outline: 'none', width: '100%', padding: '10px 12px' }}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Time</label>
                <div
                  onClick={(e) => { e.currentTarget.querySelector('input').showPicker() }}
                  style={{ ...inputStyle, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '0' }}
                >
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    style={{
                      border: 'none', background: 'transparent', fontSize: 14,
                      color: dueTime ? '#1e293b' : '#94a3b8', cursor: 'pointer',
                      outline: 'none', width: '100%', padding: '10px 12px',
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Priority</label>
                <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                  {[
                    { value: 'high', label: 'High', color: '#ef4444' },
                    { value: 'medium', label: 'Med', color: '#f59e0b' },
                    { value: 'low', label: 'Low', color: '#22c55e' },
                  ].map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      style={{
                        flex: 1, padding: '8px 4px', fontSize: 12, fontWeight: 600,
                        border: priority === p.value ? `2px solid ${p.color}` : '1px solid #e2e8f0',
                        borderRadius: 6, cursor: 'pointer',
                        backgroundColor: priority === p.value ? `${p.color}12` : '#ffffff',
                        color: priority === p.value ? p.color : '#94a3b8',
                        transition: 'all 0.15s',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Exam (optional)</label>
                <select
                  style={inputStyle}
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                >
                  <option value="">No exam</option>
                  {(exams || []).map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { setShowForm(false); setTitle(''); }}
                style={{
                  padding: '8px 16px', fontSize: 14, fontWeight: 500,
                  backgroundColor: '#ffffff', color: '#475569',
                  border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 20px', fontSize: 14, fontWeight: 600,
                  backgroundColor: '#14b8a6', color: '#ffffff',
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                }}
              >
                Add Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Task List */}
      {sortedTasks.length === 0 ? (
        <EmptyState
          emoji="📋"
          title={filter === 'today' ? "No tasks for today" : filter === 'pending' ? "All caught up!" : "No tasks yet"}
          subtitle={filter === 'pending' ? "Great job completing your tasks!" : "Use quick-add buttons above or click Add Task"}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sortedTasks.map((task) => {
            const overdue = isOverdue(task.due_date) && !task.completed;
            return (
              <div
                key={task.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: overdue ? '1px solid #fecaca' : '1px solid #e2e8f0',
                  borderLeft: overdue ? '3px solid #ef4444' : '1px solid #e2e8f0',
                  borderRadius: overdue ? '4px 12px 12px 4px' : 12,
                  padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  transition: 'border-color 0.15s',
                  opacity: task.completed ? 0.7 : 1,
                }}
              >
                <button
                  onClick={() => toggleTask(task.id, task.completed)}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed ? (
                    <CheckSquare size={20} color="#14b8a6" />
                  ) : (
                    <Square size={20} color={overdue ? '#ef4444' : '#94a3b8'} />
                  )}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 14, fontWeight: 500, margin: 0,
                    color: task.completed ? '#94a3b8' : '#1e293b',
                    textDecoration: task.completed ? 'line-through' : 'none',
                  }}>
                    {task.title}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    {task.due_date && (
                      <span style={{
                        fontSize: 11, fontWeight: 500,
                        color: overdue ? '#ef4444' : '#94a3b8',
                        display: 'flex', alignItems: 'center', gap: 3,
                      }}>
                        {overdue && <AlertTriangle size={10} />}
                        <Calendar size={10} />
                        {formatDate(task.due_date)}
                      </span>
                    )}
                    {task.due_time && (
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: '#14b8a6',
                        display: 'flex', alignItems: 'center', gap: 3,
                        backgroundColor: '#e0f7f0',
                        padding: '1px 7px',
                        borderRadius: 4,
                      }}>
                        <Clock size={10} />
                        {formatTime(task.due_time)}
                      </span>
                    )}
                    {task.exam_id && examMap[task.exam_id] && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        fontSize: 10, fontWeight: 600, color: '#6366f1',
                        background: '#eef2ff', padding: '1px 8px', borderRadius: 6,
                      }}>
                        <GraduationCap size={10} />
                        {examMap[task.exam_id].name}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <PriorityBadge priority={task.priority} />
                  <button
                    onClick={() => deleteTask(task.id)}
                    onMouseEnter={() => setHoveredDelete(task.id)}
                    onMouseLeave={() => setHoveredDelete(null)}
                    style={{
                      background: 'none', border: 'none', padding: 4, cursor: 'pointer',
                      color: hoveredDelete === task.id ? '#ef4444' : '#94a3b8',
                      display: 'flex', alignItems: 'center',
                      transition: 'color 0.15s ease',
                    }}
                    aria-label="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
