// eslint-disable-next-line no-undef
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5273/api";

console.log("API_BASE_URL:", API_BASE_URL);

// Kiểm tra kết nối WebSocket
const checkWebSocketConnection = () => {
  try {
    const ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);
    
    ws.onopen = () => {
      console.log("WebSocket connection established");
      ws.close();
    };
    
    ws.onerror = (error) => {
      console.log("WebSocket connection error:", error);
      // Không hiển thị lỗi WebSocket trong console
      error.preventDefault && error.preventDefault();
    };
    
    return ws;
  } catch (error) {
    console.log("Failed to create WebSocket connection:", error);
    return null;
  }
};

// Khởi tạo WebSocket nếu cần
(() => {
  try {
    checkWebSocketConnection();
  } catch (error) {
    console.log("WebSocket initialization error:", error);
  }
})();

// Dinh nghia endpoint
const API = {
    BLOG_LIST: `${API_BASE_URL}/blog/search`,
    BLOG_CREATE: `${API_BASE_URL}/blog/add`,
    BLOG_UPDATE: (id) => `${API_BASE_URL}/blog/${id}`,
    BLOG_DETAIL: (id) => `${API_BASE_URL}/blog/${id}`,
    BLOG_DELETE: (id) => `${API_BASE_URL}/blog/${id}`,
    BLOG_UPLOAD_IMAGE: `${API_BASE_URL}/blog/uploadImage`,
    
    LOGIN_MANAGER: `${API_BASE_URL}/manager/authorize`,
    LOGIN_STUDENT: `${API_BASE_URL}/student/login`,
    LOGIN_NURSE: `${API_BASE_URL}/nurse/login`,
    LOGIN_PARENT: `${API_BASE_URL}/parent/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    USER_PROFILE: `${API_BASE_URL}/user/profile`,
    DOCUMENT_LIST: `${API_BASE_URL}/documents`,
    DOCUMENT_DETAIL: (id) => `${API_BASE_URL}/documents/${id}`,
    
    // Student endpoints
    STUDENT_LIST: `${API_BASE_URL}/student/search`,
    STUDENT_CREATE: `${API_BASE_URL}/student/add`,
    STUDENT_UPDATE: (id) => `${API_BASE_URL}/student/${id}`,
    STUDENT_DELETE: (id) => `${API_BASE_URL}/student/${id}`,
    STUDENT_DETAIL: (id) => `${API_BASE_URL}/student/${id}`,
    STUDENT_BY_PARENT: (parentId) => `${API_BASE_URL}/student/parent/${parentId}`,
    
    // Parent endpoints
    PARENT_LIST: `${API_BASE_URL}/parent/search`,
    PARENT_SEARCH: `${API_BASE_URL}/parent/search`,
    PARENT_CREATE: `${API_BASE_URL}/parent/add`,
    PARENT_UPDATE: (id) => `${API_BASE_URL}/parent/${id}`,
    PARENT_DELETE: (id) => `${API_BASE_URL}/parent/${id}`,
    PARENT_GET: (parentId) => `${API_BASE_URL}/student/getParent${parentId}`,
    
    // Nurse endpoints
    NURSE_LIST: `${API_BASE_URL}/nurse/search`,
    NURSE_CREATE: `${API_BASE_URL}/nurse/add`,
    NURSE_UPDATE: (id) => `${API_BASE_URL}/nurse/${id}`,
    NURSE_DELETE: (id) => `${API_BASE_URL}/nurse/${id}`,
    
    // Form endpoints
    FORM_LIST: `${API_BASE_URL}/form/search`,
    FORM_CREATE: `${API_BASE_URL}/form/add`,
    FORM_DELETE: (id) => `${API_BASE_URL}/form/${id}`,
    
    // Health Check Schedule endpoints
    HEALTH_CHECK_SCHEDULE_LIST: `${API_BASE_URL}/healthCheckSchedule/search`,
    HEALTH_CHECK_SCHEDULE_CREATE: `${API_BASE_URL}/healthCheckSchedule/create`,
    HEALTH_CHECK_SCHEDULE_UPDATE: (id) => `${API_BASE_URL}/healthCheckSchedule/${id}`,
    HEALTH_CHECK_SCHEDULE_DETAIL: (id) => `${API_BASE_URL}/healthCheckSchedule/${id}`,
    HEALTH_CHECK_SCHEDULE_DELETE: (id) => `${API_BASE_URL}/healthCheckSchedule/${id}`,
    HEALTH_CHECK_SCHEDULE: (scheduleId) => `${API_BASE_URL}/healthCheckSchedule/${scheduleId}`,
    HEALTH_CHECK_SCHEDULE_BY_FORM: (formId) => `${API_BASE_URL}/healthCheckSchedule/getByForm${formId}`,
    
    // Medical Event endpoints
    MEDICAL_EVENT_LIST: `${API_BASE_URL}/medicalEvent/search`,
    MEDICAL_EVENT_CREATE: `${API_BASE_URL}/medicalEvent/add`,
    MEDICAL_EVENT_UPDATE: `${API_BASE_URL}/medicalEvent/update`,
    MEDICAL_EVENT_DETAIL: (id) => `${API_BASE_URL}/medicalEvent/${id}`,
    MEDICAL_EVENT_DELETE: (id) => `${API_BASE_URL}/medicalEvent/${id}`,
    MEDICAL_EVENT_BY_STUDENT: (studentId) => `${API_BASE_URL}/medicalEvent/getMedicalByStudent?studentId=${studentId}`,
    
    // Health Check Result endpoints
    HEALTH_CHECK_RESULT_LIST: `${API_BASE_URL}/healthCheckResult/search`,
    HEALTH_CHECK_RESULT_CREATE: `${API_BASE_URL}/healthCheckResult/add`,
    HEALTH_CHECK_RESULT_UPDATE: (id) => `${API_BASE_URL}/healthCheckResult/${id}`,
    HEALTH_CHECK_RESULT_DETAIL: (id) => `${API_BASE_URL}/healthCheckResult/${id}`,
    HEALTH_CHECK_RESULT_DELETE: (id) => `${API_BASE_URL}/healthCheckResult/${id}`,
    HEALTH_CHECK_RESULT_BY_PROFILE: (profileId) => `${API_BASE_URL}/healthCheckResult/getResultsByProfile${profileId}`,
    
    // Health Profile endpoints
    HEALTH_PROFILE_LIST: `${API_BASE_URL}/healthProfile/search`,
    HEALTH_PROFILE_CREATE: `${API_BASE_URL}/healthProfile/add`,
    HEALTH_PROFILE_UPDATE: (id) => `${API_BASE_URL}/healthProfile/${id}`,
    HEALTH_PROFILE_DETAIL: (id) => `${API_BASE_URL}/healthProfile/${id}`,
    HEALTH_PROFILE_DELETE: (id) => `${API_BASE_URL}/healthProfile/${id}`,
    HEALTH_PROFILE: (studentId) => `${API_BASE_URL}/healthProfile/${studentId}`,
    
    // Vaccination Result endpoints
    VACCINATION_RESULT_LIST: `${API_BASE_URL}/vaccinationResult/search`,
    VACCINATION_RESULT_CREATE: `${API_BASE_URL}/vaccinationResult/add`,
    VACCINATION_RESULT_UPDATE: (id) => `${API_BASE_URL}/vaccinationResult/${id}`,
    VACCINATION_RESULT_DETAIL: (id) => `${API_BASE_URL}/vaccinationResult/${id}`,
    VACCINATION_RESULT_BY_PROFILE: (profileId) => `${API_BASE_URL}/vaccinationResult/getResultsByProfile${profileId}`,
    
    // Consultation Schedule endpoints
    CONSULTATION_SCHEDULE_LIST: `${API_BASE_URL}/consultationSchedule/search`,
    CONSULTATION_SCHEDULE_CREATE: `${API_BASE_URL}/consultationSchedule/create`,
    CONSULTATION_SCHEDULE_UPDATE: `${API_BASE_URL}/consultationSchedule/update`,
    CONSULTATION_SCHEDULE_DETAIL: (id) => `${API_BASE_URL}/consultationSchedule/${id}`,
    CONSULTATION_SCHEDULE_DELETE: (id) => `${API_BASE_URL}/consultationSchedule/${id}`,
    CONSULTATION_SCHEDULE_BY_STUDENT: (studentId) => `${API_BASE_URL}/consultationSchedule/getByStudent?studentId=${studentId}`,
    CONSULTATION_SCHEDULE: (id) => `${API_BASE_URL}/consultationSchedule/${id}`,
    
    // Consultation Form endpoints
    CONSULTATION_FORM_LIST: `${API_BASE_URL}/consultationForm/search`,
    CONSULTATION_FORM_CREATE: `${API_BASE_URL}/consultationForm/add`,
    CONSULTATION_FORM_UPDATE: `${API_BASE_URL}/consultationForm/update`,
    CONSULTATION_FORM_DETAIL: (id) => `${API_BASE_URL}/consultationForm/${id}`,
    CONSULTATION_FORM_BY_SCHEDULE: (scheduleId) => `${API_BASE_URL}/consultationForm/getBySchedule?scheduleId=${scheduleId}`,
    CONSULTATION_FORM_BY_STUDENT: (studentId) => `${API_BASE_URL}/consultationForm/getByStudent?studentId=${studentId}`,
    CONSULTATION_FORM_BY_PARENT: (parentId) => `${API_BASE_URL}/consultationForm/getByParent?parentId=${parentId}`,
    CONSULTATION_FORM_ACCEPT: (id) => `${API_BASE_URL}/consultationForm/accept/${id}`,
    CONSULTATION_FORM_REJECT: (id) => `${API_BASE_URL}/consultationForm/reject/${id}`,
    
    // Parent Prescription endpoints
    PARENT_PRESCRIPTION_LIST: `${API_BASE_URL}/parentPrescription/search`,
    PARENT_PRESCRIPTION_UPDATE: (id) => `${API_BASE_URL}/parentPrescription/${id}`,
    PARENT_PRESCRIPTION_DETAIL: (id) => `${API_BASE_URL}/parentPrescription/${id}`,
    PARENT_PRESCRIPTION_BY_STUDENT: (studentId) => `${API_BASE_URL}/parent-prescription/student/${studentId}`,
    PARENT_PRESCRIPTION_BY_PARENT: (parentId) => `${API_BASE_URL}/parentPrescription/getPrescriptionByParent?parentId=${parentId}`,
    PARENT_PRESCRIPTION_GET_BY_PARENT: (parentId) => `${API_BASE_URL}/parentPrescription/getByParent?parentId=${parentId}`,
    PARENT_PRESCRIPTION_ADD: `${API_BASE_URL}/parentPrescription/add`,
    
    // Medication endpoints
    MEDICATION_BY_PRESCRIPTION: (prescriptionId) => `${API_BASE_URL}/medication/getMedicalByPrescription?prescriptionId=${prescriptionId}`,
    MEDICATION_ADD: `${API_BASE_URL}/medication/add`,
    
    // Prescription endpoints
    PRESCRIPTION_BY_PRESCRIPTION: (prescriptionId) => `${API_BASE_URL}/prescription/getMedicalByPrescription?prescriptionId=${prescriptionId}`,
    PRESCRIPTION_BY_PARENT: (parentId) => `${API_BASE_URL}/prescription/getPrescriptionByParent?parentId=${parentId}`,
    
    // Vaccination Schedule endpoints
    VACCINATION_SCHEDULE_LIST: `${API_BASE_URL}/vaccinationSchedule/search`,
    VACCINATION_SCHEDULE_CREATE: `${API_BASE_URL}/vaccinationSchedule/create`,
    VACCINATION_SCHEDULE_UPDATE: (id) => `${API_BASE_URL}/vaccinationSchedule/${id}`,
    VACCINATION_SCHEDULE_DETAIL: (id) => `${API_BASE_URL}/vaccinationSchedule/${id}`,
    VACCINATION_SCHEDULE_DELETE: (id) => `${API_BASE_URL}/vaccinationSchedule/${id}`,
    VACCINATION_SCHEDULE: (scheduleId) => `${API_BASE_URL}/vaccinationSchedule/${scheduleId}`,
    VACCINATION_SCHEDULE_BY_FORM: (formId) => `${API_BASE_URL}/vaccinationSchedule/getByForm${formId}`,
    
    // Consent Form endpoints
    CONSENT_FORM_BY_PARENT: (parentId) => `${API_BASE_URL}/consentForm/getConsentFormByParent?parentId=${parentId}`,
    CONSENT_FORM_DETAIL: (endpoint, id) => `${API_BASE_URL}/consentForm/${endpoint}/${id}`,
    CONSENT_FORM_ACCEPT: (id) => `${API_BASE_URL}/consentForm/accept/${id}`,
    CONSENT_FORM_REJECT: (id) => `${API_BASE_URL}/consentForm/reject/${id}`,
};

// Ham cha goi API
async function callApi(url, options = {}) {
    try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        // Add abort signal to options
        const fetchOptions = {
            ...options,
            signal: controller.signal
        };
        
        // Thêm retry logic
        let retries = 3;
        let res = null;
        
        while (retries > 0) {
            try {
                res = await fetch(url, fetchOptions);
                break; // Thoát khỏi vòng lặp nếu thành công
            } catch (error) {
                retries--;
                if (retries === 0) throw error; // Nếu hết số lần thử, ném lỗi
                
                // Đợi trước khi thử lại (exponential backoff)
                const waitTime = Math.pow(2, 3 - retries) * 1000;
                console.log(`API call failed, retrying in ${waitTime}ms... (${retries} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
        
        // Clear timeout since request completed
        clearTimeout(timeoutId);
        
        if (!res.ok) {
            // Chỉ đọc response một lần và lưu lại
            let responseData;
            const contentType = res.headers.get("content-type");
            
            try {
                // Đọc response dựa trên content-type
                if (contentType && contentType.includes("application/json")) {
                    responseData = await res.json();
                } else {
                    responseData = await res.text();
                }
                
                // Xử lý lỗi với dữ liệu đã đọc
                if (typeof responseData === 'object' && responseData.message) {
                    throw new Error(`API error (${res.status}): ${responseData.message}`);
                } else if (typeof responseData === 'string') {
                    throw new Error(`API error (${res.status}): ${responseData}`);
                } else {
                    throw new Error(`API error (${res.status}): ${JSON.stringify(responseData)}`);
                }
            } catch (e) {
                if (e.message.includes('API error')) {
                    throw e; // Nếu đã xử lý lỗi ở trên, ném lại lỗi đó
                }
                throw new Error(`API error (${res.status}): ${e.message}`);
            }
        }
        
        // Đọc response thành công
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
            return await res.json();
        }
        
        // Neu khong co body (vi du DELETE tra ve 204 No Content)
        return null;
    } catch (error) {
        // Handle specific network errors
        if (error.name === 'AbortError') {
            console.error('API request timed out');
            throw new Error('Yêu cầu API đã hết thời gian chờ. Vui lòng thử lại.');
        }
        
        if (error.message && error.message.includes('Failed to fetch')) {
            console.error('Network error:', error);
            throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.');
        }
        
        // Xử lý lỗi CORS
        if (error.message && error.message.includes('CORS')) {
            console.error('CORS error:', error);
            throw new Error('Lỗi CORS: Không thể truy cập API từ nguồn hiện tại.');
        }
        
        console.error(`API call failed: ${error.message}`);
        throw error;
    }
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
            headers: { "Content-Type": "application/json" }
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
    },
    medicalEventAPI: {
        getAll: (data = {}) => callApi(API.MEDICAL_EVENT_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getById: (id) => callApi(API.MEDICAL_EVENT_DETAIL(id)),
        create: (data) => callApi(API.MEDICAL_EVENT_CREATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (id, data) => callApi(API.MEDICAL_EVENT_UPDATE, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, medicalEventId: id })
        }),
        delete: (id) => callApi(API.MEDICAL_EVENT_DELETE(id), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        }),
        getByStudent: (studentId) => callApi(API.MEDICAL_EVENT_BY_STUDENT(studentId))
    },
    healthCheckResultAPI: {
        getAll: (data = {}) => callApi(API.HEALTH_CHECK_RESULT_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getById: (id) => callApi(API.HEALTH_CHECK_RESULT_DETAIL(id)),
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
        delete: (id) => callApi(API.HEALTH_CHECK_RESULT_DELETE(id), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        }),
        getByProfile: (profileId) => callApi(API.HEALTH_CHECK_RESULT_BY_PROFILE(profileId))
    },
    vaccinationResultAPI: {
        getAll: (data = {}) => callApi(API.VACCINATION_RESULT_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getById: (id) => callApi(API.VACCINATION_RESULT_DETAIL(id)),
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
        getByProfile: (profileId) => callApi(API.VACCINATION_RESULT_BY_PROFILE(profileId))
    },
    consultationScheduleAPI: {
        getAll: (data = {}) => callApi(API.CONSULTATION_SCHEDULE_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getById: (id) => callApi(API.CONSULTATION_SCHEDULE_DETAIL(id)),
        getByStudent: (studentId) => callApi(API.CONSULTATION_SCHEDULE_BY_STUDENT(studentId)),
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
        }),
        get: (id) => callApi(API.CONSULTATION_SCHEDULE(id))
    },
    consultationFormAPI: {
        getAll: (data = {}) => callApi(API.CONSULTATION_FORM_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getById: (id) => callApi(API.CONSULTATION_FORM_DETAIL(id)),
        getBySchedule: (scheduleId) => callApi(API.CONSULTATION_FORM_BY_SCHEDULE(scheduleId)),
        getByStudent: (studentId) => callApi(API.CONSULTATION_FORM_BY_STUDENT(studentId)),
        getByParent: (parentId) => callApi(API.CONSULTATION_FORM_BY_PARENT(parentId)),
        create: (data) => callApi(API.CONSULTATION_FORM_CREATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (id, data) => callApi(API.CONSULTATION_FORM_UPDATE, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, consultationFormId: id })
        }),
        getDetail: (endpoint, id) => callApi(API.CONSULTATION_FORM_DETAIL(endpoint, id)),
        accept: (id) => callApi(API.CONSULTATION_FORM_ACCEPT(id), { method: 'POST' }),
        reject: (id) => callApi(API.CONSULTATION_FORM_REJECT(id), { method: 'POST' })
    },
    parentPrescriptionAPI: {
        getAll: (data = {}) => callApi(API.PARENT_PRESCRIPTION_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getById: (id) => callApi(API.PARENT_PRESCRIPTION_DETAIL(id)),
        update: (id, data) => callApi(API.PARENT_PRESCRIPTION_UPDATE(id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        create: (data) => callApi(API.PARENT_PRESCRIPTION_ADD, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getPrescriptionByParent: (parentId) => callApi(API.PARENT_PRESCRIPTION_BY_PARENT(parentId)),
        getByParent: (parentId) => callApi(API.PARENT_PRESCRIPTION_GET_BY_PARENT(parentId))
    },
    vaccinationScheduleAPI: {
        getAll: (data = {}) => callApi(API.VACCINATION_SCHEDULE_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getById: (id) => callApi(API.VACCINATION_SCHEDULE_DETAIL(id)),
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
        getByForm: (formId) => callApi(API.VACCINATION_SCHEDULE_BY_FORM(formId))
    },
    userAPI: {
        getProfile: () => callApi(API.USER_PROFILE, { credentials: "include" }),
    },
    documentAPI: {
        getAll: () => callApi(API.DOCUMENT_LIST),
        getById: (id) => callApi(API.DOCUMENT_DETAIL(id)),
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
        getById: (id) => callApi(API.STUDENT_DETAIL(id)),
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
        getByParent: (parentId) => callApi(API.STUDENT_BY_PARENT(parentId)),
    },
    parentAPI: {
        getAll: (data) => callApi(API.PARENT_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getById: (id) => callApi(`${API_BASE_URL}/parent/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
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
    },
    nurseAPI: {
        getAll: (data) => callApi(API.NURSE_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getById: (id) => callApi(`${API_BASE_URL}/nurse/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
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
    },
    formAPI: {
        getAll: (params) => callApi(API.FORM_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params)
        }),
        getById: (id) => callApi(API.FORM_DETAIL(id), {
            method: "GET",
            headers: { "Content-Type": "application/json" }
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
    },
    healthCheckScheduleAPI: {
        getAll: (data = {}) => callApi(API.HEALTH_CHECK_SCHEDULE_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...data,
                // Đảm bảo các tham số mặc định nếu không được cung cấp
                keyword: data.keyword || "",
                pageNumber: data.pageNumber || 1,
                pageSize: data.pageSize || 100,
                includeDetails: data.includeDetails !== undefined ? data.includeDetails : true,
                includeStudent: data.includeStudent !== undefined ? data.includeStudent : true
            })
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
        getAll: (data = {}) => callApi(API.HEALTH_PROFILE_LIST, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        getById: (id) => callApi(API.HEALTH_PROFILE_DETAIL(id)),
        create: (data) => callApi(API.HEALTH_PROFILE_CREATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        update: (id, data) => callApi(API.HEALTH_PROFILE_UPDATE(id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),
        delete: (id) => callApi(API.HEALTH_PROFILE_DELETE(id), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        }),
        get: (studentId) => callApi(API.HEALTH_PROFILE(studentId))
    },
};

export default API;
