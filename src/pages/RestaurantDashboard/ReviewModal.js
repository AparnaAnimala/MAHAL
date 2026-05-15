import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const ReviewModal = ({ order, onClose }) => {
  const token = localStorage.getItem("token");

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const [reviewImage, setReviewImage] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const { t, i18n } = useTranslation();
  const formatNumber = (value) => {
  return new Intl.NumberFormat(
    i18n.language === "ar" ? "ar-QA" : "en-US"
  ).format(value);
};

const toArabicDigitsOnly = (value) => {
  if (i18n.language !== "ar") return value;
  return String(value).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
};

  /* ================= LOAD ORDER ITEMS ================= */
  useEffect(() => {
    axios
      .get(
        `http://192.168.2.9:5000/api/v1/orders/restaurant/orders/${order.order_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => setItems(res.data?.items || []))
      .catch(() => alert(t("resload_items_error")));
  }, [order, token]);

  /* ================= LOAD REVIEWS ================= */
  const loadReviews = () => {
    setLoadingReviews(true);

    axios
      .get("http://192.168.2.9:5000/api/reviews/restaurant", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setReviews(res.data || []))
      .finally(() => setLoadingReviews(false));
  };

  useEffect(() => {
    loadReviews();
  }, []);

  /* ================= SUBMIT REVIEW ================= */
  const submitReview = async () => {
    if (!selectedItem) {
      alert(t("resselect_product_error"));
      return;
    }

    try {
      const formData = new FormData();

      formData.append("product_id", selectedItem);

      formData.append(
        "product_name",
        items.find((i) => i.product_id === Number(selectedItem))
          ?.product_name_english
      );

      formData.append("order_id", order.order_id);
      formData.append("rating", rating);
      formData.append("review_text", reviewText);

      /* ✅ Add Image */
      if (reviewImage) {
        formData.append("review_image", reviewImage);
      }

      await axios.post("http://192.168.2.9:5000/api/reviews", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert(t("ressuccess_review"));

      setSelectedItem("");
      setRating(5);
      setReviewText("");
      setReviewImage(null);

      loadReviews();
      onClose(); // auto close modal
    } catch (err) {
      alert(t("resreview_failed"));
    }
  };

  return (
    <div className="modal_overlay">
      <div className="order_modal" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
        {/* HEADER */}
        <div className="modal_header">
          <h4>{t("ressubmit_review")}</h4>
          <button onClick={onClose}>✖</button>
        </div>

        {/* ORDER INFO */}
        <div className="info_grid">
          <div>
            <b>{t("resorder_id")}</b>
            <span dir="ltr" style={{ unicodeBidi: "isolate" }}>
              {toArabicDigitsOnly(order.order_id)}
            </span>
          </div>

          <div>
            <b>{t("ressupplier")}</b>
            <span>  {i18n.language === "ar"
              ? order.company_name_arabic || order.company_name_english
              : order.company_name_english}
            </span>
          </div>

          <div>
            <b>{t("restotal")}</b>
            <span>{t("resqar")} {formatNumber(order.total_amount)}</span>
          </div>
        </div>

        {/* REVIEW FORM */}
        <div className="card">
          <h5>{t("resreview_products")}</h5>

          {/* PRODUCT SELECT */}
          <label>{t("resselect_product")}</label>
          <select
            className="form-control mb-2"
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
          >
            <option value="">{t("resselect_product_placeholder")}</option>
            {items.map((i) => (
            <option key={i.product_id} value={i.product_id}>
              {i18n.language === "ar"
                ? i.product_name_arabic || i.product_name_english
                : i.product_name_english}
            </option>
            ))}
          </select>

          {/* RATING */}
          <label>{t("resrating")}</label>
          <select
            className="form-control mb-2"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {formatNumber(r)} {"⭐".repeat(r)}
              </option>
            ))}
          </select>

          {/* REVIEW TEXT */}
          <label>{t("resreview_text")}</label>
          <textarea
            className="form-control mb-2"
           placeholder={t("reswrite_feedback")}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />

          {/* IMAGE UPLOAD */}
         <label>{t("resupload_photo")}</label>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() =>
                document.getElementById("reviewFile").click()
              }
            >
              📷 {t("resupload")}
            </button>

            <input
              type="file"
              id="reviewFile"
              style={{ display: "none" }}
              accept="image/*"
              onChange={(e) => setReviewImage(e.target.files[0])}
            />

            {reviewImage && <span>{reviewImage.name}</span>}
          </div>

          {/* SUBMIT */}
          <button className="btn accept mt-3" onClick={submitReview}>
            {t("ressubmit_review")}
          </button>
        </div>

        {/* REVIEWS LIST */}
        <div className="card">
          <h5>{t("resmy_reviews")}</h5>

         {loadingReviews && <p>{t("resloading_reviews")}</p>}

          <table className="mini_table">
            <thead>
              <tr>
                <th>{t("resproduct")}</th>
                <th>{t("resrating")}</th>
                <th>{t("resreview")}</th>
                <th>{t("resphoto")}</th>
              </tr>
            </thead>

            <tbody>
              {reviews
                .filter((r) => r.order_id === order.order_id)
                .map((r) => (
                  <tr key={r.review_id}>
                    <td>  {i18n.language === "ar"
                      ? r.product_name_arabic || r.product_name
                      : r.product_name}
                    </td>

                    <td>
                      {formatNumber(r.rating)} {"⭐".repeat(r.rating)}
                    </td>

                    <td>{r.review_text || "-"}</td>

                    {/* IMAGE */}
                    <td>
                      <img
                        src={`http://192.168.2.9:5000/api/reviews/image/${r.review_id}`}
                        alt="review"
                        width="60"
                        style={{ borderRadius: "8px" }}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* ACTIONS */}
        <div className="modal_actions">
          <button className="btn reject" onClick={onClose}>
           {t("resclose")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;