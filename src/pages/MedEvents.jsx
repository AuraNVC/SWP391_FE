import React, { useState, useEffect, useContext } from "react";
import { FaSearch, FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import TableWithPaging from "../components/TableWithPaging";
import "../styles/Dashboard.css";
import "../styles/StudentDashboard.css";

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
    nurseId: localStorage.getItem("userId") || "",
    symptoms: "",
    actionTaken: "",
    note: ""
  });
  const [showConfirmAdd, setShowConfirmAdd] = useState(false);
  const [showConfirmUpdate, setShowConfirmUpdate] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { setNotif } = useNotification();

  // Style cho các biểu tượng
  const iconStyle = {
    view: { color: "#007bff" },
    edit: { color: "#28a745" },
    delete: { color: "#dc3545" }
  };

  const columns = [
    { title: "ID", dataIndex: "medicalEventId" },
    { title: "Ngày", dataIndex: "eventDate", render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : "N/A" },
    { title: "Học sinh", dataIndex: "studentId", render: (id, record) => record.studentName || getStudentName(id) || "Không xác định" },
    { title: "Y tá", dataIndex: "nurseId", render: (id, record) => record.nurseName || getNurseName(id) || "Không xác định" },
    { title: "Triệu chứng", dataIndex: "symptoms" },
    { title: "Xử lý", dataIndex: "actionTaken" }
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

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // Clear existing data first
        setEvents([]);
        // Đảm bảo đã tải xong danh sách học sinh và y tá trước
        await Promise.all([fetchStudents(), fetchNurses()]);
        // Sau khi có danh sách học sinh và y tá, mới tải sự kiện y tế
        await fetchMedicalEvents();
      } catch (error) {
        console.error("Error initializing data:", error);
        setNotif({
          message: "Không thể tải dữ liệu ban đầu",
          type: "error",
          autoDismiss: true,
          duration: 5000 // 5 seconds
        });
      } finally {
        setLoading(false);
      }
    };
    
    initData();
    
    // Add cleanup function to prevent memory leaks and data duplication
    return () => {
      setEvents([]);
    };
  }, []);

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
      
      // Sắp xếp sự kiện theo ID tăng dần (từ nhỏ đến lớn)
      const sortedEvents = [...processedEvents].sort((a, b) => {
        const idA = a.medicalEventId || 0;
        const idB = b.medicalEventId || 0;
        return idA - idB; // Sắp xếp tăng dần
      });
      
      console.log("Processed and sorted events:", sortedEvents);
      setEvents(sortedEvents);
      setNotif({
        message: "Dữ liệu đã được làm mới",
        type: "success",
        autoDismiss: true,
        duration: 3000 // 3 seconds
      });
    } catch (error) {
      console.error("Error fetching medical events:", error);
      setNotif({
        message: "Lỗi khi tìm kiếm: " + (error.message || "Không xác định"),
        type: "error",
        autoDismiss: true,
        duration: 5000 // 5 seconds
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
      // Đặt lại trang về 1 khi tìm kiếm
      setPage(1);
      // Clear existing events before fetching new ones
      setEvents([]);
      await fetchMedicalEvents(searchKeyword);
    } catch (error) {
      console.error("Error during search:", error);
      setNotif({
        message: "Lỗi khi tìm kiếm: " + (error.message || "Không xác định"),
        type: "error",
        autoDismiss: true,
        duration: 5000 // 5 seconds
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setShowConfirmAdd(true);
  };

  const confirmAddEvent = async () => {
    setShowConfirmAdd(false);
    setLoading(true);
    try {
      // Validate form data
      if (!formData.title || !formData.eventDate || !formData.studentId) {
        setNotif({
          message: "Vui lòng điền đầy đủ thông tin bắt buộc",
          type: "error",
          autoDismiss: true,
          duration: 5000 // 5 seconds
        });
        setLoading(false);
        return;
      }

      // Chuẩn bị dữ liệu để gửi lên API
      const eventData = {
        ...formData,
        eventName: formData.title
      };

      await API_SERVICE.medicalEventAPI.create(eventData);
      setNotif({
        message: "Thêm sự kiện y tế thành công!",
        type: "success",
        autoDismiss: true,
        duration: 3000 // 3 seconds
      });
      setShowAddModal(false);
      // Reset form data
      setFormData({
        title: "",
        eventDate: new Date().toISOString().split('T')[0] + "T" + new Date().toTimeString().split(' ')[0],
        studentId: "",
        nurseId: localStorage.getItem("userId") || "",
        symptoms: "",
        actionTaken: "",
        note: ""
      });
      fetchMedicalEvents();
    } catch (error) {
      console.error("Error adding medical event:", error);
      setNotif({
        message: "Không thể thêm sự kiện y tế. Vui lòng thử lại.",
        type: "error",
        autoDismiss: true,
        duration: 5000 // 5 seconds
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setShowConfirmUpdate(true);
  };

  const confirmUpdateEvent = async () => {
    setShowConfirmUpdate(false);
    setLoading(true);
    try {
      // Validate form data
      if (!formData.title || !formData.eventDate || !formData.studentId) {
        setNotif({
          message: "Vui lòng điền đầy đủ thông tin bắt buộc",
          type: "error",
          autoDismiss: true,
          duration: 5000 // 5 seconds
        });
        setLoading(false);
        return;
      }

      // Lấy ID của sự kiện cần cập nhật
      const eventId = selectedEvent.medicalEventId || selectedEvent.eventId;
      
      try {
        // Tạo dữ liệu cho sự kiện
        const eventData = {
          eventId: eventId,
          nurseId: formData.nurseId ? parseInt(formData.nurseId) : null,
          eventDate: formData.eventDate,
          symptoms: formData.symptoms || "",
          actionTaken: formData.actionTaken || "",
          note: formData.note || ""
        };
        
        console.log("Cập nhật sự kiện với dữ liệu:", eventData);
        
        // Gọi API update
        await API_SERVICE.medicalEventAPI.update(eventData);
        
        // Nếu API thành công, cập nhật UI
        setNotif({
          message: "Cập nhật sự kiện y tế thành công!",
          type: "success",
          autoDismiss: true,
          duration: 3000 // 3 seconds
        });
        
        setShowEditModal(false);
        
        // Tải lại dữ liệu từ server
        await fetchMedicalEvents(searchKeyword);
      } catch (apiError) {
        console.error("API error details:", apiError);
        throw apiError;
      }
    } catch (error) {
      console.error("Error updating medical event:", error);
      setNotif({
        message: "Không thể cập nhật sự kiện y tế. Vui lòng thử lại.",
        type: "error",
        autoDismiss: true,
        duration: 5000 // 5 seconds
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
        type: "success",
        autoDismiss: true,
        duration: 3000 // 3 seconds
      });
      
      // Tải lại dữ liệu từ server
      fetchMedicalEvents(searchKeyword);
    } catch (error) {
      console.error("Error deleting medical event:", error);
      setNotif({
        message: "Không thể xóa sự kiện y tế. Vui lòng thử lại.",
        type: "error",
        autoDismiss: true,
        duration: 5000 // 5 seconds
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
    setFormData({
      medicalEventId: event.medicalEventId || event.eventId,
      title: event.title || event.eventName || "",
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] + "T" + new Date(event.eventDate).toTimeString().split(' ')[0] : "",
      studentId: event.studentId || "",
      nurseId: event.nurseId || localStorage.getItem("userId") || "",
      symptoms: event.symptoms || "",
      actionTaken: event.actionTaken || "",
      note: event.note || ""
    });
    setShowEditModal(true);
  };

  // Update the handlePageChange function to be simpler and more reliable
  const handlePageChange = (newPage) => {
    console.log("MedEvents: Changing to page:", newPage, "Current page:", page);
    // Simply update the page state
    setPage(newPage);
  };

  // Add a useEffect to log when the page changes
  useEffect(() => {
    console.log("Page state changed to:", page);
  }, [page]);

  return (
    <div className="admin-main">
      <h2 className="dashboard-title">Quản lý sự kiện y tế</h2>
      <div className="admin-header">
        <button className="admin-btn" onClick={() => setShowAddModal(true)}>
          + Thêm sự kiện y tế
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
            data={events}
            pageSize={10}
            page={page}
            onPageChange={handlePageChange}
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

      {/* View Event Modal */}
      {showViewModal && selectedEvent && (
        <div className="student-dialog-overlay">
          <div className="student-dialog-content" style={{ width: '700px', maxWidth: '90%' }}>
            <div className="student-dialog-header" style={{ borderBottom: '1px solid #e0e0e0', backgroundColor: 'white' }}>
              <h2>Chi tiết sự kiện y tế</h2>
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
                }}>Thông tin sự kiện</h3>
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
                <h3 style={{ 
                  borderBottom: '2px solid #007bff',
                  paddingBottom: '8px',
                  margin: '0 0 16px 0',
                  color: '#333',
                  fontSize: '1.1rem'
                }}>Chi tiết y tế</h3>
                <div className="info-grid">
                  <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                    <label>Triệu chứng:</label>
                    <span>{selectedEvent.symptoms}</span>
                  </div>
                  <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                    <label>Xử lý:</label>
                    <span>{selectedEvent.actionTaken}</span>
                  </div>
                  <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                    <label>Ghi chú:</label>
                    <span>{selectedEvent.note || "Không có"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="student-dialog-footer" style={{ backgroundColor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
              <button className="admin-btn" onClick={() => {
                setShowViewModal(false);
                handleEdit(selectedEvent);
              }}>Chỉnh sửa</button>
              <button className="admin-btn" style={{ background: '#6c757d' }} onClick={() => setShowViewModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && selectedEvent && (
        <div className="student-dialog-overlay">
          <div className="student-dialog-content" style={{ width: '700px', maxWidth: '90%' }}>
            <div className="student-dialog-header" style={{ borderBottom: '1px solid #e0e0e0', backgroundColor: 'white' }}>
              <h2>Chỉnh sửa sự kiện y tế</h2>
              <button className="student-dialog-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="student-dialog-body">
              <form onSubmit={handleUpdateEvent}>
                <input type="hidden" name="medicalEventId" value={formData.medicalEventId} />
                <div className="student-info-section">
                  <h3 style={{ 
                    borderBottom: '2px solid #007bff',
                    paddingBottom: '8px',
                    margin: '0 0 16px 0',
                    color: '#333',
                    fontSize: '1.1rem'
                  }}>Thông tin sự kiện</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label htmlFor="edit-title">Tiêu đề <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        id="edit-title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        style={{ 
                          border: '1px solid #e9ecef', 
                          padding: '8px 12px', 
                          borderRadius: '4px',
                          backgroundColor: '#f8f9fa' 
                        }}
                      />
                    </div>
                    <div className="info-item">
                      <label htmlFor="edit-eventDate">Ngày sự kiện <span className="text-danger">*</span></label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        id="edit-eventDate"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleInputChange}
                        required
                        style={{ 
                          border: '1px solid #e9ecef', 
                          padding: '8px 12px', 
                          borderRadius: '4px',
                          backgroundColor: '#f8f9fa' 
                        }}
                      />
                    </div>
                    <div className="info-item">
                      <label htmlFor="edit-studentId">Học sinh <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        id="edit-studentId"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleInputChange}
                        required
                        style={{ 
                          border: '1px solid #e9ecef', 
                          padding: '8px 12px', 
                          borderRadius: '4px',
                          backgroundColor: '#f8f9fa' 
                        }}
                      >
                        <option value="">Chọn học sinh</option>
                        {students.map(student => (
                          <option key={student.studentId} value={student.studentId}>
                            {student.fullName} (ID: {student.studentId})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="info-item">
                      <label htmlFor="edit-nurseId">Y tá <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        id="edit-nurseId"
                        name="nurseId"
                        value={formData.nurseId}
                        onChange={handleInputChange}
                        required
                        style={{ 
                          border: '1px solid #e9ecef', 
                          padding: '8px 12px', 
                          borderRadius: '4px',
                          backgroundColor: '#f8f9fa' 
                        }}
                      >
                        <option value="">Chọn y tá</option>
                        {nurses.map(nurse => (
                          <option key={nurse.nurseId} value={nurse.nurseId}>
                            {nurse.fullName} (ID: {nurse.nurseId})
                          </option>
                        ))}
                      </select>
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
                  }}>Chi tiết y tế</h3>
                  <div className="info-grid">
                    <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                      <label htmlFor="edit-symptoms">Triệu chứng <span className="text-danger">*</span></label>
                      <textarea
                        className="form-control"
                        id="edit-symptoms"
                        name="symptoms"
                        value={formData.symptoms}
                        onChange={handleInputChange}
                        rows={3}
                        required
                        style={{ 
                          border: '1px solid #e9ecef', 
                          padding: '8px 12px', 
                          borderRadius: '4px',
                          backgroundColor: '#f8f9fa' 
                        }}
                      ></textarea>
                    </div>
                    <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                      <label htmlFor="edit-actionTaken">Xử lý <span className="text-danger">*</span></label>
                      <textarea
                        className="form-control"
                        id="edit-actionTaken"
                        name="actionTaken"
                        value={formData.actionTaken}
                        onChange={handleInputChange}
                        rows={3}
                        required
                        style={{ 
                          border: '1px solid #e9ecef', 
                          padding: '8px 12px', 
                          borderRadius: '4px',
                          backgroundColor: '#f8f9fa' 
                        }}
                      ></textarea>
                    </div>
                    <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                      <label htmlFor="edit-note">Ghi chú</label>
                      <textarea
                        className="form-control"
                        id="edit-note"
                        name="note"
                        value={formData.note}
                        onChange={handleInputChange}
                        rows={2}
                        style={{ 
                          border: '1px solid #e9ecef', 
                          padding: '8px 12px', 
                          borderRadius: '4px',
                          backgroundColor: '#f8f9fa' 
                        }}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="student-dialog-footer" style={{ backgroundColor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
                  <button type="submit" className="admin-btn">Lưu</button>
                  <button type="button" className="admin-btn" style={{ background: '#6c757d' }} onClick={() => setShowEditModal(false)}>Hủy</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="student-dialog-overlay">
          <div className="student-dialog-content" style={{ width: '700px', maxWidth: '90%' }}>
            <div className="student-dialog-header" style={{ borderBottom: '1px solid #e0e0e0', backgroundColor: 'white' }}>
              <h2>Thêm sự kiện y tế mới</h2>
              <button className="student-dialog-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="student-dialog-body">
              <form onSubmit={handleAddEvent}>
                <div className="student-info-section">
                  <h3 style={{ 
                    borderBottom: '2px solid #007bff',
                    paddingBottom: '8px',
                    margin: '0 0 16px 0',
                    color: '#333',
                    fontSize: '1.1rem'
                  }}>Thông tin sự kiện</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label htmlFor="title">Tiêu đề <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        style={{ 
                          border: '1px solid #e9ecef', 
                          padding: '8px 12px', 
                          borderRadius: '4px',
                          backgroundColor: '#f8f9fa' 
                        }}
                      />
                    </div>
                    <div className="info-item">
                      <label htmlFor="eventDate">Ngày sự kiện <span className="text-danger">*</span></label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        id="eventDate"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleInputChange}
                        required
                        style={{ 
                          border: '1px solid #e9ecef', 
                          padding: '8px 12px', 
                          borderRadius: '4px',
                          backgroundColor: '#f8f9fa' 
                        }}
                      />
                    </div>
                    <div className="info-item">
                      <label htmlFor="studentId">Học sinh <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        id="studentId"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleInputChange}
                        required
                        style={{ 
                          border: '1px solid #e9ecef', 
                          padding: '8px 12px', 
                          borderRadius: '4px',
                          backgroundColor: '#f8f9fa' 
                        }}
                      >
                        <option value="">Chọn học sinh</option>
                        {students.map(student => (
                          <option key={student.studentId} value={student.studentId}>
                            {student.fullName} (ID: {student.studentId})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="info-item">
                      <label htmlFor="nurseId">Y tá <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        id="nurseId"
                        name="nurseId"
                        value={formData.nurseId}
                        onChange={handleInputChange}
                        required
                        style={{ 
                          border: '1px solid #e9ecef', 
                          padding: '8px 12px', 
                          borderRadius: '4px',
                          backgroundColor: '#f8f9fa' 
                        }}
                      >
                        <option value="">Chọn y tá</option>
                        {nurses.map(nurse => (
                          <option key={nurse.nurseId} value={nurse.nurseId}>
                            {nurse.fullName} (ID: {nurse.nurseId})
                          </option>
                        ))}
                      </select>
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
                  }}>Chi tiết y tế</h3>
                  <div className="info-grid">
                    <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                      <label htmlFor="symptoms">Triệu chứng <span className="text-danger">*</span></label>
                      <textarea
                        className="form-control"
                        id="symptoms"
                        name="symptoms"
                        value={formData.symptoms}
                        onChange={handleInputChange}
                        rows={3}
                        required
                        style={{ 
                          border: '1px solid #e9ecef', 
                          padding: '8px 12px', 
                          borderRadius: '4px',
                          backgroundColor: '#f8f9fa' 
                        }}
                      ></textarea>
                    </div>
                    <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                      <label htmlFor="actionTaken">Xử lý <span className="text-danger">*</span></label>
                      <textarea
                        className="form-control"
                        id="actionTaken"
                        name="actionTaken"
                        value={formData.actionTaken}
                        onChange={handleInputChange}
                        rows={3}
                        required
                        style={{ 
                          border: '1px solid #e9ecef', 
                          padding: '8px 12px', 
                          borderRadius: '4px',
                          backgroundColor: '#f8f9fa' 
                        }}
                      ></textarea>
                    </div>
                    <div className="info-item" style={{ gridColumn: "1 / span 2" }}>
                      <label htmlFor="note">Ghi chú</label>
                      <textarea
                        className="form-control"
                        id="note"
                        name="note"
                        value={formData.note}
                        onChange={handleInputChange}
                        rows={2}
                        style={{ 
                          border: '1px solid #e9ecef', 
                          padding: '8px 12px', 
                          borderRadius: '4px',
                          backgroundColor: '#f8f9fa' 
                        }}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="student-dialog-footer" style={{ backgroundColor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
                  <button type="submit" className="admin-btn">Lưu</button>
                  <button type="button" className="admin-btn" style={{ background: '#6c757d' }} onClick={() => setShowAddModal(false)}>Hủy</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmDelete && (
        <div className="student-dialog-overlay">
          <div className="student-dialog-content" style={{ width: '400px', maxWidth: '90%', textAlign: 'center' }}>
            <div className="student-dialog-header" style={{ borderBottom: '1px solid #e0e0e0', backgroundColor: 'white' }}>
              <h2>Xác nhận xóa</h2>
              <button className="student-dialog-close" onClick={() => setShowConfirmDelete(false)}>×</button>
            </div>
            <div className="student-dialog-body">
              <p>Bạn có chắc chắn muốn xóa sự kiện y tế này không?</p>
            </div>
            <div className="student-dialog-footer" style={{ backgroundColor: '#f8f9fa', borderTop: '1px solid #e0e0e0', justifyContent: 'center' }}>
              <button className="admin-btn" style={{ background: '#dc3545' }} onClick={confirmDeleteEvent}>Xóa</button>
              <button className="admin-btn" style={{ background: '#6c757d' }} onClick={() => setShowConfirmDelete(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Add Modal */}
      {showConfirmAdd && (
        <div className="student-dialog-overlay">
          <div className="student-dialog-content" style={{ width: '400px', maxWidth: '90%', textAlign: 'center' }}>
            <div className="student-dialog-header" style={{ borderBottom: '1px solid #e0e0e0', backgroundColor: 'white' }}>
              <h2>Xác nhận thêm mới</h2>
              <button className="student-dialog-close" onClick={() => setShowConfirmAdd(false)}>×</button>
            </div>
            <div className="student-dialog-body">
              <p>Bạn có chắc chắn muốn thêm sự kiện y tế này không?</p>
            </div>
            <div className="student-dialog-footer" style={{ backgroundColor: '#f8f9fa', borderTop: '1px solid #e0e0e0', justifyContent: 'center' }}>
              <button className="admin-btn" onClick={confirmAddEvent}>Thêm mới</button>
              <button className="admin-btn" style={{ background: '#6c757d' }} onClick={() => setShowConfirmAdd(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Update Modal */}
      {showConfirmUpdate && (
        <div className="student-dialog-overlay">
          <div className="student-dialog-content" style={{ width: '400px', maxWidth: '90%', textAlign: 'center' }}>
            <div className="student-dialog-header" style={{ borderBottom: '1px solid #e0e0e0', backgroundColor: 'white' }}>
              <h2>Xác nhận cập nhật</h2>
              <button className="student-dialog-close" onClick={() => setShowConfirmUpdate(false)}>×</button>
            </div>
            <div className="student-dialog-body">
              <p>Bạn có chắc chắn muốn cập nhật sự kiện y tế này không?</p>
            </div>
            <div className="student-dialog-footer" style={{ backgroundColor: '#f8f9fa', borderTop: '1px solid #e0e0e0', justifyContent: 'center' }}>
              <button className="admin-btn" onClick={confirmUpdateEvent}>Cập nhật</button>
              <button className="admin-btn" style={{ background: '#6c757d' }} onClick={() => setShowConfirmUpdate(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedEvents;