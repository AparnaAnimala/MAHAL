// import React, { useState, useEffect } from "react";
// import "../css/menuMaster.css";

// export default function MenuMasterForm(props) {
//   const [form, setForm] = useState({
//     name: "",
//     category: "",
//     price: "",
//     portion_size: "",
//     description: "",
//     status: true,
//   });

//   const [image, setImage] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((p) => ({ ...p, [name]: value }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (!["image/jpeg", "image/png"].includes(file.type)) {
//       alert("Only JPG or PNG allowed");
//       return;
//     }

//     if (file.size > 5 * 1024 * 1024) {
//       alert("Max image size is 5MB");
//       return;
//     }

//     setImage(file);
//   };

//   useEffect(() => {
//     if (!image) {
//       setPreview(null);
//       return;
//     }

//     const url = URL.createObjectURL(image);
//     setPreview(url);

//     return () => URL.revokeObjectURL(url);
//   }, [image]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!form.name || !form.category || !form.price || !form.portion_size) {
//       alert("Please fill all required fields");
//       return;
//     }

//     const formData = new FormData();
//     Object.entries(form).forEach(([k, v]) => formData.append(k, v));
//     if (image) formData.append("image", image);

//     try {
//       setLoading(true);
//       const res = await fetch("http://192.168.2.9:5000/api/menu-items", {
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) throw new Error("Failed");

//       alert("Menu item saved ✅");
//       setForm({
//         name: "",
//         category: "",
//         price: "",
//         portion_size: "",
//         description: "",
//         status: true,
//       });
//       setImage(null);
//       setPreview(null);
//     } catch (err) {
//       console.error(err);
//       alert("Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="mm-page">
//       <form
//         className="mm-card"
//         onSubmit={handleSubmit}
//         encType="multipart/form-data"
//       >
//         <div className="mm-header">Add New Menu Item</div>

//         <div className="mm-grid">
//           {/* LEFT */}
//           <div>
//             <label className="mm-label">Menu Item Name *</label>
//             <input
//               className="mm-input"
//               name="name"
//               value={form.name}
//               onChange={handleChange}
//               placeholder="Enter dish name"
//             />

//             <label className="mm-label">Category *</label>
//             <select
//               className="mm-input"
//               name="category"
//               value={form.category}
//               onChange={handleChange}
//             >
//               <option value="">Select</option>
//               <option>Main Course</option>
//               <option>Starter</option>
//               <option>Dessert</option>
//               <option>Beverage</option>
//             </select>

//             <div className="mm-row">
//               <div>
//                 <label className="mm-label">Sale Price *</label>
//                 <input
//                   className="mm-input"
//                   type="number"
//                   name="price"
//                   value={form.price}
//                   onChange={handleChange}
//                   placeholder="QAR "
//                 />
//               </div>

//               <div>
//                 <label className="mm-label">Portion Size *</label>
//                 <select
//                   className="mm-input"
//                   name="portion_size"
//                   value={form.portion_size}
//                   onChange={handleChange}
//                 >
//                   <option value="">Select</option>
//                   <option>1 Plate</option>
//                   <option>Half</option>
//                   <option>Full</option>
//                 </select>
//               </div>
//             </div>

//             <label className="mm-label">Description</label>
//             <textarea
//               className="mm-textarea"
//               name="description"
//               value={form.description}
//               onChange={handleChange}
//               placeholder="Enter dish description"
//             />

//             <div className="mm-status">status
//               <label>
//                 <input
//                   type="radio"
//                   checked={form.status === true}
//                   onChange={() =>
//                     setForm((p) => ({ ...p, status: true }))
//                   }
//                 />
//                 Active
//               </label>
//               <label>
//                 <input
//                   type="radio"
//                   checked={form.status === false}
//                   onChange={() =>
//                     setForm((p) => ({ ...p, status: false }))
//                   }
//                 />
//                 Inactive
//               </label>
//             </div>
//           </div>

//           {/* RIGHT */}
//           <div className="mm-upload-box">
//             <label className="mm-upload-label">
//               {preview ? (
//                 <img src={preview} alt="preview" className="mm-preview" />
//               ) : (
//                 <>
//                   <div className="mm-upload-icon">📷</div>
//                   <p>Upload Photo</p>
//                   <span>JPG, PNG – Max 5MB</span>
//                 </>
//               )}
//               <input
//                 type="file"
//                 accept="image/png, image/jpeg"
//                 onChange={handleImageChange}
//                 hidden
//               />
//             </label>
//           </div>
//         </div>

//         <button className="mm-btn" disabled={loading}>
//           {loading ? "Saving..." : "Save Menu Item"}
//         </button>
//       </form>
//     </div>
//   );
// }