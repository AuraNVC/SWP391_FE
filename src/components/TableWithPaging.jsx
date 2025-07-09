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
}) {
  const totalPages = Math.ceil(data.length / pageSize);
  const currentPage = page;
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pageData = data.slice(startIdx, endIdx);

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    onPageChange(newPage);
  };

  useEffect(() => {
    if (page > totalPages) {
      onPageChange(totalPages);
    }
  }, [data, page, totalPages, onPageChange]);

  return (
    <div className="table-container-with-paging">
      <table className="table table-striped">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key || col.dataIndex}>{col.title}</th>
            ))}
            {renderActions && <th>Hành động</th>}
          </tr>
        </thead>
        <tbody>
          {pageData.map((row, idx) => (
            <tr key={row.id || row.studentId || idx}>
              {columns.map((col) => (
                <td key={col.key || col.dataIndex}>
                  {col.render
                    ? col.render(row[col.dataIndex], row, idx)
                    : row[col.dataIndex]}
                </td>
              ))}
              {renderActions && <td>{renderActions(row, idx)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Bootstrap Pagination with ellipsis */}
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
    </div>
  );
}