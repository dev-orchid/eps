import { useState, useRef, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import BottomNav from './components/BottomNav'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import ExamManager from './pages/ExamManager'
import Tasks from './pages/Tasks'
import StudyLog from './pages/StudyLog'
import Progress from './pages/Progress'
import Alarms from './pages/Alarms'
import CurrentAffairs from './pages/CurrentAffairs'
import Profile from './pages/Profile'
import Landing from './pages/Landing'
import UserManagement from './pages/UserManagement'
import RoleManagement from './pages/RoleManagement'
import Plans from './pages/Plans'
import PaymentSettings from './pages/PaymentSettings'
import { LogOut, User } from 'lucide-react'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/admin/dashboard': 'Admin Dashboard',
  '/exams': 'Exams',
  '/tasks': 'Tasks',
  '/study': 'Study Log',
  '/progress': 'Progress',
  '/alarms': 'Alarms',
  '/current-affairs': 'Current Affairs',
  '/profile': 'Profile',
  '/admin/users': 'User Management',
  '/admin/roles': 'Role Management',
  '/admin/payments': 'Payment Settings',
  '/plans': 'Plans',
}

function TopHeader() {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const fullName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User'
  const email = user?.email || ''
  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const pageTitle = pageTitles[location.pathname] || 'ExamPrep'

  const handleSignOut = async () => {
    setDropdownOpen(false)
    await signOut()
    navigate('/signin')
  }

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header style={{
      height: 64,
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
    }}>
      <h1 style={{
        fontSize: 20,
        fontWeight: 700,
        color: '#1e293b',
        margin: 0,
      }}>
        {pageTitle}
      </h1>
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <div
          onClick={() => setDropdownOpen(prev => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            padding: '6px 10px',
            borderRadius: 12,
            border: dropdownOpen ? '1px solid #e2e8f0' : '1px solid transparent',
            background: dropdownOpen ? '#f8fafc' : 'transparent',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (!dropdownOpen) e.currentTarget.style.background = '#f8fafc' }}
          onMouseLeave={e => { if (!dropdownOpen) e.currentTarget.style.background = 'transparent' }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#14b8a6',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <span className="header-user-name" style={{
            fontSize: 14,
            fontWeight: 500,
            color: '#1e293b',
            maxWidth: 120,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {fullName}
          </span>
        </div>

        {dropdownOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 240,
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.04)',
            zIndex: 200,
            overflow: 'hidden',
            animation: 'dropdownFadeIn 0.15s ease-out',
          }}>
            <div style={{
              padding: '14px 16px',
              borderBottom: '1px solid #f1f5f9',
            }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>{fullName}</p>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{email}</p>
              {profile?.role && (
                <span style={{
                  display: 'inline-block',
                  marginTop: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  color: profile.role === 'Admin' ? '#0d9488' : '#64748b',
                  background: profile.role === 'Admin' ? '#e0f7f0' : '#f1f5f9',
                  padding: '2px 8px',
                  borderRadius: 6,
                }}>
                  {profile.role}
                </span>
              )}
            </div>
            <button
              onClick={() => { setDropdownOpen(false); navigate('/profile') }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '11px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                color: '#334155',
                transition: 'background 0.15s',
                textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <User size={16} color="#64748b" />
              Profile
            </button>
            <div style={{ height: 1, background: '#f1f5f9' }} />
            <button
              onClick={handleSignOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '11px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                color: '#ef4444',
                transition: 'background 0.15s',
                textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <LogOut size={16} color="#ef4444" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

function SmartDashboard() {
  const { isAdmin } = useAuth()
  return isAdmin ? <AdminDashboard /> : <Dashboard />
}

function AppLayout() {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f8fafc',
    }}>
      <BottomNav />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 240,
        minHeight: '100vh',
      }}
        className="app-main-area"
      >
        <TopHeader />
        <main style={{
          flex: 1,
          padding: '24px 32px 32px',
          width: '100%',
          overflow: 'auto',
          boxSizing: 'border-box',
        }}>
          <ProtectedRoute />
        </main>
      </div>
      <style>{`
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 767px) {
          .app-main-area {
            margin-left: 0 !important;
            padding-bottom: 72px;
          }
          .header-user-name {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<SmartDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/exams" element={<ExamManager />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/study" element={<StudyLog />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/alarms" element={<Alarms />} />
            <Route path="/current-affairs" element={<CurrentAffairs />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/roles" element={<RoleManagement />} />
            <Route path="/admin/payments" element={<PaymentSettings />} />
            <Route path="/plans" element={<Plans />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
