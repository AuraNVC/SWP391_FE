import React, { useState, useEffect } from "react";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import TableWithPaging from "../components/TableWithPaging";
import {
  FaEye,
  FaEdit,
  FaPlus,
  FaSearch,
  FaSync,
  FaTrash,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import "../styles/Dashboard.css";
import { getAcceptedStudentsBySchedule } from "../services/utils";

// Component riêng để hiển thị tên học sinh
const StudentNameCell = ({
  studentId,
  initialName,
  healthProfileId,
  showIdInTable = true,
}) => {
  const [studentName, setStudentName] = useState(
    initialName || `Học sinh ID: ${studentId || "N/A"}`
  );
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
            const name =
              response.fullName ||
              `${response.firstName || ""} ${response.lastName || ""}`.trim() ||
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
          console.log(
            `Trying to get student info from health profile ID: ${healthProfileId}`
          );
          try {
            // Sử dụng API.HEALTH_PROFILE thay vì healthProfileAPI.getById
            const profileData = await API_SERVICE.healthProfileAPI.get(
              healthProfileId
            );

            if (profileData && profileData.studentId) {
              // Đã có studentId từ health profile, gọi API để lấy thông tin học sinh
              const studentResponse = await API_SERVICE.studentAPI.getById(
                profileData.studentId
              );
              if (studentResponse) {
                const name =
                  studentResponse.fullName ||
                  `${studentResponse.firstName || ""} ${
                    studentResponse.lastName || ""
                  }`.trim() ||
                  studentResponse.name;

                console.log(
                  `Fetched student name from health profile: ${name}`
                );
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
              const name =
                studentInfo.fullName ||
                `${studentInfo.firstName || ""} ${
                  studentInfo.lastName || ""
                }`.trim() ||
                studentInfo.name;
              setStudentName(name);
              setDisplayName(name);
            }
          } catch (profileError) {
            console.error(
              `Error fetching health profile ${healthProfileId}:`,
              profileError
            );
            if (
              initialName &&
              !initialName.includes("ID:") &&
              !initialName.includes("Học sinh ID")
            ) {
              setStudentName(initialName);
              setDisplayName(initialName);
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching student name:`, error);
        // Nếu có lỗi nhưng có initialName hợp lệ, sử dụng initialName
        if (
          initialName &&
          !initialName.includes("ID:") &&
          !initialName.includes("Học sinh ID")
        ) {
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

  return <span>{loading ? "Đang tải..." : displayName || studentName}</span>;
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
    healthCheckScheduleSearchTerm: "", // Thêm state mới để lưu từ khóa tìm kiếm lịch khám
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
    note: "",
  });

  // Thêm useEffect để tự động lấy thông tin y tá đăng nhập
  useEffect(() => {
    const fetchLoggedInNurseInfo = async () => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        try {
          const nurseInfo = await API_SERVICE.nurseAPI.getById(userId);
          if (nurseInfo) {
            setFormData((prevFormData) => ({
              ...prevFormData,
              nurseId: userId,
              nurseName:
                nurseInfo.fullName ||
                `${nurseInfo.firstName || ""} ${
                  nurseInfo.lastName || ""
                }`.trim(),
              nurseSearchTerm:
                nurseInfo.fullName ||
                `${nurseInfo.firstName || ""} ${
                  nurseInfo.lastName || ""
                }`.trim(),
            }));
          }
        } catch (error) {
          console.error("Error fetching logged-in nurse info:", error);
        }
      }
    };

    fetchLoggedInNurseInfo();
  }, []);

  // Thêm useEffect để xóa thông tin học sinh khi thay đổi lịch khám
  useEffect(() => {
    if (!formData.healthCheckScheduleId) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        studentId: "",
        studentSearchTerm: "",
      }));
      setFilteredStudents([]);
    }
  }, [formData.healthCheckScheduleId]);

  // State mới để lưu danh sách học sinh, y tá và lịch khám đã lọc
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filteredNurses, setFilteredNurses] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showNurseDropdown, setShowNurseDropdown] = useState(false);
  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);

  // State mới cho tính năng lọc nâng cao
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filters, setFilters] = useState({
    date: "",
    studentName: "",
    height: "",
    weight: "",
    schedule: "",
  });

  // State mới cho tính năng sắp xếp
  const [sortConfig, setSortConfig] = useState({
    key: "healthCheckupRecordId",
    direction: "desc",
  });

  const [statusCounts, setStatusCounts] = useState({});

  const { setNotif } = useNotification();

  const [columns, setColumns] = useState([
    {
      title: "ID",
      dataIndex: "healthCheckupRecordId",
      key: "recordId",
      render: (id) => <span>{id}</span>,
    },
    {
      title: "Học sinh",
      dataIndex: "studentName",
      key: "studentName",
      render: (name, record) => (
        <span>
          <StudentNameCell
            studentId={record.studentId}
            initialName={record.studentName}
            healthProfileId={record.healthProfileId}
          />
        </span>
      ),
    },
    {
      title: "Chiều cao",
      dataIndex: "height",
      key: "heightValue",
      render: (height) => <span>{height ? `${height} cm` : "N/A"}</span>,
    },
    {
      title: "Cân nặng",
      dataIndex: "weight",
      key: "weightValue",
      render: (weight) => <span>{weight ? `${weight} kg` : "N/A"}</span>,
    },
    {
      title: "Thị lực",
      dataIndex: "vision",
      key: "visionValue",
      render: (_, record) => {
        // Xử lý hiển thị thị lực đúng định dạng
        let leftVision = record.leftVision || "N/A";
        let rightVision = record.rightVision || "N/A";

        // Đảm bảo hiển thị đúng định dạng X/10
        if (leftVision !== "N/A") {
          leftVision = leftVision.includes("/10")
            ? leftVision
            : `${leftVision}/10`;
          // Loại bỏ các định dạng lỗi như 2/10/10
          leftVision = leftVision.replace(/\/10\/10$/, "/10");
        }

        if (rightVision !== "N/A") {
          rightVision = rightVision.includes("/10")
            ? rightVision
            : `${rightVision}/10`;
          // Loại bỏ các định dạng lỗi như 2/10/10
          rightVision = rightVision.replace(/\/10\/10$/, "/10");
        }

        return <span>{`T: ${leftVision}, P: ${rightVision}`}</span>;
      },
    },
    {
      title: "Kết quả",
      dataIndex: "result",
      key: "resultText",
      render: (result) => <span>{result || "Không có kết quả"}</span>,
    },
    {
      title: "Y tá",
      dataIndex: "nurseName",
      key: "nurseName",
      render: (name, record) => (
        <span>{name || getNurseName(record.nurseId) || "Không xác định"}</span>
      ),
    },
  ]);

  const iconStyle = {
    view: { color: "#007bff" },
    edit: { color: "#28a745" },
    delete: { color: "#dc3545" },
  };

  const getStudentName = (studentId) => {
    if (!studentId) return "";
    console.log(
      "Finding student with ID:",
      studentId,
      "Type:",
      typeof studentId
    );

    // Chuyển đổi studentId thành cả string và number để so sánh
    const studentIdStr = String(studentId);
    const studentIdNum = parseInt(studentId, 10);

    const student = students.find(
      (s) =>
        String(s.studentId) === studentIdStr || s.studentId === studentIdNum
    );

    if (student) {
      console.log("Found student:", student);
      return student.fullName;
    }

    return "";
  };

  const getNurseName = (nurseId) => {
    if (!nurseId) return "";
    const nurse = nurses.find(
      (n) => n.nurseId === nurseId || n.nurseId === parseInt(nurseId)
    );
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
        await Promise.all([
          fetchHealthCheckSchedules(),
          fetchHealthCheckResults(),
        ]);
      } catch (error) {
        console.error("Error initializing data:", error);
        setNotif({
          message: "Không thể tải dữ liệu ban đầu",
          type: "error",
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
        includeDetails: true,
      });
      console.log("Students API response:", response);

      // Xử lý dữ liệu học sinh
      let studentsData = response;
      if (
        !Array.isArray(response) &&
        response &&
        response.data &&
        Array.isArray(response.data)
      ) {
        studentsData = response.data;
      }

      if (Array.isArray(studentsData)) {
        // Xử lý dữ liệu học sinh để đảm bảo đầy đủ thông tin
        const processedStudents = studentsData.map((student) => {
          // Đảm bảo studentId luôn tồn tại và nhất quán
          const studentId = student.studentId || student.id;

          // Xử lý fullName từ các nguồn khác nhau
          let fullName = student.fullName;
          if (!fullName) {
            if (student.firstName || student.lastName) {
              fullName = `${student.firstName || ""} ${
                student.lastName || ""
              }`.trim();
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
            fullName: fullName,
          };
        });

        console.log("Processed students:", processedStudents);
        setStudents(processedStudents);
        // Lưu danh sách học sinh vào localStorage để sử dụng khi cần
        localStorage.setItem("studentsList", JSON.stringify(processedStudents));
        return processedStudents;
      } else {
        console.warn("Students API did not return an array:", response);
        setStudents([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      // Thử lấy danh sách học sinh từ localStorage nếu API lỗi
      const cachedStudents = localStorage.getItem("studentsList");
      if (cachedStudents) {
        const parsedStudents = JSON.parse(cachedStudents);
        console.log("Using cached students from localStorage:", parsedStudents);
        setStudents(parsedStudents);
        return parsedStudents;
      }

      setStudents([]);
      return [];
    }
  };

  const fetchNurses = async () => {
    try {
      console.log("Fetching nurses...");
      const response = await API_SERVICE.nurseAPI.getAll({
        keyword: "",
      });
      console.log("Nurses API response:", response);
      if (Array.isArray(response)) {
        setNurses(response);
        localStorage.setItem("nursesList", JSON.stringify(response));
        return response;
      } else {
        console.warn("Nurses API did not return an array:", response);
        setNurses([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching nurses:", error);
      const cachedNurses = localStorage.getItem("nursesList");
      if (cachedNurses) {
        const parsedNurses = JSON.parse(cachedNurses);
        setNurses(parsedNurses);
        return parsedNurses;
      }
      return [];
    }
  };

  // Hàm tìm kiếm cập nhật để tập trung vào lịch khám
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
        includeProfile: true,
      });

      console.log("Health check results API response:", response);

      let resultsData = response;
      if (
        !Array.isArray(response) &&
        response &&
        response.data &&
        Array.isArray(response.data)
      ) {
        resultsData = response.data;
      }

      if (Array.isArray(resultsData) && resultsData.length > 0) {
        // Xử lý dữ liệu bằng hàm processHealthCheckResults
        console.log("Processing health check results data...");
        const processedResults = await processHealthCheckResults(resultsData);

        // Loại bỏ cột trạng thái nếu có
        setColumns((prevColumns) =>
          prevColumns.filter((col) => col.dataIndex !== "status")
        );

        if (keyword && keyword.trim() !== "") {
          // Lọc kết quả dựa trên từ khóa tìm kiếm, ưu tiên tìm kiếm theo lịch khám
          const filteredResults = processedResults.filter((result) => {
            const searchStr = keyword.toLowerCase();

            // Tìm kiếm theo tên lịch khám (ưu tiên)
            if (
              result.scheduleName &&
              result.scheduleName.toLowerCase().includes(searchStr)
            ) {
              return true;
            }

            // Tìm kiếm theo ID lịch khám
            if (
              result.healthCheckScheduleId &&
              String(result.healthCheckScheduleId).includes(searchStr)
            ) {
              return true;
            }

            // Các điều kiện tìm kiếm khác giữ nguyên
            // Tìm kiếm theo ID
            if (
              result.healthCheckupRecordId &&
              String(result.healthCheckupRecordId).includes(searchStr)
            ) {
              return true;
            }

            // Tìm kiếm theo tên học sinh
            if (
              result.studentName &&
              result.studentName.toLowerCase().includes(searchStr)
            ) {
              return true;
            }

            // Tìm kiếm theo ID học sinh
            if (
              result.studentId &&
              String(result.studentId).includes(searchStr)
            ) {
              return true;
            }

            // Tìm kiếm theo kết quả
            if (
              result.result &&
              result.result.toLowerCase().includes(searchStr)
            ) {
              return true;
            }

            return false;
          });

          console.log(
            `Found ${filteredResults.length} results matching keyword "${keyword}"`
          );
          setResults(filteredResults);

          if (filteredResults.length === 0) {
            setNotif({
              message: `Không tìm thấy kết quả nào phù hợp với từ khóa: "${keyword}"`,
              type: "info",
              autoDismiss: true,
              duration: 5000,
            });
          }
        } else {
          setResults(processedResults);
        }
      } else {
        console.warn(
          "No health check results found or API returned empty data"
        );
        setResults([]);
      }
    } catch (error) {
      console.error("Error fetching health check results:", error);
      setNotif({
        message: "Không thể tải danh sách kết quả khám sức khỏe",
        type: "error",
        autoDismiss: true,
        duration: 5000,
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
        includeStudent: true,
      });
      console.log("Health check schedules API response:", response);

      let schedulesData = response;
      if (
        !Array.isArray(response) &&
        response &&
        response.data &&
        Array.isArray(response.data)
      ) {
        schedulesData = response.data;
      }

      if (Array.isArray(schedulesData) && schedulesData.length > 0) {
        const processedSchedules = schedulesData.map((schedule) => {
          return {
            ...schedule,
            healthCheckScheduleId:
              schedule.healthCheckScheduleId ||
              schedule.scheduleId ||
              schedule.id,
            name:
              schedule.name ||
              schedule.title ||
              `Lịch khám ${
                schedule.healthCheckScheduleId ||
                schedule.scheduleId ||
                schedule.id ||
                ""
              }`,
            checkDate:
              schedule.checkDate || schedule.date || new Date().toISOString(),
            healthProfileId:
              schedule.healthProfileId || schedule.profileId || "",
          };
        });

        console.log("Processed health check schedules:", processedSchedules);
        setSchedules(processedSchedules);
      } else {
        console.warn(
          "Health check schedules API did not return valid data:",
          response
        );
        setSchedules([]);
      }
    } catch (error) {
      console.error("Error fetching health check schedules:", error);
      setNotif({
        message: "Không thể tải danh sách lịch khám sức khỏe",
        type: "error",
      });

      console.log("Error fetching health check schedules");
      setSchedules([]);
    }
  };

  // Cập nhật hàm handleSearch để tìm kiếm ưu tiên theo ID
  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      console.log("Tìm kiếm kết quả khám với từ khóa:", searchKeyword);

      // Nếu từ khóa trống, hiển thị tất cả kết quả
      if (!searchKeyword.trim()) {
        await fetchHealthCheckResults("");
        setSearchLoading(false);
        return;
      }

      // Kiểm tra xem searchKeyword có phải là ID không
      const isNumeric = /^\d+$/.test(searchKeyword);

      if (isNumeric) {
        // Nếu là ID, ưu tiên tìm kiếm theo ID kết quả khám
        const foundResults = results.filter(
          (result) => result.healthCheckupRecordId?.toString() === searchKeyword
        );

        if (foundResults.length > 0) {
          // Nếu tìm thấy, cập nhật filteredResults
          setFilteredResults(foundResults);
          setNotif({
            message: `Tìm thấy kết quả khám có ID: ${searchKeyword}`,
            type: "success",
            autoDismiss: true,
            duration: 3000,
          });
          setSearchLoading(false);
          return;
        }

        // Nếu không tìm thấy ID kết quả khám, thử tìm theo ID học sinh hoặc ID lịch khám
        const otherResults = results.filter(
          (result) =>
            result.healthCheckScheduleId?.toString() === searchKeyword ||
            result.studentId?.toString() === searchKeyword
        );

        if (otherResults.length > 0) {
          setFilteredResults(otherResults);
          setNotif({
            message: `Tìm thấy ${otherResults.length} kết quả khám liên quan đến ID: ${searchKeyword}`,
            type: "success",
            autoDismiss: true,
            duration: 3000,
          });
          setSearchLoading(false);
          return;
        }
      }

      // Nếu không phải ID hoặc không tìm thấy, gọi API với từ khóa
      setPage(1);
      await fetchHealthCheckResults(searchKeyword);
    } catch (error) {
      console.error("Error during search:", error);
      setNotif({
        message: "Lỗi khi tìm kiếm: " + (error.message || "Không xác định"),
        type: "error",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  // Hàm xử lý dữ liệu kết quả khám sức khỏe (tách từ fetchHealthCheckResults)
  const processHealthCheckResults = async (resultsData) => {
    if (!Array.isArray(resultsData)) {
      console.warn(
        "processHealthCheckResults received non-array data:",
        resultsData
      );
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
    const processedResults = resultsData.map((result) => {
      console.log("Processing health check result:", result);

      // Lấy thông tin học sinh
      let studentName = "";
      let studentId = "";
      let healthProfileId = result.healthProfileId || null;

      // Kiểm tra nếu có thông tin học sinh trong result
      if (result.student && result.student.fullName) {
        studentName = result.student.fullName;
        studentId = result.student.studentId || result.student.id;
        console.log(
          `Found student info in result: ID=${studentId}, Name=${studentName}`
        );
      } else if (
        result.studentName &&
        !result.studentName.includes("Hồ sơ sức khỏe ID")
      ) {
        studentName = result.studentName;
        studentId = result.studentId;
        console.log(
          `Found student name in result: ID=${studentId}, Name=${studentName}`
        );
      } else if (
        result.healthProfile &&
        result.healthProfile.student &&
        result.healthProfile.student.fullName
      ) {
        studentName = result.healthProfile.student.fullName;
        studentId =
          result.healthProfile.student.studentId ||
          result.healthProfile.student.id;
        console.log(
          `Found student info in health profile: ID=${studentId}, Name=${studentName}`
        );
      } else if (result.healthProfile && result.healthProfile.studentId) {
        // Tìm học sinh từ healthProfile
        console.log(
          `Looking for student with ID: ${result.healthProfile.studentId} in list of ${currentStudents.length} students`
        );
        const student = currentStudents.find(
          (s) => String(s.studentId) === String(result.healthProfile.studentId)
        );
        if (student) {
          studentName = student.fullName;
          studentId = student.studentId;
          console.log(
            `Found student in students list: ID=${studentId}, Name=${studentName}`
          );
        } else {
          // Thay vì hiển thị "Học sinh ID", chỉ lưu ID để StudentNameCell xử lý
          studentName = "";
          studentId = result.healthProfile.studentId;
          console.log(
            `Could not find student with ID=${studentId} in students list`
          );
        }
      } else if (result.studentId) {
        // Tìm học sinh từ ID
        console.log(
          `Looking for student with ID: ${result.studentId} in list of ${currentStudents.length} students`
        );
        const student = currentStudents.find(
          (s) => String(s.studentId) === String(result.studentId)
        );
        if (student) {
          studentName = student.fullName;
          studentId = result.studentId;
          console.log(
            `Found student in students list: ID=${studentId}, Name=${studentName}`
          );
        } else {
          // Thay vì hiển thị "Học sinh ID", chỉ lưu ID để StudentNameCell xử lý
          studentName = "";
          studentId = result.studentId;
          console.log(
            `Could not find student with ID=${studentId} in students list`
          );
        }
      } else if (result.healthProfileId) {
        // Không gọi API để lấy thông tin health profile nữa
        // Thay vào đó, sử dụng ID để hiển thị
        studentName = "";
        studentId = "";
        healthProfileId = result.healthProfileId;
        console.log(
          `Using health profile ID for later processing: ${result.healthProfileId}`
        );
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
        const nurse = currentNurses.find(
          (n) => String(n.nurseId) === String(result.nurseId)
        );
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
        const schedule = currentSchedules.find(
          (s) => String(s.healthCheckScheduleId) === String(scheduleId)
        );
        if (schedule) {
          scheduleName = `${schedule.name} - ${new Date(
            schedule.checkDate
          ).toLocaleDateString("vi-VN")}`;
        } else {
          scheduleName = `Lịch khám ID: ${scheduleId}`;
        }
      }

      // Xử lý trạng thái
      let statusValue = result.status;
      if (statusValue === null || statusValue === undefined) {
        statusValue = "0"; // Default: Pending
      } else if (typeof statusValue === "string") {
        if (statusValue.toLowerCase() === "pending") {
          statusValue = "0";
        } else if (statusValue.toLowerCase() === "completed") {
          statusValue = "1";
        } else if (statusValue.toLowerCase() === "cancelled") {
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
      } else {
        // Đảm bảo định dạng X/10 và loại bỏ các định dạng lỗi
        leftVisionValue = leftVisionValue.includes("/10")
          ? leftVisionValue
          : `${leftVisionValue}/10`;
        leftVisionValue = leftVisionValue.replace(/\/10\/10$/, "/10");
      }

      if (rightVisionValue === null || rightVisionValue === undefined) {
        rightVisionValue = "N/A";
      } else {
        // Đảm bảo định dạng X/10 và loại bỏ các định dạng lỗi
        rightVisionValue = rightVisionValue.includes("/10")
          ? rightVisionValue
          : `${rightVisionValue}/10`;
        rightVisionValue = rightVisionValue.replace(/\/10\/10$/, "/10");
      }

      // Xử lý trường kết quả
      let resultValue = result.result;
      if (resultValue === null || resultValue === undefined) {
        resultValue = "";
      }

      // Tạo một đối tượng mới thay vì sử dụng spread operator để tránh trùng lặp các key
      const processedResult = {
        // Đảm bảo các trường dữ liệu đúng tên
        healthCheckupRecordId:
          result.healthCheckupRecordId || result.recordId || result.id,
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
        note: noteValue,
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
      await Promise.all([
        fetchHealthCheckSchedules(),
        fetchHealthCheckResults(""),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
      setNotif({
        message: "Không thể làm mới dữ liệu",
        type: "error",
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

    // Xử lý đặc biệt cho trường thị lực
    if (name === "leftVision" || name === "rightVision") {
      // Kiểm tra nếu giá trị rỗng
      if (value === "") {
        // Cho phép trường rỗng
        setFormData({
          ...formData,
          [name]: value,
        });
      } else {
        // Chỉ cho phép số nguyên từ 0-10
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
          // Lưu giá trị dạng X/10
          setFormData({
            ...formData,
            [name]: `${numValue}/10`,
          });
        }
      }
    } else {
      // Xử lý bình thường cho các trường khác
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Xử lý tìm kiếm học sinh khi người dùng nhập vào ô tìm kiếm học sinh
    if (name === "studentSearchTerm") {
      // Chỉ cho phép tìm kiếm trong danh sách học sinh đã được lọc theo lịch khám
      if (formData.healthCheckScheduleId) {
        // Nếu ô trống, reset danh sách học sinh và đóng dropdown
        if (!value.trim()) {
          resetStudentsList();
          setShowStudentDropdown(false);
          return;
        }

        // Chỉ lọc từ danh sách học sinh ban đầu của lịch khám đã chọn
        if (
          window.originalStudentsList &&
          window.originalStudentsList.length > 0
        ) {
          const filtered = window.originalStudentsList.filter(
            (student) =>
              student.fullName?.toLowerCase().includes(value.toLowerCase()) ||
              `${student.studentId}`.includes(value)
          );

          setFilteredStudents(filtered);

          // Chỉ hiển thị dropdown khi có kết quả
          if (filtered.length > 0) {
            setShowStudentDropdown(true);
          } else {
            setShowStudentDropdown(false);
            setNotif({
              message: "Không tìm thấy học sinh nào phù hợp",
              type: "info",
              autoDismiss: true,
              duration: 2000,
            });
          }
        }
      } else {
        // Nếu chưa chọn lịch khám, không cho phép tìm kiếm học sinh
        setNotif({
          message: "Vui lòng chọn lịch khám trước",
          type: "warning",
          autoDismiss: true,
          duration: 3000,
        });
        setFormData({
          ...formData,
          studentSearchTerm: "",
        });
      }
    }

    // Xử lý tìm kiếm y tá khi người dùng nhập vào ô tìm kiếm y tá
    if (name === "nurseSearchTerm") {
      const filtered = nurses.filter(
        (nurse) =>
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
      { field: "healthCheckScheduleId", message: "Vui lòng chọn lịch khám" },
      { field: "studentId", message: "Vui lòng chọn học sinh" },
      { field: "height", message: "Vui lòng nhập chiều cao" },
      { field: "weight", message: "Vui lòng nhập cân nặng" },
      { field: "leftVision", message: "Vui lòng nhập thị lực mắt trái" },
      { field: "rightVision", message: "Vui lòng nhập thị lực mắt phải" },
      { field: "result", message: "Vui lòng nhập kết quả khám" },
    ];

    for (const { field, message } of requiredFields) {
      if (!formData[field]) {
        setNotif({
          message,
          type: "error",
          autoDismiss: true,
          duration: 5000,
        });
        return false;
      }
    }

    // Validate vision format
    if (formData.leftVision && !formData.leftVision.includes("/10")) {
      setNotif({
        message: "Thị lực mắt trái phải có định dạng X/10",
        type: "error",
        autoDismiss: true,
        duration: 5000,
      });
      return false;
    }

    if (formData.rightVision && !formData.rightVision.includes("/10")) {
      setNotif({
        message: "Thị lực mắt phải phải có định dạng X/10",
        type: "error",
        autoDismiss: true,
        duration: 5000,
      });
      return false;
    }

    // Validate check date
    const selectedSchedule = schedules.find(
      (s) =>
        String(s.healthCheckScheduleId) ===
        String(formData.healthCheckScheduleId)
    );
    if (selectedSchedule && selectedSchedule.checkDate) {
      const checkDate = new Date(selectedSchedule.checkDate);
      const today = new Date();
      // Đặt thời gian của ngày hiện tại về 00:00:00 để so sánh ngày
      today.setHours(0, 0, 0, 0);
      checkDate.setHours(0, 0, 0, 0);

      if (checkDate > today) {
        setNotif({
          message: `Không thể tạo kết quả khám vì ngày khám (${checkDate.toLocaleDateString(
            "vi-VN"
          )}) chưa đến.`,
          type: "error",
          autoDismiss: true,
          duration: 5000,
        });
        return false;
      }
    } else {
      setNotif({
        message:
          "Không tìm thấy thông tin ngày khám. Vui lòng chọn lịch khám hợp lệ.",
        type: "error",
        autoDismiss: true,
        duration: 5000,
      });
      return false;
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
        const foundStudent = students.find(
          (s) =>
            s.fullName === formData.studentSearchTerm ||
            formData.studentSearchTerm.includes(`ID: ${s.studentId}`)
        );
        if (foundStudent) {
          studentId = foundStudent.studentId;
        } else {
          throw new Error(
            "Không tìm thấy học sinh. Vui lòng chọn học sinh từ danh sách."
          );
        }
      }

      // Lấy nurseId từ localStorage (ID của y tá đăng nhập)
      let nurseId = localStorage.getItem("userId");
      if (!nurseId) {
        throw new Error(
          "Không tìm thấy thông tin y tá đăng nhập. Vui lòng đăng nhập lại."
        );
      }

      // Lấy healthProfileId từ studentId
      let healthProfileId = null;
      try {
        // Gọi API trực tiếp để lấy health profile từ studentId
        const directProfile = await API_SERVICE.healthProfileAPI.getByStudent(
          studentId
        );
        if (directProfile && directProfile.healthProfileId) {
          healthProfileId = directProfile.healthProfileId;
        } else {
          // Nếu không tìm được bằng API trực tiếp, thử tìm qua search
          const profileResponse = await API_SERVICE.healthProfileAPI.getAll({
            keyword: studentId.toString(),
          });

          // Tìm profile của học sinh
          if (Array.isArray(profileResponse) && profileResponse.length > 0) {
            const studentProfile = profileResponse.find(
              (p) => p.studentId === parseInt(studentId)
            );
            if (studentProfile) {
              healthProfileId = studentProfile.healthProfileId;
            }
          }
        }

        if (!healthProfileId) {
          throw new Error("Không tìm thấy hồ sơ sức khỏe của học sinh này.");
        }
      } catch (error) {
        console.error("Error getting health profile:", error);
        throw new Error(
          "Không thể lấy thông tin hồ sơ sức khỏe: " + error.message
        );
      }

      // Chuẩn bị dữ liệu để gửi
      const resultData = {
        healthCheckScheduleId: parseInt(formData.healthCheckScheduleId),
        healthProfileId: healthProfileId,
        nurseId: parseInt(nurseId),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        leftVision: formData.leftVision, // Đã có định dạng X/10
        rightVision: formData.rightVision, // Đã có định dạng X/10
        result: formData.result,
        note: formData.note,
        // Status không cần gửi vì BE mặc định sẽ đặt là 1 (Pending)
      };

      console.log("Sending data to create health check result:", resultData);

      // Gọi API để thêm kết quả khám
      await API_SERVICE.healthCheckResultAPI.create(resultData);

      // Nếu API thành công, cập nhật UI
      setNotif({
        message: "Thêm kết quả khám sức khỏe thành công!",
        type: "success",
      });

      // Đóng modal và tải lại dữ liệu
      setShowAddModal(false);
      fetchHealthCheckResults();

      // Reset form data
      setFormData({
        healthCheckScheduleId: "",
        healthCheckScheduleSearchTerm: "",
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
        note: "",
        // status không cần thiết vì BE mặc định là 1
      });
    } catch (error) {
      console.error("Error adding health check result:", error);
      setNotif({
        message:
          error.message ||
          "Không thể thêm kết quả khám sức khỏe. Vui lòng thử lại.",
        type: "error",
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
        duration: 5000,
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
      // Lấy nurseId từ localStorage (ID của y tá đăng nhập)
      let nurseId = localStorage.getItem("userId");
      if (!nurseId) {
        throw new Error(
          "Không tìm thấy thông tin y tá đăng nhập. Vui lòng đăng nhập lại."
        );
      }

      // Chuẩn bị dữ liệu để gửi - chỉ gửi các trường mà BE có thể cập nhật
      const resultData = {
        healthCheckupRecordId: formData.healthCheckupRecordId,
        nurseId: parseInt(nurseId),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        leftVision: formData.leftVision, // Đã có định dạng X/10
        rightVision: formData.rightVision, // Đã có định dạng X/10
        result: formData.result,
        note: formData.note,
      };

      console.log("Sending data to update health check result:", resultData);

      // Gọi API để cập nhật kết quả khám
      await API_SERVICE.healthCheckResultAPI.update(resultData);

      // Nếu API thành công, cập nhật UI
      setNotif({
        message: "Cập nhật kết quả khám sức khỏe thành công!",
        type: "success",
      });

      // Đóng modal và tải lại dữ liệu
      setShowEditModal(false);
      fetchHealthCheckResults(searchKeyword);
    } catch (error) {
      console.error("Error updating health check result:", error);
      setNotif({
        message:
          error.message ||
          "Không thể cập nhật kết quả khám sức khỏe. Vui lòng thử lại.",
        type: "error",
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

      // Lưu lại thông tin về lịch khám và học sinh trước khi xóa
      const deletedResult = results.find(
        (r) => r.healthCheckupRecordId === deleteId
      );
      const scheduleId = deletedResult?.healthCheckScheduleId;
      const studentId = deletedResult?.studentId;
      const studentName = deletedResult?.studentName;

      console.log(
        `Xóa kết quả khám của học sinh ${studentName} (ID: ${studentId}) cho lịch khám ID: ${scheduleId}`
      );

      // Gọi API xóa
      await API_SERVICE.healthCheckResultAPI.delete(deleteId);

      // Xóa cache sau khi xóa thành công
      clearCache();

      setNotif({
        message: "Xóa kết quả khám sức khỏe thành công",
        type: "success",
        autoDismiss: true,
        duration: 5000,
      });

      // Tải lại dữ liệu từ server
      await fetchHealthCheckResults(searchKeyword);

      // Nếu đang mở form thêm mới và đã chọn lịch khám, làm mới danh sách học sinh
      if (showAddModal && formData.healthCheckScheduleId) {
        console.log(
          "Đang mở form thêm mới, làm mới danh sách học sinh sau khi xóa kết quả"
        );

        // Tìm lịch khám đã chọn
        const selectedSchedule = schedules.find(
          (s) =>
            String(s.healthCheckScheduleId) ===
            String(formData.healthCheckScheduleId)
        );

        if (selectedSchedule) {
          try {
            // Kiểm tra formId
            if (!selectedSchedule.formId) {
              console.log(
                "Không tìm thấy formId trong dữ liệu lịch khám, thử lấy từ API..."
              );

              try {
                // Lấy thông tin chi tiết lịch khám từ API
                const scheduleDetail =
                  await API_SERVICE.healthCheckScheduleAPI.getById(
                    formData.healthCheckScheduleId
                  );

                if (scheduleDetail && scheduleDetail.formId) {
                  console.log(
                    "Đã lấy được formId từ API:",
                    scheduleDetail.formId
                  );

                  // Cập nhật formId vào lịch khám trong state
                  selectedSchedule.formId = scheduleDetail.formId;

                  // Cập nhật lại danh sách lịch khám
                  setSchedules((prevSchedules) => {
                    const updatedSchedules = [...prevSchedules];
                    const index = updatedSchedules.findIndex(
                      (s) =>
                        String(s.healthCheckScheduleId) ===
                        String(formData.healthCheckScheduleId)
                    );
                    if (index !== -1) {
                      updatedSchedules[index] = {
                        ...updatedSchedules[index],
                        formId: scheduleDetail.formId,
                      };
                    }
                    return updatedSchedules;
                  });
                } else {
                  throw new Error("Không tìm thấy formId trong dữ liệu API");
                }
              } catch (error) {
                console.error("Lỗi khi lấy thông tin lịch khám từ API:", error);
                throw new Error("Không thể lấy thông tin lịch khám");
              }
            }

            // Sử dụng hàm từ utils.jsx để lấy danh sách học sinh theo lớp
            const studentsInClass = await getAcceptedStudentsBySchedule(
              selectedSchedule,
              API_SERVICE
            );
            console.log(
              "Học sinh theo lớp sau khi xóa:",
              studentsInClass.length
            );

            // Lọc học sinh đã có kết quả khám
            const studentsWithResults = results
              .filter(
                (r) =>
                  String(r.healthCheckScheduleId) ===
                  String(formData.healthCheckScheduleId)
              )
              .map((r) => r.studentId);

            console.log(
              "Học sinh đã có kết quả khám sau khi xóa:",
              studentsWithResults
            );

            // Lọc ra học sinh chưa có kết quả khám
            const availableStudents = studentsInClass.filter(
              (student) => !studentsWithResults.includes(student.studentId)
            );

            console.log(
              `Học sinh có thể thêm kết quả khám sau khi xóa: ${availableStudents.length}`
            );
            console.log(
              "Học sinh đã xóa kết quả:",
              studentName,
              "(ID:",
              studentId,
              ")"
            );

            // Cập nhật danh sách học sinh có thể chọn
            setFilteredStudents(availableStudents);

            // Hiển thị thông báo nếu học sinh vừa xóa đã được thêm vào danh sách
            const studentAdded = availableStudents.some(
              (s) => String(s.studentId) === String(studentId)
            );
            if (studentAdded) {
              setNotif({
                message: `Học sinh ${studentName} đã được thêm vào danh sách có thể chọn`,
                type: "info",
                autoDismiss: true,
                duration: 3000,
              });
            }
          } catch (error) {
            console.error(
              "Error refreshing student list after deletion:",
              error
            );
          }
        }
      }
    } catch (error) {
      console.error("Error deleting health check result:", error);
      setNotif({
        message: "Không thể xóa kết quả khám sức khỏe",
        type: "error",
        autoDismiss: true,
        duration: 5000,
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
        const student = students.find(
          (s) => String(s.studentId) === String(studentId)
        );
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
            fullName:
              student.fullName ||
              `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
              student.name ||
              `Học sinh ID: ${student.studentId || student.id}`,
          };

          console.log(
            `Processed student from API: ${processedStudent.fullName}`
          );

          // Thêm học sinh này vào state và localStorage để sử dụng sau này
          setStudents((prevStudents) => {
            const updatedStudents = [...prevStudents];
            const existingIndex = updatedStudents.findIndex(
              (s) => String(s.studentId) === String(studentId)
            );
            if (existingIndex >= 0) {
              updatedStudents[existingIndex] = processedStudent;
            } else {
              updatedStudents.push(processedStudent);
            }

            // Cập nhật localStorage
            localStorage.setItem(
              "studentsList",
              JSON.stringify(updatedStudents)
            );

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
        scheduleInfo = schedules.find(
          (s) =>
            String(s.healthCheckScheduleId) ===
            String(record.healthCheckScheduleId)
        );

        // If schedule not found in state, try to fetch it
        if (!scheduleInfo && API_SERVICE.healthCheckScheduleAPI) {
          try {
            const fetchedSchedule =
              await API_SERVICE.healthCheckScheduleAPI.getById(
                record.healthCheckScheduleId
              );
            if (fetchedSchedule) {
              scheduleInfo = {
                healthCheckScheduleId:
                  fetchedSchedule.healthCheckScheduleId ||
                  fetchedSchedule.scheduleId ||
                  fetchedSchedule.id,
                name:
                  fetchedSchedule.name ||
                  fetchedSchedule.title ||
                  `Lịch khám ${fetchedSchedule.healthCheckScheduleId}`,
                checkDate:
                  fetchedSchedule.checkDate ||
                  fetchedSchedule.date ||
                  new Date().toISOString(),
              };

              // Update schedules state
              setSchedules((prev) => {
                const exists = prev.some(
                  (s) =>
                    String(s.healthCheckScheduleId) ===
                    String(scheduleInfo.healthCheckScheduleId)
                );
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
          scheduleName: scheduleInfo
            ? `${scheduleInfo.name} - ${new Date(
                scheduleInfo.checkDate
              ).toLocaleDateString("vi-VN")}`
            : null,
        });
        setShowViewModal(true);
        return;
      }

      // Nếu không có studentName hoặc studentId, thử lấy thông tin từ API
      if (record.studentId) {
        const studentResponse = await API_SERVICE.studentAPI.getById(
          record.studentId
        );
        if (studentResponse) {
          const name =
            studentResponse.fullName ||
            `${studentResponse.firstName || ""} ${
              studentResponse.lastName || ""
            }`.trim() ||
            studentResponse.name ||
            `Học sinh ID: ${record.studentId}`;

          setSelectedResult({
            ...record,
            studentName: `${name} (ID: ${record.studentId})`,
            scheduleName: scheduleInfo
              ? `${scheduleInfo.name} - ${new Date(
                  scheduleInfo.checkDate
                ).toLocaleDateString("vi-VN")}`
              : null,
          });
          setShowViewModal(true);
          return;
        }
      }

      // Nếu không có studentId hoặc không tìm được thông tin học sinh, thử dùng healthProfileId
      if (record.healthProfileId) {
        try {
          const profileData = await API_SERVICE.healthProfileAPI.get(
            record.healthProfileId
          );

          if (profileData && profileData.studentId) {
            // Đã có studentId từ health profile, gọi API để lấy thông tin học sinh
            const studentResponse = await API_SERVICE.studentAPI.getById(
              profileData.studentId
            );
            if (studentResponse) {
              const name =
                studentResponse.fullName ||
                `${studentResponse.firstName || ""} ${
                  studentResponse.lastName || ""
                }`.trim() ||
                studentResponse.name ||
                `Học sinh ID: ${profileData.studentId}`;

              setSelectedResult({
                ...record,
                studentName: `${name} (ID: ${profileData.studentId})`,
                studentId: profileData.studentId,
                scheduleName: scheduleInfo
                  ? `${scheduleInfo.name} - ${new Date(
                      scheduleInfo.checkDate
                    ).toLocaleDateString("vi-VN")}`
                  : null,
              });
            } else {
              setSelectedResult({
                ...record,
                studentName: `Học sinh ID: ${profileData.studentId}`,
                studentId: profileData.studentId,
                scheduleName: scheduleInfo
                  ? `${scheduleInfo.name} - ${new Date(
                      scheduleInfo.checkDate
                    ).toLocaleDateString("vi-VN")}`
                  : null,
              });
            }
          } else {
            setSelectedResult({
              ...record,
              studentName: `Học sinh ID: ${record.healthProfileId}`,
              scheduleName: scheduleInfo
                ? `${scheduleInfo.name} - ${new Date(
                    scheduleInfo.checkDate
                  ).toLocaleDateString("vi-VN")}`
                : null,
            });
          }
        } catch (error) {
          console.error("Error fetching health profile:", error);
          setSelectedResult({
            ...record,
            studentName:
              record.studentName ||
              `Học sinh ID: ${record.healthProfileId || "N/A"}`,
            scheduleName: scheduleInfo
              ? `${scheduleInfo.name} - ${new Date(
                  scheduleInfo.checkDate
                ).toLocaleDateString("vi-VN")}`
              : null,
          });
        }
      } else {
        // Nếu không có thông tin gì, hiển thị dữ liệu hiện có
        setSelectedResult(record);

        // Cập nhật formData cho chỉnh sửa
        setFormData({
          healthCheckScheduleId:
            record.healthCheckScheduleId || record.scheduleId || "",
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
          note:
            record.note === null || record.note === undefined
              ? ""
              : record.note,
        });
      }

      setShowViewModal(true);
    } catch (error) {
      console.error("Error preparing view data:", error);
      setNotif({
        message: "Lỗi",
        description:
          "Không thể hiển thị thông tin chi tiết. Vui lòng thử lại sau.",
      });
    }
  };

  // Xử lý khi nhấn nút chỉnh sửa
  const handleEdit = async (record) => {
    try {
      // Tìm thông tin học sinh từ ID
      let studentName = "";

      // Tìm thông tin học sinh
      if (record.studentId) {
        const student = students.find((s) => s.studentId === record.studentId);
        if (student) {
          studentName = student.fullName || `Học sinh ID: ${record.studentId}`;
        } else {
          try {
            const studentResponse = await API_SERVICE.studentAPI.getById(
              record.studentId
            );
            if (studentResponse) {
              studentName =
                studentResponse.fullName ||
                `${studentResponse.firstName || ""} ${
                  studentResponse.lastName || ""
                }`.trim() ||
                `Học sinh ID: ${record.studentId}`;
            } else {
              studentName =
                record.studentName || `Học sinh ID: ${record.studentId}`;
            }
          } catch (error) {
            console.error("Error fetching student:", error);
            studentName =
              record.studentName || `Học sinh ID: ${record.studentId}`;
          }
        }
      } else if (record.healthProfileId) {
        // Nếu không có studentId nhưng có healthProfileId, thử lấy thông tin học sinh từ healthProfileId
        try {
          const profileData = await API_SERVICE.healthProfileAPI.get(
            record.healthProfileId
          );
          if (profileData && profileData.studentId) {
            const studentResponse = await API_SERVICE.studentAPI.getById(
              profileData.studentId
            );
            if (studentResponse) {
              studentName =
                studentResponse.fullName ||
                `${studentResponse.firstName || ""} ${
                  studentResponse.lastName || ""
                }`.trim() ||
                `Học sinh ID: ${profileData.studentId}`;
              // Cập nhật studentId trong record
              record.studentId = profileData.studentId;
            } else {
              studentName = `Học sinh ID: ${profileData.studentId}`;
              record.studentId = profileData.studentId;
            }
          }
        } catch (error) {
          console.error("Error fetching student from health profile:", error);
          studentName = record.studentName || "Không xác định";
        }
      } else {
        studentName = record.studentName || "Không xác định";
      }

      // Lấy thông tin y tá đăng nhập
      const userId = localStorage.getItem("userId");
      let nurseName = "";

      try {
        const nurseInfo = await API_SERVICE.nurseAPI.getById(userId);
        if (nurseInfo) {
          nurseName =
            nurseInfo.fullName ||
            `${nurseInfo.firstName || ""} ${nurseInfo.lastName || ""}`.trim();
        } else {
          nurseName = "Y tá hiện tại";
        }
      } catch (error) {
        console.error("Error fetching logged-in nurse info:", error);
        nurseName = "Y tá hiện tại";
      }

      // Cập nhật formData cho chỉnh sửa - chỉ bao gồm các trường BE cho phép cập nhật
      setFormData({
        healthCheckupRecordId: record.healthCheckupRecordId,
        healthCheckScheduleId:
          record.healthCheckScheduleId || record.scheduleId || "", // Readonly, chỉ để hiển thị
        healthProfileId: record.healthProfileId || "", // Readonly, chỉ để hiển thị
        studentId: record.studentId || "", // Readonly, chỉ để hiển thị
        studentSearchTerm: studentName, // Readonly, chỉ để hiển thị
        nurseId: record.nurseId || localStorage.getItem("userId") || "",
        nurseName: record.nurseName || "",
        nurseSearchTerm: nurseName,
        height: record.height || "",
        weight: record.weight || "",
        leftVision: record.leftVision || "",
        rightVision: record.rightVision || "",
        result: record.result || "",
        note:
          record.note === null || record.note === undefined ? "" : record.note,
      });

      setSelectedResult(record);
      setShowEditModal(true);
    } catch (error) {
      console.error("Error preparing edit data:", error);
      setNotif({
        message: "Lỗi khi chuẩn bị dữ liệu chỉnh sửa",
        type: "error",
      });
    }
  };

  const handleScheduleChange = async (e) => {
    const scheduleId = e.target.value;
    console.log("handleScheduleChange called with scheduleId:", scheduleId);

    if (!scheduleId) {
      setFormData({
        ...formData,
        healthCheckScheduleId: "",
        healthProfileId: "",
        studentId: "",
        studentSearchTerm: "",
      });
      setFilteredStudents([]);
      return;
    }

    // Tìm lịch khám được chọn
    const selectedSchedule = schedules.find(
      (s) => String(s.healthCheckScheduleId) === String(scheduleId)
    );
    console.log("Selected schedule:", selectedSchedule);

    if (selectedSchedule) {
      // Kiểm tra ngày khám
      const checkDate = new Date(selectedSchedule.checkDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      checkDate.setHours(0, 0, 0, 0);

      if (checkDate > today) {
        setNotif({
          message: `Lịch khám này (${
            selectedSchedule.name
          } - ${checkDate.toLocaleDateString(
            "vi-VN"
          )}) chưa đến. Không thể thêm kết quả khám.`,
          type: "warning",
          autoDismiss: true,
          duration: 5000,
        });
        setFormData({
          ...formData,
          healthCheckScheduleId: "",
          healthCheckScheduleSearchTerm: "",
          studentId: "",
          studentSearchTerm: "",
        });
        setFilteredStudents([]);
        setShowScheduleDropdown(false);
        return;
      }

      setNotif({
        message: "Đang tải danh sách học sinh...",
        type: "info",
        autoDismiss: true,
        duration: 2000,
      });

      console.log("Selected schedule:", selectedSchedule);

      // Kiểm tra formId
      if (!selectedSchedule.formId) {
        console.log(
          "Không tìm thấy formId trong dữ liệu lịch khám, thử lấy từ API..."
        );

        try {
          // Lấy thông tin chi tiết lịch khám từ API
          const scheduleDetail =
            await API_SERVICE.healthCheckScheduleAPI.getById(scheduleId);
          console.log("Schedule detail from API:", scheduleDetail);

          if (scheduleDetail && scheduleDetail.formId) {
            console.log("Đã lấy được formId từ API:", scheduleDetail.formId);

            // Cập nhật formId vào lịch khám trong state
            selectedSchedule.formId = scheduleDetail.formId;

            // Cập nhật lại danh sách lịch khám
            setSchedules((prevSchedules) => {
              const updatedSchedules = [...prevSchedules];
              const index = updatedSchedules.findIndex(
                (s) => String(s.healthCheckScheduleId) === String(scheduleId)
              );
              if (index !== -1) {
                updatedSchedules[index] = {
                  ...updatedSchedules[index],
                  formId: scheduleDetail.formId,
                };
              }
              return updatedSchedules;
            });
          } else {
            throw new Error("Không tìm thấy formId trong dữ liệu API");
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin lịch khám từ API:", error);
          setNotif({
            message:
              "Lịch khám này không có liên kết với form nào. Vui lòng chọn lịch khám khác hoặc liên hệ quản lý.",
            type: "error",
            autoDismiss: true,
            duration: 5000,
          });
          setFilteredStudents([]);
          return;
        }
      }

      // Cập nhật formData với thông tin từ lịch khám
      setFormData({
        ...formData,
        healthCheckScheduleId: scheduleId,
        healthProfileId: selectedSchedule.healthProfileId || "",
        studentId: "", // Reset studentId khi thay đổi lịch khám
        studentSearchTerm: "",
        healthCheckScheduleSearchTerm:
          selectedSchedule.name || `Lịch khám ID: ${scheduleId}`,
      });

      setLoading(true);
      try {
        // Sử dụng hàm từ utils.jsx để lấy danh sách học sinh
        console.log(
          "Calling getAcceptedStudentsBySchedule with:",
          selectedSchedule
        );
        const studentsInClass = await getAcceptedStudentsBySchedule(
          selectedSchedule,
          API_SERVICE
        );

        console.log("Danh sách học sinh theo lớp:", studentsInClass);

        // Lọc học sinh đã có kết quả khám
        const studentsWithResults = results
          .filter((r) => String(r.healthCheckScheduleId) === String(scheduleId))
          .map((r) => r.studentId);

        console.log("Học sinh đã có kết quả khám:", studentsWithResults);

        // Lọc ra học sinh chưa có kết quả khám
        const availableStudents = studentsInClass.filter(
          (student) => !studentsWithResults.includes(student.studentId)
        );

        console.log("Học sinh có thể thêm kết quả khám:", availableStudents);

        // Lưu danh sách học sinh gốc để sử dụng cho việc lọc
        setFilteredStudents(availableStudents);

        // Lưu danh sách học sinh gốc vào biến mới để dùng khi reset
        window.originalStudentsList = [...availableStudents];

        if (availableStudents.length === 0) {
          setNotif({
            message:
              "Tất cả học sinh đã có kết quả khám hoặc không có học sinh nào trong lớp này",
            type: "warning",
            autoDismiss: true,
            duration: 3000,
          });
        } else {
          setNotif({
            message: `Đã tải xong! Có ${availableStudents.length} học sinh có thể thêm kết quả khám`,
            type: "success",
            autoDismiss: true,
            duration: 3000,
          });
          // Không tự động mở dropdown học sinh
          setShowStudentDropdown(false);
        }
      } catch (error) {
        console.error("Lỗi khi tìm học sinh:", error);
        setNotif({
          message: "Lỗi khi tìm học sinh: " + error.message,
          type: "error",
          autoDismiss: true,
          duration: 3000,
        });
        setFilteredStudents([]);
      } finally {
        setLoading(false);
        setShowScheduleDropdown(false);
      }
    } else {
      setNotif({
        message: "Không tìm thấy lịch khám được chọn",
        type: "error",
        autoDismiss: true,
        duration: 5000,
      });
      setFormData({
        ...formData,
        healthCheckScheduleId: "",
        healthCheckScheduleSearchTerm: "",
        studentId: "",
        studentSearchTerm: "",
      });
      setFilteredStudents([]);
    }
  };

  // Hàm để lấy thông tin học sinh từ healthProfileId
  const fetchStudentInfoFromHealthProfile = async (healthProfileId) => {
    if (!healthProfileId) return;

    try {
      console.log(
        `Fetching student info from health profile ID: ${healthProfileId}`
      );
      const profileData = await API_SERVICE.healthProfileAPI.getById(
        healthProfileId
      );

      if (profileData && profileData.studentId) {
        console.log(
          `Found student ID ${profileData.studentId} in health profile ${healthProfileId}`
        );

        // Cập nhật studentId trong formData
        setFormData((prevFormData) => ({
          ...prevFormData,
          studentId: profileData.studentId,
        }));

        // Thử lấy thông tin chi tiết của học sinh
        try {
          const studentData = await API_SERVICE.studentAPI.getById(
            profileData.studentId
          );
          if (studentData) {
            console.log(
              `Found student details for ID ${profileData.studentId}:`,
              studentData
            );
          }
        } catch (error) {
          console.error(
            `Error fetching student details for ID ${profileData.studentId}:`,
            error
          );
        }
      } else if (profileData && profileData.student) {
        console.log(
          `Found student info directly in health profile ${healthProfileId}:`,
          profileData.student
        );

        // Cập nhật studentId trong formData
        setFormData((prevFormData) => ({
          ...prevFormData,
          studentId: profileData.student.studentId || profileData.student.id,
        }));
      } else {
        console.log(
          `No student information found in health profile ${healthProfileId}`
        );
      }
    } catch (error) {
      console.error(
        `Error fetching student info from health profile ${healthProfileId}:`,
        error
      );
    }
  };

  // Thêm useEffect để tự động làm mới dữ liệu sau khi component đã mount
  useEffect(() => {
    // Tạo một timeout để đảm bảo component đã render xong
    const refreshTimer = setTimeout(() => {
      console.log("Auto refreshing data after component mount");
      // Gọi trực tiếp API thay vì dùng handleRefresh để không hiển thị thông báo
      const autoRefresh = async () => {
        setLoading(true);
        try {
          await Promise.all([fetchStudents(), fetchNurses()]);
          await Promise.all([
            fetchHealthCheckSchedules(),
            fetchHealthCheckResults(""),
          ]);
        } catch (error) {
          console.error("Error auto refreshing data:", error);
        } finally {
          setLoading(false);
        }
      };
      autoRefresh();
    }, 500);

    // Thêm sự kiện click toàn cục để đóng dropdown khi click ra ngoài
    const handleClickOutside = (event) => {
      if (
        showScheduleDropdown &&
        !event.target.closest(".schedule-dropdown-container")
      ) {
        setShowScheduleDropdown(false);
      }
      if (
        showStudentDropdown &&
        !event.target.closest(".student-dropdown-container")
      ) {
        setShowStudentDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearTimeout(refreshTimer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showScheduleDropdown, showStudentDropdown]); // eslint-disable-line react-hooks/exhaustive-deps

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
      console.log(
        "Student IDs:",
        students.map((s) => s.studentId)
      );
    }
  }, [students]);

  // Thêm useEffect để debug thông tin kết quả khám
  useEffect(() => {
    if (results.length > 0) {
      console.log("Current results in state:", results);
      console.log(
        "Result student IDs:",
        results.map((r) => r.studentId)
      );
      console.log(
        "Result student names:",
        results.map((r) => r.studentName)
      );
    }
  }, [results]);

  // Khởi tạo danh sách lịch khám đã lọc khi schedules thay đổi
  useEffect(() => {
    if (schedules.length > 0) {
      setFilteredSchedules(schedules);
    }
  }, [schedules]);

  // Hàm mới để xử lý khi người dùng chọn một học sinh từ dropdown
  const handleSelectStudent = (student) => {
    setFormData({
      ...formData,
      studentId: student.studentId,
      // healthProfileId will be fetched from API later
      studentSearchTerm:
        student.fullName || `Học sinh ID: ${student.studentId}`,
    });
    setShowStudentDropdown(false);
  };

  // Hàm để reset danh sách học sinh về danh sách ban đầu
  const resetStudentsList = () => {
    if (window.originalStudentsList && window.originalStudentsList.length > 0) {
      setFilteredStudents(window.originalStudentsList);
    }
  };

  // Hàm mới để xử lý khi người dùng chọn một y tá từ dropdown
  const handleSelectNurse = (nurse) => {
    setFormData({
      ...formData,
      nurseId: nurse.nurseId,
      nurseSearchTerm: nurse.fullName || `Y tá ID: ${nurse.nurseId}`,
    });
    setShowNurseDropdown(false);
  };

  // Hàm xử lý sắp xếp
  const handleSort = (key) => {
    // Nếu key giống với key hiện tại, đảo ngược hướng sắp xếp
    // Nếu khác, đặt key mới và hướng mặc định là tăng dần
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  // Thêm useEffect mới để áp dụng bộ lọc khi results hoặc filters thay đổi
  useEffect(() => {
    applyFiltersAndSort(results, filters, sortConfig);
  }, [results, filters, sortConfig]);

  // Cập nhật hàm applyFiltersAndSort để xử lý tìm kiếm lịch khám bằng văn bản
  const applyFiltersAndSort = (
    resultsList = results,
    currentFilters = filters,
    currentSortConfig = sortConfig
  ) => {
    if (!resultsList || resultsList.length === 0) {
      setFilteredResults([]);
      return;
    }

    // Clone mảng kết quả để không thay đổi mảng gốc
    let filteredData = [...resultsList];

    // Lọc kết quả dựa trên bộ lọc
    if (currentFilters) {
      // Lọc theo lịch khám - tìm kiếm văn bản thay vì chọn từ danh sách
      if (currentFilters.schedule && currentFilters.schedule.trim() !== "") {
        const scheduleSearch = currentFilters.schedule.toLowerCase().trim();

        filteredData = filteredData.filter((result) => {
          // Tìm kiếm theo ID lịch khám
          if (
            result.healthCheckScheduleId &&
            String(result.healthCheckScheduleId).includes(scheduleSearch)
          ) {
            return true;
          }

          // Tìm kiếm theo tên lịch khám
          if (
            result.scheduleName &&
            result.scheduleName.toLowerCase().includes(scheduleSearch)
          ) {
            return true;
          }

          // Tìm trong danh sách lịch khám đã biết
          const matchedSchedule = schedules.find(
            (s) =>
              String(s.healthCheckScheduleId).includes(scheduleSearch) ||
              (s.name && s.name.toLowerCase().includes(scheduleSearch))
          );

          if (
            matchedSchedule &&
            String(result.healthCheckScheduleId) ===
              String(matchedSchedule.healthCheckScheduleId)
          ) {
            return true;
          }

          return false;
        });
      }

      // Lọc theo ngày
      if (currentFilters.date && currentFilters.date.trim() !== "") {
        const filterDate = new Date(currentFilters.date);
        filterDate.setHours(0, 0, 0, 0);

        filteredData = filteredData.filter((result) => {
          if (!result.date && !result.eventDate) return false;

          const resultDate = new Date(result.date || result.eventDate);
          resultDate.setHours(0, 0, 0, 0);

          return resultDate.getTime() === filterDate.getTime();
        });
      }

      // Lọc theo tên học sinh
      if (
        currentFilters.studentName &&
        currentFilters.studentName.trim() !== ""
      ) {
        const searchStudentName = currentFilters.studentName.toLowerCase();
        filteredData = filteredData.filter((result) => {
          return (
            (result.studentName &&
              result.studentName.toLowerCase().includes(searchStudentName)) ||
            (result.studentId &&
              String(result.studentId).includes(searchStudentName))
          );
        });
      }

      // Lọc theo chiều cao
      if (currentFilters.height && currentFilters.height.trim() !== "") {
        const searchHeight = currentFilters.height.toLowerCase();
        filteredData = filteredData.filter((result) => {
          if (!result.height) return false;
          return String(result.height).includes(searchHeight);
        });
      }

      // Lọc theo cân nặng
      if (currentFilters.weight && currentFilters.weight.trim() !== "") {
        const searchWeight = currentFilters.weight.toLowerCase();
        filteredData = filteredData.filter((result) => {
          if (!result.weight) return false;
          return String(result.weight).includes(searchWeight);
        });
      }
    }

    // Áp dụng sắp xếp - giữ nguyên logic hiện có
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
        } else if (currentSortConfig.key === "studentName") {
          // So sánh tên học sinh
          const nameA = a.studentName || getStudentName(a.studentId) || "";
          const nameB = b.studentName || getStudentName(b.studentId) || "";

          if (currentSortConfig.direction === "asc") {
            return nameA.localeCompare(nameB);
          } else {
            return nameB.localeCompare(nameA);
          }
        } else if (
          currentSortConfig.key === "height" ||
          currentSortConfig.key === "weight"
        ) {
          // So sánh chiều cao hoặc cân nặng (số)
          const valueA = parseFloat(a[currentSortConfig.key]) || 0;
          const valueB = parseFloat(b[currentSortConfig.key]) || 0;

          if (currentSortConfig.direction === "asc") {
            return valueA - valueB;
          } else {
            return valueB - valueA;
          }
        } else {
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
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Áp dụng bộ lọc ngay lập tức khi người dùng nhập
    applyFiltersAndSort(results, { ...filters, [name]: value }, sortConfig);
  };

  // Hàm reset bộ lọc
  const resetFilters = () => {
    const resetFilterValues = {
      date: "",
      studentName: "",
      height: "",
      weight: "",
      schedule: "",
    };
    setFilters(resetFilterValues);
    // Áp dụng ngay lập tức các bộ lọc đã reset
    applyFiltersAndSort(results, resetFilterValues, sortConfig);
  };

  // Thêm hàm xóa cache
  const clearCache = () => {
    console.log("Xóa cache để đảm bảo dữ liệu mới nhất");
    // Xóa cache API
    if (window.caches) {
      try {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
      } catch (e) {
        console.error("Error clearing browser cache:", e);
      }
    }

    // Xóa localStorage cache nếu có
    try {
      localStorage.removeItem("healthCheckResultsCache");
      localStorage.removeItem("healthCheckSchedulesCache");
    } catch (e) {
      console.error("Error clearing localStorage cache:", e);
    }
  };

  // Thêm hàm mới để làm mới danh sách học sinh
  const forceRefreshStudentList = async () => {
    if (!formData.healthCheckScheduleId) {
      setNotif({
        message: "Vui lòng chọn lịch khám trước",
        type: "warning",
        autoDismiss: true,
        duration: 3000,
      });
      return;
    }

    // Xóa cache trước khi làm mới
    clearCache();

    setLoading(true);
    try {
      // Tìm lịch khám đã chọn
      const scheduleId = formData.healthCheckScheduleId;
      const selectedSchedule = schedules.find(
        (s) => String(s.healthCheckScheduleId) === String(scheduleId)
      );

      if (selectedSchedule) {
        console.log("Làm mới danh sách học sinh cho lịch khám ID:", scheduleId);

        // Kiểm tra formId
        if (!selectedSchedule.formId) {
          console.log(
            "Không tìm thấy formId trong dữ liệu lịch khám, thử lấy từ API..."
          );

          try {
            // Lấy thông tin chi tiết lịch khám từ API
            const scheduleDetail =
              await API_SERVICE.healthCheckScheduleAPI.getById(scheduleId);

            if (scheduleDetail && scheduleDetail.formId) {
              console.log("Đã lấy được formId từ API:", scheduleDetail.formId);

              // Cập nhật formId vào lịch khám trong state
              selectedSchedule.formId = scheduleDetail.formId;

              // Cập nhật lại danh sách lịch khám
              setSchedules((prevSchedules) => {
                const updatedSchedules = [...prevSchedules];
                const index = updatedSchedules.findIndex(
                  (s) => String(s.healthCheckScheduleId) === String(scheduleId)
                );
                if (index !== -1) {
                  updatedSchedules[index] = {
                    ...updatedSchedules[index],
                    formId: scheduleDetail.formId,
                  };
                }
                return updatedSchedules;
              });
            } else {
              throw new Error("Không tìm thấy formId trong dữ liệu API");
            }
          } catch (error) {
            console.error("Lỗi khi lấy thông tin lịch khám từ API:", error);
            setNotif({
              message:
                "Lịch khám này không có liên kết với form nào. Vui lòng chọn lịch khám khác hoặc liên hệ quản lý.",
              type: "error",
              autoDismiss: true,
              duration: 5000,
            });
            setFilteredStudents([]);
            setLoading(false);
            return;
          }
        }

        // Sử dụng hàm từ utils.jsx để lấy danh sách học sinh theo lớp
        const studentsInClass = await getAcceptedStudentsBySchedule(
          selectedSchedule,
          API_SERVICE
        );

        console.log("Danh sách học sinh theo lớp:", studentsInClass);

        // Lọc học sinh đã có kết quả khám
        const studentsWithResults = results
          .filter((r) => String(r.healthCheckScheduleId) === String(scheduleId))
          .map((r) => r.studentId);

        console.log("Học sinh đã có kết quả khám:", studentsWithResults);

        // Lọc ra học sinh chưa có kết quả khám
        const availableStudents = studentsInClass.filter(
          (student) => !studentsWithResults.includes(student.studentId)
        );

        console.log("Học sinh có thể thêm kết quả khám:", availableStudents);

        setFilteredStudents(availableStudents);

        if (availableStudents.length === 0) {
          setNotif({
            message:
              "Tất cả học sinh đã có kết quả khám hoặc không có học sinh nào trong lớp này",
            type: "warning",
            autoDismiss: true,
            duration: 3000,
          });
        } else {
          setNotif({
            message: `Đã tìm thấy ${availableStudents.length} học sinh có thể thêm kết quả khám`,
            type: "success",
            autoDismiss: true,
            duration: 3000,
          });
        }
      }
    } catch (error) {
      console.error("Lỗi khi làm mới danh sách học sinh:", error);
      setNotif({
        message: "Lỗi khi làm mới danh sách học sinh: " + error.message,
        type: "error",
        autoDismiss: true,
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-main">
      <h2 className="dashboard-title">Kết quả khám sức khỏe</h2>
      <div className="admin-header">
        <button
          className="admin-btn"
          onClick={() => {
            setShowAddModal(true);
            setShowScheduleDropdown(false);
            setShowStudentDropdown(false);
            setShowNurseDropdown(false);
          }}
        >
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
            title="Nhập ID kết quả khám để tìm kiếm"
          />
          <button
            className="admin-btn"
            style={{ marginLeft: "8px", padding: "8px" }}
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            title={
              showAdvancedFilter ? "Ẩn bộ lọc nâng cao" : "Hiện bộ lọc nâng cao"
            }
          >
            <FaFilter />
          </button>
        </div>
      </div>

      {/* Phần bộ lọc nâng cao */}
      {showAdvancedFilter && (
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <h3 style={{ margin: "0", fontSize: "1.1rem", color: "#333" }}>
              Tìm kiếm nâng cao
            </h3>
            <button
              className="admin-btn"
              style={{
                backgroundColor: "#6c757d",
                padding: "4px 8px",
                fontSize: "0.8rem",
              }}
              onClick={resetFilters}
            >
              Đặt lại bộ lọc
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
            }}
          >
            {/* Lọc theo lịch khám */}
            <div>
              <label
                htmlFor="schedule"
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "0.9rem",
                }}
              >
                Lịch khám
              </label>
              <input
                type="text"
                id="schedule"
                name="schedule"
                value={filters.schedule || ""}
                onChange={handleFilterChange}
                className="form-control"
                placeholder="Nhập tên hoặc ID lịch khám..."
                style={{ width: "100%", padding: "8px" }}
              />
            </div>

            {/* Lọc theo ngày */}
            <div>
              <label
                htmlFor="date"
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "0.9rem",
                }}
              >
                Ngày khám
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="form-control"
                style={{ width: "100%", padding: "8px" }}
              />
            </div>

            {/* Lọc theo học sinh */}
            <div>
              <label
                htmlFor="studentName"
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "0.9rem",
                }}
              >
                Học sinh
              </label>
              <input
                type="text"
                id="studentName"
                name="studentName"
                value={filters.studentName}
                onChange={handleFilterChange}
                className="form-control"
                placeholder="Nhập tên học sinh hoặc ID"
                style={{ width: "100%", padding: "8px" }}
              />
            </div>

            {/* Lọc theo chiều cao */}
            <div>
              <label
                htmlFor="height"
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "0.9rem",
                }}
              >
                Chiều cao
              </label>
              <input
                type="text"
                id="height"
                name="height"
                value={filters.height}
                onChange={handleFilterChange}
                className="form-control"
                placeholder="Nhập chiều cao..."
                style={{ width: "100%", padding: "8px" }}
              />
            </div>

            {/* Lọc theo cân nặng */}
            <div>
              <label
                htmlFor="weight"
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "0.9rem",
                }}
              >
                Cân nặng
              </label>
              <input
                type="text"
                id="weight"
                name="weight"
                value={filters.weight}
                onChange={handleFilterChange}
                className="form-control"
                placeholder="Nhập cân nặng..."
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
          </div>

          {/* Thêm phần sắp xếp vào trong bộ lọc */}
          <div
            style={{ marginTop: "15px", display: "flex", alignItems: "center" }}
          >
            <div style={{ marginRight: "15px" }}>
              <span style={{ fontSize: "0.9rem", marginRight: "8px" }}>
                Sắp xếp theo:
              </span>
              <select
                value={sortConfig.key}
                onChange={(e) =>
                  setSortConfig({ ...sortConfig, key: e.target.value })
                }
                className="form-control"
                style={{
                  display: "inline-block",
                  width: "auto",
                  padding: "6px",
                }}
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
                style={{ padding: "6px" }}
                onClick={() =>
                  setSortConfig({
                    ...sortConfig,
                    direction: sortConfig.direction === "asc" ? "desc" : "asc",
                  })
                }
                title={
                  sortConfig.direction === "asc"
                    ? "Sắp xếp giảm dần"
                    : "Sắp xếp tăng dần"
                }
              >
                {sortConfig.direction === "asc" ? (
                  <FaSortAmountUp />
                ) : (
                  <FaSortAmountDown />
                )}
              </button>
            </div>
          </div>

          <div
            style={{ marginTop: "10px", fontSize: "0.9rem", color: "#6c757d" }}
          >
            <span>
              Đang hiển thị: <strong>{filteredResults.length}</strong> /{" "}
              {results.length} kết quả
            </span>
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
            data={
              filteredResults.length > 0 ||
              Object.values(filters).some((val) => val !== "")
                ? filteredResults
                : results
            }
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
          <div
            className="student-dialog-content"
            style={{ width: "700px", maxWidth: "90%" }}
          >
            <div className="student-dialog-header">
              <h2>Chi tiết kết quả khám sức khỏe</h2>
              <button
                className="student-dialog-close"
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>
            <div className="student-dialog-body">
              <div className="student-info-section">
                <h3 className="section-heading-blue">Thông tin chung</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>ID:</label>
                    <span>{selectedResult.healthCheckupRecordId}</span>
                  </div>
                  <div className="info-item">
                    <label>Lịch khám:</label>
                    <span>
                      {selectedResult.scheduleName ||
                        (selectedResult.healthCheckScheduleId
                          ? (() => {
                              const schedule = schedules.find(
                                (s) =>
                                  String(s.healthCheckScheduleId) ===
                                  String(selectedResult.healthCheckScheduleId)
                              );
                              return schedule
                                ? `${schedule.name} - ${new Date(
                                    schedule.checkDate
                                  ).toLocaleDateString("vi-VN")}`
                                : `Lịch khám ID: ${selectedResult.healthCheckScheduleId}`;
                            })()
                          : "Không có")}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Học sinh:</label>
                    <span>
                      {selectedResult.studentName.includes("ID:") ||
                      selectedResult.studentName.includes("(ID:")
                        ? selectedResult.studentName
                        : `${selectedResult.studentName} (ID: ${selectedResult.studentId})`}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Y tá phụ trách:</label>
                    <span>
                      {selectedResult.nurseName ||
                        getNurseName(selectedResult.nurseId) ||
                        "Không xác định"}{" "}
                      (ID: {selectedResult.nurseId})
                    </span>
                  </div>
                </div>
              </div>
              <div className="student-info-section">
                <h3 className="section-heading-blue">Kết quả khám</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Chiều cao:</label>
                    <span>
                      {selectedResult.height
                        ? `${selectedResult.height} cm`
                        : "Không có"}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Cân nặng:</label>
                    <span>
                      {selectedResult.weight
                        ? `${selectedResult.weight} kg`
                        : "Không có"}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Thị lực mắt trái:</label>
                    <span>
                      {selectedResult.leftVision
                        ? (selectedResult.leftVision.includes("/10")
                            ? selectedResult.leftVision
                            : `${selectedResult.leftVision}/10`
                          ).replace(/\/10\/10$/, "/10")
                        : "Không có"}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Thị lực mắt phải:</label>
                    <span>
                      {selectedResult.rightVision
                        ? (selectedResult.rightVision.includes("/10")
                            ? selectedResult.rightVision
                            : `${selectedResult.rightVision}/10`
                          ).replace(/\/10\/10$/, "/10")
                        : "Không có"}
                    </span>
                  </div>
                  <div
                    className="info-item"
                    style={{ gridColumn: "1 / span 2" }}
                  >
                    <label>Kết quả:</label>
                    <span>{selectedResult.result || "Không có"}</span>
                  </div>
                  <div
                    className="info-item"
                    style={{ gridColumn: "1 / span 2" }}
                  >
                    <label>Ghi chú:</label>
                    <span>{selectedResult.note || "Không có"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="student-dialog-footer">
              <button
                className="admin-btn"
                style={{ background: "#6c757d" }}
                onClick={() => setShowViewModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Updated to match MedEvents style */}
      {showEditModal && selectedResult && (
        <div className="student-create-modal-overlay">
          <div className="student-create-modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Chỉnh sửa kết quả khám sức khỏe</h3>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowEditModal(false)}
              ></button>
            </div>
            <form onSubmit={handleUpdateResult}>
              <div className="modal-body">
                <input
                  type="hidden"
                  name="healthCheckupRecordId"
                  value={formData.healthCheckupRecordId}
                />
                <div className="mb-3">
                  <label
                    htmlFor="edit-healthCheckScheduleId"
                    className="form-label"
                  >
                    Lịch khám
                  </label>
                  <input
                    type="text"
                    name="healthCheckScheduleId"
                    id="edit-healthCheckScheduleId"
                    value={(() => {
                      const schedule = schedules.find(
                        (s) =>
                          String(s.healthCheckScheduleId) ===
                          String(formData.healthCheckScheduleId)
                      );
                      return schedule
                        ? `${schedule.name} - ${new Date(
                            schedule.checkDate
                          ).toLocaleDateString("vi-VN")}`
                        : `Lịch khám ID: ${formData.healthCheckScheduleId}`;
                    })()}
                    className="form-control bg-light"
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="edit-studentId" className="form-label">
                    Học sinh
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      className="form-control bg-light"
                      id="edit-studentSearchTerm"
                      name="studentSearchTerm"
                      value={formData.studentSearchTerm || "Không xác định"}
                      readOnly
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="edit-nurseId" className="form-label">
                    Y tá phụ trách <span className="text-danger">*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      className="form-control bg-light"
                      id="edit-nurseSearchTerm"
                      name="nurseSearchTerm"
                      value={formData.nurseSearchTerm}
                      readOnly
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="edit-height" className="form-label">
                    Chiều cao (cm) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="edit-height"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="edit-weight" className="form-label">
                    Cân nặng (kg) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="edit-weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="edit-leftVision" className="form-label">
                    Thị lực mắt trái
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      id="edit-leftVision"
                      name="leftVision"
                      value={
                        formData.leftVision
                          ? formData.leftVision.split("/")[0]
                          : ""
                      }
                      onChange={handleInputChange}
                      placeholder="Nhập số từ 0-10"
                      min="0"
                      max="10"
                      step="1"
                    />
                    <span className="input-group-text">/10</span>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="edit-rightVision" className="form-label">
                    Thị lực mắt phải
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      id="edit-rightVision"
                      name="rightVision"
                      value={
                        formData.rightVision
                          ? formData.rightVision.split("/")[0]
                          : ""
                      }
                      onChange={handleInputChange}
                      placeholder="Nhập số từ 0-10"
                      min="0"
                      max="10"
                      step="1"
                    />
                    <span className="input-group-text">/10</span>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="edit-result" className="form-label">
                    Kết quả <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="edit-result"
                    name="result"
                    value={formData.result}
                    onChange={handleInputChange}
                    rows={3}
                    required
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="edit-note" className="form-label">
                    Ghi chú
                  </label>
                  <textarea
                    className="form-control"
                    id="edit-note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows={2}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  Lưu thay đổi
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal - Updated to match MedEvents style */}
      {showAddModal && (
        <div className="student-create-modal-overlay">
          <div className="student-create-modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Thêm kết quả khám sức khỏe mới</h3>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowAddModal(false)}
              ></button>
            </div>
            <form onSubmit={handleAddResult}>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="healthCheckScheduleId" className="form-label">
                    Lịch khám <span className="text-danger">*</span>
                  </label>
                  <div
                    style={{ position: "relative" }}
                    className="schedule-dropdown-container"
                  >
                    <input
                      type="text"
                      className="form-control"
                      id="healthCheckScheduleId"
                      name="healthCheckScheduleSearchTerm"
                      value={formData.healthCheckScheduleSearchTerm || ""}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          healthCheckScheduleSearchTerm: e.target.value,
                        });
                        // Lọc lịch khám dựa trên từ khóa tìm kiếm
                        const keyword = e.target.value.toLowerCase();
                        const filtered = schedules.filter(
                          (schedule) =>
                            schedule.name?.toLowerCase().includes(keyword) ||
                            String(schedule.healthCheckScheduleId).includes(
                              keyword
                            )
                        );
                        setFilteredSchedules(filtered);
                        if (e.target.value.trim() !== "") {
                          setShowScheduleDropdown(true);
                        }
                      }}
                      onClick={() => {
                        if (
                          formData.healthCheckScheduleSearchTerm?.trim() !== ""
                        ) {
                          setShowScheduleDropdown(true);
                        }
                      }}
                      placeholder="Nhập tên hoặc ID lịch khám"
                      autoFocus
                      required
                    />
                    {showScheduleDropdown && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          maxHeight: "200px",
                          overflowY: "auto",
                          backgroundColor: "white",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          zIndex: 1000,
                          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                        }}
                      >
                        {filteredSchedules && filteredSchedules.length > 0 ? (
                          filteredSchedules.map((schedule) => (
                            <div
                              key={schedule.healthCheckScheduleId}
                              className="dropdown-item"
                              style={{ padding: "8px 12px", cursor: "pointer" }}
                              onClick={() => {
                                handleScheduleChange({
                                  target: {
                                    value: schedule.healthCheckScheduleId,
                                  },
                                });
                                setFormData({
                                  ...formData,
                                  healthCheckScheduleId:
                                    schedule.healthCheckScheduleId,
                                  healthCheckScheduleSearchTerm: `${
                                    schedule.name
                                  } - ${new Date(
                                    schedule.checkDate
                                  ).toLocaleDateString("vi-VN")}`,
                                });
                                setShowScheduleDropdown(false);
                              }}
                            >
                              {schedule.name} -{" "}
                              {new Date(schedule.checkDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: "8px 12px" }}>
                            Không tìm thấy lịch khám
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="studentId" className="form-label">
                    Học sinh <span className="text-danger">*</span>
                  </label>
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                    className="student-dropdown-container"
                  >
                    <input
                      type="text"
                      className={`form-control ${
                        !formData.healthCheckScheduleId ? "bg-light" : ""
                      }`}
                      id="studentId"
                      name="studentSearchTerm"
                      value={formData.studentSearchTerm}
                      onChange={handleInputChange}
                      onBlur={() =>
                        setTimeout(() => setShowStudentDropdown(false), 200)
                      }
                      onClick={() => {
                        if (formData.healthCheckScheduleId) {
                          // Chỉ hiển thị dropdown khi đã chọn lịch khám và có học sinh để hiển thị
                          if (filteredStudents.length > 0) {
                            setShowStudentDropdown(true);
                          } else {
                            setNotif({
                              message:
                                "Không tìm thấy học sinh nào cho lịch khám này",
                              type: "info",
                              autoDismiss: true,
                              duration: 3000,
                            });
                          }
                        } else {
                          setNotif({
                            message: "Vui lòng chọn lịch khám trước",
                            type: "warning",
                            autoDismiss: true,
                            duration: 3000,
                          });
                        }
                      }}
                      placeholder={
                        formData.healthCheckScheduleId
                          ? "Chọn học sinh từ danh sách"
                          : "Vui lòng chọn lịch khám trước"
                      }
                      disabled={!formData.healthCheckScheduleId}
                      required
                      style={{ flex: 1 }}
                    />
                    {showStudentDropdown && filteredStudents.length > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          maxHeight: "200px",
                          overflowY: "auto",
                          backgroundColor: "white",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          zIndex: 1000,
                          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                        }}
                      >
                        {filteredStudents.map((student) => (
                          <div
                            key={student.studentId}
                            className="dropdown-item"
                            style={{ padding: "8px 12px", cursor: "pointer" }}
                            onClick={() => handleSelectStudent(student)}
                          >
                            {student.fullName ||
                              `Học sinh ID: ${student.studentId}`}
                          </div>
                        ))}
                      </div>
                    )}
                    {showStudentDropdown && filteredStudents.length === 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          padding: "8px 12px",
                          backgroundColor: "white",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          zIndex: 1000,
                        }}
                      >
                        Không tìm thấy học sinh
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="nurseId" className="form-label">
                    Y tá phụ trách <span className="text-danger">*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      className="form-control bg-light"
                      id="nurseId"
                      name="nurseSearchTerm"
                      value={formData.nurseSearchTerm}
                      readOnly
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="height" className="form-label">
                    Chiều cao (cm) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="height"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="weight" className="form-label">
                    Cân nặng (kg) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="leftVision" className="form-label">
                    Thị lực mắt trái
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      id="leftVision"
                      name="leftVision"
                      value={
                        formData.leftVision
                          ? formData.leftVision.split("/")[0]
                          : ""
                      }
                      onChange={handleInputChange}
                      placeholder="Nhập số từ 0-10"
                      min="0"
                      max="10"
                      step="1"
                    />
                    <span className="input-group-text">/10</span>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="rightVision" className="form-label">
                    Thị lực mắt phải
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      id="rightVision"
                      name="rightVision"
                      value={
                        formData.rightVision
                          ? formData.rightVision.split("/")[0]
                          : ""
                      }
                      onChange={handleInputChange}
                      placeholder="Nhập số từ 0-10"
                      min="0"
                      max="10"
                      step="1"
                    />
                    <span className="input-group-text">/10</span>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="result" className="form-label">
                  Kết quả <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  id="result"
                  name="result"
                  value={formData.result}
                  onChange={handleInputChange}
                  rows={3}
                  required
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="note" className="form-label">
                  Ghi chú
                </label>
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
                <button type="submit" className="btn btn-primary">
                  Lưu
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </button>
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
              <strong>Xác nhận thêm kết quả khám sức khỏe mới?</strong>
            </div>
            <div className="student-delete-modal-actions">
              <button className="btn btn-primary" onClick={confirmAddResult}>
                Xác nhận
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmAdd(false)}
              >
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
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmUpdate(false)}
              >
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
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmDelete(false)}
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

export default HealthResults;
