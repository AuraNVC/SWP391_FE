// Import các thư viện cần thiết
import React, { useState, useEffect } from "react"; // React core và các hooks cơ bản
import { useUserRole } from '../contexts/UserRoleContext'; // Hook để lấy vai trò user
import { API_SERVICE } from '../services/api'; // Service để gọi API
import '../styles/ParentNotifications.css'; // CSS riêng cho component này

// Component chính để hiển thị thông báo cho phụ huynh
export default function ParentNotifications() {
  // ===== CÁC STATE CHÍNH =====
  
  // State lưu danh sách biểu mẫu đồng ý (consent forms)
  const [consentForms, setConsentForms] = useState([]);
  
  // State quản lý trạng thái loading (true = đang tải, false = hoàn thành)
  const [loading, setLoading] = useState(true);
  
  // State lưu thông báo lỗi (null = không có lỗi, string = message lỗi)
  const [error, setError] = useState(null);
  
  // State lưu thông báo thành công (null = không có, string = message thành công)
  const [successMessage, setSuccessMessage] = useState(null);
  
  // State lưu danh sách các form đang được cập nhật (để tránh click nhiều lần)
  const [updatingForms, setUpdatingForms] = useState(new Set());
  
  // Lấy vai trò user hiện tại từ context
  const { userRole } = useUserRole();
  
  // State lưu mapping giữa formId và schedule tương ứng
  const [schedulesMap, setSchedulesMap] = useState({});
  
  // State lưu danh sách học sinh của phụ huynh
  const [students, setStudents] = useState([]);
  
  // State lưu từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  
  // State lưu bộ lọc trạng thái ('all', 'Pending', 'Accepted', 'Rejected')
  const [statusFilter, setStatusFilter] = useState("all");
  
  // State lưu thứ tự sắp xếp ('newest', 'oldest')
  const [sortOrder, setSortOrder] = useState("newest");
  
  // ===== STATE CHO MODAL XÁC NHẬN =====
  
  // State hiển thị modal xác nhận (true = hiện, false = ẩn)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // State lưu thông tin hành động cần xác nhận
  const [confirmAction, setConfirmAction] = useState(null);

  // ===== HÀM CẬP NHẬT TRẠNG THÁI BIỂU MẪU =====
  
  // Hàm async để cập nhật trạng thái đồng ý/từ chối
  const updateConsentFormStatus = async (consentFormId, isAccept) => {
    // Ngăn chặn click nhiều lần - nếu form đang được cập nhật thì thoát
    if (updatingForms.has(consentFormId)) return;
    
    try {
      // Thêm form vào danh sách đang cập nhật
      setUpdatingForms(prev => new Set(prev).add(consentFormId));
      
      // Reset các thông báo cũ
      setError(null);
      setSuccessMessage(null);
      
      // Log thông tin debug
      console.log('Updating consent form:', { consentFormId, isAccept });
      
      // Gọi API tương ứng với hành động
      if (isAccept) {
        // Nếu đồng ý thì gọi API accept
        await API_SERVICE.consentFormAPI.accept(consentFormId);
      } else {
        // Nếu từ chối thì gọi API reject
        await API_SERVICE.consentFormAPI.reject(consentFormId);
      }

      // Tạo thông báo thành công
      const action = isAccept ? 'đồng ý' : 'từ chối';
      setSuccessMessage(`Đã ${action} biểu mẫu thành công!`);

      // Refresh lại danh sách forms từ server
      const parentId = localStorage.getItem('userId');
      const numericParentId = parseInt(parentId);
      console.log('Refreshing list for parent:', numericParentId);
      const updatedData = await API_SERVICE.consentFormAPI.getByParent(numericParentId);
      setConsentForms(updatedData);
      
      // Tự động xóa thông báo thành công sau 3 giây
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err) {
      // Xử lý lỗi
      console.error('Error updating consent form:', err);
      setError('Không thể cập nhật biểu mẫu. Vui lòng thử lại sau.');
    } finally {
      // Luôn xóa form khỏi danh sách đang cập nhật (dù thành công hay thất bại)
      setUpdatingForms(prev => {
        const newSet = new Set(prev);
        newSet.delete(consentFormId);
        return newSet;
      });
    }
  };

  // ===== USEEFFECT ĐỂ FETCH DỮ LIỆU =====
  
  useEffect(() => {
    // Hàm async để fetch tất cả dữ liệu cần thiết
    const fetchAllData = async () => {
      try {
        // Bật trạng thái loading
        setLoading(true);
        
        // Lấy parentId từ localStorage (đã lưu khi đăng nhập)
        const parentId = localStorage.getItem('userId');
        if (!parentId) {
          throw new Error('Parent ID not found. Please login again.');
        }
        
        // Chuyển đổi parentId từ string sang number
        const numericParentId = parseInt(parentId);
        if (isNaN(numericParentId)) {
          throw new Error('Invalid Parent ID. Please login again.');
        }
        
        // ===== BƯỚC 1: FETCH FORMS VÀ STUDENTS =====
        
        // Gọi song song 2 API để lấy forms và students
        const [forms, studentList] = await Promise.all([
          API_SERVICE.consentFormAPI.getByParent(numericParentId),
          API_SERVICE.studentAPI.getByParent(numericParentId)
        ]);
        
        // ===== LOẠI BỎ DUPLICATE FORMS =====
        
        // Loại bỏ các form trùng lặp dựa trên FormId
        const uniqueForms = forms.reduce((acc, current) => {
          const existingForm = acc.find(form => form.form.formId === current.form.formId);
          if (!existingForm) {
            acc.push(current);
          }
          return acc;
        }, []);
        
        // Cập nhật state với forms đã loại bỏ duplicate
        setConsentForms(uniqueForms);
        setStudents(studentList);

        // ===== BƯỚC 2: FETCH SCHEDULES CHO TỪNG FORM =====
        
        // Tạo promises để fetch schedules cho từng form
        const schedulePromises = forms.map(consentForm => {
          const formId = consentForm.form.formId;
          const formType = consentForm.form.type;

          let scheduleUrl = '';
          
          // Tạo URL tương ứng với loại form
          if (formType === 'HealthCheck') {
            // Nếu là khám sức khỏe
            scheduleUrl = `${import.meta.env.VITE_API_BASE_URL}/healthCheckSchedule/getByForm${formId}`;
          } else if (formType === 'Vaccine' || formType === 'Vaccination') {
            // Nếu là tiêm chủng
            scheduleUrl = `${import.meta.env.VITE_API_BASE_URL}/vaccinationSchedule/getByForm${formId}`;
          }

          // Fetch schedule nếu có URL
          if (scheduleUrl) {
            return fetch(scheduleUrl)
              .then(res => (res.ok ? res.json() : []))
              .catch(() => []);
          }
          return Promise.resolve([]);
        });
        
        // Chờ tất cả promises hoàn thành
        const schedulesPerForm = await Promise.all(schedulePromises);
        const allSchedules = schedulesPerForm.flat();

        // ===== BƯỚC 3: TẠO SCHEDULE MAP =====
        
        // Tạo mapping giữa formId và schedule
        const newSchedulesMap = {};
        allSchedules.forEach(schedule => {
          if (schedule && schedule.form && schedule.form.formId && !newSchedulesMap[schedule.form.formId]) {
            newSchedulesMap[schedule.form.formId] = schedule;
          }
        });
        setSchedulesMap(newSchedulesMap);

      } catch (err) {
        // Xử lý lỗi
        console.error('Error details:', err);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        // Tắt trạng thái loading
        setLoading(false);
      }
    };

    // Chỉ fetch data nếu user có vai trò parent
    if (userRole === 'parent') {
      fetchAllData();
    } else {
      // Nếu không phải parent thì hiển thị lỗi access denied
      setLoading(false);
      setError('Access denied. Parent role required.');
    }
  }, [userRole]); // Chạy lại khi userRole thay đổi

  // ===== FILTER VÀ SORT DỮ LIỆU =====
  
  // Lọc và sắp xếp danh sách forms
  const filteredAndSortedForms = consentForms
    .filter(form => {
      // ===== LỌC THEO TRẠNG THÁI =====
      if (statusFilter !== "all" && form.status !== statusFilter) {
        return false; // Loại bỏ form không khớp với filter
      }
      
      // ===== TÌM KIẾM =====
      if (!searchTerm) return true; // Nếu không có từ khóa thì giữ lại tất cả
      
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return (
        // Tìm trong title
        (form.form.title && form.form.title.toLowerCase().includes(lowerCaseSearchTerm)) ||
        // Tìm trong content
        (form.form.content && form.form.content.toLowerCase().includes(lowerCaseSearchTerm))
      );
    })
    .sort((a, b) => {
      // ===== SẮP XẾP THEO NGÀY TẠO =====
      const dateA = a.form.createdAt ? new Date(a.form.createdAt) : 0;
      const dateB = b.form.createdAt ? new Date(b.form.createdAt) : 0;
      
      if (sortOrder === 'newest') {
        return dateB - dateA; // Mới nhất trước
      }
      return dateA - dateB; // Cũ nhất trước
    });

  // ===== HÀM XỬ LÝ XÁC NHẬN =====
  
  // Hàm xử lý khi user click nút đồng ý/từ chối
  const handleStatusChange = (consentFormId, isAccept, currentStatus) => {
    // Chỉ cho phép thay đổi khi status còn Pending
    if (currentStatus !== 'Pending') return;
    
    // Hiển thị modal xác nhận với thông tin hành động
    setConfirmAction({
      consentFormId,
      isAccept,
      actionText: isAccept ? 'đồng ý' : 'từ chối'
    });
    setShowConfirmModal(true);
  };

  // Hàm xử lý khi user xác nhận trong modal
  const handleConfirmAction = () => {
    if (confirmAction) {
      // Gọi hàm cập nhật trạng thái
      updateConsentFormStatus(confirmAction.consentFormId, confirmAction.isAccept);
      // Ẩn modal
      setShowConfirmModal(false);
      // Reset thông tin xác nhận
      setConfirmAction(null);
    }
  };

  // Hàm xử lý khi user hủy trong modal
  const handleCancelAction = () => {
    // Ẩn modal
    setShowConfirmModal(false);
    // Reset thông tin xác nhận
    setConfirmAction(null);
  };

  // ===== RENDER LOADING VÀ ERROR STATES =====
  
  // Hiển thị loading spinner nếu đang tải
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  
  // Hiển thị lỗi nếu có
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  // ===== RENDER UI CHÍNH =====
  
  return (
    <>
      {/* Container chính với flexbox layout */}
      <div className="min-vh-100 d-flex flex-column">
        {/* Main content area */}
        <main className="container-fluid py-5 px-10 flex-grow-1" style={{ marginTop: "80px" }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-8">
                
                {/* ===== HEADER SECTION ===== */}
                <div className="text-center mb-5">
                  <h1 className="display-4 mb-3 fw-bold">Thông báo</h1>
                  <p className="lead text-muted">Thông tin về lịch khám sức khỏe và tiêm chủng của học sinh</p>
                </div>

                {/* ===== CONTROLS SECTION ===== */}
                <div className="row mb-4 g-3">
                  {/* Search input */}
                  <div className="col-md-5">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Tìm kiếm theo tiêu đề, nội dung..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  {/* Status filter dropdown */}
                  <div className="col-md-4">
                    <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                      <option value="all">Tất cả trạng thái</option>
                      <option value="Pending">Chờ xác nhận</option>
                      <option value="Accepted">Đã chấp nhận</option>
                      <option value="Rejected">Đã từ chối</option>
                    </select>
                  </div>
                  
                  {/* Sort order dropdown */}
                  <div className="col-md-3">
                    <select className="form-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                      <option value="newest">Sắp xếp: Mới nhất</option>
                      <option value="oldest">Sắp xếp: Cũ nhất</option>
                    </select>
                  </div>
                </div>
                
                {/* ===== SUCCESS MESSAGE ===== */}
                {successMessage && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {successMessage}
                    <button type="button" className="btn-close" onClick={() => setSuccessMessage(null)}></button>
                  </div>
                )}
                
                {/* ===== CONTENT SECTION ===== */}
                {filteredAndSortedForms.length === 0 ? (
                  // Hiển thị message khi không có forms
                  <div className="text-center text-muted">
                    <p>Không có thông báo nào phù hợp.</p>
                  </div>
                ) : (
                  // Render danh sách forms
                  filteredAndSortedForms.map((form) => {
                    // ===== TÍNH TOÁN CÁC TRẠNG THÁI =====
                    
                    // Kiểm tra form có đang được cập nhật không
                    const isUpdating = updatingForms.has(form.consentFormId);
                    
                    // Lấy schedule tương ứng với form
                    const schedule = schedulesMap[form.form.formId];
                    
                    // Kiểm tra có quá muộn để thay đổi không
                    let isTooLateToChange = false;
                    if (schedule) {
                      // Lấy ngày schedule (format YYYY-MM-DD)
                      const scheduleDate = (schedule.checkDate || schedule.scheduleDate).substring(0, 10);
                      
                      // Tạo ngày hôm nay (format YYYY-MM-DD)
                      const today = new Date();
                      const year = today.getFullYear();
                      const month = (today.getMonth() + 1).toString().padStart(2, '0');
                      const day = today.getDate().toString().padStart(2, '0');
                      const todayString = `${year}-${month}-${day}`;
                      
                      // So sánh ngày
                      if (scheduleDate <= todayString) {
                        isTooLateToChange = true;
                      }
                    }

                    // Tìm học sinh phù hợp với form
                    const matchingStudents = students.filter(student => 
                      form.form.className === 'Tất cả' || student.className === form.form.className
                    );
                    
                    // Kiểm tra status đã final chưa (chỉ cho phép thay đổi khi Pending)
                    const isStatusFinal = form.status !== 'Pending';

                    return (
                      // ===== FORM CARD =====
                      <div key={form.consentFormId} className="card mb-3">
                        <div className="card-body">
                          
                          {/* ===== FORM TITLE ===== */}
                          <h5 className="card-title">{form.form.title}</h5>
                          
                          {/* ===== STUDENTS INFO ===== */}
                          {matchingStudents.length > 0 && (
                            <p className="card-text text-primary fw-bold">
                              <i className="bi bi-person-check-fill me-2"></i>
                              Dành cho học sinh: {matchingStudents.map(s => s.fullName).join(', ')}
                            </p>
                          )}
                          
                          {/* ===== FORM DETAILS ===== */}
                          <p className="card-text">
                            <strong>Lớp:</strong> {form.form.className}
                          </p>
                          
                          {/* ===== STATUS BADGE ===== */}
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
                          
                          {/* ===== FORM CONTENT ===== */}
                          <p className="card-text">
                            <strong>Nội dung:</strong> {form.form.content}
                          </p>
                          
                          {/* ===== SCHEDULE INFORMATION ===== */}
                          {schedule && (schedule.checkDate || schedule.scheduleDate) ? (
                            <>
                              {/* Vaccine name (chỉ hiển thị cho loại Vaccine) */}
                              {form.form.type === 'Vaccine' || form.form.type === 'Vaccination' ? (
                                <p className="card-text">
                                  <strong>Tên vắc xin:</strong> {schedule.name || 'Chưa cập nhật'}
                                </p>
                              ) : null}
                              
                              {/* Schedule date and time */}
                              <p className="card-text">
                                <strong>Thời gian:</strong> {new Date(schedule.checkDate || schedule.scheduleDate).toLocaleDateString('vi-VN')} - {new Date(schedule.checkDate || schedule.scheduleDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              
                              {/* Schedule location */}
                              <p className="card-text">
                                <strong>Địa điểm:</strong> {schedule.location}
                              </p>
                              
                              {/* Schedule note (nếu có) */}
                              {schedule.note && (
                                <p className="card-text">
                                  <strong>Ghi chú:</strong> {schedule.note}
                                </p>
                              )}
                            </>
                          ) : (
                            // Hiển thị message khi chưa có lịch
                            <p className="card-text text-muted">Chưa có lịch liên kết.</p>
                          )}

                          {/* ===== ACTION BUTTONS ===== */}
                          {schedule && (schedule.checkDate || schedule.scheduleDate) ? (
                            <div className="d-flex justify-content-end mt-3">
                              <div className="text-end">
                                {/* Button đồng ý */}
                                <button
                                  className={`btn btn-sm me-2 ${form.status === 'Accepted' ? 'btn-success' : 'btn-outline-success'}`}
                                  onClick={() => handleStatusChange(form.consentFormId, true, form.status)}
                                  disabled={isTooLateToChange || isUpdating || isStatusFinal}
                                >
                                  {isUpdating ? 'Đang xử lý...' : 'Đồng ý'}
                                </button>
                                
                                {/* Button từ chối */}
                                <button
                                  className={`btn btn-sm ${form.status === 'Rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
                                  onClick={() => handleStatusChange(form.consentFormId, false, form.status)}
                                  disabled={isTooLateToChange || isUpdating || isStatusFinal}
                                >
                                  {isUpdating ? 'Đang xử lý...' : 'Từ chối'}
                                </button>
                                
                                {/* Warning message khi quá hạn */}
                                <p className="text-muted fst-italic mt-1 mb-0">
                                  <small>
                                    {isTooLateToChange ? 'Đã hết hạn thay đổi.' : ''}
                                  </small>
                                </p>
                              </div>
                            </div>
                          ) : (
                            // Message khi chưa có lịch
                            <div className="text-end text-muted fst-italic mt-3">
                              <small>Chưa có lịch liên kết, không thể xác nhận.</small>
                            </div>
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

        {/* ===== CUSTOM CONFIRMATION MODAL ===== */}
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
                {/* Button hủy */}
                <button 
                  className="btn btn-secondary me-2" 
                  onClick={handleCancelAction}
                >
                  Hủy
                </button>
                
                {/* Button xác nhận */}
                <button 
                  className={`btn ${confirmAction?.isAccept ? 'btn-success' : 'btn-danger'}`}
                  onClick={handleConfirmAction}
                >
                  {confirmAction?.isAccept ? 'Đồng ý' : 'Từ chối'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 