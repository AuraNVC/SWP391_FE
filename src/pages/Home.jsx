import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HighlightSwiper from "../components/HighlightSwiper";
import { API_SERVICE } from "../services/api";

const Home = () => {
    const [highlightBlogs, setHighlightBlogs] = useState([]);
    const [allBlogs, setAllBlogs] = useState([]);
    const [userRole] = useState(localStorage.getItem("userRole"));

    useEffect(() => {
        async function fetchBlogs() {
            try {
                const response = await API_SERVICE.blogAPI.getAll({ keyword: "" });
                console.log("All blogs from API:", response);
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
                console.error("Error fetching blogs:", e);
                setHighlightBlogs([]);
                setAllBlogs([]);
            }
        }
        fetchBlogs();
    }, [userRole]);

    // Mapping cho phần Bài Viết Mới Nhất (8 blog mới nhất, loại bỏ category Home)
    const latestBlogs = allBlogs
        .filter(blog =>
            blog.category !== "Home" &&
            blog.category !== 5 &&
            !(typeof blog.category === "string" && blog.category.toLowerCase() === "home")
        )
        .sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted))
        .slice(0, 9)
        .map(blog => ({
            title: blog.title,
            desc: blog.content ? (blog.content.length > 120 ? blog.content.substring(0, 120) + "..." : blog.content) : "Không có mô tả",
            image: blog.thumbnail ? `https://localhost:7024/files/blogs/${blog.thumbnail}` : "/images/default.jpg",
            link: `/blog/${blog.blogId}`
        }));

    // Mapping cho phần Tài Liệu Sức Khỏe (blog category 6 - HealthBenefits)
    const healthBlogs = allBlogs
        .filter(blog => {
            console.log("Blog:", blog.title, "Category:", blog.category, "Type:", typeof blog.category);
            return blog.category === 6 || blog.category === "6" || blog.category === "HealthBenefits";
        })
        .sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted))
        .slice(0, 3)
        .map(blog => ({
            title: blog.title,
            desc: blog.content ? (blog.content.length > 120 ? blog.content.substring(0, 120) + "..." : blog.content) : "Không có mô tả",
            image: blog.thumbnail ? `https://localhost:7024/files/blogs/${blog.thumbnail}` : "/images/default.jpg",
            link: `/blog/${blog.blogId}`
        }));

    console.log("Health blogs found:", healthBlogs.length);

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

                {/* Tài Liệu Sức Khỏe */}
                <section className="mb-5">
                    <h2 className="text-center fw-bold mb-4 fs-2">Tài Liệu Sức Khỏe</h2>
                    <div className="row g-4">
                        {healthBlogs.length > 0 ? (
                            healthBlogs.map((blog, idx) => (
                                <div className="col-12 col-md-6 col-lg-4" key={idx}>
                                    <div className="bg-white rounded shadow h-100">
                                        <div className="p-4">
                                            <h3 className="fs-5 fw-semibold mb-2">{blog.title}</h3>
                                            <p className="text-secondary mb-3">{blog.desc}</p>
                                            <Link to={blog.link} className="text-info text-decoration-none">Đọc thêm &rarr;</Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
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