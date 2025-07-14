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