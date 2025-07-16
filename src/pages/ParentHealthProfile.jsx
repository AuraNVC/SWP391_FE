import React, { useState, useEffect } from 'react';
import { API_SERVICE } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

const ParentHealthProfile = () => {
  const { setNotif } = useNotification();
  const [students, setStudents] = useState([]);
  const [healthProfiles, setHealthProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [updateData, setUpdateData] = useState({
    bloodType: '',
    allergies: ''
  });
  // State for health check results
  const [healthResults, setHealthResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [selectedStudentForResults, setSelectedStudentForResults] = useState(null);
  // State for vaccination results
  const [vaccinationResults, setVaccinationResults] = useState([]);
  const [loadingVaccination, setLoadingVaccination] = useState(false);
  const [selectedStudentForVaccination, setSelectedStudentForVaccination] = useState(null);
  const [medicalEvents, setMedicalEvents] = useState([]);
  const [loadingMedicalEvents, setLoadingMedicalEvents] = useState(false);
  const [selectedStudentForMedicalEvents, setSelectedStudentForMedicalEvents] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const parentId = localStorage.getItem('userId');
        if (!parentId) {
          throw new Error('Parent ID not found');
        }

        const data = await API_SERVICE.parentAPI.getParent(parentId);
        setStudents(data);

        // Fetch health profiles for each student
        const profiles = {};
        for (const student of data) {
          const healthData = await API_SERVICE.healthProfileAPI.get(student.studentId);
          profiles[student.studentId] = healthData;
        }
        setHealthProfiles(profiles);
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleUpdateClick = (profile) => {
    setSelectedProfile(profile);
    setUpdateData({
      bloodType: profile.bloodType || '',
      allergies: profile.allergies || ''
    });
    setShowModal(true);
  };

  const handleViewResultsClick = async (profile) => {
    // Hide vaccination and medical events when viewing health check results
    setSelectedStudentForVaccination(null);
    setVaccinationResults([]);
    setSelectedStudentForMedicalEvents(null);
    setMedicalEvents([]);
    if (!profile || !profile.healthProfileId) {
      setNotif({ message: 'Không tìm thấy hồ sơ sức khỏe cho học sinh này.', type: 'error' });
      return;
    }

    if (selectedStudentForResults?.studentId === profile.studentId) {
      // If the same student's results are already shown, hide them
      setSelectedStudentForResults(null);
      setHealthResults([]);
      return;
    }

    setLoadingResults(true);
    setSelectedStudentForResults(profile);
    setError(null);

    try {
      const response = await API_SERVICE.healthCheckResultAPI.getByProfile(profile.healthProfileId);
      const results = response;

      // Fetch schedule details for each result
      const enrichedResults = await Promise.all(
        results.map(async (result) => {
          if (result.healthCheckScheduleId) {
            try {
              const scheduleData = await API_SERVICE.healthCheckScheduleAPI.get(result.healthCheckScheduleId);
              return { ...result, schedule: scheduleData };
            } catch (scheduleErr) {
              console.error(`Failed to fetch health schedule for result ${result.resultId}:`, scheduleErr);
            }
          }
          return { ...result, schedule: null };
        })
      );
      setHealthResults(enrichedResults);
    } catch (err) {
      console.error('Error fetching health results:', err);
      setError(err.message);
      setHealthResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleViewVaccinationResultsClick = async (profile) => {
    // Hide health check and medical events when viewing vaccination results
    setSelectedStudentForResults(null);
    setHealthResults([]);
    setSelectedStudentForMedicalEvents(null);
    setMedicalEvents([]);
    if (!profile || !profile.healthProfileId) {
      setNotif({ message: 'Không tìm thấy hồ sơ sức khỏe cho học sinh này.', type: 'error' });
      return;
    }

    if (selectedStudentForVaccination?.studentId === profile.studentId) {
      setSelectedStudentForVaccination(null);
      setVaccinationResults([]);
      return;
    }

    setLoadingVaccination(true);
    setSelectedStudentForVaccination(profile);
    setError(null);

    try {
      const response = await API_SERVICE.vaccinationResultAPI.getByProfile(profile.healthProfileId);
      const results = response;
      // Fetch schedule details for each result
      const enrichedResults = await Promise.all(
        results.map(async (result) => {
          if (result.vaccinationScheduleId) {
            try {
              const scheduleData = await API_SERVICE.vaccinationScheduleAPI.getById(result.vaccinationScheduleId);
              return { ...result, schedule: scheduleData };
            } catch (scheduleErr) {
              console.error(`Failed to fetch vaccination schedule for result ${result.resultId}:`, scheduleErr);
            }
          }
          return { ...result, schedule: null };
        })
      );
      setVaccinationResults(enrichedResults);
    } catch (err) {
      console.error('Error fetching vaccination results:', err);
      setError(err.message);
      setVaccinationResults([]);
    } finally {
      setLoadingVaccination(false);
    }
  };

  const handleViewMedicalEventsClick = async (profile) => {
    setSelectedStudentForResults(null);
    setHealthResults([]);
    setSelectedStudentForVaccination(null);
    setVaccinationResults([]);
    if (!profile || !profile.studentId) {
      setNotif({ message: 'Không tìm thấy học sinh này.', type: 'error' });
      return;
    }
    if (selectedStudentForMedicalEvents?.studentId === profile.studentId) {
      setSelectedStudentForMedicalEvents(null);
      setMedicalEvents([]);
      return;
    }
    setLoadingMedicalEvents(true);
    setSelectedStudentForMedicalEvents(profile);
    setError(null);
    try {
      const response = await API_SERVICE.medicalEventAPI.getByStudent(profile.studentId);
      const results = response;
      setMedicalEvents(Array.isArray(results) ? results : []);
    } catch (err) {
      setError(err.message);
      setMedicalEvents([]);
    } finally {
      setLoadingMedicalEvents(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedProfile || !selectedProfile.healthProfileId) {
        throw new Error('Không tìm thấy hồ sơ sức khỏe để cập nhật.');
      }
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/healthProfile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          healthProfileId: selectedProfile.healthProfileId,
          bloodType: updateData.bloodType,
          allergies: updateData.allergies
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Lỗi cập nhật: ' + errorText);
      }
      // Cập nhật lại state FE
      setHealthProfiles((prev) => ({
        ...prev,
        [selectedProfile.studentId]: {
          ...selectedProfile,
          bloodType: updateData.bloodType,
          allergies: updateData.allergies
        }
      }));
      setShowModal(false);
      setNotif({ message: 'Cập nhật thành công!', type: 'success' });
    } catch (err) {
      setNotif({ message: err.message, type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column">
        <main className="container-fluid py-5 px-10 flex-grow-1" style={{ marginTop: "80px" }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="text-center mb-5">
                  <h1 className="display-4 mb-3 fw-bold">Hồ sơ sức khỏe</h1>
                  <p className="lead text-muted">Cập nhật hồ sơ sức khỏe của học sinh</p>
                </div>
                <div className="d-flex justify-content-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex flex-column">
        <main className="container-fluid py-5 px-10 flex-grow-1" style={{ marginTop: "80px" }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="text-center mb-5">
                  <h1 className="display-4 mb-3 fw-bold">Hồ sơ sức khỏe</h1>
                  <p className="lead text-muted">Cập nhật hồ sơ sức khỏe của học sinh</p>
                </div>
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column">
      <main className="container-fluid py-5 px-10 flex-grow-1" style={{ marginTop: "80px" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="text-center mb-5">
                <h1 className="display-4 mb-3 fw-bold">Hồ sơ sức khỏe</h1>
                <p className="lead text-muted">Cập nhật hồ sơ sức khỏe của học sinh</p>
              </div>
              {students.length === 0 ? (
                <div className="alert alert-info">Không có học sinh nào</div>
              ) : (
                <div className="list-group">
                  {students.map((student) => (
                    <div key={student.studentId} className="list-group-item list-group-item-action p-4 mb-3 shadow-sm rounded">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="w-100">
                          <h5 className="mb-3 text-primary fw-bold">{student.fullName}</h5>
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <p className="mb-2">
                                <i className="bi bi-person-badge me-2"></i>
                                <strong>Mã học sinh:</strong> {student.studentNumber}
                              </p>
                              <p className="mb-2">
                                <i className="bi bi-calendar-date me-2"></i>
                                <strong>Ngày sinh:</strong> {new Date(student.dateOfBirth).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="col-md-6">
                              <p className="mb-2">
                                <i className="bi bi-gender-ambiguous me-2"></i>
                                <strong>Giới tính:</strong> {student.gender}
                              </p>
                              <p className="mb-0">
                                <i className="bi bi-mortarboard me-2"></i>
                                <strong>Lớp:</strong> {student.className}
                              </p>
                            </div>
                          </div>
                          {healthProfiles[student.studentId] && (
                            <div className="border-top pt-3">
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="text-success mb-0">Thông tin sức khỏe</h6>
                                <button
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => handleUpdateClick(healthProfiles[student.studentId])}
                                >
                                  <i className="bi bi-pencil me-1"></i>
                                  Cập nhật
                                </button>
                              </div>
                              <div className="row">
                                <div className="col-md-6">
                                  <p className="mb-2">
                                    <i className="bi bi-droplet me-2"></i>
                                    <strong>Nhóm máu:</strong> {healthProfiles[student.studentId].bloodType}
                                  </p>
                                </div>
                                <div className="col-md-6">
                                  <p className="mb-2">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    <strong>Dị ứng:</strong> {healthProfiles[student.studentId].allergies}
                                  </p>
                                </div>
                              </div>

                              <hr className="my-3"/>
                              
                              <div className='d-flex gap-2 flex-wrap mb-3'>
                                  <button
                                    className="btn btn-outline-info btn-sm"
                                    onClick={() => handleViewResultsClick(healthProfiles[student.studentId])}
                                  >
                                    <i className="bi bi-card-list me-1"></i>
                                    Xem lịch sử khám
                                  </button>
                                  <button
                                    className="btn btn-outline-warning btn-sm"
                                    onClick={() => handleViewVaccinationResultsClick(healthProfiles[student.studentId])}
                                    >
                                    <i className="bi bi-shield-check me-1"></i>
                                    Xem lịch sử tiêm chủng
                                    </button>
                                  <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => handleViewMedicalEventsClick(student)}
                                  >
                                    <i className="bi bi-activity me-1"></i>
                                    Xem sự kiện y tế
                                  </button>
                              </div>

                              {/* Health Check Results Section */}
                              {selectedStudentForResults?.studentId === student.studentId && (
                                <div className="mt-4 border-top pt-3">
                                  <h6 className='text-info mb-3'>Lịch sử khám định kì</h6>
                                  {loadingResults ? (
                                    <div className="d-flex justify-content-center">
                                      <div className="spinner-border spinner-border-sm" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                      </div>
                                    </div>
                                  ) : healthResults.length > 0 ? (
                                    <ul className="list-group" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                      {healthResults.map(result => (
                                        <li key={result.healthCheckupRecordId} className="list-group-item">
                                          {result.schedule && <h6 className='fw-bold text-primary'>{result.schedule.name}</h6>}
                                          <p className='mb-1'><strong>Ngày khám:</strong> {result.schedule ? new Date(result.schedule.checkDate).toLocaleDateString() : 'Chưa cập nhật'}</p>
                                          <p className='mb-1'><strong>Địa điểm:</strong> {result.schedule?.location || 'Chưa cập nhật'}</p>
                                          <p className='mb-1'><strong>Chiều cao:</strong> {result.height || 'N/A'} cm - <strong>Cân nặng:</strong> {result.weight || 'N/A'} kg</p>
                                          <p className='mb-1'><strong>Thị lực:</strong> Mắt trái: {result.leftVision || 'N/A'} - Mắt phải: {result.rightVision || 'N/A'}</p>
                                          <p className='mb-1'><strong>Kết luận:</strong> <span className='fw-bold'>{result.result || 'Chưa có'}</span></p>
                                          {result.note && <p className='mb-0 text-muted'><strong>Ghi chú:</strong> {result.note}</p>}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <div className="alert alert-light text-center">Không có kết quả khám nào.</div>
                                  )}
                                </div>
                              )}
                              {/* Vaccination Results Section */}
                              {selectedStudentForVaccination?.studentId === student.studentId && (
                                <div className="mt-4 border-top pt-3">
                                  <h6 className='text-warning mb-3'>Lịch sử tiêm chủng</h6>
                                  {loadingVaccination ? (
                                    <div className="d-flex justify-content-center">
                                      <div className="spinner-border spinner-border-sm text-warning" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                      </div>
                                    </div>
                                  ) : vaccinationResults.length > 0 ? (
                                    <ul className="list-group" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                      {vaccinationResults.map(result => (
                                        <li key={result.vaccinationResultId} className="list-group-item">
                                          {result.schedule && (
                                            <>
                                              <p className='mb-1'><strong>Tên vắc xin:</strong> {result.schedule.name || 'Chưa cập nhật'}</p>
                                              <p className='mb-1'><strong>Liều lượng:</strong> {result.doseNumber || 'Chưa cập nhật'}</p>
                                            </>
                                          )}
                                          <p className='mb-1'><strong>Ngày tiêm:</strong> {result.schedule ? new Date(result.schedule.scheduleDate).toLocaleDateString() : 'Chưa cập nhật'}</p>
                                          <p className='mb-1'><strong>Địa điểm:</strong> {result.schedule?.location || 'Chưa cập nhật'}</p>
                                          <p className='mb-1'>
                                            <strong>Trạng thái:</strong>{' '}
                                            <span className={`badge ${
                                              result.status === 'Pending' ? 'bg-warning' :
                                              result.status === 'Accepted' ? 'bg-success' :
                                              'bg-danger'
                                            }`}>
                                              {result.status === 'Accepted' ? 'Đã tiêm' : 'Chưa tiêm'}
                                            </span>
                                          </p>
                                          {result.note && <p className='mb-0 text-muted'><strong>Ghi chú:</strong> {result.note}</p>}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <div className="alert alert-light text-center">Không có lịch sử tiêm chủng nào.</div>
                                  )}
                                </div>
                              )}
                              {/* Medical Events Section */}
                              {selectedStudentForMedicalEvents?.studentId === student.studentId && (
                                <div className="mt-4 border-top pt-3">
                                  <h6 className='text-danger mb-3'>Sự kiện y tế</h6>
                                  {loadingMedicalEvents ? (
                                    <div className="d-flex justify-content-center">
                                      <div className="spinner-border spinner-border-sm text-danger" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                      </div>
                                    </div>
                                  ) : medicalEvents.length > 0 ? (
                                    <ul className="list-group" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                      {medicalEvents.map(event => (
                                        <li key={event.eventId} className="list-group-item">
                                          <p className='mb-1'><strong>Tên sự kiện:</strong> {event.eventName || 'Chưa cập nhật'}</p>
                                          <p className='mb-1'><strong>Ngày:</strong> {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'Chưa cập nhật'}</p>
                                          <p className='mb-1'><strong>Triệu chứng:</strong> {event.symptoms || 'Không có'}</p>
                                          <p className='mb-1'><strong>Xử lý:</strong> {event.actionTaken || 'Không có'}</p>
                                          {event.note && <p className='mb-0 text-muted'><strong>Ghi chú:</strong> {event.note}</p>}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <div className="alert alert-light text-center">Không có sự kiện y tế nào.</div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Update Modal */}
      {showModal && (
        <div className="modal fade show d-flex align-items-center justify-content-center" 
             style={{ 
               display: 'block',
               position: 'fixed',
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               zIndex: 1050
             }} 
             tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cập nhật hồ sơ sức khỏe</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleUpdateSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nhóm máu</label>
                    <select 
                      className="form-select"
                      value={updateData.bloodType}
                      onChange={(e) => setUpdateData({...updateData, bloodType: e.target.value})}
                      required
                    >
                      <option value="">Chọn nhóm máu</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Dị ứng</label>
                    <textarea 
                      className="form-control"
                      value={updateData.allergies}
                      onChange={(e) => setUpdateData({...updateData, allergies: e.target.value})}
                      rows="3"
                      placeholder="Nhập thông tin dị ứng (nếu có)"
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <div className="modal-backdrop fade show" 
             style={{
               position: 'fixed',
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               backgroundColor: 'rgba(0, 0, 0, 0.5)',
               zIndex: 1040
             }}>
        </div>
      )}
    </div>
  );
};

export default ParentHealthProfile; 