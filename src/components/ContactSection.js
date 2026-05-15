// import React from "react";
// import ContactImg from "../images/contact_img.jpg";

// const Contact = () => {
//   return (
//     <section className="contact pt_75 xs_pt_55">
//       <div className="container">
//         {/* CONTACT INFO */}
//         <div className="row">
//           {/* Address */}
//           <div className="col-xl-4 col-sm-6 col-lg-4">
//             <div className="contact_info text-center">
//               <span className="contact_icon">
//                 <i className="fas fa-map-marker-alt"></i>
//               </span>
//               <h3>Address</h3>
//               <p>
//                 16/A, Romadan House City Tower <br />
//                 New York, United States
//               </p>
//             </div>
//           </div>

//           {/* Phone */}
//           <div className="col-xl-4 col-sm-6 col-lg-4">
//             <div className="contact_info text-center">
//               <span className="contact_icon">
//                 <i className="fas fa-phone-alt"></i>
//               </span>
//               <h3>Phone Number</h3>
//               <a href="tel:+8801234567895">+880 1234 567895</a>
//               <a href="tel:+8809876543217">+880 9876 543217</a>
//             </div>
//           </div>

//           {/* Email */}
//           <div className="col-xl-4 col-sm-6 col-lg-4">
//             <div className="contact_info text-center">
//               <span className="contact_icon">
//                 <i className="fas fa-envelope"></i>
//               </span>
//               <h3>Email Address</h3>
//               <a href="mailto:example@gmail.com">example@gmail.com</a>
//               <a href="mailto:jhondeo@gmail.com">jhondeo@gmail.com</a>
//             </div>
//           </div>
//         </div>

//         {/* FORM */}
//         <div className="row mt_50 mt-5">
//           <div className="col-lg-4">
//             <img
//               src={ContactImg}
//               alt="Contact"
//               loading="lazy"
//               className="img-fluid"
//             />
//           </div>

//           <div className="col-lg-8 m-auto">
//             <div className="contact_form">
//               <h3>Send Supplier Request</h3>

//               <form>
//                 <div className="row">
//                   <div className="col-md-6">
//                     <input type="text" placeholder="Your Name" />
//                   </div>
//                   <div className="col-md-6">
//                     <input type="email" placeholder="Email Address" />
//                   </div>
//                   <div className="col-md-6">
//                     <input type="text" placeholder="Phone Number" />
//                   </div>
//                   <div className="col-md-6">
//                     <input type="text" placeholder="Subject" />
//                   </div>
//                   <div className="col-12 ">
//                     <textarea rows="6" placeholder="Start Chat"></textarea>
//                   </div>
//                    <div className="col-12 m-auto text-center mt-3">
//                     <button type="submit" className="common_btn m-auto">
//                       Raise Inquiry <span></span>
//                     </button>
//                   </div>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>

//         <div className="row">
//           <div className="col-12">
//             <div className="contact_map">
//               <iframe
//                 title="Google Map"
//                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2209267.837075547!2d50.264548653464296!3d25.33822811400922!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e45c534ffdce87f%3A0x1cfa88cf812b4032!2sQatar!5e1!3m2!1sen!2sin!4v1767339294245!5m2!1sen!2sin"
//                 width="100%"
//                 height="450"
//                 style={{ border: 0 }}
//                 allowFullScreen
//                 loading="lazy"
//                 referrerPolicy="no-referrer-when-downgrade"
//               />

//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Contact;


import React from "react";
import { useTranslation } from "react-i18next";
import ContactImg from "../images/contact_img.jpg";

const Contact = () => {
  const { t, i18n } = useTranslation();

  return (
    <section
      className="contact pt_75 xs_pt_55"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="container">

        {/* CONTACT INFO */}
        <div className="row">

          {/* Address */}
          <div className="col-xl-4 col-sm-6 col-lg-4">
            <div className="contact_info text-center">
              <span className="contact_icon">
                <i className="fas fa-map-marker-alt"></i>
              </span>

              <h3>{t("contactContent.address")}</h3>

              <p style={{ whiteSpace: "pre-line" }}>
                {t("contactContent.addressText")}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="col-xl-4 col-sm-6 col-lg-4">
            <div className="contact_info text-center">
              <span className="contact_icon">
                <i className="fas fa-phone-alt"></i>
              </span>

              <h3>{t("contactContent.phone")}</h3>

              <a href="tel:+8801234567895">+880 1234 567895</a>
              <a href="tel:+8809876543217">+880 9876 543217</a>
            </div>
          </div>

          {/* Email */}
          <div className="col-xl-4 col-sm-6 col-lg-4">
            <div className="contact_info text-center">
              <span className="contact_icon">
                <i className="fas fa-envelope"></i>
              </span>

              <h3>{t("contactContent.email")}</h3>

              <a href="mailto:example@gmail.com">example@gmail.com</a>
              <a href="mailto:jhondeo@gmail.com">jhondeo@gmail.com</a>
            </div>
          </div>

        </div>

        {/* FORM */}
        <div className="row mt_50 mt-5">

          <div className="col-lg-4">
            <img
              src={ContactImg}
              alt="Contact"
              className="img-fluid"
            />
          </div>

          <div className="col-lg-8 m-auto">
            <div className="contact_form">

              <h3>{t("contactContent.formTitle")}</h3>

              <form>
                <div className="row">

                  <div className="col-md-6">
                    <input
                      type="text"
                      placeholder={t("contactContent.name")}
                    />
                  </div>

                  <div className="col-md-6">
                    <input
                      type="email"
                      placeholder={t("contactContent.emailPlaceholder")}
                    />
                  </div>

                  <div className="col-md-6">
                    <input
                      type="text"
                      placeholder={t("contactContent.phonePlaceholder")}
                    />
                  </div>

                  <div className="col-md-6">
                    <input
                      type="text"
                      placeholder={t("contactContent.subject")}
                    />
                  </div>

                  <div className="col-12">
                    <textarea
                      rows="6"
                      placeholder={t("contactContent.message")}
                    ></textarea>
                  </div>

                  <div className="col-12 text-center mt-3">
                    <button type="submit" className="common_btn">
                      {t("contactContent.submit")} <span></span>
                    </button>
                  </div>

                </div>
              </form>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Contact;

