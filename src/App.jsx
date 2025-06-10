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
import Manager from './pages/Manager'

function AdminDashboard() {
  return <Manager/>
}

function AdminUsers() {
  return <h2>Quản lý người dùng</h2>
}

function AdminSettings() {
  return <h2>Cài đặt Admin</h2>
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const avatarUrl = "https://i.pravatar.cc/40?img=3"
  const location = useLocation()
  const [userRole] = useState(localStorage.getItem("userRole"));

  // Xác định currentPage dựa trên đường dẫn
  let currentPage = "home"
  if (location.pathname.startsWith("/admin")) currentPage = "admin"
  else if (location.pathname === "/about") currentPage = "about"
  else if (location.pathname === "/contact") currentPage = "contact"
  else if (location.pathname === "/blog") currentPage = "blog"
  else if (location.pathname === "/login") currentPage = "login"

  useEffect(() => {
    const loggedIn = userRole !== null
    setIsLoggedIn(loggedIn)
    if (loggedIn) {
      const role = localStorage.getItem("userRole")
      console.log(`User role: ${role}`)
    }
  }, [userRole])
console.log({ currentPage, userRole });
  return (
    <>
      {currentPage === "admin" && String(userRole) === "manager" ? (
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
          <Route path="/login" element={<Login />} />
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Routes>
      </div>
      {currentPage !== "login" && currentPage !== "admin" ? <Footer /> : null}
    </>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App