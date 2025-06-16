import React, { useState, useEffect } from "react";
import ParentNavbar from "../components/ParentNavbar";
import ParentFooter from "../components/ParentFooter";
import { useUserRole } from '../contexts/UserRoleContext';

export default function ParentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [consentForms, setConsentForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userRole } = useUserRole();

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

    const fetchConsentForms = async () => {
      try {
        // Get parent ID from localStorage
        const parentId = localStorage.getItem('userId');
        console.log('All localStorage items:', Object.entries(localStorage)); // Debug log
        console.log('Parent ID from localStorage:', parentId); // Debug log
        console.log('Parent ID type:', typeof parentId); // Debug log
        
        if (!parentId) {
          setError('Parent ID not found. Please login again.');
          setLoading(false);
          return;
        }

        const numericParentId = parseInt(parentId);
        if (isNaN(numericParentId)) {
          setError('Invalid Parent ID. Please login again.');
          setLoading(false);
          return;
        }

        // Remove duplicate 'api' in the URL
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/consentForm/getConsentFormByParent?parentId=${numericParentId}`);
        console.log('API URL:', `${import.meta.env.VITE_API_BASE_URL}/consentForm/getConsentFormByParent?parentId=${numericParentId}`); // Debug log
        
        if (!response.ok) {
          throw new Error(`Failed to fetch consent forms: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data); // Debug log
        setConsentForms(data);
        setLoading(false);
      } catch (err) {
        console.error('Error details:', err); // Debug log
        setError('Failed to fetch consent forms. Please try again later.');
        setLoading(false);
      }
    };

    if (userRole === 'parent') {
      fetchConsentForms();
    } else {
      setLoading(false);
      setError('Access denied. Parent role required.');
    }
  }, [userRole]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

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