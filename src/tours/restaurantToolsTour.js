// export const restaurantToolsTourSteps = [
//   {
//     intro: "Let’s explore all the tools available in your Restaurant Dashboard 🍽️",
//   },

//   {
//     element: "#tour-dashboard",
//     intro: "Your main dashboard gives you a quick overview of orders, revenue, and performance.",
//     position: "right",
//   },
//   {
//     element: "#tour-orders",
//     intro: "View and manage orders placed through supplier here.",
//     position: "right",
//   },
//    {
//     element: "#tour-modified-orders",
//     intro: "View orders that were modified after placement.",
//     position: "right",
//   },
//   {
//     element: "#tour-issues",
//     intro: "Raise an Issue for the order placed.",
//     position: "right",
//   },
//     {
//     element: "#tour-grn",
//     intro: "Manage Goods Receipt Notes for inventory updates.",
//     position: "right",
//   },
//     {
//     element: "#tour-invoices",
//     intro: "Access invoices generated for completed orders.",
//     position: "right",
//   },
//     {
//     element: "#tour-reviews",
//     intro: "Check customer reviews and ratings to improve service quality.",
//     position: "right",
//   },
//     {
//     element: "#tour-inventory",
//     intro: "Track raw material stock and avoid shortages.",
//     position: "right",
//   },
//   {
//     element: "#tour-payments",
//     intro: "Send order instructions or issues directly to the kitchen.",
//     position: "right",
//   },
//   {
//     element:"#tour-creditwallet",
//     intro:"Track Your Credit Orders and Payments Here.",
  
//   },
//   {
//     element: "#tour-menu",
//     intro: "Manage your restaurant menu items, pricing, and availability.",
//     position: "right",
//   },
//   {
//     element: "#tour-recipe",
//     intro: "Define recipes and link raw materials to menu items.",
//     position: "right",
//   },
//    {
//     element:"#tour-supportticket",
//     intro:"Raise Your Queries To Mahal from here.",
//   },
//   {
//     element: "#tour-reports",
//     intro: "Analyze business performance with detailed reports.",
//     position: "right",
//   },


  
//    {
//     element: "#tour-help",
//     intro: "Access guided tours and quick help anytime.",
//     position: "right",
//   },
//   {
//     element: "#tour-docs",
//     intro: "Read detailed documentation and best practices.",
//     position: "right",
//   },


//   {
//     intro: "That’s it! You now know all the tools available to run your restaurant smoothly 🚀",
//   },
// ];





import i18n from "i18next";

const isArabic = () => {
  const lang =
    i18n.resolvedLanguage ||
    localStorage.getItem("i18nextLng") ||
    i18n.language;

  return lang?.startsWith("ar");
};
export const restaurantToolsTourSteps = [
   {
    intro: "Let’s explore all the tools available in your Restaurant Dashboard 🍽️",
  },

  {
    element: "#tour-dashboard",
    intro: "Your main dashboard gives you a quick overview of orders, revenue, and performance.",
    position: "right",
  },
  {
    element: "#tour-orders",
    intro: "View and manage orders placed through supplier here.",
    position: "right",
  },
   {
    element: "#tour-modified-orders",
    intro: "View orders that were modified after placement.",
    position: "right",
  },
  {
    element: "#tour-issues",
    intro: "Raise an Issue for the order placed.",
    position: "right",
  },
    {
    element: "#tour-grn",
    intro: "Manage Goods Receipt Notes for inventory updates.",
    position: "right",
  },
    {
    element: "#tour-invoices",
    intro: "Access invoices generated for completed orders.",
    position: "right",
  },
    {
    element: "#tour-reviews",
    intro: "Check customer reviews and ratings to improve service quality.",
    position: "right",
  },
    {
    element: "#tour-inventory",
    intro: "Track raw material stock and avoid shortages.",
    position: "right",
  },
  {
    element: "#tour-payments",
    intro: "Send order instructions or issues directly to the kitchen.",
    position: "right",
  },
  {
    element:"#tour-creditwallet",
    intro:"Track Your Credit Orders and Payments Here.",
  
  },
  {
    element: "#tour-menu",
    intro: "Manage your restaurant menu items, pricing, and availability.",
    position: "right",
  },
  {
    element: "#tour-recipe",
    intro: "Define recipes and link raw materials to menu items.",
    position: "right",
  },
   {
    element:"#tour-supportticket",
    intro:"Raise Your Queries To Mahal from here.",
  },
  {
    element: "#tour-reports",
    intro: "Analyze business performance with detailed reports.",
    position: "right",
  },


  
   {
    element: "#tour-help",
    intro: "Access guided tours and quick help anytime.",
    position: "right",
  },
  {
    element: "#tour-docs",
    intro: "Read detailed documentation and best practices.",
    position: "right",
  },


  {
    intro: "That’s it! You now know all the tools available to run your restaurant smoothly 🚀",
  },
];


// {
//     element: "#tour-products",
//     intro: isArabic()
//       ? "عرض وإدارة جميع منتجاتك هنا."
//       : "View and manage all your products here.",
//   },
//   {
//     element: "#tour-add-product",
//     intro: isArabic()
//       ? "أضف منتجات جديدة إلى متجرك من هنا."
//       : "Add new products to your store from here.",
//   },
//   {
//     element: "#tour-offers",
//     intro: isArabic()
//       ? "أنشئ وأدر العروض الخاصة للعملاء."
//       : "Create and manage special offers for customers.",
//   },
//   {
//     element: "#tour-orders",
//     intro: isArabic()
//       ? "تتبع الطلبات الواردة وحالتها."
//       : "Track incoming orders and their status.",
//   },
//   {
//     element: "#tour-credit",
//     intro: isArabic()
//       ? "تتبع طلبات الائتمان والمدفوعات هنا."
//       : "Track Your Credit Orders and Payments Here.",
//   },
//   {
//     element: "#tour-invoice",
//     intro: isArabic()
//       ? "أنشئ الفواتير بسرعة للطلبات المكتملة."
//       : "Generate invoices quickly for completed orders.",
//   },
//   {
//     element: "#tour-receipt",
//     intro: isArabic()
//       ? "إدارة الإيصالات وتأكيدات الدفع."
//       : "Manage receipts and payment confirmations.",
//   },
//   {
//     element: "#tour-reports",
//     intro: isArabic()
//       ? "حلل عملك باستخدام التقارير."
//       : "Analyze your business using reports.",
//   },
//   {
//     element: "#tour-issues",
//     intro: isArabic()
//       ? "تعامل مع شكاوى العملاء ومشاكل الطلبات."
//       : "Handle customer complaints and order issues.",
//   },
//   {
//     element: "#tour-delivery",
//     intro: isArabic()
//       ? "أضف مندوبي التوصيل هنا."
//       : "Add Your Delivery Boys Here",
//   },
//   {
//     element: "#tour-promotionreview",
//     intro: isArabic()
//       ? "تحقق من حالة العروض الترويجية."
//       : "Check The Status Of the Promotion.",
//   },
//   {
//     element: "#tour-paidpromotion",
//     intro: isArabic()
//       ? "قم بالترويج لمنتجاتك لزيادة المبيعات."
//       : "Promote Your Products To Boost Your Sales.",
//   },
//   {
//     element: "#tour-support",
//     intro: isArabic()
//       ? "ارفع استفساراتك إلى Mahal من هنا."
//       : "Raise Your Queries To Mahal from here.",
//   },
//   {
//     element: "#tour-docs",
//     intro: isArabic()
//       ? "اقرأ التوثيق التفصيلي وأفضل الممارسات."
//       : "Read detailed documentation and best practices.",
//   },