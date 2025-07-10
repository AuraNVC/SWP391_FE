import React, { useState, useEffect } from "react";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaTrash, FaPlus, FaSearch, FaSync } from "react-icons/fa";
import "../styles/Dashboard.css";

const ConsultSchedules = () => {
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
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [consultationForm, setConsultationForm] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState({
    consultationDate: new Date().toISOString().split('T')[0],
    consultationTime: "08:00",
    location: "Phòng y tế",
    studentId: "",
    nurseId: localStorage.getItem("userId") || "",
  });

  const { setNotif } = useNotification();

  const columns = [
    { title: "ID", dataIndex: "consultationScheduleId" },
    { 
      title: "Học sinh", 
      dataIndex: "studentName", 
      render: (name, record) => (
        <>
          {name || "Không có"} 
          <span style={{ fontSize: "0.9em", color: "#666", display: "block" }}>ID: {record.studentId || "N/A"}</span>
        </>
      )
    },
    { 
      title: "Y tá phụ trách", 
      dataIndex: "nurseName", 
      render: (name, record) => (
        <>
          {name || "Chưa phân công"} 
          <span style={{ fontSize: "0.9em", color: "#666", display: "block" }}>ID: {record.nurseId || "N/A"}</span>
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
  }, []);

  const fetchConsultationSchedules = async (keyword = "") => {
    setLoading(true);
    try {
      console.log("Fetching consultation schedules with keyword:", keyword);
      
      // Kiểm tra xem API có tồn tại không
      if (!API_SERVICE || !API_SERVICE.consultationScheduleAPI || !API_SERVICE.consultationScheduleAPI.getAll) {
        console.error("API_SERVICE.consultationScheduleAPI.getAll is not available");
        setNotif({
          message: "API không khả dụng. Vui lòng kiểm tra kết nối.",
          type: "error"
        });
        setLoading(false);
        return;
      }
      
      // Gọi API với SearchConsultationScheduleRequest
      const response = await API_SERVICE.consultationScheduleAPI.getAll({
        keyword: keyword || ""
      });
      
      console.log("API response:", response);
      
      // Xử lý dữ liệu trả về từ API
      let schedulesData = [];
      if (Array.isArray(response)) {
        schedulesData = response;
      } else if (response && Array.isArray(response.data)) {
        schedulesData = response.data;
      } else if (response && typeof response === 'object') {
        // Trường hợp API trả về một đối tượng không phải mảng
        schedulesData = [response];
      } else {
        console.warn("API did not return an array or valid object:", response);
        setNotif({
          message: "API không trả về dữ liệu đúng định dạng",
          type: "error"
        });
        setLoading(false);
        return;
      }
      
      // Xử lý dữ liệu để hiển thị
      const processedSchedules = await Promise.all(schedulesData.map(async (schedule) => {
        // Lấy thông tin học sinh nếu có studentId
        let studentName = "";
        if (schedule.studentId) {
          try {
            const studentData = await API_SERVICE.studentAPI.getById(schedule.studentId);
            if (studentData) {
              studentName = studentData.fullName || `${studentData.firstName || ''} ${studentData.lastName || ''}`.trim();
            }
          } catch (error) {
            console.error(`Error fetching student with ID ${schedule.studentId}:`, error);
          }
        }
        
        // Lấy thông tin y tá nếu có nurseId
        let nurseName = "";
        let nurseData = null;
        if (schedule.nurseId) {
          try {
            // Tìm y tá trong danh sách đã tải
            nurseData = nurses.find(n => n.nurseId === schedule.nurseId);
            if (nurseData) {
              nurseName = nurseData.fullName || `${nurseData.firstName || ''} ${nurseData.lastName || ''}`.trim();
            } 
            // Nếu không tìm thấy, thử tải thông tin y tá từ API
            else {
              try {
                const nurseResponse = await API_SERVICE.nurseAPI.getById(schedule.nurseId);
                if (nurseResponse) {
                  nurseData = nurseResponse;
                  nurseName = nurseResponse.fullName || `${nurseResponse.firstName || ''} ${nurseResponse.lastName || ''}`.trim();
                }
              } catch (nurseError) {
                console.error(`Error fetching nurse with ID ${schedule.nurseId}:`, nurseError);
              }
            }
          } catch (error) {
            console.error(`Error finding nurse with ID ${schedule.nurseId}:`, error);
          }
        }
        
        const consultDateTime = schedule.consultDate ? new Date(schedule.consultDate) : null;
        
        return {
          ...schedule,
          studentName: studentName || `ID: ${schedule.studentId}`,
          nurseName: nurseName || (schedule.nurseId ? `ID: ${schedule.nurseId}` : "Chưa phân công"),
          // Đảm bảo các trường dữ liệu
          consultationScheduleId: schedule.consultationScheduleId,
          location: schedule.location || "Không xác định",
          consultDate: schedule.consultDate,
          consultTime: consultDateTime ? consultDateTime.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'}) : null,
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
      setStudents(studentsData);
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
  };

  const validateForm = () => {
    if (!formData.studentId || !formData.consultationDate || !formData.consultationTime || !formData.location) {
      setNotif({
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
        type: "error"
      });
      return false;
    }
    
    return true;
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    
    // Kiểm tra dữ liệu hợp lệ
    if (!validateForm()) {
      return;
    }
    
    try {
      // Kiểm tra API có tồn tại không
      if (!API_SERVICE || !API_SERVICE.consultationScheduleAPI || !API_SERVICE.consultationScheduleAPI.create) {
        console.error("API_SERVICE.consultationScheduleAPI.create is not available");
        setNotif({
          message: "API không khả dụng. Vui lòng kiểm tra kết nối.",
          type: "error"
        });
        return;
      }
      
      // Chuẩn bị dữ liệu để gửi đi
      const consultDate = new Date(`${formData.consultationDate}T${formData.consultationTime}`);
      
      const dataToSubmit = {
        consultDate: consultDate.toISOString(),
        location: formData.location,
        studentId: parseInt(formData.studentId),
        nurseId: parseInt(formData.nurseId)
      };
      
      console.log("Submitting data:", dataToSubmit);
      
      // Gọi API để tạo lịch tư vấn mới
      const response = await API_SERVICE.consultationScheduleAPI.create(dataToSubmit);
      
      console.log("API response:", response);
      
      // Hiển thị thông báo thành công
      setNotif({
        message: "Tạo lịch tư vấn thành công",
        type: "success"
      });
      
      // Đóng modal và cập nhật danh sách
      setShowAddModal(false);
      fetchConsultationSchedules();
      
      // Reset form data
      setFormData({
        consultationDate: new Date().toISOString().split('T')[0],
        consultationTime: "08:00",
        location: "Phòng y tế",
        studentId: "",
        nurseId: localStorage.getItem("userId") || "",
      });
    } catch (error) {
      console.error("Error adding consultation schedule:", error);
      setNotif({
        message: "Không thể tạo lịch tư vấn: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
    }
  };

  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    
    // Kiểm tra dữ liệu hợp lệ
    if (!validateForm()) {
      return;
    }
    
    try {
      // Kiểm tra API có tồn tại không
      if (!API_SERVICE || !API_SERVICE.consultationScheduleAPI || !API_SERVICE.consultationScheduleAPI.update) {
        console.error("API_SERVICE.consultationScheduleAPI.update is not available");
        setNotif({
          message: "API không khả dụng. Vui lòng kiểm tra kết nối.",
          type: "error"
        });
        return;
      }
      
      // Kết hợp ngày và giờ thành một đối tượng Date
      const consultDate = new Date(`${formData.consultationDate}T${formData.consultationTime}`);
      
      // Chuẩn bị dữ liệu để gửi đi
      const dataToSubmit = {
        consultationScheduleId: selectedSchedule.consultationScheduleId,
        consultDate: consultDate.toISOString(),
        location: formData.location,
        studentId: parseInt(formData.studentId),
        nurseId: parseInt(formData.nurseId)
      };
      
      console.log("Updating schedule with data:", dataToSubmit);
      
      // Gọi API để cập nhật lịch tư vấn
      const response = await API_SERVICE.consultationScheduleAPI.update(selectedSchedule.consultationScheduleId, dataToSubmit);
      
      console.log("API response:", response);
      
      // Hiển thị thông báo thành công
      setNotif({
        message: "Cập nhật lịch tư vấn thành công",
        type: "success"
      });
      
      // Đóng modal và cập nhật danh sách
      setShowEditModal(false);
      fetchConsultationSchedules();
    } catch (error) {
      console.error("Error updating consultation schedule:", error);
      setNotif({
        message: "Không thể cập nhật lịch tư vấn: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch tư vấn này không?")) {
      setLoading(true);
      try {
        console.log("Deleting schedule with ID:", id);
        await API_SERVICE.consultationScheduleAPI.delete(id);
        
        setNotif({
          message: "Xóa lịch tư vấn thành công",
          type: "success"
        });
        
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
    }
  };

  const handleView = (schedule) => {
    console.log("Viewing schedule:", schedule);
    setSelectedSchedule(schedule);
    setShowViewModal(true);
  };
  
  const fetchConsultationForm = async (scheduleId) => {
    setLoading(true);
    try {
      console.log("Fetching consultation form for schedule ID:", scheduleId);
      
      // Hiển thị loading trước khi có dữ liệu
      setShowFormModal(true);
      
      // Lấy thông tin lịch tư vấn
      const schedule = schedules.find(s => s.consultationScheduleId === scheduleId);
      console.log("Schedule details:", schedule);
      
      // Thử nhiều cách để lấy form tư vấn
      let matchingForm = null;
      
      // Sử dụng endpoint getBySchedule trực tiếp
      try {
        const response = await API_SERVICE.consultationFormAPI.getBySchedule(scheduleId);
        console.log("Consultation form by schedule ID response:", response);
        
        if (response) {
          if (Array.isArray(response)) {
            // Nếu API trả về mảng, lấy form đầu tiên
            if (response.length > 0) {
              matchingForm = response[0];
            }
          } else {
            // Nếu API trả về một đối tượng form
            matchingForm = response;
          }
        }
      } catch (error) {
        console.log("Error getting form by schedule ID:", error);
        
        // Thử cách thay thế nếu endpoint getBySchedule không hoạt động
        try {
          const directForm = await API_SERVICE.consultationFormAPI.getById(scheduleId);
          console.log("Direct form by ID:", directForm);
          if (directForm && !directForm.error) {
            matchingForm = directForm;
          }
        } catch (directError) {
          console.log("Could not get form directly by ID:", directError);
        }
        
        // Nếu vẫn không tìm thấy và có studentId, thử lấy form theo studentId
        if (!matchingForm && schedule && schedule.studentId) {
          try {
            const studentForms = await API_SERVICE.consultationFormAPI.getByStudent(schedule.studentId);
            console.log("Forms by student:", studentForms);
            
            if (Array.isArray(studentForms) && studentForms.length > 0) {
              // Tìm form có consultationScheduleId khớp với scheduleId
              matchingForm = studentForms.find(form => {
                const formSchedule = form.consultationSchedule;
                return formSchedule && formSchedule.consultationScheduleId === scheduleId;
              });
            }
          } catch (studentError) {
            console.log("Error getting forms by student:", studentError);
          }
        }
      }
      
      if (matchingForm) {
        console.log("Found matching consultation form:", matchingForm);
        
        // Tìm thông tin y tá phụ trách từ danh sách lịch tư vấn
        let nurseName = "";
        if (schedule && schedule.nurseId) {
          // Nếu đã có nurseName trong schedule, sử dụng luôn
          if (schedule.nurseName) {
            nurseName = schedule.nurseName;
          } else {
            // Tìm trong danh sách y tá đã tải
            const nurse = nurses.find(n => n.nurseId === schedule.nurseId);
            if (nurse) {
              nurseName = nurse.fullName || `${nurse.firstName || ''} ${nurse.lastName || ''}`.trim();
            } else {
              // Nếu không tìm thấy trong danh sách đã tải, thử tải thông tin y tá từ API
              try {
                const nurseResponse = await API_SERVICE.nurseAPI.getById(schedule.nurseId);
                if (nurseResponse) {
                  nurseName = nurseResponse.fullName || `${nurseResponse.firstName || ''} ${nurseResponse.lastName || ''}`.trim();
                }
              } catch (nurseError) {
                console.error(`Error fetching nurse with ID ${schedule.nurseId}:`, nurseError);
              }
            }
          }
        }
        
        // Tìm thông tin phụ huynh từ parentId
        let parentName = "";
        try {
          if (matchingForm.parentId) {
            const parentResponse = await API_SERVICE.parentAPI.getById(matchingForm.parentId);
            if (parentResponse) {
              parentName = parentResponse.fullName || `${parentResponse.firstName || ''} ${parentResponse.lastName || ''}`.trim();
            }
          }
        } catch (parentError) {
          console.error("Error fetching parent info:", parentError);
        }
        
        // Cập nhật state với dữ liệu từ API và thông tin phụ huynh/y tá
        const formData = {
          ...matchingForm,
          parentName: parentName || `ID: ${matchingForm.parentId}`,
          nurseName: nurseName || "Y tá phụ trách",
          // Đảm bảo các trường dữ liệu quan trọng
          consultationScheduleId: scheduleId
        };
        
        // Lưu thông tin debug vào console nhưng không hiển thị trên UI
        console.debug("Form data debug info:", {
          matchMethod: "found",
          originalForm: { ...matchingForm },
          schedule: schedule ? { ...schedule } : null
        });
        
        setConsultationForm(formData);
      } else {
        // Nếu không tìm thấy form, hiển thị thông tin lịch tư vấn
        if (schedule) {
          // Tìm thông tin y tá
          let nurseName = schedule.nurseName || "";
          if (!nurseName && schedule.nurseId) {
            const nurse = nurses.find(n => n.nurseId === schedule.nurseId);
            if (nurse) {
              nurseName = nurse.fullName || `${nurse.firstName || ''} ${nurse.lastName || ''}`.trim();
            }
          }
          
          // Tìm thông tin học sinh
          let studentName = schedule.studentName || "";
          if (!studentName && schedule.studentId) {
            try {
              const studentData = await API_SERVICE.studentAPI.getById(schedule.studentId);
              if (studentData) {
                studentName = studentData.fullName || `${studentData.firstName || ''} ${studentData.lastName || ''}`.trim();
              }
            } catch (error) {
              console.error(`Error fetching student with ID ${schedule.studentId}:`, error);
            }
          }
          
          const formData = {
            consultationFormId: null,
            consultationScheduleId: scheduleId,
            parentId: null,
            parentName: "Chưa có thông tin",
            title: `Tư vấn cho học sinh ${studentName || schedule.studentId}`,
            content: "Lịch tư vấn này chưa có form tư vấn đi kèm.",
            status: "Pending",
            nurseName: nurseName || "Y tá phụ trách",
            studentName: studentName || `ID: ${schedule.studentId}`
          };
          
          // Lưu thông tin debug vào console nhưng không hiển thị trên UI
          console.debug("Form data debug info:", {
            matchMethod: "not_found",
            schedule: { ...schedule }
          });
          
          setConsultationForm(formData);
        } else {
          throw new Error("Không tìm thấy lịch tư vấn");
        }
      }
    } catch (error) {
      console.error("Error in fetchConsultationForm:", error);
      
      // Thông báo lỗi cho người dùng
      setNotif({
        message: "Không thể lấy dữ liệu form tư vấn: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
      
      // Đóng modal nếu không có dữ liệu
      setShowFormModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule) => {
    console.log("Editing schedule:", schedule);
    setSelectedSchedule(schedule);
    
    // Format date to YYYY-MM-DD for input[type="date"]
    const consultDateTime = schedule.consultDate ? new Date(schedule.consultDate) : new Date();
    const formattedDate = consultDateTime.toISOString().split('T')[0];
    
    // Format time to HH:MM for input[type="time"]
    const hours = consultDateTime.getHours().toString().padStart(2, '0');
    const minutes = consultDateTime.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    
    setFormData({
      consultationDate: formattedDate,
      consultationTime: formattedTime,
      location: schedule.location || "Phòng y tế",
      studentId: schedule.studentId || "",
      nurseId: schedule.nurseId || localStorage.getItem("userId") || ""
    });
    
    setShowEditModal(true);
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

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h2>Quản lý lịch tư vấn</h2>
        <div className="admin-header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm lịch tư vấn..."
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
            <FaPlus /> Thêm lịch tư vấn
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="loading-spinner">Đang tải...</div>
        ) : (
          <TableWithPaging
            columns={columns}
            data={schedules}
            page={page}
            pageSize={10}
            onPageChange={setPage}
            actionColumnTitle="Thao tác"
            emptyMessage="Không có lịch tư vấn nào"
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
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Thêm lịch tư vấn</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddSchedule}>
              <div className="form-group">
                <label>Học sinh <span className="required">*</span></label>
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                >
                  <option value="">-- Chọn học sinh --</option>
                  {students.map((student) => (
                    <option key={student.studentId} value={student.studentId}>
                      {student.fullName || "Không có tên"} (ID: {student.studentId})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Ngày tư vấn <span className="required">*</span></label>
                <input
                  type="date"
                  name="consultationDate"
                  value={formData.consultationDate}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Giờ tư vấn <span className="required">*</span></label>
                <input
                  type="time"
                  name="consultationTime"
                  value={formData.consultationTime}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Địa điểm <span className="required">*</span></label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="Nhập địa điểm tư vấn"
                />
              </div>
              <div className="form-group">
                <label>Y tá phụ trách</label>
                <select
                  name="nurseId"
                  value={formData.nurseId}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">-- Chọn y tá --</option>
                  {nurses.map((nurse) => (
                    <option key={nurse.nurseId} value={nurse.nurseId}>
                      {nurse.fullName || "Không có tên"} (ID: {nurse.nurseId})
                    </option>
                  ))}
                </select>
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

      {/* Modal xem chi tiết lịch tư vấn */}
      {showViewModal && selectedSchedule && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: "700px" }}>
            <div className="modal-header">
              <h3>Chi tiết lịch tư vấn</h3>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <strong>ID lịch tư vấn:</strong> {selectedSchedule.consultationScheduleId}
                </div>
                <div className="info-item">
                  <strong>Học sinh:</strong> {selectedSchedule.studentName || getStudentNameById(selectedSchedule.studentId) || "Không có"} 
                  <span style={{ fontSize: "0.9em", color: "#666", marginLeft: "5px" }}>(ID: {selectedSchedule.studentId || "N/A"})</span>
                </div>
                <div className="info-item">
                  <strong>Y tá phụ trách:</strong> {selectedSchedule.nurseName || getNurseNameById(selectedSchedule.nurseId) || "Chưa phân công"} 
                  <span style={{ fontSize: "0.9em", color: "#666", marginLeft: "5px" }}>(ID: {selectedSchedule.nurseId || "N/A"})</span>
                </div>
                <div className="info-item">
                  <strong>Ngày tư vấn:</strong> {selectedSchedule.consultDate ? new Date(selectedSchedule.consultDate).toLocaleDateString('vi-VN') : "Không có"}
                </div>
                <div className="info-item">
                  <strong>Giờ tư vấn:</strong> {selectedSchedule.consultTime || (selectedSchedule.consultDate ? new Date(selectedSchedule.consultDate).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'}) : "Không có")}
                </div>
                <div className="info-item">
                  <strong>Địa điểm:</strong> {selectedSchedule.location || "Không có"}
                </div>
              </div>
            </div>
                          <div className="modal-footer">
              <button 
                className="admin-btn" 
                style={{ backgroundColor: "#007bff" }}
                onClick={() => fetchConsultationForm(selectedSchedule.consultationScheduleId)}
              >
                Xem form tư vấn
              </button>
              <button className="admin-btn" onClick={() => setShowViewModal(false)}>
                Đóng
              </button>
              <button className="admin-btn" onClick={() => {
                setShowViewModal(false);
                handleEdit(selectedSchedule);
              }}>
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal hiển thị form tư vấn */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: "700px" }}>
            <div className="modal-header">
              <h3>Chi tiết form tư vấn</h3>
              <button className="close-btn" onClick={() => setShowFormModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                  <p className="mt-3">Đang tải thông tin form tư vấn...</p>
                </div>
              ) : consultationForm ? (
                <div className="info-grid">
                  <div className="info-item" key="form-id">
                    <strong>Form ID:</strong> {consultationForm.consultationFormId}
                  </div>
                  <div className="info-item" key="schedule-id">
                    <strong>Schedule ID:</strong> {consultationForm.consultationScheduleId}
                  </div>
                  <div className="info-item" key="parent-id">
                    <strong>Phụ huynh:</strong> {consultationForm.parentName || "Chưa có thông tin"} 
                    <span style={{ fontSize: "0.9em", color: "#666", marginLeft: "5px" }}>(ID: {consultationForm.parentId || "N/A"})</span>
                  </div>
                  <div className="info-item" key="student-id">
                    <strong>Học sinh:</strong> {consultationForm.studentName || "Chưa có thông tin"} 
                    <span style={{ fontSize: "0.9em", color: "#666", marginLeft: "5px" }}>(ID: {consultationForm.studentId || "N/A"})</span>
                  </div>
                  <div className="info-item" key="nurse-id">
                    <strong>Y tá phụ trách:</strong> {consultationForm.nurseName || "Chưa phân công"} 
                    <span style={{ fontSize: "0.9em", color: "#666", marginLeft: "5px" }}>(ID: {consultationForm.nurseId || "N/A"})</span>
                  </div>
                  <div className="info-item" key="title">
                    <strong>Tiêu đề:</strong> {consultationForm.title || "Không có tiêu đề"}
                  </div>
                  <div className="info-item" key="status" style={{ gridColumn: "1 / span 2" }}>
                    <strong>Trạng thái:</strong> {
                      consultationForm.status === 0 || consultationForm.status === "Pending" ? "Đang chờ" :
                      consultationForm.status === 1 || consultationForm.status === "Accepted" ? "Đã chấp nhận" :
                      consultationForm.status === 2 || consultationForm.status === "Rejected" ? "Đã từ chối" : 
                      consultationForm.status || "Không xác định"
                    }
                  </div>
                  <div className="info-item" key="content" style={{ gridColumn: "1 / span 2" }}>
                    <strong>Nội dung:</strong>
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
                  
                  {/* Debug info - Chỉ hiển thị trong môi trường development */}
                  {process.env.NODE_ENV === 'development' && false && (
                    <div className="info-item" key="debug" style={{ gridColumn: "1 / span 2", fontSize: "12px", color: "#666", marginTop: "20px", borderTop: "1px dashed #ccc", paddingTop: "10px" }}>
                      <details>
                        <summary>Thông tin debug</summary>
                        <pre style={{ whiteSpace: "pre-wrap", fontSize: "11px" }}>
                          {JSON.stringify(consultationForm, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-5">
                  <p>Không tìm thấy thông tin form tư vấn.</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="admin-btn" onClick={() => setShowFormModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa lịch tư vấn */}
      {showEditModal && selectedSchedule && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Chỉnh sửa lịch tư vấn</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateSchedule}>
              <div className="form-group">
                <label>Học sinh <span className="required">*</span></label>
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                >
                  <option value="">-- Chọn học sinh --</option>
                  {students.map((student) => (
                    <option key={student.studentId} value={student.studentId}>
                      {student.fullName || "Không có tên"} (ID: {student.studentId})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Ngày tư vấn <span className="required">*</span></label>
                <input
                  type="date"
                  name="consultationDate"
                  value={formData.consultationDate}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Giờ tư vấn <span className="required">*</span></label>
                <input
                  type="time"
                  name="consultationTime"
                  value={formData.consultationTime}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Địa điểm <span className="required">*</span></label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="Nhập địa điểm tư vấn"
                />
              </div>
              <div className="form-group">
                <label>Y tá phụ trách</label>
                <select
                  name="nurseId"
                  value={formData.nurseId}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">-- Chọn y tá --</option>
                  {nurses.map((nurse) => (
                    <option key={nurse.nurseId} value={nurse.nurseId}>
                      {nurse.fullName || "Không có tên"} (ID: {nurse.nurseId})
                    </option>
                  ))}
                </select>
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

export default ConsultSchedules;