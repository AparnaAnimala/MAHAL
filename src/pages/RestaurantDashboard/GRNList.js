// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const API = "http://192.168.2.9:5000/api/v1";

// export default function GRNList() {
//   const [grns, setGrns] = useState([]);
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     fetch(`${API}/grn`, {
//       headers: { Authorization: `Bearer ${token}` }
//     })
//       .then(res => res.json())
//       .then(setGrns);
//   }, [token]);

//   return (
//     <div className="orders-page">
//       <h2 className="page-title">Goods Receipt Notes</h2>

//       <table className="orders-table">
//         <thead>
//           <tr>
//             <th>#</th>
//             <th>GRN No</th>
//             <th>Supplier</th>
//             <th>Order</th>
//             <th>Status</th>
//             <th />
//           </tr>
//         </thead>
//         <tbody>
//           {grns.map((g, i) => (
//             <tr key={g.grn_id}>
//               <td>{i + 1}</td>
//               <td>GRN-{String(g.grn_id).padStart(5, "0")}</td>
//               <td>{g.supplier_name}</td>
//               <td>{g.order_id}</td>
//               <td>{g.status}</td>
//               <td>
//                 <button
//                   onClick={() =>
//                     navigate(`/restaurantdashboard/grn/${g.order_id}`)
//                   }
//                 >
//                   View
//                 </button>
//               </td>
//             </tr>
//           ))}

//           {grns.length === 0 && (
//             <tr>
//               <td colSpan="6" align="center">No GRNs found</td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }







import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API = "http://192.168.2.9:5000/api/v1";

export default function GRNList() {
  const [grns, setGrns] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const formatNumber = (value) => {
  return new Intl.NumberFormat(
    i18n.language === "ar" ? "ar-QA" : "en-US"
  ).format(value);
};

const formatOrderId = (id) => {
  if (i18n.language !== "ar") return id;

  return String(id).replace(/\d/g, (d) =>
    new Intl.NumberFormat("ar-QA").format(d)
  );
};

const formatGRN = (id) => {
  const formatted = `GRN-${String(id).padStart(5, "0")}`;

  if (i18n.language !== "ar") return formatted;

  return formatted.replace(/\d/g, (d) =>
    new Intl.NumberFormat("ar-QA").format(d)
  );
};
  // ADD this function below useEffect()

const getStatusText = (status) => {
  const value = String(status || "").toUpperCase().replace("STATUS_", "");

  if (value === "CONFIRMED")
    return i18n.language === "ar" ? "تم التأكيد" : "CONFIRMED";

  if (value === "DRAFT")
    return i18n.language === "ar" ? "مسودة" : "DRAFT";

  if (value === "PENDING")
    return i18n.language === "ar" ? "قيد الانتظار" : "PENDING";

  if (value === "REJECTED")
    return i18n.language === "ar" ? "مرفوض" : "REJECTED";

  return value;
};

  useEffect(() => {
    fetch(`${API}/grn`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const rows = Array.isArray(data)
          ? data.map((g) => ({
              ...g,
              supplier_name:
                i18n.language === "ar"
                  ? (
                      g.supplier_name_arabic ||
                      g.company_name_arabic ||
                      g.supplier_name ||
                      g.company_name_english ||
                      "-"
                    )
                  : (
                      g.supplier_name ||
                      g.company_name_english ||
                      g.supplier_name_arabic ||
                      g.company_name_arabic ||
                      "-"
                    )
            }))
          : [];

        setGrns(rows);
      });
  }, [token, i18n.language]);

  return (
    <div className="orders_page">
      <h3 className="page_title">{t("resgoods_receipt_notes")}</h3>

      <div className="table_wrapper">

        <div className="filters_bar">

          {/* 🔍 SEARCH */}
          <input
            type="text"
            placeholder="Search grn and order id" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter_input"
          />

          {/* 📊 STATUS */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter_input"
          >
            <option value="ALL">{t("resall_status")}</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PENDING">PENDING</option>
            <option value="REJECTED">REJECTED</option>
          </select>

          {/* 📅 FROM */}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="filter_input"
          />

          {/* 📅 TO */}
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="filter_input"
          />

          {/* RESET */}
          <button
            className="reset_btn"
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
              setFromDate("");
              setToDate("");
            }}
          >
            {t("reset")}
          </button>

        </div>
        <table className="orders_table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t("resgrn_no")}</th>
              <th>{t("ressupplier")}</th>
              <th>{t("resorder")}</th>
              <th>{t("resstatus")}</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {grns.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: 20 }}>
                  {t("resno_grns_found")}
                </td>
              </tr>
            )}

            {grns
              .filter(g => {

                // 🔍 SEARCH
                const matchesSearch =
                  !search ||
                  String(g.grn_id).toLowerCase().includes(search.toLowerCase()) ||
                  String(g.order_id).toLowerCase().includes(search.toLowerCase()) ||
                  g.supplier_name?.toLowerCase().includes(search.toLowerCase());

                // 📊 STATUS
                const matchesStatus =
                  statusFilter === "ALL" ||
                  String(g.status || "").toUpperCase().includes(statusFilter);

                // 📅 DATE (use created_at if exists)
                const grnDate = g.created_at
                  ? new Date(g.created_at)
                  : null;

                const matchesFrom =
                  !fromDate || (grnDate && grnDate >= new Date(fromDate));

                const matchesTo =
                  !toDate || (grnDate && grnDate <= new Date(toDate));

                return matchesSearch && matchesStatus && matchesFrom && matchesTo;
              })
              .map((g, i) => (
              <tr key={g.grn_id}>
                <td>{formatNumber(i + 1)}</td>
                <td dir="ltr" style={{ unicodeBidi: "isolate" }}>
                    {formatGRN(g.grn_id)}
                  </td>
                                  <td>{g.supplier_name}</td>
                                  <td dir="ltr" style={{ unicodeBidi: "isolate" }}>
                    {formatOrderId(g.order_id)}
                  </td>
                  <td>
                    <span className={`status ${g.status}`}>
                      {getStatusText(g.status)}
                    </span>
                  </td>
                <td>
                  <button
                    className="view_btn"
                    onClick={() =>
                      navigate(`/restaurantdashboard/grn/${g.order_id}`)
                    }
                  >
                    {t("resview")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}