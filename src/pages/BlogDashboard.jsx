import React, { useEffect, useState } from "react";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";

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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { setNotif } = useNotification();

  useEffect(() => {
    const fetchBlogList = async () => {
      setLoading(true);
      try {
        const response = await API_SERVICE.blogAPI.getAll({ keyword: "" });
        setBlogList(response);
      } catch (error) {
        console.error("Error fetching blog list:", error);
      }
      setLoading(false);
    };
    fetchBlogList();
  }, []);

  const handleViewDetail = (row) => {
    alert(`View detail for blog: ${row.title}`);
  };

  const handleEdit = (row) => {
    alert(`Edit blog: ${row.title}`);
  };

  const handleDelete = (row) => {
    setDeleteTarget(row);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        await API_SERVICE.blogAPI.delete(deleteTarget.blogId);
        setBlogList((prev) => prev.filter((b) => b.blogId !== deleteTarget.blogId));
        setDeleteTarget(null);
        setNotif({
          message: "Xóa blog thành công!",
          type: "success",
        });
      } catch (error) {
        setNotif({
          message: `Xóa blog thất bại! ${error.message}`,
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
              <strong>Bạn có chắc chắn muốn xóa blog "{deleteTarget.title}"?</strong>
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

export default BlogList;