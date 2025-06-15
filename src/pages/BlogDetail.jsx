import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_SERVICE } from "../services/api";

// Ví dụ dữ liệu blog, bạn nên import hoặc lấy từ API/thư mục chung
const blogPosts = [
    {
        id: 1,
        title: "Phòng tránh tay chân miệng",
        category: "Bệnh truyền nhiễm",
        date: "20/03/2025",
        image: "../assets/blog-1.jpg",
        excerpt: "Rửa tay thường xuyên, vệ sinh đồ chơi và dụng cụ học tập là những biện pháp quan trọng để phòng tránh bệnh tay chân miệng...",
        content: `Rửa tay thường xuyên, vệ sinh đồ chơi và dụng cụ học tập là những biện pháp quan trọng để phòng tránh bệnh tay chân miệng. Ngoài ra, cần chú ý vệ sinh cá nhân, tránh tiếp xúc với người bệnh và đảm bảo môi trường học tập sạch sẽ. Khi có dấu hiệu nghi ngờ, cần đưa trẻ đến cơ sở y tế để được khám và điều trị kịp thời.`,
        tag: "benh-truyen-nhiem",
    },
    {
        id: 2,
        title: "Lợi ích tiêm chủng",
        category: "Tiêm chủng",
        date: "18/03/2025",
        image: "../assets/blog-2.jpg",
        excerpt: "Tiêm chủng giúp bảo vệ trẻ khỏi các bệnh truyền nhiễm nguy hiểm và tạo miễn dịch cộng đồng...",
        content: `Tiêm chủng là biện pháp hiệu quả giúp phòng ngừa nhiều bệnh truyền nhiễm nguy hiểm cho trẻ em. Việc tiêm chủng đầy đủ và đúng lịch giúp tạo miễn dịch cộng đồng, bảo vệ sức khỏe cho cả xã hội.`,
        tag: "tiem-chung",
    },
    {
        id: 3,
        title: "Bệnh mùa hè",
        category: "Sức khỏe mùa hè",
        date: "15/03/2025",
        image: "../assets/blog-3.jpg",
        excerpt: "Cách nhận biết và phòng tránh các bệnh thường gặp trong mùa hè như sốt xuất huyết, tiêu chảy...",
        content: `Mùa hè là thời điểm nhiều bệnh truyền nhiễm phát triển mạnh như sốt xuất huyết, tiêu chảy, cảm cúm. Cần giữ vệ sinh cá nhân, ăn chín uống sôi và tránh muỗi đốt để phòng bệnh hiệu quả.`,
        tag: "suc-khoe-mua-he",
    },
    {
        id: 4,
        title: "Dinh dưỡng học đường",
        category: "Dinh dưỡng",
        date: "12/03/2025",
        image: "../assets/blog-4.jpg",
        excerpt: "Xây dựng chế độ dinh dưỡng hợp lý cho học sinh để phát triển toàn diện về thể chất và trí tuệ...",
        content: `Chế độ dinh dưỡng hợp lý giúp học sinh phát triển toàn diện về thể chất và trí tuệ. Nên bổ sung đầy đủ các nhóm chất: đạm, béo, tinh bột, vitamin và khoáng chất trong khẩu phần ăn hàng ngày.`,
        tag: "dinh-duong",
    },
    {
        id: 5,
        title: "Tâm lý học đường",
        category: "Tâm lý",
        date: "10/03/2025",
        image: "../assets/blog-5.jpg",
        excerpt: "Nhận biết và hỗ trợ học sinh gặp vấn đề về tâm lý trong môi trường học đường...",
        content: `Học sinh có thể gặp nhiều vấn đề tâm lý như áp lực học tập, mâu thuẫn bạn bè, gia đình. Gia đình và nhà trường cần quan tâm, lắng nghe và hỗ trợ kịp thời để các em vượt qua khó khăn.`,
        tag: "tam-ly",
    },
    {
        id: 6,
        title: "Thể dục thể thao",
        category: "Thể chất",
        date: "08/03/2025",
        image: "../assets/blog-6.jpg",
        excerpt: "Vai trò của hoạt động thể dục thể thao trong việc phát triển thể chất và tinh thần cho học sinh...",
        content: `Tham gia thể dục thể thao giúp học sinh nâng cao sức khỏe, phát triển thể chất và tinh thần. Nên duy trì thói quen vận động mỗi ngày để phòng tránh các bệnh lý học đường.`,
        tag: "the-chat",
    },
];

export default function BlogDetail() {
    const { id } = useParams();
    const blog = blogPosts.find((b) => b.id === Number(id));

    
    const [blogDetail, setBlogDetail] = useState("");
    const [thumbnail,setThumbnail] = useState("");

    useEffect(() => {
        // Lấy chi tiết bài viết nếu có ID trong URL
        const res = API_SERVICE.blogAPI.getById(id);
        res.then((data) => {
            setBlogDetail(data);
            setThumbnail(`https://localhost:7024/files/blogs//${data.thumbnail}`);
        })
    },[]);
    console.log(blogDetail);

    if (!blog) {
        return (
            <div className="container py-5">
                <h2 className="text-center">Không tìm thấy bài viết!</h2>
                <div className="text-center mt-3">
                    <Link to="/blog" className="btn btn-outline-primary">Quay lại Blog</Link>
                </div>
            </div>
        );
    }

    return (
        <main className="container py-5">
            <div className="mb-4">
                <Link to="/blog" className="btn btn-link px-0">&larr; Quay lại Blog</Link>
            </div>
            <div className="row justify-content-center">
                <div className="col-12 col-md-10 col-lg-8">
                    <div className="card shadow">
                        <img src={thumbnail} alt={blogDetail.title} className="card-img-top" style={{ maxHeight: 350, objectFit: "cover" }} />
                        <div className="card-body">
                            <div className="mb-2">
                                <span className="badge bg-info text-dark me-2">{blog.category}</span>
                                <span className="text-muted small">{blogDetail.datePosted}</span>
                            </div>
                            <h1 className="card-title mb-3">{blogDetail.title}</h1>
                            <div className="card-text fs-5"><p>{blogDetail.content}</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}