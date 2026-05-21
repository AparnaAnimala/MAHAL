import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import "../css/CouponManagement.css";
import {
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiEye,
  FiCreditCard,
  FiBarChart2,
  FiDollarSign,
  FiSettings,
  FiTrendingUp,
  FiCalendar,
  FiHash,
  FiHome,
  FiMapPin,
  FiTag
} from "react-icons/fi";
const API_BASE = "http://192.168.2.22:5000/api/v1/coupons";

export default function CouponManagement() {
  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!token) {
      window.location.href = "/admin/login";
    }
  }, [token]);

  const authHeader = React.useMemo(() => ({
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }), [token]);

  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [allCoupons, setAllCoupons] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);


  // default form state
  const emptyForm = {
    code: "",
    title: "",
    description: "",

    discount_type: "PERCENTAGE",
    discount_value: "",

    min_order_value: "",
    max_discount: "",

    start_date: "",
    end_date: "",

    usage_limit_total: "",
    usage_limit_per_restaurant: "",

    absorb_type: "PLATFORM",
    supplier_share_percent: 0,

    first_order_only: false,
    stackable: false,


    campaign_id: "",
    total_budget: "",
    priority: 1,

    scope_type: "GLOBAL",
    supplier_ids: [],
    category_ids: [],
  };

  const [form, setForm] = useState(emptyForm);
  /* =======================================================
     FETCH COUPONS
  ======================================================= */
  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/list`, authHeader);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to fetch coupons");
      }

      const data = await res.json();
      setCoupons(data);
      setAllCoupons(data);
      return true;
    } catch (err) {
      setError("Failed to load coupons");
      return false;
    }
  };

  const fetchSuppliers = async () => {

    try {

      const res = await fetch(
        `${API_BASE}/admin/suppliers`,
        authHeader
      );

      if (!res.ok) throw new Error("Failed to load suppliers");

      const data = await res.json();
      setSuppliers(data);

    } catch {
      console.error("Failed to load suppliers");
    }

  };

  const fetchCategories = async () => {

    try {

      const res = await fetch(
        `${API_BASE}/admin/categories`,
        authHeader
      );

      if (!res.ok) throw new Error("Failed to load categories");

      const data = await res.json();

      setCategories(data);

    } catch (err) {

      console.error(err);

    }

  };

  const fetchCampaigns = async () => {

    try {

      const res = await fetch(
        `${API_BASE}/admin/campaigns`,
        authHeader
      );

      if (!res.ok) throw new Error("Failed to load campaigns");

      const data = await res.json();

      setCampaigns(data);

    } catch (err) {

      console.error("Failed to load campaigns", err);

    }

  };

  useEffect(() => {
    Promise.all([
      fetchCoupons(),
      fetchSuppliers(),
      fetchCategories(),
      fetchCampaigns()
    ]).finally(() => setInitialLoading(false));
  }, []);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [message]);

  /* =======================================================
     HANDLE INPUT
  ======================================================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let finalValue = value;

    if (type === "checkbox") finalValue = checked;
    if (type === "number") {
      finalValue = value === "" ? null : Number(value);
    }

    setForm(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };



  const [showCategoryModal, setShowCategoryModal] =
    useState(false);

  const [showSupplierModal, setShowSupplierModal] =
    useState(false);

  const [searchCategory, setSearchCategory] =
    useState("");

  const [searchSupplier, setSearchSupplier] =
    useState("");


  /* =======================================================
     CREATE COUPON
  ======================================================= */
  const createCoupon = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.code || !form.discount_value) {
      setError("Code and Discount Value are required");
      return;
    }

    if (form.start_date && form.end_date) {
      if (new Date(form.end_date) <= new Date(form.start_date)) {
        setError("End date must be after start date");
        return;
      }
    }

    if (
      form.absorb_type === "SHARED" &&
      (form.supplier_share_percent <= 0 ||
        form.supplier_share_percent > 100)
    ) {
      setError("Supplier share must be between 1-100%");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        code: form.code,
        title: form.title,
        description: form.description,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_value: Number(form.min_order_value || 0),
        max_discount: form.max_discount ? Number(form.max_discount) : null,

        start_date: form.start_date
          ? new Date(form.start_date).toLocaleString("sv-SE").replace(" ", "T")
          : null,

        end_date: form.end_date
          ? new Date(form.end_date).toLocaleString("sv-SE").replace(" ", "T")
          : null,

        usage_limit_total: Number(form.usage_limit_total || 0),
        usage_limit_per_restaurant: Number(form.usage_limit_per_restaurant || 0),

        absorb_type: form.absorb_type,
        supplier_share_percent: Number(form.supplier_share_percent || 0),

        first_order_only: form.first_order_only,
        stackable: form.stackable,

        campaign_id: form.campaign_id ? Number(form.campaign_id) : null,
        total_budget: form.total_budget ? Number(form.total_budget) : null,
        priority: form.priority || 1,

        /* FIX */
        scope_type: form.scope_type,
        supplier_ids: form.supplier_ids.filter(Boolean).map(Number),
        category_ids: form.category_ids.map(Number)
      };

      const res = await fetch(`${API_BASE}/admin/create`, {
        method: "POST",
        ...authHeader,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const couponId = data.coupon.coupon_id;




      // /* ================= CATEGORY ================= */

      // if (form.scope_type === "CATEGORY" && form.category_ids.length > 0) {

      //   for (let cat of form.category_ids) {

      //     await fetch(`${API_BASE}/admin/${couponId}/add-category`, {
      //       method: "POST",
      //       ...authHeader,
      //       body: JSON.stringify({
      //         category_id: cat
      //       })
      //     });

      //   }
      // }

      // /* ================= SUPPLIER TARGET ================= */

      // if (form.scope_type === "SUPPLIER" && form.supplier_id) {
      //   await fetch(`${API_BASE}/admin/${couponId}/targets`, {
      //     method: "POST",
      //     ...authHeader,
      //     body: JSON.stringify({
      //       supplier_id: Number(form.supplier_id)
      //     })
      //   });
      // }



      setMessage("Coupon created successfully");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setForm(emptyForm);
      setSelectedCoupon(null);
      fetchCoupons();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     UPDATE COUPON
  ======================================================= */
  const updateCoupon = async () => {
    if (!selectedCoupon) return;

    try {
      const res = await fetch(
        `${API_BASE}/admin/${selectedCoupon.coupon_id}`,
        {
          method: "PUT",
          ...authHeader,
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            discount_value: Number(form.discount_value),
            min_order_value: Number(form.min_order_value || 0),
            max_discount: form.max_discount ? Number(form.max_discount) : null,
            usage_limit_total: Number(form.usage_limit_total || 0),
            usage_limit_per_restaurant: Number(form.usage_limit_per_restaurant || 0),
            priority: Number(form.priority || 1),
            end_date: form.end_date
              ? new Date(form.end_date)
                .toLocaleString("sv-SE")
                .replace(" ", "T")
              : null
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }
      setMessage("Coupon updated");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setSelectedCoupon(null);
      setForm(emptyForm);
      fetchCoupons();
    } catch (err) {
      setError(err.message || "Update failed");
    }
  };

  /* =======================================================
     DEACTIVATE
  ======================================================= */
  const deactivateCoupon = async (id) => {
    if (!window.confirm("Deactivate this coupon?")) return;

    try {
      const res = await fetch(
        `${API_BASE}/admin/${id}/deactivate`,
        {
          method: "PATCH",
          ...authHeader,
        }
      );

      if (!res.ok) throw new Error("Failed");
      setMessage("Coupon deactivated");
      fetchCoupons();
    } catch {
      setError("Failed to deactivate");
    }
  };


  const activateCoupon = async (id) => {
    try {
      const res = await fetch(
        `${API_BASE}/admin/${id}/activate`,
        {
          method: "PATCH",
          ...authHeader,
        }
      );

      if (!res.ok) throw new Error("Failed");
      setMessage("Coupon activated");
      fetchCoupons();
    } catch {
      setError("Failed to activate");
    }
  };

  const iconBox = (bg, color) => ({
    background: bg,
    color: color,
    width: "22px",          // smaller
    height: "22px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px"        // smaller icon
  });
  /* =======================================================
     ADD TARGET
  ======================================================= */
  const addTarget = async (couponId) => {
    const restaurant_id = prompt("Enter Restaurant ID (optional)");
    const supplier_id = prompt("Enter Supplier ID (optional)");
    const segment = prompt("Enter Segment (optional)");

    try {
      const res = await fetch(
        `${API_BASE}/admin/${couponId}/targets`,
        {
          method: "POST",
          ...authHeader,
          body: JSON.stringify({
            restaurant_id: restaurant_id || null,
            supplier_id: supplier_id || null,
            segment: segment || null,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed");
      alert("Target added");
    } catch {
      alert("Error adding target");
    }
  };

  if (initialLoading) {
    return <div className="text-center mt-5">Loading coupons...</div>;
  }


  {/* ===================== FINAL MERGED COUPON JSX ===================== */ }
  return (
    <div className="coupon-page">
      <Helmet>
        <title>Admin Coupon Management</title>
      </Helmet>

      <div className="coupon-container">
        {/* HEADER */}
        <div className="coupon-header">
          <div className="coupon-header-left">
            <h2>Coupon Management</h2>
            <p>Total Coupons: {coupons.length}</p>
          </div>

          <button
            type="button"
            className="coupon-btn coupon-btn-primary"
            onClick={async () => {
              if (
                !window.confirm(
                  "Deactivate all expired coupons?"
                )
              )
                return;

              try {
                const res = await fetch(
                  `${API_BASE}/admin/auto-deactivate`,
                  {
                    method: "POST",
                    ...authHeader
                  }
                );

                const data = await res.json();

                setMessage(
                  `Expired coupons cleaned: ${data.updated}`
                );

                fetchCoupons();
              } catch {
                setError(
                  "Failed to clean expired coupons"
                );
              }
            }}
          >
            Clean Expired Coupons
          </button>
        </div>

        {message && (
          <div className="alert alert-success mb-3">
            {message}
          </div>
        )}

        {error && (
          <div className="alert alert-danger mb-3">
            {error}
          </div>
        )}

        <div className="coupon-layout">

          {/* LEFT FORM */}
          <div className="coupon-main">
            <div className="coupon-card mb-4 coupon-form-card">
              <div className="coupon-section-title1 mb-1 d-flex align-items-center gap-2">
                {selectedCoupon ? "Update Coupon" : "Create Coupon"}
              </div>

              <p
                style={{
                  margin: "0 0 14px",
                  fontSize: "14px",
                  color: "#64748b",
                  fontWeight: 500
                }}
              >
                {selectedCoupon
                  ? "Modify coupon details and update your campaign settings"
                  : "Create and manage discount coupons to boost customer engagement"}
              </p>
              <form
                onSubmit={
                  selectedCoupon
                    ? (e) => {
                      e.preventDefault();
                      updateCoupon();
                    }
                    : createCoupon
                }
              >

                {/* 🔵 COUPON INFO CARD */}
                <div className="coupon-card mb-4">
                  <div className="coupon-section-title d-flex align-items-center gap-2">

                    <span
                      style={{
                        background: "#EEF2FF",
                        color: "#4F46E5",
                        padding: "6px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <FiCreditCard size={14} />
                    </span>

                    Coupon Information
                  </div>
                  <div className="coupon-form-grid">

                    <input className="coupon-input" name="code" placeholder="Coupon Code"
                      value={form.code} onChange={handleChange} required
                      disabled={selectedCoupon !== null}
                    />

                    <input className="coupon-input" name="title" placeholder="Title"
                      value={form.title} onChange={handleChange}
                    />

                    <input className="coupon-input" name="description" placeholder="Description"
                      value={form.description} onChange={handleChange}
                    />

                  </div>
                </div>

                {/* 🟣 DISCOUNT CARD */}
                <div className="coupon-card mb-4">
                  <div className="coupon-section-title d-flex align-items-center gap-2">

                    <span
                      style={{
                        background: "#F3E8FF",
                        color: "#9333EA",
                        padding: "8px",
                        borderRadius: "8px"

                      }}
                    >
                      <FiBarChart2 size={14} />
                    </span>

                    Discount Settings
                  </div>
                  <div className="coupon-form-grid">

                    <select className="coupon-select" name="discount_type"
                      value={form.discount_type} onChange={handleChange}>
                      <option value="PERCENTAGE">Percentage</option>
                      <option value="FLAT">Flat</option>
                    </select>

                    <input type="number" className="coupon-input"
                      name="discount_value" placeholder="Discount Value"
                      value={form.discount_value} onChange={handleChange}
                    />

                    <input type="number" className="coupon-input"
                      name="min_order_value" placeholder="Min Order"
                      value={form.min_order_value} onChange={handleChange}
                    />

                    <input type="number" className="coupon-input"
                      name="max_discount" placeholder="Max Discount"
                      value={form.max_discount} onChange={handleChange}
                    />

                    <input type="datetime-local" className="coupon-input"
                      name="start_date" value={form.start_date}
                      onChange={handleChange}
                    />

                    <input type="datetime-local" className="coupon-input"
                      name="end_date" value={form.end_date}
                      onChange={handleChange}
                    />

                  </div>
                </div>

                {/* 🟢 USAGE CARD */}
                <div className="coupon-card mb-4">
                  <div className="coupon-section-title d-flex align-items-center gap-2">

                    <span
                      style={{
                        background: "#ECFDF5",
                        color: "#059669",
                        padding: "8px",
                        borderRadius: "8px"
                      }}
                    >
                      <FiSettings size={14} />
                    </span>

                    Usage Rules
                  </div>
                  <div className="coupon-form-grid">

                    <input type="number" className="coupon-input"
                      name="usage_limit_total" placeholder="Usage Limit"
                      value={form.usage_limit_total} onChange={handleChange}
                    />

                    <input type="number" className="coupon-input"
                      name="usage_limit_per_restaurant" placeholder="Per Restaurant"
                      value={form.usage_limit_per_restaurant}
                      onChange={handleChange}
                    />

                    <select className="coupon-select"
                      name="absorb_type"
                      value={form.absorb_type}
                      onChange={handleChange}
                    >
                      <option value="PLATFORM">Platform</option>
                      <option value="SUPPLIER">Supplier</option>
                      <option value="SHARED">Shared</option>
                    </select>

                    {form.absorb_type === "SHARED" && (
                      <input type="number" className="coupon-input"
                        name="supplier_share_percent"
                        placeholder="Supplier Share %"
                        value={form.supplier_share_percent}
                        onChange={handleChange}
                      />
                    )}

                  </div>
                </div>

                {/* 🟠 CAMPAIGN CARD */}
                <div className="coupon-card mb-4">
                  <div className="coupon-section-title d-flex align-items-center gap-2">

                    <span
                      style={{
                        background: "#FFF7ED",
                        color: "#EA580C",
                        padding: "8px",
                        borderRadius: "3px"
                      }}
                    >
                      <FiDollarSign size={14} />
                    </span>

                    Campaign & Budget
                  </div>
                  <div className="coupon-form-grid">

                    <select className="coupon-select"
                      name="scope_type"
                      value={form.scope_type}
                      onChange={handleChange}
                    >
                      <option value="GLOBAL">Global</option>
                      <option value="CATEGORY">Category</option>
                      <option value="SUPPLIER">Supplier</option>
                    </select>

                    <select className="coupon-select"
                      name="campaign_id"
                      value={form.campaign_id}
                      onChange={handleChange}
                    >
                      <option value="">No Campaign</option>
                      {campaigns.map((c) => (
                        <option key={c.campaign_id} value={c.campaign_id}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <input type="number" className="coupon-input"
                      name="total_budget" placeholder="Budget"
                      value={form.total_budget} onChange={handleChange}
                    />

                    <input type="number" className="coupon-input"
                      name="priority" placeholder="Priority"
                      value={form.priority} onChange={handleChange}
                    />

                  </div>
                </div>

                {/* CATEGORY */}
                {form.scope_type === "CATEGORY" && (
                  <div className="coupon-card mb-4">
                    <div className="coupon-section-title mb-3">Categories</div>
                    <div className="category-grid">
                      {categories.map((c) => (
                        <label key={c.id} className="category-item">
                          <input
                            type="checkbox"
                            checked={form.category_ids.includes(c.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm(prev => ({
                                  ...prev,
                                  category_ids: [...prev.category_ids, c.id]
                                }));
                              } else {
                                setForm(prev => ({
                                  ...prev,
                                  category_ids: prev.category_ids.filter(x => x !== c.id)
                                }));
                              }
                            }}
                          />
                          <span>{c.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUPPLIER */}
                {form.scope_type === "SUPPLIER" && (
                  <div className="coupon-card mb-4">
                    <div className="coupon-section-title mb-3">Suppliers</div>
                    <div className="supplier-grid">
                      {suppliers.map((s) => (
                        <label key={s.supplier_id} className="supplier-item">
                          <input
                            type="checkbox"
                            checked={form.supplier_ids.includes(s.supplier_id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm(prev => ({
                                  ...prev,
                                  supplier_ids: [...prev.supplier_ids, s.supplier_id]
                                }));
                              } else {
                                setForm(prev => ({
                                  ...prev,
                                  supplier_ids: prev.supplier_ids.filter(x => x !== s.supplier_id)
                                }));
                              }
                            }}
                          />
                          <span>{s.company_name_english}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* FLAGS (keep outside like original style) */}
                <div className="coupon-checkbox-row mt-3">
                  <label className="coupon-checkbox">
                    <input type="checkbox" name="first_order_only"
                      checked={form.first_order_only}
                      onChange={handleChange}
                    />
                    First Order Only
                  </label>

                  <label className="coupon-checkbox">
                    <input type="checkbox" name="stackable"
                      checked={form.stackable}
                      onChange={handleChange}
                    />
                    Stackable
                  </label>
                </div>

                {/* BUTTONS */}
                <div className="d-flex gap-2 mt-4">
                  <button type="submit"
                    className="coupon-btn coupon-btn-primary"
                    disabled={
                      loading ||
                      !form.code ||
                      !form.discount_value ||
                      Number(form.discount_value) <= 0
                    }
                  >
                    {loading
                      ? "Saving..."
                      : selectedCoupon
                        ? "Update Coupon"
                        : "Create Coupon"}
                  </button>

                  {selectedCoupon && (
                    <button
                      type="button"
                      className="coupon-btn coupon-btn-light"
                      onClick={() => {
                        setSelectedCoupon(null);
                        setForm(emptyForm);
                        setError("");
                        setMessage("");
                      }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

              </form>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="coupon-sidebar">

            {/* PREVIEW CARD */}
            <div className="coupon-card1">
              <div className="coupon-section-title mb-1 d-flex align-items-center gap-2">
                Coupon Preview
              </div>

              <p
                style={{
                  margin: "0 0 14px",
                  fontSize: "14px",
                  color: "#64748b"
                }}
              >
                Review your coupon details before publishing
              </p>

              {/* 🔥 Highlight Box */}
              <div
                style={{
                  background: "#fff7ef",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  marginBottom: "16px"
                }}
              >
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
                  Special Coupon Offer!
                </h4>

                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "13px",
                    color: "#475569"
                  }}
                >
                  Attractive discounts designed to boost orders and customer engagement 🎁
                </p>
              </div>

              {/* COUPON DESIGN */}
              <div
                style={{
                  background: "linear-gradient(135deg, #ff9a1f, #ff7a00 40%, #ff5a00)",
                  boxShadow: "0 10px 25px rgba(255, 106, 0, 0.25)",
                  borderRadius: "16px",
                  padding: "20px",
                  color: "#fff",
                  textAlign: "center",
                  marginBottom: "20px"

                }}
              >
                <div style={{ fontSize: "12px", opacity: 0.8 }}>
                  YOUR COUPON CODE
                </div>

                <div style={{ fontSize: "26px", fontWeight: "700", margin: "8px 0" }}>
                  {form.discount_type === "PERCENTAGE"
                    ? `SAVE ${form.discount_value || 0}%`
                    : `SAVE ₹${form.discount_value || 0}`}
                </div>

                <div style={{ fontSize: "13px", opacity: 0.9 }}>
                  On orders above {form.min_order_value || 0}
                </div>

                <div
                  style={{
                    borderTop: "1px dashed rgba(255,255,255,0.5)",
                    marginTop: "15px"
                  }}
                />
              </div>

              {/* DETAILS LIST */}
              <div style={{ display: "flex", flexDirection: "column" }}>

                {/* Discount Type */}
                <div style={{ borderBottom: "1px solid #e2e8f0", padding: "10px 0" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <span style={iconBox("#F3E8FF", "#9333EA")}>
                        <FiTrendingUp size={12} />
                      </span>
                      <span>Discount Type</span>
                    </div>
                    <span>{form.discount_type || "-"}</span>
                  </div>
                </div>

                {/* Discount Value */}
                <div style={{ borderBottom: "1px solid #e2e8f0", padding: "10px 0" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <span style={iconBox("#F1F5F9", "#475569")}>
                        <FiTrendingUp size={12} />
                      </span>
                      <span>Discount Value</span>
                    </div>
                    <span>{form.discount_value || "-"}</span>
                  </div>
                </div>

                {/* Minimum Order */}
                <div style={{ borderBottom: "1px solid #e2e8f0", padding: "10px 0" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <span style={iconBox("#ECFDF5", "#059669")}>
                        <FiTag size={12} />
                      </span>
                      <span>Minimum Order</span>
                    </div>
                    <span>{form.min_order_value || "-"}</span>
                  </div>
                </div>

                {/* Max Discount */}
                <div style={{ borderBottom: "1px solid #e2e8f0", padding: "10px 0" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <span style={iconBox("#FFF7ED", "#EA580C")}>
                        <FiTrendingUp size={12} />
                      </span>
                      <span>Max Discount</span>
                    </div>
                    <span>{form.max_discount || "-"}</span>
                  </div>
                </div>

                {/* Validity */}
                <div style={{ borderBottom: "1px solid #e2e8f0", padding: "10px 0" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <span style={iconBox("#EEF2FF", "#4F46E5")}>
                        <FiCalendar size={12} />
                      </span>
                      <span>Validity</span>
                    </div>
                    <span>{form.start_date || "-"} → {form.end_date || "-"}</span>
                  </div>
                </div>

                {/* Usage Limit */}
                <div style={{ borderBottom: "1px solid #e2e8f0", padding: "10px 0" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <span style={iconBox("#EFF6FF", "#2563EB")}>
                        <FiHash size={12} />
                      </span>
                      <span>Usage Limit</span>
                    </div>
                    <span>{form.usage_limit_total || "-"}</span>
                  </div>
                </div>

                {/* Per Restaurant */}
                <div style={{ borderBottom: "1px solid #e2e8f0", padding: "10px 0" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <span style={iconBox("#ECFDF5", "#059669")}>
                        <FiHome size={12} />
                      </span>
                      <span>Per Restaurant</span>
                    </div>
                    <span>{form.usage_limit_per_restaurant || "-"}</span>
                  </div>
                </div>

                {/* Platform */}
                <div style={{ borderBottom: "1px solid #e2e8f0", padding: "10px 0" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <span style={iconBox("#F0FDF4", "#16A34A")}>
                        <FiSettings size={12} />
                      </span>
                      <span>Platform</span>
                    </div>
                    <span>{form.absorb_type || "-"}</span>
                  </div>
                </div>

                {/* Region */}
                <div style={{ borderBottom: "1px solid #e2e8f0", padding: "10px 0" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <span style={iconBox("#EFF6FF", "#2563EB")}>
                        <FiMapPin size={12} />
                      </span>
                      <span>Region</span>
                    </div>
                    <span>{form.scope_type || "-"}</span>
                  </div>
                </div>

                {/* Campaign */}
                <div style={{ borderBottom: "1px solid #e2e8f0", padding: "10px 0" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <span style={iconBox("#FEF2F2", "#DC2626")}>
                        <FiTag size={12} />
                      </span>
                      <span>Campaign</span>
                    </div>
                    <span>{form.campaign_id || "-"}</span>
                  </div>
                </div>

                {/* Budget (last item - no border) */}
                <div style={{ padding: "10px 0" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <span style={iconBox("#FFF7ED", "#EA580C")}>
                        <FiDollarSign size={12} />
                      </span>
                      <span>Budget</span>
                    </div>
                    <span>{form.total_budget || "-"}</span>
                  </div>
                </div>

                {/* QUICK TIPS */}
                <div
                  style={{
                    marginTop: "18px",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid #ffedd5",
                    background: "#fff7ed"
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: "8px" }}>
                    💡 Quick Tips
                  </div>






                  *-
                  <ul style={{ paddingLeft: "16px", margin: 0, fontSize: "13px", color: "#475569" }}>
                    <li>Use clear and attractive coupon titles</li>
                    <li>Set the right discount value for better conversions</li>
                    <li>Define usage limits to control budget</li>
                    <li>Choose validity dates carefully</li>
                  </ul>
                </div>


              </div>.
            </div>
          </div>
          {/* FULL WIDTH TABLE */}
          <div className="coupon-full-width">

            <div className="coupon-card">
              <div className="coupon-section-title mb-3">
                All Coupons
              </div>


              <table className="coupon-table">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Code</th>
                    <th>Discount</th>
                    <th>Usage</th>
                    <th>Scope</th>
                    <th>Expiry</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {coupons.map((c) => {
                    const expired =
                      c.end_date &&
                      new Date(
                        c.end_date
                      ) <
                      new Date();

                    const usage =
                      c.usage_limit_total >
                        0
                        ? Math.min(
                          (c.total_usage /
                            c.usage_limit_total) *
                          100,
                          100
                        )
                        : 0;

                    return (
                      <tr
                        key={c.coupon_id}
                      >
                        <td>
                          {c.coupon_id}
                        </td>

                        <td>
                          <span className="coupon-badge coupon-badge-code">
                            {c.code}
                          </span>

                          <button
                            className="coupon-btn coupon-btn-light ms-2"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(
                                  c.code
                                );
                                setMessage(
                                  "Code copied"
                                );
                              } catch {
                                setError(
                                  "Copy failed"
                                );
                              }
                            }}
                          >
                            Copy
                          </button>
                        </td>

                        <td>
                          {c.discount_type ===
                            "PERCENTAGE"
                            ? `${c.discount_value}%`
                            : `₹${c.discount_value}`}
                        </td>

                        <td>
                          {c.total_usage}/
                          {c.usage_limit_total ||
                            "∞"}

                          <div className="coupon-progress">
                            <div
                              className="coupon-progress-bar"
                              style={{
                                width: `${usage}%`
                              }}
                            />
                          </div>
                        </td>

                        <td>
                          {c.scope_type}
                        </td>

                        <td>
                          {c.end_date
                            ? new Date(
                              c.end_date
                            ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td>
                          {expired ? (
                            <span className="coupon-badge coupon-badge-dark">
                              Expired
                            </span>
                          ) : c.is_active ? (
                            <span className="coupon-badge coupon-badge-success">
                              Active
                            </span>
                          ) : (
                            <span className="coupon-badge coupon-badge-danger">
                              Inactive
                            </span>
                          )}
                        </td>

                        <td>
                          <div className="coupon-actions">

                            {/* EDIT */}
                            <button
                              className="soft-btn soft-orange"
                              onClick={() => {
                                setMessage("");
                                setError("");
                                setSelectedCoupon(c);

                                window.scrollTo({
                                  top: 0,
                                  behavior: "smooth"
                                });

                                setForm({
                                  ...emptyForm,
                                  code: c.code,
                                  title: c.title || "",
                                  description: c.description || "",
                                  discount_type: c.discount_type,
                                  discount_value: c.discount_value,
                                  min_order_value:
                                    c.min_order_value || "",
                                  max_discount:
                                    c.max_discount || "",
                                  start_date: c.start_date
                                    ? new Date(c.start_date)
                                      .toISOString()
                                      .slice(0, 16)
                                    : "",
                                  end_date: c.end_date
                                    ? new Date(c.end_date)
                                      .toISOString()
                                      .slice(0, 16)
                                    : "",
                                  usage_limit_total:
                                    c.usage_limit_total || "",
                                  usage_limit_per_restaurant:
                                    c.usage_limit_per_restaurant ||
                                    "",
                                  absorb_type:
                                    c.absorb_type,
                                  supplier_share_percent:
                                    c.supplier_share_percent || 0,
                                  first_order_only:
                                    c.first_order_only,
                                  stackable:
                                    c.stackable,
                                  campaign_id:
                                    c.campaign_id || "",
                                  total_budget:
                                    c.total_budget || "",
                                  priority:
                                    c.priority || 1,
                                  scope_type:
                                    c.scope_type ||
                                    "GLOBAL",
                                  supplier_ids:
                                    c.supplier_ids || [],
                                  category_ids:
                                    c.category_ids || []
                                });
                              }}
                            >
                              <FiEdit2 />
                            </button>

                            {/* ACTIVE / INACTIVE */}
                            {c.is_active ? (
                              <button
                                className="soft-btn soft-red"
                                onClick={() =>
                                  deactivateCoupon(
                                    c.coupon_id
                                  )
                                }
                              >
                                <FiTrash2 />
                              </button>
                            ) : (
                              <button
                                className="soft-btn soft-green"
                                onClick={() =>
                                  activateCoupon(
                                    c.coupon_id
                                  )
                                }
                              >
                                <FiCheckCircle />
                              </button>
                            )}

                            {/* TARGET */}
                            <button
                              className="soft-btn soft-white"
                              onClick={() =>
                                addTarget(
                                  c.coupon_id
                                )
                              }
                            >
                              <FiEye />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}