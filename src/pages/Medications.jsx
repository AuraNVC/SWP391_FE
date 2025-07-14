import React, { useState, useEffect } from "react";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaSearch, FaEdit, FaFilter, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import "../styles/Dashboard.css";

const Medications = () => {
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showUpdateQuantityModal, setShowUpdateQuantityModal] = useState(false);
  const [updatedQuantity, setUpdatedQuantity] = useState("");
  const [updatingQuantity, setUpdatingQuantity] = useState(false);
  // Thêm các state cho tính năng tìm kiếm nâng cao
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters] = useState({
    studentName: "",
    parentName: "",
    medicationName: "",
    dateFrom: "",
    dateTo: "",
    remainingQuantity: "all" // all, low, medium, high
  });
  const [sortConfig, setSortConfig] = useState({
    key: "createdDate",
    direction: "desc"
  });

  const { setNotif } = useNotification();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5273/api";

  const columns = [
    { 
      title: "ID", 
      dataIndex: "prescriptionId",
      render: (id) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("prescriptionId")}>
          {id}
          {sortConfig.key === "prescriptionId" && (
            <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </span>
      )
    },
    { 
      title: "Phụ huynh", 
      dataIndex: "parentName",
      render: (name) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("parentName")}>
          {name}
          {sortConfig.key === "parentName" && (
            <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </span>
      )
    },
    { 
      title: "Học sinh", 
      dataIndex: "studentName",
      render: (name) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("studentName")}>
          {name}
          {sortConfig.key === "studentName" && (
            <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </span>
      )
    },
    { 
      title: "Tên thuốc", 
      dataIndex: "medicationName",
      render: (name) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("medicationName")}>
          {name}
          {sortConfig.key === "medicationName" && (
            <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </span>
      )
    },
    { title: "Liều lượng", dataIndex: "dosage" },
    { title: "Lịch uống", dataIndex: "schedule" },
    { 
      title: "Ngày gửi", 
      dataIndex: "createdDate", 
      render: (date) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("createdDate")}>
          {date ? new Date(date).toLocaleDateString('vi-VN') : "N/A"}
          {sortConfig.key === "createdDate" && (
            <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </span>
      )
    },
    { 
      title: "Số lượng còn lại", 
      dataIndex: "remainingQuantity", 
      render: (remaining, record) => {
        const total = record.quantity || 0;
        const remainingQty = remaining || 0;
        
        // Nếu không có thông tin số lượng
        if (!total) return "Không có thông tin";
        
        // Tính phần trăm còn lại
        const percentage = Math.round((remainingQty / total) * 100);
        
        // Xác định màu sắc dựa trên phần trăm còn lại
        let color = "#28a745"; // Xanh lá - trên 50%
        if (percentage <= 20) {
          color = "#dc3545"; // Đỏ - dưới 20%
        } else if (percentage <= 50) {
          color = "#ffc107"; // Vàng - dưới 50%
        }
        
        return (
          <div onClick={() => handleSort("remainingQuantity")} style={{ cursor: 'pointer' }}>
            <div>
              {remainingQty}/{total}
              {sortConfig.key === "remainingQuantity" && (
                <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
                  {sortConfig.direction === 'asc' ? '▲' : '▼'}
                </span>
              )}
            </div>
            <div style={{ 
              width: '100%', 
              backgroundColor: '#e9ecef', 
              borderRadius: '4px',
              height: '6px',
              marginTop: '4px'
            }}>
              <div style={{ 
                width: `${percentage}%`, 
                backgroundColor: color, 
                height: '6px',
                borderRadius: '4px'
              }}></div>
            </div>
          </div>
        );
      }
    }
  ];

  const iconStyle = {
    view: { color: "#007bff" },
    edit: { color: "#28a745" }
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

  // Thêm useEffect để lọc dữ liệu khi medications hoặc filters thay đổi
  useEffect(() => {
    applyFiltersAndSort();
  }, [medications, filters, sortConfig]);

  // Hàm áp dụng bộ lọc và sắp xếp
  const applyFiltersAndSort = () => {
    let result = [...medications];
    
    // Áp dụng các bộ lọc
    if (filters.studentName) {
      result = result.filter(med => 
        med.studentName?.toLowerCase().includes(filters.studentName.toLowerCase())
      );
    }
    
    if (filters.parentName) {
      result = result.filter(med => 
        med.parentName?.toLowerCase().includes(filters.parentName.toLowerCase())
      );
    }
    
    if (filters.medicationName) {
      result = result.filter(med => 
        med.medicationName?.toLowerCase().includes(filters.medicationName.toLowerCase())
      );
    }
    
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter(med => {
        const createdDate = new Date(med.createdDate);
        return createdDate >= fromDate;
      });
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Đặt thời gian là cuối ngày
      result = result.filter(med => {
        const createdDate = new Date(med.createdDate);
        return createdDate <= toDate;
      });
    }
    
    if (filters.remainingQuantity !== "all") {
      result = result.filter(med => {
        if (!med.quantity) return false;
        const percentage = Math.round((med.remainingQuantity / med.quantity) * 100);
        
        switch (filters.remainingQuantity) {
          case "low": // Dưới 20%
            return percentage < 20;
          case "medium": // 20% đến 50%
            return percentage >= 20 && percentage <= 50;
          case "high": // Trên 50%
            return percentage > 50;
          default:
            return true;
        }
      });
    }
    
    // Áp dụng sắp xếp
    if (sortConfig.key) {
      result.sort((a, b) => {
        // Xử lý giá trị null hoặc undefined
        if (a[sortConfig.key] === null || a[sortConfig.key] === undefined) return 1;
        if (b[sortConfig.key] === null || b[sortConfig.key] === undefined) return -1;
        
        // Xử lý các trường đặc biệt
        if (sortConfig.key === "createdDate") {
          return sortConfig.direction === "asc" 
            ? new Date(a.createdDate) - new Date(b.createdDate)
            : new Date(b.createdDate) - new Date(a.createdDate);
        }
        
        // Xử lý trường số lượng còn lại theo tỷ lệ phần trăm
        if (sortConfig.key === "remainingQuantity") {
          const percentA = a.quantity ? (a.remainingQuantity / a.quantity) * 100 : 0;
          const percentB = b.quantity ? (b.remainingQuantity / b.quantity) * 100 : 0;
          return sortConfig.direction === "asc" ? percentA - percentB : percentB - percentA;
        }
        
        // Sắp xếp chuỗi thông thường
        if (typeof a[sortConfig.key] === "string") {
          return sortConfig.direction === "asc"
            ? a[sortConfig.key].localeCompare(b[sortConfig.key])
            : b[sortConfig.key].localeCompare(a[sortConfig.key]);
        }
        
        // Sắp xếp số thông thường
        return sortConfig.direction === "asc"
          ? a[sortConfig.key] - b[sortConfig.key]
          : b[sortConfig.key] - a[sortConfig.key];
      });
    }
    
    setFilteredMedications(result);
  };
  
  // Hàm xử lý thay đổi bộ lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Hàm xử lý sắp xếp khi click vào tiêu đề cột
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };
  
  // Hàm reset bộ lọc
  const resetFilters = () => {
    setFilters({
      studentName: "",
      parentName: "",
      medicationName: "",
      dateFrom: "",
      dateTo: "",
      remainingQuantity: "all"
    });
  };

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
          let studentId = null;
          
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
              studentId = medication.studentId;
              
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
            studentId,
            schedule: prescription.schedule || "Không có"
          };
        })
      );
      
      console.log("Processed medications:", processedMedications);
      setMedications(processedMedications);
      // Không cần gọi setFilteredMedications ở đây vì useEffect sẽ tự động gọi applyFiltersAndSort
    } catch (error) {
      console.error("Error fetching medications:", error);
      setNotif({
        message: "Không thể tải danh sách thuốc từ phụ huynh",
        type: "error"
      });
      setMedications([]);
      setFilteredMedications([]);
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

  const handleUpdateQuantity = () => {
    if (selectedMedication) {
      setUpdatedQuantity(selectedMedication.remainingQuantity || "");
      setShowUpdateQuantityModal(true);
    }
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Chỉ cho phép nhập số
    if (/^\d*$/.test(value)) {
      setUpdatedQuantity(value);
    }
  };

  const handleSubmitQuantityUpdate = async (e) => {
    e.preventDefault();
    setUpdatingQuantity(true);

    try {
      // Kiểm tra giá trị nhập vào
      const newQuantity = parseInt(updatedQuantity, 10);
      if (isNaN(newQuantity) || newQuantity < 0) {
        throw new Error("Vui lòng nhập số lượng hợp lệ");
      }

      if (newQuantity > selectedMedication.quantity) {
        throw new Error("Số lượng còn lại không thể lớn hơn tổng số lượng thuốc");
      }

      // Chuẩn bị dữ liệu để cập nhật
      const updateData = {
        medicationId: selectedMedication.medicationId,
        medicationName: selectedMedication.medicationName,
        dosage: selectedMedication.dosage,
        quantity: selectedMedication.quantity,
        remainingQuantity: newQuantity
      };

      // Gọi API cập nhật
      await API_SERVICE.medicationAPI.update(updateData);

      // Cập nhật dữ liệu trong state
      setMedications(prevMedications => 
        prevMedications.map(med => 
          med.medicationId === selectedMedication.medicationId 
            ? { ...med, remainingQuantity: newQuantity } 
            : med
        )
      );

      // Cập nhật thông tin thuốc đang được xem
      setSelectedMedication(prev => ({ ...prev, remainingQuantity: newQuantity }));

      setNotif({
        message: "Cập nhật số lượng thuốc thành công",
        type: "success"
      });

      // Đóng modal cập nhật
      setShowUpdateQuantityModal(false);
    } catch (error) {
      console.error("Error updating medication quantity:", error);
      setNotif({
        message: error.message || "Không thể cập nhật số lượng thuốc",
        type: "error"
      });
    } finally {
      setUpdatingQuantity(false);
    }
  };

  // Tính toán tỷ lệ sử dụng thuốc
  const calculateUsageStats = (medication) => {
    if (!medication || !medication.quantity) return { used: 0, remaining: 0, percentage: 0 };
    
    const total = medication.quantity || 0;
    const remaining = medication.remainingQuantity || 0;
    const used = total - remaining;
    const percentage = Math.round((used / total) * 100);
    
    return { used, remaining, percentage };
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h2>Quản lý thuốc từ phụ huynh</h2>
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
            <button
              className="admin-btn"
              style={{ marginLeft: '8px', backgroundColor: showAdvancedSearch ? '#6c757d' : '#007bff' }}
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              title={showAdvancedSearch ? "Ẩn tìm kiếm nâng cao" : "Hiện tìm kiếm nâng cao"}
            >
              <FaFilter />
            </button>
          </div>
        </div>
      </div>

      {/* Phần tìm kiếm nâng cao */}
      {showAdvancedSearch && (
        <div className="admin-advanced-search" style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h3 style={{ margin: '0', fontSize: '1.1rem', color: '#333' }}>Tìm kiếm nâng cao</h3>
            <button
              className="admin-btn"
              style={{ backgroundColor: '#6c757d', padding: '4px 8px', fontSize: '0.8rem' }}
              onClick={resetFilters}
            >
              Đặt lại bộ lọc
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div>
              <label htmlFor="medicationName" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Tên thuốc</label>
              <input
                type="text"
                id="medicationName"
                name="medicationName"
                value={filters.medicationName}
                onChange={handleFilterChange}
                className="form-control"
                placeholder="Nhập tên thuốc..."
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            
            <div>
              <label htmlFor="studentName" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Học sinh</label>
              <input
                type="text"
                id="studentName"
                name="studentName"
                value={filters.studentName}
                onChange={handleFilterChange}
                className="form-control"
                placeholder="Nhập tên học sinh..."
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            
            <div>
              <label htmlFor="parentName" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Phụ huynh</label>
              <input
                type="text"
                id="parentName"
                name="parentName"
                value={filters.parentName}
                onChange={handleFilterChange}
                className="form-control"
                placeholder="Nhập tên phụ huynh..."
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            
            <div>
              <label htmlFor="dateFrom" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Từ ngày</label>
              <input
                type="date"
                id="dateFrom"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="form-control"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            
            <div>
              <label htmlFor="dateTo" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Đến ngày</label>
              <input
                type="date"
                id="dateTo"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="form-control"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            
            <div>
              <label htmlFor="remainingQuantity" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Số lượng còn lại</label>
              <select
                id="remainingQuantity"
                name="remainingQuantity"
                value={filters.remainingQuantity}
                onChange={handleFilterChange}
                className="form-control"
                style={{ width: '100%', padding: '8px' }}
              >
                <option value="all">Tất cả</option>
                <option value="low">Thấp (dưới 20%)</option>
                <option value="medium">Trung bình (20% - 50%)</option>
                <option value="high">Cao (trên 50%)</option>
              </select>
            </div>
          </div>
          
          <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center' }}>
            <div style={{ marginRight: '15px' }}>
              <span style={{ fontSize: '0.9rem', marginRight: '8px' }}>Sắp xếp theo:</span>
              <select
                value={sortConfig.key}
                onChange={(e) => setSortConfig({...sortConfig, key: e.target.value})}
                className="form-control"
                style={{ display: 'inline-block', width: 'auto', padding: '6px' }}
              >
                <option value="createdDate">Ngày gửi</option>
                <option value="medicationName">Tên thuốc</option>
                <option value="studentName">Tên học sinh</option>
                <option value="parentName">Tên phụ huynh</option>
                <option value="remainingQuantity">Số lượng còn lại</option>
              </select>
            </div>
            
            <div>
              <button
                className="admin-btn"
                style={{ 
                  backgroundColor: sortConfig.direction === 'asc' ? '#28a745' : '#007bff',
                  padding: '6px 10px'
                }}
                onClick={() => setSortConfig({...sortConfig, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'})}
              >
                {sortConfig.direction === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                <span style={{ marginLeft: '5px' }}>
                  {sortConfig.direction === 'asc' ? 'Tăng dần' : 'Giảm dần'}
                </span>
              </button>
            </div>
          </div>
          
          <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#6c757d' }}>
            <span>Đang hiển thị: <strong>{filteredMedications.length}</strong> / {medications.length} kết quả</span>
          </div>
        </div>
      )}

      <div className="admin-table-container">
        {loading ? (
          <div className="loading-spinner">Đang tải...</div>
        ) : (
          <TableWithPaging
            columns={columns}
            data={filteredMedications} // Sử dụng filteredMedications để hiển thị dữ liệu đã lọc và sắp xếp
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
                {row.medicationId && (
                <button
                  className="admin-action-btn admin-action-edit admin-action-btn-reset"
                    title="Cập nhật số lượng"
                    onClick={() => {
                      setSelectedMedication(row);
                      setUpdatedQuantity(row.remainingQuantity || "");
                      setShowUpdateQuantityModal(true);
                    }}
                >
                  <FaEdit style={iconStyle.edit} size={18} />
                </button>
                )}
              </div>
            )}
          />
        )}
        {!loading && filteredMedications.length === 0 && ( // Sử dụng filteredMedications
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

              {selectedMedication.medicationId && selectedMedication.quantity > 0 && (
                <div className="student-info-section">
                  <h3 style={{ 
                    borderBottom: '2px solid #007bff',
                    paddingBottom: '8px',
                    margin: '16px 0',
                    color: '#333',
                    fontSize: '1.1rem'
                  }}>Tình trạng sử dụng thuốc</h3>
                  
                  {(() => {
                    const { used, remaining, percentage } = calculateUsageStats(selectedMedication);
                    
                    // Xác định màu sắc dựa trên phần trăm đã sử dụng
                    let color = "#28a745"; // Xanh lá - dưới 50% đã dùng
                    if (percentage >= 80) {
                      color = "#dc3545"; // Đỏ - trên 80% đã dùng
                    } else if (percentage >= 50) {
                      color = "#ffc107"; // Vàng - trên 50% đã dùng
                    }
                    
                    return (
                      <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Đã sử dụng: <strong>{used}</strong> / {selectedMedication.quantity}</span>
                          <span>Còn lại: <strong>{remaining}</strong> ({100 - percentage}%)</span>
                        </div>
                        
                        <div style={{ 
                          width: '100%', 
                          backgroundColor: '#e9ecef', 
                          borderRadius: '4px',
                          height: '10px'
                        }}>
                          <div style={{ 
                            width: `${percentage}%`, 
                            backgroundColor: color, 
                            height: '10px',
                            borderRadius: '4px',
                            transition: 'width 0.3s ease'
                          }}></div>
                        </div>
                        
                        <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.9rem', color: '#6c757d' }}>
                          {percentage}% đã sử dụng
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
            <div className="student-dialog-footer">
              {selectedMedication.medicationId && (
                <button 
                  className="admin-btn" 
                  style={{ backgroundColor: '#28a745' }}
                  onClick={handleUpdateQuantity}
                >
                  Cập nhật số lượng
              </button>
              )}
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

      {/* Modal cập nhật số lượng thuốc còn lại */}
      {showUpdateQuantityModal && selectedMedication && (
        <div className="student-dialog-overlay">
          <div className="student-dialog-content" style={{ maxWidth: '450px' }}>
            <div className="student-dialog-header">
              <h2>Cập nhật số lượng thuốc</h2>
              <button 
                className="student-dialog-close" 
                onClick={() => setShowUpdateQuantityModal(false)}
                disabled={updatingQuantity}
              >×</button>
            </div>
            <form onSubmit={handleSubmitQuantityUpdate}>
              <div className="student-dialog-body">
                <div className="student-info-section">
                  <p><strong>Thuốc:</strong> {selectedMedication.medicationName}</p>
                  <p><strong>Học sinh:</strong> {selectedMedication.studentName}</p>
                  <p><strong>Tổng số lượng:</strong> {selectedMedication.quantity}</p>
                  
                  <div className="info-item" style={{ marginTop: '16px' }}>
                    <label htmlFor="remainingQuantity">Số lượng còn lại <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      id="remainingQuantity"
                      name="remainingQuantity"
                      className="form-control"
                      value={updatedQuantity}
                      onChange={handleQuantityChange}
                      min="0"
                      max={selectedMedication.quantity}
                      required
                      disabled={updatingQuantity}
                    />
                    <small className="text-muted">Nhập số lượng thuốc còn lại sau khi sử dụng</small>
                </div>
                </div>
              </div>
              <div className="student-dialog-footer">
                <button 
                  type="submit" 
                  className="admin-btn" 
                  style={{ backgroundColor: '#28a745' }}
                  disabled={updatingQuantity}
                >
                  {updatingQuantity ? "Đang cập nhật..." : "Xác nhận"}
                </button>
                <button
                  type="button"
                  className="admin-btn" 
                  style={{ backgroundColor: '#6c757d' }}
                  onClick={() => setShowUpdateQuantityModal(false)}
                  disabled={updatingQuantity}
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