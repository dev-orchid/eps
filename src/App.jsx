import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
import QuizHome from './pages/QuizHome'
import QuestionBank from './pages/QuestionBank'
import QuizPlay from './pages/QuizPlay'
import QuizResults from './pages/QuizResults'
import TrialBanner from './components/TrialBanner'

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
  '/quiz': 'Quiz',
  '/quiz/play': 'Quiz',
  '/quiz/results': 'Quiz Results',
  '/admin/questions': 'Question Bank',
}

function TopHeader() {
  const location = useLocation()
  const pageTitle = pageTitles[location.pathname] || 'ExamPrep'

  return (
    <header style={{
      height: 64,
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
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
        <TrialBanner />
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
        @media (max-width: 767px) {
          .app-main-area {
            margin-left: 0 !important;
            padding-bottom: 72px;
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
            <Route path="/quiz" element={<QuizHome />} />
            <Route path="/quiz/play" element={<QuizPlay />} />
            <Route path="/quiz/results" element={<QuizResults />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/roles" element={<RoleManagement />} />
            <Route path="/admin/payments" element={<PaymentSettings />} />
            <Route path="/admin/questions" element={<QuestionBank />} />
            <Route path="/plans" element={<Plans />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
