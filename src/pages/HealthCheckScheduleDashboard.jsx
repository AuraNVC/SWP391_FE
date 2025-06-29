import React, { useEffect, useState } from "react";
import { API_SERVICE } from "../services/api";
import HealthCheckScheduleViewDialog from "../components/HealthCheckScheduleViewDialog";
import HealthCheckScheduleEditDialog from "../components/HealthCheckScheduleEditDialog";
import { useNavigate } from "react-router-dom";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import "../styles/TableWithPaging.css";

const HealthCheckScheduleDashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [selected, setSelected] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);

  const iconStyle = {
    view: { color: "#007bff" },
    edit: { color: "#28a745" },
    delete: { color: "#dc3545" },
  };

  useEffect(() => {
    fetchSchedules();
    setPage(1);
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await API_SERVICE.healthCheckScheduleAPI.getAll({ keyword: "" });
      setSchedules(res);
      setPage(1);
    } catch (e) {
      setSchedules([]);
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (item) => {
    setSelected(item);
    setViewOpen(true);
  };

  const handleEdit = (item) => {
    setSelected(item);
    setEditOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      await API_SERVICE.healthCheckScheduleAPI.delete(id);
      fetchSchedules();
    }
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <button className="admin-btn" onClick={() => navigate("/manager/health-check-schedule/create")}>+ Create New Health Checkup</button>
        <input className="admin-search" type="text" placeholder="Search..." />
      </div>
      <div className="admin-table-container">
        <TableWithPaging
          columns={[
            { title: "Tên lịch", dataIndex: "name" },
            { title: "Ngày khám", dataIndex: "checkDate" },
            { title: "Địa điểm", dataIndex: "location" },
          ]}
          data={schedules}
          pageSize={pageSize}
          page={page}
          onPageChange={setPage}
          renderActions={(item) => (
            <div className="admin-action-group">
              <button
                className="admin-action-btn admin-action-view admin-action-btn-reset"
                title="Xem"
                onClick={() => handleView(item)}
              >
                <FaEye style={iconStyle.view} size={18} />
              </button>
              <button
                className="admin-action-btn admin-action-edit admin-action-btn-reset"
                title="Sửa"
                onClick={() => handleEdit(item)}
              >
                <FaEdit style={iconStyle.edit} size={18} />
              </button>
              <button
                className="admin-action-btn admin-action-delete admin-action-btn-reset"
                title="Xóa"
                onClick={() => handleDelete(item.healthCheckScheduleId)}
              >
                <FaTrash style={iconStyle.delete} size={18} />
              </button>
            </div>
          )}
          loading={loading}
        />
        {loading && <div>Đang tải dữ liệu...</div>}
      </div>
      {viewOpen && (
        <HealthCheckScheduleViewDialog open={viewOpen} onClose={() => setViewOpen(false)} data={selected} />
      )}
      {editOpen && (
        <HealthCheckScheduleEditDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          data={selected}
          onUpdated={fetchSchedules}
        />
      )}
    </div>
  );
};

export default HealthCheckScheduleDashboard; 