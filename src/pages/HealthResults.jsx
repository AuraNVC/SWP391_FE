import React, { useState, useEffect } from "react";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaPlus, FaSearch, FaSync, FaTrash } from "react-icons/fa";
import "../styles/Dashboard.css";

// Component riêng để hiển thị tên học sinh
const StudentNameCell = ({ studentId, initialName, healthProfileId }) => {
  const [studentName, setStudentName] = useState(initialName || `Học sinh ID: ${studentId || "N/A"}`);
  const [loading, setLoading] = useState(false);

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
            setStudentName(name);
            setLoading(false);
            return;
          }
        }
        
        // Nếu không có studentId hoặc không tìm được thông tin học sinh, thử dùng healthProfileId
        if (healthProfileId) {
          console.log(`Trying to get student info from health profile ID: ${healthProfileId}`);
          try {
            const profileData = await API_SERVICE.healthProfileAPI.getById(healthProfileId);
            
            if (profileData && profileData.studentId) {
              // Đã có studentId từ health profile, gọi API để lấy thông tin học sinh
              const studentResponse = await API_SERVICE.studentAPI.getById(profileData.studentId);
              if (studentResponse) {
                const name = studentResponse.fullName || 
                          `${studentResponse.firstName || ''} ${studentResponse.lastName || ''}`.trim() || 
                          studentResponse.name || 
                          `Học sinh ID: ${profileData.studentId}`;
                
                console.log(`Fetched student name from health profile: ${name}`);
                setStudentName(name);
              } else if (profileData.student && profileData.student.fullName) {
                // Nếu health profile có chứa thông tin học sinh
                setStudentName(profileData.student.fullName);
              } else {
                setStudentName(`Hồ sơ sức khỏe ID: ${healthProfileId}`);
              }
            } else if (profileData && profileData.student) {
              // Nếu health profile có chứa thông tin học sinh trực tiếp
              const studentInfo = profileData.student;
              const name = studentInfo.fullName || 
                        `${studentInfo.firstName || ''} ${studentInfo.lastName || ''}`.trim() || 
                        studentInfo.name || 
                        `Học sinh ID: ${studentInfo.studentId || "N/A"}`;
              setStudentName(name);
            } else {
              setStudentName(`Hồ sơ sức khỏe ID: ${healthProfileId}`);
            }
          } catch (profileError) {
            console.error(`Error fetching health profile ${healthProfileId}:`, profileError);
            setStudentName(`Hồ sơ sức khỏe ID: ${healthProfileId}`);
          }
        }
      } catch (error) {
        console.error(`Error fetching student name:`, error);
        // Nếu có lỗi, hiển thị ID hồ sơ sức khỏe hoặc ID học sinh
        if (healthProfileId) {
          setStudentName(`Hồ sơ sức khỏe ID: ${healthProfileId}`);
        } else if (studentId) {
          setStudentName(`Học sinh ID: ${studentId}`);
        } else {
          setStudentName("Không xác định");
        }
      } finally {
        setLoading(false);
      }
    };
    
    // Chỉ gọi API nếu tên ban đầu không hợp lệ hoặc chứa "Hồ sơ sức khỏe ID"
    if (initialName === `ID: ${studentId}` || 
        initialName === "Không xác định" || 
        initialName === `Health Profile ID: ${healthProfileId}` ||
        initialName === `Hồ sơ sức khỏe ID: ${healthProfileId}` ||
        initialName?.includes("Hồ sơ sức khỏe ID") ||
        !initialName) {
      fetchName();
    }
  }, [studentId, initialName, healthProfileId]);

  return (
    <span>
      {loading ? "Đang tải..." : studentName}
    </span>
  );
};

const HealthResults = () => {
  const [results, setResults] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [formData, setFormData] = useState({
    healthCheckScheduleId: "",
    healthProfileId: "",
    studentId: "",
    nurseId: localStorage.getItem("userId") || "",
    nurseName: "",
    height: "",
    weight: "",
    leftVision: "",
    rightVision: "",
    result: "",
    status: "1", // Default status: Completed
    note: ""
  });
  const [statusCounts, setStatusCounts] = useState({});

  const { setNotif } = useNotification();

  const [columns, setColumns] = useState([
    { title: "ID", dataIndex: "healthCheckupRecordId" },
    { title: "Hồ sơ sức khỏe", dataIndex: "studentName", render: (name, record) => {
      // Ưu tiên sử dụng studentName từ record nếu có giá trị hợp lệ
      if (record.studentName && 
          record.studentName !== "Không xác định" && 
          record.studentName !== `ID: ${record.studentId}` &&
          !record.studentName.includes("Hồ sơ sức khỏe ID")) {
        return record.studentName;
      }
      
      // Sử dụng component riêng để hiển thị tên học sinh
      return <StudentNameCell 
               studentId={record.studentId} 
               initialName={record.studentName} 
               healthProfileId={record.healthProfileId} 
             />;
    }},
    { title: "Chiều cao", dataIndex: "height", render: (height) => height ? `${height} cm` : "N/A" },
    { title: "Cân nặng", dataIndex: "weight", render: (weight) => weight ? `${weight} kg` : "N/A" },
    { title: "Kết quả", dataIndex: "result" },
    { title: "Trạng thái", dataIndex: "status", render: (status) => getStatusText(status) }
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

      // Nếu response không phải là mảng, kiểm tra xem có phải là đối tượng chứa mảng không
      let resultsData = response;
      if (!Array.isArray(response) && response && response.data && Array.isArray(response.data)) {
        resultsData = response.data;
      }

      // Xử lý dữ liệu bằng hàm processHealthCheckResults
      if (Array.isArray(resultsData) && resultsData.length > 0) {
        const processedResults = await processHealthCheckResults(resultsData);
        console.log("All processed health check results:", processedResults);
        
        const counts = {};
        processedResults.forEach(result => {
          const status = result.status;
          counts[status] = (counts[status] || 0) + 1;
        });
        setStatusCounts(counts);
        console.log("Status counts:", counts);
        
        if (Object.keys(counts).length <= 1) {
          setColumns(prevColumns => prevColumns.filter(col => col.dataIndex !== 'status'));
        } else {
          const hasStatusColumn = columns.some(col => col.dataIndex === 'status');
          if (!hasStatusColumn) {
            setColumns(prevColumns => [
              ...prevColumns,
              { title: "Trạng thái", dataIndex: "status", render: (status) => getStatusText(status) }
            ]);
          }
        }
        
        setResults(processedResults);
      } else {
        console.warn("No health check results found or API returned empty data");
        const dummyResults = [
          { 
            healthCheckupRecordId: 1, 
            studentId: 1,
            studentName: "Nguyễn Văn A", 
            nurseId: 1,
            nurseName: "Y tá 1",
            height: 165, 
            weight: 55, 
            leftVision: "10/10", 
            rightVision: "10/10", 
            result: "Sức khỏe tốt", 
            status: "1",
            note: "Không có vấn đề gì đáng lo ngại"
          },
          { 
            healthCheckupRecordId: 2, 
            studentId: 2,
            studentName: "Trần Thị B", 
            nurseId: 1,
            nurseName: "Y tá 1",
            height: 155, 
            weight: 45, 
            leftVision: "8/10", 
            rightVision: "9/10", 
            result: "Cần theo dõi thị lực", 
            status: "1",
            note: "Khuyến nghị đeo kính khi học"
          },
          { 
            healthCheckupRecordId: 3, 
            studentId: 3,
            studentName: "Lê Văn C", 
            nurseId: 1,
            nurseName: "Y tá 1",
            height: 170, 
            weight: 65, 
            leftVision: "10/10", 
            rightVision: "10/10", 
            result: "Thừa cân nhẹ", 
            status: "1",
            note: "Cần tăng cường vận động"
          }
        ];
        console.log("Using dummy health check results due to empty API response");
        setResults(dummyResults);
      }
    } catch (error) {
      console.error("Error fetching health check results:", error);
      setNotif({
        message: "Không thể tải danh sách kết quả khám sức khỏe",
        type: "error"
      });
      
      const dummyResults = [
        { 
          healthCheckupRecordId: 1, 
          studentId: 1,
          studentName: "Nguyễn Văn A", 
          nurseId: 1,
          nurseName: "Y tá 1",
          height: 165, 
          weight: 55, 
          leftVision: "10/10", 
          rightVision: "10/10", 
          result: "Sức khỏe tốt", 
          status: "1",
          note: "Không có vấn đề gì đáng lo ngại"
        },
        { 
          healthCheckupRecordId: 2, 
          studentId: 2,
          studentName: "Trần Thị B", 
          nurseId: 1,
          nurseName: "Y tá 1",
          height: 155, 
          weight: 45, 
          leftVision: "8/10", 
          rightVision: "9/10", 
          result: "Cần theo dõi thị lực", 
          status: "1",
          note: "Khuyến nghị đeo kính khi học"
        },
        { 
          healthCheckupRecordId: 3, 
          studentId: 3,
          studentName: "Lê Văn C", 
          nurseId: 1,
          nurseName: "Y tá 1",
          height: 170, 
          weight: 65, 
          leftVision: "10/10", 
          rightVision: "10/10", 
          result: "Thừa cân nhẹ", 
          status: "1",
          note: "Cần tăng cường vận động"
        }
      ];
      console.log("Using dummy health check results due to error");
      setResults(dummyResults);
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
      setPage(1);
      
      // Kiểm tra nếu từ khóa tìm kiếm là rỗng
      if (!searchKeyword || searchKeyword.trim() === "") {
        console.log("Từ khóa tìm kiếm rỗng, tải lại toàn bộ dữ liệu");
        await fetchHealthCheckResults("");
        return;
      }
      
      // Thực hiện tìm kiếm với từ khóa
      try {
        const response = await API_SERVICE.healthCheckResultAPI.getAll({
          keyword: searchKeyword,
          pageNumber: 1,
          pageSize: 100,
          includeDetails: true,
          includeStudent: true,
          includeNurse: true,
          includeProfile: true
        });
        
        console.log("Kết quả tìm kiếm:", response);
        
        // Xử lý kết quả tìm kiếm
        let resultsData = response;
        if (!Array.isArray(response) && response && response.data && Array.isArray(response.data)) {
          resultsData = response.data;
        }
        
        // Nếu không có kết quả tìm kiếm
        if (!resultsData || resultsData.length === 0) {
          console.log("Không tìm thấy kết quả nào phù hợp với từ khóa:", searchKeyword);
          setResults([]);
          setNotif({
            message: `Không tìm thấy kết quả nào phù hợp với từ khóa: "${searchKeyword}"`,
            type: "info"
          });
          return;
        }
        
        // Xử lý dữ liệu tìm kiếm tương tự như fetchHealthCheckResults
        const processedResults = await processHealthCheckResults(resultsData);
        setResults(processedResults);
        
        // Hiển thị thông báo thành công
        setNotif({
          message: `Tìm thấy ${processedResults.length} kết quả phù hợp với từ khóa: "${searchKeyword}"`,
          type: "success"
        });
      } catch (searchError) {
        console.error("Error during search API call:", searchError);
        setNotif({
          message: "Lỗi khi tìm kiếm: " + (searchError.message || "Không xác định"),
          type: "error"
        });
        // Trong trường hợp lỗi tìm kiếm, tải lại toàn bộ dữ liệu
        await fetchHealthCheckResults("");
      }
    } catch (error) {
      console.error("Error during search:", error);
      setNotif({
        message: "Lỗi khi tìm kiếm: " + (error.message || "Không xác định"),
        type: "error"
      });
      // Trong trường hợp lỗi, tải lại toàn bộ dữ liệu
      try {
        await fetchHealthCheckResults("");
      } catch (fetchError) {
        console.error("Error fetching all results after search error:", fetchError);
      }
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
    
    // Tải danh sách hồ sơ sức khỏe để lấy thông tin học sinh
    let healthProfiles = [];
    try {
      console.log("Fetching health profiles to get student information...");
      const profilesResponse = await API_SERVICE.healthProfileAPI.getAll({
        keyword: "",
        pageNumber: 1,
        pageSize: 100,
        includeDetails: true,
        includeStudent: true
      });
      
      if (Array.isArray(profilesResponse)) {
        healthProfiles = profilesResponse;
      } else if (profilesResponse && Array.isArray(profilesResponse.data)) {
        healthProfiles = profilesResponse.data;
      }
      console.log(`Fetched ${healthProfiles.length} health profiles`);
    } catch (error) {
      console.error("Error fetching health profiles:", error);
    }
    
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
      } else if (result.studentName) {
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
          studentName = `ID: ${result.healthProfile.studentId}`;
          studentId = result.healthProfile.studentId;
          console.log(`Could not find student with ID=${studentId} in students list`);
        }
      } else if (result.studentId) {
        // Tìm học sinh từ ID
        console.log(`Looking for student with ID: ${result.studentId} in list of ${currentStudents.length} students`);
        const student = currentStudents.find(s => String(s.studentId) === String(result.studentId));
        if (student) {
          studentName = student.fullName;
          studentId = student.studentId;
          console.log(`Found student in students list: ID=${studentId}, Name=${studentName}`);
        } else {
          studentName = `ID: ${result.studentId}`;
          studentId = result.studentId;
          console.log(`Could not find student with ID=${studentId} in students list`);
        }
      } else if (result.healthProfileId) {
        // Thử tìm thông tin học sinh từ healthProfileId trong danh sách hồ sơ sức khỏe đã tải
        console.log(`Trying to find student info from healthProfileId: ${result.healthProfileId} in health profiles list`);
        
        const profile = healthProfiles.find(p => p.healthProfileId === result.healthProfileId);
        if (profile && profile.student) {
          // Nếu tìm thấy thông tin học sinh trong hồ sơ
          const studentInfo = profile.student;
          studentName = studentInfo.fullName || 
                    `${studentInfo.firstName || ''} ${studentInfo.lastName || ''}`.trim() || 
                    studentInfo.name || 
                    `Học sinh ID: ${studentInfo.studentId || "N/A"}`;
          studentId = studentInfo.studentId || studentInfo.id;
          console.log(`Found student in health profiles: ID=${studentId}, Name=${studentName}`);
        } else if (profile && profile.studentId) {
          // Nếu hồ sơ chỉ có studentId, tìm trong danh sách học sinh
          const student = currentStudents.find(s => String(s.studentId) === String(profile.studentId));
          if (student) {
            studentName = student.fullName;
            studentId = student.studentId;
            console.log(`Found student from profile's studentId: ID=${studentId}, Name=${studentName}`);
          } else {
            studentName = `Học sinh ID: ${profile.studentId}`;
            studentId = profile.studentId;
            console.log(`Could not find student for profile's studentId=${profile.studentId}`);
          }
        } else {
          // Nếu không tìm thấy thông tin học sinh, hiển thị ID hồ sơ
          studentName = `Hồ sơ sức khỏe ID: ${result.healthProfileId}`;
          healthProfileId = result.healthProfileId;
          console.log(`No student info found for health profile ID: ${result.healthProfileId}`);
        }
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
        leftVisionValue = "";
      }
      
      if (rightVisionValue === null || rightVisionValue === undefined) {
        rightVisionValue = "";
      }
      
      // Xử lý trường kết quả
      let resultValue = result.result;
      if (resultValue === null || resultValue === undefined) {
        resultValue = "";
      }
      
      const processedResult = {
        ...result,
        // Đảm bảo các trường dữ liệu đúng tên
        healthCheckupRecordId: result.healthCheckupRecordId || result.recordId || result.id,
        studentId: studentId,
        studentName: studentName || "Không xác định",
        healthProfileId: healthProfileId, // Đảm bảo healthProfileId được truyền đi
        nurseId: nurseId,
        nurseName: nurseName || "Không xác định",
        // Đảm bảo các trường dữ liệu có giá trị
        height: heightValue,
        weight: weightValue,
        leftVision: leftVisionValue,
        rightVision: rightVisionValue,
        result: resultValue,
        status: statusValue,
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
  };

  const validateForm = () => {
    if (!formData.healthCheckScheduleId) {
      setNotif({
        message: "Vui lòng chọn lịch khám",
        type: "error"
      });
      return false;
    }
    
    if (!formData.height || !formData.weight) {
      setNotif({
        message: "Vui lòng nhập chiều cao và cân nặng",
        type: "error"
      });
      return false;
    }
    
    return true;
  };

  const handleAddResult = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Đảm bảo dữ liệu đầy đủ và đúng định dạng
      const dataToSubmit = {
        // Đảm bảo các trường bắt buộc
        healthCheckScheduleId: parseInt(formData.healthCheckScheduleId) || null,
        healthProfileId: parseInt(formData.healthProfileId) || null,
        nurseId: parseInt(formData.nurseId) || parseInt(localStorage.getItem("userId")) || null,
        
        // Chuyển đổi các trường số thành số
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        
        // Đảm bảo các trường khác
        leftVision: formData.leftVision || "",
        rightVision: formData.rightVision || "",
        result: formData.result || "",
        status: parseInt(formData.status) || 0,
        note: formData.note || ""
      };
      
      console.log("Thêm kết quả khám với dữ liệu:", dataToSubmit);
      
      // Kiểm tra và đảm bảo healthProfileId
      if (!dataToSubmit.healthProfileId && formData.healthCheckScheduleId) {
        // Tìm lịch khám được chọn để lấy healthProfileId
        const selectedSchedule = schedules.find(s => 
          String(s.healthCheckScheduleId) === String(formData.healthCheckScheduleId)
        );
        
        if (selectedSchedule && selectedSchedule.healthProfileId) {
          console.log(`Using healthProfileId ${selectedSchedule.healthProfileId} from selected schedule`);
          dataToSubmit.healthProfileId = parseInt(selectedSchedule.healthProfileId);
        }
      }
      
      // Thêm kết quả khám
      await API_SERVICE.healthCheckResultAPI.create(dataToSubmit);
      setNotif({
        message: "Thêm kết quả khám sức khỏe thành công",
        type: "success"
      });
      setShowAddModal(false);
      setFormData({
        healthCheckScheduleId: "",
        healthProfileId: "",
        studentId: "",
        nurseId: localStorage.getItem("userId") || "",
        nurseName: "",
        height: "",
        weight: "",
        leftVision: "",
        rightVision: "",
        result: "",
        status: "1",
        note: ""
      });
      fetchHealthCheckResults();
    } catch (error) {
      console.error("Error adding health check result:", error);
      setNotif({
        message: "Không thể thêm kết quả khám sức khỏe: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateResult = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      console.log("Cập nhật kết quả khám với ID:", selectedResult.healthCheckupRecordId);
      
      // Đảm bảo dữ liệu đầy đủ và đúng định dạng
      const dataToSubmit = {
        // Thêm ID của kết quả khám cần cập nhật
        healthCheckupRecordId: selectedResult.healthCheckupRecordId,
        
        // Đảm bảo các trường bắt buộc
        healthCheckScheduleId: parseInt(formData.healthCheckScheduleId) || null,
        healthProfileId: parseInt(formData.healthProfileId) || null,
        nurseId: parseInt(formData.nurseId) || parseInt(localStorage.getItem("userId")) || null,
        
        // Chuyển đổi các trường số thành số
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        
        // Đảm bảo các trường khác
        leftVision: formData.leftVision || "",
        rightVision: formData.rightVision || "",
        result: formData.result || "",
        status: parseInt(formData.status) || 0,
        note: formData.note || ""
      };
      
      // Kiểm tra và đảm bảo healthProfileId
      if (!dataToSubmit.healthProfileId && selectedResult.healthProfileId) {
        console.log(`Using healthProfileId ${selectedResult.healthProfileId} from selected result`);
        dataToSubmit.healthProfileId = parseInt(selectedResult.healthProfileId);
      } else if (!dataToSubmit.healthProfileId && formData.healthCheckScheduleId) {
        // Tìm lịch khám được chọn để lấy healthProfileId
        const selectedSchedule = schedules.find(s => 
          String(s.healthCheckScheduleId) === String(formData.healthCheckScheduleId)
        );
        
        if (selectedSchedule && selectedSchedule.healthProfileId) {
          console.log(`Using healthProfileId ${selectedSchedule.healthProfileId} from selected schedule`);
          dataToSubmit.healthProfileId = parseInt(selectedSchedule.healthProfileId);
        }
      }
      
      console.log("Dữ liệu cập nhật:", dataToSubmit);
      
      // Gọi API để cập nhật kết quả khám
      try {
        await API_SERVICE.healthCheckResultAPI.update(selectedResult.healthCheckupRecordId, dataToSubmit);
        setNotif({
          message: "Cập nhật kết quả khám sức khỏe thành công",
          type: "success"
        });
        setShowEditModal(false);
        // Làm mới dữ liệu sau khi cập nhật thành công
        fetchHealthCheckResults(searchKeyword);
      } catch (apiError) {
        console.error("API error when updating health check result:", apiError);
        
        // Thử cách khác nếu API gặp lỗi
        if (apiError.message && (apiError.message.includes("400") || apiError.message.includes("body stream already read"))) {
          console.log("Trying alternative update method...");
          // Loại bỏ healthCheckupRecordId khỏi body nếu API báo lỗi 400
          const alternativeData = { ...dataToSubmit };
          delete alternativeData.healthCheckupRecordId;
          
          await API_SERVICE.healthCheckResultAPI.update(selectedResult.healthCheckupRecordId, alternativeData);
          setNotif({
            message: "Cập nhật kết quả khám sức khỏe thành công",
            type: "success"
          });
          setShowEditModal(false);
          fetchHealthCheckResults(searchKeyword);
        } else {
          throw apiError; // Ném lỗi để xử lý ở catch bên ngoài
        }
      }
    } catch (error) {
      console.error("Error updating health check result:", error);
      setNotif({
        message: "Không thể cập nhật kết quả khám sức khỏe: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
    } finally {
      setLoading(false);
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
  
  // Sửa hàm handleView để thử lấy thông tin học sinh trực tiếp
  const handleView = async (result) => {
    console.log("Xem chi tiết kết quả khám:", result);
    
    // Tìm tên học sinh từ danh sách students nếu có thể
    let studentName = result.studentName;
    let studentId = result.studentId;
    
    if (!studentName || studentName === "Không xác định" || studentName === `ID: ${result.studentId}` || studentName.includes("Hồ sơ sức khỏe ID")) {
      // Thử lấy thông tin học sinh trực tiếp từ API
      try {
        // Nếu có studentId, ưu tiên sử dụng studentId
        if (studentId) {
          const student = await API_SERVICE.studentAPI.getById(studentId);
          if (student) {
            studentName = student.fullName || 
                        `${student.firstName || ''} ${student.lastName || ''}`.trim() || 
                        student.name || 
                        `Học sinh ID: ${studentId}`;
          } else {
            // getStudentName là đồng bộ
            const name = getStudentName(studentId);
            if (name) {
              studentName = name;
            } else {
              studentName = `Học sinh ID: ${studentId || "N/A"}`;
            }
          }
        }
        // Nếu không có studentId hoặc không tìm được thông tin học sinh, thử dùng healthProfileId
        else if (result.healthProfileId) {
          console.log(`Trying to get student info from health profile ID: ${result.healthProfileId}`);
          const profileData = await API_SERVICE.healthProfileAPI.getById(result.healthProfileId);
          
          if (profileData && profileData.studentId) {
            // Đã có studentId từ health profile, gọi API để lấy thông tin học sinh
            const studentResponse = await API_SERVICE.studentAPI.getById(profileData.studentId);
            if (studentResponse) {
              studentName = studentResponse.fullName || 
                          `${studentResponse.firstName || ''} ${studentResponse.lastName || ''}`.trim() || 
                          studentResponse.name || 
                          `Học sinh ID: ${profileData.studentId}`;
              
              // Cập nhật studentId để sử dụng sau này
              studentId = profileData.studentId;
            } else if (profileData.student && profileData.student.fullName) {
              // Nếu health profile có chứa thông tin học sinh
              studentName = profileData.student.fullName;
              studentId = profileData.studentId;
            } else {
              studentName = `Học sinh ID: ${profileData.studentId || "N/A"}`;
              studentId = profileData.studentId;
            }
          } else if (profileData && profileData.student) {
            // Nếu health profile có chứa thông tin học sinh trực tiếp
            const studentInfo = profileData.student;
            studentName = studentInfo.fullName || 
                      `${studentInfo.firstName || ''} ${studentInfo.lastName || ''}`.trim() || 
                      studentInfo.name || 
                      `Học sinh ID: ${studentInfo.studentId || "N/A"}`;
            studentId = studentInfo.studentId || studentInfo.id;
          } else {
            // Thử lấy danh sách hồ sơ sức khỏe để tìm thông tin
            try {
              console.log("Fetching health profiles to find student info...");
              const profilesResponse = await API_SERVICE.healthProfileAPI.getAll({
                keyword: "",
                pageNumber: 1,
                pageSize: 100,
                includeDetails: true,
                includeStudent: true
              });
              
              let healthProfiles = [];
              if (Array.isArray(profilesResponse)) {
                healthProfiles = profilesResponse;
              } else if (profilesResponse && Array.isArray(profilesResponse.data)) {
                healthProfiles = profilesResponse.data;
              }
              
              const profile = healthProfiles.find(p => p.healthProfileId === result.healthProfileId);
              if (profile && profile.student) {
                // Nếu tìm thấy thông tin học sinh trong hồ sơ
                const studentInfo = profile.student;
                studentName = studentInfo.fullName || 
                          `${studentInfo.firstName || ''} ${studentInfo.lastName || ''}`.trim() || 
                          studentInfo.name || 
                          `Học sinh ID: ${studentInfo.studentId || "N/A"}`;
                studentId = studentInfo.studentId || studentInfo.id;
              } else if (profile && profile.studentId) {
                // Nếu hồ sơ chỉ có studentId, tìm trong danh sách học sinh
                const student = students.find(s => String(s.studentId) === String(profile.studentId));
                if (student) {
                  studentName = student.fullName;
                  studentId = student.studentId;
                } else {
                  // Thử gọi API để lấy thông tin học sinh
                  const studentResponse = await API_SERVICE.studentAPI.getById(profile.studentId);
                  if (studentResponse) {
                    studentName = studentResponse.fullName || 
                                `${studentResponse.firstName || ''} ${studentResponse.lastName || ''}`.trim() || 
                                studentResponse.name || 
                                `Học sinh ID: ${profile.studentId}`;
                    studentId = profile.studentId;
                  } else {
                    studentName = `Học sinh ID: ${profile.studentId}`;
                    studentId = profile.studentId;
                  }
                }
              } else {
                studentName = `Hồ sơ sức khỏe ID: ${result.healthProfileId}`;
              }
            } catch (error) {
              console.error("Error fetching health profiles:", error);
              studentName = `Hồ sơ sức khỏe ID: ${result.healthProfileId}`;
            }
          }
        }
      } catch (error) {
        console.error("Error fetching student for detail view:", error);
        studentName = `Học sinh ID: ${studentId || "N/A"}`;
      }
    }
    
    const completeResult = {
      ...result,
      healthCheckupRecordId: result.healthCheckupRecordId || result.recordId || result.id || "N/A",
      studentName: studentName,
      studentId: studentId,
      nurseName: result.nurseName || getNurseName(result.nurseId) || "Không xác định",
      height: result.height || "N/A",
      weight: result.weight || "N/A",
      leftVision: result.leftVision || "N/A",
      rightVision: result.rightVision || "N/A",
      result: result.result || "Không có",
      status: result.status || "0",
      note: result.note === null || result.note === undefined ? "Không có" : result.note
    };
    
    setSelectedResult(completeResult);
    setShowViewModal(true);
  };

  const handleEdit = (result) => {
    console.log("Chỉnh sửa kết quả khám:", result);
    
    setSelectedResult(result);
    setFormData({
      healthCheckScheduleId: result.healthCheckScheduleId || result.scheduleId || "",
      healthProfileId: result.healthProfileId || "",
      studentId: result.studentId || "",
      nurseId: result.nurseId || localStorage.getItem("userId") || "",
      nurseName: result.nurseName || "",
      height: result.height || "",
      weight: result.weight || "",
      leftVision: result.leftVision || "",
      rightVision: result.rightVision || "",
      result: result.result || "",
      status: String(result.status) || "1",
      note: result.note === null || result.note === undefined ? "" : result.note
    });
    
    setShowEditModal(true);
  };

  const handleScheduleChange = (e) => {
    const scheduleId = e.target.value;
    
    if (!scheduleId) {
      setFormData({
        ...formData,
        healthCheckScheduleId: "",
        healthProfileId: ""
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

  const handleDeleteResult = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa kết quả khám này không?")) {
      setLoading(true);
      try {
        console.log("Deleting health check result with ID:", id);
        
        try {
          await API_SERVICE.healthCheckResultAPI.delete(id);
          setNotif({
            message: "Xóa kết quả khám sức khỏe thành công",
            type: "success"
          });
          fetchHealthCheckResults(searchKeyword);
        } catch (apiError) {
          console.error("API error when deleting health check result:", apiError);
          
          // Nếu API trả về lỗi 404, có thể kết quả đã bị xóa trước đó
          if (apiError.message && apiError.message.includes("404")) {
            setNotif({
              message: "Kết quả khám có thể đã bị xóa trước đó. Đang làm mới dữ liệu...",
              type: "warning"
            });
            fetchHealthCheckResults(searchKeyword);
          } 
          // Nếu API trả về lỗi 403, có thể người dùng không có quyền xóa
          else if (apiError.message && apiError.message.includes("403")) {
            setNotif({
              message: "Bạn không có quyền xóa kết quả khám này",
              type: "error"
            });
          }
          // Các lỗi khác
          else {
            throw apiError; // Ném lỗi để xử lý ở catch bên ngoài
          }
        }
      } catch (error) {
        console.error("Error deleting health check result:", error);
        setNotif({
          message: "Không thể xóa kết quả khám sức khỏe: " + (error.message || "Lỗi không xác định"),
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (Object.keys(statusCounts).length <= 1) {
      setColumns(prevColumns => prevColumns.filter(col => col.dataIndex !== 'status'));
    } else {
      const hasStatusColumn = columns.some(col => col.dataIndex === 'status');
      if (!hasStatusColumn) {
        setColumns(prevColumns => [
          ...prevColumns,
          { title: "Trạng thái", dataIndex: "status", render: (status) => getStatusText(status) }
        ]);
      }
    }
  }, [statusCounts]);

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

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h2>Quản lý kết quả khám sức khỏe</h2>
        <div className="admin-header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm kết quả khám..."
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
              className="admin-btn refresh-btn"
              onClick={handleRefresh}
              disabled={loading}
              title="Làm mới dữ liệu"
            >
              <FaSync />
            </button>
          </div>
          <button className="admin-btn" onClick={() => setShowAddModal(true)}>
            <FaPlus /> Thêm kết quả khám
          </button>
        </div>
      </div>

      {schedules.length === 0 && !loading && (
        <div className="alert alert-warning" style={{ margin: '10px 0' }}>
          <strong>Lưu ý:</strong> Không thể tải danh sách lịch khám sức khỏe. Một số chức năng có thể bị hạn chế.
        </div>
      )}

      <div className="admin-table-container">
        {loading ? (
          <div className="loading-spinner">Đang tải...</div>
        ) : (
          <TableWithPaging
            columns={columns}
            data={results}
            page={page}
            pageSize={10}
            onPageChange={setPage}
            actionColumnTitle="Thao tác"
            emptyMessage="Không có kết quả khám sức khỏe nào"
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
                  onClick={() => handleDeleteResult(row.healthCheckupRecordId)}
                >
                  <FaTrash style={iconStyle.delete} size={18} />
                </button>
              </div>
            )}
          />
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Thêm kết quả khám sức khỏe</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddResult}>
              <div className="form-group">
                <label>Lịch khám <span className="required">*</span></label>
                <select
                  name="healthCheckScheduleId"
                  value={formData.healthCheckScheduleId}
                  onChange={handleScheduleChange}
                  required
                  className="form-control"
                >
                  <option value="">-- Chọn lịch khám --</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.healthCheckScheduleId} value={schedule.healthCheckScheduleId}>
                      {schedule.name} - {new Date(schedule.checkDate).toLocaleDateString('vi-VN')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Hồ sơ sức khỏe <span className="required">*</span></label>
                <select
                  name="healthProfileId"
                  value={formData.healthProfileId}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                >
                  <option value="">-- Chọn hồ sơ sức khỏe --</option>
                  {/* Hiển thị danh sách hồ sơ sức khỏe nếu có */}
                  {formData.healthProfileId && (
                    <option value={formData.healthProfileId}>
                      Hồ sơ sức khỏe ID: {formData.healthProfileId}
                    </option>
                  )}
                </select>
                <small className="form-text text-muted">
                  Hồ sơ sức khỏe sẽ được tự động chọn khi bạn chọn lịch khám
                </small>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Chiều cao (cm) <span className="required">*</span></label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.1"
                    className="form-control"
                    placeholder="Nhập chiều cao"
                  />
                </div>
                <div className="form-group">
                  <label>Cân nặng (kg) <span className="required">*</span></label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.1"
                    className="form-control"
                    placeholder="Nhập cân nặng"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Thị lực mắt trái</label>
                  <input
                    type="text"
                    name="leftVision"
                    value={formData.leftVision}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Nhập thị lực mắt trái (VD: 10/10)"
                  />
                </div>
                <div className="form-group">
                  <label>Thị lực mắt phải</label>
                  <input
                    type="text"
                    name="rightVision"
                    value={formData.rightVision}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Nhập thị lực mắt phải (VD: 10/10)"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Kết quả</label>
                <textarea
                  name="result"
                  value={formData.result}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Nhập kết quả khám (VD: Bình thường, Cần theo dõi...)"
                  rows="3"
                ></textarea>
              </div>
              <div className="form-group">
                <label>Y tá phụ trách</label>
                <select
                  name="nurseId"
                  value={formData.nurseId}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value={localStorage.getItem("userId") || ""}>
                    {getNurseName(localStorage.getItem("userId")) || "Bạn (Y tá hiện tại)"}
                  </option>
                  {nurses.filter(n => n.nurseId !== parseInt(localStorage.getItem("userId"))).map((nurse) => (
                    <option key={nurse.nurseId} value={nurse.nurseId}>
                      {nurse.fullName || `Y tá ID: ${nurse.nurseId}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="0">Chưa hoàn thành</option>
                  <option value="1">Đã hoàn thành</option>
                  <option value="2">Đã hủy</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Nhập ghi chú (nếu có)"
                  rows="3"
                ></textarea>
              </div>
              <div className="form-actions">
                <button type="submit" className="admin-btn" disabled={loading}>
                  {loading ? "Đang thêm..." : "Thêm mới"}
                </button>
                <button
                  type="button"
                  className="admin-btn cancel-btn"
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

      {showViewModal && selectedResult && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Chi tiết kết quả khám sức khỏe</h3>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <strong>ID:</strong> {selectedResult.healthCheckupRecordId}
                </div>
                <div className="info-item" style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                  <strong>Học sinh:</strong> {selectedResult.studentName || "Không xác định"}
                </div>
                <div className="info-item">
                  <strong>Chiều cao:</strong> {selectedResult.height ? `${selectedResult.height} cm` : "Không có"}
                </div>
                <div className="info-item">
                  <strong>Cân nặng:</strong> {selectedResult.weight ? `${selectedResult.weight} kg` : "Không có"}
                </div>
                <div className="info-item">
                  <strong>Thị lực mắt trái:</strong> {selectedResult.leftVision || "Không có"}
                </div>
                <div className="info-item">
                  <strong>Thị lực mắt phải:</strong> {selectedResult.rightVision || "Không có"}
                </div>
                <div className="info-item">
                  <strong>Trạng thái:</strong> {getStatusText(selectedResult.status)}
                </div>
                <div className="info-item">
                  <strong>Y tá:</strong> {selectedResult.nurseName || "Không có"}
                </div>
                <div className="info-item full-width">
                  <strong>Kết quả:</strong> {selectedResult.result || "Không có"}
                </div>
                <div className="info-item full-width">
                  <strong>Ghi chú:</strong> {selectedResult.note || "Không có"}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="admin-btn" onClick={() => setShowViewModal(false)}>
                Đóng
              </button>
              <button className="admin-btn" onClick={() => {
                setShowViewModal(false);
                handleEdit(selectedResult);
              }}>
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedResult && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Chỉnh sửa kết quả khám sức khỏe</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateResult}>
              <div className="form-group">
                <label>Lịch khám <span className="required">*</span></label>
                <select
                  name="healthCheckScheduleId"
                  value={formData.healthCheckScheduleId}
                  onChange={handleScheduleChange}
                  required
                  className="form-control"
                  disabled
                >
                  <option value="">-- Chọn lịch khám --</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.healthCheckScheduleId} value={schedule.healthCheckScheduleId}>
                      {schedule.name} - {new Date(schedule.checkDate).toLocaleDateString('vi-VN')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Hồ sơ sức khỏe <span className="required">*</span></label>
                <select
                  name="healthProfileId"
                  value={formData.healthProfileId}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  disabled
                >
                  <option value="">-- Chọn hồ sơ sức khỏe --</option>
                  {formData.healthProfileId && (
                    <option value={formData.healthProfileId}>
                      Hồ sơ sức khỏe ID: {formData.healthProfileId}
                    </option>
                  )}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Chiều cao (cm) <span className="required">*</span></label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.1"
                    className="form-control"
                    placeholder="Nhập chiều cao"
                  />
                </div>
                <div className="form-group">
                  <label>Cân nặng (kg) <span className="required">*</span></label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.1"
                    className="form-control"
                    placeholder="Nhập cân nặng"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Thị lực mắt trái</label>
                  <input
                    type="text"
                    name="leftVision"
                    value={formData.leftVision}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Nhập thị lực mắt trái (VD: 10/10)"
                  />
                </div>
                <div className="form-group">
                  <label>Thị lực mắt phải</label>
                  <input
                    type="text"
                    name="rightVision"
                    value={formData.rightVision}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Nhập thị lực mắt phải (VD: 10/10)"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Kết quả</label>
                <textarea
                  name="result"
                  value={formData.result}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Nhập kết quả khám (VD: Bình thường, Cần theo dõi...)"
                  rows="3"
                ></textarea>
              </div>
              <div className="form-group">
                <label>Y tá phụ trách</label>
                <select
                  name="nurseId"
                  value={formData.nurseId}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value={localStorage.getItem("userId") || ""}>
                    {getNurseName(localStorage.getItem("userId")) || "Bạn (Y tá hiện tại)"}
                  </option>
                  {nurses.filter(n => n.nurseId !== parseInt(localStorage.getItem("userId"))).map((nurse) => (
                    <option key={nurse.nurseId} value={nurse.nurseId}>
                      {nurse.fullName || `Y tá ID: ${nurse.nurseId}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="0">Chưa hoàn thành</option>
                  <option value="1">Đã hoàn thành</option>
                  <option value="2">Đã hủy</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Nhập ghi chú (nếu có)"
                  rows="3"
                ></textarea>
              </div>
              <div className="form-actions">
                <button type="submit" className="admin-btn" disabled={loading}>
                  {loading ? "Đang cập nhật..." : "Cập nhật"}
                </button>
                <button
                  type="button"
                  className="admin-btn cancel-btn"
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
    </div>
  );
};

export default HealthResults; 