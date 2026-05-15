// import React from "react";

// const RestaurantDocumentation = () => {
//   return (
//     <div className="help_page">

//       {/* HEADER */}
//       <div className="help_header">
//         <h2>Restaurant Dashboard Documentation</h2>
//         <p>
//           Everything you need to manage your restaurant operations smoothly and efficiently.
//         </p>
//       </div>

//       {/* GRID */}
//       <div className="help_grid">

//         {/* PROFILE SETUP */}
//         <div className="help_card">
//           <h4><i className="fas fa-store"></i> Restaurant Profile Setup</h4>
//           <ul>
//             <li>Restaurant name & contact details</li>
//             <li>Address & service area</li>
//             <li>Opening & closing timings</li>
//             <li>GST, FSSAI & bank details</li>
//             <li>Menu availability settings</li>
//           </ul>
//         </div>

//         {/* DASHBOARD OVERVIEW */}
//         <div className="help_card">
//           <h4><i className="fas fa-chart-pie"></i> Dashboard Overview</h4>
//           <ul>
//             <li>Today’s Orders & revenue</li>
//             <li>Total customers served</li>
//             <li>Average customer ratings</li>
//             <li>Order status breakdown</li>
//             <li>Sales analytics & trends</li>
//           </ul>
//         </div>

//         {/* MENU MANAGEMENT */}
//         <div className="help_card">
//           <h4><i className="fas fa-utensils"></i> Menu Management</h4>
//           <ul>
//             <li>Add, edit, or disable menu items</li>
//             <li>Set pricing, images & categories</li>
//             <li>Manage item availability</li>
//             <li>Create combos & specials</li>
//           </ul>
//         </div>

//         {/* ORDERS */}
//         <div className="help_card">
//           <h4><i className="fas fa-receipt"></i> Orders Management</h4>
//           <ul>
//             <li>Accept or reject incoming orders</li>
//             <li>Modify orders if required</li>
//             <li>Update order preparation status</li>
//             <li>Track delivery completion</li>
//           </ul>
//         </div>

//         {/* KITCHEN & ISSUES */}
//         <div className="help_card">
//           <h4><i className="fas fa-exclamation-triangle"></i> Kitchen & Order Issues</h4>
//           <ul>
//             <li>Send issues to kitchen staff</li>
//             <li>Handle missing or modified items</li>
//             <li>Resolve customer complaints</li>
//             <li>Improve service quality</li>
//           </ul>
//         </div>

//         {/* INVENTORY */}
//         <div className="help_card">
//           <h4><i className="fas fa-boxes"></i> Inventory & Stock</h4>
//           <ul>
//             <li>Track raw material stock</li>
//             <li>Prevent shortages</li>
//             <li>Link inventory with menu items</li>
//             <li>Maintain optimal stock levels</li>
//           </ul>
//         </div>

//         {/* REPORTS */}
//         <div className="help_card">
//           <h4><i className="fas fa-chart-line"></i> Reports & Analytics</h4>
//           <ul>
//             <li>Daily, weekly & monthly sales</li>
//             <li>Top selling dishes</li>
//             <li>Customer behavior insights</li>
//             <li>Operational performance metrics</li>
//           </ul>
//         </div>

//         {/* GUIDED TOURS */}
//         <div className="help_card">
//           <h4><i className="fas fa-route"></i> Guided Tours & Help</h4>
//           <ul>
//             <li>Step-by-step dashboard walkthroughs</li>
//             <li>Menu & order tools guidance</li>
//             <li>Beginner-friendly onboarding</li>
//           </ul>
//         </div>

//       </div>

//       {/* FOOTER */}
//       <div className="help_footer">
//         <i className="fas fa-heart"></i> Built to help your restaurant grow faster and serve better
//       </div>

//     </div>
//   );
// };

// export default RestaurantDocumentation;


import React from "react";
import { useTranslation } from "react-i18next";

const RestaurantDocumentation = () => {
  const { t, i18n } = useTranslation();

  return (
    <div
      className="help_page"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      {/* HEADER */}
      <div className="help_header">
        <h2>{t("resdoc_title")}</h2>
        <p>{t("resdoc_subtitle")}</p>
      </div>

      {/* GRID */}
      <div className="help_grid">

        {/* PROFILE SETUP */}
        <div className="help_card">
          <h4><i className="fas fa-store"></i> {t("resdoc_profile_title")}</h4>
          <ul>
            <li>{t("resdoc_profile_1")}</li>
            <li>{t("resdoc_profile_2")}</li>
            <li>{t("resdoc_profile_3")}</li>
            <li>{t("resdoc_profile_4")}</li>
            <li>{t("resdoc_profile_5")}</li>
          </ul>
        </div>

        {/* DASHBOARD OVERVIEW */}
        <div className="help_card">
          <h4><i className="fas fa-chart-pie"></i> {t("resdoc_dashboard_title")}</h4>
          <ul>
            <li>{t("resdoc_dashboard_1")}</li>
            <li>{t("resdoc_dashboard_2")}</li>
            <li>{t("resdoc_dashboard_3")}</li>
            <li>{t("resdoc_dashboard_4")}</li>
            <li>{t("resdoc_dashboard_5")}</li>
          </ul>
        </div>

        {/* MENU MANAGEMENT */}
        <div className="help_card">
          <h4><i className="fas fa-utensils"></i> {t("resdoc_menu_title")}</h4>
          <ul>
            <li>{t("resdoc_menu_1")}</li>
            <li>{t("resdoc_menu_2")}</li>
            <li>{t("resdoc_menu_3")}</li>
            <li>{t("resdoc_menu_4")}</li>
          </ul>
        </div>

        {/* ORDERS */}
        <div className="help_card">
          <h4><i className="fas fa-receipt"></i> {t("resdoc_orders_title")}</h4>
          <ul>
            <li>{t("resdoc_orders_1")}</li>
            <li>{t("resdoc_orders_2")}</li>
            <li>{t("resdoc_orders_3")}</li>
            <li>{t("resdoc_orders_4")}</li>
          </ul>
        </div>

        {/* KITCHEN & ISSUES */}
        <div className="help_card">
          <h4><i className="fas fa-exclamation-triangle"></i> {t("resdoc_issue_title")}</h4>
          <ul>
            <li>{t("resdoc_issue_1")}</li>
            <li>{t("resdoc_issue_2")}</li>
            <li>{t("resdoc_issue_3")}</li>
            <li>{t("resdoc_issue_4")}</li>
          </ul>
        </div>

        {/* INVENTORY */}
        <div className="help_card">
          <h4><i className="fas fa-boxes"></i> {t("resdoc_inventory_title")}</h4>
          <ul>
            <li>{t("resdoc_inventory_1")}</li>
            <li>{t("resdoc_inventory_2")}</li>
            <li>{t("resdoc_inventory_3")}</li>
            <li>{t("resdoc_inventory_4")}</li>
          </ul>
        </div>

        {/* REPORTS */}
        <div className="help_card">
          <h4><i className="fas fa-chart-line"></i> {t("resdoc_reports_title")}</h4>
          <ul>
            <li>{t("resdoc_reports_1")}</li>
            <li>{t("resdoc_reports_2")}</li>
            <li>{t("resdoc_reports_3")}</li>
            <li>{t("resdoc_reports_4")}</li>
          </ul>
        </div>

        {/* GUIDED TOURS */}
        <div className="help_card">
          <h4><i className="fas fa-route"></i> {t("resdoc_help_title")}</h4>
          <ul>
            <li>{t("resdoc_help_1")}</li>
            <li>{t("resdoc_help_2")}</li>
            <li>{t("resdoc_help_3")}</li>
          </ul>
        </div>

      </div>

      {/* FOOTER */}
      <div className="help_footer">
        <i className="fas fa-heart"></i> {t("resdoc_footer")}
      </div>
    </div>
  );
};

export default RestaurantDocumentation;