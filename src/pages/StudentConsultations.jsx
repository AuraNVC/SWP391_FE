// Import các thư viện cần thiết
import React, { useState, useEffect } from "react"; // React core và các hooks cần thiết
import { useUserRole } from '../contexts/UserRoleContext'; // Hook để lấy vai trò user
import { API_SERVICE } from '../services/api'; // Service để gọi API

// Component chính để hiển thị lịch hẹn tư vấn cho học sinh
export default function StudentConsultations() {
  // ===== CÁC STATE CHÍNH =====
  
  // State lưu danh sách consultation forms
  const [forms, setForms] = useState([]);
  
  // State quản lý trạng thái loading (true = đang tải, false = hoàn thành)
  const [loading, setLoading] = useState(true);
  
  // State lưu thông báo lỗi (null = không có lỗi, string = message lỗi)
  const [error, setError] = useState(null);
  
  // Lấy vai trò user hiện tại từ context
  const { userRole } = useUserRole();
  
  // State lưu từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  
  // State lưu thứ tự sắp xếp ('newest', 'oldest')
  const [sortOrder, setSortOrder] = useState("newest");

  // ===== USEEFFECT ĐỂ FETCH DỮ LIỆU =====
  
  useEffect(() => {
    // Hàm async để fetch consultation forms
    const fetchForms = async () => {
      setLoading(true); // Bật trạng thái loading
      setError(null); // Reset lỗi
      
      try {
        // Lấy studentId từ localStorage
        const studentId = localStorage.getItem('userId');
        if (!studentId) {
          throw new Error('Không tìm thấy ID học sinh. Vui lòng đăng nhập lại.');
        }

        // ===== FETCH CONSULTATION FORMS CHO HỌC SINH =====
        
        // Gọi API lấy consultation forms cho học sinh
        const data = await API_SERVICE.consultationFormAPI.getByStudent(studentId);
        setForms(data);

      } catch (err) {
        // Xử lý lỗi
        setError(err.message);
      } finally {
        // Tắt trạng thái loading
        setLoading(false);
      }
    };

    // Chỉ fetch data nếu user có vai trò student
    if (userRole === 'student') {
      fetchForms();
    } else {
      // Nếu không phải student thì hiển thị lỗi access denied
      setLoading(false);
      setError('Truy cập bị từ chối. Cần có vai trò học sinh.');
    }
  }, [userRole]); // Chạy lại khi userRole thay đổi

  // ===== HÀM TIỆN ÍCH =====
  
  // Hàm lấy CSS class cho status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return "bg-warning text-dark"; // Màu vàng cho trạng thái chờ
      case "Accepted":
        return "bg-success"; // Màu xanh cho trạng thái đã chấp nhận
      case "Rejected":
        return "bg-danger"; // Màu đỏ cho trạng thái từ chối
      default:
        return "bg-secondary"; // Màu xám cho trạng thái khác
    }
  };

  // ===== FILTER VÀ SORT DỮ LIỆU =====
  
  // Lọc và sắp xếp forms
  const filteredForms = forms
    .filter(form => {
      // ===== TÌM KIẾM =====
      if (!searchTerm) return true; // Nếu không có từ khóa thì giữ lại tất cả
      
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return (
        // Tìm trong title
        (form.title && form.title.toLowerCase().includes(lowerCaseSearchTerm)) ||
        // Tìm trong content
        (form.content && form.content.toLowerCase().includes(lowerCaseSearchTerm)) ||
        // Tìm trong location
        (form.consultationSchedule.location && form.consultationSchedule.location.toLowerCase().includes(lowerCaseSearchTerm))
      );
    })
    .sort((a, b) => {
      // ===== SẮP XẾP THEO NGÀY TƯ VẤN =====
      const dateA = a.consultationSchedule?.consultDate ? new Date(a.consultationSchedule.consultDate) : 0;
      const dateB = b.consultationSchedule?.consultDate ? new Date(b.consultationSchedule.consultDate) : 0;
      
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
                <h1 className="display-4 mb-3 fw-bold">Lịch Hẹn Tư Vấn</h1>
                <p className="lead text-muted">Thông tin chi tiết về các buổi tư vấn sức khỏe của bạn.</p>
              </div>
              
              {/* ===== CONTROLS SECTION ===== */}
              
              <div className="row mb-4 g-3">
                
                {/* Search input */}
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm theo chủ đề, nội dung, địa điểm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Sort dropdown */}
                <div className="col-md-4">
                  <select className="form-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="newest">Sắp xếp: Mới nhất</option>
                    <option value="oldest">Sắp xếp: Cũ nhất</option>
                  </select>
                </div>
              </div>

              {/* ===== CONTENT SECTION ===== */}
              
              {filteredForms.length === 0 ? (
                // Hiển thị thông báo nếu không có lịch hẹn
                <div className="text-center text-muted">
                  <p>Bạn không có lịch hẹn tư vấn nào.</p>
                </div>
              ) : (
                // Render danh sách consultation forms
                <div className="list-group">
                  {filteredForms.map((form) => (
                    // ===== CONSULTATION CARD =====
                    <div key={form.consultationFormId} className="list-group-item list-group-item-action p-4 mb-3 shadow-sm rounded">
                      
                      {/* ===== FORM TITLE ===== */}
                      <h5 className="mb-3 text-primary fw-bold">{form.title}</h5>
                      
                      {/* ===== FORM CONTENT ===== */}
                      <p className="mb-2"><strong>Nội dung:</strong> {form.content}</p>
                      
                      <div className="row">
                        <div className="col-md-6">
                            {/* ===== STATUS BADGE ===== */}
                            <p className="mb-2">
                                <strong>Trạng thái:</strong>{' '}
                                <span className={`badge ${getStatusBadge(form.status)}`}>
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
                                    {/* Ngày và giờ tư vấn */}
                                    <p className="mb-2">
                                      <strong>Ngày tư vấn:</strong> {new Date(form.consultationSchedule.consultDate).toLocaleDateString('vi-VN')} - {new Date(form.consultationSchedule.consultDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className="col-md-12">
                                    {/* Địa điểm */}
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