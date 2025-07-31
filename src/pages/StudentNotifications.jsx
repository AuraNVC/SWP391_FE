// Import các thư viện cần thiết
import React, { useState, useEffect } from "react"; // React core và các hooks cần thiết
import { API_SERVICE } from '../services/api'; // Service để gọi API

// Component chính để hiển thị thông báo cho học sinh
export default function StudentNotifications() {
  // ===== CÁC STATE CHÍNH =====
  
  // State lưu danh sách thông báo (consent forms)
  const [notifications, setNotifications] = useState([]);
  
  // State lưu mapping giữa formId và schedule tương ứng
  const [schedulesMap, setSchedulesMap] = useState({});
  
  // State quản lý trạng thái loading (true = đang tải, false = hoàn thành)
  const [loading, setLoading] = useState(true);
  
  // State lưu thông báo lỗi (null = không có lỗi, string = message lỗi)
  const [error, setError] = useState(null);
  
  // State lưu từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  
  // State lưu bộ lọc trạng thái ('all', 'Pending', 'Accepted', 'Rejected')
  const [statusFilter, setStatusFilter] = useState("all");
  
  // State lưu thứ tự sắp xếp ('newest', 'oldest')
  const [sortOrder, setSortOrder] = useState("newest");

  // ===== USEEFFECT ĐỂ FETCH DỮ LIỆU =====
  
  useEffect(() => {
    // Hàm async để fetch tất cả dữ liệu cần thiết
    const fetchData = async () => {
      try {
        setLoading(true); // Bật trạng thái loading
        
        // Lấy studentId từ localStorage
        const studentId = localStorage.getItem('userId');
        
        // ===== BƯỚC 1: LẤY THÔNG TIN HỌC SINH VÀ PARENTID =====
        
        // Gọi API lấy thông tin học sinh
        const studentData = await API_SERVICE.studentAPI.getById(studentId);
        
        // Lấy parentId từ thông tin học sinh
        let parentId = null;
        if (studentData.parent && studentData.parent.parentId) {
          parentId = studentData.parent.parentId;
        }
        
        if (!parentId) throw new Error('Không tìm thấy phụ huynh của học sinh này.');
        
        // ===== BƯỚC 2: LẤY CONSENT FORMS CỦA PHỤ HUYNH =====
        
        // Gọi API lấy consent forms của phụ huynh
        const forms = await API_SERVICE.consentFormAPI.getByParent(parentId);
        setNotifications(forms);

        // ===== BƯỚC 3: LẤY THÔNG TIN SCHEDULE CHO TỪNG FORM =====
        
        // Tạo promises để lấy schedule cho từng form
        const schedulePromises = forms.map(form => {
          const formId = form.form.formId;
          const formType = form.form.type;
          
          // Lấy schedule tương ứng với loại form
          if (formType === 'HealthCheck' || formType === '0' || formType === 0) {
            // Nếu là form khám sức khỏe
            return API_SERVICE.healthCheckScheduleAPI.getByForm(formId);
          } else if (formType === 'Vaccine' || formType === 'Vaccination') {
            // Nếu là form tiêm chủng
            return API_SERVICE.vaccinationScheduleAPI.getByForm(formId);
          }
          return Promise.resolve([]); // Trả về array rỗng nếu không phải 2 loại trên
        });
        
        // Chờ tất cả promises hoàn thành
        const schedulesPerForm = await Promise.all(schedulePromises);
        
        // ===== BƯỚC 4: XỬ LÝ DỮ LIỆU SCHEDULE =====
        
        // Lấy phần tử đầu tiên nếu là mảng và lọc bỏ null/undefined
        const allSchedules = schedulesPerForm.map(s => Array.isArray(s) ? s[0] : s).filter(Boolean);
        
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
        setError('Failed to fetch data. Please try again later.');
      } finally {
        // Tắt trạng thái loading
        setLoading(false);
      }
    };
    
    // Gọi hàm fetch khi component mount
    fetchData();
  }, []); // Dependency array rỗng - chỉ chạy 1 lần khi mount

  // ===== FILTER VÀ SORT DỮ LIỆU =====
  
  // Lọc và sắp xếp notifications
  const filteredAndSortedForms = notifications
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

  // ===== RENDER LOADING VÀ ERROR STATES =====
  
  // Hiển thị loading spinner nếu đang tải
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  
  // Hiển thị lỗi nếu có
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  // ===== RENDER UI CHÍNH =====
  
  return (
    <div className="min-vh-100 d-flex flex-column">
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
                    <option value="Accepted">Đã đồng ý</option>
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
              
              {/* ===== CONTENT SECTION ===== */}
              
              {filteredAndSortedForms.length === 0 ? (
                // Hiển thị thông báo nếu không có notifications
                <div className="text-center text-muted">
                  <p>Không có thông báo nào phù hợp.</p>
                </div>
              ) : (
                // Render danh sách notifications
                filteredAndSortedForms.map((form) => {
                  // Lấy schedule tương ứng với form
                  const schedule = schedulesMap[form.form.formId];
                  
                  return (
                    // ===== NOTIFICATION CARD =====
                    <div key={form.consentFormId} className="card mb-3">
                      <div className="card-body">
                        
                        {/* ===== FORM TITLE ===== */}
                        <h5 className="card-title">{form.form.title}</h5>
                        
                        {/* ===== CLASS INFO ===== */}
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
                        {schedule && (
                          <>
                            {/* Tên vắc xin (chỉ hiển thị cho form tiêm chủng) */}
                            {(form.form.type === 'Vaccine' || form.form.type === 'Vaccination') && (
                              <p className="card-text">
                                <strong>Tên vắc xin:</strong> {schedule.name || 'Chưa cập nhật'}
                              </p>
                            )}
                            
                            {/* Thời gian */}
                            <p className="card-text">
                              <strong>Thời gian:</strong> {new Date(schedule.checkDate || schedule.scheduleDate).toLocaleDateString('vi-VN')} - {new Date(schedule.checkDate || schedule.scheduleDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            
                            {/* Địa điểm */}
                            <p className="card-text">
                              <strong>Địa điểm:</strong> {schedule.location}
                            </p>
                            
                            {/* Ghi chú (nếu có) */}
                            {schedule.note && (
                              <p className="card-text">
                                <strong>Ghi chú:</strong> {schedule.note}
                              </p>
                            )}
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