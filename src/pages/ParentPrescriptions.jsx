import React, { useState, useEffect, useRef, useCallback } from "react";
import { useUserRole } from '../contexts/UserRoleContext';

export default function ParentPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [medicals, setMedicals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMedicals, setLoadingMedicals] = useState(false);
  const [error, setError] = useState(null);
  const { userRole } = useUserRole();
  const [showModal, setShowModal] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    schedule: '',
    parentNote: '',
    prescriptionFile: '', // URL hoặc file, tuỳ backend
    medications: [
      { medicationName: '', dosage: '', quantity: 1 }
    ]
  });
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const parentId = localStorage.getItem('userId');
      if (!parentId) throw new Error('Parent ID not found');
      let response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/parentPrescription/getPrescriptionByParent?parentId=${parentId}`);
      if (!response.ok) {
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/parentPrescription/getByParent?parentId=${parentId}`);
      }
      if (!response.ok) {
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/prescription/getPrescriptionByParent?parentId=${parentId}`);
      }
      if (!response.ok) throw new Error('Không thể lấy danh sách đơn thuốc');
      const data = await response.json();
      setPrescriptions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy danh sách đơn thuốc của phụ huynh
  useEffect(() => {
    if (userRole === 'parent') {
      fetchPrescriptions();
    } else {
      setLoading(false);
      setError('Access denied. Parent role required.');
    }
  }, [userRole, fetchPrescriptions]);

  // Lấy và ẩn chi tiết thuốc theo đơn
  const toggleShowMedicals = async (prescriptionId) => {
    // Nếu click vào đơn đang mở, thì đóng lại
    if (selectedPrescription === prescriptionId) {
      setSelectedPrescription(null);
      setMedicals([]);
      return;
    }
    
    setLoadingMedicals(true);
    setSelectedPrescription(prescriptionId);
    try {
      let response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/medication/getMedicalByPrescription?prescriptionId=${prescriptionId}`);
      if (!response.ok) {
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/prescription/getMedicalByPrescription?prescriptionId=${prescriptionId}`);
      }
      if (!response.ok) throw new Error('Không thể lấy chi tiết thuốc');
      const data = await response.json();
      setMedicals(data);
    } catch (err) {
      setError(err.message);
      setMedicals([]);
    } finally {
      setLoadingMedicals(false);
    }
  };

  // Hàm kiểm tra file là ảnh hay pdf, đây là nơi duy nhất xử lý logic hiển thị
  const renderPrescriptionFile = (file) => {
    if (!file) return <span className="text-muted">Không có file</span>;
    
    let finalUrl = file;

    // Xử lý cả URL đầy đủ (dữ liệu cũ) và tên file (dữ liệu mới)
    if (file.startsWith('http')) {
      // Nếu là URL, sửa lỗi 2 dấu gạch chéo '//'
      finalUrl = file.replace(/([^:]\/)\/+/g, "$1");
    } else {
      // Nếu là tên file, tạo URL đầy đủ từ API base URL
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      finalUrl = `${baseUrl}/files/blogs/${file.replace(/^\//, '')}`;
    }

    if (finalUrl && (finalUrl.toLowerCase().endsWith('.jpg') || finalUrl.toLowerCase().endsWith('.jpeg') || finalUrl.toLowerCase().endsWith('.png') || finalUrl.toLowerCase().endsWith('.gif'))) {
      return <img src={finalUrl} alt="prescription" style={{ maxWidth: 200, maxHeight: 200 }} className="d-block mb-2" />;
    }
    if (finalUrl && finalUrl.toLowerCase().endsWith('.pdf')) {
      return <a href={finalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm mb-2">Tải file PDF</a>;
    }
    // Fallback cho các trường hợp khác hoặc URL không hợp lệ
    return <a href={finalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary btn-sm mb-2">Xem file</a>;
  };

  // Hàm xử lý thêm thuốc trong form
  const handleAddMedication = () => {
    setNewPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, { medicationName: '', dosage: '', quantity: 1 }]
    }));
  };
  // Hàm xử lý xoá thuốc trong form
  const handleRemoveMedication = (idx) => {
    setNewPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== idx)
    }));
  };
  // Hàm xử lý thay đổi trường trong form
  const handleChangeMedication = (idx, field, value) => {
    setNewPrescription(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => i === idx ? { ...med, [field]: value } : med)
    }));
  };

  // Hàm submit tạo đơn thuốc
  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      const parentId = localStorage.getItem('userId');
      if (!parentId) {
        throw new Error("Không tìm thấy Parent ID. Vui lòng đăng nhập lại.");
      }
      const now = new Date().toLocaleDateString('en-CA'); // Format YYYY-MM-DD cho DateOnly
      
      const body = {
        parentId: parseInt(parentId, 10), // Đảm bảo parentId là số
        schedule: newPrescription.schedule,
        parentNote: newPrescription.parentNote,
        prescriptionFile: newPrescription.prescriptionFile,
        submittedDate: now
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/parentPrescription/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Không thể tạo đơn thuốc: ${errorText}`);
      }
      const prescription = await response.json();
      
      const prescriptionId = prescription.parentPrescriptionId || prescription.prescriptionId || prescription.id;
      if (!prescriptionId) {
          throw new Error("Tạo đơn thuốc thành công nhưng không nhận được ID.");
      }

      // Gọi API add medication cho từng thuốc
      for (const med of newPrescription.medications) {
        if (!med.medicationName || !med.dosage) continue; // Bỏ qua nếu thuốc trống

        const medBody = {
          prescriptionId: prescriptionId, // Sửa lại tên trường ID cho đúng với yêu cầu của backend
          medicationName: med.medicationName,
          dosage: med.dosage,
          quantity: parseInt(med.quantity, 10) || 1
        };
        
        const medResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/medication/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(medBody)
        });

        if (!medResponse.ok) {
          const errorText = await medResponse.text();
          // Ném lỗi để dừng quá trình và hiển thị cho người dùng
          throw new Error(`Không thể lưu thuốc "${med.medicationName}": ${errorText}`);
        }
      }
      
      setShowModal(false);
      setNewPrescription({ schedule: '', parentNote: '', prescriptionFile: '', medications: [{ medicationName: '', dosage: '', quantity: 1 }] });
      
      // Reload lại danh sách đơn thuốc
      await fetchPrescriptions(); // Gọi lại hàm fetch đã có

    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    if (!searchTerm) return true;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      (p.schedule && p.schedule.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (p.parentNote && p.parentNote.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (p.submittedDate && p.submittedDate.toString().toLowerCase().includes(lowerCaseSearchTerm))
    );
  });

  const sortedPrescriptions = [...filteredPrescriptions].sort((a, b) => {
    const idA = a.parentPrescriptionId || a.prescriptionId;
    const idB = b.parentPrescriptionId || b.prescriptionId;
    if (sortOrder === 'newest') {
      return idB - idA;
    }
    return idA - idB;
  });

  // Hàm upload ảnh đơn thuốc
  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("imageFile", file);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/blog/uploadImage`, {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Lỗi khi upload ảnh");
      const result = await res.json();
      // Sửa lỗi: dùng result.pathFull để đảm bảo URL luôn chính xác
      setNewPrescription(prev => ({ ...prev, prescriptionFile: result.pathFull }));
    } catch (err) {
      setUploadError("Upload ảnh thất bại!");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="min-vh-100 d-flex flex-column">
      <main className="container-fluid py-5 px-10 flex-grow-1" style={{ marginTop: "80px" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10">
              <div className="text-center mb-5">
                <h1 className="display-4 mb-3 fw-bold">Đơn thuốc</h1>
                <p className="lead text-muted">Danh sách đơn thuốc của học sinh</p>
                <button className="btn btn-primary mt-3" onClick={() => setShowModal(true)}>+ Tạo đơn thuốc</button>
              </div>
              <div className="row mb-4 g-3">
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm theo lịch uống, ghi chú, hoặc ngày tạo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
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
              {/* Modal tạo đơn thuốc */}
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
                          <div className="mb-3">
                            <label className="form-label">Lịch uống</label>
                            <input type="text" className="form-control" value={newPrescription.schedule} onChange={e => setNewPrescription(prev => ({ ...prev, schedule: e.target.value }))} required />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Ghi chú phụ huynh</label>
                            <textarea className="form-control" value={newPrescription.parentNote} onChange={e => setNewPrescription(prev => ({ ...prev, parentNote: e.target.value }))} />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Ảnh đơn thuốc</label>
                            <input type="file" accept="image/*" className="form-control" onChange={handleUploadImage} ref={fileInputRef} disabled={uploading} />
                            {uploading && <div className="text-info">Đang upload...</div>}
                            {uploadError && <div className="text-danger">{uploadError}</div>}
                            {newPrescription.prescriptionFile && renderPrescriptionFile(newPrescription.prescriptionFile)}
                          </div>
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
                                  <div className="col-3">
                                    <input type="number" min="1" className="form-control" placeholder="Số lượng" value={med.quantity} onChange={e => handleChangeMedication(idx, 'quantity', e.target.value)} required />
                                  </div>
                                  <div className="col-auto">
                                    {newPrescription.medications.length > 1 && (
                                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveMedication(idx)}>&times;</button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button type="button" className="btn btn-outline-success btn-sm" onClick={handleAddMedication}>+ Thêm thuốc</button>
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Huỷ</button>
                          <button type="submit" className="btn btn-primary" disabled={adding}>{adding ? 'Đang lưu...' : 'Lưu đơn thuốc'}</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
              {/* Kết thúc modal */}
              {sortedPrescriptions.length === 0 ? (
                <div className="text-center text-muted">
                  <p>Không có đơn thuốc nào</p>
                </div>
              ) : (
                <div className="list-group">
                  {sortedPrescriptions.map((p) => (
                    <div key={p.parentPrescriptionId || p.prescriptionId} className="list-group-item list-group-item-action">
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{p.parentPrescriptionId ? `Đơn thuốc #${p.parentPrescriptionId}` : `Đơn thuốc #${p.prescriptionId}`}</h5>
                        <small>{p.submittedDate ? new Date(p.submittedDate).toLocaleDateString('vi-VN') : 'N/A'}</small>
                      </div>
                      <p className="mb-1">{p.schedule}</p>
                      <p className="mb-1">{p.parentNote}</p>
                      <div className="mb-2">
                        <strong>File đơn thuốc:</strong><br />
                        {renderPrescriptionFile(p.prescriptionFile)}
                      </div>
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => toggleShowMedicals(p.prescriptionId)}
                        disabled={loadingMedicals && selectedPrescription === p.prescriptionId}
                      >
                        {loadingMedicals && selectedPrescription === p.prescriptionId 
                          ? "Đang tải..." 
                          : (selectedPrescription === p.prescriptionId ? "Ẩn chi tiết thuốc" : "Xem chi tiết thuốc")}
                      </button>
                      {selectedPrescription === p.prescriptionId && (
                        <div className="mt-3">
                          <h6>Chi tiết thuốc:</h6>
                          {medicals.length === 0 ? (
                            <p>Không có thuốc nào trong đơn này.</p>
                          ) : (
                            <div className="table-responsive">
                              <table className="table table-bordered">
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
                                      <td>{med.remainingQuantity}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {sortedPrescriptions.length === 0 && !loading && (
                <div className="alert alert-info text-center">Không tìm thấy đơn thuốc phù hợp.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 