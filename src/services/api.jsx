// eslint-disable-next-line no-undef
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Định nghĩa endpoint
const API = {
    BLOG_LIST: `${API_BASE_URL}/blog/search`,
    BLOG_DETAIL: (id) => `${API_BASE_URL}/blog/${id}`,
    LOGIN_MANAGER: `${API_BASE_URL}/manager/authorize`,
    LOGIN_STUDENT: `${API_BASE_URL}/student/login`,
    LOGIN_NURSE: `${API_BASE_URL}/nurse/login`,
    LOGIN_PARENT: `${API_BASE_URL}/parent/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    USER_PROFILE: `${API_BASE_URL}/user/profile`,
    DOCUMENT_LIST: `${API_BASE_URL}/documents`,
    DOCUMENT_DETAIL: (id) => `${API_BASE_URL}/documents/${id}`,
    STUDENT_LIST: `${API_BASE_URL}/student/search`,
    PARENT_LIST: `${API_BASE_URL}/parent/search`,
    NURSE_LIST: `${API_BASE_URL}/nurse/search`,
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
        getAll: (data) => callApi(API.BLOG_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }),
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
    login: {
        manager: (data) => callApi(API.LOGIN_MANAGER, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }),
        student: (data) => callApi(API.LOGIN_STUDENT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }),
        nurse: (data) => callApi(API.LOGIN_NURSE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }),
        parent: (data) => callApi(API.LOGIN_PARENT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }),
    },
    studentAPI: {
        getAll: (data) => callApi(API.STUDENT_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        // Thêm các hàm khác nếu cần
    },
    parentAPI: {
        getAll: (data) => callApi(API.PARENT_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        // Thêm các hàm khác nếu cần
    },
    nurseAPI: {
        getAll: (data) => callApi(API.NURSE_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        // Thêm các hàm khác nếu cần
    },
    // Thêm các nhóm API khác nếu cần
};