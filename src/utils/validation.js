/**
 * Hàm kiểm tra validation cho form
 * @param {Object} formData - Dữ liệu form cần kiểm tra
 * @param {Object} rules - Quy tắc validation cho từng trường
 * @returns {Object} - Kết quả validation với isValid và errors
 */
export const validateForm = (formData, rules) => {
  const errors = {};
  let isValid = true;

  // Duyệt qua tất cả các rules
  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const value = formData[field];

    // Duyệt qua từng rule của field
    for (const rule of fieldRules) {
      const { type, message } = rule;
      
      // Kiểm tra từng loại rule
      switch (type) {
        case 'required':
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors[field] = message;
            isValid = false;
            return; // Dừng kiểm tra các rule tiếp theo của field này
          }
          break;
          
        case 'email':
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors[field] = message;
            isValid = false;
            return;
          }
          break;
          
        case 'minLength':
          if (value && value.length < rule.value) {
            errors[field] = message;
            isValid = false;
            return;
          }
          break;
          
        case 'maxLength':
          if (value && value.length > rule.value) {
            errors[field] = message;
            isValid = false;
            return;
          }
          break;
          
        case 'pattern':
          if (value && !rule.value.test(value)) {
            errors[field] = message;
            isValid = false;
            return;
          }
          break;
          
        case 'match':
          if (value !== formData[rule.field]) {
            errors[field] = message;
            isValid = false;
            return;
          }
          break;
          
        case 'phone':
          if (value && !/^[0-9]{10,11}$/.test(value.replace(/\s/g, ''))) {
            errors[field] = message;
            isValid = false;
            return;
          }
          break;
          
        case 'date':
          if (value) {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              errors[field] = message;
              isValid = false;
              return;
            }
          }
          break;
          
        case 'custom':
          if (rule.validate && !rule.validate(value, formData)) {
            errors[field] = message;
            isValid = false;
            return;
          }
          break;
          
        default:
          break;
      }
    }
  });

  return { isValid, errors };
};

/**
 * Kiểm tra email hợp lệ
 * @param {string} email - Email cần kiểm tra
 * @returns {boolean} - Kết quả kiểm tra
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Kiểm tra số điện thoại hợp lệ
 * @param {string} phone - Số điện thoại cần kiểm tra
 * @returns {boolean} - Kết quả kiểm tra
 */
export const isValidPhone = (phone) => {
  return /^[0-9]{10,11}$/.test(phone.replace(/\s/g, ''));
};

/**
 * Kiểm tra độ mạnh của mật khẩu
 * @param {string} password - Mật khẩu cần kiểm tra
 * @returns {string} - Mức độ mạnh: weak, medium, strong
 */
export const getPasswordStrength = (password) => {
  if (!password) return 'weak';
  
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const score = [hasLowerCase, hasUpperCase, hasDigit, hasSpecialChar]
    .filter(Boolean).length;
  
  if (password.length < 8) return 'weak';
  if (score === 4 && password.length >= 10) return 'strong';
  if (score >= 3) return 'medium';
  return 'weak';
}; 