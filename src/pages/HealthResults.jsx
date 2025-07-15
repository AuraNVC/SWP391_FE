import React, { useState, useEffect } from "react";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaPlus, FaSearch, FaSync, FaTrash, FaFilter, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import "../styles/Dashboard.css";

// Component riêng để hiển thị tên học sinh
const StudentNameCell = ({ studentId, initialName, healthProfileId, showIdInTable = true }) => {
  const [studentName, setStudentName] = useState(initialName || `Học sinh ID: ${studentId || "N/A"}`);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const fetchName = async () => {
      setLoading(true);
      try {
        // Nếu có studentId, ưu tiên sử dụng studentId
        if (studentId) {
          // Thử gọi API để lấy thông tin học sinh
          const response = await API_SERVICE.studentAPI.getById(studentId);
          if (response) {
            const name = response.fullName || 
                        `${response.firstName || ''} ${response.lastName || ''}`.trim() || 
                        response.name || 
                        `Học sinh ID: ${studentId}`;
            
            console.log(`Fetched student name for ID ${studentId}: ${name}`);
            // Lưu tên đầy đủ có ID
            setStudentName(`${name}`);
            // Lưu tên hiển thị (có thể không có ID)
            setDisplayName(name);
            setLoading(false);
            return;
          }
        }
        
        // Nếu không có studentId hoặc không tìm được thông tin học sinh, thử dùng healthProfileId
        if (healthProfileId) {
          console.log(`Trying to get student info from health profile ID: ${healthProfileId}`);
          try {
            // Sử dụng API.HEALTH_PROFILE thay vì healthProfileAPI.getById
            const profileData = await API_SERVICE.healthProfileAPI.get(healthProfileId);
            
            if (profileData && profileData.studentId) {
              // Đã có studentId từ health profile, gọi API để lấy thông tin học sinh
              const studentResponse = await API_SERVICE.studentAPI.getById(profileData.studentId);
              if (studentResponse) {
                const name = studentResponse.fullName || 
                          `${studentResponse.firstName || ''} ${studentResponse.lastName || ''}`.trim() || 
                          studentResponse.name;
                
                console.log(`Fetched student name from health profile: ${name}`);
                setStudentName(name);
                setDisplayName(name);
              } else if (profileData.student && profileData.student.fullName) {
                // Nếu health profile có chứa thông tin học sinh
                setStudentName(profileData.student.fullName);
                setDisplayName(profileData.student.fullName);
              }
            } else if (profileData && profileData.student) {
              // Nếu health profile có chứa thông tin học sinh trực tiếp
              const studentInfo = profileData.student;
              const name = studentInfo.fullName || 
                        `${studentInfo.firstName || ''} ${studentInfo.lastName || ''}`.trim() || 
                        studentInfo.name;
              setStudentName(name);
              setDisplayName(name);
            }
          } catch (profileError) {
            console.error(`Error fetching health profile ${healthProfileId}:`, profileError);
            if (initialName && !initialName.includes("ID:") && !initialName.includes("Học sinh ID")) {
              setStudentName(initialName);
              setDisplayName(initialName);
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching student name:`, error);
        // Nếu có lỗi nhưng có initialName hợp lệ, sử dụng initialName
        if (initialName && !initialName.includes("ID:") && !initialName.includes("Học sinh ID")) {
          setStudentName(initialName);
          setDisplayName(initialName);
        }
      } finally {
        setLoading(false);
      }
    };
    
    // Luôn gọi API để lấy tên học sinh từ ID
      fetchName();
  }, [studentId, initialName, healthProfileId]);

  return (
    <span>
      {loading ? "Đang tải..." : (displayName || studentName)}
    </span>
  );
};

const HealthResults = () => {
  // State variables for data
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // State variables for pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // State variables for search
  const [searchKeyword, setSearchKeyword] = useState("");
  
  // State variables for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // State variables for confirmation dialogs
  const [showConfirmAdd, setShowConfirmAdd] = useState(false);
  const [showConfirmUpdate, setShowConfirmUpdate] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  // State for selected result and form data
  const [selectedResult, setSelectedResult] = useState(null);
  const [formData, setFormData] = useState({
    healthCheckScheduleId: "",
    healthProfileId: "",
    studentId: "",
    studentSearchTerm: "", // Thêm state mới để lưu từ khóa tìm kiếm học sinh
    nurseId: localStorage.getItem("userId") || "",
    nurseName: "",
    nurseSearchTerm: "", // Thêm state mới để lưu từ khóa tìm kiếm y tá
    height: "",
    weight: "",
    leftVision: "",
    rightVision: "",
    result: "",
    status: "1", // Default status: Completed
    note: ""
  });
  
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
    height: "",
    weight: "",
    vision: "",
    result: ""
  });
  
  // State mới cho tính năng sắp xếp
  const [sortConfig, setSortConfig] = useState({
    key: "healthCheckupRecordId",
    direction: "desc"
  });
  
  const [statusCounts, setStatusCounts] = useState({});

  const { setNotif } = useNotification();

  const [columns, setColumns] = useState([
    { 
      title: "ID", 
      dataIndex: "healthCheckupRecordId", 
      key: "recordId",
      render: (id) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("healthCheckupRecordId")}>
          {id}
          {sortConfig.key === "healthCheckupRecordId" && (
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
      key: "studentName", 
      render: (name, record) => {
        // Luôn sử dụng StudentNameCell để hiển thị tên học sinh
        return (
          <span style={{ cursor: 'pointer' }} onClick={() => handleSort("studentName")}>
            <StudentNameCell 
              studentId={record.studentId} 
              initialName={record.studentName} 
              healthProfileId={record.healthProfileId} 
            />
            {sortConfig.key === "studentName" && (
              <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
                {sortConfig.direction === 'asc' ? '▲' : '▼'}
              </span>
            )}
          </span>
        );
      }
    },
    { 
      title: "Chiều cao", 
      dataIndex: "height", 
      key: "heightValue", 
      render: (height) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("height")}>
          {height ? `${height} cm` : "N/A"}
          {sortConfig.key === "height" && (
            <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </span>
      )
    },
    { 
      title: "Cân nặng", 
      dataIndex: "weight", 
      key: "weightValue", 
      render: (weight) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("weight")}>
          {weight ? `${weight} kg` : "N/A"}
          {sortConfig.key === "weight" && (
            <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </span>
      )
    },
    { 
      title: "Thị lực", 
      dataIndex: "vision", 
      key: "visionValue", 
      render: (_, record) => {
        const leftVision = record.leftVision || "N/A";
        const rightVision = record.rightVision || "N/A";
        return (
          <span style={{ cursor: 'pointer' }} onClick={() => handleSort("leftVision")}>
            {`Trái: ${leftVision} - Phải: ${rightVision}`}
            {sortConfig.key === "leftVision" && (
              <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
                {sortConfig.direction === 'asc' ? '▲' : '▼'}
              </span>
            )}
          </span>
        );
      }
    },
    { 
      title: "Kết quả", 
      dataIndex: "result", 
      key: "resultValue",
      render: (result) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("result")}>
          {result}
          {sortConfig.key === "result" && (
            <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </span>
      )
    }
  ]);

  const iconStyle = {
    view: { color: "#007bff" },
    edit: { color: "#28a745" },
    delete: { color: "#dc3545" }
  };

  const getStudentName = (studentId) => {
    if (!studentId) return "";
    console.log("Finding student with ID:", studentId, "Type:", typeof studentId);
    
    // Chuyển đổi studentId thành cả string và number để so sánh
    const studentIdStr = String(studentId);
    const studentIdNum = parseInt(studentId, 10);
    
    const student = students.find(s => 
      String(s.studentId) === studentIdStr || 
      s.studentId === studentIdNum
    );
    
    if (student) {
      console.log("Found student:", student);
      return student.fullName;
    }
    
    return "";
  };

  const getNurseName = (nurseId) => {
    if (!nurseId) return "";
    const nurse = nurses.find(n => n.nurseId === nurseId || n.nurseId === parseInt(nurseId));
    return nurse ? nurse.fullName : `Y tá ID: ${nurseId}`;
  };

  const getStatusText = (status) => {
    const statusStr = String(status).toLowerCase();
    
    if (statusStr === "0" || statusStr === "pending") {
      return "Chưa hoàn thành";
    } else if (statusStr === "1" || statusStr === "completed") {
      return "Đã hoàn thành";
    } else if (statusStr === "2" || statusStr === "cancelled") {
      return "Đã hủy";
    }
    
    return "Không xác định";
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchStudents(), fetchNurses()]);
        await Promise.all([fetchHealthCheckSchedules(), fetchHealthCheckResults()]);
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

  const fetchStudents = async () => {
    try {
      console.log("Fetching students...");
      const response = await API_SERVICE.studentAPI.getAll({
        keyword: "",
        pageNumber: 1,
        pageSize: 1000,
        includeDetails: true
      });
      console.log("Students API response:", response);
      
      // Xử lý dữ liệu học sinh
      let studentsData = response;
      if (!Array.isArray(response) && response && response.data && Array.isArray(response.data)) {
        studentsData = response.data;
      }
      
      if (Array.isArray(studentsData)) {
        // Xử lý dữ liệu học sinh để đảm bảo đầy đủ thông tin
        const processedStudents = studentsData.map(student => {
          // Đảm bảo studentId luôn tồn tại và nhất quán
          const studentId = student.studentId || student.id;
          
          // Xử lý fullName từ các nguồn khác nhau
          let fullName = student.fullName;
          if (!fullName) {
            if (student.firstName || student.lastName) {
              fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
            } else if (student.name) {
              fullName = student.name;
            } else {
              fullName = `Học sinh ID: ${studentId}`;
            }
          }
          
          console.log(`Processed student: ID=${studentId}, Name=${fullName}`);
          
          return {
            ...student,
            studentId: studentId,
            fullName: fullName
          };
        });
        
        console.log("Processed students:", processedStudents);
        setStudents(processedStudents);
        // Lưu danh sách học sinh vào localStorage để sử dụng khi cần
        localStorage.setItem('studentsList', JSON.stringify(processedStudents));
        return processedStudents;
      } else {
        console.warn("Students API did not return an array:", response);
        
        // Thử tạo một mảng học sinh mẫu để test
        const dummyStudents = [
          { studentId: 1, fullName: "Nguyễn Văn A" },
          { studentId: 2, fullName: "Trần Thị B" },
          { studentId: 3, fullName: "Lê Văn C" },
          { studentId: 4, fullName: "Phạm Thị D" },
          { studentId: 5, fullName: "Hoàng Văn E" }
        ];
        
        console.log("Using dummy students due to API issue:", dummyStudents);
        setStudents(dummyStudents);
        localStorage.setItem('studentsList', JSON.stringify(dummyStudents));
        return dummyStudents;
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      // Thử lấy danh sách học sinh từ localStorage nếu API lỗi
      const cachedStudents = localStorage.getItem('studentsList');
      if (cachedStudents) {
        const parsedStudents = JSON.parse(cachedStudents);
        console.log("Using cached students from localStorage:", parsedStudents);
        setStudents(parsedStudents);
        return parsedStudents;
      }
      
      // Nếu không có dữ liệu trong localStorage, tạo dữ liệu mẫu
      const dummyStudents = [
        { studentId: 1, fullName: "Nguyễn Văn A" },
        { studentId: 2, fullName: "Trần Thị B" },
        { studentId: 3, fullName: "Lê Văn C" },
        { studentId: 4, fullName: "Phạm Thị D" },
        { studentId: 5, fullName: "Hoàng Văn E" }
      ];
      
      console.log("Using dummy students due to error:", dummyStudents);
      setStudents(dummyStudents);
      localStorage.setItem('studentsList', JSON.stringify(dummyStudents));
      return dummyStudents;
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
        localStorage.setItem('nursesList', JSON.stringify(response));
        return response;
      } else {
        console.warn("Nurses API did not return an array:", response);
        setNurses([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching nurses:", error);
      const cachedNurses = localStorage.getItem('nursesList');
      if (cachedNurses) {
        const parsedNurses = JSON.parse(cachedNurses);
        setNurses(parsedNurses);
        return parsedNurses;
      }
      return [];
    }
  };

  const fetchHealthCheckResults = async (keyword = "") => {
    setLoading(true);
    try {
      console.log("Fetching health check results with keyword:", keyword);
      
      const response = await API_SERVICE.healthCheckResultAPI.getAll({
        keyword: keyword,
        pageNumber: 1,
        pageSize: 100,
        includeDetails: true,
        includeStudent: true,
        includeNurse: true,
        includeProfile: true
      });
      
      console.log("Health check results API response:", response);

      let resultsData = response;
      if (!Array.isArray(response) && response && response.data && Array.isArray(response.data)) {
        resultsData = response.data;
      }

      if (Array.isArray(resultsData) && resultsData.length > 0) {
        // Xử lý dữ liệu bằng hàm processHealthCheckResults
        console.log("Processing health check results data...");
        const processedResults = await processHealthCheckResults(resultsData);
        
        // Loại bỏ cột trạng thái nếu có
          setColumns(prevColumns => prevColumns.filter(col => col.dataIndex !== 'status'));
        
        if (keyword && keyword.trim() !== "") {
          // Lọc kết quả dựa trên từ khóa tìm kiếm
          const filteredResults = processedResults.filter(result => {
            const searchStr = keyword.toLowerCase();
            
            // Tìm kiếm theo ID
            if (result.healthCheckupRecordId && String(result.healthCheckupRecordId).includes(searchStr)) {
              return true;
            }
            
            // Tìm kiếm theo tên học sinh
            if (result.studentName && result.studentName.toLowerCase().includes(searchStr)) {
              return true;
            }
            
            // Tìm kiếm theo ID học sinh
            if (result.studentId && String(result.studentId).includes(searchStr)) {
              return true;
            }
            
            // Tìm kiếm theo kết quả
            if (result.result && result.result.toLowerCase().includes(searchStr)) {
              return true;
            }
            
            return false;
          });
          
          console.log(`Found ${filteredResults.length} results matching keyword "${keyword}"`);
          setResults(filteredResults);
          
          if (filteredResults.length === 0) {
            setNotif({
              message: `Không tìm thấy kết quả nào phù hợp với từ khóa: "${keyword}"`,
              type: "info",
              autoDismiss: true,
              duration: 5000
            });
          }
        } else {
        setResults(processedResults);
        }
      } else {
        console.warn("No health check results found or API returned empty data");
        setResults([]);
      }
    } catch (error) {
      console.error("Error fetching health check results:", error);
      setNotif({
        message: "Không thể tải danh sách kết quả khám sức khỏe",
        type: "error",
        autoDismiss: true,
        duration: 5000
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthCheckSchedules = async () => {
    try {
      console.log("Fetching health check schedules...");
      const response = await API_SERVICE.healthCheckScheduleAPI.getAll({
        keyword: "",
        pageNumber: 1,
        pageSize: 100,
        includeDetails: true,
        includeStudent: true
      });
      console.log("Health check schedules API response:", response);
      
      let schedulesData = response;
      if (!Array.isArray(response) && response && response.data && Array.isArray(response.data)) {
        schedulesData = response.data;
      }
      
      if (Array.isArray(schedulesData) && schedulesData.length > 0) {
        const processedSchedules = schedulesData.map(schedule => {
          return {
            ...schedule,
            healthCheckScheduleId: schedule.healthCheckScheduleId || schedule.scheduleId || schedule.id,
            name: schedule.name || schedule.title || `Lịch khám ${schedule.healthCheckScheduleId || schedule.scheduleId || schedule.id || ""}`,
            checkDate: schedule.checkDate || schedule.date || new Date().toISOString(),
            healthProfileId: schedule.healthProfileId || schedule.profileId || ""
          };
        });
        
        console.log("Processed health check schedules:", processedSchedules);
        setSchedules(processedSchedules);
      } else {
        console.warn("Health check schedules API did not return valid data:", response);
        const dummySchedules = [
          { 
            healthCheckScheduleId: 1, 
            name: "Khám định kỳ học kỳ 1", 
            checkDate: new Date().toISOString(),
            healthProfileId: 1
          },
          { 
            healthCheckScheduleId: 2, 
            name: "Khám mắt học kỳ 1", 
            checkDate: new Date().toISOString(),
            healthProfileId: 2
          },
          { 
            healthCheckScheduleId: 3, 
            name: "Khám răng học kỳ 1", 
            checkDate: new Date().toISOString(),
            healthProfileId: 3
          }
        ];
        console.log("Using dummy health check schedules due to empty API response");
        setSchedules(dummySchedules);
      }
    } catch (error) {
      console.error("Error fetching health check schedules:", error);
      setNotif({
        message: "Không thể tải danh sách lịch khám sức khỏe",
        type: "error"
      });
      
      const dummySchedules = [
        { 
          healthCheckScheduleId: 1, 
          name: "Khám định kỳ học kỳ 1", 
          checkDate: new Date().toISOString(),
          healthProfileId: 1
        },
        { 
          healthCheckScheduleId: 2, 
          name: "Khám mắt học kỳ 1", 
          checkDate: new Date().toISOString(),
          healthProfileId: 2
        },
        { 
          healthCheckScheduleId: 3, 
          name: "Khám răng học kỳ 1", 
          checkDate: new Date().toISOString(),
          healthProfileId: 3
        }
      ];
      console.log("Using dummy health check schedules due to error");
      setSchedules(dummySchedules);
    }
  };

  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      console.log("Tìm kiếm với từ khóa:", searchKeyword);
      
      // Kiểm tra xem searchKeyword có phải là ID không
      const isNumeric = /^\d+$/.test(searchKeyword);
      
      if (isNumeric) {
        // Nếu là ID, tìm kiếm trong danh sách results hiện có
        const foundResults = results.filter(result => 
          result.healthCheckupRecordId?.toString() === searchKeyword ||
          result.studentId?.toString() === searchKeyword ||
          result.nurseId?.toString() === searchKeyword
        );
        
        if (foundResults.length > 0) {
          // Nếu tìm thấy, cập nhật filteredResults
          setFilteredResults(foundResults);
          setSearchLoading(false);
          return;
        }
      }
      
      // Nếu không phải ID hoặc không tìm thấy, gọi API
      setPage(1);
      await fetchHealthCheckResults(searchKeyword);
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
  
  // Hàm xử lý dữ liệu kết quả khám sức khỏe (tách từ fetchHealthCheckResults)
  const processHealthCheckResults = async (resultsData) => {
    if (!Array.isArray(resultsData)) {
      console.warn("processHealthCheckResults received non-array data:", resultsData);
      return [];
    }
    
    // Đảm bảo danh sách học sinh đã được tải
    let currentStudents = students;
    if (!currentStudents || currentStudents.length === 0) {
      console.log("No students in state, fetching students first...");
      currentStudents = await fetchStudents();
    }
    
    // Đảm bảo danh sách y tá đã được tải
    let currentNurses = nurses;
    if (!currentNurses || currentNurses.length === 0) {
      console.log("No nurses in state, fetching nurses first...");
      currentNurses = await fetchNurses();
    }
    
    // Đảm bảo danh sách lịch khám đã được tải
    let currentSchedules = schedules;
    if (!currentSchedules || currentSchedules.length === 0) {
      console.log("No schedules in state, fetching schedules first...");
      await fetchHealthCheckSchedules();
      currentSchedules = schedules;
    }
    
    // Không gọi API getAll cho health profiles nữa
    // Thay vào đó, chúng ta sẽ xử lý dữ liệu trực tiếp từ kết quả
    
    // Xử lý dữ liệu để đảm bảo hiển thị đúng
    const processedResults = resultsData.map(result => {
      console.log("Processing health check result:", result);
      
      // Lấy thông tin học sinh
      let studentName = "";
      let studentId = "";
      let healthProfileId = result.healthProfileId || null;
      
      // Kiểm tra nếu có thông tin học sinh trong result
      if (result.student && result.student.fullName) {
        studentName = result.student.fullName;
        studentId = result.student.studentId || result.student.id;
        console.log(`Found student info in result: ID=${studentId}, Name=${studentName}`);
      } else if (result.studentName && !result.studentName.includes("Hồ sơ sức khỏe ID")) {
        studentName = result.studentName;
        studentId = result.studentId;
        console.log(`Found student name in result: ID=${studentId}, Name=${studentName}`);
      } else if (result.healthProfile && result.healthProfile.student && result.healthProfile.student.fullName) {
        studentName = result.healthProfile.student.fullName;
        studentId = result.healthProfile.student.studentId || result.healthProfile.student.id;
        console.log(`Found student info in health profile: ID=${studentId}, Name=${studentName}`);
      } else if (result.healthProfile && result.healthProfile.studentId) {
        // Tìm học sinh từ healthProfile
        console.log(`Looking for student with ID: ${result.healthProfile.studentId} in list of ${currentStudents.length} students`);
        const student = currentStudents.find(s => String(s.studentId) === String(result.healthProfile.studentId));
        if (student) {
          studentName = student.fullName;
          studentId = student.studentId;
          console.log(`Found student in students list: ID=${studentId}, Name=${studentName}`);
        } else {
          // Thay vì hiển thị "Học sinh ID", chỉ lưu ID để StudentNameCell xử lý
          studentName = "";
          studentId = result.healthProfile.studentId;
          console.log(`Could not find student with ID=${studentId} in students list`);
        }
      } else if (result.studentId) {
        // Tìm học sinh từ ID
        console.log(`Looking for student with ID: ${result.studentId} in list of ${currentStudents.length} students`);
        const student = currentStudents.find(s => String(s.studentId) === String(result.studentId));
        if (student) {
          studentName = student.fullName;
          studentId = result.studentId;
          console.log(`Found student in students list: ID=${studentId}, Name=${studentName}`);
        } else {
          // Thay vì hiển thị "Học sinh ID", chỉ lưu ID để StudentNameCell xử lý
          studentName = "";
          studentId = result.studentId;
          console.log(`Could not find student with ID=${studentId} in students list`);
        }
      } else if (result.healthProfileId) {
        // Không gọi API để lấy thông tin health profile nữa
        // Thay vào đó, sử dụng ID để hiển thị
        studentName = "";
        studentId = "";
          healthProfileId = result.healthProfileId;
        console.log(`Using health profile ID for later processing: ${result.healthProfileId}`);
      } else {
        console.log("No student information found in result");
      }
      
      // Lấy thông tin y tá
      let nurseName = "";
      let nurseId = "";
      
      // Kiểm tra nếu có thông tin y tá trong result
      if (result.nurse && result.nurse.fullName) {
        nurseName = result.nurse.fullName;
        nurseId = result.nurse.nurseId || result.nurse.id;
      } else if (result.nurseName) {
        nurseName = result.nurseName;
        nurseId = result.nurseId;
      } else if (result.nurseId) {
        // Tìm y tá từ ID
        const nurse = currentNurses.find(n => String(n.nurseId) === String(result.nurseId));
        if (nurse) {
          nurseName = nurse.fullName;
          nurseId = nurse.nurseId;
        } else {
          nurseName = `ID: ${result.nurseId}`;
          nurseId = result.nurseId;
        }
      }

      // Lấy thông tin lịch khám
      let scheduleName = "";
      let scheduleId = result.healthCheckScheduleId || result.scheduleId;
      
      if (scheduleId) {
        // Tìm lịch khám từ ID
        const schedule = currentSchedules.find(s => String(s.healthCheckScheduleId) === String(scheduleId));
        if (schedule) {
          scheduleName = `${schedule.name} - ${new Date(schedule.checkDate).toLocaleDateString('vi-VN')}`;
        } else {
          scheduleName = `Lịch khám ID: ${scheduleId}`;
        }
      }

      // Xử lý trạng thái
      let statusValue = result.status;
      if (statusValue === null || statusValue === undefined) {
        statusValue = "0"; // Default: Pending
      } else if (typeof statusValue === 'string') {
        if (statusValue.toLowerCase() === 'pending') {
          statusValue = "0";
        } else if (statusValue.toLowerCase() === 'completed') {
          statusValue = "1";
        } else if (statusValue.toLowerCase() === 'cancelled') {
          statusValue = "2";
        }
      }
      
      // Xử lý các trường số
      let heightValue = result.height;
      let weightValue = result.weight;
      
      // Chuyển đổi null thành chuỗi rỗng cho hiển thị
      if (heightValue === null || heightValue === undefined) {
        heightValue = "";
      }
      
      if (weightValue === null || weightValue === undefined) {
        weightValue = "";
      }
      
      // Xử lý note field
      let noteValue = result.note;
      if (noteValue === null || noteValue === undefined) {
        noteValue = "";
      }
      
      // Xử lý các trường thị lực
      let leftVisionValue = result.leftVision;
      let rightVisionValue = result.rightVision;
      
      if (leftVisionValue === null || leftVisionValue === undefined) {
        leftVisionValue = "N/A";
      }
      
      if (rightVisionValue === null || rightVisionValue === undefined) {
        rightVisionValue = "N/A";
      }
      
      // Xử lý trường kết quả
      let resultValue = result.result;
      if (resultValue === null || resultValue === undefined) {
        resultValue = "";
      }
      
      // Tạo một đối tượng mới thay vì sử dụng spread operator để tránh trùng lặp các key
      const processedResult = {
        // Đảm bảo các trường dữ liệu đúng tên
        healthCheckupRecordId: result.healthCheckupRecordId || result.recordId || result.id,
        studentId: studentId,
        studentName: studentName,
        healthProfileId: healthProfileId, // Đảm bảo healthProfileId được truyền đi
        healthCheckScheduleId: scheduleId,
        scheduleName: scheduleName,
        nurseId: nurseId,
        nurseName: nurseName || "Không xác định",
        // Đảm bảo các trường dữ liệu có giá trị
        height: heightValue,
        weight: weightValue,
        leftVision: leftVisionValue,
        rightVision: rightVisionValue,
        result: resultValue,
        status: statusValue, // Giữ lại status nhưng không hiển thị trong bảng
        note: noteValue
      };
      
      console.log("Processed result:", processedResult);
      return processedResult;
    });
    
    return processedResults;
  };

  const handleRefresh = async () => {
    setSearchKeyword("");
    setPage(1);
    setLoading(true);
    try {
      console.log("Refreshing data...");
      // Đảm bảo tải danh sách học sinh và y tá trước
      await Promise.all([fetchStudents(), fetchNurses()]);
      // Sau đó tải lịch khám và kết quả khám
      await Promise.all([fetchHealthCheckSchedules(), fetchHealthCheckResults("")]);
      setNotif({
        message: "Dữ liệu đã được làm mới",
        type: "success"
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      setNotif({
        message: "Không thể làm mới dữ liệu",
        type: "error"
      });
    } finally {
      setLoading(false);
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

  const validateForm = () => {
    // Check for required fields
    const requiredFields = [
      { field: 'healthCheckScheduleId', message: 'Vui lòng chọn lịch khám' },
      { field: 'studentId', message: 'Vui lòng chọn học sinh' },
      { field: 'height', message: 'Vui lòng nhập chiều cao' },
      { field: 'weight', message: 'Vui lòng nhập cân nặng' },
      { field: 'leftVision', message: 'Vui lòng nhập thị lực mắt trái' },
      { field: 'rightVision', message: 'Vui lòng nhập thị lực mắt phải' },
      { field: 'result', message: 'Vui lòng nhập kết quả khám' }
    ];
    
    for (const { field, message } of requiredFields) {
      if (!formData[field]) {
      setNotif({
          message,
          type: "error",
          autoDismiss: true,
          duration: 5000
      });
      return false;
      }
    }
    
    return true;
  };

  const handleAddResult = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return; // validateForm already sets notification
    }
    
    // Show confirmation dialog instead of immediately submitting
    setShowConfirmAdd(true);
  };

  const confirmAddResult = async () => {
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
      
      // Chuẩn bị dữ liệu để gửi
      const resultData = {
        healthCheckScheduleId: parseInt(formData.healthCheckScheduleId),
        healthProfileId: parseInt(studentId), // Sử dụng studentId làm healthProfileId
        nurseId: parseInt(nurseId),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        leftVision: formData.leftVision,
        rightVision: formData.rightVision,
        result: formData.result,
        status: parseInt(formData.status),
        note: formData.note
      };
      
      // Gọi API để thêm kết quả khám
      await API_SERVICE.healthCheckResultAPI.create(resultData);
      
      // Nếu API thành công, cập nhật UI
      setNotif({
        message: "Thêm kết quả khám sức khỏe thành công!",
        type: "success"
      });
      
      // Đóng modal và tải lại dữ liệu
      setShowAddModal(false);
      fetchHealthCheckResults();
      
      // Reset form data
      setFormData({
        healthCheckScheduleId: "",
        healthProfileId: "",
        studentId: "",
        studentSearchTerm: "",
        nurseId: localStorage.getItem("userId") || "",
        nurseName: "",
        nurseSearchTerm: "",
        height: "",
        weight: "",
        leftVision: "",
        rightVision: "",
        result: "",
        status: "1",
        note: ""
      });
    } catch (error) {
      console.error("Error adding health check result:", error);
      setNotif({
        message: error.message || "Không thể thêm kết quả khám sức khỏe. Vui lòng thử lại.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateResult = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setNotif({
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
        type: "error",
        autoDismiss: true,
        duration: 5000
      });
      return;
    }
    
    // Show confirmation dialog instead of immediately submitting
    setShowConfirmUpdate(true);
  };

  const confirmUpdateResult = async () => {
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
      
      // Chuẩn bị dữ liệu để gửi
      const resultData = {
        healthCheckupRecordId: formData.healthCheckupRecordId,
        healthCheckScheduleId: parseInt(formData.healthCheckScheduleId),
        healthProfileId: parseInt(studentId), // Sử dụng studentId làm healthProfileId
        nurseId: parseInt(nurseId),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        leftVision: formData.leftVision,
        rightVision: formData.rightVision,
        result: formData.result,
        status: parseInt(formData.status),
        note: formData.note
      };
      
      // Gọi API để cập nhật kết quả khám
      await API_SERVICE.healthCheckResultAPI.update(resultData);
      
      // Nếu API thành công, cập nhật UI
      setNotif({
        message: "Cập nhật kết quả khám sức khỏe thành công!",
        type: "success"
      });
      
      // Đóng modal và tải lại dữ liệu
      setShowEditModal(false);
      fetchHealthCheckResults(searchKeyword);
    } catch (error) {
      console.error("Error updating health check result:", error);
      setNotif({
        message: error.message || "Không thể cập nhật kết quả khám sức khỏe. Vui lòng thử lại.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResult = async (id) => {
    setDeleteId(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    setShowConfirmDelete(false);
    setLoading(true);
    try {
      console.log("Xóa kết quả khám ID:", deleteId);
      
      // Gọi API xóa
      await API_SERVICE.healthCheckResultAPI.delete(deleteId);
      
      setNotif({
        message: "Xóa kết quả khám sức khỏe thành công",
        type: "success",
        autoDismiss: true,
        duration: 5000
      });
      
      // Tải lại dữ liệu từ server
      fetchHealthCheckResults(searchKeyword);
    } catch (error) {
      console.error("Error deleting health check result:", error);
      setNotif({
        message: "Không thể xóa kết quả khám sức khỏe",
        type: "error",
        autoDismiss: true,
        duration: 5000
      });
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  // Thêm hàm để lấy thông tin học sinh theo ID
  const fetchStudentById = async (studentId) => {
    if (!studentId) return null;
    
    try {
      console.log(`Fetching specific student with ID: ${studentId}`);
      
      // Thử tìm học sinh trong state trước
      if (students && students.length > 0) {
        const student = students.find(s => String(s.studentId) === String(studentId));
        if (student) {
          console.log(`Found student in state: ${student.fullName}`);
          return student;
        }
      }
      
      // Nếu không tìm thấy trong state, gọi API
      try {
        const student = await API_SERVICE.studentAPI.getById(studentId);
        console.log(`API returned student:`, student);
        
        // Xử lý dữ liệu học sinh
        if (student) {
          const processedStudent = {
            studentId: student.studentId || student.id,
            fullName: student.fullName || 
                     `${student.firstName || ''} ${student.lastName || ''}`.trim() || 
                     student.name || 
                     `Học sinh ID: ${student.studentId || student.id}`
          };
          
          console.log(`Processed student from API: ${processedStudent.fullName}`);
          
          // Thêm học sinh này vào state và localStorage để sử dụng sau này
          setStudents(prevStudents => {
            const updatedStudents = [...prevStudents];
            const existingIndex = updatedStudents.findIndex(s => String(s.studentId) === String(studentId));
            if (existingIndex >= 0) {
              updatedStudents[existingIndex] = processedStudent;
            } else {
              updatedStudents.push(processedStudent);
            }
            
            // Cập nhật localStorage
            localStorage.setItem('studentsList', JSON.stringify(updatedStudents));
            
            return updatedStudents;
          });
          
          return processedStudent;
        }
      } catch (apiError) {
        console.warn(`API call failed for student ID ${studentId}:`, apiError);
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching student with ID ${studentId}:`, error);
      return null;
    }
  };
  
  // Xử lý khi nhấn nút xem chi tiết
  const handleView = async (record) => {
    try {
      // Fetch schedule information if needed
      let scheduleInfo = null;
      if (record.healthCheckScheduleId) {
        scheduleInfo = schedules.find(s => String(s.healthCheckScheduleId) === String(record.healthCheckScheduleId));
    
        // If schedule not found in state, try to fetch it
        if (!scheduleInfo && API_SERVICE.healthCheckScheduleAPI) {
          try {
            const fetchedSchedule = await API_SERVICE.healthCheckScheduleAPI.getById(record.healthCheckScheduleId);
            if (fetchedSchedule) {
              scheduleInfo = {
                healthCheckScheduleId: fetchedSchedule.healthCheckScheduleId || fetchedSchedule.scheduleId || fetchedSchedule.id,
                name: fetchedSchedule.name || fetchedSchedule.title || `Lịch khám ${fetchedSchedule.healthCheckScheduleId}`,
                checkDate: fetchedSchedule.checkDate || fetchedSchedule.date || new Date().toISOString()
              };
              
              // Update schedules state
              setSchedules(prev => {
                const exists = prev.some(s => String(s.healthCheckScheduleId) === String(scheduleInfo.healthCheckScheduleId));
                return exists ? prev : [...prev, scheduleInfo];
              });
            }
          } catch (err) {
            console.error("Error fetching schedule:", err);
          }
        }
      }

      // Nếu record có chứa studentName và studentId, sử dụng trực tiếp
      if (record.studentName && record.studentId) {
        // Đảm bảo studentName luôn có ID
        const studentNameWithId = record.studentName.includes("ID:") 
          ? record.studentName 
          : `${record.studentName} (ID: ${record.studentId})`;
        
        setSelectedResult({
          ...record,
          studentName: studentNameWithId,
          scheduleName: scheduleInfo ? `${scheduleInfo.name} - ${new Date(scheduleInfo.checkDate).toLocaleDateString('vi-VN')}` : null
        });
        setShowViewModal(true);
        return;
      }

      // Nếu không có studentName hoặc studentId, thử lấy thông tin từ API
      if (record.studentId) {
        const studentResponse = await API_SERVICE.studentAPI.getById(record.studentId);
        if (studentResponse) {
          const name = studentResponse.fullName || 
                                `${studentResponse.firstName || ''} ${studentResponse.lastName || ''}`.trim() || 
                                studentResponse.name || 
                    `Học sinh ID: ${record.studentId}`;
          
          setSelectedResult({
            ...record,
            studentName: `${name} (ID: ${record.studentId})`,
            scheduleName: scheduleInfo ? `${scheduleInfo.name} - ${new Date(scheduleInfo.checkDate).toLocaleDateString('vi-VN')}` : null
          });
          setShowViewModal(true);
          return;
            }
          }

        // Nếu không có studentId hoặc không tìm được thông tin học sinh, thử dùng healthProfileId
      if (record.healthProfileId) {
        try {
          const profileData = await API_SERVICE.healthProfileAPI.get(record.healthProfileId);
          
          if (profileData && profileData.studentId) {
            // Đã có studentId từ health profile, gọi API để lấy thông tin học sinh
            const studentResponse = await API_SERVICE.studentAPI.getById(profileData.studentId);
            if (studentResponse) {
              const name = studentResponse.fullName || 
                          `${studentResponse.firstName || ''} ${studentResponse.lastName || ''}`.trim() || 
                          studentResponse.name || 
                          `Học sinh ID: ${profileData.studentId}`;
              
              setSelectedResult({
                ...record,
                studentName: `${name} (ID: ${profileData.studentId})`,
                studentId: profileData.studentId,
                scheduleName: scheduleInfo ? `${scheduleInfo.name} - ${new Date(scheduleInfo.checkDate).toLocaleDateString('vi-VN')}` : null
              });
            } else {
              setSelectedResult({
                ...record,
                studentName: `Học sinh ID: ${profileData.studentId}`,
                studentId: profileData.studentId,
                scheduleName: scheduleInfo ? `${scheduleInfo.name} - ${new Date(scheduleInfo.checkDate).toLocaleDateString('vi-VN')}` : null
              });
            }
          } else {
            setSelectedResult({
              ...record,
              studentName: `Học sinh ID: ${record.healthProfileId}`,
              scheduleName: scheduleInfo ? `${scheduleInfo.name} - ${new Date(scheduleInfo.checkDate).toLocaleDateString('vi-VN')}` : null
            });
          }
        } catch (error) {
          console.error("Error fetching health profile:", error);
          setSelectedResult({
            ...record,
            studentName: record.studentName || `Học sinh ID: ${record.healthProfileId || "N/A"}`,
            scheduleName: scheduleInfo ? `${scheduleInfo.name} - ${new Date(scheduleInfo.checkDate).toLocaleDateString('vi-VN')}` : null
          });
        }
      } else {
        // Nếu không có thông tin gì, hiển thị dữ liệu hiện có
        setSelectedResult(record);
        
        // Cập nhật formData cho chỉnh sửa
        setFormData({
          healthCheckScheduleId: record.healthCheckScheduleId || record.scheduleId || "",
          healthProfileId: record.healthProfileId || "",
          studentId: record.studentId || "",
          nurseId: record.nurseId || localStorage.getItem("userId") || "",
          nurseName: record.nurseName || "",
          height: record.height || "",
          weight: record.weight || "",
          leftVision: record.leftVision || "",
          rightVision: record.rightVision || "",
          result: record.result || "",
          status: String(record.status) || "1",
          note: record.note === null || record.note === undefined ? "" : record.note
        });
      }
    
      setShowViewModal(true);
    } catch (error) {
      console.error("Error preparing view data:", error);
      setNotif({
        message: "Lỗi",
        description: "Không thể hiển thị thông tin chi tiết. Vui lòng thử lại sau."
      });
    }
  };

  // Xử lý khi nhấn nút chỉnh sửa
  const handleEdit = async (record) => {
    try {
      // Tìm thông tin học sinh và y tá từ ID
      let studentName = "";
      let nurseName = "";
      
      // Tìm thông tin học sinh
      if (record.studentId) {
        const student = students.find(s => s.studentId === record.studentId);
        if (student) {
          studentName = student.fullName || `Học sinh ID: ${record.studentId}`;
        } else {
          try {
            const studentResponse = await API_SERVICE.studentAPI.getById(record.studentId);
            if (studentResponse) {
              studentName = studentResponse.fullName || 
                          `${studentResponse.firstName || ''} ${studentResponse.lastName || ''}`.trim() || 
                          `Học sinh ID: ${record.studentId}`;
            } else {
              studentName = record.studentName || `Học sinh ID: ${record.studentId}`;
            }
          } catch (error) {
            console.error("Error fetching student:", error);
            studentName = record.studentName || `Học sinh ID: ${record.studentId}`;
          }
        }
      }
      
      // Tìm thông tin y tá
      if (record.nurseId) {
        const nurse = nurses.find(n => n.nurseId === record.nurseId);
        if (nurse) {
          nurseName = nurse.fullName || `Y tá ID: ${record.nurseId}`;
        } else {
          try {
            const nurseResponse = await API_SERVICE.nurseAPI.getById(record.nurseId);
            if (nurseResponse) {
              nurseName = nurseResponse.fullName || 
                        `${nurseResponse.firstName || ''} ${nurseResponse.lastName || ''}`.trim() || 
                        `Y tá ID: ${record.nurseId}`;
            } else {
              nurseName = record.nurseName || `Y tá ID: ${record.nurseId}`;
            }
          } catch (error) {
            console.error("Error fetching nurse:", error);
            nurseName = record.nurseName || `Y tá ID: ${record.nurseId}`;
          }
        }
      }
      
      // Cập nhật formData cho chỉnh sửa
      setFormData({
        healthCheckupRecordId: record.healthCheckupRecordId,
        healthCheckScheduleId: record.healthCheckScheduleId || record.scheduleId || "",
        healthProfileId: record.healthProfileId || "",
        studentId: record.studentId || "",
        studentSearchTerm: studentName,
        nurseId: record.nurseId || localStorage.getItem("userId") || "",
        nurseName: record.nurseName || "",
        nurseSearchTerm: nurseName,
        height: record.height || "",
        weight: record.weight || "",
        leftVision: record.leftVision || "",
        rightVision: record.rightVision || "",
        result: record.result || "",
        status: String(record.status) || "1",
        note: record.note === null || record.note === undefined ? "" : record.note
      });
      
      setSelectedResult(record);
      setShowEditModal(true);
    } catch (error) {
      console.error("Error preparing edit data:", error);
      setNotif({
        message: "Lỗi khi chuẩn bị dữ liệu chỉnh sửa",
        type: "error"
      });
    }
  };

  const handleScheduleChange = (e) => {
    const scheduleId = e.target.value;
    
    if (!scheduleId) {
      setFormData({
        ...formData,
        healthCheckScheduleId: "",
        healthProfileId: "",
        studentId: ""
      });
      return;
    }
    
    // Tìm lịch khám được chọn
    const selectedSchedule = schedules.find(s => String(s.healthCheckScheduleId) === String(scheduleId));
    
    if (selectedSchedule) {
      console.log("Selected schedule:", selectedSchedule);
      
      // Cập nhật formData với thông tin từ lịch khám
      setFormData({
        ...formData,
        healthCheckScheduleId: scheduleId,
        healthProfileId: selectedSchedule.healthProfileId || ""
      });
      
      // Nếu lịch khám có healthProfileId, thử lấy thông tin học sinh từ healthProfileId
      if (selectedSchedule.healthProfileId) {
        fetchStudentInfoFromHealthProfile(selectedSchedule.healthProfileId);
      }
    } else {
      console.warn(`Schedule with ID ${scheduleId} not found`);
      setFormData({
        ...formData,
        healthCheckScheduleId: scheduleId
      });
    }
  };

  // Hàm để lấy thông tin học sinh từ healthProfileId
  const fetchStudentInfoFromHealthProfile = async (healthProfileId) => {
    if (!healthProfileId) return;
    
    try {
      console.log(`Fetching student info from health profile ID: ${healthProfileId}`);
      const profileData = await API_SERVICE.healthProfileAPI.getById(healthProfileId);
      
      if (profileData && profileData.studentId) {
        console.log(`Found student ID ${profileData.studentId} in health profile ${healthProfileId}`);
        
        // Cập nhật studentId trong formData
        setFormData(prevFormData => ({
          ...prevFormData,
          studentId: profileData.studentId
        }));
        
        // Thử lấy thông tin chi tiết của học sinh
        try {
          const studentData = await API_SERVICE.studentAPI.getById(profileData.studentId);
          if (studentData) {
            console.log(`Found student details for ID ${profileData.studentId}:`, studentData);
          }
        } catch (error) {
          console.error(`Error fetching student details for ID ${profileData.studentId}:`, error);
        }
      } else if (profileData && profileData.student) {
        console.log(`Found student info directly in health profile ${healthProfileId}:`, profileData.student);
        
        // Cập nhật studentId trong formData
        setFormData(prevFormData => ({
          ...prevFormData,
          studentId: profileData.student.studentId || profileData.student.id
        }));
      } else {
        console.log(`No student information found in health profile ${healthProfileId}`);
      }
    } catch (error) {
      console.error(`Error fetching student info from health profile ${healthProfileId}:`, error);
    }
  };

  // Thêm useEffect để tự động làm mới dữ liệu sau khi component đã mount
  useEffect(() => {
    // Tạo một timeout để đảm bảo component đã render xong
    const refreshTimer = setTimeout(() => {
      console.log("Auto refreshing data after component mount");
      handleRefresh();
    }, 500);
    
    return () => clearTimeout(refreshTimer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Thêm useEffect để tải lại danh sách học sinh trước khi hiển thị kết quả
  useEffect(() => {
    const loadStudentsFirst = async () => {
      if (students.length === 0) {
        console.log("Loading students before displaying results");
        await fetchStudents();
      }
    };
    
    loadStudentsFirst();
  }, [students.length]);

  // Thêm useEffect để debug thông tin học sinh
  useEffect(() => {
    if (students.length > 0) {
      console.log("Current students in state:", students);
      console.log("Student IDs:", students.map(s => s.studentId));
    }
  }, [students]);

  // Thêm useEffect để debug thông tin kết quả khám
  useEffect(() => {
    if (results.length > 0) {
      console.log("Current results in state:", results);
      console.log("Result student IDs:", results.map(r => r.studentId));
      console.log("Result student names:", results.map(r => r.studentName));
    }
  }, [results]);

  // Hàm mới để xử lý khi người dùng chọn một học sinh từ dropdown
  const handleSelectStudent = (student) => {
    setFormData({
      ...formData,
      studentId: student.studentId,
      healthProfileId: student.studentId, // Sử dụng studentId làm healthProfileId
      studentSearchTerm: student.fullName || `Học sinh ID: ${student.studentId}`
    });
    setShowStudentDropdown(false);
  };

  // Hàm mới để xử lý khi người dùng chọn một y tá từ dropdown
  const handleSelectNurse = (nurse) => {
    setFormData({
      ...formData,
      nurseId: nurse.nurseId,
      nurseSearchTerm: nurse.fullName || `Y tá ID: ${nurse.nurseId}`
    });
    setShowNurseDropdown(false);
  };

  // Hàm xử lý sắp xếp
  const handleSort = (key) => {
    // Nếu key giống với key hiện tại, đảo ngược hướng sắp xếp
    // Nếu khác, đặt key mới và hướng mặc định là tăng dần
    const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  // Thêm useEffect mới để áp dụng bộ lọc khi results hoặc filters thay đổi
  useEffect(() => {
    applyFiltersAndSort(results, filters, sortConfig);
  }, [results, filters, sortConfig]);

  // Hàm mới để áp dụng bộ lọc và sắp xếp
  const applyFiltersAndSort = (resultsList = results, currentFilters = filters, currentSortConfig = sortConfig) => {
    let filteredData = [...resultsList];
    
    // Lọc theo ngày
    if (currentFilters.date) {
      const selectedDate = new Date(currentFilters.date);
      selectedDate.setHours(0, 0, 0, 0); // Đặt thời gian là đầu ngày
      
      // Tạo ngày kết thúc (cuối ngày)
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);
      
      filteredData = filteredData.filter(result => {
        if (!result.checkupDate) return false;
        const checkupDate = new Date(result.checkupDate);
        return checkupDate >= selectedDate && checkupDate <= endDate;
      });
    }
    
    // Lọc theo tên hoặc ID học sinh
    if (currentFilters.studentName) {
      filteredData = filteredData.filter(result => {
        // Tìm theo tên học sinh
        const studentName = result.studentName || getStudentName(result.studentId) || "";
        
        // Tìm theo ID học sinh
        const studentId = result.studentId ? result.studentId.toString() : "";
        
        // Trả về true nếu tên hoặc ID chứa từ khóa tìm kiếm
        return studentName.toLowerCase().includes(currentFilters.studentName.toLowerCase()) || 
               studentId.includes(currentFilters.studentName);
      });
    }
    
    // Lọc theo tên hoặc ID y tá
    if (currentFilters.nurseName) {
      filteredData = filteredData.filter(result => {
        // Tìm theo tên y tá
        const nurseName = result.nurseName || getNurseName(result.nurseId) || "";
        
        // Tìm theo ID y tá
        const nurseId = result.nurseId ? result.nurseId.toString() : "";
        
        // Trả về true nếu tên hoặc ID chứa từ khóa tìm kiếm
        return nurseName.toLowerCase().includes(currentFilters.nurseName.toLowerCase()) || 
               nurseId.includes(currentFilters.nurseName);
      });
    }
    
    // Lọc theo chiều cao
    if (currentFilters.height) {
      filteredData = filteredData.filter(result => 
        result.height && result.height.toString().includes(currentFilters.height)
      );
    }
    
    // Lọc theo cân nặng
    if (currentFilters.weight) {
      filteredData = filteredData.filter(result => 
        result.weight && result.weight.toString().includes(currentFilters.weight)
      );
    }
    
    // Lọc theo thị lực
    if (currentFilters.vision) {
      filteredData = filteredData.filter(result => {
        const leftVision = result.leftVision || "";
        const rightVision = result.rightVision || "";
        return leftVision.includes(currentFilters.vision) || 
               rightVision.includes(currentFilters.vision);
      });
    }
    
    // Lọc theo kết quả
    if (currentFilters.result) {
      filteredData = filteredData.filter(result => 
        result.result && result.result.toLowerCase().includes(currentFilters.result.toLowerCase())
      );
    }
    
    // Áp dụng sắp xếp
    if (currentSortConfig.key) {
      filteredData.sort((a, b) => {
        if (currentSortConfig.key === "healthCheckupRecordId") {
          // So sánh ID (số)
          const idA = a.healthCheckupRecordId || 0;
          const idB = b.healthCheckupRecordId || 0;
          
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
        else if (currentSortConfig.key === "height" || currentSortConfig.key === "weight") {
          // So sánh chiều cao hoặc cân nặng (số)
          const valueA = parseFloat(a[currentSortConfig.key]) || 0;
          const valueB = parseFloat(b[currentSortConfig.key]) || 0;
          
          if (currentSortConfig.direction === "asc") {
            return valueA - valueB;
          } else {
            return valueB - valueA;
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
    
    setFilteredResults(filteredData);
  };

  // Hàm xử lý thay đổi bộ lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Áp dụng bộ lọc ngay lập tức khi người dùng nhập
    applyFiltersAndSort(results, { ...filters, [name]: value }, sortConfig);
  };

  // Hàm reset bộ lọc
  const resetFilters = () => {
    const resetFilterValues = {
      date: "",
      studentName: "",
      nurseName: "",
      height: "",
      weight: "",
      vision: "",
      result: ""
    };
    setFilters(resetFilterValues);
    // Áp dụng ngay lập tức các bộ lọc đã reset
    applyFiltersAndSort(results, resetFilterValues, sortConfig);
  };

  return (
    <div className="admin-main">
      <h2 className="dashboard-title">Kết quả khám sức khỏe</h2>
      <div className="admin-header">
        <button className="admin-btn" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Thêm kết quả khám
        </button>
        <div className="search-container">
          <input
            className="admin-search"
            type="text"
            placeholder="Tìm kiếm..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button className="admin-btn" onClick={handleSearch}>
            <FaSearch />
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
              <label htmlFor="date" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Ngày khám</label>
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
            
            {/* Lọc theo chiều cao */}
            <div>
              <label htmlFor="height" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Chiều cao</label>
              <input
                type="text"
                id="height"
                name="height"
                value={filters.height}
                onChange={handleFilterChange}
                className="form-control"
                placeholder="Nhập chiều cao..."
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            
            {/* Lọc theo cân nặng */}
            <div>
              <label htmlFor="weight" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Cân nặng</label>
              <input
                type="text"
                id="weight"
                name="weight"
                value={filters.weight}
                onChange={handleFilterChange}
                className="form-control"
                placeholder="Nhập cân nặng..."
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            
            {/* Lọc theo thị lực */}
            <div>
              <label htmlFor="vision" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Thị lực</label>
              <input
                type="text"
                id="vision"
                name="vision"
                value={filters.vision}
                onChange={handleFilterChange}
                className="form-control"
                placeholder="Nhập thị lực..."
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            
            {/* Lọc theo kết quả */}
            <div>
              <label htmlFor="result" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Kết quả</label>
              <input
                type="text"
                id="result"
                name="result"
                value={filters.result}
                onChange={handleFilterChange}
                className="form-control"
                placeholder="Nhập kết quả khám..."
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
                <option value="healthCheckupRecordId">ID</option>
                <option value="studentName">Học sinh</option>
                <option value="height">Chiều cao</option>
                <option value="weight">Cân nặng</option>
                <option value="leftVision">Thị lực</option>
                <option value="result">Kết quả</option>
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
            <span>Đang hiển thị: <strong>{filteredResults.length}</strong> / {results.length} kết quả</span>
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
            data={filteredResults.length > 0 || Object.values(filters).some(val => val !== "") ? filteredResults : results}
            pageSize={pageSize}
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
                  onClick={() => handleDeleteResult(row.healthCheckupRecordId)}
                >
                  <FaTrash style={iconStyle.delete} size={18} />
                </button>
              </div>
            )}
            loading={loading}
          />
        )}
      </div>

      {/* View Modal - Updated to match MedEvents style */}
      {showViewModal && selectedResult && (
        <div className="student-dialog-overlay">
          <div className="student-dialog-content" style={{ width: '700px', maxWidth: '90%' }}>
            <div className="student-dialog-header">
              <h2>Chi tiết kết quả khám sức khỏe</h2>
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
                    <label>ID:</label>
                    <span>{selectedResult.healthCheckupRecordId}</span>
                  </div>
                  <div className="info-item">
                    <label>Lịch khám:</label>
                    <span>
                      {selectedResult.scheduleName || 
                       (selectedResult.healthCheckScheduleId ? 
                        (() => {
                          const schedule = schedules.find(s => String(s.healthCheckScheduleId) === String(selectedResult.healthCheckScheduleId));
                          return schedule ? 
                            `${schedule.name} - ${new Date(schedule.checkDate).toLocaleDateString('vi-VN')}` : 
                            `Lịch khám ID: ${selectedResult.healthCheckScheduleId}`;
                        })() : 
                        "Không có")}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Học sinh:</label>
                    <span>
                      {selectedResult.studentName.includes("ID:") || selectedResult.studentName.includes("(ID:") 
                        ? selectedResult.studentName 
                        : `${selectedResult.studentName} (ID: ${selectedResult.studentId})`}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Y tá phụ trách:</label>
                    <span>{selectedResult.nurseName || getNurseName(selectedResult.nurseId) || "Không xác định"} (ID: {selectedResult.nurseId})</span>
                  </div>
                </div>
              </div>
              <div className="student-info-section">
                <h3 style={{ 
                  borderBottom: '2px solid #007bff',
                  paddingBottom: '8px',
                  margin: '0 0 16px 0',
                  color: '#333',
                  fontSize: '1.1rem'
                }}>Kết quả khám</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Chiều cao:</label>
                    <span>{selectedResult.height ? `${selectedResult.height} cm` : "Không có"}</span>
                  </div>
                  <div className="info-item">
                    <label>Cân nặng:</label>
                    <span>{selectedResult.weight ? `${selectedResult.weight} kg` : "Không có"}</span>
                  </div>
                  <div className="info-item">
                    <label>Thị lực mắt trái:</label>
                    <span>{selectedResult.leftVision || "Không có"}</span>
                  </div>
                  <div className="info-item">
                    <label>Thị lực mắt phải:</label>
                    <span>{selectedResult.rightVision || "Không có"}</span>
                  </div>
                  <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                    <label>Kết quả:</label>
                    <span>{selectedResult.result || "Không có"}</span>
                  </div>
                  <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                    <label>Ghi chú:</label>
                    <span>{selectedResult.note || "Không có"}</span>
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

      {/* Edit Modal - Updated to match MedEvents style */}
      {showEditModal && selectedResult && (
        <div className="student-dialog-overlay">
          <div className="student-dialog-content" style={{ width: '700px', maxWidth: '90%' }}>
            <div className="student-dialog-header">
              <h2>Chỉnh sửa kết quả khám sức khỏe</h2>
              <button className="student-dialog-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="student-dialog-body">
              <form onSubmit={handleUpdateResult}>
                <input type="hidden" name="healthCheckupRecordId" value={formData.healthCheckupRecordId} />
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
                      <label htmlFor="edit-healthCheckScheduleId">Lịch khám <span className="text-danger">*</span></label>
                <select
                  name="healthCheckScheduleId"
                        id="edit-healthCheckScheduleId"
                  value={formData.healthCheckScheduleId}
                  onChange={handleScheduleChange}
                  required
                  className="form-control"
                        style={{ backgroundColor: '#f8f9fa' }}
                >
                  <option value="">-- Chọn lịch khám --</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.healthCheckScheduleId} value={schedule.healthCheckScheduleId}>
                      {schedule.name} - {new Date(schedule.checkDate).toLocaleDateString('vi-VN')}
                    </option>
                  ))}
                </select>
              </div>
                    <div className="info-item">
                      <label htmlFor="edit-studentId">Học sinh <span className="text-danger">*</span></label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          className="form-control"
                          id="edit-studentSearchTerm"
                          name="studentSearchTerm"
                          value={formData.studentSearchTerm}
                          onChange={handleInputChange}
                          onBlur={() => setTimeout(() => setShowStudentDropdown(false), 200)}
                          onClick={() => setShowStudentDropdown(true)}
                          placeholder="Nhập tên hoặc ID học sinh"
                          required
                          style={{ backgroundColor: '#f8f9fa' }}
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
                    <div className="info-item">
                      <label htmlFor="edit-nurseId">Y tá phụ trách <span className="text-danger">*</span></label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          className="form-control"
                          id="edit-nurseSearchTerm"
                          name="nurseSearchTerm"
                          value={formData.nurseSearchTerm}
                          onChange={handleInputChange}
                          onBlur={() => setTimeout(() => setShowNurseDropdown(false), 200)}
                          onClick={() => setShowNurseDropdown(true)}
                          placeholder="Nhập tên hoặc ID y tá"
                          required
                          style={{ backgroundColor: '#f8f9fa' }}
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
                  </div>
                </div>
                <div className="student-info-section">
                  <h3 style={{ 
                    borderBottom: '2px solid #007bff',
                    paddingBottom: '8px',
                    margin: '0 0 16px 0',
                    color: '#333',
                    fontSize: '1.1rem'
                  }}>Kết quả khám</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label htmlFor="edit-height">Chiều cao (cm) <span className="text-danger">*</span></label>
                <input
                  type="number"
                  name="height"
                        id="edit-height"
                  value={formData.height}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.1"
                    className="form-control"
                        style={{ backgroundColor: '#f8f9fa' }}
                />
              </div>
                    <div className="info-item">
                      <label htmlFor="edit-weight">Cân nặng (kg) <span className="text-danger">*</span></label>
                <input
                  type="number"
                  name="weight"
                        id="edit-weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.1"
                    className="form-control"
                        style={{ backgroundColor: '#f8f9fa' }}
                />
                </div>
                    <div className="info-item">
                      <label htmlFor="edit-leftVision">Thị lực mắt trái <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="leftVision"
                        id="edit-leftVision"
                    value={formData.leftVision}
                    onChange={handleInputChange}
                        required
                    className="form-control"
                        style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>
                    <div className="info-item">
                      <label htmlFor="edit-rightVision">Thị lực mắt phải <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="rightVision"
                        id="edit-rightVision"
                    value={formData.rightVision}
                    onChange={handleInputChange}
                        required
                    className="form-control"
                        style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>
                    <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                      <label htmlFor="edit-result">Kết quả <span className="text-danger">*</span></label>
                <textarea
                  name="result"
                        id="edit-result"
                  value={formData.result}
                  onChange={handleInputChange}
                        required
                  rows="3"
                        className="form-control"
                        style={{ backgroundColor: '#f8f9fa' }}
                ></textarea>
              </div>
                    {/* Status field removed */}
                    <input type="hidden" name="status" value="1" />
                    <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                      <label htmlFor="edit-note">Ghi chú</label>
                <textarea
                  name="note"
                        id="edit-note"
                  value={formData.note}
                  onChange={handleInputChange}
                        rows="2"
                  className="form-control"
                        style={{ backgroundColor: '#f8f9fa' }}
                ></textarea>
              </div>
              </div>
          </div>
                <div className="student-dialog-footer">
                  <button type="submit" className="admin-btn">Lưu</button>
                  <button type="button" className="admin-btn" style={{ background: '#6c757d' }} onClick={() => setShowEditModal(false)}>Hủy</button>
        </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal - Updated to match MedEvents style */}
      {showAddModal && (
        <div className="student-dialog-overlay">
          <div className="student-dialog-content" style={{ width: '700px', maxWidth: '90%' }}>
            <div className="student-dialog-header">
              <h2>Thêm kết quả khám sức khỏe mới</h2>
              <button className="student-dialog-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="student-dialog-body">
              <form onSubmit={handleAddResult}>
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
                      <label htmlFor="healthCheckScheduleId">Lịch khám <span className="text-danger">*</span></label>
                <select
                  name="healthCheckScheduleId"
                        id="healthCheckScheduleId"
                  value={formData.healthCheckScheduleId}
                  onChange={handleScheduleChange}
                  required
                  className="form-control"
                        style={{ backgroundColor: '#f8f9fa' }}
                >
                  <option value="">-- Chọn lịch khám --</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.healthCheckScheduleId} value={schedule.healthCheckScheduleId}>
                      {schedule.name} - {new Date(schedule.checkDate).toLocaleDateString('vi-VN')}
                    </option>
                  ))}
                </select>
              </div>
                    <div className="info-item">
                      <label htmlFor="studentId">Học sinh <span className="text-danger">*</span></label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          className="form-control"
                          id="studentSearchTerm"
                          name="studentSearchTerm"
                          value={formData.studentSearchTerm}
                          onChange={handleInputChange}
                          onBlur={() => setTimeout(() => setShowStudentDropdown(false), 200)}
                          onClick={() => setShowStudentDropdown(true)}
                          placeholder="Nhập tên hoặc ID học sinh"
                          required
                          style={{ backgroundColor: '#f8f9fa' }}
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
                    <div className="info-item">
                      <label htmlFor="nurseId">Y tá phụ trách <span className="text-danger">*</span></label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          className="form-control"
                          id="nurseSearchTerm"
                          name="nurseSearchTerm"
                          value={formData.nurseSearchTerm}
                          onChange={handleInputChange}
                          onBlur={() => setTimeout(() => setShowNurseDropdown(false), 200)}
                          onClick={() => setShowNurseDropdown(true)}
                          placeholder="Nhập tên hoặc ID y tá"
                          required
                          style={{ backgroundColor: '#f8f9fa' }}
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
                  </div>
                </div>
                <div className="student-info-section">
                  <h3 style={{ 
                    borderBottom: '2px solid #007bff',
                    paddingBottom: '8px',
                    margin: '0 0 16px 0',
                    color: '#333',
                    fontSize: '1.1rem'
                  }}>Kết quả khám</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label htmlFor="height">Chiều cao (cm) <span className="text-danger">*</span></label>
                <input
                  type="number"
                  name="height"
                        id="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.1"
                    className="form-control"
                        style={{ backgroundColor: '#f8f9fa' }}
                />
              </div>
                    <div className="info-item">
                      <label htmlFor="weight">Cân nặng (kg) <span className="text-danger">*</span></label>
                <input
                  type="number"
                  name="weight"
                        id="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.1"
                    className="form-control"
                        style={{ backgroundColor: '#f8f9fa' }}
                />
                </div>
                    <div className="info-item">
                      <label htmlFor="leftVision">Thị lực mắt trái <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="leftVision"
                        id="leftVision"
                    value={formData.leftVision}
                    onChange={handleInputChange}
                        required
                    className="form-control"
                        style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>
                    <div className="info-item">
                      <label htmlFor="rightVision">Thị lực mắt phải <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="rightVision"
                        id="rightVision"
                    value={formData.rightVision}
                    onChange={handleInputChange}
                        required
                    className="form-control"
                        style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>
                    <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                      <label htmlFor="result">Kết quả <span className="text-danger">*</span></label>
                <textarea
                  name="result"
                        id="result"
                  value={formData.result}
                  onChange={handleInputChange}
                        required
                  rows="3"
                        className="form-control"
                        style={{ backgroundColor: '#f8f9fa' }}
                ></textarea>
              </div>
                    {/* Status field removed */}
                    <input type="hidden" name="status" value="1" />
                    <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                      <label htmlFor="note">Ghi chú</label>
                <textarea
                  name="note"
                        id="note"
                  value={formData.note}
                  onChange={handleInputChange}
                        rows="2"
                  className="form-control"
                        style={{ backgroundColor: '#f8f9fa' }}
                ></textarea>
              </div>
                  </div>
                </div>
                <div className="student-dialog-footer">
                  <button type="submit" className="admin-btn">Lưu</button>
                  <button type="button" className="admin-btn" style={{ background: '#6c757d' }} onClick={() => setShowAddModal(false)}>Hủy</button>
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
              <strong>Xác nhận thêm kết quả khám sức khỏe mới?</strong>
            </div>
            <div className="student-delete-modal-actions">
              <button className="btn btn-primary" onClick={confirmAddResult}>
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
              <strong>Xác nhận cập nhật kết quả khám sức khỏe?</strong>
            </div>
            <div className="student-delete-modal-actions">
              <button className="btn btn-primary" onClick={confirmUpdateResult}>
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
              <strong>Xác nhận xóa kết quả khám sức khỏe?</strong>
            </div>
            <div className="student-delete-modal-actions">
              <button className="btn btn-danger" onClick={confirmDelete}>
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

export default HealthResults; 