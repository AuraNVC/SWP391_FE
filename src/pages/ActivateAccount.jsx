import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNotification } from "../contexts/NotificationContext";
import logoSchoolCare from "../assets/logoSchoolCare.png";

const ActivateAccount = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { setNotif } = useNotification();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState(null); // 'parent' hoặc 'nurse'

  useEffect(() => {
    if (code) {
      activateAccount();
    }
  }, [code]);

  const activateAccount = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      // Thử kích hoạt cho Parent trước
      let response = await fetch(`${API_BASE_URL}/parent/activate/${code}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setUserType('parent');
        setSuccess(true);
        setNotif({
          message: "Tài khoản phụ huynh đã được kích hoạt thành công!",
          type: "success",
        });
      } else {
        // Nếu không phải parent, thử nurse
        response = await fetch(`${API_BASE_URL}/nurse/activate/${code}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          setUserType('nurse');
          setSuccess(true);
          setNotif({
            message: "Tài khoản y tá đã được kích hoạt thành công!",
            type: "success",
          });
        } else {
          // Không hiển thị thông báo lỗi, chỉ set error state
          setError("Mã kích hoạt không hợp lệ hoặc đã được sử dụng");
        }
      }
    } catch (err) {
      // Không hiển thị thông báo lỗi, chỉ set error state
      setError("Mã kích hoạt không hợp lệ hoặc đã được sử dụng");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  const handleGoToHome = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4>Đang kích hoạt tài khoản...</h4>
          <p className="text-muted">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow w-100 mx-auto" style={{ maxWidth: 500 }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <img
              src={logoSchoolCare}
              alt="Logo SchoolCare"
              style={{ height: 64 }}
              className="mb-3"
            />
            <h2 className="h3 mb-2 fw-bold text-dark">
              {success ? "🎉 Kích hoạt thành công!" : "ℹ️ Thông tin"}
            </h2>
          </div>

          {success ? (
            <div className="text-center">
              <div className="alert alert-success" role="alert">
                <h5 className="alert-heading">Chúc mừng!</h5>
                <p>
                  Tài khoản {userType === 'parent' ? 'phụ huynh' : 'y tá'} của bạn đã được kích hoạt thành công.
                </p>
                <hr />
                <p className="mb-0">
                  Bây giờ bạn có thể đăng nhập và sử dụng hệ thống School Care.
                </p>
              </div>
              
              <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                <button
                  className="btn btn-primary btn-lg px-4 me-md-2"
                  onClick={handleGoToLogin}
                >
                  Đăng nhập ngay
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="alert alert-info" role="alert">
                <h5 className="alert-heading">Thông báo</h5>
                <p>
                  Link kích hoạt này không còn hợp lệ hoặc đã được sử dụng.
                </p>
                <hr />
                <p className="mb-0">
                  Nếu bạn chưa kích hoạt tài khoản, vui lòng kiểm tra email hoặc liên hệ với quản trị viên.
                </p>
              </div>
              
              <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                <button
                  className="btn btn-primary btn-lg px-4 me-md-2"
                  onClick={handleGoToLogin}
                >
                  Thử đăng nhập
                </button>
              </div>
            </div>
          )}

          <div className="text-center mt-4">
            <p className="text-muted small">
              Nếu bạn gặp vấn đề, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivateAccount; 