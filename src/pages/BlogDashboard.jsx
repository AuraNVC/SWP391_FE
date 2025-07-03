import React, { useEffect, useState } from "react";
import TableWithPaging from "../components/TableWithPaging";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { API_SERVICE } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import BlogViewDialog from "../components/BlogViewDialog";
import BlogEditDialog from "../components/BlogEditDialog";
import { useNavigate } from "react-router-dom";

const columns = [
  { title: "Mã Blog", dataIndex: "blogId" },
  { title: "Tiêu đề", dataIndex: "title" },
  { title: "Chủ đề", dataIndex: "category" },
  { title: "Nội dung", dataIndex: "content", width: 180, render: (text) => <div style={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div> },
  { title: "Ngày đăng", dataIndex: "datePosted" },
  {
    title: "Ảnh thumbnail",
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
  const [viewBlog, setViewBlog] = useState(null);
  const [editBlog, setEditBlog] = useState(null);
  const { setNotif } = useNotification();
  const navigate = useNavigate();

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
    setViewBlog(row);
  };

  const handleEdit = (row) => {
    setEditBlog(row);
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

  const reloadBlogList = async () => {
    setLoading(true);
    try {
      const response = await API_SERVICE.blogAPI.getAll({ keyword: "" });
      setBlogList(response);
    } catch (error) {
      console.error("Error fetching blog list:", error);
    }
    setLoading(false);
  };

  const handleCreateNew = () => {
    navigate('/manager/blog/create');
  };

  return (
    <div className="admin-main">
      <h2 className="dashboard-title">Quản lý Blog</h2>
      <div className="admin-header">
        <button className="admin-btn" onClick={handleCreateNew}>
          + Thêm blog mới
        </button>
        <input className="admin-search" type="text" placeholder="Tìm kiếm..." />
      </div>
      <div className="admin-table-container">
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <TableWithPaging
            columns={columns}
            data={blogList}
            page={page}
            pageSize={10}
            onPageChange={setPage}
            renderActions={(row) => (
              <div className="admin-action-group">
                <button
                  className="admin-action-btn admin-action-view admin-action-btn-reset"
                  title="Xem chi tiết"
                  onClick={() => handleViewDetail(row)}
                >
                  <FaEye style={iconStyle.view} size={18} />
                </button>
                <button
                  className="admin-action-btn admin-action-edit admin-action-btn-reset"
                  title="Sửa"
                  onClick={() => handleEdit(row)}
                >
                  <FaEdit style={iconStyle.edit} size={18} />
                </button>
                <button
                  className="admin-action-btn admin-action-delete admin-action-btn-reset"
                  title="Xóa"
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
        <div className="blog-delete-modal-overlay">
          <div className="blog-delete-modal-content">
            <div className="blog-delete-modal-title">
              <strong>Bạn có chắc chắn muốn xóa blog "{deleteTarget.title}"?</strong>
            </div>
            <div className="blog-delete-modal-actions">
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
      
      {/* Dialog xem chi tiết blog */}
      {viewBlog && (
        <BlogViewDialog
          blog={viewBlog}
          onClose={() => setViewBlog(null)}
        />
      )}
      
      {/* Dialog chỉnh sửa blog */}
      {editBlog && (
        <BlogEditDialog
          blog={editBlog}
          onClose={() => setEditBlog(null)}
          onSuccess={reloadBlogList}
        />
      )}
    </div>
  );
};

export default BlogList;