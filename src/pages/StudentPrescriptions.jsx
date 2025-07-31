// Import các thư viện cần thiết
import React, { useState, useEffect } from "react"; // React core và các hooks cần thiết
import { useUserRole } from '../contexts/UserRoleContext'; // Hook để lấy vai trò user
import { API_SERVICE } from '../services/api'; // Service để gọi API

// Component chính để hiển thị đơn thuốc cho học sinh
export default function StudentPrescriptions() {
  // ===== CÁC STATE CHÍNH =====
  
  // State lưu danh sách đơn thuốc
  const [prescriptions, setPrescriptions] = useState([]);
  
  // State lưu ID đơn thuốc đang được chọn để xem chi tiết
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  
  // State lưu mapping giữa prescriptionId và danh sách thuốc
  const [medicalsMap, setMedicalsMap] = useState({}); // {prescriptionId: [meds]}
  
  // State quản lý trạng thái loading chính (true = đang tải, false = hoàn thành)
  const [loading, setLoading] = useState(true);
  
  // State quản lý trạng thái loading khi tải chi tiết thuốc
  const [loadingMedicals, setLoadingMedicals] = useState(false);
  
  // State lưu thông báo lỗi (null = không có lỗi, string = message lỗi)
  const [error, setError] = useState(null);
  
  // Lấy vai trò user hiện tại từ context
  const { userRole } = useUserRole();
  
  // State lưu mapping giữa prescriptionId và tên phụ huynh
  const [parentNameMap, setParentNameMap] = useState({});
  
  // State lưu ID học sinh
  const [studentId, setStudentId] = useState(null);
  
  // State lưu ID phụ huynh
  const [parentId, setParentId] = useState(null);
  
  // State lưu từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  
  // State lưu thứ tự sắp xếp ('newest', 'oldest')
  const [sortOrder, setSortOrder] = useState("newest");

  // ===== USEEFFECT ĐỂ FETCH DỮ LIỆU =====
  
  useEffect(() => {
    // Hàm async để fetch thông tin học sinh và đơn thuốc
    const fetchStudentAndPrescriptions = async () => {
      setLoading(true); // Bật trạng thái loading
      setError(null); // Reset lỗi
      
      try {
        // Lấy studentId từ localStorage
        const sid = localStorage.getItem('userId');
        setStudentId(sid);
        if (!sid) throw new Error('Student ID not found');
        
        // ===== BƯỚC 1: LẤY THÔNG TIN HỌC SINH VÀ PARENTID =====
        
        // Gọi API lấy thông tin học sinh để lấy parentId
        const studentData = await API_SERVICE.studentAPI.getById(sid);
        const pid = studentData.parent?.parentId || studentData.parentId;
        setParentId(pid);
        if (!pid) throw new Error('Không tìm thấy parentId');
        
        // ===== BƯỚC 2: LẤY TẤT CẢ ĐƠN THUỐC CỦA PARENT =====
        
        // Thử lấy đơn thuốc từ API đầu tiên
        let data = await API_SERVICE.parentPrescriptionAPI.getPrescriptionByParent(pid);
        
        // Nếu không có data, thử API thứ 2
        if (!data || data.length === 0) {
          data = await API_SERVICE.parentPrescriptionAPI.getByParent(pid);
        }
        
        // ===== BƯỚC 3: LẤY TÊN PHỤ HUYNH CHO TỪNG ĐƠN THUỐC =====
        
        // Tạo mapping giữa prescriptionId và tên phụ huynh
        const parentMap = {};
        for (const p of data) {
          if (p.parent && p.parent.fullName) {
            parentMap[p.prescriptionId || p.parentPrescriptionId] = p.parent.fullName;
          }
        }
        setParentNameMap(parentMap);
        
        // ===== BƯỚC 4: LẤY DANH SÁCH THUỐC CHO TỪNG ĐƠN =====
        
        // Lấy danh sách thuốc cho từng đơn, lọc theo studentId
        const medsMap = {};
        for (const p of data) {
          const presId = p.parentPrescriptionId || p.prescriptionId;
          
          // Thử lấy thuốc từ medication API trước
          let meds = await API_SERVICE.medicationAPI.getByPrescription(presId);
          
          // Nếu không có, thử từ prescription API
          if (!meds || meds.length === 0) {
            meds = await API_SERVICE.prescriptionAPI.getByPrescription(presId);
          }
          
          // Lọc thuốc chỉ dành cho học sinh này
          if (meds && meds.length > 0) {
            medsMap[presId] = meds.filter(med => med.studentId == sid);
          } else {
            medsMap[presId] = [];
          }
        }
        
        // ===== BƯỚC 5: LỌC ĐƠN THUỐC CÓ THUỐC CHO HỌC SINH =====
        
        // Chỉ lấy các đơn thuốc có ít nhất 1 thuốc dành cho học sinh này
        const filteredPrescriptions = data.filter(p => {
          const presId = p.parentPrescriptionId || p.prescriptionId;
          return medsMap[presId] && medsMap[presId].length > 0;
        });
        
        setPrescriptions(filteredPrescriptions);
        setMedicalsMap(medsMap);
        
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
      fetchStudentAndPrescriptions();
    } else {
      // Nếu không phải student thì hiển thị lỗi access denied
      setLoading(false);
      setError('Access denied. Student role required.');
    }
  }, [userRole]); // Chạy lại khi userRole thay đổi

  // ===== STATE CHO MODAL VÀ UI =====
  
  // State hiển thị chi tiết thuốc (prescriptionId hoặc null)
  const [showDetail, setShowDetail] = useState(null);
  
  // State hiển thị modal xem ảnh (true = hiện, false = ẩn)
  const [showImageModal, setShowImageModal] = useState(false);
  
  // State lưu URL ảnh đang được xem trong modal
  const [imageInModal, setImageInModal] = useState(null);

  // ===== HÀM RENDER FILE ĐƠN THUỐC =====
  
  // Hàm render file đơn thuốc (ảnh/PDF/link)
  const renderPrescriptionFile = (file) => {
    if (!file) return <span className="text-muted">Không có file</span>;
    
    let finalUrl = file;
    
    // Xử lý URL
    if (file.startsWith('http')) {
      finalUrl = file.replace(/([^:]\/)\/+/, "$1");
    } else {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      finalUrl = `${baseUrl}/files/blogs/${file.replace(/^\//, '')}`;
    }
    
    // Nếu là file ảnh
    if (finalUrl && (finalUrl.toLowerCase().endsWith('.jpg') || finalUrl.toLowerCase().endsWith('.jpeg') || finalUrl.toLowerCase().endsWith('.png') || finalUrl.toLowerCase().endsWith('.gif'))) {
      return (
        <>
          <img
            src={finalUrl}
            alt="prescription"
            style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #dee2e6', cursor: 'pointer' }}
            className="d-block mb-2"
            onClick={() => {
              setImageInModal(finalUrl);
              setShowImageModal(true);
            }}
          />
          <button className="btn btn-outline-info btn-sm" onClick={() => { setImageInModal(finalUrl); setShowImageModal(true); }}>Xem ảnh</button>
        </>
      );
    }
    
    // Nếu là file PDF
    if (finalUrl && finalUrl.toLowerCase().endsWith('.pdf')) {
      return <a href={finalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm mb-2">Tải file PDF</a>;
    }
    
    // Nếu là file khác
    return <a href={finalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary btn-sm mb-2">Xem file</a>;
  };

  // ===== FILTER VÀ SORT DỮ LIỆU =====
  
  // Lọc đơn thuốc theo từ khóa tìm kiếm
  const filteredPrescriptions = prescriptions.filter(p => {
    if (!searchTerm) return true; // Nếu không có từ khóa thì giữ lại tất cả
    
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const presId = p.parentPrescriptionId || p.prescriptionId;
    const meds = medicalsMap[presId] || [];
    
    return (
      // Tìm trong schedule (lịch uống)
      (p.schedule && p.schedule.toLowerCase().includes(lowerCaseSearchTerm)) ||
      // Tìm trong parentNote (ghi chú)
      (p.parentNote && p.parentNote.toLowerCase().includes(lowerCaseSearchTerm)) ||
      // Tìm trong submittedDate (ngày tạo)
      (p.submittedDate && p.submittedDate.toString().toLowerCase().includes(lowerCaseSearchTerm)) ||
      // Tìm trong tên thuốc
      meds.some(med => med.medicationName && med.medicationName.toLowerCase().includes(lowerCaseSearchTerm))
    );
  });
  
  // Sắp xếp đơn thuốc theo thứ tự
  const sortedPrescriptions = [...filteredPrescriptions].sort((a, b) => {
    const idA = a.parentPrescriptionId || a.prescriptionId;
    const idB = b.parentPrescriptionId || b.prescriptionId;
    
    if (sortOrder === 'newest') {
      return idB - idA; // Mới nhất trước
    }
    return idA - idB; // Cũ nhất trước
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
            <div className="col-md-10">
              
              {/* ===== HEADER SECTION ===== */}
              
              <div className="text-center mb-5">
                <h1 className="display-4 mb-3 fw-bold">Đơn thuốc của bạn</h1>
                <p className="lead text-muted">Danh sách đơn thuốc phụ huynh gửi cho bạn</p>
              </div>
              
              {/* ===== CONTROLS SECTION ===== */}
              
              <div className="row mb-4 g-3">
                
                {/* Search input */}
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm theo lịch uống, ghi chú, tên thuốc hoặc ngày tạo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Sort dropdown */}
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="newest">Sắp xếp: Mới nhất</option>
                    <option value="oldest">Sắp xếp: Cũ nhất</option>
                  </select>
                </div>
              </div>
              
              {/* ===== EMPTY STATE ===== */}
              
              {sortedPrescriptions.length === 0 && !loading && (
                <div className="alert alert-info text-center">Không tìm thấy đơn thuốc nào.</div>
              )}
              
              {/* ===== DANH SÁCH ĐƠN THUỐC ===== */}
              
              <div className="list-group">
                {sortedPrescriptions.map((p) => {
                  const presId = p.parentPrescriptionId || p.prescriptionId;
                  const parentName = parentNameMap[presId] || (p.parent && p.parent.fullName) || '';
                  const meds = medicalsMap[presId] || [];
                  
                  return (
                    // ===== PRESCRIPTION CARD =====
                    <div key={presId} className="card mb-3 shadow-sm">
                      
                      {/* ===== CARD HEADER ===== */}
                      
                      <div className="card-header bg-light">
                        <h5 className="mb-0 text-primary">Đơn thuốc #{presId}</h5>
                        {parentName && (
                          <div className="text-secondary small mt-1"><strong>Phụ huynh:</strong> {parentName}</div>
                        )}
                      </div>
                      
                      {/* ===== CARD BODY ===== */}
                      
                      <div className="card-body">
                        <div className="row align-items-center">
                          
                          {/* ===== LEFT COLUMN - THÔNG TIN ĐƠN THUỐC ===== */}
                          
                          <div className="col-md-8">
                            {/* Ngày tạo */}
                            <p className="mb-2"><strong>Ngày tạo:</strong> {p.submittedDate ? new Date(p.submittedDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                            
                            {/* Trạng thái */}
                            <p className="mb-2">
                              <strong>Trạng thái:</strong>{' '}
                              <span className={`badge ${
                                p.status === 'Pending' ? 'bg-warning' :
                                p.status === 'Accepted' ? 'bg-success' :
                                'bg-danger'
                              }`}>
                                {p.status === 'Pending' ? 'Chờ xác nhận' :
                                 p.status === 'Accepted' ? 'Đã chấp nhận' :
                                 'Đã từ chối'}
                              </span>
                            </p>
                            
                            {/* Lịch uống */}
                            <p className="mb-2"><strong>Lịch uống:</strong> {p.schedule || 'Chưa có'}</p>
                            
                            {/* Ghi chú */}
                            <p className="mb-3"><strong>Ghi chú:</strong> {p.parentNote || 'Không có'}</p>
                            
                            {/* Button xem chi tiết thuốc */}
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() => setShowDetail(showDetail === presId ? null : presId)}
                            >
                              {showDetail === presId ? "Ẩn chi tiết thuốc" : "Xem chi tiết thuốc"}
                            </button>
                          </div>
                          
                          {/* ===== RIGHT COLUMN - FILE ĐÍNH KÈM ===== */}
                          
                          <div className="col-md-4">
                            <strong className="d-block mb-2">File đính kèm:</strong>
                            {renderPrescriptionFile(p.prescriptionFile)}
                          </div>
                        </div>
                      </div>
                      
                      {/* ===== CARD FOOTER - CHI TIẾT THUỐC ===== */}
                      
                      {showDetail === presId && (
                        <div className="card-footer bg-white">
                          <h6 className="text-muted">Chi tiết thuốc:</h6>
                          {meds.length > 0 ? (
                            <div className="table-responsive">
                              <table className="table table-bordered table-sm">
                                <thead>
                                  <tr>
                                    <th>Tên thuốc</th>
                                    <th>Liều dùng</th>
                                    <th>Số lượng</th>
                                    <th>Số lượng còn lại</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {meds.map((med) => (
                                    <tr key={med.medicationId}>
                                      <td>{med.medicationName}</td>
                                      <td>{med.dosage}</td>
                                      <td>{med.quantity}</td>
                                      <td>{med.remainingQuantity ?? "Không rõ"}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : <p>Không có chi tiết thuốc.</p>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* ===== MODAL XEM ẢNH ===== */}
      
      {showImageModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowImageModal(false)}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xem ảnh đơn thuốc</h5>
                <button type="button" className="btn-close" onClick={() => setShowImageModal(false)}></button>
              </div>
              <div className="modal-body text-center">
                <img src={imageInModal} alt="Đơn thuốc" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 