import React, { useState, useEffect } from "react";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaPlus } from "react-icons/fa";
import "../styles/Dashboard.css";

const HealthResults = () => {
  const [results, setResults] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [formData, setFormData] = useState({
    healthCheckScheduleId: "",
    healthProfileId: "",
    nurseId: localStorage.getItem("userId") || "",
    height: "",
    weight: "",
    leftVision: "",
    rightVision: "",
    result: "",
    status: "1", // Default status: Completed
    note: ""
  });

  const { setNotif } = useNotification();

  const columns = [
    { title: "ID", dataIndex: "healthCheckupRecordId" },
    { title: "Học sinh", dataIndex: "studentName" },
    { title: "Chiều cao", dataIndex: "height", render: (height) => `${height} cm` },
    { title: "Cân nặng", dataIndex: "weight", render: (weight) => `${weight} kg` },
    { title: "Kết quả", dataIndex: "result" },
    { title: "Trạng thái", dataIndex: "status", render: (status) => getStatusText(status) }
  ];

  const iconStyle = {
    view: { color: "#007bff" },
    edit: { color: "#28a745" }
  };

  const getStatusText = (status) => {
    const statusMap = {
      "0": "Chưa hoàn thành",
      "1": "Đã hoàn thành",
      "2": "Đã hủy"
    };
    return statusMap[status] || "Không xác định";
  };

  useEffect(() => {
    fetchHealthCheckResults();
    fetchHealthCheckSchedules();
  }, []);

  const fetchHealthCheckResults = async () => {
    setLoading(true);
    try {
      // Assume there's an API endpoint for health check results
      const response = await API_SERVICE.healthCheckResultAPI.getAll();
      setResults(response);
    } catch (error) {
      console.error("Error fetching health check results:", error);
      setNotif({
        message: "Không thể tải danh sách kết quả khám sức khỏe",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthCheckSchedules = async () => {
    try {
      // Assume there's an API endpoint for health check schedules
      const response = await API_SERVICE.healthCheckScheduleAPI.getAll({});
      setSchedules(response);
    } catch (error) {
      console.error("Error fetching health check schedules:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddResult = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API_SERVICE.healthCheckResultAPI.create(formData);
      setNotif({
        message: "Thêm kết quả khám sức khỏe thành công",
        type: "success"
      });
      setShowAddModal(false);
      setFormData({
        healthCheckScheduleId: "",
        healthProfileId: "",
        nurseId: localStorage.getItem("userId") || "",
        height: "",
        weight: "",
        leftVision: "",
        rightVision: "",
        result: "",
        status: "1",
        note: ""
      });
      fetchHealthCheckResults();
    } catch (error) {
      console.error("Error adding health check result:", error);
      setNotif({
        message: "Không thể thêm kết quả khám sức khỏe",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateResult = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API_SERVICE.healthCheckResultAPI.update(selectedResult.healthCheckupRecordId, formData);
      setNotif({
        message: "Cập nhật kết quả khám sức khỏe thành công",
        type: "success"
      });
      setShowEditModal(false);
      fetchHealthCheckResults();
    } catch (error) {
      console.error("Error updating health check result:", error);
      setNotif({
        message: "Không thể cập nhật kết quả khám sức khỏe",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (result) => {
    setSelectedResult(result);
    setShowViewModal(true);
  };

  const handleEdit = (result) => {
    setSelectedResult(result);
    setFormData({
      healthCheckScheduleId: result.healthCheckScheduleId || "",
      healthProfileId: result.healthProfileId || "",
      nurseId: result.nurseId || localStorage.getItem("userId") || "",
      height: result.height || "",
      weight: result.weight || "",
      leftVision: result.leftVision || "",
      rightVision: result.rightVision || "",
      result: result.result || "",
      status: result.status?.toString() || "1",
      note: result.note || ""
    });
    setShowEditModal(true);
  };

  const handleScheduleChange = (e) => {
    const scheduleId = e.target.value;
    const selectedSchedule = schedules.find(s => s.healthCheckScheduleId.toString() === scheduleId);
    
    if (selectedSchedule) {
      setFormData({
        ...formData,
        healthCheckScheduleId: scheduleId,
        healthProfileId: selectedSchedule.healthProfileId || ""
      });
    } else {
      setFormData({
        ...formData,
        healthCheckScheduleId: scheduleId
      });
    }
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h2>Quản lý kết quả khám sức khỏe</h2>
        <div>
          <button className="admin-btn" onClick={() => setShowAddModal(true)}>
            <FaPlus /> Thêm kết quả khám
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="loading-spinner">Đang tải...</div>
        ) : (
          <TableWithPaging
            columns={columns}
            data={results}
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
              </div>
            )}
          />
        )}
      </div>

      {/* Modal thêm kết quả khám */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Thêm kết quả khám sức khỏe</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddResult}>
              <div className="form-group">
                <label>Lịch khám <span className="required">*</span></label>
                <select
                  name="healthCheckScheduleId"
                  value={formData.healthCheckScheduleId}
                  onChange={handleScheduleChange}
                  required
                  className="form-control"
                >
                  <option value="">-- Chọn lịch khám --</option>
                  {schedules.map(schedule => (
                    <option key={schedule.healthCheckScheduleId} value={schedule.healthCheckScheduleId}>
                      {schedule.title || `Lịch khám #${schedule.healthCheckScheduleId}`} - {new Date(schedule.checkupDate).toLocaleDateString('vi-VN')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Chiều cao (cm) <span className="required">*</span></label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label>Cân nặng (kg) <span className="required">*</span></label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="form-row">
                <div className="form-group half-width">
                  <label>Thị lực trái</label>
                  <input
                    type="number"
                    name="leftVision"
                    value={formData.leftVision}
                    onChange={handleInputChange}
                    className="form-control"
                    min="0"
                    max="10"
                    step="0.1"
                  />
                </div>
                <div className="form-group half-width">
                  <label>Thị lực phải</label>
                  <input
                    type="number"
                    name="rightVision"
                    value={formData.rightVision}
                    onChange={handleInputChange}
                    className="form-control"
                    min="0"
                    max="10"
                    step="0.1"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Kết quả <span className="required">*</span></label>
                <textarea
                  name="result"
                  value={formData.result}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  rows={3}
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
                  <option value="0">Chưa hoàn thành</option>
                  <option value="1">Đã hoàn thành</option>
                  <option value="2">Đã hủy</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  className="form-control"
                  rows={2}
                />
              </div>
              <div className="modal-footer">
                <button type="submit" className="admin-btn" disabled={loading}>
                  {loading ? "Đang lưu..." : "Lưu"}
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

      {/* Modal xem chi tiết kết quả khám */}
      {showViewModal && selectedResult && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Chi tiết kết quả khám sức khỏe</h3>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>ID:</label>
                  <span>{selectedResult.healthCheckupRecordId}</span>
                </div>
                <div className="info-item">
                  <label>Học sinh:</label>
                  <span>{selectedResult.studentName}</span>
                </div>
                <div className="info-item">
                  <label>Y tá:</label>
                  <span>{selectedResult.nurseName}</span>
                </div>
                <div className="info-item">
                  <label>Ngày khám:</label>
                  <span>{selectedResult.checkupDate && new Date(selectedResult.checkupDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="info-item">
                  <label>Chiều cao:</label>
                  <span>{selectedResult.height} cm</span>
                </div>
                <div className="info-item">
                  <label>Cân nặng:</label>
                  <span>{selectedResult.weight} kg</span>
                </div>
                <div className="info-item">
                  <label>Thị lực trái:</label>
                  <span>{selectedResult.leftVision}</span>
                </div>
                <div className="info-item">
                  <label>Thị lực phải:</label>
                  <span>{selectedResult.rightVision}</span>
                </div>
                <div className="info-item">
                  <label>Trạng thái:</label>
                  <span>{getStatusText(selectedResult.status)}</span>
                </div>
                <div className="info-item full-width">
                  <label>Kết quả:</label>
                  <span>{selectedResult.result}</span>
                </div>
                <div className="info-item full-width">
                  <label>Ghi chú:</label>
                  <span>{selectedResult.note}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="admin-btn"
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(selectedResult);
                }}
              >
                Chỉnh sửa
              </button>
              <button
                className="admin-btn cancel-btn"
                onClick={() => setShowViewModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa kết quả khám */}
      {showEditModal && selectedResult && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Chỉnh sửa kết quả khám sức khỏe</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateResult}>
              <div className="form-group">
                <label>Chiều cao (cm) <span className="required">*</span></label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label>Cân nặng (kg) <span className="required">*</span></label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="form-row">
                <div className="form-group half-width">
                  <label>Thị lực trái</label>
                  <input
                    type="number"
                    name="leftVision"
                    value={formData.leftVision}
                    onChange={handleInputChange}
                    className="form-control"
                    min="0"
                    max="10"
                    step="0.1"
                  />
                </div>
                <div className="form-group half-width">
                  <label>Thị lực phải</label>
                  <input
                    type="number"
                    name="rightVision"
                    value={formData.rightVision}
                    onChange={handleInputChange}
                    className="form-control"
                    min="0"
                    max="10"
                    step="0.1"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Kết quả <span className="required">*</span></label>
                <textarea
                  name="result"
                  value={formData.result}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  rows={3}
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
                  <option value="0">Chưa hoàn thành</option>
                  <option value="1">Đã hoàn thành</option>
                  <option value="2">Đã hủy</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  className="form-control"
                  rows={2}
                />
              </div>
              <div className="modal-footer">
                <button type="submit" className="admin-btn" disabled={loading}>
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
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

export default HealthResults; 