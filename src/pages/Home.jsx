import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
            {/* Giới thiệu */}
            <div style={{ margin: "0 auto", padding: "0 10rem" }}>
                <section className="mb-5">
                    <h2 className="text-center fw-bold mb-4 fs-2">Giới Thiệu</h2>
                    <div className="bg-white rounded shadow p-4">
                        <p className="fs-5 text-secondary mb-4">
                            Hệ thống Y tế Học đường là nền tảng quản lý toàn diện cho công tác y tế tại trường học,
                            giúp kết nối phụ huynh, học sinh, nhân viên y tế và ban giám hiệu trong việc chăm sóc sức khỏe học đường.
                        </p>
                        <div className="row text-center mt-4 g-4">
                            <div className="col-12 col-md-4">
                                <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64 }}>
                                    <svg width="32" height="32" fill="none" stroke="#14b8a6" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <h3 className="fs-5 fw-semibold mb-2">Quản Lý Hồ Sơ</h3>
                                <p className="text-secondary">Theo dõi và quản lý hồ sơ sức khỏe học sinh</p>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64 }}>
                                    <svg width="32" height="32" fill="none" stroke="#14b8a6" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 className="fs-5 fw-semibold mb-2">Tiêm Chủng</h3>
                                <p className="text-secondary">Quản lý lịch tiêm chủng và theo dõi sau tiêm</p>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64 }}>
                                    <svg width="32" height="32" fill="none" stroke="#14b8a6" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="fs-5 fw-semibold mb-2">Khám Sức Khỏe</h3>
                                <p className="text-secondary">Kiểm tra sức khỏe định kỳ và tư vấn y tế</p>
                            </div>
                        </div>
                    </div>
                </section>

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