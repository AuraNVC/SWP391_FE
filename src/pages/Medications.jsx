import React, { useState, useEffect } from "react";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import "../styles/Dashboard.css";

const Medications = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [formData, setFormData] = useState({
    status: "1", // Default status: Approved
    note: ""
  });

  const { setNotif } = useNotification();

  const columns = [
    { title: "ID", dataIndex: "parentPrescriptionId" },
    { title: "Phụ huynh", dataIndex: "parentName" },
    { title: "Học sinh", dataIndex: "studentName" },
    { title: "Tên thuốc", dataIndex: "medicineName" },
    { title: "Ngày gửi", dataIndex: "createdDate", render: (date) => new Date(date).toLocaleDateString('vi-VN') },
    { title: "Trạng thái", dataIndex: "status", render: (status) => getStatusText(status) }
  ];

  const iconStyle = {
    view: { color: "#007bff" },
    edit: { color: "#28a745" },
    approve: { color: "#28a745" },
    reject: { color: "#dc3545" }
  };

  const getStatusText = (status) => {
    const statusMap = {
      "0": "Chờ xử lý",
      "1": "Đã chấp nhận",
      "2": "Đã từ chối"
    };
    return statusMap[status] || "Không xác định";
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    setLoading(true);
    try {
      // Assume there's an API endpoint for parent prescriptions
      const response = await API_SERVICE.parentPrescriptionAPI.getAll();
      setMedications(response);
    } catch (error) {
      console.error("Error fetching medications:", error);
      setNotif({
        message: "Không thể tải danh sách thuốc từ phụ huynh",
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

  const handleProcessMedication = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API_SERVICE.parentPrescriptionAPI.update(selectedMedication.parentPrescriptionId, {
        ...selectedMedication,
        status: formData.status,
        nurseId: localStorage.getItem("userId") || "",
        note: formData.note
      });
      setNotif({
        message: "Xử lý thuốc thành công",
        type: "success"
      });
      setShowProcessModal(false);
      fetchMedications();
    } catch (error) {
      console.error("Error processing medication:", error);
      setNotif({
        message: "Không thể xử lý thuốc",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (medication) => {
    setSelectedMedication(medication);
    setShowViewModal(true);
  };

  const handleProcess = (medication) => {
    setSelectedMedication(medication);
    setFormData({
      status: medication.status || "0",
      note: medication.note || ""
    });
    setShowProcessModal(true);
  };

  const handleApprove = (medication) => {
    setSelectedMedication(medication);
    setFormData({
      status: "1",
      note: "Đã chấp nhận"
    });
    setShowProcessModal(true);
  };

  const handleReject = (medication) => {
    setSelectedMedication(medication);
    setFormData({
      status: "2",
      note: "Đã từ chối"
    });
    setShowProcessModal(true);
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h2>Xử lý thuốc từ phụ huynh</h2>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="loading-spinner">Đang tải...</div>
        ) : (
          <TableWithPaging
            columns={columns}
            data={medications}
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
                  title="Xử lý"
                  onClick={() => handleProcess(row)}
                >
                  <FaEdit style={iconStyle.edit} size={18} />
                </button>
                {row.status === "0" && (
                  <>
                    <button
                      className="admin-action-btn admin-action-approve admin-action-btn-reset"
                      title="Chấp nhận"
                      onClick={() => handleApprove(row)}
                    >
                      <FaCheck style={iconStyle.approve} size={18} />
                    </button>
                    <button
                      className="admin-action-btn admin-action-reject admin-action-btn-reset"
                      title="Từ chối"
                      onClick={() => handleReject(row)}
                    >
                      <FaTimes style={iconStyle.reject} size={18} />
                    </button>
                  </>
                )}
              </div>
            )}
          />
        )}
      </div>

      {/* Modal xem chi tiết thuốc */}
      {showViewModal && selectedMedication && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Chi tiết thuốc</h3>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>ID:</label>
                  <span>{selectedMedication.parentPrescriptionId}</span>
                </div>
                <div className="info-item">
                  <label>Phụ huynh:</label>
                  <span>{selectedMedication.parentName}</span>
                </div>
                <div className="info-item">
                  <label>Học sinh:</label>
                  <span>{selectedMedication.studentName}</span>
                </div>
                <div className="info-item">
                  <label>Tên thuốc:</label>
                  <span>{selectedMedication.medicineName}</span>
                </div>
                <div className="info-item">
                  <label>Liều lượng:</label>
                  <span>{selectedMedication.dosage}</span>
                </div>
                <div className="info-item">
                  <label>Thời gian dùng:</label>
                  <span>{selectedMedication.frequency}</span>
                </div>
                <div className="info-item">
                  <label>Ngày bắt đầu:</label>
                  <span>{selectedMedication.startDate && new Date(selectedMedication.startDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="info-item">
                  <label>Ngày kết thúc:</label>
                  <span>{selectedMedication.endDate && new Date(selectedMedication.endDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="info-item">
                  <label>Trạng thái:</label>
                  <span>{getStatusText(selectedMedication.status)}</span>
                </div>
                <div className="info-item full-width">
                  <label>Hướng dẫn:</label>
                  <span>{selectedMedication.instructions}</span>
                </div>
                <div className="info-item full-width">
                  <label>Ghi chú:</label>
                  <span>{selectedMedication.note}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="admin-btn"
                onClick={() => {
                  setShowViewModal(false);
                  handleProcess(selectedMedication);
                }}
              >
                Xử lý
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

      {/* Modal xử lý thuốc */}
      {showProcessModal && selectedMedication && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Xử lý thuốc</h3>
              <button className="close-btn" onClick={() => setShowProcessModal(false)}>×</button>
            </div>
            <form onSubmit={handleProcessMedication}>
              <div className="info-grid">
                <div className="info-item">
                  <label>Phụ huynh:</label>
                  <span>{selectedMedication.parentName}</span>
                </div>
                <div className="info-item">
                  <label>Học sinh:</label>
                  <span>{selectedMedication.studentName}</span>
                </div>
                <div className="info-item">
                  <label>Tên thuốc:</label>
                  <span>{selectedMedication.medicineName}</span>
                </div>
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="0">Chờ xử lý</option>
                  <option value="1">Chấp nhận</option>
                  <option value="2">Từ chối</option>
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
                  {loading ? "Đang xử lý..." : "Xác nhận"}
                </button>
                <button
                  type="button"
                  className="admin-btn cancel-btn"
                  onClick={() => setShowProcessModal(false)}
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

export default Medications; 