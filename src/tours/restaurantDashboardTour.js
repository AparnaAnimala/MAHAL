// import i18n from "i18next";

// export const restaurantDashboardTourSteps = [
//   {
//     intro: "Welcome to your Restaurant Dashboard 🍽️ Let’s take a quick tour!",
//   },
//   {
//     element: "#tour-today-orders",
//     intro: "See how many orders you received today.",
//     position: "bottom",   // 👈 force position
//   },
//   {
//     element: "#tour-revenue",
//     intro: "Your total revenue generated so far.",
//     position: "bottom",
//   },
//   {
//     element: "#tour-dashboard-customers",
//     intro: "Total customers who ordered from your restaurant.",
//     position: "bottom",
//   },
//   {
//     element: "#tour-rating",
//     intro: "Average rating given by customers.",
//     position: "bottom",
//   },
//   {
//     element: "#tour-recent-orders",
//     intro: "View and track your most recent orders.",
//     position: "top",
//   },
//   {
//     element: "#tour-sales-chart",
//     intro: "Sales trends over time to help you plan better.",
//     position: "top",
//   },
//   {
//     element: "#tour-orders-chart",
//     intro: "Monthly order volume handled by your restaurant.",
//     position: "top",
//   },
//   {
//     element: "#tour-top-selling",
//     intro: "Your most popular dishes based on order volume.",
//     position: "top",
//   },
//   {
//     intro: "That’s it! You’re all set to manage your restaurant like a pro 💪",
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

export const getRestaurantDashboardTourSteps = () => [
   {
    intro: "Welcome to your Restaurant Dashboard 🍽️ Let’s take a quick tour!",
  },
 
  {
    element: "#tour-credit-limit",
    intro: "Check Your Credit Limit.",
    position: "bottom",   // 👈 force position
  },
  {
    element: "#tour-used-credit",
    intro: "Track Your Credit Usage.",
    position: "bottom",   // 👈 force position
  },
  {
    element: "#tour-available",
    intro: "Track Your Available Credit.",
    position: "bottom",   // 👈 force position
  },
  {
    element: "#tour-due-date",
    intro: "Check Your Credit Due Date.",
    position: "bottom",   // 👈 force position
  },
   {
    element: "#tour-today-orders",
    intro: "See how many orders you received today.",
    position: "bottom",   // 👈 force position
  },
  {
    element: "#tour-revenue",
    intro: "Your total revenue spent so far.",
    position: "bottom",
  },
  {
    element: "#tour-pending",
    intro: "Your pending orders count.",
    position: "bottom",
  },
  {
    element: "#tour-total-orders",
    intro: "Your Total Orders upto now.",
    position: "bottom",
  },
  {
    element: "#tour-monthly-spent",
    intro: "Total amount you spend monthly.",
    position: "bottom",
  },

  {
    element: "#tour-Orders-overview",
    intro: "Monthly order volume handled by your restaurant.",
    position: "top",
  },
  {
    element: "#tour-Top-suppliers",
    intro: "Check Top suppliers from your orders and mahal.",
    position: "top",
  },
  {
    element: "#tour-Order-status",
    intro: "Track Status of Your Orders From here.",
    position: "top",
  },
    {
    element: "#tour-recent-orders",
    intro: "View and track your most recent orders.",
    position: "top",
  },
  {
    intro: "That’s it! You’re all set to manage your restaurant like a pro 💪",
  },
];