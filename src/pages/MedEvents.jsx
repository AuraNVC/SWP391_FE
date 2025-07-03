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
        message: "Thêm sự kiện y tế thành công!",
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
        message: "Không thể thêm sự kiện y tế. Vui lòng thử lại.",
        type: "error"
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
        await API_SERVICE.medicalEventAPI.update(eventData);
        
        // Nếu API thành công, cập nhật UI
        setNotif({
          message: "Cập nhật sự kiện y tế thành công!",
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
        message: "Không thể cập nhật sự kiện y tế. Vui lòng thử lại.",
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
                <select
                  className="form-select"
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn học sinh</option>
                  {students.map(student => (
                    <option key={student.studentId} value={student.studentId}>
                      {student.fullName} (ID: {student.studentId})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="nurseId" className="form-label">Y tá <span className="text-danger">*</span></label>
                <select
                  className="form-select"
                  id="nurseId"
                  name="nurseId"
                  value={formData.nurseId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn y tá</option>
                  {nurses.map(nurse => (
                    <option key={nurse.nurseId} value={nurse.nurseId}>
                      {nurse.fullName} (ID: {nurse.nurseId})
                    </option>
                  ))}
                </select>
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
                <label htmlFor="actionTaken" className="form-label">Xử lý <span className="text-danger">*</span></label>
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
                <label htmlFor="note" className="form-label">Ghi chú</label>
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
        <div className="student-create-modal-overlay">
          <div className="student-create-modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Chi tiết sự kiện y tế</h3>
              <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
            </div>
            <div className="modal-body">
              <div className="view-event-details">
                <p><strong>ID:</strong> {selectedEvent.medicalEventId || selectedEvent.eventId}</p>
                <p><strong>Tiêu đề:</strong> {selectedEvent.title || selectedEvent.eventName}</p>
                <p><strong>Ngày sự kiện:</strong> {new Date(selectedEvent.eventDate).toLocaleString('vi-VN')}</p>
                <p><strong>Học sinh:</strong> {selectedEvent.studentName || getStudentName(selectedEvent.studentId)} (ID: {selectedEvent.studentId})</p>
                <p><strong>Y tá:</strong> {selectedEvent.nurseName || getNurseName(selectedEvent.nurseId)} (ID: {selectedEvent.nurseId})</p>
                <p><strong>Triệu chứng:</strong> {selectedEvent.symptoms}</p>
                <p><strong>Xử lý:</strong> {selectedEvent.actionTaken}</p>
                <p><strong>Ghi chú:</strong> {selectedEvent.note || "Không có"}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => {
                setShowViewModal(false);
                handleEdit(selectedEvent);
              }}>Chỉnh sửa</button>
              <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Đóng</button>
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
                  <select
                    className="form-select"
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                  onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn học sinh</option>
                    {students.map(student => (
                      <option key={student.studentId} value={student.studentId}>
                        {student.fullName} (ID: {student.studentId})
                      </option>
                    ))}
                  </select>
              </div>
                <div className="mb-3">
                  <label htmlFor="nurseId" className="form-label">Y tá <span className="text-danger">*</span></label>
                <select
                    className="form-select"
                    id="nurseId"
                    name="nurseId"
                    value={formData.nurseId}
                  onChange={handleInputChange}
                  required
                  >
                    <option value="">Chọn y tá</option>
                    {nurses.map(nurse => (
                      <option key={nurse.nurseId} value={nurse.nurseId}>
                        {nurse.fullName} (ID: {nurse.nurseId})
                      </option>
                    ))}
                </select>
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
                  <label htmlFor="actionTaken" className="form-label">Xử lý <span className="text-danger">*</span></label>
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
                  <label htmlFor="note" className="form-label">Ghi chú</label>
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