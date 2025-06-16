import React, { useState, useEffect } from "react";
import ParentNavbar from "../components/ParentNavbar";
import ParentFooter from "../components/ParentFooter";
import { useUserRole } from '../contexts/UserRoleContext';

export default function ParentNotifications() {
  const [consentForms, setConsentForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const { userRole } = useUserRole();

  const fetchConsentFormDetails = async (formId) => {
    try {
      console.log('Fetching details for form ID:', formId);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/consentForm/${formId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch consent form details: ${response.status}`);
      }
      const data = await response.json();
      console.log('Consent form details:', data);
      setSelectedForm(data);
    } catch (err) {
      console.error('Error fetching consent form details:', err);
      setError('Failed to fetch consent form details. Please try again later.');
    }
  };

  useEffect(() => {
    const fetchConsentForms = async () => {
      try {
        const parentId = localStorage.getItem('userId');
        console.log('All localStorage items:', Object.entries(localStorage));
        console.log('Parent ID from localStorage:', parentId);
        console.log('Parent ID type:', typeof parentId);
        
        if (!parentId) {
          setError('Parent ID not found. Please login again.');
          setLoading(false);
          return;
        }

        const numericParentId = parseInt(parentId);
        if (isNaN(numericParentId)) {
          setError('Invalid Parent ID. Please login again.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/consentForm/getConsentFormByParent?parentId=${numericParentId}`);
        console.log('API URL:', `${import.meta.env.VITE_API_BASE_URL}/consentForm/getConsentFormByParent?parentId=${numericParentId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch consent forms: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        console.log('First consent form structure:', data[0]); // Debug log to see structure
        setConsentForms(data);
        setLoading(false);
      } catch (err) {
        console.error('Error details:', err);
        setError('Failed to fetch consent forms. Please try again later.');
        setLoading(false);
      }
    };

    if (userRole === 'parent') {
      fetchConsentForms();
    } else {
      setLoading(false);
      setError('Access denied. Parent role required.');
    }
  }, [userRole]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="min-vh-100 d-flex flex-column">
      <ParentNavbar />
      <main className="container-fluid py-5 px-10 flex-grow-1" style={{ marginTop: "80px" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              {consentForms.length === 0 ? (
                <div className="text-center text-muted">
                  <p>Không có biểu mẫu đồng ý nào</p>
                </div>
              ) : (
                consentForms.map((form) => (
                  <div key={form.consentFormId} className="card mb-3">
                    <div className="card-body">
                      <h5 className="card-title">{form.form.title}</h5>
                      <p className="card-text">
                        <strong>Lớp:</strong> {form.form.className}
                      </p>
                      <p className="card-text">
                        <strong>Trạng thái:</strong> {form.status}
                      </p>
                      <p className="card-text">
                        <strong>Nội dung:</strong> {form.form.content}
                      </p>
                      <p className="card-text">
                        <strong>Ngày gửi:</strong> {new Date(form.form.sentDate).toLocaleDateString('vi-VN')}
                      </p>
                      <p className="card-text">
                        <strong>Loại:</strong> {form.form.type}
                      </p>
                      <button 
                        className="btn btn-primary"
                        onClick={() => fetchConsentFormDetails(form.consentFormId)}
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedForm && (
            <div className="modal fade show d-flex align-items-center justify-content-center" 
                 style={{ 
                   display: 'block', 
                   backgroundColor: 'rgba(0,0,0,0.5)',
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
                    <h5 className="modal-title">{selectedForm.form.title}</h5>
                    <button type="button" className="btn-close" onClick={() => setSelectedForm(null)}></button>
                  </div>
                  <div className="modal-body">
                    <p><strong>Lớp:</strong> {selectedForm.form.className}</p>
                    <p><strong>Trạng thái:</strong> {selectedForm.status}</p>
                    <p><strong>Nội dung:</strong> {selectedForm.form.content}</p>
                    <p><strong>Ngày gửi:</strong> {new Date(selectedForm.form.sentDate).toLocaleDateString('vi-VN')}</p>
                    <p><strong>Ngày xác nhận:</strong> {selectedForm.confirmDate ? new Date(selectedForm.confirmDate).toLocaleDateString('vi-VN') : 'Chưa xác nhận'}</p>
                    <p><strong>Loại:</strong> {selectedForm.form.type}</p>
                    <p><strong>Ngày tạo:</strong> {new Date(selectedForm.form.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setSelectedForm(null)}>Đóng</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <ParentFooter />
    </div>
  );
} 