import React, { useEffect, useState } from "react";
import "../styles/Manager.css";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { API_SERVICE } from "../services/api";
import TableWithPaging from "../components/TableWithPaging";
import { useNotification } from "../contexts/NotificationContext";

const columns = [
  { title: "ID", dataIndex: "studentId" },
  { title: "Name", dataIndex: "fullName" },
  { title: "Gender", dataIndex: "gender" },
  { title: "Class", dataIndex: "className" },
  { title: "Student number", dataIndex: "studentNumber" },
  {
    title: "Parent",
    dataIndex: "parent",
    render: (parent) => parent?.fullName || "",
  },
  { title: "Date of birth", dataIndex: "dateOfBirth" },
];

const iconStyle = {
  view: { color: "#007bff" }, // xanh dương
  edit: { color: "#28a745" }, // xanh lá
  delete: { color: "#dc3545" }, // đỏ
};

const StudentList = () => {
  const [studentList, setStudentList] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true); // Thêm loading
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { setNotif } = useNotification();

  useEffect(() => {
    const fetchStudentList = async () => {
      setLoading(true);
      try {
        const response = await API_SERVICE.studentAPI.getAll({ keyword: " " });
        setStudentList(response);
      } catch (error) {
        console.error("Error fetching student list:", error);
      }
      setLoading(false);
    };
    fetchStudentList();
  }, []);

  const handleViewDetail = (row) => {
    alert(`View detail for student: ${row.fullName}`);
  };

  const handleEdit = (row) => {
    alert(`Edit student: ${row.fullName}`);
  };

  const handleDelete = (row) => {
    setDeleteTarget(row);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        await API_SERVICE.studentAPI.delete(deleteTarget.studentId);
        setStudentList((prev) => prev.filter(s => s.studentId !== deleteTarget.studentId));
        setDeleteTarget(null);
        setNotif({
          message: "Xóa student thành công!",
          type: "success",
        });
      } catch (error) {
        setNotif({
          message: "Xóa student thất bại!",
          type: "error",
        });
        setDeleteTarget(null);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <button className="admin-btn">
          <a href="/manager/student/create" style={{ textDecoration: "none" }}>
            + Create New Staff
          </a>
        </button>
        <input className="admin-search" type="text" placeholder="Search..." />
      </div>
      <div className="admin-table-container">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <TableWithPaging
            columns={columns}
            data={studentList}
            page={page}
            pageSize={10}
            onPageChange={setPage}
            renderActions={(row) => (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <button
                  className="admin-action-btn admin-action-view"
                  title="View Detail"
                  onClick={() => handleViewDetail(row)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                >
                  <FaEye style={iconStyle.view} size={18} />
                </button>
                <button
                  className="admin-action-btn admin-action-edit"
                  title="Edit"
                  onClick={() => handleEdit(row)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                >
                  <FaEdit style={iconStyle.edit} size={18} />
                </button>
                <button
                  className="admin-action-btn admin-action-delete"
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
              <strong>Bạn có chắc chắn muốn xóa student "{deleteTarget.fullName}"?</strong>
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

export default StudentList;