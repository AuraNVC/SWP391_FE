import React, { useEffect, useState } from "react";
import "../styles/StudentDashboard.css";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { API_SERVICE } from "../services/api";
import TableWithPaging from "../components/TableWithPaging";
import { useNotification } from "../contexts/NotificationContext";
import StudentViewDialog from "../components/StudentViewDialog";
import StudentEditDialog from "../components/StudentEditDialog";
import { useNavigate } from "react-router-dom";

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
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const { setNotif } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentList = async () => {
      setLoading(true);
      try {
        const response = await API_SERVICE.studentAPI.getAll({ keyword: "" });
        setStudentList(response);
      } catch (error) {
        console.error("Error fetching student list:", error);
      }
      setLoading(false);
    };
    fetchStudentList();
  }, []);

  const handleViewDetail = (row) => {
    setViewStudent(row);
  };

  const handleEdit = (row) => {
    setEditStudent(row);
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
          message: `Xóa student thất bại! ${error.message}`,
          type: "error",
        });
        setDeleteTarget(null);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const reloadStudentList = async () => {
    setLoading(true);
    try {
      const response = await API_SERVICE.studentAPI.getAll({ keyword: "" });
      setStudentList(response);
    } catch (error) {
      console.error("Error fetching student list:", error);
    }
    setLoading(false);
  };

  const handleCreateNew = () => {
    navigate('/manager/student/create');
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <button className="admin-btn" onClick={handleCreateNew}>
          + Create New Student
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
        <div className="student-delete-modal-overlay">
          <div className="student-delete-modal-content">
            <div className="student-delete-modal-title">
              <strong>Bạn có chắc chắn muốn xóa student "{deleteTarget.fullName}"?</strong>
            </div>
            <div className="student-delete-modal-actions">
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
      
      {/* Dialog xem chi tiết student */}
      {viewStudent && (
        <StudentViewDialog
          student={viewStudent}
          onClose={() => setViewStudent(null)}
        />
      )}
      
      {/* Dialog chỉnh sửa student */}
      {editStudent && (
        <StudentEditDialog
          student={editStudent}
          onClose={() => setEditStudent(null)}
          onSuccess={reloadStudentList}
        />
      )}
    </div>
  );
};

export default StudentList;