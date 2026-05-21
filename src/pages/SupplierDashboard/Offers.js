
import React, { useEffect, useState } from "react";
import CreateOfferModal from "../../components/Dashboard/CreateOfferModal";
// import "../css/offer.css";
import { useTranslation } from "react-i18next";
const Offers = () => {
  const [showModal, setShowModal] = useState(false);
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingOffer, setEditingOffer] = useState(null);
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  

  const supplierId = localStorage.getItem("linked_id");

  /* ================= FETCH ================= */
  const fetchOffers = async () => {
    if (!supplierId) return;
    try {
      const res = await fetch(
        `http://192.168.2.22:5000/api/offers?supplier_id=${supplierId}`
      );
      const data = await res.json();
      setOffers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch offers failed", err);
    }
  };

  const fetchProducts = async () => {
    if (!supplierId) return;
    try {
      const res = await fetch(
        `http://192.168.2.22:5000/api/products?supplier_id=${supplierId}`
      );
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch products failed", err);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchProducts();
  }, [supplierId]);

  /* ================= DELETE ================= */
  const deleteOffer = async (offerId) => {
    if (!window.confirm("Delete this offer?")) return;
    try {
      await fetch(
        `http://192.168.2.22:5000/api/offers/${offerId}?supplier_id=${supplierId}`,
        { method: "DELETE" }
      );
      fetchOffers();
    } catch {
      alert("Delete failed");
    }
  };

  /* ================= HELPERS ================= */
  const getOfferImage = (o) =>
    o.image_url
      ? `http://192.168.2.22:5000${o.image_url}`
      : "/placeholder.png";

  const getCurrentPrice = (productId) => {
    const p = products.find(
      (x) => x.product_id === productId || x.id === productId
    );

    return (
      Number(p?.price_per_unit) ||
      Number(p?.price) ||
      Number(p?.unit_price) ||
      0
    );
  };

  const getOfferType = (o) => {
    return o.offer_type || o.discount_type || "—";
  };

  const getOfferPrice = (o) => {
    const original = getCurrentPrice(o.product_id);
    if (!original) return 0;

    const type = getOfferType(o);

    if (type === "Percentage") {
      return original - (original * Number(o.discount_percentage || 0)) / 100;
    }

    if (type === "Flat") {
      return Math.max(0, original - Number(o.flat_amount || 0));
    }

    return original;
  };
const getOfferLabel = (o) => {
  const now = new Date();

  const startDT = o.start_time
    ? new Date(`${o.start_date}T${o.start_time}`)
    : new Date(`${o.start_date}T00:00:00`);

  const endDT = o.end_time
    ? new Date(`${o.end_date}T${o.end_time}`)
    : new Date(`${o.end_date}T23:59:59`);

  if (now > endDT) {
    return { text: t("expired"), type: "expired" };
  }

  if (now < startDT) {
    const mins = Math.ceil((startDT - now) / (1000 * 60));

    if (mins <= 60) {
      return { text: `${t("starts_in")} ${mins} ${t("min")}`, type: "upcoming" };
    }

    return { text: t("upcoming"), type: "upcoming" };
  }

  const minsLeft = Math.ceil((endDT - now) / (1000 * 60));
  if (minsLeft <= 30) {
    return { text: `${t("ending_in")} ${minsLeft} ${t("min")}`, type: "ending" };
  }

  return { text: t("active"), type: "active" };
};
const isArabic = i18n.language?.startsWith("ar");
const statusMap = {
  INACTIVE: isArabic ? "غير نشط" : "Inactive",
  ACTIVE: isArabic ? "نشط" : "Active",
  EXPIRED: isArabic ? "منتهي" : "Expired",
  UPCOMING: isArabic ? "قادم" : "Upcoming",
};
const offerTypeMap = {
  Flat: isArabic ? "خصم ثابت" : "Flat",
  Percentage: isArabic ? "نسبة مئوية" : "Percentage",
  BOGO: isArabic ? "اشترِ واحد واحصل على واحد" : "BOGO",
};
const formatDate = (date) => {
  return new Intl.DateTimeFormat(
    isArabic ? "ar-EG" : "en-GB"
  ).format(new Date(date));
};
const formatNumber = (num) => {
  return new Intl.NumberFormat(
    isArabic ? "ar-EG" : "en-US"
  ).format(num);
};

const filteredOffers = offers.filter((o) => {

  // SEARCH
  const searchMatch =
    String(o.offer_id || "")
      .toLowerCase()
      .includes(search.toLowerCase()) ||

    String(o.product_name_english || "")
      .toLowerCase()
      .includes(search.toLowerCase()) ||

    String(o.product_name_arabic || "")
      .toLowerCase()
      .includes(search.toLowerCase());

  // STATUS
  const label =
    o.is_active === false
      ? { type: "inactive" }
      : getOfferLabel(o);

  const statusMatch =
    statusFilter === "ALL" ||
    label.type.toUpperCase() === statusFilter;

  // OFFER TYPE
  const offerType = getOfferType(o);

  const typeMatch =
    typeFilter === "ALL" ||
    offerType === typeFilter;

  // DATE
  const now = new Date();

  const start = new Date(o.start_date);
  const end = new Date(o.end_date);

  let dateMatch = true;

  if (dateFilter === "TODAY") {
    dateMatch = now >= start && now <= end;
  }

  if (dateFilter === "UPCOMING") {
    dateMatch = now < start;
  }

  if (dateFilter === "EXPIRED") {
    dateMatch = now > end;
  }

  return (
    searchMatch &&
    statusMatch &&
    typeMatch &&
    dateMatch
  );
});
  /* ================= RENDER ================= */
return (
  <div className="orders_page">
    {/* HEADER (kept – not removed) */}
    <div className="page_header glass">
      <div>
        <h3 className="page_title">{t("offers")}</h3>
        <p className="sub_text">{t("manage_offers")}</p>
      </div>

      <button
        className="btn_save glow"
        onClick={() => {
          setEditingOffer(null);
          setShowModal(true);
        }}
      >
        <i className="fas fa-plus"></i> {t("add_offer")}
      </button>
    </div>
    
    {/* ORDERS TABLE DESIGN */}
    <div className="table_wrapper">
      <div className="filters_bar">
        <input
          type="text"
          placeholder={t("search_offer")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search_input"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">{t("all")}</option>
          <option value="ACTIVE">{t("active")}</option>
          <option value="UPCOMING">{t("upcoming")}</option>
          <option value="EXPIRED">{t("expired")}</option>
          <option value="INACTIVE">{t("inactive")}</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">{t("all")}</option>

          <option value="Flat">
            {offerTypeMap.Flat}
          </option>

          <option value="Percentage">
            {offerTypeMap.Percentage}
          </option>

          <option value="BOGO">
            {offerTypeMap.BOGO}
          </option>
        </select>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="ALL">{t("all")}</option>
          <option value="TODAY">{t("today")}</option>
          <option value="UPCOMING">{t("upcoming")}</option>
          <option value="EXPIRED">{t("expired")}</option>
        </select>
      </div>
      <table className="orders_table">
        <thead>
          <tr>
            <th>{t("offer_id")}</th>
            <th>{t("status")}</th>
            <th>{t("product")}</th>
            <th>{t("validity")}</th>
            <th>{t("offer_type")}</th>
            <th>{t("action")}</th>
          </tr>
        </thead>

        <tbody>
          {filteredOffers.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                {t("no_offers")}
              </td>
            </tr>
          )}

          {filteredOffers.map((o) => {
            const offerType = getOfferType(o);
            const label =
              o.is_active === false
                ? { text: statusMap.INACTIVE, type: "inactive" }
                : getOfferLabel(o);

            return (
              <tr key={o.offer_id}>
                {/* OFFER ID */}
                <td>{formatNumber(o.offer_id)}</td>

                {/* STATUS */}
                <td>
                  <span className={`status ${label.type}`}>
                    {label.text}
                  </span>
                </td>

                {/* PRODUCT */}
                <td style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img
                    src={getOfferImage(o)}
                    alt={o.product_name_english || "Offer"}
                    className="offer_img"
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: "cover",
                    }}
                  />
                  <b>
                    {i18n.language === "ar"
                      ? (o.product_name_arabic && o.product_name_arabic.trim()
                          ? o.product_name_arabic
                          : o.product_name_english)
                      : o.product_name_english || t("category_offer")}
                  </b>
                </td>

                {/* VALIDITY */}
                <td className="muted">
                  {formatDate(o.start_date)} → {formatDate(o.end_date)}
                </td>

                {/* OFFER TYPE */}
                <td>{offerTypeMap[offerType] || offerType}</td>

                {/* ACTIONS */}
                <td>
                  <button
                    className="view_btn"
                    onClick={() => {
                      setEditingOffer(o);
                      setShowModal(true);
                    }}
                  >
                    {t("edit")}
                  </button>

                  <button
                    className="delete_btn"
                    onClick={() => deleteOffer(o.offer_id)}
                  >
                    <i className="fa fa-trash" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {/* MODAL (unchanged) */}
    {showModal && (
      <CreateOfferModal
        offer={editingOffer}
        onClose={() => {
          setShowModal(false);
          setEditingOffer(null);
        }}
        onSaved={() => {
          setShowModal(false);
          setEditingOffer(null);
          fetchOffers();
        }}
      />
    )}
  </div>
);

};

export default Offers;