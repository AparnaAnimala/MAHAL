import React, { useEffect, useState } from "react";
import axios from "axios";
// import "../css/restaurant_inventory.css";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaShoppingCart } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const API = "http://192.168.2.22:5000/api/inventory";
const CART_API = "http://192.168.2.22:5000/api/cart/add";

const RestaurantInventory = () => {

  const restaurantId = localStorage.getItem("linked_id");
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Issue modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [issueQty, setIssueQty] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [issuing, setIssuing] = useState(false);

  // Reorder modal
  const [reorderItemData, setReorderItemData] = useState(null);
  const [reorderQty, setReorderQty] = useState(1);
  const [reordering, setReordering] = useState(false);

  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("ALL");
  // Inside component
  const { t, i18n } = useTranslation();
  const formatNumber = (value) => {
  return new Intl.NumberFormat(
    i18n.language === "ar" ? "ar-QA" : "en-US"
  ).format(value);
};


  /* ================= FETCH INVENTORY ================= */
  useEffect(() => {
    if (!restaurantId) return;

    axios
      .get(`${API}/restaurant/stock?restaurant_id=${restaurantId}`)
      .then(res => {
        console.log(res.data);
        setItems(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

  }, [restaurantId, i18n.language]);


  /* ================= SUMMARY ================= */
  const totalQty = items.reduce(
    (sum, i) => sum + Number(i.available_qty || 0),
    0
  );

  const lowStockCount = items.filter(
    i => Number(i.available_qty) > 0 && Number(i.available_qty) < 10
  ).length;


  if (loading) return <div className="inv-loading">{t("ResloadingInventory")}</div>;


  /* ================= FILTER ================= */
  const filteredItems = items.filter(item => {

    const qty = Number(item.available_qty || 0);

const name =
  i18n.language === "ar"
    ? (item.product_name_arabic || item.product_name || "").toLowerCase()
    : (item.product_name || "").toLowerCase();
    const query = search.trim().toLowerCase();

    const matchesSearch = name.includes(query);

    const matchesStock =
      stockFilter === "ALL" ||
      (stockFilter === "IN" && qty >= 10) ||
      (stockFilter === "LOW" && qty > 0 && qty < 10) ||
      (stockFilter === "OUT" && qty <= 0);

    return matchesSearch && matchesStock;

  });


  /* ================= REORDER CONFIRM ================= */
  const confirmReorder = async () => {
    try {

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        return;
      }

      setReordering(true);

      await axios.post(
        CART_API,
        {
          product_id: reorderItemData.product_id,
          quantity: reorderQty,
          price: Number(reorderItemData.price || 0)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Added to cart");
      setReorderItemData(null);

      navigate("/cartview");

    } catch (err) {
      console.error(err);
      alert("Failed to reorder");
    } finally {
      setReordering(false);
    }
  };


  return (
    <div className="inv-wrapper" dir={i18n.language === "ar" ? "rtl" : "ltr"}>

      {/* HEADER */}
<div className="inv-header">
  <h2>📦 {t("ResrestaurantInventory")}</h2>
  <span className="inv-subtitle">{t("ResrealTimeStock")}</span>
</div>


      {/* FILTERS */}
      <div className="inv-filters">

        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder={t("RessearchProduct")}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          value={stockFilter}
          onChange={e => setStockFilter(e.target.value)}
        >

          <option value="ALL">{t("Resall")}</option>
          <option value="IN">{t("ResinStock")}</option>
          <option value="LOW">{t("ReslowStock")}</option>
          <option value="OUT">{t("ResoutOfStock")}</option>
        </select>

      </div>


      {/* SUMMARY */}
      <div className="inv-summary">

        <div className="summary-card">
          <span>{t("RestotalProducts")}</span>
          <b>{formatNumber(items.length)}</b>
        </div>

        <div className="summary-card">
          <span>{t("RestotalQuantity")}</span>
          <b>{formatNumber(totalQty.toFixed(2))}</b>
        </div>

        <div className="summary-card warning">
          <span>{t("ReslowStock")}</span>
          <b>{formatNumber(lowStockCount)}</b>
        </div>

      </div>


      {/* GRID */}
      <div className="inv-grid">

        {filteredItems.map(item => {

          const qty = Number(item.available_qty || 0);

          let status = t("ResinStock");
          let statusclass = "ok";

          if (qty <= 0) {
            status = t("ResoutOfStock");
            statusclass = "danger";
          } else if (qty < 10) {
            status = t("ReslowStock");
            statusclass = "warning";
          }

          return (
            <div
              className={`inv-card ${statusclass}`}
              key={item.product_id}
            >

              {/* IMAGE */}
              <div className="inv-image">
                <img
                  src={
                    item.product_image
                      ? `data:image/png;base64,${item.product_image}`
                      : "/placeholder-product.png"
                  }
                  alt={item.product_name}
                />
              </div>


              {/* INFO */}
              <div className="inv-info">

                  <h4>
                  {i18n.language === "ar"
                    ? (item.product_name_arabic?.trim() || item.product_name_english)
                    : item.product_name_english}
                  </h4>

                <div className="inv-qty">
                 {formatNumber(qty.toFixed(2))}
                </div>

                <div className="inv-actions">

                  <span className={`status ${statusclass}`}>
                    {status}
                  </span>

                 {/* ISSUE */}
                  <button
                    className="action-btn issue-modern"
                    disabled={qty <= 0}
                    onClick={() => {
                      setSelectedItem(item);
                      setIssueQty(1);
                      setRemarks("");
                    }}
                  >
                    <FaUtensils className="btn-icon" />
                    {t("ResissueToKitchen")}
                  </button>


                  {/* REORDER */}
                  <button
                    className="action-btn reorder-modern"
                    onClick={() => {
                      const suggested = qty < 10 ? 20 - qty : 10;
                      setReorderItemData(item);
                      setReorderQty(suggested);
                    }}
                  >
                    <FaShoppingCart className="btn-icon" />
                    {t("Resreorder")}
                  </button>


                </div>

              </div>

            </div>
          );

        })}

      </div>


      {/* ================= ISSUE MODAL ================= */}
      {selectedItem && (

        <div className="inv-modal-backdrop">

          <div className="inv-modal">

            <h3>{t("ResissueToKitchen")}</h3>

            <p>  <b>
              {i18n.language === "ar"
                ? selectedItem.product_name_arabic || selectedItem.product_name
                : selectedItem.product_name}
            </b></p>

            <label>{t("Resquantity")}</label>
            <input
              type="number"
              min="1"
              max={selectedItem.available_qty}
              value={issueQty}
              onChange={e =>
                setIssueQty(
                  Math.min(
                    Number(e.target.value),
                    selectedItem.available_qty
                  )
                )
              }
            />

            <label>{t("Resremarks")}</label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
            />

            <div className="modal-actions">

              <button
                className="btn cancel"
                onClick={() => setSelectedItem(null)}
              >
                {t("Rescancel")}
              </button>

              <button
                className="btn_save"
                disabled={issuing}
                onClick={async () => {

                  try {

                    setIssuing(true);

                    await axios.post(
                      `${API}/issue-to-kitchen`,
                      {
                        restaurant_id: restaurantId,
                        items: [
                          {
                            product_id: selectedItem.product_id,
                            quantity: issueQty
                          }
                        ],
                        remarks
                      }
                    );

                    setSelectedItem(null);
                    window.location.reload();

                  } catch {
                    alert("Failed to issue item");
                  } finally {
                    setIssuing(false);
                  }

                }}
              >
                {issuing ? t("Resissuing") : t("Resissue")}
              </button>

            </div>

          </div>

        </div>
      )}


      {/* ================= REORDER MODAL ================= */}
      {reorderItemData && (

        <div className="inv-modal-backdrop">

          <div className="inv-modal">

            <h3>{t("ResreorderProduct")}</h3>

            <p>  <b>
              {i18n.language === "ar"
                ? reorderItemData.product_name_arabic || reorderItemData.product_name
                : reorderItemData.product_name}
            </b></p>

            <p>
              {t("RescurrentStock")}:
              {" "}
                {formatNumber(Number(reorderItemData.available_qty).toFixed(2))}
            </p>

            <label>{t("Resquantity")}</label>
            <input
              type="number"
              min="1"
              value={reorderQty}
              onChange={(e) =>
                setReorderQty(Number(e.target.value))
              }
            />

            <div className="modal-actions">

              <button
                className="btn cancel"
                onClick={() => setReorderItemData(null)}
              >
               {t("Rescancel")}
              </button>

              <button
                className="btn_save"
                disabled={reordering}
                onClick={confirmReorder}
              >
                {reordering ? t("Resordering") : t("Resreorder")}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default RestaurantInventory;
