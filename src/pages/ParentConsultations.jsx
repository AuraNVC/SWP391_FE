import React, { useState, useEffect } from "react";
import { useUserRole } from '../contexts/UserRoleContext';

export default function ParentConsultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [updatingForms, setUpdatingForms] = useState(new Set());
  const { userRole } = useUserRole();

  const updateConsultationStatus = async (consultationFormId, isAccept) => {
    if (updatingForms.has(consultationFormId)) return;

    try {
      setUpdatingForms(prev => new Set(prev).add(consultationFormId));
      setError(null);
      setSuccessMessage(null);

      const endpoint = isAccept ? 'accept' : 'reject';
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/consultationForm/${endpoint}/${consultationFormId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Lỗi khi cập nhật trạng thái: ${response.status}`);
      }

      const action = isAccept ? 'chấp nhận' : 'từ chối';
      setSuccessMessage(`Đã ${action} lịch tư vấn thành công!`);

      // Refresh the list after update
      const parentId = localStorage.getItem('userId');
      const numericParentId = parseInt(parentId, 10);
      const updatedResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/consultationForm/getByParent?parentId=${numericParentId}`);
      const updatedData = await updatedResponse.json();
      setConsultations(updatedData);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Không thể cập nhật trạng thái. Vui lòng thử lại sau.');
    } finally {
      setUpdatingForms(prev => {
        const newSet = new Set(prev);
        newSet.delete(consultationFormId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const parentId = localStorage.getItem('userId');
        
        if (!parentId) {
          setError('Không tìm thấy ID phụ huynh. Vui lòng đăng nhập lại.');
          setLoading(false);
          return;
        }

        const numericParentId = parseInt(parentId, 10);
        if (isNaN(numericParentId)) {
          setError('ID phụ huynh không hợp lệ. Vui lòng đăng nhập lại.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/consultationForm/getByParent?parentId=${numericParentId}`);
        
        if (!response.ok) {
          throw new Error(`Lỗi khi tải dữ liệu: ${response.status}`);
        }
        
        const data = await response.json();
        setConsultations(data);
      } catch (err) {
        console.error('Error details:', err);
        setError('Không thể tải lịch tư vấn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (userRole === 'parent') {
      fetchConsultations();
    } else {
      setLoading(false);
      setError('Truy cập bị từ chối. Cần có vai trò phụ huynh.');
    }
  }, [userRole]);

  if (loading) return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="min-vh-100 d-flex flex-column">
      <main className="container-fluid py-5 px-10 flex-grow-1" style={{ marginTop: "80px" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10">
              <div className="text-center mb-5">
                <h1 className="display-4 mb-3 fw-bold">Lịch Tư Vấn</h1>
                <p className="lead text-muted">Thông tin chi tiết về các buổi tư vấn sức khỏe</p>
              </div>
              
              {successMessage && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  {successMessage}
                  <button type="button" className="btn-close" onClick={() => setSuccessMessage(null)}></button>
                </div>
              )}

              {consultations.length === 0 ? (
                <div className="text-center text-muted">
                  <p>Hiện không có lịch tư vấn nào.</p>
                </div>
              ) : (
                <div className="list-group">
                  {consultations.map((form) => {
                    const isUpdating = updatingForms.has(form.consultationFormId);

                    return (
                      <div key={form.consultationFormId} className="list-group-item list-group-item-action p-4 mb-3 shadow-sm rounded">
                        <h5 className="mb-3 text-primary fw-bold">{form.title}</h5>
                        <p className="mb-2"><strong>Nội dung:</strong> {form.content}</p>
                        <div className="row">
                          <div className="col-md-6">
                              <p className="mb-2">
                                  <strong>Trạng thái:</strong>{' '}
                                  <span className={`badge ${
                                      form.status === 'Pending' ? 'bg-warning' :
                                      form.status === 'Accepted' ? 'bg-success' :
                                      'bg-danger'
                                  }`}>
                                      {form.status === 'Pending' ? 'Chờ xác nhận' :
                                      form.status === 'Accepted' ? 'Đã chấp nhận' :
                                      'Đã từ chối'}
                                  </span>
                              </p>
                          </div>
                          {form.consultationSchedule && (
                              <>
                                  <div className="col-md-6">
                                      <p className="mb-2"><strong>Ngày tư vấn:</strong> {new Date(form.consultationSchedule.consultDate).toLocaleDateString('vi-VN')} - {new Date(form.consultationSchedule.consultDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                                  </div>
                                  <div className="col-md-12">
                                      <p className="mb-0"><strong>Địa điểm:</strong> {form.consultationSchedule.location}</p>
                                  </div>
                              </>
                          )}
                        </div>
                        <div className="mt-3 d-flex gap-2">
                            <button
                                className={`btn btn-sm ${form.status === 'Accepted' ? 'btn-success' : 'btn-outline-success'}`}
                                onClick={() => updateConsultationStatus(form.consultationFormId, true)}
                                disabled={isUpdating}
                            >
                                {isUpdating ? 'Đang xử lý...' : 'Chấp nhận'}
                            </button>
                            <button
                                className={`btn btn-sm ${form.status === 'Rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
                                onClick={() => updateConsultationStatus(form.consultationFormId, false)}
                                disabled={isUpdating}
                            >
                                {isUpdating ? 'Đang xử lý...' : 'Từ chối'}
                            </button>
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
    </div>
  );
} 