import { useEffect, useState } from "react";
// import "../css/driverTracking.css";
import { useTranslation } from "react-i18next";
const API = "/api/v1/orders";

const DriverTracking = () => {

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [details, setDetails] = useState(null);
  const [otp, setOtp] = useState("");
  const [coords, setCoords] = useState(null);
  const [delivered, setDelivered] = useState(false);
  const { t, i18n } = useTranslation();



  /* ================= LOAD DETAILS ================= */
  useEffect(() => {

    if (!token) {
      setDetails({ error: "Invalid link" });
      return;
    }

    fetch(`${API}/driver/details`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {

        const data = await res.json();

        if (!res.ok) {
          setDetails({ error: data.error || "Invalid link" });
          return;
        }

        setDetails(data);

      })
      .catch(() => setDetails({ error: "Invalid link" }));

  }, [token]);


  /* ================= GPS ================= */
  useEffect(() => {

    if (!token || !details || details.error || delivered) return;

    const watchId = navigator.geolocation.watchPosition(

      async (pos) => {

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setCoords({ lat, lng });

        await fetch(`${API}/driver/location`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ lat, lng })
        });

      },

      () => alert("Enable GPS"),
      { enableHighAccuracy: true }

    );

    return () => navigator.geolocation.clearWatch(watchId);

  }, [token, details, delivered]);


  /* ================= LOADING ================= */
  if (!details) return <div className="loading">{t("loading")}</div>;

  /* ================= SUCCESS SCREEN ================= */
  if (delivered) {
    return (
      <div className="driver-page center">
        <div className="success-card">

          <div className="checkmark-circle">
            ✔
          </div>

          <h2>{t("delivery_success")}</h2>
          <p>{t("order")} #{details?.order_id}</p>

          <p className="sub">
            {t("delivery_completed_msg")}
          </p>

        </div>
      </div>
    );
  }


  /* ================= ERROR STATES ================= */

  if (details.error) {

    let title = t("invalid_link_title");
    let msg = t("invalid_link_msg");

    if (details.error === "Delivery already completed") {
      title = t("delivery_completed_title");
      msg = t("delivery_completed_msg_short");
    }

    if (details.error === "Link expired") {
      title = t("link_expired_title");
      msg = t("contact_restaurant");
    }

    return (
      <div className="driver-page">
        <div className="card">
          <h2>{title}</h2>
          <p>{msg}</p>
        </div>
      </div>
    );
  }


  /* ================= NORMAL PAGE ================= */

const mapsLink =
  details.delivery_lat && details.delivery_lng
    ? `https://www.google.com/maps?q=${details.delivery_lat},${details.delivery_lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(details.delivery_address)}`;


return (
  <div className="driver-container">

    {/* HEADER */}
    <div className="header">
      <h2>🚚 {t("delivery")}</h2>
      <span className="order-id">{t("order")} #{details.order_id}</span>
    </div>

    {/* NAVIGATION CARD */}
    <div className="card highlight">
      <h3>📍 {t("navigate_location")}</h3>

      <p>{details.delivery_address}</p>

      {/* ✅ VISUAL HINT */}
      {details.delivery_lat && details.delivery_lng && (
        <small style={{ color: "green", fontWeight: "bold" }}>
          {t("gps_enabled")}
        </small>
      )}

      <a
        href={mapsLink}
        target="_blank"
        rel="noreferrer"
        className="btn big primary"
      >
        🧭 {t("start_navigation")}
      </a>
    </div>

    {/* RESTAURANT */}
    <div className="card">
      <h3>🏪 {t("restaurant")}</h3>
      <p>{details.restaurant_name}</p>

      <a href={`tel:${details.restaurant_phone}`} className="btn call">
        📞 {t("call")}
      </a>
    </div>

    {/* ITEMS */}
    <div className="card">
      <h3>📦 {t("order_items")}</h3>

      {details.items?.map((item, i) => (
        <div key={i} className="item-row">
          <span>
            {i18n.language === "ar"
              ? item.product_name_arabic || item.product_name_english
              : item.product_name_english}
          </span>
          <span>x{item.quantity}</span>
        </div>
      ))}
    </div>

    {/* PAYMENT */}
    <div className="card payment">
      <h3>💳 {t("payment")}</h3>

      <p><b>{details.payment_method}</b></p>
      <p>{t("status")}: {details.payment_status}</p>
      <h2>QAR  {details.total_amount}</h2>

      {details.payment_method === "COD" &&
        details.payment_status !== "PAID" && (
          <button
            className="btn success big"
            onClick={async () => {
              const res = await fetch(`${API}/driver/payment`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ payment_status: "PAID" })
              });

              const data = await res.json();
              alert(data.message || data.error);

              if (data.success) {
                setDetails({
                  ...details,
                  payment_status: "PAID"
                });
              }
            }}
          >
            ✅ {t("mark_payment_received")}
          </button>
        )}
    </div>

    {/* DELIVERY COMPLETE */}
    <div className="card complete">
      <h3>✅ {t("complete_delivery")}</h3>

      <input
        placeholder={t("enter_otp")}
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="otp-input"
      />

      <button
        className="btn big primary"
        onClick={async () => {
          const res = await fetch(`${API}/driver/complete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ otp })
          });

          const data = await res.json();
          alert(data.message || data.error);

          if (res.ok) setDelivered(true);
        }}
      >
        🚀 {t("mark_delivered")}
      </button>
    </div>

  </div>
);
};

export default DriverTracking;