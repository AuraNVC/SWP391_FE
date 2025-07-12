// eslint-disable-next-line no-undef
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Định nghĩa endpoint
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
    STUDENT_DETAIL: (id) => `${API_BASE_URL}/student/${id}`,
    STUDENT_BY_PARENT: (parentId) => `${API_BASE_URL}/student/parent/${parentId}`,
    PARENT_PRESCRIPTION_BY_STUDENT: (studentId) => `${API_BASE_URL}/parent-prescription/student/${studentId}`,
    PARENT_PRESCRIPTION_BY_PARENT: (parentId) => `${API_BASE_URL}/parentPrescription/getPrescriptionByParent?parentId=${parentId}`,
    PARENT_PRESCRIPTION_GET_BY_PARENT: (parentId) => `${API_BASE_URL}/parentPrescription/getByParent?parentId=${parentId}`,
    MEDICATION_BY_PRESCRIPTION: (prescriptionId) => `${API_BASE_URL}/medication/getMedicalByPrescription?prescriptionId=${prescriptionId}`,
    PRESCRIPTION_BY_PRESCRIPTION: (prescriptionId) => `${API_BASE_URL}/prescription/getMedicalByPrescription?prescriptionId=${prescriptionId}`,
    PRESCRIPTION_BY_PARENT: (parentId) => `${API_BASE_URL}/prescription/getPrescriptionByParent?parentId=${parentId}`,
    PARENT_GET: (parentId) => `${API_BASE_URL}/student/getParent${parentId}`,
    HEALTH_PROFILE: (studentId) => `${API_BASE_URL}/healthProfile/${studentId}`,
    HEALTH_PROFILE_LIST: `${API_BASE_URL}/healthProfile/search`,
    HEALTH_PROFILE_UPDATE: `${API_BASE_URL}/healthProfile/update`,
    HEALTH_CHECK_RESULT_BY_PROFILE: (profileId) => `${API_BASE_URL}/healthCheckResult/getResultsByProfile/${profileId}`,
    HEALTH_CHECK_SCHEDULE: (scheduleId) => `${API_BASE_URL}/healthCheckSchedule/${scheduleId}`,
    VACCINATION_RESULT_LIST: `${API_BASE_URL}/vaccinationresult/search`,
    VACCINATION_RESULT_ADD: `${API_BASE_URL}/vaccinationresult/add`,
    VACCINATION_RESULT_UPDATE: `${API_BASE_URL}/vaccinationresult/update`,
    VACCINATION_RESULT_DELETE: (id) => `${API_BASE_URL}/vaccinationresult/${id}`,
    VACCINATION_RESULT_DETAIL: (id) => `${API_BASE_URL}/vaccinationresult/${id}`,
    VACCINATION_RESULT_BY_PROFILE: (profileId) => `${API_BASE_URL}/vaccinationresult/getResultsByProfile/${profileId}`,
    VACCINATION_RESULT_BY_SCHEDULE: (scheduleId) => `${API_BASE_URL}/vaccinationresult/getResultsBySchedule/${scheduleId}`,
    VACCINATION_RESULT_COMPLETE: (id) => `${API_BASE_URL}/vaccinationresult/complete/${id}`,
    MEDICAL_EVENT_LIST: `${API_BASE_URL}/medicalEvent/search`,
    MEDICAL_EVENT_ADD: `${API_BASE_URL}/medicalEvent/add`,
    MEDICAL_EVENT_UPDATE: `${API_BASE_URL}/medicalEvent/update`,
    MEDICAL_EVENT_DELETE: (id) => `${API_BASE_URL}/medicalEvent/${id}`,
    MEDICAL_EVENT_BY_STUDENT: (studentId) => `${API_BASE_URL}/medicalEvent/getMedicalByStudent?studentId=${studentId}`,
    MEDICAL_EVENT_DETAIL: (id) => `${API_BASE_URL}/medicalEvent/${id}`,
    PARENT_PRESCRIPTION_ADD: `${API_BASE_URL}/parentPrescription/add`,
    PARENT_PRESCRIPTION_SEARCH: `${API_BASE_URL}/parentPrescription/search`,
    PARENT_PRESCRIPTION_UPDATE: (id) => `${API_BASE_URL}/parentPrescription/${id}`,
    MEDICATION_ADD: `${API_BASE_URL}/medication/add`,
    BLOG_UPLOAD_IMAGE: `${API_BASE_URL}/blog/uploadImage`,
    CONSENT_FORM_BY_PARENT: (parentId) => `${API_BASE_URL}/consentForm/getConsentFormByParent?parentId=${parentId}`,
    CONSENT_FORM_DETAIL: (endpoint, id) => `${API_BASE_URL}/consentForm/${endpoint}/${id}`,
    CONSULTATION_FORM_BY_STUDENT: (studentId) => `${API_BASE_URL}/consultationForm/getByStudent?studentId=${studentId}`,
    CONSULTATION_FORM_DETAIL: (endpoint, id) => `${API_BASE_URL}/consultationForm/${endpoint}/${id}`,
    CONSULTATION_FORM_BY_PARENT: (parentId) => `${API_BASE_URL}/consultationForm/getByParent?parentId=${parentId}`,
    CONSULTATION_SCHEDULE: (id) => `${API_BASE_URL}/consultationSchedule/${id}`,
    HEALTH_CHECK_SCHEDULE_BY_FORM: (formId) => `${API_BASE_URL}/healthCheckSchedule/getByForm${formId}`,
    VACCINATION_SCHEDULE_LIST: `${API_BASE_URL}/vaccinationschedule/search`,
    VACCINATION_SCHEDULE_CREATE: `${API_BASE_URL}/vaccinationschedule/create`,
    VACCINATION_SCHEDULE_UPDATE: (id) => `${API_BASE_URL}/vaccinationschedule/${id}`,
    VACCINATION_SCHEDULE_DETAIL: (id) => `${API_BASE_URL}/vaccinationschedule/${id}`,
    VACCINATION_SCHEDULE_DELETE: (id) => `${API_BASE_URL}/vaccinationschedule/${id}`,
    VACCINATION_SCHEDULE_BY_FORM: (formId) => `${API_BASE_URL}/vaccinationschedule/getByForm${formId}`,
    VACCINATION_SCHEDULE: (scheduleId) => `${API_BASE_URL}/vaccinationschedule/${scheduleId}`,
    HEALTH_CHECK_RESULT_LIST: `${API_BASE_URL}/healthCheckResult/search`,
    HEALTH_CHECK_RESULT_ADD: `${API_BASE_URL}/healthCheckResult/add`,
    HEALTH_CHECK_RESULT_UPDATE: `${API_BASE_URL}/healthCheckResult/update`,
    HEALTH_CHECK_RESULT_DELETE: (id) => `${API_BASE_URL}/healthCheckResult/${id}`,
    HEALTH_CHECK_RESULT_DETAIL: (id) => `${API_BASE_URL}/healthCheckResult/${id}`,
    CONSENT_FORM_ACCEPT: (id) => `${API_BASE_URL}/consentForm/accept/${id}`,
    CONSENT_FORM_REJECT: (id) => `${API_BASE_URL}/consentForm/reject/${id}`,
    CONSULTATION_FORM_ACCEPT: (id) => `${API_BASE_URL}/consultationForm/accept/${id}`,
    CONSULTATION_FORM_REJECT: (id) => `${API_BASE_URL}/consultationForm/reject/${id}`,
    // Thêm các endpoint khác nếu cần
};

// Hàm cha gọi API
async function callApi(url, options = {}) {
    try {
        console.log(`Calling API: ${url}`, options);
    const res = await fetch(url, options);
        
        if (!res.ok) {
            const errorText = await res.text();
            let errorMessage;
            try {
                // Thử parse JSON error message
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorJson.title || errorJson.error || errorText;
            } catch {
                // Nếu không phải JSON, sử dụng text gốc
                errorMessage = errorText;
            }
            
            console.error(`API Error (${res.status}): ${url}`, errorMessage);
            throw new Error(`${res.status} - ${errorMessage}`);
        }
        
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            console.log(`API Response: ${url}`, data);
            return data;
    }
        
    // Nếu không có body (ví dụ DELETE trả về 204 No Content)
        console.log(`API Success (no content): ${url}`);
    return null;
    } catch (error) {
        console.error(`API Call Failed: ${url}`, error);
        throw error;
    }
}

// Export API và callApi để sử dụng trong các file khác
export { API, callApi };

// Các hàm con sử dụng hàm cha
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
        create: (data) => callApi(API.BLOG_CREATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }),
        update: (id, formData) => callApi(API.BLOG_UPDATE(id), {
            method: "PUT",
            body: formData, // Don't set Content-Type for FormData
        }),
        uploadImage: (formData) => callApi(API.BLOG_UPLOAD_IMAGE, {
            method: "POST",
            body: formData,
        }),
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
        getById: (id) => callApi(API.STUDENT_DETAIL(id)),
        getByParent: (parentId) => callApi(API.STUDENT_BY_PARENT(parentId)),
        // Thêm các hàm khác nếu cần
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
        getParent: (parentId) => callApi(API.PARENT_GET(parentId)),
        // Thêm các hàm khác nếu cần
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
        // Thêm các hàm khác nếu cần
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
        // Thêm các hàm khác nếu cần
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
        get: (scheduleId) => callApi(API.HEALTH_CHECK_SCHEDULE(scheduleId)),
        getByForm: (formId) => callApi(API.HEALTH_CHECK_SCHEDULE_BY_FORM(formId)),
    },
    studentPrescriptionAPI: {
        getByStudent: (studentId) => callApi(API.PARENT_PRESCRIPTION_BY_STUDENT(studentId)),
        getPrescriptionByParent: (parentId) => callApi(API.PARENT_PRESCRIPTION_BY_PARENT(parentId)),
        getByParent: (parentId) => callApi(API.PARENT_PRESCRIPTION_GET_BY_PARENT(parentId)),
        add: (data) => callApi(API.PARENT_PRESCRIPTION_ADD, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (id, data) => callApi(API.PARENT_PRESCRIPTION_UPDATE(id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
    },
    medicationAPI: {
        getByPrescription: (prescriptionId) => callApi(API.MEDICATION_BY_PRESCRIPTION(prescriptionId)),
        add: (data) => callApi(API.MEDICATION_ADD, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
    },
    prescriptionAPI: {
        getByPrescription: (prescriptionId) => callApi(API.PRESCRIPTION_BY_PRESCRIPTION(prescriptionId)),
        getByParent: (parentId) => callApi(API.PRESCRIPTION_BY_PARENT(parentId)),
    },
    healthProfileAPI: {
        get: (studentId) => callApi(API.HEALTH_PROFILE(studentId)),
        getById: (id) => callApi(API.HEALTH_PROFILE(id)),
        getAll: (data) => callApi(API.HEALTH_PROFILE_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (healthProfileId, data) => callApi(API.HEALTH_PROFILE_UPDATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ healthProfileId, ...data })
        }),
    },
    healthCheckResultAPI: {
        getAll: (data) => callApi(API.HEALTH_CHECK_RESULT_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getByProfile: (profileId) => callApi(API.HEALTH_CHECK_RESULT_BY_PROFILE(profileId)),
        getById: (id) => callApi(API.HEALTH_CHECK_RESULT_DETAIL(id)),
        create: (data) => callApi(API.HEALTH_CHECK_RESULT_ADD, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (data) => callApi(API.HEALTH_CHECK_RESULT_UPDATE, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        delete: (id) => callApi(API.HEALTH_CHECK_RESULT_DELETE(id), {
            method: "DELETE"
        }),
    },
    vaccinationScheduleAPI: {
        getAll: (data) => callApi(API.VACCINATION_SCHEDULE_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getById: (id) => callApi(API.VACCINATION_SCHEDULE_DETAIL(id), {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        }),
        create: (data) => callApi(API.VACCINATION_SCHEDULE_CREATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (id, data) => callApi(API.VACCINATION_SCHEDULE_UPDATE(id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        delete: (id) => callApi(API.VACCINATION_SCHEDULE_DELETE(id), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        }),
        getByForm: (formId) => callApi(API.VACCINATION_SCHEDULE_BY_FORM(formId)),
    },
    vaccinationResultAPI: {
        getAll: (data) => callApi(API.VACCINATION_RESULT_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getByProfile: (profileId) => callApi(API.VACCINATION_RESULT_BY_PROFILE(profileId)),
        getBySchedule: (scheduleId) => callApi(API.VACCINATION_RESULT_BY_SCHEDULE(scheduleId)),
        getById: (id) => callApi(API.VACCINATION_RESULT_DETAIL(id)),
        create: (data) => callApi(API.VACCINATION_RESULT_ADD, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (id, data) => {
            // Đảm bảo ID trong payload chính xác
            const payload = {
                ...data,
                // Luôn đảm bảo vaccinationResultId trong payload
                vaccinationResultId: parseInt(id)
            };
            
            console.log(`Sending update request for vaccination result ${id} with payload:`, payload);
            
            return callApi(API.VACCINATION_RESULT_UPDATE, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        },
        delete: (id) => callApi(API.VACCINATION_RESULT_DELETE(id), {
            method: "DELETE"
        }),
        complete: (id) => callApi(API.VACCINATION_RESULT_COMPLETE(id), {
            method: "POST"
        })
    },
    medicalEventAPI: {
        getAll: (data) => callApi(API.MEDICAL_EVENT_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getByStudent: (studentId) => callApi(API.MEDICAL_EVENT_BY_STUDENT(studentId)),
        getById: (id) => callApi(API.MEDICAL_EVENT_DETAIL(id)),
        create: (data) => callApi(API.MEDICAL_EVENT_ADD, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (data) => callApi(API.MEDICAL_EVENT_UPDATE, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        delete: (id) => callApi(API.MEDICAL_EVENT_DELETE(id), {
            method: "DELETE"
        }),
    },
    consentFormAPI: {
        getByParent: (parentId) => callApi(API.CONSENT_FORM_BY_PARENT(parentId)),
        getDetail: (endpoint, id) => callApi(API.CONSENT_FORM_DETAIL(endpoint, id)),
        accept: (id) => callApi(API.CONSENT_FORM_ACCEPT(id), { method: 'POST' }),
        reject: (id) => callApi(API.CONSENT_FORM_REJECT(id), { method: 'POST' }),
    },
    consultationFormAPI: {
        getByStudent: (studentId) => callApi(API.CONSULTATION_FORM_BY_STUDENT(studentId)),
        getDetail: (endpoint, id) => callApi(API.CONSULTATION_FORM_DETAIL(endpoint, id)),
        getByParent: (parentId) => callApi(API.CONSULTATION_FORM_BY_PARENT(parentId)),
        accept: (id) => callApi(API.CONSULTATION_FORM_ACCEPT(id), { method: 'POST' }),
        reject: (id) => callApi(API.CONSULTATION_FORM_REJECT(id), { method: 'POST' }),
    },
    consultationScheduleAPI: {
        get: (id) => callApi(API.CONSULTATION_SCHEDULE_GET_BY_ID(id), {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        }),
        getAll: (data) => callApi(API.CONSULTATION_SCHEDULE_GET_ALL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getByStudent: (studentId) => callApi(API.CONSULTATION_SCHEDULE_GET_BY_STUDENT(studentId), {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        }),
        create: (data) => callApi(API.CONSULTATION_SCHEDULE_CREATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (id, data) => {
            // Đảm bảo ID trong payload
            const payload = {
                ...data,
                consultationScheduleId: parseInt(id)
            };
            
            return callApi(API.CONSULTATION_SCHEDULE_UPDATE, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        },
        delete: (id) => callApi(API.CONSULTATION_SCHEDULE_DELETE(id), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        })
    },
    parentPrescriptionAPI: {
        getAll: (data) => callApi(API.PARENT_PRESCRIPTION_SEARCH, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getPrescriptionByParent: (parentId) => callApi(API.PARENT_PRESCRIPTION_BY_PARENT(parentId)),
        getByParent: (parentId) => callApi(API.PARENT_PRESCRIPTION_GET_BY_PARENT(parentId)),
        add: (data) => callApi(API.PARENT_PRESCRIPTION_ADD, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (id, data) => callApi(API.PARENT_PRESCRIPTION_UPDATE(id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
    },
    // Thêm các nhóm API khác nếu cần
};