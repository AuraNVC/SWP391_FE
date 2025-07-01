import React, { useState, useEffect } from "react";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import "../styles/Dashboard.css";

const MedEvents = () => {
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
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
    { title: "Ngày", dataIndex: "eventDate", render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : "N/A" },
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
    fetchStudents();
  }, []);

  const fetchMedicalEvents = async (keyword = "") => {
    setLoading(true);
    try {
      const response = await API_SERVICE.medicalEventAPI.getAll({
        keyword: keyword
      });
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

  const fetchStudents = async () => {
    try {
      const response = await API_SERVICE.studentAPI.getAll({
        keyword: ""
      });
      setStudents(response);
    } catch (error) {
      console.error("Error fetching students:", error);
      setNotif({
        message: "Không thể tải danh sách học sinh",
        type: "error"
      });
    }
  };

  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      await fetchMedicalEvents(searchKeyword);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
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
      // Validate form data
      if (!formData.title || !formData.eventDate || !formData.studentId) {
        setNotif({
          message: "Vui lòng điền đầy đủ thông tin bắt buộc",
          type: "error"
        });
        setLoading(false);
        return;
      }

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
        message: "Không thể thêm sự kiện y tế: " + (error.message || "Lỗi không xác định"),
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
      // Validate form data
      if (!formData.title || !formData.eventDate || !formData.studentId) {
        setNotif({
          message: "Vui lòng điền đầy đủ thông tin bắt buộc",
          type: "error"
        });
        setLoading(false);
        return;
      }

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
        message: "Không thể cập nhật sự kiện y tế: " + (error.message || "Lỗi không xác định"),
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
          message: "Không thể xóa sự kiện y tế: " + (error.message || "Lỗi không xác định"),
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
        <div className="admin-header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="admin-search"
            />
            <button 
              className="admin-btn search-btn" 
              onClick={handleSearch}
              disabled={searchLoading}
            >
              {searchLoading ? "Đang tìm..." : <FaSearch />}
            </button>
          </div>
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
              <h3>Thêm sự kiện y tế</h3>
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
                  placeholder="Nhập tiêu đề sự kiện"
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Nhập mô tả sự kiện"
                  rows="3"
                ></textarea>
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
                  placeholder="Nhập địa điểm"
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
                  {students.map((student) => (
                    <option key={student.studentId} value={student.studentId}>
                      {student.fullName} - {student.studentCode}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
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
                  placeholder="Nhập ghi chú"
                  rows="3"
                ></textarea>
              </div>
              <div className="form-actions">
                <button type="submit" className="admin-btn" disabled={loading}>
                  {loading ? "Đang thêm..." : "Thêm mới"}
                </button>
                <button
                  type="button"
                  className="admin-btn cancel-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </button>
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
                  <strong>ID:</strong> {selectedEvent.medicalEventId}
                </div>
                <div className="info-item">
                  <strong>Tiêu đề:</strong> {selectedEvent.title}
                </div>
                <div className="info-item">
                  <strong>Ngày:</strong> {selectedEvent.eventDate ? new Date(selectedEvent.eventDate).toLocaleDateString('vi-VN') : "N/A"}
                </div>
                <div className="info-item">
                  <strong>Địa điểm:</strong> {selectedEvent.location || "Không có"}
                </div>
                <div className="info-item">
                  <strong>Học sinh:</strong> {selectedEvent.studentName || "Không có"}
                </div>
                <div className="info-item">
                  <strong>Trạng thái:</strong> {getStatusText(selectedEvent.status)}
                </div>
                <div className="info-item full-width">
                  <strong>Mô tả:</strong> {selectedEvent.description || "Không có"}
                </div>
                <div className="info-item full-width">
                  <strong>Ghi chú:</strong> {selectedEvent.notes || "Không có"}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="admin-btn" onClick={() => setShowViewModal(false)}>
                Đóng
              </button>
              <button className="admin-btn" onClick={() => {
                setShowViewModal(false);
                handleEdit(selectedEvent);
              }}>
                Chỉnh sửa
              </button>
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
                  placeholder="Nhập tiêu đề sự kiện"
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Nhập mô tả sự kiện"
                  rows="3"
                ></textarea>
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
                  placeholder="Nhập địa điểm"
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
                  {students.map((student) => (
                    <option key={student.studentId} value={student.studentId}>
                      {student.fullName} - {student.studentCode}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
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
                  placeholder="Nhập ghi chú"
                  rows="3"
                ></textarea>
              </div>
              <div className="form-actions">
                <button type="submit" className="admin-btn" disabled={loading}>
                  {loading ? "Đang cập nhật..." : "Cập nhật"}
                </button>
                <button
                  type="button"
                  className="admin-btn cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedEvents;