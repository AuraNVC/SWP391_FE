import React, { useEffect } from "react";
import "../styles/TableWithPaging.css";

function getPageNumbers(current, total) {
  const delta = 2;
  let pages = [];

  // Các trang quanh current
  for (
    let i = Math.max(1, current - delta);
    i <= Math.min(total, current + delta);
    i++
  ) {
    pages.push(i);
  }

  // Thêm trang đầu nếu chưa có
  if (pages[0] > 1) {
    if (pages[0] > 2) {
      pages = [1, "...", ...pages];
    } else {
      pages = [1, ...pages];
    }
  }

  // Thêm trang cuối nếu chưa có
  if (pages[pages.length - 1] < total) {
    if (pages[pages.length - 1] < total - 1) {
      pages = [...pages, "...", total];
    } else {
      pages = [...pages, total];
    }
  }

  // Loại bỏ trùng lặp liên tiếp
  const result = [];
  for (let i = 0; i < pages.length; i++) {
    if (pages[i] !== pages[i - 1]) {
      result.push(pages[i]);
    }
  }
  return result;
}

export default function TableWithPaging({
  columns = [],
  data = [],
  pageSize = 10,
  page = 1,
  onPageChange,
  renderActions,
  loading = false,
  actionColumnTitle = "Thao tác",
  emptyMessage = "Không có dữ liệu"
}) {
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pageData = data.slice(startIdx, endIdx);

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    onPageChange(newPage);
  };

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      onPageChange(totalPages);
    }
  }, [data, page, totalPages, onPageChange]);

  return (
    <div>
      <table className="table table-striped">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key || col.dataIndex}>{col.title}</th>
            ))}
            {renderActions && <th>{actionColumnTitle}</th>}
          </tr>
        </thead>
        <tbody>
          {pageData.length > 0 ? (
            pageData.map((row, idx) => {
              // Tạo key duy nhất cho mỗi hàng
              const rowKey = 
                row.id || 
                row.consultationScheduleId || 
                row.studentId || 
                row.nurseId || 
                row.blogId || 
                row.formId || 
                row.healthCheckScheduleId || 
                `row-${idx}`;
              
              return (
                <tr key={rowKey}>
                  {columns.map((col, colIdx) => {
                    // Tạo key duy nhất cho mỗi ô
                    const cellKey = `${rowKey}-${col.key || col.dataIndex || colIdx}`;
                    
                    return (
                      <td key={cellKey}>
                        {col.render
                          ? col.render(row[col.dataIndex], row, idx)
                          : row[col.dataIndex]}
                      </td>
                    );
                  })}
                  {renderActions && <td>{renderActions(row, idx)}</td>}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={columns.length + (renderActions ? 1 : 0)} className="text-center py-3">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {/* Chỉ hiển thị phân trang khi có dữ liệu */}
      {data.length > 0 && (
        <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                Trước
              </button>
            </li>
            {pageNumbers.map((num, idx) =>
              num === "..." ? (
                <li key={`ellipsis-${idx}`} className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              ) : (
                <li
                  key={`page-${num}`}
                  className={`page-item${
                    currentPage === num ? " active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(num)}
                    disabled={loading || num === page}
                  >
                    {num}
                  </button>
                </li>
              )
            )}
            <li className={`page-item${currentPage === totalPages ? " disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                Sau
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}