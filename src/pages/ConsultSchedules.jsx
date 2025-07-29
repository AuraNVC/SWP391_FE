import React, { useState, useEffect } from "react";
import { API_SERVICE } from "../services/api";
import { useNotification } from '../contexts/NotificationContext';
import '../styles/TableWithPaging.css';
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaTrash, FaPlus, FaSearch, FaSync, FaCalendarAlt, FaFilter, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import "../styles/Dashboard.css";


const ConsultSchedules = () => {
  // Lấy vai trò người dùng từ localStorage
  const userRole = localStorage.getItem("userRole") || "";
  const isNurse = userRole === "nurse";
  const [showCreateFormModal, setShowCreateFormModal] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [parents, setParents] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  // State cho xác nhận xóa
  const [showConfirmRequest, setShowConfirmRequest] = useState(false);
  
  // State mới cho xác nhận thêm và cập nhật
  const [showConfirmAdd, setShowConfirmAdd] = useState(false);
  const [showConfirmUpdate, setShowConfirmUpdate] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditFormModal, setShowEditFormModal] = useState(false); // State mới cho modal chỉnh sửa form
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [consultationForm, setConsultationForm] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editFormData, setEditFormData] = useState(null); // State mới cho dữ liệu form đang chỉnh sửa
  const [formData, setFormData] = useState({
    consultDate: new Date().toISOString().split('T')[0],
    consultTime: "08:00",
    location: "Phòng y tế",
    studentId: "",
    studentSearchTerm: "",
    nurseId: localStorage.getItem("userId") || "",
    nurseSearchTerm: "",
    parentId: "",
    parentName: "",
    formTitle: "",
    formContent: "",
    sendNotification: true,
    showFormSection: false,
    createForm: true // Luôn tạo form tư vấn theo mặc định
  });
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filteredNurses, setFilteredNurses] = useState([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showNurseDropdown, setShowNurseDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  // State mới cho tính năng lọc nâng cao
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filters, setFilters] = useState({
    date: "",
    studentName: "",
    nurseName: "",
    location: "",
    formStatus: "all"
  });
  
  // State mới cho tính năng sắp xếp
  const [sortConfig, setSortConfig] = useState({
    key: "consultationScheduleId",
    direction: "desc"
  });

  const [activeTab, setActiveTab] = useState('schedule'); // State để quản lý tab đang active trong modal chi tiết

  const { setNotif } = useNotification();

  const columns = [
    { 
      title: "ID", 
      dataIndex: "consultationScheduleId",
      render: (id) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("consultationScheduleId")}>
          {id}
          {sortConfig.key === "consultationScheduleId" && (
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
      render: (name, record) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("studentName")}>
          {name || "Không có"} 
          {sortConfig.key === "studentName" && (
            <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </span>
      )
    },
    { 
      title: "Y tá", 
      dataIndex: "nurseName", 
      render: (name, record) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("nurseName")}>
          {name || "Chưa phân công"} 
          {sortConfig.key === "nurseName" && (
            <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </span>
      )
    },
    { 
      title: "Địa điểm", 
      dataIndex: "location",
      render: (location) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("location")}>
          {location}
          {sortConfig.key === "location" && (
            <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </span>
      )
    },
    { 
      title: "Ngày tư vấn", 
      dataIndex: "consultDate", 
      render: (date) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("consultDate")}>
          {date ? new Date(date).toLocaleDateString('vi-VN') : "N/A"}
          {sortConfig.key === "consultDate" && (
            <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </span>
      )
    },
    { 
      title: "Giờ tư vấn", 
      dataIndex: "consultTime", 
      render: (_, record) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("consultTime")}>
          {record.consultDate ? new Date(record.consultDate).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'}) : "N/A"}
          {sortConfig.key === "consultTime" && (
            <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </span>
      )
    },
    {
      title: "Trạng thái",
      dataIndex: "formStatus",
      render: (status) => {
        let statusText = "Đang chờ";
        let badgeStyle = {
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.85rem',
          fontWeight: '500',
          backgroundColor: '#ffc107',
          color: '#212529',
          display: 'inline-block',
          width: '100%',
          textAlign: 'center'
        };
        
        if (status === "Accepted" || status === 2) {
          statusText = "Đã duyệt";
          badgeStyle = {
            ...badgeStyle,
            backgroundColor: '#28a745',
            color: '#fff'
          };
        } else if (status === "Rejected" || status === 3) {
          statusText = "Đã từ chối";
          badgeStyle = {
            ...badgeStyle,
            backgroundColor: '#dc3545',
            color: '#fff'
          };
        }
        
        return (
          <div style={{ backgroundColor: '#e9ecef', padding: '2px', borderRadius: '4px' }}>
            <div style={badgeStyle}>{statusText}</div>
          </div>
        );
      }
    }
  ];

  const iconStyle = {
    view: { color: "#007bff" },
    edit: { color: "#28a745" },
    delete: { color: "#dc3545" }
  };

  // Hàm xử lý sắp xếp
  const handleSort = (key) => {
    // Nếu key giống với key hiện tại, đảo ngược hướng sắp xếp
    // Nếu khác, đặt key mới và hướng mặc định là tăng dần
    const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  // Thêm useEffect mới để áp dụng bộ lọc khi schedules hoặc filters thay đổi
  useEffect(() => {
    applyFiltersAndSort(schedules, filters, sortConfig);
  }, [schedules, filters, sortConfig]);

  // Hàm mới để áp dụng bộ lọc và sắp xếp
  const applyFiltersAndSort = (schedulesList = schedules, currentFilters = filters, currentSortConfig = sortConfig) => {
    let filteredData = [...schedulesList];
    
    // Lọc theo ngày
    if (currentFilters.date) {
      const selectedDate = new Date(currentFilters.date);
      selectedDate.setHours(0, 0, 0, 0); // Đặt thời gian là đầu ngày
      
      // Tạo ngày kết thúc (cuối ngày)
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);
      
      filteredData = filteredData.filter(schedule => {
        if (!schedule.consultDate) return false;
        const consultDate = new Date(schedule.consultDate);
        return consultDate >= selectedDate && consultDate <= endDate;
      });
    }
    
    // Lọc theo tên hoặc ID học sinh
    if (currentFilters.studentName) {
      filteredData = filteredData.filter(schedule => {
        // Tìm theo tên học sinh
        const studentName = schedule.studentName || "";
        
        // Tìm theo ID học sinh
        const studentId = schedule.studentId ? schedule.studentId.toString() : "";
        
        // Trả về true nếu tên hoặc ID chứa từ khóa tìm kiếm
        return studentName.toLowerCase().includes(currentFilters.studentName.toLowerCase()) || 
               studentId.includes(currentFilters.studentName);
      });
    }
    
    // Lọc theo tên hoặc ID y tá
    if (currentFilters.nurseName) {
      filteredData = filteredData.filter(schedule => {
        // Tìm theo tên y tá
        const nurseName = schedule.nurseName || "";
        
        // Tìm theo ID y tá
        const nurseId = schedule.nurseId ? schedule.nurseId.toString() : "";
        
        // Trả về true nếu tên hoặc ID chứa từ khóa tìm kiếm
        return nurseName.toLowerCase().includes(currentFilters.nurseName.toLowerCase()) || 
               nurseId.includes(currentFilters.nurseName);
      });
    }
    
    // Lọc theo địa điểm
    if (currentFilters.location) {
      filteredData = filteredData.filter(schedule => 
        schedule.location && schedule.location.toLowerCase().includes(currentFilters.location.toLowerCase())
      );
    }
    
    // Lọc theo trạng thái form
    if (currentFilters.formStatus && currentFilters.formStatus !== "all") {
      // Tạo một mảng Promise để kiểm tra trạng thái form của từng lịch
      const checkFormStatusPromises = filteredData.map(async (schedule) => {
        try {
          // Tìm form tư vấn cho lịch này
          const scheduleId = schedule.consultationScheduleId;
          let form = null;
          
          // Thử lấy form trực tiếp theo ID lịch
          try {
            form = await API_SERVICE.consultationFormAPI.getById(scheduleId);
          } catch (error) {
            // Nếu không tìm thấy trực tiếp, thử tìm qua studentId
            if (schedule.studentId) {
              const studentForms = await API_SERVICE.consultationFormAPI.getByStudent(schedule.studentId);
              if (Array.isArray(studentForms) && studentForms.length > 0) {
                form = studentForms.find(f => f.consultationScheduleId === scheduleId);
              }
            }
          }
          
          // Xác định trạng thái form
          if (!form) {
            // Không có form
            return currentFilters.formStatus === "noform";
          } else {
            // Có form, kiểm tra trạng thái
            const status = form.status;
            return (
              (currentFilters.formStatus === "pending" && (status === 0 || status === "Pending")) ||
              (currentFilters.formStatus === "accepted" && (status === 1 || status === "Accepted")) ||
              (currentFilters.formStatus === "rejected" && (status === 2 || status === "Rejected"))
            );
          }
        } catch (error) {
          console.error("Error checking form status:", error);
          return false;
        }
      });
      
      // Đợi tất cả các Promise hoàn thành
      console.log("Checking form statuses for filter...");
      
      // Lưu ý: Đây là cách đơn giản hóa vì async filter không thể sử dụng trực tiếp
      // Trong thực tế, chúng ta nên sử dụng một cách tiếp cận khác để tránh chặn UI
      Promise.all(checkFormStatusPromises).then(results => {
        filteredData = filteredData.filter((_, index) => results[index]);
        setFilteredSchedules(filteredData);
      });
      
      // Trả về kết quả tạm thời, sẽ được cập nhật bởi Promise.all
      return;
    }
    
    // Áp dụng sắp xếp
    if (currentSortConfig.key) {
      filteredData.sort((a, b) => {
        if (currentSortConfig.key === "consultationScheduleId") {
          // So sánh ID (số)
          const idA = a.consultationScheduleId || 0;
          const idB = b.consultationScheduleId || 0;
          
          if (currentSortConfig.direction === "asc") {
            return idA - idB;
          } else {
            return idB - idA;
          }
        }
        else if (currentSortConfig.key === "consultDate") {
          // So sánh ngày
          const dateA = a.consultDate ? new Date(a.consultDate).getTime() : 0;
          const dateB = b.consultDate ? new Date(b.consultDate).getTime() : 0;
          
          if (currentSortConfig.direction === "asc") {
            return dateA - dateB;
          } else {
            return dateB - dateA;
          }
        }
        else if (currentSortConfig.key === "consultTime") {
          // So sánh giờ
          const timeA = a.consultDate ? new Date(a.consultDate).getTime() % (24 * 60 * 60 * 1000) : 0;
          const timeB = b.consultDate ? new Date(b.consultDate).getTime() % (24 * 60 * 60 * 1000) : 0;
          
          if (currentSortConfig.direction === "asc") {
            return timeA - timeB;
          } else {
            return timeB - timeA;
          }
        }
        else {
          // Xử lý các trường thông thường
          const valueA = a[currentSortConfig.key] || "";
          const valueB = b[currentSortConfig.key] || "";
          
          if (currentSortConfig.direction === "asc") {
            return valueA.toString().localeCompare(valueB.toString());
          } else {
            return valueB.toString().localeCompare(valueA.toString());
          }
        }
      });
    }
    
    setFilteredSchedules(filteredData);
  };

  // Hàm xử lý thay đổi bộ lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Áp dụng bộ lọc ngay lập tức khi người dùng nhập
    applyFiltersAndSort(schedules, { ...filters, [name]: value }, sortConfig);
  };

  // Hàm reset bộ lọc
  const resetFilters = () => {
    const resetFilterValues = {
      date: "",
      studentName: "",
      nurseName: "",
      location: "",
      formStatus: "all"
    };
    setFilters(resetFilterValues);
    // Áp dụng ngay lập tức các bộ lọc đã reset
    applyFiltersAndSort(schedules, resetFilterValues, sortConfig);
  };

  useEffect(() => {
    fetchConsultationSchedules();
    fetchStudents();
    fetchNurses();
    fetchParents();
  }, []);

  const fetchConsultationSchedules = async (keyword = "") => {
    setLoading(true);
    try {
      console.log("Fetching consultation schedules with keyword:", keyword);
      const response = await API_SERVICE.consultationScheduleAPI.getAll({
        keyword: keyword
      });
      
      console.log("API response:", response);
      
      // Xử lý dữ liệu trả về từ API
      let schedulesData = [];
      if (Array.isArray(response)) {
        schedulesData = response;
      } else if (response && Array.isArray(response.data)) {
        schedulesData = response.data;
      } else {
        console.warn("API did not return an array:", response);
        setNotif({
          message: "API không trả về dữ liệu đúng định dạng",
          type: "error"
        });
        return;
      }
      
      // Xử lý dữ liệu để hiển thị
      const processedSchedules = await Promise.all(schedulesData.map(async (schedule) => {
        // Đảm bảo các ID là số nguyên
        const scheduleId = parseInt(schedule.consultationScheduleId);
        const studentId = schedule.studentId ? parseInt(schedule.studentId) : null;
        const nurseId = schedule.nurseId ? parseInt(schedule.nurseId) : null;
        
        // Lấy thông tin học sinh nếu có studentId
        let studentName = "";
        let studentData = null;
        if (studentId && !isNaN(studentId)) {
          // Tìm trong danh sách đã tải
          studentData = students.find(s => s.studentId === studentId);
            if (studentData) {
              studentName = studentData.fullName || `${studentData.firstName || ''} ${studentData.lastName || ''}`.trim();
          } else {
            // Nếu không tìm thấy, thử tải thông tin học sinh từ API
            try {
              const studentResponse = await API_SERVICE.studentAPI.getById(studentId);
              if (studentResponse) {
                studentData = studentResponse;
                studentName = studentResponse.fullName || `${studentResponse.firstName || ''} ${studentResponse.lastName || ''}`.trim();
              }
            } catch (studentError) {
              console.error(`Error fetching student with ID ${studentId}:`, studentError);
            }
          }
        }
        
        // Lấy thông tin y tá nếu có nurseId
        let nurseName = "";
        let nurseData = null;
        if (nurseId && !isNaN(nurseId)) {
            // Tìm y tá trong danh sách đã tải
          nurseData = nurses.find(n => n.nurseId === nurseId);
            if (nurseData) {
              nurseName = nurseData.fullName || `${nurseData.firstName || ''} ${nurseData.lastName || ''}`.trim();
            } 
            // Nếu không tìm thấy, thử tải thông tin y tá từ API
            else {
              try {
              const nurseResponse = await API_SERVICE.nurseAPI.getById(nurseId);
                if (nurseResponse) {
                  nurseData = nurseResponse;
                  nurseName = nurseResponse.fullName || `${nurseResponse.firstName || ''} ${nurseResponse.lastName || ''}`.trim();
                }
              } catch (nurseError) {
              console.error(`Error fetching nurse with ID ${nurseId}:`, nurseError);
            }
          }
        }
        
        // Lấy thông tin phụ huynh nếu có studentData và parentId
        let parentName = "";
        let parentId = null;
        if (studentData) {
          // Kiểm tra nếu student có thuộc tính parent trực tiếp
          if (studentData.parent && studentData.parent.parentId) {
            parentId = parseInt(studentData.parent.parentId);
            parentName = studentData.parent.fullName || `${studentData.parent.firstName || ''} ${studentData.parent.lastName || ''}`.trim();
            console.log(`Found parent info directly from student object: ${parentName} (ID: ${parentId})`);
          } 
          // Nếu không có parent trực tiếp nhưng có parentId
          else if (studentData.parentId) {
            parentId = parseInt(studentData.parentId);
            if (!isNaN(parentId)) {
              // Tìm trong danh sách đã tải
              const parentData = parents.find(p => p.parentId === parentId);
              if (parentData) {
                parentName = parentData.fullName || `${parentData.firstName || ''} ${parentData.lastName || ''}`.trim();
                console.log(`Found parent info from parents array: ${parentName} (ID: ${parentId})`);
              } else {
                // Nếu không tìm thấy, thử tải thông tin phụ huynh từ API
                try {
                  const parentResponse = await API_SERVICE.parentAPI.getById(parentId);
                  if (parentResponse) {
                    parentName = parentResponse.fullName || `${parentResponse.firstName || ''} ${parentResponse.lastName || ''}`.trim();
                    console.log(`Found parent info from API: ${parentName} (ID: ${parentId})`);
                  }
                } catch (parentError) {
                  console.error(`Error fetching parent with ID ${parentId}:`, parentError);
                }
              }
            }
          }
        }
        
        // Lấy thông tin trạng thái form tư vấn
        let formStatus = null;
        try {
          // Thử lấy form tư vấn theo ID lịch tư vấn
          try {
            const form = await API_SERVICE.consultationFormAPI.getById(scheduleId);
            if (form && form.status !== undefined) {
              formStatus = form.status;
              console.log(`Found form status for schedule ${scheduleId}:`, formStatus);
            }
          } catch (e) {
            console.log(`No direct form found for schedule ${scheduleId}`);
          }
          
          // Nếu không tìm thấy trực tiếp, thử tìm qua studentId
          if (formStatus === null && studentId) {
            try {
              const studentForms = await API_SERVICE.consultationFormAPI.getByStudent(studentId);
              if (Array.isArray(studentForms) && studentForms.length > 0) {
                const matchingForm = studentForms.find(form => 
                  form.consultationScheduleId === scheduleId || 
                  (form.consultationSchedule && form.consultationSchedule.consultationScheduleId === scheduleId)
                );
                if (matchingForm) {
                  formStatus = matchingForm.status;
                  console.log(`Found form status via student for schedule ${scheduleId}:`, formStatus);
                }
              }
            } catch (e) {
              console.log(`Error getting forms by student for schedule ${scheduleId}:`, e);
            }
          }
          
          // Nếu vẫn không tìm thấy và có parentId, thử tìm qua parentId
          if (formStatus === null && parentId) {
            try {
              const parentForms = await API_SERVICE.consultationFormAPI.getByParent(parentId);
              if (Array.isArray(parentForms) && parentForms.length > 0) {
                const matchingForm = parentForms.find(form => 
                  form.consultationScheduleId === scheduleId || 
                  (form.consultationSchedule && form.consultationSchedule.consultationScheduleId === scheduleId)
                );
                if (matchingForm) {
                  formStatus = matchingForm.status;
                  console.log(`Found form status via parent for schedule ${scheduleId}:`, formStatus);
                }
              }
            } catch (e) {
              console.log(`Error getting forms by parent for schedule ${scheduleId}:`, e);
            }
          }
        } catch (error) {
          console.error(`Error checking form status for schedule ${scheduleId}:`, error);
        }
        
        const consultDateTime = schedule.consultDate ? new Date(schedule.consultDate) : null;
        
        return {
          key: scheduleId,
          consultationScheduleId: scheduleId,
          studentId: studentId,
          studentName: studentName,
          nurseId: nurseId,
          nurseName: nurseName,
          location: schedule.location || "Không xác định",
          consultDate: schedule.consultDate,
          consultTime: consultDateTime ? consultDateTime.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'}) : null,
          hasParentInfo: !!parentName,
          formStatus: formStatus
        };
      }));
      
      console.log("Processed schedules:", processedSchedules);
      setSchedules(processedSchedules);
    } catch (error) {
      console.error("Error fetching consultation schedules:", error);
      setNotif({
        message: "Không thể tải danh sách lịch tư vấn: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      console.log("Fetching students...");
      const response = await API_SERVICE.studentAPI.getAll({ keyword: "" });
      
      let studentsData = [];
      if (Array.isArray(response)) {
        studentsData = response;
      } else if (response && Array.isArray(response.data)) {
        studentsData = response.data;
      } else {
        console.warn("Student API did not return an array:", response);
      }
      
      console.log("Students data:", studentsData);
      
      // Đánh dấu học sinh có phụ huynh để hiển thị cảnh báo
      const studentsWithParentInfo = await Promise.all(studentsData.map(async (student) => {
        console.log("Processing student:", student);
        
        // Kiểm tra nếu student có thuộc tính parent trực tiếp (từ API)
        if (student.parent && student.parent.parentId) {
          console.log(`Student ${student.studentId} has parent info directly in response:`, student.parent);
          return {
            ...student,
            hasParentInfo: true,
            parentId: student.parent.parentId,
            parentName: student.parent.fullName || `${student.parent.firstName || ''} ${student.parent.lastName || ''}`.trim()
          };
        }
        
        // Nếu không có parent trực tiếp nhưng có parentId, thử lấy thông tin phụ huynh
        if (student.parentId) {
          try {
            const parentId = parseInt(student.parentId);
            if (!isNaN(parentId)) {
              console.log(`Fetching parent info for student ${student.studentId} with parentId ${parentId}`);
              const parentResponse = await API_SERVICE.parentAPI.getById(parentId);
              console.log(`Parent info for student ${student.studentId}:`, parentResponse);
              
              if (parentResponse) {
                return {
                  ...student,
                  hasParentInfo: true,
                  parentName: parentResponse.fullName || `${parentResponse.firstName || ''} ${parentResponse.lastName || ''}`.trim()
                };
              }
            }
          } catch (error) {
            console.error(`Error fetching parent for student ${student.studentId}:`, error);
          }
        }
        
        // Nếu không có parentId hoặc không lấy được thông tin phụ huynh
        return {
          ...student,
          hasParentInfo: false
        };
      }));
      
      console.log("Processed students with parent info:", studentsWithParentInfo);
      setStudents(studentsWithParentInfo);
    } catch (error) {
      console.error("Error fetching students:", error);
      setNotif({
        message: "Không thể tải danh sách học sinh: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
      setStudents([]);
    }
  };

  const fetchNurses = async () => {
    try {
      console.log("Fetching nurses...");
      const response = await API_SERVICE.nurseAPI.getAll({ keyword: "" });
      
      let nursesData = [];
      if (Array.isArray(response)) {
        nursesData = response;
      } else if (response && Array.isArray(response.data)) {
        nursesData = response.data;
      } else {
        console.warn("Nurse API did not return an array:", response);
      }
      
      console.log("Nurses data:", nursesData);
      setNurses(nursesData);
    } catch (error) {
      console.error("Error fetching nurses:", error);
      setNotif({
        message: "Không thể tải danh sách y tá: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
      setNurses([]);
    }
  };
  
  // Hàm lấy danh sách phụ huynh
  const fetchParents = async () => {
    try {
      console.log("Fetching parents...");
      const response = await API_SERVICE.parentAPI.getAll({ keyword: "" });
      
      let parentsData = [];
      if (Array.isArray(response)) {
        parentsData = response;
      } else if (response && Array.isArray(response.data)) {
        parentsData = response.data;
      } else {
        console.warn("Parent API did not return an array:", response);
      }
      
      console.log("Parents data:", parentsData);
      
      // Xử lý dữ liệu phụ huynh để dễ sử dụng
      const processedParents = parentsData.map(parent => ({
        ...parent,
        fullName: parent.fullName || `${parent.firstName || ''} ${parent.lastName || ''}`.trim(),
      }));
      
      setParents(processedParents);
    } catch (error) {
      console.error("Error fetching parents:", error);
      setNotif({
        message: "Không thể tải danh sách phụ huynh: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
      setParents([]);
    }
  };

  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      console.log("Tìm kiếm với từ khóa:", searchKeyword);
      
      // Kiểm tra xem searchKeyword có phải là ID không
      const isNumeric = /^\d+$/.test(searchKeyword);
      
      if (isNumeric) {
        // Nếu là ID, tìm kiếm trong danh sách schedules hiện có
        const foundSchedules = schedules.filter(schedule => 
          schedule.consultationScheduleId?.toString() === searchKeyword ||
          schedule.studentId?.toString() === searchKeyword ||
          schedule.nurseId?.toString() === searchKeyword
        );
        
        if (foundSchedules.length > 0) {
          // Nếu tìm thấy, cập nhật filteredSchedules
          setFilteredSchedules(foundSchedules);
          setSearchLoading(false);
          return;
        }
      }
      
      // Nếu không phải ID hoặc không tìm thấy, gọi API
      await fetchConsultationSchedules(searchKeyword);
    } catch (error) {
      console.error("Error during search:", error);
      setNotif({
        message: "Lỗi khi tìm kiếm: " + (error.message || "Không xác định"),
        type: "error"
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRefresh = async () => {
    setSearchKeyword("");
    setSearchLoading(true);
    try {
      await Promise.all([
        fetchConsultationSchedules(""),
        fetchStudents(),
        fetchNurses()
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
      setNotif({
        message: "Không thể làm mới dữ liệu: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
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
    
    // Xử lý tìm kiếm học sinh khi người dùng nhập vào ô tìm kiếm học sinh
    if (name === "studentSearchTerm") {
      const filtered = students.filter(student => 
        (student.fullName?.toLowerCase().includes(value.toLowerCase())) ||
        (student.firstName?.toLowerCase().includes(value.toLowerCase())) ||
        (student.lastName?.toLowerCase().includes(value.toLowerCase())) ||
        `${student.studentId}`.includes(value)
      );
      setFilteredStudents(filtered);
      setShowStudentDropdown(true);
    }
    
    // Xử lý tìm kiếm y tá khi người dùng nhập vào ô tìm kiếm y tá
    if (name === "nurseSearchTerm") {
      const filtered = nurses.filter(nurse => 
        (nurse.fullName?.toLowerCase().includes(value.toLowerCase())) ||
        (nurse.firstName?.toLowerCase().includes(value.toLowerCase())) ||
        (nurse.lastName?.toLowerCase().includes(value.toLowerCase())) ||
        `${nurse.nurseId}`.includes(value)
      );
      setFilteredNurses(filtered);
      setShowNurseDropdown(true);
    }
  };

  const validateForm = () => {
    // Kiểm tra các trường chung
    if (!formData.consultDate || !formData.consultTime || !formData.location) {
      setNotif({
        message: "Vui lòng điền đầy đủ thông tin lịch tư vấn",
        type: "error"
      });
      return false;
    }
    
    // Kiểm tra thời gian lịch tư vấn phải sau thời gian hiện tại
    const selectedDateTime = new Date(`${formData.consultDate}T${formData.consultTime}`);
    const currentDateTime = new Date();
    
    if (selectedDateTime <= currentDateTime) {
      setNotif({
        message: "Thời gian tư vấn phải sau thời gian hiện tại",
        type: "error"
      });
      return false;
    }
    
    // Kiểm tra trường học sinh
    if (!formData.studentId) {
      setNotif({
        message: "Vui lòng chọn học sinh cần tư vấn",
        type: "error"
      });
      return false;
    }
    
    // Kiểm tra trường y tá
    if (!formData.nurseId) {
      setNotif({
        message: "Vui lòng chọn y tá phụ trách",
        type: "error"
      });
      return false;
    }
    
    // Kiểm tra thông tin form tư vấn
    if (!formData.formTitle) {
      setNotif({
        message: "Vui lòng nhập tiêu đề form tư vấn",
        type: "error"
      });
      return false;
    }
    
    if (!formData.formContent) {
      setNotif({
        message: "Vui lòng nhập nội dung form tư vấn",
        type: "error"
      });
      return false;
    }
    
    // Cảnh báo nếu không tìm thấy phụ huynh
    if (!formData.parentId) {
      console.warn("No parent ID found for student. Consultation form may not be properly linked to parent.");
    }
    
    return true;
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Hiển thị hộp thoại xác nhận thay vì gửi ngay
    setShowConfirmAdd(true);
  };

  // Thêm hàm resetAddForm để khởi tạo lại form với giá trị trống
  const resetAddForm = () => {
    setFormData({
      consultDate: "",
      consultTime: "",
      location: "",
      studentId: "",
      studentSearchTerm: "",
      nurseId: localStorage.getItem("userId") || "",
      nurseSearchTerm: "",
      parentId: "",
      parentName: "",
      formTitle: "",
      formContent: "",
      sendNotification: true,
      showFormSection: true, // Luôn hiển thị form tư vấn
      createForm: true // Luôn tạo form tư vấn theo mặc định
    });
    
    // Reset danh sách học sinh đã lọc
    setFilteredStudents([]);
    setShowStudentDropdown(false);
    setFilteredNurses([]);
    setShowNurseDropdown(false);
  };

  // Cập nhật hàm mở modal thêm mới
  const openAddModal = () => {
    resetAddForm();
    setShowAddModal(true);
  };

  // Thay đổi phần JSX nút thêm mới để sử dụng hàm openAddModal thay vì setShowAddModal(true)
  // Tìm phần code có nút thêm mới và thay đổi onClick từ setShowAddModal(true) thành openAddModal

  // Thêm hàm xác nhận thêm lịch tư vấn
  const confirmAddSchedule = async () => {
    setShowConfirmAdd(false);
    setLoading(true);
    
    try {
      // Xử lý ngày và giờ
      const consultDate = formData.consultDate;
      const consultTime = formData.consultTime;
      
      // Kết hợp ngày và giờ thành một chuỗi ISO
      const consultDateTime = new Date(`${consultDate}T${consultTime}`).toISOString();
      
      // Tìm studentId từ tên học sinh đã nhập
      let studentId = formData.studentId;
      let studentName = "";
      if (!studentId && formData.studentSearchTerm) {
        const foundStudent = students.find(s => 
          s.fullName === formData.studentSearchTerm || 
          formData.studentSearchTerm.includes(`ID: ${s.studentId}`)
        );
        if (foundStudent) {
          studentId = foundStudent.studentId;
          studentName = foundStudent.fullName;
        } else {
          throw new Error("Không tìm thấy học sinh. Vui lòng chọn học sinh từ danh sách.");
        }
      } else {
        // Tìm tên học sinh từ ID
        const foundStudent = students.find(s => s.studentId === parseInt(studentId));
        if (foundStudent) {
          studentName = foundStudent.fullName;
        }
      }
      
      // Tìm nurseId từ tên y tá đã nhập
      let nurseId = formData.nurseId;
      let nurseName = "";
      if (!nurseId && formData.nurseSearchTerm) {
        const foundNurse = nurses.find(n => 
          n.fullName === formData.nurseSearchTerm || 
          formData.nurseSearchTerm.includes(`ID: ${n.nurseId}`)
        );
        if (foundNurse) {
          nurseId = foundNurse.nurseId;
          nurseName = foundNurse.fullName;
        } else {
          throw new Error("Không tìm thấy y tá. Vui lòng chọn y tá từ danh sách.");
        }
      } else {
        // Tìm tên y tá từ ID
        const foundNurse = nurses.find(n => n.nurseId === parseInt(nurseId));
        if (foundNurse) {
          nurseName = foundNurse.fullName;
        }
      }
      
      // Tìm parentId từ formData hoặc từ danh sách học sinh nếu có
      let parentId = formData.parentId;
      let parentName = formData.parentName || "";
      
      // Nếu không có parentId, tìm từ thông tin học sinh
      if (!parentId && studentId) {
        try {
          console.log("Looking up parent ID for student:", studentId);
          
          // Tìm trong danh sách học sinh đã có
          const studentInList = students.find(s => s.studentId === parseInt(studentId));
          if (studentInList && studentInList.parentId) {
            parentId = studentInList.parentId;
            parentName = studentInList.parentName || "";
            console.log("Parent ID found from student list:", parentId);
          } else {
            // Nếu không tìm thấy trong danh sách, gọi API
            const studentInfo = await API_SERVICE.studentAPI.getById(studentId);
            console.log("Student info retrieved:", studentInfo);
            
            if (studentInfo && studentInfo.parentId) {
              parentId = studentInfo.parentId;
              parentName = studentInfo.parent?.fullName || "";
              console.log("Parent ID retrieved from student API:", parentId);
            } else if (studentInfo && studentInfo.parent) {
              parentId = studentInfo.parent.parentId;
              parentName = studentInfo.parent.fullName || "";
              console.log("Parent ID retrieved from student.parent:", parentId);
            } else {
              console.warn("Student does not have associated parent ID");
              
              // Thử tìm phụ huynh từ API khác nếu cần
              try {
                const parentData = await API_SERVICE.parentAPI.search({ studentId: parseInt(studentId) });
                console.log("Parent search result:", parentData);
                
                if (Array.isArray(parentData) && parentData.length > 0) {
                  parentId = parentData[0].parentId;
                  parentName = parentData[0].fullName || "";
                  console.log("Parent ID found from parent search:", parentId);
                }
              } catch (parentSearchError) {
                console.error("Error searching for parent:", parentSearchError);
              }
            }
          }
        } catch (err) {
          console.error("Error fetching student info for parent ID:", err);
        }
      }
      
      // Ghi log thông tin trước khi tạo lịch tư vấn
      console.log("Creating consultation schedule with data:", {
        studentId,
        studentName,
        nurseId,
        nurseName,
        parentId,
        parentName,
        consultDateTime,
        location: formData.location
      });
      
      // Chuẩn bị dữ liệu để gửi
      const scheduleData = {
        consultDate: consultDateTime,
        studentId: parseInt(studentId),
        nurseId: parseInt(nurseId),
        location: formData.location,
        parentId: parentId ? parseInt(parentId) : null
      };
      
      // Gọi API để tạo lịch tư vấn
      const response = await API_SERVICE.consultationScheduleAPI.create(scheduleData);
      console.log("API response:", response);
      
      // Lấy ID lịch tư vấn vừa tạo
      const scheduleId = response.consultationScheduleId || response.id;
      
      // Luôn tạo form tư vấn sau khi tạo lịch tư vấn thành công
      try {
        // Tạo tiêu đề form tư vấn với thông tin học sinh và y tá
        const formTitle = formData.formTitle || 
          `Tư vấn cho học sinh ${studentName} với y tá ${nurseName}`;
        
        // Chuẩn bị dữ liệu form và đảm bảo parentId được truyền đúng cách
        const consultationFormData = {
          consultationScheduleId: scheduleId,
          parentId: parentId ? parseInt(parentId) : null,
          title: formTitle,
          content: formData.formContent || `Nội dung tư vấn cho học sinh ${studentName}`
        };
      
        console.log("Creating consultation form with data:", JSON.stringify(consultationFormData, null, 2));
        
        // Gọi API để tạo form tư vấn
        const formResponse = await API_SERVICE.consultationFormAPI.create(consultationFormData);
        console.log("Form API response:", formResponse);
        
        // Xác thực xem form đã được tạo chính xác hay chưa
        try {
          // Truy xuất lại form vừa tạo để kiểm tra
          if (formResponse && formResponse.consultationFormId) {
            const createdForm = await API_SERVICE.consultationFormAPI.getById(formResponse.consultationFormId);
            console.log("Verification - Created form retrieved:", createdForm);
            
            // Nếu form tạo nhưng không có parentId, thử cập nhật lại
            if (createdForm && !createdForm.parentId && parentId) {
              console.log("Form created without parentId, attempting to update with correct parentId:", parentId);
              // Tạo dữ liệu cập nhật
              const updateData = {
                consultationFormId: createdForm.consultationFormId,
                consultationScheduleId: scheduleId,
                parentId: parseInt(parentId),
                title: createdForm.title,
                content: createdForm.content,
                status: createdForm.status
              };
              
              // Gửi yêu cầu cập nhật
              const updateResponse = await API_SERVICE.consultationFormAPI.update(createdForm.consultationFormId, updateData);
              console.log("Form update response:", updateResponse);
            }
          }
        } catch (verifyError) {
          console.error("Error verifying form creation:", verifyError);
        }
      } catch (formError) {
        console.error("Error creating consultation form:", formError);
        // Không throw lỗi ở đây vì lịch tư vấn đã được tạo thành công
      }
      
      // Gửi thông báo đến phụ huynh nếu có thông tin phụ huynh
      if (formData.sendNotification && parentId) {
        try {
          // Chuẩn bị dữ liệu thông báo
          const notificationData = {
            recipientId: parentId,
            title: "Lịch tư vấn mới",
            content: `Bạn có lịch tư vấn mới vào ngày ${new Date(consultDateTime).toLocaleDateString('vi-VN')} lúc ${new Date(consultDateTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})} tại ${formData.location}.`,
            type: "ConsultationSchedule",
            referenceId: response.consultationScheduleId || response.id
          };
          
          // Gọi API để gửi thông báo
          await API_SERVICE.notificationAPI.create(notificationData);
        } catch (notifError) {
          console.error("Error sending notification:", notifError);
          // Không throw lỗi ở đây vì lịch tư vấn đã được tạo thành công
        }
      }
      
      // Hiển thị thông báo thành công
        setNotif({
        message: "Thêm lịch tư vấn thành công",
          type: "success"
        });
      
      // Đóng modal và làm mới dữ liệu
      setShowAddModal(false);
      fetchConsultationSchedules();
    } catch (error) {
      console.error("Error adding schedule:", error);
      setNotif({
        message: error.message || "Có lỗi xảy ra khi thêm lịch tư vấn",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Hiển thị hộp thoại xác nhận thay vì gửi ngay
    setShowConfirmUpdate(true);
  };

  // Thêm hàm xác nhận cập nhật lịch tư vấn
  const confirmUpdateSchedule = async () => {
    setShowConfirmUpdate(false);
    setLoading(true);
    
    try {
      // Xử lý ngày và giờ
      const consultDate = formData.consultDate;
      const consultTime = formData.consultTime;
      
      // Kết hợp ngày và giờ thành một chuỗi ISO
      const consultDateTime = new Date(`${consultDate}T${consultTime}`).toISOString();
      
      // Đảm bảo ID là số nguyên
      const scheduleIdNum = parseInt(formData.consultationScheduleId);
      if (isNaN(scheduleIdNum)) {
        throw new Error("ID lịch tư vấn không hợp lệ");
      }
      
      // Tìm studentId từ tên học sinh đã nhập
      let studentId = formData.studentId;
      if (!studentId && formData.studentSearchTerm) {
        const foundStudent = students.find(s => 
          s.fullName === formData.studentSearchTerm || 
          formData.studentSearchTerm.includes(`ID: ${s.studentId}`)
        );
        if (foundStudent) {
          studentId = foundStudent.studentId;
        } else {
          throw new Error("Không tìm thấy học sinh. Vui lòng chọn học sinh từ danh sách.");
        }
      }
      
      // Tìm nurseId từ tên y tá đã nhập
      let nurseId = formData.nurseId;
      if (!nurseId && formData.nurseSearchTerm) {
        const foundNurse = nurses.find(n => 
          n.fullName === formData.nurseSearchTerm || 
          formData.nurseSearchTerm.includes(`ID: ${n.nurseId}`)
        );
        if (foundNurse) {
          nurseId = foundNurse.nurseId;
        } else {
          throw new Error("Không tìm thấy y tá. Vui lòng chọn y tá từ danh sách.");
        }
      }
      
      // Tìm parentId từ danh sách học sinh nếu có
      let parentId = formData.parentId;
      if (!parentId && studentId) {
        try {
          // Tìm thông tin học sinh để lấy parentId
          const studentInfo = await API_SERVICE.studentAPI.getById(studentId);
          if (studentInfo && studentInfo.parentId) {
            parentId = studentInfo.parentId;
          }
        } catch (err) {
          console.warn("Could not fetch student info for parent ID:", err);
        }
      }
      
      // Chuẩn bị dữ liệu để gửi
      const scheduleData = {
        consultationScheduleId: scheduleIdNum,
        consultDate: consultDateTime,
        studentId: parseInt(studentId),
        nurseId: parseInt(nurseId),
        location: formData.location,
        parentId: parentId ? parseInt(parentId) : null
      };
      
      console.log("Updating schedule with data:", scheduleData);
      
      // Gọi API để cập nhật lịch tư vấn
      const response = await API_SERVICE.consultationScheduleAPI.update(scheduleIdNum, scheduleData);
      console.log("Schedule update response:", response);
      
      // Nếu có form tư vấn và có parentId
      if (formData.showFormSection && formData.formId && parentId) {
        try {
          // Chuẩn bị dữ liệu form
          const formDataToSubmit = {
            consultationFormId: parseInt(formData.formId),
            consultationScheduleId: scheduleIdNum,
            title: formData.formTitle,
            content: formData.formContent,
            status: 0, // Đặt lại trạng thái thành Pending
            nurseId: parseInt(nurseId),
            studentId: parseInt(studentId),
            parentId: parseInt(parentId)
          };
          
          console.log("Updating form with data:", formDataToSubmit);
          
          // Gọi API để cập nhật form tư vấn
          const formResponse = await API_SERVICE.consultationFormAPI.update(formData.formId, formDataToSubmit);
          console.log("Form update response:", formResponse);
        } catch (formError) {
          console.error("Error updating consultation form:", formError);
          // Không throw lỗi ở đây vì lịch tư vấn đã được cập nhật thành công
        }
      }
      
      // Gửi thông báo đến phụ huynh nếu có thông tin phụ huynh
      if (parentId) {
        try {
          // Chuẩn bị dữ liệu thông báo
          const notificationTitle = formData.formTitle 
            ? `Cập nhật lịch tư vấn: ${formData.formTitle}`
            : "Cập nhật lịch tư vấn";
          
          // Tạo nội dung thông báo
          const notificationContent = `Lịch tư vấn đã được cập nhật vào ngày ${new Date(consultDateTime).toLocaleDateString('vi-VN')} lúc ${new Date(consultDateTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})} tại ${formData.location}.`;
          
          const notificationData = {
            recipientId: parentId,
            title: notificationTitle,
            content: notificationContent,
            type: "ConsultationSchedule",
            referenceId: scheduleIdNum
          };
          
          console.log("Sending notification:", notificationData);
          
          // Gọi API để gửi thông báo
          const notifResult = await API_SERVICE.notificationAPI.create(notificationData);
          console.log("Notification result:", notifResult);
          
          setNotif({
            message: "Đã cập nhật lịch tư vấn thành công.",
            type: "success"
          });
        } catch (notifError) {
          console.error("Error sending notification:", notifError);
      setNotif({
        message: "Cập nhật lịch tư vấn thành công",
        type: "success"
      });
        }
      } else {
        setNotif({
          message: "Cập nhật lịch tư vấn thành công",
          type: "success"
        });
      }
      
      setShowEditModal(false);
      fetchConsultationSchedules(searchKeyword);
    } catch (error) {
      console.error("Error updating consultation schedule and form:", error);
      setNotif({
        message: "Không thể cập nhật lịch tư vấn: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    setDeleteId(id);
    setShowConfirmDelete(true);
  };

  const confirmDeleteSchedule = async () => {
      setLoading(true);
      try {
      console.log(`Deleting consultation schedule with ID: ${deleteId}`);
      
      // Đảm bảo ID là số nguyên
      const deleteIdNum = parseInt(deleteId);
      if (isNaN(deleteIdNum)) {
        throw new Error("ID lịch tư vấn không hợp lệ");
      }
      
      // Gọi API để xóa lịch tư vấn
      await API_SERVICE.consultationScheduleAPI.delete(deleteIdNum);
      
      // Hiển thị thông báo thành công
        setNotif({
          message: "Xóa lịch tư vấn thành công",
          type: "success"
        });
        
      // Đóng modal và cập nhật danh sách
      setShowConfirmDelete(false);
        fetchConsultationSchedules(searchKeyword);
      } catch (error) {
        console.error("Error deleting consultation schedule:", error);
        setNotif({
          message: "Không thể xóa lịch tư vấn: " + (error.message || "Lỗi không xác định"),
          type: "error"
        });
      } finally {
        setLoading(false);
    }
  };

  const handleView = (schedule) => {
    console.log("Viewing schedule:", schedule);
    setSelectedSchedule(schedule);
    setActiveTab('schedule'); // Reset về tab thông tin lịch
    setShowViewModal(true);
    
    // Tự động tải form tư vấn khi mở modal
    fetchConsultationForm(schedule.consultationScheduleId);
  };
  
  // Hàm lấy danh sách phụ huynh đã được định nghĩa ở trên
  
  const fetchConsultationForm = async (scheduleId, showModal = false) => {
    setLoading(true);
    try {
      console.log("Fetching consultation form for schedule ID:", scheduleId);
      
      // Hiển thị modal nếu được yêu cầu
      if (showModal) {
        setShowFormModal(true);
      }
      
      // Lấy thông tin lịch tư vấn
      const schedule = schedules.find(s => s.consultationScheduleId === scheduleId);
      console.log("Schedule details:", schedule);
      
      // Biến lưu form tư vấn
      let matchingForm = null;
      
      // Thử nhiều cách để lấy form tư vấn
      try {
        // Cách 1: Thử lấy form theo ID của form (nếu trùng với ID lịch)
        console.log(`Trying to get form directly with ID: ${scheduleId}`);
        try {
          const directForm = await API_SERVICE.consultationFormAPI.getById(scheduleId);
          console.log("Direct form by ID:", directForm);
          if (directForm && !directForm.error) {
            matchingForm = directForm;
          }
        } catch (directError) {
          console.log("Could not get form directly by ID:", directError);
        }
        
        // Cách 2: Nếu không tìm thấy và có studentId, thử lấy form theo studentId
        if (!matchingForm && schedule && schedule.studentId) {
          try {
            console.log(`Trying to find form by student ID: ${schedule.studentId}`);
            const studentForms = await API_SERVICE.consultationFormAPI.getByStudent(schedule.studentId);
            console.log("Forms by student:", studentForms);
            
            if (Array.isArray(studentForms) && studentForms.length > 0) {
              // Tìm form có consultationScheduleId khớp với scheduleId
              matchingForm = studentForms.find(form => {
                const formSchedule = form.consultationSchedule;
                return formSchedule && formSchedule.consultationScheduleId === scheduleId;
              });
              
              // Nếu không tìm thấy theo consultationSchedule, thử tìm theo consultationScheduleId
              if (!matchingForm) {
                matchingForm = studentForms.find(form => form.consultationScheduleId === scheduleId);
              }
            }
          } catch (studentError) {
            console.log("Error getting forms by student:", studentError);
          }
        }
        
        // Cách 3: Nếu có parentId, thử lấy form theo parentId
        if (!matchingForm && schedule && schedule.parentId) {
          try {
            console.log(`Trying to find form by parent ID: ${schedule.parentId}`);
            const parentForms = await API_SERVICE.consultationFormAPI.getByParent(schedule.parentId);
            console.log("Forms by parent:", parentForms);
            
            if (Array.isArray(parentForms) && parentForms.length > 0) {
              // Tìm form có consultationScheduleId khớp với scheduleId
              matchingForm = parentForms.find(form => {
                const formSchedule = form.consultationSchedule;
                return formSchedule && formSchedule.consultationScheduleId === scheduleId;
              });
              
              // Nếu không tìm thấy theo consultationSchedule, thử tìm theo consultationScheduleId
              if (!matchingForm) {
                matchingForm = parentForms.find(form => form.consultationScheduleId === scheduleId);
              }
            }
          } catch (parentError) {
            console.log("Error getting forms by parent:", parentError);
          }
        }
      } catch (error) {
        console.log("All attempts to get consultation form failed:", error);
      }
      
      // Khai báo các biến để lưu thông tin
      let studentName = "";
      let studentId = null;
      let nurseName = "";
      let nurseId = null;
      let parentName = "";
      let parentId = null;
      
      if (matchingForm) {
        console.log("Found matching consultation form:", matchingForm);
        
        // Lưu ID của các đối tượng liên quan
        studentId = matchingForm.studentId || (schedule ? schedule.studentId : null);
        nurseId = matchingForm.nurseId || (schedule ? schedule.nurseId : null);
        parentId = matchingForm.parentId || (schedule && schedule.parentId ? schedule.parentId : null);
        
        // Tìm thông tin học sinh
        if (studentId) {
          try {
            const studentIdInt = parseInt(studentId);
            if (!isNaN(studentIdInt)) {
              console.log(`Fetching student with ID ${studentIdInt}`);
              const studentResponse = await API_SERVICE.studentAPI.getById(studentIdInt);
              console.log(`Student response:`, studentResponse);
              
              if (studentResponse) {
                studentName = studentResponse.fullName || `${studentResponse.firstName || ''} ${studentResponse.lastName || ''}`.trim();
              }
            }
          } catch (studentError) {
            console.error("Error fetching student info:", studentError);
            studentName = `ID: ${studentId}`;
          }
        }
        
        // Tìm thông tin y tá phụ trách
        if (nurseId) {
          try {
            const nurseIdInt = parseInt(nurseId);
            if (!isNaN(nurseIdInt)) {
              console.log(`Fetching nurse with ID ${nurseIdInt}`);
              const nurseResponse = await API_SERVICE.nurseAPI.getById(nurseIdInt);
              console.log(`Nurse response:`, nurseResponse);
              
                if (nurseResponse) {
                  nurseName = nurseResponse.fullName || `${nurseResponse.firstName || ''} ${nurseResponse.lastName || ''}`.trim();
              }
                }
              } catch (nurseError) {
            console.error("Error fetching nurse info:", nurseError);
            nurseName = `ID: ${nurseId}`;
          }
        }
        
        // Tìm thông tin phụ huynh từ parentId
        if (parentId) {
          try {
            const parentIdInt = parseInt(parentId);
            if (!isNaN(parentIdInt)) {
              console.log(`Fetching parent with ID ${parentIdInt}`);
              const parentResponse = await API_SERVICE.parentAPI.getById(parentIdInt);
              console.log(`Parent response:`, parentResponse);
              
            if (parentResponse) {
              parentName = parentResponse.fullName || `${parentResponse.firstName || ''} ${parentResponse.lastName || ''}`.trim();
            }
          }
        } catch (parentError) {
          console.error("Error fetching parent info:", parentError);
            parentName = `ID: ${parentId}`;
          }
        }
        
        // Cập nhật state với dữ liệu từ API và thông tin phụ huynh/y tá/học sinh
        const formData = {
          ...matchingForm,
          studentId: studentId,
          nurseId: nurseId,
          parentId: parentId,
          studentName: studentName || (studentId ? `ID: ${studentId}` : "Không có"),
          parentName: parentName || (parentId ? `ID: ${parentId}` : "Không có"),
          nurseName: nurseName || (nurseId ? `ID: ${nurseId}` : "Không có"),
          // Đảm bảo các trường dữ liệu quan trọng
          consultationScheduleId: scheduleId
        };
        
        // Lưu thông tin debug vào console nhưng không hiển thị trên UI
        console.debug("Form data debug info:", {
          matchMethod: "found",
          originalForm: { ...matchingForm },
          schedule: schedule ? { ...schedule } : null,
          enhancedData: {
            studentName,
            studentId,
            nurseName,
            nurseId,
            parentName,
            parentId
          }
        });
        
        setConsultationForm(formData);
      } else {
        console.log("No matching consultation form found, creating a placeholder");
        
        // Nếu không tìm thấy form, tạo một form tạm thời với thông tin từ lịch tư vấn
        studentName = "";
        studentId = schedule ? schedule.studentId : null;
        parentName = "";
        parentId = null;
        nurseName = "";
        nurseId = schedule ? schedule.nurseId : null;
        
        // Lấy thông tin học sinh
        if (studentId) {
          try {
            const student = await API_SERVICE.studentAPI.getById(studentId);
            if (student) {
              studentName = student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim();
              
              // Lấy thông tin phụ huynh từ học sinh
              // Kiểm tra nếu student có thuộc tính parent trực tiếp
              if (student.parent && student.parent.parentId) {
                parentId = parseInt(student.parent.parentId);
                parentName = student.parent.fullName || `${student.parent.firstName || ''} ${student.parent.lastName || ''}`.trim();
                console.log(`Found parent info directly from student object: ${parentName} (ID: ${parentId})`);
              } 
              // Nếu không có parent trực tiếp nhưng có parentId
              else if (student.parentId) {
                parentId = parseInt(student.parentId);
                if (!isNaN(parentId)) {
                  try {
                    console.log(`Fetching parent info for ID ${parentId}`);
                    const parent = await API_SERVICE.parentAPI.getById(parentId);
                    console.log(`Parent API response:`, parent);
                    if (parent) {
                      parentName = parent.fullName || `${parent.firstName || ''} ${parent.lastName || ''}`.trim();
                      console.log(`Found parent from API: ${parentName} (ID: ${parentId})`);
                    }
                  } catch (parentError) {
                    console.error("Error fetching parent info:", parentError);
                    parentName = `ID: ${parentId}`;
                  }
                }
              }
            }
          } catch (studentError) {
            console.error("Error fetching student info:", studentError);
            studentName = `ID: ${studentId}`;
          }
        }
        
        // Tìm thông tin y tá
        if (nurseId) {
          try {
            const nurse = await API_SERVICE.nurseAPI.getById(nurseId);
            if (nurse) {
              nurseName = nurse.fullName || `${nurse.firstName || ''} ${nurse.lastName || ''}`.trim();
            }
          } catch (nurseError) {
            console.error("Error fetching nurse info:", nurseError);
            nurseName = `ID: ${nurseId}`;
          }
        }
        
        // Tạo form tạm thời
        const placeholderForm = {
            consultationFormId: null,
            consultationScheduleId: scheduleId,
          title: schedule ? `Tư vấn ngày ${new Date(schedule.consultDate).toLocaleDateString('vi-VN')}` : "Form tư vấn mới",
          content: "",
          status: 0,
          studentId: studentId,
          studentName: studentName || (studentId ? `ID: ${studentId}` : "Không có"),
          nurseId: nurseId,
          nurseName: nurseName || (nurseId ? `ID: ${nurseId}` : "Không có"),
          parentId: parentId,
          parentName: parentName || (parentId ? `ID: ${parentId}` : "Không có"),
          createdDate: new Date().toISOString()
        };
        
        console.debug("Placeholder form data:", placeholderForm);
        
        setConsultationForm(placeholderForm);
      }
    } catch (error) {
      console.error("Error fetching consultation form:", error);
      setNotif({
        message: "Không thể tải thông tin form tư vấn: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (schedule) => {
    setSelectedSchedule(schedule);
    setLoading(true);
    
    try {
      // Lấy thông tin học sinh
      let studentName = schedule.studentName || "";
      let parentId = "";
      let parentName = "";
      let hasParentInfo = false;
      
      if (schedule.studentId) {
        // Tìm học sinh trong danh sách đã tải
        const student = students.find(s => s.studentId === schedule.studentId);
        
        if (student) {
          studentName = student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim();
          
          // Kiểm tra thông tin phụ huynh
          if (student.parent) {
            parentId = student.parent.parentId;
            parentName = student.parent.fullName || `${student.parent.firstName || ''} ${student.parent.lastName || ''}`.trim();
            hasParentInfo = true;
          } else if (student.parentId) {
            parentId = student.parentId;
            
            // Tìm phụ huynh trong danh sách đã tải
            const parent = parents.find(p => p.parentId === parseInt(student.parentId));
            if (parent) {
              parentName = parent.fullName || `${parent.firstName || ''} ${parent.lastName || ''}`.trim();
              hasParentInfo = true;
            } else {
              // Nếu không tìm thấy trong danh sách, thử tải từ API
              try {
                const parentResponse = await API_SERVICE.parentAPI.getById(parseInt(student.parentId));
                if (parentResponse) {
                  parentName = parentResponse.fullName || `${parentResponse.firstName || ''} ${parentResponse.lastName || ''}`.trim();
                  hasParentInfo = true;
                }
              } catch (error) {
                console.error("Error fetching parent info:", error);
              }
            }
          }
        }
      }
      
      // Chuyển đổi ngày và giờ từ consultDate
      let consultDate = new Date().toISOString().split('T')[0];
      let consultTime = "08:00";
      
      if (schedule.consultDate) {
        const date = new Date(schedule.consultDate);
        if (!isNaN(date)) {
          consultDate = date.toISOString().split('T')[0];
          consultTime = date.toTimeString().substring(0, 5);
        }
      }
      
      // Kiểm tra xem có form tư vấn liên quan không
      let formId = null;
      let formTitle = "";
      let formContent = "";
      let formStatus = undefined;
      
      try {
        // Lấy form tư vấn theo ID lịch tư vấn
        const scheduleId = parseInt(schedule.consultationScheduleId);
        if (!isNaN(scheduleId)) {
          // Thử tìm form theo studentId
          if (schedule.studentId) {
            try {
              console.log(`Trying to find form by student ID: ${schedule.studentId}`);
              const studentForms = await API_SERVICE.consultationFormAPI.getByStudent(schedule.studentId);
              console.log("Forms by student:", studentForms);
              
              if (Array.isArray(studentForms) && studentForms.length > 0) {
                // Tìm form có consultationScheduleId khớp với scheduleId
                const matchingForm = studentForms.find(form => 
                  form.consultationScheduleId === scheduleId || 
                  (form.consultationSchedule && form.consultationSchedule.consultationScheduleId === scheduleId)
                );
                
                if (matchingForm) {
                  formId = matchingForm.consultationFormId;
                  formTitle = matchingForm.title || "";
                  formContent = matchingForm.content || "";
                  formStatus = matchingForm.status;
                  console.log("Found existing form by student:", matchingForm);
                }
              }
            } catch (studentError) {
              console.error("Error getting forms by student:", studentError);
            }
          }
          
          // Nếu không tìm thấy và có thông tin phụ huynh, thử tìm theo parentId
          if (!formId && parentId) {
            try {
              console.log(`Trying to find form by parent ID: ${parentId}`);
              const parentForms = await API_SERVICE.consultationFormAPI.getByParent(parentId);
              console.log("Forms by parent:", parentForms);
              
              if (Array.isArray(parentForms) && parentForms.length > 0) {
                // Tìm form có consultationScheduleId khớp với scheduleId
                const matchingForm = parentForms.find(form => 
                  form.consultationScheduleId === scheduleId || 
                  (form.consultationSchedule && form.consultationSchedule.consultationScheduleId === scheduleId)
                );
                
                if (matchingForm) {
                  formId = matchingForm.consultationFormId;
                  formTitle = matchingForm.title || "";
                  formContent = matchingForm.content || "";
                  formStatus = matchingForm.status;
                  console.log("Found existing form by parent:", matchingForm);
                }
              }
            } catch (parentError) {
              console.error("Error getting forms by parent:", parentError);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching consultation form:", error);
      }
      
      // Cập nhật formData với thông tin lịch tư vấn và form
    setFormData({
        consultationScheduleId: schedule.consultationScheduleId,
      studentId: schedule.studentId || "",
        studentName,
        nurseId: schedule.nurseId || localStorage.getItem("userId") || "",
        parentId,
        parentName,
        hasParentInfo,
        consultDate,
        consultTime,
        location: schedule.location || "",
        formId,
        formTitle,
        formContent,
        formStatus,
        sendNotification: true,
        showFormSection: !!formId // Hiển thị phần form nếu đã có form
    });
    
    setShowEditModal(true);
    } catch (error) {
      console.error("Error preparing edit form:", error);
      setNotif({
        message: "Không thể tải thông tin lịch tư vấn: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStudentNameById = (studentId) => {
    if (!studentId) return "Không xác định";
    
    const student = students.find(s => String(s.studentId) === String(studentId));
    return student ? student.fullName || "Không có tên" : `ID: ${studentId}`;
  };

  const getNurseNameById = (nurseId) => {
    if (!nurseId) return "Không xác định";
    
    // Tìm trong danh sách đã tải
          const nurse = nurses.find(n => String(n.nurseId) === String(nurseId));
      if (nurse) {
        return nurse.fullName || "Không có tên" || `ID: ${nurseId}`;
      }
    
    return `ID: ${nurseId}`;
  };

  const handleUpdateForm = async (e) => {
    e.preventDefault();
    if (!editFormData) return;
    
    setLoading(true);
    try {
      console.log("Updating form with data:", editFormData);
      
      // Đảm bảo ID là số nguyên
      const formId = parseInt(editFormData.consultationFormId);
      if (isNaN(formId)) {
        throw new Error("ID form tư vấn không hợp lệ");
      }
      
      // Chuẩn bị dữ liệu form
      const formDataToSubmit = {
        consultationFormId: formId,
        consultationScheduleId: parseInt(editFormData.consultationScheduleId),
        title: editFormData.title,
        content: editFormData.content,
        // Nếu form đã được phụ huynh phản hồi (chấp nhận/từ chối), đặt lại trạng thái thành "Đang chờ"
        status: (editFormData.status === 1 || editFormData.status === "Accepted" || 
                editFormData.status === 2 || editFormData.status === "Rejected") ? 0 : editFormData.status,
        nurseId: editFormData.nurseId ? parseInt(editFormData.nurseId) : null,
        studentId: editFormData.studentId ? parseInt(editFormData.studentId) : null,
        parentId: editFormData.parentId ? parseInt(editFormData.parentId) : null,
        lastModified: new Date().toISOString(),
        modifiedBy: localStorage.getItem("userId") || ""
      };
      
      // Gọi API để cập nhật form tư vấn
      const response = await API_SERVICE.consultationFormAPI.update(formId, formDataToSubmit);
      console.log("Form API response:", response);
      
      // Gửi thông báo đến phụ huynh nếu có thông tin phụ huynh
      if (editFormData.parentId) {
        try {
          console.log("Sending notification to parent ID:", editFormData.parentId);
          
          const notificationResponse = await API_SERVICE.notificationAPI.create({
            recipientId: parseInt(editFormData.parentId),
            title: `Cập nhật form tư vấn: ${editFormData.title}`,
            content: `Form tư vấn "${editFormData.title}" đã được cập nhật bởi y tá.`,
            type: "ConsultationForm",
            referenceId: formId
          });
          
          console.log("Notification response:", notificationResponse);
        } catch (notifError) {
          console.error("Error sending notification:", notifError);
          // Không báo lỗi cho người dùng vì đây chỉ là tính năng phụ
        }
      }
      
      // Hiển thị thông báo thành công
        setNotif({
          message: "Cập nhật form tư vấn thành công",
          type: "success"
        });
      
      // Đóng modal và cập nhật danh sách
      setShowEditFormModal(false);
      fetchConsultationForm(editFormData.consultationScheduleId);
    } catch (error) {
      console.error("Error updating consultation form:", error);
      setNotif({
        message: "Không thể cập nhật form tư vấn: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi người dùng chọn một học sinh từ dropdown
  const handleSelectStudent = (student) => {
    console.log("Selected student:", student);
    
    // Lưu thông tin học sinh đã chọn và cập nhật form data
    setFormData(prev => ({
      ...prev,
      studentId: student.studentId,
      studentSearchTerm: `${student.fullName} (ID: ${student.studentId})`,
    }));
    
    // Kiểm tra và lấy thông tin phụ huynh
    if (student.parentId) {
      // Nếu thông tin parentId có sẵn trong đối tượng student
      console.log("Parent ID found directly from student selection:", student.parentId);
      setFormData(prev => ({
        ...prev,
        parentId: student.parentId,
        parentName: student.parentName || ""
      }));
    } else if (student.parent) {
      // Nếu có đối tượng parent lồng trong student
      console.log("Parent found in nested object:", student.parent);
      setFormData(prev => ({
        ...prev,
        parentId: student.parent.parentId,
        parentName: student.parent.fullName || ""
      }));
    } else {
      // Nếu không có thông tin phụ huynh, thử lấy thông tin chi tiết của học sinh
      fetchStudentDetails(student.studentId);
    }
    
    setFilteredStudents([]);
    setShowStudentDropdown(false);
  };
  
  // Thêm hàm mới để lấy thông tin chi tiết của học sinh bao gồm parentId
  const fetchStudentDetails = async (studentId) => {
    try {
      console.log("Fetching details for student ID:", studentId);
      const studentDetails = await API_SERVICE.studentAPI.getById(studentId);
      console.log("Fetched student details:", studentDetails);
      
      let parentId = null;
      let parentName = "";
      
      // Kiểm tra các trường hợp khác nhau để lấy parentId
      if (studentDetails) {
        if (studentDetails.parentId) {
          // Trường hợp 1: parentId có sẵn trong đối tượng student
          parentId = studentDetails.parentId;
          console.log("Parent ID found directly in student object:", parentId);
          
          // Thử lấy tên phụ huynh nếu có
          if (studentDetails.parent && studentDetails.parent.fullName) {
            parentName = studentDetails.parent.fullName;
          }
        } else if (studentDetails.parent) {
          // Trường hợp 2: Có đối tượng parent lồng trong student
          parentId = studentDetails.parent.parentId;
          parentName = studentDetails.parent.fullName || "";
          console.log("Parent ID found in nested parent object:", parentId);
        }
        
        if (parentId) {
          // Cập nhật parentId trong formData
          setFormData(prev => ({
            ...prev,
            parentId: parentId,
            parentName: parentName
          }));
        } else {
          console.warn("No parent ID found in student details");
          
          // Thử tìm phụ huynh từ API khác
          try {
            const parentData = await API_SERVICE.parentAPI.search({ studentId: parseInt(studentId) });
            console.log("Parent search result:", parentData);
            
            if (Array.isArray(parentData) && parentData.length > 0) {
              const foundParent = parentData[0];
              setFormData(prev => ({
                ...prev,
                parentId: foundParent.parentId,
                parentName: foundParent.fullName || ""
              }));
              console.log("Parent ID found from parent search:", foundParent.parentId);
            }
          } catch (parentError) {
            console.error("Error searching for parent:", parentError);
          }
        }
      } else {
        console.warn("No student details returned for ID:", studentId);
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
    }
  };

  // Hàm xử lý khi người dùng chọn một y tá từ dropdown
  const handleSelectNurse = (nurse) => {
    setFormData({
      ...formData,
      nurseId: nurse.nurseId,
      nurseSearchTerm: nurse.fullName || `${nurse.firstName || ''} ${nurse.lastName || ''}`.trim() || `Y tá ID: ${nurse.nurseId}`
    });
    setShowNurseDropdown(false);
  };

  // Thêm CSS cho các badge trạng thái
  const statusStyles = `
    .status-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.9rem;
      font-weight: 500;
      text-align: center;
      width: 100%;
    }
    
    .status-pending {
      background-color: #ffc107;
      color: #000;
    }
    
    .status-accepted {
      background-color: #28a745;
      color: white;
    }
    
    .status-rejected {
      background-color: #dc3545;
      color: white;
    }
    
    .status-container {
      background-color: #e9ecef;
      padding: 2px;
      border-radius: 4px;
    }
    
    .action-buttons {
      display: flex;
      gap: 8px;
      justify-content: center;
    }
    
    .action-buttons button {
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 5px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
    
    .view-btn {
      color: #007bff;
    }
    
    .edit-btn {
      color: #28a745;
    }
    
    .delete-btn {
      color: #dc3545;
    }
    
    .action-buttons button:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    /* CSS cho skeleton loading */
    .skeleton-item {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
      margin-bottom: 8px;
      height: 20px;
    }
    
    .skeleton-title {
      height: 24px;
      width: 50%;
      margin-bottom: 16px;
    }
    
    .skeleton-text {
      height: 16px;
    }
    
    .skeleton-content {
      height: 100px;
      margin-top: 16px;
    }
    
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* CSS cho tabs */
    .tabs-container {
      margin-bottom: 20px;
    }
    
    .tabs-header {
      display: flex;
      border-bottom: 1px solid #dee2e6;
      margin-bottom: 15px;
    }
    
    .tab-button {
      padding: 10px 15px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .tab-button.active {
      border-bottom: 2px solid #007bff;
      color: #007bff;
    }
    
    .tab-button:hover:not(.active) {
      border-bottom: 2px solid #e9ecef;
    }
    
    /* CSS cho spacing */
    .mt-4 {
      margin-top: 1.5rem;
    }
    
    .student-info-section + .student-info-section {
      margin-top: 2rem;
      border-top: 1px solid #dee2e6;
      padding-top: 1.5rem;
    }
  `;

  // Component hiển thị skeleton loading cho form
  const FormSkeleton = () => {
    return (
      <div className="form-skeleton">
        <div className="skeleton-item skeleton-title"></div>
        <div className="info-grid">
          <div className="info-item">
            <label>Form ID:</label>
            <div className="skeleton-item skeleton-text"></div>
          </div>
          <div className="info-item">
            <label>Schedule ID:</label>
            <div className="skeleton-item skeleton-text"></div>
          </div>
          <div className="info-item">
            <label>Phụ huynh:</label>
            <div className="skeleton-item skeleton-text"></div>
          </div>
          <div className="info-item">
            <label>Học sinh:</label>
            <div className="skeleton-item skeleton-text"></div>
          </div>
          <div className="info-item">
            <label>Y tá phụ trách:</label>
            <div className="skeleton-item skeleton-text"></div>
          </div>
          <div className="info-item">
            <label>Tiêu đề:</label>
            <div className="skeleton-item skeleton-text"></div>
          </div>
          <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
            <label>Trạng thái:</label>
            <div className="skeleton-item skeleton-text"></div>
          </div>
          <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
            <label>Nội dung:</label>
            <div className="skeleton-item skeleton-content"></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-main">
      <h2 className="dashboard-title">Lịch tư vấn</h2>
      <div className="admin-header">
        <button className="admin-btn" onClick={openAddModal}>
          <FaPlus /> Thêm lịch tư vấn
        </button>
          <div className="search-container">
            <input
            className="admin-search"
              type="text"
            placeholder="Tìm kiếm..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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

      {/* Phần bộ lọc nâng cao */}
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
            {/* Lọc theo ngày tư vấn */}
            <div>
              <label htmlFor="date" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Ngày tư vấn</label>
              <input
                type="date"
                id="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="form-control"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            
            {/* Lọc theo học sinh */}
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
            
            {/* Lọc theo y tá */}
            <div>
              <label htmlFor="nurseName" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Y tá</label>
              <input
                type="text"
                id="nurseName"
                name="nurseName"
                value={filters.nurseName}
                onChange={handleFilterChange}
                className="form-control"
                placeholder="Nhập tên y tá hoặc ID"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            
            {/* Lọc theo địa điểm */}
            <div>
              <label htmlFor="location" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Địa điểm</label>
              <input
                type="text"
                id="location"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="form-control"
                placeholder="Nhập địa điểm..."
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            
            {/* Lọc theo trạng thái form */}
            <div>
              <label htmlFor="formStatus" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Trạng thái form</label>
              <select
                id="formStatus"
                name="formStatus"
                value={filters.formStatus}
                onChange={handleFilterChange}
                className="form-control"
                style={{ width: '100%', padding: '8px' }}
              >
                <option value="all">Tất cả</option>
                <option value="noform">Chưa có form</option>
                <option value="pending">Đang chờ</option>
                <option value="accepted">Đã chấp nhận</option>
                <option value="rejected">Đã từ chối</option>
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
                <option value="consultationScheduleId">ID</option>
                <option value="studentName">Học sinh</option>
                <option value="nurseName">Y tá</option>
                <option value="location">Địa điểm</option>
                <option value="consultDate">Ngày tư vấn</option>
                <option value="consultTime">Giờ tư vấn</option>
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
            <span>Đang hiển thị: <strong>{filteredSchedules.length}</strong> / {schedules.length} kết quả</span>
          </div>
        </div>
      )}

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
            data={filteredSchedules.length > 0 || Object.values(filters).some(val => val !== "") ? filteredSchedules : schedules}
            pageSize={10}
            page={page}
            onPageChange={setPage}
            renderActions={(row) => (
              <div className="admin-action-group">
                <button
                  className="admin-action-btn admin-action-btn-reset"
                  title="Xem chi tiết"
                  onClick={() => handleView(row)}
                >
                  <FaEye style={iconStyle.view} size={18} />
                </button>
                <button
                  className="admin-action-btn admin-action-btn-reset"
                  title="Chỉnh sửa"
                  onClick={() => handleEdit(row)}
                >
                  <FaEdit style={iconStyle.edit} size={18} />
                </button>
                <button
                  className="admin-action-btn admin-action-btn-reset"
                  title="Xóa"
                  onClick={() => handleDeleteSchedule(row.consultationScheduleId)}
                >
                  <FaTrash style={iconStyle.delete} size={18} />
                </button>
              </div>
            )}
            loading={loading}
          />
        )}
      </div>

      {/* Modal thêm lịch tư vấn */}
      {showAddModal && (
        <div className="student-create-modal-overlay">
          <div className="student-create-modal-content">
            <h3 className="modal-title">Thêm lịch tư vấn mới</h3>
            <form onSubmit={handleAddSchedule}>
              <div className="mb-3">
                <label htmlFor="studentId" className="form-label">Học sinh <span className="text-danger">*</span></label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                  id="studentId"
                    name="studentSearchTerm"
                    value={formData.studentSearchTerm}
                    onChange={handleInputChange}
                    onBlur={() => setTimeout(() => setShowStudentDropdown(false), 200)}
                    onClick={() => setShowStudentDropdown(true)}
                    placeholder="Nhập tên hoặc ID học sinh"
                  required
                  />
                  {showStudentDropdown && filteredStudents.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      zIndex: 1000,
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                      {filteredStudents.map(student => (
                        <div 
                          key={student.studentId} 
                          className="dropdown-item" 
                          style={{ padding: '8px 12px', cursor: 'pointer' }}
                          onClick={() => handleSelectStudent(student)}
                        >
                          {student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || `Học sinh ID: ${student.studentId}`}
                        </div>
                      ))}
              </div>
                )}
                  {showStudentDropdown && filteredStudents.length === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      zIndex: 1000
                    }}>
                      Không tìm thấy học sinh
                  </div>
                )}
              </div>
              </div>
              
              {/* Hiển thị thông tin phụ huynh nếu có */}
              {formData.parentId && (
                <div className="mb-3">
                  <label className="form-label">Thông tin phụ huynh</label>
                  <div className="border rounded p-2 bg-light">
                    {formData.parentName ? (
                      <p className="mb-0">Phụ huynh: {formData.parentName} (ID: {formData.parentId})</p>
                    ) : (
                      <p className="mb-0">ID phụ huynh: {formData.parentId}</p>
                    )}
                    <small className="text-muted">Form tư vấn sẽ được gửi cho phụ huynh này</small>
                  </div>
                </div>
              )}
              
              <div className="mb-3">
                <label htmlFor="consultDate" className="form-label">Ngày tư vấn <span className="text-danger">*</span></label>
                <input
                  type="date"
                  className="form-control"
                  id="consultDate"
                  name="consultDate"
                  value={formData.consultDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="consultTime" className="form-label">Giờ tư vấn <span className="text-danger">*</span></label>
                <input
                  type="time"
                  className="form-control"
                  id="consultTime"
                  name="consultTime"
                  value={formData.consultTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="location" className="form-label">Địa điểm <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập địa điểm tư vấn"
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="nurseId" className="form-label">Y tá phụ trách</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                  id="nurseId"
                    name="nurseSearchTerm"
                    value={formData.nurseSearchTerm}
                  onChange={handleInputChange}
                    onBlur={() => setTimeout(() => setShowNurseDropdown(false), 200)}
                    onClick={() => setShowNurseDropdown(true)}
                    placeholder="Nhập tên hoặc ID y tá"
                  />
                  {showNurseDropdown && filteredNurses.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      zIndex: 1000,
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                      {filteredNurses.map(nurse => (
                        <div 
                          key={nurse.nurseId} 
                          className="dropdown-item" 
                          style={{ padding: '8px 12px', cursor: 'pointer' }}
                          onClick={() => handleSelectNurse(nurse)}
                        >
                          {nurse.fullName || `${nurse.firstName || ''} ${nurse.lastName || ''}`.trim() || `Y tá ID: ${nurse.nurseId}`}
                        </div>
                  ))}
                    </div>
                  )}
                  {showNurseDropdown && filteredNurses.length === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      zIndex: 1000
                    }}>
                      Không tìm thấy y tá
                    </div>
                  )}
                </div>
              </div>
              
              {/* Thông tin form tư vấn - luôn hiển thị */}
              <div className="border rounded p-3 mb-3 bg-light">
                <h5 className="mb-3">Thông tin form tư vấn</h5>
                
                <div className="mb-3">
                  <label htmlFor="formTitle" className="form-label">Tiêu đề form tư vấn <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="formTitle"
                    name="formTitle"
                    value={formData.formTitle || ""}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập tiêu đề form tư vấn"
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="formContent" className="form-label">Nội dung tư vấn <span className="text-danger">*</span></label>
                  <textarea
                    className="form-control"
                    id="formContent"
                    name="formContent"
                    value={formData.formContent || ""}
                    onChange={handleInputChange}
                    rows={5}
                    required
                    placeholder="Nhập nội dung chi tiết về buổi tư vấn"
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Đang thêm..." : "Thêm mới"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
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

      {/* Modal xem chi tiết lịch tư vấn */}
      {showViewModal && selectedSchedule && (
        <div className="student-dialog-overlay">
          <div className="student-dialog-content" style={{ width: '700px', maxWidth: '90%' }}>
            <div className="student-dialog-header">
              <h2>Chi tiết lịch tư vấn</h2>
              <button className="student-dialog-close" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="student-dialog-body">
              {/* Thông tin lịch tư vấn */}
              <div className="student-info-section">
                <h3>Thông tin lịch tư vấn</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>ID lịch tư vấn:</label>
                    <span>{selectedSchedule.consultationScheduleId}</span>
                  </div>
                  <div className="info-item">
                    <label>Học sinh:</label>
                    <span>{selectedSchedule.studentName || getStudentNameById(selectedSchedule.studentId) || "Không có"} (ID: {selectedSchedule.studentId || "N/A"})</span>
                  </div>
                  <div className="info-item">
                    <label>Y tá phụ trách:</label>
                    <span>{selectedSchedule.nurseName || getNurseNameById(selectedSchedule.nurseId) || "Chưa phân công"} (ID: {selectedSchedule.nurseId || "N/A"})</span>
                  </div>
                  <div className="info-item">
                    <label>Phụ huynh:</label>
                    <span>{selectedSchedule.parentName || "Không có thông tin"} (ID: {selectedSchedule.parentId || "N/A"})</span>
                  </div>
                  <div className="info-item">
                    <label>Ngày tư vấn:</label>
                    <span>{selectedSchedule.consultDate ? new Date(selectedSchedule.consultDate).toLocaleDateString('vi-VN') : "Không có"}</span>
                  </div>
                  <div className="info-item">
                    <label>Giờ tư vấn:</label>
                    <span>{selectedSchedule.consultTime || (selectedSchedule.consultDate ? new Date(selectedSchedule.consultDate).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'}) : "Không có")}</span>
                  </div>
                  <div className="info-item">
                    <label>Địa điểm:</label>
                    <span>{selectedSchedule.location || "Không có"}</span>
                  </div>
                </div>
              </div>

              {/* Thông tin form tư vấn */}
              <div className="student-info-section mt-4">
                <h3>Thông tin form tư vấn</h3>
                {loading ? (
                  <FormSkeleton />
                ) : consultationForm ? (
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Form ID:</label>
                      <span>{consultationForm.consultationFormId}</span>
                    </div>
                    <div className="info-item">
                      <label>Tiêu đề:</label>
                      <span>{consultationForm.title || "Không có tiêu đề"}</span>
                    </div>
                    <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                      <label>Trạng thái:</label>
                      <span>
                        {consultationForm.status === 0 || consultationForm.status === "Pending" ? "Đang chờ" :
                        consultationForm.status === 1 || consultationForm.status === "Accepted" ? "Đã chấp nhận" :
                        consultationForm.status === 2 || consultationForm.status === "Rejected" ? "Đã từ chối" : 
                          consultationForm.status || "Không xác định"}
                      </span>
                    </div>
                    <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                      <label>Nội dung:</label>
                      <div style={{ 
                        padding: "15px", 
                        backgroundColor: "#f8f9fa", 
                        borderRadius: "5px", 
                        marginTop: "10px", 
                        whiteSpace: "pre-wrap",
                        border: "1px solid #dee2e6",
                        minHeight: "100px"
                      }}>
                        {consultationForm.content || "Không có nội dung"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <p>Không tìm thấy thông tin form tư vấn.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="student-dialog-footer">
              <button className="admin-btn" style={{ background: '#6c757d' }} onClick={() => setShowViewModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Modal chỉnh sửa lịch tư vấn */}
      {showEditModal && selectedSchedule && (
        <div className="student-create-modal-overlay">
          <div className="student-create-modal-content">
            <h3 className="modal-title">Chỉnh sửa lịch tư vấn</h3>
            <form onSubmit={handleUpdateSchedule}>
              <div className="mb-3">
                <label htmlFor="edit-studentId" className="form-label">Học sinh <span className="text-danger">*</span></label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                  id="edit-studentId"
                    name="studentSearchTerm"
                    value={formData.studentSearchTerm}
                    onChange={handleInputChange}
                    onBlur={() => setTimeout(() => setShowStudentDropdown(false), 200)}
                    onClick={() => setShowStudentDropdown(true)}
                    placeholder="Nhập tên hoặc ID học sinh"
                  required
                  />
                  {showStudentDropdown && filteredStudents.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      zIndex: 1000,
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                      {filteredStudents.map(student => (
                        <div 
                          key={student.studentId} 
                          className="dropdown-item" 
                          style={{ padding: '8px 12px', cursor: 'pointer' }}
                          onClick={() => handleSelectStudent(student)}
                        >
                          {student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || `Học sinh ID: ${student.studentId}`}
                        </div>
                      ))}
              </div>
                )}
                  {showStudentDropdown && filteredStudents.length === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      zIndex: 1000
                    }}>
                      Không tìm thấy học sinh
                  </div>
                )}
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="edit-consultDate" className="form-label">Ngày tư vấn <span className="text-danger">*</span></label>
                <input
                  type="date"
                  className="form-control"
                  id="edit-consultDate"
                  name="consultDate"
                  value={formData.consultDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="edit-consultTime" className="form-label">Giờ tư vấn <span className="text-danger">*</span></label>
                <input
                  type="time"
                  className="form-control"
                  id="edit-consultTime"
                  name="consultTime"
                  value={formData.consultTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="edit-location" className="form-label">Địa điểm <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  id="edit-location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập địa điểm tư vấn"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="edit-nurseId" className="form-label">Y tá phụ trách</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                  id="edit-nurseId"
                    name="nurseSearchTerm"
                    value={formData.nurseSearchTerm}
                  onChange={handleInputChange}
                    onBlur={() => setTimeout(() => setShowNurseDropdown(false), 200)}
                    onClick={() => setShowNurseDropdown(true)}
                    placeholder="Nhập tên hoặc ID y tá"
                  />
                  {showNurseDropdown && filteredNurses.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      zIndex: 1000,
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                      {filteredNurses.map(nurse => (
                        <div 
                          key={nurse.nurseId} 
                          className="dropdown-item" 
                          style={{ padding: '8px 12px', cursor: 'pointer' }}
                          onClick={() => handleSelectNurse(nurse)}
                        >
                          {nurse.fullName || `${nurse.firstName || ''} ${nurse.lastName || ''}`.trim() || `Y tá ID: ${nurse.nurseId}`}
                        </div>
                  ))}
                    </div>
                  )}
                  {showNurseDropdown && filteredNurses.length === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      zIndex: 1000
                    }}>
                      Không tìm thấy y tá
                    </div>
                  )}
                </div>
              </div>
              
              {/* Thông tin form tư vấn */}
                <div className="border rounded p-3 mb-3 bg-light">
                  <h5 className="mb-3">Thông tin form tư vấn</h5>
                  
                  {/* Hiển thị trạng thái form nếu đã có form */}
                  {formData.formId && formData.formStatus !== undefined && (
                    <div className="mb-3">
                      <label className="form-label">Trạng thái hiện tại:</label>
                      <div className="form-text">
                        <span className={`badge ${
                          formData.formStatus === 0 || formData.formStatus === "Pending" ? "bg-warning" :
                          formData.formStatus === 1 || formData.formStatus === "Accepted" ? "bg-success" :
                          formData.formStatus === 2 || formData.formStatus === "Rejected" ? "bg-danger" : "bg-secondary"
                        }`}>
                          {formData.formStatus === 0 || formData.formStatus === "Pending" ? "Đang chờ" :
                           formData.formStatus === 1 || formData.formStatus === "Accepted" ? "Đã chấp nhận" :
                           formData.formStatus === 2 || formData.formStatus === "Rejected" ? "Đã từ chối" : 
                           formData.formStatus || "Không xác định"}
                        </span>
                        {(formData.formStatus === 1 || formData.formStatus === "Accepted" || 
                          formData.formStatus === 2 || formData.formStatus === "Rejected") && (
                          <div className="alert alert-info mt-2">
                            <small>
                              <strong>Lưu ý:</strong> Form này đã được phụ huynh {
                                formData.formStatus === 1 || formData.formStatus === "Accepted" ? "chấp nhận" : "từ chối"
                              }. Việc chỉnh sửa sẽ tạo phiên bản mới và yêu cầu phụ huynh xem xét lại.
                            </small>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <label htmlFor="edit-formTitle" className="form-label">Tiêu đề form tư vấn <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      id="edit-formTitle"
                      name="formTitle"
                      value={formData.formTitle || ""}
                      onChange={handleInputChange}
                      required={formData.showFormSection}
                      placeholder="Nhập tiêu đề form tư vấn"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="edit-formContent" className="form-label">Nội dung tư vấn <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      id="edit-formContent"
                      name="formContent"
                      value={formData.formContent || ""}
                      onChange={handleInputChange}
                      rows={5}
                      required={formData.showFormSection}
                      placeholder="Nhập nội dung chi tiết về buổi tư vấn"
                    ></textarea>
                  </div>
                </div>
              
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Đang cập nhật..." : "Cập nhật"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
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

      {/* Modal xác nhận xóa lịch tư vấn */}
      {showConfirmDelete && deleteId && (
        <div className="student-delete-modal-overlay">
          <div className="student-delete-modal-content">
            <div className="student-delete-modal-title">
              <strong>Xác nhận xóa lịch tư vấn?</strong>
            </div>
            <div className="student-delete-modal-actions">
              <button
                className="btn btn-danger"
                onClick={confirmDeleteSchedule}
                disabled={loading}
              >
                {loading ? "Đang xóa..." : "Xóa"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmDelete(false)}
                disabled={loading}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa form tư vấn */}
      {showEditFormModal && editFormData && (
        <div className="student-dialog-overlay">
          <div className="student-dialog-content" style={{ width: '700px', maxWidth: '90%' }}>
            <div className="student-dialog-header">
              <h2>Chỉnh sửa form tư vấn</h2>
              <button className="student-dialog-close" onClick={() => setShowEditFormModal(false)}>×</button>
            </div>
            <div className="student-dialog-body">
              <form onSubmit={handleUpdateForm}>
                <div className="mb-3">
                  <label htmlFor="form-title" className="form-label">Tiêu đề form tư vấn <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="form-title"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="form-content" className="form-label">Nội dung tư vấn <span className="text-danger">*</span></label>
                  <textarea
                    className="form-control"
                    id="form-content"
                    value={editFormData.content}
                    onChange={(e) => setEditFormData({...editFormData, content: e.target.value})}
                    rows={8}
                    required
                  ></textarea>
                </div>
                
                {editFormData.status !== undefined && (
                  <div className="mb-3">
                    <label className="form-label">Trạng thái hiện tại:</label>
                    <div className="form-text">
                      <span className={`badge ${
                        editFormData.status === 0 || editFormData.status === "Pending" ? "bg-warning" :
                        editFormData.status === 1 || editFormData.status === "Accepted" ? "bg-success" :
                        editFormData.status === 2 || editFormData.status === "Rejected" ? "bg-danger" : "bg-secondary"
                      }`}>
                        {editFormData.status === 0 || editFormData.status === "Pending" ? "Đang chờ" :
                         editFormData.status === 1 || editFormData.status === "Accepted" ? "Đã chấp nhận" :
                         editFormData.status === 2 || editFormData.status === "Rejected" ? "Đã từ chối" : 
                         editFormData.status || "Không xác định"}
                      </span>
                      {(editFormData.status === 1 || editFormData.status === "Accepted" || 
                        editFormData.status === 2 || editFormData.status === "Rejected") && (
                        <div className="alert alert-info mt-2">
                          <small>
                            <strong>Lưu ý:</strong> Form này đã được phụ huynh {
                              editFormData.status === 1 || editFormData.status === "Accepted" ? "chấp nhận" : "từ chối"
                            }. Việc chỉnh sửa sẽ tạo phiên bản mới và yêu cầu phụ huynh xem xét lại.
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="d-flex justify-content-end gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Đang cập nhật..." : "Cập nhật"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditFormModal(false)}
                    disabled={loading}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}



      {/* Confirm Add Dialog */}
      {showConfirmAdd && (
        <div className="student-delete-modal-overlay">
          <div className="student-delete-modal-content">
            <div className="student-delete-modal-title">
              <strong>Xác nhận thêm lịch tư vấn mới?</strong>
            </div>
            <div className="student-delete-modal-actions">
              <button className="btn btn-primary" onClick={confirmAddSchedule}>
                Xác nhận
              </button>
              <button className="btn btn-secondary" onClick={() => setShowConfirmAdd(false)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Update Dialog */}
      {showConfirmUpdate && (
        <div className="student-delete-modal-overlay">
          <div className="student-delete-modal-content">
            <div className="student-delete-modal-title">
              <strong>Xác nhận cập nhật lịch tư vấn?</strong>
            </div>
            <div className="student-delete-modal-actions">
              <button className="btn btn-primary" onClick={confirmUpdateSchedule}>
                Xác nhận
              </button>
              <button className="btn btn-secondary" onClick={() => setShowConfirmUpdate(false)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ConsultSchedules;

