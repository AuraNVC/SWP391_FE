import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HighlightSwiper from "../components/HighlightSwiper";
import { API_SERVICE } from "../services/api";

const Home = () => {
    const [highlightBlogs, setHighlightBlogs] = useState([]);
    const [allBlogs, setAllBlogs] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [userRole] = useState(localStorage.getItem("userRole"));

    useEffect(() => {
        async function fetchBlogs() {
            try {
                const response = await API_SERVICE.blogAPI.getAll({ keyword: "" });
                setAllBlogs(response);
                // Lọc blog category Home
                const homeBlogs = response.filter(
                    (post) =>
                        post.category === "Home" ||
                        (typeof post.category === "string" && post.category.toLowerCase() === "home") ||
                        post.category === 5
                );
                // Mapping cho HighlightSwiper
                const highlightItems = homeBlogs.map(blog => ({
                    title: blog.title,
                    desc: blog.content ? (blog.content.length > 120 ? blog.content.substring(0, 120) + "..." : blog.content) : "Không có mô tả",
                    image: blog.thumbnail ? `https://localhost:7024/files/blogs/${blog.thumbnail}` : "/images/default.jpg",
                    link: `/blog/${blog.blogId}`
                }));
                setHighlightBlogs(highlightItems);
            } catch (e) {
                setHighlightBlogs([]);
                setAllBlogs([]);
            }
        }
        fetchBlogs();
        setDocuments([
            {
                title: "Hướng dẫn phòng bệnh tay chân miệng",
                desc: "Tài liệu hướng dẫn chi tiết về cách phòng tránh bệnh tay chân miệng cho học sinh.",
                link: "/documents/tay-chan-mieng.pdf"
            },
            {
                title: "Lịch tiêm chủng cho trẻ em",
                desc: "Tài liệu cung cấp lịch tiêm chủng đầy đủ và đúng thời gian cho trẻ em.",
                link: "/documents/lich-tiem-chung.pdf"
            },
            {
                title: "Dinh dưỡng học đường",
                desc: "Tài liệu hướng dẫn chế độ dinh dưỡng hợp lý cho học sinh để phát triển toàn diện.",
                link: "/documents/dinh-duong-hoc-duong.pdf"
            }
        ]);
    }, [userRole]);

    // Mapping cho phần Bài Viết Mới Nhất (tất cả blog, mới nhất lên đầu)
    const latestBlogs = allBlogs
        .slice()
        .sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted))
        .map(blog => ({
            title: blog.title,
            desc: blog.content ? (blog.content.length > 120 ? blog.content.substring(0, 120) + "..." : blog.content) : "Không có mô tả",
            image: blog.thumbnail ? `https://localhost:7024/files/blogs/${blog.thumbnail}` : "/images/default.jpg",
            link: `/blog/${blog.blogId}`
        }));

    return (
        <main className="container-fluid py-5 px-10">
            {/* Swiper giới thiệu các chương trình nổi bật */}
            <HighlightSwiper items={highlightBlogs} title="Chương Trình Y Tế Đáng Chú Ý" />

            <div style={{ margin: "0 auto", padding: "0 10rem" }}>
                {/* Blog */}
                <section className="mb-5">
                    <h2 className="text-center fw-bold mb-4 fs-2">Bài Viết Mới Nhất</h2>
                    <div className="row g-4">
                        {latestBlogs.map((blog, idx) => (
                            <div className="col-12 col-md-6 col-lg-4" key={idx}>
                                <div className="bg-white rounded shadow h-100">
                                    <div className="p-4">
                                        <h3 className="fs-5 fw-semibold mb-2">{blog.title}</h3>
                                        <p className="text-secondary mb-3">{blog.desc}</p>
                                        <Link to={blog.link} className="text-info text-decoration-none">Đọc thêm &rarr;</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tài liệu */}
                <section className="mb-5">
                    <h2 className="text-center fw-bold mb-4 fs-2">Tài Liệu Sức Khỏe</h2>
                    <div className="row g-4">
                        {documents.map((doc, idx) => (
                            <div className="col-12 col-md-6 col-lg-4" key={idx}>
                                <div className="bg-white rounded shadow p-4 h-100">
                                    <h3 className="fs-5 fw-semibold mb-2">{doc.title}</h3>
                                    <p className="text-secondary mb-3">{doc.desc}</p>
                                    <a href={doc.link} className="text-info text-decoration-none">Tải xuống &rarr;</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Home;