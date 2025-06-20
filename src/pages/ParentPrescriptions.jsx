import React, { useState, useEffect } from "react";
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

  // Lấy danh sách đơn thuốc của phụ huynh
  useEffect(() => {
    const fetchPrescriptions = async () => {
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
    };
    if (userRole === 'parent') fetchPrescriptions();
    else {
      setLoading(false);
      setError('Access denied. Parent role required.');
    }
  }, [userRole]);

  // Lấy chi tiết thuốc theo đơn
  const handleShowMedicals = async (prescriptionId) => {
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
    } finally {
      setLoadingMedicals(false);
    }
  };

  // Hàm kiểm tra file là ảnh hay pdf
  const renderPrescriptionFile = (fileUrl) => {
    if (!fileUrl) return <span className="text-muted">Không có file</span>;
    if (fileUrl.endsWith('.jpg') || fileUrl.endsWith('.jpeg') || fileUrl.endsWith('.png') || fileUrl.endsWith('.gif')) {
      return <img src={fileUrl} alt="prescription" style={{ maxWidth: 200, maxHeight: 200 }} className="d-block mb-2" />;
    }
    if (fileUrl.endsWith('.pdf')) {
      return <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm mb-2">Tải file PDF</a>;
    }
    return <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary btn-sm mb-2">Tải file</a>;
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
    try {
      const parentId = localStorage.getItem('userId');
      const now = new Date().toLocaleDateString('en-CA');
      // Gửi đơn thuốc trước, không gửi medications
      const body = {
        parentId,
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
      if (!response.ok) throw new Error('Không thể tạo đơn thuốc');
      const prescription = await response.json();
      // Ưu tiên các trường phổ biến
      const prescriptionId = prescription.parentPrescriptionId || prescription.prescriptionId || prescription.id;
      // Gọi API add medication cho từng thuốc
      for (const med of newPrescription.medications) {
        const medBody = {
          prescriptionId, // hoặc parentPrescriptionId tuỳ BE
          medicationName: med.medicationName,
          dosage: med.dosage,
          quantity: med.quantity
        };
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/medication/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(medBody)
        });
      }
      setShowModal(false);
      setNewPrescription({ schedule: '', parentNote: '', prescriptionFile: '', medications: [{ medicationName: '', dosage: '', quantity: 1 }] });
      // Reload lại danh sách đơn thuốc như cũ...
      setLoading(true);
      setError(null);
      let reloadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/parentPrescription/getPrescriptionByParent?parentId=${parentId}`);
      if (!reloadRes.ok) reloadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/parentPrescription/getByParent?parentId=${parentId}`);
      if (!reloadRes.ok) reloadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/prescription/getPrescriptionByParent?parentId=${parentId}`);
      if (reloadRes.ok) {
        const data = await reloadRes.json();
        setPrescriptions(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
      setLoading(false);
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
                            <label className="form-label">Link file đơn thuốc (nếu có)</label>
                            <input type="text" className="form-control" value={newPrescription.prescriptionFile} onChange={e => setNewPrescription(prev => ({ ...prev, prescriptionFile: e.target.value }))} />
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
              {prescriptions.length === 0 ? (
                <div className="text-center text-muted">
                  <p>Không có đơn thuốc nào</p>
                </div>
              ) : (
                <div className="list-group">
                  {prescriptions.map((pres) => (
                    <div key={pres.prescriptionId} className="card mb-3">
                      <div className="card-body">
                        <h5 className="card-title">Đơn thuốc #{pres.prescriptionId}</h5>
                        <p className="card-text"><strong>Ngày kê:</strong> {pres.submittedDate ? new Date(pres.submittedDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                        <p className="card-text"><strong>Lịch uống:</strong> {pres.schedule}</p>
                        <p className="card-text"><strong>Ghi chú phụ huynh:</strong> {pres.parentNote}</p>
                        <div className="mb-2">
                          <strong>File đơn thuốc:</strong><br />
                          {renderPrescriptionFile(pres.prescriptionFile)}
                        </div>
                        <div className="mb-2">
                          {/* Đã bỏ hiển thị thông tin phụ huynh theo yêu cầu */}
                        </div>
                        <button
                          className="btn btn-info"
                          onClick={() => handleShowMedicals(pres.prescriptionId)}
                          disabled={loadingMedicals && selectedPrescription === pres.prescriptionId}
                        >
                          {loadingMedicals && selectedPrescription === pres.prescriptionId ? "Đang tải..." : "Xem chi tiết thuốc"}
                        </button>
                        {selectedPrescription === pres.prescriptionId && (
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
                                      <th>Số lượng kê</th>
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