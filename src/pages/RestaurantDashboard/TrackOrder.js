import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
// import "../css/trackOrder.css";

const API = "http://192.168.2.22:5000/api/v1/orders";

const steps = [
  { label: "Order Placed", icon: "fa-receipt" },
  { label: "Order Confirmed", icon: "fa-circle-check" },
  { label: "Out For Delivery", icon: "fa-truck-fast" },
  { label: "Delivered", icon: "fa-house-circle-check" },
];

const statusToStep = {
  PLACED: 0,
  ACCEPTED: 1,
  PACKED: 2,
  OUT_FOR_DELIVERY: 2,
  DELIVERED: 3,
  REJECTED: 0,
};

const TrackOrder = ({ orderId }) => {

  const params = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const id = orderId || params.id;

  const [orderStatus, setOrderStatus] = useState("PLACED");
  const [currentStep, setCurrentStep] = useState(0);
  const [delivery, setDelivery] = useState(null);
  const [location, setLocation] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  /* ================= FETCH ORDER ================= */
  const fetchOrder = async () => {
    try {

      const res = await axios.get(
        `${API}/restaurant/orders/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data;

      const status = data?.header?.status || "PLACED";

      setOrderStatus(status);
      setCurrentStep(statusToStep[status] ?? 0);

      // delivery info from backend
      setDelivery(data.delivery || null);

    } catch (err) {
      console.log("Failed to fetch order", err);
    }
  };


  /* ================= FETCH LOCATION ================= */
  const fetchLocation = async () => {
    try {

      const res = await axios.get(`${API}/delivery/${id}/location`);
      const data = res.data;

      if (data?.current_lat != null && data?.current_lng != null) {

        setLocation({
          lat: parseFloat(data.current_lat),
          lng: parseFloat(data.current_lng),
        });

        setLastUpdate(new Date());
      }

    } catch (err) {
      console.log("Location fetch error", err);
    }
  };


  /* ================= AUTO REFRESH ================= */
  useEffect(() => {

    if (!id) return;

    fetchOrder();
    fetchLocation();

    const interval = setInterval(() => {
      fetchOrder();
      fetchLocation();
    }, 5000);

    return () => clearInterval(interval);

  }, [id]);


  const mapsLink =
  location && delivery?.dest_lat && delivery?.dest_lng
    ? `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${delivery.dest_lat},${delivery.dest_lng}&travelmode=driving`
    : location
    ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
    : null;


  return (
  <div className="dashboard_page">

    {/* HEADER */}
    <div className="page_header">
      <div>
        <h2>
          <i className="fa-solid fa-location-dot me-2"></i>
          Track Your Order
        </h2>
      </div>

      <button className="btn_add_item_v2" onClick={() => navigate(-1)}>
        <i className="fa fa-arrow-left me-2"></i>
        Back
      </button>
    </div>


    {/* ORDER INFO */}
    <div className="card info_card">

      <div>

        <p><b>Order ID:</b> {id}</p>

        <p>
          <b>Delivery Partner:</b>{" "}
          {delivery?.driver_name ||
            delivery?.partner_name ||
            "Not Assigned"}
        </p>

        <p>
          <b>ETA:</b>{" "}
          {delivery?.estimated_delivery_time
            ? new Date(delivery.estimated_delivery_time).toLocaleString()
            : "-"}
        </p>

      </div>

      <span className="status_badge outfordelivery">
        <i className="fa-solid fa-truck-fast me-1"></i>
        {orderStatus}
      </span>

    </div>


    {/* PROGRESS BAR */}
    <div className="card mt-4">

      <h5 className="card_title">
        <i className="fa-solid fa-chart-line me-2"></i>
        Order Progress
      </h5>

      <div className="progress_container">
        <div
          className="progress_line"
          style={{
            width: `${((currentStep + 1) / steps.length) * 100}%`,
          }}
        />
      </div>

      {/* STEPPER */}
      <ul className="icon_stepper">
        {steps.map((step, index) => (
          <li
            key={index}
            className={
              index < currentStep
                ? "done"
                : index === currentStep
                ? "active"
                : ""
            }
          >
            <i className={`fa-solid ${step.icon}`}></i>
            <span>{step.label}</span>
          </li>
        ))}
      </ul>

    </div>


    {/* ACTIONS */}
    <div className="row mt-4">

      {/* SUPPORT / DRIVER CONTACT */}
      <div className="col-lg-4">
        <div className="card action_card">

          <h5 className="card_title">
            <i className="fa-solid fa-phone me-2"></i>
            Support
          </h5>

          {delivery?.driver_mobile ? (
            <>
              <a
                href={`tel:${delivery.driver_mobile}`}
                className="btn btn-primary w-100 mb-2"
              >
                <i className="fa-solid fa-phone me-2"></i>
                Call Driver
              </a>

              <a
                href={`https://wa.me/${delivery.driver_mobile}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success w-100"
              >
                <i className="fa-brands fa-whatsapp me-2"></i>
                WhatsApp Driver
              </a>
            </>
          ) : (
            <div className="alert alert-info">
              Driver not assigned yet
            </div>
          )}

          {mapsLink && (
            <a
              href={mapsLink}
              target="_blank"
              rel="noreferrer"
              className="btn btn-warning w-100 mt-2"
            >
              🧭 Navigate
            </a>
          )}

        </div>
      </div>


      {/* LIVE MAP */}
      <div className="col-lg-8">

        <div className="card">

          <h5 className="card_title">
            <i className="fa-solid fa-map-location-dot me-2"></i>
            Live Location
          </h5>

          {!location && (
            <div className="icon_map_placeholder">
              <i className="fa-solid fa-truck-moving"></i>
              <p>Waiting for driver location...</p>
            </div>
          )}

          {location && (

            <div style={{ height: "350px", width: "100%" }}>

              <iframe
                key={`${location.lat}-${location.lng}`}
                width="100%"
                height="350"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={
                  delivery?.dest_lat && delivery?.dest_lng
                    ? `https://maps.google.com/maps?saddr=${location.lat},${location.lng}&daddr=${delivery.dest_lat},${delivery.dest_lng}&output=embed`
                    : `https://maps.google.com/maps?q=${location.lat},${location.lng}&z=14&output=embed`
                }
              ></iframe>

              {lastUpdate && (
                <div className="last-update">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </div>
              )}

            </div>

          )}

        </div>

      </div>

    </div>

  </div>
);
};

export default TrackOrder;