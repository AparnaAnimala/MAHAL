// import React from "react";

// const Help = () => {
//   return (
//     <div className="help_page_pro">

//       {/* HEADER */}
//       <div className="help_header">
//         <h2>Help & Support</h2>
//         <p>
//           Manage your business smoothly with guided help and documentation.
//         </p>
//       </div>

//       {/* HELP CARDS */}
//       <div className="help_grid">

//         <div className="help_card_pro">
//           <div className="help_icon">
//             <i className="fas fa-user-check"></i>
//           </div>
//           <h4>Complete Profile</h4>
//           <p>
//             Complete your business and store profile to unlock all features.
//           </p>
//           <button className="help_btn">Go to Profile</button>
//         </div>

//         <div className="help_card_pro">
//           <div className="help_icon">
//             <i className="fas fa-route"></i>
//           </div>
//           <h4>Guided Dashboard Tour</h4>
//           <p>
//             Step-by-step walkthrough to understand orders, invoices and tools.
//           </p>
//           <button className="help_btn">Start Tour</button>
//         </div>

//         <div className="help_card_pro">
//           <div className="help_icon">
//             <i className="fas fa-tools"></i>
//           </div>
//           <h4>Tools & Features</h4>
//           <p>
//             Learn how to use inventory, offers, invoices and reports efficiently.
//           </p>
//           <button className="help_btn">Explore Tools</button>
//         </div>

//         <div className="help_card_pro">
//           <div className="help_icon">
//             <i className="fas fa-book-open"></i>
//           </div>
//           <h4>Documentation</h4>
//           <p>
//             Access detailed documentation with examples and best practices.
//           </p>
//           <button className="help_btn">View Docs</button>
//         </div>

//       </div>

//       {/* SUPPORT BOX */}
//       <div className="help_support">
//         <div className="support_icon">
//           <i className="fas fa-headset"></i>
//         </div>
//         <h3>Still Need Help?</h3>
//         <p>
//           Reach out to our support team for quick assistance.
//         </p>
//         <button className="support_btn">Contact Support</button>
//       </div>

//     </div>
//   );
// };

// export default Help;


import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import introJs from "intro.js";
import { toolsTourSteps } from "../../tours/toolsTour";

const Help = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
 
const getArabic = (text) => {
  const map = {
    "View and manage all your products here.":
      "عرض وإدارة جميع منتجاتك هنا.",
    "Add new products to your store from here.":
      "أضف منتجات جديدة إلى متجرك من هنا.",
    "Create and manage special offers for customers.":
      "أنشئ وأدر العروض الخاصة للعملاء.",
    "Track incoming orders and their status.":
      "تتبع الطلبات الواردة وحالتها.",
    "Track Your Credit Orders and Payments Here.":
      "تتبع طلبات الائتمان والمدفوعات هنا.",
    "Generate invoices quickly for completed orders.":
      "أنشئ الفواتير بسرعة للطلبات المكتملة.",
    "Manage receipts and payment confirmations.":
      "إدارة الإيصالات وتأكيدات الدفع.",
    "Analyze your business using reports.":
      "حلل عملك باستخدام التقارير.",
    "Handle customer complaints and order issues.":
      "تعامل مع شكاوى العملاء ومشاكل الطلبات.",
    "Add Your Delivery Boys Here":
      "أضف مندوبي التوصيل هنا.",
    "Check The Status Of the Promotion.":
      "تحقق من حالة العروض الترويجية.",
    "Promote Your Products To Boost Your Sales.":
      "قم بالترويج لمنتجاتك لزيادة المبيعات.",
    "Raise Your Queries To Mahal from here.":
      "ارفع استفساراتك إلى Mahal من هنا.",
    "Read detailed documentation and best practices.":
      "اقرأ التوثيق التفصيلي وأفضل الممارسات.",
  };

  return map[text] || text;
};

  /* =========================
     ACTION HANDLERS
  ========================= */

  const goToProfile = () => {
    window.dispatchEvent(new Event("openProfile"));
  };

  const startDashboardTour = () => {
    localStorage.setItem("startDashboardTour", "true");
    navigate("/dashboard");
  };

  const startToolsTour = () => {
  const isArabic = localStorage.getItem("i18nextLng") === "ar";

  introJs()
    .setOptions({
      steps: toolsTourSteps.map((step) => ({
        ...step,
        intro: isArabic ? getArabic(step.intro) : step.intro,
      })),
      showProgress: true,
      showBullets: false,
      nextLabel: isArabic ? "التالي →" : "Next →",
      prevLabel: isArabic ? "← السابق" : "← Back",
      doneLabel: isArabic ? "إنهاء" : "Finish",
      overlayOpacity: 0.6,
    })
    .start();
};

  const openDocumentation = () => {
    navigate("/dashboard/documentation");
  };

  const contactSupport = () => {
    navigate("/dashboard/support");
  };

  return (
    <div
      className="help_page_pro"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >

      {/* HEADER */}
      <div className="help_header">
        <h2>{t("help_title")}</h2>
        <p>{t("help_subtitle")}</p>
      </div>

      {/* HELP CARDS */}
      <div className="help_grid">

        {/* PROFILE */}
        <div className="help_card_pro">
          <div className="help_icon">
            <i className="fas fa-user-check"></i>
          </div>
          <h4>{t("help_profile_title")}</h4>
          <p>{t("help_profile_desc")}</p>
          <button className="help_btn" onClick={goToProfile}>
            {t("help_profile_btn")}
          </button>
        </div>

        {/* DASHBOARD TOUR */}
        <div className="help_card_pro">
          <div className="help_icon">
            <i className="fas fa-route"></i>
          </div>
          <h4>{t("help_dashboard_title")}</h4>
          <p>{t("help_dashboard_desc")}</p>
          <button className="help_btn" onClick={startDashboardTour}>
            {t("help_dashboard_btn")}
          </button>
        </div>

        {/* TOOLS */}
        <div className="help_card_pro">
          <div className="help_icon">
            <i className="fas fa-tools"></i>
          </div>
          <h4>{t("help_tools_title")}</h4>
          <p>{t("help_tools_desc")}</p>
          <button className="help_btn" onClick={startToolsTour}>
            {t("help_tools_btn")}
          </button>
        </div>

        {/* DOCS */}
        <div className="help_card_pro">
          <div className="help_icon">
            <i className="fas fa-book-open"></i>
          </div>
          <h4>{t("help_docs_title")}</h4>
          <p>{t("help_docs_desc")}</p>
          <button className="help_btn" onClick={openDocumentation}>
            {t("help_docs_btn")}
          </button>
        </div>

      </div>

      {/* SUPPORT */}
      <div className="help_support">
        <div className="support_icon">
          <i className="fas fa-headset"></i>
        </div>
        <h3>{t("help_support_title")}</h3>
        <p>{t("help_support_desc")}</p>
        <button className="support_btn" onClick={contactSupport}>
          {t("help_support_btn")}
        </button>
      </div>

    </div>
  );
};

export default Help;