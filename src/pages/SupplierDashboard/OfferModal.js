import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
const OfferModal = ({ product, offer, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { t, i18n } = useTranslation();
  const [type, setType] = useState("");
  const [percentage, setPercentage] = useState("");
  const [flat, setFlat] = useState("");
  const [buyQty, setBuyQty] = useState("");
  const [getQty, setGetQty] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isInactive, setIsInactive] = useState(false);

  useEffect(() => {
    const normalizeDate = (d) => {
      if (!d) return "";
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
      const parsed = new Date(d);
      if (isNaN(parsed)) return "";
      return parsed.toISOString().split("T")[0];
    };

    if (offer) {
      setTitle(offer.offer_title || "");
      setDescription(offer.offer_description || "");
      setType(offer.offer_type || "");
      setPercentage(offer.discount_percentage || "");
      setFlat(offer.flat_amount || "");
      setBuyQty(offer.buy_quantity || "");
      setGetQty(offer.get_quantity || "");
      setStartDate(normalizeDate(offer.start_date));
      setEndDate(normalizeDate(offer.end_date));
      setStartTime(offer.start_time || "");
      setEndTime(offer.end_time || "");
      setIsInactive(offer.is_active === false);
    } else {
      setTitle("");
      setDescription("");
      setType("");
      setPercentage("");
      setFlat("");
      setBuyQty("");
      setGetQty("");
      setStartDate("");
      setEndDate("");
      setStartTime("");
      setEndTime("");
      setIsInactive(false);
    }
  }, [offer]);

  return (
    <div className="modal_overlay">
      {/* 🔥 SAME STRUCTURE AS EditInventoryModal */}
      <div className="modal_box large edit_modal">

        <h3 className="modal_title">
          {offer ? t("edit_offer") : t("create_offer")}
        </h3>

        <p className="product_name">
          {i18n.language === "ar"
            ? product.product_name_arabic || product.product_name_english
            : product.product_name_english}
        </p>

        {/* Offer Title */}
        <div className="form_group">
          <label>{t("offer_title")}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="form_group">
          <label>{t("description")}</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Offer Type */}
        <div className="form_group">
          <label>{t("offer_type")}</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">{t("select_offer_type")}</option>
            <option value="Percentage">{t("percentage")}</option>
            <option value="Flat">{t("flat")}</option>
            <option value="BOGO">{t("bogo")}</option>
          </select>
        </div>

        {type === "Percentage" && (
          <div className="form_group">
            <label>{t("discount_percentage")} (%)</label>
            <input
              type="number"
              min="1"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
            />
          </div>
        )}

        {type === "Flat" && (
          <div className="form_group">
            <label>{t("flat_discount")}</label>
            <input
              type="number"
              min="1"
              value={flat}
              onChange={(e) => setFlat(e.target.value)}
            />
          </div>
        )}

        {type === "BOGO" && (
          <>
            <div className="form_group">
              <label>{t("buy_quantity")}</label>
              <input
                type="number"
                min="1"
                value={buyQty}
                onChange={(e) => setBuyQty(e.target.value)}
              />
            </div>

            <div className="form_group">
              <label>{t("get_quantity")}</label>
              <input
                type="number"
                min="1"
                value={getQty}
                onChange={(e) => setGetQty(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Dates */}
        <div className="form_group">
          <label>{t("start_date")}</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="form_group">
          <label>{t("end_date")}</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="form_group">
          <label>{t("start_time")}</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div className="form_group">
          <label>{t("end_time")}</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        {offer && (
          <>
            <div className="offer_status">
              {t("status")}: <b>{t(offer.offer_status?.toLowerCase())}</b>
            </div>

            <div className="form_group">
              <label>
                <input
                  type="checkbox"
                  checked={isInactive}
                  onChange={(e) => setIsInactive(e.target.checked)}
                />
                {t("toggle_offer")}
              </label>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="modal_actions">
          <button className="btn cancel" onClick={onClose}>
  {t("cancel")}
</button>

          <button
            className="btn save"
            onClick={() =>
              onSave({
                product_id: product.product_id,
                title,
                description,
                offer_type: type,
                discount_percentage: percentage,
                flat_amount: flat,
                buy_quantity: buyQty,
                get_quantity: getQty,
                start_date: startDate,
                end_date: endDate,
                start_time: startTime,
                end_time: endTime,
                is_active: !isInactive,
              })
            }
          >
            {offer ? t("update_offer") : t("create_offer")}
          </button>
        </div>

      </div>
    </div>
  );
};

export default OfferModal;
