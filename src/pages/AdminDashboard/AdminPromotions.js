import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/Promotions.css";

import {
  FiSearch,
  FiEdit3,
  FiTag,
  FiPercent,
  FiFlag,
  FiCalendar,
  FiMapPin,
  FiBox,
  FiZap,
  FiImage,
  FiShoppingBag,
  FiGrid,
  FiGift
} from "react-icons/fi";


const API = "http://192.168.2.16:5000/api/v1/admin/promotions/mahal";

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const AdminPromotions = () => {
  const [activeTab, setActiveTab] = useState("PRODUCT");

  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);

  const [fileInputKey, setFileInputKey] = useState(Date.now());

  // const [suppliers, setSuppliers] = useState([]);
  // const [products, setProducts] = useState([]);
  // const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [, setSuppliers] = useState([]);
  const [, setProducts] = useState([]);
  const [, setSelectedSupplier] = useState(null);

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [productSearchKeyword, setProductSearchKeyword] = useState("");
  const [categorySearchKeyword, setCategorySearchKeyword] = useState("");

  const [categoryResults, setCategoryResults] = useState([]);
  const [selectedCategorySuppliers, setSelectedCategorySuppliers] = useState([]);

  // Festival Advanced Selection
  const [festivalCategoryKeyword, setFestivalCategoryKeyword] = useState("");
  const [festivalCategories, setFestivalCategories] = useState([]);
  const [festivalSubcategories, setFestivalSubcategories] = useState([]);
  const [festivalProducts, setFestivalProducts] = useState([]);
  const [selectedFestivalProducts, setSelectedFestivalProducts] = useState([]);

  const searchProducts = async (value) => {
    setProductSearchKeyword(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    if (value.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await axios.get(
        `http://192.168.2.16:5000/api/v1/admin/products/search?q=${value}`
      );

      setSearchResults(res.data.data);
    } catch (error) {
      console.error(error);
      setSearchResults([]);
    }
  };

  const searchCategory = async (value) => {
    setCategorySearchKeyword(value);

    if (!value.trim()) {
      setCategoryResults([]);
      return;
    }

    if (value.length < 2) {
      setCategoryResults([]);
      return;
    }

    try {
      const res = await axios.get(
        `http://192.168.2.16:5000/api/v1/admin/categories/search?q=${value}`
      );

      setCategoryResults(res.data.data || []);
    } catch (error) {
      console.error(error);
      setCategoryResults([]);
    }
  };

  /* ---------- PRODUCT ---------- */
  const [product, setProduct] = useState({
    product_id: "",
    product_ids: [],
    supplier_ids: [],
    cities: [],
    applyToAll: false,
    start_date: "",
    end_date: "",
    priority_level: "HIGH",
    banner: null,
    title: "",
    headline: "",
    description: "",
    offer_type: "",
    offer_value: "",
  });

  /* ---------- CATEGORY ---------- */
  const [category, setCategory] = useState({
    category_id: "",
    category_ids: [],
    supplier_ids: [],
    cities: [],
    applyToAll: false,
    start_date: "",
    end_date: "",
    priority_level: "HIGH",
    banner: null,
    title: "",
    headline: "",
    description: "",
    offer_type: "",
    offer_value: "",
  });

  /* ---------- FESTIVAL ---------- */
  const [festival, setFestival] = useState({
    title: "",
    headline: "",
    description: "",
    product_ids: [],
    supplier_ids: [],
    offer_type: "",
    offer_value: "",
    countries: [],
    applyToAll: false,
    start_date: "",
    end_date: "",
    priority_level: "HIGH",
    homepage_banners: [],
    category_banners: [],
  });

  useEffect(() => {
    axios.get("http://192.168.2.16:5000/api/v1/master/city")
      .then(res => setCities(res.data.data));

    axios.get("http://192.168.2.16:5000/api/v1/master/country")
      .then(res => setCountries(res.data.data));
  }, []);

  useEffect(() => {
    axios.get("http://192.168.2.16:5000/api/v1/admin/suppliers")
      .then(res => setSuppliers(res.data.data));
  }, []);

  const handleSupplierChange = (supplierId) => {
    setSelectedSupplier(supplierId);

    axios.get(`http://192.168.2.16:5000/api/v1/admin/supplier/${supplierId}/products`)
      .then(res => setProducts(res.data.data));
  };

  const resetForm = (skipConfirm = false) => {
    // if (!window.confirm("Are you sure you want to clear this form?")) return;

    if (!skipConfirm) {
      if (!window.confirm("Are you sure you want to clear this form?")) return;
    }
    // Clear search
    setProductSearchKeyword("");
    setCategorySearchKeyword("");
    setSearchResults([]);
    setCategoryResults([]);
    setSelectedProducts([]);
    setSelectedCategorySuppliers([]);

    // 🔥 FESTIVAL CLEAR
    setFestivalCategoryKeyword("");
    setFestivalCategories([]);
    setFestivalSubcategories([]);
    setFestivalProducts([]);
    setSelectedFestivalProducts([]);

    // Reset PRODUCT
    setProduct({
      product_id: "",
      product_ids: [],
      supplier_ids: [],
      cities: [],
      applyToAll: false,
      start_date: "",
      end_date: "",
      priority_level: "HIGH",
      banner: null,
      title: "",
      headline: "",
      description: "",
      offer_type: "",
      offer_value: "",
    });

    // Reset CATEGORY
    setCategory({
      category_id: "",
      category_ids: [],
      supplier_ids: [],
      cities: [],
      applyToAll: false,
      start_date: "",
      end_date: "",
      priority_level: "HIGH",
      banner: null,
      title: "",
      headline: "",
      description: "",
      offer_type: "",
      offer_value: "",
    });

    // Reset FESTIVAL
    setFestival({
      title: "",
      headline: "",
      description: "",
      product_ids: [],
      supplier_ids: [],
      offer_type: "",
      offer_value: "",
      countries: [],
      applyToAll: false,
      start_date: "",
      end_date: "",
      priority_level: "HIGH",
      homepage_banners: [],
      category_banners: [],
    });

    // Reset file input
    setFileInputKey(Date.now());
  };

  const submit = async () => {
    let payload = {
      target_type: activeTab,
    };

    if (activeTab === "PRODUCT" && product.product_ids.length === 0) {
      alert("Select at least one product");
      return;
    }

    if (activeTab === "PRODUCT") {

      const finalProductIds =
        product.product_ids?.length > 0
          ? product.product_ids
          : product.product_id
            ? [Number(product.product_id)]
            : [];

      if (finalProductIds.length === 0) {
        alert("Select at least one product");
        return;
      }

      payload = {
        ...payload,
        supplier_ids: product.supplier_ids,
        target_ids: finalProductIds,
        location_scope: product.applyToAll ? "ALL" : "CITY",
        location_values: product.applyToAll ? cities : product.cities,
        start_date: product.start_date,
        end_date: product.end_date,
        priority_level: product.priority_level,
        banner_image: product.banner,
        title: product.title,
        headline: product.headline,
        description: product.description,
        offer_type: product.offer_type,
        offer_value: Number(product.offer_value),
        meta: {
          product_count: finalProductIds.length,
          supplier_count: product.supplier_ids.length
        }
      };
    }

    if (activeTab === "CATEGORY") {

      if (category.category_ids.length === 0) {
        alert("Select at least one category supplier");
        return;
      }

      payload = {
        ...payload,
        supplier_ids: [],
        target_ids: category.category_ids,
        location_scope: category.applyToAll ? "ALL" : "CITY",
        location_values: category.applyToAll ? cities : category.cities,
        start_date: category.start_date,
        end_date: category.end_date,
        priority_level: category.priority_level,
        banner_image: category.banner,
        title: category.title,
        headline: category.headline,
        description: category.description,
        offer_type: category.offer_type,
        offer_value: category.offer_value,
        meta: {
          category_supplier_count: selectedCategorySuppliers.length
        }
      };
    }

    if (activeTab === "FESTIVAL") {

      if (selectedFestivalProducts.length === 0) {
        alert("Select at least one product");
        return;
      }

      payload = {
        ...payload,
        supplier_ids: [
          ...new Set(selectedFestivalProducts.map(p => p.supplier_id))
        ],
        target_ids: selectedFestivalProducts.map(p => p.product_id),
        location_scope: festival.applyToAll ? "ALL" : "COUNTRY",
        location_values: festival.applyToAll ? countries : festival.countries,
        start_date: festival.start_date,
        end_date: festival.end_date,
        priority_level: festival.priority_level,
        title: festival.title,
        headline: festival.headline,
        description: festival.description,
        offer_type: festival.offer_type,
        offer_value: festival.offer_value,
        meta: {
          homepage_banners: festival.homepage_banners,
          category_banners: festival.category_banners,
          category_ids: [
            ...new Set(selectedFestivalProducts.map(p => p.category_id))
          ],
          sub_category_ids: [
            ...new Set(selectedFestivalProducts.map(p => p.sub_category_id))
          ]
        }
      };
    }

    try {
      const token = localStorage.getItem("admin_token");

      await axios.post(API, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Promotion Created Successfully");

      resetForm(true);
    } catch (error) {
      console.error(error);
      alert("Failed to create promotion");
    }
  };

  return (
    <div className="promo-page">

      {/* HEADER */}
      <div className="promo-header">
        <div className="promo-icon">🛍</div>
        <div>
          <h2>Promotions & Offers</h2>
          <p>Create and manage product, category and festival offers</p>
        </div>
      </div>

      {/* TABS */}
      <div className="promo-tabs">

        <div
          className={`promo-tab ${activeTab === "PRODUCT" ? "active" : ""}`}
          onClick={() => setActiveTab("PRODUCT")}
        >
          <FiShoppingBag className="tab_icon" />
          <span>Product Offer</span>
        </div>

        <div
          className={`promo-tab ${activeTab === "CATEGORY" ? "active" : ""}`}
          onClick={() => setActiveTab("CATEGORY")}
        >
          <FiGrid className="tab_icon" />
          <span>Category Offer</span>
        </div>

        <div
          className={`promo-tab ${activeTab === "FESTIVAL" ? "active" : ""}`}
          onClick={() => setActiveTab("FESTIVAL")}
        >
          <FiGift className="tab_icon" />
          <span>Festival Sale</span>
        </div>

      </div>

      {/* ================= PRODUCT TAB ================= */}
      {activeTab === "PRODUCT" && (
        <>
          {/* 🔥 NOTHING CHANGED — YOUR FULL ORIGINAL CODE */}

          <div className="promo-layout">

            {/* LEFT */}
            <div className="promo-left">

              {/* ================= SELECT PRODUCT ================= */}
              <div className="promo-card">
                <div className="promo-section-head">
                  <div className="promo-icon-badge blue">
                    <FiSearch />
                  </div>
                  <div>
                    <h4>Select Product</h4>
                    <p>Search and select product(s)</p>
                  </div>
                </div>

                <input
                  className="promo-input"
                  placeholder="Search product name, brand, SKU..."
                  value={productSearchKeyword}
                  onChange={(e) => searchProducts(e.target.value)}
                />

                {productSearchKeyword && searchResults?.length > 0 && (
                  <div className="promo-results">
                    {searchResults.map((p) => {
                      const isSelected = product?.product_ids?.includes(p.product_id);

                      return (
                        <div
                          key={p.product_id}
                          className={`promo-result ${isSelected ? "selected" : ""}`}
                          onClick={() => {
                            const already = product?.product_ids?.includes(p.product_id);

                            if (already) {
                              setProduct({
                                ...product,
                                product_ids: product.product_ids.filter(id => id !== p.product_id),
                                supplier_ids: product.supplier_ids.filter(id => id !== p.supplier_id)
                              });

                              setSelectedProducts(prev =>
                                prev.filter(x => x.product_id !== p.product_id)
                              );
                            } else {
                              setProduct({
                                ...product,
                                product_ids: [...product.product_ids, p.product_id],
                                supplier_ids: [...new Set([...product.supplier_ids, p.supplier_id])]
                              });

                              setSelectedProducts(prev => [...prev, p]);
                            }
                          }}
                        >
                          {p.product_name_english}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="promo-selected-list">
                  {selectedProducts.map((p) => (
                    <div key={p.product_id} className="promo-chip">
                      {p.product_name_english}
                      <span
                        onClick={() => {
                          setProduct({
                            ...product,
                            product_ids: product.product_ids.filter(id => id !== p.product_id),
                            supplier_ids: product.supplier_ids.filter(id => id !== p.supplier_id)
                          });

                          setSelectedProducts(prev =>
                            prev.filter(x => x.product_id !== p.product_id)
                          );
                        }}
                      >
                        ✕
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {/* ================= OFFER CONTENT ================= */}



              <div className="promo-card">
                <div className="promo-section-head">
                  <div className="promo-icon-badge purple">
                    <FiEdit3 />
                  </div>

                  <div>
                    <h4>Offer Content</h4>
                    <p>Enter offer details</p>
                  </div>
                </div>

                <div className="promo-grid-2">
                  <input
                    className="promo-input"
                    placeholder="Title"
                    value={product.title || ""}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        title: e.target.value,
                      })
                    }
                  />

                  <input
                    className="promo-input"
                    placeholder="Headline"
                    value={product.headline || ""}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        headline: e.target.value,
                      })
                    }
                  />
                </div>

                <textarea
                  className="promo-textarea"
                  placeholder="Description"
                  value={product.description || ""}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      description: e.target.value,
                    })
                  }
                />
              </div>



              {/* ================= TYPE + VALUE + PRIORITY ================= */}
              <div className="promo-grid-3">

                {/* OFFER TYPE */}
                <div className="promo-card compact">

                  <div className="promo-section-head">

                    <div className="promo-icon-badge green">
                      <FiTag />
                    </div>

                    <div>
                      <h4>Offer Type</h4>
                      <p>Select discount type</p>
                    </div>

                  </div>

                  <select
                    className="promo-select"
                    value={product.offer_type || ""}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        offer_type: e.target.value,
                      })
                    }
                  >
                    <option value="">Select type</option>
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FLAT">Flat</option>
                  </select>

                </div>


                {/* OFFER VALUE */}
                <div className="promo-card compact">

                  <div className="promo-section-head">

                    <div className="promo-icon-badge orange">
                      <FiPercent />
                    </div>

                    <div>
                      <h4>Offer Value</h4>
                      <p>Enter discount amount</p>
                    </div>

                  </div>

                  <input
                    type="number"
                    className="promo-input"
                    placeholder="Enter value"
                    value={product.offer_value || ""}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        offer_value: e.target.value,
                      })
                    }
                  />

                </div>


                {/* PRIORITY */}
                <div className="promo-card compact">

                  <div className="promo-section-head">

                    <div className="promo-icon-badge red">
                      <FiFlag />
                    </div>

                    <div>
                      <h4>Priority Level</h4>
                      <p>Select visibility priority</p>
                    </div>

                  </div>

                  <select
                    className="promo-select"
                    value={product.priority_level || "HIGH"}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        priority_level: e.target.value,
                      })
                    }
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>

                </div>

              </div>



              {/* ================= DATE ================= */}
              <div className="promo-card">
                <div className="promo-section-head">
                  <div className="promo-icon-badge purple">
                    <FiCalendar />
                  </div>

                  <div className="promo-section-text">
                    <h4>Offer Duration</h4>
                    <p>Select start and end date</p>
                  </div>
                </div>

                <div className="promo-date-row">

                  <input
                    className="promo-input"
                    type="date"
                    value={product.start_date}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        start_date: e.target.value,
                      })
                    }
                  />

                  <input
                    className="promo-input"
                    type="date"
                    value={product.end_date}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        end_date: e.target.value,
                      })
                    }
                  />

                </div>
              </div>



              {/* ================= CITIES ================= */}
              <div className="promo-card">

                <div className="promo-section-head">
                  <div className="promo-icon-badge green">
                    <FiMapPin />
                  </div>

                  <div>
                    <h4>Applicable Cities</h4>
                    <p>Select or search cities</p>
                  </div>
                </div>

                {/* SEARCH */}
                <input
                  type="text"
                  className="promo-input city-search"
                  placeholder="Search city..."
                />

                {/* TOGGLE */}
                <div className="scope_toggle">

                  <button
                    type="button"
                    className={!product.applyToAll ? "active" : ""}
                    onClick={() =>
                      setProduct({
                        ...product,
                        applyToAll: false,
                      })
                    }
                  >
                    Selected Cities
                  </button>

                  <button
                    type="button"
                    className={product.applyToAll ? "active" : ""}
                    onClick={() =>
                      setProduct({
                        ...product,
                        applyToAll: true,
                      })
                    }
                  >
                    All Cities
                  </button>

                </div>

                {!product.applyToAll && (
                  <div className="city_grid">

                    {cities.map((city, index) => (
                      <div
                        key={index}
                        className={`city_chip ${product.cities.includes(city)
                            ? "selected"
                            : ""
                          }`}
                        onClick={() => {

                          if (product.cities.includes(city)) {

                            setProduct({
                              ...product,
                              cities: product.cities.filter(
                                (c) => c !== city
                              ),
                            });

                          } else {

                            setProduct({
                              ...product,
                              cities: [...product.cities, city],
                            });

                          }

                        }}
                      >
                        {city}
                      </div>
                    ))}

                  </div>
                )}

              </div>

            </div>



            {/* RIGHT */}

            <div className="promo-right">

              <div className="promo-summary">

                {/* HEADER */}
                <div className="promo-summary-header">
                  <div className="promo-icon-badge orange">
                    <FiTag />
                  </div>
                  <div>
                    <h4>Offer Summary</h4>
                    <p>Review your offer details before submission</p>
                  </div>
                </div>

                {/* HERO */}
                <div className="promo-hero">
                  <div>
                    <h3>Special Product Offer!</h3>
                    <p>
                      Amazing discounts on selected products just for you
                    </p>
                  </div>
                  <div className="promo-gift">🎁</div>
                </div>

                {/* DETAILS */}
                <div className="promo-summary-list">
                  <div className="promo-summary-row">
                    <div className="left">
                      <FiBox />
                      <span>Selected Products</span>
                    </div>
                    <div className="right blue">
                      {selectedProducts.length} Products
                    </div>
                  </div>

                  <div className="promo-summary-row">
                    <div className="left">
                      <FiTag />
                      <span>Offer Type</span>
                    </div>
                    <div className="right green">
                      {product.offer_type || "-"}
                    </div>
                  </div>

                  <div className="promo-summary-row">
                    <div className="left">
                      <FiPercent />
                      <span>Offer Value</span>
                    </div>
                    <div className="right orange">
                      {product.offer_value || 0}%
                    </div>
                  </div>

                  {/* ✅ FIXED PRIORITY */}
                  <div className="promo-summary-row">
                    <div className="left">
                      <FiFlag />
                      <span>Priority Level</span>
                    </div>
                    <div className="right red">
                      High
                    </div>
                  </div>

                  <div className="promo-summary-row">
                    <div className="left">
                      <FiCalendar />
                      <span>Offer Duration</span>
                    </div>
                    <div className="right">
                      {product.start_date || "-"} → {product.end_date || "-"}
                    </div>
                  </div>

                  <div className="promo-summary-row">
                    <div className="left">
                      <FiMapPin />
                      <span>Applicable Cities</span>
                    </div>
                    <div className="right">
                      All Cities
                    </div>
                  </div>

                </div>

                {/* TIPS */}
                <div className="promo-tips">
                  <h5>💡 Quick Tips</h5>
                  <ul>
                    <li>Use attractive titles and headlines</li>
                    <li>Choose the right offer type</li>
                    <li>Set proper priority</li>
                    <li>Add banner for better conversion</li>
                  </ul>
                </div>

                {/* ACTIONS */}
                <div className="promo-actions">
                  <button className="promo-btn-primary" onClick={submit}>
                    Create Offer
                  </button>

                  <button className="promo-btn-secondary" onClick={resetForm}>
                    Reset Form
                  </button>
                </div>

              </div>

              {/* BANNER */}
              <div className="ui_card">
                <div className="ui_header">
                  <div className="ui_icon purple">
                    <FiImage />
                  </div>
                  <div className="ui_text">
                    <h4>Banner Image</h4>
                    <p>Upload a promotional banner (optional)</p>
                  </div>
                </div>

                <div
                  className="upload_box_new"
                  onClick={() => document.getElementById("bannerInput").click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async (e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];

                    if (!file) return;

                    if (!file.type.startsWith("image/")) {
                      alert("Only image files allowed");
                      return;
                    }

                    if (file.size > 5 * 1024 * 1024) {
                      alert("File must be less than 5MB");
                      return;
                    }

                    const base64 = await toBase64(file);

                    setProduct({
                      ...product,
                      banner: base64,
                    });
                  }}
                >
                  {!product.banner ? (
                    <>
                      <div className="upload_inner_icon">
                        <FiImage />
                      </div>
                      <p>Drag & drop image here</p>
                      <small>or click to browse</small>
                    </>
                  ) : (
                    <div className="preview_wrapper">
                      <img
                        src={product.banner}
                        alt="preview"
                        className="preview_image"
                      />

                      {/* REMOVE BUTTON */}
                      <button
                        className="remove_btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProduct({ ...product, banner: null });
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <input
                  id="bannerInput"
                  type="file"
                  accept="image/png, image/jpeg"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files[0];

                    if (!file) return;

                    if (!file.type.startsWith("image/")) {
                      alert("Only image files allowed");
                      return;
                    }

                    if (file.size > 5 * 1024 * 1024) {
                      alert("File must be less than 5MB");
                      return;
                    }

                    const base64 = await toBase64(file);

                    setProduct({
                      ...product,
                      banner: base64,
                    });
                  }}
                />

                <small className="upload_hint">
                  JPG, PNG up to 5MB recommended (16:9 ratio)
                </small>
              </div>

            </div>

          </div>
        </>
      )}


      {activeTab === "CATEGORY" && (
        <div className="promo-layout">


          {/* LEFT */}
          <div className="promo-left">

            {/* ================= SELECT CATEGORY ================= */}
            <div className="promo-card">
              <div className="promo-section-head">
                <div className="promo-icon-badge blue">
                  <FiSearch />
                </div>
                <div>
                  <h4>Select Category</h4>
                  <p>Search and select category(s)</p>
                </div>
              </div>

              <input
                className="promo-input"
                placeholder="Search category..."
                value={categorySearchKeyword || ""}
                onChange={(e) => searchCategory(e.target.value)}
              />

              {categorySearchKeyword && categoryResults?.length > 0 && (
                <div className="promo-results">
                  {categoryResults.map((c) => {
                    const isSelected = category?.category_ids?.includes(c.category_id);

                    return (
                      <div
                        key={c.category_id}
                        className={`promo-result ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          const already = category?.category_ids?.includes(c.category_id);

                          if (already) {
                            setCategory(prev => ({
                              ...prev,
                              category_ids: prev.category_ids.filter(id => id !== c.category_id)
                            }));
                          } else {
                            setCategory(prev => ({
                              ...prev,
                              category_ids: [...(prev.category_ids || []), c.category_id]
                            }));
                          }
                        }}
                      >
                        <div className="product_result_content">
                          <div className="product_name">
                            {c.category_name} (ID: {c.category_id})
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="promo-selected-list">
                {(category.category_ids || []).map((id) => {
                  const cat = categoryResults.find(c => c.category_id === id);
                  if (!cat) return null;

                  return (
                    <div key={id} className="promo-chip">
                      {cat.category_name}
                      <span
                        onClick={() =>
                          setCategory(prev => ({
                            ...prev,
                            category_ids: prev.category_ids.filter(cid => cid !== id)
                          }))
                        }
                      >
                        ✕
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ================= OFFER CONTENT ================= */}
            <div className="promo-card">

              <div className="promo-section-head">

                <div className="promo-icon-badge purple">
                  <FiEdit3 />
                </div>

                <div>
                  <h4>Offer Content</h4>
                  <p>Enter offer details</p>
                </div>

              </div>

              <div className="promo-grid-2">

                <input
                  className="promo-input"
                  placeholder="Title"
                  value={category.title || ""}
                  onChange={(e) =>
                    setCategory({
                      ...category,
                      title: e.target.value,
                    })
                  }
                />

                <input
                  className="promo-input"
                  placeholder="Headline"
                  value={category.headline || ""}
                  onChange={(e) =>
                    setCategory({
                      ...category,
                      headline: e.target.value,
                    })
                  }
                />

              </div>

              <textarea
                className="promo-textarea"
                placeholder="Description"
                value={category.description || ""}
                onChange={(e) =>
                  setCategory({
                    ...category,
                    description: e.target.value,
                  })
                }
                style={{ marginTop: "14px" }}
              />

            </div>



            {/* ================= OFFER SETTINGS ================= */}
            <div className="promo-grid-3">

              {/* OFFER TYPE */}
              <div className="promo-card compact">

                <div className="promo-section-head">

                  <div className="promo-icon-badge green">
                    <FiTag />
                  </div>

                  <div>
                    <h4>Offer Type</h4>
                    <p>Select discount type</p>
                  </div>

                </div>

                <select
                  className="promo-select"
                  value={category.offer_type || ""}
                  onChange={(e) =>
                    setCategory({
                      ...category,
                      offer_type: e.target.value,
                    })
                  }
                >
                  <option value="">Select type</option>
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FLAT">Flat</option>
                </select>

              </div>


              {/* OFFER VALUE */}
              <div className="promo-card compact">

                <div className="promo-section-head">

                  <div className="promo-icon-badge orange">
                    <FiPercent />
                  </div>

                  <div>
                    <h4>Offer Value</h4>
                    <p>Enter discount amount</p>
                  </div>

                </div>

                <input
                  type="number"
                  className="promo-input"
                  placeholder="Enter value"
                  value={category.offer_value || ""}
                  onChange={(e) =>
                    setCategory({
                      ...category,
                      offer_value: e.target.value,
                    })
                  }
                />

              </div>


              {/* PRIORITY */}
              <div className="promo-card compact">

                <div className="promo-section-head">

                  <div className="promo-icon-badge red">
                    <FiFlag />
                  </div>

                  <div>
                    <h4>Priority Level</h4>
                    <p>Select visibility priority</p>
                  </div>

                </div>

                <select
                  className="promo-select"
                  value={category.priority_level || "HIGH"}
                  onChange={(e) =>
                    setCategory({
                      ...category,
                      priority_level: e.target.value,
                    })
                  }
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>

              </div>

            </div>




            {/* ================= DATE ================= */}
            <div className="promo-card">

              <div className="promo-section-head">

                <div className="promo-icon-badge purple">
                  <FiCalendar />
                </div>

                <div className="promo-section-text">
                  <h4>Campaign Duration</h4>
                  <p>Select start and end date</p>
                </div>

              </div>

              <div className="promo-grid-2">

                <input
                  className="promo-input"
                  type="date"
                  value={category.start_date || ""}
                  onChange={(e) =>
                    setCategory({
                      ...category,
                      start_date: e.target.value,
                    })
                  }
                />

                <input
                  className="promo-input"
                  type="date"
                  value={category.end_date || ""}
                  onChange={(e) =>
                    setCategory({
                      ...category,
                      end_date: e.target.value,
                    })
                  }
                />

              </div>

            </div>



            {/* ================= CITIES ================= */}
            <div className="promo-card">

              <div className="promo-section-head">

                <div className="promo-icon-badge green">
                  <FiMapPin />
                </div>

                <div>
                  <h4>Applicable Cities</h4>
                  <p>Select or search cities</p>
                </div>

              </div>

              <input
                type="text"
                className="promo-input city-search"
                placeholder="Search city..."
              />

              <div className="scope_toggle">

                <button
                  type="button"
                  className={!category.applyToAll ? "active" : ""}
                  onClick={() =>
                    setCategory({
                      ...category,
                      applyToAll: false,
                    })
                  }
                >
                  Selected Cities
                </button>

                <button
                  type="button"
                  className={category.applyToAll ? "active" : ""}
                  onClick={() =>
                    setCategory({
                      ...category,
                      applyToAll: true,
                    })
                  }
                >
                  All Cities
                </button>

              </div>

              {!category.applyToAll && (
                <div className="city_grid">

                  {cities.map((city, index) => (
                    <div
                      key={index}
                      className={`city_chip ${category.cities.includes(city)
                          ? "selected"
                          : ""
                        }`}
                      onClick={() => {

                        if (category.cities.includes(city)) {

                          setCategory({
                            ...category,
                            cities: category.cities.filter(
                              (c) => c !== city
                            ),
                          });

                        } else {

                          setCategory({
                            ...category,
                            cities: [...category.cities, city],
                          });

                        }

                      }}
                    >
                      {city}
                    </div>
                  ))}

                </div>
              )}

            </div>

          </div>



          {/* ================= RIGHT SUMMARY ================= */}
          <div className="promo-right">

            <div className="promo-summary">

              {/* HEADER */}
              <div className="promo-summary-header">

                <div className="promo-icon-badge orange">
                  <FiTag />
                </div>

                <div>
                  <h4>Offer Summary</h4>
                  <p>Review your offer details before submission</p>
                </div>

              </div>

              {/* HERO */}
              <div className="promo-hero">

                <div>
                  <h3>Special Category Offer!</h3>

                  <p>
                    Amazing discounts on selected categories
                  </p>
                </div>

                <div className="promo-gift">
                  🎁
                </div>

              </div>

              {/* DETAILS */}
              <div className="promo-summary-list">

                <div className="promo-summary-row">

                  <div className="left">
                    <FiBox />
                    <span>Selected Categories</span>
                  </div>

                  <div className="right blue">
                    {(category.category_ids || []).length} Categories
                  </div>

                </div>

                <div className="promo-summary-row">

                  <div className="left">
                    <FiTag />
                    <span>Offer Type</span>
                  </div>

                  <div className="right green">
                    {category.offer_type || "-"}
                  </div>

                </div>

                <div className="promo-summary-row">

                  <div className="left">
                    <FiPercent />
                    <span>Offer Value</span>
                  </div>

                  <div className="right orange">
                    {category.offer_value || 0}%
                  </div>

                </div>

                <div className="promo-summary-row">

                  <div className="left">
                    <FiFlag />
                    <span>Priority Level</span>
                  </div>

                  <div className="right red">
                    {category.priority_level || "HIGH"}
                  </div>

                </div>

                <div className="promo-summary-row">

                  <div className="left">
                    <FiCalendar />
                    <span>Offer Duration</span>
                  </div>

                  <div className="right">
                    {category.start_date || "-"} →
                    {" "}
                    {category.end_date || "-"}
                  </div>

                </div>

                <div className="promo-summary-row">

                  <div className="left">
                    <FiMapPin />
                    <span>Applicable Cities</span>
                  </div>

                  <div className="right">
                    {category.applyToAll
                      ? "All Cities"
                      : `${category.cities.length} Selected`}
                  </div>

                </div>

              </div>

              {/* TIPS */}
              <div className="promo-tips">

                <h5>💡 Quick Tips</h5>

                <ul>
                  <li>Use attractive titles and headlines</li>
                  <li>Choose the right offer type</li>
                  <li>Set proper priority</li>
                  <li>Add banner for better conversion</li>
                </ul>

              </div>

              {/* ACTIONS */}
              <div className="promo-actions">

                <button
                  className="promo-btn-primary"
                  onClick={submit}
                >
                  Create Offer
                </button>

                <button
                  className="promo-btn-secondary"
                  onClick={resetForm}
                >
                  Reset Form
                </button>

              </div>

            </div>



            {/* ================= BANNER ================= */}
            <div className="ui_card">

              <div className="ui_header">

                <div className="ui_icon purple">
                  <FiImage />
                </div>

                <div className="ui_text">
                  <h4>Banner Image</h4>
                  <p>Upload a promotional banner (optional)</p>
                </div>

              </div>

              <div
                className="upload_box_new"

                onClick={() =>
                  document
                    .getElementById("categoryBannerInput")
                    .click()
                }

                onDragOver={(e) =>
                  e.preventDefault()
                }

                onDrop={async (e) => {

                  e.preventDefault();

                  const file =
                    e.dataTransfer.files[0];

                  if (!file) return;

                  if (
                    !file.type.startsWith("image/")
                  ) {
                    alert("Only image files allowed");
                    return;
                  }

                  const base64 =
                    await toBase64(file);

                  setCategory({
                    ...category,
                    banner: base64,
                  });

                }}
              >

                {!category.banner ? (
                  <>
                    <div className="upload_inner_icon">
                      <FiImage />
                    </div>

                    <p>
                      Drag & drop image here
                    </p>

                    <small>
                      or click to browse
                    </small>
                  </>
                ) : (
                  <div className="preview_wrapper">

                    <img
                      src={category.banner}
                      alt="preview"
                      className="preview_image"
                    />

                    <button
                      className="remove_btn"

                      onClick={(e) => {

                        e.stopPropagation();

                        setCategory({
                          ...category,
                          banner: null,
                        });

                      }}
                    >
                      ✕
                    </button>

                  </div>
                )}

              </div>

              <input
                id="categoryBannerInput"
                type="file"
                accept="image/png, image/jpeg"
                style={{ display: "none" }}

                onChange={async (e) => {

                  const file =
                    e.target.files[0];

                  if (!file) return;

                  const base64 =
                    await toBase64(file);

                  setCategory({
                    ...category,
                    banner: base64,
                  });

                }}
              />

              <small className="upload_hint">
                JPG, PNG up to 5MB recommended
                (16:9 ratio)
              </small>

            </div>

          </div>
        </div>

      )}


      {/* FESTIVAL SALE */}
      {activeTab === "FESTIVAL" && (
        <div className="promo-layout">

          {/* ================= LEFT ================= */}
          <div className="left_panel">

            {/* CONTENT */}
            <div className="ui_card">
              <div className="ui_header">
                <div className="ui_icon purple">
                  <FiEdit3 />
                </div>
                <div>
                  <h4>Content</h4>
                  <p>Festival promotion details</p>
                </div>
              </div>

              <div className="grid_2">

                {/* TITLE */}
                <div className="input_block">
                  <label>Festival Title</label>

                  <div className="ui_input">
                    <FiSearch className="ui_input_icon" />

                    <input
                      type="text"
                      placeholder="Enter festival title"
                      value={festival.title || ""}
                      onChange={(e) =>
                        setFestival({ ...festival, title: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* HEADLINE */}
                <div className="input_block">
                  <label>Headline</label>
                  <div className="ui_input">
                    <span className="ui_input_icon"><FiZap /></span>
                    <input
                      placeholder="Enter catchy headline"
                      value={festival.headline || ""}
                      onChange={(e) =>
                        setFestival({ ...festival, headline: e.target.value })
                      }
                    />
                  </div>
                </div>

              </div>

              {/* DESCRIPTION */}
              <div className="input_block">
                <label>Description</label>
                <div className="ui_textarea">
                  <span>≡</span>
                  <textarea
                    placeholder="Enter detailed description..."
                    value={festival.description || ""}
                    onChange={(e) =>
                      setFestival({ ...festival, description: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* PRODUCT SEARCH */}
            <div className="ui_card">
              <div className="ui_header">
                <div className="promo-icon-badge blue">
                  <FiSearch />
                </div>

                <div className="ui_text">
                  <h4>Category</h4>
                  <p>Select category & suppliers</p>
                </div>
              </div>

              <div className="ui_input">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search Category..."
                  value={festivalCategoryKeyword || ""}
                  onChange={(e) => setFestivalCategoryKeyword(e.target.value)}
                />
              </div>

              {festivalCategories.map(cat => (
                <div
                  key={cat.category_id}
                  className="result_item"
                  onClick={async () => {
                    const res = await axios.get(
                      `http://192.168.2.16:5000/api/v1/admin/subcategories/${cat.category_id}`
                    );

                    setFestivalSubcategories(res.data.data || []);
                    setFestivalProducts([]);
                  }}
                >
                  {cat.category_name}
                </div>
              ))}

              {festivalSubcategories.length > 0 && (
                <select
                  onChange={async (e) => {
                    const subId = e.target.value;

                    const res = await axios.get(
                      `http://192.168.2.16:5000/api/v1/admin/subcategory/${subId}/products`
                    );

                    setFestivalProducts(res.data.data || []);
                  }}
                >
                  <option value="">Select Subcategory</option>
                  {festivalSubcategories.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              )}

              {festivalProducts.length > 0 && (
                <div className="search_results">
                  {festivalProducts.map(p => {
                    const isSelected = selectedFestivalProducts.some(
                      item => item.product_id === p.product_id
                    );

                    return (
                      <div
                        key={p.product_id}
                        className={`result_item ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedFestivalProducts(prev =>
                              prev.filter(item => item.product_id !== p.product_id)
                            );
                          } else {
                            setSelectedFestivalProducts(prev => [...prev, p]);
                          }
                        }}
                      >
                        {p.product_name_english}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ================= OFFER SETTINGS ================= */}
            <div className="promo-grid-3">

              {/* OFFER TYPE */}
              <div className="promo-card compact">

                <div className="promo-section-head">

                  <div className="promo-icon-badge green">
                    <FiTag />
                  </div>

                  <div>
                    <h4>Offer Type</h4>
                    <p>Select discount type</p>
                  </div>

                </div>

                <select
                  className="promo-select"
                  value={festival.offer_type || ""}
                  onChange={(e) =>
                    setFestival({
                      ...festival,
                      offer_type: e.target.value,
                    })
                  }
                >
                  <option value="">Select type</option>
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FLAT">Flat</option>
                </select>

              </div>


              {/* OFFER VALUE */}
              <div className="promo-card compact">

                <div className="promo-section-head">

                  <div className="promo-icon-badge orange">
                    <FiPercent />
                  </div>

                  <div>
                    <h4>Offer Value</h4>
                    <p>Enter discount amount</p>
                  </div>

                </div>

                <input
                  type="number"
                  className="promo-input"
                  placeholder="Enter value"
                  value={festival.offer_value || ""}
                  onChange={(e) =>
                    setFestival({
                      ...festival,
                      offer_value: e.target.value,
                    })
                  }
                />

              </div>


              {/* PRIORITY */}
              <div className="promo-card compact">

                <div className="promo-section-head">

                  <div className="promo-icon-badge red">
                    <FiFlag />
                  </div>

                  <div>
                    <h4>Priority Level</h4>
                    <p>Select visibility priority</p>
                  </div>

                </div>

                <select
                  className="promo-select"
                  value={festival.priority_level || "HIGH"}
                  onChange={(e) =>
                    setFestival({
                      ...festival,
                      priority_level: e.target.value,
                    })
                  }
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>

              </div>

            </div>

{/* ================= DATE ================= */}
<div className="promo-card">

  <div className="promo-section-head">

    <div className="promo-icon-badge purple">
      <FiCalendar />
    </div>

    <div className="promo-section-text">
      <h4>Campaign Duration</h4>
      <p>Select start and end date</p>
    </div>

  </div>

  <div className="promo-date-row">

    <input
      className="promo-input"
      type="date"
      value={product.start_date || ""}
      onChange={(e) =>
        setProduct({
          ...product,
          start_date: e.target.value,
        })
      }
    />

    <input
      className="promo-input"
      type="date"
      value={product.end_date || ""}
      onChange={(e) =>
        setProduct({
          ...product,
          end_date: e.target.value,
        })
      }
    />

  </div>

</div>

            {/* ================= COUNTRIES ================= */}
            <div className="promo-card">

              <div className="promo-section-head">

                <div className="promo-icon-badge green">
                  <FiMapPin />
                </div>
                <div>
                  <h4>Select Countries</h4>
                  <p>Choose target countries</p>
                </div>

              </div>

              <input
                type="text"
                className="promo-input city-search"
                placeholder="Search country..."
              />

              <div className="scope_toggle">

                <button
                  type="button"
                  className={!festival.applyToAll ? "active" : ""}
                  onClick={() =>
                    setFestival({
                      ...festival,
                      applyToAll: false,
                    })
                  }
                >
                  Selected Countries
                </button>

                <button
                  type="button"
                  className={festival.applyToAll ? "active" : ""}
                  onClick={() =>
                    setFestival({
                      ...festival,
                      applyToAll: true,
                    })
                  }
                >
                  All Countries
                </button>

              </div>

              {!festival.applyToAll && (
                <div className="city_grid">

                  {countries.map((country, i) => (
                    <div
                      key={i}
                      className={`city_chip ${festival.countries.includes(country)
                          ? "selected"
                          : ""
                        }`}
                      onClick={() => {

                        if (festival.countries.includes(country)) {

                          setFestival({
                            ...festival,
                            countries: festival.countries.filter(
                              (c) => c !== country
                            ),
                          });

                        } else {

                          setFestival({
                            ...festival,
                            countries: [...festival.countries, country],
                          });

                        }

                      }}
                    >
                      {country}
                    </div>
                  ))}

                </div>
              )}

            </div>

          </div>


          {/* ================= RIGHT SUMMARY ================= */}
          <div className="promo-right">

            <div className="promo-summary">

              {/* HEADER */}
              <div className="promo-summary-header">

                <div className="promo-icon-badge orange">
                  <FiTag />
                </div>

                <div>
                  <h4>Festival Summary</h4>
                  <p>Review your festival offer details before submission</p>
                </div>

              </div>

              {/* HERO */}
              <div className="promo-hero">

                <div>
                  <h3>{festival.title || "Festival Sale!"}</h3>

                  <p>
                    {festival.headline || "Amazing festival discounts available"}
                  </p>
                </div>

                <div className="promo-gift">
                  🎉
                </div>

              </div>

              {/* DETAILS */}
              <div className="promo-summary-list">

                <div className="promo-summary-row">

                  <div className="left">
                    <FiBox />
                    <span>Selected Products</span>
                  </div>

                  <div className="right blue">
                    {selectedFestivalProducts.length} Products
                  </div>

                </div>

                <div className="promo-summary-row">

                  <div className="left">
                    <FiTag />
                    <span>Offer Type</span>
                  </div>

                  <div className="right green">
                    {festival.offer_type || "-"}
                  </div>

                </div>

                <div className="promo-summary-row">

                  <div className="left">
                    <FiPercent />
                    <span>Offer Value</span>
                  </div>

                  <div className="right orange">
                    {festival.offer_value || 0}%
                  </div>

                </div>

                <div className="promo-summary-row">

                  <div className="left">
                    <FiFlag />
                    <span>Priority Level</span>
                  </div>

                  <div className="right red">
                    {festival.priority_level || "HIGH"}
                  </div>

                </div>

                <div className="promo-summary-row">

                  <div className="left">
                    <FiCalendar />
                    <span>Offer Duration</span>
                  </div>

                  <div className="right">
                    {festival.start_date || "-"} →{" "}
                    {festival.end_date || "-"}
                  </div>

                </div>

                <div className="promo-summary-row">

                  <div className="left">
                    <FiMapPin />
                    <span>Applicable Countries</span>
                  </div>

                  <div className="right">
                    {festival.applyToAll
                      ? "All Countries"
                      : `${festival.countries.length} Selected`}
                  </div>

                </div>

              </div>

              {/* TIPS */}
              <div className="promo-tips">

                <h5>💡 Quick Tips</h5>

                <ul>
                  <li>Use attractive festival titles</li>
                  <li>Add catchy headlines for better reach</li>
                  <li>Upload high quality banners</li>
                  <li>Choose proper offer value</li>
                </ul>

              </div>

              {/* ACTIONS */}
              <div className="promo-actions">

                <button
                  className="promo-btn-primary"
                  onClick={submit}
                >
                  Launch Festival Sale
                </button>

                <button
                  className="promo-btn-secondary"
                  onClick={resetForm}
                >
                  Reset Form
                </button>

              </div>

            </div>


            {/* ================= Homepage Banners ================= */}
            <div className="ui_card">
              <div className="ui_header">
                <div className="ui_icon purple">
                  <FiImage />
                </div>
                <div>
                  <h4>Homepage Banners</h4>
                  <p>Upload homepage promotional banners</p>
                </div>
              </div>

              <div
                className="upload_box_new"
                onClick={() =>
                  document.getElementById("homepageBannerInput").click()
                }
                onDragOver={(e) => e.preventDefault()}
                onDrop={async (e) => {
                  e.preventDefault();

                  const files = Array.from(e.dataTransfer.files || []);
                  if (files.length === 0) return;

                  const validFiles = files.filter(
                    (file) => file.size <= 5 * 1024 * 1024
                  );

                  if (validFiles.length !== files.length) {
                    alert("Some files skipped (max 5MB allowed)");
                  }

                  const base64Files = await Promise.all(
                    validFiles.map((file) => toBase64(file))
                  );

                  setFestival({
                    ...festival,
                    homepage_banners: [
                      ...(festival.homepage_banners || []),
                      ...base64Files,
                    ],
                  });
                }}
              >
                {festival.homepage_banners?.length > 0 ? (
                  <div className="preview_grid">
                    {festival.homepage_banners.map((img, index) => (
                      <div key={index} className="preview_item">
                        <img src={img} alt="preview" />
                        <span
                          className="remove_btn_small"
                          onClick={(e) => {
                            e.stopPropagation();
                            const updated = festival.homepage_banners.filter(
                              (_, i) => i !== index
                            );
                            setFestival({
                              ...festival,
                              homepage_banners: updated,
                            });
                          }}
                        >
                          ×
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="upload_inner_icon">
                      <FiImage />
                    </div>
                    <p>Drag & drop image here</p>
                    <small>or click to browse</small>
                  </>
                )}
              </div>

              <input
                id="homepageBannerInput"
                type="file"
                multiple
                accept="image/png, image/jpeg"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length === 0) return;

                  const validFiles = files.filter(
                    (file) => file.size <= 5 * 1024 * 1024
                  );

                  const base64Files = await Promise.all(
                    validFiles.map((file) => toBase64(file))
                  );

                  setFestival({
                    ...festival,
                    homepage_banners: [
                      ...(festival.homepage_banners || []),
                      ...base64Files,
                    ],
                  });
                }}
              />

              <small className="upload_hint">
                JPG, PNG up to 5MB recommended (16:9 ratio)
              </small>
            </div>
            {/* CATEGORY BANNERS */}
            <div className="ui_card">
              <div className="ui_header">
                <div className="ui_icon purple">
                  <FiImage />
                </div>
                <div>
                  <h4>Category Banners (Optional)</h4>
                  <p>Upload category banners</p>
                </div>
              </div>

              <div
                className="upload_box_new"
                onClick={() =>
                  document.getElementById("categoryBannerInput").click()
                }
                onDragOver={(e) => e.preventDefault()}
                onDrop={async (e) => {
                  e.preventDefault();

                  const files = Array.from(e.dataTransfer.files || []);
                  if (files.length === 0) return;

                  const validFiles = files.filter(
                    (file) => file.size <= 5 * 1024 * 1024
                  );

                  const base64Files = await Promise.all(
                    validFiles.map((file) => toBase64(file))
                  );

                  setFestival({
                    ...festival,
                    category_banners: [
                      ...(festival.category_banners || []),
                      ...base64Files,
                    ],
                  });
                }}
              >
                {festival.category_banners?.length > 0 ? (
                  <div className="preview_grid">
                    {festival.category_banners.map((img, index) => (
                      <div key={index} className="preview_item">
                        <img src={img} alt="preview" />
                        <span
                          className="remove_btn_small"
                          onClick={(e) => {
                            e.stopPropagation();
                            const updated = festival.category_banners.filter(
                              (_, i) => i !== index
                            );
                            setFestival({
                              ...festival,
                              category_banners: updated,
                            });
                          }}
                        >
                          ×
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="upload_inner_icon">
                      <FiImage />
                    </div>
                    <p>Drag & drop image here</p>
                    <small>or click to browse</small>
                  </>
                )}
              </div>

              <input
                id="categoryBannerInput"
                type="file"
                multiple
                accept="image/png, image/jpeg"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length === 0) return;

                  const validFiles = files.filter(
                    (file) => file.size <= 5 * 1024 * 1024
                  );

                  const base64Files = await Promise.all(
                    validFiles.map((file) => toBase64(file))
                  );

                  setFestival({
                    ...festival,
                    category_banners: [
                      ...(festival.category_banners || []),
                      ...base64Files,
                    ],
                  });
                }}
              />

              <small className="upload_hint">
                JPG, PNG up to 5MB recommended (16:9 ratio)
              </small>
            </div>

















          </div>

        </div>


      )}





      {/* ACTIONS */}
      <div className="action_row">
        <button className="submit_btn" onClick={resetForm}>Cancel</button>
        <button className="submit_btn" onClick={submit}>
          {activeTab === "FESTIVAL" ? "Launch Sale" : "Create Offer"}
        </button>
      </div>

    </div>

  );
};

export default AdminPromotions;