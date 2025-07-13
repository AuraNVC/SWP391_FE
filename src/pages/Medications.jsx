import React, { useState, useEffect } from "react";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaSearch } from "react-icons/fa";
import "../styles/Dashboard.css";

const Medications = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);

  const { setNotif } = useNotification();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5273/api";

  const columns = [
    { title: "ID", dataIndex: "prescriptionId" },
    { title: "Phụ huynh", dataIndex: "parentName" },
    { title: "Học sinh", dataIndex: "studentName" },
    { title: "Tên thuốc", dataIndex: "medicationName" },
    { title: "Liều lượng", dataIndex: "dosage" },
    { title: "Lịch uống", dataIndex: "schedule" },
    { title: "Ngày gửi", dataIndex: "createdDate", render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : "N/A" }
  ];

  const iconStyle = {
    view: { color: "#007bff" }
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
  }, []);

  const fetchMedications = async (keyword = "") => {
    setLoading(true);
    
    try {
      const params = {
        keyword: keyword,
        nurseId: localStorage.getItem("userId") || ""
      };
      
      const prescriptionsResponse = await API_SERVICE.parentPrescriptionAPI.getAll(params);
      console.log("API response:", prescriptionsResponse);
      
      // Xử lý dữ liệu để hiển thị
      const processedMedications = await Promise.all(
        prescriptionsResponse.map(async (prescription) => {
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
          
          // Trả về dữ liệu đã xử lý
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
            schedule: prescription.schedule || "Không có"
          };
        })
      );
      
      console.log("Processed medications:", processedMedications);
      setMedications(processedMedications);
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

  const handleView = (medication) => {
    setSelectedMedication(medication);
    setShowViewModal(true);
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h2>Xem đơn thuốc từ phụ huynh</h2>
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
                </div>
              </div>
            </div>
            <div className="student-dialog-footer">
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
    </div>
  );
};

export default Medications;