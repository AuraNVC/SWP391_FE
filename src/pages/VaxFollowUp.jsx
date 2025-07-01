import React, { useState, useEffect } from "react";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaCheck } from "react-icons/fa";
import "../styles/Dashboard.css";

const VaxFollowUp = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [formData, setFormData] = useState({
    reaction: "",
    followUpNote: "",
    status: "1" // Default status: Completed
  });

  const { setNotif } = useNotification();

  const columns = [
    { title: "ID", dataIndex: "vaccinationResultId" },
    { title: "Học sinh", dataIndex: "studentName" },
    { title: "Vaccine", dataIndex: "vaccineName" },
    { title: "Ngày tiêm", dataIndex: "vaccinationDate", render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : "N/A" },
    { title: "Trạng thái theo dõi", dataIndex: "followUpStatus", render: (status) => getFollowUpStatusText(status) }
  ];

  const iconStyle = {
    view: { color: "#007bff" },
    edit: { color: "#28a745" },
    check: { color: "#28a745" }
  };

  const getFollowUpStatusText = (status) => {
    const statusMap = {
      "0": "Chưa theo dõi",
      "1": "Đang theo dõi",
      "2": "Đã hoàn thành theo dõi",
      "3": "Cần chú ý"
    };
    return statusMap[status] || "Không xác định";
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
  }, []);

  const fetchVaccinationResults = async () => {
    setLoading(true);
    try {
      // Sử dụng API có sẵn để lấy kết quả tiêm chủng
      const response = await API_SERVICE.vaccinationResultAPI.getAll();
      
      // Lọc các kết quả tiêm đã hoàn thành để theo dõi
      const completedResults = response.filter(result => result.status === "1");
      setResults(completedResults);
    } catch (error) {
      console.error("Error fetching vaccination results:", error);
      setNotif({
        message: "Không thể tải danh sách theo dõi sau tiêm",
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

  const handleUpdateFollowUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Cập nhật thông tin theo dõi sau tiêm bằng cách sử dụng API cập nhật kết quả tiêm
      const updatedResult = {
        ...selectedResult,
        followUpNote: formData.followUpNote,
        reaction: formData.reaction,
        followUpStatus: formData.status
      };
      
      await API_SERVICE.vaccinationResultAPI.update(selectedResult.vaccinationResultId, updatedResult);
      
      setNotif({
        message: "Cập nhật theo dõi sau tiêm thành công",
        type: "success"
      });
      
      setShowFollowUpModal(false);
      fetchVaccinationResults();
    } catch (error) {
      console.error("Error updating follow-up:", error);
      setNotif({
        message: "Không thể cập nhật thông tin theo dõi sau tiêm",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteFollowUp = async (result) => {
    setLoading(true);
    try {
      const updatedResult = {
        ...result,
        followUpStatus: "2" // Đã hoàn thành theo dõi
      };
      
      await API_SERVICE.vaccinationResultAPI.update(result.vaccinationResultId, updatedResult);
      
      setNotif({
        message: "Hoàn thành theo dõi sau tiêm",
        type: "success"
      });
      
      fetchVaccinationResults();
    } catch (error) {
      console.error("Error completing follow-up:", error);
      setNotif({
        message: "Không thể hoàn thành theo dõi sau tiêm",
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

  const handleFollowUp = (result) => {
    setSelectedResult(result);
    setFormData({
      reaction: result.reaction || "",
      followUpNote: result.followUpNote || "",
      status: result.followUpStatus || "1"
    });
    setShowFollowUpModal(true);
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h2>Theo dõi sau tiêm</h2>
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
                  title="Cập nhật theo dõi"
                  onClick={() => handleFollowUp(row)}
                >
                  <FaEdit style={iconStyle.edit} size={18} />
                </button>
                {row.followUpStatus !== "2" && (
                  <button
                    className="admin-action-btn admin-action-check admin-action-btn-reset"
                    title="Hoàn thành theo dõi"
                    onClick={() => handleCompleteFollowUp(row)}
                  >
                    <FaCheck style={iconStyle.check} size={18} />
                  </button>
                )}
              </div>
            )}
          />
        )}
      </div>

      {/* Modal xem chi tiết kết quả tiêm */}
      {showViewModal && selectedResult && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Chi tiết kết quả tiêm</h3>
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
                  <label>Vaccine:</label>
                  <span>{selectedResult.vaccineName}</span>
                </div>
                <div className="info-item">
                  <label>Mũi số:</label>
                  <span>{selectedResult.doseNumber}</span>
                </div>
                <div className="info-item">
                  <label>Ngày tiêm:</label>
                  <span>{selectedResult.vaccinationDate && new Date(selectedResult.vaccinationDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="info-item">
                  <label>Trạng thái tiêm:</label>
                  <span>{getStatusText(selectedResult.status)}</span>
                </div>
                <div className="info-item">
                  <label>Trạng thái theo dõi:</label>
                  <span>{getFollowUpStatusText(selectedResult.followUpStatus)}</span>
                </div>
                <div className="info-item full-width">
                  <label>Phản ứng sau tiêm:</label>
                  <span>{selectedResult.reaction || "Không có"}</span>
                </div>
                <div className="info-item full-width">
                  <label>Ghi chú theo dõi:</label>
                  <span>{selectedResult.followUpNote || "Không có"}</span>
                </div>
                <div className="info-item full-width">
                  <label>Ghi chú:</label>
                  <span>{selectedResult.note || "Không có"}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="admin-btn" onClick={() => setShowViewModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal cập nhật theo dõi sau tiêm */}
      {showFollowUpModal && selectedResult && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Cập nhật theo dõi sau tiêm</h3>
              <button className="close-btn" onClick={() => setShowFollowUpModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateFollowUp}>
              <div className="form-group">
                <label>Học sinh:</label>
                <input
                  type="text"
                  value={selectedResult.studentName}
                  disabled
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Vaccine:</label>
                <input
                  type="text"
                  value={selectedResult.vaccineName}
                  disabled
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Phản ứng sau tiêm</label>
                <textarea
                  name="reaction"
                  value={formData.reaction}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                  placeholder="Nhập các phản ứng sau tiêm (nếu có)"
                />
              </div>
              <div className="form-group">
                <label>Trạng thái theo dõi <span className="required">*</span></label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                >
                  <option value="0">Chưa theo dõi</option>
                  <option value="1">Đang theo dõi</option>
                  <option value="2">Đã hoàn thành theo dõi</option>
                  <option value="3">Cần chú ý</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ghi chú theo dõi</label>
                <textarea
                  name="followUpNote"
                  value={formData.followUpNote}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                  placeholder="Nhập ghi chú theo dõi"
                />
              </div>
              <div className="modal-footer">
                <button type="submit" className="admin-btn">Lưu</button>
                <button type="button" className="admin-btn btn-secondary" onClick={() => setShowFollowUpModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaxFollowUp;