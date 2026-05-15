// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";

// const API = "http://192.168.2.9:5000/api";

// const CheckItems = () => {
//   const navigate = useNavigate();

//   const [addresses, setAddresses] = useState([]);
//   const [selectedId, setSelectedId] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [editId, setEditId] = useState(null);

//   const selectedAddress = addresses.find(a => a.id === selectedId);

//   const [coords, setCoords] = useState(null);

//   // ✅ CREDIT STATES
//   // const [paymentMethod, setPaymentMethod] = useState("COD");
//   // const [paymentMethod, setPaymentMethod] = useState("");
//   const [creditInfo, setCreditInfo] = useState(null);

//   const [formData, setFormData] = useState({
//     name: "",
//     phone: "",
//     altPhone: "",
//     pincode: "",
//     address1: "",
//     address2: "",
//     city: "",
//     state: "",
//     landmark: "",
//     type: "Home",
//   });
// useEffect(() => {
//   const token = localStorage.getItem("token");
//   if (!token) return;

//   fetch(`${API}/restaurant/profile`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   })
//     .then((res) => res.json())
//     .then((user) => {
//       const newId = Date.now();

//       // ✅ form set
//       setFormData({
//         name: user?.name || "",
//         phone: user?.phone || "",
//         altPhone: "",
//         pincode: "",
//         address1: "",
//         address2: "",
//         city: "",
//         state: "",
//         landmark: "",
//         type: "Home",
//       });

//       // ✅ address create HERE (IMPORTANT)
//       setAddresses([
//         {
//           id: newId,
//           name: user?.name || "Current Location",
//           phone: user?.phone || "",
//           address: "Detecting location...",
//           isDefault: true,
//         },
//       ]);

//       setSelectedId(newId);
//     })
//     .catch((err) => console.log(err));
// }, []);
//   /* ================= CREDIT FETCH ================= */
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) return;

//     fetch(`${API}/restaurant/credit-info`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((res) => res.json())
//       .then(setCreditInfo)
//       .catch(() => {});
//   }, []);

//   /* ================= AUTO LOCATION ================= */
//  useEffect(() => {
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(async (pos) => {
//       const { latitude, longitude } = pos.coords;

//       setCoords({
//         lat: latitude,
//         lng: longitude,
//       });

//       try {
//         const res = await fetch(
//           `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
//         );
//         const data = await res.json();

//         const addressText = data.display_name || "Current Location";

//         // ✅ ONLY UPDATE ADDRESS
//         setAddresses((prev) =>
//           prev.map((addr) => ({
//             ...addr,
//             address: addressText,
//           }))
//         );
//       } catch (err) {
//         console.log(err);
//       }
//     });
//   }
// }, []);
//   /* ================= USER AUTO FILL ================= */
// useEffect(() => {
//   try {
//     const userData = localStorage.getItem("user");

//     if (userData) {
//       const user = JSON.parse(userData);

//       setFormData((prev) => ({
//         ...prev,
//         name: user?.name || "",
//         phone: user?.phone || "",
//         city: user?.city || "",
//       }));
//     }
//   } catch (err) {
//     console.log("User parse error", err);
//   }
// }, []);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const deleteAddress = (id) => {
//     setAddresses(addresses.filter((addr) => addr.id !== id));
//   };

//   const setDefault = (id) => {
//     setAddresses(
//       addresses.map((addr) => ({
//         ...addr,
//         isDefault: addr.id === id,
//       }))
//     );
//     setSelectedId(id);
//   };



// const handleSubmit = async (e) => {
//   e.preventDefault();

//   try {
//     const TOKEN = localStorage.getItem("token");

//     // ✅ LOGIN CHECK
//     if (!TOKEN) {
//       alert("Login expired");
//       return;
//     }

//     // ✅ USER INPUT VALIDATION
//     if (!formData.name || !formData.phone) {
//       alert("Name and phone are required");
//       return;
//     }

//     // ✅ ADDRESS FIX
//     const finalAddress =
//       selectedAddress?.address ||
//       (formData.address1 && formData.city
//         ? `${formData.address1}, ${formData.city}`
//         : null);

//     if (!finalAddress) {
//       alert("Please enter address");
//       return;
//     }

//     // ✅ LOCATION CHECK
//     if (!coords) {
//       alert("Location not detected yet");
//       return;
//     }

//     // 🚀 CREATE ORDER
//     const res = await fetch(`${API}/checkout`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${TOKEN}`,
//       },
//       body: JSON.stringify({
//         name: formData.name,
//         phone: formData.phone,
//         address: finalAddress, // ✅ fixed
//         note: formData.landmark || "",
//         latitude: coords?.lat || 0,
//         longitude: coords?.lng || 0,
//       }),
//     });

//     const data = await res.json();

//     // ❌ API ERROR
//     if (!res.ok) {
//       console.error("Checkout error:", data);
//       alert(data?.error || "Checkout failed");
//       return;
//     }

//     const firstOrder = data?.orders_created?.[0];

//     if (!firstOrder) {
//       alert("Order not created");
//       return;
//     }

//     console.log("✅ ORDER CREATED:", firstOrder);

//     // ✅ STORE ORDER
//     localStorage.setItem("order_id", firstOrder.order_id);
//     localStorage.setItem("total_amount", firstOrder.amount);

//     // 🚀 NAVIGATE
//     navigate("/payment");

//   } catch (err) {
//     console.error("❌ Checkout crash:", err);
//     alert("Checkout failed. Try again.");
//   }
// };
//   /* ================= CART ================= */
//   const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

//   const subtotalFromCart = cartItems.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );

//   const savedSummary = JSON.parse(localStorage.getItem("cart_summary")) || {
//     subtotal: subtotalFromCart,
//     delivery: 0,
//     discount: 0,
//     total: subtotalFromCart,
//   };

//   const { subtotal, delivery, discount, total } = savedSummary;

//   return (
//     <section className="checkout pt_100 pb-80">
//       <div className="container">
//         <div className="row">

//           <div className="col-lg-8">
//                         {/* ✅ CREDIT BOX */}
//               {creditInfo && (
//                 <div className="credit_summary_box">

//                   <div className="credit_summary_header">
//                     <i className="fas fa-wallet"></i>
//                     <span>Business Credit</span>
//                   </div>

//                   <div className="credit_summary_grid">

//                     <div>
//                       <small>Limit</small>
//                       <strong>QAR  {creditInfo.credit_limit}</strong>
//                     </div>

//                     <div>
//                       <small>Used</small>
//                       <strong>QAR  {creditInfo.credit_used}</strong>
//                     </div>

//                     <div>
//                       <small>Available</small>
//                       <strong className="credit_available">
//                         QAR  {creditInfo.credit_available}
//                       </strong>
//                     </div>

//                     <div>
//                       <small>Credit Period</small>
//                       <strong>{creditInfo.credit_days} days</strong>
//                     </div>

//                     {creditInfo.next_due_date && (
//                       <div>
//                         <small>Next Due</small>
//                         <strong>
//                           {new Date(creditInfo.next_due_date).toLocaleDateString()}
//                         </strong>
//                       </div>
//                     )}

//                     {creditInfo.overdue_amount > 0 && (
//                       <div className="credit_overdue">
//                         Overdue:QAR  {creditInfo.overdue_amount}
//                       </div>
//                     )}

//                   </div>
//                 </div>
//               )}

//             <div className="shipping_address_box">
//               <div className="d-flex justify-content-between align-items-center mb-3">
//                 <h3>Shipping Address</h3>
//                 <button
//                   className="add_address_btn"
//                   onClick={() => {
//                     setShowForm(!showForm);
//                     setEditId(null);
//                   }}
//                 >
//                   + Add New Address
//                 </button>
//               </div>

//               {/* ADDRESS LIST */}
//               {addresses.map((addr) => (
//                 <div
//                   key={addr.id}
//                   className={`address_card ${selectedId === addr.id ? "active" : ""}`}
//                 >
//                   <div className="address_row">

//                     <div className="address_left">
//                       <input
//                         type="radio"
//                         checked={selectedId === addr.id}
//                         onChange={() => setSelectedId(addr.id)}
//                       />

//                       <div className="address_content">
//                         <div className="address_header">
//                           <h5>{addr.name}</h5>
//                           {addr.isDefault && (
//                             <span className="default_badge">Default</span>
//                           )}
//                         </div>

//                         <p className="address_text">{addr.address}</p>
//                         <small className="phone_text">
//                           Phone: {addr.phone}
//                         </small>
//                       </div>
//                     </div>

//                     <div className="address_right">
//                       <button onClick={() => setEditId(addr.id)}>Edit</button>
//                       <button onClick={() => deleteAddress(addr.id)}>Delete</button>
//                       {!addr.isDefault && (
//                         <button onClick={() => setDefault(addr.id)}>
//                           Make Default
//                         </button>
//                       )}
//                     </div>

//                   </div>
//                 </div>
//               ))}



//               {/* FORM */}
//               <div className={`address_form_wrapper ${showForm ? "open" : ""}`}>
//                 {showForm && (

//                   <form className="checkout_form mt-4" onSubmit={handleSubmit}>
//                     <div className="row">

//                       <div className="col-md-6">
//                         <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" />
//                       </div>

//                       <div className="col-md-6">
//                         <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" />
//                       </div>

//                       <div className="col-md-6">
//                         <input name="altPhone" value={formData.altPhone} onChange={handleChange} placeholder="Alt Phone" />
//                       </div>

//                       <div className="col-md-6">
//                         <input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" />
//                       </div>

//                       <div className="col-12">
//                         <input name="address1" value={formData.address1} onChange={handleChange} placeholder="Address 1" />
//                       </div>

//                       <div className="col-12">
//                         <input name="address2" value={formData.address2} onChange={handleChange} placeholder="Address 2" />
//                       </div>

//                       <div className="col-md-6">
//                         <input name="city" value={formData.city} onChange={handleChange} placeholder="City" />
//                       </div>

//                       <div className="col-md-6">
//                         <input name="state" value={formData.state} onChange={handleChange} placeholder="State" />
//                       </div>

//                       <div className="col-md-6">
//                         <input name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Landmark" />
//                       </div>

//                       <div className="col-12 mt-3">
//                         <label>
//                           <input type="radio" name="type" value="Home" onChange={handleChange} /> Home
//                         </label>
//                         <label>
//                           <input type="radio" name="type" value="Office" onChange={handleChange} /> Office
//                         </label>
//                       </div>

//                       <div className="col-12 mt-4">
//                         <button type="submit" className="common_btn">
//                           Save Address
//                         </button>
//                       </div>

//                     </div>
//                   </form>

//                 )}
//               </div>
//             {/* ✅ PAYMENT METHOD */}
//             {/* <div className="checkout_input_box mt-4">
//               <label>Payment Method</label>
//               <select
//                 value={paymentMethod}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//               >
//                 <option value="COD">Cash on Delivery</option>
//                 <option value="CREDIT">Credit</option>
//               </select>
//             </div> */}

//             {/* <div className="payment-methods mt-4">

//               {/* CREDIT */}
//               {/* <label
//                 className={`payment-option ${paymentMethod === "CREDIT" ? "active" : ""}`}
//                 onClick={() => setPaymentMethod("CREDIT")}
//               >
//                 <input type="radio" checked={paymentMethod === "CREDIT"} readOnly />
//                 <span>Pay using Credit</span>
//               </label> */}

//               {/* COD */}
//               {/* <label
//                 className={`payment-option ${paymentMethod === "COD" ? "active" : ""}`}
//                 onClick={() => setPaymentMethod("COD")}
//               >
//                 <input type="radio" checked={paymentMethod === "COD"} readOnly />
//                 <span>Cash on Delivery</span>
//               </label> */}

//               {/* 🔥 NEW ONLINE OPTION */}
//               {/* <label
//                 className={`payment-option ${paymentMethod === "ONLINE" ? "active" : ""}`}
//                 onClick={() => setPaymentMethod("ONLINE")}
//               >
//                 <input type="radio" checked={paymentMethod === "ONLINE"} readOnly />
//                 <span>Online Payment</span>
//               </label> */}

//             {/* </div> */} 

//             <button
//   onClick={handleSubmit}
//   className="common_btn mt-3"
// >
//   Proceed
// </button>

//             {/* {creditInfo?.overdue_amount > 0 && (
//               <p style={{ color: "red", marginTop: "10px" }}>
//                 ⚠️ Your account has overdue amount of QAR {creditInfo.overdue_amount}.  
//                 Please clear dues to use credit.
//               </p>
//             )} */}
//             </div>

//           </div>

//           {/* CART */}
//            <div className="col-lg-4 col-md-8">
//             <div className="cart_sidebar">
//               <h3>Total Cart ({cartItems.length})</h3>
//               <div className="cart_sidebar_info">
//                 <h4>Subtotal : <span>QAR {subtotal.toFixed(2)}</span></h4>
//                 <p>Delivery : <span>QAR {delivery}</span></p>
//                 <p>Discount : <span>-QAR {discount}</span></p>
//                 <h5>Total : <span>QAR {total.toFixed(2)}</span></h5>

                
//               </div>
//             </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default CheckItems;









// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";

// const API = "http://192.168.2.9:5000/api";

// const CheckItems = () => {
//   const navigate = useNavigate();

//   const [addresses, setAddresses] = useState([]);
//   const [selectedId, setSelectedId] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [showAddressPopup, setShowAddressPopup] = useState(false);

//   const selectedAddress = addresses.find(a => a.id === selectedId);

//   const [coords, setCoords] = useState(null);

//   // ✅ CREDIT STATES
//   // const [paymentMethod, setPaymentMethod] = useState("COD");
//   // const [paymentMethod, setPaymentMethod] = useState("");
//   const [creditInfo, setCreditInfo] = useState(null);

//   const [formData, setFormData] = useState({
//     name: "",
//     phone: "",
//     altPhone: "",
//     pincode: "",
//     address1: "",
//     address2: "",
//     city: "",
//     state: "",
//     landmark: "",
//     type: "Home",
//   });
// useEffect(() => {
//   const token = localStorage.getItem("token");
//   if (!token) return;

//   fetch(`${API}/restaurant/profile`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   })
//     .then((res) => res.json())
//     .then((user) => {
//       const newId = Date.now();

//       // ✅ form set
//       setFormData({
//         name: user?.name || "",
//         phone: user?.phone || "",
//         altPhone: "",
//         pincode: "",
//         address1: "",
//         address2: "",
//         city: "",
//         state: "",
//         landmark: "",
//         type: "Home",
//       });

//       // ✅ address create HERE (IMPORTANT)
    

//       setSelectedId(newId);
//     })
//     .catch((err) => console.log(err));
// }, []);
//   /* ================= CREDIT FETCH ================= */
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) return;

//     fetch(`${API}/restaurant/credit-info`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((res) => res.json())
//       .then(setCreditInfo)
//       .catch(() => {});
//   }, []);

//   /* ================= AUTO LOCATION ================= */
// /* ================= AUTO LOCATION ================= */
// /* ================= AUTO LOCATION ================= */
// useEffect(() => {

//   if (navigator.geolocation) {

//     navigator.geolocation.getCurrentPosition(

//       async (pos) => {

//         const { latitude, longitude } = pos.coords;

//         setCoords({
//           lat: latitude,
//           lng: longitude,
//         });

//         try {

//           const res = await fetch(
//             `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
//           );

//           const data = await res.json();

//           const addressText =
//             data.display_name || "Current Location";

//           // ✅ CURRENT LOCATION OBJECT
//             const tokenUser =
//             JSON.parse(
//               localStorage.getItem("user") || "{}"
//             );

//           const currentLocationAddress = {

//             id: "current-location",

//             // ✅ USER NAME
//             name:
//               formData.name ||
//               tokenUser?.name ||
//               "Current Location",

//             // ✅ USER PHONE
//             phone:
//               formData.phone ||
//               tokenUser?.phone ||
//               "",

//             address: addressText,

//             isDefault: false,

//           };

//           setAddresses((prev) => {

//             // ✅ REMOVE OLD CURRENT LOCATION
//             const savedAddresses = prev.filter(
//               (a) => a.id !== "current-location"
//             );

//             // ✅ KEEP MANUAL SAVED ADDRESSES
//             // ✅ ADD ONLY LATEST CURRENT LOCATION
//             return [
//               currentLocationAddress,
//               ...savedAddresses,
//             ];
//           });

//           // ✅ SELECT CURRENT LOCATION
//           setSelectedId("current-location");

//         } catch (err) {

//           console.log(err);
//         }
//       },

//       (err) => {

//         console.log("Location error:", err);
//       }

//     );
//   }

// }, []);
//   /* ================= USER AUTO FILL ================= */

// useEffect(() => {

//   const fetchSavedAddresses = async () => {

//     try {

//       const res = await fetch(
//         `${API}/user-addresses`
//       );

//       const data = await res.json();

//       if (
//         Array.isArray(data) &&
//         data.length > 0
//       ) {

//      const formatted = data.map((addr) => ({

//   id: addr.id,

//   name: addr.contact_name,

//   phone: addr.phone,

//   address: addr.address_line,

//   isDefault: addr.is_default,

//   // ✅ EXTRA FIELDS
//   street: addr.street,

//   zone: addr.zone,

//   building: addr.building,

//   unit_no: addr.unit_no,

//   city: addr.city,

//   country: addr.country,

//   zip_code: addr.zip_code,

//   address_type: addr.address_type,

// }));

//         setAddresses((prev) => {

//           const currentLocation = prev.find(
//             (a) => a.id === "current-location"
//           );

//           // ✅ CURRENT LOCATION EXISTS
//           if (currentLocation) {

//             const allAddresses = [
//               currentLocation,
//               ...formatted
//             ];

//             // ✅ FIND DEFAULT
//             const defaultAddress =
//               formatted.find(
//                 (a) => a.isDefault
//               );

//             // ✅ AUTO SELECT DEFAULT
//             if (defaultAddress) {

//               setSelectedId(
//                 defaultAddress.id
//               );

//             } else if (!selectedId) {

//               setSelectedId(
//                 allAddresses[0].id
//               );
//             }

//             return allAddresses;
//           }

//           // ✅ NO CURRENT LOCATION
//           const defaultAddress =
//             formatted.find(
//               (a) => a.isDefault
//             );

//           if (defaultAddress) {

//             setSelectedId(
//               defaultAddress.id
//             );
//           }

//           return formatted;

//         });

//       }

//     } catch (err) {

//       console.log(
//         "Address fetch error",
//         err
//       );
//     }
//   };

//   fetchSavedAddresses();

// }, []);
// useEffect(() => {

//   try {

//     const userData =
//       localStorage.getItem("user");

//     if (userData) {

//       const user =
//         JSON.parse(userData);

//       setFormData((prev) => ({

//         ...prev,

//         name: user?.name || "",

//         phone: user?.phone || "",

//         city: user?.city || "",

//       }));
//     }

//   } catch (err) {

//     console.log(
//       "User parse error",
//       err
//     );
//   }

// }, []);

// // ✅ ONLY SAVED ADDRESSES
// const savedAddresses = addresses.filter(
//   (a) => a.id !== "current-location"
// );

// // ✅ ADDRESS LIMIT
// const addressLimitReached =
//   savedAddresses.length >= 5;

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//  const deleteAddress = async (id) => {

//   try {

//     // ✅ REMOVE CURRENT LOCATION PROTECTION
//     if (id === "current-location") {

//       alert("Current location cannot be deleted");

//       return;
//     }

//     // ✅ API DELETE
//     await fetch(`${API}/user-addresses/${id}`, {
//       method: "DELETE",
//     });

//     // ✅ FRONTEND REMOVE
//   setAddresses((prev) =>
//   prev.filter((addr) => addr.id !== id)
// );

//     // ✅ RESET SELECTED
//    if (selectedId === id) {

// const remaining = addresses.filter(
//   (addr) => addr.id !== id
// );

// // ✅ AUTO SELECT NEXT ADDRESS
// const nextAddress = remaining.find(
//   (a) => a.id !== "current-location"
// );

// if (nextAddress) {

//   setSelectedId(nextAddress.id);

// } else {

//   setSelectedId("current-location");
// }

//   // if (remaining.length > 0) {
//   //   setSelectedId(remaining[0].id);
//   // } else {
//   //   setSelectedId(null);
//   // }
// }
//   } catch (err) {

//     console.log(err);

//     alert("Delete failed");
//   }
// };

// const setDefault = async (id) => {

//   try {

//     await fetch(
//       `${API}/user-addresses/${id}/default`,
//       {
//         method: "PUT",
//       }
//     );

//       setAddresses((prev) =>
//       prev.map((addr) => ({
//         ...addr,
//         isDefault: addr.id === id,
//       }))
//     );

//     setSelectedId(id);

//     alert("Default address updated");

//   } catch (err) {

//     console.log(err);

//     alert("Failed to update default");
//   }
// };



// const saveAddress = async () => {

//   try {

//     // ✅ REMOVE CURRENT LOCATION
//     const savedAddresses = addresses.filter(
//       (a) => a.id !== "current-location"
//     );


//     // ✅ MAX 5 LIMIT
//   if (!editId && savedAddresses.length >= 5){

//       alert("Maximum 5 addresses allowed");

//       return;
//     }

//     const finalAddress =
//       `${formData.address1}, ${formData.address2}, ${formData.city}, ${formData.state}`;

//     // ✅ DUPLICATE CHECK
//   const alreadyExists = savedAddresses.some(
//   (addr) =>

//     // ✅ IGNORE CURRENT EDIT ADDRESS
//     addr.id !== editId &&

//     addr.address?.trim().toLowerCase() ===
//     finalAddress.trim().toLowerCase()
// );

//     if (alreadyExists) {

//       alert("Address already exists");

//       return;
//     }

//    const res = await fetch(

//   editId
//     ? `${API}/user-addresses/${editId}`
//     : `${API}/user-addresses`,

//   {

//     method: editId ? "PUT" : "POST",

//     headers: {
//       "Content-Type": "application/json",
//     },

//     body: JSON.stringify({

//   contact_name: formData.name,

//   phone: formData.phone,

//   address_line: finalAddress,

//   street: formData.address1,

//   zone: formData.address2,

//   building: formData.landmark,

//   unit_no: formData.altPhone,

//   city: formData.city,

//   country: formData.state,

//   zip_code: formData.pincode,

//   lat: coords?.lat,

//   lng: coords?.lng,

//   address_type: formData.type,

//   is_default: savedAddresses.length === 0

// }),
//   }
// );

//     const newAddress = await res.json();

//     if (!res.ok) {

//       alert("Failed to save address");

//       return;
//     }

//     // ✅ ADD NEW ADDRESS
//   if (editId) {

//   // ✅ UPDATE EXISTING
// setAddresses((prev) =>
//   prev.map((addr) =>
//     addr.id === editId
//       ? {

//           ...addr,

//           name: newAddress.contact_name,

//           phone: newAddress.phone,

//           address: newAddress.address_line,

//           // ✅ IMPORTANT
//           street: newAddress.street,

//           zone: newAddress.zone,

//           building: newAddress.building,

//           unit_no: newAddress.unit_no,

//           city: newAddress.city,

//           country: newAddress.country,

//           zip_code: newAddress.zip_code,

//           address_type:
//             newAddress.address_type,

//         }
//       : addr
//   )
// );

// } else {

//   // ✅ ADD NEW
//   setAddresses((prev) => [

//     ...prev,

//     {
//     id: newAddress.id,

//     name: newAddress.contact_name,

//     phone: newAddress.phone,

//     address: newAddress.address_line,

//     isDefault: newAddress.is_default,

//     // ✅ IMPORTANT
//     street: newAddress.street,

//     zone: newAddress.zone,

//     building: newAddress.building,

//     unit_no: newAddress.unit_no,

//     city: newAddress.city,

//     country: newAddress.country,

//     zip_code: newAddress.zip_code,

//     address_type:
//       newAddress.address_type,

//     },

//   ]);
// }

//     setSelectedId(newAddress.id);

//     setShowForm(false);
//     setEditId(null);
//     setFormData({

//   name: "",

//   phone: "",

//   altPhone: "",

//   pincode: "",

//   address1: "",

//   address2: "",

//   city: "",

//   state: "",

//   landmark: "",

//   type: "Home",

// });

//     alert("Address saved successfully");

//   } catch (err) {

//     console.log(err);

//     alert("Save failed");
//   }
// };
// const handleSubmit = async (e) => {

//   e.preventDefault();

//   try {

//     const TOKEN =
//       localStorage.getItem("token");

//     // ✅ LOGIN CHECK
//     if (!TOKEN) {

//       alert("Login expired");

//       return;
//     }

//     // ✅ USE SELECTED ADDRESS DATA
//     const customerName =
//       selectedAddress?.name ||
//       formData.name;

//     const customerPhone =
//       selectedAddress?.phone ||
//       formData.phone;

//     // ✅ VALIDATION
//     if (!customerName || !customerPhone) {

//       alert(
//         "Name and phone are required"
//       );

//       return;
//     }

//     // ✅ ADDRESS FIX
//     const finalAddress =

//       selectedAddress?.address ||

//       (
//         formData.address1 &&
//         formData.city
//       )

//         ? `${formData.address1}, ${formData.city}`

//         : null;

//     if (!finalAddress) {

//       alert("Please enter address");

//       return;
//     }

//     // ✅ LOCATION CHECK
//     if (!coords) {

//       alert(
//         "Location not detected yet"
//       );

//       return;
//     }

//     // 🚀 CREATE ORDER
//     const res = await fetch(

//       `${API}/checkout`,

//       {

//         method: "POST",

//         headers: {

//           "Content-Type":
//             "application/json",

//           Authorization:
//             `Bearer ${TOKEN}`,

//         },

//         body: JSON.stringify({

//           // ✅ FIXED
//           name: customerName,

//           phone: customerPhone,

//           address: finalAddress,

//           note:
//             formData.landmark || "",
//              delivery_instructions:
//             formData.landmark || "",

//           latitude:
//             coords?.lat || 0,

//           longitude:
//             coords?.lng || 0,

//         }),

//       }
//     );

//     const data = await res.json();

//     // ❌ API ERROR
//     if (!res.ok) {

//       console.error(
//         "Checkout error:",
//         data
//       );

//       alert(
//         data?.error ||
//         "Checkout failed"
//       );

//       return;
//     }

//     const createdOrders =
//       data?.orders_created || [];

//     if (createdOrders.length === 0) {

//       alert("Order not created");

//       return;
//     }

//     console.log(
//       "✅ ALL ORDERS:",
//       createdOrders
//     );

//     // ✅ SAVE ALL SPLIT ORDERS
//     localStorage.setItem(
//       "success_orders",
//       JSON.stringify(createdOrders)
//     );

//     // ✅ GRAND TOTAL
//     const grandTotal =
//       createdOrders.reduce(

//         (sum, order) =>

//           sum + Number(order.amount || 0),

//         0
//       );

//     localStorage.setItem(
//       "success_total",
//       grandTotal
//     );

//     // 🚀 NAVIGATE
//     navigate("/payment");

//   } catch (err) {

//     console.error(
//       "❌ Checkout crash:",
//       err
//     );

//     alert(
//       "Checkout failed. Try again."
//     );
//   }
// };
//   /* ================= CART ================= */
//   const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

//   const subtotalFromCart = cartItems.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );

//   const savedSummary = JSON.parse(localStorage.getItem("cart_summary")) || {
//     subtotal: subtotalFromCart,
//     delivery: 0,
//     discount: 0,
//     total: subtotalFromCart,
//   };

//   const { subtotal, delivery, discount, total } = savedSummary;

//   return (
//     <section className="checkout pt_100 pb-80">
//       <div className="container">
//         <div className="row">

//           <div className="col-lg-8">
//                         {/* ✅ CREDIT BOX */}
//               {creditInfo && (
//                 <div className="credit_summary_box">

//                   <div className="credit_summary_header">
//                     <i className="fas fa-wallet"></i>
//                     <span>Business Credit</span>
//                   </div>

//                   <div className="credit_summary_grid">

//                     <div>
//                       <small>Limit</small>
//                       <strong>QAR  {creditInfo.credit_limit}</strong>
//                     </div>

//                     <div>
//                       <small>Used</small>
//                       <strong>QAR  {creditInfo.credit_used}</strong>
//                     </div>

//                     <div>
//                       <small>Available</small>
//                       <strong className="credit_available">
//                         QAR  {creditInfo.credit_available}
//                       </strong>
//                     </div>

//                     <div>
//                       <small>Credit Period</small>
//                       <strong>{creditInfo.credit_days} days</strong>
//                     </div>

//                     {creditInfo.next_due_date && (
//                       <div>
//                         <small>Next Due</small>
//                         <strong>
//                           {new Date(creditInfo.next_due_date).toLocaleDateString()}
//                         </strong>
//                       </div>
//                     )}

//                     {creditInfo.overdue_amount > 0 && (
//                       <div className="credit_overdue">
//                         Overdue:QAR  {creditInfo.overdue_amount}
//                       </div>
//                     )}

//                   </div>
//                 </div>
//               )}

//             <div className="shipping_address_box">
//               <div className="d-flex justify-content-between align-items-center mb-3">
//                 <h3>Shipping Address</h3>
//                 <button

//   className="add_address_btn"

//   disabled={addressLimitReached}

//   onClick={() => {

//     if (addressLimitReached) {

//       alert(
//         "Maximum 5 addresses allowed"
//       );

//       return;
//     }

//     setShowForm(!showForm);

//     setEditId(null);
//   }}

// >

//   {addressLimitReached
//     ? "Address Limit Reached"
//     : "+ Add New Address"}

// </button>
//               </div>

//               {/* ADDRESS LIST */}
//               {addresses  .filter(
//                   (addr) =>
//               addr.id ===
//                     "current-location"
//                 ).map((addr) => (
//                 <div
//                   key={addr.id}
//                   className={`address_card ${selectedId === addr.id ? "active" : ""}`}
//                 >
//                   <div className="address_row">

//                     <div className="address_left">
//                       <input
//                         type="radio"
//                         checked={selectedId === addr.id}
//                         onChange={() => setSelectedId(addr.id)}
//                       />

//                       <div className="address_content">
//                         <div className="address_header">
//                           <h5>{addr.name}</h5>
//                           {addr.isDefault && (
//                             <span className="default_badge">Default</span>
//                           )}
//                         </div>

//                         <p className="address_text">{addr.address}</p>
//                         <small className="phone_text">
//                           Phone: {addr.phone}
//                         </small>
//                       </div>
//                     </div>

//                     <div className="address_right">

//   {addr.id !== "current-location" && (
//     <>
//      <button
// onClick={() => {

//   setEditId(addr.id);

//   setShowForm(true);

//   setFormData({

//     name: addr.name || "",

//     phone: addr.phone || "",

//     altPhone: addr.unit_no || "",

//     pincode: addr.zip_code || "",

//     address1: addr.street || "",

//     address2: addr.zone || "",

//     city: addr.city || "",

//     state: addr.country || "",

//     landmark: addr.building || "",

//     type: addr.address_type || "Home",

//   });

// }}
// >
//   Edit
// </button>

//       <button
//         onClick={() => deleteAddress(addr.id)}
//       >
//         Delete
//       </button>

//       {!addr.isDefault && (
//         <button
//           onClick={() => setDefault(addr.id)}
//         >
//           Make Default
//         </button>
//       )}
//     </>
//   )}

// </div>

//                   </div>
//                 </div>
//               ))}



//               {/* FORM */}
//               <div className={`address_form_wrapper ${showForm ? "open" : ""}`}>
//                 {showForm && (

//                   <form
//                       className="checkout_form mt-4"
//                       onSubmit={(e) => {
//                         e.preventDefault();
//                         saveAddress();
//                       }}
//                     >
//                     <div className="row">

//                       <div className="col-md-6">
//                         <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" />
//                       </div>

//                       <div className="col-md-6">
//                         <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" />
//                       </div>

//                       <div className="col-md-6">
//                         <input name="altPhone" value={formData.altPhone} onChange={handleChange} placeholder="Alt Phone" />
//                       </div>

//                       <div className="col-md-6">
//                         <input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" />
//                       </div>

//                       <div className="col-12">
//                         <input name="address1" value={formData.address1} onChange={handleChange} placeholder="Address 1" />
//                       </div>

//                       <div className="col-12">
//                         <input name="address2" value={formData.address2} onChange={handleChange} placeholder="Address 2" />
//                       </div>

//                       <div className="col-md-6">
//                         <input name="city" value={formData.city} onChange={handleChange} placeholder="City" />
//                       </div>

//                       <div className="col-md-6">
//                         <input name="state" value={formData.state} onChange={handleChange} placeholder="State" />
//                       </div>

//                       <div className="col-md-6">
//                         <input name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Landmark" />
//                       </div>

//                       <div className="col-12 mt-3">
//                         <label>
//                           <input type="radio" name="type" value="Home" onChange={handleChange} /> Home
//                         </label>
//                         <label>
//                           <input type="radio" name="type" value="Office" onChange={handleChange} /> Office
//                         </label>
//                       </div>

//                       <div className="col-12 mt-4">
//                         <button type="submit" className="common_btn">
//                           Save Address
//                         </button>
//                       </div>

//                     </div>
//                   </form>

//                 )}
//               </div>
           
//               {/* DELIVERY INSTRUCTIONS */}
//               <div className="mt-4">

//                 <label>
//                   Delivery Instructions
//                 </label>

//                 <textarea
//                   className="address_card"
//                   rows="3"
//                   placeholder="Call before delivery, leave at gate..."
//                   value={formData.landmark}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       landmark: e.target.value,
//                     })
//                   }
//                 />

//               </div>

//               {/* PROCEED BUTTON */}
//               <button
//                 onClick={handleSubmit}
//                 className="common_btn mt-3"
//               >
//                 Proceed
//               </button>

//             {/* {creditInfo?.overdue_amount > 0 && (
//               <p style={{ color: "red", marginTop: "10px" }}>
//                 ⚠️ Your account has overdue amount of QAR {creditInfo.overdue_amount}.  
//                 Please clear dues to use credit.
//               </p>
//             )} */}
//             </div>

//           </div>

//           {/* CART */}
//            <div className="col-lg-4 col-md-8">
//             <div className="cart_sidebar">
//               <h3>Total Cart ({cartItems.length})</h3>
//               <div className="cart_sidebar_info">
//                 <h4>Subtotal : <span>QAR {subtotal.toFixed(2)}</span></h4>
//                 <p>Delivery : <span>QAR {delivery}</span></p>
//                 <p>Discount : <span>-QAR {discount}</span></p>
//                 <h5>Total : <span>QAR {total.toFixed(2)}</span></h5>

                
//               </div>
//             </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default CheckItems;










import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = "http://192.168.2.9:5000/api";

const CheckItems = () => {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showAddressPopup, setShowAddressPopup] = useState(false);

  const selectedAddress = addresses.find(a => a.id === selectedId);

  const [coords, setCoords] = useState(null);

  // ✅ CREDIT STATES
  // const [paymentMethod, setPaymentMethod] = useState("COD");
  // const [paymentMethod, setPaymentMethod] = useState("");
  const [creditInfo, setCreditInfo] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    altPhone: "",
    pincode: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    landmark: "",
    type: "Home",
  });
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch(`${API}/restaurant/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((user) => {
      const newId = Date.now();

      // ✅ form set
      setFormData({
        name: user?.name || "",
        phone: user?.phone || "",
        altPhone: "",
        pincode: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        landmark: "",
        type: "Home",
      });

      // ✅ address create HERE (IMPORTANT)
    

      setSelectedId(newId);
    })
    .catch((err) => console.log(err));
}, []);
  /* ================= CREDIT FETCH ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API}/restaurant/credit-info`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setCreditInfo)
      .catch(() => {});
  }, []);

  /* ================= AUTO LOCATION ================= */
/* ================= AUTO LOCATION ================= */
/* ================= AUTO LOCATION ================= */
useEffect(() => {

  if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(

      async (pos) => {

        const { latitude, longitude } = pos.coords;

        setCoords({
          lat: latitude,
          lng: longitude,
        });

        try {

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );

          const data = await res.json();

          const addressText =
            data.display_name || "Current Location";

          // ✅ CURRENT LOCATION OBJECT
            // const tokenUser =
            // JSON.parse(
            //   localStorage.getItem("user") || "{}"
            // );
            

          const currentLocationAddress = {

            id: "current-location",

            // ✅ USER NAME
           name:
          tokenUser?.name ||
          JSON.parse(
            localStorage.getItem("user") || "{}"
          )?.name ||
          "Current Location",

        phone:
          tokenUser?.phone ||
          JSON.parse(
            localStorage.getItem("user") || "{}"
          )?.phone ||
          "",

            address: addressText,

            isDefault: false,

          };

          setAddresses((prev) => {

            // ✅ REMOVE OLD CURRENT LOCATION
            const savedAddresses = prev.filter(
              (a) => a.id !== "current-location"
            );

            // ✅ KEEP MANUAL SAVED ADDRESSES
            // ✅ ADD ONLY LATEST CURRENT LOCATION
            return [
              currentLocationAddress,
              ...savedAddresses,
            ];
          });

          // ✅ SELECT CURRENT LOCATION
          setSelectedId("current-location");

        } catch (err) {

          console.log(err);
        }
      },

      (err) => {

        console.log("Location error:", err);
      }

    );
  }

}, [selectedId]);
  /* ================= USER AUTO FILL ================= */

useEffect(() => {

  const fetchSavedAddresses = async () => {

    try {

      const res = await fetch(
        `${API}/user-addresses`
      );

      const data = await res.json();

      if (
        Array.isArray(data) &&
        data.length > 0
      ) {

     const formatted = data.map((addr) => ({

  id: addr.id,

  name: addr.contact_name,

  phone: addr.phone,

  address: addr.address_line,

  isDefault: addr.is_default,

  // ✅ EXTRA FIELDS
  street: addr.street,

  zone: addr.zone,

  building: addr.building,

  unit_no: addr.unit_no,

  city: addr.city,

  country: addr.country,

  zip_code: addr.zip_code,

  address_type: addr.address_type,

}));

        setAddresses((prev) => {

          const currentLocation = prev.find(
            (a) => a.id === "current-location"
          );

          // ✅ CURRENT LOCATION EXISTS
          if (currentLocation) {

            const allAddresses = [
              currentLocation,
              ...formatted
            ];

            // ✅ FIND DEFAULT
            const defaultAddress =
              formatted.find(
                (a) => a.isDefault
              );

            // ✅ AUTO SELECT DEFAULT
            if (defaultAddress) {

              setSelectedId(
                defaultAddress.id
              );

            } else if (!selectedId) {

              setSelectedId(
                allAddresses[0].id
              );
            }

            return allAddresses;
          }

          // ✅ NO CURRENT LOCATION
          const defaultAddress =
            formatted.find(
              (a) => a.isDefault
            );

          if (defaultAddress) {

            setSelectedId(
              defaultAddress.id
            );
          }

          return formatted;

        });

      }

    } catch (err) {

      console.log(
        "Address fetch error",
        err
      );
    }
  };

  fetchSavedAddresses();

}, []);
useEffect(() => {

  try {

    const userData =
      localStorage.getItem("user");

    if (userData) {

      const user =
        JSON.parse(userData);

      setFormData((prev) => ({

        ...prev,

        name: user?.name || "",

        phone: user?.phone || "",

        city: user?.city || "",

      }));
    }

  } catch (err) {

    console.log(
      "User parse error",
      err
    );
  }

}, []);

// ✅ ONLY SAVED ADDRESSES
const savedAddresses = addresses.filter(
  (a) => a.id !== "current-location"
);

// ✅ ADDRESS LIMIT
const addressLimitReached =
  savedAddresses.length >= 5;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

 const deleteAddress = async (id) => {

  try {

    // ✅ REMOVE CURRENT LOCATION PROTECTION
    if (id === "current-location") {

      alert("Current location cannot be deleted");

      return;
    }

    // ✅ API DELETE
    await fetch(`${API}/user-addresses/${id}`, {
      method: "DELETE",
    });

    // ✅ FRONTEND REMOVE
  setAddresses((prev) =>
  prev.filter((addr) => addr.id !== id)
);

    // ✅ RESET SELECTED
   if (selectedId === id) {

const remaining = addresses.filter(
  (addr) => addr.id !== id
);

// ✅ AUTO SELECT NEXT ADDRESS
const nextAddress = remaining.find(
  (a) => a.id !== "current-location"
);

if (nextAddress) {

  setSelectedId(nextAddress.id);

} else {

  setSelectedId("current-location");
}

  // if (remaining.length > 0) {
  //   setSelectedId(remaining[0].id);
  // } else {
  //   setSelectedId(null);
  // }
}
  } catch (err) {

    console.log(err);

    alert("Delete failed");
  }
};

const setDefault = async (id) => {

  try {

    await fetch(
      `${API}/user-addresses/${id}/default`,
      {
        method: "PUT",
      }
    );

      setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );

    setSelectedId(id);

    alert("Default address updated");

  } catch (err) {

    console.log(err);

    alert("Failed to update default");
  }
};



const saveAddress = async () => {

  try {

    // ✅ REMOVE CURRENT LOCATION
    const savedAddresses = addresses.filter(
      (a) => a.id !== "current-location"
    );


    // ✅ MAX 5 LIMIT
  if (!editId && savedAddresses.length >= 5){

      alert("Maximum 5 addresses allowed");

      return;
    }

    const finalAddress =
      `${formData.address1}, ${formData.address2}, ${formData.city}, ${formData.state}`;

    // ✅ DUPLICATE CHECK
  const alreadyExists = savedAddresses.some(
  (addr) =>

    // ✅ IGNORE CURRENT EDIT ADDRESS
    addr.id !== editId &&

    addr.address?.trim().toLowerCase() ===
    finalAddress.trim().toLowerCase()
);

    if (alreadyExists) {

      alert("Address already exists");

      return;
    }

   const res = await fetch(

  editId
    ? `${API}/user-addresses/${editId}`
    : `${API}/user-addresses`,

  {

    method: editId ? "PUT" : "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({

  contact_name: formData.name,

  phone: formData.phone,

  address_line: finalAddress,

  street: formData.address1,

  zone: formData.address2,

  building: formData.landmark,

  unit_no: formData.altPhone,

  city: formData.city,

  country: formData.state,

  zip_code: formData.pincode,

  lat: coords?.lat,

  lng: coords?.lng,

  address_type: formData.type,

  is_default: savedAddresses.length === 0

}),
  }
);

    const newAddress = await res.json();

    if (!res.ok) {

      alert("Failed to save address");

      return;
    }

    // ✅ ADD NEW ADDRESS
  if (editId) {

  // ✅ UPDATE EXISTING
setAddresses((prev) =>
  prev.map((addr) =>
    addr.id === editId
      ? {

          ...addr,

          name: newAddress.contact_name,

          phone: newAddress.phone,

          address: newAddress.address_line,

          // ✅ IMPORTANT
          street: newAddress.street,

          zone: newAddress.zone,

          building: newAddress.building,

          unit_no: newAddress.unit_no,

          city: newAddress.city,

          country: newAddress.country,

          zip_code: newAddress.zip_code,

          address_type:
            newAddress.address_type,

        }
      : addr
  )
);

} else {

  // ✅ ADD NEW
  setAddresses((prev) => [

    ...prev,

    {
    id: newAddress.id,

    name: newAddress.contact_name,

    phone: newAddress.phone,

    address: newAddress.address_line,

    isDefault: newAddress.is_default,

    // ✅ IMPORTANT
    street: newAddress.street,

    zone: newAddress.zone,

    building: newAddress.building,

    unit_no: newAddress.unit_no,

    city: newAddress.city,

    country: newAddress.country,

    zip_code: newAddress.zip_code,

    address_type:
      newAddress.address_type,

    },

  ]);
}

    setSelectedId(newAddress.id);

    setShowForm(false);
    setEditId(null);
    setFormData({

  name: "",

  phone: "",

  altPhone: "",

  pincode: "",

  address1: "",

  address2: "",

  city: "",

  state: "",

  landmark: "",

  type: "Home",

});

    alert("Address saved successfully");

  } catch (err) {

    console.log(err);

    alert("Save failed");
  }
};
const handleSubmit = async (e) => {

  e.preventDefault();

  try {

    const TOKEN =
      localStorage.getItem("token");

    // ✅ LOGIN CHECK
    if (!TOKEN) {

      alert("Login expired");

      return;
    }

    // ✅ USE SELECTED ADDRESS DATA
    const customerName =
      selectedAddress?.name ||
      formData.name;

    const customerPhone =
      selectedAddress?.phone ||
      formData.phone;

    // ✅ VALIDATION
    if (!customerName || !customerPhone) {

      alert(
        "Name and phone are required"
      );

      return;
    }

    // ✅ ADDRESS FIX
    const finalAddress =

      selectedAddress?.address ||

      (
        formData.address1 &&
        formData.city
      )

        ? `${formData.address1}, ${formData.city}`

        : null;

    if (!finalAddress) {

      alert("Please enter address");

      return;
    }

    // ✅ LOCATION CHECK
    if (!coords) {

      alert(
        "Location not detected yet"
      );

      return;
    }

    // 🚀 CREATE ORDER
    const res = await fetch(

      `${API}/checkout`,

      {

        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${TOKEN}`,

        },

        body: JSON.stringify({

          // ✅ FIXED
          name: customerName,

          phone: customerPhone,

          address: finalAddress,

          note:
            formData.landmark || "",
             delivery_instructions:
            formData.landmark || "",

          latitude:
            coords?.lat || 0,

          longitude:
            coords?.lng || 0,

        }),

      }
    );

    const data = await res.json();

    // ❌ API ERROR
    if (!res.ok) {

      console.error(
        "Checkout error:",
        data
      );

      alert(
        data?.error ||
        "Checkout failed"
      );

      return;
    }

    const createdOrders =
      data?.orders_created || [];

    if (createdOrders.length === 0) {

      alert("Order not created");

      return;
    }

    console.log(
      "✅ ALL ORDERS:",
      createdOrders
    );

    // ✅ SAVE ALL SPLIT ORDERS
    localStorage.setItem(
      "success_orders",
      JSON.stringify(createdOrders)
    );

    // ✅ GRAND TOTAL
    const grandTotal =
      createdOrders.reduce(

        (sum, order) =>

          sum + Number(order.amount || 0),

        0
      );

    localStorage.setItem(
      "success_total",
      grandTotal
    );

    // 🚀 NAVIGATE
    navigate("/payment");

  } catch (err) {

    console.error(
      "❌ Checkout crash:",
      err
    );

    alert(
      "Checkout failed. Try again."
    );
  }
};
  /* ================= CART ================= */
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

  const subtotalFromCart = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const savedSummary = JSON.parse(localStorage.getItem("cart_summary")) || {
    subtotal: subtotalFromCart,
    delivery: 0,
    discount: 0,
    total: subtotalFromCart,
  };

  const { subtotal, delivery, discount, total } = savedSummary;

  return (
    <section className="checkout pt_100 pb-80">
      <div className="container">
        <div className="row">

          <div className="col-lg-8">
                        {/* ✅ CREDIT BOX */}
              {creditInfo && (
                <div className="credit_summary_box">

                  <div className="credit_summary_header">
                    <i className="fas fa-wallet"></i>
                    <span>Business Credit</span>
                  </div>

                  <div className="credit_summary_grid">

                    <div>
                      <small>Limit</small>
                      <strong>QAR  {creditInfo.credit_limit}</strong>
                    </div>

                    <div>
                      <small>Used</small>
                      <strong>QAR  {creditInfo.credit_used}</strong>
                    </div>

                    <div>
                      <small>Available</small>
                      <strong className="credit_available">
                        QAR  {creditInfo.credit_available}
                      </strong>
                    </div>

                    <div>
                      <small>Credit Period</small>
                      <strong>{creditInfo.credit_days} days</strong>
                    </div>

                    {creditInfo.next_due_date && (
                      <div>
                        <small>Next Due</small>
                        <strong>
                          {new Date(creditInfo.next_due_date).toLocaleDateString()}
                        </strong>
                      </div>
                    )}

                    {creditInfo.overdue_amount > 0 && (
                      <div className="credit_overdue">
                        Overdue:QAR  {creditInfo.overdue_amount}
                      </div>
                    )}

                  </div>
                </div>
              )}

            <div className="shipping_address_box">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Shipping Address</h3>
              <div className="d-flex gap-2">

    {/* SELECT ADDRESS */}

    <button
      className="add_address_btn"
      onClick={() =>
        setShowAddressPopup(
          !showAddressPopup
        )
      }
    >
     +  Select From Existing Address
    </button>

    {/* ADD ADDRESS */}

    <button

      className="add_address_btn"

      disabled={addressLimitReached}

      onClick={() => {

        if (addressLimitReached) {

          alert(
            "Maximum 5 addresses allowed"
          );

          return;
        }

        setShowForm(!showForm);

        setEditId(null);
      }}

    >

      {addressLimitReached
        ? "Address Limit Reached"
        : "+ Add New Address"}

    </button>

  </div>
              </div>

{/* ================= ADDRESS POPUP ================= */}

{showAddressPopup && (

  <div className="address_popup_overlay">

    <div className="address_popup_modal">

      <div className="popup_header">

        <h4>Select Address</h4>

        <button
          className="popup_close"
          onClick={() =>
            setShowAddressPopup(false)
          }
        >
          ✕
        </button>

      </div>

      {savedAddresses.length === 0 ? (

        <p>No saved addresses found</p>

      ) : (

        savedAddresses.map((addr) => (

          <div
            key={addr.id}
            className={`address_card ${
              selectedId === addr.id
                ? "active"
                : ""
            }`}
          >

            <div className="address_row">

              <div className="address_left">

                <input
                  type="radio"
                  checked={
                    selectedId === addr.id
                  }
                 onChange={() => {

                  // ✅ SELECT MANUAL ADDRESS
                  setSelectedId(addr.id);

                  // ✅ CLOSE POPUP
                  setShowAddressPopup(false);
                   window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });

                }}
                />

                <div className="address_content">

                  <div className="address_header">

                    <h5>{addr.name}</h5>

                    {addr.isDefault && (

                      <span className="default_badge">

                        Default

                      </span>

                    )}

                  </div>

                  <p className="address_text">

                    {addr.address}

                  </p>

                  <small className="phone_text">

                    Phone: {addr.phone}

                  </small>

                </div>

              </div>

             <div className="address_right">

  {addr.id !==
    "current-location" && (
    <>

      {/* EDIT */}

      <button
        onClick={() => {

          setEditId(addr.id);

          setShowForm(true);

          setShowAddressPopup(false);

          setFormData({

            name:
              addr.name || "",

            phone:
              addr.phone || "",

            altPhone:
              addr.unit_no || "",

            pincode:
              addr.zip_code || "",

            address1:
              addr.street || "",

            address2:
              addr.zone || "",

            city:
              addr.city || "",

            state:
              addr.country || "",

            landmark:
              addr.building || "",

            type:
              addr.address_type ||
              "Home",

          });

        }}
      >
        Edit
      </button>

      {/* DELETE */}

      <button
        onClick={() =>
          deleteAddress(
            addr.id
          )
        }
      >
        Delete
      </button>

      {/* MAKE DEFAULT */}

      {/* {!addr.isDefault && (

        <button
          onClick={() =>
            setDefault(
              addr.id
            )
          }
        >
          Make Default
        </button>

      )} */}

      {/* ✅ USE / DISABLE ADDRESS */}

      <button
  className={`use_address_btn ${
    selectedId === addr.id
      ? "active"
      : ""
  }`}
  onClick={() => {

    // ✅ DISABLE MANUAL ADDRESS
    if (
      selectedId === addr.id
    ) {

      // ✅ ACTIVATE CURRENT LOCATION
      setSelectedId(
        "current-location"
      );

    } else {

      // ✅ ACTIVATE MANUAL ADDRESS
      setSelectedId(
        addr.id
      );

    }

    // ✅ AUTO CLOSE POPUP
    setShowAddressPopup(false);

    // ✅ AUTO BACK TO TOP
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }}
>

  {selectedId === addr.id
    ? "Disable Address"
    : "Use This Address"}

</button>

    </>
  )}

</div>

            </div>

          </div>

        ))

      )}

    </div>

  </div>

)}
              {/* ADDRESS LIST */}
              {addresses  .filter(
                  (addr) =>
              addr.id ===
                    "current-location"
                ).map((addr) => (
                <div
                  key={addr.id}
                  className={`address_card ${selectedId === addr.id ?  "active"
      : "inactive_location"}`}
                >
                  <div className="address_row">

                    <div className="address_left">
                      
                      <input
                        type="radio"

                        checked={
                          selectedId ===
                          "current-location"
                        }

                        disabled={
                          selectedId !==
                          "current-location"
                        }

                        onChange={() => {

                          // ✅ ONLY CURRENT LOCATION ACTIVE
                          setSelectedId(
                            "current-location"
                          );

                        }}
                      />

                      <div className="address_content">
                        <div className="address_header">

                        <h5>{addr.name}</h5>

                      </div>

                        <p className="address_text">{addr.address}</p>
                        <small className="phone_text">
                          Phone: {addr.phone}
                        </small>
                      </div>
                    </div>

                    <div className="address_right">

  {addr.id !== "current-location" && (
    <>
     <button
onClick={() => {

  setEditId(addr.id);

  setShowForm(true);

  setFormData({

    name: addr.name || "",

    phone: addr.phone || "",

    altPhone: addr.unit_no || "",

    pincode: addr.zip_code || "",

    address1: addr.street || "",

    address2: addr.zone || "",

    city: addr.city || "",

    state: addr.country || "",

    landmark: addr.building || "",

    type: addr.address_type || "Home",

  });

}}
>
  Edit
</button>

      <button
        onClick={() => deleteAddress(addr.id)}
      >
        Delete
      </button>

      {!addr.isDefault && (
        <button
          onClick={() => setDefault(addr.id)}
        >
          Make Default
        </button>
      )}
    </>
  )}

</div>

                  </div>
                </div>
              ))}



              {/* FORM */}
              <div className={`address_form_wrapper ${showForm ? "open" : ""}`}>
                {showForm && (

                  <form
                      className="checkout_form mt-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        saveAddress();
                      }}
                    >
                    <div className="row">

                      <div className="col-md-6">
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" />
                      </div>

                      <div className="col-md-6">
                        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" />
                      </div>

                      <div className="col-md-6">
                        <input name="altPhone" value={formData.altPhone} onChange={handleChange} placeholder="Alt Phone" />
                      </div>

                      <div className="col-md-6">
                        <input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" />
                      </div>

                      <div className="col-12">
                        <input name="address1" value={formData.address1} onChange={handleChange} placeholder="Address 1" />
                      </div>

                      <div className="col-12">
                        <input name="address2" value={formData.address2} onChange={handleChange} placeholder="Address 2" />
                      </div>

                      <div className="col-md-6">
                        <input name="city" value={formData.city} onChange={handleChange} placeholder="City" />
                      </div>

                      <div className="col-md-6">
                        <input name="state" value={formData.state} onChange={handleChange} placeholder="State" />
                      </div>

                      <div className="col-md-6">
                        <input name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Landmark" />
                      </div>

                      <div className="col-12 mt-3">
                        <label>
                          <input type="radio" name="type" value="Home" onChange={handleChange} /> Home
                        </label>
                        <label>
                          <input type="radio" name="type" value="Office" onChange={handleChange} /> Office
                        </label>
                      </div>

                      <div className="col-12 mt-4">
                        <button type="submit" className="common_btn">
                          Save Address
                        </button>
                      </div>

                    </div>
                  </form>

                )}
              </div>
           
              {/* DELIVERY INSTRUCTIONS */}
              <div className="mt-4">

                <label>
                  Delivery Instructions
                </label>

                <textarea
                  className="address_card"
                  rows="3"
                  placeholder="Call before delivery, leave at gate..."
                  value={formData.landmark}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      landmark: e.target.value,
                    })
                  }
                />

              </div>

              {/* PROCEED BUTTON */}
              <button
                onClick={handleSubmit}
                className="common_btn mt-3"
              >
                Proceed
              </button>

            {/* {creditInfo?.overdue_amount > 0 && (
              <p style={{ color: "red", marginTop: "10px" }}>
                ⚠️ Your account has overdue amount of QAR {creditInfo.overdue_amount}.  
                Please clear dues to use credit.
              </p>
            )} */}
            </div>

          </div>

          {/* CART */}
           <div className="col-lg-4 col-md-8">
            <div className="cart_sidebar">
              <h3>Total Cart ({cartItems.length})</h3>
              <div className="cart_sidebar_info">
                <h4>Subtotal : <span>QAR {subtotal.toFixed(2)}</span></h4>
                <p>Delivery : <span>QAR {delivery}</span></p>
                <p>Discount : <span>-QAR {discount}</span></p>
                <h5>Total : <span>QAR {total.toFixed(2)}</span></h5>

                
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CheckItems;

