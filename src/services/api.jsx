// eslint-disable-next-line no-undef
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Dinh nghia endpoint
const API = {
    BLOG_LIST: `${API_BASE_URL}/blog/search`,
    BLOG_CREATE: `${API_BASE_URL}/blog/add`,
    BLOG_UPDATE: (id) => `${API_BASE_URL}/blog/${id}`,
    BLOG_DETAIL: (id) => `${API_BASE_URL}/blog/${id}`,
    BLOG_DELETE: (id) => `${API_BASE_URL}/blog/${id}`,
    LOGIN_MANAGER: `${API_BASE_URL}/manager/authorize`,
    LOGIN_STUDENT: `${API_BASE_URL}/student/login`,
    LOGIN_NURSE: `${API_BASE_URL}/nurse/login`,
    LOGIN_PARENT: `${API_BASE_URL}/parent/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    USER_PROFILE: `${API_BASE_URL}/user/profile`,
    DOCUMENT_LIST: `${API_BASE_URL}/documents`,
    DOCUMENT_DETAIL: (id) => `${API_BASE_URL}/documents/${id}`,
    STUDENT_LIST: `${API_BASE_URL}/student/search`,
    STUDENT_CREATE: `${API_BASE_URL}/student/add`,
    STUDENT_UPDATE: (id) => `${API_BASE_URL}/student/${id}`,
    STUDENT_DELETE: (id) => `${API_BASE_URL}/student/${id}`,
    PARENT_LIST: `${API_BASE_URL}/parent/search`,
    PARENT_SEARCH: `${API_BASE_URL}/parent/search`,
    PARENT_CREATE: `${API_BASE_URL}/parent/add`,
    PARENT_UPDATE: (id) => `${API_BASE_URL}/parent/${id}`,
    PARENT_DELETE: (id) => `${API_BASE_URL}/parent/${id}`,
    NURSE_LIST: `${API_BASE_URL}/nurse/search`,
    NURSE_CREATE: `${API_BASE_URL}/nurse/add`,
    NURSE_UPDATE: (id) => `${API_BASE_URL}/nurse/${id}`,
    NURSE_DELETE: (id) => `${API_BASE_URL}/nurse/${id}`,
    FORM_LIST: `${API_BASE_URL}/form/search`,
    FORM_CREATE: `${API_BASE_URL}/form/add`,
    FORM_DELETE: (id) => `${API_BASE_URL}/form/${id}`,
    HEALTH_CHECK_SCHEDULE_LIST: `${API_BASE_URL}/healthCheckSchedule/search`,
    HEALTH_CHECK_SCHEDULE_CREATE: `${API_BASE_URL}/healthCheckSchedule/create`,
    HEALTH_CHECK_SCHEDULE_UPDATE: (id) => `${API_BASE_URL}/healthCheckSchedule/${id}`,
    HEALTH_CHECK_SCHEDULE_DETAIL: (id) => `${API_BASE_URL}/healthCheckSchedule/${id}`,
    HEALTH_CHECK_SCHEDULE_DELETE: (id) => `${API_BASE_URL}/healthCheckSchedule/${id}`,
    
    // Medical Event endpoints
    MEDICAL_EVENT_LIST: `${API_BASE_URL}/medicalEvent/search`,
    MEDICAL_EVENT_CREATE: `${API_BASE_URL}/medicalEvent/add`,
    MEDICAL_EVENT_UPDATE: (id) => `${API_BASE_URL}/medicalEvent/${id}`,
    MEDICAL_EVENT_DETAIL: (id) => `${API_BASE_URL}/medicalEvent/${id}`,
    MEDICAL_EVENT_DELETE: (id) => `${API_BASE_URL}/medicalEvent/${id}`,
    
    // Health Check Result endpoints
    HEALTH_CHECK_RESULT_LIST: `${API_BASE_URL}/healthCheckResult/search`,
    HEALTH_CHECK_RESULT_CREATE: `${API_BASE_URL}/healthCheckResult/add`,
    HEALTH_CHECK_RESULT_UPDATE: (id) => `${API_BASE_URL}/healthCheckResult/${id}`,
    HEALTH_CHECK_RESULT_DETAIL: (id) => `${API_BASE_URL}/healthCheckResult/${id}`,
    
    // Vaccination Result endpoints
    VACCINATION_RESULT_LIST: `${API_BASE_URL}/vaccinationResult/search`,
    VACCINATION_RESULT_CREATE: `${API_BASE_URL}/vaccinationResult/add`,
    VACCINATION_RESULT_UPDATE: (id) => `${API_BASE_URL}/vaccinationResult/${id}`,
    VACCINATION_RESULT_DETAIL: (id) => `${API_BASE_URL}/vaccinationResult/${id}`,
    
    // Consultation Schedule endpoints
    CONSULTATION_SCHEDULE_LIST: `${API_BASE_URL}/consultationSchedule/search`,
    CONSULTATION_SCHEDULE_CREATE: `${API_BASE_URL}/consultationSchedule/add`,
    CONSULTATION_SCHEDULE_UPDATE: (id) => `${API_BASE_URL}/consultationSchedule/${id}`,
    CONSULTATION_SCHEDULE_DETAIL: (id) => `${API_BASE_URL}/consultationSchedule/${id}`,
    CONSULTATION_SCHEDULE_DELETE: (id) => `${API_BASE_URL}/consultationSchedule/${id}`,
    
    // Parent Prescription endpoints
    PARENT_PRESCRIPTION_LIST: `${API_BASE_URL}/parentPrescription/search`,
    PARENT_PRESCRIPTION_UPDATE: (id) => `${API_BASE_URL}/parentPrescription/${id}`,
    PARENT_PRESCRIPTION_DETAIL: (id) => `${API_BASE_URL}/parentPrescription/${id}`,
    
    // Vaccination Schedule endpoints
    VACCINATION_SCHEDULE_LIST: `${API_BASE_URL}/vaccinationSchedule/search`,
    VACCINATION_SCHEDULE_DETAIL: (id) => `${API_BASE_URL}/vaccinationSchedule/${id}`,
};

// Ham cha goi API
async function callApi(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error("Loi khi goi API");
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return res.json();
    }
    // Neu khong co body (vi du DELETE tra ve 204 No Content)
    return null;
}

// Cac ham con su dung ham cha
export const API_SERVICE = {
    blogAPI: {
        getAll: (data) => callApi(API.BLOG_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }),
        getById: (id) => callApi(API.BLOG_DETAIL(id), {
            method: "GET",
            header: { "Content-Type": "application/json" }
        }),
        delete: (id) => callApi(API.BLOG_DELETE(id), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        }),
        create: (formData) => callApi(API.BLOG_CREATE, {
            method: "POST",
            body: formData, // Don't set Content-Type for FormData
        }),
        update: (id, formData) => callApi(API.BLOG_UPDATE(id), {
            method: "PUT",
            body: formData, // Don't set Content-Type for FormData
        }),
        // Them cac ham POST/PUT/DELETE neu can
    },
    medicalEventAPI: {
        getAll: (data = {}) => callApi(API.MEDICAL_EVENT_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getById: (id) => callApi(API.MEDICAL_EVENT_DETAIL(id), {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        }),
        create: (data) => callApi(API.MEDICAL_EVENT_CREATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (id, data) => callApi(API.MEDICAL_EVENT_UPDATE(id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        delete: (id) => callApi(API.MEDICAL_EVENT_DELETE(id), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        }),
    },
    healthCheckResultAPI: {
        getAll: (data = {}) => callApi(API.HEALTH_CHECK_RESULT_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getById: (id) => callApi(API.HEALTH_CHECK_RESULT_DETAIL(id), {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        }),
        create: (data) => callApi(API.HEALTH_CHECK_RESULT_CREATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (id, data) => callApi(API.HEALTH_CHECK_RESULT_UPDATE(id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
    },
    vaccinationResultAPI: {
        getAll: (data = {}) => callApi(API.VACCINATION_RESULT_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getById: (id) => callApi(API.VACCINATION_RESULT_DETAIL(id), {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        }),
        create: (data) => callApi(API.VACCINATION_RESULT_CREATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (id, data) => callApi(API.VACCINATION_RESULT_UPDATE(id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
    },
    consultationScheduleAPI: {
        getAll: (data = {}) => callApi(API.CONSULTATION_SCHEDULE_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getById: (id) => callApi(API.CONSULTATION_SCHEDULE_DETAIL(id), {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        }),
        create: (data) => callApi(API.CONSULTATION_SCHEDULE_CREATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (id, data) => callApi(API.CONSULTATION_SCHEDULE_UPDATE(id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        delete: (id) => callApi(API.CONSULTATION_SCHEDULE_DELETE(id), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        }),
    },
    parentPrescriptionAPI: {
        getAll: (data = {}) => callApi(API.PARENT_PRESCRIPTION_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getById: (id) => callApi(API.PARENT_PRESCRIPTION_DETAIL(id), {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        }),
        update: (id, data) => callApi(API.PARENT_PRESCRIPTION_UPDATE(id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
    },
    vaccinationScheduleAPI: {
        getAll: (data = {}) => callApi(API.VACCINATION_SCHEDULE_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getById: (id) => callApi(API.VACCINATION_SCHEDULE_DETAIL(id), {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        }),
    },
    userAPI: {
        getProfile: () => callApi(API.USER_PROFILE, { credentials: "include" }),
        // Them cac ham khac neu can
    },
    documentAPI: {
        getAll: () => callApi(API.DOCUMENT_LIST),
        getById: (id) => callApi(API.DOCUMENT_DETAIL(id)),
        // Them cac ham khac neu can
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
        delete: (id) => callApi(API.STUDENT_DELETE(id), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        }),
        create: (data) => callApi(API.STUDENT_CREATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (id, data) => callApi(API.STUDENT_UPDATE(id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        // Them cac ham khac neu can
    },
    parentAPI: {
        getAll: (data) => callApi(API.PARENT_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        delete: (id) => callApi(API.PARENT_DELETE(id), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        }),
        search: (data) => callApi(API.PARENT_SEARCH, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        create: (data) => callApi(API.PARENT_CREATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (id, data) => callApi(API.PARENT_UPDATE(id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        // Them cac ham khac neu can
    },
    nurseAPI: {
        getAll: (data) => callApi(API.NURSE_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        delete: (id) => callApi(API.NURSE_DELETE(id), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        }),
        create: (data) => callApi(API.NURSE_CREATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (id, data) => callApi(API.NURSE_UPDATE(id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        // Them cac ham khac neu can
    },
    formAPI: {
        getAll: (params) => callApi(API.FORM_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params)
        }),
        getById: (id) => callApi(API.FORM_DETAIL(id), {
            method: "GET",
            header: { "Content-Type": "application/json" }
        }),
        create: (data) => callApi(API.FORM_CREATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (id, data) => callApi(API.FORM_UPDATE(id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        delete: (id) => callApi(API.FORM_DELETE(id), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        }),
        // Them cac ham khac neu can
    },
    healthCheckScheduleAPI: {
        getAll: (data) => callApi(API.HEALTH_CHECK_SCHEDULE_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getById: (id) => callApi(API.HEALTH_CHECK_SCHEDULE_DETAIL(id), {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        }),
        create: (data) => callApi(API.HEALTH_CHECK_SCHEDULE_CREATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (id, data) => callApi(API.HEALTH_CHECK_SCHEDULE_UPDATE(id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        delete: (id) => callApi(API.HEALTH_CHECK_SCHEDULE_DELETE(id), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        }),
    },
};

export default API;
