
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
      navigate(
        `/profile/${localStorage.getItem("role")}/${localStorage.getItem("linked_id")}`
      );
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