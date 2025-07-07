import React, { useState, useEffect } from "react";
import { useUserRole } from '../contexts/UserRoleContext';
import { API_SERVICE } from '../services/api';
import '../styles/ParentNotifications.css';

export default function ParentNotifications() {
  const [consentForms, setConsentForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [updatingForms, setUpdatingForms] = useState(new Set());
  const { userRole } = useUserRole();
  const [schedulesMap, setSchedulesMap] = useState({});
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  
  // Thêm state cho confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const updateConsentFormStatus = async (consentFormId, isAccept) => {
    // Prevent multiple clicks
    if (updatingForms.has(consentFormId)) return;
    
    try {
      setUpdatingForms(prev => new Set(prev).add(consentFormId));
      setError(null);
      setSuccessMessage(null);
      
      console.log('Updating consent form:', { consentFormId, isAccept });
      if (isAccept) {
        await API_SERVICE.consentFormAPI.accept(consentFormId);
      } else {
        await API_SERVICE.consentFormAPI.reject(consentFormId);
      }

      // Show success message
      const action = isAccept ? 'đồng ý' : 'từ chối';
      setSuccessMessage(`Đã ${action} biểu mẫu thành công!`);

      // Refresh the consent forms list
      const parentId = localStorage.getItem('userId');
      const numericParentId = parseInt(parentId);
      console.log('Refreshing list for parent:', numericParentId);
      const updatedData = await API_SERVICE.consentFormAPI.getByParent(numericParentId);
      setConsentForms(updatedData);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating consent form:', err);
      setError('Không thể cập nhật biểu mẫu. Vui lòng thử lại sau.');
    } finally {
      setUpdatingForms(prev => {
        const newSet = new Set(prev);
        newSet.delete(consentFormId);
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
          throw new Error('Parent ID not found. Please login again.');
        }
        const numericParentId = parseInt(parentId);
        if (isNaN(numericParentId)) {
          throw new Error('Invalid Parent ID. Please login again.');
        }
        
        // Step 1: Fetch consent forms and students
        const [forms, studentList] = await Promise.all([
          API_SERVICE.consentFormAPI.getByParent(numericParentId),
          API_SERVICE.parentAPI.getParent(numericParentId)
        ]);
        setConsentForms(forms);
        setStudents(studentList);

        // Step 2: Based on forms, fetch their specific schedules
        const schedulePromises = forms.map(consentForm => {
          const formId = consentForm.form.formId;
          const formType = consentForm.form.type;

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

        // Step 3: Create the schedule map
        const newSchedulesMap = {};
        allSchedules.forEach(schedule => {
          if (schedule && schedule.form && schedule.form.formId && !newSchedulesMap[schedule.form.formId]) {
            newSchedulesMap[schedule.form.formId] = schedule;
          }
        });
        setSchedulesMap(newSchedulesMap);

      } catch (err) {
        console.error('Error details:', err);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (userRole === 'parent') {
      fetchAllData();
    } else {
      setLoading(false);
      setError('Access denied. Parent role required.');
    }
  }, [userRole]);

  const filteredAndSortedForms = consentForms
    .filter(form => {
      // Lọc theo trạng thái
      if (statusFilter !== "all" && form.status !== statusFilter) {
        return false;
      }
      // Tìm kiếm
      if (!searchTerm) return true;
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return (
        (form.form.title && form.form.title.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (form.form.content && form.form.content.toLowerCase().includes(lowerCaseSearchTerm))
      );
    })
    .sort((a, b) => {
      // Sắp xếp theo ngày tạo form
      const dateA = a.form.createdAt ? new Date(a.form.createdAt) : 0;
      const dateB = b.form.createdAt ? new Date(b.form.createdAt) : 0;
      if (sortOrder === 'newest') {
        return dateB - dateA;
      }
      return dateA - dateB;
    });

  // Thêm hàm xử lý xác nhận trước khi đổi trạng thái
  const handleStatusChange = (consentFormId, isAccept, currentStatus) => {
    // Chỉ cho phép đổi khi còn Pending
    if (currentStatus !== 'Pending') return;
    
    // Hiển thị custom confirmation modal
    setConfirmAction({
      consentFormId,
      isAccept,
      actionText: isAccept ? 'đồng ý' : 'từ chối'
    });
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    if (confirmAction) {
      updateConsentFormStatus(confirmAction.consentFormId, confirmAction.isAccept);
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };

  const handleCancelAction = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <>
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
                
                {/* Success Message */}
                {successMessage && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {successMessage}
                    <button type="button" className="btn-close" onClick={() => setSuccessMessage(null)}></button>
                  </div>
                )}
                
                {filteredAndSortedForms.length === 0 ? (
                  <div className="text-center text-muted">
                    <p>Không có thông báo nào phù hợp.</p>
                  </div>
                ) : (
                  filteredAndSortedForms.map((form) => {
                    const isUpdating = updatingForms.has(form.consentFormId);
                    const schedule = schedulesMap[form.form.formId];
                    
                    let isTooLateToChange = false;
                    if (schedule) {
                      const scheduleDate = (schedule.checkDate || schedule.scheduleDate).substring(0, 10); // YYYY-MM-DD
                      
                      const today = new Date();
                      const year = today.getFullYear();
                      const month = (today.getMonth() + 1).toString().padStart(2, '0');
                      const day = today.getDate().toString().padStart(2, '0');
                      const todayString = `${year}-${month}-${day}`;
                      
                      if (scheduleDate <= todayString) {
                        isTooLateToChange = true;
                      }
                    }

                    // Find matching students
                    const matchingStudents = students.filter(student => 
                      form.form.className === 'Tất cả' || student.className === form.form.className
                    );
                    
                    // Chỉ cho phép đổi khi còn Pending
                    const isStatusFinal = form.status !== 'Pending';

                    return (
                      <div key={form.consentFormId} className="card mb-3">
                        <div className="card-body">
                          <h5 className="card-title">{form.form.title}</h5>
                          {matchingStudents.length > 0 && (
                            <p className="card-text text-primary fw-bold">
                              <i className="bi bi-person-check-fill me-2"></i>
                              Dành cho học sinh: {matchingStudents.map(s => s.fullName).join(', ')}
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
                              {form.form.type === 'Vaccine' || form.form.type === 'Vaccination' ? (
                                <p className="card-text">
                                  <strong>Tên vắc xin:</strong> {schedule.name || 'Chưa cập nhật'}
                                </p>
                              ) : null}
                              <p className="card-text">
                                <strong>Thời gian:</strong> {new Date(schedule.checkDate || schedule.scheduleDate).toLocaleDateString('vi-VN')} - {new Date(schedule.checkDate || schedule.scheduleDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="card-text">
                                <strong>Địa điểm:</strong> {schedule.location}
                              </p>
                            </>
                          )}

                          {/* Action buttons */}
                          <div className="d-flex justify-content-end mt-3">
                            <div className="text-end">
                              <button
                                className={`btn btn-sm me-2 ${form.status === 'Accepted' ? 'btn-success' : 'btn-outline-success'}`}
                                onClick={() => handleStatusChange(form.consentFormId, true, form.status)}
                                disabled={isTooLateToChange || isUpdating || isStatusFinal}
                              >
                                {isUpdating ? 'Đang xử lý...' : 'Đồng ý'}
                              </button>
                              <button
                                className={`btn btn-sm ${form.status === 'Rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
                                onClick={() => handleStatusChange(form.consentFormId, false, form.status)}
                                disabled={isTooLateToChange || isUpdating || isStatusFinal}
                              >
                                {isUpdating ? 'Đang xử lý...' : 'Từ chối'}
                              </button>
                              <p className="text-muted fst-italic mt-1 mb-0">
                                <small>
                                  {isTooLateToChange ? 'Đã hết hạn thay đổi.' : ''}
                                </small>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Custom Confirmation Modal */}
        {showConfirmModal && (
          <div className="confirm-modal-overlay">
            <div className="confirm-modal-content">
              <div className="confirm-modal-header">
                <h5 className="confirm-modal-title">Xác nhận hành động</h5>
              </div>
              <div className="confirm-modal-body">
                <p>
                  Bạn có chắc chắn muốn {confirmAction?.actionText} biểu mẫu này?
                </p>
                <p className="text-muted">
                  <small>Sau khi xác nhận sẽ không thể thay đổi lại.</small>
                </p>
              </div>
              <div className="confirm-modal-footer">
                <button 
                  className="btn btn-secondary me-2" 
                  onClick={handleCancelAction}
                >
                  Hủy
                </button>
                <button 
                  className={`btn ${confirmAction?.isAccept ? 'btn-success' : 'btn-danger'}`}
                  onClick={handleConfirmAction}
                >
                  {confirmAction?.actionText}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 