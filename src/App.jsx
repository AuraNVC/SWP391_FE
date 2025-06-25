import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Blog from './pages/Blog'
import BlogDetail from './pages/BlogDetail'
import NurseList from './pages/NurseDashboard'
import Dashborad from './pages/Dashborad'
import ParentNotifications from './pages/ParentNotifications'
import ParentHealthProfile from './pages/ParentHealthProfile'
import StudentList from './pages/StudentDashboard'
import ParentList from './pages/ParentDashboard'
import Notification from './components/Notification'
import { UserRoleProvider, useUserRole } from "./contexts/UserRoleContext";
import { NotificationProvider, useNotification } from "./contexts/NotificationContext";
import MainLayout from "./layouts/MainLayout";
import LoginLayout from "./layouts/LoginLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./contexts/ProtectedRoute";
import BlogList from './pages/BlogDashboard'
import StudentCreate from './pages/StudentCreate'
import Contact from './pages/Contact'
import About from './pages/About'
import ParentPrescriptions from './pages/ParentPrescriptions'
import ParentStudents from './pages/ParentStudents'
import ParentConsultations from './pages/ParentConsultations'
import StudentHealthProfile from './pages/StudentHealthProfile'
import StudentNotifications from './pages/StudentNotifications'
import StudentPrescriptions from './pages/StudentPrescriptions'
import StudentConsultations from './pages/StudentConsultations'
import ActivateAccount from './pages/ActivateAccount'

function AdminDashboard() {
  return <Dashborad/>
}

function AdminNurse() {
  return <NurseList />
}

function AdminStudent() {
  return <StudentList />
}

function AdminParent() {
  return <ParentList />
}

function AdminBlog() {
  return <BlogList />
}

function AddStudent() {
  return <StudentCreate />
}

function AdminForm() {
  return <FormDashboard />
}
function AddForm() {
  return <FormCreate />
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const avatarUrl = "https://i.pravatar.cc/40?img=3"
  const { userRole } = useUserRole();

  // Sử dụng context notification
  const { notif, setNotif } = useNotification();

  useEffect(() => {
    setIsLoggedIn(!!userRole)
  }, [userRole])

  const handleNotifClose = () => setNotif(null);

  return (
    <>
      {/* Notification hiển thị trên mọi trang */}
      {notif && notif.message && (
        <div style={{ position: "fixed", top: 20, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 9999 }}>
          <Notification
            message={notif.message}
            type={notif.type}
            onClose={handleNotifClose}
          />
        </div>
      )}
      <Routes>
        <Route element={<MainLayout isLoggedIn={isLoggedIn} userRole={userRole} avatarUrl={avatarUrl} />}>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
        <Route path="/activate/:code" element={<ActivateAccount />} />

        {/* Parent routes */}
        <Route element={
            <ProtectedRoute requiredRole="parent">
                <MainLayout isLoggedIn={isLoggedIn} userRole={userRole} avatarUrl={avatarUrl} />
            </ProtectedRoute>
        }>
            <Route path="/parent" element={<Navigate to="/parent/students" replace />} />
            <Route path="/parent/students" element={<ParentStudents />} />
            <Route path="/parent/health-profile" element={<ParentHealthProfile />} />
            <Route path="/parent/notifications" element={<ParentNotifications />} />
            <Route path="/parent/consultations" element={<ParentConsultations />} />
            <Route path="/parent/prescriptions" element={<ParentPrescriptions />} />
        </Route>

        <Route element={<LoginLayout />}>
          <Route path="/login" element={
            <Login
              setNotif={setNotif}
            />
          } />
        </Route>
        <Route element={
          <ProtectedRoute roles={["manager"]} setNotif={setNotif}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="/manager/dashboard" element={<AdminDashboard />} />
          <Route path="/manager/student" element={<AdminStudent />} />
          <Route path="/manager/student/create" element={<AddStudent />} />
          <Route path="/manager/parent" element={<AdminParent />} />
          <Route path="/manager/nurse" element={<AdminNurse />} />
          <Route path="/manager/blog" element={<AdminBlog />} />
          <Route path="/manager/form" element={<AdminForm />} />
          <Route path="/manager/form/create" element={<AddForm />} />
        </Route>
        <Route element={
          <ProtectedRoute roles={["student"]}>
            <MainLayout isLoggedIn={isLoggedIn} userRole={userRole} avatarUrl={avatarUrl} />
          </ProtectedRoute>
        }>
          <Route path="/student/health-profile" element={<StudentHealthProfile />} />
          <Route path="/student/notifications" element={<StudentNotifications />} />
          <Route path="/student/prescriptions" element={<StudentPrescriptions />} />
          <Route path="/student/consultations" element={<StudentConsultations />} />
        </Route>
      </Routes>
    </>
  )
}

function App() {
  return (
    <UserRoleProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </UserRoleProvider>
  );
}

export default App