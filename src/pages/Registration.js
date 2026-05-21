



// import React, { useState, useEffect, useRef } from "react";
// import bgImage from "../images/bg-foodres.png";
// import signImg from "../images/sign_in_img_1.jpg";
// import { Link } from "react-router-dom";
// import {
//   FaUser,
//   FaBuilding,
//   FaGlobe,
//   FaCity,
//   FaUtensils,
//   FaEnvelope,
//   FaPhone
// } from "react-icons/fa";
// const API_BASE_URL = "http://192.168.2.22:5000/api/suppliers";

// export default function Register() {
//   const [step, setStep] = useState(1);
//   const [otp, setOtp] = useState("");
//   const [isSendingOtp, setIsSendingOtp] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const inputsRef = useRef([]);
//   const timerRef = useRef(null);

//   const [resendTime, setResendTime] = useState(0);

//   const [masterData, setMasterData] = useState({
//     country: [],
//     city: [],
//   });

//   const [form, setForm] = useState({
//     fullName: "",
//     companyName: "",
//     email: "",
//     country: "",
//     city: "",
//     countryCode: "+971",
//     phoneNumber: "",
//     businessType: "Restaurant",
//   });

//   const [files, setFiles] = useState({});
//   const [preview, setPreview] = useState({});

//   /* ================= MASTER DATA ================= */
//   useEffect(() => {
//     async function load() {
//       try {
//         const c = await fetch(`${API_BASE_URL}/master/country`);
//         const ci = await fetch(`${API_BASE_URL}/master/city`);
//         setMasterData({
//           country: (await c.json()).data || [],
//           city: (await ci.json()).data || [],
//         });
//       } catch (err) {
//         console.error("Master data error", err);
//       }
//     }
//     load();
//     return () => timerRef.current && clearInterval(timerRef.current);
//   }, []);

//   /* ================= API CALLS ================= */
//   const sendOtpApi = async () => {
//     const res = await fetch(`${API_BASE_URL}/send-otp`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email: form.email }),
//     });
//     return res.ok;
//   };

//   const verifyOtpApi = async (code) => {
//     const res = await fetch(`${API_BASE_URL}/verify-otp`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email: form.email, otp: code }),
//     });
//     return res.ok;
//   };

//   /* ================= FORM ================= */
//   const handleFormChange = (e) =>
//     setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

//   const handleFileChange = (e) => {
//     const f = e.target.files[0];
//     if (f) {
//       setFiles((p) => ({ ...p, [e.target.name]: f }));
//       setPreview((p) => ({ ...p, [e.target.name]: URL.createObjectURL(f) }));
//     }
//   };

//   /* ================= SEND OTP ================= */
//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     if (!form.email) return alert("Enter email");

//     setIsSendingOtp(true);
//     try {
//       const ok = await sendOtpApi();
//       if (!ok) {
//         alert("OTP send failed");
//         setIsSendingOtp(false);
//         return;
//       }
//       setStep(2);
//       startResendTimer();
//     } catch {
//       alert("OTP error");
//     }
//     setIsSendingOtp(false);
//   };

//   const startResendTimer = () => {
//     setResendTime(30);
//     timerRef.current = setInterval(() => {
//       setResendTime((v) => {
//         if (v <= 1) {
//           clearInterval(timerRef.current);
//           return 0;
//         }
//         return v - 1;
//       });
//     }, 1000);
//   };

//   const handleResend = async () => {
//     if (resendTime > 0) return;
//     try {
//       const ok = await sendOtpApi();
//       if (!ok) return alert("Resend failed");
//       startResendTimer();
//     } catch {
//       alert("Resend error");
//     }
//   };

//   /* ================= OTP INPUT ================= */
//   const handleInput = (e, i) => {
//     const value = e.target.value.replace(/\D/g, "");
//     e.target.value = value;

//     const code = inputsRef.current.map((b) => b.value).join("");
//     setOtp(code);

//     if (value && i < 5) inputsRef.current[i + 1].focus();
//     if (code.length === 6) handleVerify(code);
//   };

//   const handleKeyDown = (e, i) => {
//     if (e.key === "Backspace" && !e.target.value && i > 0)
//       inputsRef.current[i - 1].focus();
//   };

//   const handlePaste = (e) => {
//     const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
//     paste.split("").forEach((d, i) => {
//       inputsRef.current[i].value = d || "";
//     });
//     setOtp(paste);
//     if (paste.length === 6) handleVerify(paste);
//   };

//   /* ================= VERIFY OTP (LIVE ONLY) ================= */
//   const handleVerify = async (code = otp) => {
//     setError("");
//     if (code.length !== 6) return setError("Enter 6-digit OTP");

//     setLoading(true);
//     try {
//       const ok = await verifyOtpApi(code);
//       if (!ok) {
//         setError("Invalid OTP");
//         setLoading(false);
//         return;
//       }
//       localStorage.setItem("user_role", form.businessType);
//       setStep(3);
//     } catch {
//       setError("OTP verification failed");
//     }
//     setLoading(false);
//   };

//   /* ================= FINAL SUBMIT ================= */
//   const handleSubmitFinal = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     const fd = new FormData();
//     Object.entries(form).forEach(([k, v]) => fd.append(k, v));
//     Object.entries(files).forEach(([k, v]) => v && fd.append(k, v));

//     const endpoint =
//       form.businessType === "Supplier"
//         ? `${API_BASE_URL}/register-supplier`
//         : `${API_BASE_URL}/register-restaurant`;

//     try {
//       const res = await fetch(endpoint, {
//         method: "POST",
//         body: fd,
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         alert(data.error || "Registration failed");
//         setIsSubmitting(false);
//         return;
//       }

//       localStorage.setItem("account_status", "pending");
//       localStorage.setItem("user_role", form.businessType);

//       alert("Registration completed successfully");
//       window.location.href = "/";
//     } catch (err) {
//       alert("Server error — check backend logs");
//     }

//     setIsSubmitting(false);
//   };


//   const attachmentFields =
//     form.businessType === "Supplier"
//       ? ["tradeLicense", "vatCertificate", "computerCardCopy", "crCopy"]
//       : ["tradeLicense", "vatCertificate", "foodSafetyCertificate"];

//   /* ================= UI ================= */
//   return (
//     <section
//       className="sign_in pt_100 xs_pt_80"
//       style={{
//         backgroundImage: `url(${bgImage})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//         minHeight: "100vh"
//       }}
//     >
//       <div className="container">
//         <div className="row justify-content-center align-items-center">

//           <div className="col-xxl-3 col-lg-4 d-none d-lg-block">
//             <div className="sign_in_img">
//               <img src={signImg} alt="Register" className="img-fluid w-100" />
//             </div>
//           </div>

//           <div className="col-xxl-7 col-md-10 col-lg-7 col-xl-6">
//             <div className="sign_in_form">
//               <h3>Registration</h3>

//               {/* STEP-1 */}
//               {step === 1 && (
//                 <form className="register_form" onSubmit={handleSendOtp}>

//                   {/* Full Name */}
//                   <div className="input_group">
//                     <FaUser className="input_icon" />
//                     <input
//                       name="fullName"
//                       placeholder="Full Name"
//                       value={form.fullName}
//                       onChange={handleFormChange}
//                     />
//                   </div>

//                   {/* Company */}
//                   <div className="input_group">
//                     <FaBuilding className="input_icon" />
//                     <input
//                       name="companyName"
//                       placeholder="Company Name"
//                       value={form.companyName}
//                       onChange={handleFormChange}
//                     />
//                   </div>

//                   <div className="form_row">

//                     <div className="input_group">
//                       <FaGlobe className="input_icon" />
//                       <select name="country" value={form.country} onChange={handleFormChange}>
//                         <option value="">- Select Country -</option>
//                         {masterData.country.map(c => <option key={c}>{c}</option>)}
//                       </select>
//                     </div>

//                     <div className="input_group">
//                       <FaCity className="input_icon" />
//                       <select name="city" value={form.city} onChange={handleFormChange}>
//                         <option value="">- Select City -</option>
//                         {masterData.city.map(c => <option key={c}>{c}</option>)}
//                       </select>
//                     </div>

//                     <div className="input_group">
//                       <FaUtensils className="input_icon" />
//                       <select name="businessType" value={form.businessType} onChange={handleFormChange}>
//                         <option>Restaurant</option>
//                         <option>Supplier</option>
//                       </select>
//                     </div>

//                   </div>

//                   {/* Email */}
//                   <div className="input_group">
//                     <FaEnvelope className="input_icon" />
//                     <input
//                       name="email"
//                       placeholder="Email"
//                       value={form.email}
//                       onChange={handleFormChange}
//                     />
//                   </div>

//                   <div className="form_row">

//                     <div className="input_group code">
//                       <FaPhone className="input_icon" />
//                       <select
//                         name="countryCode"
//                         value={form.countryCode}
//                         onChange={handleFormChange}
//                       >
//                         <option value="+974">Qatar +974</option>
//                         <option value="+91">India +91</option>
//                       </select>
//                     </div>

//                     <div className="input_group">
//                       <FaPhone className="input_icon" />
//                       <input
//                         name="phoneNumber"
//                         placeholder="Phone Number"
//                         value={form.phoneNumber}
//                         onChange={handleFormChange}
//                       />
//                     </div>

//                   </div>

//                   <button className="register_btn" disabled={isSendingOtp}>
//                     {isSendingOtp ? "Sending..." : "Next"}
//                   </button>

//                   <p className="mt_20 text-center mt-5">
//                     Already have an account?{" "}
//                     <Link to="/SupplierLogin" className="sign_link">
//                       <b>Sign In </b>
//                     </Link>
//                   </p>

//                 </form>
//               )}

//               {/* STEP-2 OTP */}
//               {step === 2 && (
//                 <div className="sign_in_form text-center">
//                   <h3>OTP Verification</h3>
//                   <b>{form.email}</b>

//                   <input type="hidden" autoComplete="one-time-code" />



//                   <div
//                     className="otp_inputs d-flex justify-content-between mb-3"
//                     onPaste={handlePaste}
//                   >
//                     {[...Array(6)].map((_, i) => (
//                       <input
//                         key={i}
//                         type="tel"
//                         inputMode="numeric"
//                         autoComplete="one-time-code"
//                         maxLength="1"
//                         className="otp_box"
//                         ref={el => (inputsRef.current[i] = el)}
//                         onInput={e => handleInput(e, i)}
//                         onKeyDown={e => handleKeyDown(e, i)}
//                       />
//                     ))}
//                   </div>

//                   {error && <p className="text-danger">{error}</p>}

//                   <button
//                     type="button"
//                     className="common_btn w-100"
//                     disabled={loading}
//                     onClick={handleVerify}
//                   >
//                     {loading ? "Verifying..." : "Verify OTP"} <span></span>
//                   </button>

//                   <p className="mt-3 resend">
//                     Didn’t receive?{" "}
//                     <span
//                       className="text-primary"
//                       style={{ cursor: resendTime ? "not-allowed" : "pointer" }}
//                       onClick={handleResend}
//                     >
//                       {resendTime ? `Resend in ${resendTime}s` : "Resend"}
//                     </span>
//                   </p>

//                   <button type="button" className="register_btn mt-2"
//                     onClick={() => setStep(1)}>
//                     Back
//                   </button>
//                 </div>
//               )}

//               {/* STEP-3 */}
//               {step === 3 && (
//                 <form className="register_form" onSubmit={handleSubmitFinal}>
//                   {attachmentFields.map(f => (
//                     <div key={f}>
//                       <label>{f.replace(/([A-Z])/g, " $1")}</label>

//                       <div
//                         className="ltn__dropzone"
//                         onClick={() => document.getElementById(f).click()}
//                         style={{ border: "2px dashed #ddd", padding: 14 }}
//                       >
//                         {preview[f]
//                           ? <img src={preview[f]} alt="file" style={{ maxHeight: 100 }} />
//                           : <p>Click to Upload (Optional)</p>}
//                       </div>

//                       <input
//                         type="file"
//                         id={f}
//                         name={f}
//                         style={{ display: "none" }}
//                         onChange={handleFileChange}
//                       />
//                     </div>
//                   ))}

//                   <div className="form_row">
//                     <button type="button" className="register_btn" onClick={() => setStep(2)}>
//                       Back
//                     </button>

//                     <button className="register_btn" disabled={isSubmitting}>
//                       {isSubmitting ? "Submitting..." : "Submit"}
//                     </button>
//                   </div>
//                 </form>
//               )}

//             </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// }



import React, { useState, useEffect, useRef } from "react";
import signImg from "../images/sign_in_img_1.jpg";
import { Link } from "react-router-dom";
const API_BASE_URL = "http://192.168.2.22:5000/api/suppliers";

export default function Register() {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputsRef = useRef([]);
  const timerRef = useRef(null);

  const [resendTime, setResendTime] = useState(0);

  const [masterData, setMasterData] = useState({
    country: [],
    city: [],
  });

  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    email: "",
    country: "",
    city: "",
    countryCode: "+974",
    phoneNumber: "",
    businessType: "Restaurant",
  });

  const [files, setFiles] = useState({});
  const [preview, setPreview] = useState({});


  /* ================= API CALLS ================= */
  const sendOtpApi = async () => {
    const res = await fetch(`${API_BASE_URL}/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    });
    return res.ok;
  };

  const verifyOtpApi = async (code) => {
    const res = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, otp: code }),
    });
    return res.ok;
  };

  /* ================= FORM ================= */
const handleFormChange = async (e) => {

  const { name, value } = e.target;

  if (name === "country") {

    const selectedCountry =
      masterData.country.find(
        (c) => c.value === value
      );

    try {

      const cityRes = await fetch(
        `http://192.168.2.22:5000/api/v1/records?category=city&country=${value}`
      );

      const cities =
        await cityRes.json();

      setMasterData((prev) => ({
        ...prev,
        city: cities || [],
      }));

    } catch (err) {

      console.error(err);

    }

    setForm((prev) => ({
      ...prev,
      country: value,
      city: "",
      countryCode:
        selectedCountry?.unit || "",
    }));

    return;
  }

  setForm((prev) => ({
    ...prev,
    [name]: value,
  }));
};
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFiles((p) => ({ ...p, [e.target.name]: f }));
      setPreview((p) => ({ ...p, [e.target.name]: URL.createObjectURL(f) }));
    }
  };

  /* ================= SEND OTP ================= */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!form.email) return alert("Enter email");

    setIsSendingOtp(true);
    try {
      const ok = await sendOtpApi();
      if (!ok) {
        alert("OTP send failed");
        setIsSendingOtp(false);
        return;
      }
      setStep(2);
      startResendTimer();
    } catch {
      alert("OTP error");
    }
    setIsSendingOtp(false);
  };

  const startResendTimer = () => {
    setResendTime(30);
    timerRef.current = setInterval(() => {
      setResendTime((v) => {
        if (v <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendTime > 0) return;
    try {
      const ok = await sendOtpApi();
      if (!ok) return alert("Resend failed");
      startResendTimer();
    } catch {
      alert("Resend error");
    }
  };
/* ================= LOAD COUNTRIES ================= */

useEffect(() => {

  async function loadCountries() {

    try {

      const res = await fetch(
        "http://192.168.2.22:5000/api/v1/records?category=country"
      );

      const data = await res.json();

      setMasterData({
        country: data || [],
        city: [],
      });

    } catch (err) {

      console.error(
        "Country fetch error",
        err
      );

    }

  }

  loadCountries();

}, []);
  /* ================= OTP INPUT ================= */
  const handleInput = (e, i) => {
    const value = e.target.value.replace(/\D/g, "");
    e.target.value = value;

    const code = inputsRef.current.map((b) => b.value).join("");
    setOtp(code);

    if (value && i < 5) inputsRef.current[i + 1].focus();
    if (code.length === 6) handleVerify(code);
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace" && !e.target.value && i > 0)
      inputsRef.current[i - 1].focus();
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    paste.split("").forEach((d, i) => {
      inputsRef.current[i].value = d || "";
    });
    setOtp(paste);
    if (paste.length === 6) handleVerify(paste);
  };

  /* ================= VERIFY OTP (LIVE ONLY) ================= */
  const handleVerify = async (code = otp) => {
    setError("");
    if (code.length !== 6) return setError("Enter 6-digit OTP");

    setLoading(true);
    try {
      const ok = await verifyOtpApi(code);
      if (!ok) {
        setError("Invalid OTP");
        setLoading(false);
        return;
      }
      localStorage.setItem("user_role", form.businessType);
      setStep(3);
    } catch {
      setError("OTP verification failed");
    }
    setLoading(false);
  };

  /* ================= FINAL SUBMIT ================= */
const handleSubmitFinal = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  const fd = new FormData();
  Object.entries(form).forEach(([k, v]) => fd.append(k, v));
  Object.entries(files).forEach(([k, v]) => v && fd.append(k, v));

  const endpoint =
    form.businessType === "Supplier"
      ? `${API_BASE_URL}/register-supplier`
      : `${API_BASE_URL}/register-restaurant`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      body: fd,
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Registration failed");
      setIsSubmitting(false);
      return;
    }

    localStorage.setItem("account_status", "pending");
    localStorage.setItem("user_role", form.businessType);

    alert("Registration completed successfully");
    window.location.href = "/";
  } catch (err) {
    alert("Server error — check backend logs");
  }

  setIsSubmitting(false);
};


  const attachmentFields =
    form.businessType === "Supplier"
      ? ["tradeLicense", "vatCertificate", "computerCardCopy", "crCopy","logo"]
      : ["tradeLicense", "vatCertificate", "foodSafetyCertificate","logo"];

  /* ================= UI ================= */
  return (
   <section className="sign_in pt_100 xs_pt_80">
      <div className="container">
        <div className="row justify-content-center align-items-center">

          <div className="col-xxl-3 col-lg-4 d-none d-lg-block">
            <div className="sign_in_img">
              <img src={signImg} alt="Register" className="img-fluid w-100" />
            </div>
          </div>

          <div className="col-xxl-7 col-md-10 col-lg-7 col-xl-6">
            <div className="sign_in_form">
              <h3>Registration</h3>

              {/* STEP-1 */}
              {step === 1 && (
                <form className="register_form" onSubmit={handleSendOtp}>
                  <input name="fullName" placeholder="Full Name"
                    value={form.fullName} onChange={handleFormChange} />

                  <input name="companyName" placeholder="Company Name"
                    value={form.companyName} onChange={handleFormChange} />

                  <div className="form_row">
                   <select
                        name="country"
                        value={form.country}
                        onChange={handleFormChange}
                      >
                        <option value="">
                          - Select Country -
                        </option>

                        {masterData.country.map((c) => (
                          <option
                            key={c.id}
                            value={c.value}
                          >
                            {c.value}
                          </option>
                        ))}
                      </select>

                    <select
                    name="city"
                    value={form.city}
                    onChange={handleFormChange}
                  >
                    <option value="">
                      - Select City -
                    </option>

                    {masterData.city.map((c) => (
                      <option
                        key={c.id}
                        value={c.value}
                      >
                        {c.value}
                      </option>
                    ))}
                  </select>

                    <select name="businessType" value={form.businessType} onChange={handleFormChange}>
                      <option>Restaurant</option>
                      <option>Supplier</option>
                    </select>
                  </div>

                  <input name="email" placeholder="Email"
                    value={form.email} onChange={handleFormChange} />

                  <div className="form_row">
                    <div className="form_row">

                    <input
                      className="code"
                      value={form.countryCode}
                      readOnly
                    />

                      <input
                        name="phoneNumber"
                        placeholder="Phone Number"
                        value={form.phoneNumber}
                        maxLength={8}
                        required
                        onChange={(e) => {

                          const value =
                            e.target.value.replace(/\D/g, "");

                          if (value.length <= 8) {

                            setForm((prev) => ({
                              ...prev,
                              phoneNumber: value,
                            }));

                          }

                        }}
                      />


                  </div>

                   
                  </div>

                  <button className="register_btn" disabled={isSendingOtp}>
                    {isSendingOtp ? "Sending..." : "Next"}
                  </button>
                  
                  <p className="mt_20 text-center mt-5">
                Already have an account?{" "}
                <Link to="/SupplierLogin" className="sign_link">
                  <b>Sign In </b>
                </Link>
              </p>

                </form>
                
              )}
              

              {/* STEP-2 OTP */}
              {step === 2 && (
                <div className="sign_in_form text-center">
                  <h3>OTP Verification</h3>
                  <b>{form.email}</b>
                  
                  <input type="hidden" autoComplete="one-time-code" />

                            

                  <div
                    className="otp_inputs d-flex justify-content-between mb-3"
                    onPaste={handlePaste}
                  >
                    {[...Array(6)].map((_, i) => (
                      <input
                        key={i}
                        type="tel"
                        inputMode="numeric"
                        autoComplete="one-time-code"   
                        maxLength="1"
                        className="otp_box"
                        ref={el => (inputsRef.current[i] = el)}
                        onInput={e => handleInput(e, i)}
                        onKeyDown={e => handleKeyDown(e, i)}
                      />
                    ))}
                  </div>

                  {error && <p className="text-danger">{error}</p>}

                  <button
                    type="button"
                    className="common_btn w-100"
                    disabled={loading}
                    onClick={handleVerify}
                  >
                    {loading ? "Verifying..." : "Verify OTP"} <span></span>
                  </button>

                  <p className="mt-3 resend">
                    Didn’t receive?{" "}
                    <span
                      className="text-primary"
                      style={{ cursor: resendTime ? "not-allowed" : "pointer" }}
                      onClick={handleResend}
                    >
                      {resendTime ? `Resend in ${resendTime}s` : "Resend"}
                    </span>
                  </p>

                  <button type="button" className="register_btn mt-2"
                    onClick={() => setStep(1)}>
                    Back
                  </button>
                </div>
              )}

              {/* STEP-3 */}
              {step === 3 && (
                <form className="register_form" onSubmit={handleSubmitFinal}>
                  {attachmentFields.map(f => (
                    <div key={f}>
                      <label>{f.replace(/([A-Z])/g, " $1")}</label>

                      <div
                        className="ltn__dropzone"
                        onClick={() => document.getElementById(f).click()}
                        style={{ border: "2px dashed #ddd", padding: 14 }}
                      >
                        {preview[f]
                          ? <img src={preview[f]} alt="file" style={{ maxHeight: 100 }} />
                          : <p>Click to Upload (Optional)</p>}
                      </div>

                      <input
                        type="file"
                        id={f}
                        name={f}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                      />
                    </div>
                  ))}

                  <div className="form_row">
                    <button type="button" className="register_btn" onClick={() => setStep(2)}>
                      Back
                    </button>

                    <button className="register_btn" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}