import React, { useEffect, useState } from "react";
import "../styles/Manager.css";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import TableWithPaging from "../components/TableWithPaging";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";

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
    const { setNotif } = useNotification();

    const handleViewDetail = (row) => {
        window.location.href = `/manager/form/${row.formId}`;
    };

    const handleEdit = (row) => {
        window.location.href = `/manager/form/edit/${row.formId}`;
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
                    message: "Xóa form thành công!",
                    type: "success",
                });
            } catch (error) {
                setNotif({
                    message: `Xóa form thất bại! ${error.message}`,
                    type: "error",
                });
                setDeleteTarget(null);
            }
        }
    };

    const cancelDelete = () => {
        setDeleteTarget(null);
    };

    useEffect(() => {
        const fetchFormList = async () => {
            setLoading(true);
            try {
                const response = await API_SERVICE.formAPI.getAll({ keyword: "" });
                setFormList(response);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching form list:", error);
                setLoading(false);
            }
        };
        fetchFormList();
    }, []);

    return (
        <div className="admin-main">
            <div className="admin-header">
                <button className="admin-btn">
                    <a href="/manager/form/create" style={{ textDecoration: "none" }}>+ Create New Form</a>
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
            {/* Dialog xác nhận xóa */}
            {deleteTarget && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            background: "#fff",
                            padding: 32,
                            borderRadius: 8,
                            minWidth: 320,
                            boxShadow: "0 2px 8px #888",
                            textAlign: "center",
                        }}
                    >
                        <div style={{ marginBottom: 20 }}>
                            <strong>Bạn có chắc chắn muốn xóa form "{deleteTarget.title}"?</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
                            <button className="admin-btn" style={{ background: "#dc3545" }} onClick={confirmDelete}>
                                Xóa
                            </button>
                            <button className="admin-btn" style={{ background: "#6c757d" }} onClick={cancelDelete}>
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FormDashboard;