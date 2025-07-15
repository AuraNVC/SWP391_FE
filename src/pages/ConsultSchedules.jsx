import React, { useState, useEffect } from "react";
import { API_SERVICE } from "../services/api";
import { useNotification } from '../contexts/NotificationContext';
import '../styles/TableWithPaging.css';
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaTrash, FaPlus, FaSearch, FaSync, FaCalendarAlt } from "react-icons/fa";
import "../styles/Dashboard.css";


const ConsultSchedules = () => {
  // Lấy vai trò người dùng từ localStorage
  const userRole = localStorage.getItem("userRole") || "";
  const isNurse = userRole === "nurse";
  const [showCreateFormModal, setShowCreateFormModal] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [parents, setParents] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  // State cho xác nhận xóa
  const [showConfirmRequest, setShowConfirmRequest] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditFormModal, setShowEditFormModal] = useState(false); // State mới cho modal chỉnh sửa form
  const [showHistoryModal, setShowHistoryModal] = useState(false); // State mới cho modal lịch sử chỉnh sửa
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [consultationForm, setConsultationForm] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editFormData, setEditFormData] = useState(null); // State mới cho dữ liệu form đang chỉnh sửa
  const [formHistory, setFormHistory] = useState([]); // State mới để lưu lịch sử chỉnh sửa form
  const [formData, setFormData] = useState({
    consultationDate: new Date().toISOString().split('T')[0],
    consultationTime: "08:00",
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
    showFormSection: false
  });
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filteredNurses, setFilteredNurses] = useState([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showNurseDropdown, setShowNurseDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  const { setNotif } = useNotification();

  const columns = [
    { title: "ID", dataIndex: "consultationScheduleId" },
    { 
      title: "Học sinh", 
      dataIndex: "studentName", 
      render: (name, record) => (
        <>
          {name || "Không có"}
        </>
      )
    },
    { 
      title: "Y tá phụ trách", 
      dataIndex: "nurseName", 
      render: (name, record) => (
        <>
          {name || "Chưa phân công"}
        </>
      )
    },
    { title: "Địa điểm", dataIndex: "location" },
    { title: "Ngày tư vấn", dataIndex: "consultDate", render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : "N/A" },
    { title: "Giờ tư vấn", dataIndex: "consultTime", render: (_, record) => record.consultDate ? new Date(record.consultDate).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'}) : "N/A" },
  ];

  const iconStyle = {
    view: { color: "#007bff" },
    edit: { color: "#28a745" },
    delete: { color: "#dc3545" }
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
                console.log(`Found parent in cached list: ${parentName} (ID: ${parentId})`);
              } else {
                // Nếu không tìm thấy, thử tải thông tin phụ huynh từ API
                try {
                  const parentResponse = await API_SERVICE.parentAPI.getById(parentId);
                  console.log(`Parent API response for ID ${parentId}:`, parentResponse);
                  if (parentResponse) {
                    parentName = parentResponse.fullName || `${parentResponse.firstName || ''} ${parentResponse.lastName || ''}`.trim();
                    console.log(`Found parent from API: ${parentName} (ID: ${parentId})`);
                  }
                } catch (parentError) {
                  console.error(`Error fetching parent with ID ${parentId}:`, parentError);
                }
              }
            }
          }
        }
        
        const consultDateTime = schedule.consultDate ? new Date(schedule.consultDate) : null;
        
        return {
          ...schedule,
          consultationScheduleId: scheduleId,
          studentId: studentId,
          nurseId: nurseId,
          parentId: parentId,
          studentName: studentName || `ID: ${studentId || "N/A"}`,
          nurseName: nurseName || (nurseId ? `ID: ${nurseId}` : "Chưa phân công"),
          parentName: parentName || (parentId ? `ID: ${parentId}` : "Không có"),
          // Đảm bảo các trường dữ liệu
          location: schedule.location || "Không xác định",
          consultDate: schedule.consultDate,
          consultTime: consultDateTime ? consultDateTime.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'}) : null,
          hasParentInfo: !!parentName
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
      await fetchConsultationSchedules(searchKeyword);
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
      setNotif({
        message: "Dữ liệu đã được làm mới",
        type: "success"
      });
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
    if (!formData.consultationDate || !formData.consultationTime || !formData.location) {
      setNotif({
        message: "Vui lòng điền đầy đủ thông tin lịch tư vấn",
        type: "error"
      });
      return false;
    }
    
    // Kiểm tra trường học sinh
    if (!formData.studentId) {
      setNotif({
        message: "Vui lòng chọn học sinh",
        type: "error"
      });
      return false;
    }
    
    // Nếu hiển thị phần form tư vấn, kiểm tra các trường của form
    if (formData.showFormSection) {
      // Kiểm tra tiêu đề form
      if (!formData.formTitle) {
        setNotif({
          message: "Vui lòng nhập tiêu đề form tư vấn",
          type: "error"
        });
        return false;
      }
      
      // Kiểm tra nội dung form
      if (!formData.formContent) {
        setNotif({
          message: "Vui lòng nhập nội dung tư vấn",
          type: "error"
        });
        return false;
      }
    }
    
    return true;
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Kết hợp ngày và giờ thành một đối tượng Date
      const [year, month, day] = formData.consultationDate.split('-');
      const [hour, minute] = formData.consultationTime.split(':');
      const consultDateTime = new Date(year, month - 1, day, hour, minute);
      
      // Lấy thông tin phụ huynh từ học sinh
      const studentId = parseInt(formData.studentId);
      if (isNaN(studentId)) {
        throw new Error("ID học sinh không hợp lệ");
      }
      
      const student = students.find(s => s.studentId === studentId);
      const parentId = student?.parentId ? parseInt(student.parentId) : null;
      
      // Chuẩn bị dữ liệu gửi đi cho lịch tư vấn
      const scheduleData = {
        nurseId: parseInt(formData.nurseId) || null,
        studentId: studentId,
        location: formData.location,
        consultDate: consultDateTime.toISOString()
      };
      
      console.log("Submitting schedule data:", scheduleData);
      
      // Gọi API để tạo lịch tư vấn
      const scheduleResponse = await API_SERVICE.consultationScheduleAPI.create(scheduleData);
      console.log("Schedule API response:", scheduleResponse);
      
      // Lấy ID của lịch tư vấn vừa tạo
      const scheduleId = scheduleResponse.consultationScheduleId || scheduleResponse.id;
      
      if (!scheduleId) {
        throw new Error("Không nhận được ID lịch tư vấn từ API");
      }
      
      // Nếu có hiển thị phần form tư vấn và đã nhập thông tin form
      if (scheduleId && formData.showFormSection && formData.formTitle && formData.formContent) {
        // Chuẩn bị dữ liệu form tư vấn
        const formDataToSubmit = {
          consultationScheduleId: parseInt(scheduleId),
          nurseId: parseInt(formData.nurseId) || null,
          studentId: studentId,
          parentId: parentId,
          title: formData.formTitle,
          content: formData.formContent,
          status: 0 // Pending
        };
        
        console.log("Submitting form data:", formDataToSubmit);
        
        // Gọi API để tạo form tư vấn
        const formResponse = await API_SERVICE.consultationFormAPI.create(formDataToSubmit);
        console.log("Form API response:", formResponse);
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
            referenceId: scheduleId
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
      
      setShowAddModal(false);
      setFormData({
        consultationDate: new Date().toISOString().split('T')[0],
        consultationTime: "08:00",
        location: "Phòng y tế",
        studentId: "",
        nurseId: localStorage.getItem("userId") || "",
        parentId: "",
        parentName: "",
        formTitle: "",
        formContent: "",
        sendNotification: true,
        showFormSection: false
      });
      
      fetchConsultationSchedules(searchKeyword);
    } catch (error) {
      console.error("Error adding consultation schedule and form:", error);
      setNotif({
        message: "Không thể thêm lịch tư vấn và form: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Kết hợp ngày và giờ thành một đối tượng Date
      const [year, month, day] = formData.consultationDate.split('-');
      const [hour, minute] = formData.consultationTime.split(':');
      const consultDateTime = new Date(year, month - 1, day, hour, minute);
      
      // Đảm bảo ID lịch tư vấn là số nguyên
      const scheduleIdNum = parseInt(selectedSchedule.consultationScheduleId);
      if (isNaN(scheduleIdNum)) {
        throw new Error("ID lịch tư vấn không hợp lệ");
      }
      
      // Đảm bảo ID học sinh là số nguyên
      const studentId = parseInt(formData.studentId);
      if (isNaN(studentId)) {
        throw new Error("ID học sinh không hợp lệ");
      }
      
      // Đảm bảo ID y tá là số nguyên nếu có
      let nurseId = null;
      if (formData.nurseId) {
        nurseId = parseInt(formData.nurseId);
        if (isNaN(nurseId)) {
          nurseId = null;
        }
      }
      
      // Chuẩn bị dữ liệu gửi đi cho lịch tư vấn
      const scheduleData = {
        consultationScheduleId: scheduleIdNum,
        nurseId: nurseId,
        studentId: studentId,
        location: formData.location,
        consultDate: consultDateTime.toISOString()
      };
      
      console.log("Updating schedule with data:", scheduleData);
      
      // Gọi API để cập nhật lịch tư vấn
      const scheduleResponse = await API_SERVICE.consultationScheduleAPI.update(scheduleIdNum, scheduleData);
      console.log("Schedule API response:", scheduleResponse);
      
      // Lấy ID của lịch tư vấn
      const scheduleId = selectedSchedule.consultationScheduleId;
      
      // Lấy thông tin học sinh để biết phụ huynh
      const student = students.find(s => s.studentId === studentId);
      const parentId = student?.parentId ? parseInt(student.parentId) : null;
      
      // Cập nhật hoặc tạo form tư vấn nếu có thông tin form
      if (formData.formTitle && formData.formContent) {
        // Lưu phiên bản cũ vào lịch sử nếu đã có form
        if (formData.formId) {
          try {
            // Lấy thông tin form hiện tại
            const currentForm = await API_SERVICE.consultationFormAPI.getById(formData.formId);
            if (currentForm) {
              // Lưu vào lịch sử
              setFormHistory(prev => [...prev, {
                ...currentForm,
                modifiedDate: new Date().toISOString(),
                modifiedBy: localStorage.getItem("userId") || "",
                modifiedByName: localStorage.getItem("userName") || "Y tá"
              }]);
            }
          } catch (historyError) {
            console.error("Error saving form history:", historyError);
          }
          
          // Kiểm tra trạng thái form hiện tại
          let newStatus = formData.formStatus;
          
          // Nếu form đã được phụ huynh phản hồi (chấp nhận/từ chối), đặt lại trạng thái thành "Đang chờ"
          if (formData.formStatus === 1 || formData.formStatus === "Accepted" || 
              formData.formStatus === 2 || formData.formStatus === "Rejected") {
            newStatus = 0; // Pending
          }
          
          // Nếu đã có form, cập nhật
          const formDataToSubmit = {
            consultationFormId: parseInt(formData.formId),
            consultationScheduleId: scheduleIdNum,
            nurseId: nurseId,
            studentId: studentId,
            parentId: parentId,
            title: formData.formTitle,
            content: formData.formContent,
            status: newStatus,
            lastModified: new Date().toISOString(),
            modifiedBy: localStorage.getItem("userId") || ""
          };
          
          console.log("Updating form with data:", formDataToSubmit);
          
          // Gọi API để cập nhật form tư vấn
          const formResponse = await API_SERVICE.consultationFormAPI.update(formData.formId, formDataToSubmit);
          console.log("Form API response:", formResponse);
        } else {
          // Nếu chưa có form, tạo mới
          const formDataToSubmit = {
            consultationScheduleId: scheduleIdNum,
            nurseId: nurseId,
            studentId: studentId,
            parentId: parentId,
            title: formData.formTitle,
            content: formData.formContent,
            status: 0 // Pending
          };
          
          console.log("Creating new form with data:", formDataToSubmit);
          
          // Gọi API để tạo form tư vấn
          const formResponse = await API_SERVICE.consultationFormAPI.create(formDataToSubmit);
          console.log("Form API response:", formResponse);
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
    setShowViewModal(true);
  };
  
  // Hàm lấy danh sách phụ huynh đã được định nghĩa ở trên
  
  const fetchConsultationForm = async (scheduleId) => {
    setLoading(true);
    try {
      console.log("Fetching consultation form for schedule ID:", scheduleId);
      
      // Hiển thị loading trước khi có dữ liệu
      setShowFormModal(true);
      
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
      let consultationDate = new Date().toISOString().split('T')[0];
      let consultationTime = "08:00";
      
      if (schedule.consultDate) {
        const date = new Date(schedule.consultDate);
        if (!isNaN(date)) {
          consultationDate = date.toISOString().split('T')[0];
          consultationTime = date.toTimeString().substring(0, 5);
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
        consultationDate,
        consultationTime,
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

  // Hàm hiển thị lịch sử chỉnh sửa form
  const viewFormHistory = () => {
    if (formHistory.length === 0) {
      setNotif({
        message: "Chưa có lịch sử chỉnh sửa cho form này",
        type: "info"
      });
      return;
    }
    
    // Hiển thị modal lịch sử chỉnh sửa
    setShowHistoryModal(true);
  };

  // Hàm xử lý khi người dùng chọn một học sinh từ dropdown
  const handleSelectStudent = (student) => {
    setFormData({
      ...formData,
      studentId: student.studentId,
      studentSearchTerm: student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || `Học sinh ID: ${student.studentId}`
    });
    setShowStudentDropdown(false);
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

  return (
    <div className="admin-main">
      <h2 className="dashboard-title">Quản lý lịch tư vấn</h2>
      <div className="admin-header">
        <button className="admin-btn" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Thêm lịch tư vấn
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
          <button className="admin-btn" onClick={handleSearch} disabled={searchLoading}>
              {searchLoading ? "Đang tìm..." : <FaSearch />}
          </button>
        </div>
      </div>

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
            data={schedules}
            pageSize={10}
            page={page}
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
                  onClick={() => handleDeleteSchedule(row.consultationScheduleId)}
                >
                  <FaTrash style={iconStyle.delete} size={18} />
                </button>
              </div>
            )}
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
              <div className="mb-3">
                <label htmlFor="consultationDate" className="form-label">Ngày tư vấn <span className="text-danger">*</span></label>
                <input
                  type="date"
                  className="form-control"
                  id="consultationDate"
                  name="consultationDate"
                  value={formData.consultationDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="consultationTime" className="form-label">Giờ tư vấn <span className="text-danger">*</span></label>
                <input
                  type="time"
                  className="form-control"
                  id="consultationTime"
                  name="consultationTime"
                  value={formData.consultationTime}
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
              
              {/* Nút hiển thị/ẩn form tư vấn */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <button 
                  type="button" 
                  className="btn btn-outline-primary" 
                  onClick={() => setFormData({...formData, showFormSection: !formData.showFormSection})}
                >
                  {formData.showFormSection ? "Ẩn form tư vấn" : "Hiển thị form tư vấn"}
                </button>
              </div>
              
              {/* Thông tin form tư vấn - hiển thị khi nhấn nút */}
              {formData.showFormSection && (
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
                      required={formData.showFormSection}
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
                      required={formData.showFormSection}
                      placeholder="Nhập nội dung chi tiết về buổi tư vấn"
                    ></textarea>
                  </div>
                </div>
              )}
              
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
            </div>
            <div className="student-dialog-footer">
              <button 
                className="admin-btn" 
                onClick={() => fetchConsultationForm(selectedSchedule.consultationScheduleId)}
              >
                Xem form tư vấn
              </button>
              <button className="admin-btn" style={{ background: '#6c757d' }} onClick={() => setShowViewModal(false)}>
                Đóng
              </button>
              
            </div>
          </div>
        </div>
      )}

      {/* Modal hiển thị form tư vấn */}
      {showFormModal && (
        <div className="student-dialog-overlay">
          <div className="student-dialog-content" style={{ width: '700px', maxWidth: '90%' }}>
            <div className="student-dialog-header">
              <h2>Chi tiết form tư vấn</h2>
              <button className="student-dialog-close" onClick={() => setShowFormModal(false)}>×</button>
            </div>
            <div className="student-dialog-body">
              {loading ? (
                <div className="loading-container">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                  <p>Đang tải thông tin form tư vấn...</p>
                </div>
              ) : consultationForm ? (
                <div className="student-info-section">
                  <h3>Thông tin form tư vấn</h3>
                <div className="info-grid">
                    <div className="info-item">
                      <label>Form ID:</label>
                      <span>{consultationForm.consultationFormId}</span>
                  </div>
                    <div className="info-item">
                      <label>Schedule ID:</label>
                      <span>{consultationForm.consultationScheduleId}</span>
                  </div>
                    <div className="info-item">
                      <label>Phụ huynh:</label>
                      <span>{consultationForm.parentName || "Chưa có thông tin"} (ID: {consultationForm.parentId || "N/A"})</span>
                  </div>
                    <div className="info-item">
                      <label>Học sinh:</label>
                      <span>{consultationForm.studentName || "Chưa có thông tin"} (ID: {consultationForm.studentId || "N/A"})</span>
                  </div>
                    <div className="info-item">
                      <label>Y tá phụ trách:</label>
                      <span>{consultationForm.nurseName || "Chưa phân công"} (ID: {consultationForm.nurseId || "N/A"})</span>
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
                </div>
              ) : (
                <div className="text-center py-5">
                  <p>Không tìm thấy thông tin form tư vấn.</p>
                </div>
              )}
            </div>
            <div className="student-dialog-footer">
              <button className="admin-btn" style={{ background: '#6c757d' }} onClick={() => setShowFormModal(false)}>
                Đóng
              </button>
              {consultationForm && consultationForm.consultationFormId && (
                <>
              
                  <button
                    className="admin-btn"
                    style={{ background: '#17a2b8' }}
                    onClick={viewFormHistory}
                  >
                    Xem lịch sử chỉnh sửa
                  </button>
                </>
              )}
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
                <label htmlFor="edit-consultationDate" className="form-label">Ngày tư vấn <span className="text-danger">*</span></label>
                <input
                  type="date"
                  className="form-control"
                  id="edit-consultationDate"
                  name="consultationDate"
                  value={formData.consultationDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="edit-consultationTime" className="form-label">Giờ tư vấn <span className="text-danger">*</span></label>
                <input
                  type="time"
                  className="form-control"
                  id="edit-consultationTime"
                  name="consultationTime"
                  value={formData.consultationTime}
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
              
              {/* Nút hiển thị/ẩn form tư vấn */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <button 
                  type="button" 
                  className="btn btn-outline-primary" 
                  onClick={() => setFormData({...formData, showFormSection: !formData.showFormSection})}
                >
                  {formData.showFormSection ? "Ẩn form tư vấn" : "Hiển thị form tư vấn"}
                </button>
              </div>
              
              {/* Thông tin form tư vấn - hiển thị khi nhấn nút */}
              {formData.showFormSection && (
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
              )}
              
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

      {/* Modal lịch sử chỉnh sửa form tư vấn */}
      {showHistoryModal && (
        <div className="student-dialog-overlay">
          <div className="student-dialog-content" style={{ width: '700px', maxWidth: '90%' }}>
            <div className="student-dialog-header">
              <h2>Lịch sử chỉnh sửa form tư vấn</h2>
              <button className="student-dialog-close" onClick={() => setShowHistoryModal(false)}>×</button>
            </div>
            <div className="student-dialog-body">
              {formHistory.length > 0 ? (
                <div className="form-history-container">
                  <div className="alert alert-info mb-3">
                    <small>
                      <strong>Lưu ý:</strong> Hiển thị {formHistory.length} phiên bản chỉnh sửa trước đó của form này.
                      Phiên bản mới nhất được hiển thị đầu tiên.
                    </small>
                  </div>
                  
                  {formHistory.map((historyItem, index) => (
                    <div key={index} className="form-history-item mb-4 p-3 border rounded">
                      <div className="d-flex justify-content-between mb-2">
                        <h5 className="mb-0">{historyItem.title || "Không có tiêu đề"}</h5>
                        <span className="badge bg-secondary">
                          Phiên bản {formHistory.length - index}/{formHistory.length}
                        </span>
                      </div>
                      
                      <div className="form-history-meta text-muted mb-2">
                        <small>
                          Chỉnh sửa bởi: {historyItem.modifiedByName || "Y tá"} • 
                          Thời gian: {new Date(historyItem.modifiedDate).toLocaleString('vi-VN')}
                        </small>
                      </div>
                      
                      <div className="form-history-content p-2 bg-light rounded mb-2" style={{ whiteSpace: "pre-wrap" }}>
                        {historyItem.content || "Không có nội dung"}
                      </div>
                      
                      <div className="form-history-status">
                        <span className="me-2">Trạng thái:</span>
                        <span className={`badge ${
                          historyItem.status === 0 || historyItem.status === "Pending" ? "bg-warning" :
                          historyItem.status === 1 || historyItem.status === "Accepted" ? "bg-success" :
                          historyItem.status === 2 || historyItem.status === "Rejected" ? "bg-danger" : "bg-secondary"
                        }`}>
                          {historyItem.status === 0 || historyItem.status === "Pending" ? "Đang chờ" :
                           historyItem.status === 1 || historyItem.status === "Accepted" ? "Đã chấp nhận" :
                           historyItem.status === 2 || historyItem.status === "Rejected" ? "Đã từ chối" : 
                           historyItem.status || "Không xác định"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <p>Chưa có lịch sử chỉnh sửa cho form này.</p>
                </div>
              )}
            </div>
            <div className="student-dialog-footer">
              <button className="admin-btn" style={{ background: '#6c757d' }} onClick={() => setShowHistoryModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ConsultSchedules;

