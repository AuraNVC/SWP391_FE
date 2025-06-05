import React, { useState } from "react";
import BlogCard from "../components/Card";

const blogPosts = [
    {
        id: 1,
        title: "Phòng tránh tay chân miệng",
        category: "Bệnh truyền nhiễm",
        date: "20/03/2025",
        image: "../assets/blog-1.jpg",
        excerpt: "Rửa tay thường xuyên, vệ sinh đồ chơi và dụng cụ học tập là những biện pháp quan trọng để phòng tránh bệnh tay chân miệng...",
        link: "#",
        tag: "benh-truyen-nhiem",
    },
    {
        id: 2,
        title: "Lợi ích tiêm chủng",
        category: "Tiêm chủng",
        date: "18/03/2025",
        image: "../assets/blog-2.jpg",
        excerpt: "Tiêm chủng giúp bảo vệ trẻ khỏi các bệnh truyền nhiễm nguy hiểm và tạo miễn dịch cộng đồng...",
        link: "#",
        tag: "tiem-chung",
    },
    {
        id: 3,
        title: "Bệnh mùa hè",
        category: "Sức khỏe mùa hè",
        date: "15/03/2025",
        image: "../assets/blog-3.jpg",
        excerpt: "Cách nhận biết và phòng tránh các bệnh thường gặp trong mùa hè như sốt xuất huyết, tiêu chảy...",
        link: "#",
        tag: "suc-khoe-mua-he",
    },
    {
        id: 4,
        title: "Dinh dưỡng học đường",
        category: "Dinh dưỡng",
        date: "12/03/2025",
        image: "../assets/blog-4.jpg",
        excerpt: "Xây dựng chế độ dinh dưỡng hợp lý cho học sinh để phát triển toàn diện về thể chất và trí tuệ...",
        link: "#",
        tag: "dinh-duong",
    },
    {
        id: 5,
        title: "Tâm lý học đường",
        category: "Tâm lý",
        date: "10/03/2025",
        image: "../assets/blog-5.jpg",
        excerpt: "Nhận biết và hỗ trợ học sinh gặp vấn đề về tâm lý trong môi trường học đường...",
        link: "#",
        tag: "tam-ly",
    },
    {
        id: 6,
        title: "Thể dục thể thao",
        category: "Thể chất",
        date: "08/03/2025",
        image: "../assets/blog-6.jpg",
        excerpt: "Vai trò của hoạt động thể dục thể thao trong việc phát triển thể chất và tinh thần cho học sinh...",
        link: "#",
        tag: "the-chat",
    },
];

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

    // Lọc bài viết theo search và category
    let filteredPosts = blogPosts.filter(
        (post) =>
            (category === "" || post.tag === category) &&
            (search === "" ||
                post.title.toLowerCase().includes(search.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(search.toLowerCase()))
    );

    // Sắp xếp bài viết
    if (sort === "newest") {
        filteredPosts = filteredPosts.sort((a, b) => b.date.localeCompare(a.date));
    } else if (sort === "oldest") {
        filteredPosts = filteredPosts.sort((a, b) => a.date.localeCompare(b.date));
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
                    {filteredPosts.map((post) => (
                        <div className="col-12 col-md-6 col-lg-4 mb-4" key={post.id}>
                            <BlogCard post={post} />
                        </div>
                    ))}
                </div>

                {/* Phân trang (tĩnh) */}
                <nav className="d-flex justify-content-center mt-5">
                    <ul className="pagination">
                        <li className="page-item">
                            <a className="page-link" href="#">Trước</a>
                        </li>
                        <li className="page-item active">
                            <a className="page-link" href="#">1</a>
                        </li>
                        <li className="page-item">
                            <a className="page-link" href="#">2</a>
                        </li>
                        <li className="page-item">
                            <a className="page-link" href="#">3</a>
                        </li>
                        <li className="page-item">
                            <a className="page-link" href="#">Sau</a>
                        </li>
                    </ul>
                </nav>
            </main>
        </div>
    );
}