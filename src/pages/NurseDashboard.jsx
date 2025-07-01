import React, { useEffect, useState } from "react";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import NurseViewDialog from "../components/NurseViewDialog";
import NurseEditDialog from "../components/NurseEditDialog";
import { useNavigate } from "react-router-dom";
import { FaNotesMedical, FaStethoscope, FaSyringe, FaCalendarAlt, FaPills, FaClipboardCheck } from "react-icons/fa";
import "../styles/Dashboard.css";

const columns = [
  { title: "ID", dataIndex: "nurseId" },
  { title: "Name", dataIndex: "fullName" },
  { title: "Contact email", dataIndex: "email" },
  { title: "User name", dataIndex: "username" },
];

const iconStyle = {
  view: { color: "#007bff" },
  edit: { color: "#28a745" },
  delete: { color: "#dc3545" },
};

const NurseList = () => {
  const [nurseList, setNurseList] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewNurse, setViewNurse] = useState(null);
  const [editNurse, setEditNurse] = useState(null);
  const { setNotif } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNurseList = async () => {
      setLoading(true);
      try {
        const response = await API_SERVICE.nurseAPI.getAll({ keyword: "" });
        setNurseList(response);
      } catch (error) {
        console.error("Error fetching nurse list:", error);
      }
      setLoading(false);
    };
    fetchNurseList();
  }, []);

  const handleViewDetail = (row) => {
    setViewNurse(row);
  };

  const handleEdit = (row) => {
    setEditNurse(row);
  };

  const handleDelete = (row) => {
    setDeleteTarget(row);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        await API_SERVICE.nurseAPI.delete(deleteTarget.nurseId);
        setNurseList((prev) => prev.filter(n => n.nurseId !== deleteTarget.nurseId));
        setDeleteTarget(null);
        setNotif({
          message: "Xóa nurse thành công!",
          type: "success",
        });
      } catch (error) {
        setNotif({
          message: `Xóa nurse thất bại! ${error.message}`,
          type: "error",
        });
        setDeleteTarget(null);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const reloadNurseList = async () => {
    setLoading(true);
    try {
      const response = await API_SERVICE.nurseAPI.getAll({ keyword: "" });
      setNurseList(response);
    } catch (error) {
      console.error("Error fetching nurse list:", error);
    }
    setLoading(false);
  };

  const handleCreateNew = () => {
    navigate('/manager/nurse/create');
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <button className="admin-btn" onClick={handleCreateNew}>
          + Create New Nurse
        </button>
        <input className="admin-search" type="text" placeholder="Search..." />
      </div>
      <div className="admin-table-container">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <TableWithPaging
            columns={columns}
            data={nurseList}
            page={page}
            pageSize={10}
            onPageChange={setPage}
            renderActions={(row) => (
              <div className="admin-action-group">
                <button
                  className="admin-action-btn admin-action-view admin-action-btn-reset"
                  title="View Detail"
                  onClick={() => handleViewDetail(row)}
                >
                  <FaEye style={iconStyle.view} size={18} />
                </button>
                <button
                  className="admin-action-btn admin-action-edit admin-action-btn-reset"
                  title="Edit"
                  onClick={() => handleEdit(row)}
                >
                  <FaEdit style={iconStyle.edit} size={18} />
                </button>
                <button
                  className="admin-action-btn admin-action-delete admin-action-btn-reset"
                  title="Delete"
                  onClick={() => handleDelete(row)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                >
                  <FaTrash style={iconStyle.delete} size={18} />
                </button>
              </div>
            )}
          />
        )}
      </div>
      
      {/* Dialog xác nhận xóa */}
      {deleteTarget && (
        <div className="nurse-delete-modal-overlay">
          <div className="nurse-delete-modal-content">
            <div className="nurse-delete-modal-title">
              <strong>Bạn có chắc chắn muốn xóa nurse "{deleteTarget.fullName}"?</strong>
            </div>
            <div className="nurse-delete-modal-actions">
              <button className="admin-btn btn-danger" onClick={confirmDelete}>
                Xóa
              </button>
              <button className="admin-btn btn-secondary" onClick={cancelDelete}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Dialog xem chi tiết nurse */}
      {viewNurse && (
        <NurseViewDialog
          nurse={viewNurse}
          onClose={() => setViewNurse(null)}
        />
      )}
      
      {/* Dialog chỉnh sửa nurse */}
      {editNurse && (
        <NurseEditDialog
          nurse={editNurse}
          onClose={() => setEditNurse(null)}
          onSuccess={reloadNurseList}
        />
      )}
    </div>
  );
};

const NurseDashboard = () => {
  const [stats, setStats] = useState({
    medicalEvents: 0,
    healthCheckResults: 0,
    vaccinationResults: 0,
    consultationSchedules: 0,
    pendingMedications: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    medicalEventsByMonth: [12, 15, 18, 22, 24, 20, 19, 23, 25, 28, 24, 26],
    healthChecksByMonth: [30, 35, 32, 38, 42, 40, 45, 48, 43, 47, 45, 50],
    vaccinationsByMonth: [18, 22, 25, 28, 30, 27, 32, 35, 30, 33, 32, 35]
  });
  const navigate = useNavigate();
  const { setNotif } = useNotification();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // In a real application, you would fetch these statistics from the backend
      // For now, we'll use mock data
      
      // Simulate API calls
      const nurseId = localStorage.getItem("userId");
      
      // These would be actual API calls in a real application
      /*
      const medicalEvents = await API_SERVICE.medicalEventAPI.getStats(nurseId);
      const healthCheckResults = await API_SERVICE.healthCheckResultAPI.getStats(nurseId);
      const vaccinationResults = await API_SERVICE.vaccinationResultAPI.getStats(nurseId);
      const consultationSchedules = await API_SERVICE.consultationScheduleAPI.getStats(nurseId);
      const pendingMedications = await API_SERVICE.parentPrescriptionAPI.getPending();
      const recentEventsList = await API_SERVICE.medicalEventAPI.getRecent(nurseId);
      */
      
      // Mock data for demonstration
      setStats({
        medicalEvents: 24,
        healthCheckResults: 45,
        vaccinationResults: 32,
        consultationSchedules: 15,
        pendingMedications: 8
      });
      
      setRecentEvents([
        {
          id: 1,
          title: "Sốt nhẹ - Nguyễn Văn A",
          date: new Date().toLocaleDateString('vi-VN'),
          status: "Đang xử lý"
        },
        {
          id: 2,
          title: "Đau đầu - Trần Thị B",
          date: new Date(Date.now() - 86400000).toLocaleDateString('vi-VN'),
          status: "Đã hoàn thành"
        },
        {
          id: 3,
          title: "Đau bụng - Lê Văn C",
          date: new Date(Date.now() - 172800000).toLocaleDateString('vi-VN'),
          status: "Đã hoàn thành"
        },
        {
          id: 4,
          title: "Chóng mặt - Phạm Thị D",
          date: new Date(Date.now() - 259200000).toLocaleDateString('vi-VN'),
          status: "Đã hoàn thành"
        }
      ]);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setNotif({
        message: "Không thể tải dữ liệu tổng quan",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  // Render chart function
  const renderChart = () => {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const maxValue = Math.max(
      ...chartData.medicalEventsByMonth,
      ...chartData.healthChecksByMonth,
      ...chartData.vaccinationsByMonth
    );
    
    return (
      <div className="chart-container">
        <h3>Thống kê hoạt động theo tháng</h3>
        <div className="chart">
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: "#ff6b6b" }}></span>
              <span>Sự kiện y tế</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: "#4ecdc4" }}></span>
              <span>Khám sức khỏe</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: "#45aaf2" }}></span>
              <span>Tiêm chủng</span>
            </div>
          </div>
          <div className="chart-grid">
            {months.map((month, index) => (
              <div key={month} className="chart-column">
                <div className="chart-bars">
                  <div 
                    className="chart-bar" 
                    style={{ 
                      height: `${(chartData.medicalEventsByMonth[index] / maxValue) * 100}%`,
                      backgroundColor: "#ff6b6b"
                    }}
                    title={`Sự kiện y tế: ${chartData.medicalEventsByMonth[index]}`}
                  ></div>
                  <div 
                    className="chart-bar" 
                    style={{ 
                      height: `${(chartData.healthChecksByMonth[index] / maxValue) * 100}%`,
                      backgroundColor: "#4ecdc4"
                    }}
                    title={`Khám sức khỏe: ${chartData.healthChecksByMonth[index]}`}
                  ></div>
                  <div 
                    className="chart-bar" 
                    style={{ 
                      height: `${(chartData.vaccinationsByMonth[index] / maxValue) * 100}%`,
                      backgroundColor: "#45aaf2"
                    }}
                    title={`Tiêm chủng: ${chartData.vaccinationsByMonth[index]}`}
                  ></div>
                </div>
                <div className="chart-label">{month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h2>Tổng quan y tá</h2>
        <div className="admin-header-actions">
          <button className="admin-btn" onClick={() => fetchDashboardData()}>
            Làm mới
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Đang tải...</div>
      ) : (
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card" onClick={() => navigateTo("/nurse/medical-events")}>
              <div className="stat-icon">
                <FaNotesMedical size={24} />
              </div>
              <div className="stat-info">
                <h3>Sự kiện y tế</h3>
                <p className="stat-number">{stats.medicalEvents}</p>
              </div>
            </div>
            <div className="stat-card" onClick={() => navigateTo("/nurse/health-check-results")}>
              <div className="stat-icon">
                <FaStethoscope size={24} />
              </div>
              <div className="stat-info">
                <h3>Kết quả khám</h3>
                <p className="stat-number">{stats.healthCheckResults}</p>
              </div>
            </div>
            <div className="stat-card" onClick={() => navigateTo("/nurse/vaccination-results")}>
              <div className="stat-icon">
                <FaSyringe size={24} />
              </div>
              <div className="stat-info">
                <h3>Kết quả tiêm</h3>
                <p className="stat-number">{stats.vaccinationResults}</p>
              </div>
            </div>
            <div className="stat-card" onClick={() => navigateTo("/nurse/consultation-schedules")}>
              <div className="stat-icon">
                <FaCalendarAlt size={24} />
              </div>
              <div className="stat-info">
                <h3>Lịch tư vấn</h3>
                <p className="stat-number">{stats.consultationSchedules}</p>
              </div>
            </div>
            <div className="stat-card" onClick={() => navigateTo("/nurse/medications")}>
              <div className="stat-icon">
                <FaPills size={24} />
              </div>
              <div className="stat-info">
                <h3>Thuốc chờ xử lý</h3>
                <p className="stat-number">{stats.pendingMedications}</p>
              </div>
            </div>
            <div className="stat-card" onClick={() => navigateTo("/nurse/vaccination-follow-up")}>
              <div className="stat-icon" style={{ backgroundColor: "#6c5ce7" }}>
                <FaClipboardCheck size={24} />
              </div>
              <div className="stat-info">
                <h3>Theo dõi sau tiêm</h3>
                <p className="stat-number">{Math.floor(stats.vaccinationResults * 0.8)}</p>
              </div>
            </div>
          </div>

          <div className="dashboard-sections">
            {renderChart()}
            
            <div className="dashboard-section">
              <h3>Sự kiện y tế gần đây</h3>
              <div className="dashboard-table">
                <table>
                  <thead>
                    <tr>
                      <th>Tiêu đề</th>
                      <th>Ngày</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEvents.map(event => (
                      <tr key={event.id}>
                        <td>{event.title}</td>
                        <td>{event.date}</td>
                        <td>{event.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="dashboard-section-footer">
                <button className="admin-btn" onClick={() => navigateTo("/nurse/medical-events")}>
                  Xem tất cả
                </button>
              </div>
            </div>

            <div className="dashboard-section">
              <h3>Truy cập nhanh</h3>
              <div className="quick-access-grid">
                <div className="quick-access-card" onClick={() => navigateTo("/nurse/medical-events")}>
                  <FaNotesMedical size={24} />
                  <span>Ghi nhận sự kiện y tế</span>
                </div>
                <div className="quick-access-card" onClick={() => navigateTo("/nurse/health-check-results")}>
                  <FaStethoscope size={24} />
                  <span>Ghi nhận kết quả khám</span>
                </div>
                <div className="quick-access-card" onClick={() => navigateTo("/nurse/vaccination-results")}>
                  <FaSyringe size={24} />
                  <span>Ghi nhận kết quả tiêm</span>
                </div>
                <div className="quick-access-card" onClick={() => navigateTo("/nurse/consultation-schedules")}>
                  <FaCalendarAlt size={24} />
                  <span>Tạo lịch tư vấn</span>
                </div>
                <div className="quick-access-card" onClick={() => navigateTo("/nurse/medications")}>
                  <FaPills size={24} />
                  <span>Xử lý thuốc</span>
                </div>
                <div className="quick-access-card" onClick={() => navigateTo("/nurse/vaccination-follow-up")}>
                  <FaClipboardCheck size={24} />
                  <span>Theo dõi sau tiêm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseDashboard;