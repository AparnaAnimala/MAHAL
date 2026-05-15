// import React, { useEffect, useState } from "react";
// import ModificationRequestDetails from "./ModificationRequestDetails";

// const API = "http://192.168.2.9:5000/api/v1/orders/restaurant";

// export default function RestaurantModificationRequests() {
//   const token = localStorage.getItem("token");

//   const [requests, setRequests] = useState([]);
//   const [selectedRequest, setSelectedRequest] = useState(null);

//   useEffect(() => {
//     fetch(`${API}/orders/modification-requests`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((res) => res.json())
//       .then((data) => setRequests(Array.isArray(data) ? data : []))
//       .catch(() => setRequests([]));
//   }, [token]);

//   useEffect(() => {
//   fetch(
//     "http://192.168.2.9:5000/api/v1/orders/restaurant/notifications/auto-read",
//     {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         type: "ORDER_MODIFICATION",
//         reference_id: "ALL", // or specific order id
//       }),
//     }
//   ).then(() => {
//     window.dispatchEvent(new Event("refreshNotifications"));
//   });
// }, [token]);

//   const decide = async (id, decision) => {
//     await fetch(`${API}/orders/modification-requests/${id}/decision`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ decision }),
//     });

//     setRequests((prev) => prev.filter((r) => r.id !== id));
//     setSelectedRequest(null);
//   };

//   /* ================= DETAILS PAGE ================= */
//   if (selectedRequest) {
//     return (
//       <ModificationRequestDetails
//         request={selectedRequest}
//         onBack={() => setSelectedRequest(null)}
//         onDecision={decide}
//       />
//     );
//   }

//   /* ================= LIST PAGE ================= */
//   return (
//     <div className="dashboard_page">

//       <div className="page_header">
//         <h2>Modification Requests</h2>
//         <p className="page_subtitle">
//           Review and approve supplier order changes
//         </p>
//       </div>

//       <div className="card mt-3">
//         <table className="table order_table">
//           <thead>
//             <tr>
//               <th>Order ID</th>
//               <th>Supplier</th>
//               <th>Before</th>
//               <th>After</th>
//               <th>Reason</th>
//               <th>Status</th>
//               <th className="text-end">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {requests.length === 0 && (
//               <tr>
//                 <td colSpan="4" className="text-center py-4">
//                   No modification requests
//                 </td>
//               </tr>
//             )}

//             {requests.map((r) => (
//               <tr key={r.id}>
//                 <td>{r.order_id}</td>
//                 <td>{r.supplier_name}</td>
//                 <td>QAR  {r.total_before}</td>
//                 <td className={r.total_after < r.total_before ? "text-danger" : "text-success"}>
//                   QAR  {r.total_after}
//                 </td>
//                 <td>{r.note}</td>
//                 <td>
//                   <span className="status_badge warning">Pending</span>
//                 </td>
//                 <td className="text-end">
//                   <button
//                     className="btn btn-sm btn-outline-primary"
//                     onClick={() => setSelectedRequest(r)}
//                   >
//                     View
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ModificationRequestDetails from "./ModificationRequestDetails";

const API = "http://192.168.2.9:5000/api/v1/orders/restaurant";

export default function RestaurantModificationRequests() {
  const token = localStorage.getItem("token");
  const { t, i18n } = useTranslation();

  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const formatCurrency = (value) => {
  return new Intl.NumberFormat(
    i18n.language === "ar" ? "ar-QA" : "en-US",
    {
      style: "currency",
      currency: "QAR",
      minimumFractionDigits: 2,
    }
  ).format(value);
};     
  const formatOrderId = (id) => {
  if (i18n.language !== "ar") return id;

  return id.replace(/\d/g, (d) =>
    new Intl.NumberFormat("ar-QA").format(d)
  );
};

  useEffect(() => {
    fetch(`${API}/orders/modification-requests`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const rows = Array.isArray(data)
          ? data.map((r) => ({
              ...r,
              supplier_name:
                i18n.language === "ar"
                  ? (
                      r.supplier_name_arabic ||
                      r.company_name_arabic ||
                      r.restaurant_name_arabic ||
                      r.supplier_name ||
                      r.company_name_english ||
                      r.restaurant_name_english ||
                      "-"
                    )
                  : (
                      r.supplier_name ||
                      r.company_name_english ||
                      r.restaurant_name_english ||
                      r.supplier_name_arabic ||
                      r.company_name_arabic ||
                      "-"
                    )
            }))
          : [];

        setRequests(rows);
      })
      .catch(() => setRequests([]));
  }, [token, i18n.language]);

  useEffect(() => {
    fetch(
      "http://192.168.2.9:5000/api/v1/orders/restaurant/notifications/auto-read",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "ORDER_MODIFICATION",
          reference_id: "ALL",
        }),
      }
    ).then(() => {
      window.dispatchEvent(new Event("refreshNotifications"));
    });
  }, [token]);

  const decide = async (id, decision) => {
    await fetch(`${API}/orders/modification-requests/${id}/decision`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ decision }),
    });

    setRequests((prev) => prev.filter((r) => r.id !== id));
    setSelectedRequest(null);
  };

  if (selectedRequest) {
    return (
      <ModificationRequestDetails
        request={selectedRequest}
        onBack={() => setSelectedRequest(null)}
        onDecision={decide}
      />
    );
  }

  return (
    <div className="dashboard_page">
      <div className="page_header">
        <h2>{t("resmodification_requests")}</h2>
        <p className="page_subtitle">
          {t("resreview_supplier_changes")}
        </p>
      </div>

      <div className="card mt-3">
        <table className="table order_table">
          <thead>
            <tr>
              <th>{t("resorder_id")}</th>
              <th>{t("ressupplier")}</th>
              <th>{t("resbefore")}</th>
              <th>{t("resafter")}</th>
              <th>{t("resreason")}</th>
              <th>{t("resstatus")}</th>
              <th className="text-end">{t("resaction")}</th>
            </tr>
          </thead>

          <tbody>
            {requests.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  {t("resno_modification_requests")}
                </td>
              </tr>
            )}

            {requests.map((r) => (
              <tr key={r.id}>
               <td
                dir="ltr"
                style={{
                  textAlign: i18n.language === "ar" ? "right" : "left",
                }}
              >
                {formatOrderId(r.order_id)}
              </td>
                <td>{r.supplier_name}</td>
                  <td>
                    {i18n.language === "ar"
                      ? `${formatCurrency(r.total_before)} ر.ق`
                      : `${t("resqar")} ${r.total_before}`}
                  </td>

                  <td
                    className={
                      r.total_after < r.total_before
                        ? "text-danger"
                        : "text-success"
                    }
                  >
                    {i18n.language === "ar"
                      ? `${formatCurrency(r.total_after)} ر.ق`
                      : `${t("resqar")} ${r.total_after}`}
                  </td>

                <td>{r.note}</td>

                <td>
                  <span className="status_badge warning">
                    {t("status_pending")}
                  </span>
                </td>

                <td className="text-end">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setSelectedRequest(r)}
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