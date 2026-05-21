

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
// import "../../pages/css/SupplierPromotionReview.css";
import { useTranslation } from "react-i18next";

const SupplierPromotionReview = () => {
  const { promoId } = useParams();
  const [promotion, setPromotion] = useState(null);
  const [products, setProducts] = useState([]);

  const token = localStorage.getItem("token");
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const res = await axios.get(
          `http://192.168.2.22:5000/api/v1/promotions/${promoId}?lang=${i18n.language}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPromotion(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    if (promoId && token) {
      fetchPromotion();
    }
  }, [promoId, token, i18n.language]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `http://192.168.2.22:5000/api/v1/promotions/${promoId}/products?lang=${i18n.language}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProducts(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    if (promoId && token) {
      fetchProducts();
    }
  }, [promoId, token, i18n.language]);

  const acceptPromotion = async () => {
    try {
      const res = await axios.post(
        `http://192.168.2.22:5000/api/v1/supplier/promotions/${promoId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(t("promotion_accept_success"));
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  const rejectPromotion = async () => {
    try {
      const res = await axios.post(
        `http://192.168.2.22:5000/api/v1/supplier/promotions/${promoId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(t("promotion_reject_success"));
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  if (!promotion) return <p>{t("loading")}</p>;

  const isArabic = i18n.language?.startsWith("ar");

const formatDate = (date) => {
  if (!date) return "-";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat(
    isArabic ? "ar-EG" : "en-GB",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    }
  ).format(d);
};

const formatNumber = (num) => {
  return new Intl.NumberFormat(
    isArabic ? "ar-EG" : "en-US"
  ).format(num);
};

  return (
    <div className="supplier-promo-page">
      <div className="supplier-promo-card">

        <div className="promo-header">
          <div className="promo-title">{promotion.title}</div>
          <div className={`status-badge status-${promotion.supplier_status?.toLowerCase()}`}>
            {promotion.supplier_status}
          </div>
        </div>

        <div className="promo-section">
          <p className="promo-description">{promotion.description}</p>
        </div>

        <div className="promo-grid">

          <div className="grid-box">
            <p>{t("headline")}</p>
            <p>{promotion.headline || "-"}</p>
          </div>

          <div className="grid-box">
            <p>{t("priority_level")}</p>
            <p>{promotion.priority_level || "-"}</p>
          </div>

          <div className="grid-box">
            <p>{t("offer_type")}</p>
            <p>{promotion.offer_type}</p>
          </div>

          <div className="grid-box">
            <p>{t("offer_value")}</p>
            <p>
              {promotion.offer_type === "PERCENTAGE"
                ? `${formatNumber(promotion.offer_value)}٪`
                : formatNumber(promotion.offer_value)}
            </p>
          </div>

          <div className="grid-box">
            <p>{t("start_date")}</p>
            <p>{formatDate(promotion.start_date)}</p>
          </div>

          <div className="grid-box">
            <p>{t("end_date")}</p>
            <p>{formatDate(promotion.end_date)}</p>
          </div>

        </div>

        {/* PRODUCTS */}
        <div className="products-section">
          <h3>{t("promotion_products")}</h3>

          <div className="products-grid">
            {products.map((p) => (
              <div className="product-card" key={p.id}>

                <div className="product-image-wrapper">
                  {p.images?.[0] && (
                    <img src={p.images[0]} alt="" className="product-image" />
                  )}

                  <div className="su-offer-badge">
                    {p.offer_type === "PERCENTAGE"
                      ? `${p.offer_value}% ${t("off")}`
                      : `QAR ${p.offer_value} ${t("off")}`}
                  </div>
                </div>

                {/* ✅ LANGUAGE SWITCH */}
                  <div className="product-name">
                    {i18n.language === "ar"
                      ? (p.name_arabic || p.name || "-")
                      : (p.name || "-")}
                  </div>

                <div className="product-price">
                  <span className="original-price">
                    {isArabic
                      ? `ر.ق ${formatNumber(p.original_price)}`
                      : `QAR ${formatNumber(p.original_price)}`}
                  </span>
                  <span className="discounted-price">
                    {isArabic
                      ? `ر.ق ${formatNumber(p.discounted_price)}`
                      : `QAR ${formatNumber(p.discounted_price)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {promotion.supplier_status?.toUpperCase() === "INVITED" && (
          <div className="promo-actions">
            <button className="btn-corporate btn-accept" onClick={acceptPromotion}>
              {t("accept")}
            </button>

            <button className="btn-corporate btn-reject" onClick={rejectPromotion}>
              {t("reject")}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default SupplierPromotionReview;