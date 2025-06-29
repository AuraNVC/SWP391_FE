import React, { useState, useEffect } from "react";
import { useUserRole } from '../contexts/UserRoleContext';

export default function ParentConsultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [updatingForms, setUpdatingForms] = useState(new Set());
  const { userRole } = useUserRole();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const updateConsultationStatus = async (consultationFormId, isAccept) => {
    if (updatingForms.has(consultationFormId)) return;

    try {
      setUpdatingForms(prev => new Set(prev).add(consultationFormId));
      setError(null);
      setSuccessMessage(null);

      const endpoint = isAccept ? 'accept' : 'reject';
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/consultationForm/${endpoint}/${consultationFormId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Lỗi khi cập nhật trạng thái: ${response.status}`);
      }

      const action = isAccept ? 'chấp nhận' : 'từ chối';
      setSuccessMessage(`Đã ${action} lịch tư vấn thành công!`);

      // Refresh the list after update
      const parentId = localStorage.getItem('userId');
      const numericParentId = parseInt(parentId, 10);
      const updatedResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/consultationForm/getByParent?parentId=${numericParentId}`);
      const updatedData = await updatedResponse.json();
      setConsultations(updatedData);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Không thể cập nhật trạng thái. Vui lòng thử lại sau.');
    } finally {
      setUpdatingForms(prev => {
        const newSet = new Set(prev);
        newSet.delete(consultationFormId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const parentId = localStorage.getItem('userId');
        if (!parentId) {
          setError('Không tìm thấy ID phụ huynh. Vui lòng đăng nhập lại.');
          return;
        }

        // Fetch students for the parent
        const studentResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/student/getParent${parentId}`);
        if (!studentResponse.ok) {
          throw new Error('Không thể tải danh sách học sinh.');
        }
        const studentData = await studentResponse.json();
        setStudents(studentData);

        // Fetch all consultation forms for the parent
        const numericParentId = parseInt(parentId, 10);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/consultationForm/getByParent?parentId=${numericParentId}`);
        if (!response.ok) {
          throw new Error(`Lỗi khi tải dữ liệu: ${response.status}`);
        }
        let consultationData = await response.json();

        // Map student names to consultations
        if (Array.isArray(consultationData) && Array.isArray(studentData) && consultationData.length > 0) {
            const enrichedConsultations = await Promise.all(consultationData.map(async form => {
                if (!form.consultationSchedule?.consultationScheduleId) {
                    return { ...form, studentName: 'Không rõ' };
                }
                // Fetch full schedule details to get studentId
                const scheduleRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/consultationSchedule/${form.consultationSchedule.consultationScheduleId}`);
                if (scheduleRes.ok) {
                    const scheduleData = await scheduleRes.json();
                    const student = studentData.find(s => s.studentId === scheduleData.studentId);
                    return {
                        ...form,
                        consultationSchedule: scheduleData, // Replace placeholder with full data
                        studentName: student ? student.fullName : 'Không rõ'
                    };
                }
                return { ...form, studentName: 'Không rõ' };
            }));
            setConsultations(enrichedConsultations);
        } else {
            setConsultations(consultationData);
        }

      } catch (err) {
        console.error('Error details:', err);
        setError('Không thể tải lịch tư vấn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (userRole === 'parent') {
      fetchAllData();
    } else {
      setLoading(false);
      setError('Truy cập bị từ chối. Cần có vai trò phụ huynh.');
    }
  }, [userRole]);

  const filteredConsultations = consultations
    .filter(form => {
      // Lọc theo trạng thái
      if (statusFilter !== "all" && form.status !== statusFilter) {
        return false;
      }
      // Tìm kiếm
      if (!searchTerm) return true;
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return (
        (form.title && form.title.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (form.content && form.content.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (form.consultationSchedule && form.consultationSchedule.location && form.consultationSchedule.location.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (form.studentName && form.studentName.toLowerCase().includes(lowerCaseSearchTerm))
      );
    })
    .sort((a, b) => {
      // Sắp xếp
      const dateA = a.consultationSchedule ? new Date(a.consultationSchedule.consultDate) : 0;
      const dateB = b.consultationSchedule ? new Date(b.consultationSchedule.consultDate) : 0;
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

              {successMessage && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  {successMessage}
                  <button type="button" className="btn-close" onClick={() => setSuccessMessage(null)}></button>
                </div>
              )}

              {filteredConsultations.length === 0 ? (
                <div className="text-center text-muted">
                  <p>Không có lịch tư vấn nào phù hợp.</p>
                </div>
              ) : (
                <div className="list-group">
                  {filteredConsultations.map((form) => {
                    const isUpdating = updatingForms.has(form.consultationFormId);

                    let isTooLateToChange = false;
                    if (form.consultationSchedule) {
                      const scheduleDate = form.consultationSchedule.consultDate.substring(0, 10); // YYYY-MM-DD
                      
                      const today = new Date();
                      const year = today.getFullYear();
                      const month = (today.getMonth() + 1).toString().padStart(2, '0');
                      const day = today.getDate().toString().padStart(2, '0');
                      const todayString = `${year}-${month}-${day}`;
                      
                      if (scheduleDate <= todayString) {
                        isTooLateToChange = true;
                      }
                    }

                    return (
                      <div key={form.consultationFormId} className="list-group-item list-group-item-action p-4 mb-3 shadow-sm rounded">
                        <h5 className="mb-3 text-primary fw-bold">{form.title}</h5>
                        {form.studentName && <p className="mb-2"><strong>Học sinh:</strong> {form.studentName}</p>}
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
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div className="d-flex gap-2">
                              <button
                                  className={`btn btn-sm ${form.status === 'Accepted' ? 'btn-success' : 'btn-outline-success'}`}
                                  onClick={() => updateConsultationStatus(form.consultationFormId, true)}
                                  disabled={isTooLateToChange || isUpdating}
                              >
                                  {isUpdating ? 'Đang xử lý...' : 'Chấp nhận'}
                              </button>
                              <button
                                  className={`btn btn-sm ${form.status === 'Rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
                                  onClick={() => updateConsultationStatus(form.consultationFormId, false)}
                                  disabled={isTooLateToChange || isUpdating}
                              >
                                  {isUpdating ? 'Đang xử lý...' : 'Từ chối'}
                              </button>
                          </div>
                          <p className="text-muted fst-italic mb-0">
                            <small>
                              {isTooLateToChange ? 'Đã hết hạn thay đổi.' : 'Có thể thay đổi đến trước ngày diễn ra.'}
                            </small>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 