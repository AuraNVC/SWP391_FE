import React, { useEffect, useState } from "react";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import MedicalInventoryViewDialog from "../components/MedicalInventoryViewDialog";
import MedicalInventoryEditDialog from "../components/MedicalInventoryEditDialog";

// Định nghĩa các cột cho bảng vật tư y tế
const columns = [
  { title: "Mã vật tư", dataIndex: "medicalInventoryId" },
  { title: "Mã quản lý", dataIndex: "managerId" },
  { title: "Tên vật tư", dataIndex: "medicalName" },
  { title: "Số lượng", dataIndex: "quantity" },
  { title: "Đơn vị", dataIndex: "unit" },
  { title: "Ngày nhập", dataIndex: "dateAdded" },
  { title: "Hạn sử dụng", dataIndex: "expiryDate" },
];

const iconStyle = {
  view: { color: "#007bff" },
  edit: { color: "#28a745" },
  delete: { color: "#dc3545" },
};

const MedicalInventoryDashboard = () => {
  const [inventoryList, setInventoryList] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const { setNotif } = useNotification();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleViewDetail = (row) => {
    setViewItem(row);
  };

  const handleEdit = (row) => {
    setEditItem(row);
  };

  const handleDelete = (row) => {
    setDeleteTarget(row);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        await API_SERVICE.medicalInventoryAPI.delete(deleteTarget.medicalInventoryId);
        setInventoryList((prev) => prev.filter((item) => item.medicalInventoryId !== deleteTarget.medicalInventoryId));
        setDeleteTarget(null);
        setNotif({ message: "Xóa vật tư thành công!", type: "success" });
      } catch (error) {
        setNotif({ message: `Xóa vật tư thất bại! ${error.message}`, type: "error" });
        setDeleteTarget(null);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const fetchInventoryList = async () => {
    setLoading(true);
    try {
      // Gọi API lấy danh sách vật tư y tế
      const response = await API_SERVICE.medicalInventoryAPI.search({ keyword: searchTerm });
      // Đảm bảo dữ liệu đúng format cho bảng
      setInventoryList(Array.isArray(response) ? response : []);
    } catch (error) {
      setNotif({ message: `Lỗi tải danh sách vật tư: ${error.message}`, type: "error" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInventoryList();
  }, [page, searchTerm]); // Re-fetch when page or search term changes

  const handleCreateNew = () => {
    navigate("/manager/medical-inventory/add");
  };

  return (
    <div className="admin-main">
      <h2 className="dashboard-title">Quản lý vật tư y tế</h2>
      <div className="admin-header">
        <button className="admin-btn" onClick={handleCreateNew}>
          + Thêm vật tư mới
        </button>
        <input
          className="admin-search"
          type="text"
          placeholder="Tìm kiếm vật tư y tế..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ background: '#fff', color: '#222' }}
        />
      </div>
      <div className="admin-table-container">
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <TableWithPaging
            columns={columns}
            data={inventoryList}
            page={page}
            pageSize={10}
            onPageChange={setPage}
            renderActions={(row) => (
              <div className="admin-action-group">
                <button
                  className="admin-action-btn admin-action-view admin-action-btn-reset"
                  title="Xem chi tiết"
                  onClick={() => handleViewDetail(row)}
                >
                  <FaEye style={iconStyle.view} size={18} />
                </button>
                <button
                  className="admin-action-btn admin-action-edit admin-action-btn-reset"
                  title="Sửa"
                  onClick={() => handleEdit(row)}
                >
                  <FaEdit style={iconStyle.edit} size={18} />
                </button>
                <button
                  className="admin-action-btn admin-action-delete admin-action-btn-reset"
                  title="Xóa"
                  onClick={() => handleDelete(row)}
                  style={{ background: "none", border: "none", padding: 0 }}
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
        <div className="blog-delete-modal-overlay">
          <div className="blog-delete-modal-content">
            <div className="blog-delete-modal-title">
              <strong>Bạn có chắc chắn muốn xóa vật tư "{deleteTarget.medicalName}"?</strong>
            </div>
            <div className="blog-delete-modal-actions">
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

      {/* Dialog xem chi tiết vật tư */}
      {viewItem && (
        <MedicalInventoryViewDialog
          item={viewItem}
          onClose={() => setViewItem(null)}
        />
      )}

      {/* Dialog chỉnh sửa vật tư */}
      {editItem && (
        <MedicalInventoryEditDialog
          item={editItem}
          onClose={() => setEditItem(null)}
          onSuccess={fetchInventoryList}
        />
      )}
    </div>
  );
};

export default MedicalInventoryDashboard; 