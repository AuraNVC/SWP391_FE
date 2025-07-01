import React, { useState, useEffect } from "react";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaPlus, FaSearch } from "react-icons/fa";
import "../styles/Dashboard.css";

const HealthResults = () => {
  const [results, setResults] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
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
    { title: "Chiều cao", dataIndex: "height", render: (height) => height ? `${height} cm` : "N/A" },
    { title: "Cân nặng", dataIndex: "weight", render: (weight) => weight ? `${weight} kg` : "N/A" },
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

  const fetchHealthCheckResults = async (keyword = "") => {
    setLoading(true);
    try {
      const response = await API_SERVICE.healthCheckResultAPI.getAll({
        keyword: keyword,
        nurseId: localStorage.getItem("userId") || ""
      });
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
      const response = await API_SERVICE.healthCheckScheduleAPI.getAll({
        status: "1" // Chỉ lấy các lịch khám đã hoàn thành
      });
      setSchedules(response);
    } catch (error) {
      console.error("Error fetching health check schedules:", error);
      setNotif({
        message: "Không thể tải danh sách lịch khám sức khỏe",
        type: "error"
      });
    }
  };

  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      await fetchHealthCheckResults(searchKeyword);
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
    if (!formData.healthCheckScheduleId) {
      setNotif({
        message: "Vui lòng chọn lịch khám",
        type: "error"
      });
      return false;
    }
    
    if (!formData.height || !formData.weight) {
      setNotif({
        message: "Vui lòng nhập chiều cao và cân nặng",
        type: "error"
      });
      return false;
    }
    
    return true;
  };

  const handleAddResult = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
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
        message: "Không thể thêm kết quả khám sức khỏe: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateResult = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
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
        message: "Không thể cập nhật kết quả khám sức khỏe: " + (error.message || "Lỗi không xác định"),
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
        <div className="admin-header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm kết quả khám..."
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
        {!loading && results.length === 0 && (
          <div className="no-data-message">
            Không có kết quả khám sức khỏe nào
          </div>
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
                  {schedules.map((schedule) => (
                    <option key={schedule.healthCheckScheduleId} value={schedule.healthCheckScheduleId}>
                      {schedule.name} - {new Date(schedule.checkDate).toLocaleDateString('vi-VN')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Chiều cao (cm) <span className="required">*</span></label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.1"
                    className="form-control"
                    placeholder="Nhập chiều cao"
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
                    min="0"
                    step="0.1"
                    className="form-control"
                    placeholder="Nhập cân nặng"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Thị lực mắt trái</label>
                  <input
                    type="text"
                    name="leftVision"
                    value={formData.leftVision}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Nhập thị lực mắt trái"
                  />
                </div>
                <div className="form-group">
                  <label>Thị lực mắt phải</label>
                  <input
                    type="text"
                    name="rightVision"
                    value={formData.rightVision}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Nhập thị lực mắt phải"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Kết quả</label>
                <textarea
                  name="result"
                  value={formData.result}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Nhập kết quả khám"
                  rows="3"
                ></textarea>
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
                  <strong>ID:</strong> {selectedResult.healthCheckupRecordId}
                </div>
                <div className="info-item">
                  <strong>Học sinh:</strong> {selectedResult.studentName || "Không có"}
                </div>
                <div className="info-item">
                  <strong>Chiều cao:</strong> {selectedResult.height ? `${selectedResult.height} cm` : "Không có"}
                </div>
                <div className="info-item">
                  <strong>Cân nặng:</strong> {selectedResult.weight ? `${selectedResult.weight} kg` : "Không có"}
                </div>
                <div className="info-item">
                  <strong>Thị lực mắt trái:</strong> {selectedResult.leftVision || "Không có"}
                </div>
                <div className="info-item">
                  <strong>Thị lực mắt phải:</strong> {selectedResult.rightVision || "Không có"}
                </div>
                <div className="info-item">
                  <strong>Trạng thái:</strong> {getStatusText(selectedResult.status)}
                </div>
                <div className="info-item">
                  <strong>Y tá:</strong> {selectedResult.nurseName || "Không có"}
                </div>
                <div className="info-item full-width">
                  <strong>Kết quả:</strong> {selectedResult.result || "Không có"}
                </div>
                <div className="info-item full-width">
                  <strong>Ghi chú:</strong> {selectedResult.note || "Không có"}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="admin-btn" onClick={() => setShowViewModal(false)}>
                Đóng
              </button>
              <button className="admin-btn" onClick={() => {
                setShowViewModal(false);
                handleEdit(selectedResult);
              }}>
                Chỉnh sửa
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
                <label>Lịch khám <span className="required">*</span></label>
                <select
                  name="healthCheckScheduleId"
                  value={formData.healthCheckScheduleId}
                  onChange={handleScheduleChange}
                  required
                  className="form-control"
                  disabled
                >
                  <option value="">-- Chọn lịch khám --</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.healthCheckScheduleId} value={schedule.healthCheckScheduleId}>
                      {schedule.name} - {new Date(schedule.checkDate).toLocaleDateString('vi-VN')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Chiều cao (cm) <span className="required">*</span></label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.1"
                    className="form-control"
                    placeholder="Nhập chiều cao"
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
                    min="0"
                    step="0.1"
                    className="form-control"
                    placeholder="Nhập cân nặng"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Thị lực mắt trái</label>
                  <input
                    type="text"
                    name="leftVision"
                    value={formData.leftVision}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Nhập thị lực mắt trái"
                  />
                </div>
                <div className="form-group">
                  <label>Thị lực mắt phải</label>
                  <input
                    type="text"
                    name="rightVision"
                    value={formData.rightVision}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Nhập thị lực mắt phải"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Kết quả</label>
                <textarea
                  name="result"
                  value={formData.result}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Nhập kết quả khám"
                  rows="3"
                ></textarea>
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