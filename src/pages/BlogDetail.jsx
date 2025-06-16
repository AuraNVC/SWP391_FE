import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_SERVICE } from "../services/api";

export default function BlogDetail() {
    const { id } = useParams();

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

    if (!blogDetail) {
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
                                <span className="badge bg-info text-dark me-2">{blogDetail?.category}</span>
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