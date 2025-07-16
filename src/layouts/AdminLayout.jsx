import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
    FaTachometerAlt, FaUser, FaUsers, FaUserTie, FaWpforms, FaBlog, FaStethoscope, FaSyringe, FaPills
} from "react-icons/fa";

export default function AdminLayout() {
    const location = useLocation();
    const current = location.pathname;

    const extraLinks = [
        <a href="/manager/dashboard" className={current === "/manager/dashboard" ? "active" : ""}><FaTachometerAlt /> Bảng tổng kết</a>,
        <a href="/manager/student" className={current === "/manager/student" ? "active" : ""}><FaUser /> Học sinh</a>,
        <a href="/manager/parent" className={current === "/manager/parent" ? "active" : ""}><FaUsers /> Phụ huynh</a>,
        <a href="/manager/nurse" className={current === "/manager/nurse" ? "active" : ""}><FaUserTie /> Y tá</a>,
        <a href="/manager/blog" className={current === "/manager/blog" ? "active" : ""}><FaBlog /> Bài đăng</a>,
        <a href="/manager/form" className={current === "/manager/form" ? "active" : ""}><FaWpforms /> Biểu mẫu</a>,
        <a href="/manager/health-check-schedule" className={current === "/manager/health-check-schedule" ? "active" : ""}><FaStethoscope /> Lịch khám</a>,
        <a href="/manager/vaccination-schedule" className={current === "/manager/vaccination-schedule" ? "active" : ""}>
            <FaSyringe /> Lịch tiêm
        </a>,
        <a href="/manager/students-list-schedule" className={current === "/manager/students-list-schedule" ? "active" : ""}><FaStethoscope /> Danh sách học sinh</a>,
        <a href="/manager/medical-inventory" className={current === "/manager/medical-inventory" ? "active" : ""}><FaPills /> Vật tư y tế</a>,
    ];

    return (
        <>
            <Sidebar extraLinks={extraLinks} />
            <div style={{ paddingTop: 10, marginLeft: 50 }}>
                <Outlet />
            </div>
        </>
    );
}