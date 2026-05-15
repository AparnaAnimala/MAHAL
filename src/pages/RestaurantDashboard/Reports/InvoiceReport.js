import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import { useTranslation } from "react-i18next";

const API =
  "http://192.168.2.9:5000/api/v1/restaurant/reports/invoices";

const ITEMS_PER_PAGE = 5;

const InvoiceReport = () => {

  const { t, i18n } =
    useTranslation();

  const token =
    localStorage.getItem("token");

  const [data, setData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // ===================================================
  // FILTERS
  // ===================================================
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [supplierFilter, setSupplierFilter] =
    useState("ALL");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [sortBy, setSortBy] =
    useState("latest");

  const [currentPage, setCurrentPage] =
    useState(1);

  // ===================================================
  // MODAL
  // ===================================================
  const [selectedInvoice, setSelectedInvoice] =
    useState(null);

  const [showModal, setShowModal] =
    useState(false);

  // ===================================================
  // EXPORT
  // ===================================================
  const [exporting, setExporting] =
    useState(false);

  // ===================================================
  // FETCH
  // ===================================================
  const loadReport = async () => {

    try {

      setLoading(true);

      const res = await axios.get(
        API,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setData(res.data || []);

    } catch (err) {

      console.error(
        "Invoice report error",
        err
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  // ===================================================
  // RESET PAGE
  // ===================================================
  useEffect(() => {

    setCurrentPage(1);

  }, [
    statusFilter,
    supplierFilter,
    searchTerm,
    startDate,
    endDate,
    sortBy
  ]);

  // ===================================================
  // SUPPLIERS
  // ===================================================
  const suppliers = useMemo(() => {

    return [
      "ALL",

      ...new Set(
        data.map((d) =>
          i18n.language === "ar"
            ? (
                d.supplier_name_arabic ||
                d.supplier_name
              )
            : (
                d.supplier_name
              )
        )
      )
    ];

  }, [data, i18n.language]);

  // ===================================================
  // FILTERED DATA
  // ===================================================
  const filteredData = useMemo(() => {

    let rows = [...data];

    rows = rows.filter((r) => {

      const supplierName =
        i18n.language === "ar"
          ? (
              r.supplier_name_arabic ||
              r.supplier_name
            )
          : r.supplier_name;

      const statusOk =
        statusFilter === "ALL" ||
        r.payment_status ===
          statusFilter;

      const supplierOk =
        supplierFilter === "ALL" ||
        supplierName ===
          supplierFilter;

      const searchOk =
        !searchTerm ||

        String(r.invoice_id)
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||

        String(r.order_id)
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||

        String(supplierName)
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      const rowDate =
        r.invoice_date
          ? new Date(r.invoice_date)
          : null;

      const startOk =
        !startDate ||
        (
          rowDate &&
          rowDate >=
            new Date(startDate)
        );

      const end =
        new Date(endDate);

      end.setHours(
        23,
        59,
        59,
        999
      );

      const endOk =
        !endDate ||
        (
          rowDate &&
          rowDate <= end
        );

      return (
        statusOk &&
        supplierOk &&
        searchOk &&
        startOk &&
        endOk
      );
    });

    // ===============================================
    // SORT
    // ===============================================
    if (sortBy === "latest") {

      rows.sort(
        (a, b) =>
          new Date(
            b.invoice_date
          ) -
          new Date(
            a.invoice_date
          )
      );
    }

    if (sortBy === "amount_high") {

      rows.sort(
        (a, b) =>
          Number(
            b.grand_total
          ) -
          Number(
            a.grand_total
          )
      );
    }

    return rows;

  }, [
    data,
    statusFilter,
    supplierFilter,
    searchTerm,
    startDate,
    endDate,
    sortBy,
    i18n.language
  ]);

  // ===================================================
  // PAGINATION
  // ===================================================
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

  // ===================================================
  // KPI
  // ===================================================
  const totalAmount =
    filteredData.reduce(
      (sum, r) =>
        sum +
        Number(
          r.grand_total || 0
        ),
      0
    );

  const totalTax =
    filteredData.reduce(
      (sum, r) =>
        sum +
        Number(
          r.tax_amount || 0
        ),
      0
    );

  const paidInvoices =
    filteredData.filter(
      (r) =>
        r.payment_status ===
        "PAID"
    ).length;

  const unpaidInvoices =
    filteredData.filter(
      (r) =>
        r.payment_status ===
        "UNPAID"
    ).length;

  // ===================================================
  // OPEN MODAL
  // ===================================================
  const openInvoice = (invoice) => {

    setSelectedInvoice(invoice);

    setShowModal(true);
  };

  // ===================================================
  // RESET FILTERS
  // ===================================================
  const resetFilters = () => {

    setStatusFilter("ALL");

    setSupplierFilter("ALL");

    setSearchTerm("");

    setStartDate("");

    setEndDate("");

    setSortBy("latest");
  };

  // ===================================================
  // EXPORT QUERY
  // ===================================================
  const buildQuery = () => {

    const params =
      new URLSearchParams();

    params.append(
      "status",
      statusFilter
    );

    params.append(
      "supplier",
      supplierFilter
    );

    params.append(
      "search",
      searchTerm
    );

    params.append(
      "start_date",
      startDate
    );

    params.append(
      "end_date",
      endDate
    );

    return params.toString();
  };

  // ===================================================
  // EXCEL
  // ===================================================
  const downloadExcel = async () => {

    try {

      setExporting(true);

      const response =
        await axios.get(
          `${API}/export?${buildQuery()}`,
          {
            responseType: "blob",

            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const url =
        window.URL.createObjectURL(
          new Blob([
            response.data
          ])
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        "invoice_report.xlsx"
      );

      document.body.appendChild(link);

      link.click();

      link.remove();

    } finally {

      setExporting(false);
    }
  };

  // ===================================================
  // PDF
  // ===================================================
  const downloadPDF = async () => {

    try {

      setExporting(true);

      const response =
        await axios.get(
          `${API}/pdf?${buildQuery()}`,
          {
            responseType: "blob",

            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const url =
        window.URL.createObjectURL(
          new Blob([
            response.data
          ])
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        "invoice_report.pdf"
      );

      document.body.appendChild(link);

      link.click();

      link.remove();

    } finally {

      setExporting(false);
    }
  };

  // ===================================================
  // LOADING
  // ===================================================
  if (loading) {

    return (
      <p>
        Loading invoice report...
      </p>
    );
  }

  return (

    <div
      className="report_page"
      dir={
        i18n.language === "ar"
          ? "rtl"
          : "ltr"
      }
    >

      {/* ======================================== */}
      {/* HEADER */}
      {/* ======================================== */}
      <div className="page_header glass">

        <div>

          <h2>
            Enterprise Invoice Dashboard
          </h2>

          <p>
            Finance & Invoice Analytics
          </p>

        </div>

        <div className="header_buttons">

          {/* <button
            onClick={loadReport}
          >
            Refresh
          </button> */}

          <button
            className="btn dark bulk_btn"
            disabled={exporting}
            onClick={downloadExcel}
          >
            {
              exporting
                ? "Downloading..."
                : "Export Excel"
            }
          </button>

          <button
            className="btn dark pdf_btn"
            disabled={exporting}
            onClick={downloadPDF}
          >
            Download PDF
          </button>

        </div>

      </div>

      {/* ======================================== */}
      {/* KPI */}
      {/* ======================================== */}
      <div className="kpi_grid">

        <div className="kpi_card orange">

          <span>
            Total Invoices
          </span>

          <h2>
            {filteredData.length}
          </h2>

        </div>

        <div className="kpi_card green">

          <span>
            Total Amount
          </span>

          <h2>
            QAR {
              totalAmount.toFixed(2)
            }
          </h2>

        </div>

        <div className="kpi_card blue">

          <span>
            Paid
          </span>

          <h2>
            {paidInvoices}
          </h2>

        </div>

        <div className="kpi_card red">

          <span>
            Unpaid
          </span>

          <h2>
            {unpaidInvoices}
          </h2>

        </div>

        <div className="kpi_card purple">

          <span>
            Tax Amount
          </span>

          <h2>
            QAR {
              totalTax.toFixed(2)
            }
          </h2>

        </div>

      </div>

      {/* ======================================== */}
      {/* FILTERS */}
      {/* ======================================== */}
      <div className="filter_bar glass">

        <input
          type="text"
          placeholder="Search Invoice / Supplier"
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(
              e.target.value
            )
          }
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
        >

          <option value="ALL">
            All Status
          </option>

          <option value="PAID">
            Paid
          </option>

          <option value="UNPAID">
            Unpaid
          </option>

          <option value="CANCELLED">
            Cancelled
          </option>

        </select>

        <select
          value={supplierFilter}
          onChange={(e) =>
            setSupplierFilter(
              e.target.value
            )
          }
        >

          {suppliers.map(
            (s, i) => (
              <option
                key={i}
                value={s}
              >
                {s}
              </option>
            )
          )}

        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) =>
            setStartDate(
              e.target.value
            )
          }
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) =>
            setEndDate(
              e.target.value
            )
          }
        />

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(
              e.target.value
            )
          }
        >

          <option value="latest">
            Latest
          </option>

          <option value="amount_high">
            Highest Amount
          </option>

        </select>

        <button
          className="view_btn"
          onClick={resetFilters}
        >
          Clear
        </button>

      </div>

      {/* ======================================== */}
      {/* TABLE */}
      {/* ======================================== */}
      <div className="table_wrapper">

        <table className="mini_table">

          <thead>

            <tr>

              <th>
                Invoice
              </th>

              <th>
                Order
              </th>

              <th>
                Supplier
              </th>

              <th>
                Grand Total
              </th>

              {/* <th>
                Tax
              </th> */}

              <th>
                Items
              </th>

              <th>
                Status
              </th>

              <th>
                Date
              </th>

              <th>
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {paginatedData.length === 0 ? (

              <tr>

                <td
                  colSpan="9"
                  style={{
                    textAlign:
                      "center"
                  }}
                >
                  No Data Found
                </td>

              </tr>

            ) : (

              paginatedData.map(
                (r) => (

                  <tr
                    key={r.invoice_id}
                  >

                    <td>
                      INV-
                      {
                        r.invoice_number
                      }
                    </td>

                    <td>
                      {r.order_id}
                    </td>

                    <td>

                      {i18n.language ===
                      "ar"

                        ? (
                            r.supplier_name_arabic ||
                            r.supplier_name
                          )

                        : (
                            r.supplier_name
                          )}

                    </td>

                    <td>
                      QAR {
                        Number(
                          r.grand_total
                        ).toFixed(2)
                      }
                    </td>

                    {/* <td>
                      QAR {
                        Number(
                          r.tax_amount || 0
                        ).toFixed(2)
                      }
                    </td> */}

                    <td>
                      {r.total_items}
                    </td>

                    <td>

                      <span
                        className={`status_badge ${
                          r.payment_status ===
                          "PAID"
                            ? "green"
                            : "orange"
                        }`}
                      >

                        {
                          r.payment_status
                        }

                      </span>

                    </td>

                    <td>

                      {
                        r.invoice_date

                          ? new Date(
                              r.invoice_date
                            ).toLocaleDateString()

                          : "-"
                      }

                    </td>

                    <td>

                      <div className="action_buttons">

                        <button
                          className="view_btn"
                          onClick={() =>
                            openInvoice(r)
                          }
                        >
                          View
                        </button>

                        {/* <button
                          className="print_btn"
                        >
                          Print
                        </button> */}

                      </div>

                    </td>

                  </tr>
                )
              )
            )}

          </tbody>

        </table>

      </div>

      {/* ======================================== */}
      {/* PAGINATION */}
      {/* ======================================== */}
      <div className="pagination">

        <button
          disabled={
            safePage === 1
          }
          onClick={() =>
            setCurrentPage(
              (p) =>
                Math.max(
                  1,
                  p - 1
                )
            )
          }
        >
          Prev
        </button>

        <span>

          Page {safePage}
          {" / "}
          {totalPages}

        </span>

        <button
          disabled={
            safePage ===
            totalPages
          }
          onClick={() =>
            setCurrentPage(
              (p) =>
                Math.min(
                  totalPages,
                  p + 1
                )
            )
          }
        >
          Next
        </button>

      </div>

      {/* ======================================== */}
      {/* MODAL */}
      {/* ======================================== */}
      {showModal &&
        selectedInvoice && (

        <div className="invoice_modal_overlay">

          <div className="invoice_modal">

            <div className="modal_header">

              <h3>
                Invoice Details
              </h3>

              <button
                onClick={() =>
                  setShowModal(false)
                }
              >
                ✕
              </button>

            </div>

            <div className="modal_body">

              <div className="detail_grid">

                <div>
                  <span>
                    Invoice No
                  </span>

                  <h4>
                    {
                      selectedInvoice.invoice_number
                    }
                  </h4>
                </div>

                <div>
                  <span>
                    Order ID
                  </span>

                  <h4>
                    {
                      selectedInvoice.order_id
                    }
                  </h4>
                </div>

                <div>
                  <span>
                    Supplier
                  </span>

                  <h4>

                    {
                      selectedInvoice.supplier_name
                    }

                  </h4>
                </div>

                <div>
                  <span>
                    Grand Total
                  </span>

                  <h4>

                    QAR {
                      selectedInvoice.grand_total
                    }

                  </h4>
                </div>
{/* 
                <div>
                  <span>
                    Tax
                  </span>

                  <h4>

                    QAR {
                      selectedInvoice.tax_amount || 0
                    }

                  </h4>
                </div> */}

                <div>
                  <span>
                    Status
                  </span>

                  <h4>
                    {
                      selectedInvoice.payment_status
                    }
                  </h4>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default InvoiceReport;



// import React, { useEffect, useState, useMemo } from "react";
// import axios from "axios";
// import { useTranslation } from "react-i18next";

// const API =
//   "http://192.168.2.9:5000/api/v1/restaurant/reports/invoices";

// const ITEMS_PER_PAGE = 5;

// const InvoiceReport = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [statusFilter, setStatusFilter] = useState("ALL");
//   const [searchTerm, setSearchTerm] = useState("");

//   const [currentPage, setCurrentPage] = useState(1);

//   const token = localStorage.getItem("token");
//   const { t, i18n } = useTranslation();

//   /* ================= FETCH ================= */
//   const loadReport = async () => {
//     try {
//       setLoading(true);

//       const res = await axios.get(API, {
//         headers: { Authorization: `Bearer ${token}` },
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
//   }, [statusFilter, searchTerm, data]);

//   /* ================= STATUS LABEL ================= */
//   const statusLabel = (status) => {
//     if (status === "PAID") return t("respaid");
//     if (status === "UNPAID") return t("resunpaid");
//     if (status === "CANCELLED") return t("rescancelled");
//     return status;
//   };

//   /* ================= FILTER ================= */
//   const filteredData = useMemo(() => {
//     return data.filter((r) => {
//       const statusOk =
//         statusFilter === "ALL" ||
//         r.payment_status === statusFilter;

//       const supplierName =
//         i18n.language === "ar"
//           ? r.supplier_name_arabic || r.supplier_name
//           : r.supplier_name;

//       const searchOk =
//         !searchTerm ||
//         String(r.invoice_id)
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase()) ||
//         String(r.order_id)
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase()) ||
//         String(supplierName)
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase());

//       return statusOk && searchOk;
//     });
//   }, [data, statusFilter, searchTerm, i18n.language]);

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

//   if (loading) return <p>{t("resloading_invoice_report")}</p>;

//   return (
//     <div className="report_page">
//       {/* HEADER */}
//       <div className="page_header glass">
//         <h2>{t("resinvoice_report")}</h2>

//         <div className="header_actions">
//           <div className="summary_inline">
//             <span>{t("restotal_invoices")}</span>
//             <b>{filteredData.length}</b>
//           </div>
//         </div>
//       </div>

//       {/* FILTER BAR */}
//       <div className="filter_bar">
//         <input
//           type="text"
//           placeholder={t("ressearch_invoice_supplier")}
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           style={{ minWidth: 260 }}
//         />

//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//         >
//           <option value="ALL">{t("resall_status")}</option>
//           <option value="PAID">{t("respaid")}</option>
//           <option value="UNPAID">{t("resunpaid")}</option>
//           <option value="CANCELLED">{t("rescancelled")}</option>
//         </select>
//       </div>

//       {/* TABLE */}
//       <table className="mini_table">
//         <thead>
//           <tr>
//             <th>{t("resinvoice_id")}</th>
//             <th>{t("resorder_id")}</th>
//             <th>{t("ressupplier")}</th>
//             <th>{t("resstatus")}</th>
//             <th>{t("resdate")}</th>
//           </tr>
//         </thead>

//         <tbody>
//           {paginatedData.length === 0 ? (
//             <tr>
//               <td colSpan="5" style={{ textAlign: "center" }}>
//                 {t("resno_data_found")}
//               </td>
//             </tr>
//           ) : (
//             paginatedData.map((r) => (
//               <tr key={r.invoice_id}>
//                 <td dir="ltr">INV-{r.invoice_id}</td>

//                 <td dir="ltr">{r.order_id}</td>

//                 <td>
//                   {i18n.language === "ar"
//                     ? r.supplier_name_arabic || r.supplier_name
//                     : r.supplier_name}
//                 </td>

//                 <td>
//                   <span
//                     className={`status ${
//                       r.payment_status === "PAID"
//                         ? "ok"
//                         : r.payment_status === "UNPAID"
//                         ? "warn"
//                         : "danger"
//                     }`}
//                   >
//                     {statusLabel(r.payment_status)}
//                   </span>
//                 </td>

//                 <td dir="ltr">
//                   {r.invoice_date
//                     ? new Date(r.invoice_date).toLocaleDateString(
//                         i18n.language === "ar" ? "en-GB" : undefined
//                       )
//                     : "-"}
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
//           onClick={() =>
//             setCurrentPage((p) => Math.max(1, p - 1))
//           }
//         >
//           {t("resprev")}
//         </button>

//         <span>
//           {t("respage")} {safePage} {t("resof")} {totalPages}
//         </span>

//         <button
//           disabled={safePage === totalPages}
//           onClick={() =>
//             setCurrentPage((p) => Math.min(totalPages, p + 1))
//           }
//         >
//           {t("resnext")}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default InvoiceReport;