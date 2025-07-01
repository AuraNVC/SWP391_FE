import React, { useState, useEffect } from "react";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import "../styles/Dashboard.css";

const MedEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: new Date().toISOString().split('T')[0],
    location: "",
    studentId: "",
    nurseId: localStorage.getItem("userId") || "",
    status: "1", // Default status
    notes: ""
  });

  const { setNotif } = useNotification();

  const columns = [
    { title: "ID", dataIndex: "medicalEventId" },
    { title: "Tiêu đề", dataIndex: "title" },
    { title: "Ngày", dataIndex: "eventDate", render: (date) => new Date(date).toLocaleDateString('vi-VN') },
    { title: "Học sinh", dataIndex: "studentName" },
    { title: "Trạng thái", dataIndex: "status", render: (status) => getStatusText(status) }
  ];

  const iconStyle = {
    view: { color: "#007bff" },
    edit: { color: "#28a745" },
    delete: { color: "#dc3545" },
  };

  const getStatusText = (status) => {
    const statusMap = {
      "0": "Đã tạo",
      "1": "Đang xử lý",
      "2": "Đã hoàn thành",
      "3": "Đã hủy"
    };
    return statusMap[status] || "Không xác định";
  };

  useEffect(() => {
    fetchMedicalEvents();
  }, []);

  const fetchMedicalEvents = async () => {
    setLoading(true);
    try {
      // Assume there's an API endpoint for medical events
      const response = await API_SERVICE.medicalEventAPI.getAll();
      setEvents(response);
    } catch (error) {
      console.error("Error fetching medical events:", error);
      setNotif({
        message: "Không thể tải danh sách sự kiện y tế",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API_SERVICE.medicalEventAPI.create(formData);
      setNotif({
        message: "Thêm sự kiện y tế thành công",
        type: "success"
      });
      setShowAddModal(false);
      setFormData({
        title: "",
        description: "",
        eventDate: new Date().toISOString().split('T')[0],
        location: "",
        studentId: "",
        nurseId: localStorage.getItem("userId") || "",
        status: "1",
        notes: ""
      });
      fetchMedicalEvents();
    } catch (error) {
      console.error("Error adding medical event:", error);
      setNotif({
        message: "Không thể thêm sự kiện y tế",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API_SERVICE.medicalEventAPI.update(selectedEvent.medicalEventId, formData);
      setNotif({
        message: "Cập nhật sự kiện y tế thành công",
        type: "success"
      });
      setShowEditModal(false);
      fetchMedicalEvents();
    } catch (error) {
      console.error("Error updating medical event:", error);
      setNotif({
        message: "Không thể cập nhật sự kiện y tế",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sự kiện này không?")) {
      setLoading(true);
      try {
        await API_SERVICE.medicalEventAPI.delete(id);
        setNotif({
          message: "Xóa sự kiện y tế thành công",
          type: "success"
        });
        fetchMedicalEvents();
      } catch (error) {
        console.error("Error deleting medical event:", error);
        setNotif({
          message: "Không thể xóa sự kiện y tế",
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleView = (event) => {
    setSelectedEvent(event);
    setShowViewModal(true);
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title || "",
      description: event.description || "",
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : "",
      location: event.location || "",
      studentId: event.studentId || "",
      nurseId: event.nurseId || localStorage.getItem("userId") || "",
      status: event.status?.toString() || "1",
      notes: event.notes || ""
    });
    setShowEditModal(true);
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h2>Quản lý sự kiện y tế</h2>
        <div>
          <button className="admin-btn" onClick={() => setShowAddModal(true)}>
            <FaPlus /> Thêm sự kiện y tế
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="loading-spinner">Đang tải...</div>
        ) : (
          <TableWithPaging
            columns={columns}
            data={events}
            page={page}
            pageSize={10}
            onPageChange={setPage}
            renderActions={(row) => (
              <div className="admin-action-group">
                <button
                  className="admin-action-btn admin-action-view admin-action-btn-reset"
                  title="Xem chi tiết"
                  onClick={() => handleView(row)}
                >
                  <FaEye style={iconStyle.view} size={18} />
                </button>
                <button
                  className="admin-action-btn admin-action-edit admin-action-btn-reset"
                  title="Chỉnh sửa"
                  onClick={() => handleEdit(row)}
                >
                  <FaEdit style={iconStyle.edit} size={18} />
                </button>
                <button
                  className="admin-action-btn admin-action-delete admin-action-btn-reset"
                  title="Xóa"
                  onClick={() => handleDeleteEvent(row.medicalEventId)}
                >
                  <FaTrash style={iconStyle.delete} size={18} />
                </button>
              </div>
            )}
          />
        )}
      </div>

      {/* Modal thêm sự kiện y tế */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Thêm sự kiện y tế mới</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddEvent}>
              <div className="form-group">
                <label>Tiêu đề <span className="required">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Ngày <span className="required">*</span></label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Địa điểm</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Học sinh <span className="required">*</span></label>
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                >
                  <option value="">-- Chọn học sinh --</option>
                  {/* Populate with student data */}
                  <option value="1">Nguyễn Văn A</option>
                  <option value="2">Trần Thị B</option>
                  <option value="3">Lê Văn C</option>
                </select>
              </div>
              <div className="form-group">
                <label>Trạng thái <span className="required">*</span></label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                >
                  <option value="0">Đã tạo</option>
                  <option value="1">Đang xử lý</option>
                  <option value="2">Đã hoàn thành</option>
                  <option value="3">Đã hủy</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                />
              </div>
              <div className="modal-footer">
                <button type="submit" className="admin-btn">Lưu</button>
                <button type="button" className="admin-btn btn-secondary" onClick={() => setShowAddModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết sự kiện y tế */}
      {showViewModal && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Chi tiết sự kiện y tế</h3>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>ID:</label>
                  <span>{selectedEvent.medicalEventId}</span>
                </div>
                <div className="info-item">
                  <label>Tiêu đề:</label>
                  <span>{selectedEvent.title}</span>
                </div>
                <div className="info-item">
                  <label>Ngày:</label>
                  <span>{selectedEvent.eventDate && new Date(selectedEvent.eventDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="info-item">
                  <label>Địa điểm:</label>
                  <span>{selectedEvent.location}</span>
                </div>
                <div className="info-item">
                  <label>Học sinh:</label>
                  <span>{selectedEvent.studentName}</span>
                </div>
                <div className="info-item">
                  <label>Trạng thái:</label>
                  <span>{getStatusText(selectedEvent.status)}</span>
                </div>
                <div className="info-item full-width">
                  <label>Mô tả:</label>
                  <span>{selectedEvent.description}</span>
                </div>
                <div className="info-item full-width">
                  <label>Ghi chú:</label>
                  <span>{selectedEvent.notes}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="admin-btn" onClick={() => setShowViewModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa sự kiện y tế */}
      {showEditModal && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Chỉnh sửa sự kiện y tế</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateEvent}>
              <div className="form-group">
                <label>Tiêu đề <span className="required">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Ngày <span className="required">*</span></label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Địa điểm</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Trạng thái <span className="required">*</span></label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                >
                  <option value="0">Đã tạo</option>
                  <option value="1">Đang xử lý</option>
                  <option value="2">Đã hoàn thành</option>
                  <option value="3">Đã hủy</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                />
              </div>
              <div className="modal-footer">
                <button type="submit" className="admin-btn">Lưu</button>
                <button type="button" className="admin-btn btn-secondary" onClick={() => setShowEditModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedEvents;