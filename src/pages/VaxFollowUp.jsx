import React, { useState, useEffect } from "react";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaCheck, FaSearch } from "react-icons/fa";
import "../styles/Dashboard.css";

const VaxFollowUp = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
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
    { title: "Ngày tiêm", dataIndex: "injectionDate", render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : "N/A" },
    { title: "Phản ứng", dataIndex: "reaction", render: (reaction) => reaction ? (reaction.length > 30 ? `${reaction.substring(0, 30)}...` : reaction) : "Không có" },
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

  const fetchVaccinationResults = async (keyword = "") => {
    setLoading(true);
    try {
      // Sử dụng API có sẵn để lấy kết quả tiêm chủng
      const response = await API_SERVICE.vaccinationResultAPI.getAll({
        keyword: keyword,
        nurseId: localStorage.getItem("userId") || "",
        status: "1" // Chỉ lấy các kết quả tiêm đã hoàn thành
      });
      
      setResults(response);
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

  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      await fetchVaccinationResults(searchKeyword);
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
      fetchVaccinationResults(searchKeyword);
    } catch (error) {
      console.error("Error updating follow-up:", error);
      setNotif({
        message: "Không thể cập nhật thông tin theo dõi sau tiêm: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteFollowUp = async (result) => {
    if (window.confirm("Bạn có chắc chắn muốn hoàn thành theo dõi sau tiêm này không?")) {
      setLoading(true);
      try {
        const updatedResult = {
          ...result,
          followUpStatus: "2" // Đã hoàn thành theo dõi
        };
        
        await API_SERVICE.vaccinationResultAPI.update(result.vaccinationResultId, updatedResult);
        
        setNotif({
          message: "Hoàn thành theo dõi sau tiêm thành công",
          type: "success"
        });
        
        fetchVaccinationResults(searchKeyword);
      } catch (error) {
        console.error("Error completing follow-up:", error);
        setNotif({
          message: "Không thể hoàn thành theo dõi sau tiêm: " + (error.message || "Lỗi không xác định"),
          type: "error"
        });
      } finally {
        setLoading(false);
      }
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
        <div className="admin-header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm theo dõi sau tiêm..."
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
        {!loading && results.length === 0 && (
          <div className="no-data-message">
            Không có kết quả theo dõi sau tiêm nào
          </div>
        )}
      </div>

      {/* Modal xem chi tiết kết quả tiêm */}
      {showViewModal && selectedResult && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Chi tiết theo dõi sau tiêm</h3>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <strong>ID:</strong> {selectedResult.vaccinationResultId}
                </div>
                <div className="info-item">
                  <strong>Học sinh:</strong> {selectedResult.studentName || "Không có"}
                </div>
                <div className="info-item">
                  <strong>Vaccine:</strong> {selectedResult.vaccineName || "Không có"}
                </div>
                <div className="info-item">
                  <strong>Mũi số:</strong> {selectedResult.doseNumber || "Không có"}
                </div>
                <div className="info-item">
                  <strong>Ngày tiêm:</strong> {selectedResult.injectionDate ? new Date(selectedResult.injectionDate).toLocaleDateString('vi-VN') : "Không có"}
                </div>
                <div className="info-item">
                  <strong>Trạng thái tiêm:</strong> {getStatusText(selectedResult.status)}
                </div>
                <div className="info-item">
                  <strong>Trạng thái theo dõi:</strong> {getFollowUpStatusText(selectedResult.followUpStatus)}
                </div>
                <div className="info-item full-width">
                  <strong>Phản ứng sau tiêm:</strong> {selectedResult.reaction || "Không có"}
                </div>
                <div className="info-item full-width">
                  <strong>Ghi chú theo dõi:</strong> {selectedResult.followUpNote || "Không có"}
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
                handleFollowUp(selectedResult);
              }}>
                Cập nhật theo dõi
              </button>
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
                  value={selectedResult.studentName || ""}
                  disabled
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Vaccine:</label>
                <input
                  type="text"
                  value={selectedResult.vaccineName || ""}
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
                ></textarea>
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
                ></textarea>
              </div>
              <div className="form-actions">
                <button type="submit" className="admin-btn" disabled={loading}>
                  {loading ? "Đang cập nhật..." : "Cập nhật"}
                </button>
                <button 
                  type="button" 
                  className="admin-btn cancel-btn" 
                  onClick={() => setShowFollowUpModal(false)}
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

export default VaxFollowUp;