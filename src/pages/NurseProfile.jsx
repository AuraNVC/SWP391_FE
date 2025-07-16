import React, { useState, useEffect } from 'react';
import { API_SERVICE } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import '../styles/Nurse.css';

const NurseProfile = () => {
  const [nurse, setNurse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setNotif } = useNotification();

  useEffect(() => {
    const fetchNurseData = async () => {
      setLoading(true);
      setError(null);
      try {
        const nurseId = localStorage.getItem('userId');
        if (!nurseId) {
          throw new Error('Không tìm thấy ID y tá');
        }
        
        const response = await API_SERVICE.nurseAPI.getById(nurseId);
        setNurse(response);
        
        // Lưu tên y tá vào localStorage để hiển thị trên sidebar
        localStorage.setItem('userName', response.fullName);
      } catch (err) {
        console.error('Error fetching nurse data:', err);
        setError('Không thể tải thông tin y tá');
        setNotif({
          message: 'Không thể tải thông tin y tá',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNurseData();
  }, [setNotif]);

  if (loading) return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  if (error) return <div className="alert alert-danger text-center p-4 m-4">{error}</div>;
  if (!nurse) return <div className="error-message">Không tìm thấy thông tin y tá</div>;

  return (
    <div className="container py-5" style={{ marginTop: "20px", maxWidth: 800 }}>
      <h1 className="mb-4 fw-bold text-center text-primary">Thông tin cá nhân</h1>
      
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="text-center mb-4">
            <img 
              src={`https://i.pravatar.cc/150?img=8`} 
              alt="Ảnh đại diện" 
              className="rounded-circle img-thumbnail" 
              style={{ width: '150px', height: '150px' }}
            />
            <h3 className="mt-3">{nurse?.fullName}</h3>
            <span className="badge bg-success">Y tá</span>
          </div>
          
          <div className="row mb-3">
            <div className="col-md-4 fw-bold">Mã y tá:</div>
            <div className="col-md-8">{nurse?.nurseId}</div>
          </div>
          
          <div className="row mb-3">
            <div className="col-md-4 fw-bold">Họ và tên:</div>
            <div className="col-md-8">{nurse?.fullName}</div>
          </div>
          
          <div className="row mb-3">
            <div className="col-md-4 fw-bold">Email:</div>
            <div className="col-md-8">{nurse?.email}</div>
          </div>
          
          <div className="row mb-3">
            <div className="col-md-4 fw-bold">Tên đăng nhập:</div>
            <div className="col-md-8">{nurse?.username}</div>
          </div>
          
          <div className="row mb-3">
            <div className="col-md-4 fw-bold">Trạng thái tài khoản:</div>
            <div className="col-md-8">
              <span className={`badge ${nurse?.isActive ? 'bg-success' : 'bg-danger'}`}>
                {nurse?.isActive ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
              </span>
            </div>
          </div>
          
          {nurse?.note && (
            <div className="row mb-3">
              <div className="col-md-4 fw-bold">Ghi chú:</div>
              <div className="col-md-8">{nurse.note}</div>
            </div>
          )}
        </div>
      </div>
      
      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h5 className="card-title">Thông tin bổ sung</h5>
          <p className="card-text">
            Tài khoản y tá có quyền truy cập vào các chức năng quản lý sự kiện y tế, kết quả khám sức khỏe, 
            kết quả tiêm chủng, lịch tư vấn và quản lý thuốc từ phụ huynh.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NurseProfile; 