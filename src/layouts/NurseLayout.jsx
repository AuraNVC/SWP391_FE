import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
    FaTachometerAlt, FaNotesMedical, FaStethoscope, FaSyringe, FaCalendarAlt, FaPills, FaClipboardCheck
} from "react-icons/fa";

export default function NurseLayout() {
    const location = useLocation();
    const current = location.pathname;

    const extraLinks = [
        <a href="/nurse/dashboard" className={current === "/nurse/dashboard" ? "active" : ""}><FaTachometerAlt /> Dashboard</a>,
        <a href="/nurse/medical-events" className={current === "/nurse/medical-events" ? "active" : ""}><FaNotesMedical /> Sự kiện y tế</a>,
        <a href="/nurse/health-check-results" className={current === "/nurse/health-check-results" ? "active" : ""}><FaStethoscope /> Kết quả khám</a>,
        <a href="/nurse/vaccination-results" className={current === "/nurse/vaccination-results" ? "active" : ""}><FaSyringe /> Kết quả tiêm</a>,
        <a href="/nurse/vaccination-follow-up" className={current === "/nurse/vaccination-follow-up" ? "active" : ""}><FaClipboardCheck /> Theo dõi sau tiêm</a>,
        <a href="/nurse/consultation-schedules" className={current === "/nurse/consultation-schedules" ? "active" : ""}><FaCalendarAlt /> Lịch tư vấn</a>,
        <a href="/nurse/medications" className={current === "/nurse/medications" ? "active" : ""}><FaPills /> Xử lý thuốc</a>,
    ];

    return (
        <>
            <Sidebar extraLinks={extraLinks} />
            <div style={{ paddingTop: 80, marginLeft: 50 }}>
                <Outlet />
            </div>
        </>
    );
} 