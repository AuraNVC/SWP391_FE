import React from "react";
import { Link } from "react-router-dom";

export default function BlogCard({ post }) {
    return (
        <div className="card h-100 shadow-sm">
            <img
                src={post.image}
                alt={post.title}
                className="card-img-top"
                style={{ height: 200, objectFit: "cover" }}
            />
            <div className="card-body">
                <div className="mb-2 d-flex align-items-center">
                    <span className="badge bg-info text-dark me-2">{post.category}</span>
                    <span className="text-muted small">{post.date}</span>
                </div>
                <h5 className="card-title">{post.title}</h5>
                <p className="card-text">{post.excerpt}</p>
                <Link to={`/blog/${post.id}`} className="btn btn-link px-0">
                    Đọc thêm →
                </Link>
            </div>
        </div>
    );
}