// import React, {
//   useEffect,
//   useMemo,
//   useState
// } from "react";

// import axios from "axios";

// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   PieChart,
//   Pie,
//   Cell,
//   Legend
// } from "recharts";

// import { useTranslation } from "react-i18next";

// const API =
//   "http://192.168.2.9:5000/api/v1/restaurant/reports/suppliers";

// const SupplierReport = () => {

//   const { t, i18n } = useTranslation();

//   const token = localStorage.getItem("token");

//   const [data, setData] = useState([]);

//   const [loading, setLoading] = useState(true);

//   const [search, setSearch] = useState("");

//   const [sortField, setSortField] =
//     useState("total_purchase");

//   const [sortOrder, setSortOrder] =
//     useState("desc");

//   const [currentPage, setCurrentPage] =
//     useState(1);

//   const ITEMS_PER_PAGE = 5;

//   /* =========================================
//       FETCH
//   ========================================= */

//   const loadReport = async () => {

//     try {

//       setLoading(true);

//       const res = await axios.get(API, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });

//       setData(res.data || []);

//     } catch (err) {

//       console.log(err);

//     } finally {

//       setLoading(false);

//     }
//   };

//   useEffect(() => {
//     loadReport();
//   }, []);

//   /* =========================================
//       CURRENCY
//   ========================================= */

//   const formatQAR = (amount) =>
//     new Intl.NumberFormat("en-QA", {
//       style: "currency",
//       currency: "QAR"
//     }).format(amount || 0);

//   /* =========================================
//       SUMMARY
//   ========================================= */

//   const totalSuppliers = data.length;

//   const totalPurchase = data.reduce(
//     (sum, r) =>
//       sum + Number(r.total_purchase || 0),
//     0
//   );

//   const totalOrders = data.reduce(
//     (sum, r) =>
//       sum + Number(r.total_orders || 0),
//     0
//   );

//   const totalDelivered = data.reduce(
//     (sum, r) =>
//       sum + Number(r.delivered_orders || 0),
//     0
//   );

//   const successRate =
//     totalOrders === 0
//       ? 0
//       : Math.round(
//           (totalDelivered / totalOrders) * 100
//         );

//   /* =========================================
//       FILTER + SORT
//   ========================================= */

//   const filteredData = useMemo(() => {

//     let arr = [...data];

//     if (search.trim()) {

//       arr = arr.filter((r) => {

//         const name =
//           i18n.language === "ar"
//             ? r.company_name_arabic
//             : r.company_name_english;

//         return name
//           ?.toLowerCase()
//           .includes(search.toLowerCase());

//       });

//     }

//     arr.sort((a, b) => {

//       const aVal = Number(a[sortField] || 0);

//       const bVal = Number(b[sortField] || 0);

//       return sortOrder === "asc"
//         ? aVal - bVal
//         : bVal - aVal;

//     });

//     return arr;

//   }, [
//     data,
//     search,
//     sortField,
//     sortOrder,
//     i18n.language
//   ]);

//   /* =========================================
//       PAGINATION
//   ========================================= */

//   const totalPages = Math.max(
//     1,
//     Math.ceil(
//       filteredData.length / ITEMS_PER_PAGE
//     )
//   );

//   const paginatedData = filteredData.slice(
//     (currentPage - 1) * ITEMS_PER_PAGE,
//     currentPage * ITEMS_PER_PAGE
//   );

//   /* =========================================
//       CHARTS
//   ========================================= */

//   const topSuppliers = filteredData
//     .slice(0, 5)
//     .map((r) => ({
//       supplier:
//         i18n.language === "ar"
//           ? r.company_name_arabic
//           : r.company_name_english,

//       purchase: Number(r.total_purchase || 0)
//     }));

//   const pieData = [
//     {
//       name: "Delivered",
//       value: totalDelivered
//     },
//     {
//       name: "Pending",
//       value:
//         totalOrders - totalDelivered
//     }
//   ];

//   const COLORS = [
//     "#22c55e",
//     "#ef4444"
//   ];

//   /* =========================================
//       EXPORTS
//   ========================================= */

//   const exportExcel = () => {

//     window.open(
//       "http://192.168.2.9:5000/api/v1/restaurant/reports/suppliers/export",
//       "_blank"
//     );

//   };

//   const exportPDF = () => {

//     window.open(
//       "http://192.168.2.9:5000/api/v1/restaurant/reports/suppliers/pdf",
//       "_blank"
//     );

//   };

//   if (loading) {

//     return (
//       <div className="report_loader">
//         Loading supplier report...
//       </div>
//     );
//   }

//   return (

//     <div
//       className={`report_page ${
//         i18n.language === "ar"
//           ? "rtl"
//           : ""
//       }`}
//     >

//       {/* =====================================
//           HEADER
//       ===================================== */}

//       <div className="report_header">

//         <div>
//           <h2>
//             {t("ressupplier_performance")}
//           </h2>

//           <p>
//             Supplier analytics dashboard
//           </p>
//         </div>

//         <div className="report_actions">

//           <button onClick={exportExcel}>
//             <i className="fas fa-file-excel"></i>
//             Excel
//           </button>

//           <button onClick={exportPDF}>
//             <i className="fas fa-file-pdf"></i>
//             PDF
//           </button>

//         </div>

//       </div>

//       {/* =====================================
//           KPI CARDS
//       ===================================== */}

//       <div className="kpi_grid">

//         <div className="kpi_card">
//           <p>Total Suppliers</p>
//           <h3>{totalSuppliers}</h3>
//         </div>

//         <div className="kpi_card">
//           <p>Total Purchase</p>
//           <h3>
//             {formatQAR(totalPurchase)}
//           </h3>
//         </div>

//         <div className="kpi_card">
//           <p>Total Orders</p>
//           <h3>{totalOrders}</h3>
//         </div>

//         <div className="kpi_card">
//           <p>Success Rate</p>
//           <h3>{successRate}%</h3>
//         </div>

//       </div>

//       {/* =====================================
//           FILTERS
//       ===================================== */}

//       <div className="report_filters">

//         <input
//           type="text"
//           placeholder="Search supplier..."
//           value={search}
//           onChange={(e) =>
//             setSearch(e.target.value)
//           }
//         />

//       </div>

//       {/* =====================================
//           CHARTS
//       ===================================== */}

//       <div className="charts_grid">

//         {/* BAR CHART */}

//         <div className="chart_card">

//           <h3>
//             Top Supplier Purchases
//           </h3>

//           <ResponsiveContainer
//             width="100%"
//             height={300}
//           >

//             <BarChart data={topSuppliers}>

//               <XAxis dataKey="supplier" />

//               <YAxis />

//               <Tooltip />

//               <Bar dataKey="purchase" />

//             </BarChart>

//           </ResponsiveContainer>

//         </div>

//         {/* PIE */}

//         <div className="chart_card">

//           <h3>
//             Delivery Status
//           </h3>

//           <ResponsiveContainer
//             width="100%"
//             height={300}
//           >

//             <PieChart>

//               <Pie
//                 data={pieData}
//                 dataKey="value"
//                 outerRadius={100}
//                 label
//               >

//                 {pieData.map(
//                   (entry, index) => (

//                     <Cell
//                       key={index}
//                       fill={COLORS[index]}
//                     />

//                   )
//                 )}

//               </Pie>

//               <Legend />

//               <Tooltip />

//             </PieChart>

//           </ResponsiveContainer>

//         </div>

//       </div>

//       {/* =====================================
//           TABLE
//       ===================================== */}

//       <div className="table_wrapper">

//         <table className="report_table">

//           <thead>

//             <tr>

//               <th>Supplier</th>

//               <th
//                 onClick={() => {
//                   setSortField(
//                     "total_orders"
//                   );

//                   setSortOrder(
//                     sortOrder === "asc"
//                       ? "desc"
//                       : "asc"
//                   );
//                 }}
//               >
//                 Orders
//               </th>

//               <th>Delivered</th>

//               <th>Pending</th>

//               <th
//                 onClick={() => {
//                   setSortField(
//                     "total_purchase"
//                   );

//                   setSortOrder(
//                     sortOrder === "asc"
//                       ? "desc"
//                       : "asc"
//                   );
//                 }}
//               >
//                 Total Spend
//               </th>

//               <th>Performance</th>

//             </tr>

//           </thead>

//           <tbody>

//             {paginatedData.map(
//               (r, i) => {

//                 const pending =
//                   Number(
//                     r.total_orders || 0
//                   ) -
//                   Number(
//                     r.delivered_orders || 0
//                   );

//                 const success =
//                   r.total_orders === 0
//                     ? 0
//                     : Math.round(
//                         (
//                           r.delivered_orders /
//                           r.total_orders
//                         ) * 100
//                       );

//                 return (

//                   <tr key={i}>

//                     <td>

//                       {i18n.language === "ar"
//                         ? r.company_name_arabic
//                         : r.company_name_english}

//                     </td>

//                     <td>
//                       {r.total_orders}
//                     </td>

//                     <td>
//                       {r.delivered_orders}
//                     </td>

//                     <td>
//                       {pending}
//                     </td>

//                     <td>
//                       {formatQAR(
//                         r.total_purchase
//                       )}
//                     </td>

//                     <td>

//                       <div className="progress_wrap">

//                         <div
//                           className={`progress_fill ${
//                             success >= 80
//                               ? "success"
//                               : success >= 50
//                               ? "warn"
//                               : "danger"
//                           }`}
//                           style={{
//                             width: `${success}%`
//                           }}
//                         />

//                       </div>

//                       <span>
//                         {success}%
//                       </span>

//                     </td>

//                   </tr>

//                 );
//               }
//             )}

//           </tbody>

//         </table>

//       </div>

//       {/* =====================================
//           PAGINATION
//       ===================================== */}

//       <div className="pagination">

//         <button
//           disabled={currentPage === 1}
//           onClick={() =>
//             setCurrentPage((p) =>
//               Math.max(1, p - 1)
//             )
//           }
//         >
//           Prev
//         </button>

//         <span>
//           Page {currentPage} of{" "}
//           {totalPages}
//         </span>

//         <button
//           disabled={
//             currentPage === totalPages
//           }
//           onClick={() =>
//             setCurrentPage((p) =>
//               Math.min(
//                 totalPages,
//                 p + 1
//               )
//             )
//           }
//         >
//           Next
//         </button>

//       </div>

//     </div>

//   );
// };

// export default SupplierReport;


import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const API =
  "http://192.168.2.9:5000/api/v1/restaurant/reports/suppliers";

const SupplierReport = () => {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem("token");
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");

const [startDate, setStartDate] =
  useState("");

const [endDate, setEndDate] =
  useState("");

  /* ================= CURRENCY ================= */

  const formatQAR = (amount) =>
    new Intl.NumberFormat("en-QA", {
      style: "currency",
      currency: "QAR"
    }).format(amount || 0);


  /* ================= FETCH ================= */
const loadReport = async () => {

  try {

    setLoading(true);

    const params = {};

    if (search) {
      params.search = search;
    }

    if (startDate) {
      params.start_date = startDate;
    }

    if (endDate) {
      params.end_date = endDate;
    }

    const res = await axios.get(API, {

      headers: {
        Authorization: `Bearer ${token}`
      },

      params

    });

    setData(res.data || []);

    setCurrentPage(1);

  } finally {

    setLoading(false);

  }

};

  useEffect(() => {
    loadReport();
  }, []);


  /* ================= SUMMARY ================= */

  const totalSuppliers = data.length;

  const totalPurchase = data.reduce(
    (sum, r) => sum + Number(r.total_purchase || 0),
    0
  );

  const totalDelivered = data.reduce(
    (sum, r) => sum + Number(r.delivered_orders || 0),
    0
  );

  const totalOrders = data.reduce(
    (sum, r) => sum + Number(r.total_orders || 0),
    0
  );

  const successRate =
    totalOrders === 0
      ? 0
      : Math.round((totalDelivered / totalOrders) * 100);


  /* ================= PAGINATION ================= */

/* ================= FILTERED DATA ================= */

const filteredData = data.filter((r) => {

  const supplierName =
    i18n.language === "ar"
      ? (
          r.company_name_arabic ||
          r.company_name_english ||
          ""
        )
      : (
          r.company_name_english ||
          ""
        );

  // SEARCH FILTER
  const matchesSearch =
    supplierName
      .toLowerCase()
      .includes(
        search.toLowerCase()
      );

  // DATE FILTER
  let matchesDate = true;

  if (startDate && endDate) {

    const orderDate =
      new Date(
        r.last_order_date ||
        r.order_date ||
        r.created_at
      );

    const start =
      new Date(startDate);

    const end =
      new Date(endDate);

    end.setHours(
      23,
      59,
      59,
      999
    );

    matchesDate =
      orderDate >= start &&
      orderDate <= end;
  }

  return (
    matchesSearch &&
    matchesDate
  );

});

/* ================= PAGINATION ================= */

const totalPages = Math.max(
  1,
  Math.ceil(
    filteredData.length /
    ITEMS_PER_PAGE
  )
);

const safePage = Math.min(
  currentPage,
  totalPages
);

const paginatedData =
  filteredData.slice(

    (safePage - 1) *
      ITEMS_PER_PAGE,

    safePage *
      ITEMS_PER_PAGE

  );


  if (loading) return <p>{t("resloading_supplier_report")}</p>;

const downloadFile = async (
  url,
  filename
) => {

  try {

    const params = {};

    if (search) {
      params.search = search;
    }

    if (startDate) {
      params.start_date = startDate;
    }

    if (endDate) {
      params.end_date = endDate;
    }

    const response = await axios.get(url, {

      responseType: "blob",

      headers: {
        Authorization: `Bearer ${token}`
      },

      params

    });

    const blob = new Blob([
      response.data
    ]);

    const link =
      document.createElement("a");

    link.href =
      window.URL.createObjectURL(blob);

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

  } catch (err) {

    console.log(err);

    alert("Download failed");

  }

};

const exportExcel = () => {

  downloadFile(
    "http://192.168.2.9:5000/api/v1/restaurant/reports/suppliers/export",
    "supplier_report.xlsx"
  );

};

const exportPDF = () => {

  downloadFile(
    "http://192.168.2.9:5000/api/v1/restaurant/reports/suppliers/pdf",
    "supplier_report.pdf"
  );

};
  return (
    <div className="report_page">

      {/* HEADER */}
      <div className="page_header glass">
        <h2>{t("ressupplier_performance")}</h2>
              {/* ACTIONS */}
      
        <div className="header_buttons">
          <button onClick={exportExcel}
             className="btn dark bulk_btn">
            Excel
          </button>

          <button onClick={exportPDF}
             className="btn dark pdf_btn">
            PDF
          </button>
        </div>
      </div>



      


      {/* KPI */}
      <div className="kpi_grid">

        <div className="kpi_card">
          <p>{t("restotal_suppliers")}</p>
          <h3>{totalSuppliers}</h3>
        </div>

        <div className="kpi_card">
          <p>{t("restotal_purchase")}</p>
          <h3 dir="ltr">{formatQAR(totalPurchase)}</h3>
        </div>

        <div className="kpi_card">
          <p>{t("resdelivered_orders")}</p>
          <h3>{totalDelivered}</h3>
        </div>

        <div className="kpi_card">
          <p>{t("ressuccess_rate")}</p>
          <h3 dir="ltr">{successRate}%</h3>
        </div>

      </div>

      {/* FILTERS */}
<div className="filter_bar glass">

  <input
    type="text"
    placeholder="Search Supplier"
    value={search}
    onChange={(e) =>
      setSearch(e.target.value)
    }
  />

  <input
    type="date"
    value={startDate}
    onChange={(e) =>
      setStartDate(e.target.value)
    }
  />

  <input
    type="date"
    value={endDate}
    onChange={(e) =>
      setEndDate(e.target.value)
    }
  />

</div>


      {/* TABLE */}
      <table className="mini_table">

        <thead>
          <tr>
            <th>{t("ressupplier")}</th>
            <th>{t("resorders")}</th>
            <th>{t("resdelivered")}</th>
            <th>{t("respending")}</th>
            <th>{t("restotal_spend")}</th>
            <th>{t("ressuccess_percent")}</th>
          </tr>
        </thead>

        <tbody>

          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                {t("resno_data_found")}
              </td>
            </tr>
          ) : (

            paginatedData.map((r, i) => {

              const pending =
                Number(r.total_orders || 0) -
                Number(r.delivered_orders || 0);

              const success =
                r.total_orders === 0
                  ? 0
                  : Math.round(
                      (r.delivered_orders / r.total_orders) * 100
                    );

              return (

                <tr key={i}>

                  <td>
                    {i18n.language === "ar"
                      ? r.company_name_arabic || r.company_name_english
                      : r.company_name_english}
                  </td>

                  <td>{r.total_orders}</td>

                  <td>{r.delivered_orders}</td>

                  <td>{pending}</td>

                  <td dir="ltr">{formatQAR(r.total_purchase)}</td>

                  <td>
                    <span className={`status ${
                      success >= 80
                        ? "ok"
                        : success >= 50
                        ? "warn"
                        : "danger"
                    }`}>
                      {success}%
                    </span>
                  </td>

                </tr>

              );
            })

          )}

        </tbody>

      </table>


      {/* PAGINATION */}
      <div className="pagination">

        <button
          disabled={safePage === 1}
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        >
          {t("resprev")}
        </button>

        <span>
          {t("respage")} {safePage} {t("resof")} {totalPages}
        </span>

        <button
          disabled={safePage === totalPages}
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        >
          {t("resnext")}
        </button>

      </div>

    </div>
  );
};

export default SupplierReport;