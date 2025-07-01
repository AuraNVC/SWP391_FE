import React, { useState, useEffect } from "react";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaPlus } from "react-icons/fa";
import "../styles/Dashboard.css";

const VaxResults = () => {
  const [results, setResults] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [formData, setFormData] = useState({
    vaccinationScheduleId: "",
    healthProfileId: "",
    nurseId: localStorage.getItem("userId") || "",
    doseNumber: "1",
    status: "1", // Default status: Completed
    note: ""
  });

  const { setNotif } = useNotification();

  const columns = [
    { title: "ID", dataIndex: "vaccinationResultId" },
    { title: "Học sinh", dataIndex: "studentName" },
    { title: "Vaccine", dataIndex: "vaccineName" },
    { title: "Mũi số", dataIndex: "doseNumber" },
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
    fetchVaccinationResults();
    fetchVaccinationSchedules();
  }, []);

  const fetchVaccinationResults = async () => {
    setLoading(true);
    try {
      // Assume there's an API endpoint for vaccination results
      const response = await API_SERVICE.vaccinationResultAPI.getAll();
      setResults(response);
    } catch (error) {
      console.error("Error fetching vaccination results:", error);
      setNotif({
        message: "Không thể tải danh sách kết quả tiêm chủng",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVaccinationSchedules = async () => {
    try {
      // Assume there's an API endpoint for vaccination schedules
      const response = await API_SERVICE.vaccinationScheduleAPI.getAll({});
      setSchedules(response);
    } catch (error) {
      console.error("Error fetching vaccination schedules:", error);
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
      await API_SERVICE.vaccinationResultAPI.create(formData);
      setNotif({
        message: "Thêm kết quả tiêm chủng thành công",
        type: "success"
      });
      setShowAddModal(false);
      setFormData({
        vaccinationScheduleId: "",
        healthProfileId: "",
        nurseId: localStorage.getItem("userId") || "",
        doseNumber: "1",
        status: "1",
        note: ""
      });
      fetchVaccinationResults();
    } catch (error) {
      console.error("Error adding vaccination result:", error);
      setNotif({
        message: "Không thể thêm kết quả tiêm chủng",
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
      await API_SERVICE.vaccinationResultAPI.update(selectedResult.vaccinationResultId, formData);
      setNotif({
        message: "Cập nhật kết quả tiêm chủng thành công",
        type: "success"
      });
      setShowEditModal(false);
      fetchVaccinationResults();
    } catch (error) {
      console.error("Error updating vaccination result:", error);
      setNotif({
        message: "Không thể cập nhật kết quả tiêm chủng",
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
      vaccinationScheduleId: result.vaccinationScheduleId || "",
      healthProfileId: result.healthProfileId || "",
      nurseId: result.nurseId || localStorage.getItem("userId") || "",
      doseNumber: result.doseNumber?.toString() || "1",
      status: result.status?.toString() || "1",
      note: result.note || ""
    });
    setShowEditModal(true);
  };

  const handleScheduleChange = (e) => {
    const scheduleId = e.target.value;
    const selectedSchedule = schedules.find(s => s.vaccinationScheduleId.toString() === scheduleId);
    
    if (selectedSchedule) {
      setFormData({
        ...formData,
        vaccinationScheduleId: scheduleId,
        healthProfileId: selectedSchedule.healthProfileId || ""
      });
    } else {
      setFormData({
        ...formData,
        vaccinationScheduleId: scheduleId
      });
    }
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h2>Quản lý kết quả tiêm chủng</h2>
        <div>
          <button className="admin-btn" onClick={() => setShowAddModal(true)}>
            <FaPlus /> Thêm kết quả tiêm
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

      {/* Modal thêm kết quả tiêm */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Thêm kết quả tiêm chủng</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddResult}>
              <div className="form-group">
                <label>Lịch tiêm <span className="required">*</span></label>
                <select
                  name="vaccinationScheduleId"
                  value={formData.vaccinationScheduleId}
                  onChange={handleScheduleChange}
                  required
                  className="form-control"
                >
                  <option value="">-- Chọn lịch tiêm --</option>
                  {schedules.map(schedule => (
                    <option key={schedule.vaccinationScheduleId} value={schedule.vaccinationScheduleId}>
                      {schedule.vaccineName || `Vaccine #${schedule.vaccinationScheduleId}`} - {new Date(schedule.vaccinationDate).toLocaleDateString('vi-VN')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Mũi số <span className="required">*</span></label>
                <input
                  type="number"
                  name="doseNumber"
                  value={formData.doseNumber}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  min="1"
                  step="1"
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
                  rows={3}
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

      {/* Modal xem chi tiết kết quả tiêm */}
      {showViewModal && selectedResult && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Chi tiết kết quả tiêm chủng</h3>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>ID:</label>
                  <span>{selectedResult.vaccinationResultId}</span>
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
                  <label>Vaccine:</label>
                  <span>{selectedResult.vaccineName}</span>
                </div>
                <div className="info-item">
                  <label>Ngày tiêm:</label>
                  <span>{selectedResult.vaccinationDate && new Date(selectedResult.vaccinationDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="info-item">
                  <label>Mũi số:</label>
                  <span>{selectedResult.doseNumber}</span>
                </div>
                <div className="info-item">
                  <label>Trạng thái:</label>
                  <span>{getStatusText(selectedResult.status)}</span>
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

      {/* Modal chỉnh sửa kết quả tiêm */}
      {showEditModal && selectedResult && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Chỉnh sửa kết quả tiêm chủng</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateResult}>
              <div className="form-group">
                <label>Mũi số <span className="required">*</span></label>
                <input
                  type="number"
                  name="doseNumber"
                  value={formData.doseNumber}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  min="1"
                  step="1"
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
                  rows={3}
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

export default VaxResults; 