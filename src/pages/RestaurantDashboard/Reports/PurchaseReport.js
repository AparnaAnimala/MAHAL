// import React, { useEffect, useState, useMemo } from "react";
// import axios from "axios";

// const API = "http://192.168.2.9:5000/api/v1/restaurant/reports/purchases";

// const ITEMS_PER_PAGE = 5;

// const PurchaseReport = () => {

//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [statusFilter, setStatusFilter] = useState("ALL");
//   const [supplierFilter, setSupplierFilter] = useState("ALL");
//   const [searchTerm, setSearchTerm] = useState("");

//   const [currentPage, setCurrentPage] = useState(1);

//   const token = localStorage.getItem("token");

//   /* ================= CURRENCY ================= */

//   const formatQAR  = (amount) =>
//     new Intl.NumberFormat("en-QA", {
//       style: "currency",
//       currency: "QAR"
//     }).format(amount || 0);


//   /* ================= FETCH ================= */

//   const loadReport = async () => {

//     try {
//       setLoading(true);

//       const res = await axios.get(API, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       setData(res.data || []);

//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadReport();
//   }, []);


//   /* RESET PAGE WHEN FILTER CHANGES */
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [statusFilter, supplierFilter, searchTerm, data]);


//   /* ================= FILTER ================= */

//   const suppliers = [...new Set(data.map(d => d.supplier_name))];

//   const filteredData = useMemo(() => {

//     return data.filter(r => {

//       const statusOk =
//         statusFilter === "ALL" || r.status === statusFilter;

//       const supplierOk =
//         supplierFilter === "ALL" || r.supplier_name === supplierFilter;

//       const searchOk =
//         !searchTerm ||
//         String(r.order_id)
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase()) ||
//         String(r.product_name_english)
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase()) ||
//         String(r.supplier_name)
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase());

//       return statusOk && supplierOk && searchOk;

//     });

//   }, [data, statusFilter, supplierFilter, searchTerm]);


//   /* ================= SUMMARY ================= */

//   const totalAmount = filteredData.reduce(
//     (sum, r) => sum + Number(r.item_total || 0),
//     0
//   );

//   const totalQty = filteredData.reduce(
//     (sum, r) => sum + Number(r.quantity || 0),
//     0
//   );

//   const uniqueOrders = new Set(filteredData.map(r => r.order_id)).size;

//   const uniqueSuppliers = new Set(filteredData.map(r => r.supplier_name)).size;


//   /* ================= PAGINATION ================= */

//   const totalPages = Math.max(
//     1,
//     Math.ceil(filteredData.length / ITEMS_PER_PAGE)
//   );

//   const safePage = Math.min(currentPage, totalPages);

//   const paginatedData = filteredData.slice(
//     (safePage - 1) * ITEMS_PER_PAGE,
//     safePage * ITEMS_PER_PAGE
//   );


//   if (loading) return <p>Loading purchase report...</p>;


//   return (
//     <div className="report_page">

//       {/* HEADER */}
//       <div className="page_header glass">
//         <h2>Purchase Report</h2>
//       </div>


//       {/* KPI */}
//       <div className="kpi_grid">

//         <div className="kpi_card">
//           <p>Total Purchase</p>
//           <h3>{formatQAR (totalAmount)}</h3>
//         </div>

//         <div className="kpi_card">
//           <p>Total Orders</p>
//           <h3>{uniqueOrders}</h3>
//         </div>

//         <div className="kpi_card">
//           <p>Total Quantity</p>
//           <h3>{totalQty}</h3>
//         </div>

//         <div className="kpi_card">
//           <p>Suppliers</p>
//           <h3>{uniqueSuppliers}</h3>
//         </div>

//       </div>


//       {/* FILTER BAR */}
//       <div className="filter_bar">

//         {/* SEARCH */}
//         <input
//           type="text"
//           placeholder="Search Order / Product / Supplier..."
//           value={searchTerm}
//           onChange={e => setSearchTerm(e.target.value)}
//           style={{ minWidth: 260 }}
//         />

//         <select
//           value={statusFilter}
//           onChange={e => setStatusFilter(e.target.value)}
//         >
//           <option value="ALL">All Status</option>
//           <option value="DELIVERED">Delivered</option>
//           <option value="PENDING">Pending</option>
//           <option value="CANCELLED">Cancelled</option>
//         </select>

//         <select
//           value={supplierFilter}
//           onChange={e => setSupplierFilter(e.target.value)}
//         >
//           <option value="ALL">All Suppliers</option>

//           {suppliers.map(s => (
//             <option key={s}>{s}</option>
//           ))}

//         </select>

//       </div>


//       {/* TABLE */}
//       <table className="mini_table">

//         <thead>
//           <tr>
//             <th>Order ID</th>
//             <th>Date</th>
//             <th>Supplier</th>
//             <th>Product</th>
//             <th>Qty</th>
//             <th>Amount</th>
//             <th>Status</th>
//           </tr>
//         </thead>

//         <tbody>

//           {paginatedData.length === 0 ? (
//             <tr>
//               <td colSpan="7" style={{ textAlign: "center" }}>
//                 No data found
//               </td>
//             </tr>
//           ) : (

//             paginatedData.map((r, i) => (

//               <tr key={i}>

//                 <td>{r.order_id}</td>

//                 <td>
//                   {r.order_date
//                     ? new Date(r.order_date).toLocaleDateString()
//                     : "-"}
//                 </td>

//                 <td>{r.supplier_name}</td>

//                 <td>{r.product_name_english}</td>

//                 <td>{r.quantity}</td>

//                 <td>{formatQAR (r.item_total)}</td>

//                 <td>
//                   <span className={`status ${
//                     r.status === "DELIVERED"
//                       ? "ok"
//                       : r.status === "CANCELLED"
//                       ? "danger"
//                       : "warn"
//                   }`}>
//                     {r.status}
//                   </span>
//                 </td>

//               </tr>

//             ))

//           )}

//         </tbody>

//       </table>


//       {/* PAGINATION */}
//       <div className="pagination">

//         <button
//           disabled={safePage === 1}
//           onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//         >
//           Prev
//         </button>

//         <span>
//           Page {safePage} of {totalPages}
//         </span>

//         <button
//           disabled={safePage === totalPages}
//           onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//         >
//           Next
//         </button>

//       </div>

//     </div>
//   );
// };

// export default PurchaseReport;



import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const API = "http://192.168.2.9:5000/api/v1/restaurant/reports/purchases";

const ITEMS_PER_PAGE = 5;

const PurchaseReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [supplierFilter, setSupplierFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const token = localStorage.getItem("token");
  const { t, i18n } = useTranslation();

  /* ================= CURRENCY ================= */
  const formatQAR = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "QAR",
    }).format(amount || 0);

  /* ================= FETCH ================= */
  const loadReport = async () => {
    try {
      setLoading(true);

      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  /* RESET PAGE WHEN FILTER CHANGES */
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, supplierFilter, searchTerm, data]);

  /* ================= STATUS LABEL ================= */
  const statusLabel = (status) => {
    if (status === "PLACED") return t("resplaced");
    if (status === "DELIVERED") return t("resdelivered");
    if (status === "PENDING") return t("respending");
    if (status === "CANCELLED") return t("rescancelled");
    return status;
  };

  /* ================= FILTER ================= */
const suppliers = [
  ...new Set(
    data.map(d =>
      i18n.language === "ar"
        ? d.company_name_arabic || d.company_name_english
        : d.company_name_english
    )
  )
];

  const filteredData = useMemo(() => {
    return data.filter((r) => {
      const supplierName =
        i18n.language === "ar"
    ? r.company_name_arabic || r.company_name_english
    : r.company_name_english;

      const productName =
        i18n.language === "ar"
          ? r.product_name_arabic || r.product_name_english
          : r.product_name_english;

      const statusOk =
        statusFilter === "ALL" || r.status === statusFilter;

      const supplierOk =
        supplierFilter === "ALL" || supplierName === supplierFilter;

      const searchOk =
        !searchTerm ||
        String(r.order_id)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(productName)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(supplierName)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return statusOk && supplierOk && searchOk;
    });
  }, [data, statusFilter, supplierFilter, searchTerm, i18n.language]);

  /* ================= SUMMARY ================= */
const totalAmount = filteredData.reduce(
    (sum, r) => sum + Number(r.total_amount || 0),
    0
  );

  const totalQty = filteredData.reduce(
    (sum, r) =>
      sum +
      (r.items?.reduce((q, item) => q + Number(item.quantity || 0), 0) || 0),
    0
  );

  const uniqueOrders = new Set(filteredData.map((r) => r.order_id)).size;

  const uniqueSuppliers = new Set(
    filteredData.map((r) =>
      i18n.language === "ar"
        ? r.company_name_arabic || r.company_name_english
        : r.company_name_english
    )
  ).size;

  /* ================= PAGINATION ================= */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = filteredData.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  if (loading) return <p>{t("resloading_purchase_report")}</p>;

  return (
    <div className="report_page">
      {/* HEADER */}
      <div className="page_header glass">
        <h2>{t("respurchase_report")}</h2>
        <div className="header_actions">
          
      <button className="btn dark bulk_btn" onClick={async () => {
    try {
      const res = await axios.get(API + "/export", {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: statusFilter,
          supplier: supplierFilter
        }
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "purchase_report.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (err) {
      console.error("Download failed", err);
    }
  }}>{t("excel")}</button>
        <button className="btn dark pdf_btn" onClick={async () => {
    try {
      const res = await axios.get(API + "/pdf", {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: statusFilter,
          supplier: supplierFilter
        }
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "purchase_report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (err) {
      console.error("PDF Download failed", err);
    }
  }}> {t("download_pdf")}</button>
 
        </div>
      </div>

      {/* KPI */}
      <div className="kpi_grid">
        <div className="kpi_card">
          <p>{t("restotal_purchase")}</p>
          <h3 dir="ltr">{formatQAR(totalAmount)}</h3>
        </div>

        <div className="kpi_card">
          <p>{t("restotal_orders")}</p>
          <h3>{uniqueOrders}</h3>
        </div>

        <div className="kpi_card">
          <p>{t("restotal_quantity")}</p>
          <h3>{totalQty}</h3>
        </div>

        <div className="kpi_card">
          <p>{t("ressuppliers")}</p>
          <h3>{uniqueSuppliers}</h3>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="filter_bar">
        <input
          type="text"
          placeholder={t("ressearch_purchase")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ minWidth: 260 }}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">{t("resall_status")}</option>
          <option value="DELIVERED">{t("resdelivered")}</option>
          <option value="PENDING">{t("respending")}</option>
          <option value="CANCELLED">{t("rescancelled")}</option>
        </select>

        <select
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
        >
          <option value="ALL">{t("resall_suppliers")}</option>

          {suppliers.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      

      {/* TABLE */}
      <table className="mini_table">
        <thead>
          <tr>
            <th>{t("resorder_id")}</th>
            <th>{t("resdate")}</th>
            <th>{t("ressupplier")}</th>
            <th>{t("resproduct")}</th>
            <th>{t("resqty")}</th>
            <th>{t("resamount")}</th>
            <th>{t("resstatus")}</th>
            <th>{t("resaction") || "Action"}</th>
          </tr>
        </thead>

        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                {t("resno_data_found")}
              </td>
            </tr>
          ) : (
            paginatedData.map((r, i) => (
              <tr key={i}>
                <td dir="ltr">{r.order_id}</td>

                <td dir="ltr">
                  {r.order_date
                    ? new Date(r.order_date).toLocaleDateString(
                        i18n.language === "ar" ? "en-GB" : undefined
                      )
                    : "-"}
                </td>

                <td>
                  {i18n.language === "ar"
                    ? r.company_name_arabic || r.company_name_english
                    : r.company_name_english}
                </td>

                <td>
  {r.items?.length > 0
    ? (
        i18n.language === "ar"
          ? r.items[0].product_name_arabic || r.items[0].product_name_english
          : r.items[0].product_name_english
      ) + (r.items.length > 1 ? ` +${r.items.length - 1}` : "")
    : "-"}
</td>

                <td>
                  {r.items?.reduce((sum, item) => sum + item.quantity, 0)}
                </td>

               <td dir="ltr">
                  {formatQAR(
                    r.total_amount ||
                    r.items?.reduce(
                      (sum, item) =>
                        sum +
                        Number(item.total_amount || 0),
                      0
                    )
                  )}
                </td>

                <td>
                  <span
                    className={`status ${
                      r.status === "DELIVERED"
                        ? "ok"
                        : r.status === "CANCELLED"
                        ? "danger"
                        : "warn"
                    }`}
                  >
                    {statusLabel(r.status)}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => setSelectedOrder(r)}
                    className="btn btn-sm btn-primary"
                  >
                    {t("resview") || "View"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="pagination">
        <button
          disabled={safePage === 1}
          onClick={() =>
            setCurrentPage((p) => Math.max(1, p - 1))
          }
        >
          {t("resprev")}
        </button>

        <span>
          {t("respage")} {safePage} {t("resof")} {totalPages}
        </span>

        <button
          disabled={safePage === totalPages}
          onClick={() =>
            setCurrentPage((p) => Math.min(totalPages, p + 1))
          }
        >
          {t("resnext")}
        </button>
      </div>
{selectedOrder && (
  <div className="modal_overlay">
    <div className="modal_box large">

      {/* HEADER */}
      <h3>
        {t("resorder_id")} : {selectedOrder.order_id}
      </h3>

      {/* BASIC INFO */}
      <div className="order_section">
        <p>
          <strong>{t("ressupplier")}:</strong>{" "}
          {i18n.language === "ar"
            ? selectedOrder.company_name_arabic || selectedOrder.company_name_english
            : selectedOrder.company_name_english}
        </p>

        <p>
          <strong>{t("resorder_date")}:</strong>{" "}
          {new Date(selectedOrder.order_date).toLocaleDateString()}
        </p>

        <p>
          <strong>{t("resexpected_delivery")}:</strong>{" "}
          {selectedOrder.expected_delivery_date
            ? new Date(selectedOrder.expected_delivery_date).toLocaleDateString()
            : "-"}
        </p>
      </div>

      {/* STATUS */}
      <div className="order_section">
        <p>
          <strong>{t("resstatus")}:</strong>{" "}
          <span className="badge status">
            {statusLabel(selectedOrder.status)}
          </span>
        </p>

        <p>
          <strong>{t("respayment_status")}:</strong>{" "}
          {selectedOrder.payment_status}
        </p>

        <p>
          <strong>{t("respayment_method")}:</strong>{" "}
          {selectedOrder.payment_method}
        </p>
      </div>

      {/* ITEMS TABLE */}
      <div className="order_section">
        <h5>{t("resitems") || "Items"}</h5>

        <table className="table table-sm">
          <thead>
            <tr>
              <th>{t("resproduct")}</th>
              <th>{t("resqty")}</th>
              <th>{t("resprice")}</th>
              <th>{t("resdiscount")}</th>
              <th>{t("resamount")}</th>
            </tr>
          </thead>

          <tbody>
            {selectedOrder.items?.map((item, i) => (
              <tr key={i}>
                <td>{item.product_name_english}</td>
                <td>{item.quantity}</td>
                <td>{formatQAR(item.price_per_unit)}</td>
                <td>{formatQAR(item.discount || 0)}</td>
                <td>{formatQAR(item.total_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TOTAL SUMMARY */}
      <div className="order_section summary">
        <p>
          <strong>{t("restotal")}:</strong>{" "}
          {formatQAR(selectedOrder.total_amount)}
        </p>

        <p>
          <strong>{t("respaid")}:</strong>{" "}
          {formatQAR(selectedOrder.restaurant_paid_amount || 0)}
        </p>

        <p>
          <strong>{t("resdue")}:</strong>{" "}
          {formatQAR(selectedOrder.restaurant_due_amount || 0)}
        </p>
      </div>

      {/* REMARKS */}
      {selectedOrder.remarks && (
        <div className="order_section">
          <strong>{t("resremarks")}:</strong>
          <p>{selectedOrder.remarks}</p>
        </div>
      )}

      {/* ACTIONS */}
      <div className="modal_actions">
        <button onClick={() => setSelectedOrder(null)}>
          {t("resclose") || "Close"}
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
};

export default PurchaseReport;