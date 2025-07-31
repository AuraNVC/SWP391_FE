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
  // Calculate pagination values
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, data.length);
  
  // Get data for current page
  const pageData = data.slice(startIdx, endIdx);

  // Generate page numbers for pagination
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const handlePageChange = (newPage) => {
    // Simple validation
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    
    // Call the onPageChange callback
    onPageChange(newPage);
  };

  // Ensure page is valid when data changes
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      onPageChange(totalPages);
    }
  }, [data, page, totalPages, onPageChange]);

  return (
    <div className="table-container-with-paging">
      <table className="table table-striped">
        <thead>
          <tr>
              <th key="header-stt" style={{ width: '50px' }}>STT</th>
            {columns.map((col, colIdx) => (
              <th 
                key={`header-${col.key || col.dataIndex || colIdx}-${colIdx}`}
                style={col.width ? { width: `${col.width}px` } : {}}
              >
                {col.title}
              </th>
            ))}
            {renderActions && <th key="header-actions-column" style={{ width: '30px' }}>Hành động</th>}
          </tr>
        </thead>
        <tbody>
          {pageData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (renderActions ? 1 : 0)} className="text-center">
                {loading ? "Đang tải dữ liệu..." : "Không có dữ liệu"}
                </td>
            </tr>
          ) : (
            pageData.map((row, idx) => {
              // Create a truly unique key for each row by combining the row ID with the index
              const rowKey = `row-${row.id || row.healthCheckupRecordId || row.medicalEventId || row.studentId || row.vaccinationResultId || row.nurseId || row.parentId || row.healthProfileId || row.formId || ''}-${startIdx + idx}`;
              
              return (
                <tr key={rowKey}>
                  <td key={`stt-${rowKey}`}>{startIdx + idx + 1}</td> 
                  {columns.map((col, colIdx) => (
                    <td 
                      key={`cell-${col.key || col.dataIndex || colIdx}-${rowKey}`}
                      style={col.width ? { width: `${col.width}px` } : {}}
                    >
                      {(() => {
                        if (col.render) {
                          return col.render(row[col.dataIndex], row, idx);
                        } else {
                          return row[col.dataIndex];
                        }
                      })()}
                    </td>
                  ))}
                  {renderActions && <td key={`actions-${rowKey}`} style={{ width: '30px' }}>{renderActions(row, idx)}</td>}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      
      {/* Bootstrap Pagination with ellipsis */}
      {totalPages > 1 && (
      <nav>
        <ul className="pagination justify-content-center">
            <li className={`page-item${currentPage === 1 ? " disabled" : ""}`} key="prev-button">
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
              <li key={`ellipsis-${idx}-pagination`} className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            ) : (
              <li
                  key={`page-${num}-${idx}-pagination`}
                className={`page-item${
                  currentPage === num ? " active" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(num)}
                    disabled={loading || currentPage === num}
                >
                  {num}
                </button>
              </li>
            )
          )}
            <li className={`page-item${currentPage === totalPages ? " disabled" : ""}`} key="next-button">
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