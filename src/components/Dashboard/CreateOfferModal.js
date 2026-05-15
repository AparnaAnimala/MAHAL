// import React, { useState } from "react";

// const CreateOfferModal = ({ onClose }) => {
//   const [activeTab, setActiveTab] = useState("category");

//   return (
//     <div className="modal_overlay">
//       <div className="offer_modal modern">

//         {/* HEADER */}
//         <div className="modal_header">
//           <h3>Create Offer</h3>
//           <button className="close_btn" onClick={onClose}>×</button>
//         </div>

//         {/* TABS */}
//         <div className="offer_tabs pill_tabs">
//           <button
//             className={activeTab === "category" ? "active" : ""}
//             onClick={() => setActiveTab("category")}
//           >
//             Category Offer
//           </button>

//           <button
//             className={activeTab === "product" ? "active" : ""}
//             onClick={() => setActiveTab("product")}
//           >
//             Product Offer
//           </button>
//         </div>

//         {/* BODY */}
//         <div className="modal_body form_stack">

//           {activeTab === "category" && (
//             <>
//               <div className="form_group">
//                 <label>Category</label>
//                 <select>
//                   <option>Select Category</option>
//                 </select>
//               </div>

//               <div className="form_group">
//                 <label>Sub Category</label>
//                 <select>
//                   <option>Select Sub Category</option>
//                 </select>
//               </div>
//             </>
//           )}

//           {activeTab === "product" && (
//             <div className="form_group">
//               <label>Select Products</label>
//               <select>
//                 <option>Select Product</option>
//               </select>
//             </div>
//           )}

//           <div className="form_group">
//             <label>Discount Percentage (%)</label>
//             <input type="number" placeholder="Eg: 10" />
//           </div>

//           <div className="two_col">
//             <div className="form_group">
//               <label>Start Date</label>
//               <input type="date" />
//             </div>

//             <div className="form_group">
//               <label>End Date</label>
//               <input type="date" />
//             </div>
//           </div>

//           <div className="form_group">
//             <label>Offer Title</label>
//             <input type="text" placeholder="Eg: Weekend Super Saver" />
//           </div>

//           <div className="form_group">
//             <label>Offer Description</label>
//             <textarea
//               rows="2"
//               className="resizable_textarea"
//               placeholder="Short description about the offer"
//             />
//           </div>

//           <div className="checkbox_row modern_check">
//             <input type="checkbox" id="featured" />
//             <label htmlFor="featured">Set as Featured Offer</label>
//           </div>

//           <button className="btn_save glow full">
//             Save Offer
//           </button>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateOfferModal;




// import React, { useEffect, useState } from "react";

// const CreateOfferModal = ({ onClose, onSaved }) => {
//   const [activeTab, setActiveTab] = useState("category");

//   const supplierId = localStorage.getItem("linked_id");

//   const [categories, setCategories] = useState([]);
//   const [products, setProducts] = useState([]);

//   const [form, setForm] = useState({
//     category_id: "",
//     sub_category_id: "",
//     product_id: "",
//     discount_percentage: "",
//     start_date: "",
//     end_date: "",
//     title: "",
//     description: "",
//     featured: false,
//   });

//   /* ================= FETCH DROPDOWNS ================= */
//   useEffect(() => {
//     fetch("http://192.168.2.9:5000/api/products/categories")
//       .then((r) => r.json())
//       .then(setCategories);

//     fetch(
//       `http://192.168.2.9:5000/api/products?supplier_id=${supplierId}`
//     )
//       .then((r) => r.json())
//       .then(setProducts);
//   }, [supplierId]);

//   /* ================= SAVE OFFER ================= */
//   const saveOffer = async () => {
//     if (!form.discount_percentage || !form.start_date || !form.end_date) {
//       alert("Please fill required fields");
//       return;
//     }

//     try {
//       await fetch("http://192.168.2.9:5000/api/offers", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           supplier_id: supplierId,
//           offer_type: activeTab,
//           ...form,
//         }),
//       });

//       onSaved();
//     } catch (err) {
//       alert("Failed to save offer");
//     }
//   };

//   return (
//     <div className="modal_overlay">
//       <div className="offer_modal modern">

//         {/* HEADER */}
//         <div className="modal_header">
//           <h3>Create Offer</h3>
//           <button className="close_btn" onClick={onClose}>×</button>
//         </div>

//         {/* TABS */}
//         <div className="offer_tabs pill_tabs">
//           <button
//             className={activeTab === "category" ? "active" : ""}
//             onClick={() => setActiveTab("category")}
//           >
//             Category Offer
//           </button>

//           <button
//             className={activeTab === "product" ? "active" : ""}
//             onClick={() => setActiveTab("product")}
//           >
//             Product Offer
//           </button>
//         </div>

//         {/* BODY */}
//         <div className="modal_body form_stack">

//           {activeTab === "category" && (
//             <div className="form_group">
//               <label>Category</label>
//               <select
//                 onChange={(e) =>
//                   setForm({ ...form, category_id: e.target.value })
//                 }
//               >
//                 <option value="">Select Category</option>
//                 {categories.map((c) => (
//                   <option key={c.id} value={c.id}>
//                     {c.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           {activeTab === "product" && (
//             <div className="form_group">
//               <label>Select Product</label>
//               <select
//                 onChange={(e) =>
//                   setForm({ ...form, product_id: e.target.value })
//                 }
//               >
//                 <option value="">Select Product</option>
//                 {products.map((p) => (
//                   <option key={p.product_id} value={p.product_id}>
//                     {p.product_name_english}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           <div className="form_group">
//             <label>Discount Percentage (%)</label>
//             <input
//               type="number"
//               onChange={(e) =>
//                 setForm({ ...form, discount_percentage: e.target.value })
//               }
//             />
//           </div>

//           <div className="two_col">
//             <div className="form_group">
//               <label>Start Date</label>
//               <input
//                 type="date"
//                 onChange={(e) =>
//                   setForm({ ...form, start_date: e.target.value })
//                 }
//               />
//             </div>

//             <div className="form_group">
//               <label>End Date</label>
//               <input
//                 type="date"
//                 onChange={(e) =>
//                   setForm({ ...form, end_date: e.target.value })
//                 }
//               />
//             </div>
//           </div>

//           <div className="form_group">
//             <label>Offer Title</label>
//             <input
//               onChange={(e) =>
//                 setForm({ ...form, title: e.target.value })
//               }
//             />
//           </div>

//           <div className="form_group">
//             <label>Offer Description</label>
//             <textarea
//               rows="2"
//               onChange={(e) =>
//                 setForm({ ...form, description: e.target.value })
//               }
//             />
//           </div>

//           <div className="checkbox_row modern_check">
//             <input
//               type="checkbox"
//               id="featured"
//               onChange={(e) =>
//                 setForm({ ...form, featured: e.target.checked })
//               }
//             />
//             <label htmlFor="featured">Set as Featured Offer</label>
//           </div>

//           <button className="btn_save glow full" onClick={saveOffer}>
//             Save Offer
//           </button>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateOfferModal;



import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useTranslation } from "react-i18next";

const CreateOfferModal = ({ onClose, onSaved, offer }) => {
  const isEdit = Boolean(offer);
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("category");
  const supplierId = localStorage.getItem("linked_id");

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [discountType, setDiscountType] = useState("Percentage");
  const [isInactive, setIsInactive] = useState(false);


   const [form, setForm] = useState({
    category_id: "",
    sub_category_id: "",
    product_id: [],
    selectedProducts: [],
    expandedProducts: false,

    discount_percentage: "",
    flat_amount: "",
    bogo_buy: "",
    bogo_get: "",

    free_delivery: false,
    min_order_for_free_delivery: "",

    start_date: "",
    end_date: "",
    start_time: "",        // ✅ ADDED
    end_time: "",          // ✅ ADDED

    title: "",
    description: "",
    featured: false,
  });
  

useEffect(() => {
  if (!offer) return;

  setDiscountType(offer.offer_type || "Percentage");

  setForm(prev => ({
    ...prev,
    category_id: offer.category_id || "",
    sub_category_id: offer.sub_category_id || "",
    product_id: offer.product_id ? [offer.product_id] : [],
    selectedProducts: [],

    discount_percentage: offer.discount_percentage || "",
    flat_amount: offer.flat_amount || "",
    bogo_buy: offer.buy_quantity || "",
    bogo_get: offer.get_quantity || "",

    free_delivery: offer.free_delivery || false,
    min_order_for_free_delivery: offer.free_delivery_min_amount || "",

    start_date: offer.start_date || "",
    end_date: offer.end_date || "",
    start_time: offer.start_time || "",
    end_time: offer.end_time || "",

    title: offer.offer_title || "",
    description: offer.offer_description || "",
    featured: offer.is_featured || false,
  }));

  // 🔥 THIS WAS MISSING
  setIsInactive(offer.is_active === false);

  setActiveTab(offer.product_id ? "product" : "category");
}, [offer]);

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!supplierId) return;

    fetch(`http://192.168.2.9:5000/api/categories?supplier_id=${supplierId}`)
      .then(r => r.json())
      .then(setCategories);

    fetch(`http://192.168.2.9:5000/api/products?supplier_id=${supplierId}`)
      .then(r => r.json())
      .then(setProducts);

    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, [supplierId]);

  useEffect(() => {
      if (!offer || !offer.product_id || products.length === 0) return;

      const p = products.find(x => x.product_id === offer.product_id);
      if (!p) return;

      setForm(prev => ({
        ...prev,
        selectedProducts: [{
          value: p.product_id,
          label:
          i18n.language === "ar"
            ? p.product_name_arabic || p.product_name_english
            : p.product_name_english,
        }],
        product_id: [p.product_id],
      }));
    }, [offer, products]);


  /* ================= PRODUCT OPTIONS ================= */
  const productOptions = products.map(p => {
    let status = "In Stock";

    if (p.stock_qty === 0) status = "Out of Stock";
    else if (p.stock_qty <= 20) status = "Low Stock";

    return {
      value: p.product_id,
      label:
    i18n.language === "ar"
      ? p.product_name_arabic || p.product_name_english
      : p.product_name_english,
      qty: p.stock_qty,
      status,
      image: `http://192.168.2.9:5000${p.image_url}`,
    };
  });

  /* ================= SAVE ================= */
  const saveOffer = async () => {
    if (!form.start_date || !form.end_date) {
      alert(t("missing_date_range"));
      return;
    }

    if (activeTab === "category") {
      if (!form.category_id || !form.sub_category_id) {
        alert("Category & Subcategory required");
        return;
      }
    }

    if (activeTab === "product" && form.product_id.length === 0) {
      alert("At least 1 product required");
      return;
    }

        const payload = {
      supplier_id: supplierId,
      category_id: form.category_id,
      sub_category_id: form.sub_category_id,
      product_id: form.product_id,



      offer_type: discountType,
      discount_percentage: form.discount_percentage,
      flat_amount: form.flat_amount,
      bogo_buy: form.bogo_buy,
      bogo_get: form.bogo_get,

      free_delivery: form.free_delivery,
      min_order_for_free_delivery: form.min_order_for_free_delivery,

      start_date: form.start_date,
      end_date: form.end_date,
      start_time: form.start_time || null,   // ✅ FIX
      end_time: form.end_time || null,       // ✅ FIX

      title: form.title,
      description: form.description,
      featured: form.featured,
      is_active: !isInactive
    };
    try {
      const url = isEdit
        ? `http://192.168.2.9:5000/api/offers/${offer.offer_id}`
        : `http://192.168.2.9:5000/api/offers`;

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        let msg = data?.error || "Failed to save offer";

        // 🔥 OPTION 3: SMART MESSAGE
        if (msg.toLowerCase().includes("already")) {
          msg = "⚠️ This product already has an ongoing offer";
        }

        alert(msg);
        return; // ⛔ stop further execution
      }

      onSaved(); // ✅ only runs on success


      onSaved();
    } catch (err) {
      alert("Failed to save offer");
    }
  };

  return (
  <div className="modal_overlay">
    <div className="order_modal">

      {/* HEADER + TABS (fixed top area) */}
      <div className="modal_header">
        <h3>{isEdit ? t("update_offer") : t("create_offer")}</h3>
        <button className="close_btn" onClick={onClose}>×</button>
      </div>

      <div className="offer_tabs pill_tabs">
        <button className={activeTab === "category" ? "active" : ""} onClick={() => setActiveTab("category")}>
          {t("category_offer")}
        </button>
        <button className={activeTab === "product" ? "active" : ""} onClick={() => setActiveTab("product")}>
          {t("product_offer")}
        </button>
      </div>

      {/* SCROLL AREA */}
      <div className="modal_body">
        <div className="modal_scroll form_stack">

          {/* CATEGORY MODE */}
          {activeTab === "category" && (
            <>
              <div className="form_group">
                <label>{t("category")}</label>
                <select
                  onChange={async (e) => {
                    const category_id = e.target.value;
                    setForm({ ...form, category_id, sub_category_id: "" });

                    const res = await fetch(
                      `http://192.168.2.9:5000/api/subcategories?supplier_id=${supplierId}&category_id=${category_id}`
                    );
                    setSubCategories(await res.json());
                  }}
                >
                  <option value="">{t("select_category")}</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{i18n.language === "ar"
                    ? c.name_arabic || c.name
                    : c.name}</option>
                  ))}
                </select>
              </div>

              {subCategories.length > 0 && (
                <div className="form_group">
                  <label>{t("sub_category")}</label>
                  <select onChange={(e)=>setForm({ ...form, sub_category_id: e.target.value })}>
                    <option value="">Select Sub Category</option>
                    {subCategories.map(sc => (
                      <option key={sc.id} value={sc.id}>{i18n.language === "ar"
                      ? sc.name_arabic || sc.name
                      : sc.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* PRODUCT MODE */}
          {activeTab === "product" && (
            <div className="form_group">
              <label>{t("select_products")}</label>
              <Select
                isMulti
                options={productOptions}
                value={form.selectedProducts}
                onChange={(selected) => {
                  setForm({
                    ...form,
                    selectedProducts: selected,
                    product_id: selected.map(s => s.value)
                  });
                }}
              />

              {form.selectedProducts.length > 0 && (
                <div
                  className="selected_expand_toggle"
                  onClick={() => setForm({ ...form, expandedProducts: !form.expandedProducts })}
                >
                  {form.selectedProducts.length} {t("products_selected")}{form.expandedProducts ? "▲" : "▼"}
                </div>
              )}

              {form.expandedProducts && (
                <div className="selected_products_list">
                  {form.selectedProducts.map(p => (
                    <div key={p.value} className="selected_product_item">
                      <img src={p.image} className="product_preview_img" />
                      <span className="product_preview_text">
                        {p.label} — {p.qty} units ({p.status})
                      </span>
                      <span
                        className="btn_remove"
                        onClick={() => {
                          const filtered = form.selectedProducts.filter(x => x.value !== p.value);
                          setForm({
                            ...form,
                            selectedProducts: filtered,
                            product_id: filtered.map(s => s.value)
                          });
                        }}
                      >
                        ✕
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
            {/* DISCOUNT TYPE */}
            <div className="form_group">
              <label>{t("discount_type")}</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
              >
                <option>{t("percentage")}</option>
                <option>{t("flat")}</option>
                <option>{t("bogo")}</option>
              </select>
            </div>

            {discountType === "Percentage" && (
              <div className="form_group">
                <label>{t("discount_percentage")}</label>
                <input
                  type="number"
                  value={form.discount_percentage}
                  onChange={(e) =>
                    setForm({ ...form, discount_percentage: e.target.value })
                  }
                />
              </div>
            )}

            {discountType === "Flat" && (
              <div className="form_group">
                <label>{t("flat_amount")} (QAR )</label>
                <input
                  type="number"
                  value={form.flat_amount}
                  onChange={(e) =>
                    setForm({ ...form, flat_amount: e.target.value })
                  }
                />
              </div>
            )}

            {discountType === "BOGO" && (
              <div className="two_col">
                <div className="form_group">
                  <label>{t("buy_qty")}</label>
                  <input
                    type="number"
                    value={form.bogo_buy}
                    onChange={(e) =>
                      setForm({ ...form, bogo_buy: e.target.value })
                    }
                  />
                </div>
                <div className="form_group">
                  <label>{t("get_qty")}</label>
                  <input
                    type="number"
                    value={form.bogo_get}
                    onChange={(e) =>
                      setForm({ ...form, bogo_get: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {/* FREE DELIVERY */}
            <div className="checkbox_row modern_check">
              <input
                type="checkbox"
                id="free_delivery"
                checked={form.free_delivery}
                onChange={(e) =>
                  setForm({ ...form, free_delivery: e.target.checked })
                }
              />
              <label htmlFor="free_delivery">{t("free_delivery")}</label>
            </div>

            {form.free_delivery && (
              <div className="form_group">
                <label>Min Order for Free Delivery (QAR )</label>
                <input
                  type="number"
                  value={form.min_order_for_free_delivery}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      min_order_for_free_delivery: e.target.value,
                    })
                  }
                />
              </div>
            )}

            {/* DATE */}
            <div className="two_col">
              <div className="form_group">
                <label>{t("start_date")}</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) =>
                    setForm({ ...form, start_date: e.target.value })
                  }
                />
              </div>
              <div className="form_group">
                <label>{t("end_date")}</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) =>
                    setForm({ ...form, end_date: e.target.value })
                  }
                />
              </div>
            </div>

            {/* TIME */}
            <div className="two_col">
              <div className="form_group">
                <label>{t("start_time")}</label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) =>
                    setForm({ ...form, start_time: e.target.value })
                  }
                />
              </div>
              <div className="form_group">
                <label>{t("end_time")}</label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) =>
                    setForm({ ...form, end_time: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form_group">
              <label>{t("offer_title")}</label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />
            </div>

            <div className="form_group">
              <label>{t("description")}</label>
              <textarea
                rows="2"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>


          <div className="checkbox_row modern_check">
            <input type="checkbox" id="featured" onChange={(e)=>setForm({ ...form, featured: e.target.checked })}/>
            <label htmlFor="featured">{t("set_featured")}</label>
          </div>
           {isEdit && (
              <div className="checkbox_row modern_check">
                <input
                  type="checkbox"
                  id="inactive_offer"
                  checked={isInactive}
                  onChange={(e) => setIsInactive(e.target.checked)}
                />
                <label htmlFor="inactive_offer">
                  {t("deactivate_offer")}
                </label>
              </div>
            )}
       
        <button className="btn_save glow full" onClick={saveOffer}>
            {isEdit ? t("update_offer") : t("save_offer")}
          </button>
        </div>
      </div>
    </div>
  </div>
);

};

export default CreateOfferModal;