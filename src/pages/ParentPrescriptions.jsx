import React, { useState, useEffect, useRef, useCallback } from "react";
import { useUserRole } from '../contexts/UserRoleContext';
import { API_SERVICE } from '../services/api';

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
    prescriptionFile: '',
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
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageInModal, setImageInModal] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [prescriptionStudents, setPrescriptionStudents] = useState({});

  const getStudentForPrescription = async (prescriptionId) => {
    try {
      let meds = await API_SERVICE.medicationAPI.getByPrescription(prescriptionId);
      if (!meds || meds.length === 0) {
        meds = await API_SERVICE.prescriptionAPI.getByPrescription(prescriptionId);
      }
      if (meds && meds.length > 0 && meds[0].studentId) {
        const student = students.find(s => s.studentId == meds[0].studentId);
        return student ? student.fullName : 'Không rõ';
      }
    } catch (err) {
      console.error('Error fetching student info:', err);
    }
    return 'Không rõ';
  };

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const parentId = localStorage.getItem('userId');
      if (!parentId) throw new Error('Parent ID not found');
      let data = await API_SERVICE.parentPrescriptionAPI.getPrescriptionByParent(parentId);
      console.log('parentPrescriptionAPI.getPrescriptionByParent:', data);
      if (data && !Array.isArray(data) && data.prescriptions) {
        data = data.prescriptions;
      }
      if (!data || data.length === 0) {
        data = await API_SERVICE.parentPrescriptionAPI.getByParent(parentId);
        console.log('parentPrescriptionAPI.getByParent:', data);
        if (data && !Array.isArray(data) && data.prescriptions) {
          data = data.prescriptions;
        }
      }
      if (!data || data.length === 0) {
        data = await API_SERVICE.prescriptionAPI.getByParent(parentId);
        console.log('prescriptionAPI.getByParent:', data);
        if (data && !Array.isArray(data) && data.prescriptions) {
          data = data.prescriptions;
        }
      }
      setPrescriptions(Array.isArray(data) ? data : []);
      if (!data || data.length === 0) {
        setError('Không có đơn thuốc nào cho phụ huynh này.');
      }
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
  }, [students]);

  useEffect(() => {
    if (userRole === 'parent') {
      fetchPrescriptions();
    } else {
      setLoading(false);
      setError('Access denied. Parent role required.');
    }
  }, [userRole, fetchPrescriptions]);

  useEffect(() => {
    if (userRole === 'parent') {
      const fetchStudents = async () => {
        const parentId = localStorage.getItem('userId');
        if (parentId) {
          const data = await API_SERVICE.parentAPI.getParent(parentId);
          setStudents(data);
          if (data.length > 0) setSelectedStudentId(data[0].studentId);
        }
      };
      fetchStudents();
    }
  }, [userRole]);

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

  const renderPrescriptionFile = (file) => {
    if (!file) return <span className="text-muted">Không có file</span>;
    
    let finalUrl = file;

    if (file.startsWith('http')) {
      finalUrl = file.replace(/([^:]\/)\/+/g, "$1");
    } else {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      finalUrl = `${baseUrl}/files/blogs/${file.replace(/^\//, '')}`;
    }

    if (finalUrl && (finalUrl.toLowerCase().endsWith('.jpg') || finalUrl.toLowerCase().endsWith('.jpeg') || finalUrl.toLowerCase().endsWith('.png') || finalUrl.toLowerCase().endsWith('.gif'))) {
      return (
        <div>
          <img src={finalUrl} alt="prescription" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #dee2e6' }} className="d-block mb-2" />
          <button className="btn btn-outline-info btn-sm" onClick={() => openImageModal(finalUrl)}>Xem ảnh</button>
        </div>
      );
    }
    if (finalUrl && finalUrl.toLowerCase().endsWith('.pdf')) {
      return <a href={finalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm mb-2">Tải file PDF</a>;
    }
    return <a href={finalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary btn-sm mb-2">Xem file</a>;
  };

  const toggleShowMedicals = async (prescriptionId) => {
    if (selectedPrescription === prescriptionId) {
      setSelectedPrescription(null);
      setMedicals([]);
      return;
    }
    
    setLoadingMedicals(true);
    setSelectedPrescription(prescriptionId);
    try {
      let meds = await API_SERVICE.medicationAPI.getByPrescription(prescriptionId);
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

  const handleAddMedication = () => {
    setNewPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, { medicationName: '', dosage: '', quantity: 1 }]
    }));
  };

  const handleRemoveMedication = (idx) => {
    setNewPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== idx)
    }));
  };

  const handleChangeMedication = (idx, field, value) => {
    setNewPrescription(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => i === idx ? { ...med, [field]: value } : med)
    }));
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      const parentId = localStorage.getItem('userId');
      if (!parentId) {
        throw new Error("Không tìm thấy Parent ID. Vui lòng đăng nhập lại.");
      }
      if (!selectedStudentId) {
        throw new Error("Vui lòng chọn học sinh cho đơn thuốc.");
      }
      const now = new Date().toLocaleDateString('en-CA');
      const body = {
        parentId: parseInt(parentId, 10),
        schedule: newPrescription.schedule,
        parentNote: newPrescription.parentNote,
        prescriptionFile: newPrescription.prescriptionFile || "",
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
      for (const med of newPrescription.medications) {
        if (!med.medicationName || !med.dosage) continue;
        const medBody = {
          prescriptionId: prescriptionId,
          medicationName: med.medicationName,
          dosage: med.dosage,
          quantity: parseInt(med.quantity, 10) || 1,
          studentId: selectedStudentId
        };
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
      setShowModal(false);
      setNewPrescription({ schedule: '', parentNote: '', prescriptionFile: '', medications: [{ medicationName: '', dosage: '', quantity: 1 }] });
      await fetchPrescriptions();
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

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
      setNewPrescription(prev => ({ ...prev, prescriptionFile: result.pathFull }));
    } catch (err) {
      setUploadError("Upload ảnh thất bại!");
    } finally {
      setUploading(false);
    }
  };

  const openImageModal = (imageUrl) => {
    setImageInModal(imageUrl);
    setShowImageModal(true);
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
                            <label className="form-label">Chọn học sinh</label>
                            <select className="form-select" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} required>
                              {students.map(s => (
                                <option key={s.studentId} value={s.studentId}>{s.fullName}</option>
                              ))}
                            </select>
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

              {sortedPrescriptions.length === 0 && !loading && (
                <div className="alert alert-info text-center">Không tìm thấy đơn thuốc phù hợp.</div>
              )}

              <div className="list-group">
                {sortedPrescriptions.map((p) => {
                  const presId = p.parentPrescriptionId || p.prescriptionId;
                  const isSelected = selectedPrescription === presId;
                  
                  let studentName = prescriptionStudents[presId] || 'Không rõ';
                  return (
                    <div key={presId} className="card mb-3 shadow-sm">
                      <div className="card-header bg-light">
                        <h5 className="mb-0 text-primary">Đơn thuốc #{presId}</h5>
                        {studentName && (
                          <div className="text-secondary small mt-1"><strong>Học sinh:</strong> {studentName}</div>
                        )}
                      </div>
                      <div className="card-body">
                        <div className="row align-items-center">
                          <div className="col-md-8">
                            <p className="mb-2"><strong>Ngày tạo:</strong> {p.submittedDate ? new Date(p.submittedDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                            <p className="mb-2"><strong>Lịch uống:</strong> {p.schedule || 'Chưa có'}</p>
                            <p className="mb-3"><strong>Ghi chú:</strong> {p.parentNote || 'Không có'}</p>
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() => toggleShowMedicals(presId)}
                              disabled={loadingMedicals && isSelected}
                            >
                              {loadingMedicals && isSelected ? "Đang tải..." : (isSelected ? "Ẩn chi tiết thuốc" : "Xem chi tiết thuốc")}
                            </button>
                          </div>
                          <div className="col-md-4">
                            <strong className="d-block mb-2">File đính kèm:</strong>
                            {renderPrescriptionFile(p.prescriptionFile)}
                          </div>
                        </div>
                      </div>
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
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {medicals.map((med) => (
                                      <tr key={med.medicationId}>
                                        <td>{med.medicationName}</td>
                                        <td>{med.dosage}</td>
                                        <td>{med.quantity}</td>
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