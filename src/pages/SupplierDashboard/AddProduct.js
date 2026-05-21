

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import BulkUpload from "./BulkUpload";
const API_URL = "http://192.168.2.22:5000/api";

const AddProduct = () => {
  const supplierIdFromLS = localStorage.getItem("supplier_id") || "";
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const { t, i18n } = useTranslation();

  /* ================= FORM STATE ================= */
  const [formData, setFormData] = useState({
    supplier_id: supplierIdFromLS,
    branch_id: "",
    store_id: "",
    product_name_english: "",
    product_name_arabic: "",
    category_id: "",
    sub_category_id: "",
    unit_of_measure: "",
    currency: "QAR ",
    price_per_unit: "",
    minimum_order_quantity: "",
    stock_availability: "",
    expiry_date: "",
    expiry_time: "",
    shelf_life: "",
    description: "",
  });

  /* ================= IMAGE UPLOAD ================= */
  const [images, setImages] = useState([]);
  const bulkInputRef = useRef(null);

  /* ================= DROPDOWNS ================= */
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  /* ================= IMAGE HANDLERS ================= */
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const mapped = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...mapped]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= BULK UPLOAD ================= */
  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!allowed.includes(file.type)) {
      alert("Please upload CSV or Excel file only");
      return;
    }

    console.log("Bulk upload file:", file);
    // API hook already prepared
  };

  /* ================= LOAD DROPDOWNS ================= */
  // useEffect(() => {
  //   axios.get(`${API_URL}/products/companies`).then((res) => {
  //     const allCompanies = res.data || [];

  //     // 🔒 show only logged-in supplier company
  //     const filtered = supplierIdFromLS
  //       ? allCompanies.filter(
  //           (c) => String(c.supplier_id) === String(supplierIdFromLS)
  //         )
  //       : [];

  //     setCompanies(filtered);
  //   });

  //   axios.get(`${API_URL}/products/categories`).then((res) => {
  //     setCategories(res.data || []);
  //   });

  //   if (supplierIdFromLS) {
  //     loadBranches(supplierIdFromLS);
  //     loadStores(supplierIdFromLS);
  //   }
  // }, []);


  useEffect(() => {
  const supplierId = localStorage.getItem("linked_id");

  // ---------- Companies ----------
  axios.get(`${API_URL}/products/companies`).then((res) => {
    const allCompanies = res.data || [];

    const filtered = supplierId
      ? allCompanies.filter(
          (c) => String(c.supplier_id) === String(supplierId)
        )
      : [];

    setCompanies(filtered);
  });

  // ---------- Categories ----------
  axios.get(`${API_URL}/products/categories`).then((res) => {
    setCategories(res.data || []);
  });

  // ---------- Branches & Stores ----------
  if (supplierId) {
    loadBranches(supplierId);
    loadStores(supplierId);
  }
}, []);


  const loadBranches = async (supplier_id) => {
    const res = await axios.get(
      `${API_URL}/products/branches?supplier_id=${supplier_id}`
    );
    setBranches(res.data || []);
  };

  const loadStores = async (supplier_id) => {
    const res = await axios.get(
      `${API_URL}/products/stores?supplier_id=${supplier_id}`
    );
    setStores(res.data || []);
  };

  const loadSubcategories = async (categoryId) => {
    if (!categoryId) return setSubcategories([]);
    const res = await axios.get(
      `${API_URL}/products/subcategories?category_id=${categoryId}`
    );
    setSubcategories(res.data || []);
  };

  /* ================= TRANSLATE EN → AR ================= */
  useEffect(() => {
    if (!formData.product_name_english.trim()) {
      setFormData((p) => ({ ...p, product_name_arabic: "" }));
      return;
    }

    const t = setTimeout(async () => {
      try {
        const res = await axios.post(`${API_URL}/products/translate`, {
          text: formData.product_name_english,
        });
        setFormData((p) => ({
          ...p,
          product_name_arabic: res.data?.arabic || "",
        }));
      } catch {}
    }, 600);

    return () => clearTimeout(t);
  }, [formData.product_name_english]);

  /* ================= INPUT HANDLER ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((p) => ({ ...p, [name]: value }));

    if (name === "supplier_id") {
      localStorage.setItem("supplier_id", value);
      loadBranches(value);
      loadStores(value);
    }

    if (name === "category_id") {
      loadSubcategories(value);
      setFormData((p) => ({ ...p, sub_category_id: "" }));
    }
  };

  /* ================= SAVE PRODUCT ================= */
  // const handleSubmit = async () => {
  //   if (!formData.product_name_english.trim()) {
  //     alert("Product name is required");
  //     return;
  //   }

  //   try {
  //     const payload = new FormData();

  //     Object.entries(formData).forEach(([k, v]) => {
  //       payload.append(k, v || "");
  //     });

  //     images.forEach((img) => {
  //       payload.append("product_images", img.file);
  //     });

  //     await axios.post(`${API_URL}/products`, payload, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });

  //     alert("✅ Product added successfully");

  //     setFormData({
  //       supplier_id: "",
  //       branch_id: "",
  //       store_id: "",
  //       product_name_english: "",
  //       product_name_arabic: "",
  //       category_id: "",
  //       sub_category_id: "",
  //       unit_of_measure: "",
  //       currency: "QAR ",
  //       price_per_unit: "",
  //       minimum_order_quantity: "",
  //       stock_availability: "",
  //       expiry_date: "",
  //       expiry_time: "",
  //       shelf_life: "",
  //       description: "",
  //     });
  //     setImages([]);
  //   } catch (err) {
  //     console.error(err);
  //     alert("❌ Failed to save product");
  //   }
  // };


  const handleSubmit = async () => {
  if (!formData.product_name_english.trim()) {
    alert(t("product_name_required"));
    return;
  }

  const supplierId = localStorage.getItem("linked_id");
  if (!supplierId) {
    alert(t("supplier_not_logged"));
    return;
  }

  try {
    const payload = new FormData();

    // 🔥 inject supplier_id explicitly
    payload.append("supplier_id", supplierId);

    Object.entries(formData).forEach(([k, v]) => {
      payload.append(k, v || "");
    });

    images.forEach((img) => {
      payload.append("product_images", img.file);
    });

    await axios.post(`${API_URL}/products/`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert(t("product_added_success"));

    setFormData({
      branch_id: "",
      store_id: "",
      product_name_english: "",
      product_name_arabic: "",
      category_id: "",
      sub_category_id: "",
      unit_of_measure: "",
      currency: "QAR ",
      price_per_unit: "",
      minimum_order_quantity: "",
      stock_availability: "",
      expiry_date: "",
      expiry_time: "",
      shelf_life: "",
      description: "",
    });

    setImages([]);

  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "❌ Failed to save product");
  }
};

  /* ================= JSX (UNCHANGED DESIGN) ================= */
  return (
    <div className="dashboard_page add_product_page">
      {/* HEADER */}
      <div className="page_header glass">
        <div>
          <h2>{t("add_product")}</h2>
          <p className="sub_text">{t("manage_product_info")}</p>
        </div>

        <button
          className="bulk_btn"
          onClick={() => setShowBulkUpload((s) => !s)}
        >
          <i className="fas fa-upload"></i> {t("bulk_upload")}
        </button>
      </div>

      {/* 🔥 BULK UPLOAD (ADDED) */}
      {showBulkUpload && (
        <div style={{ marginBottom: 20 }}>
          <BulkUpload
            supplierId={localStorage.getItem("linked_id")}
            branchId={formData.branch_id}
            storeId={formData.store_id}
            onDone={() => {
              setShowBulkUpload(false);
              alert("✅ Bulk upload completed");
            }}
          />
        </div>
      )}

      {/* BUSINESS */}
      <div className="section_card soft">
        <h4>{t("business_details")}</h4>

        <div className="form_grid three">
          <div className="form_group">
            <label>{t("company_name")}</label>
            <input
              type="text"
              value={
                i18n.language === "ar"
                  ? companies[0]?.company_name_arabic || companies[0]?.company_name_english
                  : companies[0]?.company_name_english
              }
              readOnly
              className="readonly_input"
            />
          </div>

          <div className="form_group">
            <label>{t("supbranch")}</label>
            <select name="branch_id" value={formData.branch_id} onChange={handleChange}>
              <option value="">{t("select_branch")}</option>
              {branches.map((b) => (
                <option key={b.branch_id} value={b.branch_id}>
                  {b.branch_name_english}
                </option>
              ))}
            </select>
          </div>

          <div className="form_group">
            <label>{t("supstore")}</label>
            <select name="store_id" value={formData.store_id} onChange={handleChange}>
              <option value="">{t("select_store")}</option>
              {stores.map((s) => (
                <option key={s.store_id} value={s.store_id}>
                  {s.store_name_english}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="section_card soft">
        <h4>{t("product_details")}</h4>

        <div className="form_grid three">
          <div className="form_group">
            <label>{t("product_name_en")}</label>
            <input
              name="product_name_english"
              value={formData.product_name_english}
              onChange={handleChange}
            />
          </div>

          <div className="form_group">
            <label>{t("product_name_ar")}</label>
            <input value={formData.product_name_arabic} readOnly />
          </div>

          <div className="form_group">
            <label>{t("category")}</label>
            <select name="category_id" value={formData.category_id} onChange={handleChange}>
              <option value="">{t("select_category")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form_grid three">
          <div className="form_group">
            <label>{t("sub_category")}</label>
            <select name="sub_category_id" value={formData.sub_category_id} onChange={handleChange}>
              <option value="">{t("select_subcategory")}</option>
              {subcategories.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="form_group">
            <label>{t("unit_of_measure")}</label>
            <select name="unit_of_measure" value={formData.unit_of_measure} onChange={handleChange}>
              <option value="">{t("select_unit")}</option>
              <option value="Kg">Kg</option>
              <option value="Piece">Piece</option>
              <option value="Box">Box</option>
            </select>
          </div>

          <div className="form_group full">
            <label>{t("description")}</label>
            <textarea
              rows="2"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div className="section_card soft">
        <h4>{t("pricing_availability")}</h4>

        <div className="form_grid four">
          <div className="form_group">
            <label>{t("Supcurrency")}</label>
            <select name="currency" value={formData.currency} onChange={handleChange}>
              <option>QAR </option>
            </select>
          </div>

          <div className="form_group">
            <label>{t("price_per_unit")}</label>
            <input name="price_per_unit" type="number" value={formData.price_per_unit} onChange={handleChange} />
          </div>

          <div className="form_group">
            <label>{t("minimum_order_quantity")}</label>
            <input name="minimum_order_quantity" type="number" value={formData.minimum_order_quantity} onChange={handleChange} />
          </div>

          <div className="form_group">
            <label>{t("stock_available")}</label>
            <input name="stock_availability" type="number" value={formData.stock_availability} onChange={handleChange} />
          </div>
        </div>

        <div className="form_grid four">
          <div className="form_group">
            <label>{t("expiry_date")}</label>
            <input name="expiry_date" type="date" value={formData.expiry_date} onChange={handleChange} />
          </div>

          <div className="form_group">
            <label>{t("expiry_time")}</label>
            <input name="expiry_time" type="time" value={formData.expiry_time} onChange={handleChange} />
          </div>

          <div className="form_group">
            <label>{t("shelf_life")}</label>
            <input name="shelf_life" type="number" value={formData.shelf_life} onChange={handleChange} />
          </div>
        </div>
      </div>

      {/* IMAGES */}
      <div className="section_card soft">
        <h4>{t("product_images")}</h4>

        <label className="image_drop_zone fancy">
          <input type="file" multiple hidden accept="image/*" onChange={handleImageUpload} />
          <i className="fas fa-cloud-upload-alt"></i>
          <p>{t("drag_drop_images")}</p>
          <small>{t("click_upload")}</small>
        </label>

        {images.length > 0 && (
          <div className="image_preview_grid">
            {images.map((img, i) => (
              <div key={i} className="image_preview">
                <img src={img.preview} alt="" />
                <button onClick={() => removeImage(i)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="form_footer">
        <button className="btn_cancel">{t("cancel")}</button>
        <button className="btn_save glow" onClick={handleSubmit}>
          {t("save_product")}
        </button>
      </div>
    </div>
  );
};

export default AddProduct;








