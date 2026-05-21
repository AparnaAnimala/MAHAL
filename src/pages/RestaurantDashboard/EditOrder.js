// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";

// const API_BASE = "http://192.168.2.22:5000/api/v1/orders";

// export default function EditOrder() {
//   const { orderId } = useParams();
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   const [items, setItems] = useState([]);
//   const [header, setHeader] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   /* ================= LOAD ORDER ================= */
//   useEffect(() => {
//     if (!orderId) return;

//    axios
//   .get(`${API_BASE}/restaurant/orders/${orderId}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   })
//   .then((res) => {
//     console.log("FULL RESPONSE:", res.data);   // 👈 ADD THIS
//     console.log("HEADER:", res.data.header);   // 👈 AND THIS

//     setHeader(res.data.header);

//     const formattedItems = (res.data.items || []).map((item) => ({
//       ...item,
//       quantity: Number(item.quantity),
//       price_per_unit: Number(item.price_per_unit),
//       discount: Number(item.discount || 0),
//       total_amount: Number(item.total_amount),
//     }));

//     setItems(formattedItems);
//   })

//       .catch(() => alert("Failed to load order"))
//       .finally(() => setLoading(false));
//   }, [orderId, token]);

//   /* ================= UPDATE QTY ================= */
//   const updateQuantity = (index, value) => {
//     const updated = [...items];

//     const qty = Math.max(1, Number(value) || 1);
//     updated[index].quantity = qty;

//     const lineTotal =
//       qty * updated[index].price_per_unit - updated[index].discount;

//     updated[index].total_amount = Number(lineTotal.toFixed(2));
//     setItems(updated);
//   };

//   /* ================= REMOVE ITEM ================= */
//   const removeItem = (index) => {
//     const updated = [...items];
//     updated.splice(index, 1);
//     setItems(updated);
//   };

//   /* ================= CALCULATE TOTAL ================= */
//   const grandTotal = items.reduce(
//     (sum, item) => sum + Number(item.total_amount || 0),
//     0
//   );

//   /* ================= SAVE ORDER ================= */
//   const handleSave = async () => {
//     if (items.length === 0) {
//       alert("Order cannot be empty");
//       return;
//     }

//     setSaving(true);

//     try {
//       await axios.put(
//         `${API_BASE}/restaurant/orders/${orderId}/edit`,
//         { items },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       alert("Order updated successfully");
//       navigate("/restaurantdashboard/orders");
//     } catch (err) {
//       alert(err.response?.data?.error || "Failed to update order");
//     } finally {
//       setSaving(false);
//     }
//   };

//   /* ================= ADD PRODUCTS ================= */
// const handleAddProducts = () => {
//   console.log("CLICKED ADD PRODUCTS");
//   console.log("HEADER DATA:", header);

//   const supplierId =
//     header?.supplier_id ||
//     header?.supplier ||
//     header?.supplierId ||
//     header?.vendor_id;

//   if (!supplierId) {
//     alert("Supplier not found for this order");
//     return;
//   }

//   navigate(
//     `/restaurantdashboard/categorielist?addToOrder=${orderId}&supplier=${supplierId}&lock=1`
//   );
// };




//   /* ================= UI STATES ================= */
//   if (loading) return <p>Loading order...</p>;
//   if (!header) return <p>Order not found</p>;

//   if (header.status !== "PLACED") {
//     return (
//       <div className="dashboard_page">
//         <h3>This order can no longer be modified.</h3>
//         <button
//           className="btn btn-secondary mt-3"
//           onClick={() => navigate(-1)}
//         >
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="dashboard_page">
//       <div className="page_header d-flex gap-2 align-items-center">
//         <h2 className="me-auto">Edit Order #{orderId}</h2>

//         <button
//           className="btn-primary"
//           onClick={() => navigate(-1)}
//         >
//           Cancel
//         </button>

//         <button
//           className="btn btn-primary"
//           onClick={handleAddProducts}
//         >
//           + Add Products
//         </button>
//       </div>

//       <div className="card mt-3">
//         <table className="table order_table">
//           <thead>
//             <tr>
//               <th>Product</th>
//               <th width="120">Qty</th>
//               <th className="text-end">Price</th>
//               <th className="text-end">Line Total</th>
//               <th></th>
//             </tr>
//           </thead>

//           <tbody>
//             {items.map((item, index) => (
//               <tr key={item.item_id}>
//                 <td>{item.product_name_english}</td>

//                 <td>
//                   <input
//                     type="number"
//                     min="1"
//                     className="form-control"
//                     value={item.quantity}
//                     onChange={(e) =>
//                       updateQuantity(index, e.target.value)
//                     }
//                   />
//                 </td>

//                 <td className="text-end">
//                   QAR  {Number(item.price_per_unit).toFixed(2)}
//                 </td>

//                 <td className="text-end">
//                   QAR  {Number(item.total_amount).toFixed(2)}
//                 </td>

//                 <td>
//                   <button
//                     className="btn-primary"
//                     onClick={() => removeItem(index)}
//                   >
//                     Remove
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <div className="text-end mt-3 pe-3">
//           <h4>Total: QAR  {grandTotal.toFixed(2)}</h4>
//         </div>
//       </div>

//       <div className="text-end mt-4">
//         <button
//           className="btn-primary"
//           disabled={saving}
//           onClick={handleSave}
//         >
//           {saving ? "Saving..." : "Save Changes"}
//         </button>
//       </div>
//     </div>
//   );
// }



// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";

// const API_BASE = "http://192.168.2.22:5000/api/v1/orders";

// export default function EditOrder() {
//   const { orderId } = useParams();
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   const [items, setItems] = useState([]);
//   const [header, setHeader] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   /* ================= LOAD ORDER ================= */
//   useEffect(() => {
//     if (!orderId) return;

//    axios
//   .get(`${API_BASE}/restaurant/orders/${orderId}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   })
//   .then((res) => {
//     console.log("FULL RESPONSE:", res.data);   // 👈 ADD THIS
//     console.log("HEADER:", res.data.header);   // 👈 AND THIS

//     setHeader(res.data.header);

//     const formattedItems = (res.data.items || []).map((item) => ({
//       ...item,
//       quantity: Number(item.quantity),
//       price_per_unit: Number(item.price_per_unit),
//       discount: Number(item.discount || 0),
//       total_amount: Number(item.total_amount),
//     }));

//     setItems(formattedItems);
//   })

//       .catch(() => alert("Failed to load order"))
//       .finally(() => setLoading(false));
//   }, [orderId, token]);

//   /* ================= UPDATE QTY ================= */
//   const updateQuantity = (index, value) => {
//     const updated = [...items];

//     const qty = Math.max(1, Number(value) || 1);
//     updated[index].quantity = qty;

//     const lineTotal =
//       qty * updated[index].price_per_unit - updated[index].discount;

//     updated[index].total_amount = Number(lineTotal.toFixed(2));
//     setItems(updated);
//   };

//   /* ================= REMOVE ITEM ================= */
//   const removeItem = (index) => {
//     const updated = [...items];
//     updated.splice(index, 1);
//     setItems(updated);
//   };

//   /* ================= CALCULATE TOTAL ================= */
//   const grandTotal = items.reduce(
//     (sum, item) => sum + Number(item.total_amount || 0),
//     0
//   );

//   /* ================= SAVE ORDER ================= */
//   const handleSave = async () => {
//     if (items.length === 0) {
//       alert("Order cannot be empty");
//       return;
//     }

//     setSaving(true);

//     try {
//       await axios.put(
//         `${API_BASE}/restaurant/orders/${orderId}/edit`,
//         { items },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       alert("Order updated successfully");
//       navigate("/restaurantdashboard/orders");
//     } catch (err) {
//       alert(err.response?.data?.error || "Failed to update order");
//     } finally {
//       setSaving(false);
//     }
//   };

//   /* ================= ADD PRODUCTS ================= */
// const handleAddProducts = () => {
//   console.log("CLICKED ADD PRODUCTS");
//   console.log("HEADER DATA:", header);

//   const supplierId =
//     header?.supplier_id ||
//     header?.supplier ||
//     header?.supplierId ||
//     header?.vendor_id;

//   if (!supplierId) {
//     alert("Supplier not found for this order");
//     return;
//   }

//   navigate(
//     `/categorielist?addToOrder=${orderId}&supplier=${supplierId}&lock=1`
//   );
// };




//   /* ================= UI STATES ================= */
//   if (loading) return <p>Loading order...</p>;
//   if (!header) return <p>Order not found</p>;

//   if (header.status !== "PLACED") {
//     return (
//       <div className="dashboard_page">
//         <h3>This order can no longer be modified.</h3>
//         <button
//           className="btn btn-secondary mt-3"
//           onClick={() => navigate(-1)}
//         >
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="dashboard_page">
//       <div className="page_header d-flex gap-2 align-items-center">
//         <h2 className="me-auto">Edit Order #{orderId}</h2>

//         <button
//           className="btn-primary"
//           onClick={() => navigate(-1)}
//         >
//           Cancel
//         </button>

//         <button
//           className="btn btn-primary"
//           onClick={handleAddProducts}
//         >
//           + Add Products
//         </button>
//       </div>

//       <div className="card mt-3">
//         <table className="table order_table">
//           <thead>
//             <tr>
//               <th>Product</th>
//               <th width="120">Qty</th>
//               <th className="text-end">Price</th>
//               <th className="text-end">Line Total</th>
//               <th></th>
//             </tr>
//           </thead>

//           <tbody>
//             {items.map((item, index) => (
//               <tr key={item.item_id}>
//                 <td>{item.product_name_english}</td>

//                 <td>
//                   <input
//                     type="number"
//                     min="1"
//                     className="form-control"
//                     value={item.quantity}
//                     onChange={(e) =>
//                       updateQuantity(index, e.target.value)
//                     }
//                   />
//                 </td>

//                 <td className="text-end">
//                   QAR  {Number(item.price_per_unit).toFixed(2)}
//                 </td>

//                 <td className="text-end">
//                   QAR  {Number(item.total_amount).toFixed(2)}
//                 </td>

//                 <td>
//                   <button
//                     className="btn-primary"
//                     onClick={() => removeItem(index)}
//                   >
//                     Remove
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <div className="text-end mt-3 pe-3">
//           <h4>Total: QAR  {grandTotal.toFixed(2)}</h4>
//         </div>
//       </div>

//       <div className="text-end mt-4">
//         <button
//           className="btn-primary"
//           disabled={saving}
//           onClick={handleSave}
//         >
//           {saving ? "Saving..." : "Save Changes"}
//         </button>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API_BASE = "http://192.168.2.22:5000/api/v1/orders";

export default function EditOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { t, i18n } = useTranslation();

  const [items, setItems] = useState([]);
  const [header, setHeader] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= LOAD ORDER ================= */
  useEffect(() => {
    if (!orderId) return;

    axios
      .get(`${API_BASE}/restaurant/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setHeader(res.data.header);

        const formattedItems = (res.data.items || []).map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          price_per_unit: Number(item.price_per_unit),
          discount: Number(item.discount || 0),
          total_amount: Number(item.total_amount),
        }));

        setItems(formattedItems);
      })
      .catch(() => alert(t("failedToLoadOrder")))
      .finally(() => setLoading(false));
  }, [orderId, token, t]);

  /* ================= UPDATE QTY ================= */
  const updateQuantity = (index, value) => {
    const updated = [...items];

    const qty = Math.max(1, Number(value) || 1);
    updated[index].quantity = qty;

    const lineTotal =
      qty * updated[index].price_per_unit - updated[index].discount;

    updated[index].total_amount = Number(lineTotal.toFixed(2));
    setItems(updated);
  };

  /* ================= REMOVE ITEM ================= */
  const removeItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  /* ================= CALCULATE TOTAL ================= */
  const grandTotal = items.reduce(
    (sum, item) => sum + Number(item.total_amount || 0),
    0
  );

  /* ================= SAVE ORDER ================= */
  const handleSave = async () => {
    if (items.length === 0) {
      alert(t("orderCannotBeEmpty"));
      return;
    }

    setSaving(true);

    try {
      await axios.put(
        `${API_BASE}/restaurant/orders/${orderId}/edit`,
        { items },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(t("orderUpdatedSuccessfully"));
      navigate("/restaurantdashboard/orders");
    } catch (err) {
      alert(err.response?.data?.error || t("failedToUpdateOrder"));
    } finally {
      setSaving(false);
    }
  };

  /* ================= ADD PRODUCTS ================= */
  const handleAddProducts = () => {
    const supplierId =
      header?.supplier_id ||
      header?.supplier ||
      header?.supplierId ||
      header?.vendor_id;

    if (!supplierId) {
      alert(t("supplierNotFound"));
      return;
    }

    navigate(
      `/categorielist?addToOrder=${orderId}&supplier=${supplierId}&lock=1`
    );
  };

  /* ================= UI STATES ================= */
  if (loading) return <p>{t("loadingOrder")}</p>;
  if (!header) return <p>{t("orderNotFound")}</p>;

  if (header.status !== "PLACED") {
    return (
      <div
        className="dashboard_page"
        dir={i18n.language === "ar" ? "rtl" : "ltr"}
      >
        <h3>{t("orderCannotBeModified")}</h3>

        <button
          className="btn btn-secondary mt-3"
          onClick={() => navigate(-1)}
        >
          {t("goBack")}
        </button>
      </div>
    );
  }

  return (
    <div
      className="dashboard_page"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="page_header d-flex gap-2 align-items-center">
        <h2 className="me-auto">
          {t("editOrder")} #{orderId}
        </h2>

        <button
          className="btn-primary"
          onClick={() => navigate(-1)}
        >
          {t("cancel")}
        </button>

        <button
          className="btn btn-primary"
          onClick={handleAddProducts}
        >
          + {t("addProducts")}
        </button>
      </div>

      <div className="card mt-3">
        <table className="table order_table">
          <thead>
            <tr>
              <th>{t("product")}</th>
              <th width="120">{t("qty")}</th>
              <th className="text-end">{t("price")}</th>
              <th className="text-end">{t("lineTotal")}</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => (
              <tr key={item.item_id}>
                <td>
                  {i18n.language === "ar"
                    ? item.product_name_arabic ||
                      item.product_name_english
                    : item.product_name_english}
                </td>

                <td>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(index, e.target.value)
                    }
                  />
                </td>

                <td className="text-end" dir="ltr">
                  {i18n.language === "ar" ? "ر.ق" : "QAR"}{" "}
                  {Number(item.price_per_unit).toFixed(2)}
                </td>

                <td className="text-end" dir="ltr">
                  {i18n.language === "ar" ? "ر.ق" : "QAR"}{" "}
                  {Number(item.total_amount).toFixed(2)}
                </td>

                <td>
                  <button
                    className="btn-primary"
                    onClick={() => removeItem(index)}
                  >
                    {t("remove")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-end mt-3 pe-3">
          <h4 dir="ltr">
            {t("total")}:{" "}
            {i18n.language === "ar" ? "ر.ق" : "QAR"}{" "}
            {grandTotal.toFixed(2)}
          </h4>
        </div>
      </div>

      <div className="text-end mt-4">
        <button
          className="btn-primary"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? t("saving") : t("saveChanges")}
        </button>
      </div>
    </div>
  );
}