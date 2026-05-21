import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import { useTranslation } from "react-i18next";

const API =
  "http://192.168.2.22:5000/api/v1/restaurant/reports/grn";

const ITEMS_PER_PAGE = 5;

const GRNReport = () => {

  const { t, i18n } = useTranslation();

  const token = localStorage.getItem("token");

  const [data, setData] = useState([]);

  const [loading, setLoading] =
    useState(true);

  // =====================================================
  // FILTERS
  // =====================================================
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

  const [selectedGRN, setSelectedGRN] =
  useState(null);

  const [showModal, setShowModal] =
    useState(false);

  // =====================================================
  // ARABIC DIGITS
  // =====================================================
  const toArabicDigits = (value) => {

    if (i18n.language !== "ar")
      return value;

    return String(value).replace(
      /\d/g,
      (d) => "٠١٢٣٤٥٦٧٨٩"[d]
    );
  };

  // =====================================================
  // FETCH
  // =====================================================
  const loadReport = async () => {

    try {

      setLoading(true);

      const res = await axios.get(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const rows = Array.isArray(res.data)
        ? res.data.map((r) => ({
            ...r,

            supplier_name:
              i18n.language === "ar"
                ? (
                    r.company_name_arabic ||
                    r.company_name_english ||
                    "-"
                  )
                : (
                    r.company_name_english ||
                    r.company_name_arabic ||
                    "-"
                  )
          }))
        : [];

      setData(rows);

    } catch (err) {

      console.error(
        "GRN REPORT ERROR",
        err
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [i18n.language]);

  // =====================================================
  // RESET PAGE
  // =====================================================
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

  // =====================================================
  // SUPPLIERS
  // =====================================================
  const suppliers = useMemo(() => {

    return [
      "ALL",
      ...new Set(
        data.map((d) => d.supplier_name)
      ),
    ];

  }, [data]);

  // =====================================================
  // FILTERED DATA
  // =====================================================
  const filteredData = useMemo(() => {

    let rows = [...data];

    rows = rows.filter((r) => {

      // STATUS
      const statusOk =
        statusFilter === "ALL" ||
        r.status === statusFilter;

      // SUPPLIER
      const supplierOk =
        supplierFilter === "ALL" ||
        r.supplier_name === supplierFilter;

      // SEARCH
      const searchOk =
        !searchTerm ||

        String(r.grn_id)
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||

        String(r.order_id)
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||

        String(r.supplier_name)
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      // DATE
      const rowDate = r.created_at
        ? new Date(r.created_at)
        : null;

      const startOk =
        !startDate ||
        (
          rowDate &&
          rowDate >= new Date(startDate)
        );

      const endOk =
        !endDate ||
        (
          rowDate &&
          rowDate <= new Date(endDate)
        );

      return (
        statusOk &&
        supplierOk &&
        searchOk &&
        startOk &&
        endOk
      );
    });

    // =================================================
    // SORTING
    // =================================================
    if (sortBy === "latest") {

      rows.sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      );
    }

    if (sortBy === "oldest") {

      rows.sort(
        (a, b) =>
          new Date(a.created_at) -
          new Date(b.created_at)
      );
    }

    if (sortBy === "qty_high") {

      rows.sort(
        (a, b) =>
          Number(b.received_qty) -
          Number(a.received_qty)
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
    sortBy
  ]);

  // =====================================================
  // PAGINATION
  // =====================================================
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

  // =====================================================
  // KPI
  // =====================================================
  const totalReceived =
    filteredData.reduce(
      (sum, r) =>
        sum +
        Number(
          r.received_qty || 0
        ),
      0
    );

  const confirmedCount =
    filteredData.filter(
      (r) =>
        r.status ===
        "CONFIRMED"
    ).length;

  const draftCount =
    filteredData.filter(
      (r) =>
        r.status ===
        "DRAFT"
    ).length;

  // =====================================================
  // EXPORT QUERY
  // =====================================================
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
const openGRN = (grn) => {

  setSelectedGRN(grn);

  setShowModal(true);
};

  // =====================================================
  // DOWNLOAD EXCEL
  // =====================================================
const downloadExcel = async () => {

  try {

    const response = await axios.get(
      `${API}/export?${buildQuery()}`,
      {
        responseType: "blob",

        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const url =
      window.URL.createObjectURL(
        new Blob([response.data])
      );

    const link =
      document.createElement("a");

    link.href = url;

    link.setAttribute(
      "download",
      "grn_report.xlsx"
    );

    document.body.appendChild(link);

    link.click();

    link.remove();

  } catch (err) {

    console.error(
      "Excel download failed",
      err
    );
  }
};

  // =====================================================
  // DOWNLOAD PDF
  // =====================================================
const downloadPDF = async () => {

  try {

    const response = await axios.get(
      `${API}/pdf?${buildQuery()}`,
      {
        responseType: "blob",

        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const url =
      window.URL.createObjectURL(
        new Blob([response.data])
      );

    const link =
      document.createElement("a");

    link.href = url;

    link.setAttribute(
      "download",
      "grn_report.pdf"
    );

    document.body.appendChild(link);

    link.click();

    link.remove();

  } catch (err) {

    console.error(
      "PDF download failed",
      err
    );
  }
};

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {

    return (
      <p>
        {t(
          "resloading_grn_report"
        )}
      </p>
    );
  }

  // =====================================================
  // UI
  // =====================================================
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
            {t("resgrn_report")}
          </h2>

          <p>
            Enterprise GRN Dashboard
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
            onClick={downloadExcel}
          >
            Export Excel
          </button>

          <button
            className="btn dark pdf_btn"
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

        <div className="kpi_card">

          <span>
            Total GRNs
          </span>

          <h2>
            {toArabicDigits(
              filteredData.length
            )}
          </h2>

        </div>

        <div className="kpi_card">

          <span>
            Total Received
          </span>

          <h2>
            {toArabicDigits(
              totalReceived
            )}
          </h2>

        </div>

        <div className="kpi_card">

          <span>
            Confirmed
          </span>

          <h2>
            {toArabicDigits(
              confirmedCount
            )}
          </h2>

        </div>

        <div className="kpi_card">

          <span>
            Draft
          </span>

          <h2>
            {toArabicDigits(
              draftCount
            )}
          </h2>

        </div>

      </div>

      {/* ======================================== */}
      {/* FILTER BAR */}
      {/* ======================================== */}
      <div className="filter_bar glass">

        <input
          type="text"
          placeholder="Search GRN / Order / Supplier"
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

          <option value="DRAFT">
            Draft
          </option>

          <option value="CONFIRMED">
            Confirmed
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

          <option value="oldest">
            Oldest
          </option>

          <option value="qty_high">
            Highest Qty
          </option>

        </select>

      </div>

      {/* ======================================== */}
      {/* TABLE */}
      {/* ======================================== */}
      <div className="table_wrapper">

        <table className="mini_table">

          <thead>

            <tr>

              <th>
                {t("resgrn_id")}
              </th>

              <th>
                {t("resorder_id")}
              </th>

              <th>
                {t("ressupplier")}
              </th>

              <th>
                {t("resstatus")}
              </th>

              <th>
                {t(
                  "resreceived_qty"
                )}
              </th>

              <th>
                {t("resdate")}
              </th>
              <th>Actions</th>

            </tr>

          </thead>

          <tbody>

            {paginatedData.length ===
            0 ? (

              <tr>

                <td
                  colSpan="6"
                  style={{
                    textAlign:
                      "center"
                  }}
                >
                  {t(
                    "resno_data_found"
                  )}
                </td>

              </tr>

            ) : (

              paginatedData.map(
                (r, index) => (

                  <tr
                    key={`${r.grn_id}-${index}`}
                  >

                    <td>
                      GRN-
                      {toArabicDigits(
                        r.grn_id
                      )}
                    </td>

                    <td>
                      {toArabicDigits(
                        r.order_id
                      )}
                    </td>

                    <td>
                      {r.supplier_name}
                    </td>

                    <td>

                      <span
                        className={`status_badge ${
                          r.status ===
                            "CONFIRMED" ||
                          r.status ===
                            "STATUS_CONFIRMED"
                            ? "green"
                            : "orange"
                        }`}
                      >

                        {t(
                          `status_${String(
                            r.status
                          )
                            .replace(
                              "STATUS_",
                              ""
                            )
                            .toLowerCase()}`
                        )}

                      </span>

                    </td>

                    <td>
                      {toArabicDigits(
                        r.received_qty
                      )}
                    </td>

                    <td>

                      {r.created_at
                        ? new Date(
                            r.created_at
                          ).toLocaleDateString(
                            i18n.language ===
                              "ar"
                              ? "ar-QA"
                              : "en-US"
                          )
                        : "-"}

                    </td>

                    <td>
  <div className="action_buttons">

    <button
      className="view_btn"
      onClick={() => openGRN(r)}
    >
      View
    </button>

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
          {t("resprev")}
        </button>

        <span>

          {t("respage")}

          {" "}

          {toArabicDigits(
            safePage
          )}

          {" "}

          {t("resof")}

          {" "}

          {toArabicDigits(
            totalPages
          )}

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
          {t("resnext")}
        </button>
{showModal && selectedGRN && (

  <div className="grn_modal_overlay">

    <div className="grn_modal">

      <div className="modal_header">

        <h3>
          GRN Details
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
            <span>GRN ID</span>
            <h4>
              GRN-{selectedGRN.grn_id}
            </h4>
          </div>

          <div>
            <span>Order ID</span>
            <h4>
              {selectedGRN.order_id}
            </h4>
          </div>

          <div>
            <span>Supplier</span>
            <h4>
              {selectedGRN.supplier_name}
            </h4>
          </div>

          <div>
            <span>Status</span>
            <h4>
              {selectedGRN.status}
            </h4>
          </div>

          <div>
            <span>Received Qty</span>
            <h4>
              {selectedGRN.received_qty}
            </h4>
          </div>

          <div>
            <span>Date</span>
            <h4>
              {new Date(
                selectedGRN.created_at
              ).toLocaleDateString()}
            </h4>
          </div>

        </div>

      </div>

    </div>

  </div>
)}
      </div>

    </div>
  );
};

export default GRNReport;


// import React, { useEffect, useState, useMemo } from "react";
// import axios from "axios";
// import { useTranslation } from "react-i18next";

// const API = "http://192.168.2.22:5000/api/v1/restaurant/reports/grn";

// const ITEMS_PER_PAGE = 5;

// const GRNReport = () => {
//   const { t, i18n } = useTranslation();

//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [statusFilter, setStatusFilter] = useState("ALL");
//   const [searchTerm, setSearchTerm] = useState("");

//   const [currentPage, setCurrentPage] = useState(1);

//   const token = localStorage.getItem("token");

//   const toArabicDigits = (value) => {
//     if (i18n.language !== "ar") return value;
//     return String(value).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
//   };

//   /* ================= FETCH ================= */
//   const loadReport = async () => {
//     try {
//       setLoading(true);

//       const res = await axios.get(API, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       const rows = Array.isArray(res.data)
//         ? res.data.map((r) => ({
//             ...r,
//             supplier_name:
//               i18n.language === "ar"
//                 ? (
//                     r.company_name_arabic ||
//                     r.company_name_english ||
//                     r.supplier_name ||
//                     "-"
//                   )
//                 : (
//                     r.company_name_english ||
//                     r.company_name_arabic ||
//                     r.supplier_name ||
//                     "-"
//                   )
//           }))
//         : [];

//       setData(rows);

//     } catch (err) {
//       console.error("GRN report error", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadReport();
//   }, [i18n.language]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [statusFilter, searchTerm, data]);

//   /* ================= FILTER ================= */
//   const filteredData = useMemo(() => {
//     return data.filter((r) => {
//       const statusOk =
//         statusFilter === "ALL" || r.status === statusFilter;

//       const searchOk =
//         !searchTerm ||
//         String(r.grn_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
//         String(r.order_id).toLowerCase().includes(searchTerm.toLowerCase());

//       return statusOk && searchOk;
//     });
//   }, [data, statusFilter, searchTerm]);

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

//   /* ================= SUMMARY ================= */
//   const totalReceived = filteredData.reduce(
//     (sum, r) => sum + Number(r.received_qty || 0),
//     0
//   );

//   if (loading) return <p>{t("resloading_grn_report")}</p>;

//   return (
//     <div
//       className="report_page"
//       dir={i18n.language === "ar" ? "rtl" : "ltr"}
//     >
//       {/* HEADER */}
//       <div className="page_header glass">
//         <h2>{t("resgrn_report")}</h2>

//         <div className="header_actions">
//           <div className="summary_inline">
//             <span>{t("restotal_grns")}:</span>
//             <b>{toArabicDigits(filteredData.length)}</b>
//           </div>

//           <div className="summary_inline">
//             <span>{t("restotal_received")}:</span>
//             <b>{toArabicDigits(totalReceived)}</b>
//           </div>
//         </div>
//       </div>

//       {/* FILTER BAR */}
//       <div className="filter_bar">
//         <input
//           type="text"
//           placeholder={t("ressearch_grn_order")}
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           style={{ minWidth: 220 }}
//         />

//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//         >
//           <option value="ALL">{t("resall_status")}</option>
//           <option value="DRAFT">{t("status_draft")}</option>
//           <option value="CONFIRMED">{t("status_confirmed")}</option>
//         </select>
//       </div>

//       {/* TABLE */}
//       <table className="mini_table">
//         <thead>
//           <tr>
//             <th>{t("resgrn_id")}</th>
//             <th>{t("resorder_id")}</th>
//             <th>{t("ressupplier")}</th>
//             <th>{t("resstatus")}</th>
//             <th>{t("resreceived_qty")}</th>
//             <th>{t("resdate")}</th>
//           </tr>
//         </thead>

//         <tbody>
//           {paginatedData.length === 0 ? (
//             <tr>
//               <td colSpan="6" style={{ textAlign: "center" }}>
//                 {t("resno_data_found")}
//               </td>
//             </tr>
//           ) : (
//             paginatedData.map((r, index) => (
//               <tr key={`${r.grn_id}-${index}`}>
//                 <td>GRN-{toArabicDigits(r.grn_id)}</td>

//                 <td>{toArabicDigits(r.order_id)}</td>

//                 <td>{r.supplier_name}</td>

//                 <td>
//                   <span
//                     className={`status ${
//                       r.status === "CONFIRMED" || r.status === "STATUS_CONFIRMED"
//                         ? "ok"
//                         : "warn"
//                     }`}
//                   >
//                     {t(
//                       `status_${String(r.status)
//                         .replace("STATUS_", "")
//                         .toLowerCase()}`
//                     )}
//                   </span>
//                 </td>

//                 <td>{toArabicDigits(r.received_qty)}</td>

//                 <td>
//                   {r.created_at
//                     ? new Date(r.created_at).toLocaleDateString(
//                         i18n.language === "ar"
//                           ? "ar-QA"
//                           : "en-US"
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
//           {t("respage")} {toArabicDigits(safePage)} {t("resof")}{" "}
//           {toArabicDigits(totalPages)}
//         </span>

//         <button
//           disabled={safePage === totalPages}
//           onClick={() =>
//             setCurrentPage((p) =>
//               Math.min(totalPages, p + 1)
//             )
//           }
//         >
//           {t("resnext")}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default GRNReport;