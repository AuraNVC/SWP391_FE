import React, { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaFilter, FaSortAmountDown, FaSortAmountUp, FaSync, FaCheck } from "react-icons/fa";
import { API_SERVICE } from "../services/api";
import TableWithPaging from "../components/TableWithPaging";
import { useNotification } from "../contexts/NotificationContext";
import { formatDate } from "../services/utils";
import "../styles/Dashboard.css";
import "../styles/VaxResults.css";

// Component riêng để hiển thị tên học sinh
const StudentNameCell = ({ studentId, initialName, healthProfileId }) => {
  const [studentName, setStudentName] = useState(initialName || `Học sinh ID: ${studentId || "N/A"}`);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const fetchName = async () => {
      setLoading(true);
      try {
        // Nếu có studentId, gọi API để lấy thông tin học sinh
        if (studentId) {
          const response = await API_SERVICE.studentAPI.getById(studentId);
          if (response) {
            const name = response.fullName || 
                        `${response.firstName || ''} ${response.lastName || ''}`.trim() || 
                        response.name || 
                        `Học sinh ID: ${studentId}`;
            
            console.log(`Fetched student name for ID ${studentId}: ${name}`);
            setStudentName(name);
            setDisplayName(`${name} (ID: ${studentId})`);
            setLoading(false);
            return;
          }
        }
        
        // Nếu không có studentId nhưng có healthProfileId, thử lấy studentId từ health profile
        if (healthProfileId && !studentId) {
          const profileResponse = await API_SERVICE.healthProfileAPI.getById(healthProfileId);
          if (profileResponse && profileResponse.studentId) {
            const studentResponse = await API_SERVICE.studentAPI.getById(profileResponse.studentId);
            if (studentResponse) {
              const name = studentResponse.fullName || 
                          `${studentResponse.firstName || ''} ${studentResponse.lastName || ''}`.trim() || 
                          studentResponse.name || 
                          `Học sinh ID: ${profileResponse.studentId}`;
              
              console.log(`Fetched student name from health profile: ${name}`);
              setStudentName(name);
              setDisplayName(`${name} (ID: ${profileResponse.studentId})`);
              setLoading(false);
              return;
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching student name:`, error);
        // Nếu có lỗi nhưng có initialName hợp lệ, sử dụng initialName
        if (initialName && !initialName.includes("ID:") && !initialName.includes("Học sinh ID")) {
          setStudentName(initialName);
          setDisplayName(`${initialName} (ID: ${studentId || "N/A"})`);
        }
      } finally {
        setLoading(false);
      }
    };
    
    // Luôn gọi API để lấy tên học sinh từ ID
    fetchName();
  }, [studentId, healthProfileId, initialName]);

  return (
    <span>
      {loading ? "Đang tải..." : (displayName || studentName)}
    </span>
  );
};

// Component riêng để hiển thị tên y tá
const NurseNameCell = ({ nurseId, initialName }) => {
  const [nurseName, setNurseName] = useState(initialName || `Y tá ID: ${nurseId || "N/A"}`);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const fetchName = async () => {
      setLoading(true);
      try {
        // Nếu có nurseId, gọi API để lấy thông tin y tá
        if (nurseId) {
          // Fetch all nurses and find the one with matching ID
          const response = await API_SERVICE.nurseAPI.getAll({
            keyword: ""
          });
          
          if (Array.isArray(response)) {
            const nurse = response.find(n => n.nurseId.toString() === nurseId.toString());
            if (nurse) {
              const name = nurse.fullName || 
                          `${nurse.firstName || ''} ${nurse.lastName || ''}`.trim() || 
                          nurse.name || 
                          `Y tá ID: ${nurseId}`;
              
              console.log(`Fetched nurse name for ID ${nurseId}: ${name}`);
              setNurseName(`${name}`);
              setDisplayName(`${name} (ID: ${nurseId})`);
              setLoading(false);
              return;
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching nurse name:`, error);
        // Nếu có lỗi nhưng có initialName hợp lệ, sử dụng initialName
        if (initialName && !initialName.includes("ID:") && !initialName.includes("Y tá ID")) {
          setNurseName(initialName);
          setDisplayName(`${initialName} (ID: ${nurseId || "N/A"})`);
        }
      } finally {
        setLoading(false);
      }
    };
    
    // Luôn gọi API để lấy tên y tá từ ID
    fetchName();
  }, [nurseId, initialName]);

  return (
    <span>
      {loading ? "Đang tải..." : (displayName || nurseName)}
    </span>
  );
};

const VaxResults = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filteredNurses, setFilteredNurses] = useState([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showNurseDropdown, setShowNurseDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmAdd, setShowConfirmAdd] = useState(false);
  const [showConfirmUpdate, setShowConfirmUpdate] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  // Update the formData state to include location and injection time
  const [formData, setFormData] = useState({
    vaccinationScheduleId: "",
    healthProfileId: "",
    studentId: "",
    studentName: "",
    studentSearchTerm: "",
    nurseId: localStorage.getItem("userId") || "",
    nurseName: "",
    nurseSearchTerm: "",
    doseNumber: "1",
    reactionAfterInjection: "",
    status: "1", // Default status: Pending (1 = Pending trong backend)
    note: "",
    vaccineName: "",
    injectionDate: "",
    injectionTime: ""
  });

  // State mới cho tính năng lọc nâng cao
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filters, setFilters] = useState({
    date: "",
    studentName: "",
    nurseName: "",
    vaccineName: "",
    doseNumber: "",
    status: "all"
  });
  
  // State mới cho tính năng sắp xếp
  const [sortConfig, setSortConfig] = useState({
    key: "vaccinationResultId",
    direction: "desc"
  });

  const [statusCounts, setStatusCounts] = useState({ total: 0, completed: 0, pending: 0, cancelled: 0 });

  const { setNotif } = useNotification();

  const [selectedRows, setSelectedRows] = useState([]);
  const [showBulkCompleteConfirm, setShowBulkCompleteConfirm] = useState(false);

  const columns = [
    { 
      title: "", 
      dataIndex: "select", 
      key: "select",
      width: "40px",
      render: (_, record) => (
        record.status === "1" || record.status === "Pending" ? (
          <input 
            type="checkbox" 
            checked={selectedRows.includes(record.vaccinationResultId)}
            onChange={() => handleRowSelection(record.vaccinationResultId)}
            style={{ cursor: 'pointer' }}
          />
        ) : null
      )
    },
    { 
      title: "ID", 
      dataIndex: "vaccinationResultId", 
      key: "resultId",
      render: (id) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("vaccinationResultId")}>
          {id}
          {sortConfig.key === "vaccinationResultId" && (
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
      title: "Vaccine", 
      dataIndex: "vaccineName", 
      key: "vaccineName",
      render: (name) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("vaccineName")}>
          {name}
          {sortConfig.key === "vaccineName" && (
            <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </span>
      )
    },
    { 
      title: "Mũi số", 
      dataIndex: "doseNumber", 
      key: "doseNumber",
      render: (dose) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("doseNumber")}>
          {dose}
          {sortConfig.key === "doseNumber" && (
            <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </span>
      )
    },
    { 
      title: "Ngày tiêm", 
      dataIndex: "injectionDate", 
      key: "injectionDate",
      render: (date) => (
        <span style={{ cursor: 'pointer' }} onClick={() => handleSort("injectionDate")}>
          {date ? formatDate(date) : "N/A"}
          {sortConfig.key === "injectionDate" && (
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
      key: "status",
      render: (status) => {
        const statusText = getStatusText(status);
        const isPending = status === "1" || status === "Pending";
        const badgeStyle = {
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.85rem',
          fontWeight: '500',
          backgroundColor: isPending ? '#ffc107' : '#28a745',
          color: isPending ? '#212529' : '#fff'
        };
        
        return (
          <span style={{ cursor: 'pointer' }} onClick={() => handleSort("status")}>
            <span style={badgeStyle}>{statusText}</span>
            {sortConfig.key === "status" && (
              <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>
                {sortConfig.direction === 'asc' ? '▲' : '▼'}
              </span>
            )}
          </span>
        );
      }
    }
  ];

  const iconStyle = {
    view: { color: "#007bff" },
    edit: { color: "#28a745" },
    delete: { color: "#dc3545" }
  };

  const getStatusText = (status) => {
    // Xử lý khi status là chuỗi "Pending" hoặc "Completed"
    if (status === "Pending") return "Chưa hoàn thành";
    if (status === "Completed") return "Đã hoàn thành";
    
    // Xử lý khi status là số 1 hoặc 2, hoặc chuỗi "1" hoặc "2"
    const statusMap = {
      "1": "Chưa hoàn thành", // Pending = 1 trong backend
      "2": "Đã hoàn thành"    // Completed = 2 trong backend
    };
    
    // Chuyển đổi status thành chuỗi để đảm bảo lookup hoạt động đúng
    const statusStr = String(status);
    
    return statusMap[statusStr] || "Không xác định";
  };

  useEffect(() => {
    console.log("VaxResults component mounted");
    const fetchAllData = async () => {
      setLoading(true);
      try {
        console.log("Fetching all data...");
        await Promise.all([
          fetchNurses(),
          fetchStudents(),
          fetchVaccinationSchedules()
        ]);
        await fetchVaccinationResults();
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setNotif({
          message: "Không thể tải dữ liệu ban đầu: " + (error.message || "Lỗi không xác định"),
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  // Debug function to check state after it's set
  useEffect(() => {
    console.log("Results state updated:", results);
    
    // Check for and remove any duplicate results that might have slipped through
    const ids = new Set();
    const uniqueResults = results.filter(result => {
      if (ids.has(result.vaccinationResultId)) {
        console.warn(`Duplicate result found for ID: ${result.vaccinationResultId}, filtering it out`);
        return false;
      }
      ids.add(result.vaccinationResultId);
      return true;
    });
    
    // If we found duplicates, update the state
    if (uniqueResults.length < results.length) {
      console.log(`Filtered out ${results.length - uniqueResults.length} duplicate results`);
      setResults(uniqueResults);
    }
    
    // Check if studentName is correctly set in each result
    uniqueResults.forEach((result, index) => {
      console.log(`Result ${index} studentName:`, result.studentName);
    });
  }, [results]);

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

  const fetchStudents = async () => {
    try {
      console.log("Fetching students...");
      const response = await API_SERVICE.studentAPI.getAll({
        keyword: ""
      });
      console.log("Students API response:", response);
      if (Array.isArray(response)) {
        setStudents(response);
        localStorage.setItem('studentsList', JSON.stringify(response));
        return response;
      } else {
        console.warn("Students API did not return an array:", response);
        setStudents([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      const cachedStudents = localStorage.getItem('studentsList');
      if (cachedStudents) {
        const parsedStudents = JSON.parse(cachedStudents);
        setStudents(parsedStudents);
        return parsedStudents;
      }
      return [];
    }
  };

  // Khôi phục lại hàm fetchVaccinationResults và sửa lỗi
  const fetchVaccinationResults = async (keyword = "") => {
    console.log("Fetching vaccination results with keyword:", keyword);
    setLoading(true);
    
    try {
      // API endpoint expects only keyword parameter
      const response = await API_SERVICE.vaccinationResultAPI.getAll({
        keyword: keyword
      });
      
      console.log("Raw vaccination results response:", response);
      
      if (!response || !Array.isArray(response)) {
        console.error("Invalid response format:", response);
        setResults([]);
        setNotif({
          message: "Dữ liệu không hợp lệ từ máy chủ",
          type: "error"
        });
        return;
      }

      // Nếu có keyword và keyword là số, lọc kết quả theo ID
      if (keyword && !isNaN(keyword) && keyword.trim() !== "") {
        const keywordNum = parseInt(keyword.trim());
        const filteredResults = response.filter(result => 
          result.vaccinationResultId === keywordNum || 
          result.studentId === keywordNum ||
          result.healthProfileId === keywordNum ||
          result.vaccinationScheduleId === keywordNum
        );
        
        if (filteredResults.length > 0) {
          console.log(`Found ${filteredResults.length} results matching ID ${keywordNum}`);
          await processAndSetResults(filteredResults);
          return;
        }
      }
      
      // Nếu không tìm thấy kết quả theo ID hoặc keyword không phải số, xử lý tất cả kết quả
      await processAndSetResults(response);
    } catch (error) {
      console.error("Error fetching vaccination results:", error);
      setResults([]);
      setNotif({
        message: "Không thể tải danh sách kết quả tiêm chủng: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const processAndSetResults = async (resultsData) => {
    try {
      // Create a map to track processed IDs to avoid duplicates
      const processedIds = new Map();
      const enrichedResults = [];
      
      for (const result of resultsData) {
        // Skip if we've already processed this ID
        if (processedIds.has(result.vaccinationResultId)) {
          console.log(`Skipping duplicate result ID: ${result.vaccinationResultId}`);
          continue;
        }
        
        console.log("Processing result:", result);
        processedIds.set(result.vaccinationResultId, true);
        
        let studentName = "N/A";
        let studentId = null;
        let vaccineName = "N/A";
        let injectionDate = null;
        let nurseName = "N/A";
        let injectionTime = null;
        
        // Get detailed result information to ensure we have all fields
        try {
          const detailedResult = await API_SERVICE.vaccinationResultAPI.getById(result.vaccinationResultId);
          console.log("Detailed result:", detailedResult);
          
          if (detailedResult) {
            // Use detailed result data if available
            injectionTime = detailedResult.injectionTime || result.injectionTime || null;
          }
        } catch (detailError) {
          console.error("Error fetching detailed result:", detailError);
          // Fall back to the original result data
          injectionTime = result.injectionTime || null;
        }
        
        // Step 1: Get health profile to find student ID
        if (result.healthProfileId) {
          try {
            const profileResponse = await API_SERVICE.healthProfileAPI.getById(result.healthProfileId);
            console.log("Health profile response:", profileResponse);
            
            // Step 2: Get student information if health profile has student ID
            if (profileResponse && profileResponse.studentId) {
              studentId = profileResponse.studentId;
              console.log("Found student ID from health profile:", studentId);
              
              try {
                const studentResponse = await API_SERVICE.studentAPI.getById(studentId);
                console.log("Student response:", studentResponse);
                
                if (studentResponse) {
                  // Combine first name and last name
                  studentName = `${studentResponse.firstName || ''} ${studentResponse.lastName || ''}`.trim();
                  console.log("Student name set to:", studentName);
                }
              } catch (studentError) {
                console.error("Error fetching student data:", studentError);
              }
            }
          } catch (profileError) {
            console.error("Error fetching health profile:", profileError);
          }
        }
        
        // Step 3: Get vaccination schedule information
        if (result.vaccinationScheduleId) {
          try {
            const scheduleResponse = await API_SERVICE.vaccinationScheduleAPI.getById(result.vaccinationScheduleId);
            console.log("Schedule response:", scheduleResponse);
            
            if (scheduleResponse) {
              vaccineName = scheduleResponse.name || scheduleResponse.vaccineName || "N/A";
              injectionDate = scheduleResponse.scheduleDate || scheduleResponse.injectionDate || null;
              
              // Extract time from scheduleDate if available
              if (scheduleResponse.scheduleDate && !injectionTime) {
                try {
                  const dateObj = new Date(scheduleResponse.scheduleDate);
                  if (!isNaN(dateObj.getTime())) {
                    // Format time as HH:MM
                    const hours = dateObj.getHours().toString().padStart(2, '0');
                    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
                    injectionTime = `${hours}:${minutes}`;
                    console.log("Extracted time from scheduleDate:", injectionTime);
                  }
                } catch (timeError) {
                  console.error("Error extracting time from scheduleDate:", timeError);
                }
              }
            }
          } catch (scheduleError) {
            console.error("Error fetching schedule data:", scheduleError);
          }
        }

        // Step 4: Get nurse information
        if (result.nurseId) {
          try {
            // Using getAll instead of getById for better compatibility
            const nurseResponse = await API_SERVICE.nurseAPI.getAll({
              keyword: ""
            });
            
            if (Array.isArray(nurseResponse)) {
              const nurse = nurseResponse.find(n => n.nurseId.toString() === result.nurseId.toString());
              if (nurse) {
                nurseName = nurse.fullName || 
                          `${nurse.firstName || ''} ${nurse.lastName || ''}`.trim() || 
                          nurse.name || 
                          `Y tá ID: ${result.nurseId}`;
              }
            }
          } catch (nurseError) {
            console.error("Error fetching nurse data:", nurseError);
          }
        }
        
        // Create enriched result with all data
        const enrichedResult = {
          ...result,
          studentId: studentId,
          studentName: studentName,
          vaccineName: vaccineName,
          injectionDate: injectionDate,
          nurseName: nurseName,
          injectionTime: injectionTime
        };
        
        console.log("Final enriched result:", enrichedResult);
        enrichedResults.push(enrichedResult);
      }
      
      // Sort results by ID in ascending order (smallest to largest)
      const sortedResults = enrichedResults.sort((a, b) => a.vaccinationResultId - b.vaccinationResultId);
      
      console.log("All enriched and sorted results:", sortedResults);
      setResults(sortedResults);
      
      // Reset to first page when results change
      setPage(1);
    } catch (error) {
      console.error("Error processing results:", error);
      throw error;
    }
  };

  const fetchVaccinationSchedules = async () => {
    try {
      console.log("Fetching vaccination schedules");
      const response = await API_SERVICE.vaccinationScheduleAPI.getAll({
        keyword: "" // Chỉ cần gửi keyword, không cần gửi status
      });
      
      console.log("Raw vaccination schedules response:", response);
      
      if (!response || !Array.isArray(response)) {
        console.error("Invalid schedules response format:", response);
        setSchedules([]);
        setNotif({
          message: "Dữ liệu lịch tiêm không hợp lệ từ máy chủ",
          type: "error"
        });
        return;
      }
      
      // Don't filter by status to show all schedules
      const allSchedules = response;
      
      // Create a map to track processed IDs to avoid duplicates
      const processedIds = new Map();
      const uniqueSchedules = [];
      
      // Filter out duplicates
      for (const schedule of allSchedules) {
        if (!processedIds.has(schedule.vaccinationScheduleId)) {
          processedIds.set(schedule.vaccinationScheduleId, true);
          uniqueSchedules.push(schedule);
        }
      }
      
      // Enrich schedules with student names
      const enrichedSchedules = await Promise.all(uniqueSchedules.map(async (schedule) => {
        let studentName = "N/A";
        let studentId = null;
        
        if (schedule.healthProfileId) {
          try {
            const profileResponse = await API_SERVICE.healthProfileAPI.getById(schedule.healthProfileId);
            if (profileResponse && profileResponse.studentId) {
              studentId = profileResponse.studentId;
              const studentResponse = await API_SERVICE.studentAPI.getById(profileResponse.studentId);
              if (studentResponse) {
                studentName = `${studentResponse.firstName || ''} ${studentResponse.lastName || ''}`.trim() || "N/A";
              }
            }
          } catch (error) {
            console.error("Error fetching student details for schedule:", error);
          }
        }
        
        return {
          ...schedule,
          studentName,
          studentId
        };
      }));
      
      // Sort schedules by ID in ascending order (smallest to largest)
      const sortedSchedules = enrichedSchedules.sort((a, b) => a.vaccinationScheduleId - b.vaccinationScheduleId);
      
      console.log("Enriched and sorted schedules:", sortedSchedules);
      setSchedules(sortedSchedules);
    } catch (error) {
      console.error("Error fetching vaccination schedules:", error);
      setSchedules([]);
      setNotif({
        message: "Không thể tải danh sách lịch tiêm chủng: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
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
          result.vaccinationResultId?.toString() === searchKeyword ||
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
      await fetchVaccinationResults(searchKeyword);
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
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleRefresh = async () => {
    setSearchKeyword("");
    setPage(1);
    setLoading(true);
    try {
      console.log("Refreshing data...");
      await Promise.all([
        fetchVaccinationResults(""), 
        fetchVaccinationSchedules(),
        fetchStudents(),
        fetchNurses()
      ]);
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

  // Sửa lỗi trong hàm handleInputChange để đảm bảo tất cả các trường được cập nhật đúng
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    
    // Xử lý tất cả các trường dữ liệu bình thường bằng cách cập nhật trực tiếp
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Xử lý đặc biệt cho các trường select cần thêm xử lý
    if (name === "studentId") {
      handleStudentChange(value);
    } else if (name === "vaccinationScheduleId") {
      handleScheduleChange(value);
    }
    
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

  // Cập nhật phần định nghĩa hàm validateForm
  const validateForm = () => {
    // Danh sách các trường bắt buộc
    const requiredFields = {
      vaccinationScheduleId: "Lịch tiêm chủng",
      healthProfileId: "Hồ sơ sức khỏe",
      nurseId: "Y tá phụ trách",
      doseNumber: "Mũi số"
    };
    
    // Kiểm tra từng trường bắt buộc
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field]) {
        return false;
      }
    }
    
    // Kiểm tra đặc biệt cho healthProfileId
    if (!formData.healthProfileId) {
      return false;
    }
    
    // Kiểm tra mũi số phải là số dương
    if (parseInt(formData.doseNumber) <= 0) {
      return false;
    }
    
    return true;
  };

  // Add a helper function to fetch health profile by student ID
  const fetchHealthProfileByStudentId = async (studentId) => {
    try {
      console.log("Fetching health profile for student ID:", studentId);
      
      if (!studentId) {
        console.error("Cannot fetch health profile: Student ID is missing");
        return null;
      }
      
      const response = await API_SERVICE.healthProfileAPI.getByStudent(studentId);
      console.log("Health profile response:", response);
        
      if (!response || !response.healthProfileId) {
        console.error("Health profile not found for student ID:", studentId);
        return null;
            }
      
      return response;
    } catch (error) {
      console.error("Error fetching health profile:", error);
    return null;
    }
  };

  // Cập nhật hàm handleStudentChange để không mất dữ liệu
  const handleStudentChange = async (studentId) => {
    if (!studentId) {
      console.error("Invalid student ID");
      return;
    }
    
    // Tìm học sinh trong danh sách đã có
    const selectedStudent = students.find(s => s.studentId.toString() === studentId.toString());
    if (selectedStudent) {
      const studentName = selectedStudent.fullName || 
                          `${selectedStudent.firstName || ''} ${selectedStudent.lastName || ''}`.trim();
      
      console.log("Found student in cache:", selectedStudent);
      console.log("Student name:", studentName);
      
        // Lấy hồ sơ sức khỏe của học sinh
        const healthProfile = await fetchHealthProfileByStudentId(studentId);
      
      if (!healthProfile || !healthProfile.healthProfileId) {
        // Đã có thông báo trong hàm fetchHealthProfileByStudentId
        setFormData(prev => ({
          ...prev,
          studentId: studentId.toString(),
          studentName: studentName,
          studentSearchTerm: studentName,
          healthProfileId: ""
        }));
        return;
      }
        
      const healthProfileId = healthProfile.healthProfileId.toString();
      console.log("Found health profile ID:", healthProfileId);
      
      // Cập nhật form data, giữ lại các giá trị khác
        setFormData(prev => ({
          ...prev,
          studentId: studentId.toString(),
        studentName: studentName,
        studentSearchTerm: studentName,
        healthProfileId: healthProfileId
        }));
    } else {
      // Nếu không tìm thấy trong cache, thử lấy từ API
      try {
        const student = await API_SERVICE.studentAPI.getById(studentId);
        if (student) {
          const studentName = student.fullName || 
                             `${student.firstName || ''} ${student.lastName || ''}`.trim();
          
          // Lấy hồ sơ sức khỏe của học sinh
          const healthProfile = await fetchHealthProfileByStudentId(studentId);
          
          if (!healthProfile || !healthProfile.healthProfileId) {
            // Đã có thông báo trong hàm fetchHealthProfileByStudentId
            setFormData(prev => ({
              ...prev,
              studentId: studentId.toString(),
              studentName: studentName,
              studentSearchTerm: studentName,
              healthProfileId: ""
            }));
            return;
          }
          
          const healthProfileId = healthProfile.healthProfileId.toString();
          
          // Cập nhật form data, giữ lại các giá trị khác
          setFormData(prev => ({
            ...prev,
            studentId: studentId.toString(),
            studentName: studentName,
            studentSearchTerm: studentName,
            healthProfileId: healthProfileId
          }));
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
          
        setFormData(prev => ({
          ...prev,
            studentId: studentId.toString(),
            healthProfileId: ""
        }));
      }
    }
  };

  // Cập nhật hàm handleAddResult để cải thiện việc khởi tạo dữ liệu
  const handleAddResult = async (e) => {
    e.preventDefault();
    console.log("Add form data before validation:", formData);
    
    // Kiểm tra studentId và healthProfileId
    if (formData.studentId && !formData.healthProfileId) {
      console.log("Attempting to fetch health profile for student ID:", formData.studentId);
      const healthProfile = await fetchHealthProfileByStudentId(formData.studentId);
      
      if (healthProfile && healthProfile.healthProfileId) {
        setFormData(prev => ({
          ...prev,
          healthProfileId: healthProfile.healthProfileId.toString()
        }));
        console.log("Found and set health profile ID:", healthProfile.healthProfileId);
      } else {
        return;
      }
    }
    
    // Kiểm tra và đảm bảo tất cả dữ liệu cần thiết đã có
    if (!validateForm()) return;
    
    // Hiển thị hộp thoại xác nhận thay vì gửi ngay
    setShowConfirmAdd(true);
  };

  // Cập nhật hàm confirmAddResult để xử lý dữ liệu tốt hơn
  const confirmAddResult = async () => {
    setShowConfirmAdd(false);
    setLoading(true);
    
    try {
      console.log("Original form data for add:", formData);
      
      // Kiểm tra lại healthProfileId
      if (!formData.healthProfileId) {
        throw new Error("Không tìm thấy hồ sơ sức khỏe của học sinh này. Vui lòng chọn học sinh khác.");
      }
      
      // Tạo object dữ liệu đã làm sạch để gửi đến API, chỉ bao gồm các trường BE hỗ trợ
      const cleanedData = {
        vaccinationScheduleId: parseInt(formData.vaccinationScheduleId),
        healthProfileId: parseInt(formData.healthProfileId),
        nurseId: parseInt(formData.nurseId || localStorage.getItem("userId")),
        doseNumber: parseInt(formData.doseNumber),
        note: formData.note || ""
      };
      
      // Kiểm tra lại các giá trị
      for (const [key, value] of Object.entries(cleanedData)) {
        if (key !== 'note' && (value === null || value === undefined || isNaN(value))) {
          throw new Error(`Trường ${key} không hợp lệ. Vui lòng kiểm tra lại.`);
        }
      }
      
      console.log("Sending cleaned data to API for new vaccination result:", cleanedData);
      
      // Gọi API để tạo kết quả mới
      const response = await API_SERVICE.vaccinationResultAPI.create(cleanedData);
      console.log("API response after adding vaccination result:", response);
      
      if (response) {
        // Đóng modal và reset form
      setShowAddModal(false);
        resetForm();
        
        // Làm mới dữ liệu bảng
        await fetchVaccinationResults("");
      }
    } catch (error) {
      console.error("Error adding vaccination result:", error);
      // Log thêm chi tiết lỗi
      if (error.message) console.error("Error message:", error.message);
      if (error.response) console.error("Error response:", error.response);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật hàm handleUpdateResult
  const handleUpdateResult = async (e) => {
    e.preventDefault();
    console.log("Update form data before validation:", formData);
    
    if (!validateForm()) return;
    
      // Show confirmation dialog instead of immediately submitting
      setShowConfirmUpdate(true);
  };

  // Cập nhật hàm confirmUpdateResult để gửi chỉ những trường mà BE hỗ trợ
  const confirmUpdateResult = async () => {
    setShowConfirmUpdate(false);
    setLoading(true);
    
    try {
      console.log("Original form data for update:", formData);
      
      if (!selectedResult || !selectedResult.vaccinationResultId) {
        throw new Error("Không tìm thấy thông tin kết quả tiêm chủng cần cập nhật");
      }
      
      // Tạo đối tượng dữ liệu chỉ với các trường mà backend hỗ trợ
      const cleanedData = {
        vaccinationResultId: parseInt(selectedResult.vaccinationResultId),
        nurseId: parseInt(formData.nurseId),
        doseNumber: parseInt(formData.doseNumber),
        note: formData.note || ""
      };
      
      // Kiểm tra lại các giá trị
      if (!cleanedData.vaccinationResultId || isNaN(cleanedData.vaccinationResultId)) {
        throw new Error("ID kết quả tiêm chủng không hợp lệ");
      }
      
      if (!cleanedData.nurseId || isNaN(cleanedData.nurseId)) {
        throw new Error("ID y tá không hợp lệ");
      }
      
      if (!cleanedData.doseNumber || isNaN(cleanedData.doseNumber) || cleanedData.doseNumber <= 0) {
        throw new Error("Mũi số không hợp lệ. Vui lòng nhập số lớn hơn 0");
      }
      
      console.log("Sending update request with only supported fields:", cleanedData);
      
      // Gọi API cập nhật
      const response = await API_SERVICE.vaccinationResultAPI.update(
        selectedResult.vaccinationResultId,
        cleanedData
      );
      
      console.log("API response after updating vaccination result:", response);
      
      if (response) {
        // Đóng modal và làm mới dữ liệu
      setShowEditModal(false);
        await fetchVaccinationResults("");
      }
    } catch (error) {
      console.error("Error updating vaccination result:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResult = async () => {
    setLoading(true);
    try {
      await API_SERVICE.vaccinationResultAPI.delete(selectedResult.vaccinationResultId);
      setShowDeleteModal(false);
      await fetchVaccinationResults("");
    } catch (error) {
      console.error("Error deleting vaccination result:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm mới để đánh dấu hoàn thành kết quả tiêm chủng
  const handleCompleteResult = async (id) => {
    setLoading(true);
    try {
      await API_SERVICE.vaccinationResultAPI.complete(id);
      await fetchVaccinationResults("");
    } catch (error) {
      console.error("Error completing vaccination result:", error);
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm resetForm để khởi tạo lại form sau khi thêm hoặc sửa
  const resetForm = () => {
    // Lấy thông tin y tá hiện tại từ localStorage
    const currentNurseId = localStorage.getItem("userId") || "";
    let nurseName = "";
    
    // Nếu có ID y tá, tìm tên y tá từ danh sách
    if (currentNurseId) {
      const nurse = nurses.find(n => n.nurseId.toString() === currentNurseId.toString());
      if (nurse) {
        nurseName = nurse.fullName || `${nurse.firstName || ''} ${nurse.lastName || ''}`.trim() || `Y tá ID: ${currentNurseId}`;
      }
    }
    
    setFormData({
      vaccinationScheduleId: "",
      healthProfileId: "",
      studentId: "",
      studentName: "",
      studentSearchTerm: "",
      nurseId: currentNurseId,
      nurseName: nurseName,
      nurseSearchTerm: nurseName,
      doseNumber: "1",
      reactionAfterInjection: "",
      status: "1", // Default status: Pending (1 = Pending trong backend)
      note: "",
      vaccineName: "",
      injectionDate: "",
      injectionTime: ""
    });
  };

  // Cập nhật hàm xem chi tiết để hiển thị đúng thông tin
  const handleView = (result) => {
    console.log("Viewing result details:", result);
    
    // Lấy thông tin chi tiết từ API để đảm bảo có dữ liệu đầy đủ nhất
    API_SERVICE.vaccinationResultAPI.getById(result.vaccinationResultId)
      .then(detailedResult => {
        console.log("Detailed result for view:", detailedResult);
        
        // Kết hợp dữ liệu chi tiết với dữ liệu ban đầu
        const mergedResult = {
          ...result,
          ...detailedResult,
          // Giữ lại ID gốc
          vaccinationResultId: result.vaccinationResultId
        };
        
        // Xử lý định dạng thời gian nếu cần
        if (mergedResult.scheduleDate && !mergedResult.injectionTime) {
          try {
            const dateObj = new Date(mergedResult.scheduleDate);
            if (!isNaN(dateObj.getTime())) {
              // Định dạng thời gian thành HH:MM
              const timeString = dateObj.toTimeString().split(' ')[0].substring(0, 5);
              mergedResult.injectionTime = timeString;
              console.log("Extracted time from scheduleDate:", timeString);
            }
          } catch (timeError) {
            console.error("Error extracting time from scheduleDate:", timeError);
          }
        }
        
        setSelectedResult(mergedResult);
        setShowViewModal(true);
      })
      .catch(error => {
        console.error("Error fetching detailed result for view:", error);
        
        // Nếu có lỗi, vẫn hiển thị với dữ liệu ban đầu
    setSelectedResult(result);
    setShowViewModal(true);
      });
  };

  // Cập nhật hàm handleEdit để đảm bảo tất cả các trường dữ liệu được điền đầy đủ
  const handleEdit = (result) => {
    console.log("Editing vaccination result:", result);
    setSelectedResult(result);
    
    // Lấy tên học sinh và y tá từ ID
    let studentName = "";
    let nurseName = "";
        
    // Tìm thông tin học sinh
    if (result.studentId) {
      const student = students.find(s => s.studentId === result.studentId);
      if (student) {
        studentName = student.fullName || `Học sinh ID: ${result.studentId}`;
      }
    }
    
    // Tìm thông tin y tá
    if (result.nurseId) {
      const nurse = nurses.find(n => n.nurseId === result.nurseId);
      if (nurse) {
        nurseName = nurse.fullName || `Y tá ID: ${result.nurseId}`;
      }
    }
    
    // Tìm thông tin lịch tiêm chủng
    let scheduleName = "";
    let injectionDate = "";
    let injectionTime = "";
    
    if (result.vaccinationScheduleId) {
      const schedule = schedules.find(s => s.vaccinationScheduleId === result.vaccinationScheduleId);
      if (schedule) {
        scheduleName = schedule.vaccineName || schedule.name || `Lịch #${result.vaccinationScheduleId}`;
        
        // Lấy ngày và giờ tiêm từ lịch tiêm chủng
        if (schedule.scheduleDate) {
          const dateObj = new Date(schedule.scheduleDate);
          if (!isNaN(dateObj.getTime())) {
            injectionDate = dateObj.toISOString().split('T')[0];
        
            // Định dạng thời gian thành HH:MM
            const hours = dateObj.getHours().toString().padStart(2, '0');
            const minutes = dateObj.getMinutes().toString().padStart(2, '0');
            injectionTime = `${hours}:${minutes}`;
          }
        }
      }
    }
    
    // Khởi tạo form data với dữ liệu từ kết quả đã chọn
    setFormData({
      vaccinationResultId: result.vaccinationResultId,
          vaccinationScheduleId: result.vaccinationScheduleId?.toString() || "",
      vaccinationScheduleName: scheduleName,
          healthProfileId: result.healthProfileId?.toString() || "",
          studentId: result.studentId?.toString() || "",
      studentName: studentName,
      studentSearchTerm: result.studentName || studentName,
          nurseId: result.nurseId?.toString() || "",
      nurseName: result.nurseName || nurseName,
      nurseSearchTerm: result.nurseName || nurseName,
      doseNumber: result.doseNumber?.toString() || "",
          note: result.note || "",
      status: result.status?.toString() || "1",
      injectionDate: injectionDate || "",
      injectionTime: injectionTime || ""
    });
    
    setShowEditModal(true);
  };

  const handleDelete = (result) => {
    console.log("Deleting result:", result);
    setSelectedResult(result);
    setShowDeleteModal(true);
  };

  // Cập nhật hàm handleScheduleChange để không mất dữ liệu
  const handleScheduleChange = async (scheduleId) => {
    console.log("Vaccination schedule changed to:", scheduleId);
    
    if (!scheduleId) {
      setFormData(prev => ({
        ...prev,
        vaccinationScheduleId: "",
        vaccineName: ""
      }));
      return;
    }
    
    // Tìm lịch trong danh sách đã có
    const existingSchedule = schedules.find(s => s.vaccinationScheduleId.toString() === scheduleId.toString());
    
    if (existingSchedule) {
      console.log("Using existing schedule data:", existingSchedule);
      
      let extractedTime = "";
      // Trích xuất thời gian từ scheduleDate nếu có
      if (existingSchedule.scheduleDate) {
        try {
          const dateObj = new Date(existingSchedule.scheduleDate);
          if (!isNaN(dateObj.getTime())) {
            // Định dạng thời gian thành HH:MM
            const hours = dateObj.getHours().toString().padStart(2, '0');
            const minutes = dateObj.getMinutes().toString().padStart(2, '0');
            extractedTime = `${hours}:${minutes}`;
            console.log("Extracted time from existing scheduleDate:", extractedTime);
          }
        } catch (timeError) {
          console.error("Error extracting time from existing scheduleDate:", timeError);
        }
      }
      
      // Cập nhật form data, giữ lại các giá trị khác
      setFormData(prev => ({
        ...prev,
        vaccinationScheduleId: scheduleId.toString(),
        vaccineName: existingSchedule.vaccineName || existingSchedule.name || "",
        injectionDate: existingSchedule.scheduleDate ? new Date(existingSchedule.scheduleDate).toISOString().split('T')[0] : prev.injectionDate || "",
        injectionTime: extractedTime || existingSchedule.injectionTime || prev.injectionTime || ""
      }));
    } else {
      // Nếu không tìm thấy trong cache, thử lấy từ API
      try {
        const schedule = await API_SERVICE.vaccinationScheduleAPI.getById(scheduleId);
        console.log("Fetched schedule details:", schedule);
        
        if (schedule) {
          let extractedTime = "";
          // Trích xuất thời gian từ scheduleDate nếu có
          if (schedule.scheduleDate) {
            try {
              const dateObj = new Date(schedule.scheduleDate);
              if (!isNaN(dateObj.getTime())) {
                // Định dạng thời gian thành HH:MM
                const hours = dateObj.getHours().toString().padStart(2, '0');
                const minutes = dateObj.getMinutes().toString().padStart(2, '0');
                extractedTime = `${hours}:${minutes}`;
                console.log("Extracted time from scheduleDate:", extractedTime);
              }
            } catch (timeError) {
              console.error("Error extracting time from scheduleDate:", timeError);
            }
          }
          
          // Cập nhật form data, giữ lại các giá trị khác
          setFormData(prev => ({
            ...prev,
            vaccinationScheduleId: scheduleId.toString(),
            vaccineName: schedule.vaccineName || schedule.name || "",
            injectionDate: schedule.scheduleDate ? new Date(schedule.scheduleDate).toISOString().split('T')[0] : prev.injectionDate || "",
            injectionTime: extractedTime || schedule.injectionTime || prev.injectionTime || ""
          }));
        }
      } catch (error) {
        console.error("Error fetching schedule details:", error);
        setFormData(prev => ({
          ...prev,
          vaccinationScheduleId: scheduleId.toString()
        }));
    }
    }
  };



  // Update the handler for student ID fetching from schedule
  const getStudentInfoFromSchedule = async (schedule) => {
    if (!schedule) return { studentId: "", studentName: "", healthProfileId: "" };
    
    let studentId = schedule.studentId || "";
    let studentName = schedule.studentName || "";
    let healthProfileId = schedule.healthProfileId || "";
    
    // If we have a student ID but no name, try to get it
    if (studentId && !studentName) {
      const selectedStudent = students.find(s => s.studentId.toString() === studentId.toString());
      if (selectedStudent) {
        studentName = selectedStudent.fullName || 
                     `${selectedStudent.firstName || ''} ${selectedStudent.lastName || ''}`.trim() || 
                     selectedStudent.name || 
                     `Học sinh ID: ${studentId}`;
      } else {
        try {
          const studentResponse = await API_SERVICE.studentAPI.getById(studentId);
          if (studentResponse) {
            studentName = studentResponse.fullName || 
                        `${studentResponse.firstName || ''} ${studentResponse.lastName || ''}`.trim() || 
                        studentResponse.name || 
                        `Học sinh ID: ${studentId}`;
          }
        } catch (error) {
          console.error("Error fetching student info:", error);
        }
      }
    }
    
    // If we have a health profile ID but no student info, try to get it from the health profile
    if (healthProfileId && !studentId) {
      try {
        const profileResponse = await API_SERVICE.healthProfileAPI.getById(healthProfileId);
        console.log("Health profile response:", profileResponse);
        
        if (profileResponse && profileResponse.studentId) {
          studentId = profileResponse.studentId;
          
          // Try to get student name
          try {
            const studentResponse = await API_SERVICE.studentAPI.getById(studentId);
            if (studentResponse) {
              studentName = studentResponse.fullName || 
                          `${studentResponse.firstName || ''} ${studentResponse.lastName || ''}`.trim() || 
                          studentResponse.name || 
                          `Học sinh ID: ${studentId}`;
            }
          } catch (studentError) {
            console.error("Error fetching student data:", studentError);
          }
        }
      } catch (profileError) {
        console.error("Error fetching health profile:", profileError);
      }
    }
    
    // If we have a student ID but no health profile ID, try to find it
    if (studentId && !healthProfileId) {
      const healthProfile = await fetchHealthProfileByStudentId(studentId);
      if (healthProfile && healthProfile.healthProfileId) {
        healthProfileId = healthProfile.healthProfileId.toString();
      }
    }
    
    return { studentId, studentName, healthProfileId };
  };

  // Tính toán số lượng theo trạng thái
  const calculateStatusCounts = () => {
    const total = results.length;
    const completed = results.filter(r => r.status === "1").length;
    const pending = results.filter(r => r.status === "0").length;
    const cancelled = results.filter(r => r.status === "2").length;
    setStatusCounts({ total, completed, pending, cancelled });
  };

  useEffect(() => {
    calculateStatusCounts();
  }, [results]);

  // Hàm xử lý khi người dùng chọn một học sinh từ dropdown
  const handleSelectStudent = (student) => {
    setFormData({
      ...formData,
      studentId: student.studentId,
      studentName: student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || `Học sinh ID: ${student.studentId}`,
      studentSearchTerm: student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || `Học sinh ID: ${student.studentId}`
    });
    setShowStudentDropdown(false);
    
    // Gọi hàm handleStudentChange để xử lý các logic liên quan đến việc chọn học sinh
    handleStudentChange(student.studentId);
  };

  // Hàm xử lý khi người dùng chọn một y tá từ dropdown
  const handleSelectNurse = (nurse) => {
    setFormData({
      ...formData,
      nurseId: nurse.nurseId,
      nurseName: nurse.fullName || `${nurse.firstName || ''} ${nurse.lastName || ''}`.trim() || `Y tá ID: ${nurse.nurseId}`,
      nurseSearchTerm: nurse.fullName || `${nurse.firstName || ''} ${nurse.lastName || ''}`.trim() || `Y tá ID: ${nurse.nurseId}`
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
        if (!result.injectionDate) return false;
        const injectionDate = new Date(result.injectionDate);
        return injectionDate >= selectedDate && injectionDate <= endDate;
      });
    }
    
    // Lọc theo tên hoặc ID học sinh
    if (currentFilters.studentName) {
      filteredData = filteredData.filter(result => {
        // Tìm theo tên học sinh
        const studentName = result.studentName || "";
        
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
        const nurseName = result.nurseName || "";
        
        // Tìm theo ID y tá
        const nurseId = result.nurseId ? result.nurseId.toString() : "";
        
        // Trả về true nếu tên hoặc ID chứa từ khóa tìm kiếm
        return nurseName.toLowerCase().includes(currentFilters.nurseName.toLowerCase()) || 
               nurseId.includes(currentFilters.nurseName);
      });
    }
    
    // Lọc theo tên vaccine
    if (currentFilters.vaccineName) {
      filteredData = filteredData.filter(result => 
        result.vaccineName && result.vaccineName.toLowerCase().includes(currentFilters.vaccineName.toLowerCase())
      );
    }
    
    // Lọc theo mũi số
    if (currentFilters.doseNumber) {
      filteredData = filteredData.filter(result => 
        result.doseNumber && result.doseNumber.toString() === currentFilters.doseNumber
      );
    }
    
    // Lọc theo trạng thái
    if (currentFilters.status !== "all") {
      filteredData = filteredData.filter(result => {
        // Xử lý khi status là chuỗi "Pending" hoặc "Completed"
        if (currentFilters.status === "1" && (result.status === "1" || result.status === "Pending")) {
          return true;
        }
        if (currentFilters.status === "2" && (result.status === "2" || result.status === "Completed")) {
          return true;
        }
        // Xử lý khi status là số hoặc chuỗi số
        return result.status && result.status.toString() === currentFilters.status;
      });
    }
    
    // Áp dụng sắp xếp
    if (currentSortConfig.key) {
      filteredData.sort((a, b) => {
        if (currentSortConfig.key === "vaccinationResultId") {
          // So sánh ID (số)
          const idA = a.vaccinationResultId || 0;
          const idB = b.vaccinationResultId || 0;
          
          if (currentSortConfig.direction === "asc") {
            return idA - idB;
          } else {
            return idB - idA;
          }
        }
        else if (currentSortConfig.key === "injectionDate") {
          // So sánh ngày
          const dateA = a.injectionDate ? new Date(a.injectionDate).getTime() : 0;
          const dateB = b.injectionDate ? new Date(b.injectionDate).getTime() : 0;
          
          if (currentSortConfig.direction === "asc") {
            return dateA - dateB;
          } else {
            return dateB - dateA;
          }
        }
        else if (currentSortConfig.key === "doseNumber") {
          // So sánh mũi số (số)
          const doseA = parseInt(a.doseNumber) || 0;
          const doseB = parseInt(b.doseNumber) || 0;
          
          if (currentSortConfig.direction === "asc") {
            return doseA - doseB;
          } else {
            return doseB - doseA;
          }
        }
        else if (currentSortConfig.key === "status") {
          // So sánh trạng thái - xử lý cả chuỗi và số
          let statusA = 0;
          let statusB = 0;
          
          // Xử lý khi status là chuỗi "Pending" hoặc "Completed"
          if (a.status === "Pending") statusA = 1;
          else if (a.status === "Completed") statusA = 2;
          else statusA = parseInt(a.status) || 0;
          
          if (b.status === "Pending") statusB = 1;
          else if (b.status === "Completed") statusB = 2;
          else statusB = parseInt(b.status) || 0;
          
          if (currentSortConfig.direction === "asc") {
            return statusA - statusB;
          } else {
            return statusB - statusA;
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
      vaccineName: "",
      doseNumber: "",
      status: "all"
    };
    setFilters(resetFilterValues);
    // Áp dụng ngay lập tức các bộ lọc đã reset
    applyFiltersAndSort(results, resetFilterValues, sortConfig);
  };

  // Hàm xử lý chọn/bỏ chọn một hàng
  const handleRowSelection = (resultId) => {
    setSelectedRows(prev => {
      if (prev.includes(resultId)) {
        return prev.filter(id => id !== resultId);
      } else {
        return [...prev, resultId];
      }
    });
  };

  // Hàm xử lý đánh dấu hoàn thành hàng loạt
  const handleBulkComplete = async () => {
    setShowBulkCompleteConfirm(false);
    setLoading(true);
    
    try {
      // Xử lý từng kết quả được chọn
      for (const resultId of selectedRows) {
        await API_SERVICE.vaccinationResultAPI.complete(resultId);
      }
      
      // Làm mới dữ liệu
      await fetchVaccinationResults("");
      
      // Reset danh sách đã chọn
      setSelectedRows([]);
      
      setNotif({
        message: `Đã đánh dấu hoàn thành ${selectedRows.length} kết quả tiêm chủng`,
        type: "success"
      });
    } catch (error) {
      console.error("Error completing vaccination results:", error);
      setNotif({
        message: "Không thể đánh dấu hoàn thành một số kết quả tiêm chủng",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-main">
      <h2 className="dashboard-title">Kết quả tiêm chủng</h2>
      

      
      <div className="admin-header">
        <button className="admin-btn" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Thêm kết quả tiêm chủng
        </button>
        {selectedRows.length > 0 && (
          <button 
            className="admin-btn" 
            style={{ backgroundColor: '#28a745', marginLeft: '10px' }}
            onClick={() => setShowBulkCompleteConfirm(true)}
          >
            <FaCheck /> Đánh dấu hoàn thành ({selectedRows.length})
          </button>
        )}
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
              <label htmlFor="date" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Ngày tiêm</label>
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
            
            {/* Lọc theo tên vaccine */}
            <div>
              <label htmlFor="vaccineName" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Vaccine</label>
              <input
                type="text"
                id="vaccineName"
                name="vaccineName"
                value={filters.vaccineName}
                onChange={handleFilterChange}
                className="form-control"
                placeholder="Nhập tên vaccine..."
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            
            {/* Lọc theo mũi số */}
            <div>
              <label htmlFor="doseNumber" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Mũi số</label>
              <select
                id="doseNumber"
                name="doseNumber"
                value={filters.doseNumber}
                onChange={handleFilterChange}
                className="form-control"
                style={{ width: '100%', padding: '8px' }}
              >
                <option value="">Tất cả</option>
                <option value="1">Mũi 1</option>
                <option value="2">Mũi 2</option>
                <option value="3">Mũi 3</option>
                <option value="4">Mũi 4</option>
              </select>
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
                <option value="1">Chưa hoàn thành</option>
                <option value="2">Đã hoàn thành</option>
              </select>
            </div>
          </div>
          
          {/* Phần sắp xếp */}
          <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center' }}>
            <div style={{ marginRight: '15px' }}>
              <span style={{ fontSize: '0.9rem', marginRight: '8px' }}>Sắp xếp theo:</span>
              <select
                value={sortConfig.key}
                onChange={(e) => setSortConfig({...sortConfig, key: e.target.value})}
                className="form-control"
                style={{ display: 'inline-block', width: 'auto', padding: '6px' }}
              >
                <option value="vaccinationResultId">ID</option>
                <option value="injectionDate">Ngày tiêm</option>
                <option value="studentName">Học sinh</option>
                <option value="nurseName">Y tá</option>
                <option value="doseNumber">Mũi số</option>
                <option value="reactionAfterInjection">Phản ứng</option>
                <option value="status">Trạng thái</option>
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
            data={filteredResults.length > 0 || Object.values(filters).some(val => val !== "" && val !== "all") ? filteredResults : results}
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
                  <FaEye style={{ color: "#007bff" }} size={18} />
                </button>
                <button
                  className="admin-action-btn admin-action-btn-reset"
                  title="Chỉnh sửa"
                  onClick={() => handleEdit(row)}
                >
                  <FaEdit style={{ color: "#28a745" }} size={18} />
                </button>
                  <button
                  className="admin-action-btn admin-action-btn-reset"
                    title="Xóa"
                    onClick={() => handleDelete(row)}
                  >
                    <FaTrash style={{ color: "#dc3545" }} size={18} />
                </button>
                  {row.status === "1" && (
                    <button
                      className="admin-action-btn admin-action-btn-reset"
                      title="Đánh dấu hoàn thành"
                      onClick={() => handleCompleteResult(row.vaccinationResultId)}
                      style={{ 
                        backgroundColor: "rgba(40, 167, 69, 0.1)", 
                        padding: "6px",
                        borderRadius: "4px"
                      }}
                    >
                      <FaCheck style={{ color: "#28a745" }} size={18} />
                    </button>
                  )}
              </div>
            )}
            loading={loading}
          />
        )}
      </div>

      {/* Modal thêm kết quả tiêm */}
      {showAddModal && (
        <div className="student-create-modal-overlay">
          <div className="student-create-modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Thêm kết quả tiêm chủng</h3>
              <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
            </div>
            <form onSubmit={handleAddResult}>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="vaccinationScheduleId" className="form-label">Lịch tiêm chủng <span className="text-danger">*</span></label>
                <select
                    className="form-control"
                    id="vaccinationScheduleId"
                  name="vaccinationScheduleId"
                      value={formData.vaccinationScheduleId || ""}
                      onChange={handleInputChange}
                  required
                >
                      <option value="">-- Chọn lịch tiêm chủng --</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.vaccinationScheduleId} value={schedule.vaccinationScheduleId}>
                          {schedule.vaccineName || schedule.name || `Lịch #${schedule.vaccinationScheduleId}`}
                    </option>
                  ))}
                </select>
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
                  <label htmlFor="nurseId" className="form-label">Y tá phụ trách <span className="text-danger">*</span></label>
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
                      required
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

                <div className="mb-3">
                  <label htmlFor="doseNumber" className="form-label">Mũi số <span className="text-danger">*</span></label>
                <input
                  type="number"
                    className="form-control"
                    id="doseNumber"
                  name="doseNumber"
                  value={formData.doseNumber}
                  onChange={handleInputChange}
                  required
                  min="1"
                  placeholder="Nhập số mũi tiêm"
                />
              </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="injectionDate" className="form-label">Ngày tiêm</label>
                      <input
                        type="date"
                      className="form-control"
                      id="injectionDate"
                        name="injectionDate"
                        value={formData.injectionDate ? new Date(formData.injectionDate).toISOString().split('T')[0] : ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="injectionTime" className="form-label">Giờ tiêm</label>
                      <input
                        type="time"
                      className="form-control"
                      id="injectionTime"
                        name="injectionTime"
                        value={formData.injectionTime || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                <div className="mb-3">
                  <label htmlFor="reactionAfterInjection" className="form-label">Phản ứng sau tiêm</label>
                <textarea
                    className="form-control"
                    id="reactionAfterInjection"
                  name="reactionAfterInjection"
                  value={formData.reactionAfterInjection}
                  onChange={handleInputChange}
                  placeholder="Nhập phản ứng sau tiêm (nếu có)"
                    rows={3}
                ></textarea>
              </div>



                <div className="mb-3">
                  <label htmlFor="note" className="form-label">Ghi chú</label>
                <textarea
                    className="form-control"
                    id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Nhập ghi chú"
                    rows={3}
                ></textarea>
              </div>
                </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Đang thêm..." : "Lưu"}
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

      {/* Modal xem chi tiết kết quả tiêm */}
      {showViewModal && selectedResult && (
        <div className="student-dialog-overlay">
          <div className="student-dialog-content" style={{ width: '700px', maxWidth: '90%' }}>
            <div className="student-dialog-header">
              <h2>Chi tiết kết quả tiêm chủng</h2>
              <button className="student-dialog-close" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="student-dialog-body">
              <div className="student-info-section">
                <h3 className="section-heading-blue">Thông tin chung</h3>
              <div className="info-grid">
                <div className="info-item">
                    <label>ID:</label>
                    <span>{selectedResult.vaccinationResultId}</span>
                </div>
                <div className="info-item">
                    <label>Lịch khám:</label>
                    <span>{selectedResult.vaccineName || "Không có"}</span>
                </div>
                <div className="info-item">
                    <label>Học sinh:</label>
                    <span>
                    <StudentNameCell 
                      studentId={selectedResult.studentId} 
                      initialName={selectedResult.studentName} 
                      healthProfileId={selectedResult.healthProfileId} 
                    />
                    </span>
                </div>
                <div className="info-item">
                    <label>Y tá phụ trách:</label>
                    <span>
                    <NurseNameCell 
                      nurseId={selectedResult.nurseId} 
                      initialName={selectedResult.nurseName} 
                    />
                    </span>
                </div>
                </div>
              </div>
              <div className="student-info-section">
                <h3 className="section-heading-blue">Kết quả tiêm</h3>
                <div className="info-grid">
                <div className="info-item">
                    <label>Mũi số:</label>
                    <span>{selectedResult.doseNumber || "Không có"}</span>
                </div>
                <div className="info-item">
                    <label>Ngày tiêm:</label>
                    <span>{selectedResult.injectionDate ? formatDate(selectedResult.injectionDate) : "Không có"}</span>
                </div>
                <div className="info-item">
                    <label>Giờ tiêm:</label>
                    <span>{selectedResult.injectionTime || "Không có"}</span>
                </div>
                <div className="info-item">
                    <label>Trạng thái:</label>
                    <span>{getStatusText(selectedResult.status)}</span>
                </div>
                  <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                    <label>Phản ứng sau tiêm:</label>
                    <span>{selectedResult.reactionAfterInjection || "Không có"}</span>
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
              {selectedResult && selectedResult.status === "1" && (
                <button 
                  className="admin-btn" 
                  style={{ background: '#28a745', marginRight: '10px' }} 
                  onClick={() => handleCompleteResult(selectedResult.vaccinationResultId)}
                >
                  Đánh dấu hoàn thành
              </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa kết quả tiêm */}
      {showEditModal && (
        <div className="student-create-modal-overlay">
          <div className="student-create-modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Chỉnh sửa kết quả tiêm chủng</h3>
              <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
            </div>
            <form onSubmit={handleUpdateResult}>
              <div className="modal-body">
                <input type="hidden" name="vaccinationResultId" value={formData.vaccinationResultId} />
                <div className="mb-3">
                  <label htmlFor="vaccinationScheduleId" className="form-label">Lịch tiêm chủng <span className="text-danger">*</span></label>
                <select
                    className="form-control"
                    id="vaccinationScheduleId"
                  name="vaccinationScheduleId"
                      value={formData.vaccinationScheduleId || ""}
                      onChange={handleInputChange}
                  required
                    disabled={true}
                >
                      <option value="">-- Chọn lịch tiêm chủng --</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.vaccinationScheduleId} value={schedule.vaccinationScheduleId}>
                          {schedule.vaccineName || schedule.name || `Lịch #${schedule.vaccinationScheduleId}`}
                    </option>
                  ))}
                </select>
              </div>

                <div className="mb-3">
                  <label htmlFor="studentId" className="form-label">Học sinh <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="studentId"
                    name="studentSearchTerm"
                    value={formData.studentSearchTerm}
                    readOnly
                    disabled={true}
                    style={{ backgroundColor: "#e9ecef" }}
                  />
                  </div>
                  
                <div className="mb-3">
                  <label htmlFor="nurseId" className="form-label">Y tá phụ trách <span className="text-danger">*</span></label>
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
                      required
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

                <div className="mb-3">
                  <label htmlFor="doseNumber" className="form-label">Mũi số <span className="text-danger">*</span></label>
                <input
                  type="number"
                    className="form-control"
                    id="doseNumber"
                  name="doseNumber"
                  value={formData.doseNumber}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="injectionDate" className="form-label">Ngày tiêm</label>
                      <input
                        type="date"
                      className="form-control"
                      id="injectionDate"
                        name="injectionDate"
                        value={formData.injectionDate ? new Date(formData.injectionDate).toISOString().split('T')[0] : ""}
                        onChange={handleInputChange}
                      disabled={true}
                      />
                    </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="injectionTime" className="form-label">Giờ tiêm</label>
                      <input
                        type="time"
                      className="form-control"
                      id="injectionTime"
                        name="injectionTime"
                        value={formData.injectionTime || ""}
                        onChange={handleInputChange}
                      disabled={true}
                      />
                    </div>
                  </div>

                <div className="mb-3">
                  <label htmlFor="note" className="form-label">Ghi chú</label>
                <textarea
                    className="form-control"
                    id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                    rows={3}
                ></textarea>
              </div>
                </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
                </button>
                {formData.status === "1" && (
                <button
                  type="button"
                    className="btn btn-success" 
                    onClick={() => {
                      setShowEditModal(false);
                      handleCompleteResult(formData.vaccinationResultId);
                    }}
                  disabled={loading}
                >
                    Đánh dấu hoàn thành
                  </button>
                )}
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {showDeleteModal && selectedResult && (
        <div className="student-delete-modal-overlay">
          <div className="student-delete-modal-content">
            <div className="student-delete-modal-title">
              <strong>Xác nhận xóa kết quả tiêm chủng?</strong>
            </div>
            <div className="student-delete-modal-actions">
              <button className="btn btn-danger" onClick={handleDeleteResult}>
                Xác nhận
              </button>
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận thêm kết quả */}
      {showConfirmAdd && (
        <div className="student-delete-modal-overlay">
          <div className="student-delete-modal-content">
            <div className="student-delete-modal-title">
              <strong>Xác nhận thêm kết quả tiêm chủng mới?</strong>
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

      {/* Modal xác nhận cập nhật kết quả */}
      {showConfirmUpdate && (
        <div className="student-delete-modal-overlay">
          <div className="student-delete-modal-content">
            <div className="student-delete-modal-title">
              <strong>Xác nhận cập nhật kết quả tiêm chủng?</strong>
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

      {/* Modal xác nhận đánh dấu hoàn thành hàng loạt */}
      {showBulkCompleteConfirm && (
        <div className="student-delete-modal-overlay">
          <div className="student-delete-modal-content">
            <div className="student-delete-modal-title">
              <strong>Xác nhận đánh dấu hoàn thành {selectedRows.length} kết quả tiêm chủng?</strong>
                </div>
            <div className="student-delete-modal-actions">
              <button className="btn btn-success" onClick={handleBulkComplete}>
                Xác nhận
              </button>
              <button className="btn btn-secondary" onClick={() => setShowBulkCompleteConfirm(false)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaxResults; 

