import { useState, useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useStudySessions } from '../hooks/useStudySessions';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import { Clock, CheckSquare, BarChart3 } from 'lucide-react';

const COLORS = ['#14b8a6', '#a855f7', '#f59e0b', '#ef4444', '#3b82f6', '#06b6d4'];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInRange(days) {
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);
    result.push(d);
  }
  return result;
}

function formatDateLabel(date, range) {
  if (range === '7') {
    return DAY_NAMES[date.getDay()];
  }
  const month = date.toLocaleString('en-US', { month: 'short' });
  return `${month} ${date.getDate()}`;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: '8px 12px',
        color: '#1e293b',
        fontSize: 13,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ marginBottom: 4, fontWeight: 600, color: '#1e293b' }}>{label}</div>
      {payload.map((entry, i) => (
        <div key={i} style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
        </div>
      ))}
    </div>
  );
};

export default function Progress() {
  const [dateRange, setDateRange] = useState('7');
  const { tasks, loading: tasksLoading } = useTasks();
  const { sessions, loading: sessionsLoading } = useStudySessions();

  const loading = tasksLoading || sessionsLoading;

  const days = useMemo(() => getDaysInRange(Number(dateRange)), [dateRange]);

  const rangeStart = days[0];

  // Filter sessions and tasks within selected range
  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    return sessions.filter((s) => {
      const d = new Date(s.date || s.created_at);
      return d >= rangeStart;
    });
  }, [sessions, rangeStart]);

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((t) => {
      const d = new Date(t.due_date);
      return d >= rangeStart;
    });
  }, [tasks, rangeStart]);

  // Total study hours
  const totalHours = useMemo(() => {
    return filteredSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60;
  }, [filteredSessions]);

  // Total tasks completed
  const totalCompleted = useMemo(() => {
    return filteredTasks.filter((t) => t.completed).length;
  }, [filteredTasks]);

  // Chart 1: Daily Study Hours
  const studyHoursData = useMemo(() => {
    return days.map((day) => {
      const dayTotal = (sessions || [])
        .filter((s) => {
          const d = new Date(s.date || s.created_at);
          return isSameDay(d, day);
        })
        .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      return {
        label: formatDateLabel(day, dateRange),
        hours: +(dayTotal / 60).toFixed(2),
      };
    });
  }, [days, sessions, dateRange]);

  // Chart 2: Tasks Completed vs Total
  const tasksChartData = useMemo(() => {
    return days.map((day) => {
      const dayTasks = (tasks || []).filter((t) => {
        const d = new Date(t.due_date);
        return isSameDay(d, day);
      });
      return {
        label: formatDateLabel(day, dateRange),
        total: dayTasks.length,
        completed: dayTasks.filter((t) => t.completed).length,
      };
    });
  }, [days, tasks, dateRange]);

  // Chart 3: Subject Breakdown
  const subjectData = useMemo(() => {
    if (!filteredSessions.length) return [];
    const map = {};
    filteredSessions.forEach((s) => {
      const subj = s.subject || 'Unknown';
      map[subj] = (map[subj] || 0) + (s.duration_minutes || 0);
    });
    return Object.entries(map).map(([name, minutes]) => ({
      name,
      value: +(minutes / 60).toFixed(2),
    }));
  }, [filteredSessions]);

  if (loading) return <LoadingSpinner />;

  const cardStyle = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  };

  const toggleBtnBase = {
    padding: '6px 16px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.2s',
  };

  return (
    <div style={{ color: '#1e293b', paddingTop: 20, paddingBottom: 80 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#1e293b' }}>Progress</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setDateRange('7')}
            style={{
              ...toggleBtnBase,
              background: dateRange === '7' ? '#14b8a6' : '#ffffff',
              color: dateRange === '7' ? '#fff' : '#94a3b8',
              borderColor: dateRange === '7' ? '#14b8a6' : '#e2e8f0',
            }}
          >
            7 Days
          </button>
          <button
            onClick={() => setDateRange('30')}
            style={{
              ...toggleBtnBase,
              background: dateRange === '30' ? '#14b8a6' : '#ffffff',
              color: dateRange === '30' ? '#fff' : '#94a3b8',
              borderColor: dateRange === '30' ? '#14b8a6' : '#e2e8f0',
            }}
          >
            30 Days
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <StatCard
            icon={Clock}
            color="#14b8a6"
            label="Study Hours"
            value={totalHours.toFixed(1)}
          />
          <StatCard
            icon={CheckSquare}
            color="#22c55e"
            label="Tasks Completed"
            value={totalCompleted}
          />
        </div>

        {/* Chart 1: Daily Study Hours */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
            Daily Study Hours
          </h3>
          {filteredSessions.length === 0 ? (
            <EmptyState emoji="📊" title="No study sessions in this period" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={studyHoursData}>
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="hours"
                  name="Hours"
                  fill="#14b8a6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Chart 2: Tasks Completed vs Total */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
            Tasks Completed vs Total
          </h3>
          {filteredTasks.length === 0 ? (
            <EmptyState emoji="📋" title="No tasks in this period" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tasksChartData}>
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="total"
                  name="Total"
                  fill="#14b8a6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Chart 3: Subject Breakdown */}
        {subjectData.length > 0 && (
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
              Subject Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={subjectData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: '#94a3b8' }}
                >
                  {subjectData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
