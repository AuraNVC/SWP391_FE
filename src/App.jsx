import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import NavbarManager from './components/NavbarManager'
import Home from './pages/Home'
import Footer from './components/Footer'
import Login from './pages/Login'
import Blog from './pages/Blog'
import BlogDetail from './pages/BlogDetail'
import NurseList from './pages/Nurse'
import Dashborad from './pages/Dashborad'
import StudentList from './pages/Student'
import ParentList from './pages/Parent'
import Notification from './components/Notification'
import { UserRoleProvider, useUserRole } from "./contexts/UserRoleContext";

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

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const avatarUrl = "https://i.pravatar.cc/40?img=3"
  const location = useLocation()
  const { userRole } = useUserRole();

  // Notification state
  const [notif, setNotif] = useState({ message: "", type: "info" });
  const [notifVisible, setNotifVisible] = useState(false);

  const handleNotifClose = () => setNotifVisible(false);

  // Xác định currentPage dựa trên đường dẫn
  let currentPage = "home"
  if (location.pathname.startsWith("/manager")) currentPage = "manager"
  else if (location.pathname === "/about") currentPage = "about"
  else if (location.pathname === "/contact") currentPage = "contact"
  else if (location.pathname === "/blog") currentPage = "blog"
  else if (location.pathname === "/login") currentPage = "login"

  useEffect(() => {
    const loggedIn = userRole !== null
    setIsLoggedIn(loggedIn)
    if (loggedIn) {
      localStorage.getItem("userRole")
    }
  }, [userRole])

  return (
    <>
      {/* Notification hiển thị trên mọi trang */}
      {notifVisible && (
        <div style={{ position: "fixed", top: 20, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 9999 }}>
          <Notification
            message={notif.message}
            type={notif.type}
            onClose={handleNotifClose}
          />
        </div>
      )}
      {currentPage === "manager" && String(userRole) === "manager" ? (
        <NavbarManager />
      ) : currentPage !== "login" ? (
        <Navbar
          isLoggedIn={isLoggedIn}
          avatarUrl={avatarUrl}
          currentPage={currentPage}
        />
      ) : null}
      <div style={currentPage !== "login" ? { paddingTop: 80, marginLeft: currentPage === "admin" && userRole === "admin" ? 220 : 0 } : undefined}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/about" element={<h2>Đây là Trang Giới thiệu</h2>} />
          <Route path="/contact" element={<h2>Đây là Trang Liên hệ</h2>} />
          <Route path="/login" element={
            <Login
              setNotif={setNotif}
              setNotifVisible={setNotifVisible}
            />
          } />
          {/* Admin routes */}
          <Route path="/manager/dashboard" element={<AdminDashboard />} />
          <Route path="/manager/student" element={<AdminStudent />} />
          <Route path="/manager/parent" element={<AdminParent />} />
          <Route path="/manager/nurse" element={<AdminNurse />} />
        </Routes>
      </div>
      {currentPage !== "login" && currentPage !== "manager" ? <Footer /> : null}
    </>
  )
}

function App() {
  return (
    <UserRoleProvider>
      <Router>
        <AppContent />
      </Router>
    </UserRoleProvider>
  );
}

export default App