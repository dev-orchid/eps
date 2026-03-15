import { useState } from 'react';
import { Plus, Trash2, CheckSquare, Square, X, Filter, GraduationCap } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useExams } from '../hooks/useExams';
import LoadingSpinner from '../components/LoadingSpinner';
import PriorityBadge from '../components/PriorityBadge';
import EmptyState from '../components/EmptyState';

const isMobile = () => window.innerWidth < 768;

const styles = {
  page: {
    paddingTop: '20px',
    paddingBottom: isMobile() ? '80px' : '20px',
    color: '#1e293b',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    margin: 0,
    color: '#1e293b',
  },
  taskCount: {
    fontSize: '14px',
    color: '#94a3b8',
    fontWeight: '400',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  filterGroup: {
    display: 'flex',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
  },
  filterBtn: (active) => ({
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: active ? '#14b8a6' : '#ffffff',
    color: active ? '#ffffff' : '#94a3b8',
    transition: 'all 0.15s ease',
  }),
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: '#14b8a6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  formCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  formTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 16px 0',
    color: '#1e293b',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr 0.8fr 1fr',
    gap: '12px',
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: '#94a3b8',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  submitBtn: {
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: '#14b8a6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  cancelBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: '#ffffff',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  taskCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    transition: 'border-color 0.15s ease',
  },
  checkboxBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  taskContent: {
    flex: 1,
    minWidth: 0,
  },
  taskTitle: (completed) => ({
    fontSize: '15px',
    fontWeight: '500',
    margin: 0,
    color: completed ? '#94a3b8' : '#1e293b',
    textDecoration: completed ? 'line-through' : 'none',
  }),
  taskDueDate: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '4px',
  },
  taskRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '4px',
    transition: 'color 0.15s ease',
  },
};

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function Tasks() {
  const { tasks, loading, addTask, toggleTask, deleteTask } = useTasks();
  const { exams } = useExams();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('today');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [examId, setExamId] = useState('');
  const [hoveredDelete, setHoveredDelete] = useState(null);

  // Build exam lookup map
  const examMap = {};
  (exams || []).forEach(e => { examMap[e.id] = e });

  if (loading) {
    return (
      <div style={styles.page}>
        <LoadingSpinner />
      </div>
    );
  }

  const today = getTodayString();

  const filteredTasks = filter === 'today'
    ? tasks.filter((t) => t.due_date === today)
    : tasks;

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  const completedCount = filteredTasks.filter((t) => t.completed).length;
  const totalCount = filteredTasks.length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title.trim(), dueDate || today, priority, examId || null);
    setTitle('');
    setDueDate('');
    setPriority('medium');
    setExamId('');
    setShowForm(false);
  };

  const handleCancel = () => {
    setTitle('');
    setDueDate('');
    setPriority('medium');
    setExamId('');
    setShowForm(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Tasks</h1>
          <span style={styles.taskCount}>
            {completedCount}/{totalCount}
          </span>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.filterGroup}>
            <button
              style={styles.filterBtn(filter === 'today')}
              onClick={() => setFilter('today')}
            >
              <Filter size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Today
            </button>
            <button
              style={styles.filterBtn(filter === 'all')}
              onClick={() => setFilter('all')}
            >
              All
            </button>
          </div>
          <button
            style={styles.addBtn}
            onClick={() => setShowForm(true)}
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>

      {showForm && (
        <form style={styles.formCard} onSubmit={handleSubmit}>
          <p style={styles.formTitle}>New Task</p>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>Title</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Task title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label style={styles.label}>Due Date</label>
              <input
                style={styles.input}
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <label style={styles.label}>Priority</label>
              <select
                style={styles.select}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Exam (optional)</label>
              <select
                style={styles.select}
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
          <div style={styles.formActions}>
            <button type="button" style={styles.cancelBtn} onClick={handleCancel}>
              <X size={14} />
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn}>
              Add Task
            </button>
          </div>
        </form>
      )}

      {sortedTasks.length === 0 ? (
        <EmptyState
          emoji="📋"
          title={filter === 'today' ? 'No tasks for today' : 'No tasks yet'}
          subtitle="Add a task to get started"
        />
      ) : (
        <div>
          {sortedTasks.map((task) => (
            <div key={task.id} style={styles.taskCard}>
              <button
                style={styles.checkboxBtn}
                onClick={() => toggleTask(task.id, task.completed)}
                aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {task.completed ? (
                  <CheckSquare size={20} color="#14b8a6" />
                ) : (
                  <Square size={20} color="#94a3b8" />
                )}
              </button>
              <div style={styles.taskContent}>
                <p style={styles.taskTitle(task.completed)}>{task.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  {task.due_date && (
                    <span style={styles.taskDueDate}>{task.due_date}</span>
                  )}
                  {task.exam_id && examMap[task.exam_id] && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      fontSize: 11, fontWeight: 600, color: '#6366f1',
                      background: '#eef2ff', padding: '1px 8px', borderRadius: 6,
                    }}>
                      <GraduationCap size={10} />
                      {examMap[task.exam_id].name}
                    </span>
                  )}
                </div>
              </div>
              <div style={styles.taskRight}>
                <PriorityBadge priority={task.priority} />
                <button
                  style={{
                    ...styles.deleteBtn,
                    color: hoveredDelete === task.id ? '#ef4444' : '#64748b',
                  }}
                  onClick={() => deleteTask(task.id)}
                  onMouseEnter={() => setHoveredDelete(task.id)}
                  onMouseLeave={() => setHoveredDelete(null)}
                  aria-label="Delete task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
