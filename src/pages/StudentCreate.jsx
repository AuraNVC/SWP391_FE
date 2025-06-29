import React, { useState } from "react";
import "../styles/StudentCreateForm.css";
import { API_SERVICE } from "../services/api";
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNotification } from "../contexts/NotificationContext";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';

const initialState = {
  fullName: "",
  dateOfBirth: "",
  className: "",
  gender: "",
  studentNumber: "",
  parentFullName: "",
  parentPhoneNumber: "",
  parentEmail: "",
  parentAddress: "",
};

const StudentCreate = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [dateOfBirth, setDateOfBirth] = React.useState(null);
  
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
      const parent = await API_SERVICE.parentAPI.search({ keyword: form.parentFullName });
      if (parent.length === 0) {
        setErrorMsg("Parent not found. Please check the parent name.");
        setLoading(false);
        return;
      }
      const payload = {
        fullName: form.fullName,
        dateOfBirth: form.dateOfBirth,
        className: form.className,
        gender: form.gender,
        studentNumber: form.studentNumber,
        parentId: parent[0].parentId,
        passwordHash: form.studentNumber,
      };
      await API_SERVICE.studentAPI.create(payload);
      setSuccessMsg("Student created successfully!");
      setNotif({
        message: "Student created successfully!",
        type: "success",
      });
      setTimeout(() => {
        navigate('/manager/student');
      }, 1500);
    } catch (error) {
      const errorMessage = "Failed to create student. " + (error?.response?.data?.message || error.message);
      setErrorMsg(errorMessage);
      setNotif({
        message: errorMessage,
        type: "error",
      });
    }
    setLoading(false);
  };

  const handleCancel = () => {
    navigate('/manager/student');
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h2>Create New Student</h2>
        <button className="admin-btn cancel-btn" onClick={handleCancel}>
          Back to Student List
        </button>
      </div>
      
      <div className="student-create-page-container">
        <form className="student-create-form" onSubmit={handleSubmit}>
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
            <label htmlFor="dateOfBirth">Date of Birth<span className="required">*</span></label>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date of Birth"
                value={dateOfBirth}
                onChange={(newValue) => {
                  setDateOfBirth(newValue);
                  setForm((prev) => ({
                    ...prev,
                    dateOfBirth: newValue ? newValue.toISOString().split('T')[0] : ""
                  }));
                }}
                renderInput={(params) => <TextField {...params} required fullWidth />}
              />
            </LocalizationProvider>
          </div>
          <div className="form-group">
            <label>Class<span className="required">*</span></label>
            <input
              type="text"
              name="className"
              value={form.className}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="e.g. 1A"
            />
          </div>
          <div className="form-group">
            <label>Gender<span className="required">*</span></label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Select gender</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
          <div className="form-group">
            <label>Student Number<span className="required">*</span></label>
            <input
              type="text"
              name="studentNumber"
              value={form.studentNumber}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="e.g. binhan1"
            />
          </div>
          <hr />
          <h4>Parent Information</h4>
          <div className="form-group">
            <label>Parent Full Name<span className="required">*</span></label>
            <input
              type="text"
              name="parentFullName"
              value={form.parentFullName}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Parent Phone Number</label>
            <input
              type="text"
              name="parentPhoneNumber"
              value={form.parentPhoneNumber}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Parent Email</label>
            <input
              type="email"
              name="parentEmail"
              value={form.parentEmail}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Parent Address</label>
            <input
              type="text"
              name="parentAddress"
              value={form.parentAddress}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          {successMsg && <div className="success-msg">{successMsg}</div>}
          {errorMsg && <div className="error-msg">{errorMsg}</div>}
          <div className="form-actions">
            <button type="submit" className="admin-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Student"}
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

export default StudentCreate; 