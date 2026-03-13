import { useAuth } from '../context/AuthContext'
import { useExams } from '../hooks/useExams'
import { useTasks } from '../hooks/useTasks'
import { useStudySessions } from '../hooks/useStudySessions'
import LoadingSpinner from '../components/LoadingSpinner'
import CountdownBadge from '../components/CountdownBadge'
import EmptyState from '../components/EmptyState'
import PriorityBadge from '../components/PriorityBadge'
import { GraduationCap, CheckSquare, Clock, Target, TrendingUp, BookOpen, ArrowRight, CalendarDays } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuth()
  const { exams, loading: examsLoading } = useExams()
  const { tasks, loading: tasksLoading, toggleTask } = useTasks()
  const { sessions, loading: sessionsLoading } = useStudySessions()
  const navigate = useNavigate()

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Student'
  const today = new Date().toISOString().split('T')[0]

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const todayTasks = tasks.filter(t => t.due_date === today)
  const todayDone = todayTasks.filter(t => t.completed).length
  const todayTotal = todayTasks.length
  const pendingTasks = tasks.filter(t => !t.completed).length

  const todayMinutes = sessions
    .filter(s => s.date === today)
    .reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
  const todayHours = (todayMinutes / 60).toFixed(1)

  // Weekly study hours
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekStr = weekAgo.toISOString().split('T')[0]
  const weekMinutes = sessions
    .filter(s => s.date >= weekStr)
    .reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
  const weekHours = (weekMinutes / 60).toFixed(1)

  const goalPct = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0

  const upcomingExams = exams
    .filter(e => e.exam_date >= today)
    .sort((a, b) => a.exam_date.localeCompare(b.exam_date))
    .slice(0, 4)

  const loading = examsLoading || tasksLoading || sessionsLoading

  if (loading) return <LoadingSpinner />

  const greetingHour = new Date().getHours()
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="dashboard-root">
      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: 0 }}>
          {greeting}, {firstName}!
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4, fontWeight: 500 }}>
          <CalendarDays size={14} style={{ verticalAlign: 'middle', marginRight: 4, marginTop: -2 }} />
          {dateStr}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="dashboard-stats">
        <div className="stat-card" style={{ borderLeft: '3px solid #14b8a6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>Today's Study</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '6px 0 0' }}>{todayHours}<span style={{ fontSize: 14, fontWeight: 500, color: '#94a3b8' }}> hrs</span></p>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={22} color="#14b8a6" />
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '8px 0 0' }}>{weekHours} hrs this week</p>
        </div>

        <div className="stat-card" style={{ borderLeft: '3px solid #22c55e' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>Tasks Today</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '6px 0 0' }}>{todayDone}<span style={{ fontSize: 14, fontWeight: 500, color: '#94a3b8' }}>/{todayTotal}</span></p>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckSquare size={22} color="#22c55e" />
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '8px 0 0' }}>{pendingTasks} pending total</p>
        </div>

        <div className="stat-card" style={{ borderLeft: '3px solid #a855f7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>Daily Goal</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '6px 0 0' }}>{goalPct}<span style={{ fontSize: 14, fontWeight: 500, color: '#94a3b8' }}>%</span></p>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={22} color="#a855f7" />
            </div>
          </div>
          {/* Mini progress bar */}
          <div style={{ marginTop: 8, height: 4, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${goalPct}%`, background: goalPct === 100 ? '#22c55e' : '#a855f7', borderRadius: 2, transition: 'width 0.3s' }} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '3px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>Exams</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '6px 0 0' }}>{upcomingExams.length}<span style={{ fontSize: 14, fontWeight: 500, color: '#94a3b8' }}> upcoming</span></p>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={22} color="#f59e0b" />
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '8px 0 0' }}>{exams.length} total registered</p>
        </div>
      </div>

      {/* Two-column layout: Tasks + Exams */}
      <div className="dashboard-grid">
        {/* Left: Today's Tasks */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckSquare size={16} color="#14b8a6" />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {"Today's Tasks"}
              </h2>
              {todayTotal > 0 && (
                <span style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>
                  {todayDone}/{todayTotal}
                </span>
              )}
            </div>
            <button
              onClick={() => navigate('/tasks')}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', color: '#14b8a6',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div style={{ padding: '12px 16px', maxHeight: 380, overflowY: 'auto' }}>
            {todayTasks.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                <p style={{ color: '#94a3b8', fontSize: 13 }}>No tasks for today</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {todayTasks.map(task => (
                  <div
                    key={task.id}
                    style={{
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      borderRadius: 8,
                      transition: 'background 0.15s',
                    }}
                    onClick={() => toggleTask(task.id, task.completed)}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      border: task.completed ? 'none' : '2px solid #d1d5db',
                      background: task.completed ? '#14b8a6' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {task.completed && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>&#10003;</span>}
                    </div>
                    <span style={{
                      flex: 1,
                      fontSize: 13,
                      color: task.completed ? '#94a3b8' : '#334155',
                      textDecoration: task.completed ? 'line-through' : 'none',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {task.title}
                    </span>
                    <PriorityBadge priority={task.priority} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Upcoming Exams */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <GraduationCap size={16} color="#f59e0b" />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Upcoming Exams
              </h2>
            </div>
            <button
              onClick={() => navigate('/exams')}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', color: '#14b8a6',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div style={{ padding: '12px 16px', maxHeight: 380, overflowY: 'auto' }}>
            {upcomingExams.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                <p style={{ color: '#94a3b8', fontSize: 13 }}>No upcoming exams</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {upcomingExams.map(exam => (
                  <div
                    key={exam.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#f1f5f9'}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {exam.name}
                      </p>
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0' }}>
                        {new Date(exam.exam_date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <CountdownBadge examDate={exam.exam_date} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-quick-actions">
        {[
          { label: 'Log Study', icon: BookOpen, color: '#14b8a6', bg: '#f0fdfa', path: '/study' },
          { label: 'Add Task', icon: CheckSquare, color: '#22c55e', bg: '#f0fdf4', path: '/tasks' },
          { label: 'View Progress', icon: TrendingUp, color: '#3b82f6', bg: '#eff6ff', path: '/progress' },
          { label: 'Current Affairs', icon: GraduationCap, color: '#f59e0b', bg: '#fffbeb', path: '/current-affairs' },
        ].map(({ label, icon: Icon, color, bg, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 18px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'all 0.15s',
              width: '100%',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 2px 8px ${color}18` }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color={color} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{label}</span>
            <ArrowRight size={14} color="#94a3b8" style={{ marginLeft: 'auto' }} />
          </button>
        ))}
      </div>

      <style>{`
        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        .dashboard-quick-actions {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 1024px) {
          .dashboard-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          .dashboard-quick-actions {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 480px) {
          .dashboard-stats {
            grid-template-columns: 1fr;
          }
          .dashboard-quick-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
