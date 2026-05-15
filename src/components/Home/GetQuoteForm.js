// import React, { useState } from "react";

// const GetQuoteForm = () => {
//   const [formData, setFormData] = useState({
//     fullName: "",
//     companyName: "",
//     country: "",
//     city: "",
//     restaurant: "",
//     email: "",
//     countryCode: "+971",
//     phone: "",
//   });

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log(formData);
//   };

//   return (
//     <div className="ltn__contact-message-area mb-120">
//       <div className="container">
//         <div className="row">
//           <div className="col-lg-12">
//             <div className="ltn__form-box contact-form-box box-shadow white-bg">

//               <h4 className="title-2 text-center ">Restaurant Registration</h4>

//               <form onSubmit={handleSubmit}>
//                 <div className="row">

//                   {/* Full Name */}
//                   <div className="col-md-6">
//                     <div className="input-item">
//                       <input
//                         type="text"
//                         name="fullName"
//                         placeholder="Full Name"
//                         value={formData.fullName}
//                         onChange={handleChange}
//                       />
//                     </div>
//                   </div>

//                   {/* Company Name */}
//                   <div className="col-md-6">
//                     <div className="input-item">
//                       <input
//                         type="text"
//                         name="companyName"
//                         placeholder="Company Name"
//                         value={formData.companyName}
//                         onChange={handleChange}
//                       />
//                     </div>
//                   </div>

//                   {/* Country */}
//                   <div className="col-md-6">
//                     <div className="input-item">
//                       <select
//                         name="country"
//                         value={formData.country}
//                         onChange={handleChange}
//                       >
//                         <option value="">Select Country</option>
//                         <option value="UAE">UAE</option>
//                         <option value="India">India</option>
//                         <option value="Saudi Arabia">Saudi Arabia</option>
//                       </select>
//                     </div>
//                   </div>

//                   {/* City */}
//                   <div className="col-md-6">
//                     <div className="input-item">
//                       <select
//                         name="city"
//                         value={formData.city}
//                         onChange={handleChange}
//                       >
//                         <option value="">Select City</option>
//                         <option value="Dubai">Dubai</option>
//                         <option value="Abu Dhabi">Abu Dhabi</option>
//                         <option value="Sharjah">Sharjah</option>
//                       </select>
//                     </div>
//                   </div>

//                   {/* Restaurant */}
//                   <div className="col-md-6">
//                     <div className="input-item">
//                       <select
//                         name="restaurant"
//                         value={formData.restaurant}
//                         onChange={handleChange}
//                       >
//                         <option value="">Restaurant</option>
//                         <option value="Restaurant A">Restaurant A</option>
//                         <option value="Restaurant B">Restaurant B</option>
//                       </select>
//                     </div>
//                   </div>

//                   {/* Email */}
//                   <div className="col-md-6">
//                     <div className="input-item">
//                       <input
//                         type="email"
//                         name="email"
//                         placeholder="Email"
//                         value={formData.email}
//                         onChange={handleChange}
//                       />
//                     </div>
//                   </div>

//                   {/* Country Code */}
//                   <div className="col-md-6">
//                     <div className="input-item">
//                       <select
//                         name="countryCode"
//                         value={formData.countryCode}
//                         onChange={handleChange}
//                       >
//                         <option value="+971">UAE +971</option>
//                         <option value="+91">India +91</option>
//                         <option value="+966">Saudi +966</option>
//                       </select>
//                     </div>
//                   </div>

//                   {/* Phone */}
//                   <div className="col-md-6">
//                     <div className="input-item">
//                       <input
//                         type="text"
//                         name="phone"
//                         placeholder="Phone Number"
//                         value={formData.phone}
//                         onChange={handleChange}
//                       />
//                     </div>
//                   </div>

//                 </div>

//                 {/* BUTTON */}
//                 <div className="text-center mt-4">
//                   <button
//                     type="submit"
//                     className=" common_btn btn theme-btn-1 btn-effect-1 px-5"
//                   >
//                     Next
//                   </button>
//                 </div>

//               </form>

//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default GetQuoteForm;



import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const GetQuoteForm = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    country: "",
    city: "",
    restaurant: "",
    email: "",
    countryCode: "+971",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="ltn__contact-message-area mb-120">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="ltn__form-box contact-form-box box-shadow white-bg">

              <h4 className="title-2 text-center">
                {t("getquote.title")}
              </h4>

              <form onSubmit={handleSubmit}>
                <div className="row">

                  <div className="col-md-6">
                    <div className="input-item">
                      <input
                        type="text"
                        name="fullName"
                        placeholder={t("getquote.full_name")}
                        value={formData.fullName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="input-item">
                      <input
                        type="text"
                        name="companyName"
                        placeholder={t("getquote.company_name")}
                        value={formData.companyName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="input-item">
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                      >
                        <option value="">{t("getquote.select_country")}</option>
                        <option value="UAE">UAE</option>
                        <option value="India">India</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="input-item">
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                      >
                        <option value="">{t("getquote.select_city")}</option>
                        <option value="Dubai">Dubai</option>
                        <option value="Abu Dhabi">Abu Dhabi</option>
                        <option value="Sharjah">Sharjah</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="input-item">
                      <select
                        name="restaurant"
                        value={formData.restaurant}
                        onChange={handleChange}
                      >
                        <option value="">{t("getquote.restaurant")}</option>
                        <option value="Restaurant A">Restaurant A</option>
                        <option value="Restaurant B">Restaurant B</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="input-item">
                      <input
                        type="email"
                        name="email"
                        placeholder={t("getquote.email")}
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="input-item">
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleChange}
                      >
                        <option value="+971">UAE +971</option>
                        <option value="+91">India +91</option>
                        <option value="+966">Saudi +966</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="input-item">
                      <input
                        type="text"
                        name="phone"
                        placeholder={t("getquote.phone")}
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                </div>

                <div className="text-center mt-4">
                  <button
                    type="submit"
                    className="common_btn btn theme-btn-1 btn-effect-1 px-5"
                  >
                    {t("getquote.next")}
                  </button>
                </div>

              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetQuoteForm;