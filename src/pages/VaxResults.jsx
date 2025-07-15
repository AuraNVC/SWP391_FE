import React, { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { API_SERVICE } from "../services/api";
import TableWithPaging from "../components/TableWithPaging";
import { useNotification } from "../contexts/NotificationContext";
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
    status: "1", // Default status: Completed
    note: "",
    vaccineName: "",
    injectionDate: "",
    injectionTime: ""
  });

  const [statusCounts, setStatusCounts] = useState({ total: 0, completed: 0, pending: 0, cancelled: 0 });

  const { setNotif } = useNotification();

  const columns = [
    { title: "ID", dataIndex: "vaccinationResultId", key: "resultId" },
    { 
      title: "Học sinh", 
      dataIndex: "studentName", 
      key: "studentName",
      render: (name, record) => {
        return <StudentNameCell 
                 studentId={record.studentId} 
                 initialName={record.studentName} 
                 healthProfileId={record.healthProfileId} 
               />;
      }
    },
    { title: "Vaccine", dataIndex: "vaccineName", key: "vaccineName" },
    { title: "Mũi số", dataIndex: "doseNumber", key: "doseNumber" },
    { 
      title: "Ngày tiêm", 
      dataIndex: "injectionDate", 
      key: "injectionDate",
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : "N/A" 
    },
    { 
      title: "Trạng thái", 
      dataIndex: "status", 
      key: "status",
      render: (status) => getStatusText(status) 
    }
  ];

  const iconStyle = {
    view: { color: "#007bff" },
    edit: { color: "#28a745" },
    delete: { color: "#dc3545" }
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
    // Chỉ kiểm tra các trường mà backend hỗ trợ cập nhật
    const requiredFields = ["nurseId"];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      console.log("Current form data:", formData);
      
      const fieldNames = {
        nurseId: "Y tá phụ trách"
      };
      
      const missingFieldNames = missingFields.map(field => fieldNames[field] || field).join(", ");
      
      setNotif({
        message: `Vui lòng điền đầy đủ thông tin: ${missingFieldNames}`,
        type: "error"
      });
      
      return false;
    }
    
    return true;
  };

  // Add a helper function to fetch health profile by student ID
  const fetchHealthProfileByStudentId = async (studentId) => {
    if (!studentId) return null;
    
    try {
      console.log("Fetching health profile for student ID:", studentId);
      // First try to get it from the existing students data
      const student = students.find(s => s.studentId.toString() === studentId.toString());
      if (student && student.healthProfileId) {
        console.log("Found health profile ID in students data:", student.healthProfileId);
        return { healthProfileId: student.healthProfileId };
      }
      
      // If not found in existing data, call the API
      try {
        const response = await API_SERVICE.healthProfileAPI.get(studentId);
        console.log("Health profile API response:", response);
        
        if (response && response.healthProfileId) {
          return response;
        }
      } catch (apiError) {
        console.error("Error calling health profile API:", apiError);
        
        // Try an alternative approach using search API
        try {
          const searchResponse = await API_SERVICE.healthProfileAPI.getAll({
            keyword: studentId.toString()
          });
          
          console.log("Health profile search response:", searchResponse);
          
          if (Array.isArray(searchResponse) && searchResponse.length > 0) {
            // Find the profile that matches the student ID
            const matchingProfile = searchResponse.find(p => p.studentId.toString() === studentId.toString());
            if (matchingProfile) {
              return matchingProfile;
            }
          }
        } catch (searchError) {
          console.error("Error searching health profiles:", searchError);
        }
      }
    } catch (error) {
      console.error("Error in fetchHealthProfileByStudentId:", error);
    }
    
    return null;
  };

  // Cập nhật hàm handleStudentChange để không mất dữ liệu
  const handleStudentChange = async (studentId) => {
    console.log("Student changed to:", studentId);
    
    if (!studentId) {
      setFormData(prev => ({
        ...prev,
        studentId: "",
        studentName: "",
        healthProfileId: ""
      }));
      return;
    }
    
    // Tìm học sinh trong danh sách đã có
    const selectedStudent = students.find(s => s.studentId.toString() === studentId.toString());
    if (selectedStudent) {
      const studentName = selectedStudent.fullName || 
                          `${selectedStudent.firstName || ''} ${selectedStudent.lastName || ''}`.trim();
      
      console.log("Found student in cache:", selectedStudent);
      console.log("Student name:", studentName);
      
      try {
        // Lấy hồ sơ sức khỏe của học sinh
        const healthProfile = await fetchHealthProfileByStudentId(studentId);
        const healthProfileId = healthProfile?.healthProfileId?.toString() || "";
        
        console.log("Found health profile:", healthProfile);
        console.log("Health profile ID:", healthProfileId);
        
        // Cập nhật form data, giữ lại các giá trị khác
        setFormData(prev => ({
          ...prev,
          studentId: studentId.toString(),
          studentName: studentName,
          healthProfileId: healthProfileId
        }));
      } catch (error) {
        console.error("Error fetching health profile:", error);
        
        // Vẫn cập nhật thông tin học sinh ngay cả khi không lấy được hồ sơ sức khỏe
        setFormData(prev => ({
          ...prev,
          studentId: studentId.toString(),
          studentName: studentName
        }));
      }
    } else {
      // Nếu không tìm thấy trong cache, thử lấy từ API
      try {
        const student = await API_SERVICE.studentAPI.getById(studentId);
        if (student) {
          const studentName = student.fullName || 
                             `${student.firstName || ''} ${student.lastName || ''}`.trim();
          
          // Lấy hồ sơ sức khỏe của học sinh
          const healthProfile = await fetchHealthProfileByStudentId(studentId);
          const healthProfileId = healthProfile?.healthProfileId?.toString() || "";
          
          // Cập nhật form data, giữ lại các giá trị khác
          setFormData(prev => ({
            ...prev,
            studentId: studentId.toString(),
            studentName: studentName,
            healthProfileId: healthProfileId
          }));
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
        setFormData(prev => ({
          ...prev,
          studentId: studentId.toString()
        }));
      }
    }
  };

  // Cập nhật hàm handleAddResult để cải thiện việc khởi tạo dữ liệu
  const handleAddResult = async (e) => {
    e.preventDefault();
    console.log("Add form data before validation:", formData);
    
    // Nếu có studentId nhưng không có healthProfileId, thử lấy nó
    if (formData.studentId && !formData.healthProfileId) {
      console.log("Attempting to fetch health profile for student ID:", formData.studentId);
      const healthProfile = await fetchHealthProfileByStudentId(formData.studentId);
      
      if (healthProfile && healthProfile.healthProfileId) {
        setFormData(prev => ({
          ...prev,
          healthProfileId: healthProfile.healthProfileId.toString()
        }));
        console.log("Found and set health profile ID:", healthProfile.healthProfileId);
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
      
      // Tạo object dữ liệu đã làm sạch để gửi đến API
      const cleanedData = {
        vaccinationScheduleId: parseInt(formData.vaccinationScheduleId) || 0,
        healthProfileId: parseInt(formData.healthProfileId) || 0,
        studentId: parseInt(formData.studentId) || 0,
        nurseId: parseInt(formData.nurseId || localStorage.getItem("userId")) || 0,
        doseNumber: parseInt(formData.doseNumber) || 1,
        reactionAfterInjection: formData.reactionAfterInjection || "",
        status: parseInt(formData.status) || 1,
        note: formData.note || ""
      };
      
      // Chỉ thêm các trường có giá trị
      if (formData.injectionDate) {
        cleanedData.injectionDate = formData.injectionDate;
      }
      
      if (formData.injectionTime) {
        cleanedData.injectionTime = formData.injectionTime;
      }
      
      console.log("Sending cleaned data to API for new vaccination result:", cleanedData);
      
      // Gọi API để tạo kết quả mới
      const response = await API_SERVICE.vaccinationResultAPI.create(cleanedData);
      console.log("API response after adding vaccination result:", response);
      
      if (response) {
      setNotif({
        message: "Thêm kết quả tiêm chủng thành công",
        type: "success"
      });
        
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
      
      setNotif({
        message: "Không thể thêm kết quả tiêm chủng: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật hàm handleUpdateResult để thông báo giới hạn
  const handleUpdateResult = async (e) => {
    e.preventDefault();
    console.log("Update form data before validation:", formData);
    
    // Hiển thị thông báo về giới hạn cập nhật
    const warningMessage = "Lưu ý: Chỉ có thể cập nhật Y tá phụ trách, Mũi số và Ghi chú. Các trường khác sẽ không được lưu.";
    
    // Hiển thị thông báo cảnh báo
    setNotif({
      message: warningMessage,
      type: "warning"
    });
    
    // Đợi 1.5 giây để người dùng đọc thông báo
    setTimeout(() => {
    if (!validateForm()) return;
    
      // Show confirmation dialog instead of immediately submitting
      setShowConfirmUpdate(true);
    }, 1500);
  };

  // Cập nhật hàm confirmUpdateResult để gửi chỉ những trường mà BE hỗ trợ
  const confirmUpdateResult = async () => {
    setShowConfirmUpdate(false);
    setLoading(true);
    
    try {
      console.log("Original form data for update:", formData);
      
      // Tạo đối tượng dữ liệu chỉ với các trường mà backend hỗ trợ
      const cleanedData = {
        vaccinationResultId: parseInt(selectedResult.vaccinationResultId),
        nurseId: parseInt(formData.nurseId) || null,
        doseNumber: parseInt(formData.doseNumber) || null,
        note: formData.note || ""
      };
      
      console.log("Sending update request with only supported fields:", cleanedData);
      
      // Gọi API cập nhật
      const response = await API_SERVICE.vaccinationResultAPI.update(
        parseInt(selectedResult.vaccinationResultId), 
        cleanedData
      );
      
      console.log("API response after updating vaccination result:", response);
      
      if (response) {
        // Cập nhật lại selectedResult với dữ liệu mới để hiển thị chính xác
        const updatedResult = {
          ...selectedResult,
          nurseId: cleanedData.nurseId,
          nurseName: formData.nurseName,
          doseNumber: cleanedData.doseNumber,
          note: cleanedData.note
        };
        setSelectedResult(updatedResult);
        
      setNotif({
          message: "Cập nhật kết quả tiêm chủng thành công (chỉ y tá phụ trách, mũi số, ghi chú được cập nhật)",
        type: "success"
      });
        
      setShowEditModal(false);
        
        // Làm mới dữ liệu bảng
        await fetchVaccinationResults("");
      }
    } catch (error) {
      console.error("Error updating vaccination result:", error);
      // Log more details about the error
      if (error.message) console.error("Error message:", error.message);
      if (error.response) console.error("Error response:", error.response);
      
      setNotif({
        message: "Không thể cập nhật kết quả tiêm chủng: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResult = async () => {
    setLoading(true);
    try {
      await API_SERVICE.vaccinationResultAPI.delete(selectedResult.vaccinationResultId);
      setNotif({
        message: "Xóa kết quả tiêm chủng thành công",
        type: "success"
      });
      setShowDeleteModal(false);
      // Reset to page 1 and refetch data
      setPage(1);
      await fetchVaccinationResults("");
    } catch (error) {
      console.error("Error deleting vaccination result:", error);
      setNotif({
        message: "Không thể xóa kết quả tiêm chủng: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
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
      status: "1", // Default status: Completed
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
    console.log("Editing result:", result);
    
    // Lấy thông tin y tá từ ID
    let nurseName = result.nurseName || "";
    if (result.nurseId && !nurseName) {
      const nurse = nurses.find(n => n.nurseId.toString() === result.nurseId.toString());
      if (nurse) {
        nurseName = nurse.fullName || `${nurse.firstName || ''} ${nurse.lastName || ''}`.trim();
      }
    }
    
    // Lấy thông tin học sinh từ ID
    let studentName = result.studentName || "";
    if (result.studentId && !studentName) {
      const student = students.find(s => s.studentId.toString() === result.studentId.toString());
      if (student) {
        studentName = student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim();
      }
    }
    
    // Cập nhật form data
    setFormData({
      vaccinationResultId: result.vaccinationResultId,
      vaccinationScheduleId: result.vaccinationScheduleId || "",
      healthProfileId: result.healthProfileId || "",
      studentId: result.studentId || "",
      studentName: studentName || result.studentName || "",
      studentSearchTerm: studentName || result.studentName || "",
      nurseId: result.nurseId || "",
      nurseName: nurseName || result.nurseName || "",
      nurseSearchTerm: nurseName || result.nurseName || "",
      doseNumber: result.doseNumber || "1",
      reactionAfterInjection: result.reactionAfterInjection || "",
      status: result.status?.toString() || "1",
      note: result.note || "",
      vaccineName: result.vaccineName || "",
      injectionDate: result.injectionDate ? new Date(result.injectionDate).toISOString().split('T')[0] : "",
      injectionTime: result.injectionTime || ""
    });
    
    setSelectedResult(result);
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

  return (
    <div className="admin-main">
      <div className="vax-results-container">
        <div className="vax-results-header">
        <h2>Quản lý kết quả tiêm chủng</h2>
          <div className="vax-results-actions">
            <div className="vax-results-search">
            <input
              type="text"
              placeholder="Tìm kiếm kết quả tiêm..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <button 
                className="vax-results-btn search-btn" 
              onClick={handleSearch}
              disabled={searchLoading}
            >
              {searchLoading ? "Đang tìm..." : <FaSearch />}
            </button>
          </div>
        </div>
      </div>

        <div className="vax-results-add-button">
          <button className="vax-results-btn add-btn" onClick={() => setShowAddModal(true)}>
            <FaPlus /> Thêm kết quả
          </button>
        </div>



        <div className="vax-results-table-container">
        {loading ? (
          <div className="loading-spinner">Đang tải...</div>
        ) : (
          <TableWithPaging
            columns={columns}
            data={results}
            page={page}
            pageSize={10}
            onPageChange={(newPage) => {
              console.log("Changing page to:", newPage);
              setPage(newPage);
              // No need to refetch data, we'll use the already processed and sorted results
            }}
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
                  title="Chỉnh sửa"
                  onClick={() => handleEdit(row)}
                >
                  <FaEdit style={iconStyle.edit} size={18} />
                </button>
                  <button
                    className="admin-action-btn admin-action-delete admin-action-btn-reset"
                    title="Xóa"
                    onClick={() => handleDelete(row)}
                  >
                    <FaTrash style={iconStyle.delete} size={18} />
                </button>
              </div>
            )}
          />
        )}
          </div>
      </div>

      {/* Modal thêm kết quả tiêm */}
      {showAddModal && (
        <div className="vax-results-modal-overlay">
          <div className="vax-results-modal">
            <div className="vax-results-modal-header">
              <h3>Thêm kết quả tiêm chủng</h3>
              <button className="vax-results-modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="vax-results-modal-body">
            <form onSubmit={handleAddResult}>
                <div className="info-section">
                  <h4 className="section-title">Thông tin cơ bản</h4>
                  <div className="vax-results-form-group">
                    <label>Lịch tiêm chủng <span className="required">*</span></label>
                <select
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
                  
                  <div className="vax-results-form-group">
                    <label>Học sinh <span className="required">*</span></label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
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
                  
                  <div className="vax-results-form-group">
                    <label>Y tá phụ trách <span className="required">*</span></label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        name="nurseSearchTerm"
                        value={formData.nurseSearchTerm || ""}
                        onChange={handleInputChange}
                        onBlur={() => setTimeout(() => setShowNurseDropdown(false), 200)}
                        onClick={() => setShowNurseDropdown(true)}
                        placeholder="Nhập tên hoặc ID y tá"
                        required
                        style={{ backgroundColor: '#ffffff', borderColor: '#28a745' }}
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
                    <small style={{ color: '#28a745' }}>Có thể thay đổi y tá phụ trách</small>
                  </div>
                </div>

                <div className="info-section">
                  <h4 className="section-title">Kết quả tiêm</h4>
                  <div className="vax-results-form-group">
                <label>Mũi số <span className="required">*</span></label>
                <input
                  type="number"
                  name="doseNumber"
                  value={formData.doseNumber}
                  onChange={handleInputChange}
                  required
                  min="1"
                  placeholder="Nhập số mũi tiêm"
                />
              </div>
                  <div className="vax-results-form-row">
                    <div className="vax-results-form-group">
                      <label>Ngày tiêm</label>
                      <input
                        type="date"
                        name="injectionDate"
                        value={formData.injectionDate ? new Date(formData.injectionDate).toISOString().split('T')[0] : ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="vax-results-form-group">
                      <label>Giờ tiêm</label>
                      <input
                        type="time"
                        name="injectionTime"
                        value={formData.injectionTime || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="vax-results-form-group">
                <label>Phản ứng sau tiêm</label>
                <textarea
                  name="reactionAfterInjection"
                  value={formData.reactionAfterInjection}
                  onChange={handleInputChange}
                  placeholder="Nhập phản ứng sau tiêm (nếu có)"
                  rows="3"
                ></textarea>
              </div>
                  <div className="vax-results-form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="0">Chưa hoàn thành</option>
                  <option value="1">Đã hoàn thành</option>
                  <option value="2">Đã hủy</option>
                </select>
              </div>
                  <div className="vax-results-form-group">
                <label>Ghi chú</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Nhập ghi chú"
                  rows="3"
                ></textarea>
              </div>
                </div>
                <div className="vax-results-form-actions">
                  <button type="submit" className="vax-results-btn" disabled={loading}>
                  {loading ? "Đang thêm..." : "Thêm mới"}
                </button>
                <button
                  type="button"
                    className="vax-results-btn cancel-btn"
                  onClick={() => setShowAddModal(false)}
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

      {/* Modal xem chi tiết kết quả tiêm */}
      {showViewModal && selectedResult && (
        <div className="vax-results-modal-overlay">
          <div className="vax-results-modal">
            <div className="vax-results-modal-header">
              <h3>Chi tiết kết quả tiêm chủng</h3>
              <button className="vax-results-modal-close" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="vax-results-modal-body">
              <div className="info-section">
                <h4 className="section-title">Thông tin chung</h4>
              <div className="info-grid">
                <div className="info-item">
                  <strong>ID:</strong> {selectedResult.vaccinationResultId}
                </div>
                <div className="info-item">
                    <strong>Lịch khám:</strong> {selectedResult.vaccineName || "Không có"}
                </div>
                <div className="info-item">
                    <strong>Học sinh:</strong> 
                    {selectedResult.studentName || "Không có"} (ID: {selectedResult.studentId || "N/A"})
                </div>
                <div className="info-item">
                    <strong>Y tá phụ trách:</strong> 
                    {selectedResult.nurseName || "Không có"} (ID: {selectedResult.nurseId || "N/A"})
                </div>
                </div>
              </div>

              <div className="info-section">
                <h4 className="section-title">Kết quả tiêm</h4>
                <div className="info-grid">
                <div className="info-item">
                  <strong>Mũi số:</strong> {selectedResult.doseNumber || "Không có"}
                </div>
                <div className="info-item">
                  <strong>Ngày tiêm:</strong> {selectedResult.injectionDate ? new Date(selectedResult.injectionDate).toLocaleDateString('vi-VN') : "Không có"}
                </div>
                <div className="info-item">
                  <strong>Giờ tiêm:</strong> {selectedResult.injectionTime || "Không có"}
                </div>
                <div className="info-item">
                  <strong>Trạng thái:</strong> {getStatusText(selectedResult.status)}
                </div>
                <div className="info-item full-width">
                  <strong>Phản ứng sau tiêm:</strong> {selectedResult.reactionAfterInjection || "Không có"}
                </div>
                <div className="info-item full-width">
                  <strong>Ghi chú:</strong> {selectedResult.note || "Không có"}
                </div>
              </div>
            </div>
            </div>
            <div className="vax-results-modal-footer">
              <button className="vax-results-btn" onClick={() => setShowViewModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa kết quả tiêm */}
      {showEditModal && (
        <div className="vax-results-modal-overlay">
          <div className="vax-results-modal">
            <div className="vax-results-modal-header">
              <h3>Chỉnh sửa kết quả tiêm chủng</h3>
              <button className="vax-results-modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="vax-results-modal-body">
            <form onSubmit={handleUpdateResult}>
                <div className="info-section">
                  <h4 className="section-title">Thông tin cơ bản</h4>
                  <div className="vax-results-form-group">
                    <label>Lịch tiêm chủng <span className="required">*</span></label>
                <select
                  name="vaccinationScheduleId"
                      value={formData.vaccinationScheduleId || ""}
                      onChange={handleInputChange}
                  required
                      disabled={true} // Disable vì không thể cập nhật
                      style={{ backgroundColor: '#f0f0f0' }} // Thêm style để chỉ ra trường bị disable
                >
                      <option value="">-- Chọn lịch tiêm chủng --</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.vaccinationScheduleId} value={schedule.vaccinationScheduleId}>
                          {schedule.vaccineName || schedule.name || `Lịch #${schedule.vaccinationScheduleId}`}
                    </option>
                  ))}
                </select>
                    <small style={{ color: '#856404' }}>Không thể thay đổi lịch tiêm chủng</small>
              </div>

                  <div className="vax-results-form-group">
                    <label>Học sinh <span className="required">*</span></label>
                    <select
                      name="studentId"
                      value={formData.studentId || ""}
                      onChange={handleInputChange}
                      required
                      disabled={true} // Disable vì không thể cập nhật
                      style={{ backgroundColor: '#f0f0f0' }} // Thêm style để chỉ ra trường bị disable
                    >
                      <option value="">-- Chọn học sinh --</option>
                      {students.map((student) => (
                        <option key={student.studentId} value={student.studentId}>
                          {student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || `Học sinh #${student.studentId}`}
                        </option>
                      ))}
                    </select>
                    {formData.studentName && (
                      <div className="selected-info">Đã chọn: {formData.studentName}</div>
                    )}
                    <small style={{ color: '#856404' }}>Không thể thay đổi học sinh</small>
                  </div>
                  
                  <div className="vax-results-form-group">
                    <label>Y tá phụ trách <span className="required">*</span></label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        name="nurseSearchTerm"
                        value={formData.nurseSearchTerm || ""}
                        onChange={handleInputChange}
                        onBlur={() => setTimeout(() => setShowNurseDropdown(false), 200)}
                        onClick={() => setShowNurseDropdown(true)}
                        placeholder="Nhập tên hoặc ID y tá"
                        required
                        style={{ backgroundColor: '#ffffff', borderColor: '#28a745' }}
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
                    <small style={{ color: '#28a745' }}>Trường này có thể được cập nhật</small>
                  </div>
                </div>

                <div className="info-section">
                  <h4 className="section-title">Kết quả tiêm</h4>
                  <div className="vax-results-form-group">
                <label>Mũi số <span className="required">*</span></label>
                <input
                  type="number"
                  name="doseNumber"
                  value={formData.doseNumber}
                  onChange={handleInputChange}
                  required
                  min="1"
                  placeholder="Nhập số mũi tiêm"
                      style={{ backgroundColor: '#ffffff', borderColor: '#28a745' }} // Highlight trường có thể cập nhật
                />
                    <small style={{ color: '#28a745' }}>Trường này có thể được cập nhật</small>
              </div>
                  <div className="vax-results-form-row">
                    <div className="vax-results-form-group">
                      <label>Ngày tiêm</label>
                      <input
                        type="date"
                        name="injectionDate"
                        value={formData.injectionDate ? new Date(formData.injectionDate).toISOString().split('T')[0] : ""}
                        onChange={handleInputChange}
                        disabled={true} // Disable vì không thể cập nhật
                        style={{ backgroundColor: '#f0f0f0' }} // Style cho trường bị disable
                      />
                      <small style={{ color: '#856404' }}>Không thể thay đổi ngày tiêm</small>
                    </div>
                    <div className="vax-results-form-group">
                      <label>Giờ tiêm</label>
                      <input
                        type="time"
                        name="injectionTime"
                        value={formData.injectionTime || ""}
                        onChange={handleInputChange}
                        disabled={true} // Disable vì không thể cập nhật
                        style={{ backgroundColor: '#f0f0f0' }} // Style cho trường bị disable
                      />
                      <small style={{ color: '#856404' }}>Không thể thay đổi giờ tiêm</small>
                    </div>
                  </div>
                  <div className="vax-results-form-group">
                <label>Phản ứng sau tiêm</label>
                <textarea
                  name="reactionAfterInjection"
                  value={formData.reactionAfterInjection}
                  onChange={handleInputChange}
                  placeholder="Nhập phản ứng sau tiêm (nếu có)"
                  rows="3"
                      disabled={true} // Disable vì không thể cập nhật
                      style={{ backgroundColor: '#f0f0f0' }} // Style cho trường bị disable
                ></textarea>
                    <small style={{ color: '#856404' }}>Không thể thay đổi phản ứng sau tiêm</small>
              </div>
                  <div className="vax-results-form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                      disabled={true} // Disable vì không thể cập nhật
                      style={{ backgroundColor: '#f0f0f0' }} // Style cho trường bị disable
                >
                  <option value="0">Chưa hoàn thành</option>
                  <option value="1">Đã hoàn thành</option>
                  <option value="2">Đã hủy</option>
                </select>
                    <small style={{ color: '#856404' }}>Không thể thay đổi trạng thái</small>
              </div>
                  <div className="vax-results-form-group">
                <label>Ghi chú</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Nhập ghi chú"
                  rows="3"
                      style={{ backgroundColor: '#ffffff', borderColor: '#28a745' }} // Highlight trường có thể cập nhật
                ></textarea>
                    <small style={{ color: '#28a745' }}>Trường này có thể được cập nhật</small>
              </div>
                </div>
                <div className="vax-results-form-actions">
                  <button type="submit" className="vax-results-btn" disabled={loading}>
                  {loading ? "Đang cập nhật..." : "Cập nhật"}
                </button>
                <button
                  type="button"
                    className="vax-results-btn cancel-btn"
                  onClick={() => setShowEditModal(false)}
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

      {/* Modal xác nhận xóa */}
      {showDeleteModal && selectedResult && (
        <div className="vax-results-modal-overlay">
          <div className="vax-results-modal">
            <div className="vax-results-modal-header">
              <h3>Xác nhận xóa</h3>
              <button className="vax-results-modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="vax-results-modal-body">
              <p>Bạn có chắc chắn muốn xóa kết quả tiêm chủng này không?</p>
              <div className="info-section">
                <div className="info-grid">
                  <div className="info-item">
                    <strong>ID:</strong> {selectedResult.vaccinationResultId}
                  </div>
                  <div className="info-item">
                    <strong>Học sinh:</strong> 
                    <StudentNameCell 
                      studentId={selectedResult.studentId} 
                      initialName={selectedResult.studentName} 
                      healthProfileId={selectedResult.healthProfileId} 
                    />
                  </div>
                  <div className="info-item">
                    <strong>Y tá phụ trách:</strong>
                    <NurseNameCell 
                      nurseId={selectedResult.nurseId} 
                      initialName={selectedResult.nurseName} 
                    />
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

                </div>
              </div>
              <p className="warning-text">Hành động này không thể hoàn tác!</p>
            </div>
            <div className="vax-results-modal-footer">
              <button 
                className="vax-results-btn delete-btn" 
                onClick={handleDeleteResult}
                disabled={loading}
              >
                {loading ? "Đang xóa..." : "Xóa"}
              </button>
              <button 
                className="vax-results-btn cancel-btn" 
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận thêm kết quả */}
      {showConfirmAdd && (
        <div className="vax-results-modal-overlay">
          <div className="vax-results-modal">
            <div className="vax-results-modal-header">
              <h3>Xác nhận thêm kết quả</h3>
              <button className="vax-results-modal-close" onClick={() => setShowConfirmAdd(false)}>×</button>
            </div>
            <div className="vax-results-modal-body">
              <p>Bạn có chắc chắn muốn thêm kết quả tiêm chủng này không?</p>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Học sinh:</strong> {formData.studentName || "Không xác định"}
                </div>
                <div className="info-item">
                  <strong>Lịch tiêm:</strong> {formData.vaccinationScheduleId ? schedules.find(s => s.vaccinationScheduleId.toString() === formData.vaccinationScheduleId)?.vaccineName : "Không xác định"}
                </div>
                <div className="info-item">
                  <strong>Mũi số:</strong> {formData.doseNumber}
                </div>
                <div className="info-item">
                  <strong>Ngày tiêm:</strong> {formData.injectionDate ? new Date(formData.injectionDate).toLocaleDateString('vi-VN') : "Không có"}
                </div>
                <div className="info-item">
                  <strong>Giờ tiêm:</strong> {formData.injectionTime || "Không có"}
                </div>
              </div>
            </div>
            <div className="vax-results-modal-footer">
              <button 
                className="vax-results-btn confirm-btn" 
                onClick={confirmAddResult}
                disabled={loading}
              >
                {loading ? "Đang thêm..." : "Xác nhận"}
              </button>
              <button 
                className="vax-results-btn cancel-btn" 
                onClick={() => setShowConfirmAdd(false)}
                disabled={loading}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận cập nhật kết quả */}
      {showConfirmUpdate && (
        <div className="vax-results-modal-overlay">
          <div className="vax-results-modal">
            <div className="vax-results-modal-header">
              <h3>Xác nhận cập nhật kết quả</h3>
              <button className="vax-results-modal-close" onClick={() => setShowConfirmUpdate(false)}>×</button>
            </div>
            <div className="vax-results-modal-body">
              <p>Bạn có chắc chắn muốn cập nhật kết quả tiêm chủng này không?</p>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Học sinh:</strong> {formData.studentName || "Không xác định"}
                </div>
                <div className="info-item">
                  <strong>Lịch tiêm:</strong> {formData.vaccinationScheduleId ? schedules.find(s => s.vaccinationScheduleId.toString() === formData.vaccinationScheduleId)?.vaccineName : "Không xác định"}
                </div>
                <div className="info-item">
                  <strong>Mũi số:</strong> {formData.doseNumber}
                </div>
                <div className="info-item">
                  <strong>Ngày tiêm:</strong> {formData.injectionDate ? new Date(formData.injectionDate).toLocaleDateString('vi-VN') : "Không có"}
                </div>
                <div className="info-item">
                  <strong>Giờ tiêm:</strong> {formData.injectionTime || "Không có"}
                </div>
              </div>
            </div>
            <div className="vax-results-modal-footer">
              <button 
                className="vax-results-btn confirm-btn" 
                onClick={confirmUpdateResult}
                disabled={loading}
              >
                {loading ? "Đang cập nhật..." : "Xác nhận"}
              </button>
              <button 
                className="vax-results-btn cancel-btn" 
                onClick={() => setShowConfirmUpdate(false)}
                disabled={loading}
              >
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

