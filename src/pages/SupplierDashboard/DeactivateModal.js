import React from "react";
import { useTranslation } from "react-i18next";

const DeactivateModal = ({ product, onClose, onConfirm }) => {

  const { t, i18n } = useTranslation();

  return (
    <div className="modal_overlay">
      <div className="modal_box">

        <span className="product_title">
          {i18n.language === "ar"
            ? product.product_name_arabic || product.product_name_english
            : product.product_name_english}
          ?
        </span>

        <h3>{t("deactivate_product")}</h3>

        <p>{t("confirm_deactivate")}</p>

        <div className="modal_actions">
          <button className="btn cancel" onClick={onClose}>
            {t("cancel")}
          </button>

          <button className="btn deactivate" onClick={onConfirm}>
            {t("yes_deactivate")}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeactivateModal;