# Form Validation and Confirmation Improvements

This document outlines the improvements made to form validation and confirmation dialogs in the SMMS application.

## New Components and Utilities

### 1. Reusable Components
- **FormField**: A reusable form field component that supports various input types with built-in validation display
- **ConfirmationDialog**: A reusable confirmation dialog component for confirming important actions

### 2. Validation Utilities
- **validation.js**: Contains validation functions for common form fields (email, phone, dates, etc.)
- **formHelpers.js**: Contains helper functions for form submission, validation, and confirmation

## How to Use

### Form Validation

1. Import the validation utilities:
```jsx
import { validateForm } from "../utils/validation";
```

2. Define validation rules for your form:
```jsx
const validationRules = {
  fullName: [
    { type: 'required', message: 'Họ tên là bắt buộc' },
    { type: 'maxLength', value: 100, message: 'Họ tên không được vượt quá 100 ký tự' }
  ],
  email: [
    { type: 'required', message: 'Email là bắt buộc' },
    { type: 'email', message: 'Email không hợp lệ' }
  ]
};
```

3. Use the FormField component for form inputs:
```jsx
<FormField
  label="Họ tên"
  name="fullName"
  value={form.fullName}
  onChange={handleChange}
  required
  error={errors.fullName}
/>
```

4. Validate the form on submit:
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate form
  const validation = validateForm(formData, validationRules);
  if (!validation.isValid) {
    setErrors(validation.errors);
    return;
  }
  
  // Continue with form submission
};
```

### Confirmation Dialogs

1. Import the ConfirmationDialog component:
```jsx
import ConfirmationDialog from "../components/ConfirmationDialog";
```

2. Add state for showing the confirmation dialog:
```jsx
const [showConfirmation, setShowConfirmation] = useState(false);
```

3. Show the confirmation dialog before performing important actions:
```jsx
const handleDelete = () => {
  setShowConfirmation(true);
};

const confirmDelete = async () => {
  // Perform delete action
  setShowConfirmation(false);
};
```

4. Add the ConfirmationDialog to your component:
```jsx
<ConfirmationDialog
  isOpen={showConfirmation}
  onClose={() => setShowConfirmation(false)}
  onConfirm={confirmDelete}
  title="Xác nhận xóa"
  message="Bạn có chắc chắn muốn xóa mục này?"
  confirmText="Xóa"
  cancelText="Hủy"
  type="danger"
/>
```

## Form Helpers

For more streamlined form handling, use the formHelpers.js utilities:

```jsx
import { handleFormSubmit, createChangeHandler, createConfirmHandler } from "../utils/formHelpers";

// Create a change handler
const handleChange = createChangeHandler(setFormData, setErrors);

// Handle form submission with validation and confirmation
const handleSubmit = async (e) => {
  e.preventDefault();
  handleFormSubmit({
    formData,
    validationRules,
    setErrors,
    setShowConfirmation
  });
};

// Create a confirmation handler
const confirmUpdate = createConfirmHandler(
  () => API_SERVICE.studentAPI.update(student.studentId, payload),
  setLoading,
  setNotif,
  onSuccess,
  setShowConfirmation,
  {
    successMessage: "Cập nhật học sinh thành công!",
    errorMessage: "Cập nhật học sinh thất bại!"
  }
);
```

## CSS Files

- **FormValidation.css**: Styles for form validation states
- **ConfirmationDialog.css**: Styles for confirmation dialogs

## Implementation Examples

See the following components for implementation examples:
- FormEditDialog.jsx
- StudentEditDialog.jsx
- FormDashboard.jsx 