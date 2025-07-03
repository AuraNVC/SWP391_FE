import { Outlet, useLocation, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
    FaNotesMedical, FaStethoscope, FaSyringe, FaCalendarAlt, FaPills, FaClipboardCheck
} from "react-icons/fa";

export default function NurseLayout() {
    const location = useLocation();
    const current = location.pathname;

    const extraLinks = [
        <Link to="/nurse/medical-events" className={current === "/nurse/medical-events" ? "active" : ""} key="med-events-link">
            <FaNotesMedical /> Sự kiện y tế
        </Link>,
        <Link to="/nurse/health-check-results" className={current === "/nurse/health-check-results" ? "active" : ""} key="health-check-link">
            <FaStethoscope /> Kết quả khám
        </Link>,
        <Link to="/nurse/vaccination-results" className={current === "/nurse/vaccination-results" ? "active" : ""} key="vax-results-link">
            <FaSyringe /> Kết quả tiêm
        </Link>,
        <Link to="/nurse/vaccination-follow-up" className={current === "/nurse/vaccination-follow-up" ? "active" : ""} key="vax-follow-up-link">
            <FaClipboardCheck /> Theo dõi sau tiêm
        </Link>,
        <Link to="/nurse/consultation-schedules" className={current === "/nurse/consultation-schedules" ? "active" : ""} key="consult-schedules-link">
            <FaCalendarAlt /> Lịch tư vấn
        </Link>,
        <Link to="/nurse/medications" className={current === "/nurse/medications" ? "active" : ""} key="medications-link">
            <FaPills /> Xử lý thuốc
        </Link>,
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