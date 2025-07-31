// Import các thư viện cần thiết
import React, { useState, useEffect } from 'react'; // React core và các hooks cơ bản
import { API_SERVICE } from '../services/api'; // Service để gọi API
import { useNotification } from '../contexts/NotificationContext'; // Context để hiển thị thông báo

// Component chính để hiển thị và quản lý hồ sơ sức khỏe cho phụ huynh
const ParentHealthProfile = () => {
  // ===== CÁC STATE CHÍNH =====
  
  // Lấy function setNotif từ NotificationContext để hiển thị thông báo
  const { setNotif } = useNotification();
  
  // State lưu danh sách học sinh của phụ huynh
  const [students, setStudents] = useState([]);
  
  // State lưu mapping giữa studentId và healthProfile tương ứng
  const [healthProfiles, setHealthProfiles] = useState({});
  
  // State quản lý trạng thái loading (true = đang tải, false = hoàn thành)
  const [loading, setLoading] = useState(true);
  
  // State lưu thông báo lỗi (null = không có lỗi, string = message lỗi)
  const [error, setError] = useState(null);
  
  // State hiển thị modal cập nhật (true = hiện, false = ẩn)
  const [showModal, setShowModal] = useState(false);
  
  // State lưu profile được chọn để cập nhật
  const [selectedProfile, setSelectedProfile] = useState(null);
  
  // State lưu dữ liệu cập nhật (nhóm máu, dị ứng)
  const [updateData, setUpdateData] = useState({
    bloodType: '',
    allergies: ''
  });
  
  // ===== STATE CHO HEALTH CHECK RESULTS =====
  
  // State lưu danh sách kết quả khám sức khỏe
  const [healthResults, setHealthResults] = useState([]);
  
  // State loading cho health check results
  const [loadingResults, setLoadingResults] = useState(false);
  
  // State lưu student được chọn để xem kết quả khám
  const [selectedStudentForResults, setSelectedStudentForResults] = useState(null);
  
  // ===== STATE CHO VACCINATION RESULTS =====
  
  // State lưu danh sách kết quả tiêm chủng
  const [vaccinationResults, setVaccinationResults] = useState([]);
  
  // State loading cho vaccination results
  const [loadingVaccination, setLoadingVaccination] = useState(false);
  
  // State lưu student được chọn để xem kết quả tiêm chủng
  const [selectedStudentForVaccination, setSelectedStudentForVaccination] = useState(null);
  
  // ===== STATE CHO MEDICAL EVENTS =====
  
  // State lưu danh sách sự kiện y tế
  const [medicalEvents, setMedicalEvents] = useState([]);
  
  // State loading cho medical events
  const [loadingMedicalEvents, setLoadingMedicalEvents] = useState(false);
  
  // State lưu student được chọn để xem sự kiện y tế
  const [selectedStudentForMedicalEvents, setSelectedStudentForMedicalEvents] = useState(null);

  // ===== STATE CHO HISTORIES =====
  
  // State lưu lịch sử khám sức khỏe cho từng học sinh
  const [checkupHistories, setCheckupHistories] = useState({});
  
  // State lưu lịch sử tiêm chủng cho từng học sinh
  const [vaccinationHistories, setVaccinationHistories] = useState({});

  // ===== USEEFFECT ĐỂ FETCH DỮ LIỆU BAN ĐẦU =====
  
  useEffect(() => {
    // Hàm async để fetch dữ liệu học sinh và health profiles
    const fetchStudents = async () => {
      try {
        // Lấy parentId từ localStorage (đã lưu khi đăng nhập)
        const parentId = localStorage.getItem('userId');
        if (!parentId) {
          throw new Error('Parent ID not found');
        }

        // ===== BƯỚC 1: FETCH DANH SÁCH HỌC SINH =====
        
        // Gọi API lấy danh sách học sinh của phụ huynh
        const data = await API_SERVICE.studentAPI.getByParent(parentId);
        setStudents(data);

        // ===== BƯỚC 2: FETCH HEALTH PROFILES CHO TỪNG HỌC SINH =====
        
        // Tạo object để lưu mapping giữa studentId và healthProfile
        const profiles = {};
        
        // Duyệt qua từng học sinh để lấy health profile
        for (const student of data) {
          try {
            // Gọi API search để tìm health profile theo studentId
            const searchResult = await API_SERVICE.healthProfileAPI.search({ keyword: String(student.studentId) });
            
            // Lọc đúng healthProfile có studentId trùng khớp
            const healthProfile = Array.isArray(searchResult)
              ? searchResult.find(p => String(p.studentId) === String(student.studentId))
              : null;
              
            // Lưu vào profiles object
            profiles[student.studentId] = healthProfile || null;
          } catch (e) {
            // Nếu có lỗi thì set null
            profiles[student.studentId] = null;
          }
        }
        
        // Cập nhật state với health profiles
        setHealthProfiles(profiles);

        // ===== BƯỚC 3: FETCH HISTORIES CHO TỪNG HỌC SINH =====
        
        // Tạo object để lưu lịch sử khám và tiêm chủng
        const checkup = {};
        const vaccination = {};
        
        // Duyệt qua từng học sinh để lấy histories
        for (const student of data) {
          const profile = profiles[student.studentId];
          
          // Chỉ fetch histories nếu có health profile
          if (profile && profile.healthProfileId) {
            try {
              // Fetch lịch sử khám sức khỏe
              checkup[student.studentId] = await API_SERVICE.healthCheckResultAPI.getByProfile(profile.healthProfileId);
            } catch {
              // Nếu có lỗi thì set array rỗng
              checkup[student.studentId] = [];
            }
            
            try {
              // Fetch lịch sử tiêm chủng
              const vacData = await API_SERVICE.vaccinationResultAPI.getByProfile(profile.healthProfileId);
              
              // Enrich dữ liệu với schedule information
              const enrichedVac = await Promise.all(
                vacData.map(async (result) => {
                  if (result.vaccinationScheduleId) {
                    try {
                      // Fetch schedule details
                      const scheduleData = await API_SERVICE.vaccinationScheduleAPI.getById(result.vaccinationScheduleId);
                      return { ...result, schedule: scheduleData };
                    } catch {}
                  }
                  return { ...result, schedule: null };
                })
              );
              vaccination[student.studentId] = enrichedVac;
            } catch {
              // Nếu có lỗi thì set array rỗng
              vaccination[student.studentId] = [];
            }
          } else {
            // Nếu không có health profile thì set array rỗng
            checkup[student.studentId] = [];
            vaccination[student.studentId] = [];
          }
        }
        
        // Cập nhật state với histories
        setCheckupHistories(checkup);
        setVaccinationHistories(vaccination);
        
      } catch (error) {
        // Xử lý lỗi
        console.error(error);
        setError(error.message);
      } finally {
        // Tắt trạng thái loading
        setLoading(false);
      }
    };

    // Gọi hàm fetch data
    fetchStudents();
  }, []); // Chỉ chạy 1 lần khi component mount

  // ===== USEEFFECT ĐỂ FETCH HISTORIES KHI STUDENTS HOẶC PROFILES THAY ĐỔI =====
  
  useEffect(() => {
    // Hàm async để fetch histories
    const fetchHistories = async () => {
      // Chỉ fetch nếu có students và healthProfiles
      if (!students || students.length === 0 || !healthProfiles) return;
      
      // Tạo object để lưu histories
      const checkup = {};
      const vaccination = {};
      
      // Duyệt qua từng học sinh
      for (const student of students) {
        const profile = healthProfiles[student.studentId];
        
        // Chỉ fetch nếu có health profile
        if (profile && profile.healthProfileId) {
          try {
            // Fetch lịch sử khám sức khỏe
            checkup[student.studentId] = await API_SERVICE.healthCheckResultAPI.getByProfile(profile.healthProfileId);
          } catch {
            checkup[student.studentId] = [];
          }
          
          try {
            // Fetch lịch sử tiêm chủng
            vaccination[student.studentId] = await API_SERVICE.vaccinationResultAPI.getByProfile(profile.healthProfileId);
          } catch {
            vaccination[student.studentId] = [];
          }
        } else {
          // Nếu không có health profile thì set array rỗng
          checkup[student.studentId] = [];
          vaccination[student.studentId] = [];
        }
      }
      
      // Cập nhật state
      setCheckupHistories(checkup);
      setVaccinationHistories(vaccination);
    };
    
    // Gọi hàm fetch histories
    fetchHistories();
  }, [students, healthProfiles]); // Chạy lại khi students hoặc healthProfiles thay đổi

  // ===== HÀM XỬ LÝ CẬP NHẬT PROFILE =====
  
  // Hàm xử lý khi user click nút "Cập nhật"
  const handleUpdateClick = (profile) => {
    // Set profile được chọn
    setSelectedProfile(profile);
    
    // Set dữ liệu cập nhật với giá trị hiện tại
    setUpdateData({
      bloodType: profile.bloodType || '',
      allergies: profile.allergies || ''
    });
    
    // Hiển thị modal
    setShowModal(true);
  };

  // ===== HÀM XỬ LÝ XEM KẾT QUẢ KHÁM SỨC KHỎE =====
  
  // Hàm xử lý khi user click nút "Xem lịch sử khám"
  const handleViewResultsClick = async (profile) => {
    // Ẩn vaccination và medical events khi xem health check results
    setSelectedStudentForVaccination(null);
    setVaccinationResults([]);
    setSelectedStudentForMedicalEvents(null);
    setMedicalEvents([]);
    
    // Kiểm tra có profile và healthProfileId không
    if (!profile || !profile.healthProfileId) {
      setNotif({ message: 'Không tìm thấy hồ sơ sức khỏe cho học sinh này.', type: 'error' });
      return;
    }

    // Nếu đã hiển thị kết quả của cùng 1 học sinh thì ẩn đi
    if (selectedStudentForResults?.studentId === profile.studentId) {
      setSelectedStudentForResults(null);
      setHealthResults([]);
      return;
    }

    // Bật loading và set student được chọn
    setLoadingResults(true);
    setSelectedStudentForResults(profile);
    setError(null);

    try {
      // Gọi API lấy kết quả khám sức khỏe
      const response = await API_SERVICE.healthCheckResultAPI.getByProfile(profile.healthProfileId);
      const results = response;

      // Enrich dữ liệu với schedule details cho từng result
      const enrichedResults = await Promise.all(
        results.map(async (result) => {
          if (result.healthCheckScheduleId) {
            try {
              // Fetch schedule details
              const scheduleData = await API_SERVICE.healthCheckScheduleAPI.get(result.healthCheckScheduleId);
              return { ...result, schedule: scheduleData };
            } catch (scheduleErr) {
              console.error(`Failed to fetch health schedule for result ${result.resultId}:`, scheduleErr);
            }
          }
          return { ...result, schedule: null };
        })
      );
      
      // Cập nhật state với kết quả đã enrich
      setHealthResults(enrichedResults);
      
    } catch (err) {
      // Xử lý lỗi
      console.error('Error fetching health results:', err);
      setError(err.message);
      setHealthResults([]);
    } finally {
      // Tắt loading
      setLoadingResults(false);
    }
  };

  // ===== HÀM XỬ LÝ XEM KẾT QUẢ TIÊM CHỦNG =====
  
  // Hàm xử lý khi user click nút "Xem lịch sử tiêm chủng"
  const handleViewVaccinationResultsClick = async (profile) => {
    // Ẩn health check và medical events khi xem vaccination results
    setSelectedStudentForResults(null);
    setHealthResults([]);
    setSelectedStudentForVaccination(null);
    setVaccinationResults([]);
    
    // Kiểm tra có profile và healthProfileId không
    if (!profile || !profile.healthProfileId) {
      setNotif({ message: 'Không tìm thấy hồ sơ sức khỏe cho học sinh này.', type: 'error' });
      return;
    }

    // Nếu đã hiển thị kết quả của cùng 1 học sinh thì ẩn đi
    if (selectedStudentForVaccination?.studentId === profile.studentId) {
      setSelectedStudentForVaccination(null);
      setVaccinationResults([]);
      return;
    }

    // Bật loading và set student được chọn
    setLoadingVaccination(true);
    setSelectedStudentForVaccination(profile);
    setError(null);

    try {
      // Gọi API lấy kết quả tiêm chủng
      const response = await API_SERVICE.vaccinationResultAPI.getByProfile(profile.healthProfileId);
      const results = response;
      
      // Enrich dữ liệu với schedule details cho từng result
      const enrichedResults = await Promise.all(
        results.map(async (result) => {
          if (result.vaccinationScheduleId) {
            try {
              // Fetch schedule details
              const scheduleData = await API_SERVICE.vaccinationScheduleAPI.getById(result.vaccinationScheduleId);
              return { ...result, schedule: scheduleData };
            } catch (scheduleErr) {
              console.error(`Failed to fetch vaccination schedule for result ${result.resultId}:`, scheduleErr);
            }
          }
          return { ...result, schedule: null };
        })
      );
      
      // Cập nhật state với kết quả đã enrich
      setVaccinationResults(enrichedResults);
      
    } catch (err) {
      // Xử lý lỗi
      console.error('Error fetching vaccination results:', err);
      setError(err.message);
      setVaccinationResults([]);
    } finally {
      // Tắt loading
      setLoadingVaccination(false);
    }
  };

  // ===== HÀM XỬ LÝ XEM SỰ KIỆN Y TẾ =====
  
  // Hàm xử lý khi user click nút "Xem sự kiện y tế"
  const handleViewMedicalEventsClick = async (student) => {
    // Ẩn health check và vaccination results khi xem medical events
    setSelectedStudentForResults(null);
    setHealthResults([]);
    setSelectedStudentForVaccination(null);
    setVaccinationResults([]);
    
    // Kiểm tra có student và studentId không
    if (!student || !student.studentId) {
      setNotif({ message: 'Không tìm thấy học sinh này.', type: 'error' });
      return;
    }
    
    // Nếu đã hiển thị sự kiện của cùng 1 học sinh thì ẩn đi
    if (selectedStudentForMedicalEvents?.studentId === student.studentId) {
      setSelectedStudentForMedicalEvents(null);
      setMedicalEvents([]);
      return;
    }
    
    // Bật loading và set student được chọn
    setLoadingMedicalEvents(true);
    setSelectedStudentForMedicalEvents(student);
    setError(null);
    
    try {
      // Gọi API lấy sự kiện y tế theo studentId
      const response = await API_SERVICE.medicalEventAPI.getByStudent(student.studentId);
      const results = response;
      
      // Cập nhật state với kết quả (đảm bảo là array)
      setMedicalEvents(Array.isArray(results) ? results : []);
      
    } catch (err) {
      // Xử lý lỗi
      setError(err.message);
      setMedicalEvents([]);
    } finally {
      // Tắt loading
      setLoadingMedicalEvents(false);
    }
  };

  // ===== HÀM XỬ LÝ SUBMIT CẬP NHẬT =====
  
  // Hàm xử lý khi user submit form cập nhật
  const handleUpdateSubmit = async (e) => {
    e.preventDefault(); // Ngăn form submit mặc định
    
    try {
      // Kiểm tra có selectedProfile và healthProfileId không
      if (!selectedProfile || !selectedProfile.healthProfileId) {
        throw new Error('Không tìm thấy hồ sơ sức khỏe để cập nhật.');
      }
      
      // Gọi API cập nhật health profile
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
      
      // Kiểm tra response
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Lỗi cập nhật: ' + errorText);
      }
      
      // Cập nhật lại state FE với dữ liệu mới
      setHealthProfiles((prev) => ({
        ...prev,
        [selectedProfile.studentId]: {
          ...selectedProfile,
          bloodType: updateData.bloodType,
          allergies: updateData.allergies
        }
      }));
      
      // Ẩn modal
      setShowModal(false);
      
    } catch (err) {
      // Hiển thị thông báo lỗi
      setNotif({ message: err.message, type: 'error' });
    }
  };

  // ===== RENDER LOADING STATE =====
  
  // Hiển thị loading spinner nếu đang tải
  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column">
        <main className="container-fluid py-5 px-10 flex-grow-1" style={{ marginTop: "80px" }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-8">
                {/* ===== HEADER SECTION ===== */}
                <div className="text-center mb-5">
                  <h1 className="display-4 mb-3 fw-bold">Hồ sơ sức khỏe</h1>
                  <p className="lead text-muted">Cập nhật hồ sơ sức khỏe của học sinh</p>
                </div>
                
                {/* ===== LOADING SPINNER ===== */}
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

  // ===== RENDER ERROR STATE =====
  
  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <div className="min-vh-100 d-flex flex-column">
        <main className="container-fluid py-5 px-10 flex-grow-1" style={{ marginTop: "80px" }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-8">
                {/* ===== HEADER SECTION ===== */}
                <div className="text-center mb-5">
                  <h1 className="display-4 mb-3 fw-bold">Hồ sơ sức khỏe</h1>
                  <p className="lead text-muted">Cập nhật hồ sơ sức khỏe của học sinh</p>
                </div>
                
                {/* ===== ERROR ALERT ===== */}
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

  // ===== RENDER UI CHÍNH =====
  
  return (
    <div className="min-vh-100 d-flex flex-column">
      <main className="container-fluid py-5 px-10 flex-grow-1" style={{ marginTop: "80px" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              
              {/* ===== HEADER SECTION ===== */}
              <div className="text-center mb-5">
                <h1 className="display-4 mb-3 fw-bold">Hồ sơ sức khỏe</h1>
                <p className="lead text-muted">Cập nhật hồ sơ sức khỏe của học sinh</p>
              </div>
              
              {/* ===== CONTENT SECTION ===== */}
              {students.length === 0 ? (
                // Hiển thị message khi không có học sinh
                <div className="alert alert-info">Không có học sinh nào</div>
              ) : (
                // Render danh sách học sinh
                <div className="list-group">
                  {students.map((student) => {
                    // Lấy health profile và histories cho học sinh này
                    const profile = healthProfiles[student.studentId];
                    const checkups = checkupHistories[student.studentId] || [];
                    const vaccinations = vaccinationHistories[student.studentId] || [];
                    
                    // Log để debug dữ liệu enrich
                    console.log('Vaccination results for', student.fullName, vaccinations);
                    
                    return (
                      // ===== STUDENT CARD =====
                      <div key={student.studentId} className="list-group-item list-group-item-action p-4 mb-3 shadow-sm rounded">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="w-100">
                            
                            {/* ===== STUDENT INFO ===== */}
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
                            
                            {/* ===== HEALTH PROFILE SECTION ===== */}
                            {profile && (
                              <div className="border-top pt-3">
                                
                                {/* ===== PROFILE HEADER ===== */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <h6 className="text-success mb-0">Thông tin sức khỏe</h6>
                                  <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => handleUpdateClick(profile)}
                                  >
                                    <i className="bi bi-pencil me-1"></i>
                                    Cập nhật
                                  </button>
                                </div>
                                
                                {/* ===== PROFILE DETAILS ===== */}
                                <div className="row">
                                  <div className="col-md-6">
                                    <p className="mb-2">
                                      <i className="bi bi-droplet me-2"></i>
                                      <strong>Nhóm máu:</strong> {profile.bloodType}
                                    </p>
                                  </div>
                                  <div className="col-md-6">
                                    <p className="mb-2">
                                      <i className="bi bi-exclamation-triangle me-2"></i>
                                      <strong>Dị ứng:</strong> {profile.allergies}
                                    </p>
                                  </div>
                                </div>

                                <hr className="my-3"/>
                                
                                {/* ===== ACTION BUTTONS ===== */}
                                <div className='d-flex gap-2 flex-wrap mb-3'>
                                    <button
                                      className="btn btn-outline-info btn-sm"
                                      onClick={() => handleViewResultsClick(profile)}
                                    >
                                      <i className="bi bi-card-list me-1"></i>
                                      Xem lịch sử khám
                                    </button>
                                    <button
                                      className="btn btn-outline-warning btn-sm"
                                      onClick={() => handleViewVaccinationResultsClick(profile)}
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

                                {/* ===== HEALTH CHECK RESULTS SECTION ===== */}
                                {selectedStudentForResults?.studentId === student.studentId && (
                                  <div className="mt-4 border-top pt-3">
                                    <h6 className='text-info mb-3'>Lịch sử khám định kì</h6>
                                    {loadingResults ? (
                                      // Loading spinner cho health results
                                      <div className="d-flex justify-content-center">
                                        <div className="spinner-border spinner-border-sm" role="status">
                                          <span className="visually-hidden">Loading...</span>
                                        </div>
                                      </div>
                                    ) : healthResults.length > 0 ? (
                                      // Danh sách kết quả khám
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
                                      // Message khi không có kết quả
                                      <div className="alert alert-light text-center">Không có kết quả khám nào.</div>
                                    )}
                                  </div>
                                )}
                                
                                {/* ===== VACCINATION RESULTS SECTION ===== */}
                                {selectedStudentForVaccination?.studentId === student.studentId && (
                                  <div className="mt-4 border-top pt-3">
                                    <h6 className='text-warning mb-3'>Lịch sử tiêm chủng</h6>
                                    {loadingVaccination ? (
                                      // Loading spinner cho vaccination results
                                      <div className="d-flex justify-content-center">
                                        <div className="spinner-border spinner-border-sm text-warning" role="status">
                                          <span className="visually-hidden">Loading...</span>
                                        </div>
                                      </div>
                                    ) : vaccinations.length > 0 ? (
                                      // Danh sách kết quả tiêm chủng
                                      <ul className="list-group" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                        {vaccinations.map(result => (
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
                                              <span className={`badge ${result.status === 'Accepted' ? 'bg-success' : 'bg-warning'}`}>
                                                {result.status === 'Accepted' ? 'Đã tiêm' : 'Chưa tiêm'}
                                              </span>
                                            </p>
                                            {result.note && <p className='mb-0 text-muted'><strong>Ghi chú:</strong> {result.note}</p>}
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      // Message khi không có kết quả
                                      <div className="alert alert-light text-center">Không có lịch sử tiêm chủng nào.</div>
                                    )}
                                  </div>
                                )}
                                
                                {/* ===== MEDICAL EVENTS SECTION ===== */}
                                {selectedStudentForMedicalEvents?.studentId === student.studentId && (
                                  <div className="mt-4 border-top pt-3">
                                    <h6 className='text-danger mb-3'>Sự kiện y tế</h6>
                                    {loadingMedicalEvents ? (
                                      // Loading spinner cho medical events
                                      <div className="d-flex justify-content-center">
                                        <div className="spinner-border spinner-border-sm text-danger" role="status">
                                          <span className="visually-hidden">Loading...</span>
                                        </div>
                                      </div>
                                    ) : medicalEvents.length > 0 ? (
                                      // Danh sách sự kiện y tế
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
                                      // Message khi không có sự kiện
                                      <div className="alert alert-light text-center">Không có sự kiện y tế nào.</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ===== UPDATE MODAL ===== */}
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
      
      {/* ===== MODAL BACKDROP ===== */}
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