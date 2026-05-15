import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const API = "http://192.168.2.9:5000/api/v1/delivery-boys";

export default function DeliveryBoys() {
  const [boys, setBoys] = useState([]);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");

  const [selectedBoy, setSelectedBoy] = useState("");

  const token = localStorage.getItem("token");
  const { t } = useTranslation();

  const fetchBoys = async () => {
    try {
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setBoys(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchBoys();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !mobile) {
      alert(t("delivery_required"));
      return;
    }

    try {
      const url = selectedBoy ? `${API}/${selectedBoy}` : API;
      const method = selectedBoy ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          mobile,
          vehicle_type: vehicleType,
          vehicle_number: vehicleNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || t("failed"));
        return;
      }

      alert(
        selectedBoy
          ? t("delivery_updated")
          : t("delivery_saved")
      );

      setName("");
      setMobile("");
      setVehicleType("");
      setVehicleNumber("");
      setSelectedBoy("");

      fetchBoys();
    } catch (err) {
      console.error(err);
      alert(t("server_error"));
    }
  };

  const handleDelete = async () => {
    if (!selectedBoy) return;

    if (!window.confirm(t("delete_confirm"))) return;

    try {
      await fetch(`${API}/${selectedBoy}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert(t("delivery_deleted"));

      setSelectedBoy("");
      setName("");
      setMobile("");
      setVehicleType("");
      setVehicleNumber("");

      fetchBoys();
    } catch (err) {
      console.error(err);
      alert(t("server_error"));
    }
  };

  return (
    <div className="dashboard_page add_product_page">

      <div className="page_header glass">
        <div>
          <h2>🚚 {t("delivery_management")}</h2>
          <p className="sub_text">{t("delivery_subtitle")}</p>
        </div>
      </div>

      <div className="section_card soft">
        <h4>{t("add_update_delivery")}</h4>

        <form onSubmit={handleSubmit}>

          <div className="form_grid three">
            <div className="form_group">
              <label>{t("driver_name")}</label>
              <input
                placeholder={t("enter_driver_name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form_group">
              <label>{t("mobile_number")}</label>
              <input
                placeholder={t("enter_mobile")}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>

            <div className="form_group">
              <label>{t("vehicle_type")}</label>
              <input
                placeholder={t("vehicle_type_placeholder")}
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
              />
            </div>
          </div>

          <div className="form_grid three">
            <div className="form_group">
              <label>{t("vehicle_number")}</label>
              <input
                placeholder={t("enter_vehicle_number")}
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="form_footer">
            <button type="submit" className="btn_save glow">
              {selectedBoy ? t("update_delivery") : t("submit_delivery")}
            </button>

            {selectedBoy && (
              <button
                type="button"
                className="btn_cancel"
                onClick={handleDelete}
              >
                {t("delete_delivery")}
              </button>
            )}
          </div>

          <div className="form_group">
            <label>{t("select_delivery")}</label>

            <select
              style={{ width: "fit-content", minWidth: "250px" }}
              value={selectedBoy}
              onChange={(e) => {
                const boyId = e.target.value;
                setSelectedBoy(boyId);

                const boy = boys.find(
                  (b) => String(b.id) === String(boyId)
                );

                if (boy) {
                  setName(boy.name);
                  setMobile(boy.mobile);
                  setVehicleType(boy.vehicle_type);
                  setVehicleNumber(boy.vehicle_number);
                } else {
                  setName("");
                  setMobile("");
                  setVehicleType("");
                  setVehicleNumber("");
                }
              }}
            >
              <option value="">
                {t("select_delivery_placeholder")}
              </option>

              {boys.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.mobile})
                </option>
              ))}
            </select>
          </div>

        </form>
      </div>
    </div>
  );
}