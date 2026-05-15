import i18n from "i18next";

const isArabic = () => {
  const lang =
    i18n.resolvedLanguage ||
    localStorage.getItem("i18nextLng") ||
    i18n.language;

  return lang?.startsWith("ar");
};

export const dashboardTourSteps = [
  {
    intro: isArabic()
      ? "مرحبًا بك في لوحة التحكم! لنبدأ جولة سريعة 🚀"
      : "Welcome to your Dashboard! Let’s take a quick tour 🚀",
  },
  {
    element: "#tour-fulfillment",
    intro: isArabic()
      ? "يعرض عدد الطلبات التي تم تسليمها بنجاح."
      : "This shows how many orders were successfully delivered.",
  },
  {
    element: "#tour-revenue",
    intro: isArabic()
      ? "إجمالي الإيرادات التي تم تحقيقها حتى الآن."
      : "Your total revenue generated so far.",
  },
  {
    element: "#tour-dashboard-orders",
    intro: isArabic()
      ? "إجمالي عدد الطلبات المستلمة."
      : "Total number of unique orders received.",
  },
  {
    element: "#tour-expiring",
    intro: isArabic()
      ? "المنتجات التي ستنتهي صلاحيتها اليوم وتحتاج انتباهك."
      : "Products that are expiring today and need attention.",
  },
  {
    element: "#tour-sales-chart",
    intro: isArabic()
      ? "اتجاه المبيعات الشهري لمتابعة نمو العمل."
      : "Monthly sales trend to track business growth.",
  },
  {
    element: "#tour-orders-chart",
    intro: isArabic()
      ? "حجم الطلبات الشهري على مدار السنة."
      : "Monthly order volume across the year.",
  },
  {
    intro: isArabic()
      ? "هذا كل شيء! أنت جاهز لإدارة عملك 💪"
      : "That’s it! You’re all set to manage your business 💪",
  },
];