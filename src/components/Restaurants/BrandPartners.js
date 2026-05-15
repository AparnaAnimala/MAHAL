// import React from "react";

// import brand1 from "../../images/brand_item_1.png";
// import brand2 from "../../images/brand_item_2.png";
// import brand3 from "../../images/brand_item_3.png";
// import brand4 from "../../images/brand_item_4.png";
// import brand5 from "../../images/brand_item_5.png";
// import brand6 from "../../images/brand_item_6.png";

// const supplierPartners = [
//   brand1,
//   brand2,
//   brand3,
//   brand4,
//   brand5,
//   brand6,
// ];

// const SupplierPartners = () => {
//   return (
//     <section className="mahal-supplier-partners">
//       <div className="container">

//         {/* HEADING */}
//         <div className="row mb-5">
//           <div className="col-lg-6 m-auto text-center">
//             <h6 className="mahal-subtitle">SUPPLIER PARTNERS</h6>
//             <h2 className="mahal-title">
//               Trusted by <span>Leading Suppliers</span>
//             </h2>
//             <p className="mahal-desc">
//               From local producers to large distributors, suppliers across
//               categories trust MAHAL to grow their business and reach
//               restaurants at scale.
//             </p>
//           </div>
//         </div>

//         {/* LOGO MARQUEE */}
//         <div className="mahal-partner-marquee">
//           <ul className="partner-track">
//             {supplierPartners.concat(supplierPartners).map((img, index) => (
//               <li key={index} className="partner-item">
//                 <img src={img} alt="Supplier Partner" />
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* TRUST METRICS */}
//         <div className="row mt-5 text-center">
//           <div className="col-md-4">
//             <h3 className="metric-number">500+</h3>
//             <p className="metric-text">Active Suppliers</p>
//           </div>
//           <div className="col-md-4">
//             <h3 className="metric-number">2,000+</h3>
//             <p className="metric-text">Restaurants Served</p>
//           </div>
//           <div className="col-md-4">
//             <h3 className="metric-number">Daily</h3>
//             <p className="metric-text">Bulk Orders</p>
//           </div>
//         </div>

//         {/* CTA */}
//         <div className="text-center mt-5">
//           <a href="/Registration" className="mahal-btn-primary">
//             Join as a Supplier
//           </a>
//         </div>

// <br></br>

//           <hr></hr>

//       </div>
    
//     </section>

    
//   );
// };

// export default SupplierPartners;




import React from "react";
import { useTranslation } from "react-i18next";

import brand1 from "../../images/brand_item_1.png";
import brand2 from "../../images/brand_item_2.png";
import brand3 from "../../images/brand_item_3.png";
import brand4 from "../../images/brand_item_4.png";
import brand5 from "../../images/brand_item_5.png";
import brand6 from "../../images/brand_item_6.png";

const supplierPartners = [
  brand1,
  brand2,
  brand3,
  brand4,
  brand5,
  brand6,
];

const SupplierPartners = () => {
  const { t, i18n } = useTranslation();

  return (
    <section
      className="mahal-supplier-partners"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="container">

        {/* HEADING */}
        <div className="row mb-5">
          <div className="col-lg-6 m-auto text-center">

            <h6 className="mahal-subtitle">
              {t("supplierpartners.subtitle")}
            </h6>

            <h2 className="mahal-title">
              {t("supplierpartners.title1")}{" "}
              <span>{t("supplierpartners.title2")}</span>
            </h2>

            <p className="mahal-desc">
              {t("supplierpartners.desc")}
            </p>

          </div>
        </div>

        {/* LOGOS */}
        <div className="mahal-partner-marquee">
          <ul className="partner-track">
            {supplierPartners.concat(supplierPartners).map((img, index) => (
              <li key={index} className="partner-item">
                <img src={img} alt="Supplier Partner" />
              </li>
            ))}
          </ul>
        </div>

        {/* METRICS */}
        <div className="row mt-5 text-center">
          <div className="col-md-4">
            <h3 className="metric-number">500+</h3>
            <p className="metric-text">
              {t("supplierpartners.metric1")}
            </p>
          </div>

          <div className="col-md-4">
            <h3 className="metric-number">2,000+</h3>
            <p className="metric-text">
              {t("supplierpartners.metric2")}
            </p>
          </div>

          <div className="col-md-4">
            <h3 className="metric-number">
              {t("supplierpartners.metric3num")}
            </h3>
            <p className="metric-text">
              {t("supplierpartners.metric3")}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-5">
          <a href="/Registration" className="mahal-btn-primary">
            {t("supplierpartners.cta")}
          </a>
        </div>

        <br />
        <hr />

      </div>
    </section>
  );
};

export default SupplierPartners;