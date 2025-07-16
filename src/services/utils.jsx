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
  const formDetail = await API_SERVICE.formAPI.getById(formId);
  const className = formDetail.className;
  if (!className) throw new Error("Form không có className");
  const allStudentsRaw = await API_SERVICE.studentAPI.getAll({ keyword: "" });
  const allStudents = allStudentsRaw.filter(stu => stu.className === className);
  const parentIds = allStudents.map(stu => stu.parent && stu.parent.parentId ? stu.parent.parentId : stu.parentId).filter(Boolean);
  const consentFormResults = await Promise.all(
    parentIds.map(parentId =>
      API_SERVICE.consentFormAPI.getByParent(parentId).catch(() => [])
    )
  );
  const allConsentForms = consentFormResults.flat();
  const acceptedParentIds = allConsentForms
    .filter(cf => String(cf.form?.formId || cf.formId) === String(formId) && cf.status === "Accepted")
    .map(cf => cf.parentId);
  return allStudents.filter(stu => acceptedParentIds.includes(stu.parent && stu.parent.parentId ? stu.parent.parentId : stu.parentId));
}