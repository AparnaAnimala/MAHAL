// import React from "react";

// const SupplierBenefits = () => {
//   return (
//     <section className="mahal-supplier-benefits">
//       <div className="container">

//         {/* HEADING */}
//         <div className="row mb-5">
//           <div className="col-lg-10 m-auto text-center">
//             <h6 className="mahal-subtitle">SUPPLIER BENEFITS</h6>
//             <h2 className="mahal-title">
//               Why Suppliers Choose <span>MAHAL</span>
//             </h2>
//             <p className="mahal-desc">
//               MAHAL is designed to help suppliers grow faster, sell smarter,
//               and build long-term partnerships with restaurants.
//             </p>
//           </div>
//         </div>

//         {/* BENEFITS GRID */}
//         <div className="row">

//           <div className="col-lg-4 col-md-6 mb-4">
//             <div className="mahal-benefit-card">
//               <i className="fas fa-store"></i>
//               <h4>Direct Restaurant Access</h4>
//               <p>
//                 Connect directly with verified restaurants and food businesses
//                 without middlemen.
//               </p>
//             </div>
//           </div>

//           <div className="col-lg-4 col-md-6 mb-4">
//             <div className="mahal-benefit-card">
//               <i className="fas fa-boxes-stacked"></i>
//               <h4>Bulk & Recurring Orders</h4>
//               <p>
//                 Receive consistent bulk and repeat orders that help stabilize
//                 your daily sales.
//               </p>
//             </div>
//           </div>

//           <div className="col-lg-4 col-md-6 mb-4">
//             <div className="mahal-benefit-card">
//               <i className="fas fa-wallet"></i>
//               <h4>Secure & Timely Payments</h4>
//               <p>
//                 Transparent pricing and reliable payment cycles you can trust.
//               </p>
//             </div>
//           </div>

//           <div className="col-lg-4 col-md-6 mb-4">
//             <div className="mahal-benefit-card">
//               <i className="fas fa-truck"></i>
//               <h4>Logistics & Delivery Support</h4>
//               <p>
//                 Get support for delivery coordination and supply scheduling.
//               </p>
//             </div>
//           </div>

//           <div className="col-lg-4 col-md-6 mb-4">
//             <div className="mahal-benefit-card">
//               <i className="fas fa-chart-line"></i>
//               <h4>Business Growth Insights</h4>
//               <p>
//                 Track demand trends, manage inventory, and grow with data-driven
//                 insights.
//               </p>
//             </div>
//           </div>

//           <div className="col-lg-4 col-md-6 mb-4">
//             <div className="mahal-benefit-card">
//               <i className="fas fa-handshake"></i>
//               <h4>Long-Term Partnerships</h4>
//               <p>
//                 Build trusted relationships with restaurants for sustained
//                 business growth.
//               </p>
//             </div>
//           </div>

//         </div>

//         {/* CTA */}
//         <div className="text-center">
//           <a href="/Registration" className="mahal-btn-primary">
//             Start Selling on MAHAL
//           </a>
//         </div>

//       </div>
//     </section>
//   );
// };

// export default SupplierBenefits;




import React from "react";
import { useTranslation } from "react-i18next";

const SupplierBenefits = () => {
  const { t, i18n } = useTranslation();

  return (
    <section
      className="mahal-supplier-benefits"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="container">

        {/* HEADING */}
        <div className="row mb-5">
          <div className="col-lg-10 m-auto text-center">
            <h6 className="mahal-subtitle">
              {t("supplierbenefits.subtitle")}
            </h6>

            <h2 className="mahal-title">
              {t("supplierbenefits.title1")}{" "}
              <span>{t("supplierbenefits.title2")}</span>
            </h2>

            <p className="mahal-desc">
              {t("supplierbenefits.desc")}
            </p>
          </div>
        </div>

        {/* BENEFITS GRID */}
        <div className="row">

          {/* 1 */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="mahal-benefit-card">
              <i className="fas fa-store"></i>
              <h4>{t("supplierbenefits.b1_title")}</h4>
              <p>{t("supplierbenefits.b1_desc")}</p>
            </div>
          </div>

          {/* 2 */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="mahal-benefit-card">
              <i className="fas fa-boxes-stacked"></i>
              <h4>{t("supplierbenefits.b2_title")}</h4>
              <p>{t("supplierbenefits.b2_desc")}</p>
            </div>
          </div>

          {/* 3 */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="mahal-benefit-card">
              <i className="fas fa-wallet"></i>
              <h4>{t("supplierbenefits.b3_title")}</h4>
              <p>{t("supplierbenefits.b3_desc")}</p>
            </div>
          </div>

          {/* 4 */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="mahal-benefit-card">
              <i className="fas fa-truck"></i>
              <h4>{t("supplierbenefits.b4_title")}</h4>
              <p>{t("supplierbenefits.b4_desc")}</p>
            </div>
          </div>

          {/* 5 */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="mahal-benefit-card">
              <i className="fas fa-chart-line"></i>
              <h4>{t("supplierbenefits.b5_title")}</h4>
              <p>{t("supplierbenefits.b5_desc")}</p>
            </div>
          </div>

          {/* 6 */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="mahal-benefit-card">
              <i className="fas fa-handshake"></i>
              <h4>{t("supplierbenefits.b6_title")}</h4>
              <p>{t("supplierbenefits.b6_desc")}</p>
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="text-center">
          <a href="/Registration" className="mahal-btn-primary">
            {t("supplierbenefits.cta")}
          </a>
        </div>

      </div>
    </section>
  );
};

export default SupplierBenefits;