import React, { useState, useEffect } from 'react';
import { API_SERVICE } from '../services/api';

const StudentHealthProfile = () => {
  const [student, setStudent] = useState(null);
  const [healthProfile, setHealthProfile] = useState(null);
  const [healthResults, setHealthResults] = useState([]);
  const [vaccinationResults, setVaccinationResults] = useState([]);
  const [medicalEvents, setMedicalEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHealthResults, setShowHealthResults] = useState(false);
  const [showVaccinationResults, setShowVaccinationResults] = useState(false);
  const [showMedicalEvents, setShowMedicalEvents] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const studentId = localStorage.getItem('userId');
        if (!studentId) throw new Error('Không tìm thấy ID học sinh.');
        // Lấy thông tin cá nhân
        const studentData = await API_SERVICE.studentAPI.getById(studentId);
        setStudent(studentData);
        // Lấy hồ sơ sức khỏe
        const healthData = await API_SERVICE.healthProfileAPI.get(studentId);
        setHealthProfile(healthData);
        // Lấy lịch sử khám
        if (healthData.healthProfileId) {
          const checkupData = await API_SERVICE.healthCheckResultAPI.getByProfile(healthData.healthProfileId);
          const enrichedResults = await Promise.all(
            checkupData.map(async (result) => {
              if (result.healthCheckScheduleId) {
                try {
                  const scheduleData = await API_SERVICE.healthCheckScheduleAPI.get(result.healthCheckScheduleId);
                  return { ...result, schedule: scheduleData };
                } catch {}
              }
              return { ...result, schedule: null };
            })
          );
          setHealthResults(enrichedResults);
          // Lấy lịch sử tiêm chủng
          const vacData = await API_SERVICE.vaccinationResultAPI.getByProfile(healthData.healthProfileId);
          const enrichedVac = await Promise.all(
            vacData.map(async (result) => {
              if (result.vaccinationScheduleId) {
                try {
                  const scheduleData = await API_SERVICE.vaccinationScheduleAPI.getById(result.vaccinationScheduleId);
                  return { ...result, schedule: scheduleData };
                } catch {}
              }
              return { ...result, schedule: null };
            })
          );
          setVaccinationResults(enrichedVac);
        }
        // Lấy sự kiện y tế
        const eventData = await API_SERVICE.medicalEventAPI.getByStudent(studentId);
        setMedicalEvents(Array.isArray(eventData) ? eventData : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  if (error) return <div className="text-danger text-center p-4">{error}</div>;

  return (
    <div className="container py-5" style={{ marginTop: "80px", maxWidth: 800 }}>
      <h1 className="mb-4 text-primary fw-bold text-center">Hồ sơ sức khỏe cá nhân</h1>
      {student && (
        <div className="mb-4 border rounded p-3 bg-light">
          <h5 className="fw-bold mb-3">Thông tin cá nhân</h5>
          <div className="row">
            <div className="col-md-6">
              <p><strong>Họ tên:</strong> {student.fullName}</p>
              <p><strong>Mã học sinh:</strong> {student.studentNumber}</p>
              <p><strong>Ngày sinh:</strong> {new Date(student.dateOfBirth).toLocaleDateString()}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Giới tính:</strong> {student.gender}</p>
              <p><strong>Lớp:</strong> {student.className}</p>
            </div>
          </div>
        </div>
      )}
      {healthProfile && (
        <div className="mb-4 border rounded p-3">
          <h5 className="fw-bold mb-3 text-success">Thông tin sức khỏe</h5>
          <div className="row">
            <div className="col-md-6">
              <p><strong>Nhóm máu:</strong> {healthProfile.bloodType}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Dị ứng:</strong> {healthProfile.allergies}</p>
            </div>
          </div>
        </div>
      )}
      <div className="mb-4 border rounded p-3">
        <div className="d-flex gap-2 flex-wrap mb-3">
          <button
            className="btn btn-outline-info btn-sm"
            onClick={() => {
              setShowHealthResults(v => !v);
              setShowVaccinationResults(false);
              setShowMedicalEvents(false);
            }}
          >
            <i className="bi bi-card-list me-1"></i>
            {showHealthResults ? 'Ẩn lịch sử khám' : 'Xem lịch sử khám'}
          </button>
          <button
            className="btn btn-outline-warning btn-sm"
            onClick={() => {
              setShowVaccinationResults(v => !v);
              setShowHealthResults(false);
              setShowMedicalEvents(false);
            }}
          >
            <i className="bi bi-shield-check me-1"></i>
            {showVaccinationResults ? 'Ẩn lịch sử tiêm chủng' : 'Xem lịch sử tiêm chủng'}
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => {
              setShowMedicalEvents(v => !v);
              setShowHealthResults(false);
              setShowVaccinationResults(false);
            }}
          >
            <i className="bi bi-activity me-1"></i>
            {showMedicalEvents ? 'Ẩn sự kiện y tế' : 'Xem sự kiện y tế'}
          </button>
        </div>
        {showHealthResults && (
          <div className="mt-4 border-top pt-3">
            <h5 className="fw-bold mb-3 text-info">Lịch sử khám định kì</h5>
            {healthResults.length > 0 ? (
              <ul className="list-group" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {healthResults.map(result => (
                  <li key={result.healthCheckupRecordId} className="list-group-item">
                    {result.schedule && <h6 className='fw-bold text-primary'>{result.schedule.name}</h6>}
                    <p><strong>Ngày khám:</strong> {result.schedule ? new Date(result.schedule.checkDate).toLocaleDateString() : 'Chưa cập nhật'}</p>
                    <p><strong>Địa điểm:</strong> {result.schedule?.location || 'Chưa cập nhật'}</p>
                    <p><strong>Chiều cao:</strong> {result.height || 'N/A'} cm - <strong>Cân nặng:</strong> {result.weight || 'N/A'} kg</p>
                    <p><strong>Thị lực:</strong> Mắt trái: {result.leftVision || 'N/A'} - Mắt phải: {result.rightVision || 'N/A'}</p>
                    <p><strong>Kết luận:</strong> <span className='fw-bold'>{result.result || 'Chưa có'}</span></p>
                    {result.note && <p className='mb-0 text-muted'><strong>Ghi chú:</strong> {result.note}</p>}
                  </li>
                ))}
              </ul>
            ) : <div className="alert alert-light text-center">Không có kết quả khám nào.</div>}
          </div>
        )}
        {showVaccinationResults && (
          <div className="mt-4 border-top pt-3">
            <h5 className="fw-bold mb-3 text-warning">Lịch sử tiêm chủng</h5>
            {vaccinationResults.length > 0 ? (
              <ul className="list-group" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {vaccinationResults.map(result => (
                  <li key={result.vaccinationResultId} className="list-group-item">
                    {result.schedule && <p className='mb-1'><strong>Tên vắc xin:</strong> {result.schedule.name || 'Chưa cập nhật'}</p>}
                    <p className='mb-1'><strong>Liều lượng:</strong> {result.doseNumber || 'Chưa cập nhật'}</p>
                    <p><strong>Ngày tiêm:</strong> {result.schedule ? new Date(result.schedule.scheduleDate).toLocaleDateString() : 'Chưa cập nhật'}</p>
                    <p><strong>Địa điểm:</strong> {result.schedule?.location || 'Chưa cập nhật'}</p>
                    <p><strong>Trạng thái:</strong> <span className={`badge ${result.status === 'Pending' ? 'bg-warning' : result.status === 'Accepted' ? 'bg-success' : 'bg-danger'}`}>{result.status === 'Accepted' ? 'Đã tiêm' : 'Chưa tiêm'}</span></p>
                    {result.note && <p className='mb-0 text-muted'><strong>Ghi chú:</strong> {result.note}</p>}
                  </li>
                ))}
              </ul>
            ) : <div className="alert alert-light text-center">Không có lịch sử tiêm chủng nào.</div>}
          </div>
        )}
        {showMedicalEvents && (
          <div className="mt-4 border-top pt-3">
            <h5 className="fw-bold mb-3 text-danger">Sự kiện y tế</h5>
            {medicalEvents.length > 0 ? (
              <ul className="list-group" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {medicalEvents.map(event => (
                  <li key={event.eventId} className="list-group-item">
                    <p><strong>Tên sự kiện:</strong> {event.eventName || 'Chưa cập nhật'}</p>
                    <p><strong>Ngày:</strong> {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'Chưa cập nhật'}</p>
                    <p><strong>Triệu chứng:</strong> {event.symptoms || 'Không có'}</p>
                    <p><strong>Xử lý:</strong> {event.actionTaken || 'Không có'}</p>
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