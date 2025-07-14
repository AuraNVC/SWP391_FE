import React, { useEffect, useState } from "react";
import "../styles/Manager.css";
import "../styles/FormValidation.css";
import "../styles/ConfirmationDialog.css";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import TableWithPaging from "../components/TableWithPaging";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import FormViewDialog from "../components/FormViewDialog";
import FormEditDialog from "../components/FormEditDialog";
import ConfirmationDialog from "../components/ConfirmationDialog";

const columns = [
    { title: "Mã biểu mẫu", dataIndex: "formId" },
    { title: "Tiêu đề", dataIndex: "title" },
    { title: "Lớp", dataIndex: "className" },
    { title: "Loại", dataIndex: "type" },
    { title: "Ngày gửi", dataIndex: "sentDate" },
    { title: "Ngày tạo", dataIndex: "createdAt" },
];

const iconStyle = {
    view: { color: "#007bff" },
    edit: { color: "#28a745" },
    delete: { color: "#dc3545" },
};

const FormDashboard = () => {
    const [formList, setFormList] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [viewForm, setViewForm] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const { setNotif } = useNotification();
    const navigate = useNavigate();

    const handleViewDetail = (row) => {
        console.log("View form data:", row);
        setViewForm(row);
    };

    const handleEdit = (row) => {
        setEditForm(row);
    };

    const handleDelete = (row) => {
        setDeleteTarget(row);
    };

    const confirmDelete = async () => {
        if (deleteTarget) {
            try {
                await API_SERVICE.formAPI.delete(deleteTarget.formId);
                setFormList((prev) => prev.filter(f => f.formId !== deleteTarget.formId));
                setDeleteTarget(null);
                setNotif({
                    message: "Xóa biểu mẫu thành công!",
                    type: "success",
                });
            } catch (error) {
                setNotif({
                    message: `Xóa biểu mẫu thất bại! ${error?.response?.data?.message || error.message}`,
                    type: "error",
                });
                setDeleteTarget(null);
            }
        }
    };

    const cancelDelete = () => {
        setDeleteTarget(null);
    };

    const handleCreateNew = () => {
        navigate('/manager/form/create');
    };

    const refreshFormList = async () => {
        setLoading(true);
        try {
            const response = await API_SERVICE.formAPI.getAll({ keyword: "" });
            setFormList(response);
        } catch (error) {
            console.error("Error fetching form list:", error);
            setNotif({
                message: "Không thể tải danh sách biểu mẫu",
                type: "error",
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        refreshFormList();
    }, []);

    return (
        <div className="admin-main">
            <h2 className="dashboard-title">Quản lý Biểu mẫu</h2>
            <div className="admin-header">
                <button className="admin-btn" onClick={handleCreateNew}>
                    + Thêm biểu mẫu mới
                </button>
                <input className="admin-search" type="text" placeholder="Tìm kiếm..." />
            </div>
            <div className="admin-table-container">
                {loading ? (
                    <div className="loading-spinner">Đang tải...</div>
                ) : (
                    <TableWithPaging
                        columns={columns}
                        data={formList}
                        page={page}
                        pageSize={10}
                        onPageChange={setPage}
                        renderActions={(row) => (
                            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                                <button
                                    className="admin-action-btn admin-action-view"
                                    title="Xem chi tiết"
                                    onClick={() => handleViewDetail(row)}
                                    style={{ background: "none", border: "none", padding: 0 }}
                                >
                                    <FaEye style={iconStyle.view} size={18} />
                                </button>
                                <button
                                    className="admin-action-btn admin-action-edit"
                                    title="Sửa"
                                    onClick={() => handleEdit(row)}
                                    style={{ background: "none", border: "none", padding: 0 }}
                                >
                                    <FaEdit style={iconStyle.edit} size={18} />
                                </button>
                                <button
                                    className="admin-action-btn admin-action-delete"
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

            {/* View Dialog */}
            {viewForm && (
                <FormViewDialog
                    form={viewForm}
                    onClose={() => setViewForm(null)}
                />
            )}

            {/* Edit Dialog */}
            {editForm && (
                <FormEditDialog
                    form={editForm}
                    onClose={() => setEditForm(null)}
                    onSuccess={refreshFormList}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={deleteTarget !== null}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                title="Xác nhận xóa"
                message={`Bạn có chắc chắn muốn xóa biểu mẫu "${deleteTarget?.title}"?`}
                confirmText="Xóa"
                cancelText="Hủy"
                type="danger"
            />
        </div>
    );
};

export default FormDashboard;