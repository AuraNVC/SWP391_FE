import React, { useState, useEffect } from 'react';

const ParentHealthProfile = () => {
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

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const parentId = localStorage.getItem('userId');
        if (!parentId) {
          throw new Error('Parent ID not found');
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/student/getParent${parentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }

        const data = await response.json();
        setStudents(data);

        // Fetch health profiles for each student
        const profiles = {};
        for (const student of data) {
          const healthResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/healthProfile/${student.studentId}`);
          if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            profiles[student.studentId] = healthData;
          }
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

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
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
        throw new Error('Failed to update health profile');
      }

      // Refresh health profiles after update
      const updatedProfiles = { ...healthProfiles };
      updatedProfiles[selectedProfile.studentId] = {
        ...selectedProfile,
        bloodType: updateData.bloodType,
        allergies: updateData.allergies
      };
      setHealthProfiles(updatedProfiles);
      setShowModal(false);
    } catch (err) {
      console.error('Error updating health profile:', err);
      alert('Có lỗi xảy ra khi cập nhật hồ sơ sức khỏe');
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