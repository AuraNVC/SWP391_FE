import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_SERVICE } from "../services/api";

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
      // Chuẩn hóa dữ liệu gửi lên API
      const payload = {
        fullName: form.fullName,
        dateOfBirth: form.dateOfBirth,
        className: form.className,
        gender: form.gender,
        studentNumber: form.studentNumber,
        parent: {
          fullName: form.parentFullName,
          phoneNumber: form.parentPhoneNumber,
          email: form.parentEmail,
          address: form.parentAddress,
        },
      };
      await API_SERVICE.studentAPI.create(payload);
      setSuccessMsg("Student created successfully!");
      setForm(initialState);
    } catch (error) {
      setErrorMsg("Failed to create student.");
    }
    setLoading(false);
  };

  const handleCancel = () => {
    navigate("/manager/student");
  };

  return (
    <div className="admin-main">
      <h2>Create New Student</h2>
      <form className="admin-form" onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "0 auto" }}>
        <div className="form-group">
          <label>Full Name<span style={{ color: "red" }}>*</span></label>
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
          <label>Date of Birth<span style={{ color: "red" }}>*</span></label>
          <input
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Class<span style={{ color: "red" }}>*</span></label>
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
          <label>Gender<span style={{ color: "red" }}>*</span></label>
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
          <label>Student Number<span style={{ color: "red" }}>*</span></label>
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
          <label>Parent Full Name<span style={{ color: "red" }}>*</span></label>
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
        {successMsg && <div style={{ color: "green", marginTop: 10 }}>{successMsg}</div>}
        {errorMsg && <div style={{ color: "red", marginTop: 10 }}>{errorMsg}</div>}
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button type="submit" className="admin-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Student"}
          </button>
          <button
            type="button"
            className="admin-btn"
            style={{ background: "#6c757d" }}
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentCreate;