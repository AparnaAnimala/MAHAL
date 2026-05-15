// import React, { useEffect, useState } from "react";

// const API = "http://192.168.2.9:5000/api/v1";

// const CreateGRN = ({ orderId }) => {
//   const token = localStorage.getItem("token");

//   const [grn, setGrn] = useState({
//     header: null,
//     items: [],
//   });

//   const [loading, setLoading] = useState(false);

//   /* =========================
//      LOAD / CREATE GRN
//   ========================= */
//   useEffect(() => {
//     if (!orderId) return;

//     const loadGRN = async () => {
//       try {
//         setLoading(true);

//         // 1️⃣ Try fetch existing GRN
//         let res = await fetch(`${API}/grn/${orderId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         // 2️⃣ If not exists → create
//         if (!res.ok) {
//           const create = await fetch(`${API}/grn/${orderId}`, {
//             method: "POST",
//             headers: { Authorization: `Bearer ${token}` },
//           });

//           if (!create.ok) {
//             throw new Error("Failed to create GRN");
//           }

//           res = await fetch(`${API}/grn/${orderId}`, {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//         }

//         const data = await res.json();

//         setGrn({
//           header: data.header,
//           items: Array.isArray(data.items) ? data.items : [],
//         });
//       } catch (e) {
//         console.error("GRN load failed", e);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadGRN();
//   }, [orderId, token]);

//   /* =========================
//      GUARDS
//   ========================= */
//   if (!orderId) {
//     return (
//       <div style={{ padding: 24 }}>
//         <h3>No Order Selected</h3>
//         <p>Please open GRN from a <b>Delivered Order</b>.</p>
//       </div>
//     );
//   }

//   if (loading || !grn.header) {
//     return <p>Loading GRN...</p>;
//   }

//   const isConfirmed = grn.header.status === "CONFIRMED";

//   /* =========================
//      ACTIONS
//   ========================= */

//   const updateItem = (id, field, value) => {
//     const updated = grn.items.map(i =>
//       i.grn_item_id === id ? { ...i, [field]: value } : i
//     );
//     setGrn({ ...grn, items: updated });
//   };

//   const saveGRN = async () => {
//     await fetch(`${API}/grn/${grn.header.grn_id}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ items: grn.items }),
//     });

//     alert("GRN saved (Draft)");
//   };

//   const confirmGRN = async () => {
//     const res = await fetch(
//       `${API}/grn/${grn.header.grn_id}/confirm`,
//       {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     const data = await res.json();

//     if (!res.ok) {
//       alert(data.error || "Failed to confirm GRN");
//       return;
//     }

//     alert("GRN confirmed");
//     window.location.reload();
//   };

//   /* =========================
//      RENDER
//   ========================= */

//   return (
//     <div className="card">
//       <h4>
//         Goods Receipt Note (GRN)
//         <span style={{ marginLeft: 10, fontSize: 13 }}>
//           Status:{" "}
//           <b style={{ color: isConfirmed ? "green" : "orange" }}>
//             {grn.header.status}
//           </b>
//         </span>
//       </h4>

//       <table className="mini_table">
//         <thead>
//           <tr>
//             <th>Product</th>
//             <th>Ordered</th>
//             <th>Received</th>
//             <th>Rejected</th>
//           </tr>
//         </thead>

//         <tbody>
//           {grn.items.map((i) => (
//             <tr key={i.grn_item_id}>
//               <td>{i.product_id}</td>
//               <td>{i.ordered_quantity}</td>

//               <td>
//                 <input
//                   type="number"
//                   min="0"
//                   disabled={isConfirmed}
//                   value={i.received_quantity ?? 0}
//                   onChange={(e) =>
//                     updateItem(
//                       i.grn_item_id,
//                       "received_quantity",
//                       Number(e.target.value)
//                     )
//                   }
//                 />
//               </td>

//               <td>
//                 <input
//                   type="number"
//                   min="0"
//                   disabled={isConfirmed}
//                   value={i.rejected_quantity ?? 0}
//                   onChange={(e) =>
//                     updateItem(
//                       i.grn_item_id,
//                       "rejected_quantity",
//                       Number(e.target.value)
//                     )
//                   }
//                 />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* ACTION BUTTONS */}
//       <div style={{ marginTop: 16 }}>
//         {!isConfirmed && (
//           <>
//             <button onClick={saveGRN}>Save Draft</button>
//             <button
//               onClick={confirmGRN}
//               style={{ marginLeft: 10 }}
//             >
//               Confirm GRN
//             </button>
//           </>
//         )}

//         {isConfirmed && (
//           <div style={{ color: "green", fontWeight: "bold" }}>
//             ✔ GRN Confirmed — Inventory will be updated
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CreateGRN;


// import React, { useEffect, useState } from "react";
// import "../../css/grn.css"; 
// const API = "http://192.168.2.9:5000/api/v1";

// const CreateGRN = ({ orderId }) => {
//   const token = localStorage.getItem("token");

//   const [grn, setGrn] = useState({ header: null, items: [] });
//   const [loading, setLoading] = useState(false);

//   /* =========================
//      LOAD / CREATE GRN
//   ========================= */
//   useEffect(() => {
//     if (!orderId) return;

//     const load = async () => {
//       setLoading(true);

//       let res = await fetch(`${API}/grn/${orderId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!res.ok) {
//         await fetch(`${API}/grn/${orderId}`, {
//           method: "POST",
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         res = await fetch(`${API}/grn/${orderId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       }

//       const data = await res.json();
//       setGrn({ header: data.header, items: data.items || [] });
//       setLoading(false);
//     };

//     load();
//   }, [orderId, token]);

//   if (!orderId) return <p>No order selected</p>;
//   if (loading || !grn.header) return <p>Loading GRN...</p>;

//   const isConfirmed = grn.header.status === "CONFIRMED";

//   /* =========================
//      HELPERS
//   ========================= */
//   const updateItem = (id, received) => {
//     const updated = grn.items.map(i => {
//       if (i.grn_item_id !== id) return i;
//       return {
//         ...i,
//         received_quantity: received,
//         rejected_quantity: i.ordered_quantity - received
//       };
//     });
//     setGrn({ ...grn, items: updated });
//   };

//   const statusOf = (i) =>
//     i.received_quantity === i.ordered_quantity
//       ? "Perfect"
//       : "Shortage";

//   const totalOrdered = grn.items.reduce((s, i) => s + i.ordered_quantity, 0);
//   const totalReceived = grn.items.reduce((s, i) => s + i.received_quantity, 0);
//   const formatGrnNo = (id) => {
//     if (!id) return "";
//     return `GRN-${new Date().getFullYear()}-${String(id).padStart(3, "0")}`;
//   };

//   /* =========================
//      SAVE / CONFIRM
//   ========================= */
//   const saveGRN = async () => {
//     await fetch(`${API}/grn/${grn.header.grn_id}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ items: grn.items }),
//     });
//     alert("GRN saved");
//   };

//   const confirmGRN = async () => {
//     const res = await fetch(
//       `${API}/grn/${grn.header.grn_id}/confirm`,
//       {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     const data = await res.json();
//     if (!res.ok) return alert(data.error);

//     alert("GRN confirmed");
//     window.location.reload();
//   };

//   /* =========================
//      UI
//   ========================= */
//   return (
//     <div className="card">
//       <h4>Goods Receipt Note</h4>

//       <div className="grn_header_card">
//         <div className="grn_top">
//           <span>User: {localStorage.getItem("username")}</span>
//           <span className="grn_no">
//             {formatGrnNo(grn.header.grn_id)}
//           </span>
//         </div>

//         <div className="grn_supplier">
//           <b>Supplier:</b> {grn.header.supplier_name}
//         </div>

//         <div className="grn_status">
//           Status: <b>{grn.header.status}</b>
//         </div>
//       </div>


//       <table className="mini_table">
//         <thead>
//           <tr>
//             <th>Item</th>
//             <th>Ordered</th>
//             <th>Received</th>
//             <th>Rejected</th>
//             <th>Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {grn.items.map(i => (
//             <tr key={i.grn_item_id}>
//               <td><b>{i.product_name}</b></td>
//               <td>{i.ordered_quantity} {i.uom}</td>
//               <td>
//                 <div className={`received_box ${
//                   i.received_quantity === i.ordered_quantity ? "perfect" : "shortage"
//                 }`}>
//                   <input
//                     type="number"
//                     min="0"
//                     disabled={isConfirmed}
//                     value={i.received_quantity}
//                     onChange={(e) =>
//                       updateItem(i.grn_item_id, Number(e.target.value))
//                     }
//                   />
//                   <span className="uom">{i.uom}</span>
//                 </div>

//               </td>
//               <td>{i.rejected_quantity}</td>
//               <td>
//                 {i.received_quantity === i.ordered_quantity ? (
//                   <span className="status ok">✔ Perfect</span>
//                 ) : (
//                   <span className="status warn">⚠ Shortage</span>
//                 )}
//               </td>

//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <div className="grn_footer">
//         <span>Total Items: {grn.items.length}</span>
//         <span>
//           Ordered: {totalOrdered} | Received: {totalReceived}
//         </span>
//       </div>


//       <div className="signature_box">
//         <div className="sign_area">
//           <p>Tap to Sign</p>
//         </div>

//         <button className="photo_btn">
//           📷 Attach Photo
//         </button>
//       </div>


//       {!isConfirmed && (
//         <>
//           <button onClick={saveGRN}>Save Draft</button>
//           <button onClick={confirmGRN} style={{ marginLeft: 10 }}>
//             Confirm GRN
//           </button>
//         </>
//       )}

//       {isConfirmed && (
//         <p style={{ color: "green", fontWeight: 600 }}>
//           ✔ Inventory Updated
//         </p>
//       )}
//     </div>
//   );
// };

// export default CreateGRN;












// import React, { useEffect, useState } from "react";
// import "../css/grn_new.css";
// import { useParams, useNavigate } from "react-router-dom";


// const API = "http://192.168.2.9:5000/api/v1";

// export default function CreateGRN() {
//   const { orderId } = useParams();
  

//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   const [grn, setGrn] = useState({ header: null, items: [] });
//   const [loading, setLoading] = useState(false);
//   const [remarks, setRemarks] = useState("");
//   const [image, setImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);

//   useEffect(() => {
//     if (!orderId) return;

//     const load = async () => {
//       setLoading(true);

//       let res = await fetch(`${API}/grn/${orderId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!res.ok) {
//         await fetch(`${API}/grn/${orderId}`, {
//           method: "POST",
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         res = await fetch(`${API}/grn/${orderId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       }

//       const data = await res.json();
//       setGrn({ header: data.header, items: data.items || [] });
//       setLoading(false);
//     };

//     load();
//   }, [orderId, token]);

//   if (!orderId) return <p>No order selected</p>;
//   if (loading || !grn.header) return <p>Loading GRN...</p>;

//   const isConfirmed = grn.header.status === "CONFIRMED";

//   /* ---------------- HELPERS ---------------- */
//   const updateItem = (id, received) => {
//     const updated = grn.items.map(i =>
//       i.grn_item_id === id
//         ? {
//             ...i,
//             received_quantity: received,
//             rejected_quantity: i.ordered_quantity - received,
//           }
//         : i
//     );
//     setGrn({ ...grn, items: updated });
//   };

//   const grnNo = `GRN-${String(grn.header.grn_id).padStart(5, "0")}`;

//   const totals = grn.items.reduce(
//   (a, i) => {
//     a.ordered += Number(i.ordered_quantity || 0);
//     a.received += Number(i.received_quantity || 0);
//     a.rejected += Number(i.rejected_quantity || 0);
//     return a;
//   },
//   { ordered: 0, received: 0, rejected: 0 }
// );


//   /* ---------------- ACTIONS ---------------- */
//   const saveGRN = async () => {
//     await fetch(`${API}/grn/${grn.header.grn_id}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ items: grn.items }),
//     });
//     alert("GRN saved");
//   };

//   const confirmGRN = async () => {
//   if (!image) {
//     alert("Signature / proof is mandatory before confirming GRN");
//     return;
//   }

//   const res = await fetch(
//     `${API}/grn/${grn.header.grn_id}/confirm`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         image_base64: image.base64,
//         image_mime: image.mime,
//       }),
//     }
//   );

//   const data = await res.json();
//   if (!res.ok) return alert(data.error);

//   alert("GRN confirmed with image proof");
//   window.location.reload();
// };




//  const handleImage = e => {
//   const file = e.target.files[0];
//   if (!file) return;

//   const reader = new FileReader();
//   reader.onload = () => {
//     const base64 = reader.result.split(",")[1];
//     setImage({
//       base64,
//       mime: file.type
//     });
//     setImagePreview(reader.result);
//   };
//   reader.readAsDataURL(file);
// };

// const downloadPDF = async () => {
//   const res = await fetch(`${API}/grn/${grn.header.grn_id}/pdf`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!res.ok) {
//     alert("PDF not available yet");
//     return;
//   }

//   const blob = await res.blob();
//   const url = window.URL.createObjectURL(blob);

//   const a = document.createElement("a");
//   a.href = url;
//   a.download = `GRN-${grn.header.grn_id}.pdf`;
//   a.click();

//   window.URL.revokeObjectURL(url);
// };
// const printPDF = async () => {
//   const res = await fetch(`${API}/grn/${grn.header.grn_id}/pdf`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!res.ok) {
//     alert("PDF not available");
//     return;
//   }

//   const blob = await res.blob();
//   const url = window.URL.createObjectURL(blob);

//   const iframe = document.createElement("iframe");
//   iframe.style.display = "none";
//   iframe.src = url;
//   document.body.appendChild(iframe);

//   iframe.onload = () => {
//     iframe.contentWindow.print();
//   };
// };


//   /* ---------------- UI ---------------- */
//   return (
//     <div className="grn-wrapper">
//       {/* HEADER */}
//       <div className="page_header">
//         <h2>Goods Receipt Note (GRN)</h2>

//         <button
//           className="btn_add_item_v2"
//           onClick={() => navigate(-1)}
//         >
//           <i className="fa fa-arrow-left me-2"></i>Back
//         </button>

//       </div>
//       {/* <div className="grn-topbar"> */}
//         <div className="grn-top-actions">
//           <span className={`grn-status ${grn.header.status.toLowerCase()}`}>
//             {grn.header.status}
//           </span>

//           {isConfirmed && (
//             <button
//               className="print-btn"
//               title="Print GRN"
//               onClick={printPDF}
//             >
//               🖨️
//             </button>
//           )}
//         </div>
//       {/* </div> */}


//       <div className="grn-no">GRN No: {grnNo}</div>

//       {/* HEADER DETAILS */}
//       <div className="grn-header-card">
//         <div>
//           <label>Supplier</label>
//           <div>{grn.header.supplier_name}</div>
//         </div>
//         <div>
//           <label>Received By</label>
//           <div>{localStorage.getItem("username")}</div>
//         </div>
//         <div>
//           <label>GRN Date</label>
//           <div>{new Date().toLocaleDateString()}</div>
//         </div>
//       </div>

//       {/* MAIN CONTENT */}
//       <div className="grn-body">
//         {/* ITEMS TABLE */}
//         <div className="grn-table-card">
//           <table>
//             <thead>
//               <tr>
//                 <th>Product</th>
//                 <th>UOM</th>
//                 <th>Ordered</th>
//                 <th>Received</th>
//                 <th>Rejected</th>
//                 <th>Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {grn.items.map(i => (
//                 <tr key={i.grn_item_id}>
//                   <td>{i.product_name}</td>
//                   <td>{i.uom}</td>
//                   <td>{i.ordered_quantity}</td>
//                   <td>
//                     <input
//                         type="number"
//                         disabled={isConfirmed}
//                         value={i.received_quantity}
//                         min={0}
//                         max={i.ordered_quantity}
//                         step="1"
//                         onKeyDown={e => {
//                           if (e.key === "ArrowUp") e.preventDefault();
//                         }}
//                         onChange={e => {
//                           const value = Number(e.target.value);
//                           if (value <= i.ordered_quantity && value >= 0) {
//                             updateItem(i.grn_item_id, value);
//                           }
//                         }}
//                       />
//                     {/* <input
//   type="number"
//   disabled={isConfirmed}
//   value={i.received_quantity}
//   min={0}
//   max={i.ordered_quantity}
//   onChange={e => {
//     const value = Number(e.target.value);

//     // ❌ Block increase beyond ordered qty
//     if (value > i.ordered_quantity) return;

//     // ❌ Block negative values
//     if (value < 0) return;

//     updateItem(i.grn_item_id, value);
//   }}
// /> */}

//                   </td>
//                   <td>{i.rejected_quantity}</td>
//                   <td>
//                     {i.rejected_quantity > 0 ? (
//                       <span className="short">Short {i.rejected_quantity}</span>
//                     ) : (
//                       <span className="ok">Perfect</span>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* SUMMARY */}
//         <div className="grn-summary-card">
//           <h4>GRN Summary</h4>

//           <div className="summary-row">
//             <span>Total Items</span>
//             <b>{grn.items.length}</b>
//           </div>

//           <div className="summary-row">
//             <span>Total Ordered Qty</span>
//             <b>{totals.ordered}</b>
//           </div>

//           <div className="summary-row">
//             <span>Total Received Qty</span>
//             <b>{totals.received}</b>
//           </div>

//           <div className="summary-row">
//             <span>Total Rejected Qty</span>
//             <b>{totals.rejected}</b>
//           </div>
//         </div>
//       </div>

//       {/* REMARKS */}
//       <div className="grn-remarks">
//         <label>GRN Remarks</label>
//         <textarea
//           placeholder="Enter remarks (optional)"
//           value={remarks}
//           onChange={e => setRemarks(e.target.value)}
//         />
//       </div>
      
//       {/* SIGN / PROOF AREA */}
//      {!isConfirmed && (
//         <div
//           className="grn-sign-box"
//           onClick={() => document.getElementById("grn-proof-input").click()}
//         >
//           {!imagePreview ? (
//             <span className="sign-text">Tap to Sign</span>
//           ) : (
//             <img src={imagePreview} alt="GRN Proof" className="sign-preview" />
//           )}

//           <button
//             className="camera-btn"
//             onClick={e => {
//               e.stopPropagation();
//               document.getElementById("grn-proof-input").click();
//             }}
//           >
//             📷
//           </button>

//           <input
//             id="grn-proof-input"
//             type="file"
//             accept="image/*"
//             hidden
//             onChange={handleImage}
//           />
//         </div>
//       )}



//         {/* ACTIONS */}
//       <div className="grn-actions">

//         {!isConfirmed && (
//           <>
//             <button className="btn-primary" onClick={saveGRN}>
//               Save Draft
//             </button>

//             <button className="btn-primary" onClick={confirmGRN}>
//               Confirm GRN
//             </button>
//           </>
//         )}

//         {isConfirmed && (
//           <button className="btn-primary" onClick={downloadPDF}>
//             Download PDF
//           </button>
//         )}

//       </div>


//       {isConfirmed && (
//         <div className="grn-success">
//           ✔ GRN Confirmed — Inventory successfully updated
//         </div>
//       )}
//     </div>
//   );
// }




import React, { useEffect, useState } from "react";
import "../css/grn_new.css";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";


const API = "http://192.168.2.9:5000/api/v1";

export default function CreateGRN() {
  const { orderId } = useParams();
  

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [grn, setGrn] = useState({ header: null, items: [] });
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { t, i18n } = useTranslation();

  const formatNumber = (value) => {
  return new Intl.NumberFormat(
    i18n.language === "ar" ? "ar-QA" : "en-US"
  ).format(value);
};

const formatGRN = (id) => {
  const base = `GRN-${String(id).padStart(5, "0")}`;

  if (i18n.language !== "ar") return base;

  return base.replace(/\d/g, (d) =>
    new Intl.NumberFormat("ar-QA").format(d)
  );
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString(
    i18n.language === "ar" ? "ar-QA" : "en-US"
  );
};

  useEffect(() => {
    if (!orderId) return;

    const load = async () => {
      setLoading(true);

      let res = await fetch(`${API}/grn/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        await fetch(`${API}/grn/${orderId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        res = await fetch(`${API}/grn/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const data = await res.json();
      setGrn({ header: data.header, items: data.items || [] });
      setLoading(false);
    };

    load();
  }, [orderId, token]);

  if (!orderId) return <p>No order selected</p>;
  if (loading || !grn.header) return <p>Loading GRN...</p>;

  const isConfirmed = grn.header.status === "CONFIRMED";

  /* ---------------- HELPERS ---------------- */
  const updateItem = (id, received) => {
    const updated = grn.items.map(i =>
      i.grn_item_id === id
        ? {
            ...i,
            received_quantity: received,
            rejected_quantity: Math.max(0, i.ordered_quantity - received),
          }
        : i
    );
    setGrn({ ...grn, items: updated });
  };

 const grnNo = formatGRN(grn.header.grn_id);

  const totals = grn.items.reduce(
  (a, i) => {
    a.ordered += Number(i.ordered_quantity || 0);
    a.received += Number(i.received_quantity || 0);
    a.rejected += Number(i.rejected_quantity || 0);
    return a;
  },
  { ordered: 0, received: 0, rejected: 0 }
);


  /* ---------------- ACTIONS ---------------- */
  const saveGRN = async () => {
    await fetch(`${API}/grn/${grn.header.grn_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
  items: grn.items,
  remarks
})
    });
    alert("GRN saved");
  };

  const confirmGRN = async () => {
  if (!image) {
    alert("Signature / proof is mandatory before confirming GRN");
    return;
  }

  const res = await fetch(
    `${API}/grn/${grn.header.grn_id}/confirm`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        image_base64: image.base64,
        image_mime: image.mime,
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) return alert(data.error);

  alert("GRN confirmed with image proof");
  window.location.reload();
};




 const handleImage = e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result.split(",")[1];
    setImage({
      base64,
      mime: file.type
    });
    setImagePreview(reader.result);
  };
  reader.readAsDataURL(file);
};

const downloadPDF = async () => {
  const res = await fetch(`${API}/grn/${grn.header.grn_id}/pdf`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    alert("PDF not available yet");
    return;
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `GRN-${grn.header.grn_id}.pdf`;
  a.click();

  window.URL.revokeObjectURL(url);
};
const printPDF = async () => {
  const res = await fetch(`${API}/grn/${grn.header.grn_id}/pdf`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    alert("PDF not available");
    return;
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = url;
  document.body.appendChild(iframe);

  iframe.onload = () => {
    iframe.contentWindow.print();
  };
};


  /* ---------------- UI ---------------- */
  return (
    <div className="dashboard_page grn_page" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      {/* HEADER */}
      <div className="page_header glass">
        <h2>{t("grn_title")}</h2>

      <button className="btn_save glow" onClick={() => navigate(-1)}>
        <i className="fa fa-arrow-left me-2"></i>
        {t("grn_back")}
      </button>
      
      </div>
      {/* <div className="grn-topbar"> */}
        <div className="grn-top-actions">
          <span className={`grn-status ${grn.header?.status?.toLowerCase()}`}>
            {t("grn_no")}: {grnNo}
          </span>

          {isConfirmed && (
            <button
              className="print-btn"
              title="Print GRN"
              onClick={printPDF}
            >
              🖨️
            </button>
          )}
        </div>
        
      {/* </div> */}


      <div className="section_card soft d-flex align-items-center gap-3 mb-3">{t("grn_no")}: {grnNo}</div>

      {/* HEADER DETAILS */}
     <div className="section_card soft mb-3">
       <div className="row">

    <div className="col-md-4">
      <small className="muted">{t("grn_supplier")}</small>
    <div>
      {i18n.language === "ar"
        ? grn.header.supplier_name_arabic || grn.header.supplier_name
        : grn.header.supplier_name}
    </div>
    </div>

    <div className="col-md-4">
      <small className="muted">{t("grn_received_by")}</small>
      <div>{localStorage.getItem("username")}</div>
    </div>

    <div className="col-md-4">
      <small className="muted">{t("grn_date")}</small>
      <div>{formatDate(new Date())}</div>
    </div>

    </div>
 </div>

      {/* MAIN CONTENT */}
      <div className="section_card soft">
        <div className="row">
          <div className="col-md-8">
            <table className="table align-middle">
            <thead>
              <tr>
                <th>{t("grn_product")}</th>
                <th>{t("grn_uom")}</th>
                <th>{t("grn_ordered")}</th>
                <th>{t("grn_received")}</th>
                <th>{t("grn_rejected")}</th>
                <th>{t("grn_status")}</th>
              </tr>
            </thead>
            <tbody>
              {grn.items?.map(i => (
                <tr key={i.grn_item_id}>
                  <td>
                    {i18n.language === "ar"
                      ? i.product_name_arabic || i.product_name
                      : i.product_name}
                  </td>
                  <td>{i.uom}</td>
                  <td>{formatNumber(i.ordered_quantity)}</td>
                  <td>
                    <input
                        type="number"
                        className="form-control form-control-sm"
                        disabled={isConfirmed}
                        value={i.received_quantity}
                        min={0}
                        max={i.ordered_quantity}
                        step="1"
                        onKeyDown={e => {
                          if (e.key === "ArrowUp") e.preventDefault();
                        }}
                        onChange={e => {
                          const value = Number(e.target.value);
                          if (value <= i.ordered_quantity && value >= 0) {
                            updateItem(i.grn_item_id, value);
                          }
                        }}
                      />
                    {/* <input
  type="number"
  disabled={isConfirmed}
  value={i.received_quantity}
  min={0}
  max={i.ordered_quantity}
  onChange={e => {
    const value = Number(e.target.value);

    // ❌ Block increase beyond ordered qty
    if (value > i.ordered_quantity) return;

    // ❌ Block negative values
    if (value < 0) return;

    updateItem(i.grn_item_id, value);
  }}
/> */}

                  </td>
                  <td>{formatNumber(i.rejected_quantity)}</td>
                  <td>
                    {i.rejected_quantity > 0 ? (
                      <span className="short">
                        {t("grn_short")} {formatNumber(i.rejected_quantity)}
                      </span>
                    ) : (
                      <span className="ok">{t("grn_perfect")}</span>
)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SUMMARY */}
<div className="grn-summary-card">
  <h4>{t("grn_summary")}</h4>

  <div className="col-md-4">
    <span>{t("grn_total_items")}</span>
    <b>{formatNumber(grn.items.length)}</b>
  </div>

  <div className="col-md-4">
    <span>{t("grn_total_ordered")}</span>
    <b>{formatNumber(totals.ordered)}</b>
  </div>

  <div className="col-md-4">
    <span>{t("grn_total_received")}</span>
    <b>{formatNumber(totals.received)}</b>
  </div>

  <div className="col-md-4">
    <span>{t("grn_total_rejected")}</span>
    <b>{formatNumber(totals.rejected)}</b>
  </div>
</div>

</div> {/* CLOSE row */}
</div> {/* CLOSE section_card */}

      {/* REMARKS */}
      <div className="mt-3">
        <label className="form-label">{t("grn_remarks")}</label>
        <textarea
         placeholder={t("grn_remarks_placeholder")}
          value={remarks}
          onChange={e => setRemarks(e.target.value)}
        />
      </div>
      
      {/* SIGN / PROOF AREA */}
     {!isConfirmed && (
        <div
          className="grn-sign-box"
          onClick={() => document.getElementById("grn-proof-input").click()}
        >
          {!imagePreview ? (
            <span className="sign-text">{t("grn_tap_sign")}</span>
          ) : (
            <img src={imagePreview} alt="GRN Proof" className="sign-preview" />
          )}

          <button
            className="camera-btn"
            onClick={e => {
              e.stopPropagation();
              document.getElementById("grn-proof-input").click();
            }}
          >
            📷
          </button>

          <input
            id="grn-proof-input"
            type="file"
            accept="image/*"
            hidden
            onChange={handleImage}
          />
        </div>
      )}



        {/* ACTIONS */}
      <div className="mt-4">

        {!isConfirmed && (
          <><div className="d-flex justify-content-center gap-3">
            <button className="btn btn-outline-orange" onClick={saveGRN}>
              {t("grn_save")}
            </button>

            <button className="btn_save glow" onClick={confirmGRN}>
              {t("grn_confirm")}
            </button>
            </div>
          </>
        )}

        {isConfirmed && (
          <button onClick={downloadPDF}>
              <i className="fa fa-download me-2"></i>
              {t("grn_download")}
            </button>
        )}

      </div>


      {isConfirmed && (
        <div className="grn-success">
           {t("grn_success")}
        </div>
      )}
    </div>
  );
}
