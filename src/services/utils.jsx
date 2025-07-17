// utils/dateFormat.js

export const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

// utils/formTypeFormat.js

export const formatFormType = (type) => {
    switch (type) {
        case "HealthCheck":
            return "Khám sức khỏe";
        case "Vaccine":
            return "Tiêm chủng";
        default:
            return type;
    }
};

// utils/blogCategoryFormat.js

export const formatBlogCategory = (type) => {
    const map = {
        Nutrition: "Dinh dưỡng",
        Psychology: "Tâm lý học",
        InfectiousDiseases: "Bệnh truyền nhiễm",
        Physical: "Vận động thể chất",
        Home: "Chăm sóc tại nhà",
        HealthBenefits: "Lợi ích sức khỏe",
    };

    return map[type] || type;
};

export async function getAcceptedStudentsBySchedule(schedule, API_SERVICE) {
  const formId = schedule.formId;
  if (!formId) throw new Error("Lịch không có formId");
  
  // Lấy thông tin chi tiết của form
  const formDetail = await API_SERVICE.formAPI.getById(formId);
  console.log("Form detail:", formDetail);
  
  // Lấy tên lớp từ form
  const className = formDetail.className;
  if (!className) throw new Error("Form không có className");
  
  // Lấy tất cả học sinh
  const allStudentsRaw = await API_SERVICE.studentAPI.getAll({ keyword: "" });
  console.log("All students:", allStudentsRaw);
  
  // Lọc học sinh theo lớp
  const studentsInClass = allStudentsRaw.filter(stu => stu.className === className);
  console.log("Students in class", className, ":", studentsInClass);
  
  // Nếu là form khám sức khỏe, trả về tất cả học sinh trong lớp
  if (formDetail.type === "HealthCheck") {
    console.log("This is a HealthCheck form, returning all students in class");
    return studentsInClass;
  }
  
  // Nếu là form tiêm vaccine hoặc loại khác, kiểm tra sự đồng ý của phụ huynh
  console.log("This is a", formDetail.type, "form, checking parent consent");
  
  // Lấy parentId của tất cả học sinh trong lớp
  const parentIds = studentsInClass.map(stu => 
    stu.parent && stu.parent.parentId ? stu.parent.parentId : stu.parentId
  ).filter(Boolean);
  
  // Lấy danh sách form đồng ý của phụ huynh
  const consentFormResults = await Promise.all(
    parentIds.map(parentId =>
      API_SERVICE.consentFormAPI.getByParent(parentId).catch(() => [])
    )
  );
  
  // Gộp tất cả form đồng ý
  const allConsentForms = consentFormResults.flat();
  
  // Lọc ra các phụ huynh đã đồng ý
  const acceptedParentIds = allConsentForms
    .filter(cf => String(cf.form?.formId || cf.formId) === String(formId) && cf.status === "Accepted")
    .map(cf => cf.parentId);
  
  // Trả về học sinh có phụ huynh đã đồng ý
  return studentsInClass.filter(stu => 
    acceptedParentIds.includes(stu.parent && stu.parent.parentId ? stu.parent.parentId : stu.parentId)
  );
}