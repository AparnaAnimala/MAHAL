import i18n from "i18next";

const isArabic = () => {
  const lang =
    i18n.resolvedLanguage ||
    localStorage.getItem("i18nextLng") ||
    i18n.language;

  return lang?.startsWith("ar");
};
export const toolsTourSteps = [
  {
    element: "#tour-products",
    intro: isArabic()
      ? "عرض وإدارة جميع منتجاتك هنا."
      : "View and manage all your products here.",
  },
  {
    element: "#tour-add-product",
    intro: isArabic()
      ? "أضف منتجات جديدة إلى متجرك من هنا."
      : "Add new products to your store from here.",
  },
  {
    element: "#tour-offers",
    intro: isArabic()
      ? "أنشئ وأدر العروض الخاصة للعملاء."
      : "Create and manage special offers for customers.",
  },
  {
    element: "#tour-orders",
    intro: isArabic()
      ? "تتبع الطلبات الواردة وحالتها."
      : "Track incoming orders and their status.",
  },
  {
    element: "#tour-credit",
    intro: isArabic()
      ? "تتبع طلبات الائتمان والمدفوعات هنا."
      : "Track Your Credit Orders and Payments Here.",
  },
  {
    element: "#tour-invoice",
    intro: isArabic()
      ? "أنشئ الفواتير بسرعة للطلبات المكتملة."
      : "Generate invoices quickly for completed orders.",
  },
  {
    element: "#tour-receipt",
    intro: isArabic()
      ? "إدارة الإيصالات وتأكيدات الدفع."
      : "Manage receipts and payment confirmations.",
  },
  {
    element: "#tour-reports",
    intro: isArabic()
      ? "حلل عملك باستخدام التقارير."
      : "Analyze your business using reports.",
  },
  {
    element: "#tour-issues",
    intro: isArabic()
      ? "تعامل مع شكاوى العملاء ومشاكل الطلبات."
      : "Handle customer complaints and order issues.",
  },
  {
    element: "#tour-delivery",
    intro: isArabic()
      ? "أضف مندوبي التوصيل هنا."
      : "Add Your Delivery Boys Here",
  },
  {
    element: "#tour-promotionreview",
    intro: isArabic()
      ? "تحقق من حالة العروض الترويجية."
      : "Check The Status Of the Promotion.",
  },
  {
    element: "#tour-paidpromotion",
    intro: isArabic()
      ? "قم بالترويج لمنتجاتك لزيادة المبيعات."
      : "Promote Your Products To Boost Your Sales.",
  },
  {
    element: "#tour-support",
    intro: isArabic()
      ? "ارفع استفساراتك إلى Mahal من هنا."
      : "Raise Your Queries To Mahal from here.",
  },
  {
    element: "#tour-docs",
    intro: isArabic()
      ? "اقرأ التوثيق التفصيلي وأفضل الممارسات."
      : "Read detailed documentation and best practices.",
  },
];