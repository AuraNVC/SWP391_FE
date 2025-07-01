import React, { useState, useEffect } from "react";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import "../styles/Dashboard.css";

const ConsultSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    consultationDate: new Date().toISOString().split('T')[0],
    startTime: "08:00",
    endTime: "09:00",
    location: "Phòng y tế",
    parentId: "",
    nurseId: localStorage.getItem("userId") || "",
    status: "0", // Default status: Pending
    note: ""
  });

  const { setNotif } = useNotification();

  const columns = [
    { title: "ID", dataIndex: "consultationScheduleId" },
    { title: "Tiêu đề", dataIndex: "title" },
    { title: "Phụ huynh", dataIndex: "parentName" },
    { title: "Ngày", dataIndex: "consultationDate", render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : "N/A" },
    { title: "Thời gian", render: (row) => `${row.startTime || "N/A"} - ${row.endTime || "N/A"}` },
    { title: "Trạng thái", dataIndex: "status", render: (status) => getStatusText(status) }
  ];

  const iconStyle = {
    view: { color: "#007bff" },
    edit: { color: "#28a745" },
    delete: { color: "#dc3545" }
  };

  const getStatusText = (status) => {
    const statusMap = {
      "0": "Chờ xác nhận",
      "1": "Đã xác nhận",
      "2": "Đã hoàn thành",
      "3": "Đã hủy"
    };
    return statusMap[status] || "Không xác định";
  };

  useEffect(() => {
    fetchConsultationSchedules();
    fetchParents();
  }, []);

  const fetchConsultationSchedules = async (keyword = "") => {
    setLoading(true);
    try {
      const response = await API_SERVICE.consultationScheduleAPI.getAll({
        keyword: keyword,
        nurseId: localStorage.getItem("userId") || ""
      });
      setSchedules(response);
    } catch (error) {
      console.error("Error fetching consultation schedules:", error);
      setNotif({
        message: "Không thể tải danh sách lịch tư vấn",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchParents = async () => {
    try {
      const response = await API_SERVICE.parentAPI.getAll({ keyword: "" });
      setParents(response);
    } catch (error) {
      console.error("Error fetching parents:", error);
      setNotif({
        message: "Không thể tải danh sách phụ huynh",
        type: "error"
      });
    }
  };

  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      await fetchConsultationSchedules(searchKeyword);
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

  const validateForm = () => {
    if (!formData.title || !formData.consultationDate || !formData.parentId) {
      setNotif({
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
        type: "error"
      });
      return false;
    }
    
    // Kiểm tra thời gian kết thúc phải sau thời gian bắt đầu
    if (formData.startTime >= formData.endTime) {
      setNotif({
        message: "Thời gian kết thúc phải sau thời gian bắt đầu",
        type: "error"
      });
      return false;
    }
    
    return true;
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await API_SERVICE.consultationScheduleAPI.create(formData);
      setNotif({
        message: "Thêm lịch tư vấn thành công",
        type: "success"
      });
      setShowAddModal(false);
      setFormData({
        title: "",
        description: "",
        consultationDate: new Date().toISOString().split('T')[0],
        startTime: "08:00",
        endTime: "09:00",
        location: "Phòng y tế",
        parentId: "",
        nurseId: localStorage.getItem("userId") || "",
        status: "0",
        note: ""
      });
      fetchConsultationSchedules(searchKeyword);
    } catch (error) {
      console.error("Error adding consultation schedule:", error);
      setNotif({
        message: "Không thể thêm lịch tư vấn: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await API_SERVICE.consultationScheduleAPI.update(selectedSchedule.consultationScheduleId, formData);
      setNotif({
        message: "Cập nhật lịch tư vấn thành công",
        type: "success"
      });
      setShowEditModal(false);
      fetchConsultationSchedules(searchKeyword);
    } catch (error) {
      console.error("Error updating consultation schedule:", error);
      setNotif({
        message: "Không thể cập nhật lịch tư vấn: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch tư vấn này không?")) {
      setLoading(true);
      try {
        await API_SERVICE.consultationScheduleAPI.delete(id);
        setNotif({
          message: "Xóa lịch tư vấn thành công",
          type: "success"
        });
        fetchConsultationSchedules(searchKeyword);
      } catch (error) {
        console.error("Error deleting consultation schedule:", error);
        setNotif({
          message: "Không thể xóa lịch tư vấn: " + (error.message || "Lỗi không xác định"),
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleView = (schedule) => {
    setSelectedSchedule(schedule);
    setShowViewModal(true);
  };

  const handleEdit = (schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      title: schedule.title || "",
      description: schedule.description || "",
      consultationDate: schedule.consultationDate ? new Date(schedule.consultationDate).toISOString().split('T')[0] : "",
      startTime: schedule.startTime || "08:00",
      endTime: schedule.endTime || "09:00",
      location: schedule.location || "Phòng y tế",
      parentId: schedule.parentId || "",
      nurseId: schedule.nurseId || localStorage.getItem("userId") || "",
      status: schedule.status?.toString() || "0",
      note: schedule.note || ""
    });
    setShowEditModal(true);
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h2>Quản lý lịch tư vấn</h2>
        <div className="admin-header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm lịch tư vấn..."
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
            <FaPlus /> Thêm lịch tư vấn
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="loading-spinner">Đang tải...</div>
        ) : (
          <TableWithPaging
            columns={columns}
            data={schedules}
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
                  onClick={() => handleDeleteSchedule(row.consultationScheduleId)}
                >
                  <FaTrash style={iconStyle.delete} size={18} />
                </button>
              </div>
            )}
          />
        )}
        {!loading && schedules.length === 0 && (
          <div className="no-data-message">
            Không có lịch tư vấn nào
          </div>
        )}
      </div>

      {/* Modal thêm lịch tư vấn */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Thêm lịch tư vấn</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddSchedule}>
              <div className="form-group">
                <label>Tiêu đề <span className="required">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="Nhập tiêu đề tư vấn"
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
                  placeholder="Nhập mô tả tư vấn"
                ></textarea>
              </div>
              <div className="form-group">
                <label>Phụ huynh <span className="required">*</span></label>
                <select
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                >
                  <option value="">-- Chọn phụ huynh --</option>
                  {parents.map((parent) => (
                    <option key={parent.parentId} value={parent.parentId}>
                      {parent.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Ngày tư vấn <span className="required">*</span></label>
                <input
                  type="date"
                  name="consultationDate"
                  value={formData.consultationDate}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Thời gian bắt đầu <span className="required">*</span></label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Thời gian kết thúc <span className="required">*</span></label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Địa điểm <span className="required">*</span></label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="Nhập địa điểm tư vấn"
                />
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="0">Chờ xác nhận</option>
                  <option value="1">Đã xác nhận</option>
                  <option value="2">Đã hoàn thành</option>
                  <option value="3">Đã hủy</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                  placeholder="Nhập ghi chú (nếu có)"
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
                  disabled={loading}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết lịch tư vấn */}
      {showViewModal && selectedSchedule && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Chi tiết lịch tư vấn</h3>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <strong>ID:</strong> {selectedSchedule.consultationScheduleId}
                </div>
                <div className="info-item">
                  <strong>Tiêu đề:</strong> {selectedSchedule.title || "Không có"}
                </div>
                <div className="info-item">
                  <strong>Phụ huynh:</strong> {selectedSchedule.parentName || "Không có"}
                </div>
                <div className="info-item">
                  <strong>Ngày tư vấn:</strong> {selectedSchedule.consultationDate ? new Date(selectedSchedule.consultationDate).toLocaleDateString('vi-VN') : "Không có"}
                </div>
                <div className="info-item">
                  <strong>Thời gian:</strong> {selectedSchedule.startTime || "N/A"} - {selectedSchedule.endTime || "N/A"}
                </div>
                <div className="info-item">
                  <strong>Địa điểm:</strong> {selectedSchedule.location || "Không có"}
                </div>
                <div className="info-item">
                  <strong>Trạng thái:</strong> {getStatusText(selectedSchedule.status)}
                </div>
                <div className="info-item full-width">
                  <strong>Mô tả:</strong> {selectedSchedule.description || "Không có"}
                </div>
                <div className="info-item full-width">
                  <strong>Ghi chú:</strong> {selectedSchedule.note || "Không có"}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="admin-btn" onClick={() => setShowViewModal(false)}>
                Đóng
              </button>
              <button className="admin-btn" onClick={() => {
                setShowViewModal(false);
                handleEdit(selectedSchedule);
              }}>
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa lịch tư vấn */}
      {showEditModal && selectedSchedule && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Chỉnh sửa lịch tư vấn</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateSchedule}>
              <div className="form-group">
                <label>Tiêu đề <span className="required">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="Nhập tiêu đề tư vấn"
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
                  placeholder="Nhập mô tả tư vấn"
                ></textarea>
              </div>
              <div className="form-group">
                <label>Phụ huynh <span className="required">*</span></label>
                <select
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                >
                  <option value="">-- Chọn phụ huynh --</option>
                  {parents.map((parent) => (
                    <option key={parent.parentId} value={parent.parentId}>
                      {parent.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Ngày tư vấn <span className="required">*</span></label>
                <input
                  type="date"
                  name="consultationDate"
                  value={formData.consultationDate}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Thời gian bắt đầu <span className="required">*</span></label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Thời gian kết thúc <span className="required">*</span></label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Địa điểm <span className="required">*</span></label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="Nhập địa điểm tư vấn"
                />
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="0">Chờ xác nhận</option>
                  <option value="1">Đã xác nhận</option>
                  <option value="2">Đã hoàn thành</option>
                  <option value="3">Đã hủy</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                  placeholder="Nhập ghi chú (nếu có)"
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
                  disabled={loading}
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

export default ConsultSchedules;