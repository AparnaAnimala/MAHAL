


// import React, { useEffect, useRef, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import signImg from "../images/sign_in_img_1.jpg";
// const USE_BACKEND = true;
// const STATIC_OTP = "123456";
// const API_BASE_URL = "http://192.168.2.9:5000/api/auth";
// const OTP_LENGTH = 6;

// const SignIn = () => {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [error, setError] = useState("");
//   const [showOtp, setShowOtp] = useState(false);
//   const [otpError, setOtpError] = useState("");
//   const [otpSuccess, setOtpSuccess] = useState(false);
//   const [timer, setTimer] = useState(0);
//   const [canResend, setCanResend] = useState(false);

//   const inputsRef = useRef([]);
//   const timerRef = useRef(null);

//   const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
//   const [shake, setShake] = useState(false);
//   const [msg, setMsg] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const role = localStorage.getItem("role");
//     if (token && role === "restaurant") navigate("/RestaurantDashboard");
//   }, [navigate]);
// useEffect(() => {
//   if (showOtp) {
//     setTimeout(() => {
//       inputsRef.current[0]?.focus();
//     }, 100);
//   }
// }, [showOtp]);
//   const isValidEmail = (v) => v.includes("@");

//   const startTimer = () => {
//     setTimer(30);
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

//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     setError("");
//     setMsg("");

//     if (!email.trim()) return setError("Email is required");
//     if (!isValidEmail(email)) return setError("Enter valid email");

//     setLoading(true);

//     try {
//       const res = await fetch(`${API_BASE_URL}/send-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//   email,
//   role: "restaurant"
// })
// ,
//       });

// const data = await res.json();

// if (!res.ok) {
//   setLoading(false);

//   if (data.error && data.error.includes("email not found")) {
//     setError(
//       "Invalid Email"
//     );
//   } else {
//     setError(data.error || "Failed to send OTP");
//   }

//   return;
// }
//       setShowOtp(true);
//       setOtpError("");
//       setOtpSuccess(false);
//       setMsg("OTP sent successfully");
//       startTimer();

//     } catch {
//       setError("Network error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getOtpValue = () =>
//     inputsRef.current.map((i) => i?.value || "").join("");

// const handleInput = (e, index) => {
//   const value = e.target.value.replace(/\D/g, "");
//   if (!value) return;

//   const newOtp = [...otp];
//   newOtp[index] = value[0];
//   setOtp(newOtp);

//   if (index < OTP_LENGTH - 1) {
//     inputsRef.current[index + 1]?.focus();
//   }

//   const code = newOtp.join("");
//   if (!newOtp.includes("")) {
//     handleVerify(code);
//   }
// };


//   const handleKeyDown = (e, i) => {
//     if (e.key === "Backspace" && !e.target.value && i > 0) {
//       inputsRef.current[i - 1].focus();
//     }
//   };

// const handlePaste = (e) => {
//   e.preventDefault();

//   const paste = e.clipboardData
//     .getData("text")
//     .replace(/\D/g, "")
//     .slice(0, OTP_LENGTH);

//   if (!paste) return;

//   const newOtp = Array(OTP_LENGTH).fill("");

//   paste.split("").forEach((digit, i) => {
//     newOtp[i] = digit;
//   });

//   setOtp(newOtp);

//   if (!newOtp.includes("")) {
//     handleVerify(newOtp.join(""));
//   }
// };

//   const shakeError = (msg) => {
//     setError(msg);
//     setShake(true);
//     setTimeout(() => setShake(false), 400);
//   };

//   const handleVerify = async (otpCode = otp) => {
//     setError("");

//     if (otpCode.length !== 6) return shakeError("Enter 6-digit OTP");

//     setLoading(true);

//     try {
//       const res = await fetch(`${API_BASE_URL}/verify-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, otp: otpCode }),
//       });

//       const data = await res.json();
//       if (!res.ok) return shakeError("Invalid OTP");

//       localStorage.setItem("token", data.token);
//       localStorage.setItem("role", data.role);
//       localStorage.setItem("linked_id", data.linked_id);
//       localStorage.setItem("username", email);

//       setOtpSuccess(true);
//       setTimeout(() => navigate("/RestaurantDashboard"), 1200);

//     } catch {
//       shakeError("Network error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResend = async () => {
//     if (timer > 0) return;
//     await handleSendOtp(new Event("submit"));
//   };

//   return (
//   <section className="restaurant_login_wrapper restaurant_bg">

//     <div className="floating_blob blob1"></div>
//     <div className="floating_blob blob2"></div>

//     <div className="login_container">

//       {/* LEFT SIDE */}
//       <div className="login_left">
//         <div className="left_content">

//           <img
//             src={signImg}
//             alt="restaurant Login"
//             className="login_logo"
//           />

//           <h1>Restaurant Partner Login</h1>

//           <p>
//             Access your restaurant dashboard to manage orders, monitor supplies,
//             and ensure seamless kitchen operations with real-time updates.
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


//           <h3 className="text-center mb-3">Login</h3>


//           {/* EMAIL SECTION */}
//           <form onSubmit={handleSendOtp}>

//             <div className="mb-3">
//               <input
//                 type="email"
//                 placeholder="Email Address"
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
//               Don’t have an account ?{" "}
//               <Link to="/Registration">Sign Up</Link>
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

//               <h6>OTP Verification</h6>

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
//                       autoComplete={
//                         index === 0 ? "one-time-code" : "off"
//                       }
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


//               {/* SUCCESS */}
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

// export default SignIn;





// import React, { useEffect, useRef, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import signImg from "../images/Logo.png";
// const USE_BACKEND = true;
// const STATIC_OTP = "123456";
// const API_BASE_URL = "http://192.168.2.9:5000/api/auth";
// const OTP_LENGTH = 6;

// const SignIn = () => {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [error, setError] = useState("");
//   const [showOtp, setShowOtp] = useState(false);
//   const [otpError, setOtpError] = useState("");
//   const [otpSuccess, setOtpSuccess] = useState(false);
//   const [timer, setTimer] = useState(0);
//   const [canResend, setCanResend] = useState(false);

//   const inputsRef = useRef([]);
//   const timerRef = useRef(null);

//   const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
//   const [shake, setShake] = useState(false);
//   const [msg, setMsg] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const role = localStorage.getItem("role");
//     if (token && role === "restaurant") navigate("/RestaurantDashboard");
//   }, [navigate]);
//   useEffect(() => {
//     if (showOtp) {
//       setTimeout(() => {
//         inputsRef.current[0]?.focus();
//       }, 100);
//     }
//   }, [showOtp]);
//   const isValidEmail = (v) => v.includes("@");

//   const startTimer = () => {
//     setTimer(30);
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

//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     setError("");
//     setMsg("");

//     if (!email.trim()) return setError("Email is required");
//     if (!isValidEmail(email)) return setError("Enter valid email");

//     setLoading(true);

//     try {
//       const res = await fetch(`${API_BASE_URL}/send-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           email,
//           role: "restaurant"
//         })
//         ,
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setLoading(false);

//         if (data.error && data.error.includes("email not found")) {
//           setError(
//             "Invalid Email"
//           );
//         } else {
//           setError(data.error || "Failed to send OTP");
//         }

//         return;
//       }
//       setShowOtp(true);
//       setOtpError("");
//       setOtpSuccess(false);
//       setMsg("OTP sent successfully");
//       startTimer();

//     } catch {
//       setError("Network error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getOtpValue = () =>
//     inputsRef.current.map((i) => i?.value || "").join("");

//   const handleInput = (e, index) => {
//     const value = e.target.value.replace(/\D/g, "");
//     if (!value) return;

//     const newOtp = [...otp];
//     newOtp[index] = value[0];
//     setOtp(newOtp);

//     if (index < OTP_LENGTH - 1) {
//       inputsRef.current[index + 1]?.focus();
//     }

//     const code = newOtp.join("");
//     if (!newOtp.includes("")) {
//       handleVerify(code);
//     }
//   };


//   const handleKeyDown = (e, i) => {
//     if (e.key === "Backspace" && !e.target.value && i > 0) {
//       inputsRef.current[i - 1].focus();
//     }
//   };

//   const handlePaste = (e) => {
//     e.preventDefault();

//     const paste = e.clipboardData
//       .getData("text")
//       .replace(/\D/g, "")
//       .slice(0, OTP_LENGTH);

//     if (!paste) return;

//     const newOtp = Array(OTP_LENGTH).fill("");

//     paste.split("").forEach((digit, i) => {
//       newOtp[i] = digit;
//     });

//     setOtp(newOtp);

//     if (!newOtp.includes("")) {
//       handleVerify(newOtp.join(""));
//     }
//   };

//   const shakeError = (msg) => {
//     setError(msg);
//     setShake(true);
//     setTimeout(() => setShake(false), 400);
//   };

//   const handleVerify = async (otpCode = otp) => {
//     setError("");

//     if (otpCode.length !== 6) return shakeError("Enter 6-digit OTP");

//     setLoading(true);

//     try {
//       const res = await fetch(`${API_BASE_URL}/verify-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           email,
//           otp: otpCode,
//           role: "restaurant"
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) return shakeError("Invalid OTP");

//       localStorage.setItem("token", data.token);
//       localStorage.setItem("role", data.role);
//       localStorage.setItem("linked_id", data.linked_id);
//       localStorage.setItem("username", email);
//       localStorage.setItem("userId", data.user_id);

//       setOtpSuccess(true);
//       setTimeout(() => navigate("/RestaurantDashboard"), 1200);

//     } catch {
//       shakeError("Network error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResend = async () => {
//     if (timer > 0) return;
//     await handleSendOtp(new Event("submit"));
//   };

//   return (
//     <section className="restaurant_login_wrapper restaurant_bg">

//       <div className="floating_blob blob1"></div>
//       <div className="floating_blob blob2"></div>

//       <div className="login_container">

//         {/* LEFT SIDE */}
//         <div className="login_left">
//           <div className="left_content">

//             <img
//               src={signImg}
//               alt="restaurant Login"
//               className="login_logo"
//             />

//             <h1>Restaurant Partner Login</h1>

//             <p>
//               Access your restaurant dashboard to manage orders, monitor supplies,
//               and ensure seamless kitchen operations with real-time updates.
//             </p>

//           </div>
//         </div>


//         {/* RIGHT SIDE */}
//         <div className="login_right">

//           <div className="glass_card">

//             {/* BACK BUTTON */}
//             <button
//               type="button"
//               className="modern_back_btn"
//               onClick={() => {
//                 if (showOtp) {
//                   setShowOtp(false);
//                   setOtp(Array(OTP_LENGTH).fill(""));
//                   inputsRef.current.forEach((i) => i && (i.value = ""));
//                   setOtpError("");
//                   setOtpSuccess(false);
//                 } else {
//                   navigate(-1);
//                 }
//               }}
//             >
//               <i className="fa-solid fa-arrow-left"></i>
//               {showOtp ? " Change Email" : " Back"}
//             </button>


//             <h3 className="text-center mb-3">Login</h3>


//             {/* EMAIL SECTION */}
//             <form onSubmit={handleSendOtp}>

//               <div className="mb-3">
//                 <input
//                   type="email"
//                   placeholder="Email Address"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   disabled={showOtp}
//                   className="glass_input"
//                 />
//               </div>

//               {error && (
//                 <p className="text-danger text-center mt-2">{error}</p>
//               )}

//               {!showOtp && (
//                 <button
//                   type="submit"
//                   className="glass_btn"
//                   disabled={loading}
//                 >
//                   {loading ? "Sending..." : "Send OTP →"}
//                 </button>
//               )}

//             </form>


//             {!showOtp && (
//               <p className="mt-3 small_text text-center">
//                 Don’t have an account ?{" "}
//                 <Link to="/Registration">Sign Up</Link>
//               </p>
//             )}


//             {/* OTP SECTION */}
//             {showOtp && (

//               <div className="mt-4 text-center">

//                 {loading && (
//                   <div className="otp_loading">
//                     <div className="spinner"></div>
//                   </div>
//                 )}

//                 <h6>OTP Verification</h6>

//                 <p className="small_text">
//                   Enter the 6-digit OTP sent to <b>{email}</b>
//                 </p>


//                 {!otpSuccess && (
//                   <div
//                     className="otp_inputs"
//                     onPaste={handlePaste}
//                   >

//                     {[...Array(6)].map((_, index) => (
//                       <input
//                         key={index}
//                         type="tel"
//                         inputMode="numeric"
//                         autoComplete={
//                           index === 0 ? "one-time-code" : "off"
//                         }
//                         maxLength="1"
//                         value={otp[index]}
//                         ref={(el) => (inputsRef.current[index] = el)}
//                         onChange={(e) => handleInput(e, index)}
//                         onKeyDown={(e) => handleKeyDown(e, index)}
//                         className="otp_box"
//                       />
//                     ))}

//                   </div>
//                 )}


//                 {otpError && (
//                   <p className="otp_error mt-2">
//                     <i className="fa-solid fa-circle-exclamation"></i>{" "}
//                     {otpError}
//                   </p>
//                 )}


//                 {/* SUCCESS */}
//                 {otpSuccess && (
//                   <div className="otp_success">
//                     <div className="checkmark"></div>
//                     <h6>OTP Verified Successfully</h6>
//                   </div>
//                 )}


//                 {!otpSuccess && (
//                   <p className="mt-3">
//                     {canResend ? (
//                       <span
//                         onClick={handleResend}
//                         className="resend_link"
//                       >
//                         Resend OTP
//                       </span>
//                     ) : (
//                       <>
//                         Resend in 00:
//                         {timer.toString().padStart(2, "0")}
//                       </>
//                     )}
//                   </p>
//                 )}

//               </div>
//             )}

//           </div>

//         </div>

//       </div>

//     </section>
//   );
// };

// export default SignIn;




import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import signImg from "../images/Logo.png";
const USE_BACKEND = true;
const STATIC_OTP = "123456";
const API_BASE_URL = "http://192.168.2.9:5000/api/auth";
const OTP_LENGTH = 6;

const SignIn = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const inputsRef = useRef([]);
  const timerRef = useRef(null);

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [shake, setShake] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role === "restaurant") navigate("/RestaurantDashboard");
  }, [navigate]);
  useEffect(() => {
    if (showOtp) {
      setTimeout(() => {
        inputsRef.current[0]?.focus();
      }, 100);
    }
  }, [showOtp]);
  const isValidEmail = (v) => v.includes("@");

  const startTimer = () => {
    setTimer(30);
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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!email.trim()) return setError("Email is required");
    if (!isValidEmail(email)) return setError("Enter valid email");

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role: "restaurant"
        })
        ,
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);

        if (data.error && data.error.includes("email not found")) {
          setError(
            "Invalid Email"
          );
        } else {
          setError(data.error || "Failed to send OTP");
        }

        return;
      }
      setShowOtp(true);
      setOtpError("");
      setOtpSuccess(false);
      setMsg("OTP sent successfully");
      startTimer();

    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const getOtpValue = () =>
    inputsRef.current.map((i) => i?.value || "").join("");

const handleInput = (e, index) => {
  const value = e.target.value.replace(/\D/g, "");

  const newOtp = [...otp];

  // allow empty value also
  newOtp[index] = value;

  setOtp(newOtp);

  // next input focus
  if (value && index < OTP_LENGTH - 1) {
    inputsRef.current[index + 1]?.focus();
  }

  const code = newOtp.join("");

  if (code.length === OTP_LENGTH && !newOtp.includes("")) {
    handleVerify(code);
  }
};

const handleKeyDown = (e, i) => {
  if (e.key === "Backspace") {
    const newOtp = [...otp];

    // current box empty unte previous ki vellali
    if (!otp[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();

      newOtp[i - 1] = "";
      setOtp(newOtp);
    } else {
      // current value clear cheyyali
      newOtp[i] = "";
      setOtp(newOtp);
    }
  }
};
  const handlePaste = (e) => {
    e.preventDefault();

    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!paste) return;

    const newOtp = Array(OTP_LENGTH).fill("");

    paste.split("").forEach((digit, i) => {
      newOtp[i] = digit;
    });

    setOtp(newOtp);

    if (!newOtp.includes("")) {
      handleVerify(newOtp.join(""));
    }
  };

  const shakeError = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleVerify = async (otpCode = otp) => {
    setError("");

    if (otpCode.length !== 6) return shakeError("Enter 6-digit OTP");

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: otpCode,
          role: "restaurant"
        }),
      });

      const data = await res.json();
      if (!res.ok) return shakeError("Invalid OTP");

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("linked_id", data.linked_id);
      localStorage.setItem("username", email);

      setOtpSuccess(true);
      setTimeout(() => navigate("/RestaurantDashboard"), 1200);

    } catch {
      shakeError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    await handleSendOtp(new Event("submit"));
  };

  return (
    <section className="restaurant_login_wrapper restaurant_bg">

      <div className="floating_blob blob1"></div>
      <div className="floating_blob blob2"></div>

      <div className="login_container">

        {/* LEFT SIDE */}
        <div className="login_left">
          <div className="left_content">

            <img
              src={signImg}
              alt="restaurant Login"
              className="login_logo"
            />

            <h1>Restaurant Partner Login</h1>

            <p>
              Access your restaurant dashboard to manage orders, monitor supplies,
              and ensure seamless kitchen operations with real-time updates.
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


            <h3 className="text-center mb-3">Login</h3>


            {/* EMAIL SECTION */}
            <form onSubmit={handleSendOtp}>

              <div className="mb-3">
                <input
                  type="email"
                  placeholder="Email Address"
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
                Don’t have an account ?{" "}
                <Link to="/Registration">Sign Up</Link>
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

                <h6>OTP Verification</h6>

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
                        autoComplete={
                          index === 0 ? "one-time-code" : "off"
                        }
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


                {/* SUCCESS */}
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

export default SignIn;