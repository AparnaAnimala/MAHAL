
import React, { useState, useEffect } from "react";
// import "../css/status.css";
import { useTranslation } from "react-i18next";

const API = "http://192.168.2.22:5000/api/v1/orders";
// const PROD_URL = "https://anthracotic-rootlike-evelina.ngrok-free.dev";
// const PROD_URL = window.location.origin;
const PROD_URL = "https://anthracotic-rootlike-evelina.ngrok-free.dev";
const AssignDeliveryModal = ({ order, onClose, onAssigned }) => {

  const { t, i18n } = useTranslation();

  const isRTL = i18n.language === "ar";

  const [deliveryType, setDeliveryType] = useState("OWN");
  const [driverName, setDriverName] = useState("");
  const [driverMobile, setDriverMobile] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [selectedBoy, setSelectedBoy] = useState("");

  // const getDriverLink = (token) => {
  //   return `${PROD_URL}/driver?token=${token}`;
  // };

  // const getDriverLink = (token) => {
  //   return `${window.location.origin}/driver?token=${token}`;
  // };

  const getDriverLink = (token) => {
    return `${PROD_URL}/driver?token=${token}`;
  };

  useEffect(() => {
    fetch("http://192.168.2.22:5000/api/v1/delivery-boys", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setDeliveryBoys(data));
  }, []);

  const handleAssign = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/${order.id}/assign-delivery`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          delivery_type: deliveryType,
          driver_name: driverName,
          driver_mobile: driverMobile,
          vehicle_type: vehicleType,
          vehicle_number: vehicleNumber,
          partner_name: partnerName,
          estimated_delivery_time: estimatedTime,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed");
        return;
      }

      alert("🚚 Delivery Assigned Successfully");

      if (driverMobile) {
        const cleanMobile = driverMobile.replace(/\D/g, "");
        const driverLink = getDriverLink(data.driver_token);

        const message = encodeURIComponent(
`🚚 Delivery Assigned

Order ID: ${order.id}
Driver: ${driverName}

Start Delivery:
${driverLink}`
        );

        window.open(`https://wa.me/${cleanMobile}?text=${message}`, "_blank");
      }

      if (data.restaurant_otp_link) {
        setTimeout(() => {
          window.open(data.restaurant_otp_link, "_blank");
        }, 800);
      }

      onAssigned && onAssigned();
      onClose();

    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal_overlay" dir={isRTL ? "rtl" : "ltr"}>
      <div className="order_modal">

        <div className="modal_header">
          <h4>🚚 {t("assign_delivery")}</h4>
          <button onClick={onClose}>✖</button>
        </div>

        <div className="card">
          <h5>{t("estimated_delivery_time")}</h5>
          <input
            type="datetime-local"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            className="form-control"
          />
        </div>

        <select
          value={selectedBoy}
          onChange={(e) => {
            const boyId = e.target.value;
            setSelectedBoy(boyId);

            const boy = deliveryBoys.find((b) => b.id == boyId);
            if (boy) {
              setDriverName(boy.name);
              setDriverMobile(boy.mobile);
              setVehicleType(boy.vehicle_type);
              setVehicleNumber(boy.vehicle_number);
            }
          }}
          className="form-control mb-2"
        >
          <option value="">{t("select_saved_driver")}</option>
          {deliveryBoys.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.mobile})
            </option>
          ))}
        </select>

        <div className="card">
          <h5>{t("delivery_type")}</h5>
          <select
            value={deliveryType}
            onChange={(e) => setDeliveryType(e.target.value)}
            className="form-control"
          >
            <option value="OWN">{t("own_delivery")}</option>
            <option value="PARTNER">{t("partner")}</option>
          </select>
        </div>

        {deliveryType === "OWN" && (
          <div className="card">
            <input
              placeholder={t("driver_name")}
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="form-control mb-2"
            />

            <input
              placeholder={t("driver_mobile")}
              value={driverMobile}
              onChange={(e) => setDriverMobile(e.target.value)}
              className="form-control mb-2"
            />

            <input
              placeholder={t("vehicle_type")}
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="form-control mb-2"
            />

            <input
              placeholder={t("vehicle_number")}
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="form-control"
            />
          </div>
        )}

        {deliveryType === "PARTNER" && (
          <div className="card">
            <input
              placeholder={t("partner_name")}
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              className="form-control"
            />
          </div>
        )}

        <div className="modal_actions">
          <button
            className="btn delivered"
            onClick={handleAssign}
            disabled={loading}
          >
            {loading ? t("assigning") : t("confirm_delivery")}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AssignDeliveryModal; 
