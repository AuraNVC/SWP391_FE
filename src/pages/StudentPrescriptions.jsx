import React, { useState, useEffect } from "react";
import { useUserRole } from '../contexts/UserRoleContext';
import { API_SERVICE } from '../services/api';

export default function StudentPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [medicalsMap, setMedicalsMap] = useState({}); // {prescriptionId: [meds]}
  const [loading, setLoading] = useState(true);
  const [loadingMedicals, setLoadingMedicals] = useState(false);
  const [error, setError] = useState(null);
  const { userRole } = useUserRole();
  const [parentNameMap, setParentNameMap] = useState({});
  const [studentId, setStudentId] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    const fetchStudentAndPrescriptions = async () => {
      setLoading(true);
      setError(null);
      try {
        const sid = localStorage.getItem('userId');
        setStudentId(sid);
        if (!sid) throw new Error('Student ID not found');
        // Lấy thông tin học sinh để lấy parentId
        const studentData = await API_SERVICE.studentAPI.getById(sid);
        const pid = studentData.parent?.parentId || studentData.parentId;
        setParentId(pid);
        if (!pid) throw new Error('Không tìm thấy parentId');
        // Lấy tất cả đơn thuốc của parent
        let data = await API_SERVICE.parentPrescriptionAPI.getPrescriptionByParent(pid);
        if (!data || data.length === 0) {
          data = await API_SERVICE.parentPrescriptionAPI.getByParent(pid);
        }
        // Lấy tên phụ huynh cho từng đơn thuốc nếu có
        const parentMap = {};
        for (const p of data) {
          if (p.parent && p.parent.fullName) {
            parentMap[p.prescriptionId || p.parentPrescriptionId] = p.parent.fullName;
          }
        }
        setParentNameMap(parentMap);
        // Lấy danh sách thuốc cho từng đơn, lọc theo studentId
        const medsMap = {};
        for (const p of data) {
          const presId = p.parentPrescriptionId || p.prescriptionId;
          let meds = await API_SERVICE.medicationAPI.getByPrescription(presId);
          if (!meds || meds.length === 0) {
            meds = await API_SERVICE.prescriptionAPI.getByPrescription(presId);
          }
          if (meds && meds.length > 0) {
            medsMap[presId] = meds.filter(med => med.studentId == sid);
          } else {
            medsMap[presId] = [];
          }
        }
        // Chỉ lấy các đơn thuốc có ít nhất 1 thuốc dành cho học sinh này
        const filteredPrescriptions = data.filter(p => {
          const presId = p.parentPrescriptionId || p.prescriptionId;
          return medsMap[presId] && medsMap[presId].length > 0;
        });
        setPrescriptions(filteredPrescriptions);
        setMedicalsMap(medsMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (userRole === 'student') {
      fetchStudentAndPrescriptions();
    } else {
      setLoading(false);
      setError('Access denied. Student role required.');
    }
  }, [userRole]);

  const [showDetail, setShowDetail] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageInModal, setImageInModal] = useState(null);

  const renderPrescriptionFile = (file) => {
    if (!file) return <span className="text-muted">Không có file</span>;
    let finalUrl = file;
    if (file.startsWith('http')) {
      finalUrl = file.replace(/([^:]\/)\/+/, "$1");
    } else {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      finalUrl = `${baseUrl}/files/blogs/${file.replace(/^\//, '')}`;
    }
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
    if (finalUrl && finalUrl.toLowerCase().endsWith('.pdf')) {
      return <a href={finalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm mb-2">Tải file PDF</a>;
    }
    return <a href={finalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary btn-sm mb-2">Xem file</a>;
  };

  // Lọc và sắp xếp đơn thuốc
  const filteredPrescriptions = prescriptions.filter(p => {
    if (!searchTerm) return true;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const presId = p.parentPrescriptionId || p.prescriptionId;
    const meds = medicalsMap[presId] || [];
    return (
      (p.schedule && p.schedule.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (p.parentNote && p.parentNote.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (p.submittedDate && p.submittedDate.toString().toLowerCase().includes(lowerCaseSearchTerm)) ||
      meds.some(med => med.medicationName && med.medicationName.toLowerCase().includes(lowerCaseSearchTerm))
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

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="min-vh-100 d-flex flex-column">
      <main className="container-fluid py-5 px-10 flex-grow-1" style={{ marginTop: "80px" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10">
              <div className="text-center mb-5">
                <h1 className="display-4 mb-3 fw-bold">Đơn thuốc của bạn</h1>
                <p className="lead text-muted">Danh sách đơn thuốc phụ huynh gửi cho bạn</p>
              </div>
              <div className="row mb-4 g-3">
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm theo lịch uống, ghi chú, tên thuốc hoặc ngày tạo..."
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
              {sortedPrescriptions.length === 0 && !loading && (
                <div className="alert alert-info text-center">Không tìm thấy đơn thuốc nào.</div>
              )}
              <div className="list-group">
                {sortedPrescriptions.map((p) => {
                  const presId = p.parentPrescriptionId || p.prescriptionId;
                  const parentName = parentNameMap[presId] || (p.parent && p.parent.fullName) || '';
                  const meds = medicalsMap[presId] || [];
                  return (
                    <div key={presId} className="card mb-3 shadow-sm">
                      <div className="card-header bg-light">
                        <h5 className="mb-0 text-primary">Đơn thuốc #{presId}</h5>
                        {parentName && (
                          <div className="text-secondary small mt-1"><strong>Phụ huynh:</strong> {parentName}</div>
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
                              onClick={() => setShowDetail(showDetail === presId ? null : presId)}
                            >
                              {showDetail === presId ? "Ẩn chi tiết thuốc" : "Xem chi tiết thuốc"}
                            </button>
                          </div>
                          <div className="col-md-4">
                            <strong className="d-block mb-2">File đính kèm:</strong>
                            {renderPrescriptionFile(p.prescriptionFile)}
                          </div>
                        </div>
                      </div>
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
                                  </tr>
                                </thead>
                                <tbody>
                                  {meds.map((med) => (
                                    <tr key={med.medicationId}>
                                      <td>{med.medicationName}</td>
                                      <td>{med.dosage}</td>
                                      <td>{med.quantity}</td>
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