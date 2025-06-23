import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet, Link, useLocation } from "react-router-dom";

export default function MainLayout(props) {
  const location = useLocation();
  const currentPage = props.currentPage || (
    location.pathname === "/" ? "home"
      : location.pathname === "/blog" ? "blog"
        : location.pathname === "/about" ? "about"
          : location.pathname === "/contact" ? "contact"
            : ""
  );

  const extraLinks = [
    <Link
      key="home"
      className={`nav-link${currentPage === "home" ? " text-body-tertiary fw-bold" : " text-white"}`}
      to="/"
    >Trang chủ</Link>,
    <Link
      key="blog"
      className={`nav-link${currentPage === "blog" ? " text-body-tertiary fw-bold" : " text-white"}`}
      to="/blog"
    >Blog</Link>,
    <Link
      key="contact"
      className={`nav-link${currentPage === "contact" ? " text-body-tertiary fw-bold" : " text-white"}`}
      to="/contact"
    >Liên hệ</Link>,
    <Link
      key="about"
      className={`nav-link${currentPage === "about" ? " text-body-tertiary fw-bold" : " text-white"}`}
      to="/about"
    >Giới thiệu</Link>,
  ];

  const extraLinksParent = [
    <Link
      key="home"
      className={`nav-link${currentPage === "home" ? " text-body-tertiary fw-bold" : " text-white"}`}
      to="/"
    >Trang chủ</Link>,
    <Link
      key="blog"
      className={`nav-link${currentPage === "blog" ? " text-body-tertiary fw-bold" : " text-white"}`}
      to="/blog"
    >Blog</Link>,
    <Link
      key="contact"
      className={`nav-link${currentPage === "contact" ? " text-body-tertiary fw-bold" : " text-white"}`}
      to="/contact"
    >Liên hệ</Link>,
    <Link
      key="about"
      className={`nav-link${currentPage === "about" ? " text-body-tertiary fw-bold" : " text-white"}`}
      to="/about"
    >Giới thiệu</Link>,
    <Link
      key="notifications"
      className={`nav-link${currentPage === "notifications" ? " text-body-tertiary fw-bold" : " text-white"}`}
      to="/parent/notifications"
    >Thông báo</Link>,
    <Link
      key="health-profile"
      className={`nav-link${currentPage === "health-profile" ? " text-body-tertiary fw-bold" : " text-white"}`}
      to="/parent/health-profile"
    >Hồ sơ</Link>,
    <Link
      key="consultations"
      className={`nav-link${currentPage === "consultations" ? " text-body-tertiary fw-bold" : " text-white"}`}
      to="/parent/consultations"
    >Lịch tư vấn</Link>,
    <Link
      key="prescriptions"
      className={`nav-link${currentPage === "prescriptions" ? " text-body-tertiary fw-bold" : " text-white"}`}
      to="/parent/prescriptions"
    >Đơn thuốc</Link>,
  ];

  const extraLinksStudent = [
    <Link
      key="home"
      className={`nav-link${currentPage === "home" ? " text-body-tertiary fw-bold" : " text-white"}`}
      to="/"
    >Trang chủ</Link>,
    <Link
      key="blog"
      className={`nav-link${currentPage === "blog" ? " text-body-tertiary fw-bold" : " text-white"}`}
      to="/blog"
    >Blog</Link>,
    <Link
      key="contact"
      className={`nav-link${currentPage === "contact" ? " text-body-tertiary fw-bold" : " text-white"}`}
      to="/contact"
    >Liên hệ</Link>,
    <Link
      key="about"
      className={`nav-link${currentPage === "about" ? " text-body-tertiary fw-bold" : " text-white"}`}
      to="/about"
    >Giới thiệu</Link>,
    <Link
      key="student-health-profile"
      className={`nav-link${currentPage === "student-health-profile" ? " text-body-tertiary fw-bold" : " text-white"}`}
      to="/student/health-profile"
    >Hồ sơ sức khỏe</Link>,
  ];

  const role = props.userRole;

  return (
    <>
      <Navbar {...props} extraLinks={role === 'parent' ? extraLinksParent : role === 'student' ? extraLinksStudent : extraLinks} currentPage={currentPage} />
      <div style={{ paddingTop: 80 }}>
        <Outlet />
      </div>
      <Footer />
    </>
  );
}