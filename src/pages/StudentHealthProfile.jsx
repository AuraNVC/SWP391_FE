// Import các thư viện cần thiết
import React, { useState, useEffect } from 'react'; // React core và các hooks cần thiết
import { API_SERVICE } from '../services/api'; // Service để gọi API

// Component chính để hiển thị hồ sơ sức khỏe cá nhân cho học sinh
const StudentHealthProfile = () => {
  // ===== CÁC STATE CHÍNH =====
  
  // State lưu thông tin học sinh
  const [student, setStudent] = useState(null);
  
  // State lưu hồ sơ sức khỏe của học sinh
  const [healthProfile, setHealthProfile] = useState(null);
  
  // State lưu danh sách kết quả khám sức khỏe
  const [healthResults, setHealthResults] = useState([]);
  
  // State lưu danh sách kết quả tiêm chủng
  const [vaccinationResults, setVaccinationResults] = useState([]);
  
  // State lưu danh sách sự kiện y tế
  const [medicalEvents, setMedicalEvents] = useState([]);
  
  // State quản lý trạng thái loading (true = đang tải, false = hoàn thành)
  const [loading, setLoading] = useState(true);
  
  // State lưu thông báo lỗi (null = không có lỗi, string = message lỗi)
  const [error, setError] = useState(null);
  
  // ===== STATE CHO TOGGLE HIỂN THỊ CÁC PHẦN =====
  
  // State hiển thị lịch sử khám sức khỏe (true = hiện, false = ẩn)
  const [showHealthResults, setShowHealthResults] = useState(false);
  
  // State hiển thị lịch sử tiêm chủng (true = hiện, false = ẩn)
  const [showVaccinationResults, setShowVaccinationResults] = useState(false);
  
  // State hiển thị sự kiện y tế (true = hiện, false = ẩn)
  const [showMedicalEvents, setShowMedicalEvents] = useState(false);

  // ===== USEEFFECT ĐỂ FETCH TẤT CẢ DỮ LIỆU =====
  
  useEffect(() => {
    // Hàm async để fetch tất cả dữ liệu cần thiết
    const fetchAll = async () => {
      setLoading(true); // Bật trạng thái loading
      setError(null); // Reset lỗi
      
      try {
        // Lấy studentId từ localStorage
        const studentId = localStorage.getItem('userId');
        if (!studentId) throw new Error('Không tìm thấy ID học sinh.');
        
        // ===== BƯỚC 1: LẤY THÔNG TIN CÁ NHÂN =====
        
        // Gọi API lấy thông tin học sinh
        const studentData = await API_SERVICE.studentAPI.getById(studentId);
        setStudent(studentData);
        
        // ===== BƯỚC 2: LẤY HỒ SƠ SỨC KHỎE =====
        
        // Tìm kiếm hồ sơ sức khỏe theo studentId
        const searchResult = await API_SERVICE.healthProfileAPI.search({ keyword: String(studentId) });
        
        // Tìm hồ sơ sức khỏe phù hợp với studentId
        const healthData = Array.isArray(searchResult)
          ? searchResult.find(p => String(p.studentId) === String(studentId))
          : null;
        setHealthProfile(healthData);
        
        // ===== BƯỚC 3: LẤY LỊCH SỬ KHÁM SỨC KHỎE =====
        
        // Chỉ lấy lịch sử khám nếu có healthProfileId
        if (healthData.healthProfileId) {
          // Gọi API lấy kết quả khám theo healthProfileId
          const checkupData = await API_SERVICE.healthCheckResultAPI.getByProfile(healthData.healthProfileId);
          
          // Enrich dữ liệu với thông tin schedule
          const enrichedResults = await Promise.all(
            checkupData.map(async (result) => {
              if (result.healthCheckScheduleId) {
                try {
                  // Lấy thông tin chi tiết schedule
                  const scheduleData = await API_SERVICE.healthCheckScheduleAPI.get(result.healthCheckScheduleId);
                  return { ...result, schedule: scheduleData };
                } catch {
                  // Nếu lỗi thì bỏ qua
                }
              }
              return { ...result, schedule: null };
            })
          );
          setHealthResults(enrichedResults);
          
          // ===== BƯỚC 4: LẤY LỊCH SỬ TIÊM CHỦNG =====
          
          // Gọi API lấy kết quả tiêm chủng theo healthProfileId
          const vacData = await API_SERVICE.vaccinationResultAPI.getByProfile(healthData.healthProfileId);
          
          // Enrich dữ liệu với thông tin schedule
          const enrichedVac = await Promise.all(
            vacData.map(async (result) => {
              if (result.vaccinationScheduleId) {
                try {
                  // Lấy thông tin chi tiết schedule
                  const scheduleData = await API_SERVICE.vaccinationScheduleAPI.getById(result.vaccinationScheduleId);
                  return { ...result, schedule: scheduleData };
                } catch {
                  // Nếu lỗi thì bỏ qua
                }
              }
              return { ...result, schedule: null };
            })
          );
          setVaccinationResults(enrichedVac);
        }
        
        // ===== BƯỚC 5: LẤY SỰ KIỆN Y TẾ =====
        
        // Gọi API lấy sự kiện y tế theo studentId
        const eventData = await API_SERVICE.medicalEventAPI.getByStudent(studentId);
        setMedicalEvents(Array.isArray(eventData) ? eventData : []);
        
      } catch (err) {
        // Xử lý lỗi
        setError(err.message);
      } finally {
        // Tắt trạng thái loading
        setLoading(false);
      }
    };
    
    // Gọi hàm fetch khi component mount
    fetchAll();
  }, []); // Dependency array rỗng - chỉ chạy 1 lần khi mount

  // ===== RENDER LOADING VÀ ERROR STATES =====
  
  // Hiển thị loading spinner nếu đang tải
  if (loading) return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  
  // Hiển thị lỗi nếu có
  if (error) return <div className="text-danger text-center p-4">{error}</div>;

  // ===== RENDER UI CHÍNH =====
  
  return (
    <div className="container py-5" style={{ marginTop: "80px", maxWidth: 800 }}>
      
      {/* ===== HEADER SECTION ===== */}
      
      <h1 className="mb-4 text-primary fw-bold text-center">Hồ sơ sức khỏe cá nhân</h1>
      
      {/* ===== THÔNG TIN CÁ NHÂN ===== */}
      
      {student && (
        <div className="mb-4 border rounded p-3 bg-light">
          <h5 className="fw-bold mb-3">Thông tin cá nhân</h5>
          <div className="row">
            <div className="col-md-6">
              {/* Thông tin cơ bản */}
              <p><strong>Họ tên:</strong> {student.fullName}</p>
              <p><strong>Mã học sinh:</strong> {student.studentNumber}</p>
              <p><strong>Ngày sinh:</strong> {new Date(student.dateOfBirth).toLocaleDateString()}</p>
            </div>
            <div className="col-md-6">
              {/* Thông tin bổ sung */}
              <p><strong>Giới tính:</strong> {student.gender}</p>
              <p><strong>Lớp:</strong> {student.className}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* ===== THÔNG TIN SỨC KHỎE ===== */}
      
      {healthProfile && (
        <div className="mb-4 border rounded p-3">
          <h5 className="fw-bold mb-3 text-success">Thông tin sức khỏe</h5>
          <div className="row">
            <div className="col-md-6">
              {/* Nhóm máu */}
              <p><strong>Nhóm máu:</strong> {healthProfile.bloodType}</p>
            </div>
            <div className="col-md-6">
              {/* Dị ứng */}
              <p><strong>Dị ứng:</strong> {healthProfile.allergies}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* ===== PHẦN HIỂN THỊ LỊCH SỬ ===== */}
      
      <div className="mb-4 border rounded p-3">
        
        {/* ===== BUTTON TOGGLE CÁC PHẦN ===== */}
        
        <div className="d-flex gap-2 flex-wrap mb-3">
          
          {/* Button toggle lịch sử khám */}
          <button
            className="btn btn-outline-info btn-sm"
            onClick={() => {
              setShowHealthResults(v => !v); // Toggle hiển thị lịch sử khám
              setShowVaccinationResults(false); // Ẩn các phần khác
              setShowMedicalEvents(false);
            }}
          >
            <i className="bi bi-card-list me-1"></i>
            {showHealthResults ? 'Ẩn lịch sử khám' : 'Xem lịch sử khám'}
          </button>
          
          {/* Button toggle lịch sử tiêm chủng */}
          <button
            className="btn btn-outline-warning btn-sm"
            onClick={() => {
              setShowVaccinationResults(v => !v); // Toggle hiển thị lịch sử tiêm chủng
              setShowHealthResults(false); // Ẩn các phần khác
              setShowMedicalEvents(false);
            }}
          >
            <i className="bi bi-shield-check me-1"></i>
            {showVaccinationResults ? 'Ẩn lịch sử tiêm chủng' : 'Xem lịch sử tiêm chủng'}
          </button>
          
          {/* Button toggle sự kiện y tế */}
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => {
              setShowMedicalEvents(v => !v); // Toggle hiển thị sự kiện y tế
              setShowHealthResults(false); // Ẩn các phần khác
              setShowVaccinationResults(false);
            }}
          >
            <i className="bi bi-activity me-1"></i>
            {showMedicalEvents ? 'Ẩn sự kiện y tế' : 'Xem sự kiện y tế'}
          </button>
        </div>
        
        {/* ===== PHẦN LỊCH SỬ KHÁM SỨC KHỎE ===== */}
        
        {showHealthResults && (
          <div className="mt-4 border-top pt-3">
            <h5 className="fw-bold mb-3 text-info">Lịch sử khám định kì</h5>
            {healthResults.length > 0 ? (
              <ul className="list-group" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {healthResults.map(result => (
                  <li key={result.healthCheckupRecordId} className="list-group-item">
                    {/* Tên lịch khám */}
                    {result.schedule && <h6 className='fw-bold text-primary'>{result.schedule.name}</h6>}
                    
                    {/* Ngày khám */}
                    <p><strong>Ngày khám:</strong> {result.schedule ? new Date(result.schedule.checkDate).toLocaleDateString() : 'Chưa cập nhật'}</p>
                    
                    {/* Địa điểm */}
                    <p><strong>Địa điểm:</strong> {result.schedule?.location || 'Chưa cập nhật'}</p>
                    
                    {/* Chiều cao và cân nặng */}
                    <p><strong>Chiều cao:</strong> {result.height || 'N/A'} cm - <strong>Cân nặng:</strong> {result.weight || 'N/A'} kg</p>
                    
                    {/* Thị lực */}
                    <p><strong>Thị lực:</strong> Mắt trái: {result.leftVision || 'N/A'} - Mắt phải: {result.rightVision || 'N/A'}</p>
                    
                    {/* Kết luận */}
                    <p><strong>Kết luận:</strong> <span className='fw-bold'>{result.result || 'Chưa có'}</span></p>
                    
                    {/* Ghi chú */}
                    {result.note && <p className='mb-0 text-muted'><strong>Ghi chú:</strong> {result.note}</p>}
                  </li>
                ))}
              </ul>
            ) : <div className="alert alert-light text-center">Không có kết quả khám nào.</div>}
          </div>
        )}
        
        {/* ===== PHẦN LỊCH SỬ TIÊM CHỦNG ===== */}
        
        {showVaccinationResults && (
          <div className="mt-4 border-top pt-3">
            <h5 className="fw-bold mb-3 text-warning">Lịch sử tiêm chủng</h5>
            {vaccinationResults.length > 0 ? (
              <ul className="list-group" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {vaccinationResults.map(result => (
                  <li key={result.vaccinationResultId} className="list-group-item">
                    {/* Tên vắc xin */}
                    {result.schedule && <p className='mb-1'><strong>Tên vắc xin:</strong> {result.schedule.name || 'Chưa cập nhật'}</p>}
                    
                    {/* Liều lượng */}
                    <p className='mb-1'><strong>Liều lượng:</strong> {result.doseNumber || 'Chưa cập nhật'}</p>
                    
                    {/* Ngày tiêm */}
                    <p><strong>Ngày tiêm:</strong> {result.schedule ? new Date(result.schedule.scheduleDate).toLocaleDateString() : 'Chưa cập nhật'}</p>
                    
                    {/* Địa điểm */}
                    <p><strong>Địa điểm:</strong> {result.schedule?.location || 'Chưa cập nhật'}</p>
                    
                    {/* Trạng thái */}
                    <p><strong>Trạng thái:</strong> <span className={`badge ${result.status === 'Pending' ? 'bg-warning' : result.status === 'Accepted' ? 'bg-success' : 'bg-danger'}`}>{result.status === 'Accepted' ? 'Đã tiêm' : 'Chưa tiêm'}</span></p>
                    
                    {/* Ghi chú */}
                    {result.note && <p className='mb-0 text-muted'><strong>Ghi chú:</strong> {result.note}</p>}
                  </li>
                ))}
              </ul>
            ) : <div className="alert alert-light text-center">Không có lịch sử tiêm chủng nào.</div>}
          </div>
        )}
        
        {/* ===== PHẦN SỰ KIỆN Y TẾ ===== */}
        
        {showMedicalEvents && (
          <div className="mt-4 border-top pt-3">
            <h5 className="fw-bold mb-3 text-danger">Sự kiện y tế</h5>
            {medicalEvents.length > 0 ? (
              <ul className="list-group" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {medicalEvents.map(event => (
                  <li key={event.eventId} className="list-group-item">
                    {/* Tên sự kiện */}
                    <p><strong>Tên sự kiện:</strong> {event.eventName || 'Chưa cập nhật'}</p>
                    
                    {/* Ngày sự kiện */}
                    <p><strong>Ngày:</strong> {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'Chưa cập nhật'}</p>
                    
                    {/* Triệu chứng */}
                    <p><strong>Triệu chứng:</strong> {event.symptoms || 'Không có'}</p>
                    
                    {/* Xử lý */}
                    <p><strong>Xử lý:</strong> {event.actionTaken || 'Không có'}</p>
                    
                    {/* Ghi chú */}
                    {event.note && <p className='mb-0 text-muted'><strong>Ghi chú:</strong> {event.note}</p>}
                  </li>
                ))}
              </ul>
            ) : <div className="alert alert-light text-center">Không có sự kiện y tế nào.</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHealthProfile; 