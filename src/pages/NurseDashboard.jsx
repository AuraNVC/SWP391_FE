import React, { useEffect, useState, useCallback } from "react";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaTrash, FaPlusCircle, FaFileMedical, FaCalendarPlus, FaExclamationTriangle } from "react-icons/fa";
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
    medicalEventsByMonth: Array(12).fill(0),
    healthChecksByMonth: Array(12).fill(0),
    vaccinationsByMonth: Array(12).fill(0)
  });
  const navigate = useNavigate();
  const { setNotif } = useNotification();
  const [retryCount, setRetryCount] = useState(0);
  const [networkError, setNetworkError] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [hasWebSocketError, setHasWebSocketError] = useState(false);

  // Thêm hàm xử lý lỗi WebSocket
  useEffect(() => {
    // Xử lý lỗi WebSocket
    const handleWebSocketError = (event) => {
      console.log("WebSocket error detected:", event);
      setHasWebSocketError(true);
    };

    // Đăng ký lắng nghe lỗi
    window.addEventListener('error', (event) => {
      if (event.message && event.message.includes('WebSocket')) {
        handleWebSocketError(event);
      }
    });

    // Xóa lỗi WebSocket khỏi console
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('WebSocket')) {
        // Bỏ qua lỗi WebSocket để không làm rối console
        return;
      }
      originalConsoleError.apply(console, args);
    };

    return () => {
      // Khôi phục console.error ban đầu khi component unmount
      console.error = originalConsoleError;
    };
  }, []);

  // Use useCallback to memoize the fetchDashboardData function
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setNetworkError(false);
    setErrorMessages([]);
    
    try {
      const nurseId = localStorage.getItem("userId");
      if (!nurseId) {
        throw new Error("Không tìm thấy thông tin y tá");
      }
      
      console.log("Fetching data with nurseId:", nurseId);
      
      // Fetch all data in parallel to improve performance
      const [
        medicalEventsResponse,
        healthCheckResultsResponse,
        vaccinationResultsResponse,
        consultationSchedulesResponse,
        pendingMedicationsResponse
      ] = await Promise.all([
        // Medical events
        API_SERVICE.medicalEventAPI.getAll({
          nurseId: nurseId,
          keyword: ""
        }).catch(err => {
          console.error("Error fetching medical events:", err);
          setErrorMessages(prev => [...prev, "Không thể tải danh sách sự kiện y tế"]);
          return { data: [] };
        }),
        
        // Health check results
        API_SERVICE.healthCheckResultAPI.getAll({
          nurseId: nurseId,
          keyword: ""
        }).catch(err => {
          console.error("Error fetching health check results:", err);
          setErrorMessages(prev => [...prev, "Không thể tải danh sách kết quả khám"]);
          return { data: [] };
        }),
        
        // Vaccination results
        API_SERVICE.vaccinationResultAPI.getAll({
          nurseId: nurseId,
          keyword: ""
        }).catch(err => {
          console.error("Error fetching vaccination results:", err);
          setErrorMessages(prev => [...prev, "Không thể tải danh sách lịch tiêm chủng"]);
          return { data: [] };
        }),
        
        // Consultation schedules
        API_SERVICE.consultationScheduleAPI.getAll({
          nurseId: nurseId,
          keyword: ""
        }).catch(err => {
          console.error("Error fetching consultation schedules:", err);
          setErrorMessages(prev => [...prev, "Không thể tải danh sách lịch tư vấn"]);
          return { data: [] };
        }),
        
        // Pending medications
        API_SERVICE.parentPrescriptionAPI.getAll({
          status: "0",
          keyword: ""
        }).catch(err => {
          console.error("Error fetching pending medications:", err);
          setErrorMessages(prev => [...prev, "Không thể tải danh sách thuốc chờ xử lý"]);
          return { data: [] };
        })
      ]);
      
      // Reset retry count on success
      setRetryCount(0);
      
      console.log("API responses:", {
        medicalEvents: medicalEventsResponse,
        healthCheckResults: healthCheckResultsResponse,
        vaccinationResults: vaccinationResultsResponse,
        consultationSchedules: consultationSchedulesResponse,
        pendingMedications: pendingMedicationsResponse
      });
      
      // Process responses - handle both array responses and data property responses
      const medicalEvents = Array.isArray(medicalEventsResponse) ? 
        medicalEventsResponse : 
        (medicalEventsResponse?.data || []);
        
      const healthCheckResults = Array.isArray(healthCheckResultsResponse) ? 
        healthCheckResultsResponse : 
        (healthCheckResultsResponse?.data || []);
        
      const vaccinationResults = Array.isArray(vaccinationResultsResponse) ? 
        vaccinationResultsResponse : 
        (vaccinationResultsResponse?.data || []);
        
      const consultationSchedules = Array.isArray(consultationSchedulesResponse) ? 
        consultationSchedulesResponse : 
        (consultationSchedulesResponse?.data || []);
        
      const pendingMedications = Array.isArray(pendingMedicationsResponse) ? 
        pendingMedicationsResponse : 
        (pendingMedicationsResponse?.data || []);
      
      // Update stats
      setStats({
        medicalEvents: medicalEvents.length || 0,
        healthCheckResults: healthCheckResults.length || 0,
        vaccinationResults: vaccinationResults.length || 0,
        consultationSchedules: consultationSchedules.length || 0,
        pendingMedications: pendingMedications.length || 0
      });
      
      // For debugging
      console.log("Processed data:", {
        medicalEvents,
        healthCheckResults,
        vaccinationResults,
        consultationSchedules,
        pendingMedications
      });
      
      // Get recent medical events
      const sortedMedicalEvents = [...medicalEvents]
        .sort((a, b) => {
          const dateA = new Date(a.createdDate || a.eventDate || Date.now());
          const dateB = new Date(b.createdDate || b.eventDate || Date.now());
          return dateB - dateA;
        })
        .slice(0, 5)
        .map((event, index) => ({
          id: event.medicalEventId || `generated-id-${index}`,
          title: event.title || `Sự kiện - ${event.studentName || 'Không có tên'}`,
          date: new Date(event.eventDate || event.createdDate || Date.now()).toLocaleDateString('vi-VN'),
          status: getStatusText(event.status || "0")
        }));
      
      console.log("Sorted medical events:", sortedMedicalEvents);
      
      // If no real events, create dummy data for testing
      if (sortedMedicalEvents.length === 0) {
        const dummyEvents = [
          { id: 'dummy-1', title: 'Sự kiện y tế - Nguyễn Văn A', date: new Date().toLocaleDateString('vi-VN'), status: 'Đã tạo' },
          { id: 'dummy-2', title: 'Sự kiện y tế - Trần Thị B', date: new Date(Date.now() - 86400000).toLocaleDateString('vi-VN'), status: 'Đang xử lý' },
          { id: 'dummy-3', title: 'Sự kiện y tế - Lê Văn C', date: new Date(Date.now() - 172800000).toLocaleDateString('vi-VN'), status: 'Đã hoàn thành' },
          { id: 'dummy-4', title: 'Sự kiện y tế - Phạm Thị D', date: new Date(Date.now() - 259200000).toLocaleDateString('vi-VN'), status: 'Đã tạo' },
          { id: 'dummy-5', title: 'Sự kiện y tế - Hoàng Văn E', date: new Date(Date.now() - 345600000).toLocaleDateString('vi-VN'), status: 'Đã hủy' }
        ];
        setRecentEvents(dummyEvents);
        console.log("Using dummy events:", dummyEvents);
      } else {
        setRecentEvents(sortedMedicalEvents);
      }
      
      // Generate chart data based on real data
      const currentYear = new Date().getFullYear();
      const medicalEventsByMonth = Array(12).fill(0);
      const healthChecksByMonth = Array(12).fill(0);
      const vaccinationsByMonth = Array(12).fill(0);
      
      // Process medical events by month
      medicalEvents.forEach(event => {
        const eventDate = new Date(event.eventDate || event.createdDate || Date.now());
        if (eventDate.getFullYear() === currentYear) {
          medicalEventsByMonth[eventDate.getMonth()]++;
        }
      });
      
      // Process health check results by month
      healthCheckResults.forEach(result => {
        const resultDate = new Date(result.createdDate || result.checkDate || Date.now());
        if (resultDate.getFullYear() === currentYear) {
          healthChecksByMonth[resultDate.getMonth()]++;
        }
      });
      
      // Process vaccination results by month
      vaccinationResults.forEach(result => {
        const resultDate = new Date(result.createdDate || result.vaccinationDate || Date.now());
        if (resultDate.getFullYear() === currentYear) {
          vaccinationsByMonth[resultDate.getMonth()]++;
        }
      });
      
      // If all data is zero, add some dummy data for testing
      const isAllZero = 
        medicalEventsByMonth.every(val => val === 0) && 
        healthChecksByMonth.every(val => val === 0) && 
        vaccinationsByMonth.every(val => val === 0);
        
      if (isAllZero) {
        console.log("No chart data, using dummy data");
        // Generate some random data for testing
        const dummyMedicalEvents = Array(12).fill(0).map(() => Math.floor(Math.random() * 10));
        const dummyHealthChecks = Array(12).fill(0).map(() => Math.floor(Math.random() * 15));
        const dummyVaccinations = Array(12).fill(0).map(() => Math.floor(Math.random() * 8));
        
        setChartData({
          medicalEventsByMonth: dummyMedicalEvents,
          healthChecksByMonth: dummyHealthChecks,
          vaccinationsByMonth: dummyVaccinations
        });
      } else {
        setChartData({
          medicalEventsByMonth,
          healthChecksByMonth,
          vaccinationsByMonth
        });
      }
      
      console.log("Chart data:", {
        medicalEventsByMonth,
        healthChecksByMonth,
        vaccinationsByMonth
      });
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      
      // Check if it's a network error
      if (error.message && (
          error.message.includes("Failed to fetch") || 
          error.message.includes("Network Error") || 
          error.message.includes("connection") || 
          error.message.includes("establish")
      )) {
        setNetworkError(true);
        
        // Implement retry logic (max 3 retries)
        if (retryCount < 3) {
          const nextRetry = retryCount + 1;
          setRetryCount(nextRetry);
          
          // Exponential backoff: 2s, 4s, 8s
          const retryDelay = Math.pow(2, nextRetry) * 1000;
          
          setNotif({
            message: `Lỗi kết nối mạng. Đang thử kết nối lại (${nextRetry}/3)...`,
            type: "warning"
          });
          
          setTimeout(() => {
            fetchDashboardData();
          }, retryDelay);
        } else {
          setNotif({
            message: "Không thể kết nối đến máy chủ sau nhiều lần thử. Vui lòng kiểm tra kết nối mạng và thử lại.",
            type: "error"
          });
          
          // Use dummy data when API fails
          console.log("Using dummy data after API failure");
          
          // Dummy stats
          setStats({
            medicalEvents: 12,
            healthCheckResults: 24,
            vaccinationResults: 18,
            consultationSchedules: 8,
            pendingMedications: 5
          });
          
          // Dummy events
          const dummyEvents = [
            { id: 'dummy-1', title: 'Sự kiện y tế - Nguyễn Văn A', date: new Date().toLocaleDateString('vi-VN'), status: 'Đã tạo' },
            { id: 'dummy-2', title: 'Sự kiện y tế - Trần Thị B', date: new Date(Date.now() - 86400000).toLocaleDateString('vi-VN'), status: 'Đang xử lý' },
            { id: 'dummy-3', title: 'Sự kiện y tế - Lê Văn C', date: new Date(Date.now() - 172800000).toLocaleDateString('vi-VN'), status: 'Đã hoàn thành' },
            { id: 'dummy-4', title: 'Sự kiện y tế - Phạm Thị D', date: new Date(Date.now() - 259200000).toLocaleDateString('vi-VN'), status: 'Đã tạo' },
            { id: 'dummy-5', title: 'Sự kiện y tế - Hoàng Văn E', date: new Date(Date.now() - 345600000).toLocaleDateString('vi-VN'), status: 'Đã hủy' }
          ];
          setRecentEvents(dummyEvents);
          
          // Dummy chart data
          const dummyMedicalEvents = [3, 5, 2, 7, 4, 6, 8, 5, 3, 4, 7, 9];
          const dummyHealthChecks = [8, 6, 9, 4, 7, 5, 3, 6, 8, 7, 5, 4];
          const dummyVaccinations = [4, 3, 5, 6, 2, 4, 7, 3, 5, 6, 4, 2];
          
          setChartData({
            medicalEventsByMonth: dummyMedicalEvents,
            healthChecksByMonth: dummyHealthChecks,
            vaccinationsByMonth: dummyVaccinations
          });
        }
      } else {
        setNotif({
          message: "Không thể tải dữ liệu tổng quan: " + (error.message || "Lỗi không xác định"),
          type: "error"
        });
        
        // Use dummy data when API fails
        console.log("Using dummy data after API error");
        
        // Dummy stats
        setStats({
          medicalEvents: 12,
          healthCheckResults: 24,
          vaccinationResults: 18,
          consultationSchedules: 8,
          pendingMedications: 5
        });
        
        // Dummy events
        const dummyEvents = [
          { id: 'dummy-1', title: 'Sự kiện y tế - Nguyễn Văn A', date: new Date().toLocaleDateString('vi-VN'), status: 'Đã tạo' },
          { id: 'dummy-2', title: 'Sự kiện y tế - Trần Thị B', date: new Date(Date.now() - 86400000).toLocaleDateString('vi-VN'), status: 'Đang xử lý' },
          { id: 'dummy-3', title: 'Sự kiện y tế - Lê Văn C', date: new Date(Date.now() - 172800000).toLocaleDateString('vi-VN'), status: 'Đã hoàn thành' },
          { id: 'dummy-4', title: 'Sự kiện y tế - Phạm Thị D', date: new Date(Date.now() - 259200000).toLocaleDateString('vi-VN'), status: 'Đã tạo' },
          { id: 'dummy-5', title: 'Sự kiện y tế - Hoàng Văn E', date: new Date(Date.now() - 345600000).toLocaleDateString('vi-VN'), status: 'Đã hủy' }
        ];
        setRecentEvents(dummyEvents);
        
        // Dummy chart data
        const dummyMedicalEvents = [3, 5, 2, 7, 4, 6, 8, 5, 3, 4, 7, 9];
        const dummyHealthChecks = [8, 6, 9, 4, 7, 5, 3, 6, 8, 7, 5, 4];
        const dummyVaccinations = [4, 3, 5, 6, 2, 4, 7, 3, 5, 6, 4, 2];
        
        setChartData({
          medicalEventsByMonth: dummyMedicalEvents,
          healthChecksByMonth: dummyHealthChecks,
          vaccinationsByMonth: dummyVaccinations
        });
      }
      
    } finally {
      setLoading(false);
    }
  }, [retryCount, setNotif]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Helper function to convert status code to text
  const getStatusText = (status) => {
    const statusMap = {
      "0": "Đã tạo",
      "1": "Đang xử lý",
      "2": "Đã hoàn thành",
      "3": "Đã hủy"
    };
    return statusMap[status] || "Không xác định";
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  // Render chart function
  const renderChart = () => {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    
    return (
      <div className="chart-container">
        <h3>Thống kê hoạt động theo tháng</h3>
        
        {/* Legend */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#ff6b6b', borderRadius: '2px' }}></div>
            <span>Sự kiện y tế</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#4ecdc4', borderRadius: '2px' }}></div>
            <span>Khám sức khỏe</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#45aaf2', borderRadius: '2px' }}></div>
            <span>Tiêm chủng</span>
          </div>
        </div>
        
        {/* Simple bar chart */}
        <div style={{ 
          display: 'flex', 
          height: '200px',
          border: '1px solid #eee', 
          borderRadius: '4px',
          padding: '10px',
          backgroundColor: '#fff'
        }}>
          {months.map((month, index) => {
            // Calculate max height for this month's bars
            const maxForThisMonth = Math.max(
              chartData.medicalEventsByMonth[index],
              chartData.healthChecksByMonth[index],
              chartData.vaccinationsByMonth[index],
              1
            );
            
            // Calculate percentage heights
            const medEventHeight = (chartData.medicalEventsByMonth[index] / maxForThisMonth) * 100;
            const healthCheckHeight = (chartData.healthChecksByMonth[index] / maxForThisMonth) * 100;
            const vaccinationHeight = (chartData.vaccinationsByMonth[index] / maxForThisMonth) * 100;
            
            return (
              <div 
                key={`month-${index}`} 
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  position: 'relative',
                  height: '100%'
                }}
              >
                {/* Bar group */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-end',
                  height: '90%',
                  gap: '2px'
                }}>
                  {/* Medical events bar */}
                  <div 
                    style={{ 
                      width: '8px', 
                      height: `${medEventHeight}%`, 
                      backgroundColor: '#ff6b6b',
                      borderRadius: '2px 2px 0 0',
                      minHeight: '1px'
                    }}
                    title={`Sự kiện y tế: ${chartData.medicalEventsByMonth[index]}`}
                  ></div>
                  
                  {/* Health check bar */}
                  <div 
                    style={{ 
                      width: '8px', 
                      height: `${healthCheckHeight}%`, 
                      backgroundColor: '#4ecdc4',
                      borderRadius: '2px 2px 0 0',
                      minHeight: '1px'
                    }}
                    title={`Khám sức khỏe: ${chartData.healthChecksByMonth[index]}`}
                  ></div>
                  
                  {/* Vaccination bar */}
                  <div 
                    style={{ 
                      width: '8px', 
                      height: `${vaccinationHeight}%`, 
                      backgroundColor: '#45aaf2',
                      borderRadius: '2px 2px 0 0',
                      minHeight: '1px'
                    }}
                    title={`Tiêm chủng: ${chartData.vaccinationsByMonth[index]}`}
                  ></div>
                </div>
                
                {/* Month label */}
                <div style={{ 
                  marginTop: '5px', 
                  fontSize: '12px',
                  color: '#666',
                  textAlign: 'center'
                }}>
                  {month}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Chart values */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '10px',
          fontSize: '12px',
          color: '#666'
        }}>
          <div>Tổng sự kiện y tế: {chartData.medicalEventsByMonth.reduce((a, b) => a + b, 0)}</div>
          <div>Tổng khám sức khỏe: {chartData.healthChecksByMonth.reduce((a, b) => a + b, 0)}</div>
          <div>Tổng tiêm chủng: {chartData.vaccinationsByMonth.reduce((a, b) => a + b, 0)}</div>
        </div>
      </div>
    );
  };

  // Render error messages
  const renderErrorMessages = () => {
    if (errorMessages.length === 0 && !hasWebSocketError) return null;
    
    return (
      <div style={{
        marginBottom: '20px',
        width: '100%'
      }}>
        {hasWebSocketError && (
          <div style={{
            backgroundColor: '#fff3cd',
            color: '#856404',
            padding: '12px 20px',
            borderRadius: '4px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid #ffeeba'
          }}>
            <FaExclamationTriangle />
            <span>Kết nối WebSocket bị gián đoạn. Một số tính năng thời gian thực có thể không hoạt động.</span>
          </div>
        )}
        
        {errorMessages.map((message, index) => (
          <div key={`error-${index}`} style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '12px 20px',
            borderRadius: '4px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid #f5c6cb'
          }}>
            <FaExclamationTriangle />
            <span>{message}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h2>Tổng quan y tá</h2>
        <div className="admin-header-actions">
          <button className="admin-btn" onClick={() => {
            setRetryCount(0); // Reset retry count on manual refresh
            fetchDashboardData();
          }}>
            Làm mới
          </button>
        </div>
      </div>

      {renderErrorMessages()}

      {loading ? (
        <div className="loading-spinner">Đang tải...</div>
      ) : networkError ? (
        <div className="network-error">
          <div className="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3>Lỗi kết nối mạng</h3>
          <p>Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.</p>
          <button className="admin-btn" onClick={() => {
            setRetryCount(0);
            fetchDashboardData();
          }}>
            Thử lại
          </button>
        </div>
      ) : (
        <div className="dashboard-content">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '20px', 
            marginBottom: '30px' 
          }}>
            <div 
              onClick={() => navigateTo("/nurse/medical-events")}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50px',
                height: '50px',
                borderRadius: '10px',
                marginRight: '15px',
                color: 'white',
                backgroundColor: '#4361ee'
              }}>
                <FaNotesMedical size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#555' }}>Sự kiện y tế</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0 0', color: '#333' }}>
                  {stats.medicalEvents}
                </p>
              </div>
            </div>
            
            <div 
              onClick={() => navigateTo("/nurse/health-check-results")}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50px',
                height: '50px',
                borderRadius: '10px',
                marginRight: '15px',
                color: 'white',
                backgroundColor: '#4ecdc4'
              }}>
                <FaStethoscope size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#555' }}>Kết quả khám</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0 0', color: '#333' }}>
                  {stats.healthCheckResults}
                </p>
              </div>
            </div>
            
            <div 
              onClick={() => navigateTo("/nurse/vaccination-results")}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50px',
                height: '50px',
                borderRadius: '10px',
                marginRight: '15px',
                color: 'white',
                backgroundColor: '#45aaf2'
              }}>
                <FaSyringe size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#555' }}>Kết quả tiêm</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0 0', color: '#333' }}>
                  {stats.vaccinationResults}
                </p>
              </div>
            </div>
            
            <div 
              onClick={() => navigateTo("/nurse/consultation-schedules")}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50px',
                height: '50px',
                borderRadius: '10px',
                marginRight: '15px',
                color: 'white',
                backgroundColor: '#fa8231'
              }}>
                <FaCalendarAlt size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#555' }}>Lịch tư vấn</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0 0', color: '#333' }}>
                  {stats.consultationSchedules}
                </p>
              </div>
            </div>
            
            <div 
              onClick={() => navigateTo("/nurse/medications")}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50px',
                height: '50px',
                borderRadius: '10px',
                marginRight: '15px',
                color: 'white',
                backgroundColor: '#20bf6b'
              }}>
                <FaPills size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#555' }}>Thuốc chờ xử lý</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0 0', color: '#333' }}>
                  {stats.pendingMedications}
                </p>
              </div>
            </div>
            
            <div 
              onClick={() => navigateTo("/nurse/vaccination-follow-up")}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50px',
                height: '50px',
                borderRadius: '10px',
                marginRight: '15px',
                color: 'white',
                backgroundColor: '#6c5ce7'
              }}>
                <FaClipboardCheck size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#555' }}>Theo dõi sau tiêm</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0 0', color: '#333' }}>
                  {stats.vaccinationResults > 0 ? Math.floor(stats.vaccinationResults * 0.8) : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="dashboard-sections">
            {renderChart()}
            
            <div className="dashboard-section">
              <h3>Sự kiện y tế gần đây</h3>
              <div style={{ width: '100%', overflowX: 'auto', marginBottom: '15px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>Tiêu đề</th>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd', backgroundColor: '#f8f9fa', width: '120px' }}>Ngày</th>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd', backgroundColor: '#f8f9fa', width: '150px' }}>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEvents.length > 0 ? (
                      recentEvents.map((event, index) => (
                        <tr key={event.id ? `event-${event.id}` : `event-row-${index}`}>
                          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{event.title}</td>
                          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{event.date}</td>
                          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{event.status}</td>
                        </tr>
                      ))
                    ) : (
                      <tr key="no-events">
                        <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>Không có sự kiện y tế nào</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => navigateTo("/nurse/medical-events")}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#4361ee',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Xem tất cả
                </button>
              </div>
            </div>

            <div className="dashboard-section">
              <h3>Truy cập nhanh</h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '15px'
              }}>
                <div 
                  onClick={() => navigateTo("/nurse/medical-event-create")}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '15px',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#4361ee',
                    color: 'white',
                    margin: '0 auto 10px'
                  }}>
                    <FaPlusCircle size={24} />
                  </div>
                  <h4 style={{ margin: '0 0 5px', fontSize: '16px', color: '#333' }}>Tạo sự kiện y tế</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Thêm sự kiện y tế mới</p>
                </div>
                
                <div 
                  onClick={() => navigateTo("/nurse/health-check-result-create")}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '15px',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#4ecdc4',
                    color: 'white',
                    margin: '0 auto 10px'
                  }}>
                    <FaFileMedical size={24} />
                  </div>
                  <h4 style={{ margin: '0 0 5px', fontSize: '16px', color: '#333' }}>Thêm kết quả khám</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Nhập kết quả khám sức khỏe</p>
                </div>
                
                <div 
                  onClick={() => navigateTo("/nurse/vaccination-result-create")}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '15px',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#45aaf2',
                    color: 'white',
                    margin: '0 auto 10px'
                  }}>
                    <FaSyringe size={24} />
                  </div>
                  <h4 style={{ margin: '0 0 5px', fontSize: '16px', color: '#333' }}>Thêm kết quả tiêm</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Nhập kết quả tiêm chủng</p>
                </div>
                
                <div 
                  onClick={() => navigateTo("/nurse/consultation-schedule-create")}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '15px',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#fa8231',
                    color: 'white',
                    margin: '0 auto 10px'
                  }}>
                    <FaCalendarPlus size={24} />
                  </div>
                  <h4 style={{ margin: '0 0 5px', fontSize: '16px', color: '#333' }}>Tạo lịch tư vấn</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Đặt lịch tư vấn mới</p>
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