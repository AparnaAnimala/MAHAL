import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../css/supplierTrack.css";
import { useTranslation } from "react-i18next";
const API = "http://192.168.2.9:5000/api/v1/orders";

/* =============================
   SIMPLE OWN DELIVERY FLOW
============================= */
const STATUS_FLOW = [
  "ASSIGNED",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
];

// const STATUS_LABELS = {
//   ASSIGNED: "Driver Assigned",
//   OUT_FOR_DELIVERY: "On the Way",
//   DELIVERED: "Delivered"
// };


const STATUS_LABELS = {
  ASSIGNED: "status_assigned",
  OUT_FOR_DELIVERY: "status_on_way",
  DELIVERED: "status_delivered"
};

const SupplierTrack = () => {

  const { orderId } = useParams();

  const [delivery, setDelivery] = useState(null);
  const [location, setLocation] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [distance, setDistance] = useState(null);
  const [etaLeft, setEtaLeft] = useState("");
  const { t, i18n } = useTranslation();
const originLat = Number(location?.lat);
const originLng = Number(location?.lng);
const destLat = Number(delivery?.dest_lat);
const destLng = Number(delivery?.dest_lng);
  /* =============================
     DISTANCE CALCULATION
  ============================= */
  const getDistanceKm = (lat1, lon1, lat2, lon2) => {

    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  /* =============================
     FETCH DELIVERY DETAILS
  ============================= */
  const fetchDelivery = async () => {
    try {
      const res = await axios.get(`${API}/delivery/${orderId}`);
      setDelivery(res.data);
    } catch (err) {
      console.log("Delivery error", err);
    }
  };

  /* =============================
     FETCH LOCATION
  ============================= */
  const fetchLocation = async () => {
    try {
      const res = await axios.get(
        `${API}/delivery/${orderId}/location`
      );

      const data = res.data;

      if (data?.current_lat != null && data?.current_lng != null) {

        const lat = parseFloat(data.current_lat);
        const lng = parseFloat(data.current_lng);

        setLocation({ lat, lng });
        setLastUpdate(new Date());

      }

    } catch (err) {
      console.log("Location error", err);
    }
  };

  /* =============================
     AUTO REFRESH (STOP AFTER DELIVERED)
  ============================= */
  useEffect(() => {

    if (!orderId) return;

    fetchDelivery();
    fetchLocation();

    const interval = setInterval(() => {

      if (delivery?.status === "DELIVERED") return;

      fetchDelivery();
      fetchLocation();

    }, 5000);

    return () => clearInterval(interval);

  }, [orderId]);

  /* =============================
     ETA COUNTDOWN
  ============================= */
  useEffect(() => {

    if (!delivery?.estimated_delivery_time) return;

    const interval = setInterval(() => {

      const eta = new Date(delivery.estimated_delivery_time);
      const now = new Date();

      const diff = eta - now;

      if (diff <= 0) {
        setEtaLeft(t("arriving"));
        return;
      }

      const mins = Math.floor(diff / 60000);
      setEtaLeft(`${mins} ${t("mins")}`);

    }, 1000);

    return () => clearInterval(interval);

  }, [delivery]);

  /* =============================
     DISTANCE (OPTIONAL IF DEST LAT/LNG AVAILABLE)
  ============================= */
  useEffect(() => {

    if (!location || !delivery?.dest_lat) return;

    const km = getDistanceKm(
      location.lat,
      location.lng,
      delivery.dest_lat,
      delivery.dest_lng
    );

    setDistance(km.toFixed(2));

  }, [location, delivery]);

  /* =============================
     STATUS INDEX
  ============================= */
  const currentStatus =
    delivery?.status || "ASSIGNED";

  const currentIndex =
    STATUS_FLOW.indexOf(currentStatus);

  /* =============================
     RENDER
  ============================= */
  return (
    <div className="track-page">

      {/* DELIVERY COMPLETED BANNER */}
      {delivery?.status === "DELIVERED" && (
        <div className="delivered-banner">
          ✅ {t("delivery_completed_success")}
        </div>
      )}

      {/* HEADER */}
      <div className="track-header">
        <div>
          <h2>🚚 {t("delivery_tracking")}</h2>
          <p>{t("order")} #{orderId}</p>
        </div>

        {delivery?.status !== "DELIVERED" && (
          <div className="live-badge">
            <span className="pulse"></span>
            {t("live_tracking")}
          </div>
        )}
      </div>

      {/* SUMMARY CARDS */}
      <div className="track-grid">

        <div className="track-card">
          <h4>{t("driver")}</h4>
          <p>{delivery?.driver_name || "-"}</p>
        </div>

        <div className="track-card">
          <h4>{t("vehicle")}</h4>
          <p>
            {delivery?.vehicle_type || "-"}{" "}
            {delivery?.vehicle_number || ""}
          </p>
        </div>

        <div className="track-card highlight">
          <h4>{t("eta")}</h4>
          <p>
            {delivery?.estimated_delivery_time
              ? new Date(
                  delivery.estimated_delivery_time
                ).toLocaleString()
              : "-"}
          </p>
        </div>

        <div className="track-card">
          <h4>{t("status")}</h4>
          <span className="status-badge">
            {t(STATUS_LABELS[currentStatus]) || currentStatus}
          </span>
        </div>

        {etaLeft && delivery?.status !== "DELIVERED" && (
          <div className="track-card highlight">
            <h4>{t("arriving_in")}</h4>
            <p>{etaLeft}</p>
          </div>
        )}

        {distance && (
          <div className="track-card highlight">
            <h4>{t("distance")}</h4>
            <p>{distance} km</p>
          </div>
        )}

      </div>

      {/* DESTINATION */}
      <div className="track-card destination">
        <h4>{t("destination")}</h4>
        <p>{delivery?.delivery_address}</p>
      </div>

      {/* TIMELINE */}
      <div className="timeline-card">

        {STATUS_FLOW.map((step, index) => (
          <div
            key={step}
            className={`timeline-step ${
              index <= currentIndex ? "active" : ""
            }`}
          >
            <div className="circle"></div>
            <p>{t(STATUS_LABELS[step])}</p>
          </div>
        ))}

      </div>

      {/* MAP WITH ROUTE */}
{location && delivery && (

  <div className="map-card">

    {(() => {

      // ✅ SAFE CONVERSION
      const originLat = Number(location?.lat);
      const originLng = Number(location?.lng);

      const destLat = Number(delivery?.dest_lat);
      const destLng = Number(delivery?.dest_lng);

      const hasValidDest =
        !isNaN(destLat) &&
        !isNaN(destLng) &&
        destLat !== 0 &&
        destLng !== 0;

      return (
        <>
          {/* ================= MAP (ROUTE PREVIEW) ================= */}
          <iframe
            width="100%"
            height="450"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={
              hasValidDest
                ? `https://maps.google.com/maps?saddr=${originLat},${originLng}&daddr=${destLat},${destLng}&output=embed`
                : `https://maps.google.com/maps?q=${originLat},${originLng}&z=14&output=embed`
            }
          ></iframe>

          {/* ================= NAVIGATION ================= */}
          <a
            href={
              hasValidDest
                ? `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`
                : `https://www.google.com/maps?q=${originLat},${originLng}`
            }
            target="_blank"
            rel="noreferrer"
            className="btn primary"
            style={{ marginTop: "10px", display: "inline-block" }}
          >
            🧭 {t("open_navigation")}
          </a>

          {/* ================= DEBUG ================= */}
          <div style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>
            Driver: {originLat}, {originLng} <br />
            Dest: {destLat}, {destLng}
          </div>
        </>
      );
    })()}

    {lastUpdate && (
      <div className="last-update">
        {t("last_updated")}: {lastUpdate.toLocaleTimeString()}
      </div>
    )}

  </div>

)}
    </div>
  );
};

export default SupplierTrack;