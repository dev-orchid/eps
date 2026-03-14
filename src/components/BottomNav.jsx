import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, GraduationCap, CheckSquare, BookOpen, BarChart3, Bell, Newspaper, Users, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const userTabs = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/exams', label: 'Exams', icon: GraduationCap },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/study', label: 'Study', icon: BookOpen },
  { path: '/progress', label: 'Progress', icon: BarChart3 },
  { path: '/alarms', label: 'Alarms', icon: Bell },
  { path: '/current-affairs', label: 'News', icon: Newspaper },
]

const adminTabs = [
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/roles', label: 'Roles', icon: Shield },
]

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, isAdmin } = useAuth()

  const fullName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User'
  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const roleName = profile?.role || 'Student'

  const tabs = isAdmin ? [...userTabs, ...adminTabs] : userTabs

  return (
    <nav className="sidebar-desktop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      width: 240,
      background: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
    }}>
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <span style={{
          fontSize: 22,
          fontWeight: 800,
          color: '#14b8a6',
          letterSpacing: '-0.5px',
        }}>
          ExamPrep
        </span>
      </div>

      <div style={{
        flex: 1,
        padding: '12px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflowY: 'auto',
      }}>
        {tabs.map(({ path, label, icon: Icon }, i) => {
          const active = location.pathname === path
          const isFirstAdmin = isAdmin && path === '/admin/users'
          return (
            <div key={path}>
              {isFirstAdmin && (
                <div style={{
                  padding: '12px 14px 6px',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                }}>
                  Admin
                </div>
              )}
              <button
                onClick={() => navigate(path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  color: active ? '#0d9488' : '#64748b',
                  background: active ? '#e0f7f0' : 'transparent',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.background = '#f1f5f9'
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.background = 'transparent'
                }}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            </div>
          )
        })}
      </div>

      <div
        onClick={() => navigate('/profile')}
        style={{
          padding: '16px 16px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: '#14b8a6',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <p style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#1e293b',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            margin: 0,
          }}>
            {fullName}
          </p>
          <p style={{
            fontSize: 11,
            fontWeight: 500,
            margin: 0,
            color: isAdmin ? '#0d9488' : '#94a3b8',
          }}>
            {roleName}
          </p>
        </div>
      </div>
    </nav>
  )
}

function MobileBottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  // On mobile show only the main tabs (max 7 for space) + 1 admin shortcut
  const mobileTabs = isAdmin
    ? [...userTabs.slice(0, 5), { path: '/admin/users', label: 'Admin', icon: Users }]
    : userTabs

  return (
    <nav className="mobile-bottom-nav" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '6px 0 env(safe-area-inset-bottom, 6px)',
      zIndex: 100,
    }}>
      {mobileTabs.map(({ path, label, icon: Icon }) => {
        const active = location.pathname === path || (path === '/admin/users' && location.pathname.startsWith('/admin'))
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 8px',
              color: active ? '#14b8a6' : '#94a3b8',
              transition: 'color 0.2s',
            }}
          >
            <Icon size={20} />
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default function BottomNav() {
  return (
    <>
      <Sidebar />
      <MobileBottomNav />
      <style>{`
        @media (min-width: 768px) {
          .mobile-bottom-nav { display: none !important; }
        }
        @media (max-width: 767px) {
          .sidebar-desktop { display: none !important; }
        }
      `}</style>
    </>
  )
}
