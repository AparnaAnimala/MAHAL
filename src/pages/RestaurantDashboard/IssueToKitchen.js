
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import "../css/issue_to_kitchen.css";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API = "http://192.168.2.22:5000/api/inventory";

const IssueToKitchen = () => {
  const restaurantId = localStorage.getItem("linked_id");
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [items, setItems] = useState([]);
  const [issueMap, setIssueMap] = useState({});
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const formatNumber = (value) => {
  return new Intl.NumberFormat(
    i18n.language === "ar" ? "ar-QA" : "en-US"
  ).format(value);
};

  // LOAD INVENTORY
  useEffect(() => {
    axios
      .get(`${API}/restaurant/stock?restaurant_id=${restaurantId}`)
      .then(res => {
        setItems(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [restaurantId, i18n.language]);

  // UPDATE QTY
  const updateQty = (productId, value, max) => {
    if (value < 0 || value > max) return;
    setIssueMap(prev => ({ ...prev, [productId]: value }));
  };

  const totalQty = Object.values(issueMap).reduce(
    (sum, qty) => sum + Number(qty || 0),
    0
  );

  const totalItems = Object.values(issueMap).filter(q => q > 0).length;

  // SUBMIT ISSUE
  const submitIssue = async () => {
    const payload = Object.entries(issueMap)
      .filter(([_, qty]) => qty > 0)
      .map(([product_id, quantity]) => ({
        product_id: Number(product_id),
        quantity
      }));

    if (!payload.length) {
      alert(t("issueAtLeastOne"));
      return;
    }

    try {
      setSubmitting(true);

      await axios.post(`${API}/issue-to-kitchen`, {
        restaurant_id: restaurantId,
        items: payload,
        remarks
      });

      navigate("/restaurantdashboard/inventory");
    } catch (e) {
      console.error(e);
      alert(t("issueFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="issue-loading">{t("loadingInventory")}</div>;
  }

  return (
    <div
      className="issue-container"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      {/* HEADER */}
      <div className="issue-header">
        <h2>🍳 {t("issueKitchenTitle")}</h2>
        <p>{t("issueKitchenSubtitle")}</p>
      </div>

      {/* ITEMS */}
      <div className="issue-table-wrapper">
        <table className="issue-table">
          <thead>
            <tr>
              <th>{t("item")}</th>
              <th>{t("available")}</th>
              <th>{t("issueQty")}</th>
              <th>{t("action")}</th>
            </tr>
          </thead>

          <tbody>
            {items.map(item => {
              const available = Number(item.available_qty || 0);
              const issued = issueMap[item.product_id] || 0;

                const productName =
                i18n.language === "ar"
                  ? (item.product_name_arabic?.trim() ||
                    item.product_name_english ||
                    item.product_name ||
                    "No Name")
                  : (item.product_name_english ||
                    item.product_name ||
                    "No Name");

              return (
                <tr key={item.product_id}>
                  <td className="item-name">{productName}</td>

                  <td className="available">
                    {formatNumber(available.toFixed(2))}
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      max={available}
                      value={issued}
                      onChange={e =>
                        updateQty(
                          item.product_id,
                          Number(e.target.value),
                          available
                        )
                      }
                    />
                  </td>

                  <td className="qty-actions">
                    <button
                      onClick={() =>
                        updateQty(
                          item.product_id,
                          issued - 1,
                          available
                        )
                      }
                    >
                      −
                    </button>

                    <button
                      onClick={() =>
                        updateQty(
                          item.product_id,
                          issued + 1,
                          available
                        )
                      }
                    >
                      +
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* REMARKS */}
      <div className="remarks">
        <label>{t("remarks")}</label>

        <textarea
          placeholder={t("remarksPlaceholder")}
          value={remarks}
          onChange={e => setRemarks(e.target.value)}
        />
      </div>

      {/* FOOTER */}
      <div className="issue-footer">
        <div className="summary">
         <b>{formatNumber(totalItems)}</b> {t("items")} •{" "}
          <b>{formatNumber(totalQty.toFixed(2))}</b> {t("qty")}
        </div>

        <div className="actions">
          <button
            className="btn_save"
            disabled={submitting}
            onClick={submitIssue}
          >
            {submitting
              ? t("issuingNow")
              : t("issueKitchenButton")}
          </button>

          <button
            className="btn cancel"
            onClick={() => navigate(-1)}
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueToKitchen;