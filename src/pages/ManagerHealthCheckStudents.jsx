import React, { useEffect, useState } from "react";
import { API_SERVICE } from "../services/api";
import TableWithPaging from "../components/TableWithPaging";
import "../styles/TableWithPaging.css";
import { formatDate, getAcceptedStudentsBySchedule } from "../services/utils";

const SCHEDULE_TYPES = [
  { value: "health", label: "Lịch khám sức khỏe" },
  { value: "vaccine", label: "Lịch tiêm chủng" },
];

const PAGE_SIZE = 10;

const ManagerHealthCheckStudents = () => {
  const [scheduleType, setScheduleType] = useState("health");
  const [allSchedules, setAllSchedules] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [acceptedStudents, setAcceptedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Lấy tất cả lịch khi mount
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const health = await API_SERVICE.healthCheckScheduleAPI.getAll({ keyword: "" });
        const vaccine = await API_SERVICE.vaccinationScheduleAPI.getAll({ keyword: "" });
        const healthSchedules = health.map(sch => ({ ...sch, _type: "health" }));
        const vaccineSchedules = vaccine.map(sch => ({ ...sch, _type: "vaccine" }));
        setAllSchedules([...healthSchedules, ...vaccineSchedules]);
      } catch {
        setError("Không thể tải danh sách lịch");
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  // Lọc lịch theo loại
  useEffect(() => {
    setSelectedSchedule(null);
    setAcceptedStudents([]);
    setError("");
    setSchedules(allSchedules.filter(sch => sch._type === scheduleType));
  }, [scheduleType, allSchedules]);

  // Khi chọn một lịch, lấy danh sách sinh viên đã accepted consentForm
  const handleSelectSchedule = async (schedule) => {
    setSelectedSchedule(schedule);
    setAcceptedStudents([]);
    setError("");
    setLoading(true);
    setPage(1);
    try {
      const accepted = await getAcceptedStudentsBySchedule(schedule, API_SERVICE);
      setAcceptedStudents(accepted);
    } catch (e) {
      console.error("Lỗi trong handleSelectSchedule:", e);
      setError("Không thể tải danh sách sinh viên cho lịch này");
    } finally {
      setLoading(false);
    }
  };

  // Lọc học sinh theo search
  const filteredStudents = acceptedStudents.filter(stu => {
    if (!search) return true;
    const name = (stu.fullName || (stu.firstName + ' ' + stu.lastName)).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="admin-main">
      <h2 className="dashboard-title">Quản lý học sinh đã đồng ý tham gia lịch</h2>
      <div className="admin-header">
        <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap', background: '#fff', padding: '16px 0', borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ minWidth: 70 }}>Loại lịch:</label>
            <select value={scheduleType} onChange={e => setScheduleType(e.target.value)} style={{ background: '#fff', height: 40, minWidth: 180, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, color: '#222' }}>
              {SCHEDULE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ minWidth: 40 }}>Lịch:</label>
            <select
              value={selectedSchedule ? selectedSchedule.healthCheckScheduleId || selectedSchedule.vaccinationScheduleId : ""}
              onChange={e => {
                const sch = schedules.find(sch =>
                  String(sch.healthCheckScheduleId || sch.vaccinationScheduleId) === e.target.value
                );
                if (sch) handleSelectSchedule(sch);
              }}
              style={{ background: '#fff', height: 40, minWidth: 320, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, color: '#222' }}
            >
              <option value="">-- Chọn lịch --</option>
              {schedules.map(sch => (
                <option
                  key={sch.healthCheckScheduleId || sch.vaccinationScheduleId}
                  value={sch.healthCheckScheduleId || sch.vaccinationScheduleId}
                >
                  {sch.name} ({formatDate(sch.checkDate || sch.scheduleDate)})
                </option>
              ))}
            </select>
          </div>
          <input
            className="admin-search"
            type="text"
            placeholder="Tìm kiếm học sinh..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ minWidth: 220, background: '#fff', height: 40, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, color: '#222', marginLeft: 8 }}
          />
        </div>
      </div>
      <div className="admin-table-container">
        <TableWithPaging
          columns={[
            { title: "STT", dataIndex: "stt", render: (_, __, idx) => (page - 1) * PAGE_SIZE + idx + 1 },
            { title: "Họ tên", dataIndex: "fullName", render: (val, row) => val || (row.firstName + ' ' + row.lastName) },
            { title: "Mã học sinh", dataIndex: "studentId" },
            { title: "Lớp", dataIndex: "className" },
          ]}
          data={filteredStudents}
          pageSize={PAGE_SIZE}
          page={page}
          onPageChange={setPage}
          loading={loading}
        />
        {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );
};

export default ManagerHealthCheckStudents; 