import React from "react";
import { useTranslation } from "react-i18next";

const ProductActionsModal = ({
  product,
  onClose,
  onEdit,
  onDeactivate,
  onEditOffer
}) => {

  const { t, i18n } = useTranslation();

  return (
    <div className="modal_overlay">
      <div className="modal_box action_modal">

        <h3 className="modal_title">{t("product_actions")}</h3>

        <p className="product_name">
          {i18n.language === "ar"
            ? product.product_name_arabic || product.product_name_english
            : product.product_name_english}
        </p>

        <button className="action_btn edit_btn" onClick={onEdit}>
          <i className="fas fa-pen"></i>
          {t("edit_inventory")}
        </button>

        <button className="action_btn deactivate_btn" onClick={onDeactivate}>
          <i className="fas fa-ban"></i>
          {t("deactivate_product")}
        </button>

        <button
          className="action_btn offer_btn"
          onClick={() => onEditOffer(product)}
        >
          <i className="fas fa-tags"></i>
          {t("manage_offer")}
        </button>

        <button className="action_btn close_btn" onClick={onClose}>
          <i className="fas fa-times"></i>
          {t("close")}
        </button>

      </div>
    </div>
  );
};

export default ProductActionsModal;