// Import các thư viện cần thiết
import React, { useEffect, useState } from "react"; // React core và các hooks cần thiết
import { Link } from "react-router-dom"; // Component để tạo link navigation
import HighlightSwiper from "../components/HighlightSwiper"; // Component slider hiển thị blog nổi bật
import { API_SERVICE } from "../services/api"; // Service để gọi API

// Component chính cho trang Home - hiển thị blog và thông tin sức khỏe
const Home = () => {
    // ===== CÁC STATE CHÍNH =====
    
    // State lưu danh sách blog nổi bật (cho slider)
    const [highlightBlogs, setHighlightBlogs] = useState([]);
    
    // State lưu tất cả blog từ API
    const [allBlogs, setAllBlogs] = useState([]);
    
    // State lưu vai trò user từ localStorage (không thay đổi)
    const [userRole] = useState(localStorage.getItem("userRole"));

    // ===== USEEFFECT ĐỂ FETCH BLOG DỮ LIỆU =====
    
    useEffect(() => {
        // Hàm async để fetch tất cả blog từ API
        async function fetchBlogs() {
            try {
                // Gọi API lấy tất cả blog
                const response = await API_SERVICE.blogAPI.getAll({ keyword: "" });
                console.log("All blogs from API:", response);
                setAllBlogs(response);
                
                // ===== LỌC BLOG CHO SLIDER (CATEGORY HOME) =====
                
                // Lọc blog có category là "Home" hoặc category = 5
                const homeBlogs = response.filter(
                    (post) =>
                        post.category === "Home" ||
                        (typeof post.category === "string" && post.category.toLowerCase() === "home") ||
                        post.category === 5
                );
                
                // ===== MAPPING DỮ LIỆU CHO HIGHLIGHTSWIPER =====
                
                // Chuyển đổi blog thành format phù hợp cho HighlightSwiper
                const highlightItems = homeBlogs.map(blog => ({
                    title: blog.title, // Tiêu đề blog
                    desc: blog.content ? (blog.content.length > 120 ? blog.content.substring(0, 120) + "..." : blog.content) : "Không có mô tả", // Mô tả (cắt ngắn nếu quá 120 ký tự)
                    image: blog.thumbnail ? `https://localhost:7024/files/blogs/${blog.thumbnail}` : "/images/default.jpg", // URL ảnh thumbnail
                    link: `/blog/${blog.blogId}` // Link đến trang chi tiết blog
                }));
                
                // Cập nhật state highlightBlogs
                setHighlightBlogs(highlightItems);
            } catch (e) {
                // Xử lý lỗi khi fetch blog
                console.error("Error fetching blogs:", e);
                setHighlightBlogs([]);
                setAllBlogs([]);
            }
        }
        
        // Gọi hàm fetch khi component mount hoặc userRole thay đổi
        fetchBlogs();
    }, [userRole]);

    // ===== MAPPING CHO PHẦN BÀI VIẾT MỚI NHẤT =====
    
    // Lọc và sắp xếp 9 blog mới nhất (loại bỏ category Home)
    const latestBlogs = allBlogs
        .filter(blog =>
            // Loại bỏ blog có category là "Home" hoặc 5
            blog.category !== "Home" &&
            blog.category !== 5 &&
            !(typeof blog.category === "string" && blog.category.toLowerCase() === "home")
        )
        .sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted)) // Sắp xếp theo ngày đăng (mới nhất trước)
        .slice(0, 9) // Lấy 9 blog đầu tiên
        .map(blog => ({
            title: blog.title, // Tiêu đề blog
            desc: blog.content ? (blog.content.length > 120 ? blog.content.substring(0, 120) + "..." : blog.content) : "Không có mô tả", // Mô tả (cắt ngắn)
            image: blog.thumbnail ? `https://localhost:7024/files/blogs/${blog.thumbnail}` : "/images/default.jpg", // URL ảnh
            link: `/blog/${blog.blogId}` // Link chi tiết
        }));

    // ===== MAPPING CHO PHẦN TÀI LIỆU SỨC KHỎE =====
    
    // Lọc blog có category là 6 hoặc "HealthBenefits" (tài liệu sức khỏe)
    const healthBlogs = allBlogs
        .filter(blog => {
            console.log("Blog:", blog.title, "Category:", blog.category, "Type:", typeof blog.category);
            return blog.category === 6 || blog.category === "6" || blog.category === "HealthBenefits";
        })
        .sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted)) // Sắp xếp theo ngày đăng
        .slice(0, 3) // Lấy 3 blog đầu tiên
        .map(blog => ({
            title: blog.title, // Tiêu đề blog
            desc: blog.content ? (blog.content.length > 120 ? blog.content.substring(0, 120) + "..." : blog.content) : "Không có mô tả", // Mô tả (cắt ngắn)
            image: blog.thumbnail ? `https://localhost:7024/files/blogs/${blog.thumbnail}` : "/images/default.jpg", // URL ảnh
            link: `/blog/${blog.blogId}` // Link chi tiết
        }));

    // Log số lượng blog sức khỏe tìm thấy
    console.log("Health blogs found:", healthBlogs.length);

    // ===== RENDER UI CHÍNH =====
    
    return (
        <main className="container-fluid py-5 px-10">
            
            {/* ===== SWIPER GIỚI THIỆU CÁC CHƯƠNG TRÌNH NỔI BẬT ===== */}
            
            {/* Component slider hiển thị blog nổi bật (category Home) */}
            <HighlightSwiper items={highlightBlogs} title="Chương Trình Y Tế Đáng Chú Ý" />

            <div style={{ margin: "0 auto", padding: "0 10rem" }}>
                
                {/* ===== PHẦN BÀI VIẾT MỚI NHẤT ===== */}
                
                <section className="mb-5">
                    <h2 className="text-center fw-bold mb-4 fs-2">Bài Viết Mới Nhất</h2>
                    <div className="row g-4">
                        {/* Render danh sách 9 blog mới nhất */}
                        {latestBlogs.map((blog, idx) => (
                            <div className="col-12 col-md-6 col-lg-4" key={idx}>
                                <div className="bg-white rounded shadow h-100">
                                    <div className="p-4">
                                        {/* Tiêu đề blog */}
                                        <h3 className="fs-5 fw-semibold mb-2">{blog.title}</h3>
                                        {/* Mô tả blog */}
                                        <p className="text-secondary mb-3">{blog.desc}</p>
                                        {/* Link đọc thêm */}
                                        <Link to={blog.link} className="text-info text-decoration-none">Đọc thêm &rarr;</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ===== PHẦN TÀI LIỆU SỨC KHỎE ===== */}
                
                <section className="mb-5">
                    <h2 className="text-center fw-bold mb-4 fs-2">Tài Liệu Sức Khỏe</h2>
                    <div className="row g-4">
                        {/* Kiểm tra có blog sức khỏe không */}
                        {healthBlogs.length > 0 ? (
                            // Render danh sách blog sức khỏe
                            healthBlogs.map((blog, idx) => (
                                <div className="col-12 col-md-6 col-lg-4" key={idx}>
                                    <div className="bg-white rounded shadow h-100">
                                        <div className="p-4">
                                            {/* Tiêu đề blog */}
                                            <h3 className="fs-5 fw-semibold mb-2">{blog.title}</h3>
                                            {/* Mô tả blog */}
                                            <p className="text-secondary mb-3">{blog.desc}</p>
                                            {/* Link đọc thêm */}
                                            <Link to={blog.link} className="text-info text-decoration-none">Đọc thêm &rarr;</Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Hiển thị thông báo nếu không có blog sức khỏe
                            <div className="col-12 text-center">
                                <p className="text-muted">Chưa có tài liệu sức khỏe nào.</p>
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </main>
    );
};

export default Home;