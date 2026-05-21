

// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import signImg from "../../images/sign_in_img_1.jpg";

// const API_BASE = "http://192.168.2.22:5000/api/admin/auth";
// const OTP_LENGTH = 6;

// const AdminLogin = () => {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [error, setError] = useState("");
//   const [showOtp, setShowOtp] = useState(false);
//   const [otpSuccess, setOtpSuccess] = useState(false);
//   const [timer, setTimer] = useState(0);
//   const [canResend, setCanResend] = useState(false);

//   const inputsRef = useRef([]);
//   const timerRef = useRef(null);

//   const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
// const [otpError, setOtpError] = useState("");
//   const [loading, setLoading] = useState(false);

//   /* AUTO LOGIN */
//   useEffect(() => {
//     const token = localStorage.getItem("admin_token");
//     if (token) navigate("/admin/dashboard");
//   }, [navigate]);

//   const startTimer = () => {
//     setTimer(60);
//     setCanResend(false);

//     timerRef.current = setInterval(() => {
//       setTimer((t) => {
//         if (t <= 1) {
//           clearInterval(timerRef.current);
//           setCanResend(true);
//           return 0;
//         }
//         return t - 1;
//       });
//     }, 1000);
//   };
// useEffect(() => {
//   if (showOtp) {
//     setTimeout(() => {
//       inputsRef.current[0]?.focus();
//     }, 100);
//   }
// }, [showOtp]);

//   /* SEND OTP */
//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (!email.trim()) return setError("Email is required");

//     setLoading(true);

//     try {
//       const res = await fetch(`${API_BASE}/send-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.error || "Failed to send OTP");
//         setLoading(false);
//         return;
//       }

//       setShowOtp(true);
//       startTimer();

//     } catch {
//       setError("Network error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* OTP INPUT */
//   const getOtpValue = () =>
//     inputsRef.current.map((i) => i?.value || "").join("");

// const handleInput = (e, i) => {
//   const v = e.target.value.replace(/\D/g, "");

//   if (!v) return;

//   const newOtp = [...otp];
//   newOtp[i] = v;
//   setOtp(newOtp);

//   if (i < OTP_LENGTH - 1) {
//     inputsRef.current[i + 1]?.focus();
//   }

//   const code = newOtp.join("");
//   if (code.length === OTP_LENGTH) {
//     handleVerify(code);
//   }
// };

//   const handleKeyDown = (e, i) => {
//     if (e.key === "Backspace" && !e.target.value && i > 0) {
//       inputsRef.current[i - 1].focus();
//     }
//   };
//   const handlePaste = (e) => {
//   e.preventDefault();

//   const pasteData = e.clipboardData
//     .getData("text")
//     .replace(/\D/g, "")
//     .slice(0, OTP_LENGTH);

//   if (!pasteData) return;

//   const newOtp = pasteData.split("");
//   const filledOtp = [...Array(OTP_LENGTH)].map((_, i) => newOtp[i] || "");

//   setOtp(filledOtp);

//   filledOtp.forEach((val, i) => {
//     if (inputsRef.current[i]) {
//       inputsRef.current[i].value = val;
//     }
//   });

//   // focus last filled
//   const lastIndex = filledOtp.findLastIndex((v) => v !== "");
//   if (lastIndex >= 0 && lastIndex < OTP_LENGTH - 1) {
//     inputsRef.current[lastIndex + 1]?.focus();
//   }

//   if (pasteData.length === OTP_LENGTH) {
//     handleVerify(pasteData);
//   }
// };

//   /* VERIFY OTP */
//   const handleVerify = async (otpCode = otp) => {
//     if (otpCode.length !== 6) return;

//     setLoading(true);

//     try {
//       const res = await fetch(`${API_BASE}/verify-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, otp: otpCode }),
//       });

//       const data = await res.json();
//       if (!res.ok) return setError(data.error || "Invalid OTP");

//       localStorage.setItem("admin_token", data.admin_token);
//       localStorage.setItem("admin_id", data.admin_id);
//       localStorage.setItem("admin_role", data.admin_role);
//       localStorage.setItem(
//         "admin_permissions",
//         JSON.stringify(data.admin_permissions)
//       );

//       setOtpSuccess(true);
//       setTimeout(() => navigate("/admin/dashboard"), 1200);

//     } catch {
//       setError("Network error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResend = async () => {
//     if (timer > 0) return;
//     await handleSendOtp(new Event("submit"));
//   };

// return (
//   <section className="restaurant_login_wrapper restaurant_bg">

//     {/* BG BLOBS */}
//     <div className="floating_blob blob1"></div>
//     <div className="floating_blob blob2"></div>

//     <div className="login_container">

//       {/* LEFT SIDE */}
//       <div className="login_left">
//         <div className="left_content">

//           <img
//             src={signImg}
//             alt="Admin Login"
//             className="login_logo"
//           />

//           <h1>Admin Login</h1>

//           <p>
//             Access the admin dashboard to manage platform operations,
//             monitor users, control suppliers and restaurants,
//             and oversee system activities securely.
//           </p>

//         </div>
//       </div>

//       {/* RIGHT SIDE */}
//       <div className="login_right">
//         <div className="glass_card">

//           {/* BACK BUTTON */}
//           <button
//             type="button"
//             className="modern_back_btn"
//             onClick={() => {
//               if (showOtp) {
//                 setShowOtp(false);
//                 setOtp(Array(OTP_LENGTH).fill(""));
//                 inputsRef.current.forEach((i) => i && (i.value = ""));
//                 setOtpError("");
//                 setOtpSuccess(false);
//               } else {
//                 navigate(-1);
//               }
//             }}
//           >
//             <i className="fa-solid fa-arrow-left"></i>
//             {showOtp ? " Change Email" : " Back"}
//           </button>

//           <h3 className="text-center mb-3">Admin Login</h3>

//           {/* EMAIL FORM */}
//           <form onSubmit={handleSendOtp}>
//             <div className="mb-3">
//               <input
//                 type="email"
//                 placeholder="Admin Email Address"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 disabled={showOtp}
//                 className="glass_input"
//               />
//             </div>

//             {error && (
//               <p className="text-danger text-center mt-2">{error}</p>
//             )}

//             {!showOtp && (
//               <button
//                 type="submit"
//                 className="glass_btn"
//                 disabled={loading}
//               >
//                 {loading ? "Sending..." : "Send OTP →"}
//               </button>
//             )}
//           </form>

//           {!showOtp && (
//             <p className="mt-3 small_text text-center">
//               Admin access is restricted.{" "}
//               <span className="text-muted">
//                 Contact system administrator
//               </span>
//             </p>
//           )}

//           {/* OTP SECTION */}
//           {showOtp && (
//             <div className="mt-4 text-center">

//               {loading && (
//                 <div className="otp_loading">
//                   <div className="spinner"></div>
//                 </div>
//               )}

//               <h6>Admin OTP Verification</h6>

//               <p className="small_text">
//                 Enter the 6-digit OTP sent to <b>{email}</b>
//               </p>

//               {!otpSuccess && (
//                 <div
//                   className="otp_inputs"
//                   onPaste={handlePaste}
//                 >
//                   {[...Array(6)].map((_, index) => (
//                     <input
//                       key={index}
//                       type="tel"
//                       inputMode="numeric"
//                       maxLength="1"
//                       value={otp[index]}
//                       ref={(el) => (inputsRef.current[index] = el)}
//                       onChange={(e) => handleInput(e, index)}
//                       onKeyDown={(e) => handleKeyDown(e, index)}
//                       className="otp_box"
//                     />
//                   ))}
//                 </div>
//               )}

//               {otpError && (
//                 <p className="otp_error mt-2">
//                   <i className="fa-solid fa-circle-exclamation"></i>{" "}
//                   {otpError}
//                 </p>
//               )}

//               {otpSuccess && (
//                 <div className="otp_success">
//                   <div className="checkmark"></div>
//                   <h6>OTP Verified Successfully</h6>
//                 </div>
//               )}

//               {!otpSuccess && (
//                 <p className="mt-3">
//                   {canResend ? (
//                     <span
//                       onClick={handleResend}
//                       className="resend_link"
//                     >
//                       Resend OTP
//                     </span>
//                   ) : (
//                     <>
//                       Resend in 00:
//                       {timer.toString().padStart(2, "0")}
//                     </>
//                   )}
//                 </p>
//               )}
//             </div>
//           )}

//         </div>
//       </div>

//     </div>
//   </section>
// );
// };

// export default AdminLogin;










// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import signImg from "../../images/sign_in_img_1.jpg";

// const API_BASE = "http://192.168.2.22:5000/api/admin/auth";
// const OTP_LENGTH = 6;

// const AdminLogin = () => {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [error, setError] = useState("");
//   const [showOtp, setShowOtp] = useState(false);
//   const [otpSuccess, setOtpSuccess] = useState(false);
//   const [timer, setTimer] = useState(0);
//   const [canResend, setCanResend] = useState(false);

//   const inputsRef = useRef([]);
//   const timerRef = useRef(null);

//   const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
// const [otpError, setOtpError] = useState("");
//   const [loading, setLoading] = useState(false);

//   /* AUTO LOGIN */
//   useEffect(() => {
//     const token = localStorage.getItem("admin_token");
//     if (token) navigate("/admin/dashboard");
//   }, [navigate]);

//   const startTimer = () => {
//     setTimer(60);
//     setCanResend(false);

//     timerRef.current = setInterval(() => {
//       setTimer((t) => {
//         if (t <= 1) {
//           clearInterval(timerRef.current);
//           setCanResend(true);
//           return 0;
//         }
//         return t - 1;
//       });
//     }, 1000);
//   };
// useEffect(() => {
//   if (showOtp) {
//     setTimeout(() => {
//       inputsRef.current[0]?.focus();
//     }, 100);
//   }
// }, [showOtp]);

//   /* SEND OTP */
//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (!email.trim()) return setError("Email is required");

//     setLoading(true);

//     try {
//       const res = await fetch(`${API_BASE}/send-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.error || "Failed to send OTP");
//         setLoading(false);
//         return;
//       }

//       setShowOtp(true);
//       startTimer();

//     } catch {
//       setError("Network error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* OTP INPUT */
//   const getOtpValue = () =>
//     inputsRef.current.map((i) => i?.value || "").join("");

// const handleInput = (e, i) => {
//   const v = e.target.value.replace(/\D/g, "");

//   const newOtp = [...otp];
//   newOtp[i] = v;

//   setOtp(newOtp);

//   if (v && i < OTP_LENGTH - 1) {
//     inputsRef.current[i + 1]?.focus();
//   }

//   const code = newOtp.join("");

//   if (code.length === OTP_LENGTH) {
//     handleVerify(code);
//   }
// };
// const handleKeyDown = (e, i) => {
//   if (e.key === "Backspace") {
//     const newOtp = [...otp];

//     // current input clear
//     if (newOtp[i]) {
//       newOtp[i] = "";
//       setOtp(newOtp);
//     } 
//     // previous input ki move
//     else if (i > 0) {
//       inputsRef.current[i - 1]?.focus();

//       // cursor show cheyyadaniki
//       setTimeout(() => {
//         inputsRef.current[i - 1]?.setSelectionRange(1, 1);
//       }, 0);
//     }
//   }
// };
//   const handlePaste = (e) => {
//   e.preventDefault();

//   const pasteData = e.clipboardData
//     .getData("text")
//     .replace(/\D/g, "")
//     .slice(0, OTP_LENGTH);

//   if (!pasteData) return;

//   const newOtp = pasteData.split("");
//   const filledOtp = [...Array(OTP_LENGTH)].map((_, i) => newOtp[i] || "");

//   setOtp(filledOtp);

//   filledOtp.forEach((val, i) => {
//     if (inputsRef.current[i]) {
//       inputsRef.current[i].value = val;
//     }
//   });

//   // focus last filled
//   const lastIndex = filledOtp.findLastIndex((v) => v !== "");
//   if (lastIndex >= 0 && lastIndex < OTP_LENGTH - 1) {
//     inputsRef.current[lastIndex + 1]?.focus();
//   }

//   if (pasteData.length === OTP_LENGTH) {
//     handleVerify(pasteData);
//   }
// };

//   /* VERIFY OTP */
//   const handleVerify = async (otpCode = otp) => {
//     if (otpCode.length !== 6) return;

//     setLoading(true);

//     try {
//       const res = await fetch(`${API_BASE}/verify-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, otp: otpCode }),
//       });

//       const data = await res.json();
//       if (!res.ok) return setError(data.error || "Invalid OTP");

//       localStorage.setItem("admin_token", data.admin_token);
//       localStorage.setItem("admin_id", data.admin_id);
//       localStorage.setItem("admin_role", data.admin_role);
//       localStorage.setItem(
//         "admin_permissions",
//         JSON.stringify(data.admin_permissions)
//       );

//       setOtpSuccess(true);
//       setTimeout(() => navigate("/admin/dashboard"), 1200);

//     } catch {
//       setError("Network error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResend = async () => {
//     if (timer > 0) return;
//     await handleSendOtp(new Event("submit"));
//   };

// return (
//   <section className="restaurant_login_wrapper restaurant_bg">

//     {/* BG BLOBS */}
//     <div className="floating_blob blob1"></div>
//     <div className="floating_blob blob2"></div>

//     <div className="login_container">

//       {/* LEFT SIDE */}
//       <div className="login_left">
//         <div className="left_content">

//           <img
//             src={signImg}
//             alt="Admin Login"
//             className="login_logo"
//           />

//           <h1>Admin Login</h1>

//           <p>
//             Access the admin dashboard to manage platform operations,
//             monitor users, control suppliers and restaurants,
//             and oversee system activities securely.
//           </p>

//         </div>
//       </div>

//       {/* RIGHT SIDE */}
//       <div className="login_right">
//         <div className="glass_card">

//           {/* BACK BUTTON */}
//           <button
//             type="button"
//             className="modern_back_btn"
//             onClick={() => {
//               if (showOtp) {
//                 setShowOtp(false);
//                 setOtp(Array(OTP_LENGTH).fill(""));
//                 inputsRef.current.forEach((i) => i && (i.value = ""));
//                 setOtpError("");
//                 setOtpSuccess(false);
//               } else {
//                 navigate(-1);
//               }
//             }}
//           >
//             <i className="fa-solid fa-arrow-left"></i>
//             {showOtp ? " Change Email" : " Back"}
//           </button>

//           <h3 className="text-center mb-3">Admin Login</h3>

//           {/* EMAIL FORM */}
//           <form onSubmit={handleSendOtp}>
//             <div className="mb-3">
//               <input
//                 type="email"
//                 placeholder="Admin Email Address"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 disabled={showOtp}
//                 className="glass_input"
//               />
//             </div>

//             {error && (
//               <p className="text-danger text-center mt-2">{error}</p>
//             )}

//             {!showOtp && (
//               <button
//                 type="submit"
//                 className="glass_btn"
//                 disabled={loading}
//               >
//                 {loading ? "Sending..." : "Send OTP →"}
//               </button>
//             )}
//           </form>

//           {!showOtp && (
//             <p className="mt-3 small_text text-center">
//               Admin access is restricted.{" "}
//               <span className="text-muted">
//                 Contact system administrator
//               </span>
//             </p>
//           )}

//           {/* OTP SECTION */}
//           {showOtp && (
//             <div className="mt-4 text-center">

//               {loading && (
//                 <div className="otp_loading">
//                   <div className="spinner"></div>
//                 </div>
//               )}

//               <h6>Admin OTP Verification</h6>

//               <p className="small_text">
//                 Enter the 6-digit OTP sent to <b>{email}</b>
//               </p>

//               {!otpSuccess && (
//                 <div
//                   className="otp_inputs"
//                   onPaste={handlePaste}
//                 >
//                   {[...Array(6)].map((_, index) => (
//                     <input
//                       key={index}
//                       type="tel"
//                       inputMode="numeric"
//                       maxLength="1"
//                       value={otp[index]}
//                       ref={(el) => (inputsRef.current[index] = el)}
//                       onChange={(e) => handleInput(e, index)}
//                       onKeyDown={(e) => handleKeyDown(e, index)}
//                       className="otp_box"
//                     />
//                   ))}
//                 </div>
//               )}

//               {otpError && (
//                 <p className="otp_error mt-2">
//                   <i className="fa-solid fa-circle-exclamation"></i>{" "}
//                   {otpError}
//                 </p>
//               )}

//               {otpSuccess && (
//                 <div className="otp_success">
//                   <div className="checkmark"></div>
//                   <h6>OTP Verified Successfully</h6>
//                 </div>
//               )}

//               {!otpSuccess && (
//                 <p className="mt-3">
//                   {canResend ? (
//                     <span
//                       onClick={handleResend}
//                       className="resend_link"
//                     >
//                       Resend OTP
//                     </span>
//                   ) : (
//                     <>
//                       Resend in 00:
//                       {timer.toString().padStart(2, "0")}
//                     </>
//                   )}
//                 </p>
//               )}
//             </div>
//           )}

//         </div>
//       </div>

//     </div>
//   </section>
// );
// };

// export default AdminLogin;



import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import signImg from "../../images/Logo.png";

const API_BASE = "http://192.168.2.22:5000/api/admin/auth";
const OTP_LENGTH = 6;

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const inputsRef = useRef([]);
  const timerRef = useRef(null);

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);

  /* AUTO LOGIN */
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) navigate("/admin/dashboard");
  }, [navigate]);

  const startTimer = () => {
    setTimer(60);
    setCanResend(false);

    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };
useEffect(() => {
  if (showOtp) {
    setTimeout(() => {
      inputsRef.current[0]?.focus();
    }, 100);
  }
}, [showOtp]);

  /* SEND OTP */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) return setError("Email is required");

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        setLoading(false);
        return;
      }

      setShowOtp(true);
      startTimer();

    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  /* OTP INPUT */
  const getOtpValue = () =>
    inputsRef.current.map((i) => i?.value || "").join("");

const handleInput = (e, i) => {
  const v = e.target.value.replace(/\D/g, "");

  const newOtp = [...otp];
  newOtp[i] = v;

  setOtp(newOtp);

  if (v && i < OTP_LENGTH - 1) {
    inputsRef.current[i + 1]?.focus();
  }

  const code = newOtp.join("");

  if (code.length === OTP_LENGTH) {
    handleVerify(code);
  }
};
const handleKeyDown = (e, i) => {
  if (e.key === "Backspace") {
    const newOtp = [...otp];

    // current input clear
    if (newOtp[i]) {
      newOtp[i] = "";
      setOtp(newOtp);
    } 
    // previous input ki move
    else if (i > 0) {
      inputsRef.current[i - 1]?.focus();

      // cursor show cheyyadaniki
      setTimeout(() => {
        inputsRef.current[i - 1]?.setSelectionRange(1, 1);
      }, 0);
    }
  }
};
  const handlePaste = (e) => {
  e.preventDefault();

  const pasteData = e.clipboardData
    .getData("text")
    .replace(/\D/g, "")
    .slice(0, OTP_LENGTH);

  if (!pasteData) return;

  const newOtp = pasteData.split("");
  const filledOtp = [...Array(OTP_LENGTH)].map((_, i) => newOtp[i] || "");

  setOtp(filledOtp);

  filledOtp.forEach((val, i) => {
    if (inputsRef.current[i]) {
      inputsRef.current[i].value = val;
    }
  });

  // focus last filled
  const lastIndex = filledOtp.findLastIndex((v) => v !== "");
  if (lastIndex >= 0 && lastIndex < OTP_LENGTH - 1) {
    inputsRef.current[lastIndex + 1]?.focus();
  }

  if (pasteData.length === OTP_LENGTH) {
    handleVerify(pasteData);
  }
};

  /* VERIFY OTP */
  const handleVerify = async (otpCode = otp) => {
    if (otpCode.length !== 6) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.error || "Invalid OTP");

      localStorage.setItem("admin_token", data.admin_token);
      localStorage.setItem("admin_id", data.admin_id);
      localStorage.setItem("admin_role", data.admin_role);
      localStorage.setItem(
        "admin_permissions",
        JSON.stringify(data.admin_permissions)
      );

      setOtpSuccess(true);
      setTimeout(() => navigate("/admin/dashboard"), 1200);

    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    await handleSendOtp(new Event("submit"));
  };

return (
  <section className="restaurant_login_wrapper restaurant_abg">

    {/* BG BLOBS */}
    <div className="floating_blob blob1"></div>
    <div className="floating_blob blob2"></div>

    <div className="login_container">

      {/* LEFT SIDE */}
      <div className="login_left">
        <div className="left_content">

          <img
            src={signImg}
            alt="Admin Login"
            className="login_logo"
          />

          <h1>Admin Login</h1>

          <p>
            Access the admin dashboard to manage platform operations,
            monitor users, control suppliers and restaurants,
            and oversee system activities securely.
          </p>

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="login_right">
        <div className="glass_card">

          {/* BACK BUTTON */}
          <button
            type="button"
            className="modern_back_btn"
            onClick={() => {
              if (showOtp) {
                setShowOtp(false);
                setOtp(Array(OTP_LENGTH).fill(""));
                inputsRef.current.forEach((i) => i && (i.value = ""));
                setOtpError("");
                setOtpSuccess(false);
              } else {
                navigate(-1);
              }
            }}
          >
            <i className="fa-solid fa-arrow-left"></i>
            {showOtp ? " Change Email" : " Back"}
          </button>

          <h3 className="text-center mb-3">Admin Login</h3>

          {/* EMAIL FORM */}
          <form onSubmit={handleSendOtp}>
            <div className="mb-3">
              <input
                type="email"
                placeholder="Admin Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={showOtp}
                className="glass_input"
              />
            </div>

            {error && (
              <p className="text-danger text-center mt-2">{error}</p>
            )}

            {!showOtp && (
              <button
                type="submit"
                className="glass_btn"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP →"}
              </button>
            )}
          </form>

          {!showOtp && (
            <p className="mt-3 small_text text-center">
              Admin access is restricted.{" "}
              <span className="text-muted">
                Contact system administrator
              </span>
            </p>
          )}

          {/* OTP SECTION */}
          {showOtp && (
            <div className="mt-4 text-center">

              {loading && (
                <div className="otp_loading">
                  <div className="spinner"></div>
                </div>
              )}

              <h6>Admin OTP Verification</h6>

              <p className="small_text">
                Enter the 6-digit OTP sent to <b>{email}</b>
              </p>

              {!otpSuccess && (
                <div
                  className="otp_inputs"
                  onPaste={handlePaste}
                >
                  {[...Array(6)].map((_, index) => (
                    <input
                      key={index}
                      type="tel"
                      inputMode="numeric"
                      maxLength="1"
                      value={otp[index]}
                      ref={(el) => (inputsRef.current[index] = el)}
                      onChange={(e) => handleInput(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="otp_box"
                    />
                  ))}
                </div>
              )}

              {otpError && (
                <p className="otp_error mt-2">
                  <i className="fa-solid fa-circle-exclamation"></i>{" "}
                  {otpError}
                </p>
              )}

              {otpSuccess && (
                <div className="otp_success">
                  <div className="checkmark"></div>
                  <h6>OTP Verified Successfully</h6>
                </div>
              )}

              {!otpSuccess && (
                <p className="mt-3">
                  {canResend ? (
                    <span
                      onClick={handleResend}
                      className="resend_link"
                    >
                      Resend OTP
                    </span>
                  ) : (
                    <>
                      Resend in 00:
                      {timer.toString().padStart(2, "0")}
                    </>
                  )}
                </p>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  </section>
);
};

export default AdminLogin;