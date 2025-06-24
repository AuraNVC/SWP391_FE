import React, { useState, useEffect } from "react";
import { useUserRole } from '../contexts/UserRoleContext';

export default function StudentConsultations() {
  const [consultations, setConsultations] = useState([]);
  const [loadingConsult, setLoadingConsult] = useState(true);
  const [errorConsult, setErrorConsult] = useState(null);
  const { userRole } = useUserRole();
  const [parentId, setParentId] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    const fetchParentId = async () => {
      const sid = localStorage.getItem('userId');
      setStudentId(sid);
      if (!sid) return;
      const resStudent = await fetch(`${import.meta.env.VITE_API_BASE_URL}/student/${sid}`);
      if (!resStudent.ok) return;
      const studentData = await resStudent.json();
      const pid = studentData.parent?.parentId || studentData.parentId;
      setParentId(pid);
    };
    if (userRole === 'student') {
      fetchParentId();
    }
  }, [userRole]);

  useEffect(() => {
    const fetchConsultations = async () => {
      if (!parentId) return;
      setLoadingConsult(true);
      setErrorConsult(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/consultationForm/getByParent?parentId=${parentId}`);
        if (!response.ok) throw new Error('Không thể lấy lịch hẹn tư vấn');
        const data = await response.json();
        setConsultations(data);
      } catch (err) {
        setErrorConsult(err.message);
      } finally {
        setLoadingConsult(false);
      }
    };
    if (parentId) {
      fetchConsultations();
    }
  }, [parentId]);

  // Lọc, tìm kiếm, sắp xếp lịch hẹn tư vấn
  const filteredConsultations = consultations
    .filter(form => {
      if (statusFilter !== "all" && form.status !== statusFilter) {
        return false;
      }
      if (!searchTerm) return true;
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return (
        (form.title && form.title.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (form.content && form.content.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (form.consultationSchedule && form.consultationSchedule.location && form.consultationSchedule.location.toLowerCase().includes(lowerCaseSearchTerm))
      );
    })
    .sort((a, b) => {
      const dateA = a.consultationSchedule ? new Date(a.consultationSchedule.consultDate) : 0;
      const dateB = b.consultationSchedule ? new Date(b.consultationSchedule.consultDate) : 0;
      if (sortOrder === 'newest') {
        return dateB - dateA;
      }
      return dateA - dateB;
    });

  return (
    <div className="min-vh-100 d-flex flex-column">
      <main className="container-fluid py-5 px-10 flex-grow-1" style={{ marginTop: "80px" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10">
              <div className="text-center mb-5">
                <h1 className="display-4 mb-3 fw-bold">Lịch Tư Vấn</h1>
                <p className="lead text-muted">Thông tin chi tiết về các buổi tư vấn sức khỏe</p>
              </div>
              <div className="row mb-4 g-3">
                <div className="col-md-5">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm theo tiêu đề, nội dung, địa điểm..."
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
              {loadingConsult ? (
                <div>Đang tải lịch hẹn...</div>
              ) : errorConsult ? (
                <div className="text-danger">{errorConsult}</div>
              ) : filteredConsultations.length === 0 ? (
                <div className="text-center text-muted">
                  <p>Không có lịch tư vấn nào phù hợp.</p>
                </div>
              ) : (
                <div className="list-group">
                  {filteredConsultations.map((form) => (
                    <div key={form.consultationFormId} className="list-group-item list-group-item-action p-4 mb-3 shadow-sm rounded">
                      <h5 className="mb-3 text-primary fw-bold">{form.title}</h5>
                      <p className="mb-2"><strong>Nội dung:</strong> {form.content}</p>
                      <div className="row">
                        <div className="col-md-6">
                          <p className="mb-2">
                            <strong>Trạng thái:</strong>{' '}
                            <span className={`badge ${
                              form.status === 'Pending' ? 'bg-warning' :
                              form.status === 'Accepted' ? 'bg-success' :
                              'bg-danger'
                            }`}>
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