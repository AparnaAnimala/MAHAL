import React, { useEffect, useState } from "react";
import axios from "axios";
import "../pages/css/AdminPromotionReview.css";
import { useOutletContext } from "react-router-dom";

const API = "http://192.168.2.22:5000/api/v1";

const AdminPromotionReview = () => {
  const promoId = localStorage.getItem("review_promo_id");
  const token = localStorage.getItem("admin_token");
  const { setActiveView } = useOutletContext();

  const [products, setProducts] = useState([]);
  const [promotion, setPromotion] = useState(null);
  const [reason, setReason] = useState("");
  const [editMode, setEditMode] = useState(false);

  /* FETCH PROMOTION */
  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const res = await axios.get(
          `${API}/admin/promotions/supplier/${promoId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPromotion(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPromotion();
  }, [promoId, token]);

  /* FETCH PRODUCTS */
  useEffect(() => {
    if (!promotion?.target_ids) return;

    axios
      .get(`${API}/admin/products/by-ids`, {
        params: { ids: promotion.target_ids.join(",") },
      })
      .then((res) => setProducts(res.data));
  }, [promotion]);

  /* DECISION */
  const decision = async (action) => {
    if (action === "REJECT" && !reason.trim()) {
      alert("Enter rejection reason");
      return;
    }

    await axios.post(
      `${API}/admin/promotions/supplier/${promoId}/decision`,
      {
        action,
        priority_level: promotion.priority_level,
        bid_amount: promotion.bid_amount,
        decision_reason: action === "REJECT" ? reason : null,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    localStorage.removeItem("review_promo_id");
    setActiveView("promotionRequests");
  };

  if (!promotion) return <div>Loading...</div>;

  return (
    <div className="review_container">
      <div className="review_card">
        <h2 className="title">Promotion Review</h2>

        <div className="review_grid">

          {/* LEFT SIDE */}
          <div>
            {/* SUPPLIER */}
            <div className="box">
              <h3>Supplier</h3>
              <p>
                {promotion.company_name_english} (ID: {promotion.supplier_ids})
              </p>
              <p>
                <strong>Target Type:</strong> {promotion.target_type}
              </p>
            </div>

            {/* PRODUCTS */}
            <div className="box">
              <h3>Products</h3>
              {products.map((p) => (
                <p key={p.product_id}>
                  • {p.product_name_english} (ID: {p.product_id})
                </p>
              ))}
            </div>

            {/* CONTENT */}
            <div className="box">
              <h3>Content</h3>
              <p><b>Title:</b> {promotion.title}</p>
              <p><b>Headline:</b> {promotion.headline}</p>
              <p><b>Description:</b> {promotion.description}</p>
              <p><b>Cities:</b> {promotion.location_values?.join(", ")}</p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div>
            {/* IMAGE */}
            {promotion.image_url && (
              <div className="image_box">
                <img src={promotion.image_url} alt="banner" />
              </div>
            )}

            {/* OFFER DETAILS */}
            <div className="box">
              <h3>Offer Details</h3>

              <p><b>Offer:</b> {promotion.offer_type} - {promotion.offer_value}</p>
              <p><b>Priority:</b> {promotion.priority_level}</p>
              <p><b>Bid:</b> QAR {promotion.bid_amount}</p>
              <p><b>Start:</b> {new Date(promotion.start_date).toLocaleDateString()}</p>
              <p><b>End:</b> {new Date(promotion.end_date).toLocaleDateString()}</p>
            </div>
          </div>

        </div>

        {/* BUTTONS */}
        <div className="review_actions">
          <button className="approve_btn" onClick={() => decision("APPROVE")}>
            Approve
          </button>

          <button className="reject_btn" onClick={() => setEditMode(true)}>
            Reject
          </button>
        </div>

        {/* REJECT BOX */}
        {editMode && (
          <div className="reject_section">
            <textarea
              placeholder="Enter rejection reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <button
              className="confirm_reject_btn"
              onClick={() => decision("REJECT")}
            >
              Confirm Reject
            </button>

            <button
              className="cancel_btn"
              onClick={() => {
                setEditMode(false);
                setReason("");
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPromotionReview;