// eslint-disable-next-line no-undef
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Định nghĩa endpoint
const API = {
    BLOG_LIST: `${API_BASE_URL}/blogs`,
    BLOG_DETAIL: (id) => `${API_BASE_URL}/Blog/GetById?id=${id}`,
    LOGIN_MANAGER: `${API_BASE_URL}/auth/login`,
    LOGIN_STUDENT: `${API_BASE_URL}/Student/Login`,
    LOGIN_NURSE: `${API_BASE_URL}/auth/login`,
    LOGIN_PARENT: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    USER_PROFILE: `${API_BASE_URL}/user/profile`,
    DOCUMENT_LIST: `${API_BASE_URL}/documents`,
    DOCUMENT_DETAIL: (id) => `${API_BASE_URL}/documents/${id}`,
    // Thêm các endpoint khác nếu cần
};

// Hàm cha gọi API
async function callApi(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error("Lỗi khi gọi API");
    return res.json();
}

// Các hàm con sử dụng hàm cha
export const API_SERVICE = {
    blogAPI: {
        getAll: () => callApi(API.BLOG_LIST),
        getById: (id) => callApi(API.BLOG_DETAIL(id), { method: "GET", header: { "Content-Type": "application/json" } }),
        // Thêm các hàm POST/PUT/DELETE nếu cần
    },
    userAPI: {
        getProfile: () => callApi(API.USER_PROFILE, { credentials: "include" }),
        // Thêm các hàm khác nếu cần
    },
    documentAPI: {
        getAll: () => callApi(API.DOCUMENT_LIST),
        getById: (id) => callApi(API.DOCUMENT_DETAIL(id)),
        // Thêm các hàm khác nếu cần
    },
    // Thêm các nhóm API khác nếu cần
};