import React, { useState, useEffect, useContext } from "react";
import { FaSearch, FaPlus, FaEye, FaEdit, FaTrash, FaFilter, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import TableWithPaging from "../components/TableWithPaging";
import "../styles/Dashboard.css";

const MedEvents = () => {
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    eventDate: new Date().toISOString().split('T')[0] + "T" + new Date().toTimeString().split(' ')[0],
    studentId: "",
    studentSearchTerm: "", // Thêm state mới để lưu từ khóa tìm kiếm học sinh
    nurseId: localStorage.getItem("userId") || "",
    nurseSearchTerm: "", // Thêm state mới để lưu từ khóa tìm kiếm y tá
    symptoms: "",
    actionTaken: "",
    note: ""
  });
  const [showConfirmAdd, setShowConfirmAdd] = useState(false);
  const [showConfirmUpdate, setShowConfirmUpdate] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  // State mới để lưu danh sách học sinh và y tá đã lọc
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filteredNurses, setFilteredNurses] = useState([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showNurseDropdown, setShowNurseDropdown] = useState(false);

  // State mới cho tính năng lọc nâng cao
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filters, setFilters] = useState({
    date: "",
    studentName: "",
    nurseName: "",
    symptoms: "",
    actionTaken: ""
  });
  const [filteredEvents, setFilteredEvents] = useState([]);
  
  // Thêm state cho tính năng sắp xếp
  const [sortConfig, setSortConfig] = useState({
    key: "eventDate",
    direction: "desc"
  });

  const { setNotif } = useNotification();

  // Style cho các biểu tượng
  const iconStyle = {
    view: { color: "#007bff" },
    edit: { color: "#28a745" },
    delete: { color: "#dc3545" }
  };

  const columns = [
    { 
      title: "ID", 
      dataIndex: "medicalEventId",
      render: (id) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("medicalEventId")}>
          {id}
          {sortConfig.key === "medicalEventId" && (
            <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </span>
      )
    },
    { 
      title: "Ngày", 
      dataIndex: "eventDate", 
      render: (date) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("eventDate")}>
          {date ? new Date(date).toLocaleDateString('vi-VN') : "N/A"}
          {sortConfig.key === "eventDate" && (
            <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </span>
      )
    },
    { 
      title: "Học sinh", 
      dataIndex: "studentId", 
      render: (id, record) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("studentName")}>
          {record.studentName || getStudentName(id) || "Không xác định"}
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
      dataIndex: "nurseId", 
      render: (id, record) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("nurseName")}>
          {record.nurseName || getNurseName(id) || "Không xác định"}
          {sortConfig.key === "nurseName" && (
            <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </span>
      )
    },
    { 
      title: "Triệu chứng", 
      dataIndex: "symptoms",
      render: (symptoms) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("symptoms")}>
          {symptoms}
          {sortConfig.key === "symptoms" && (
            <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </span>
      )
    },
    { 
      title: "Ghi chú", 
      dataIndex: "actionTaken",
      render: (actionTaken) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("actionTaken")}>
          {actionTaken}
          {sortConfig.key === "actionTaken" && (
            <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </span>
      )
    }
  ];

  // Hàm lấy tên học sinh từ ID
  const getStudentName = (studentId) => {
    if (!studentId) return "";
    const student = students.find(s => s.studentId === studentId || s.studentId === parseInt(studentId));
    return student ? student.fullName : `Học sinh ID: ${studentId}`;
  };

  // Hàm lấy tên y tá từ ID
  const getNurseName = (nurseId) => {
    if (!nurseId) return "";
    const nurse = nurses.find(n => n.nurseId === nurseId || n.nurseId === parseInt(nurseId));
    return nurse ? nurse.fullName : `Y tá ID: ${nurseId}`;
  };

  // Hàm xử lý sắp xếp
  const handleSort = (key) => {
    // Nếu key giống với key hiện tại, đảo ngược hướng sắp xếp
    // Nếu khác, đặt key mới và hướng mặc định là tăng dần
    const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    // Đảm bảo fetchStudents được gọi trước fetchMedicalEvents
    const initData = async () => {
      setLoading(true);
      try {
        // Đảm bảo đã tải xong danh sách học sinh và y tá trước
        await Promise.all([fetchStudents(), fetchNurses()]);
        // Sau khi có danh sách học sinh và y tá, mới tải sự kiện y tế
        await fetchMedicalEvents();
      } catch (error) {
        console.error("Error initializing data:", error);
        setNotif({
          message: "Không thể tải dữ liệu ban đầu",
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    };
    
    initData();
  }, []);

  // Thêm useEffect mới để áp dụng bộ lọc khi events hoặc filters thay đổi
  useEffect(() => {
    applyFiltersAndSort(events, filters, sortConfig);
  }, [events, filters, sortConfig]);

  // Hàm mới để áp dụng bộ lọc và sắp xếp
  const applyFiltersAndSort = (eventList = events, currentFilters = filters, currentSortConfig = sortConfig) => {
    let result = [...eventList];
    
    // Lọc theo ngày
    if (currentFilters.date) {
      const selectedDate = new Date(currentFilters.date);
      selectedDate.setHours(0, 0, 0, 0); // Đặt thời gian là đầu ngày
      
      // Tạo ngày kết thúc (cuối ngày)
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);
      
      result = result.filter(event => {
        const eventDate = new Date(event.eventDate);
        return eventDate >= selectedDate && eventDate <= endDate;
      });
    }
    
    // Lọc theo tên hoặc ID học sinh
    if (currentFilters.studentName) {
      result = result.filter(event => {
        // Tìm theo tên học sinh
        const studentName = event.studentName || getStudentName(event.studentId) || "";
        
        // Tìm theo ID học sinh
        const studentId = event.studentId ? event.studentId.toString() : "";
        
        // Trả về true nếu tên hoặc ID chứa từ khóa tìm kiếm
        return studentName.toLowerCase().includes(currentFilters.studentName.toLowerCase()) || 
               studentId.includes(currentFilters.studentName);
      });
    }
    
    // Lọc theo tên hoặc ID y tá
    if (currentFilters.nurseName) {
      result = result.filter(event => {
        // Tìm theo tên y tá
        const nurseName = event.nurseName || getNurseName(event.nurseId) || "";
        
        // Tìm theo ID y tá
        const nurseId = event.nurseId ? event.nurseId.toString() : "";
        
        // Trả về true nếu tên hoặc ID chứa từ khóa tìm kiếm
        return nurseName.toLowerCase().includes(currentFilters.nurseName.toLowerCase()) || 
               nurseId.includes(currentFilters.nurseName);
      });
    }
    
    // Lọc theo triệu chứng
    if (currentFilters.symptoms) {
      result = result.filter(event => 
        event.symptoms && event.symptoms.toLowerCase().includes(currentFilters.symptoms.toLowerCase())
      );
    }
    
    // Lọc theo hành động đã thực hiện
    if (currentFilters.actionTaken) {
      result = result.filter(event => 
        event.actionTaken && event.actionTaken.toLowerCase().includes(currentFilters.actionTaken.toLowerCase())
      );
    }
    
    // Áp dụng sắp xếp
    if (currentSortConfig.key) {
      result.sort((a, b) => {
        if (currentSortConfig.key === "eventDate") {
          // So sánh ngày
          const dateA = a.eventDate ? new Date(a.eventDate).getTime() : 0;
          const dateB = b.eventDate ? new Date(b.eventDate).getTime() : 0;
          
          if (currentSortConfig.direction === "asc") {
            return dateA - dateB;
          } else {
            return dateB - dateA;
          }
        }
        else if (currentSortConfig.key === "medicalEventId") {
          // So sánh ID (số)
          const idA = a.medicalEventId || 0;
          const idB = b.medicalEventId || 0;
          
          if (currentSortConfig.direction === "asc") {
            return idA - idB;
          } else {
            return idB - idA;
          }
        }
        else if (currentSortConfig.key === "studentName") {
          // So sánh tên học sinh
          const nameA = a.studentName || getStudentName(a.studentId) || "";
          const nameB = b.studentName || getStudentName(b.studentId) || "";
          
          if (currentSortConfig.direction === "asc") {
            return nameA.localeCompare(nameB);
          } else {
            return nameB.localeCompare(nameA);
          }
        }
        else if (currentSortConfig.key === "nurseName") {
          // So sánh tên y tá
          const nameA = a.nurseName || getNurseName(a.nurseId) || "";
          const nameB = b.nurseName || getNurseName(b.nurseId) || "";
          
          if (currentSortConfig.direction === "asc") {
            return nameA.localeCompare(nameB);
          } else {
            return nameB.localeCompare(nameA);
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
    
    setFilteredEvents(result);
  };

  // Hàm xử lý thay đổi bộ lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Áp dụng bộ lọc ngay lập tức khi người dùng nhập
    // Thay thế setTimeout bằng gọi trực tiếp hàm applyFiltersAndSort
    applyFiltersAndSort(events, { ...filters, [name]: value }, sortConfig);
  };

  // Hàm reset bộ lọc
  const resetFilters = () => {
    const resetFilterValues = {
      date: "",
      studentName: "",
      nurseName: "",
      symptoms: "",
      actionTaken: ""
    };
    setFilters(resetFilterValues);
    // Áp dụng ngay lập tức các bộ lọc đã reset
    applyFiltersAndSort(events, resetFilterValues, sortConfig);
  };

  const fetchStudents = async () => {
    try {
      console.log("Fetching students...");
      const response = await API_SERVICE.studentAPI.getAll({
        keyword: ""
      });
      console.log("Students API response:", response);
      if (Array.isArray(response)) {
        setStudents(response);
        // Lưu danh sách học sinh vào localStorage để sử dụng khi cần
        localStorage.setItem('studentsList', JSON.stringify(response));
        return response;
      } else {
        console.warn("Students API did not return an array:", response);
        setStudents([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      // Thử lấy danh sách học sinh từ localStorage nếu API lỗi
      const cachedStudents = localStorage.getItem('studentsList');
      if (cachedStudents) {
        const parsedStudents = JSON.parse(cachedStudents);
        setStudents(parsedStudents);
        return parsedStudents;
      }
      return [];
    }
  };

  const fetchNurses = async () => {
    try {
      console.log("Fetching nurses...");
      const response = await API_SERVICE.nurseAPI.getAll({
        keyword: ""
      });
      console.log("Nurses API response:", response);
      if (Array.isArray(response)) {
        setNurses(response);
        // Lưu danh sách y tá vào localStorage để sử dụng khi cần
        localStorage.setItem('nursesList', JSON.stringify(response));
        return response;
      } else {
        console.warn("Nurses API did not return an array:", response);
        setNurses([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching nurses:", error);
      // Thử lấy danh sách y tá từ localStorage nếu API lỗi
      const cachedNurses = localStorage.getItem('nursesList');
      if (cachedNurses) {
        const parsedNurses = JSON.parse(cachedNurses);
        setNurses(parsedNurses);
        return parsedNurses;
      }
      return [];
    }
  };

  const fetchMedicalEvents = async (keyword = "") => {
    setLoading(true);
    try {
      console.log("Fetching medical events with keyword:", keyword);
      const response = await API_SERVICE.medicalEventAPI.getAll({
        keyword: keyword,
        pageNumber: 1,
        pageSize: 100,
        includeDetails: true,
        includeStudent: true,
        includeNurse: true
      });
      console.log("Medical events API response:", response);
      
      // Lấy danh sách học sinh và y tá hiện tại từ state hoặc từ localStorage nếu state rỗng
      let currentStudents = students;
      if (!currentStudents || currentStudents.length === 0) {
        const cachedStudents = localStorage.getItem('studentsList');
        if (cachedStudents) {
          currentStudents = JSON.parse(cachedStudents);
        }
      }
      
      let currentNurses = nurses;
      if (!currentNurses || currentNurses.length === 0) {
        const cachedNurses = localStorage.getItem('nursesList');
        if (cachedNurses) {
          currentNurses = JSON.parse(cachedNurses);
        }
      }
      
      // Xử lý dữ liệu để đảm bảo hiển thị đúng
      const processedEvents = Array.isArray(response) ? response.map(event => {
        // Lấy thông tin học sinh
        let studentName = "";
        
        // Kiểm tra nếu có thông tin học sinh trong event
        if (event.student && event.student.fullName) {
          studentName = event.student.fullName;
        } else if (event.studentName) {
          studentName = event.studentName;
        } else {
          // Nếu không có thông tin học sinh trong event, tìm trong danh sách students
          const student = currentStudents.find(s => s.studentId === event.studentId);
          if (student) {
            studentName = student.fullName;
          }
        }
        
        // Lấy thông tin y tá
        let nurseName = "";
        
        // Kiểm tra nếu có thông tin y tá trong event
        if (event.nurse && event.nurse.fullName) {
          nurseName = event.nurse.fullName;
        } else if (event.nurseName) {
          nurseName = event.nurseName;
        } else {
          // Nếu không có thông tin y tá trong event, tìm trong danh sách nurses
          const nurse = currentNurses.find(n => n.nurseId === event.nurseId);
          if (nurse) {
            nurseName = nurse.fullName;
          }
        }
        
        return {
          ...event,
          // Đảm bảo các trường dữ liệu đúng tên
          medicalEventId: event.medicalEventId || event.eventId,
          title: event.title || event.eventName || `Sự kiện ${event.medicalEventId || event.eventId || ""}`,
          studentName: studentName || "Không xác định",
          nurseName: nurseName || "Không xác định",
          // Thêm các trường từ cơ sở dữ liệu
          symptoms: event.symptoms || "",
          actionTaken: event.actionTaken || "",
          note: event.note || ""
        };
      }) : [];
      
      // Sắp xếp sự kiện theo ID giảm dần (mới nhất lên đầu)
      const sortedEvents = [...processedEvents].sort((a, b) => {
        const idA = a.medicalEventId || 0;
        const idB = b.medicalEventId || 0;
        return idB - idA;
      });
      
      setEvents(sortedEvents);
    } catch (error) {
      console.error("Error fetching medical events:", error);
      setNotif({
        message: "Không thể tải danh sách sự kiện y tế",
        type: "error"
      });
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      console.log("Tìm kiếm với từ khóa:", searchKeyword);
      
      // Kiểm tra xem searchKeyword có phải là ID không
      const isNumeric = /^\d+$/.test(searchKeyword);
      
      if (isNumeric) {
        // Nếu là ID, tìm kiếm trực tiếp ID sự kiện y tế trước
        const eventId = parseInt(searchKeyword);
        const foundByEventId = events.find(event => event.medicalEventId === eventId);
        
        if (foundByEventId) {
          // Nếu tìm thấy chính xác, chỉ hiển thị kết quả này
          setFilteredEvents([foundByEventId]);
          setSearchLoading(false);
          setNotif({
            message: `Đã tìm thấy sự kiện y tế với ID: ${eventId}`,
            type: "success"
          });
          return;
        }
        
        // Nếu không tìm thấy theo ID sự kiện, thử tìm theo ID học sinh hoặc y tá
        const foundEvents = events.filter(event => 
          event.studentId?.toString() === searchKeyword ||
          event.nurseId?.toString() === searchKeyword
        );
        
        if (foundEvents.length > 0) {
          // Nếu tìm thấy, cập nhật filteredEvents
          setFilteredEvents(foundEvents);
          setSearchLoading(false);
          setNotif({
            message: `Tìm thấy ${foundEvents.length} sự kiện y tế liên quan đến ID: ${searchKeyword}`,
            type: "success"
          });
          return;
        } else {
          // Nếu không tìm thấy, thông báo cho người dùng
          setNotif({
            message: `Không tìm thấy sự kiện y tế nào với ID: ${searchKeyword}`,
            type: "warning"
          });
        }
      }
      
      // Nếu không phải ID hoặc không tìm thấy, gọi API
      // Đặt lại trang về 1 khi tìm kiếm
      setPage(1);
      await fetchMedicalEvents(searchKeyword);
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

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Xử lý đặc biệt cho các trường ID, đảm bảo chúng là số nếu có giá trị
    if (name === 'studentId' && value) {
      // Nếu value không phải là số, không cập nhật state
      if (isNaN(parseInt(value))) {
        console.warn("studentId phải là số");
        return;
      }
    }
    
    if (name === 'nurseId' && value) {
      // Nếu value không phải là số, không cập nhật state
      if (isNaN(parseInt(value))) {
        console.warn("nurseId phải là số");
        return;
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Xử lý tìm kiếm học sinh khi người dùng nhập vào ô tìm kiếm học sinh
    if (name === "studentSearchTerm") {
      const filtered = students.filter(student => 
        student.fullName?.toLowerCase().includes(value.toLowerCase()) ||
        `${student.studentId}`.includes(value)
      );
      setFilteredStudents(filtered);
      setShowStudentDropdown(true);
    }
    
    // Xử lý tìm kiếm y tá khi người dùng nhập vào ô tìm kiếm y tá
    if (name === "nurseSearchTerm") {
      const filtered = nurses.filter(nurse => 
        nurse.fullName?.toLowerCase().includes(value.toLowerCase()) ||
        `${nurse.nurseId}`.includes(value)
      );
      setFilteredNurses(filtered);
      setShowNurseDropdown(true);
    }
  };

  // Thêm hàm kiểm tra form
  const validateForm = () => {
    if (!formData.title) {
      setNotif({
        message: "Vui lòng nhập tiêu đề sự kiện",
        type: "warning"
      });
      return false;
    }
    
    if (!formData.eventDate) {
      setNotif({
        message: "Vui lòng chọn ngày sự kiện",
        type: "warning"
      });
      return false;
    }
    
    // Kiểm tra studentId có giá trị và có thể chuyển thành số không
    if (!formData.studentId || isNaN(parseInt(formData.studentId))) {
      setNotif({
        message: "Vui lòng chọn học sinh",
        type: "warning"
      });
      return false;
    }
    
    // Kiểm tra nurseId có giá trị và có thể chuyển thành số không
    if (!formData.nurseId || isNaN(parseInt(formData.nurseId))) {
      setNotif({
        message: "Vui lòng chọn y tá",
        type: "warning"
      });
      return false;
    }
    
    if (!formData.symptoms) {
      setNotif({
        message: "Vui lòng nhập triệu chứng",
        type: "warning"
      });
      return false;
    }
    
    if (!formData.actionTaken) {
      setNotif({
        message: "Vui lòng nhập hành động đã thực hiện",
        type: "warning"
      });
      return false;
    }
    
    return true;
  };

  // Hàm mới để xử lý khi người dùng chọn một học sinh từ dropdown
  const handleSelectStudent = (student) => {
    setFormData({
      ...formData,
      studentId: parseInt(student.studentId),
      studentSearchTerm: student.fullName || `Học sinh ID: ${student.studentId}`
    });
    setShowStudentDropdown(false);
  };

  // Hàm mới để xử lý khi người dùng chọn một y tá từ dropdown
  const handleSelectNurse = (nurse) => {
    setFormData({
      ...formData,
      nurseId: parseInt(nurse.nurseId),
      nurseSearchTerm: nurse.fullName || `Y tá ID: ${nurse.nurseId}`
    });
    setShowNurseDropdown(false);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    // Kiểm tra form trước khi hiển thị hộp thoại xác nhận
    if (!validateForm()) {
      return;
    }
    setShowConfirmAdd(true);
  };

  const confirmAddEvent = async () => {
    setShowConfirmAdd(false);
    setLoading(true);
    try {
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
      
      if (!studentId) {
        throw new Error("Vui lòng chọn học sinh từ danh sách.");
      }
      
      if (!nurseId) {
        throw new Error("Vui lòng chọn y tá từ danh sách.");
      }
      
      // Kiểm tra và đảm bảo định dạng đúng của ngày tháng
      let formattedDate = formData.eventDate;
      if (formattedDate && !formattedDate.includes('Z') && !formattedDate.includes('+')) {
        // Thêm 'Z' để đảm bảo UTC nếu chưa có thông tin múi giờ
        formattedDate = formattedDate + 'Z';
      }

      // Chuẩn bị dữ liệu để gửi
      const eventData = {
        eventName: formData.title, // Đổi title thành eventName để phù hợp với model backend
        eventDate: formattedDate,
        studentId: parseInt(studentId),
        nurseId: parseInt(nurseId),
        symptoms: formData.symptoms,
        actionTaken: formData.actionTaken,
        note: formData.note || ""
      };
      
      console.log("Sending data to API:", eventData);
      
      // Gọi API để thêm sự kiện y tế
      const response = await API_SERVICE.medicalEventAPI.create(eventData);
      
      // Nếu API thành công, cập nhật UI
      setNotif({
        message: "Thêm sự kiện y tế thành công!",
        type: "success"
      });
      
      // Đóng modal và tải lại dữ liệu
      setShowAddModal(false);
      fetchMedicalEvents();
      
      // Reset form data
      setFormData({
        title: "",
        eventDate: new Date().toISOString().split('T')[0] + "T" + new Date().toTimeString().split(' ')[0],
        studentId: "",
        studentSearchTerm: "",
        nurseId: localStorage.getItem("userId") || "",
        nurseSearchTerm: "",
        symptoms: "",
        actionTaken: "",
        note: ""
      });
    } catch (error) {
      console.error("Error adding medical event:", error);
      setNotif({
        message: error.message || "Không thể thêm sự kiện y tế. Vui lòng thử lại.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Hàm mới để hiển thị thông báo trước khi hiện form cập nhật
  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    
    // Kiểm tra form trước khi hiển thị hộp thoại xác nhận
    if (!validateForm()) {
      return;
    }
    setShowConfirmUpdate(true);
  };

  const confirmUpdateEvent = async () => {
    setShowConfirmUpdate(false);
    setLoading(true);
    try {
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
      
      if (!studentId) {
        throw new Error("Vui lòng chọn học sinh từ danh sách.");
      }
      
      if (!nurseId) {
        throw new Error("Vui lòng chọn y tá từ danh sách.");
      }
      
      // Kiểm tra và đảm bảo định dạng đúng của ngày tháng
      let formattedDate = formData.eventDate;
      if (formattedDate && !formattedDate.includes('Z') && !formattedDate.includes('+')) {
        // Thêm 'Z' để đảm bảo UTC nếu chưa có thông tin múi giờ
        formattedDate = formattedDate + 'Z';
      }
      
      // Chuẩn bị dữ liệu để gửi - Sửa đổi theo đúng model backend
        const eventData = {
        eventId: parseInt(formData.medicalEventId),
        nurseId: parseInt(nurseId),
        eventDate: formattedDate,
        symptoms: formData.symptoms,
        actionTaken: formData.actionTaken,
          note: formData.note || ""
        };
        
      console.log("Sending data to API for update:", eventData);
        
      // Gọi API để cập nhật sự kiện y tế
      const response = await API_SERVICE.medicalEventAPI.update(eventData);
        
        // Nếu API thành công, cập nhật UI
        setNotif({
          message: "Cập nhật sự kiện y tế thành công!",
          type: "success"
        });
        
      // Đóng modal và tải lại dữ liệu
        setShowEditModal(false);
      fetchMedicalEvents(searchKeyword);
    } catch (error) {
      console.error("Error updating medical event:", error);
      setNotif({
        message: error.message || "Không thể cập nhật sự kiện y tế. Vui lòng thử lại.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    setDeleteId(id);
    setShowConfirmDelete(true);
  };

  const confirmDeleteEvent = async () => {
    setShowConfirmDelete(false);
    setLoading(true);
    try {
      console.log("Xóa sự kiện ID:", deleteId);
      
      // Gọi API xóa
      await API_SERVICE.medicalEventAPI.delete(deleteId);
      
      // Nếu API thành công, cập nhật UI
      setNotif({
        message: "Xóa sự kiện y tế thành công!",
        type: "success"
      });
      
      // Tải lại dữ liệu từ server
      fetchMedicalEvents(searchKeyword);
    } catch (error) {
      console.error("Error deleting medical event:", error);
      setNotif({
        message: "Không thể xóa sự kiện y tế. Vui lòng thử lại.",
        type: "error"
      });
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  const handleView = (event) => {
    setSelectedEvent(event);
    setShowViewModal(true);
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    // Tìm thông tin học sinh và y tá từ ID
    const student = students.find(s => s.studentId === event.studentId);
    const nurse = nurses.find(n => n.nurseId === event.nurseId);
    
    setFormData({
      medicalEventId: event.medicalEventId || event.eventId,
      title: event.title || event.eventName || "",
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] + "T" + new Date(event.eventDate).toTimeString().split(' ')[0] : "",
      studentId: event.studentId || "",
      studentSearchTerm: student ? student.fullName : (event.studentName || `Học sinh ID: ${event.studentId}`),
      nurseId: event.nurseId || localStorage.getItem("userId") || "",
      nurseSearchTerm: nurse ? nurse.fullName : (event.nurseName || `Y tá ID: ${event.nurseId}`),
      symptoms: event.symptoms || "",
      actionTaken: event.actionTaken || "",
      note: event.note || ""
    });
    setShowEditModal(true);
  };

  return (
    <div className="admin-main">
      <h2 className="dashboard-title">Quản lý sự kiện y tế</h2>
      <div className="admin-header">
        <button className="admin-btn" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Thêm sự kiện y tế
        </button>
        <div className="search-container">
          <input
            className="admin-search"
            type="text"
            placeholder="Tìm kiếm..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            title="Nhập ID sự kiện y tế để tìm kiếm nhanh"
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
            {/* Lọc theo ngày */}
            <div>
              <label htmlFor="date" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Ngày</label>
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
            
            {/* Lọc theo triệu chứng */}
            <div>
              <label htmlFor="symptoms" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Triệu chứng</label>
              <input
                type="text"
                id="symptoms"
                name="symptoms"
                value={filters.symptoms}
                onChange={handleFilterChange}
                className="form-control"
                placeholder="Nhập triệu chứng..."
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            
            {/* Lọc theo hành động đã thực hiện */}
            <div>
              <label htmlFor="actionTaken" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Hành động đã thực hiện</label>
              <input
                type="text"
                id="actionTaken"
                name="actionTaken"
                value={filters.actionTaken}
                onChange={handleFilterChange}
                className="form-control"
                placeholder="Nhập hành động đã thực hiện..."
                style={{ width: '100%', padding: '8px' }}
              />
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
                <option value="medicalEventId">ID</option>
                <option value="eventDate">Ngày</option>
                <option value="studentName">Học sinh</option>
                <option value="nurseName">Y tá</option>
                <option value="symptoms">Triệu chứng</option>
                <option value="actionTaken">Hành động</option>
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
            <span>Đang hiển thị: <strong>{filteredEvents.length}</strong> / {events.length} kết quả</span>
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
            data={filteredEvents.length > 0 || Object.values(filters).some(val => val !== "") ? filteredEvents : events}
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
                  title="Sửa"
                  onClick={() => handleEdit(row)}
                >
                  <FaEdit style={iconStyle.edit} size={18} />
                </button>
                <button
                  className="admin-action-btn admin-action-btn-reset"
                  title="Xóa"
                  onClick={() => handleDeleteEvent(row.medicalEventId || row.eventId)}
                >
                  <FaTrash style={iconStyle.delete} size={18} />
                </button>
              </div>
            )}
            loading={loading}
          />
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="student-create-modal-overlay">
          <div className="student-create-modal-content">
            <h3 className="modal-title">Thêm sự kiện y tế mới</h3>
            <form onSubmit={handleAddEvent}>
              <div className="mb-3">
                <label htmlFor="title" className="form-label">Tiêu đề <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="eventDate" className="form-label">Ngày sự kiện <span className="text-danger">*</span></label>
                <input
                  type="datetime-local"
                  className="form-control"
                  id="eventDate"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
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
                          {student.fullName || `Học sinh ID: ${student.studentId}`}
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
                <label htmlFor="nurseId" className="form-label">Y tá <span className="text-danger">*</span></label>
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
                          {nurse.fullName || `Y tá ID: ${nurse.nurseId}`}
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
              <div className="mb-3">
                <label htmlFor="symptoms" className="form-label">Triệu chứng <span className="text-danger">*</span></label>
                <textarea
                  className="form-control"
                  id="symptoms"
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleInputChange}
                  rows={3}
                  required
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="actionTaken" className="form-label">Ghi chú <span className="text-danger">*</span></label>
                <textarea
                  className="form-control"
                  id="actionTaken"
                  name="actionTaken"
                  value={formData.actionTaken}
                  onChange={handleInputChange}
                  rows={3}
                  required
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="note" className="form-label">Ghi chú bổ sung</label>
                <textarea
                  className="form-control"
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows={2}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">Lưu</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Event Modal */}
      {showViewModal && selectedEvent && (
        <div className="student-dialog-overlay">
          <div className="student-dialog-content" style={{ width: '700px', maxWidth: '90%' }}>
            <div className="student-dialog-header">
              <h2>Chi tiết sự kiện y tế</h2>
              <button className="student-dialog-close" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="student-dialog-body">
              <div className="student-info-section">
                <h3>Thông tin sự kiện</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>ID:</label>
                    <span>{selectedEvent.medicalEventId || selectedEvent.eventId}</span>
                  </div>
                  <div className="info-item">
                    <label>Tiêu đề:</label>
                    <span>{selectedEvent.title || selectedEvent.eventName}</span>
                  </div>
                  <div className="info-item">
                    <label>Ngày sự kiện:</label>
                    <span>{new Date(selectedEvent.eventDate).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="info-item">
                    <label>Học sinh:</label>
                    <span>{selectedEvent.studentName || getStudentName(selectedEvent.studentId)} (ID: {selectedEvent.studentId})</span>
                  </div>
                  <div className="info-item">
                    <label>Y tá:</label>
                    <span>{selectedEvent.nurseName || getNurseName(selectedEvent.nurseId)} (ID: {selectedEvent.nurseId})</span>
                  </div>
                </div>
              </div>
              <div className="student-info-section">
                <h3>Chi tiết y tế</h3>
                <div className="info-grid">
                  <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                    <label>Triệu chứng:</label>
                    <span>{selectedEvent.symptoms}</span>
                  </div>
                  <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                    <label>Ghi chú:</label>
                    <span>{selectedEvent.actionTaken}</span>
                  </div>
                  <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                    <label>Ghi chú bổ sung:</label>
                    <span>{selectedEvent.note || "Không có"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="student-dialog-footer">
              <button className="admin-btn" style={{ background: '#6c757d' }} onClick={() => setShowViewModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && selectedEvent && (
        <div className="student-create-modal-overlay">
          <div className="student-create-modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Chỉnh sửa sự kiện y tế</h3>
              <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
            </div>
            <form onSubmit={handleUpdateEvent}>
              <div className="modal-body">
                <input type="hidden" name="medicalEventId" value={formData.medicalEventId} />
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Tiêu đề</label>
                <input
                  type="text"
                    className="form-control bg-light"
                    id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  readOnly
                />
              </div>
                <div className="mb-3">
                  <label htmlFor="eventDate" className="form-label">Ngày sự kiện <span className="text-danger">*</span></label>
                  <input
                    type="datetime-local"
                  className="form-control"
                    id="eventDate"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
                <div className="mb-3">
                  <label htmlFor="studentId" className="form-label">Học sinh</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-control bg-light"
                    id="studentId"
                      name="studentSearchTerm"
                      value={formData.studentSearchTerm}
                      readOnly
                    />
                  </div>
              </div>
                <div className="mb-3">
                  <label htmlFor="nurseId" className="form-label">Y tá <span className="text-danger">*</span></label>
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
                        {nurse.fullName || `Y tá ID: ${nurse.nurseId}`}
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
                <div className="mb-3">
                  <label htmlFor="symptoms" className="form-label">Triệu chứng <span className="text-danger">*</span></label>
                  <textarea
                    className="form-control"
                    id="symptoms"
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleInputChange}
                    rows={3}
                    required
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="actionTaken" className="form-label">Ghi chú <span className="text-danger">*</span></label>
                <textarea
                    className="form-control"
                    id="actionTaken"
                    name="actionTaken"
                    value={formData.actionTaken}
                  onChange={handleInputChange}
                    rows={3}
                    required
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="note" className="form-label">Ghi chú bổ sung</label>
                  <textarea
                  className="form-control"
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows={2}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Add Dialog */}
      {showConfirmAdd && (
        <div className="student-delete-modal-overlay">
          <div className="student-delete-modal-content">
            <div className="student-delete-modal-title">
              <strong>Xác nhận thêm sự kiện y tế mới?</strong>
            </div>
            <div className="student-delete-modal-actions">
              <button className="btn btn-primary" onClick={confirmAddEvent}>
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
              <strong>Xác nhận cập nhật sự kiện y tế?</strong>
            </div>
            <div className="student-delete-modal-actions">
              <button className="btn btn-primary" onClick={confirmUpdateEvent}>
                Xác nhận
              </button>
              <button className="btn btn-secondary" onClick={() => setShowConfirmUpdate(false)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {showConfirmDelete && (
        <div className="student-delete-modal-overlay">
          <div className="student-delete-modal-content">
            <div className="student-delete-modal-title">
              <strong>Xác nhận xóa sự kiện y tế?</strong>
            </div>
            <div className="student-delete-modal-actions">
              <button className="btn btn-danger" onClick={confirmDeleteEvent}>
                Xác nhận
              </button>
              <button className="btn btn-secondary" onClick={() => setShowConfirmDelete(false)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedEvents;