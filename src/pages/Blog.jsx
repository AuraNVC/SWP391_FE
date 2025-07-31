// Import các thư viện cần thiết
import React, { useState, useEffect } from "react"; // React core và các hooks cần thiết
import BlogCard from "../components/Card"; // Component hiển thị card blog
import { API_SERVICE } from "../services/api"; // Service để gọi API

// ===== CÁC HẰNG SỐ VÀ CẤU HÌNH =====

// Số bài viết hiển thị trên mỗi trang
const PAGE_SIZE = 6;

// ===== MAPPING CATEGORY =====

// Mapping giữa category enum và label tiếng Việt
const categoryMap = {
    "": "Chọn chủ đề", // Option mặc định
    Nutrition: "Dinh dưỡng", // Category dinh dưỡng
    Psychology: "Tâm lý", // Category tâm lý
    InfectiousDiseases: "Bệnh truyền nhiễm", // Category bệnh truyền nhiễm
    Physical: "Thể chất" // Category thể chất
};

// Chuyển đổi categoryMap thành array để render trong select
const categories = Object.entries(categoryMap).map(([value, label]) => ({ value, label }));

// ===== HÀM TIỆN ÍCH =====

// Hàm lấy label tiếng Việt cho category enum
function getCategoryLabel(enumValue) {
    return categoryMap[enumValue] || enumValue; // Trả về label nếu có, không thì trả về enumValue
}

// ===== CẤU HÌNH SẮP XẾP =====

// Danh sách các option sắp xếp
const sorts = [
    { value: "", label: "Sắp xếp theo" }, // Option mặc định
    { value: "newest", label: "Mới nhất" }, // Sắp xếp theo ngày mới nhất
    { value: "oldest", label: "Cũ nhất" }, // Sắp xếp theo ngày cũ nhất
    { value: "popular", label: "Phổ biến" }, // Sắp xếp theo độ phổ biến
];

// ===== COMPONENT CHÍNH =====

export default function Blog() {
    // ===== CÁC STATE CHÍNH =====
    
    // State lưu từ khóa tìm kiếm
    const [search, setSearch] = useState("");
    
    // State lưu category được chọn để lọc
    const [category, setCategory] = useState("");
    
    // State lưu kiểu sắp xếp được chọn
    const [sort, setSort] = useState("");
    
    // State lưu danh sách blog từ API
    const [blogPosts, setBlogPosts] = useState([]);
    
    // State quản lý trạng thái loading (true = đang tải, false = hoàn thành)
    const [loading, setLoading] = useState(true);
    
    // State lưu thông báo lỗi (null = không có lỗi, string = message lỗi)
    const [error, setError] = useState(null);
    
    // State lưu trang hiện tại (bắt đầu từ 1)
    const [page, setPage] = useState(1);
    
    // Số bài viết trên mỗi trang
    const pageSize = PAGE_SIZE;

    // ===== USEEFFECT ĐỂ FETCH BLOG DỮ LIỆU =====
    
    useEffect(() => {
        // Hàm async để fetch tất cả blog từ API
        const fetchBlogs = async () => {
            setLoading(true); // Bật trạng thái loading
            setError(null); // Reset lỗi
            
            try {
                // Gọi API lấy tất cả blog
                const response = await API_SERVICE.blogAPI.getAll({ keyword: "" });
                setBlogPosts(response); // Cập nhật state với dữ liệu từ API
            } catch (err) {
                // Xử lý lỗi khi fetch blog
                console.error("Error fetching blogs:", err);
                setError("Không thể tải danh sách bài viết. Vui lòng thử lại sau.");
            } finally {
                setLoading(false); // Tắt trạng thái loading
            }
        };

        // Gọi hàm fetch khi component mount
        fetchBlogs();
    }, []); // Dependency array rỗng - chỉ chạy 1 lần khi mount

    // ===== LỌC BÀI VIẾT =====
    
    // Lọc bài viết theo search và category, đồng thời loại bỏ các blog category Home
    let filteredPosts = blogPosts.filter(
        (post) =>
            // Loại bỏ blog có category là "Home" hoặc 5
            ((post.category !== "Home" && post.category !== 5 && !(typeof post.category === "string" && post.category.toLowerCase() === "home"))) &&
            // Lọc theo category (nếu có chọn)
            (category === "" || post.category === category) &&
            // Lọc theo từ khóa tìm kiếm (nếu có nhập)
            (search === "" ||
                post.title.toLowerCase().includes(search.toLowerCase()) ||
                post.content.toLowerCase().includes(search.toLowerCase()))
    );

    // ===== SẮP XẾP BÀI VIẾT =====
    
    // Sắp xếp bài viết theo thứ tự được chọn
    if (sort === "newest") {
        // Sắp xếp theo ngày mới nhất trước
        filteredPosts = filteredPosts.sort((a, b) => {
            const dateA = new Date(a.datePosted);
            const dateB = new Date(b.datePosted);
            return dateB - dateA; // Mới nhất trước
        });
    } else if (sort === "oldest") {
        // Sắp xếp theo ngày cũ nhất trước
        filteredPosts = filteredPosts.sort((a, b) => {
            const dateA = new Date(a.datePosted);
            const dateB = new Date(b.datePosted);
            return dateA - dateB; // Cũ nhất trước
        });
    }
    // Nếu sort === "popular" hoặc rỗng thì không sắp xếp

    // ===== TRANSFORM DỮ LIỆU CHO BLOGCARD =====
    
    // Chuyển đổi dữ liệu API thành format phù hợp cho BlogCard component
    const transformedPosts = filteredPosts.map(post => ({
        id: post.blogId, // ID blog
        title: post.title, // Tiêu đề blog
        category: getCategoryLabel(post.category), // Category đã được dịch sang tiếng Việt
        date: post.datePosted ? new Date(post.datePosted).toLocaleDateString('vi-VN') : "N/A", // Ngày đăng (format Việt Nam)
        image: post.thumbnail ? `https://localhost:7024/files/blogs/${post.thumbnail}` : null, // URL ảnh thumbnail
        excerpt: post.content ? (post.content.length > 150 ? post.content.substring(0, 150) + "..." : post.content) : "Không có nội dung", // Trích đoạn nội dung (cắt ngắn nếu quá 150 ký tự)
        link: `/blog/${post.blogId}`, // Link đến trang chi tiết blog
        tag: post.category?.toLowerCase().replace(/\s+/g, '-'), // Tag cho styling
    }));

    // ===== PHÂN TRANG =====
    
    // Tính tổng số trang
    const totalPages = Math.ceil(transformedPosts.length / pageSize);
    
    // Lấy dữ liệu cho trang hiện tại
    const pagedPosts = transformedPosts.slice((page - 1) * pageSize, page * pageSize);

    // ===== RENDER LOADING STATE =====
    
    // Hiển thị loading spinner nếu đang tải
    if (loading) {
        return (
            <div className="bg-light min-vh-100">
                <main className="container py-5">
                    <div className="text-center mb-5">
                        <h1 className="display-5 fw-bold mb-3">Blog Sức Khỏe Học Đường</h1>
                        <p className="text-muted">Chia sẻ kiến thức và kinh nghiệm về chăm sóc sức khỏe học đường</p>
                    </div>
                    <div className="d-flex justify-content-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // ===== RENDER ERROR STATE =====
    
    // Hiển thị lỗi nếu có
    if (error) {
        return (
            <div className="bg-light min-vh-100">
                <main className="container py-5">
                    <div className="text-center mb-5">
                        <h1 className="display-5 fw-bold mb-3">Blog Sức Khỏe Học Đường</h1>
                        <p className="text-muted">Chia sẻ kiến thức và kinh nghiệm về chăm sóc sức khỏe học đường</p>
                    </div>
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                </main>
            </div>
        );
    }

    // ===== RENDER UI CHÍNH =====
    
    return (
        <div className="bg-light min-vh-100">
            <main className="container py-5">
                
                {/* ===== HEADER SECTION ===== */}
                
                <div className="text-center mb-5">
                    <h1 className="display-5 fw-bold mb-3">Blog Sức Khỏe Học Đường</h1>
                    <p className="text-muted">Chia sẻ kiến thức và kinh nghiệm về chăm sóc sức khỏe học đường</p>
                </div>

                {/* ===== CONTROLS SECTION - TÌM KIẾM VÀ LỌC ===== */}
                
                <div className="mb-4">
                    <div className="row g-3">
                        
                        {/* ===== SEARCH INPUT ===== */}
                        
                        <div className="col-12 col-md-6">
                            <input
                                type="text"
                                placeholder="Tìm kiếm bài viết..."
                                className="form-control"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        
                        {/* ===== CATEGORY DROPDOWN ===== */}
                        
                        <div className="col-6 col-md-3">
                            <select
                                className="form-select"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {categories.map((c) => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* ===== SORT DROPDOWN ===== */}
                        
                        <div className="col-6 col-md-3">
                            <select
                                className="form-select"
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                            >
                                {sorts.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* ===== DANH SÁCH BÀI VIẾT ===== */}
                
                <div className="row">
                    {/* Kiểm tra có bài viết nào không */}
                    {pagedPosts.length === 0 ? (
                        // Hiển thị thông báo nếu không có bài viết
                        <div className="col-12">
                            <div className="alert alert-info text-center">
                                Không tìm thấy bài viết nào phù hợp.
                            </div>
                        </div>
                    ) : (
                        // Render danh sách bài viết
                        pagedPosts.map((post) => (
                            <div className="col-12 col-md-6 col-lg-4 mb-4" key={post.id}>
                                <BlogCard post={post} />
                            </div>
                        ))
                    )}
                </div>

                {/* ===== PHÂN TRANG ===== */}
                
                {/* Hiển thị phân trang nếu có nhiều hơn 1 trang */}
                {totalPages > 1 && (
                    <nav className="d-flex justify-content-center mt-5">
                        <ul className="pagination">
                            
                            {/* ===== BUTTON TRƯỚC ===== */}
                            
                            <li className={`page-item${page === 1 ? " disabled" : ""}`}>
                                <button 
                                    className="page-link" 
                                    onClick={() => setPage(page - 1)} 
                                    disabled={page === 1}
                                >
                                    Trước
                                </button>
                            </li>
                            
                            {/* ===== CÁC SỐ TRANG ===== */}
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                                <li key={num} className={`page-item${page === num ? " active" : ""}`}>
                                    <button className="page-link" onClick={() => setPage(num)}>
                                        {num}
                                    </button>
                                </li>
                            ))}
                            
                            {/* ===== BUTTON SAU ===== */}
                            
                            <li className={`page-item${page === totalPages ? " disabled" : ""}`}>
                                <button 
                                    className="page-link" 
                                    onClick={() => setPage(page + 1)} 
                                    disabled={page === totalPages}
                                >
                                    Sau
                                </button>
                            </li>
                        </ul>
                    </nav>
                )}
            </main>
        </div>
    );
}