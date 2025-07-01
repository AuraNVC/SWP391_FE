import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
    FaTachometerAlt, FaUser, FaUsers, FaUserTie, FaWpforms, FaBlog, FaStethoscope, FaSyringe
} from "react-icons/fa";

export default function AdminLayout() {
    const location = useLocation();
    const current = location.pathname;

    const extraLinks = [
        <a href="/manager/dashboard" className={current === "/manager/dashboard" ? "active" : ""}><FaTachometerAlt /> Dashboard</a>,
        <a href="/manager/student" className={current === "/manager/student" ? "active" : ""}><FaUser /> Student</a>,
        <a href="/manager/parent" className={current === "/manager/parent" ? "active" : ""}><FaUsers /> Parent</a>,
        <a href="/manager/nurse" className={current === "/manager/nurse" ? "active" : ""}><FaUserTie /> Nurse</a>,
        <a href="/manager/blog" className={current === "/manager/blog" ? "active" : ""}><FaBlog /> Blog</a>,
        <a href="/manager/form" className={current === "/manager/form" ? "active" : ""}><FaWpforms  /> Form</a>,
        <a href="/manager/health-check-schedule" className={current === "/manager/health-check-schedule" ? "active" : ""}><FaStethoscope /> Health Checkup</a>,
        <a href="/manager/vaccination-schedule" className={current === "/manager/vaccination-schedule" ? "active" : ""}>
            <FaSyringe /> Vaccination Schedule
        </a>,
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