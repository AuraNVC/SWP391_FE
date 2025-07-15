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
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filters, setFilters] = useState({
    studentName: "",
    parentName: "",
    medicationName: "",
    dateFrom: "",
    status: "all", // all, pending, accepted, rejected
    remainingQuantity: "all" // all, low, medium, high
  });
  const [sortConfig, setSortConfig] = useState({
    key: "createdDate",
    direction: "desc"
  });
  const [showPrescriptionImage, setShowPrescriptionImage] = useState(false);

  const handleViewPrescriptionImage = () => {
    setShowPrescriptionImage(true);
  };

  const handleClosePrescriptionImage = () => {
    setShowPrescriptionImage(false);
  };

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
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => {
        let statusText = "Chưa xác định";
        
        if (status === "Pending" || status === 1) {
          statusText = "Đang chờ";
        } else if (status === "Accepted" || status === 2) {
          statusText = "Đã duyệt";
        } else if (status === "Rejected" || status === 3) {
          statusText = "Đã từ chối";
        }
        
        return (
          <span 
            style={{ cursor: 'pointer' }} 
            onClick={() => handleSort("status")}
          >
            {statusText}
            {sortConfig.key === "status" && (
              <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
                {sortConfig.direction === 'asc' ? '▲' : '▼'}
              </span>
            )}
          </span>
        );
      }
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
      // Xử lý trường hợp có double slash trong URL
      return filePathOrName.replace(/([^:]\/)\/+/g, "$1");
    }
    
    // Xử lý tên file để đảm bảo định dạng đúng
    const fileName = filePathOrName.includes('/') 
      ? filePathOrName.split('/').pop() 
      : filePathOrName;
    
    console.log("Processing prescription file:", filePathOrName);
    console.log("Extracted filename:", fileName);
    
    // Định nghĩa các endpoint có thể sử dụng
    const endpoints = [
      // Endpoint chính - sử dụng API downloadImage của parentPrescription
      `${API_BASE_URL}/parentPrescription/downloadImage?fileName=${fileName}`,
      // Endpoint dự phòng 1 - đường dẫn trực tiếp đến thư mục files
      `${API_BASE_URL}/files/parentPrecriptions/${fileName}`,
      // Endpoint dự phòng 2 - đường dẫn không có api
      `http://localhost:5273/files/parentPrecriptions/${fileName}`
    ];
    
    // Sử dụng endpoint chính
    return endpoints[0];
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  // Thêm useEffect để lọc dữ liệu khi medications hoặc filters thay đổi
  useEffect(() => {
    applyFiltersAndSort();
  }, [medications, filters, sortConfig]);

  // Hàm xử lý sắp xếp
  const handleSort = (key) => {
    // Nếu key giống với key hiện tại, đảo ngược hướng sắp xếp
    // Nếu khác, đặt key mới và hướng mặc định là tăng dần
    const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  // Hàm áp dụng bộ lọc và sắp xếp
  const applyFiltersAndSort = (medicationsList = medications, currentFilters = filters, currentSortConfig = sortConfig) => {
    let result = [...medicationsList];
    
    // Áp dụng các bộ lọc
    if (currentFilters.studentName) {
      result = result.filter(med => {
        // Tìm theo tên học sinh
        const studentName = med.studentName?.toLowerCase() || "";
        
        // Tìm theo ID học sinh
        const studentId = med.studentId ? med.studentId.toString() : "";
        
        // Trả về true nếu tên hoặc ID chứa từ khóa tìm kiếm
        return studentName.includes(currentFilters.studentName.toLowerCase()) || 
               studentId.includes(currentFilters.studentName);
      });
    }
    
    if (currentFilters.parentName) {
      result = result.filter(med => {
        // Tìm theo tên phụ huynh
        const parentName = med.parentName?.toLowerCase() || "";
        
        // Tìm theo ID phụ huynh
        const parentId = med.parentId ? med.parentId.toString() : "";
        
        // Trả về true nếu tên hoặc ID chứa từ khóa tìm kiếm
        return parentName.includes(currentFilters.parentName.toLowerCase()) || 
               parentId.includes(currentFilters.parentName);
      });
    }
    
    if (currentFilters.medicationName) {
      result = result.filter(med => {
        // Tìm theo tên thuốc
        const medicationName = med.medicationName?.toLowerCase() || "";
        
        // Tìm theo ID thuốc
        const medicationId = med.medicationId ? med.medicationId.toString() : "";
        
        // Trả về true nếu tên hoặc ID chứa từ khóa tìm kiếm
        return medicationName.includes(currentFilters.medicationName.toLowerCase()) || 
               medicationId.includes(currentFilters.medicationName);
      });
    }
    
    if (currentFilters.dateFrom) {
      const fromDate = new Date(currentFilters.dateFrom);
      result = result.filter(med => {
        const createdDate = new Date(med.createdDate);
        return createdDate >= fromDate;
      });
    }
    
    if (currentFilters.status !== "all") {
      result = result.filter(med => {
        // Kiểm tra giá trị status từ API
        console.log("Filtering status:", med.status, "Filter value:", currentFilters.status);
        
        // Chuyển đổi giá trị status để so sánh
        let statusValue;
        if (typeof med.status === 'string') {
          // Nếu status là string, chuyển đổi thành số
          if (med.status === "Pending") statusValue = 1;
          else if (med.status === "Accepted") statusValue = 2;
          else if (med.status === "Rejected") statusValue = 3;
          else statusValue = parseInt(med.status, 10) || 1; // Mặc định là 1 nếu không chuyển đổi được
        } else {
          // Nếu status đã là số
          statusValue = med.status || 1; // Mặc định là 1 nếu không có giá trị
        }
        
        // So sánh với giá trị filter
        const filterValue = parseInt(currentFilters.status, 10);
        return statusValue === filterValue;
      });
    }
    
    if (currentFilters.remainingQuantity !== "all") {
      result = result.filter(med => {
        if (!med.quantity) return false;
        const percentage = Math.round((med.remainingQuantity / med.quantity) * 100);
        
        switch (currentFilters.remainingQuantity) {
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
    if (currentSortConfig.key) {
      result.sort((a, b) => {
        // Xử lý các trường hợp đặc biệt
        if (currentSortConfig.key === "remainingQuantity") {
          // Tính phần trăm còn lại để so sánh
          const percentA = a.quantity ? (a.remainingQuantity / a.quantity) * 100 : 0;
          const percentB = b.quantity ? (b.remainingQuantity / b.quantity) * 100 : 0;
          
          if (currentSortConfig.direction === "asc") {
            return percentA - percentB;
          } else {
            return percentB - percentA;
          }
        } 
        else if (currentSortConfig.key === "status") {
          // Chuyển đổi trạng thái thành số để so sánh
          const getStatusValue = (status) => {
            if (typeof status === 'string') {
              if (status === "Accepted") return 2;
              if (status === "Rejected") return 3;
              if (status === "Pending") return 1;
              return parseInt(status, 10) || 1;
            }
            // Nếu status đã là số
            return status || 1; // Mặc định là 1 nếu không có giá trị
          };
          
          const statusA = getStatusValue(a.status);
          const statusB = getStatusValue(b.status);
          
          console.log(`Sorting: ${a.prescriptionId} (${a.status} -> ${statusA}) vs ${b.prescriptionId} (${b.status} -> ${statusB})`);
          
          if (currentSortConfig.direction === "asc") {
            return statusA - statusB;
          } else {
            return statusB - statusA;
          }
        }
        else if (currentSortConfig.key === "createdDate") {
          // So sánh ngày
          const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
          const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
          
          if (currentSortConfig.direction === "asc") {
            return dateA - dateB;
          } else {
            return dateB - dateA;
          }
        }
        else {
          // Xử lý các trường thông thường
          const valueA = a[currentSortConfig.key] || "";
          const valueB = b[currentSortConfig.key] || "";
          
          if (currentSortConfig.direction === "asc") {
            return valueA > valueB ? 1 : -1;
          } else {
            return valueA < valueB ? 1 : -1;
          }
        }
      });
    }
    
    // Ưu tiên hiển thị các đơn thuốc chưa duyệt lên đầu
    if (currentSortConfig.key !== "status") {
      result.sort((a, b) => {
        const statusA = a.status === "Pending" || a.status === 1 ? 0 : 1;
        const statusB = b.status === "Pending" || b.status === 1 ? 0 : 1;
        return statusA - statusB;
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
    
    // Áp dụng bộ lọc ngay lập tức khi người dùng nhập
    applyFiltersAndSort(medications, { ...filters, [name]: value }, sortConfig);
  };
  
  // Hàm reset bộ lọc
  const resetFilters = () => {
    const resetFilterValues = {
      studentName: "",
      parentName: "",
      medicationName: "",
      dateFrom: "",
      status: "all",
      remainingQuantity: "all"
    };
    setFilters(resetFilterValues);
    // Áp dụng ngay lập tức các bộ lọc đã reset
    applyFiltersAndSort(medications, resetFilterValues, sortConfig);
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
      
      // Kiểm tra giá trị status từ API
      prescriptionsResponse.forEach(prescription => {
        console.log(`Prescription ID: ${prescription.prescriptionId}, Status: ${prescription.status}, Type: ${typeof prescription.status}`);
        console.log(`Submitted Date: ${prescription.submittedDate}, Type: ${typeof prescription.submittedDate}`);
      });
      
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
            console.log(`Medications for prescription ${prescription.prescriptionId}:`, medicationsResponse);
            
            // Nếu có thuốc, lấy tên thuốc đầu tiên
            if (medicationsResponse && medicationsResponse.length > 0) {
              const medication = medicationsResponse[0];
              medicationName = medication.medicationName || prescription.parentNote || "Không có tên thuốc";
              dosage = medication.dosage || "Không có";
              quantity = medication.quantity;
              remainingQuantity = medication.remainingQuantity;
              medicationId = medication.medicationId;
              studentId = medication.studentId;
              
              console.log(`Medication details - ID: ${medicationId}, Name: ${medicationName}, Remaining: ${remainingQuantity}`);
              
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
          
          // Xử lý ngày kê đơn
          let submittedDate = prescription.submittedDate;
          if (submittedDate) {
            // Nếu là string dạng "yyyy-MM-dd", chuyển đổi thành đối tượng Date
            if (typeof submittedDate === 'string' && submittedDate.includes('-')) {
              submittedDate = new Date(submittedDate);
            } 
            // Nếu là đối tượng DateOnly từ API, chuyển đổi thành đối tượng Date
            else if (typeof submittedDate === 'object' && submittedDate.year && submittedDate.month && submittedDate.day) {
              submittedDate = new Date(submittedDate.year, submittedDate.month - 1, submittedDate.day);
            }
          }
          
          // Trả về dữ liệu đã xử lý
          return {
            ...prescription,
            medicationName,
            studentName,
            parentName,
            createdDate: submittedDate,
            submittedDate: submittedDate,
            dosage,
            quantity,
            remainingQuantity,
            medicationId,
            studentId,
            schedule: prescription.schedule || "Không có",
            status: prescription.status || 1 // Mặc định là Pending (1) nếu không có thông tin
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

  // Cập nhật hàm handleSearch để tìm kiếm theo ID
  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      console.log("Tìm kiếm với từ khóa:", searchKeyword);
      
      // Kiểm tra xem searchKeyword có phải là ID không
      const isNumeric = /^\d+$/.test(searchKeyword);
      
      if (isNumeric) {
        // Nếu là ID, tìm kiếm trong danh sách medications hiện có
        const foundMedications = medications.filter(med => 
          med.prescriptionId?.toString() === searchKeyword ||
          med.medicationId?.toString() === searchKeyword ||
          med.studentId?.toString() === searchKeyword ||
          med.parentId?.toString() === searchKeyword
        );
        
        if (foundMedications.length > 0) {
          // Nếu tìm thấy, cập nhật filteredMedications
          setFilteredMedications(foundMedications);
          setSearchLoading(false);
          return;
        }
      }
      
      // Nếu không phải ID hoặc không tìm thấy, gọi API
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
        remainingQuantity: newQuantity,
        studentId: selectedMedication.studentId
      };

      console.log("Updating medication with data:", updateData);

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

  const handleAcceptPrescription = async () => {
    if (!selectedMedication) return;

    try {
      const updateData = {
        prescriptionId: selectedMedication.prescriptionId,
        status: "Accepted", // Hoặc 2
        acceptedDate: new Date().toISOString()
      };

      await API_SERVICE.parentPrescriptionAPI.updateStatus(updateData);

      setMedications(prevMedications => 
        prevMedications.map(med => 
          med.prescriptionId === selectedMedication.prescriptionId 
            ? { ...med, status: "Accepted", acceptedDate: new Date().toISOString() }
            : med
        )
      );

      setSelectedMedication(prev => ({ ...prev, status: "Accepted", acceptedDate: new Date().toISOString() }));

      setNotif({
        message: "Đã duyệt đơn thuốc thành công",
        type: "success"
      });

      setShowViewModal(false);
    } catch (error) {
      console.error("Error accepting prescription:", error);
      setNotif({
        message: error.message || "Không thể duyệt đơn thuốc",
        type: "error"
      });
    }
  };

  const handleRejectPrescription = async () => {
    if (!selectedMedication) return;

    try {
      const updateData = {
        prescriptionId: selectedMedication.prescriptionId,
        status: "Rejected", // Hoặc 3
        rejectedDate: new Date().toISOString()
      };

      await API_SERVICE.parentPrescriptionAPI.updateStatus(updateData);

      setMedications(prevMedications => 
        prevMedications.map(med => 
          med.prescriptionId === selectedMedication.prescriptionId 
            ? { ...med, status: "Rejected", rejectedDate: new Date().toISOString() }
            : med
        )
      );

      setSelectedMedication(prev => ({ ...prev, status: "Rejected", rejectedDate: new Date().toISOString() }));

      setNotif({
        message: "Đã từ chối đơn thuốc thành công",
        type: "success"
      });

      setShowViewModal(false);
    } catch (error) {
      console.error("Error rejecting prescription:", error);
      setNotif({
        message: error.message || "Không thể từ chối đơn thuốc",
        type: "error"
      });
    }
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
              style={{ marginLeft: '8px', backgroundColor: showAdvancedFilter ? '#6c757d' : '#007bff' }}
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
              title={showAdvancedFilter ? "Ẩn bộ lọc nâng cao" : "Hiện bộ lọc nâng cao"}
            >
              <FaFilter />
            </button>
          </div>
        </div>
      </div>

      {/* Phần tìm kiếm nâng cao */}
      {showAdvancedFilter && (
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
            {/* Lọc theo tên thuốc */}
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
            
            {/* Lọc theo tên học sinh */}
            <div>
              <label htmlFor="studentName" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Học sinh</label>
              <input
                type="text"
                id="studentName"
                name="studentName"
                value={filters.studentName}
                onChange={handleFilterChange}
                className="form-control"
                placeholder="Nhập tên học sinh hoặc ID"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            
            {/* Lọc theo tên phụ huynh */}
            <div>
              <label htmlFor="parentName" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Phụ huynh</label>
              <input
                type="text"
                id="parentName"
                name="parentName"
                value={filters.parentName}
                onChange={handleFilterChange}
                className="form-control"
                placeholder="Nhập tên phụ huynh hoặc ID"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            
            {/* Lọc theo trạng thái */}
            <div>
              <label htmlFor="status" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Trạng thái</label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="form-control"
                style={{ width: '100%', padding: '8px' }}
              >
                <option value="all">Tất cả</option>
                <option value="Pending">Chờ duyệt</option>
                <option value="Approved">Đã duyệt</option>
                <option value="Rejected">Từ chối</option>
                <option value="Completed">Hoàn thành</option>
              </select>
            </div>
          </div>
          
          {/* Thêm phần sắp xếp vào trong bộ lọc */}
          <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center' }}>
            <div style={{ marginRight: '15px' }}>
              <span style={{ fontSize: '0.9rem', marginRight: '8px' }}>Sắp xếp theo:</span>
              <select
                value={sortConfig.key}
                onChange={(e) => setSortConfig({...sortConfig, key: e.target.value})}
                className="form-control"
                style={{ display: 'inline-block', width: 'auto', padding: '6px' }}
              >
                <option value="medicationId">ID</option>
                <option value="medicationName">Tên thuốc</option>
                <option value="studentName">Học sinh</option>
                <option value="quantity">Số lượng</option>
                <option value="status">Trạng thái</option>
                <option value="createdDate">Ngày tạo</option>
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
                  <strong>Phụ huynh:</strong> {selectedMedication.parentName || "Không có"} (ID: {selectedMedication.parentId || "N/A"})
                </div>
                <div className="info-item">
                  <strong>Học sinh:</strong> {selectedMedication.studentName || "Không có"} (ID: {selectedMedication.studentId || "N/A"})
                </div>
                <div className="info-item">
                    <strong>Ngày gửi:</strong> {selectedMedication.submittedDate ? new Date(selectedMedication.submittedDate).toLocaleDateString('vi-VN') : "Không có"}
                </div>
                <div className="info-item">
                  <strong>Trạng thái:</strong> {" "}
                  {(() => {
                    const status = selectedMedication.status;
                    let statusText = "Chưa xác định";
                    
                    if (status === "Pending" || status === 1) {
                      statusText = "Đang chờ";
                    } else if (status === "Accepted" || status === 2) {
                      statusText = "Đã duyệt";
                    } else if (status === "Rejected" || status === 3) {
                      statusText = "Đã từ chối";
                    }
                    
                    return <span>{statusText}</span>;
                  })()}
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
                    <strong>Tổng số lượng:</strong> {selectedMedication.quantity || "Không có"}
                </div>
                <div className="info-item">
                    <strong>Số lượng còn lại:</strong> {selectedMedication.remainingQuantity !== undefined ? selectedMedication.remainingQuantity : "Không có"}
                  </div>
                  <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                    <strong>Ghi chú phụ huynh:</strong> {selectedMedication.parentNote || "Không có"}
                </div>
                  {selectedMedication.prescriptionFile && (
                    <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                      <strong>Tệp đơn thuốc:</strong>
                      <div>
                        {console.log("Prescription file path:", selectedMedication.prescriptionFile)}
                        {console.log("Full URL:", getPrescriptionFileUrl(selectedMedication.prescriptionFile))}
                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                          <a 
                            onClick={handleViewPrescriptionImage}
                            style={{ 
                              color: '#fff', 
                              backgroundColor: '#007bff', 
                              padding: '6px 12px', 
                              borderRadius: '4px',
                              textDecoration: 'none',
                              display: 'inline-block',
                              cursor: 'pointer'
                            }}
                          >
                            Xem đơn thuốc
                          </a>
                        </div>
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
              <button
                className="admin-btn"
                style={{ backgroundColor: '#6c757d' }}
                onClick={() => setShowViewModal(false)}
              >
                Đóng
              </button>
              
              {/* Hiển thị nút duyệt/từ chối chỉ khi đơn thuốc đang ở trạng thái chờ duyệt */}
              {(selectedMedication.status === "Pending" || selectedMedication.status === 1) && (
                <>
                  <button
                    className="admin-btn"
                    style={{ backgroundColor: '#28a745', marginRight: '8px' }}
                    onClick={handleAcceptPrescription}
                  >
                    Duyệt đơn thuốc
                  </button>
                  <button
                    className="admin-btn"
                    style={{ backgroundColor: '#dc3545', marginRight: '8px' }}
                    onClick={handleRejectPrescription}
                  >
                    Từ chối
                  </button>
                </>
              )}
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

      {/* Modal hiển thị hình ảnh đơn thuốc */}
      {showPrescriptionImage && selectedMedication && selectedMedication.prescriptionFile && (
        <div className="student-dialog-overlay" style={{ zIndex: 1050 }}>
          <div className="student-dialog-content" style={{ maxWidth: '90%', maxHeight: '90vh', padding: '10px' }}>
            <div className="student-dialog-header" style={{ marginBottom: '10px' }}>
              <h2>Đơn thuốc</h2>
              <button className="student-dialog-close" onClick={handleClosePrescriptionImage}>×</button>
            </div>
            <div className="student-dialog-body" style={{ textAlign: 'center', overflow: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
              {/* Thêm loading indicator */}
              <div id="image-loading-indicator" style={{ marginBottom: '10px', color: '#007bff' }}>Đang tải hình ảnh...</div>
              
              <img 
                src={getPrescriptionFileUrl(selectedMedication.prescriptionFile)} 
                alt="Đơn thuốc" 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                onLoad={() => {
                  // Ẩn loading indicator khi ảnh đã tải xong
                  const indicator = document.getElementById('image-loading-indicator');
                  if (indicator) indicator.style.display = 'none';
                }}
                onError={(e) => {
                  // Ẩn loading indicator và hiển thị lỗi
                  const indicator = document.getElementById('image-loading-indicator');
                  if (indicator) indicator.style.display = 'none';
                  
                  console.error("Error loading prescription image:", e.target.src);
                  e.target.onerror = null; // Prevent infinite error loop
                  
                  // Lấy tên file từ đường dẫn gốc
                  const fileName = selectedMedication.prescriptionFile.includes('/') 
                    ? selectedMedication.prescriptionFile.split('/').pop() 
                    : selectedMedication.prescriptionFile;
                  
                  // Định nghĩa các endpoint có thể sử dụng
                  const endpoints = [
                    // Endpoint chính - sử dụng API downloadImage của parentPrescription
                    `${API_BASE_URL}/parentPrescription/downloadImage?fileName=${fileName}`,
                    // Endpoint dự phòng 1 - đường dẫn trực tiếp đến thư mục files
                    `${API_BASE_URL}/files/parentPrecriptions/${fileName}`,
                    // Endpoint dự phòng 2 - đường dẫn không có api
                    `http://localhost:5273/files/parentPrecriptions/${fileName}`,
                    // Endpoint dự phòng 3 - thử port 7024
                    `http://localhost:7024/files/parentPrecriptions/${fileName}`,
                    // Endpoint dự phòng 4 - sử dụng thư mục blogs như trong ParentPrescriptions.jsx
                    `${API_BASE_URL}/files/blogs/${fileName}`
                  ];
                  
                  // Tìm endpoint hiện tại trong danh sách
                  const currentSrc = e.target.src;
                  const currentIndex = endpoints.findIndex(endpoint => 
                    currentSrc.includes(endpoint) || endpoint.includes(currentSrc)
                  );
                  
                  // Thử endpoint tiếp theo nếu có
                  if (currentIndex < endpoints.length - 1) {
                    const nextIndex = currentIndex + 1;
                    console.log(`Thử URL thay thế (${nextIndex + 1}/${endpoints.length}):`, endpoints[nextIndex]);
                    e.target.src = endpoints[nextIndex];
                    return;
                  }
                  
                  // Nếu đã thử tất cả endpoint, hiển thị ảnh placeholder
                  e.target.src = "https://via.placeholder.com/400x600?text=Không+thể+tải+hình+ảnh";
                  
                  // Show error message
                  const errorDiv = document.createElement('div');
                  errorDiv.style.color = 'red';
                  errorDiv.style.marginTop = '10px';
                  errorDiv.innerText = `Không thể tải hình ảnh. Vui lòng thử tải xuống để xem.`;
                  e.target.parentNode.appendChild(errorDiv);
                }}
              />
            </div>
            <div className="student-dialog-footer">
              <button
                className="admin-btn"
                style={{ backgroundColor: '#6c757d' }}
                onClick={handleClosePrescriptionImage}
              >
                Đóng
              </button>
              {/* Xóa nút tải xuống vì ảnh đã hiển thị thành công */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medications; 