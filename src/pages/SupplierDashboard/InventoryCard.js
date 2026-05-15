import { useTranslation } from "react-i18next";
const InventoryCard = ({ product, onClick }) => {

  const { t, i18n  } = useTranslation();

  /* ================= HELPERS ================= */
  const getMinutesDiff = (target) => {
    const now = new Date();
    const diffMs = target - now;
    return Math.ceil(diffMs / (1000 * 60));
  };

  const formatTimeAMPM = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString(i18n.language === "ar" ? "ar-EG" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const safeDate = (dateStr, timeStr = null) => {
    if (!dateStr) return null;

    const iso = timeStr
      ? `${dateStr}T${timeStr}`
      : `${dateStr}T00:00:00`;

    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  };

  /* ================= INITIAL ================= */
  // let finalPrice = product.price;
  // let originalPrice = product.price;
  let finalPrice = Number(product.price) || 0;
  let originalPrice = Number(product.price) || 0;
  let badgeText = null;
  let badgeType = "active";
  let hasTimeBadge = false;

  const offer = product.offer;

  /* ================= OFFER LOGIC ================= */
  if (offer) {

    /* 🔴 ENDING SOON (highest priority) */
    if (
      offer.offer_status === "ACTIVE" &&
      offer.end_date &&
      offer.end_time
    ) {
      const endDateTime = safeDate(offer.end_date, offer.end_time);
      if (endDateTime) {
        const minsLeft = getMinutesDiff(endDateTime);
        if (minsLeft > 0 && minsLeft <= 30) {
          badgeText = t("ends_in", { count: minsLeft });
          badgeType = "ending";
          hasTimeBadge = true;
        }
      }
    }

    /* 🟢 ACTIVE OFFER */
    if (offer.offer_status === "ACTIVE" && !hasTimeBadge) {
      if (offer.offer_type === "Percentage") {
        finalPrice =
          product.price -
          (product.price * offer.discount_percentage) / 100;
        badgeText = t("percent_off", { value: offer.discount_percentage });
      }

      if (offer.offer_type === "Flat") {
        finalPrice = product.price - offer.flat_amount;
        badgeText = t("flat_off", { value: offer.flat_amount });
      }

      if (offer.offer_type === "BOGO") {
        badgeText = t("buy_get", {
          buy: offer.buy_quantity,
          get: offer.get_quantity
        });
      }
    }

    /* 🟡 UPCOMING OFFER */
    if (offer.offer_status === "UPCOMING") {
      badgeType = "upcoming";

      const startDateTime = safeDate(
        offer.start_date,
        offer.start_time
      );

      // fallback if date is invalid
      if (!startDateTime) {
        badgeText = t("upcoming");
      } else {
        const diffMinutes = getMinutesDiff(startDateTime);

        // starts within 1 hour
        if (diffMinutes > 0 && diffMinutes <= 60) {
          badgeText = t("starts_in_min", { value: formatNumber(diffMinutes) });
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const diffDays = Math.ceil(
            (startDateTime - today) / (1000 * 60 * 60 * 24)
          );

          badgeText =
          diffDays === 1
            ? t("starts_tomorrow")
            : t("starts_in_days", { value: formatNumber(diffDays) });
        }
      }
    }
  }

  const isArabic = i18n.language?.startsWith("ar");

const formatNumber = (num) => {
  return new Intl.NumberFormat(
    isArabic ? "ar-EG" : "en-US"
  ).format(num);
};

const formatCurrency = (num) => {
  const value = formatNumber(Number(num || 0).toFixed(2));
  return isArabic ? `ر.ق ${value}` : `QAR ${value}`;
};

const formatTime = (time) => {
  if (!time) return "";

  const date = new Date(`1970-01-01T${time}`);
  return new Intl.DateTimeFormat(
    isArabic ? "ar-EG" : "en-US",
    { hour: "numeric", minute: "2-digit" }
  ).format(date);
};

const countryMap = {
  Qatar: isArabic ? "قطر" : "Qatar",
  QATAR: isArabic ? "قطر" : "QATAR",
  INDIA: isArabic ? "الهند" : "India",
};

  /* ================= RENDER ================= */
  return (
    <div className={`inventory_card ${product.stockStatus}`} onClick={onClick}>

      {badgeText && (
        <div className={`offer_badge ${badgeType}`}>
          {badgeText}
        </div>
      )}

      <div className="card_image">
        <img
          src={
            product.primary_image ||
            product.image ||
            product.images?.[0]
          }
          alt={product.name}
        />
      </div>

      <div className="card_details">
        <h4>
          {i18n.language === "ar"
            ? product.product_name_arabic || product.product_name_english || "-"
            : product.product_name_english || "-"}
        </h4>

        <div className="row-list">
          <div className="list_tag">
            <span>{t("country")}:</span>
            {countryMap[product.country] || product.country || "-"}
          </div>
        </div>

        <div className="row-list">
          <div className="list_tag">
            <span>{t("Supcurrency")}:</span>
            {isArabic ? "ر.ق" : product.currency}
          </div>
        </div>

        <div className="row-list">
          <div className="list_tag">
            <span>{t("price")}:</span>
            {offer?.offer_status === "ACTIVE" && finalPrice !== originalPrice ? (
              <>
                <span style={{ textDecoration: "line-through", color: "#999" }}>
                  {formatCurrency(originalPrice)}
                </span>
                <b style={{ color: "#2e7d32" }}>
                  {formatCurrency(finalPrice)}
                </b>
              </>
            ) : (
              <b>{formatCurrency(originalPrice)}</b>
            )}
          </div>
        </div>

        {/* <div className="row-list">
          <div className="list_tag">
            <span>Price:</span>
            {offer?.offer_status === "ACTIVE" && finalPrice !== originalPrice ? (
              <>
                <span style={{ textDecoration: "line-through", color: "#999" }}>
                  QAR {originalPrice}
                </span>
                <b style={{ color: "#2e7d32" }}>
                  QAR {finalPrice.toFixed(2)}
                </b>
              </>
            ) : (
              <b>QAR {originalPrice}</b>
            )}
          </div>
        </div> */}

        <div className="row-list">
          <div className="list_tag">
            <span>{t("expiry")}:</span>
            {new Date(product.expiry_date).toLocaleDateString(i18n.language === "ar" ? "ar-EG" : "en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
            {formatDate(product.expiry_date)}
            {product.expiry_time && (
              <span style={{ marginLeft: 8, fontWeight: 600 }}>
                {formatTime(product.expiry_time)}
              </span>
            )}
          </div>
        </div>

        <div className="row-list">
          <div className="list_tag">
            <span>{t("moq")}:</span>
            <b>{formatNumber(product.moq)}</b>
          </div>
        </div>

        <div className="row-list">
          <div className="list_tag">
            <span>{t("uom")}:</span>
            {product.uom}
          </div>
        </div>

        <div className="row-list">
          <div className="list_tag">
            <span>{t("units")}:</span>
            <b>{formatNumber(product.units)}</b>
          </div>
        </div>
        {offer?.offer_status === "ACTIVE" && offer?.start_date && offer?.end_date && (
          <div className="row-list">
            <div className="list_tag">
              <span>{t("offer_valid")}:</span>
              {formatDate(offer.start_date)} {i18n.language === "ar" ? "←" : "→"} {formatDate(offer.end_date)}
            </div>
          </div>
        )}

        {offer?.offer_status === "ACTIVE" && offer?.start_time && (
          <div className="row-list">
            <div className="list_tag">
              <span>{t("offer_time")}:</span>
              {formatTimeAMPM(offer.start_time)} {i18n.language === "ar" ? "←" : "→"} {formatTimeAMPM(offer.end_time)}
            </div>
          </div>
        )}

        {offer?.offer_status === "UPCOMING" && offer?.start_date && (
          <div className="row-list">
            <div className="list_tag">
              <span>{t("offer_starts")}:</span>
              {formatDate(offer.start_date)}
            </div>
          </div>
        )}

        <div className="badges">
          <span className={`badge ${product.stockStatus}`}>
            {t(product.stockStatus.toLowerCase())}
          </span>
          <span className={`badge ${product.expiryStatus}`}>
            {t(product.expiryStatus.toLowerCase())}
          </span>
        </div>

      </div>
    </div>
  );
};

export default InventoryCard;