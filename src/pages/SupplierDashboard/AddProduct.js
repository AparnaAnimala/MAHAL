// import React, { useState, useRef } from "react";

// const AddProduct = () => {
//   /* ================= IMAGE UPLOAD ================= */
//   const [images, setImages] = useState([]);

//   const handleImageUpload = (e) => {
//     const files = Array.from(e.target.files);

//     const newImages = files.map((file) => ({
//       file,
//       preview: URL.createObjectURL(file),
//     }));

//     setImages((prev) => [...prev, ...newImages]);
//   };

//   const removeImage = (index) => {
//     setImages(images.filter((_, i) => i !== index));
//   };

//   /* ================= BULK UPLOAD ================= */
//   const bulkInputRef = useRef(null);

//   const handleBulkUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const allowedTypes = [
//       "text/csv",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       "application/vnd.ms-excel",
//     ];

//     if (!allowedTypes.includes(file.type)) {
//       alert("Please upload CSV or Excel file only");
//       return;
//     }

//     console.log("Bulk file selected:", file);

//     // 🔥 API integration later
//     // const formData = new FormData();
//     // formData.append("file", file);
//     // axios.post("/api/products/bulk-upload", formData);
//   };

//   return (
//     <div className="dashboard_page add_product_page">

//       {/* ================= PAGE HEADER ================= */}
//       <div className="page_header glass">
//         <div>
//           <h2>Add New Product</h2>
//           <p className="sub_text">Manage your product information</p>
//         </div>

//         <>
//           <button
//             className="bulk_btn"
//             onClick={() => bulkInputRef.current.click()}
//           >
//             <i className="fas fa-upload"></i> Bulk Upload
//           </button>

//           <input
//             type="file"
//             ref={bulkInputRef}
//             hidden
//             accept=".csv,.xlsx"
//             onChange={handleBulkUpload}
//           />
//         </>
//       </div>

//       {/* ================= BUSINESS DETAILS ================= */}
//       <div className="section_card soft">
//         <h4>Business Details</h4>

//         <div className="form_grid three">
//           <div className="form_group">
//             <label>Company Name</label>
//             <select>
//               <option>VK18</option>
//             </select>
//           </div>

//           <div className="form_group">
//             <label>Branch</label>
//             <select>
//               <option>Select Branch</option>
//             </select>
//           </div>

//           <div className="form_group">
//             <label>Store</label>
//             <select>
//               <option>Select Store</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* ================= PRODUCT DETAILS ================= */}
//       <div className="section_card soft">
//         <h4>Product Details</h4>

//         <div className="form_grid three">
//           <div className="form_group">
//             <label>Product Name (EN)</label>
//             <input type="text" />
//           </div>

//           <div className="form_group">
//             <label>Product Name (AR)</label>
//             <input type="text" />
//           </div>

//           <div className="form_group">
//             <label>Category</label>
//             <select>
//               <option>Select Category</option>
//             </select>
//           </div>
//         </div>

//         <div className="form_grid three">
//           <div className="form_group">
//             <label>Sub Category</label>
//             <select>
//               <option>Select Subcategory</option>
//             </select>
//           </div>

//           <div className="form_group">
//             <label>Unit of Measure</label>
//             <select>
//               <option>Select Unit</option>
//             </select>
//           </div>

//           <div className="form_group full">
//             <label>Description</label>
//             <textarea rows="2" className="resizable_textarea" />
//           </div>
//         </div>
//       </div>

//       {/* ================= PRICING & AVAILABILITY ================= */}
//       <div className="section_card soft">
//         <h4>Pricing & Availability</h4>

//         <div className="form_grid four">
//           <div className="form_group">
//             <label>Currency</label>
//             <select>
//               <option>QAR </option>
//             </select>
//           </div>

//           <div className="form_group">
//             <label>Price per Unit</label>
//             <input type="number" />
//           </div>

//           <div className="form_group">
//             <label>Minimum Order Qty</label>
//             <input type="number" />
//           </div>

//           <div className="form_group">
//             <label>Stock Available</label>
//             <input type="number" />
//           </div>
//         </div>

//         <div className="form_grid four">
//           <div className="form_group">
//             <label>Expiry Date</label>
//             <input type="date" />
//           </div>

//           <div className="form_group">
//             <label>Expiry Time</label>
//             <input type="time" />
//           </div>

//           <div className="form_group">
//             <label>Shelf Life (days)</label>
//             <input type="number" />
//           </div>
//         </div>
//       </div>

//       {/* ================= PRODUCT IMAGES ================= */}
//       <div className="section_card soft">
//         <h4>Product Images</h4>

//         <label className="image_drop_zone fancy">
//           <input
//             type="file"
//             accept="image/*"
//             multiple
//             hidden
//             onChange={handleImageUpload}
//           />
//           <i className="fas fa-cloud-upload-alt"></i>
//           <p>Drag & drop images here</p>
//           <small>or click to upload</small>
//         </label>

//         {images.length > 0 && (
//           <div className="image_preview_grid">
//             {images.map((img, index) => (
//               <div key={index} className="image_preview">
//                 <img src={img.preview} alt="preview" />
//                 <button onClick={() => removeImage(index)}>
//                   <i className="fas fa-times"></i>
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* ================= ACTION BUTTONS ================= */}
//       <div className="form_footer">
//         <button className="btn_cancel">Cancel</button>
//         <button className="btn_save glow">Save Product</button>
//       </div>

//     </div>
//   );
// };

// export default AddProduct;




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













// import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
// import "../css/product.css";
// import "@fortawesome/fontawesome-free/css/all.min.css";
// import axios from "axios";
// import BulkUpload from "./BulkUpload";
// import { FiSearch } from "react-icons/fi";

// const API_URL = "http://192.168.2.22:5000/api"; // existing value from your project

// const speak = (text) => {
//   if (typeof window === "undefined" || !window.speechSynthesis) return;
//   window.speechSynthesis.cancel();
//   const msg = new SpeechSynthesisUtterance(text);
//   msg.lang = "en-US";
//   window.speechSynthesis.speak(msg);
// };

// const ProductForm = ({goToSubmenu}) => {
//   const [formData, setFormData] = useState({
//     supplier_id: "",
//     branch_id: "",
//     store_id: "",
//     productNameEnglish: "",
//     productNameArabic: "",
//     categoryId: "",
//     subCategoryId: "",
//     unitOfMeasure: "",
//     pricePerUnit: "",
//     currency: "QAR ",
//     minimumOrderQuantity: "",
//     stockAvailability: "",
//     // productImages: null, // File object
//     // productImagesPreview: null, // object URL or base64
//     productImages: [],                 // multiple files
//     productImagesPreview: [],          // multiple preview URLs
//     expiryDate: "",
//     shelfLife: "",
//     expiryTime: "",
//     description: "",
//   });

//   const bulkBtnRef = useRef(null);
//   const [bulkRect, setBulkRect] = useState(null);

//   const [highlightBulk, setHighlightBulk] = useState(false);
//   const [bulkGuideOpen, setBulkGuideOpen] = useState(false);
//   const previewUrlRef = useRef(null);

//   const [isEditing, setIsEditing] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [products, setProducts] = useState([]);
//   const [searchVisible, setSearchVisible] = useState(false);
//   const [isTranslating, setIsTranslating] = useState(false);

//   const [companies, setCompanies] = useState([]);
//   const [branches, setBranches] = useState([]);
//   const [stores, setStores] = useState([]);

//   const [categories, setCategories] = useState([]);
//   const [subcategories, setSubcategories] = useState([]);

//   const [showBulkUpload, setShowBulkUpload] = useState(false);

//   const [popup, setPopup] = useState({
//     visible: false,
//     text: "",
//     x: 0,
//     y: 0,
//   });

//   const showPopup = (text, target) => {
//     if (!target || !target.getBoundingClientRect) return;
//     const rect = target.getBoundingClientRect();
//     setPopup({
//       visible: true,
//       text,
//       x: rect.left + window.scrollX,
//       y: rect.top + window.scrollY - 40,
//     });
//   };

//   const hidePopup = () => {
//     setPopup((p) => ({ ...p, visible: false }));
//   };

//   const guidanceText = {
//     supplier_id: "Select the company supplying this product.",
//     branch_id: "Choose the branch where this product belongs.",
//     store_id: "Choose the store for this product.",
//     productNameEnglish: "Enter the product name in English.",
//     productNameArabic: "The Arabic name is auto-translated.",
//     categoryId: "Select the product category.",
//     subCategoryId: "Select the subcategory for this product.",
//     unitOfMeasure: "Choose the unit used for selling this product.",
//     currency: "Select the currency for the price.",
//     pricePerUnit: "Enter the price of a single unit.",
//     minimumOrderQuantity: "Enter the minimum order quantity.",
//     stockAvailability: "Enter the available stock count.",
//     expiryDate: "Select the expiry date.",
//     shelfLife: "Enter the shelf life in days.",
//     expiryTime: "Enter expiry time if needed.",
//     description: "Describe the product details.",
//     productImages: "Upload one or more product images.",
//     searchBox: "Type keywords to search products.",
//     bulkUploadToggle: "Open Bulk Upload to add many products at once using an Excel file and a ZIP of images.",
//     saveButton: "Click to save this product. If editing, this updates the existing product.",
//     clearButton: "Clear resets the form to default values.",
//   };

//   const handleFieldFocus = (field, target, type) => {
//     // if (type === "date") return; // skip dates if needed
//     if (guidanceText[field]) {
//       speak(guidanceText[field]);
//       showPopup(guidanceText[field], target);
//     }
//   };

//   // helper to attach guidance handlers to inputs/selects/buttons
//   const guidanceProps = (field) => ({
//     onFocus: (e) => handleFieldFocus(field, e.target, e.target.type),

//     onMouseEnter: (e) => {
//       if (e.target.tagName !== "SELECT") {
//         handleFieldFocus(field, e.target, e.target.type);
//       }
//     },

//     onMouseLeave: hidePopup,
//     onBlur: hidePopup,

//     onInput: (e) => {
//       if (e.target.tagName !== "SELECT") hidePopup();
//     },

//     "aria-describedby": popup.visible ? `guidance-${field}` : undefined,
//   });


//   const isAdmin = useMemo(() => {
//     try {
//       const role = (localStorage.getItem("user_role") || "").toLowerCase();
//       const isAdminFlag = (localStorage.getItem("is_admin") || "").toLowerCase();
//       return role === "admin" || isAdminFlag === "true";
//     } catch (e) {
//       return false;
//     }
//   }, []);

//   // ---------- Helpers that call backend directly ----------
//   const fetchProducts = async (search = "") => {
//     const params = search ? `?search=${encodeURIComponent(search)}` : "";
//     const res = await axios.get(`${API_URL}/products/${params}`);
//     return Array.isArray(res.data) ? res.data : res.data.data || [];
//   };

//   const addProduct = async (formPayload) => {
//     return axios.post(`${API_URL}/products`, formPayload, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//   };

//   const updateProduct = async (id, formPayload) => {
//     return axios.put(`${API_URL}/products/${id}`, formPayload, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//   };

//   const deleteProduct = async (id) => {
//     return axios.delete(`${API_URL}/products/${id}`);
//   };

//   // 🏢 Fetch Companies
//   // const loadCompanies = async () => {
//   //   try {
//   //     const res = await axios.get(`${API_URL}/products/companies`);
//   //     setCompanies(Array.isArray(res.data) ? res.data : res.data.data || []);
//   //   } catch (error) {
//   //     console.error("Failed to fetch companies:", error);
//   //   }
//   // };

//   // // 🏬 Fetch Branches
//   // const loadBranches = async (supplier_id = "") => {
//   //   try {
//   //     const res = await axios.get(`${API_URL}/products/branches?supplier_id=${supplier_id}`);
//   //     setBranches(Array.isArray(res.data) ? res.data : res.data.data || []);
//   //   } catch (error) {
//   //     console.error("Failed to fetch branches:", error);
//   //     setBranches([]);
//   //   }
//   // };

//   // // 🏪 Fetch Stores
//   // const loadStores = async (supplier_id = "") => {
//   //   try {
//   //     const res = await axios.get(`${API_URL}/products/stores?supplier_id=${supplier_id}`);
//   //     setStores(Array.isArray(res.data) ? res.data : res.data.data || []);
//   //   } catch (error) {
//   //     console.error("Failed to fetch stores:", error);
//   //     setStores([]);
//   //   }
//   // };

//   const loadBranches = useCallback(async () => {
//     try {
//       const token = localStorage.getItem("token");

//       const res = await axios.get(`${API_URL}/products/branches`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setBranches(Array.isArray(res.data) ? res.data : []);
//     } catch (error) {
//       console.error("Failed to fetch branches:", error);
//       setBranches([]);
//     }
//   }, []);

//   const loadStores = useCallback(async () => {
//     try {
//       const token = localStorage.getItem("token");

//       const res = await axios.get(`${API_URL}/products/stores`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setStores(Array.isArray(res.data) ? res.data : []);
//     } catch (error) {
//       console.error("Failed to fetch stores:", error);
//       setStores([]);
//     }
//   }, []);

//   const loadCompanies = useCallback(async () => {
//     try {
//       const token = localStorage.getItem("token");

//       const res = await axios.get(`${API_URL}/products/companies`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = Array.isArray(res.data) ? res.data : [];
//       setCompanies(data);

//       // auto-select if only one company
//       if (data.length === 1) {
//         setFormData((prev) => ({
//           ...prev,
//           supplier_id: data[0].supplier_id,
//         }));

//         loadBranches();
//         loadStores();
//       }
//     } catch (err) {
//       console.error("Company load failed", err);
//     }
//   }, [loadBranches, loadStores]);

//   // Load Companies and Categories on Mount
//   useEffect(() => {
//     loadCompanies();
//     (async () => {
//       try {
//         const res = await axios.get(`${API_URL}/products/categories`);
//         setCategories(Array.isArray(res.data) ? res.data : res.data.data || []);
//       } catch (e) {
//         console.error("Failed to load categories", e);
//       }
//     })();
//   }, [loadCompanies]);

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   useEffect(() => {
//     loadCompanies();
//   }, [loadCompanies]);

//   useEffect(() => {
//     const seen = localStorage.getItem("seen_bulk_upload_guide");
//     if (!seen) {
//       setTimeout(() => {
//         if (bulkBtnRef.current) {
//           setBulkRect(bulkBtnRef.current.getBoundingClientRect());
//         }
//         setBulkGuideOpen(true);
//         setHighlightBulk(true);
//       }, 800);
//     }
//   }, []);

//   const loadSubcategories = async (categoryId) => {
//     if (!categoryId) return setSubcategories([]);
//     try {
//       const res = await axios.get(`${API_URL}/products/subcategories?category_id=${categoryId}`);
//       setSubcategories(Array.isArray(res.data) ? res.data : res.data.data || []);
//     } catch (e) {
//       console.error("Failed to fetch subcategories", e);
//     }
//   };

//   // translation effect (debounced)
//   useEffect(() => {
//     const translateToArabic = async () => {
//       const text = (formData.productNameEnglish || "").trim();
//       if (!text) {
//         setFormData((prev) => ({ ...prev, productNameArabic: "" }));
//         return;
//       }
//       setIsTranslating(true);
//       try {
//         const res = await axios.post(`${API_URL}/products/translate`, { text });
//         const arabic = res.data?.arabic || "";
//         setFormData((prev) => (arabic && arabic !== prev.productNameArabic ? { ...prev, productNameArabic: arabic } : prev));
//       } catch (e) {
//         console.error("Translation failed", e);
//       } finally {
//         setIsTranslating(false);
//       }
//     };

//     const t = setTimeout(() => translateToArabic(), 600);
//     return () => clearTimeout(t);
//   }, [formData.productNameEnglish]);

//   // handle input changes (camelCase state) and keep backend snake_case mapping only on submit
//   const handleChange = (e) => {
//     const { name, value, files } = e.target;

//     if (name === "categoryId") {
//       setFormData((prev) => ({ ...prev, categoryId: value, subCategoryId: "" }));
//       loadSubcategories(value);
//       return;
//     }

//     // if (files && files.length > 0) {
//     //   const file = files[0];
//     //   // revoke old preview
//     //   if (previewUrlRef.current) {
//     //     URL.revokeObjectURL(previewUrlRef.current);
//     //   }
//     //   const url = URL.createObjectURL(file);
//     //   previewUrlRef.current = url;
//     //   setFormData((prev) => ({ ...prev, [name]: file, productImagesPreview: url }));
//     //   return;
//     // }
//     if (name === "productImages" && files.length > 0) {
//       const filesArray = Array.from(files);

//       // Generate preview URLs
//       const previews = filesArray.map((file) => URL.createObjectURL(file));

//       // Save files + previews
//       setFormData((prev) => ({
//         ...prev,
//         productImages: filesArray,
//         productImagesPreview: previews,
//       }));

//       return;
//     }

//     setFormData((prev) => ({ ...prev, [name]: value }));

//     if (name === "supplier_id") {
//       // localStorage.setItem("supplier_id", value);
//       setFormData((prev) => ({ ...prev, branch_id: "", store_id: "" }));
//       loadBranches(value);
//       loadStores(value);
//     }
//   };

//   // submit -> map camelCase -> snake_case field names
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.productNameEnglish?.trim()) {
//       alert("Please enter a product name.");
//       return;
//     }

//     try {
//       const formPayload = new FormData();
//       formPayload.append("supplier_id", formData.supplier_id || "");
//       formPayload.append("branch_id", formData.branch_id || "");
//       formPayload.append("store_id", formData.store_id || "");

//       // snake_case keys expected by backend
//       formPayload.append("product_name_english", formData.productNameEnglish || "");
//       formPayload.append("product_name_arabic", formData.productNameArabic || "");
//       formPayload.append("category_id", formData.categoryId || "");
//       formPayload.append("sub_category_id", formData.subCategoryId || "");
//       formPayload.append("unit_of_measure", formData.unitOfMeasure || "");
//       formPayload.append("price_per_unit", formData.pricePerUnit || "");
//       formPayload.append("currency", formData.currency || "QAR ");
//       formPayload.append("minimum_order_quantity", formData.minimumOrderQuantity || "");
//       formPayload.append("stock_availability", formData.stockAvailability || "");
//       formPayload.append("expiry_date", formData.expiryDate || "");
//       formPayload.append("shelf_life", formData.shelfLife || "");
//       formPayload.append("expiry_time", formData.expiryTime || "");
//       formPayload.append("description", formData.description || "");

//       // if (formData.productImages) {
//       //   formPayload.append("product_images", formData.productImages);
//       // }
//       // append images
//       if (Array.isArray(formData.productImages)) {
//         formData.productImages.forEach((file) => {
//           formPayload.append("product_images", file);
//         });
//       }

//       if (isEditing && editId) {
//         await updateProduct(editId, formPayload);
//         alert("✅ Product updated successfully!");
//         if (goToSubmenu) {
//           goToSubmenu("OffersPromotionsForm")
//         }
//       } else {
//         await addProduct(formPayload);
//         alert("✅ Product saved successfully!");
//         if (goToSubmenu) {
//           goToSubmenu("OffersPromotionsForm")
//         }
//       }

//       handleClear();
//       await doSearch(searchTerm);
//     } catch (error) {
//       console.error("Error saving product:", error);
//       alert("❌ Failed to save or update product. Check console for details.");
//     }
//   };

//   const handleClear = () => {
//     // revoke preview URL
//     if (previewUrlRef.current) {
//       URL.revokeObjectURL(previewUrlRef.current);
//       previewUrlRef.current = null;
//     }

//     setFormData({
//       supplier_id: "",
//       branch_id: "",
//       store_id: "",
//       productNameEnglish: "",
//       productNameArabic: "",
//       categoryId: "",
//       subCategoryId: "",
//       unitOfMeasure: "",
//       pricePerUnit: "",
//       currency: "QAR ",
//       minimumOrderQuantity: "",
//       stockAvailability: "",
//       // productImages: null,
//       // productImagesPreview: null,
//       productImages: [],
//       productImagesPreview: [],
//       expiryDate: "",
//       shelfLife: "",
//       expiryTime: "",
//       description: "",
//     });
//     setIsEditing(false);
//     setEditId(null);
//   };

//   // search / fetch
//   const doSearch = useCallback( async (search, isVisible) => {
//     if (!isAdmin) {
//        alert("⚠ Only admins can view product data.");
//        setProducts([]); // Clear any data
//        setSearchVisible(false); // hide table
//        return;
//      }

//     try {
//       if (isVisible && !search.trim) {
//         setSearchVisible(false);
//         setProducts([]);
//         return;
//       }

//       const results = await fetchProducts(search);
//       setProducts(results);
//       setSearchVisible(true);
//       if (!results || results.length === 0) {
//         // no results
//       }
//     } catch (e) {
//       console.error("Search failed:", e);
//       alert("Failed to fetch data.");
//     }
//   }, [isAdmin]);

//   const toggleSearch = () => {
//     setSearchVisible((prev) => {
//       if (prev === true) {
//         setProducts([]); 
//       }
//       return !prev;
//     });
//   };

//   // auto-search as user types
//   useEffect(() => {
//     if (!searchVisible) return; // do nothing when hidden

//     const t = setTimeout(() => doSearch(searchTerm, true), 300);
//     return () => clearTimeout(t);
//   }, [searchTerm, searchVisible, doSearch]);

//   const startEdit = async (product) => {
//     try {
//       const supplierId = product.supplier_id;
//       await loadBranches(supplierId);
//       await loadStores(supplierId);

//       const branchMatch = branches.find((b) => b.branch_name_english === product.branch_name_english);
//       const storeMatch = stores.find((s) => s.store_name_english === product.store_name_english);

//       const branchId = product.branch_id || (branchMatch ? branchMatch.branch_id : "");
//       const storeId = product.store_id || (storeMatch ? storeMatch.store_id : "");

//       // product.product_images is returned by backend as base64 string (no prefix)
//       const preview = product.product_images ? `data:image/jpeg;base64,${product.product_images}` : null;

//       // revoke previous preview
//       if (previewUrlRef.current) {
//         URL.revokeObjectURL(previewUrlRef.current);
//         previewUrlRef.current = null;
//       }

//       setFormData({
//         supplier_id: product.supplier_id,
//         branch_id: branchId,
//         store_id: storeId,
//         productNameEnglish: product.product_name_english,
//         productNameArabic: product.product_name_arabic,
//         categoryId: product.category_id,
//         subCategoryId: product.sub_category_id,
//         unitOfMeasure: product.unit_of_measure,
//         pricePerUnit: product.price_per_unit,
//         currency: product.currency || "QAR ",
//         minimumOrderQuantity: product.minimum_order_quantity,
//         stockAvailability: product.stock_availability,
//         description: product.description || product.product_description || "",
//         expiryDate: product.expiry_date || "",
//         shelfLife: product.shelf_life || "",
//         expiryTime: product.expiry_time || "",
//         // productImages: null,
//         // productImagesPreview: preview,
//         productImages: [],
//         productImagesPreview: preview ? [preview] : [],
//       });

//       await loadSubcategories(product.category_id);

//       setEditId(product.product_id);
//       setIsEditing(true);
//     } catch (e) {
//       console.error("Edit load failed:", e);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this product?")) return;
//     try {
//       await deleteProduct(id);
//       alert("🗑️ Product deleted successfully!");
//       doSearch(searchTerm);
//     } catch (e) {
//       console.error("Delete failed:", e);
//       alert("❌ Failed to delete product.");
//     }
//   };

//   // cleanup previews on unmount
//   useEffect(() => {
//     return () => {
//       if (previewUrlRef.current) {
//         URL.revokeObjectURL(previewUrlRef.current);
//         previewUrlRef.current = null;
//       }
//     };
//   }, []);

//   // ---------- JSX ----------
//   return (
//     <div className="product-page">

//       {bulkGuideOpen && bulkRect && (
//         <>
//           {/* Dark overlay with hole */}
//           <div
//             onClick={() => {
//               setBulkGuideOpen(false);
//               setHighlightBulk(false);
//             }}
//             style={{
//               position: "fixed",
//               inset: 0,
//               background: "rgba(0,0,0,0.55)",
//               zIndex: 99990,
//               clipPath: `polygon(
//                 0 0,
//                 100% 0,
//                 100% 100%,
//                 0 100%,
//                 0 ${bulkRect.top - 12}px,
//                 ${bulkRect.left - 12}px ${bulkRect.top - 12}px,
//                 ${bulkRect.left - 12}px ${bulkRect.bottom + 12}px,
//                 ${bulkRect.right + 12}px ${bulkRect.bottom + 12}px,
//                 ${bulkRect.right + 12}px ${bulkRect.top - 12}px,
//                 0 ${bulkRect.top - 12}px
//               )`,
//             }}
//           />

//           {/* Orange highlight */}
//           <div
//             style={{
//               position: "fixed",
//               top: bulkRect.top + window.scrollY - 6,
//               left: bulkRect.left + window.scrollX - 6,
//               width: bulkRect.width + 12,
//               height: bulkRect.height + 12,
//               borderRadius: 12,
//               border: "3px solid #ff9800",
//               boxShadow: "0 0 25px rgba(255,152,0,0.9)",
//               zIndex: 99999,
//               pointerEvents: "none",
//             }}
//           />

//           {/* Popup */}
//           <div
//             style={{
//               position: "fixed",
//               top: bulkRect.bottom + window.scrollY + 18,
//               left: bulkRect.left + window.scrollX,
//               width: 360,
//               background: "#fff",
//               borderRadius: 10,
//               padding: 18,
//               zIndex: 100000,
//               boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
//             }}
//           >
//             <h3 style={{ color: "#ff6600", marginBottom: 8 }}>
//               Bulk Upload Products
//             </h3>
//             <p style={{ fontSize: 14, color: "#555" }}>
//               Upload multiple products at once using Excel and images.
//             </p>

//             <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
//               <button
//                 onClick={() => {
//                   setBulkGuideOpen(false);
//                   setHighlightBulk(false);
//                   localStorage.setItem("seen_bulk_upload_guide", "1");
//                 }}
//                 style={{
//                   padding: "8px 14px",
//                   borderRadius: 20,
//                   border: "1px solid #ccc",
//                   background: "#ff6600",
//                 }}
//               >
//                 Skip
//               </button>

//               <button
//                 onClick={() => {
//                   setShowBulkUpload(true);
//                   setBulkGuideOpen(false);
//                   setHighlightBulk(false);
//                   localStorage.setItem("seen_bulk_upload_guide", "1");
//                 }}
//                 style={{
//                   padding: "8px 18px",
//                   borderRadius: 20,
//                   border: "none",
//                   background: "#ff6600",
//                   color: "#fff",
//                   fontWeight: 600,
//                 }}
//               >
//                 OK
//               </button>
//             </div>
//           </div>
//         </>
//       )}

//      <div className="product-header">
//         <h2>Product Management</h2>

//         <div className="product-header-actions">
//           <div
//             ref={bulkBtnRef}
//             id="tour-bulk-upload"
//             className={`btn-second excel-icon ${
//               highlightBulk ? "guided-highlight-target" : ""
//             }`}
//             onClick={() => setShowBulkUpload((s) => !s)}
//             {...guidanceProps("bulkUploadToggle")}
//             role="button"
//             tabIndex={0}
//           >
//             <i className="fas fa-file-excel"></i> Bulk Upload
//           </div>

//           <button
//             className="search-toggle"
//             title="Show / Hide Search & Table"
//             onClick={toggleSearch}
//             {...guidanceProps("searchBox")}
//           >
//             <FiSearch size={22} />
//           </button>
//         </div>
//      </div>


//       {showBulkUpload && (
//           <div className="product-bulk-wrapper">
//             <div className="product-bulk-card">
//               <div className="product-bulk-header">
//                 <h4>Bulk Upload</h4>
//                 <span>Excel + Images ZIP</span>
//               </div>

//               <BulkUpload
//                 supplierId={formData.supplier_id}
//                 branchId={formData.branch_id}
//                 storeId={formData.store_id}
//                 onDone={() => doSearch(searchTerm)}
//               />
//             </div>
//           </div>

//         )}


//       <form onSubmit={handleSubmit}>

//           {/* ================= CARD 1: BUSINESS DETAILS ================= */}
//           <div className="form-card">
//             <h3>Business Details</h3>

//             <div className="form-grid-3">
//               <div className="form-field">
//                 <label>Company Name</label>
//                 <select
//                   disabled
//                   name="supplier_id"
//                   value={formData.supplier_id}
//                   onChange={handleChange}
//                   {...guidanceProps("supplier_id")}
//                 >
//                   <option value="">-- Select Company --</option>
//                   {companies.map((c) => (
//                     <option key={c.supplier_id} value={c.supplier_id}>
//                       {c.company_name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="form-field">
//                 <label>Branch</label>
//                 <select
//                   name="branch_id"
//                   value={formData.branch_id}
//                   onChange={handleChange}
//                   {...guidanceProps("branch_id")}
//                 >
//                   <option value="">-- Select Branch --</option>
//                   {branches.map((b) => (
//                     <option key={b.branch_id} value={b.branch_id}>
//                       {b.branch_name_english}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="form-field">
//                 <label>Store</label>
//                 <select
//                   name="store_id"
//                   value={formData.store_id}
//                   onChange={handleChange}
//                   {...guidanceProps("store_id")}
//                 >
//                   <option value="">-- Select Store --</option>
//                   {stores.map((s) => (
//                     <option key={s.store_id} value={s.store_id}>
//                       {s.store_name_english}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* ================= CARD 2: PRODUCT DETAILS ================= */}
//           <div className="form-card">
//             <h3>Product Details</h3>

//             <div className="form-grid-3">
//               <div className="form-field">
//                 <label>Product Name (EN)</label>
//                 <input
//                   type="text"
//                   name="productNameEnglish"
//                   value={formData.productNameEnglish}
//                   onChange={handleChange}
//                   {...guidanceProps("productNameEnglish")}
//                 />
//               </div>

//               <div className="form-field">
//                 <label>Product Name (AR)</label>
//                 <input
//                   type="text"
//                   name="productNameArabic"
//                   value={formData.productNameArabic}
//                   dir="rtl"
//                   readOnly
//                   {...guidanceProps("productNameArabic")}
//                 />
//                 {isTranslating && <small style={{ color: "gray" }}>Translating…</small>}
//               </div>

//               <div className="form-field">
//                 <label>Category</label>
//                 <select
//                   name="categoryId"
//                   value={formData.categoryId}
//                   onChange={handleChange}
//                   {...guidanceProps("categoryId")}
//                 >
//                   <option value="">-- Select Category --</option>
//                   {categories.map((cat) => (
//                     <option key={cat.id} value={cat.id}>
//                       {cat.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="form-field">
//                 <label>Subcategory</label>
//                 <select
//                   name="subCategoryId"
//                   value={formData.subCategoryId}
//                   onChange={handleChange}
//                   {...guidanceProps("subCategoryId")}
//                 >
//                   <option value="">-- Select Subcategory --</option>
//                   {subcategories.map((sub) => (
//                     <option key={sub.id} value={sub.id}>
//                       {sub.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="form-field">
//                 <label>Unit of Measure</label>
//                 <select
//                   name="unitOfMeasure"
//                   value={formData.unitOfMeasure}
//                   onChange={handleChange}
//                   {...guidanceProps("unitOfMeasure")}
//                 >
//                   <option value="">Select Unit</option>
//                   <option value="Piece">Piece</option>
//                   <option value="Box">Box</option>
//                   <option value="Kg">Kg</option>
//                   <option value="Liter">Liter</option>
//                 </select>
//               </div>

//               <div className="form-field">
//                 <label>Description</label>
//                 <textarea
//                   name="description"
//                   rows="3"
//                   value={formData.description}
//                   onChange={handleChange}
//                   {...guidanceProps("description")}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* ================= CARD 3: PRICING & AVAILABILITY ================= */}
//           <div className="form-card">
//             <h3>Pricing & Availability</h3>

//             <div className="form-grid-3">
//               <div className="form-field">
//                 <label>Price per Unit</label>
//                 <div className="price-group">
//                   <select
//                     name="currency"
//                     value={formData.currency || "QAR "}
//                     onChange={handleChange}
//                     {...guidanceProps("currency")}
//                   >
//                     <option value="QAR ">QAR </option>
//                     <option value="USD">$</option>
//                   </select>
//                   <input
//                     type="number"
//                     name="pricePerUnit"
//                     value={formData.pricePerUnit}
//                     onChange={handleChange}
//                     {...guidanceProps("pricePerUnit")}
//                   />
//                 </div>
//               </div>

//               <div className="form-field">
//                 <label>Minimum Order Quantity</label>
//                 <input
//                   type="number"
//                   name="minimumOrderQuantity"
//                   value={formData.minimumOrderQuantity}
//                   onChange={handleChange}
//                   {...guidanceProps("minimumOrderQuantity")}
//                 />
//               </div>

//               <div className="form-field">
//                 <label>Stock Availability</label>
//                 <input
//                   type="number"
//                   name="stockAvailability"
//                   value={formData.stockAvailability}
//                   onChange={handleChange}
//                   {...guidanceProps("stockAvailability")}
//                 />
//               </div>

//               <div className="form-field">
//                 <label>Expiry Date</label>
//                 <input
//                   type="date"
//                   name="expiryDate"
//                   value={formData.expiryDate}
//                   onChange={handleChange}
//                   {...guidanceProps("expiryDate")}
//                 />
//               </div>

//               <div className="form-field">
//                 <label>Expiry Time</label>
//                 <input
//                   type="time"
//                   name="expiryTime"
//                   value={formData.expiryTime}
//                   onChange={handleChange}
//                   {...guidanceProps("expiryTime")}
//                 />
//               </div>

//               <div className="form-field">
//                 <label>Shelf Life (days)</label>
//                 <input
//                   type="number"
//                   name="shelfLife"
//                   value={formData.shelfLife}
//                   onChange={handleChange}
//                   {...guidanceProps("shelfLife")}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* ================= CARD 4: PRODUCT IMAGES ================= */}
//           <div className="form-card">
//             <h3>Product Images</h3>

//             <input
//               type="file"
//               id="productImageInput"
//               name="productImages"
//               accept="image/*"
//               multiple
//               onChange={handleChange}
//               hidden
//             />

//             <div
//               className="image-upload-box"
//               onClick={() => document.getElementById("productImageInput").click()}
//               {...guidanceProps("productImages")}
//             >
//               <p>Drag & drop product images here</p>
//               <span>or click to upload</span>
//             </div>

//             {formData.productImagesPreview.length > 0 && (
//               <div className="image-preview-row">
//                 <img
//                   className="primary-preview"
//                   src={formData.productImagesPreview[0]}
//                   alt="Primary"
//                 />
//                 <div className="thumbnail-row">
//                   {formData.productImagesPreview.slice(1).map((url, i) => (
//                     <img key={i} src={url} alt="thumb" />
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* ================= ACTION FOOTER ================= */}
//           <div className="form-actions">
//             <button type="button" className="product-btn-cancel">
//                 Cancel
//             </button>
//             <button type="submit" className="btn-primary">
//               Save Product
//             </button>
//           </div>

//         </form>


//       {searchVisible && (
//         <>
//           {isAdmin ? (
//             <>
//               <div className="search-box" style={{ marginBottom: "8px" }}>
//                 <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
//               </div>

//               {products.length > 0 ? (
//                 <div className="table-area">
//                   <div className="table-container">
//                     <table className="data-table">
//                       <thead>
//                         <tr>
//                           <th>ID</th>
//                           <th>Company</th>
//                           <th>Branch</th>
//                           <th>Store</th>
//                           <th>Name (EN)</th>
//                           <th>Name (AR)</th>
//                           <th>Category</th>
//                           <th>Subcategory</th>
//                           <th>Unit</th>
//                           <th>Price</th>
//                           <th>Currency</th>
//                           <th>Min Qty</th>
//                           <th>Stock</th>
//                           <th>Images</th>
//                           <th>Expiry Date</th>
//                           <th>Shelf Life</th>
//                           <th>Expiry Time</th>
//                           <th>Description</th>
//                           <th>Status</th>
//                           <th>Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {products.map((p) => (
//                           <tr key={p.product_id}>
//                             <td>{p.product_id}</td>
//                             <td>{p.company_name_english}</td>
//                             <td>{p.branch_name_english}</td>
//                             <td>{p.store_name_english}</td>
//                             <td>{p.product_name_english}</td>
//                             <td>{p.product_name_arabic}</td>
//                             <td>{p.category_id}</td>
//                             <td>{p.sub_category_id}</td>
//                             <td>{p.unit_of_measure}</td>
//                             <td>{p.price_per_unit}</td>
//                             <td>{p.currency || "QAR "}</td>
//                             <td>{p.minimum_order_quantity}</td>
//                             <td>{p.stock_availability}</td>
//                             {/* <td>
//                               {p.product_images ? (
//                                 <img src={`data:image/jpeg;base64,${String(p.product_images || "").trim()}`} alt="Product" style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px", cursor: "pointer", border: "1px solid #ccc" }} onClick={() => window.open(`data:image/jpeg;base64,${p.product_images}`, "_blank")} />
//                               ) : (
//                                 "No Image"
//                               )}
//                             </td> */}
//                             {/* <td>
//                               {Array.isArray(p.product_images) && p.product_images.length > 0 ? (
//                                 <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
//                                   {p.product_images.map((img, idx) => (
//                                     <img
//                                       key={idx}
//                                       src={`data:image/jpeg;base64,${img}`}
//                                       alt={`Product ${idx}`}
//                                       style={{
//                                         width: "50px",
//                                         height: "50px",
//                                         objectFit: "cover",
//                                         borderRadius: "6px",
//                                         cursor: "pointer",
//                                         border: "1px solid #ccc",
//                                       }}
//                                       onClick={() => window.open(`data:image/jpeg;base64,${img}`, "_blank")}
//                                     />
//                                   ))}
//                                 </div>
//                               ) : (
//                                 "No Image"
//                               )}
//                             </td> */}
//                             <td>
//                               {Array.isArray(p.product_images) && p.product_images.length > 0 ? (
//                                 <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
//                                   {p.product_images.map((img, idx) => (
//                                     <img
//                                       key={idx}
//                                       src={`data:image/jpeg;base64,${img}`}   // ✅ base64 string
//                                       alt={`Product ${idx}`}
//                                       style={{
//                                         width: "50px",
//                                         height: "50px",
//                                         objectFit: "cover",
//                                         borderRadius: "6px",
//                                         cursor: "pointer",
//                                         border: "1px solid #ccc",
//                                       }}
//                                       onClick={() => window.open(`data:image/jpeg;base64,${img}`, "_blank")}
//                                     />
//                                   ))}
//                                 </div>
//                               ) : (
//                                 "No Image"
//                               )}
//                             </td>
                            
//                             <td>{p.expiry_date}</td>
//                             <td>{p.shelf_life}</td>
//                             <td>{p.expiry_time}</td>
//                             <td>{p.description || p.product_description || ""}</td>
//                             <td>{p.product_status || "Pending Approval"}</td>
//                             <td>
//                               <button className="edit-btn" onClick={() => startEdit(p)}><i className="fas fa-edit"></i></button>
//                               <button className="delete-btn" onClick={() => handleDelete(p.product_id)}><i className="fas fa-trash"></i></button>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               ) : (
//                 <p>No records found.</p>
//               )}
//             </>
//           ) : (
//             <p style={{ color: "red" }}>⚠ Only admins can view product data.</p>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default ProductForm;