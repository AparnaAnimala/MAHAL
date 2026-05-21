import React, { useEffect, useState } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

import "../pages/css/AdminSupplierPromotionRequests.css";

const API = "http://192.168.2.22:5000/api/v1";

const AdminSupplierPromotionRequests = () => {
  const { setActiveView } = useOutletContext();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");

    axios.get(`${API}/admin/promotions/supplier/requests`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setRequests(res.data));
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h2>Pending Promotion Requests</h2>

      {requests.map((r) => {

        const supplierId = Array.isArray(r.supplier_ids)
          ? r.supplier_ids[0]
          : JSON.parse(r.supplier_ids || "[]")[0];

        return (
          <div key={r.id} className="request_card">
            <div>
              <h4>Promotion #{r.id}</h4>
              <p>Supplier: {supplierId}</p>
              <p>Type: {r.target_type}</p>
            </div>

            <button
              className="review_btn"
              // onClick={() =>
              //   window.location.href = `/admin/dashboard/promotion-review/${r.id}`
              // }
              onClick={() => {
                localStorage.setItem("review_promo_id", r.id);
                setActiveView("promotionReview");
              }}
            >
              Review
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default AdminSupplierPromotionRequests;