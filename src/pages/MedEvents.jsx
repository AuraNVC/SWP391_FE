import React, { useState, useEffect, useContext } from "react";
import { FaSearch, FaPlus, FaEye, FaEdit, FaTrash, FaSync } from "react-icons/fa";
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
    nurseId: localStorage.getItem("userId") || "",
    symptoms: "",
    actionTaken: "",
    note: ""
  });

  const { setNotif } = useNotification();

  // Style cho các biểu tượng
  const iconStyle = {
    view: { color: "#3498db" },
    edit: { color: "#f39c12" },
    delete: { color: "#e74c3c" }
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
        console.log("Xử lý sự kiện:", event);
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
        
        // Log chi tiết về trường note để debug
        console.log(`Event ID ${event.medicalEventId || event.eventId}, Note: "${event.note}"`);
        
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
      
      console.log("Processed events:", processedEvents);
      
      setEvents(processedEvents);
    } catch (error) {
      console.error("Error fetching medical events:", error);
      setNotif({
        message: "Không thể tải danh sách sự kiện y tế",
        type: "error"
      });
      
      // Tạo dữ liệu mẫu khi có lỗi
      const dummyEvents = [
        { medicalEventId: 1, title: "Sự kiện 1", eventDate: "2024-03-01T09:30:00.000", studentId: 1, studentName: "Học sinh 1", symptoms: "Sốt, ho", actionTaken: "Cho uống hạ sốt, theo dõi" },
        { medicalEventId: 2, title: "Sự kiện 2", eventDate: "2024-03-02T10:00:00.000", studentId: 2, studentName: "Học sinh 2", symptoms: "Đau bụng", actionTaken: "Nghỉ ngơi tại phòng y tế" },
        { medicalEventId: 3, title: "Sự kiện 3", eventDate: "2024-03-03T11:15:00.000", studentId: 3, studentName: "Học sinh 3", symptoms: "Chóng mặt", actionTaken: "Cho uống nước đường" },
        { medicalEventId: 4, title: "Sự kiện 4", eventDate: "2024-03-04T14:00:00.000", studentId: 4, studentName: "Học sinh 4", symptoms: "Ngã trầy xước", actionTaken: "Sát trùng, băng bó" },
        { medicalEventId: 5, title: "Sự kiện 5", eventDate: "2024-03-05T08:45:00.000", studentId: 5, studentName: "Học sinh 5", symptoms: "Đau họng", actionTaken: "Cho uống thuốc ho" }
      ];
      console.log("Using dummy events data due to error");
      setEvents(dummyEvents);
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

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate form data
      if (!formData.title || !formData.eventDate || !formData.studentId) {
        setNotif({
          message: "Vui lòng điền đầy đủ thông tin bắt buộc",
          type: "error"
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
        message: "Thêm sự kiện y tế thành công",
        type: "success"
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
        message: "Không thể thêm sự kiện y tế",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate form data
      if (!formData.title || !formData.eventDate || !formData.studentId) {
        setNotif({
          message: "Vui lòng điền đầy đủ thông tin bắt buộc",
          type: "error"
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
        await API_SERVICE.medicalEventAPI.update(eventId, eventData);
        
        // Nếu API thành công, cập nhật UI
      setNotif({
        message: "Cập nhật sự kiện y tế thành công",
        type: "success"
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
        message: "Không thể cập nhật sự kiện y tế: " + (error.message || "Lỗi không xác định"),
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sự kiện này không?")) {
      setLoading(true);
      try {
        console.log("Xóa sự kiện ID:", id);
        console.log("API endpoint:", `medicalEvent/${id}`);
        
        // Gọi API xóa
        const response = await API_SERVICE.medicalEventAPI.delete(id);
        console.log("API response:", response);
        
        // Nếu API thành công, cập nhật UI
        setNotif({
          message: "Xóa sự kiện y tế thành công",
          type: "success"
        });
        
        // Tải lại dữ liệu từ server
        fetchMedicalEvents(searchKeyword);
      } catch (error) {
        console.error("Error deleting medical event:", error);
        setNotif({
          message: "Không thể xóa sự kiện y tế: " + (error.message || "Lỗi không xác định"),
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleView = (event) => {
    setSelectedEvent(event);
    console.log("Chi tiết sự kiện được chọn:", event);
    setShowViewModal(true);
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    
    // Xử lý ngày giờ
    let eventDateTime = event.eventDate || "";
    if (eventDateTime) {
      const date = new Date(eventDateTime);
      if (!isNaN(date.getTime())) {
        eventDateTime = date.toISOString().slice(0, 16); // Format: "YYYY-MM-DDTHH:MM"
      }
    }
    
    setFormData({
      title: event.title || event.eventName || "",
      eventDate: eventDateTime,
      studentId: event.studentId || "",
      nurseId: event.nurseId || localStorage.getItem("userId") || "",
      symptoms: event.symptoms || "",
      actionTaken: event.actionTaken || "",
      note: event.note || ""
    });
    setShowEditModal(true);
  };

  const handleRefresh = async () => {
    setSearchKeyword("");
    setPage(1);
    setLoading(true);
    try {
      await Promise.all([fetchStudents(), fetchNurses()]);
      await fetchMedicalEvents("");
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

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h2>Quản lý sự kiện y tế</h2>
        <div className="admin-header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện..."
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
            <FaPlus /> Thêm sự kiện y tế
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="loading-spinner">Đang tải...</div>
        ) : (
          <TableWithPaging
            columns={columns}
            data={events}
            page={page}
            pageSize={10}
            onPageChange={setPage}
            actionColumnTitle="Thao tác"
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
                  onClick={() => handleDeleteEvent(row.medicalEventId || row.eventId)}
                >
                  <FaTrash style={iconStyle.delete} size={18} />
                </button>
              </div>
            )}
          />
        )}
      </div>

      {/* Modal thêm sự kiện y tế */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Thêm sự kiện y tế</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddEvent}>
              <div className="form-group">
                <label>Tiêu đề <span className="required">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="Nhập tiêu đề sự kiện"
                />
              </div>
              <div className="form-group">
                <label>Ngày giờ <span className="required">*</span></label>
                <input
                  type="datetime-local"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
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
                      {student.fullName} - ID: {student.studentId}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Y tá</label>
                <select
                  name="nurseId"
                  value={formData.nurseId}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">-- Chọn y tá --</option>
                  {nurses.map((nurse) => (
                    <option key={nurse.nurseId} value={nurse.nurseId}>
                      {nurse.fullName} - ID: {nurse.nurseId}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Triệu chứng</label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Nhập triệu chứng"
                  rows="2"
                ></textarea>
              </div>
              <div className="form-group">
                <label>Xử lý</label>
                <textarea
                  name="actionTaken"
                  value={formData.actionTaken}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Nhập cách xử lý"
                  rows="2"
                ></textarea>
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Nhập ghi chú"
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
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết sự kiện y tế */}
      {showViewModal && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Chi tiết sự kiện y tế</h3>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <strong>ID:</strong> {selectedEvent.medicalEventId || selectedEvent.eventId || "N/A"}
                </div>
                <div className="info-item">
                  <strong>Tiêu đề:</strong> {selectedEvent.title || selectedEvent.eventName || "Không có tiêu đề"}
                </div>
                <div className="info-item">
                  <strong>Ngày:</strong> {selectedEvent.eventDate ? new Date(selectedEvent.eventDate).toLocaleDateString('vi-VN') : "N/A"}
                </div>
                <div className="info-item">
                  <strong>Giờ:</strong> {selectedEvent.eventDate ? new Date(selectedEvent.eventDate).toLocaleTimeString('vi-VN') : "N/A"}
                </div>
                <div className="info-item">
                  <strong>Học sinh:</strong> {selectedEvent.studentName || getStudentName(selectedEvent.studentId) || "Không xác định"} (ID: {selectedEvent.studentId || "N/A"})
                </div>
                <div className="info-item">
                  <strong>Y tá:</strong> {selectedEvent.nurseName || getNurseName(selectedEvent.nurseId) || "Không xác định"} (ID: {selectedEvent.nurseId || "N/A"})
                </div>
                <div className="info-item full-width">
                  <strong>Triệu chứng:</strong> {selectedEvent.symptoms || "Không có"}
                </div>
                <div className="info-item full-width">
                  <strong>Xử lý:</strong> {selectedEvent.actionTaken || "Không có"}
                </div>
                <div className="info-item full-width">
                  <strong>Ghi chú:</strong> {selectedEvent.note || "Không có"}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="admin-btn" onClick={() => setShowViewModal(false)}>
                Đóng
              </button>
              <button className="admin-btn" onClick={() => {
                setShowViewModal(false);
                handleEdit(selectedEvent);
              }}>
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa sự kiện y tế */}
      {showEditModal && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Chỉnh sửa sự kiện y tế</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateEvent}>
              <div className="form-group">
                <label>Tiêu đề <span className="required">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="Nhập tiêu đề sự kiện"
                />
              </div>
              <div className="form-group">
                <label>Ngày giờ <span className="required">*</span></label>
                <input
                  type="datetime-local"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
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
                      {student.fullName} - ID: {student.studentId}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Y tá</label>
                <select
                  name="nurseId"
                  value={formData.nurseId}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">-- Chọn y tá --</option>
                  {nurses.map((nurse) => (
                    <option key={nurse.nurseId} value={nurse.nurseId}>
                      {nurse.fullName} - ID: {nurse.nurseId}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Triệu chứng</label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Nhập triệu chứng"
                  rows="2"
                ></textarea>
              </div>
              <div className="form-group">
                <label>Xử lý</label>
                <textarea
                  name="actionTaken"
                  value={formData.actionTaken}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Nhập cách xử lý"
                  rows="2"
                ></textarea>
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Nhập ghi chú"
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

export default MedEvents;