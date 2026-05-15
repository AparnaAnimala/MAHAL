// import React from "react";
// import aboutImg from "../../images/mobile_app1.png";

// const DownloadApp = () => {
//   return (
//     <section className="mahal-download-section">
//       <div className="container">
//         <div className="mahal-download-card">
//           <div className="row align-items-center">
//             {/* LEFT CONTENT */}
//             <div className="col-lg-7 mb-4 mb-lg-0">
//               <div className="mahal-download-content">
//                 <h6 className="mahal-subtitle">GET THE APP</h6>

//                 <h2 className="mahal-title">
//                   Simple Way to Order <br />
//                   Your Food <span>Faster</span>
//                 </h2>

//                 <p className="mahal-desc">
//                   Manage your food procurement seamlessly with real-time
//                   pricing, verified suppliers, and reliable deliveries — all
//                   from one app.
//                 </p>
// <p class="mahal-text">
// From first-time users to growing business owners, the MAHAL mobile app empowers you to manage orders, connect with verified partners, and track transactions in real-time — all from your smartphone.
// </p>

//                 <div className="mahal-store-buttons">
//                   <a href="#" className="store-btn apple">
//                     <i className="fab fa-apple"></i>
//                     <div>
//                       <span>Download on</span>
//                       <strong>App Store</strong>
//                     </div>
//                   </a>

//                   <a href="#" className="store-btn android">
//                     <i className="fab fa-google-play"></i>
//                     <div>
//                       <span>Get it on</span>
//                       <strong>Play Store</strong>
//                     </div>
//                   </a>
//                 </div>
//               </div>
//             </div>

//             {/* RIGHT IMAGE */}
//             <div className="col-lg-5 text-center">
//               <div className="mahal-download-image">
//                 <img src={aboutImg} alt="MAHAL App" />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default DownloadApp;


import React from "react";
import { useTranslation } from "react-i18next";
import aboutImg from "../../images/mobile_app1.png";

const DownloadApp = () => {
  const { t } = useTranslation();

  return (
    <section className="mahal-download-section">
      <div className="container">
        <div className="mahal-download-card">
          <div className="row align-items-center">

            {/* LEFT CONTENT */}
            <div className="col-lg-7 mb-4 mb-lg-0">
              <div className="mahal-download-content">

                <h6 className="mahal-subtitle">
                  {t("downloadapp.get_app")}
                </h6>

                <h2 className="mahal-title">
                  {t("downloadapp.title1")} <br />
                  {t("downloadapp.title2")}{" "}
                  <span>{t("downloadapp.faster")}</span>
                </h2>

                <p className="mahal-desc">
                  {t("downloadapp.desc")}
                </p>

                <p className="mahal-text">
                  {t("downloadapp.text")}
                </p>

                <div className="mahal-store-buttons">
                  <a href="#" className="store-btn apple">
                    <i className="fab fa-apple"></i>
                    <div>
                      <span>{t("downloadapp.download_on")}</span>
                      <strong>{t("downloadapp.app_store")}</strong>
                    </div>
                  </a>

                  <a href="#" className="store-btn android">
                    <i className="fab fa-google-play"></i>
                    <div>
                      <span>{t("downloadapp.get_it_on")}</span>
                      <strong>{t("downloadapp.play_store")}</strong>
                    </div>
                  </a>
                </div>

              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div className="col-lg-5 text-center">
              <div className="mahal-download-image">
                <img src={aboutImg} alt="MAHAL App" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadApp;