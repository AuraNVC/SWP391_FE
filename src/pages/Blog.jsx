import React, { useState, useEffect } from "react";
import BlogCard from "../components/Card";
import { API_SERVICE } from "../services/api";

const PAGE_SIZE = 6; // Số bài viết mỗi trang

const categories = [
    { value: "", label: "Chọn chủ đề" },
    { value: "dinh-duong", label: "Dinh dưỡng" },
    { value: "tam-ly", label: "Tâm lý" },
    { value: "benh-truyen-nhiem", label: "Bệnh truyền nhiễm" },
    { value: "the-chat", label: "Thể chất" },
];

const sorts = [
    { value: "", label: "Sắp xếp theo" },
    { value: "newest", label: "Mới nhất" },
    { value: "oldest", label: "Cũ nhất" },
    { value: "popular", label: "Phổ biến" },
];

export default function Blog() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [sort, setSort] = useState("");
    const [blogPosts, setBlogPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const pageSize = PAGE_SIZE;

    // Fetch blogs from API
    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await API_SERVICE.blogAPI.getAll({ keyword: "" });
                setBlogPosts(response);
            } catch (err) {
                console.error("Error fetching blogs:", err);
                setError("Không thể tải danh sách bài viết. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    // Lọc bài viết theo search và category
    let filteredPosts = blogPosts.filter(
        (post) =>
            (category === "" || post.category === category) &&
            (search === "" ||
                post.title.toLowerCase().includes(search.toLowerCase()) ||
                post.content.toLowerCase().includes(search.toLowerCase()))
    );

    // Sắp xếp bài viết
    if (sort === "newest") {
        filteredPosts = filteredPosts.sort((a, b) => {
            const dateA = new Date(a.datePosted);
            const dateB = new Date(b.datePosted);
            return dateB - dateA;
        });
    } else if (sort === "oldest") {
        filteredPosts = filteredPosts.sort((a, b) => {
            const dateA = new Date(a.datePosted);
            const dateB = new Date(b.datePosted);
            return dateA - dateB;
        });
    }

    // Transform API data to match BlogCard component format
    const transformedPosts = filteredPosts.map(post => ({
        id: post.blogId,
        title: post.title,
        category: post.category,
        date: post.datePosted ? new Date(post.datePosted).toLocaleDateString('vi-VN') : "N/A",
        image: post.thumbnail ? `https://localhost:7024/files/blogs/${post.thumbnail}` : null,
        excerpt: post.content ? (post.content.length > 150 ? post.content.substring(0, 150) + "..." : post.content) : "Không có nội dung",
        link: `/blog/${post.blogId}`,
        tag: post.category?.toLowerCase().replace(/\s+/g, '-'),
    }));

    // Phân trang dữ liệu
    const totalPages = Math.ceil(transformedPosts.length / pageSize);
    const pagedPosts = transformedPosts.slice((page - 1) * pageSize, page * pageSize);

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

    return (
        <div className="bg-light min-vh-100">
            <main className="container py-5">
                <div className="text-center mb-5">
                    <h1 className="display-5 fw-bold mb-3">Blog Sức Khỏe Học Đường</h1>
                    <p className="text-muted">Chia sẻ kiến thức và kinh nghiệm về chăm sóc sức khỏe học đường</p>
                </div>

                {/* Tìm kiếm và lọc */}
                <div className="mb-4">
                    <div className="row g-3">
                        <div className="col-12 col-md-6">
                            <input
                                type="text"
                                placeholder="Tìm kiếm bài viết..."
                                className="form-control"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
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

                {/* Danh sách bài viết */}
                <div className="row">
                    {pagedPosts.length === 0 ? (
                        <div className="col-12">
                            <div className="alert alert-info text-center">
                                Không tìm thấy bài viết nào phù hợp.
                            </div>
                        </div>
                    ) : (
                        pagedPosts.map((post) => (
                            <div className="col-12 col-md-6 col-lg-4 mb-4" key={post.id}>
                                <BlogCard post={post} />
                            </div>
                        ))
                    )}
                </div>

                {/* Phân trang động */}
                {totalPages > 1 && (
                    <nav className="d-flex justify-content-center mt-5">
                        <ul className="pagination">
                            <li className={`page-item${page === 1 ? " disabled" : ""}`}>
                                <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>
                                    Trước
                                </button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                                <li key={num} className={`page-item${page === num ? " active" : ""}`}>
                                    <button className="page-link" onClick={() => setPage(num)}>
                                        {num}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item${page === totalPages ? " disabled" : ""}`}>
                                <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
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