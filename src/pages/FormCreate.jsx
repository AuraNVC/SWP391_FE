import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";

const initialState = {
  className: "",
  title: "",
  content: "",
  sentDate: "",
  createdAt: "",
  type: 1,
};

const FormCreate = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { setNotif } = useNotification();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "type" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const payload = {
        ...form,
        type: Number(form.type),
      };
      await API_SERVICE.formAPI.create(payload);
      setNotif({
        message: "Tạo form thành công!",
        type: "success",
      });
      navigate("/manager/form");
    } catch (error) {
      setErrorMsg("Failed to create form: " + error.message);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    navigate("/manager/form");
  };

  return (
    <div className="admin-main">
      <h2>Create New Form</h2>
      <form className="admin-form" onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "0 auto" }}>
        <div className="form-group">
          <label>Class Name<span style={{ color: "red" }}>*</span></label>
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
          <label>Title<span style={{ color: "red" }}>*</span></label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Content<span style={{ color: "red" }}>*</span></label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            required
            className="form-control"
            rows={4}
          />
        </div>
        <div className="form-group">
          <label>Sent Date<span style={{ color: "red" }}>*</span></label>
          <input
            type="datetime-local"
            name="sentDate"
            value={form.sentDate}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Created At<span style={{ color: "red" }}>*</span></label>
          <input
            type="datetime-local"
            name="createdAt"
            value={form.createdAt}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Type<span style={{ color: "red" }}>*</span></label>
          <input
            type="number"
            name="type"
            value={form.type}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="e.g. 1"
          />
        </div>
        {successMsg && <div style={{ color: "green", marginTop: 10 }}>{successMsg}</div>}
        {errorMsg && <div style={{ color: "red", marginTop: 10 }}>{errorMsg}</div>}
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button type="submit" className="admin-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Form"}
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

export default FormCreate;