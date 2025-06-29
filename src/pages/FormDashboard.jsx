import React, { useEffect, useState } from "react";
import "../styles/Manager.css";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import TableWithPaging from "../components/TableWithPaging";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import FormViewDialog from "../components/FormViewDialog";
import FormEditDialog from "../components/FormEditDialog";

const columns = [
    { title: "ID", dataIndex: "formId" },
    { title: "Title", dataIndex: "title" },
    { title: "Class", dataIndex: "className" },
    { title: "Type", dataIndex: "type" },
    { title: "Sent Date", dataIndex: "sentDate" },
    { title: "Created At", dataIndex: "createdAt" },
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
                    message: "Form deleted successfully!",
                    type: "success",
                });
            } catch (error) {
                setNotif({
                    message: `Failed to delete form. ${error?.response?.data?.message || error.message}`,
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
                message: "Failed to refresh form list",
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
            <div className="admin-header">
                <button className="admin-btn" onClick={handleCreateNew}>
                    + Create New Form
                </button>
                <input className="admin-search" type="text" placeholder="Search..." />
            </div>
            <div className="admin-table-container">
                {loading ? (
                    <div>Loading...</div>
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
                                    title="View Detail"
                                    onClick={() => handleViewDetail(row)}
                                    style={{ background: "none", border: "none", padding: 0 }}
                                >
                                    <FaEye style={iconStyle.view} size={18} />
                                </button>
                                <button
                                    className="admin-action-btn admin-action-edit"
                                    title="Edit"
                                    onClick={() => handleEdit(row)}
                                    style={{ background: "none", border: "none", padding: 0 }}
                                >
                                    <FaEdit style={iconStyle.edit} size={18} />
                                </button>
                                <button
                                    className="admin-action-btn admin-action-delete"
                                    title="Delete"
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
            {deleteTarget && (
                <div className="form-delete-modal-overlay">
                    <div className="form-delete-modal-content">
                        <div className="form-delete-modal-title">
                            <strong>Are you sure you want to delete form "{deleteTarget.title}"?</strong>
                        </div>
                        <div className="form-delete-modal-actions">
                            <button className="admin-btn btn-danger" onClick={confirmDelete}>
                                Delete
                            </button>
                            <button className="admin-btn btn-secondary" onClick={cancelDelete}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FormDashboard;