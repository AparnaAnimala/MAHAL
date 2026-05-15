
// import React from "react";
// import { useNavigate } from "react-router-dom";
// import introJs from "intro.js";

// /* 👉 restaurant-specific tour */
// import { restaurantDashboardTourSteps } from "../../tours/restaurantDashboardTour";
// import { restaurantToolsTourSteps } from "../../tours/restaurantToolsTour";
// const RestaurantHelp = () => {
//   const navigate = useNavigate();

//   /* =========================
//      ACTION HANDLERS
//   ========================= */

//    const goToProfile = () => {
//     window.dispatchEvent(new Event("openProfile"));
//     };

//   const startDashboardTour = () => {
//     localStorage.setItem("startRestaurantDashboardTour", "true");
//     navigate("/restaurantdashboard");
//   };

//   const startToolsTour = () => {
//     introJs()
//       .setOptions({
//         steps: restaurantToolsTourSteps,
//         showProgress: true,
//         showBullets: false,
//         nextLabel: "Next →",
//         prevLabel: "← Back",
//         doneLabel: "Finish",
//         overlayOpacity: 0.6,
//       })
//       .start();
//   };

//   const openDocumentation = () => {
//     navigate("/restaurantdashboard/documentation");
//   };

//   const contactSupport = () => {
//     navigate("/restaurant/dashboard/support");
//   };

//   return (
//     <div className="help_page_pro">

//       {/* HEADER */}
//       <div className="help_header">
//         <h2>Restaurant Help & Support</h2>
//         <p>
//           Manage your restaurant operations smoothly with guided help.
//         </p>
//       </div>

//       {/* HELP CARDS */}
//       <div className="help_grid">

//         <div className="help_card_pro">
//           <div className="help_icon">
//             <i className="fas fa-store"></i>
//           </div>
//           <h4>Complete Restaurant Profile</h4>
//           <p>
//             Update your restaurant details to receive and manage orders.
//           </p>
//           <button className="help_btn" onClick={goToProfile}>
//             Go to Profile
//           </button>
//         </div>

//         <div className="help_card_pro">
//           <div className="help_icon">
//             <i className="fas fa-route"></i>
//           </div>
//           <h4>Restaurant Dashboard Tour</h4>
//           <p>
//             Learn how to manage orders, invoices, and payouts.
//           </p>
//           <button className="help_btn" onClick={startDashboardTour}>
//             Start Tour
//           </button>
//         </div>

//         <div className="help_card_pro">
//           <div className="help_icon">
//             <i className="fas fa-utensils"></i>
//           </div>
//           <h4>Restaurant Tools</h4>
//           <p>
//             Understand menu, offers, reports, and order tools.
//           </p>
//           <button className="help_btn" onClick={startToolsTour}>
//             Explore Tools
//           </button>
//         </div>

//         <div className="help_card_pro">
//           <div className="help_icon">
//             <i className="fas fa-book-open"></i>
//           </div>
//           <h4>Documentation</h4>
//           <p>
//             Step-by-step restaurant documentation and best practices.
//           </p>
//           <button className="help_btn" onClick={openDocumentation}>
//             View Docs
//           </button>
//         </div>

//       </div>

//       {/* SUPPORT BOX */}
//       <div className="help_support">
//         <div className="support_icon">
//           <i className="fas fa-headset"></i>
//         </div>
//         <h3>Need Restaurant Support?</h3>
//         <p>
//           Our team is ready to help you with restaurant operations.
//         </p>
//         <button className="support_btn" onClick={contactSupport}>
//           Contact Support
//         </button>
//       </div>

//     </div>
//   );
// };

// export default RestaurantHelp;


import React from "react";
import { useNavigate } from "react-router-dom";
import introJs from "intro.js";
import { useTranslation } from "react-i18next";

/* 👉 tours */
import { restaurantDashboardTourSteps } from "../../tours/restaurantDashboardTour";
import { restaurantToolsTourSteps } from "../../tours/restaurantToolsTour";

const RestaurantHelp = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const goToProfile = () => {
    window.dispatchEvent(new Event("openProfile"));
  };

  const startDashboardTour = () => {
    localStorage.setItem("startRestaurantDashboardTour", "true");
    navigate("/restaurantdashboard");
  };

  const startToolsTour = () => {
    introJs()
      .setOptions({
        steps: restaurantToolsTourSteps,
        showProgress: true,
        showBullets: false,
        nextLabel: i18n.language === "ar" ? "التالي →" : "Next →",
        prevLabel: i18n.language === "ar" ? "← السابق" : "← Back",
        doneLabel: i18n.language === "ar" ? "إنهاء" : "Finish",
        overlayOpacity: 0.6,
      })
      .start();
  };

  const openDocumentation = () => {
    navigate("/restaurantdashboard/documentation");
  };

  const contactSupport = () => {
    navigate("/restaurant/dashboard/support");
  };

  return (
    <div
      className="help_page_pro"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      {/* HEADER */}
      <div className="help_header">
        <h2>{t("res_help_title")}</h2>
        <p>{t("res_help_subtitle")}</p>
      </div>

      {/* CARDS */}
      <div className="help_grid">

        <div className="help_card_pro">
          <div className="help_icon">
            <i className="fas fa-store"></i>
          </div>
          <h4>{t("res_profile_title")}</h4>
          <p>{t("res_profile_desc")}</p>
          <button className="help_btn" onClick={goToProfile}>
            {t("res_go_profile")}
          </button>
        </div>

        <div className="help_card_pro">
          <div className="help_icon">
            <i className="fas fa-route"></i>
          </div>
          <h4>{t("res_dashboard_tour")}</h4>
          <p>{t("res_dashboard_tour_desc")}</p>
          <button className="help_btn" onClick={startDashboardTour}>
            {t("res_start_tour")}
          </button>
        </div>

        <div className="help_card_pro">
          <div className="help_icon">
            <i className="fas fa-utensils"></i>
          </div>
          <h4>{t("res_tools_title")}</h4>
          <p>{t("res_tools_desc")}</p>
          <button className="help_btn" onClick={startToolsTour}>
            {t("res_explore_tools")}
          </button>
        </div>

        <div className="help_card_pro">
          <div className="help_icon">
            <i className="fas fa-book-open"></i>
          </div>
          <h4>{t("res_docs_title")}</h4>
          <p>{t("res_docs_desc")}</p>
          <button className="help_btn" onClick={openDocumentation}>
            {t("res_view_docs")}
          </button>
        </div>

      </div>

      {/* SUPPORT */}
      <div className="help_support">
        <div className="support_icon">
          <i className="fas fa-headset"></i>
        </div>
        <h3>{t("res_support_title")}</h3>
        <p>{t("res_support_desc")}</p>
        <button className="support_btn" onClick={contactSupport}>
          {t("res_contact_support")}
        </button>
      </div>

    </div>
  );
};

export default RestaurantHelp;