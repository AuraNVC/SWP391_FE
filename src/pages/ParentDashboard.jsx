import React, { useEffect, useState } from "react";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { API_SERVICE } from "../services/api";
// import { API_SERVICE } from "../services/api"; // Nếu có API, bạn có thể bật dòng này

const columns = [
  { title: "Name", dataIndex: "fullName" },
  { title: "Contact email", dataIndex: "email" },
  { title: "Phone Number", dataIndex: "phoneNumber" },
  { title: "Address", dataIndex: "address" }
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

  useEffect(() => {
    const fetchParentList = async () => {
      setLoading(true);
      try {
        const response = await API_SERVICE.parentAPI.getAll({ keyword: "" });
        setParentList(response);
      } catch (error) {
        console.error("Error fetching student list:", error);
      }
      setLoading(false);
    };
    fetchParentList();
  }, []);

  return (
    <div className="admin-main">
      <div className="admin-header">
        <button className="admin-btn">+ Create New Parent</button>
        <input className="admin-search" type="text" placeholder="Search..." />
      </div>
      <div className="admin-table-container">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <TableWithPaging
            columns={columns}
            data={parentList}
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
    </div>
  );
};

const handleViewDetail = (row) => {
  alert(`View detail for parent: ${row.name}`);
};

const handleEdit = (row) => {
  alert(`Edit parent: ${row.name}`);
};

const handleDelete = (row) => {
  if (window.confirm(`Delete parent: ${row.name}?`)) {
    // Thực hiện xóa
  }
};

export default ParentList;