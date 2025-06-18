import React, { useEffect, useState } from "react";
import "../styles/Manager.css";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { API_SERVICE } from "../services/api";
import TableWithPaging from "../components/TableWithPaging";

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

  return (
    <div className="admin-main">
      <div className="admin-header">
        <button className="admin-btn"><a href="/manager/student/create" style={{ textDecoration: "none" }}>+ Create New Staff</a></button>
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
    </div>
  );
};

const handleViewDetail = (row) => {
  alert(`View detail for student: ${row.fullName}`);
};

const handleEdit = (row) => {
  alert(`Edit student: ${row.fullName}`);
};

const handleDelete = (row) => {
  if (window.confirm(`Delete student: ${row.fullName}?`)) {
    // Thực hiện xóa
  }
};

export default StudentList;