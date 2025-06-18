import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Blog from './pages/Blog'
import BlogDetail from './pages/BlogDetail'
import NurseList from './pages/NurseDashboard'
import Dashborad from './pages/Dashborad'
import ParentHome from './pages/ParentHome'
import ParentBlog from './pages/ParentBlog'
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
        <Route element={<MainLayout isLoggedIn={isLoggedIn} avatarUrl={avatarUrl} />}>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/about" element={<h2>Đây là Trang Giới thiệu</h2>} />
          <Route path="/contact" element={<h2>Đây là Trang Liên hệ</h2>} />
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
          {/* Parent routes */}
          <Route path="/parent" element={<ParentHome />} />
          <Route path="/parent/blog" element={<ParentBlog />} />
          <Route path="/parent/notifications" element={<ParentNotifications />} />
          <Route path="/parent/health-profile" element={<ParentHealthProfile />} />
        </Routes>
      </div>
      {currentPage !== "login" && currentPage !== "manager" && currentPage !== "parent" ? <Footer /> : null}
          <Route path="/manager/blog" element={<AdminBlog />} />
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