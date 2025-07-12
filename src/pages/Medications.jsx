import React, { useState, useEffect } from "react";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaCheck, FaTimes, FaSearch } from "react-icons/fa";
import "../styles/Dashboard.css";
// Không cần import file CSS riêng nữa

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
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5273/api";

  const columns = [
    { title: "ID", dataIndex: "prescriptionId" },
    { title: "Phụ huynh", dataIndex: "parentName" },
    { title: "Học sinh", dataIndex: "studentName" },
    { title: "Tên thuốc", dataIndex: "medicationName" },
    { title: "Liều lượng", dataIndex: "dosage" },
    { title: "Lịch uống", dataIndex: "schedule" },
    { title: "Ngày gửi", dataIndex: "createdDate", render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : "N/A" },
    { 
      title: "Trạng thái", 
      dataIndex: "status", 
      render: (status) => {
        let style = {};
        let text = getStatusText(status);
        
        // Debug trạng thái
        console.log(`Rendering status: ${status}, type: ${typeof status}, text: ${text}`);
        
        if (status === "0" || status === 0) {
          style = { color: "#ffc107", fontWeight: "500" }; // Màu vàng cho Chờ xử lý
        } else if (status === "1" || status === 1) {
          style = { color: "#28a745", fontWeight: "500" }; // Màu xanh lá cho Đã chấp nhận
        } else if (status === "2" || status === 2) {
          style = { color: "#dc3545", fontWeight: "500" }; // Màu đỏ cho Đã từ chối
        }
        
        return <span style={style}>{text}</span>;
      }
    }
  ];

  const iconStyle = {
    view: { color: "#007bff" },
    edit: { color: "#28a745" },
    approve: { color: "#28a745" },
    reject: { color: "#dc3545" }
  };

  const getStatusText = (status) => {
    // Chuyển đổi status sang chuỗi để đảm bảo so sánh chính xác
    const statusStr = String(status);
    
    const statusMap = {
      "0": "Chờ xử lý",
      "1": "Đã chấp nhận",
      "2": "Đã từ chối"
    };
    
    return statusMap[statusStr] || "Không xác định";
  };

  // Hàm xử lý đường dẫn file đơn thuốc
  const getPrescriptionFileUrl = (filePathOrName) => {
    if (!filePathOrName) return null;
    
    // Nếu đã là URL đầy đủ, trả về nguyên dạng
    if (filePathOrName.startsWith('http')) {
      return filePathOrName;
    }
    
    // Xử lý tên file để đảm bảo định dạng đúng
    const fileName = filePathOrName.includes('/') 
      ? filePathOrName.split('/').pop() 
      : filePathOrName;
    
    // Trả về đường dẫn đầy đủ
    return `${API_BASE_URL}/files/prescriptions/${fileName}`;
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
      
      const prescriptionsResponse = await API_SERVICE.parentPrescriptionAPI.getAll(params);
      console.log("API response:", prescriptionsResponse); // Debug API response
      
      // Xử lý dữ liệu để hiển thị
      const processedMedications = await Promise.all(
        prescriptionsResponse.map(async (prescription) => {
          // Kiểm tra xem có trạng thái đã lưu trong localStorage không
          const statusKey = `prescription_${prescription.prescriptionId}_status`;
          const noteKey = `prescription_${prescription.prescriptionId}_note`;
          const savedStatus = localStorage.getItem(statusKey);
          const savedNote = localStorage.getItem(noteKey);
          
          // Đảm bảo status luôn là chuỗi
          // Ưu tiên trạng thái đã lưu trong localStorage
          const status = savedStatus || (prescription.status !== undefined ? String(prescription.status) : "0");
          console.log(`Processing prescription ${prescription.prescriptionId}, status: ${status}`);
          
          // Lấy thông tin thuốc từ đơn thuốc
          let medicationName = prescription.parentNote || "Không có tên thuốc";
          let studentName = "Không xác định";
          let dosage = "Không có";
          let quantity = null;
          let remainingQuantity = null;
          let medicationId = null;
          
          try {
            // Lấy danh sách thuốc theo đơn thuốc
            const medicationsResponse = await API_SERVICE.medicationAPI.getByPrescription(prescription.prescriptionId);
            
            // Nếu có thuốc, lấy tên thuốc đầu tiên
            if (medicationsResponse && medicationsResponse.length > 0) {
              const medication = medicationsResponse[0];
              medicationName = medication.medicationName || prescription.parentNote || "Không có tên thuốc";
              dosage = medication.dosage || "Không có";
              quantity = medication.quantity;
              remainingQuantity = medication.remainingQuantity;
              medicationId = medication.medicationId;
              
              // Lấy thông tin học sinh từ thuốc
              if (medication.studentId) {
                try {
                  const studentResponse = await fetch(`${API_BASE_URL}/student/${medication.studentId}`);
                  if (studentResponse.ok) {
                    const studentData = await studentResponse.json();
                    studentName = studentData.fullName || "Không xác định";
                  }
                } catch (studentError) {
                  console.error("Error fetching student:", studentError);
                }
              }
            }
          } catch (medError) {
            console.error("Error fetching medications:", medError);
          }
          
          // Lấy thông tin phụ huynh
          let parentName = "Không xác định";
          if (prescription.parentId) {
            try {
              const parentResponse = await fetch(`${API_BASE_URL}/parent/${prescription.parentId}`);
              if (parentResponse.ok) {
                const parentData = await parentResponse.json();
                parentName = parentData.fullName || "Không xác định";
              }
            } catch (parentError) {
              console.error("Error fetching parent:", parentError);
            }
          }
          
          // Trả về dữ liệu đã xử lý với status đã được chuyển đổi thành chuỗi
          return {
            ...prescription,
            medicationName,
            studentName,
            parentName,
            createdDate: prescription.submittedDate,
            dosage,
            quantity,
            remainingQuantity,
            medicationId,
            schedule: prescription.schedule || "Không có",
            status, // Đảm bảo status luôn là chuỗi
            note: savedNote || prescription.note || "" // Sử dụng note đã lưu hoặc từ API
          };
        })
      );
      
      console.log("Processed medications:", processedMedications); // Debug processed data
      
      // Lọc theo trạng thái nếu cần
      let filteredMedications = processedMedications;
      if (statusFilter !== "all") {
        filteredMedications = processedMedications.filter(med => med.status === statusFilter);
      }
      
      setMedications(filteredMedications);
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
      // Lấy dữ liệu từ form
      const status = formData.status;
      const note = formData.note;
      
      console.log("Processing medication with data:", {
        prescriptionId: selectedMedication.prescriptionId,
        nurseId: localStorage.getItem("userId") || "",
        status,
        note
      });
      
      // Chuẩn bị dữ liệu để gửi đi
      const updateData = {
        prescriptionId: selectedMedication.prescriptionId,
        nurseId: localStorage.getItem("userId") || "",
        schedule: selectedMedication.schedule || "",
        parentNote: selectedMedication.parentNote || "",
        prescriptionFile: selectedMedication.prescriptionFile || ""
      };
      
      console.log("Sending update request with data:", updateData);
      
      // Gọi API để cập nhật đơn thuốc
      await API_SERVICE.parentPrescriptionAPI.update(selectedMedication.prescriptionId, updateData);
      
      // Lưu trạng thái vào localStorage để hiển thị
      const statusKey = `prescription_${selectedMedication.prescriptionId}_status`;
      const noteKey = `prescription_${selectedMedication.prescriptionId}_note`;
      localStorage.setItem(statusKey, status);
      localStorage.setItem(noteKey, note);
      
      // Cập nhật UI để hiển thị trạng thái mới
      setMedications(prevMedications => 
        prevMedications.map(med => 
          med.prescriptionId === selectedMedication.prescriptionId 
            ? { ...med, status, note } 
            : med
        )
      );
      
      setNotif({
        message: "Xử lý thuốc thành công",
        type: "success"
      });
      setShowProcessModal(false);
      
      // Tải lại danh sách thuốc để hiển thị trạng thái mới nhất
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

      {/* Modal xem chi tiết thuốc - Sử dụng class từ Dashboard.css */}
      {showViewModal && selectedMedication && (
        <div className="student-dialog-overlay">
          <div className="student-dialog-content">
            <div className="student-dialog-header">
              <h2>Chi tiết thuốc</h2>
              <button className="student-dialog-close" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="student-dialog-body">
              <div className="student-info-section">
                <h3 style={{ 
                  borderBottom: '2px solid #007bff',
                  paddingBottom: '8px',
                  margin: '0 0 16px 0',
                  color: '#333',
                  fontSize: '1.1rem'
                }}>Thông tin chung</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>ID:</strong> {selectedMedication.prescriptionId}
                  </div>
                  <div className="info-item">
                    <strong>Phụ huynh:</strong> {selectedMedication.parentName || "Không có"}
                  </div>
                  <div className="info-item">
                    <strong>Học sinh:</strong> {selectedMedication.studentName || "Không có"}
                  </div>
                  <div className="info-item">
                    <strong>Ngày gửi:</strong> {selectedMedication.submittedDate ? new Date(selectedMedication.submittedDate).toLocaleDateString('vi-VN') : "Không có"}
                  </div>
                  <div className="info-item">
                    <strong>Trạng thái:</strong> {getStatusText(selectedMedication.status)}
                  </div>
                </div>
              </div>
              
              <div className="student-info-section">
                <h3 style={{ 
                  borderBottom: '2px solid #007bff',
                  paddingBottom: '8px',
                  margin: '16px 0',
                  color: '#333',
                  fontSize: '1.1rem'
                }}>Thông tin thuốc</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Tên thuốc:</strong> {selectedMedication.medicationName || "Không có"}
                  </div>
                  <div className="info-item">
                    <strong>Liều lượng:</strong> {selectedMedication.dosage || "Không có"}
                  </div>
                  <div className="info-item">
                    <strong>Lịch uống:</strong> {selectedMedication.schedule || "Không có"}
                  </div>
                  <div className="info-item">
                    <strong>Số lượng:</strong> {selectedMedication.quantity || "Không có"}
                  </div>
                  <div className="info-item">
                    <strong>Số lượng còn lại:</strong> {selectedMedication.remainingQuantity || "Không có"}
                  </div>
                  <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                    <strong>Ghi chú phụ huynh:</strong> {selectedMedication.parentNote || "Không có"}
                  </div>
                  {selectedMedication.prescriptionFile && (
                    <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                      <strong>Tệp đơn thuốc:</strong>
                      <div>
                        {console.log("Prescription file path:", selectedMedication.prescriptionFile)}
                        <a 
                          href={getPrescriptionFileUrl(selectedMedication.prescriptionFile)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#007bff', textDecoration: 'underline' }}
                        >
                          Xem đơn thuốc
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                    <strong>Ghi chú y tá:</strong> {selectedMedication.note || "Không có"}
                  </div>
                </div>
              </div>
            </div>
            <div className="student-dialog-footer">
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
                className="admin-btn" 
                style={{ backgroundColor: '#6c757d' }}
                onClick={() => setShowViewModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xử lý thuốc - Sử dụng class từ Dashboard.css */}
      {showProcessModal && selectedMedication && (
        <div className="student-dialog-overlay">
          <div className="student-dialog-content">
            <div className="student-dialog-header">
              <h2>Xử lý thuốc</h2>
              <button className="student-dialog-close" onClick={() => setShowProcessModal(false)}>×</button>
            </div>
            <form onSubmit={handleProcessMedication}>
              <div className="student-dialog-body">
                <div className="student-info-section">
                  <h3 style={{ 
                    borderBottom: '2px solid #007bff',
                    paddingBottom: '8px',
                    margin: '0 0 16px 0',
                    color: '#333',
                    fontSize: '1.1rem'
                  }}>Thông tin chung</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>ID:</strong> {selectedMedication.prescriptionId}
                    </div>
                    <div className="info-item">
                      <strong>Phụ huynh:</strong> {selectedMedication.parentName || "Không có"}
                    </div>
                    <div className="info-item">
                      <strong>Học sinh:</strong> {selectedMedication.studentName || "Không có"}
                    </div>
                    <div className="info-item">
                      <strong>Ngày gửi:</strong> {selectedMedication.submittedDate ? new Date(selectedMedication.submittedDate).toLocaleDateString('vi-VN') : "Không có"}
                    </div>
                  </div>
                </div>
                
                <div className="student-info-section">
                  <h3 style={{ 
                    borderBottom: '2px solid #007bff',
                    paddingBottom: '8px',
                    margin: '16px 0',
                    color: '#333',
                    fontSize: '1.1rem'
                  }}>Thông tin thuốc</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Tên thuốc:</strong> {selectedMedication.medicationName || "Không có"}
                    </div>
                    <div className="info-item">
                      <strong>Liều lượng:</strong> {selectedMedication.dosage || "Không có"}
                    </div>
                    <div className="info-item">
                      <strong>Lịch uống:</strong> {selectedMedication.schedule || "Không có"}
                    </div>
                    <div className="info-item">
                      <strong>Số lượng:</strong> {selectedMedication.quantity || "Không có"}
                    </div>
                    <div className="info-item">
                      <strong>Số lượng còn lại:</strong> {selectedMedication.remainingQuantity || "Không có"}
                    </div>
                    <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                      <strong>Ghi chú phụ huynh:</strong> {selectedMedication.parentNote || "Không có"}
                    </div>
                    {selectedMedication.prescriptionFile && (
                      <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                        <strong>Tệp đơn thuốc:</strong>
                        <div>
                          <a 
                            href={getPrescriptionFileUrl(selectedMedication.prescriptionFile)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#007bff', textDecoration: 'underline' }}
                          >
                            Xem đơn thuốc
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="student-info-section">
                  <h3 style={{ 
                    borderBottom: '2px solid #007bff',
                    paddingBottom: '8px',
                    margin: '16px 0',
                    color: '#333',
                    fontSize: '1.1rem'
                  }}>Xử lý đơn thuốc</h3>
                  <div className="info-grid">
                    <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                      <label htmlFor="status">Trạng thái <span className="text-danger">*</span></label>
                      <select
                        name="status"
                        id="status"
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
                    <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                      <label htmlFor="note">Ghi chú y tá</label>
                      <textarea
                        name="note"
                        id="note"
                        value={formData.note}
                        onChange={handleInputChange}
                        className="form-control"
                        rows="3"
                        placeholder="Nhập ghi chú (nếu có)"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              <div className="student-dialog-footer">
                <button type="submit" className="admin-btn" disabled={loading}>
                  {loading ? "Đang xử lý..." : "Xác nhận"}
                </button>
                <button
                  type="button"
                  className="admin-btn"
                  style={{ backgroundColor: '#6c757d' }}
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