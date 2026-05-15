import React from "react";
import { useTranslation } from "react-i18next";

const Documentation = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="help_page" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      
      {/* HEADER */}
      <div className="help_header">
        <h2>{t("doc_title")}</h2>
        <p>{t("doc_subtitle")}</p>
      </div>

      {/* GRID */}
      <div className="help_grid">

        {/* PROFILE */}
        <div className="help_card">
          <h4><i className="fas fa-user-cog"></i> {t("profile_setup")}</h4>
          <ul>
            <li>{t("profile_1")}</li>
            <li>{t("profile_2")}</li>
            <li>{t("profile_3")}</li>
            <li>{t("profile_4")}</li>
            <li>{t("profile_5")}</li>
          </ul>
        </div>

        {/* DASHBOARD */}
        <div className="help_card">
          <h4><i className="fas fa-chart-line"></i> {t("dashboard_overview")}</h4>
          <ul>
            <li>{t("dash_1")}</li>
            <li>{t("dash_2")}</li>
            <li>{t("dash_3")}</li>
            <li>{t("dash_4")}</li>
            <li>{t("dash_5")}</li>
            <li>{t("dash_6")}</li>
          </ul>
        </div>

        {/* PRODUCTS */}
        <div className="help_card">
          <h4><i className="fas fa-box-open"></i> {t("products")}</h4>
          <ul>
            <li>{t("prod_1")}</li>
            <li>{t("prod_2")}</li>
            <li>{t("prod_3")}</li>
            <li>{t("prod_4")}</li>
          </ul>
        </div>

        {/* ORDERS */}
        <div className="help_card">
          <h4><i className="fas fa-truck"></i> {t("orders_delivery")}</h4>
          <ul>
            <li>{t("order_1")}</li>
            <li>{t("order_2")}</li>
            <li>{t("order_3")}</li>
            <li>{t("order_4")}</li>
          </ul>
        </div>

        {/* OFFERS */}
        <div className="help_card">
          <h4><i className="fas fa-tags"></i> {t("offers")}</h4>
          <ul>
            <li>{t("offer_1")}</li>
            <li>{t("offer_2")}</li>
            <li>{t("offer_3")}</li>
          </ul>
        </div>

        {/* INVENTORY */}
        <div className="help_card">
          <h4><i className="fas fa-warehouse"></i> {t("inventories")}</h4>
          <ul>
            <li>{t("inv_1")}</li>
            <li>{t("inv_2")}</li>
            <li>{t("inv_3")}</li>
          </ul>
        </div>

        {/* GUIDED TOUR */}
        <div className="help_card">
          <h4><i className="fas fa-route"></i> {t("guided_tours")}</h4>
          <ul>
            <li>{t("tour_1")}</li>
            <li>{t("tour_2")}</li>
            <li>{t("tour_3")}</li>
          </ul>
        </div>

      </div>

      {/* FOOTER */}
      <div className="help_footer">
        <i className="fas fa-heart"></i> {t("doc_footer")}
      </div>

    </div>
  );
};

export default Documentation;