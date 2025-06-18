import React, { useEffect, useState } from "react";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { API_SERVICE } from "../services/api";

const columns = [
  { title: "ID", dataIndex: "blogId" },
  { title: "Title", dataIndex: "title" },
  { title: "Content", dataIndex: "content" },
  { title: "Date Posted", dataIndex: "datePosted" },
  {
    title: "Thumbnail",
    dataIndex: "thumbnail",
    render: (thumbnail) =>
      thumbnail ? (
        <img
          src={`https://localhost:7024/files/blogs//${thumbnail}`}
          alt="thumbnail"
          style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 4 }}
        />
      ) : (
        ""
      ),
  },
];

const iconStyle = {
  view: { color: "#007bff" },
  edit: { color: "#28a745" },
  delete: { color: "#dc3545" },
};

const BlogList = () => {
  const [blogList, setBlogList] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParentList = async () => {
      setLoading(true);
      try {
        const response = await API_SERVICE.blogAPI.getAll({ keyword: "" });
        setBlogList(response);
      } catch (error) {
        console.error("Error fetching student list:", error);
      }
      setLoading(false);
    };
    fetchParentList();
  }, []);

  const handleViewDetail = (row) => {
    alert(`View detail for blog: ${row.title}`);
  };

  const handleEdit = (row) => {
    alert(`Edit blog: ${row.title}`);
  };

  const handleDelete = (row) => {
    if (window.confirm(`Delete blog: ${row.title}?`)) {
      // Thực hiện xóa
    }
  };

  return (
    <div className="admin-main">
      <div className="admin-header">
        <button className="admin-btn">+ Create New Blog</button>
        <input className="admin-search" type="text" placeholder="Search..." />
      </div>
      <div className="admin-table-container">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <TableWithPaging
            columns={columns}
            data={blogList}
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

export default BlogList;