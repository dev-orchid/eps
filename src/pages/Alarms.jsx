import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, Bell, BellOff, X, Volume2 } from 'lucide-react';
import { useAlarms } from '../hooks/useAlarms';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_NAME_MAP = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };

function formatTime12(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
}

// Generate alarm sound using Web Audio API — loops until stopped
async function playAlarmSound(audioCtxRef, intervalRef) {
  stopAlarmSound(audioCtxRef, intervalRef);

  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    audioCtxRef.current = ctx;

    function scheduleBeeps() {
      if (ctx.state === 'closed') return;
      // 3 beeps pattern taking ~1.5s
      for (let i = 0; i < 3; i++) {
        const t = ctx.currentTime + i * 0.4;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
        osc.start(t);
        osc.stop(t + 0.25);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.value = 1100;
        gain2.gain.setValueAtTime(0.35, t + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
        osc2.start(t + 0.15);
        osc2.stop(t + 0.35);
      }
    }

    // Play immediately, then repeat every 2 seconds
    scheduleBeeps();
    intervalRef.current = setInterval(scheduleBeeps, 2000);
  } catch (e) {
    console.warn('Could not play alarm sound:', e);
  }
}

function stopAlarmSound(audioCtxRef, intervalRef) {
  if (intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }
  if (audioCtxRef.current) {
    audioCtxRef.current.close().catch(() => {});
    audioCtxRef.current = null;
  }
}

export default function Alarms() {
  const { alarms, loading, addAlarm, deleteAlarm, toggleAlarm } = useAlarms();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [alarmTime, setAlarmTime] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [ringingAlarm, setRingingAlarm] = useState(null);
  const [hoveredDelete, setHoveredDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const firedTodayRef = useRef(new Set());
  const alarmsRef = useRef(alarms);
  const audioCtxRef = useRef(null);
  const alarmIntervalRef = useRef(null);

  // Keep alarmsRef in sync
  useEffect(() => {
    alarmsRef.current = alarms;
  }, [alarms]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((perm) => {
          setNotificationPermission(perm);
        });
      }
    } else {
      setNotificationPermission('unsupported');
    }
  }, []);

  // Reset fired-today set at midnight
  useEffect(() => {
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const timeout = setTimeout(() => {
      firedTodayRef.current = new Set();
    }, msUntilMidnight);
    return () => clearTimeout(timeout);
  }, []);

  // Alarm checker - every 5 seconds
  useEffect(() => {
    function checkAlarms() {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const currentDay = DAY_NAME_MAP[now.getDay()];

      alarmsRef.current.forEach((alarm) => {
        if (!alarm.active) return;
        if (firedTodayRef.current.has(alarm.id)) return;

        // alarm_time from Supabase is "HH:MM:SS" — compare first 5 chars
        const alarmHHMM = (alarm.alarm_time || '').slice(0, 5);
        if (alarmHHMM !== currentHHMM) return;

        const days = alarm.days || [];
        if (days.length > 0 && !days.includes(currentDay)) return;

        // Fire the alarm
        firedTodayRef.current.add(alarm.id);
        setRingingAlarm(alarm);

        // Play sound
        playAlarmSound(audioCtxRef, alarmIntervalRef);

        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(alarm.title || 'Alarm', {
              body: `It's ${formatTime12(alarm.alarm_time)}`,
              requireInteraction: true,
              tag: `alarm-${alarm.id}`,
            });
          } catch (e) {
            console.warn('Notification failed:', e);
          }
        }
      });
    }

    checkAlarms();
    const interval = setInterval(checkAlarms, 5000);
    return () => clearInterval(interval);
  }, []);

  const dismissAlarm = useCallback(() => {
    stopAlarmSound(audioCtxRef, alarmIntervalRef);
    setRingingAlarm(null);
  }, []);

  const toggleDay = useCallback((day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !alarmTime || saving) return;
    setSaving(true);
    await addAlarm(title.trim(), alarmTime, selectedDays);
    setTitle('');
    setAlarmTime('');
    setSelectedDays([]);
    setShowForm(false);
    setSaving(false);
  };

  const handleCancel = () => {
    setTitle('');
    setAlarmTime('');
    setSelectedDays([]);
    setShowForm(false);
  };

  // Test alarm sound manually
  const testSound = useCallback(() => {
    stopAlarmSound(audioCtxRef, alarmIntervalRef);
    playAlarmSound(audioCtxRef, alarmIntervalRef);
  }, []);

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

  return (
    <div style={{ color: '#1e293b', paddingTop: 20, paddingBottom: 80 }}>
      {/* Ringing overlay */}
      {ringingAlarm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
          }}
        >
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(20, 184, 166, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'spin 2s linear infinite',
          }}>
            <Bell size={40} color="#14b8a6" />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            {ringingAlarm.title}
          </h2>
          <p style={{ fontSize: 18, color: '#475569' }}>
            {formatTime12(ringingAlarm.alarm_time)}
          </p>
          <button
            onClick={dismissAlarm}
            style={{
              marginTop: 16,
              padding: '14px 48px',
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: 0.5,
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#1e293b' }}>Alarms</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={testSound}
            title="Test alarm sound"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#ffffff',
              color: '#475569',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            <Volume2 size={16} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#14b8a6',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={18} />
            Add
          </button>
        </div>
      </div>

      {/* Notification permission banner */}
      {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
        <div
          style={{
            marginBottom: 16,
            padding: '10px 14px',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: '#92400e',
          }}
        >
          <BellOff size={16} />
          <span>Enable notifications for browser alerts when alarms ring.</span>
        </div>
      )}

      {/* Add Alarm Form */}
      {showForm && (
        <div
          style={{
            marginBottom: 20,
            padding: 20,
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#1e293b' }}>New Alarm</h2>
            <button
              onClick={handleCancel}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 4, fontWeight: 500 }}>
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Alarm title"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 4, fontWeight: 500 }}>
                Time
              </label>
              <input
                type="time"
                value={alarmTime}
                onChange={(e) => setAlarmTime(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 8, fontWeight: 500 }}>
                Repeat Days
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 20,
                        border: 'none',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#14b8a6' : '#f1f5f9',
                        color: isSelected ? '#fff' : '#475569',
                        transition: 'all 0.2s',
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  backgroundColor: '#14b8a6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: saving ? 'wait' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Adding...' : 'Add Alarm'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  flex: 1,
                  padding: '10px 0',
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

      {/* Alarm List */}
      <div>
        {alarms.length === 0 ? (
          <EmptyState emoji="🔔" title="No alarms yet" subtitle="Add an alarm to get reminders" />
        ) : (
          alarms.map((alarm) => (
            <div
              key={alarm.id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                opacity: alarm.active ? 1 : 0.6,
                transition: 'opacity 0.3s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: '#1e293b' }}>
                    {alarm.title}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 1, marginBottom: 8, color: '#1e293b' }}>
                    {formatTime12(alarm.alarm_time)}
                  </div>
                  {alarm.days && alarm.days.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {alarm.days.map((day) => (
                        <span
                          key={day}
                          style={{
                            padding: '2px 8px',
                            borderRadius: 10,
                            backgroundColor: '#14b8a6',
                            color: '#ffffff',
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 12,
                  }}
                >
                  <div
                    onClick={() => toggleAlarm(alarm.id, alarm.active)}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: alarm.active ? '#14b8a6' : '#cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 2,
                      cursor: 'pointer',
                      transition: 'background-color 0.3s',
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: '#fff',
                        transition: 'transform 0.3s',
                        transform: alarm.active ? 'translateX(20px)' : 'translateX(0)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                      }}
                    />
                  </div>
                  <button
                    onClick={() => deleteAlarm(alarm.id)}
                    onMouseEnter={() => setHoveredDelete(alarm.id)}
                    onMouseLeave={() => setHoveredDelete(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: hoveredDelete === alarm.id ? '#ef4444' : '#64748b',
                      cursor: 'pointer',
                      padding: 4,
                      transition: 'color 0.15s ease',
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
