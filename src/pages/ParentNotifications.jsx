import React, { useState, useEffect } from "react";
import ParentNavbar from "../components/ParentNavbar";
import ParentFooter from "../components/ParentFooter";
import { useUserRole } from '../contexts/UserRoleContext';

export default function ParentNotifications() {
  const [consentForms, setConsentForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userRole } = useUserRole();

  const updateConsentFormStatus = async (consentFormId, isAccept) => {
    try {
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

      // Refresh the consent forms list
      const parentId = localStorage.getItem('userId');
      const numericParentId = parseInt(parentId);
      console.log('Refreshing list for parent:', numericParentId);
      const updatedResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/consentForm/getConsentFormForParent?parentId=${numericParentId}`);
      const updatedData = await updatedResponse.json();
      console.log('Updated consent forms:', updatedData);
      setConsentForms(updatedData);
    } catch (err) {
      console.error('Error updating consent form:', err);
      setError('Failed to update consent form. Please try again later.');
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

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/consentForm/getConsentFormForParent?parentId=${numericParentId}`);
        console.log('API URL:', `${import.meta.env.VITE_API_BASE_URL}/consentForm/getConsentFormForParent?parentId=${numericParentId}`);
        
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
                      <p className="card-text">
                        <strong>Ngày gửi:</strong> {new Date(form.form.sentDate).toLocaleDateString('vi-VN')}
                      </p>
                      <div className="d-flex gap-2">
                        <button 
                          className={`btn ${form.status === 'Accepted' ? 'btn-success' : 'btn-outline-success'}`}
                          onClick={() => updateConsentFormStatus(form.consentFormId, true)}
                        >
                          Đồng ý
                        </button>
                        <button 
                          className={`btn ${form.status === 'Rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
                          onClick={() => updateConsentFormStatus(form.consentFormId, false)}
                        >
                          Từ chối
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      <ParentFooter />
    </div>
  );
} 