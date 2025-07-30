import React, { useState, useEffect } from "react";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaSearch, FaEdit, FaFilter, FaSortAmountDown, FaSortAmountUp, FaCheck, FaTimes } from "react-icons/fa";
import "../styles/Dashboard.css";
import "../styles/VaxResults.css";

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
    schedule: "",
    status: "all", // all, pending, accepted, rejected
    remainingQuantity: "all" // all, low, medium, high
  });
  const [sortConfig, setSortConfig] = useState({
    key: "createdDate",
    direction: "desc"
  });
  const [showPrescriptionImage, setShowPrescriptionImage] = useState(false);
  // Thêm state cho xác nhận thay đổi trạng thái
  const [showConfirmAccept, setShowConfirmAccept] = useState(false);
  const [showConfirmReject, setShowConfirmReject] = useState(false);

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
      title: "ID Đơn", 
      dataIndex: "prescriptionId",
      width: 90, 
      render: (id) => <span>{id}</span>
    },
    { 
      title: "Phụ huynh", 
      dataIndex: "parentName",
      width: 250,
      render: (name, record) => <span>{name || "Không có"}</span>
    },
    { 
      title: "Học sinh", 
      dataIndex: "studentName",
      width: 300,
      render: (name, record) => <span>{name || "Không có"}</span>
    },
    { 
      title: "Thuốc", 
      dataIndex: "medicationName",
      width: 220,
      render: (name, record) => (
        <span>
          {name}
          {record.medicationCount > 1 && (
            <span className="medication-count" style={{ 
              backgroundColor: '#e6f7ff', 
              color: '#1890ff',
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: '0.75rem',
              marginLeft: '5px',
              fontWeight: 'bold'
            }}>
              {record.medicationCount} loại
            </span>
          )}
        </span>
      )
    },
    { 
      title: "Ngày gửi", 
      dataIndex: "createdDate",
      width: 120, 
      render: (date) => <span>{date ? new Date(date).toLocaleDateString('vi-VN') : "N/A"}</span>
    },
    { 
      title: "Lịch uống", 
      dataIndex: "schedule",
      width: 150, 
      render: (schedule) => <span>{schedule || "Không có"}</span>
    },
    {
      title: "Ghi chú",
      dataIndex: "parentNote",
      width: 180,
      render: (note) => <span>{note || "Không có"}</span>
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 150,
      render: (status) => {
        let statusText = "Chưa xác định";
        let badgeStyle = {};
        
        if (status === "Pending" || status === 1) {
          statusText = "Đang chờ";
          badgeStyle = {
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.85rem',
            fontWeight: '500',
            backgroundColor: '#ffc107',
            color: '#212529'
          };
        } else if (status === "Accepted" || status === 2) {
          statusText = "Đã duyệt";
          badgeStyle = {
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.85rem',
            fontWeight: '500',
            backgroundColor: '#28a745',
            color: '#fff'
          };
        } else if (status === "Rejected" || status === 3) {
          statusText = "Đã từ chối";
          badgeStyle = {
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.85rem',
            fontWeight: '500',
            backgroundColor: '#dc3545',
            color: '#fff'
          };
        }
        
        return <span style={badgeStyle}>{statusText}</span>;
      }
    },
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
    
    if (currentFilters.schedule) {
      result = result.filter(med => {
        const schedule = med.schedule?.toLowerCase() || "";
        return schedule.includes(currentFilters.schedule.toLowerCase());
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
      schedule: "",
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
      
      // Tạo một mảng để lưu trữ các đơn thuốc đã xử lý
      const processedPrescriptions = [];
      
      // Xử lý từng đơn thuốc
      for (const prescription of prescriptionsResponse) {
        try {
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
          
          // Lấy danh sách thuốc cho đơn thuốc
          const medicationsResponse = await API_SERVICE.medicationAPI.getByPrescription(prescription.prescriptionId);
          console.log(`Medications for prescription ${prescription.prescriptionId}:`, medicationsResponse);
          
          // Thông tin học sinh từ thuốc đầu tiên (nếu có)
          let studentName = "Không xác định";
          let studentId = null;
          
          if (medicationsResponse && medicationsResponse.length > 0 && medicationsResponse[0].studentId) {
            try {
              const studentResponse = await fetch(`${API_BASE_URL}/student/${medicationsResponse[0].studentId}`);
              if (studentResponse.ok) {
                const studentData = await studentResponse.json();
                studentName = studentData.fullName || "Không xác định";
                studentId = medicationsResponse[0].studentId;
              }
            } catch (studentError) {
              console.error("Error fetching student:", studentError);
            }
          }
          
          // Tạo đối tượng đơn thuốc với danh sách thuốc
          processedPrescriptions.push({
            ...prescription,
            prescriptionId: prescription.prescriptionId,
            parentName,
            studentName,
            studentId,
            createdDate: submittedDate,
            submittedDate,
            status: prescription.status || 1,
            medications: medicationsResponse || [],
            medicationCount: medicationsResponse ? medicationsResponse.length : 0,
            // Thêm thông tin thuốc đầu tiên để hiển thị trong bảng
            medicationName: medicationsResponse && medicationsResponse.length > 0 
              ? `${medicationsResponse[0].medicationName} ${medicationsResponse.length > 1 ? `(+${medicationsResponse.length - 1} loại khác)` : ''}` 
              : prescription.parentNote || "Không có thuốc",
            parentNote: prescription.parentNote || "",
            schedule: prescription.schedule || ""
          });
          
        } catch (error) {
          console.error(`Error processing prescription ${prescription.prescriptionId}:`, error);
          
          // Vẫn thêm đơn thuốc vào danh sách nếu có lỗi
          processedPrescriptions.push({
            ...prescription,
            prescriptionId: prescription.prescriptionId,
            parentName: "Không xác định",
            studentName: "Không xác định",
            createdDate: prescription.submittedDate,
            submittedDate: prescription.submittedDate,
            status: prescription.status || 1,
            medications: [],
            medicationCount: 0,
            medicationName: prescription.parentNote || "Không có thuốc",
            parentNote: prescription.parentNote || "",
            schedule: prescription.schedule || ""
          });
        }
      }
      
      console.log("Processed prescriptions:", processedPrescriptions);
      setMedications(processedPrescriptions);
      
    } catch (error) {
      console.error("Error fetching medications:", error);
      setNotif({
        message: "Không thể tải danh sách đơn thuốc từ phụ huynh",
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
    
    if (!selectedMedication || !selectedMedication.medicationId) {
      setNotif({
        message: "Không tìm thấy thông tin thuốc cần cập nhật",
        type: "error"
      });
      return;
    }
    
    // Kiểm tra số lượng hợp lệ
    const newQuantity = parseInt(updatedQuantity);
    if (isNaN(newQuantity) || newQuantity < 0 || newQuantity > selectedMedication.quantity) {
      setNotif({
        message: `Số lượng không hợp lệ. Vui lòng nhập số từ 0 đến ${selectedMedication.quantity}`,
        type: "error"
      });
      return;
    }
    
    setUpdatingQuantity(true);
    
    try {
      // Cập nhật số lượng thuốc còn lại
      const updateData = {
        medicationId: selectedMedication.medicationId,
        remainingQuantity: newQuantity
      };
      
      await API_SERVICE.medicationAPI.update(updateData);
      
      // Cập nhật state hiện tại
      setMedications(prevMedications => 
        prevMedications.map(prescription => {
          // Nếu đây là đơn thuốc chứa thuốc cần cập nhật
          if (prescription.prescriptionId === selectedMedication.prescriptionId) {
            // Cập nhật thuốc trong danh sách medications
            const updatedMedications = prescription.medications.map(med => 
              med.medicationId === selectedMedication.medicationId
                ? { ...med, remainingQuantity: newQuantity }
                : med
            );
            
            return {
              ...prescription,
              medications: updatedMedications
            };
          }
          return prescription;
        })
      );
      
      // Cập nhật thuốc đang được xem
      setSelectedMedication(prev => {
        // Cập nhật thuốc hiện tại
        const updatedMedication = {
          ...prev,
          remainingQuantity: newQuantity
        };
        
        // Cập nhật danh sách thuốc
        if (updatedMedication.medications) {
          updatedMedication.medications = updatedMedication.medications.map(med => 
            med.medicationId === selectedMedication.medicationId
              ? { ...med, remainingQuantity: newQuantity }
              : med
          );
        }
        
        return updatedMedication;
      });
      
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
    setShowConfirmAccept(true);
  };

  const confirmAcceptPrescription = async () => {
    setShowConfirmAccept(false);
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

      // Đã xóa thông báo "Đã duyệt đơn thuốc thành công"

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
    setShowConfirmReject(true);
  };

  const confirmRejectPrescription = async () => {
    setShowConfirmReject(false);
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

      // Đã xóa thông báo "Đã từ chối đơn thuốc thành công"

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
      <h2 className="dashboard-title">Quản lý đơn thuốc từ phụ huynh</h2>
      <div className="admin-header">
        <div className="search-container">
          <input
            className="admin-search"
            type="text"
            placeholder="Tìm kiếm..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button
            className="admin-btn"
            style={{ marginLeft: '8px', padding: '8px' }}
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            title={showAdvancedFilter ? "Ẩn bộ lọc nâng cao" : "Hiện bộ lọc nâng cao"}
          >
            <FaFilter />
          </button>
        </div>
      </div>

      {/* Phần tìm kiếm nâng cao */}
      {showAdvancedFilter && (
        <div className="admin-advanced-filter" style={{ 
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
            
            {/* Lọc theo ngày */}
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
            
            {/* Lọc theo lịch uống */}
            <div>
              <label htmlFor="schedule" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Lịch uống</label>
              <input
                type="text"
                id="schedule"
                name="schedule"
                value={filters.schedule}
                onChange={handleFilterChange}
                className="form-control"
                placeholder="Nhập lịch uống..."
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
                <option value="pending">Đang chờ</option>
                <option value="accepted">Đã duyệt</option>
                <option value="rejected">Đã từ chối</option>
              </select>
            </div>
            
            {/* Lọc theo số lượng còn lại */}
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
                <option value="low">Thấp (≤ 20%)</option>
                <option value="medium">Trung bình (21-50%)</option>
                <option value="high">Cao ({'>'}50%)</option>
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
                <option value="prescriptionId">ID</option>
                <option value="medicationName">Tên thuốc</option>
                <option value="studentName">Học sinh</option>
                <option value="parentName">Phụ huynh</option>
                <option value="createdDate">Ngày gửi</option>
                <option value="schedule">Lịch uống</option>
                <option value="status">Trạng thái</option>
                <option value="remainingQuantity">Số lượng còn lại</option>
              </select>
            </div>
            
            <div>
              <button
                className="admin-btn"
                style={{ padding: '6px' }}
                onClick={() => setSortConfig({...sortConfig, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'})}
                title={sortConfig.direction === 'asc' ? 'Sắp xếp giảm dần' : 'Sắp xếp tăng dần'}
              >
                {sortConfig.direction === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
              </button>
            </div>
          </div>
          
          <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#6c757d' }}>
            <span>Đang hiển thị: <strong>{filteredMedications.length}</strong> / {medications.length} kết quả</span>
          </div>
        </div>
      )}

      {/* Hiển thị bảng dữ liệu */}
      <div className="admin-table-container">
        {loading ? (
          <div className="loading-container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <TableWithPaging
            columns={columns}
            data={filteredMedications}
            pageSize={10}
            page={page}
            onPageChange={setPage}
            renderActions={(record) => (
              <div className="action-buttons">
                <button
                  className="admin-btn action-btn"
                  onClick={() => handleView(record)}
                  title="Xem chi tiết"
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    padding: '0',
                    cursor: 'pointer',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaEye style={{ color: '#1890ff', fontSize: '14px' }} />
                </button>
              </div>
            )}
          />
        )}
        {!loading && filteredMedications.length === 0 && (
          <div className="no-data-message">
            Không có yêu cầu thuốc nào
          </div>
        )}
      </div>

      {/* Modal xem chi tiết đơn thuốc */}
      {showViewModal && selectedMedication && (
        <div className="student-dialog-overlay">
          <div className="student-dialog-content" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="student-dialog-header">
              <h2>Chi tiết đơn thuốc #{selectedMedication.prescriptionId}</h2>
              <button className="student-dialog-close" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="student-dialog-body">
              {/* Thông tin đơn thuốc */}
              <div className="student-info-section">
                <h3 style={{ 
                  borderBottom: '2px solid #007bff',
                  paddingBottom: '8px',
                  margin: '16px 0',
                  color: '#333',
                  fontSize: '1.1rem'
                }}>Thông tin đơn thuốc</h3>
                
                <div className="info-grid">
                  <div className="info-item">
                    <strong>ID đơn thuốc:</strong> {selectedMedication.prescriptionId}
                  </div>
                  <div className="info-item">
                    <strong>Phụ huynh:</strong> {selectedMedication.parentName || "Không có"}
                  </div>
                  <div className="info-item">
                    <strong>Học sinh:</strong> {selectedMedication.studentName || "Không có"}
                  </div>
                  <div className="info-item">
                    <strong>Ngày gửi:</strong> {selectedMedication.submittedDate ? new Date(selectedMedication.submittedDate).toLocaleDateString('vi-VN') : "N/A"}
                  </div>
                  <div className="info-item">
                    <strong>Lịch uống chung:</strong> {selectedMedication.schedule || "Không có"}
                  </div>
                  <div className="info-item">
                    <strong>Ghi chú:</strong> {selectedMedication.parentNote || "Không có"}
                  </div>
                  <div className="info-item">
                    <strong>Trạng thái:</strong> {
                      (() => {
                        const status = selectedMedication.status;
                        if (status === "Pending" || status === 1) return "Đang chờ duyệt";
                        if (status === "Accepted" || status === 2) return "Đã duyệt";
                        if (status === "Rejected" || status === 3) return "Đã từ chối";
                        return "Không xác định";
                      })()
                    }
                  </div>
                </div>
                
                {selectedMedication.prescriptionFile && (
                  <div className="info-item" style={{ marginTop: '20px' }}>
                    <strong>Tệp đơn thuốc:</strong>
                    <div>
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

              {/* Danh sách thuốc trong đơn */}
              <div className="student-info-section">
                <h3 style={{ 
                  borderBottom: '2px solid #28a745',
                  paddingBottom: '8px',
                  margin: '16px 0',
                  color: '#333',
                  fontSize: '1.1rem'
                }}>Danh sách thuốc ({selectedMedication.medications?.length || 0})</h3>
                
                {selectedMedication.medications && selectedMedication.medications.length > 0 ? (
                  <div style={{ overflowX: 'auto', marginTop: '10px' }}>
                    <table className="table table-striped table-bordered">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Tên thuốc</th>
                          <th>Liều lượng</th>
                          <th>Lịch uống</th>
                          <th>Số lượng</th>
                          <th>Còn lại</th>
                          {(selectedMedication.status === "Accepted" || selectedMedication.status === 2) && (
                            <th>Hành động</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedMedication.medications.map((med, index) => (
                          <tr key={med.medicationId || index}>
                            <td>{med.medicationId || "N/A"}</td>
                            <td>{med.medicationName || "Không có"}</td>
                            <td>{med.dosage || "Không có"}</td>
                            <td>{med.schedule || selectedMedication.schedule || "Không có"}</td>
                            <td>{med.quantity !== undefined ? med.quantity : "N/A"}</td>
                            <td>
                              {med.quantity && med.remainingQuantity !== undefined ? (
                                <div>
                                  <div>{med.remainingQuantity}/{med.quantity}</div>
                                  <div style={{ 
                                    width: '100%', 
                                    backgroundColor: '#e9ecef', 
                                    borderRadius: '4px',
                                    height: '6px',
                                    marginTop: '4px'
                                  }}>
                                    <div style={{ 
                                      width: `${Math.round((med.remainingQuantity / med.quantity) * 100)}%`, 
                                      backgroundColor: med.remainingQuantity / med.quantity > 0.5 ? '#28a745' : med.remainingQuantity / med.quantity > 0.2 ? '#ffc107' : '#dc3545', 
                                      height: '6px',
                                      borderRadius: '4px'
                                    }}></div>
                                  </div>
                                </div>
                              ) : "N/A"}
                            </td>
                            {(selectedMedication.status === "Accepted" || selectedMedication.status === 2) && (
                              <td>
                                <button
                                  className="admin-btn action-btn"
                                  style={{ backgroundColor: '#17a2b8' }}
                                  onClick={() => {
                                    setSelectedMedication({
                                      ...selectedMedication,
                                      medicationId: med.medicationId,
                                      medicationName: med.medicationName,
                                      quantity: med.quantity,
                                      remainingQuantity: med.remainingQuantity,
                                      dosage: med.dosage,
                                      schedule: med.schedule
                                    });
                                    setUpdatedQuantity(med.remainingQuantity?.toString() || "");
                                    setShowUpdateQuantityModal(true);
                                  }}
                                  disabled={med.quantity === 0}
                                  title="Cập nhật số lượng"
                                >
                                  <FaEdit />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px', textAlign: 'center' }}>
                    Không có thuốc nào trong đơn
                  </div>
                )}
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

      {/* Thêm modal xác nhận duyệt đơn thuốc */}
      {showConfirmAccept && (
        <div className="student-delete-modal-overlay">
          <div className="student-delete-modal-content">
            <div className="student-delete-modal-title">
              <strong>Xác nhận duyệt đơn thuốc?</strong>
            </div>
            <div className="student-delete-modal-actions">
              <button className="btn btn-primary" onClick={confirmAcceptPrescription}>
                Xác nhận
              </button>
              <button className="btn btn-secondary" onClick={() => setShowConfirmAccept(false)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thêm modal xác nhận từ chối đơn thuốc */}
      {showConfirmReject && (
        <div className="student-delete-modal-overlay">
          <div className="student-delete-modal-content">
            <div className="student-delete-modal-title">
              <strong>Xác nhận từ chối đơn thuốc?</strong>
            </div>
            <div className="student-delete-modal-actions">
              <button className="btn btn-danger" onClick={confirmRejectPrescription}>
                Xác nhận
              </button>
              <button className="btn btn-secondary" onClick={() => setShowConfirmReject(false)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medications; 