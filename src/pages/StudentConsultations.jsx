import React, { useState, useEffect } from "react";
import { useUserRole } from '../contexts/UserRoleContext';

export default function StudentConsultations() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userRole } = useUserRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      setError(null);
      try {
        const studentId = localStorage.getItem('userId');
        if (!studentId) {
          throw new Error('Không tìm thấy ID học sinh. Vui lòng đăng nhập lại.');
        }

        // Fetch consultation forms for the student
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/consultationForm/getByStudent?studentId=${studentId}`);
        if (!response.ok) {
          throw new Error('Không thể tải lịch hẹn tư vấn.');
        }
        const data = await response.json();
        setForms(data);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userRole === 'student') {
      fetchForms();
    } else {
      setLoading(false);
      setError('Truy cập bị từ chối. Cần có vai trò học sinh.');
    }
  }, [userRole]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return "bg-warning text-dark";
      case "Accepted":
        return "bg-success";
      case "Rejected":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const filteredForms = forms
    .filter(form => {
      // Search term filter
      if (!searchTerm) return true;
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return (
        (form.title && form.title.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (form.content && form.content.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (form.consultationSchedule.location && form.consultationSchedule.location.toLowerCase().includes(lowerCaseSearchTerm))
      );
    })
    .sort((a, b) => {
      // Sort
      const dateA = a.consultationSchedule?.consultDate ? new Date(a.consultationSchedule.consultDate) : 0;
      const dateB = b.consultationSchedule?.consultDate ? new Date(b.consultationSchedule.consultDate) : 0;
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
                <h1 className="display-4 mb-3 fw-bold">Lịch Hẹn Tư Vấn</h1>
                <p className="lead text-muted">Thông tin chi tiết về các buổi tư vấn sức khỏe của bạn.</p>
              </div>
              
              <div className="row mb-4 g-3">
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm theo chủ đề, nội dung, địa điểm..."
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

              {filteredForms.length === 0 ? (
                <div className="text-center text-muted">
                  <p>Bạn không có lịch hẹn tư vấn nào.</p>
                </div>
              ) : (
                <div className="list-group">
                  {filteredForms.map((form) => (
                    <div key={form.consultationFormId} className="list-group-item list-group-item-action p-4 mb-3 shadow-sm rounded">
                      <h5 className="mb-3 text-primary fw-bold">{form.title}</h5>
                      <p className="mb-2"><strong>Nội dung:</strong> {form.content}</p>
                      <div className="row">
                        <div className="col-md-6">
                            <p className="mb-2">
                                <strong>Trạng thái:</strong>{' '}
                                <span className={`badge ${getStatusBadge(form.status)}`}>
                                    {form.status === 'Pending' ? 'Chờ xác nhận' :
                                    form.status === 'Accepted' ? 'Đã chấp nhận' :
                                    'Đã từ chối'}
                                </span>
                            </p>
                        </div>
                        {form.consultationSchedule && (
                            <>
                                <div className="col-md-6">
                                    <p className="mb-2"><strong>Ngày tư vấn:</strong> {new Date(form.consultationSchedule.consultDate).toLocaleDateString('vi-VN')} - {new Date(form.consultationSchedule.consultDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <div className="col-md-12">
                                    <p className="mb-0"><strong>Địa điểm:</strong> {form.consultationSchedule.location}</p>
                                </div>
                            </>
                        )}
                      </div>
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