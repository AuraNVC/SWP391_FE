// eslint-disable-next-line no-undef
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5273/api";

// Định nghĩa endpoint
const API = {
    BLOG_LIST: `${API_BASE_URL}/blog/search`,
    BLOG_CREATE: `${API_BASE_URL}/blog/add`,
    BLOG_UPDATE: `${API_BASE_URL}/blog/update`,
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
    PARENT_UPDATE: `${API_BASE_URL}/parent/update`,
    PARENT_DELETE: (id) => `${API_BASE_URL}/parent/${id}`,
    PARENT_GET_BY_ID: (id) => `${API_BASE_URL}/parent/${id}`,
    NURSE_LIST: `${API_BASE_URL}/nurse/search`,
    NURSE_CREATE: `${API_BASE_URL}/nurse/add`,
    NURSE_UPDATE: (id) => `${API_BASE_URL}/nurse/${id}`,
    NURSE_DELETE: (id) => `${API_BASE_URL}/nurse/${id}`,
    NURSE_GET: (id) => `${API_BASE_URL}/nurse/${id}`,
    FORM_DETAIL: (id) => `${API_BASE_URL}/form/${id}`,
    FORM_LIST: `${API_BASE_URL}/form/search`,
    FORM_CREATE: `${API_BASE_URL}/form/add`,
    FORM_UPDATE: `${API_BASE_URL}/form/update`,
    FORM_DELETE: (id) => `${API_BASE_URL}/form/${id}`,
    HEALTH_CHECK_SCHEDULE_LIST: `${API_BASE_URL}/healthCheckSchedule/search`,
    HEALTH_CHECK_SCHEDULE_CREATE: `${API_BASE_URL}/healthCheckSchedule/create`,
    HEALTH_CHECK_SCHEDULE_UPDATE: (id) => `${API_BASE_URL}/healthCheckSchedule/${id}`,
    HEALTH_CHECK_SCHEDULE_DETAIL: (id) => `${API_BASE_URL}/healthCheckSchedule/${id}`,
    HEALTH_CHECK_SCHEDULE_DELETE: (id) => `${API_BASE_URL}/healthCheckSchedule/${id}`,
    STUDENT_DETAIL: (id) => `${API_BASE_URL}/student/${id}`,
    STUDENT_BY_PARENT: (parentId) => `${API_BASE_URL}/student/getParent${parentId}`,
    PARENT_PRESCRIPTION_BY_STUDENT: (studentId) => `${API_BASE_URL}/parent-prescription/student/${studentId}`,
    PARENT_PRESCRIPTION_BY_PARENT: (parentId) => `${API_BASE_URL}/parentPrescription/getPrescriptionByParent?parentId=${parentId}`,
    PARENT_PRESCRIPTION_GET_BY_PARENT: (parentId) => `${API_BASE_URL}/parentPrescription/getByParent?parentId=${parentId}`,
    PARENT_PRESCRIPTION_SEARCH: `${API_BASE_URL}/parentPrescription/search`,
    PARENT_PRESCRIPTION_GET_BY_ID: (id) => `${API_BASE_URL}/parentPrescription/${id}`,
    MEDICATION_BY_PRESCRIPTION: (prescriptionId) => `${API_BASE_URL}/Medication/getMedicalByPrescription?prescriptionId=${prescriptionId}`,
    MEDICATION_BY_STUDENT: (studentId) => `${API_BASE_URL}/Medication/getMedicalByStudent?studentId=${studentId}`,
    MEDICATION_GET_BY_ID: (id) => `${API_BASE_URL}/Medication/${id}`,
    MEDICATION_SEARCH: `${API_BASE_URL}/Medication/search`,
    MEDICATION_UPDATE: `${API_BASE_URL}/Medication/update`,
    MEDICATION_ADD: `${API_BASE_URL}/Medication/add`,
    PRESCRIPTION_BY_PRESCRIPTION: (prescriptionId) => `${API_BASE_URL}/prescription/getMedicalByPrescription?prescriptionId=${prescriptionId}`,
    PRESCRIPTION_BY_PARENT: (parentId) => `${API_BASE_URL}/prescription/getPrescriptionByParent?parentId=${parentId}`,
    PARENT_GET: (parentId) => `${API_BASE_URL}/parent/${parentId}`,
    HEALTH_PROFILE: (studentId) => `${API_BASE_URL}/healthProfile/${studentId}`,
    HEALTH_PROFILE_LIST: `${API_BASE_URL}/healthProfile/search`,
    HEALTH_PROFILE_UPDATE: `${API_BASE_URL}/healthProfile/update`,
    HEALTH_CHECK_RESULT_BY_PROFILE: (profileId) => `${API_BASE_URL}/HealthCheckResult/getResultsByProfile${profileId}`,
    HEALTH_CHECK_SCHEDULE: (scheduleId) => `${API_BASE_URL}/healthCheckSchedule/${scheduleId}`,
    VACCINATION_RESULT_LIST: `${API_BASE_URL}/vaccinationresult/search`,
    VACCINATION_RESULT_ADD: `${API_BASE_URL}/vaccinationresult/add`,
    VACCINATION_RESULT_UPDATE: `${API_BASE_URL}/vaccinationresult/update`,
    VACCINATION_RESULT_DELETE: (id) => `${API_BASE_URL}/vaccinationresult/${id}`,
    VACCINATION_RESULT_DETAIL: (id) => `${API_BASE_URL}/vaccinationresult/${id}`,
    VACCINATION_RESULT_BY_PROFILE: (profileId) => `${API_BASE_URL}/vaccinationresult/getResultsByProfile${profileId}`,
    VACCINATION_RESULT_BY_SCHEDULE: (scheduleId) => `${API_BASE_URL}/vaccinationresult/getResultsBySchedule/${scheduleId}`,
    VACCINATION_RESULT_COMPLETE: (id) => `${API_BASE_URL}/vaccinationresult/complete/${id}`,
    MEDICAL_EVENT_LIST: `${API_BASE_URL}/medicalEvent/search`,
    MEDICAL_EVENT_ADD: `${API_BASE_URL}/medicalEvent/add`,
    MEDICAL_EVENT_UPDATE: `${API_BASE_URL}/medicalEvent/update`,
    MEDICAL_EVENT_DELETE: (id) => `${API_BASE_URL}/medicalEvent/${id}`,
    MEDICAL_EVENT_BY_STUDENT: (studentId) => `${API_BASE_URL}/medicalEvent/getMedicalByStudent?studentId=${studentId}`,
    MEDICAL_EVENT_DETAIL: (id) => `${API_BASE_URL}/medicalEvent/${id}`,
    PARENT_PRESCRIPTION_ADD: `${API_BASE_URL}/parentPrescription/add`,
    MEDICATION_ADD: `${API_BASE_URL}/medication/add`,
    BLOG_UPLOAD_IMAGE: `${API_BASE_URL}/blog/uploadImage`,
    CONSENT_FORM_BY_PARENT: (parentId) => `${API_BASE_URL}/consentForm/getConsentFormByParent?parentId=${parentId}`,
    CONSENT_FORM_DETAIL: (endpoint, id) => `${API_BASE_URL}/consentForm/${endpoint}/${id}`,
    CONSULTATION_FORM_BY_STUDENT: (studentId) => `${API_BASE_URL}/ConsultationForm/getByStudent?studentId=${studentId}`,
    CONSULTATION_FORM_DETAIL: (endpoint, id) => `${API_BASE_URL}/ConsultationForm/${endpoint}/${id}`,
    CONSULTATION_FORM_BY_PARENT: (parentId) => `${API_BASE_URL}/ConsultationForm/getByParent?parentId=${parentId}`,
    CONSULTATION_FORM_SEARCH: `${API_BASE_URL}/ConsultationForm/search`,
    CONSULTATION_FORM_ADD: `${API_BASE_URL}/ConsultationForm/add`,
    CONSULTATION_FORM_UPDATE: `${API_BASE_URL}/ConsultationForm/update`,
    CONSULTATION_FORM_GET: (id) => `${API_BASE_URL}/ConsultationForm/${id}`,
    CONSULTATION_SCHEDULE: (id) => `${API_BASE_URL}/consultationSchedule/${id}`,
    CONSULTATION_SCHEDULE_SEARCH: `${API_BASE_URL}/consultationSchedule/search`,
    CONSULTATION_SCHEDULE_CREATE: `${API_BASE_URL}/consultationSchedule/create`,
    CONSULTATION_SCHEDULE_UPDATE: `${API_BASE_URL}/consultationSchedule/update`,
    CONSULTATION_SCHEDULE_DELETE: (id) => `${API_BASE_URL}/consultationSchedule/${id}`,
    HEALTH_CHECK_SCHEDULE_BY_FORM: (formId) => `${API_BASE_URL}/healthCheckSchedule/getByForm${formId}`,
    VACCINATION_SCHEDULE_LIST: `${API_BASE_URL}/vaccinationSchedule/search`,
    VACCINATION_SCHEDULE_CREATE: `${API_BASE_URL}/vaccinationSchedule/create`,
    VACCINATION_SCHEDULE_UPDATE: `${API_BASE_URL}/vaccinationSchedule/update`,
    VACCINATION_SCHEDULE_DETAIL: (id) => `${API_BASE_URL}/vaccinationSchedule/${id}`,
    VACCINATION_SCHEDULE_DELETE: (id) => `${API_BASE_URL}/vaccinationSchedule/${id}`,
    VACCINATION_SCHEDULE_BY_FORM: (formId) => `${API_BASE_URL}/vaccinationSchedule/getByForm${formId}`,
    VACCINATION_SCHEDULE: (scheduleId) => `${API_BASE_URL}/vaccinationSchedule/${scheduleId}`,
    HEALTH_CHECK_RESULT_LIST: `${API_BASE_URL}/HealthCheckResult/search`,
    HEALTH_CHECK_RESULT_ADD: `${API_BASE_URL}/HealthCheckResult/add`,
    HEALTH_CHECK_RESULT_UPDATE: `${API_BASE_URL}/HealthCheckResult/update`,
    HEALTH_CHECK_RESULT_DELETE: (id) => `${API_BASE_URL}/HealthCheckResult/${id}`,
    HEALTH_CHECK_RESULT_DETAIL: (id) => `${API_BASE_URL}/HealthCheckResult/${id}`,
    CONSENT_FORM_ACCEPT: (id) => `${API_BASE_URL}/consentForm/accept/${id}`,
    CONSENT_FORM_REJECT: (id) => `${API_BASE_URL}/consentForm/reject/${id}`,
    CONSULTATION_FORM_ACCEPT: (id) => `${API_BASE_URL}/ConsultationForm/accept/${id}`,
    CONSULTATION_FORM_REJECT: (id) => `${API_BASE_URL}/ConsultationForm/reject/${id}`,
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
            // console.log(`API Response: ${url}`, data);
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
        update: (formData) => callApi(API.BLOG_UPDATE, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData), // Don't set Content-Type for FormData
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
        update: (id, data) => callApi(API.PARENT_UPDATE, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getParent: (parentId) => callApi(API.PARENT_GET(parentId)),
        getById: (id) => callApi(API.PARENT_GET_BY_ID(id), {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        }),
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
        getById: (id) => callApi(API.NURSE_GET(id), {
            method: "GET",
            headers: { "Content-Type": "application/json" }
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
        update: (id, data) => callApi(API.FORM_UPDATE, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, formId: id })
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
        getById: (id) => callApi(API.PARENT_PRESCRIPTION_GET_BY_ID(id)),
    },
    medicationAPI: {
        getByPrescription: (prescriptionId) => callApi(API.MEDICATION_BY_PRESCRIPTION(prescriptionId)),
        getByStudent: (studentId) => callApi(API.MEDICATION_BY_STUDENT(studentId)),
        getById: (id) => callApi(API.MEDICATION_GET_BY_ID(id)),
        search: (data) => callApi(API.MEDICATION_SEARCH, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        add: (data) => callApi(API.MEDICATION_ADD, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (data) => callApi(API.MEDICATION_UPDATE, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
    },
    prescriptionAPI: {
        getByPrescription: (prescriptionId) => callApi(API.PRESCRIPTION_BY_PRESCRIPTION(prescriptionId)),
        getByParent: (parentId) => callApi(API.PRESCRIPTION_BY_PARENT(parentId)),
    },
    healthProfileAPI: {
        add: (data) => callApi(API_BASE_URL + "/healthProfile/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }),
        get: (studentId) => callApi(API.HEALTH_PROFILE(studentId)),
        getById: (id) => callApi(API.HEALTH_PROFILE(id)),
        getByStudent: (studentId) => callApi(API.HEALTH_PROFILE(studentId)),
        getAll: (data) => callApi(API.HEALTH_PROFILE_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        search: (data) => callApi(API.HEALTH_PROFILE_LIST, {
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
        update: (data) => callApi(API.VACCINATION_SCHEDULE_UPDATE, {
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
        search: (keyword) => callApi(API.CONSULTATION_FORM_SEARCH, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(keyword)
        }),
        accept: (id) => callApi(API.CONSULTATION_FORM_ACCEPT(id), { method: 'POST' }),
        reject: (id) => callApi(API.CONSULTATION_FORM_REJECT(id), { method: 'POST' }),
        create: (data) => callApi(API.CONSULTATION_FORM_ADD, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (id, data) => callApi(API.CONSULTATION_FORM_UPDATE, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, consultationFormId: id })
        }),
        getById: (id) => callApi(API.CONSULTATION_FORM_GET(id)),
    },
    consultationScheduleAPI: {
        get: (id) => callApi(API.CONSULTATION_SCHEDULE(id)),
        getAll: (data) => callApi(API.CONSULTATION_SCHEDULE_SEARCH, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getByStudent: (studentId) => callApi(`${API_BASE_URL}/consultationSchedule/getByStudent?studentId=${studentId}`),
        create: (data) => callApi(API.CONSULTATION_SCHEDULE_CREATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (id, data) => callApi(API.CONSULTATION_SCHEDULE_UPDATE, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, consultationScheduleId: id })
        }),
        delete: (id) => callApi(API.CONSULTATION_SCHEDULE_DELETE(id), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        })
    },
    parentPrescriptionAPI: {
        getPrescriptionByParent: (parentId) => callApi(API.PARENT_PRESCRIPTION_BY_PARENT(parentId)),
        getByParent: (parentId) => callApi(API.PARENT_PRESCRIPTION_GET_BY_PARENT(parentId)),
        getAll: (params) => callApi(API.PARENT_PRESCRIPTION_SEARCH, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params)
        }),
        getById: (id) => callApi(API.PARENT_PRESCRIPTION_GET_BY_ID(id)),
        update: (id, data) => callApi(`${API_BASE_URL}/parentPrescription/update`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({...data, prescriptionId: id})
        }),
        accept: (id) => callApi(`${API_BASE_URL}/parentPrescription/accept/${id}`, { method: 'POST' }),
        reject: (id) => callApi(`${API_BASE_URL}/parentPrescription/reject/${id}`, { method: 'POST' }),
        updateStatus: (data) => {
            if (data.status === "Accepted" || data.status === 2) {
                return callApi(`${API_BASE_URL}/parentPrescription/accept/${data.prescriptionId}`, { method: 'POST' });
            } else if (data.status === "Rejected" || data.status === 3) {
                return callApi(`${API_BASE_URL}/parentPrescription/reject/${data.prescriptionId}`, { method: 'POST' });
            }
            return Promise.reject(new Error("Trạng thái không hợp lệ"));
        },
        // ... các hàm khác nếu cần
    },
    notificationAPI: {
        create: (data) => {
            console.log("Attempting to create notification:", data);
            // Temporarily disable actual API call to avoid 404 errors
            console.warn("Notification API is currently under maintenance. The notification would be:", data);
            
            // Return a resolved promise to prevent errors in calling code
            return Promise.resolve({
                success: true,
                message: "Notification service is currently under maintenance"
            });
            
            // Commented out actual API call until endpoint is implemented
            /*
            return callApi(`${API_BASE_URL}/notification/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }).catch(error => {
                console.error("Error creating notification:", error);
                // Return a resolved promise with null to prevent crashes
                return Promise.resolve({
                    success: false,
                    message: "Failed to send notification"
                });
            });
            */
        },
        getByUser: (userId) => callApi(`${API_BASE_URL}/notification/getByUser?userId=${userId}`),
        markAsRead: (notificationId) => callApi(`${API_BASE_URL}/notification/markAsRead/${notificationId}`, {
            method: "PUT"
        }),
        delete: (notificationId) => callApi(`${API_BASE_URL}/notification/delete/${notificationId}`, {
            method: "DELETE"
        })
    },
      medicalInventoryAPI: {
        getById: (id) => callApi(`${API_BASE_URL}/medicalInventory/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        }),
        delete: (id) => callApi(`${API_BASE_URL}/medicalInventory/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        }),
        create: (data) => callApi(`${API_BASE_URL}/medicalInventory/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (data) => callApi(`${API_BASE_URL}/medicalInventory/update`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        search: (data) => callApi(`${API_BASE_URL}/medicalInventory/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
    },
    // Thêm các nhóm API khác nếu cần
};

const getPrescriptionFileUrl = (filePathOrName) => {
  if (!filePathOrName) return null;
  
  // Nếu đã là URL đầy đủ, trả về nguyên dạng
  if (filePathOrName.startsWith('http')) {
    return filePathOrName;
  }
  
  // Xử lý tên file để đảm bảo định dạng đúng
  const fileName = filePathOrName.includes('/') 
    ? filePathOrName.split('/').pop() 
    : filePathOrName;
  
  console.log("Processing prescription file:", filePathOrName);
  console.log("Extracted filename:", fileName);
  
  // Sử dụng API_BASE_URL từ biến môi trường hoặc cấu hình
  // Đảm bảo sử dụng đúng port API (5273) và đường dẫn đúng
  return `${window.location.protocol}//${window.location.hostname}:5273/api/files/parentPrecriptions/${fileName}`;
};