import React, { useState, useEffect } from "react";
import { useUserRole } from '../contexts/UserRoleContext';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userRole } = useUserRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [student, setStudent] = useState(null);
  const [schedulesMap, setSchedulesMap] = useState({});

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const studentId = localStorage.getItem('userId');
        if (!studentId) {
          throw new Error('Student ID not found. Please login again.');
        }
        // Lấy thông tin học sinh để lấy parentId
        const studentRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/student/${studentId}`);
        if (!studentRes.ok) throw new Error('Không thể lấy thông tin học sinh');
        const studentData = await studentRes.json();
        setStudent(studentData);
        // Lấy parentId từ studentData.parent.parentId
        let parentIds = [];
        if (studentData.parent && studentData.parent.parentId) {
          parentIds = [studentData.parent.parentId];
        }
        if (parentIds.length === 0) throw new Error('Không tìm thấy phụ huynh của học sinh này.');
        // Lấy tất cả consent form của các phụ huynh
        let allForms = [];
        for (const pid of parentIds) {
          const notificationsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/consentForm/getConsentFormByParent?parentId=${pid}`);
          if (notificationsResponse.ok) {
            const forms = await notificationsResponse.json();
            allForms = allForms.concat(forms);
          }
        }
        setNotifications(allForms);
        // Lấy schedules cho các form
        const schedulePromises = allForms.map(form => {
          const formId = form.form.formId;
          const formType = form.form.type;
          let scheduleUrl = '';
          if (formType === 'HealthCheck') {
            scheduleUrl = `${import.meta.env.VITE_API_BASE_URL}/healthCheckSchedule/getByForm${formId}`;
          } else if (formType === 'Vaccine' || formType === 'Vaccination') {
            scheduleUrl = `${import.meta.env.VITE_API_BASE_URL}/vaccinationSchedule/getByForm${formId}`;
          }
          if (scheduleUrl) {
            return fetch(scheduleUrl)
              .then(res => (res.ok ? res.json() : []))
              .catch(() => []);
          }
          return Promise.resolve([]);
        });
        const schedulesPerForm = await Promise.all(schedulePromises);
        const allSchedules = schedulesPerForm.flat();
        const newSchedulesMap = {};
        allSchedules.forEach(schedule => {
          if (schedule && schedule.form && schedule.form.formId && !newSchedulesMap[schedule.form.formId]) {
            newSchedulesMap[schedule.form.formId] = schedule;
          }
        });
        setSchedulesMap(newSchedulesMap);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    if (userRole === 'student') {
      fetchAllData();
    } else {
      setLoading(false);
      setError('Access denied. Student role required.');
    }
  }, [userRole]);

  const filteredAndSortedForms = notifications
    .filter(form => {
      if (statusFilter !== "all" && form.status !== statusFilter) {
        return false;
      }
      if (!searchTerm) return true;
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return (
        (form.form.title && form.form.title.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (form.form.content && form.form.content.toLowerCase().includes(lowerCaseSearchTerm))
      );
    })
    .sort((a, b) => {
      const dateA = a.form.createdAt ? new Date(a.form.createdAt) : 0;
      const dateB = b.form.createdAt ? new Date(b.form.createdAt) : 0;
      if (sortOrder === 'newest') {
        return dateB - dateA;
      }
      return dateA - dateB;
    });

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="min-vh-100 d-flex flex-column">
      <main className="container-fluid py-5 px-10 flex-grow-1" style={{ marginTop: "80px" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="text-center mb-5">
                <h1 className="display-4 mb-3 fw-bold">Thông báo</h1>
                <p className="lead text-muted">Thông tin về lịch khám sức khỏe và tiêm chủng của học sinh</p>
              </div>
              <div className="row mb-4 g-3">
                <div className="col-md-5">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm theo tiêu đề, nội dung..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">Tất cả trạng thái</option>
                    <option value="Pending">Chờ xác nhận</option>
                    <option value="Accepted">Đã chấp nhận</option>
                    <option value="Rejected">Đã từ chối</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <select className="form-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="newest">Sắp xếp: Mới nhất</option>
                    <option value="oldest">Sắp xếp: Cũ nhất</option>
                  </select>
                </div>
              </div>
              {filteredAndSortedForms.length === 0 ? (
                <div className="text-center text-muted">
                  <p>Không có thông báo nào phù hợp.</p>
                </div>
              ) : (
                filteredAndSortedForms.map((form) => {
                  const schedule = schedulesMap[form.form.formId];
                  return (
                    <div key={form.consentFormId} className="card mb-3">
                      <div className="card-body">
                        <h5 className="card-title">{form.form.title}</h5>
                        {student && (
                          <p className="card-text text-primary fw-bold">
                            <i className="bi bi-person-check-fill me-2"></i>
                            Dành cho học sinh: {student.fullName}
                          </p>
                        )}
                        <p className="card-text">
                          <strong>Lớp:</strong> {form.form.className}
                        </p>
                        <p className="card-text">
                          <strong>Trạng thái:</strong>{' '}
                          <span className={`badge ${
                            form.status === 'Pending' ? 'bg-warning' :
                            form.status === 'Accepted' ? 'bg-success' :
                            'bg-danger'
                          }`}>
                            {form.status === 'Pending' ? 'Chờ xác nhận' :
                             form.status === 'Accepted' ? 'Đã đồng ý' :
                             'Đã từ chối'}
                          </span>
                        </p>
                        <p className="card-text">
                          <strong>Nội dung:</strong> {form.form.content}
                        </p>
                        {schedule && (
                          <>
                            {(form.form.type === 'Vaccine' || form.form.type === 'Vaccination') && (
                              <p className="card-text">
                                <strong>Tên vắc xin:</strong> {schedule.name || 'Chưa cập nhật'}
                              </p>
                            )}
                            <p className="card-text">
                              <strong>Thời gian:</strong> {new Date(schedule.checkDate || schedule.scheduleDate).toLocaleDateString('vi-VN')} - {new Date(schedule.checkDate || schedule.scheduleDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="card-text">
                              <strong>Địa điểm:</strong> {schedule.location}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 