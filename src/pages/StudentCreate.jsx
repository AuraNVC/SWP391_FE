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
  password: "",
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
        setErrorMsg("Không tìm thấy phụ huynh. Vui lòng kiểm tra lại tên phụ huynh.");
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
        passwordHash: form.password && form.password.trim() !== '' ? form.password : '123456',
      };
      await API_SERVICE.studentAPI.create(payload);
      // Sau khi tạo học sinh, lấy lại studentId
      let studentId;
      // Tìm lại học sinh vừa tạo theo studentNumber (unique)
      const students = await API_SERVICE.studentAPI.getAll({ keyword: payload.studentNumber });
      const createdStudent = students.find(stu => stu.studentNumber === payload.studentNumber);
      studentId = createdStudent?.studentId;
      if (studentId) {
        try {
          await API_SERVICE.healthProfileAPI.add({ studentId, bloodType: "", allergies: "" });
        } catch (e) {
          // Không cần chặn flow nếu tạo health profile lỗi
          console.error("Tạo health profile thất bại", e);
        }
      }
      setSuccessMsg("Tạo học sinh thành công!");
      setNotif({
        message: "Tạo học sinh thành công!",
        type: "success",
      });
      setTimeout(() => {
        navigate('/manager/student');
      }, 1500);
    } catch (error) {
      const errorMessage = "Tạo học sinh thất bại. " + (error?.response?.data?.message || error.message);
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
        <h2>Thêm học sinh mới</h2>
      </div>
      
      <div className="student-create-page-container">
        <form className="student-create-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ tên<span className="required">*</span></label>
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
            <label htmlFor="dateOfBirth">Ngày sinh<span className="required">*</span></label>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Ngày sinh"
                value={dateOfBirth}
                onChange={(newValue) => {
                  setDateOfBirth(newValue);
                  setForm((prev) => ({
                    ...prev,
                    dateOfBirth: newValue ? newValue.toISOString().split('T')[0] : ""
                  }));
                }}
                maxDate={new Date()}
                renderInput={(params) => <TextField {...params} required fullWidth />}
              />
            </LocalizationProvider>
          </div>
          <div className="form-group">
            <label>Lớp<span className="required">*</span></label>
            <input
              type="text"
              name="className"
              value={form.className}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="VD: 1A"
            />
          </div>
          <div className="form-group">
            <label>Giới tính<span className="required">*</span></label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
          <div className="form-group">
            <label>Mã số học sinh<span className="required">*</span></label>
            <input
              type="text"
              name="studentNumber"
              value={form.studentNumber}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="VD: binhan1"
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu (nếu bỏ trống sẽ mặc định là 123456)</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="form-control"
              placeholder="Nhập mật khẩu hoặc để trống"
            />
          </div>
          <hr />
          <h4>Thông tin phụ huynh</h4>
          <div className="form-group">
            <label>Họ tên phụ huynh<span className="required">*</span></label>
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
            <label>Số điện thoại phụ huynh</label>
            <input
              type="text"
              name="parentPhoneNumber"
              value={form.parentPhoneNumber}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Email phụ huynh</label>
            <input
              type="email"
              name="parentEmail"
              value={form.parentEmail}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Địa chỉ phụ huynh</label>
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
              {loading ? "Đang tạo..." : "Tạo học sinh"}
            </button>
            <button
              type="button"
              className="admin-btn cancel-btn"
              onClick={handleCancel}
              disabled={loading}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentCreate; 