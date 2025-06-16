import React, { useState, useEffect } from "react";
import ParentNavbar from "../components/ParentNavbar";
import ParentFooter from "../components/ParentFooter";

export default function ParentNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Mock data - sau này sẽ thay thế bằng API call
    setNotifications([
      {
        id: 1,
        title: "Lịch khám sức khỏe định kỳ",
        content: "Nhà trường thông báo lịch khám sức khỏe định kỳ cho học sinh vào ngày 15/04/2024.",
        date: "2024-03-20",
        isRead: false
      },
      {
        id: 2,
        title: "Thông báo tiêm chủng",
        content: "Lịch tiêm chủng vắc-xin cúm mùa cho học sinh sẽ được tổ chức vào ngày 20/04/2024.",
        date: "2024-03-19",
        isRead: true
      },
      {
        id: 3,
        title: "Cập nhật hồ sơ sức khỏe",
        content: "Vui lòng cập nhật thông tin sức khỏe của học sinh trong hệ thống.",
        date: "2024-03-18",
        isRead: false
      }
    ]);
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <ParentNavbar />
      <main className="container-fluid py-5 px-10 flex-grow-1" style={{ marginTop: "80px" }}>
        <div className="container">
          <h2 className="text-center fw-bold mb-4">Thông Báo</h2>
          
          <div className="row justify-content-center">
            <div className="col-md-8">
              {notifications.length === 0 ? (
                <div className="text-center text-muted">
                  <p>Không có thông báo nào</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`card mb-3 ${!notification.isRead ? 'border-primary' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="card-title mb-1">{notification.title}</h5>
                        {!notification.isRead && (
                          <span className="badge bg-primary">Mới</span>
                        )}
                      </div>
                      <p className="card-text text-muted">{notification.content}</p>
                      <small className="text-muted">
                        {new Date(notification.date).toLocaleDateString('vi-VN')}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      <ParentFooter />
    </div>
  );
} 