import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import "../css/CouponManagement.css";
import {
  FiPause,
  FiPlay,
  FiSlash,
  FiEdit2,
  FiTrash2
} from "react-icons/fi";

const API = "http://192.168.2.9:5000/api/admin/promotions";

export default function ManagePaidPromotions() {

  const token = localStorage.getItem("admin_token");

  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  // =========================================================
  // MAIN STATES
  // =========================================================

  const [promotions, setPromotions] = useState([]);
  const [requests, setRequests] = useState([]);

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAllProducts, setSelectAllProducts] = useState(false);

  const productOptions = useMemo(() =>
    products.map(p => ({
      value: p.product_id,
      label: p.product_name_english
    })),
    [products]);

  // FORM STATE

  const [form, setForm] = useState({
    supplier: null,
    products: [],
    categories: [],
    subcategories: [],
    priority: 5,
    city: "",
    start_date: "",
    end_date: "",
    banner_title: "",
    banner_subtitle: "",
    banner_url: "",
    grid_position: "GRID_SUPPLIER_1"
  });

  const QATAR_CITIES = [
    "Doha",
    "Al Rayyan",
    "Al Wakrah",
    "Lusail",
    "Al Khor",
    "Umm Salal",
    "Al Shamal",
    "Dukhan"
  ];

  const [selectedCities, setSelectedCities] = useState([]);

  // =========================================================
  // LOAD DATA
  // =========================================================
  const loadPromotions = async () => {

    const res = await axios.get(`${API}/list`, authHeader);

    const unique = Object.values(
      res.data.reduce((acc, item) => {
        acc[item.promotion_id] = item;
        return acc;
      }, {})
    );

    setPromotions(unique);

  };

  const loadRequests = async () => {
    const res = await axios.get(`${API}/requests`, authHeader);
    setRequests(res.data);
  };

  const loadSuppliers = async () => {
    const res = await axios.get(`${API}/suppliers`, authHeader);
    setSuppliers(res.data);
  };

  const loadCategories = async () => {
    const res = await axios.get(`${API}/categories`, authHeader);
    setCategories(res.data);
  };

  useEffect(() => {

    loadPromotions();
    loadRequests();
    loadSuppliers();
    loadCategories();

    const interval = setInterval(() => {

      loadPromotions();

    }, 10000);

    return () => clearInterval(interval);

  }, []);



  // =========================================================
  // LOAD PRODUCTS WHEN SUPPLIER SELECTED
  // =========================================================
  const toggleCity = (city) => {

    if (selectedCities.includes(city)) {
      setSelectedCities(selectedCities.filter(c => c !== city));
    } else {
      setSelectedCities([...selectedCities, city]);
    }

  };

  const onSupplierChange = async (supplier) => {

    setForm(prev => ({
      ...prev,
      supplier,
      products: []
    }));

    const res = await axios.get(
      `${API}/supplier/${supplier.value}/products`,
      authHeader
    );

    setProducts(res.data);
    setSelectedProducts([]);
    setSelectAllProducts(false);
    setSelectedCities([]);


  };
  const toggleProduct = (product_id) => {

    if (selectedProducts.includes(product_id)) {
      setSelectedProducts(selectedProducts.filter(id => id !== product_id));
    } else {
      setSelectedProducts([...selectedProducts, product_id]);
    }

  };

  const toggleSelectAllProducts = () => {

    if (selectAllProducts) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.product_id));
    }

    setSelectAllProducts(!selectAllProducts);

  };



  // =========================================================
  // CREATE PROMOTION
  // =========================================================

  const createPromotion = async () => {

    if (!form.start_date || !form.end_date) {
      alert("Start and End date required");
      return;
    }

    if (new Date(form.start_date) >= new Date(form.end_date)) {
      alert("End date must be after start date");
      return;
    }

    if (!form.supplier) {
      alert("Select supplier");
      return;
    }

    if (selectedCities.length === 0) {
      alert("Select at least one city");
      return;
    }

    try {

      let createdPromotions = [];

      for (const city of selectedCities) {

        try {

          const res = await axios.post(
            `${API}/create`,
            {
              supplier_id: form.supplier.value,
              product_ids: selectedProducts,   // 🔥 CRITICAL FIX
              promotion_type: "PAID",
              city,
              priority: form.priority,
              start_date: new Date(form.start_date).toISOString(),
              end_date: new Date(form.end_date).toISOString()
            },
            authHeader
          );

          createdPromotions.push({
            city,
            promotion_id: res.data.promotion_id,
            reused: res.data.existing === true
          });

        } catch (err) {

          alert(
            err.response?.data?.message ||
            err.response?.data?.error ||
            `Failed for ${city}`
          );

        }
      }

      // ============================
      // ATTACH BANNER SAFELY
      // ============================

      if (form.banner_url && createdPromotions.filter(p => p.promotion_id).length > 0) {

        for (const promo of createdPromotions) {

          try {

            await axios.post(
              `${API}/${promo.promotion_id}/banner`,
              {
                original_image_url: form.banner_url,
                processed_image_url: form.banner_url,
                banner_title: form.banner_title,
                banner_subtitle: form.banner_subtitle,
                grid_position: form.grid_position,
                priority: form.priority,
                replace_existing: false
              },
              authHeader
            );

          } catch (err) {

            if (err.response?.data?.error === "GRID_OCCUPIED") {

              const shouldReplace = window.confirm(
                `Grid occupied in ${promo.city}. Replace it?`
              );

              if (!shouldReplace) continue;

              try {

                await axios.post(
                  `${API}/${promo.promotion_id}/banner`,
                  {
                    original_image_url: form.banner_url,
                    processed_image_url: form.banner_url,
                    banner_title: form.banner_title,
                    banner_subtitle: form.banner_subtitle,
                    grid_position: form.grid_position,
                    priority: form.priority,
                    replace_existing: true
                  },
                  authHeader
                );

              } catch (replaceErr) {

                alert(
                  replaceErr.response?.data?.message ||
                  "Replace failed"
                );

              }

            } else {

              alert(
                err.response?.data?.message ||
                "Banner failed"
              );

            }

          }

        }

      }

      // ============================
      // RESET FORM
      // ============================

      setForm({
        supplier: null,
        products: [],
        categories: [],
        subcategories: [],
        priority: 5,
        city: "",
        start_date: "",
        end_date: "",
        banner_title: "",
        banner_subtitle: "",
        banner_url: "",
        grid_position: "GRID_SUPPLIER_1"
      });

      setSelectedProducts([]);
      setSelectedCities([]);
      setSelectAllProducts(false);
      setShowModal(false);

      loadPromotions();

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to create promotion"
      );
    }
  };



  // =========================================================
  // REQUEST APPROVAL
  // =========================================================

  const approveRequest = async (request) => {

    try {

      await axios.put(
        `${API}/requests/${request.request_id}/approve`,
        {},
        authHeader
      );

      await axios.post(
        `${API}/create`,
        {
          request_id: request.request_id,
          supplier_id: request.supplier_id,
          product_ids: request.product_id ? [request.product_id] : [],
          promotion_type: "PAID",
          city: "Doha",
          priority: 10,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 7 * 86400000).toISOString()
        },
        authHeader
      );

      await loadRequests();
      await loadPromotions();

    } catch (err) {

      if (err.response?.status === 409) {

        alert(
          err.response.data.message ||
          err.response.data.error
        );

        return;
      }

      console.error(err);
      alert("Approval failed");
    }
  };

  const rejectRequest = async (id) => {

    await axios.put(
      `${API}/requests/${id}/reject`,
      {},
      authHeader
    );

    loadRequests();

  };

  const deletePromotion = async (id) => {

    if (!window.confirm("Delete promotion?")) return;

    await axios.put(
      `${API}/${id}/status`,
      { status: "DELETED" },
      authHeader
    );

    loadPromotions();

  };
  const getDuration = (start, end) => {

    const now = new Date();
    const endDate = new Date(end);

    const diff = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    if (diff <= 0) return "Expired";

    return diff + " days left";

  };


  // =========================================================
  // STATUS CHANGE
  // =========================================================

  const changeStatus = async (id, status) => {

    try {

      await axios.put(
        `${API}/${id}/status`,
        { status },
        authHeader
      );

      loadPromotions();

    } catch (err) {

      alert(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Status update failed"
      );
    }
  };
  const editPromotion = async (promotion) => {

    const newPriority = prompt("Enter new priority:", promotion.priority);

    if (!newPriority) return;

    await axios.put(
      `${API}/${promotion.promotion_id}`,
      {
        priority: Number(newPriority),
        city: promotion.city,
        start_date: promotion.start_date,
        end_date: promotion.end_date
      },
      authHeader
    );

    loadPromotions();

  };


  // =========================================================
  // BADGES
  // =========================================================

  const priorityBadge = (priority) => {

    let label = "Silver";

    if (priority >= 10) label = "Platinum";
    else if (priority >= 5) label = "Gold";

    return <span className="badge bg-primary">{label}</span>;

  };

  const statusBadge = (status) => {

    const colors = {
      ACTIVE: "green",
      PAUSED: "orange",
      EXPIRED: "gray",
      REPLACED: "purple",
      DELETED: "red"
    };


    return (
      <span style={{
        padding: "4px 10px",
        background: colors[status],
        color: "white",
        borderRadius: "6px"
      }}>
        {status}
      </span>
    );

  };

  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="coupon-page">

      <div className="coupon-container">

        {/* HEADER */}
        <div className="coupon-header">

          <div className="coupon-header-left">
            <h2>Manage Paid Promotions</h2>
            <p>
              Create, approve and manage supplier promotion campaigns
            </p>
          </div>

          <button
            className="coupon-btn coupon-btn-primary"
            onClick={() => setShowModal(true)}
          >
            Create Promotion
          </button>

        </div>

        {/* ========================================================= */}
        {/* MODAL */}
        {/* ========================================================= */}

        {showModal && (

          <div
            className="modal d-block"
            style={{
              background:
                "rgba(15,23,42,.45)"
            }}
          >

            <div className="modal-dialog modal-xl">

              <div className="modal-content coupon-card">

                <div className="modal-header border-0 pb-0">

                  <h5 className="coupon-section-title m-0">
                    Create Supplier Promotion Campaign
                  </h5>

                  <button
                    className="btn-close"
                    onClick={() =>
                      setShowModal(false)
                    }
                  />

                </div>

                <div className="modal-body pt-3">

                  <div className="coupon-form-grid">

                    {/* SUPPLIER */}
                    <div>
                      <label className="mb-2 fw-bold">
                        Supplier
                      </label>

                      <Select
                        classNamePrefix="coupon-select"

                        options={suppliers.map((s) => ({
                          value: s.supplier_id,
                          label: s.company_name_english
                        }))}
                        value={form.supplier}
                        onChange={(supplier) => {
                          if (!supplier) {
                            setForm({
                              supplier: null,
                              products: [],
                              categories: [],
                              subcategories: [],
                              priority: 5,
                              city: "",
                              start_date: "",
                              end_date: "",
                              banner_title: "",
                              banner_subtitle: "",
                              banner_url: "",
                              grid_position:
                                "GRID_SUPPLIER_1"
                            });

                            setProducts([]);
                            setSelectedProducts([]);
                            setSelectedCities([]);
                            setSelectAllProducts(false);
                            return;
                          }

                          onSupplierChange(supplier);
                        }}
                        isClearable
                      />
                    </div>

                    {/* PRIORITY */}
                    <div>
                      <label className="mb-2 fw-bold">
                        Priority
                      </label>

                      <select
                        className="coupon-select"
                        onChange={(e) =>
                          setForm(
                            (
                              prev
                            ) => ({
                              ...prev,
                              priority:
                                Number(
                                  e
                                    .target
                                    .value
                                )
                            })
                          )
                        }
                      >
                        <option value="1">
                          Silver
                        </option>
                        <option value="5">
                          Gold
                        </option>
                        <option value="10">
                          Platinum
                        </option>
                      </select>
                    </div>

                    {/* START */}
                    <div>
                      <label className="mb-2 fw-bold">
                        Start Date
                      </label>

                      <input
                        type="datetime-local"
                        className="coupon-input"
                        onChange={(e) =>
                          setForm(
                            (
                              prev
                            ) => ({
                              ...prev,
                              start_date:
                                e
                                  .target
                                  .value
                            })
                          )
                        }
                      />
                    </div>

                    {/* GRID */}
                    <div>
                      <label className="mb-2 fw-bold">
                        Grid Position
                      </label>

                      <select
                        className="coupon-select"
                        onChange={(e) =>
                          setForm(
                            (
                              prev
                            ) => ({
                              ...prev,
                              grid_position:
                                e
                                  .target
                                  .value
                            })
                          )
                        }
                      >
                        <option value="LEFT_SLIDER_1">
                          Left Slider 1
                        </option>
                        <option value="LEFT_SLIDER_2">
                          Left Slider 2
                        </option>
                        <option value="LEFT_SLIDER_3">
                          Left Slider 3
                        </option>
                        <option value="RIGHT_SLIDER_1">
                          Right Slider 1
                        </option>
                        <option value="RIGHT_SLIDER_2">
                          Right Slider 2
                        </option>
                        <option value="RIGHT_SLIDER_3">
                          Right Slider 3
                        </option>
                      </select>
                    </div>

                    {/* END */}
                    <div>
                      <label className="mb-2 fw-bold">
                        End Date
                      </label>

                      <input
                        type="datetime-local"
                        className="coupon-input"
                        onChange={(e) =>
                          setForm(
                            (
                              prev
                            ) => ({
                              ...prev,
                              end_date:
                                e
                                  .target
                                  .value
                            })
                          )
                        }
                      />
                    </div>

                    {/* URL */}
                    <div>
                      <label className="mb-2 fw-bold">
                        Banner URL
                      </label>

                      <input
                        className="coupon-input"
                        onChange={(e) =>
                          setForm(
                            (
                              prev
                            ) => ({
                              ...prev,
                              banner_url:
                                e
                                  .target
                                  .value
                            })
                          )
                        }
                      />
                    </div>

                    {/* TITLE */}
                    <div>
                      <label className="mb-2 fw-bold">
                        Banner Title
                      </label>

                      <input
                        className="coupon-input"
                        onChange={(e) =>
                          setForm(
                            (
                              prev
                            ) => ({
                              ...prev,
                              banner_title:
                                e
                                  .target
                                  .value
                            })
                          )
                        }
                      />
                    </div>

                    {/* SUBTITLE */}
                    <div>
                      <label className="mb-2 fw-bold">
                        Banner Subtitle
                      </label>

                      <input
                        className="coupon-input"
                        onChange={(e) =>
                          setForm(
                            (
                              prev
                            ) => ({
                              ...prev,
                              banner_subtitle:
                                e
                                  .target
                                  .value
                            })
                          )
                        }
                      />
                    </div>

                  </div>

                  {/* PRODUCTS */}
                  <div className="mt-4">

                    <div className="d-flex justify-content-between align-items-center mb-2">

                      <label className="fw-bold m-0">
                        Products
                      </label>

                      <button
                        type="button"
                        className="coupon-btn coupon-btn-light"
                        onClick={() => {
                          if (selectAllProducts) {
                            setSelectedProducts([]);
                            setSelectAllProducts(false);
                          } else {
                            const all = products.map(
                              (p) => p.product_id
                            );

                            setSelectedProducts(all);
                            setSelectAllProducts(true);
                          }
                        }}
                      >
                        {selectAllProducts
                          ? "Unselect"
                          : "Select All"}
                      </button>

                    </div>

                    <Select

                      classNamePrefix="coupon-select"
                      options={productOptions}
                      isMulti
                      closeMenuOnSelect={false}
                      hideSelectedOptions={false}
                      value={productOptions.filter(
                        (option) =>
                          selectedProducts.includes(
                            option.value
                          )
                      )}
                      onChange={(selected) => {
                        const values = selected
                          ? selected.map(
                            (s) => s.value
                          )
                          : [];

                        setSelectedProducts(values);

                        setSelectAllProducts(
                          values.length ===
                          productOptions.length
                        );
                      }}
                    />

                  </div>

                  {/* CITIES */}
                  <div className="mt-4">

                    <div className="d-flex justify-content-between align-items-center mb-3">

                      <label className="fw-bold m-0">
                        Cities
                      </label>

                      <button
                        type="button"
                        className="coupon-btn coupon-btn-light"
                        onClick={() => {
                          if (
                            selectedCities.length ===
                            QATAR_CITIES.length
                          ) {
                            setSelectedCities(
                              []
                            );
                          } else {
                            setSelectedCities(
                              QATAR_CITIES
                            );
                          }
                        }}
                      >
                        {selectedCities.length ===
                          QATAR_CITIES.length
                          ? "Unselect"
                          : "Select All"}
                      </button>

                    </div>

                    <div className="supplier-grid">

                      {QATAR_CITIES.map(
                        (city) => (

                          <label className="supplier-item">
                            <span>{city}</span>

                            <input
                              type="checkbox"
                              checked={selectedCities.includes(city)}
                              onChange={() => toggleCity(city)}
                            />
                          </label>

                        )
                      )}

                    </div>

                  </div>

                </div>

                <div className="modal-footer border-0 pt-0">

                  <button
                    className="coupon-btn coupon-btn-primary"
                    onClick={
                      createPromotion
                    }
                  >
                    Create
                  </button>

                  <button
                    className="coupon-btn coupon-btn-light"
                    onClick={() =>
                      setShowModal(false)
                    }
                  >
                    Cancel
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

        {/* ========================================================= */}
        {/* REQUEST TABLE */}
        {/* ========================================================= */}

        <div className="coupon-card mb-4">

          <div className="coupon-section-title">
            Supplier Requests
          </div>



          <table className="coupon-table">

            <tbody>

              {requests.map((r) => (

                <tr key={r.request_id}>

                  <td>
                    {
                      r.company_name_english
                    }
                  </td>

                  <td>
                    {
                      r.product_name_english
                    }
                  </td>

                  <td>
                    {r.start_date &&
                      r.end_date
                      ? getDuration(
                        r.start_date,
                        r.end_date
                      )
                      : "—"}
                  </td>

                  <td>
                    {r.status}
                  </td>

                  <td>

                    <div className="coupon-actions">

                      <button
                        className="coupon-btn coupon-btn-sm coupon-btn-success"
                        onClick={() =>
                          approveRequest(
                            r
                          )
                        }
                      >
                        Approve
                      </button>

                      <button
                        className="coupon-btn coupon-btn-sm coupon-btn-danger"
                        onClick={() =>
                          rejectRequest(
                            r.request_id
                          )
                        }
                      >
                        Reject
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>



        </div>

        {/* ========================================================= */}
        {/* ACTIVE PROMOTIONS */}
        {/* ========================================================= */}

        <div className="coupon-card">

          <div className="coupon-section-title">
            Active Promotions
          </div>



          <table className="coupon-table">

            <tbody>

              {promotions.map(
                (p) => (

                  <tr
                    key={`${p.promotion_id}-${p.city}`}
                  >

                    <td>
                      {
                        p.promotion_type
                      }{" "}
                      Campaign
                    </td>

                    <td>
                      {
                        p.company_name_english
                      }
                    </td>

                    <td>
                      {p.city}
                    </td>

                    <td>
                      {priorityBadge(
                        p.priority
                      )}
                    </td>

                    <td>
                      {getDuration(
                        p.start_date,
                        p.end_date
                      )}
                    </td>

                    <td>
                      {statusBadge(
                        p.status
                      )}
                    </td>

                    <td>

                      <div className="coupon-actions">

                        {/* PAUSE */}
                        <button
                          className="soft-btn soft-orange"
                          title="Pause Promotion"
                          onClick={() =>
                            changeStatus(
                              p.promotion_id,
                              "PAUSED"
                            )
                          }
                        >
                          <FiPause />
                        </button>

                        {/* RESUME */}
                        <button
                          className="soft-btn soft-green"
                          title="Resume Promotion"
                          onClick={() =>
                            changeStatus(
                              p.promotion_id,
                              "ACTIVE"
                            )
                          }
                        >
                          <FiPlay />
                        </button>

                        {/* STOP */}
                        <button
                          className="soft-btn soft-red"
                          title="Stop Promotion"
                          onClick={() =>
                            changeStatus(
                              p.promotion_id,
                              "EXPIRED"
                            )
                          }
                        >
                          <FiSlash />
                        </button>

                        {/* EDIT */}
                        <button
                          className="soft-btn soft-orange"
                          title="Edit Promotion"
                          onClick={() =>
                            editPromotion(p)
                          }
                        >
                          <FiEdit2 />
                        </button>

                        {/* DELETE */}
                        <button
                          className="soft-btn soft-red"
                          title="Delete Promotion"
                          onClick={() =>
                            deletePromotion(
                              p.promotion_id
                            )
                          }
                        >
                          <FiTrash2 />
                        </button>

                      </div>
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}