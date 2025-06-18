import React, { useState } from "react";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Simulate form submission
        setTimeout(() => {
            setSuccess(true);
            setLoading(false);
            setFormData({
                name: "",
                email: "",
                phone: "",
                subject: "",
                message: ""
            });
            
            // Reset success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        }, 1000);
    };

    return (
        <main className="container-fluid py-5 px-4">
            <div style={{ margin: "0 auto", padding: "0 10rem" }}>
                {/* Header */}
                <section className="mb-5">
                    <h2 className="text-center fw-bold mb-4 fs-2">Liên Hệ</h2>
                    <p className="text-center text-muted fs-5">
                        Chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn về công tác y tế học đường.
                    </p>
                </section>

                <div className="row g-4">
                    {/* Thông tin liên hệ */}
                    <div className="col-12 col-lg-4">
                        <div className="bg-white rounded shadow h-100">
                            <div className="p-4">
                                <h3 className="fs-5 fw-semibold mb-4 text-primary">Thông Tin Liên Hệ</h3>
                                
                                <div className="mb-4">
                                    <h4 className="fs-6 fw-semibold mb-3">
                                        <svg width="20" height="20" fill="none" stroke="#14b8a6" strokeWidth="2" viewBox="0 0 24 24" className="me-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Địa Chỉ
                                    </h4>
                                    <p className="text-secondary mb-0">
                                        Phòng Y Tế Học Đường<br />
                                        Trường Tiểu Học ABC<br />
                                        123 Đường Nguyễn Văn Linh<br />
                                        Quận 7, TP. Hồ Chí Minh
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <h4 className="fs-6 fw-semibold mb-3">
                                        <svg width="20" height="20" fill="none" stroke="#14b8a6" strokeWidth="2" viewBox="0 0 24 24" className="me-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        Điện Thoại
                                    </h4>
                                    <p className="text-secondary mb-0">
                                        <strong>Văn phòng:</strong> (028) 1234 5678<br />
                                        <strong>Khẩn cấp:</strong> (028) 1234 5679<br />
                                        <strong>Fax:</strong> (028) 1234 5680
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <h4 className="fs-6 fw-semibold mb-3">
                                        <svg width="20" height="20" fill="none" stroke="#14b8a6" strokeWidth="2" viewBox="0 0 24 24" className="me-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Email
                                    </h4>
                                    <p className="text-secondary mb-0">
                                        <strong>Chung:</strong> yte@school.edu.vn<br />
                                        <strong>Y tá:</strong> nurse@school.edu.vn<br />
                                        <strong>Quản lý:</strong> admin@school.edu.vn
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <h4 className="fs-6 fw-semibold mb-3">
                                        <svg width="20" height="20" fill="none" stroke="#14b8a6" strokeWidth="2" viewBox="0 0 24 24" className="me-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Giờ Làm Việc
                                    </h4>
                                    <p className="text-secondary mb-0">
                                        <strong>Thứ 2 - Thứ 6:</strong> 7:00 - 17:00<br />
                                        <strong>Thứ 7:</strong> 7:00 - 12:00<br />
                                        <strong>Chủ nhật:</strong> Nghỉ<br />
                                        <small className="text-warning">* Khẩn cấp 24/7</small>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form liên hệ */}
                    <div className="col-12 col-lg-8">
                        <div className="bg-white rounded shadow">
                            <div className="p-4">
                                <h3 className="fs-5 fw-semibold mb-4 text-primary">Gửi Tin Nhắn</h3>
                                
                                {success && (
                                    <div className="alert alert-success" role="alert">
                                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" className="me-2">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-12 col-md-6 mb-3">
                                            <label htmlFor="name" className="form-label">
                                                Họ và tên <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                placeholder="Nhập họ và tên"
                                            />
                                        </div>
                                        <div className="col-12 col-md-6 mb-3">
                                            <label htmlFor="email" className="form-label">
                                                Email <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="example@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-12 col-md-6 mb-3">
                                            <label htmlFor="phone" className="form-label">
                                                Số điện thoại
                                            </label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="0123 456 789"
                                            />
                                        </div>
                                        <div className="col-12 col-md-6 mb-3">
                                            <label htmlFor="subject" className="form-label">
                                                Chủ đề <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                                placeholder="Nhập chủ đề liên hệ"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="message" className="form-label">
                                            Nội dung tin nhắn <span className="text-danger">*</span>
                                        </label>
                                        <textarea
                                            className="form-control"
                                            id="message"
                                            name="message"
                                            rows="5"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            placeholder="Mô tả chi tiết vấn đề của bạn..."
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary px-4 py-2"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Đang gửi...
                                            </>
                                        ) : (
                                            <>
                                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" className="me-2">
                                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                                </svg>
                                                Gửi tin nhắn
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hướng dẫn liên hệ */}
                <section className="mt-5">
                    <h2 className="text-center fw-bold mb-4 fs-2">Hướng Dẫn Liên Hệ</h2>
                    <div className="row g-4">
                        <div className="col-12 col-md-6">
                            <div className="bg-white rounded shadow h-100">
                                <div className="p-4">
                                    <h3 className="fs-5 fw-semibold mb-3 text-success">
                                        <svg width="24" height="24" fill="none" stroke="#14b8a6" strokeWidth="2" viewBox="0 0 24 24" className="me-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Khi nào cần liên hệ?
                                    </h3>
                                    <ul className="text-secondary">
                                        <li>Đăng ký khám sức khỏe định kỳ</li>
                                        <li>Thắc mắc về tiêm chủng</li>
                                        <li>Tư vấn dinh dưỡng học đường</li>
                                        <li>Báo cáo tình trạng sức khỏe</li>
                                        <li>Đăng ký tư vấn tâm lý</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6">
                            <div className="bg-white rounded shadow h-100">
                                <div className="p-4">
                                    <h3 className="fs-5 fw-semibold mb-3 text-warning">
                                        <svg width="24" height="24" fill="none" stroke="#ffc107" strokeWidth="2" viewBox="0 0 24 24" className="me-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        Trường hợp khẩn cấp
                                    </h3>
                                    <ul className="text-secondary">
                                        <li>Tai nạn, chấn thương</li>
                                        <li>Sốt cao, co giật</li>
                                        <li>Dị ứng nghiêm trọng</li>
                                        <li>Ngộ độc thực phẩm</li>
                                        <li>Các tình huống đe dọa tính mạng</li>
                                    </ul>
                                    <p className="text-danger fw-bold mt-3 mb-0">
                                        <svg width="20" height="20" fill="none" stroke="#dc3545" strokeWidth="2" viewBox="0 0 24 24" className="me-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        Gọi ngay: (028) 1234 5679
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
} 