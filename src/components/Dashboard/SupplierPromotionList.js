// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "../../pages/css/SupplierPromotionList.css";

// const API = "http://192.168.2.9:5000/api/v1";

// const SupplierPromotionList = () => {

//   const [promotions, setPromotions] = useState([]);
//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchPromotions();
//   }, []);

//   const fetchPromotions = async () => {
//     try {

//       const res = await axios.get(
//         `${API}/supplier/promotions`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       console.log("PROMOTIONS API:", res.data);

//       setPromotions(res.data);

//     } catch (err) {
//       console.log(err);
//     }
//   };

//   return (
//     <div className="promo-list-page">

//       <h2>Promotion Review</h2>

//       <table className="promo-table">

//         <thead>
//           <tr>
//             <th>ID</th>
//             <th>Title</th>
//             <th>Offer</th>
//             <th>Start Date</th>
//             <th>End Date</th>
//             <th>Status</th>
//             <th>Action</th>
//           </tr>
//         </thead>

//         <tbody>

//           {promotions.length === 0 && (
//             <tr>
//               <td colSpan="7" style={{ textAlign:"center" }}>
//                 No promotions found
//               </td>
//             </tr>
//           )}

//           {promotions.map((promo) => (
//             <tr key={promo.promo_id}>

//               <td>{promo.promo_id}</td>

//               <td>{promo.title}</td>

//               <td>
//                 {promo.offer_value}
//                 {promo.offer_type === "PERCENTAGE" ? "%" : "QAR "}
//               </td>

//               <td>{promo.start_date}</td>

//               <td>{promo.end_date}</td>

//               <td>
//                 <span className={`status ${promo.supplier_status}`}>
//                   {promo.supplier_status}
//                 </span>
//               </td>

//               <td>
//                 <button
//                   className="view-btn"
//                   onClick={() =>
//                     navigate(`/dashboard/promotion-review/${promo.promo_id}`)
//                   }
//                 >
//                   View
//                 </button>
//               </td>

//             </tr>
//           ))}

//         </tbody>

//       </table>

//     </div>
//   );
// };

// export default SupplierPromotionList;


import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../pages/css/SupplierPromotionList.css";
import { useTranslation } from "react-i18next";

const API = "http://192.168.2.9:5000/api/v1";

const SupplierPromotionList = () => {

  const [promotions, setPromotions] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetchPromotions();
  }, [i18n.language]); // ✅ important for language refresh

  const fetchPromotions = async () => {
    try {
      const res = await axios.get(
        `${API}/supplier/promotions?lang=${i18n.language}`, // ✅ pass lang
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPromotions(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  const isArabic = i18n.language?.startsWith("ar");

const formatNumber = (num) => {
  return new Intl.NumberFormat(
    isArabic ? "ar-EG" : "en-US"
  ).format(num);
};

const formatCurrency = (num) => {
  const value = formatNumber(Number(num || 0));
  return isArabic ? `ر.ق ${value}` : `QAR ${value}`;
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat(
    isArabic ? "ar-EG" : "en-GB",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(new Date(date));
};

  return (
    <div className="promo-list-page">

      <h2>{t("promotion_review")}</h2>

      <table className="promo-table">

        <thead>
          <tr>
            <th>{t("id")}</th>
            <th>{t("title")}</th>
            <th>{t("offer")}</th>
            <th>{t("start_date")}</th>
            <th>{t("end_date")}</th>
            <th>{t("status")}</th>
            <th>{t("action")}</th>
          </tr>
        </thead>

        <tbody>

          {promotions.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign:"center" }}>
                {t("no_promotions")}
              </td>
            </tr>
          )}

          {promotions.map((promo) => (
            <tr key={promo.promo_id}>

              <td>{formatNumber(promo.promo_id)}</td>

              {/* ✅ TITLE LANGUAGE SWITCH */}
              <td>
                {i18n.language === "ar"
                  ? promo.title_arabic || promo.title
                  : promo.title}
              </td>

              <td>
                {promo.offer_type === "PERCENTAGE"
                  ? `${formatNumber(promo.offer_value)}% ${t("off")}`
                  : `${formatCurrency(promo.offer_value)} ${t("off")}`}
              </td>

              <td>{formatDate(promo.start_date)}</td>

              <td>{formatDate(promo.end_date)}</td>

              <td>
                <span className={`status ${promo.supplier_status}`}>
                  {t(`status_${promo.supplier_status?.toLowerCase()}`) || promo.supplier_status}
                </span>
              </td>

              <td>
                <button
                  className="view-btn"
                  onClick={() =>
                    navigate(`/dashboard/promotion-review/${promo.promo_id}`)
                  }
                >
                  {t("view")}
                </button>
              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
};

export default SupplierPromotionList;