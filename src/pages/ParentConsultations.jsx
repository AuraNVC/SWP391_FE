// Import các thư viện cần thiết
import React, { useState, useEffect } from "react"; // React core và các hooks cơ bản
import { useUserRole } from '../contexts/UserRoleContext'; // Hook để lấy vai trò user
import { API_SERVICE } from '../services/api'; // Service để gọi API
import { useNotification } from '../contexts/NotificationContext'; // Context để hiển thị thông báo
import '../styles/ParentNotifications.css'; // CSS riêng cho component này

// Component chính để hiển thị và quản lý lịch tư vấn cho phụ huynh
export default function ParentConsultations() {
  // ===== CÁC STATE CHÍNH =====
  
  // State lưu danh sách lịch tư vấn
  const [consultations, setConsultations] = useState([]);
  
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
  
  // State lưu danh sách học sinh của phụ huynh
  const [students, setStudents] = useState([]);
  
  // State lưu từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  
  // State lưu bộ lọc trạng thái ('all', 'Pending', 'Accepted', 'Rejected')
  const [statusFilter, setStatusFilter] = useState("all");
  
  // State lưu thứ tự sắp xếp ('newest', 'oldest')
  const [sortOrder, setSortOrder] = useState("newest");
  
  // Lấy function setNotif từ NotificationContext để hiển thị thông báo
  const { setNotif } = useNotification();

  // ===== STATE CHO MODAL XÁC NHẬN =====
  
  // State hiển thị modal xác nhận (true = hiện, false = ẩn)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // State lưu thông tin hành động cần xác nhận
  const [confirmAction, setConfirmAction] = useState(null);

  // ===== HÀM CẬP NHẬT TRẠNG THÁI TƯ VẤN =====
  
  // Hàm async để cập nhật trạng thái chấp nhận/từ chối
  const updateConsultationStatus = async (consultationFormId, isAccept) => {
    // Ngăn chặn click nhiều lần - nếu form đang được cập nhật thì thoát
    if (updatingForms.has(consultationFormId)) return;

    try {
      // Thêm form vào danh sách đang cập nhật
      setUpdatingForms(prev => new Set(prev).add(consultationFormId));
      
      // Reset các thông báo cũ
      setError(null);
      setSuccessMessage(null);

      // Gọi API tương ứng với hành động
      if (isAccept) {
        // Nếu chấp nhận thì gọi API accept
        await API_SERVICE.consultationFormAPI.accept(consultationFormId);
      } else {
        // Nếu từ chối thì gọi API reject
        await API_SERVICE.consultationFormAPI.reject(consultationFormId);
      }

      // Refresh lại danh sách từ server
      const parentId = localStorage.getItem('userId');
      const numericParentId = parseInt(parentId, 10);
      const updatedData = await API_SERVICE.consultationFormAPI.getByParent(numericParentId);
      setConsultations(updatedData);

      // Đã xóa timeout setSuccessMessage ở đây
    } catch (err) {
      // Xử lý lỗi
      console.error('Error updating status:', err);
      setError('Không thể cập nhật trạng thái. Vui lòng thử lại sau.');
      setNotif({ message: 'Không thể cập nhật trạng thái. Vui lòng thử lại sau.', type: 'error' });
    } finally {
      // Luôn xóa form khỏi danh sách đang cập nhật (dù thành công hay thất bại)
      setUpdatingForms(prev => {
        const newSet = new Set(prev);
        newSet.delete(consultationFormId);
        return newSet;
      });
    }
  };

  // ===== HÀM XỬ LÝ XÁC NHẬN =====
  
  // Hàm xử lý khi user click nút chấp nhận/từ chối
  const handleStatusChange = (consultationFormId, isAccept, currentStatus) => {
    // Chỉ cho phép thay đổi khi status còn Pending
    if (currentStatus !== 'Pending') return;
    
    // Hiển thị modal xác nhận với thông tin hành động
    setConfirmAction({
      consultationFormId,
      isAccept,
      actionText: isAccept ? 'chấp nhận' : 'từ chối'
    });
    setShowConfirmModal(true);
  };

  // Hàm xử lý khi user xác nhận trong modal
  const handleConfirmAction = () => {
    if (confirmAction) {
      // Gọi hàm cập nhật trạng thái
      updateConsultationStatus(confirmAction.consultationFormId, confirmAction.isAccept);
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
          setError('Không tìm thấy ID phụ huynh. Vui lòng đăng nhập lại.');
          return;
        }

        // ===== BƯỚC 1: FETCH STUDENTS CHO PHỤ HUYNH =====
        
        // Gọi API lấy thông tin học sinh của phụ huynh
        const studentData = await API_SERVICE.parentAPI.getParent(parentId);
        console.log("Student data fetched:", studentData);
        setStudents(studentData);

        // ===== BƯỚC 2: FETCH CONSULTATION FORMS =====
        
        // Gọi API lấy tất cả lịch tư vấn cho phụ huynh
        const numericParentId = parseInt(parentId, 10);
        console.log("Fetching consultation forms for parent ID:", numericParentId);
        const consultationData = await API_SERVICE.consultationFormAPI.getByParent(numericParentId);
        console.log("Consultation data fetched:", consultationData);

        // ===== BƯỚC 3: XỬ LÝ VÀ ENRICH DỮ LIỆU =====
        
        // Kiểm tra dữ liệu và xử lý
        if (Array.isArray(consultationData)) {
          if (consultationData.length > 0) {
            // Map student names to consultations
            try {
              // Enrich dữ liệu với thông tin học sinh
              const enrichedConsultations = await Promise.all(consultationData.map(async form => {
                if (!form.consultationSchedule?.consultationScheduleId) {
                  console.log("No schedule ID for form:", form.consultationFormId);
                  return { ...form, studentName: 'Không rõ' };
                }
                
                // Fetch full schedule details to get studentId
                try {
                  // Lấy thông tin chi tiết schedule
                  const scheduleData = await API_SERVICE.consultationScheduleAPI.get(form.consultationSchedule.consultationScheduleId);
                  console.log("Schedule data for form", form.consultationFormId, ":", scheduleData);
                  
                  // Lấy thông tin học sinh
                  const student = await API_SERVICE.studentAPI.getById(form.consultationSchedule.studentId)
                  
                  return {
                    ...form,
                    consultationSchedule: scheduleData, // Replace placeholder with full data
                    studentName: student ? student.fullName : 'Không rõ'
                  };
                } catch (scheduleError) {
                  console.error("Error fetching schedule data:", scheduleError);
                  return { ...form, studentName: 'Không rõ' };
                }
              }));
              
              console.log("Enriched consultations:", enrichedConsultations);
              setConsultations(enrichedConsultations);
            } catch (enrichError) {
              console.error("Error enriching consultation data:", enrichError);
              setConsultations(consultationData);
            }
          } else {
            console.log("Consultation data is an empty array");
            setConsultations([]);
          }
        } else {
          console.warn("Consultation data is not an array:", consultationData);
          setConsultations([]);
        }

      } catch (err) {
        // Xử lý lỗi
        console.error('Error details:', err);
        setError('Không thể tải lịch tư vấn. Vui lòng thử lại sau.');
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
      setError('Truy cập bị từ chối. Cần có vai trò phụ huynh.');
    }
  }, [userRole]); // Chạy lại khi userRole thay đổi

  // ===== FILTER VÀ SORT DỮ LIỆU =====
  
  // Lọc và sắp xếp danh sách consultations
  const filteredConsultations = consultations
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
        (form.title && form.title.toLowerCase().includes(lowerCaseSearchTerm)) ||
        // Tìm trong content
        (form.content && form.content.toLowerCase().includes(lowerCaseSearchTerm)) ||
        // Tìm trong location
        (form.consultationSchedule && form.consultationSchedule.location && form.consultationSchedule.location.toLowerCase().includes(lowerCaseSearchTerm)) ||
        // Tìm trong studentName
        (form.studentName && form.studentName.toLowerCase().includes(lowerCaseSearchTerm))
      );
    })
    .sort((a, b) => {
      // ===== SẮP XẾP THEO NGÀY TƯ VẤN =====
      const dateA = a.consultationSchedule ? new Date(a.consultationSchedule.consultDate) : 0;
      const dateB = b.consultationSchedule ? new Date(b.consultationSchedule.consultDate) : 0;
      
      if (sortOrder === 'newest') {
        return dateB - dateA; // Mới nhất trước
      }
      return dateA - dateB; // Cũ nhất trước
    });

  // ===== RENDER LOADING VÀ ERROR STATES =====
  
  // Hiển thị loading spinner nếu đang tải
  if (loading) return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  
  // Hiển thị lỗi nếu có
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  // ===== RENDER UI CHÍNH =====
  
  return (
    <div className="min-vh-100 d-flex flex-column">
      <main className="container-fluid py-5 px-10 flex-grow-1" style={{ marginTop: "80px" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10">
              
              {/* ===== HEADER SECTION ===== */}
              <div className="text-center mb-5">
                <h1 className="display-4 mb-3 fw-bold">Lịch Tư Vấn</h1>
                <p className="lead text-muted">Thông tin chi tiết về các buổi tư vấn sức khỏe</p>
              </div>
              
              {/* ===== CONTROLS SECTION ===== */}
              <div className="row mb-4 g-3">
                {/* Search input */}
                <div className="col-md-5">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm theo tiêu đề, nội dung, địa điểm..."
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
              {filteredConsultations.length === 0 ? (
                // Hiển thị message khi không có consultations
                <div className="text-center text-muted">
                  <p>Không có lịch tư vấn nào phù hợp.</p>
                </div>
              ) : (
                // Render danh sách consultations
                <div className="list-group">
                  {filteredConsultations.map((form) => {
                    // ===== TÍNH TOÁN CÁC TRẠNG THÁI =====
                    
                    // Kiểm tra form có đang được cập nhật không
                    const isUpdating = updatingForms.has(form.consultationFormId);

                    // Kiểm tra có quá muộn để thay đổi không
                    let isTooLateToChange = false;
                    if (form.consultationSchedule) {
                      const consultDateTime = new Date(form.consultationSchedule.consultDate);
                      const now = new Date();
                      // Trừ 24 giờ (tính bằng milliseconds)
                      const deadline = new Date(consultDateTime.getTime() - 24 * 60 * 60 * 1000);
                      if (now >= deadline && form.status === 'Pending') {
                        isTooLateToChange = true;
                      }
                    }

                    // Kiểm tra status đã thay đổi chưa (chỉ cho phép thay đổi khi Pending)
                    const hasChangedStatus = form.status !== 'Pending';

                    return (
                      // ===== CONSULTATION CARD =====
                      <div key={form.consultationFormId} className="list-group-item list-group-item-action p-4 mb-3 shadow-sm rounded">
                        
                        {/* ===== CONSULTATION TITLE ===== */}
                        <h5 className="mb-3 text-primary fw-bold">{form.title}</h5>
                        
                        {/* ===== STUDENT INFO ===== */}
                        {form.studentName && <p className="mb-2"><strong>Học sinh:</strong> {form.studentName}</p>}
                        
                        {/* ===== CONSULTATION CONTENT ===== */}
                        <p className="mb-2"><strong>Nội dung:</strong> {form.content}</p>
                        
                        {/* ===== CONSULTATION DETAILS ===== */}
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
                          
                          {/* ===== SCHEDULE INFORMATION ===== */}
                          {form.consultationSchedule && (
                              <>
                                  <div className="col-md-6">
                                      <p className="mb-2">
                                        <strong>Ngày tư vấn:</strong> {new Date(form.consultationSchedule.consultDate).toLocaleDateString('vi-VN')} - {new Date(form.consultationSchedule.consultDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                  </div>
                                  <div className="col-md-12">
                                      <p className="mb-0"><strong>Địa điểm:</strong> {form.consultationSchedule.location}</p>
                                  </div>
                              </>
                          )}
                        </div>
                        
                        {/* ===== ACTION BUTTONS ===== */}
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div className="d-flex gap-2">
                              {/* Button chấp nhận */}
                              <button
                                  className={`btn btn-sm ${form.status === 'Accepted' ? 'btn-success' : 'btn-outline-success'}`}
                                  onClick={() => handleStatusChange(form.consultationFormId, true, form.status)}
                                  disabled={isUpdating || isTooLateToChange || hasChangedStatus}
                              >
                                  {isUpdating ? 'Đang xử lý...' : 'Chấp nhận'}
                              </button>
                              
                              {/* Button từ chối */}
                              <button
                                  className={`btn btn-sm ${form.status === 'Rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
                                  onClick={() => handleStatusChange(form.consultationFormId, false, form.status)}
                                  disabled={isUpdating || isTooLateToChange || hasChangedStatus}
                              >
                                  {isUpdating ? 'Đang xử lý...' : 'Từ chối'}
                              </button>
                          </div>
                          
                          {/* Warning message khi quá hạn */}
                          {isTooLateToChange && (
                            <p className="text-muted fst-italic mb-0">
                              <small>Đã quá hạn thay đổi.</small>
                            </p>
                          )}
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

      {/* ===== CUSTOM CONFIRMATION MODAL ===== */}
      {showConfirmModal && confirmAction && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-content">
            <div className="confirm-modal-header">
              <h5 className="confirm-modal-title">Xác nhận hành động</h5>
            </div>
            <div className="confirm-modal-body">
              <p>
                Bạn có chắc chắn muốn {confirmAction.actionText} lịch tư vấn này?
              </p>
              <p className="text-muted">
                <small>Sau khi xác nhận sẽ không thể thay đổi lại.</small>
              </p>
            </div>
            <div className="confirm-modal-footer">
              {/* Button hủy */}
              <button className="btn btn-secondary me-2" onClick={handleCancelAction}>Hủy</button>
              
              {/* Button xác nhận */}
              <button className={`btn ${confirmAction.isAccept ? 'btn-success' : 'btn-danger'}`} onClick={handleConfirmAction}>
                {confirmAction.isAccept ? 'Đồng ý' : 'Từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 