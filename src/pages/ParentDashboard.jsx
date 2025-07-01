import React, { useEffect, useState } from "react";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import ParentViewDialog from "../components/ParentViewDialog";
import ParentEditDialog from "../components/ParentEditDialog";
import { useNavigate } from "react-router-dom";

const columns = [
  { title: "Họ tên", dataIndex: "fullName" },
  { title: "Email liên hệ", dataIndex: "email" },
  { title: "Số điện thoại", dataIndex: "phoneNumber" },
  { title: "Địa chỉ", dataIndex: "address" }
];

const iconStyle = {
  view: { color: "#007bff" },
  edit: { color: "#28a745" },
  delete: { color: "#dc3545" },
};

const ParentList = () => {
  const [parentList, setParentList] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewParent, setViewParent] = useState(null);
  const [editParent, setEditParent] = useState(null);
  const { setNotif } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParentList = async () => {
      setLoading(true);
      try {
        const response = await API_SERVICE.parentAPI.getAll({ keyword: "" });
        setParentList(response);
      } catch (error) {
        console.error("Error fetching parent list:", error);
      }
      setLoading(false);
    };
    fetchParentList();
  }, []);

  const handleViewDetail = (row) => {
    setViewParent(row);
  };

  const handleEdit = (row) => {
    setEditParent(row);
  };

  const handleDelete = (row) => {
    setDeleteTarget(row);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        await API_SERVICE.parentAPI.delete(deleteTarget.parentId);
        setParentList((prev) => prev.filter(p => p.parentId !== deleteTarget.parentId));
        setDeleteTarget(null);
        setNotif({
          message: "Xóa phụ huynh thành công!",
          type: "success",
        });
      } catch (error) {
        setNotif({
          message: `Xóa phụ huynh thất bại! ${error.message}`,
          type: "error",
        });
        setDeleteTarget(null);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const reloadParentList = async () => {
    setLoading(true);
    try {
      const response = await API_SERVICE.parentAPI.getAll({ keyword: "" });
      setParentList(response);
    } catch (error) {
      console.error("Error fetching parent list:", error);
    }
    setLoading(false);
  };

  const handleCreateNew = () => {
    navigate('/manager/parent/create');
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <button className="admin-btn" onClick={handleCreateNew}>
          + Thêm phụ huynh mới
        </button>
        <input className="admin-search" type="text" placeholder="Tìm kiếm..." />
      </div>
      <div className="admin-table-container">
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <TableWithPaging
            columns={columns}
            data={parentList}
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
        <div className="parent-delete-modal-overlay">
          <div className="parent-delete-modal-content">
            <div className="parent-delete-modal-title">
              <strong>Bạn có chắc chắn muốn xóa phụ huynh "{deleteTarget.fullName}"?</strong>
            </div>
            <div className="parent-delete-modal-actions">
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
      
      {/* Dialog xem chi tiết parent */}
      {viewParent && (
        <ParentViewDialog
          parent={viewParent}
          onClose={() => setViewParent(null)}
        />
      )}
      
      {/* Dialog chỉnh sửa parent */}
      {editParent && (
        <ParentEditDialog
          parent={editParent}
          onClose={() => setEditParent(null)}
          onSuccess={reloadParentList}
        />
      )}
    </div>
  );
};

export default ParentList;