import React from "react";

export default function About() {
    return (
        <main className="container-fluid py-5 px-10">
            <div style={{ margin: "0 auto", padding: "0 10rem" }}>
                {/* Header */}
                <section className="mb-5">
                    <h2 className="text-center fw-bold mb-4 fs-2">Giới Thiệu</h2>
                    <p className="text-center text-muted fs-5">
                        Hệ thống Y tế Học đường - Nền tảng quản lý toàn diện cho công tác chăm sóc sức khỏe học sinh
                    </p>
                </section>

                {/* Giới thiệu chung */}
                <section className="mb-5">
                    <div className="bg-white rounded shadow p-4">
                        <h3 className="fs-4 fw-semibold mb-4 text-primary">Về Chúng Tôi</h3>
                        <p className="fs-5 text-secondary mb-4">
                            Hệ thống Y tế Học đường là nền tảng quản lý toàn diện cho công tác y tế tại trường học,
                            được thiết kế để kết nối phụ huynh, học sinh, nhân viên y tế và ban giám hiệu trong việc chăm sóc sức khỏe học đường.
                        </p>
                        <p className="fs-5 text-secondary mb-0">
                            Với mục tiêu tạo ra một môi trường học tập an toàn và khỏe mạnh, hệ thống cung cấp các giải pháp 
                            quản lý hồ sơ sức khỏe, lịch tiêm chủng, khám sức khỏe định kỳ và tư vấn y tế cho học sinh.
                        </p>
                    </div>
                </section>

                {/* Sứ mệnh và tầm nhìn */}
                <section className="mb-5">
                    <div className="row g-4">
                        <div className="col-12 col-md-6">
                            <div className="bg-white rounded shadow h-100">
                                <div className="p-4">
                                    <h3 className="fs-4 fw-semibold mb-4 text-success">
                                        <svg width="24" height="24" fill="none" stroke="#14b8a6" strokeWidth="2" viewBox="0 0 24 24" className="me-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Sứ Mệnh
                                    </h3>
                                    <p className="text-secondary">
                                        Cung cấp giải pháp quản lý y tế học đường hiệu quả, đảm bảo mọi học sinh 
                                        đều được chăm sóc sức khỏe toàn diện và kịp thời. Chúng tôi cam kết tạo ra 
                                        một môi trường học tập an toàn, lành mạnh cho thế hệ tương lai.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6">
                            <div className="bg-white rounded shadow h-100">
                                <div className="p-4">
                                    <h3 className="fs-4 fw-semibold mb-4 text-info">
                                        <svg width="24" height="24" fill="none" stroke="#14b8a6" strokeWidth="2" viewBox="0 0 24 24" className="me-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Tầm Nhìn
                                    </h3>
                                    <p className="text-secondary">
                                        Trở thành hệ thống quản lý y tế học đường hàng đầu, được tin tưởng và sử dụng 
                                        rộng rãi tại các trường học trên toàn quốc. Hướng tới việc xây dựng một cộng đồng 
                                        giáo dục khỏe mạnh và phát triển bền vững.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tính năng chính */}
                <section className="mb-5">
                    <h3 className="text-center fw-bold mb-4 fs-2">Tính Năng Chính</h3>
                    <div className="row g-4">
                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="bg-white rounded shadow h-100">
                                <div className="p-4 text-center">
                                    <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64 }}>
                                        <svg width="32" height="32" fill="none" stroke="#14b8a6" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="fs-5 fw-semibold mb-2">Quản Lý Hồ Sơ</h4>
                                    <p className="text-secondary">Theo dõi và quản lý hồ sơ sức khỏe học sinh một cách chi tiết và có hệ thống</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="bg-white rounded shadow h-100">
                                <div className="p-4 text-center">
                                    <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64 }}>
                                        <svg width="32" height="32" fill="none" stroke="#14b8a6" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <h4 className="fs-5 fw-semibold mb-2">Tiêm Chủng</h4>
                                    <p className="text-secondary">Quản lý lịch tiêm chủng và theo dõi tình trạng sau tiêm của học sinh</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="bg-white rounded shadow h-100">
                                <div className="p-4 text-center">
                                    <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64 }}>
                                        <svg width="32" height="32" fill="none" stroke="#14b8a6" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="fs-5 fw-semibold mb-2">Khám Sức Khỏe</h4>
                                    <p className="text-secondary">Kiểm tra sức khỏe định kỳ và tư vấn y tế cho học sinh</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="bg-white rounded shadow h-100">
                                <div className="p-4 text-center">
                                    <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64 }}>
                                        <svg width="32" height="32" fill="none" stroke="#14b8a6" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <h4 className="fs-5 fw-semibold mb-2">Tư Vấn</h4>
                                    <p className="text-secondary">Cung cấp tư vấn dinh dưỡng, tâm lý và sức khỏe cho học sinh</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="bg-white rounded shadow h-100">
                                <div className="p-4 text-center">
                                    <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64 }}>
                                        <svg width="32" height="32" fill="none" stroke="#14b8a6" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM16 3h-2v2h2V3zM6 7H4v2h2V7zM6 3H4v2h2V3zM6 11H4v2h2v-2zM18 7h-2v2h2V7zM18 11h-2v2h2v-2z" />
                                        </svg>
                                    </div>
                                    <h4 className="fs-5 fw-semibold mb-2">Báo Cáo</h4>
                                    <p className="text-secondary">Tạo báo cáo thống kê và phân tích tình hình sức khỏe học đường</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg-4">
                            <div className="bg-white rounded shadow h-100">
                                <div className="p-4 text-center">
                                    <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64 }}>
                                        <svg width="32" height="32" fill="none" stroke="#14b8a6" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <h4 className="fs-5 fw-semibold mb-2">Blog Sức Khỏe</h4>
                                    <p className="text-secondary">Chia sẻ kiến thức và thông tin hữu ích về chăm sóc sức khỏe học đường</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Đối tượng sử dụng */}
                <section className="mb-5">
                    <h3 className="text-center fw-bold mb-4 fs-2">Đối Tượng Sử Dụng</h3>
                    <div className="row g-4">
                        <div className="col-12 col-md-6 col-lg-3">
                            <div className="bg-white rounded shadow h-100">
                                <div className="p-4 text-center">
                                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64 }}>
                                        <svg width="32" height="32" fill="none" stroke="#0d6efd" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <h4 className="fs-5 fw-semibold mb-2">Quản Trị Viên</h4>
                                    <p className="text-secondary">Quản lý toàn bộ hệ thống và phân quyền người dùng</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg-3">
                            <div className="bg-white rounded shadow h-100">
                                <div className="p-4 text-center">
                                    <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64 }}>
                                        <svg width="32" height="32" fill="none" stroke="#198754" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="fs-5 fw-semibold mb-2">Y Tá</h4>
                                    <p className="text-secondary">Thực hiện khám sức khỏe và quản lý hồ sơ y tế học sinh</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg-3">
                            <div className="bg-white rounded shadow h-100">
                                <div className="p-4 text-center">
                                    <div className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64 }}>
                                        <svg width="32" height="32" fill="none" stroke="#ffc107" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="fs-5 fw-semibold mb-2">Phụ Huynh</h4>
                                    <p className="text-secondary">Theo dõi tình trạng sức khỏe và thông tin y tế của con em</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg-3">
                            <div className="bg-white rounded shadow h-100">
                                <div className="p-4 text-center">
                                    <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64 }}>
                                        <svg width="32" height="32" fill="none" stroke="#0dcaf0" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <h4 className="fs-5 fw-semibold mb-2">Học Sinh</h4>
                                    <p className="text-secondary">Xem thông tin sức khỏe và lịch khám tiêm chủng cá nhân</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Thống kê */}
                <section className="mb-5">
                    <h3 className="text-center fw-bold mb-4 fs-2">Thống Kê</h3>
                    <div className="row g-4">
                        <div className="col-12 col-md-3">
                            <div className="bg-white rounded shadow text-center p-4">
                                <h4 className="fs-1 fw-bold text-primary mb-2">500+</h4>
                                <p className="text-secondary mb-0">Học sinh được quản lý</p>
                            </div>
                        </div>
                        <div className="col-12 col-md-3">
                            <div className="bg-white rounded shadow text-center p-4">
                                <h4 className="fs-1 fw-bold text-success mb-2">50+</h4>
                                <p className="text-secondary mb-0">Khám sức khỏe/tháng</p>
                            </div>
                        </div>
                        <div className="col-12 col-md-3">
                            <div className="bg-white rounded shadow text-center p-4">
                                <h4 className="fs-1 fw-bold text-warning mb-2">200+</h4>
                                <p className="text-secondary mb-0">Tiêm chủng/năm</p>
                            </div>
                        </div>
                        <div className="col-12 col-md-3">
                            <div className="bg-white rounded shadow text-center p-4">
                                <h4 className="fs-1 fw-bold text-info mb-2">100%</h4>
                                <p className="text-secondary mb-0">Học sinh được chăm sóc</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Cam kết */}
                <section className="mb-5">
                    <div className="bg-white rounded shadow p-4">
                        <h3 className="fs-4 fw-semibold mb-4 text-primary">Cam Kết Của Chúng Tôi</h3>
                        <div className="row g-4">
                            <div className="col-12 col-md-6">
                                <ul className="text-secondary">
                                    <li>Đảm bảo tính bảo mật và an toàn thông tin</li>
                                    <li>Cung cấp dịch vụ hỗ trợ 24/7</li>
                                    <li>Cập nhật hệ thống thường xuyên</li>
                                    <li>Đào tạo sử dụng miễn phí</li>
                                </ul>
                            </div>
                            <div className="col-12 col-md-6">
                                <ul className="text-secondary">
                                    <li>Tuân thủ quy định về bảo vệ dữ liệu</li>
                                    <li>Hỗ trợ kỹ thuật nhanh chóng</li>
                                    <li>Phát triển tính năng theo nhu cầu</li>
                                    <li>Đồng hành cùng nhà trường</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
} 