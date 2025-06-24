import React, { useState, useEffect } from "react";
import { useUserRole } from '../contexts/UserRoleContext';

export default function StudentConsultations() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userRole } = useUserRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      setError(null);
      try {
        const studentId = localStorage.getItem('userId');
        if (!studentId) {
          throw new Error('Không tìm thấy ID học sinh. Vui lòng đăng nhập lại.');
        }

        // Fetch schedules for the student
        const scheduleResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/consultationSchedule/getByStudent?studentId=${studentId}`);
        if (!scheduleResponse.ok) {
          throw new Error('Không thể tải lịch hẹn tư vấn.');
        }
        const scheduleData = await scheduleResponse.json();
        setSchedules(scheduleData);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userRole === 'student') {
      fetchSchedules();
    } else {
      setLoading(false);
      setError('Truy cập bị từ chối. Cần có vai trò học sinh.');
    }
  }, [userRole]);

  const filteredSchedules = schedules
    .filter(schedule => {
      // Search term filter
      if (!searchTerm) return true;
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return (
        (schedule.location && schedule.location.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (schedule.consultDate && schedule.consultDate.toString().toLowerCase().includes(lowerCaseSearchTerm))
      );
    })
    .sort((a, b) => {
      // Sort
      const dateA = a.consultDate ? new Date(a.consultDate) : 0;
      const dateB = b.consultDate ? new Date(b.consultDate) : 0;
      if (sortOrder === 'newest') {
        return dateB - dateA;
      }
      return dateA - dateB;
    });

  if (loading) return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="min-vh-100 d-flex flex-column">
      <main className="container-fluid py-5 px-10 flex-grow-1" style={{ marginTop: "80px" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10">
              <div className="text-center mb-5">
                <h1 className="display-4 mb-3 fw-bold">Lịch hẹn tư vấn của bạn</h1>
                <p className="lead text-muted">Thông tin chi tiết về các buổi tư vấn sức khỏe của bạn.</p>
              </div>
              
              <div className="row mb-4 g-3">
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm theo địa điểm, ngày..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <select className="form-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="newest">Sắp xếp: Mới nhất</option>
                    <option value="oldest">Sắp xếp: Cũ nhất</option>
                  </select>
                </div>
              </div>

              {filteredSchedules.length === 0 ? (
                <div className="text-center text-muted">
                  <p>Bạn không có lịch hẹn tư vấn nào.</p>
                </div>
              ) : (
                <div className="list-group">
                  {filteredSchedules.map((schedule) => (
                    <div key={schedule.consultationScheduleId} className="list-group-item list-group-item-action p-4 mb-3 shadow-sm rounded">
                      <h5 className="mb-3 text-primary fw-bold">Lịch hẹn #{schedule.consultationScheduleId}</h5>
                      <p className="mb-2"><strong>Địa điểm:</strong> {schedule.location}</p>
                      <p className="mb-0"><strong>Ngày:</strong> {new Date(schedule.consultDate).toLocaleString('vi-VN')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 