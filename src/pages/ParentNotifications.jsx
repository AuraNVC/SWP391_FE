import React, { useState, useEffect } from "react";
import { useUserRole } from '../contexts/UserRoleContext';

export default function ParentNotifications() {
  const [consentForms, setConsentForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [updatingForms, setUpdatingForms] = useState(new Set());
  const { userRole } = useUserRole();
  const [schedulesMap, setSchedulesMap] = useState({});
  const [students, setStudents] = useState([]);

  const updateConsentFormStatus = async (consentFormId, isAccept) => {
    // Prevent multiple clicks
    if (updatingForms.has(consentFormId)) return;
    
    try {
      setUpdatingForms(prev => new Set(prev).add(consentFormId));
      setError(null);
      setSuccessMessage(null);
      
      console.log('Updating consent form:', { consentFormId, isAccept });
      const endpoint = isAccept ? 'accept' : 'reject';
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/consentForm/${endpoint}/${consentFormId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Update response status:', response.status);
      if (!response.ok) {
        throw new Error(`Failed to update consent form: ${response.status}`);
      }

      // Show success message
      const action = isAccept ? 'đồng ý' : 'từ chối';
      setSuccessMessage(`Đã ${action} biểu mẫu thành công!`);

      // Refresh the consent forms list
      const parentId = localStorage.getItem('userId');
      const numericParentId = parseInt(parentId);
      console.log('Refreshing list for parent:', numericParentId);
      const updatedResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/consentForm/getConsentFormByParent?parentId=${numericParentId}`);
      const updatedData = await updatedResponse.json();
      console.log('Updated consent forms:', updatedData);
      setConsentForms(updatedData);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating consent form:', err);
      setError('Không thể cập nhật biểu mẫu. Vui lòng thử lại sau.');
    } finally {
      setUpdatingForms(prev => {
        const newSet = new Set(prev);
        newSet.delete(consentFormId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const parentId = localStorage.getItem('userId');
        if (!parentId) {
          throw new Error('Parent ID not found. Please login again.');
        }
        const numericParentId = parseInt(parentId);
        if (isNaN(numericParentId)) {
          throw new Error('Invalid Parent ID. Please login again.');
        }
        
        // Step 1: Fetch consent forms and students
        const [consentFormsResponse, studentsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/consentForm/getConsentFormByParent?parentId=${numericParentId}`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/student/getParent${numericParentId}`)
        ]);

        if (!consentFormsResponse.ok) {
          throw new Error(`Failed to fetch consent forms: ${consentFormsResponse.status}`);
        }
        const forms = await consentFormsResponse.json();
        setConsentForms(forms);

        const studentList = studentsRes.ok ? await studentsRes.json() : [];
        setStudents(studentList);

        // Step 2: Based on forms, fetch their specific schedules
        const schedulePromises = forms.map(consentForm => {
          const formId = consentForm.form.formId;
          const formType = consentForm.form.type;

          let scheduleUrl = '';
          if (formType === 'HealthCheck') {
            scheduleUrl = `${import.meta.env.VITE_API_BASE_URL}/healthCheckSchedule/getByForm${formId}`;
          } else if (formType === 'Vaccine' || formType === 'Vaccination') {
            scheduleUrl = `${import.meta.env.VITE_API_BASE_URL}/vaccinationSchedule/getByForm${formId}`;
          }

          if (scheduleUrl) {
            return fetch(scheduleUrl)
              .then(res => (res.ok ? res.json() : []))
              .catch(() => []);
          }
          return Promise.resolve([]);
        });
        
        const schedulesPerForm = await Promise.all(schedulePromises);
        const allSchedules = schedulesPerForm.flat();

        // Step 3: Create the schedule map
        const newSchedulesMap = {};
        allSchedules.forEach(schedule => {
          if (schedule && schedule.form && schedule.form.formId && !newSchedulesMap[schedule.form.formId]) {
            newSchedulesMap[schedule.form.formId] = schedule;
          }
        });
        setSchedulesMap(newSchedulesMap);

      } catch (err) {
        console.error('Error details:', err);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (userRole === 'parent') {
      fetchAllData();
    } else {
      setLoading(false);
      setError('Access denied. Parent role required.');
    }
  }, [userRole]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="min-vh-100 d-flex flex-column">
      <main className="container-fluid py-5 px-10 flex-grow-1" style={{ marginTop: "80px" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="text-center mb-5">
                <h1 className="display-4 mb-3 fw-bold">Thông báo</h1>
                <p className="lead text-muted">Thông tin về lịch khám sức khỏe và tiêm chủng của học sinh</p>
              </div>
              
              {/* Success Message */}
              {successMessage && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  {successMessage}
                  <button type="button" className="btn-close" onClick={() => setSuccessMessage(null)}></button>
                </div>
              )}
              
              {consentForms.length === 0 ? (
                <div className="text-center text-muted">
                  <p>Không có biểu mẫu đồng ý nào</p>
                </div>
              ) : (
                consentForms.map((form) => {
                  const isUpdating = updatingForms.has(form.consentFormId);
                  const schedule = schedulesMap[form.form.formId];
                  
                  let isTooLateToChange = false;
                  if (schedule) {
                    const scheduleDate = (schedule.checkDate || schedule.scheduleDate).substring(0, 10); // YYYY-MM-DD
                    
                    const today = new Date();
                    const year = today.getFullYear();
                    const month = (today.getMonth() + 1).toString().padStart(2, '0');
                    const day = today.getDate().toString().padStart(2, '0');
                    const todayString = `${year}-${month}-${day}`;
                    
                    if (scheduleDate <= todayString) {
                      isTooLateToChange = true;
                    }
                  }

                  // Find matching students
                  const matchingStudents = students.filter(student => 
                    form.form.className === 'Tất cả' || student.className === form.form.className
                  );
                  
                  return (
                    <div key={form.consentFormId} className="card mb-3">
                      <div className="card-body">
                        <h5 className="card-title">{form.form.title}</h5>
                        {matchingStudents.length > 0 && (
                          <p className="card-text text-primary fw-bold">
                            <i className="bi bi-person-check-fill me-2"></i>
                            Dành cho học sinh: {matchingStudents.map(s => s.fullName).join(', ')}
                          </p>
                        )}
                        <p className="card-text">
                          <strong>Lớp:</strong> {form.form.className}
                        </p>
                        <p className="card-text">
                          <strong>Trạng thái:</strong>{' '}
                          <span className={`badge ${
                            form.status === 'Pending' ? 'bg-warning' :
                            form.status === 'Accepted' ? 'bg-success' :
                            'bg-danger'
                          }`}>
                            {form.status === 'Pending' ? 'Chờ xác nhận' :
                             form.status === 'Accepted' ? 'Đã đồng ý' :
                             'Đã từ chối'}
                          </span>
                        </p>
                        <p className="card-text">
                          <strong>Nội dung:</strong> {form.form.content}
                        </p>
                        
                        {schedule && (
                          <>
                            <p className="card-text">
                              <strong>Thời gian:</strong> {new Date(schedule.checkDate || schedule.scheduleDate).toLocaleDateString('vi-VN')} - {new Date(schedule.checkDate || schedule.scheduleDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="card-text">
                              <strong>Địa điểm:</strong> {schedule.location}
                            </p>
                          </>
                        )}

                        {/* Action buttons */}
                        <div className="d-flex justify-content-end mt-3">
                          <div className="text-end">
                            <button
                              className={`btn btn-sm me-2 ${form.status === 'Accepted' ? 'btn-success' : 'btn-outline-success'}`}
                              onClick={() => updateConsentFormStatus(form.consentFormId, true)}
                              disabled={isTooLateToChange || isUpdating}
                            >
                              {isUpdating ? 'Đang xử lý...' : 'Đồng ý'}
                            </button>
                            <button
                              className={`btn btn-sm ${form.status === 'Rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
                              onClick={() => updateConsentFormStatus(form.consentFormId, false)}
                              disabled={isTooLateToChange || isUpdating}
                            >
                              {isUpdating ? 'Đang xử lý...' : 'Từ chối'}
                            </button>
                            <p className="text-muted fst-italic mt-1 mb-0">
                              <small>
                                {isTooLateToChange ? 'Đã hết hạn thay đổi.' : 'Có thể thay đổi đến trước ngày diễn ra.'}
                              </small>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 