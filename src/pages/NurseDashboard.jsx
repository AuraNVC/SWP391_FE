import React, { useEffect, useState } from "react";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import NurseViewDialog from "../components/NurseViewDialog";
import NurseEditDialog from "../components/NurseEditDialog";
import { useNavigate } from "react-router-dom";

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

export default NurseList;