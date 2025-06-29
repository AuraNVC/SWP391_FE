import React, { useState } from "react";
import "../styles/NurseCreateForm.css";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import { useNavigate } from 'react-router-dom';

const initialState = {
  fullName: "",
  email: "",
  username: "",
  passwordHash: "",
};

const NurseCreate = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const { setNotif } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        username: form.username,
        passwordHash: form.passwordHash || form.username, // Use username as default password
      };
      await API_SERVICE.nurseAPI.create(payload);
      setSuccessMsg("Nurse created successfully!");
      setNotif({
        message: "Nurse created successfully!",
        type: "success",
      });
      setTimeout(() => {
        navigate('/manager/nurse');
      }, 1500);
    } catch (error) {
      const errorMessage = "Failed to create nurse. " + (error?.response?.data?.message || error.message);
      setErrorMsg(errorMessage);
      setNotif({
        message: errorMessage,
        type: "error",
      });
    }
    setLoading(false);
  };

  const handleCancel = () => {
    navigate('/manager/nurse');
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h2>Create New Nurse</h2>
        <button className="admin-btn cancel-btn" onClick={handleCancel}>
          Back to Nurse List
        </button>
      </div>
      
      <div className="nurse-create-page-container">
        <form className="nurse-create-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name<span className="required">*</span></label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Email<span className="required">*</span></label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Username<span className="required">*</span></label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="passwordHash"
              value={form.passwordHash}
              onChange={handleChange}
              className="form-control"
              placeholder="Leave empty to use username as password"
            />
          </div>
          
          {successMsg && <div className="success-msg">{successMsg}</div>}
          {errorMsg && <div className="error-msg">{errorMsg}</div>}
          <div className="form-actions">
            <button type="submit" className="admin-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Nurse"}
            </button>
            <button
              type="button"
              className="admin-btn cancel-btn"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NurseCreate; 