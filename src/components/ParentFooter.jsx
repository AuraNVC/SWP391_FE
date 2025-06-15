import React from "react";
import { Link } from "react-router-dom";
import logoSchoolCare from "../assets/logoSchoolCare.png";

export default function ParentFooter() {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3">
            <img src={logoSchoolCare} alt="SchoolCare Logo" height="40" className="mb-3" />
            <p className="text-muted">
              Hệ thống quản lý y tế học đường thông minh, giúp phụ huynh theo dõi sức khỏe của con em mình.
            </p>
          </div>
          <div className="col-md-4 mb-3">
            <h5 className="mb-3">Liên kết nhanh</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/parent" className="text-muted text-decoration-none">
                  Trang chủ
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/parent/blog" className="text-muted text-decoration-none">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-md-4 mb-3">
            <h5 className="mb-3">Liên hệ</h5>
            <ul className="list-unstyled text-muted">
              <li className="mb-2">
                <i className="bi bi-geo-alt me-2"></i>
                123 Đường ABC, Quận XYZ, TP.HCM
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone me-2"></i>
                (028) 1234 5678
              </li>
              <li className="mb-2">
                <i className="bi bi-envelope me-2"></i>
                info@schoolcare.com
              </li>
            </ul>
          </div>
        </div>
        <hr className="my-4" />
        <div className="text-center text-muted">
          <small>&copy; 2024 SchoolCare. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
} 