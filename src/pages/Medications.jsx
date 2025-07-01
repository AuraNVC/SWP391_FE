import React, { useState, useEffect } from "react";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaCheck, FaTimes, FaSearch } from "react-icons/fa";
import "../styles/Dashboard.css";

const Medications = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
    { title: "Ngày gửi", dataIndex: "createdDate", render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : "N/A" },
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
  }, [statusFilter]);

  const fetchMedications = async (keyword = "") => {
    setLoading(true);
    try {
      const params = {
        keyword: keyword,
        nurseId: localStorage.getItem("userId") || ""
      };
      
      // Thêm bộ lọc trạng thái nếu không phải "all"
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      
      const response = await API_SERVICE.parentPrescriptionAPI.getAll(params);
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

  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      await fetchMedications(searchKeyword);
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
      fetchMedications(searchKeyword);
    } catch (error) {
      console.error("Error processing medication:", error);
      setNotif({
        message: "Không thể xử lý thuốc: " + (error.message || "Lỗi không xác định"),
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
        <div className="admin-header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm thuốc..."
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
          <div className="filter-container">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="0">Chờ xử lý</option>
              <option value="1">Đã chấp nhận</option>
              <option value="2">Đã từ chối</option>
            </select>
          </div>
        </div>
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
        {!loading && medications.length === 0 && (
          <div className="no-data-message">
            Không có yêu cầu thuốc nào
          </div>
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
                  <strong>ID:</strong> {selectedMedication.parentPrescriptionId}
                </div>
                <div className="info-item">
                  <strong>Phụ huynh:</strong> {selectedMedication.parentName || "Không có"}
                </div>
                <div className="info-item">
                  <strong>Học sinh:</strong> {selectedMedication.studentName || "Không có"}
                </div>
                <div className="info-item">
                  <strong>Tên thuốc:</strong> {selectedMedication.medicineName || "Không có"}
                </div>
                <div className="info-item">
                  <strong>Liều lượng:</strong> {selectedMedication.dosage || "Không có"}
                </div>
                <div className="info-item">
                  <strong>Thời gian dùng:</strong> {selectedMedication.frequency || "Không có"}
                </div>
                <div className="info-item">
                  <strong>Ngày bắt đầu:</strong> {selectedMedication.startDate ? new Date(selectedMedication.startDate).toLocaleDateString('vi-VN') : "Không có"}
                </div>
                <div className="info-item">
                  <strong>Ngày kết thúc:</strong> {selectedMedication.endDate ? new Date(selectedMedication.endDate).toLocaleDateString('vi-VN') : "Không có"}
                </div>
                <div className="info-item">
                  <strong>Trạng thái:</strong> {getStatusText(selectedMedication.status)}
                </div>
                <div className="info-item full-width">
                  <strong>Hướng dẫn:</strong> {selectedMedication.instructions || "Không có"}
                </div>
                <div className="info-item full-width">
                  <strong>Ghi chú:</strong> {selectedMedication.note || "Không có"}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="admin-btn" onClick={() => setShowViewModal(false)}>
                Đóng
              </button>
              <button
                className="admin-btn"
                onClick={() => {
                  setShowViewModal(false);
                  handleProcess(selectedMedication);
                }}
              >
                Xử lý
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
                  <strong>Phụ huynh:</strong> {selectedMedication.parentName || "Không có"}
                </div>
                <div className="info-item">
                  <strong>Học sinh:</strong> {selectedMedication.studentName || "Không có"}
                </div>
                <div className="info-item">
                  <strong>Tên thuốc:</strong> {selectedMedication.medicineName || "Không có"}
                </div>
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
                  rows="3"
                  placeholder="Nhập ghi chú (nếu có)"
                ></textarea>
              </div>
              <div className="form-actions">
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