// import React from "react";

// const WorkProcess = () => {
//   return (
//     <section className="mahal-work-process">
//       <div className="container">

//         {/* SECTION HEADING */}
//         <div className="row mb-5">
//           <div className="col-lg-12 m-auto text-center">
//             <h6 className="mahal-subtitle">HOW IT WORKS</h6>
//             <h2 className="mahal-title">
//               Simple & Transparent  
//                <span> Procurement Process</span>
//             </h2>
//           </div>
//         </div>

//         {/* PROCESS STEPS */}
//         <div className="row">

           

//            <div className="col-xl-3 col-md-6 ">
//             <div className="mahal-process-card">
//               <span className="step">01</span>
//               <h4>Browse & Select</h4>
//               <p>Choose products from verified suppliers with transparent pricing.</p>
//             </div>
//           </div>

//           <div className="col-xl-3 col-md-6 ">
//             <div className="mahal-process-card">
//               <span className="step">02</span>
//               <h4>Add to Cart</h4>
//               <p>Manage quantities, schedules, and recurring orders with ease.</p>
//             </div>
//           </div>

//           <div className="col-xl-3 col-md-6 ">
//             <div className="mahal-process-card">
//               <span className="step">03</span>
//               <h4>Secure Payment</h4>
//               <p>Pay securely with clear invoices and business-friendly billing.</p>
//             </div>
//           </div>

//           <div className="col-xl-3 col-md-6 ">
//             <div className="mahal-process-card">
//               <span className="step">04</span>
//               <h4>Reliable Delivery</h4>
//               <p>Receive fresh supplies on time through our delivery network.</p>
//             </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default WorkProcess;

import React from "react";
import { useTranslation } from "react-i18next";

const WorkProcess = () => {
  const { t, i18n } = useTranslation();

  return (
    <section
      className="mahal-work-process"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="container">

        {/* HEADING */}
        <div className="row mb-5">
          <div className="col-lg-12 m-auto text-center">
            <h6 className="mahal-subtitle">
              {t("workProcessContent.subtitle")}
            </h6>

            <h2 className="mahal-title">
              {t("workProcessContent.title1")}{" "}
              <span>{t("workProcessContent.title2")}</span>
            </h2>
          </div>
        </div>

        {/* STEPS */}
        <div className="row">

          <div className="col-xl-3 col-md-6">
            <div className="mahal-process-card">
              <span className="step">01</span>
              <h4>{t("workProcessContent.step1_title")}</h4>
              <p>{t("workProcessContent.step1_desc")}</p>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="mahal-process-card">
              <span className="step">02</span>
              <h4>{t("workProcessContent.step2_title")}</h4>
              <p>{t("workProcessContent.step2_desc")}</p>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="mahal-process-card">
              <span className="step">03</span>
              <h4>{t("workProcessContent.step3_title")}</h4>
              <p>{t("workProcessContent.step3_desc")}</p>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="mahal-process-card">
              <span className="step">04</span>
              <h4>{t("workProcessContent.step4_title")}</h4>
              <p>{t("workProcessContent.step4_desc")}</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WorkProcess;
