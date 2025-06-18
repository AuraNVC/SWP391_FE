import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HighlightSwiper from "../components/HighlightSwiper"; // import component mới

const highlightPrograms = [
    {
        title: "Chương trình tiêm chủng mở rộng",
        desc: "Đảm bảo mọi học sinh được tiêm chủng đầy đủ các loại vaccine phòng bệnh theo khuyến nghị của Bộ Y tế.",
        image: "/images/vaccine-program.jpg"
    },
    {
        title: "Khám sức khỏe định kỳ",
        desc: "Tổ chức khám sức khỏe tổng quát cho học sinh mỗi học kỳ, phát hiện sớm các vấn đề sức khỏe.",
        image: "/images/health-check.jpg"
    },
    {
        title: "Tư vấn dinh dưỡng học đường",
        desc: "Chuyên gia dinh dưỡng tư vấn chế độ ăn uống hợp lý, giúp học sinh phát triển toàn diện.",
        image: "/images/nutrition.jpg"
    },
    {
        title: "Phòng chống dịch bệnh học đường",
        desc: "Triển khai các biện pháp phòng chống dịch bệnh, hướng dẫn vệ sinh cá nhân và môi trường lớp học.",
        image: "/images/disease-prevention.jpg"
    }
];

const Home = () => {
    const [blogs, setBlogs] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [userRole] = useState(localStorage.getItem("userRole"));

    useEffect(() => {
        setBlogs([
            {
                title: "Phòng tránh tay chân miệng",
                desc: "Rửa tay thường xuyên, vệ sinh đồ chơi và dụng cụ học tập là những biện pháp quan trọng để phòng tránh bệnh tay chân miệng.",
                link: "/blog/1"
            },
            {
                title: "Lợi ích tiêm chủng",
                desc: "Tiêm chủng giúp bảo vệ trẻ khỏi các bệnh truyền nhiễm nguy hiểm và tạo miễn dịch cộng đồng.",
                link: "/blog/2"
            },
            {
                title: "Bệnh mùa hè",
                desc: "Cách nhận biết và phòng tránh các bệnh thường gặp trong mùa hè như sốt xuất huyết, tiêu chảy.",
                link: "/blog/3"
            }
        ]);
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

    return (
        <main className="container-fluid py-5 px-10">
            {/* Swiper giới thiệu các chương trình nổi bật */}
            <HighlightSwiper items={highlightPrograms} title="Chương Trình Y Tế Đáng Chú Ý" />

            <div style={{ margin: "0 auto", padding: "0 10rem" }}>
                {/* Blog */}
                <section className="mb-5">
                    <h2 className="text-center fw-bold mb-4 fs-2">Bài Viết Mới Nhất</h2>
                    <div className="row g-4">
                        {blogs.map((blog, idx) => (
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