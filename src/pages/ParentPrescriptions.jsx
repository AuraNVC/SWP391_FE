// Import các thư viện cần thiết
import React, { useState, useEffect, useRef, useCallback } from "react"; // React core và các hooks cần thiết
import { useUserRole } from '../contexts/UserRoleContext'; // Hook để lấy vai trò user
import { API_SERVICE } from '../services/api'; // Service để gọi API

// Component chính để quản lý đơn thuốc cho phụ huynh
export default function ParentPrescriptions() {
  // ===== CÁC STATE CHÍNH =====
  
  // State lưu danh sách đơn thuốc
  const [prescriptions, setPrescriptions] = useState([]);
  
  // State lưu ID đơn thuốc đang được chọn để xem chi tiết
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  
  // State lưu danh sách thuốc của đơn thuốc được chọn
  const [medicals, setMedicals] = useState([]);
  
  // State quản lý trạng thái loading chính (true = đang tải, false = hoàn thành)
  const [loading, setLoading] = useState(true);
  
  // State quản lý trạng thái loading khi tải chi tiết thuốc
  const [loadingMedicals, setLoadingMedicals] = useState(false);
  
  // State lưu thông báo lỗi (null = không có lỗi, string = message lỗi)
  const [error, setError] = useState(null);
  
  // Lấy vai trò user hiện tại từ context
  const { userRole } = useUserRole();
  
  // State hiển thị modal tạo đơn thuốc mới (true = hiện, false = ẩn)
  const [showModal, setShowModal] = useState(false);
  
  // State lưu thông tin đơn thuốc mới đang được tạo
  const [newPrescription, setNewPrescription] = useState({
    schedule: '', // Lịch uống thuốc
    parentNote: '', // Ghi chú của phụ huynh
    prescriptionFile: '', // File đơn thuốc (ảnh/PDF)
    medications: [ // Danh sách thuốc
      { medicationName: '', dosage: '', quantity: 1 }
    ]
  });
  
  // State quản lý trạng thái đang tạo đơn thuốc
  const [adding, setAdding] = useState(false);
  
  // State quản lý trạng thái đang upload file
  const [uploading, setUploading] = useState(false);
  
  // State lưu lỗi khi upload file
  const [uploadError, setUploadError] = useState("");
  
  // Ref để tham chiếu đến input file
  const fileInputRef = useRef();
  
  // State lưu từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  
  // State lưu thứ tự sắp xếp ('newest', 'oldest')
  const [sortOrder, setSortOrder] = useState("newest");
  
  // State hiển thị modal xem ảnh (true = hiện, false = ẩn)
  const [showImageModal, setShowImageModal] = useState(false);
  
  // State lưu URL ảnh đang được xem trong modal
  const [imageInModal, setImageInModal] = useState(null);
  
  // State lưu danh sách học sinh của phụ huynh
  const [students, setStudents] = useState([]);
  
  // State lưu ID học sinh được chọn cho đơn thuốc mới
  const [selectedStudentId, setSelectedStudentId] = useState("");
  
  // State lưu mapping giữa prescription ID và tên học sinh
  const [prescriptionStudents, setPrescriptionStudents] = useState({});

  // ===== HÀM LẤY THÔNG TIN HỌC SINH CHO ĐƠN THUỐC =====
  
  // Hàm async để lấy tên học sinh cho một đơn thuốc cụ thể
  const getStudentForPrescription = async (prescriptionId) => {
    try {
      // Thử lấy thuốc từ medication API trước
      let meds = await API_SERVICE.medicationAPI.getByPrescription(prescriptionId);
      
      // Nếu không có, thử lấy từ prescription API
      if (!meds || meds.length === 0) {
        meds = await API_SERVICE.prescriptionAPI.getByPrescription(prescriptionId);
      }
      
      // Nếu có thuốc và có studentId, tìm tên học sinh
      if (meds && meds.length > 0 && meds[0].studentId) {
        const student = students.find(s => s.studentId == meds[0].studentId);
        return student ? student.fullName : 'Không rõ';
      }
    } catch (err) {
      console.error('Error fetching student info:', err);
    }
    return 'Không rõ';
  };

  // ===== HÀM FETCH DỮ LIỆU ĐƠN THUỐC =====
  
  // Hàm async để fetch tất cả đơn thuốc của phụ huynh
  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Lấy parentId từ localStorage
      const parentId = localStorage.getItem('userId');
      if (!parentId) throw new Error('Parent ID not found');
      
      // Thử lấy đơn thuốc từ nhiều API khác nhau
      let data = await API_SERVICE.parentPrescriptionAPI.getPrescriptionByParent(parentId);
      console.log('parentPrescriptionAPI.getPrescriptionByParent:', data);
      
      // Xử lý response format khác nhau
      if (data && !Array.isArray(data) && data.prescriptions) {
        data = data.prescriptions;
      }
      
      // Nếu không có data, thử API khác
      if (!data || data.length === 0) {
        data = await API_SERVICE.parentPrescriptionAPI.getByParent(parentId);
        console.log('parentPrescriptionAPI.getByParent:', data);
        if (data && !Array.isArray(data) && data.prescriptions) {
          data = data.prescriptions;
        }
      }
      
      // Nếu vẫn không có, thử API thứ 3
      if (!data || data.length === 0) {
        data = await API_SERVICE.prescriptionAPI.getByParent(parentId);
        console.log('prescriptionAPI.getByParent:', data);
        if (data && !Array.isArray(data) && data.prescriptions) {
          data = data.prescriptions;
        }
      }
      
      // Cập nhật state prescriptions
      setPrescriptions(Array.isArray(data) ? data : []);
      
      // Hiển thị thông báo nếu không có đơn thuốc
      if (!data || data.length === 0) {
        setError('Không có đơn thuốc nào cho phụ huynh này.');
      }
      
      // Lấy thông tin học sinh cho từng đơn thuốc
      const studentInfo = {};
      for (const prescription of Array.isArray(data) ? data : []) {
        const presId = prescription.parentPrescriptionId || prescription.prescriptionId;
        studentInfo[presId] = await getStudentForPrescription(presId);
      }
      setPrescriptionStudents(studentInfo);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [students]); // Dependency: students

  // ===== USEEFFECT ĐỂ FETCH DỮ LIỆU KHI COMPONENT MOUNT =====
  
  useEffect(() => {
    if (userRole === 'parent') {
      fetchPrescriptions();
    } else {
      setLoading(false);
      setError('Access denied. Parent role required.');
    }
  }, [userRole, fetchPrescriptions]);

  // ===== XỬ LÝ THÔNG BÁO LỖI THÂN THIỆN =====
  
  // Thông báo thân thiện khi không có đơn thuốc hoặc lỗi validation
  let displayError = error;
  if (
    error && (
      error.includes('One or more validation errors occurred') ||
      error.toLowerCase().includes('validation') ||
      error.toLowerCase().includes('not found') ||
      error.toLowerCase().includes('không có đơn thuốc')
    )
  ) {
    displayError = 'Không có đơn thuốc nào.';
  }

  // ===== USEEFFECT ĐỂ FETCH DANH SÁCH HỌC SINH =====
  
  useEffect(() => {
    if (userRole === 'parent') {
      const fetchStudents = async () => {
        const parentId = localStorage.getItem('userId');
        if (parentId) {
          // Lấy danh sách học sinh của phụ huynh
          const data = await API_SERVICE.studentAPI.getByParent(parentId);
          setStudents(data);
          // Tự động chọn học sinh đầu tiên
          if (data.length > 0) setSelectedStudentId(data[0].studentId);
        }
      };
      fetchStudents();
    }
  }, [userRole]);

  // ===== FILTER VÀ SORT DỮ LIỆU =====
  
  // Lọc đơn thuốc theo từ khóa tìm kiếm
  const filteredPrescriptions = prescriptions.filter(p => {
    if (!searchTerm) return true; // Nếu không có từ khóa thì giữ lại tất cả
    
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      // Tìm trong schedule (lịch uống)
      (p.schedule && p.schedule.toLowerCase().includes(lowerCaseSearchTerm)) ||
      // Tìm trong parentNote (ghi chú)
      (p.parentNote && p.parentNote.toLowerCase().includes(lowerCaseSearchTerm)) ||
      // Tìm trong submittedDate (ngày tạo)
      (p.submittedDate && p.submittedDate.toString().toLowerCase().includes(lowerCaseSearchTerm))
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

  // ===== HÀM RENDER FILE ĐƠN THUỐC =====
  
  // Hàm render file đơn thuốc (ảnh/PDF/link)
  const renderPrescriptionFile = (file) => {
    if (!file) return <span className="text-muted">Không có file</span>;
    
    let finalUrl = file;

    // Xử lý URL
    if (file.startsWith('http')) {
      finalUrl = file.replace(/([^:]\/)\/+/g, "$1");
    } else {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      finalUrl = `${baseUrl}/files/blogs/${file.replace(/^\//, '')}`;
    }

    // Nếu là file ảnh
    if (finalUrl && (finalUrl.toLowerCase().endsWith('.jpg') || finalUrl.toLowerCase().endsWith('.jpeg') || finalUrl.toLowerCase().endsWith('.png') || finalUrl.toLowerCase().endsWith('.gif'))) {
      return (
        <div>
          <img src={finalUrl} alt="prescription" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #dee2e6' }} className="d-block mb-2" />
          <button className="btn btn-outline-info btn-sm" onClick={() => openImageModal(finalUrl)}>Xem ảnh</button>
        </div>
      );
    }
    
    // Nếu là file PDF
    if (finalUrl && finalUrl.toLowerCase().endsWith('.pdf')) {
      return <a href={finalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm mb-2">Tải file PDF</a>;
    }
    
    // Nếu là file khác
    return <a href={finalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary btn-sm mb-2">Xem file</a>;
  };

  // ===== HÀM TOGGLE HIỂN THỊ CHI TIẾT THUỐC =====
  
  // Hàm async để toggle hiển thị chi tiết thuốc của đơn thuốc
  const toggleShowMedicals = async (prescriptionId) => {
    // Nếu đang chọn đơn thuốc này, ẩn đi
    if (selectedPrescription === prescriptionId) {
      setSelectedPrescription(null);
      setMedicals([]);
      return;
    }
    
    // Bật loading và chọn đơn thuốc mới
    setLoadingMedicals(true);
    setSelectedPrescription(prescriptionId);
    
    try {
      // Thử lấy thuốc từ medication API trước
      let meds = await API_SERVICE.medicationAPI.getByPrescription(prescriptionId);
      
      // Nếu không có, thử từ prescription API
      if (!meds || meds.length === 0) {
        meds = await API_SERVICE.prescriptionAPI.getByPrescription(prescriptionId);
      }
      
      if (!meds) throw new Error('Không thể lấy chi tiết thuốc');
      setMedicals(meds);
    } catch (err) {
      setError(err.message);
      setMedicals([]);
    } finally {
      setLoadingMedicals(false);
    }
  };

  // ===== HÀM QUẢN LÝ FORM TẠO ĐƠN THUỐC =====
  
  // Hàm thêm thuốc mới vào form
  const handleAddMedication = () => {
    setNewPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, { medicationName: '', dosage: '', quantity: 1 }]
    }));
  };

  // Hàm xóa thuốc khỏi form
  const handleRemoveMedication = (idx) => {
    setNewPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== idx)
    }));
  };

  // Hàm thay đổi thông tin thuốc trong form
  const handleChangeMedication = (idx, field, value) => {
    setNewPrescription(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => {
        if (i === idx) {
          if (field === 'quantity') {
            // Khi nhập quantity, gán luôn remainingQuantity bằng quantity
            return { ...med, quantity: value, remainingQuantity: value };
          }
          return { ...med, [field]: value };
        }
        return med;
      })
    }));
  };

  // ===== HÀM TẠO ĐƠN THUỐC MỚI =====
  
  // Hàm async để tạo đơn thuốc mới
  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError(null);
    
    try {
      // Lấy parentId từ localStorage
      const parentId = localStorage.getItem('userId');
      if (!parentId) {
        throw new Error("Không tìm thấy Parent ID. Vui lòng đăng nhập lại.");
      }
      
      // Kiểm tra đã chọn học sinh chưa
      if (!selectedStudentId) {
        throw new Error("Vui lòng chọn học sinh cho đơn thuốc.");
      }
      
      // Tạo ngày hiện tại
      const now = new Date().toLocaleDateString('en-CA');
      
      // Tạo body cho API tạo đơn thuốc
      const body = {
        parentId: parseInt(parentId, 10),
        schedule: newPrescription.schedule,
        parentNote: newPrescription.parentNote,
        prescriptionFile: newPrescription.prescriptionFile || "",
        submittedDate: now
      };
      
      // Gọi API tạo đơn thuốc
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/parentPrescription/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Không thể tạo đơn thuốc: ${errorText}`);
      }
      
      // Lấy response và ID đơn thuốc
      const prescription = await response.json();
      const prescriptionId = prescription.parentPrescriptionId || prescription.prescriptionId || prescription.id;
      
      if (!prescriptionId) {
          throw new Error("Tạo đơn thuốc thành công nhưng không nhận được ID.");
      }
      
      // Tạo từng loại thuốc trong đơn thuốc
      for (const med of newPrescription.medications) {
        if (!med.medicationName || !med.dosage) continue; // Bỏ qua nếu thiếu thông tin
        
        const medBody = {
          prescriptionId: prescriptionId,
          medicationName: med.medicationName,
          dosage: med.dosage,
          quantity: parseInt(med.quantity, 10) || 1,
          remainingQuantity: parseInt(med.remainingQuantity, 10) || parseInt(med.quantity, 10) || 1, // Gửi luôn remainingQuantity
          studentId: selectedStudentId
        };
        
        // Gọi API tạo thuốc
        const medResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/medication/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(medBody)
        });
        
        if (!medResponse.ok) {
          const errorText = await medResponse.text();
          throw new Error(`Không thể lưu thuốc "${med.medicationName}": ${errorText}`);
        }
      }
      
      // Reset form và đóng modal
      setShowModal(false);
      setNewPrescription({ schedule: '', parentNote: '', prescriptionFile: '', medications: [{ medicationName: '', dosage: '', quantity: 1 }] });
      
      // Refresh lại danh sách đơn thuốc
      await fetchPrescriptions();
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  // ===== HÀM UPLOAD ẢNH =====
  
  // Hàm async để upload ảnh đơn thuốc
  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    setUploadError("");
    
    try {
      const formData = new FormData();
      formData.append("imageFile", file);
      
      // Gọi API upload ảnh
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/blog/uploadImage`, {
        method: "POST",
        body: formData
      });
      
      if (!res.ok) throw new Error("Lỗi khi upload ảnh");
      
      const result = await res.json();
      setNewPrescription(prev => ({ ...prev, prescriptionFile: result.pathFull }));
    } catch (err) {
      setUploadError("Upload ảnh thất bại!");
    } finally {
      setUploading(false);
    }
  };

  // ===== HÀM MỞ MODAL XEM ẢNH =====
  
  // Hàm để mở modal xem ảnh đơn thuốc
  const openImageModal = (imageUrl) => {
    setImageInModal(imageUrl);
    setShowImageModal(true);
  };

  // ===== RENDER LOADING STATE =====
  
  // Hiển thị loading spinner nếu đang tải
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  // ===== RENDER ERROR STATE =====
  
  // Chỉ return nếu là lỗi nghiêm trọng
  if (displayError && displayError !== 'Không có đơn thuốc nào.') {
    return <div className="text-center p-4 text-info">{displayError}</div>;
  }

  // ===== RENDER UI CHÍNH =====
  
  return (
    <div className="min-vh-100 d-flex flex-column">
      <main className="container-fluid py-5 px-10 flex-grow-1" style={{ marginTop: "80px" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10">
              
              {/* ===== HEADER SECTION ===== */}
              <div className="text-center mb-5">
                <h1 className="display-4 mb-3 fw-bold">Đơn thuốc</h1>
                <p className="lead text-muted">Danh sách đơn thuốc của học sinh</p>
                <button className="btn btn-primary mt-3" onClick={() => setShowModal(true)}>+ Tạo đơn thuốc</button>
              </div>
              
              {/* ===== CONTROLS SECTION ===== */}
              <div className="row mb-4 g-3">
                {/* Search input */}
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm theo lịch uống, ghi chú, hoặc ngày tạo..."
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

              {/* ===== MODAL TẠO ĐƠN THUỐC MỚI ===== */}
              {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <form onSubmit={handleCreatePrescription}>
                        <div className="modal-header">
                          <h5 className="modal-title">Tạo đơn thuốc mới</h5>
                          <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <div className="modal-body">
                          
                          {/* ===== FORM FIELDS ===== */}
                          
                          {/* Lịch uống */}
                          <div className="mb-3">
                            <label className="form-label">Lịch uống</label>
                            <input type="text" className="form-control" value={newPrescription.schedule} onChange={e => setNewPrescription(prev => ({ ...prev, schedule: e.target.value }))} required />
                          </div>
                          
                          {/* Ghi chú phụ huynh */}
                          <div className="mb-3">
                            <label className="form-label">Ghi chú phụ huynh</label>
                            <textarea className="form-control" value={newPrescription.parentNote} onChange={e => setNewPrescription(prev => ({ ...prev, parentNote: e.target.value }))} />
                          </div>
                          
                          {/* Upload ảnh đơn thuốc */}
                          <div className="mb-3">
                            <label className="form-label">Ảnh đơn thuốc</label>
                            <input type="file" accept="image/*" className="form-control" onChange={handleUploadImage} ref={fileInputRef} disabled={uploading} />
                            {uploading && <div className="text-info">Đang upload...</div>}
                            {uploadError && <div className="text-danger">{uploadError}</div>}
                            {newPrescription.prescriptionFile && renderPrescriptionFile(newPrescription.prescriptionFile)}
                          </div>
                          
                          {/* Chọn học sinh */}
                          <div className="mb-3">
                            <label className="form-label">Chọn học sinh</label>
                            <select className="form-select" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} required>
                              {students.map(s => (
                                <option key={s.studentId} value={s.studentId}>{s.fullName}</option>
                              ))}
                            </select>
                          </div>
                          
                          {/* Danh sách thuốc */}
                          <div className="mb-3">
                            <label className="form-label">Danh sách thuốc</label>
                            {newPrescription.medications.map((med, idx) => (
                              <div key={idx} className="border rounded p-2 mb-2">
                                <div className="row g-2 align-items-center">
                                  <div className="col">
                                    <input type="text" className="form-control" placeholder="Tên thuốc" value={med.medicationName} onChange={e => handleChangeMedication(idx, 'medicationName', e.target.value)} required />
                                  </div>
                                  <div className="col">
                                    <input type="text" className="form-control" placeholder="Liều dùng" value={med.dosage} onChange={e => handleChangeMedication(idx, 'dosage', e.target.value)} required />
                                  </div>
                                  <div className="col-auto">
                                    <input type="number" className="form-control" placeholder="Số lượng" value={med.quantity} onChange={e => handleChangeMedication(idx, 'quantity', e.target.value)} required min="1" />
                                  </div>
                                  <div className="col-auto">
                                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveMedication(idx)}>Xóa</button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button type="button" className="btn btn-outline-primary btn-sm mt-2" onClick={handleAddMedication}>+ Thêm thuốc</button>
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Đóng</button>
                          <button type="submit" className="btn btn-primary" disabled={adding}>
                            {adding ? 'Đang tạo...' : 'Tạo đơn thuốc'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* ===== EMPTY STATE ===== */}
              
              {/* Nếu không có đơn thuốc, hiển thị thông báo và nút tạo đơn */}
              {sortedPrescriptions.length === 0 && !loading && (
                <div className="alert alert-info text-center">
                  Không có đơn thuốc nào.
                </div>
              )}

              {/* ===== DANH SÁCH ĐƠN THUỐC ===== */}
              <div className="list-group">
                {sortedPrescriptions.map((p) => {
                  const presId = p.parentPrescriptionId || p.prescriptionId;
                  const isSelected = selectedPrescription === presId;
                  
                  let studentName = prescriptionStudents[presId] || 'Không rõ';
                  return (
                    // ===== PRESCRIPTION CARD =====
                    <div key={presId} className="card mb-3 shadow-sm">
                      
                      {/* ===== CARD HEADER ===== */}
                      <div className="card-header bg-light">
                        <h5 className="mb-0 text-primary">Đơn thuốc #{presId}</h5>
                        {studentName && (
                          <div className="text-secondary small mt-1"><strong>Học sinh:</strong> {studentName}</div>
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
                              onClick={() => toggleShowMedicals(presId)}
                              disabled={loadingMedicals && isSelected}
                            >
                              {loadingMedicals && isSelected ? "Đang tải..." : (isSelected ? "Ẩn chi tiết thuốc" : "Xem chi tiết thuốc")}
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
                      {isSelected && (
                        <div className="card-footer bg-white">
                          <h6 className="text-muted">Chi tiết thuốc:</h6>
                          {loadingMedicals ? <p>Đang tải...</p> : (
                            medicals.length > 0 ? (
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
                                    {medicals.map((med) => (
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
                            ) : <p>Không có chi tiết thuốc.</p>
                          )}
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