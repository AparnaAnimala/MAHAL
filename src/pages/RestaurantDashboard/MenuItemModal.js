// import React, { useEffect, useState } from "react";

// const MenuItemModal = ({ show, onClose, onSave, editingItem }) => {
//   const [form, setForm] = useState({
//     name: "",
//     category: "",
//     price: "",
//     imagePreview: "",
//     status: true,
//   });

//   useEffect(() => {
//     if (editingItem) {
//       setForm({
//         name: editingItem.name || "",
//         category: editingItem.category || "",
//         price: editingItem.price || "",
//         imagePreview: editingItem.image || "",
//         status: editingItem.status ?? true,
//       });
//     }
//   }, [editingItem?.id]);

//   if (!show) return null;

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;

//     if (files) {
//       const file = files[0];
//       setForm((prev) => ({
//         ...prev,
//         imagePreview: URL.createObjectURL(file),
//       }));
//       return;
//     }

//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = () => {
//     onSave({
//       name: form.name,
//       category: form.category,
//       price: form.price,
//       status: form.status,
//       image:
//         form.imagePreview || "/images/food-placeholder.png",
//     });
//   };

//   return (
//   <div className="modal_overlay">
//   <div className="modal_card_v2">

//     {/* HEADER */}
//     <div className="modal_header">
//       <h3>
//         <i className="fa fa-utensils"></i>
//         {editingItem ? "Edit Item" : "Add New Item"}
//       </h3>
//       <button onClick={onClose}>×</button>
//     </div>

//     {/* FORM */}
//     <div className="modal_body">

//       <label>Item Name</label>
//       <input
//         name="name"
//         value={form.name}
//         onChange={handleChange}
//         placeholder="Enter item name"
//       />

//       <label>Category</label>
//       <select
//         name="category"
//         value={form.category}
//         onChange={handleChange}
//       >
//         <option value="">Select Category</option>
//         <option>Main Course</option>
//         <option>Rice</option>
//       </select>

//       <label>Price (QAR )</label>
//       <input
//         type="number"
//         name="price"
//         value={form.price}
//         onChange={handleChange}
//         placeholder="Enter price"
//       />

//       {/* IMAGE UPLOAD */}
//       <label>Item Image</label>
//       <div className="image_upload_box">
//         <input type="file" accept="image/*" onChange={handleChange} />
//         {form.imagePreview ? (
//           <img src={form.imagePreview} alt="preview" />
//         ) : (
//           <span>Click to upload image</span>
//         )}
//       </div>

//     </div>

//     {/* FOOTER */}
//     <div className="modal_footer">
//       <button className="btn_cancel" onClick={onClose}>
//         Cancel
//       </button>
//       <button className="btn_save" onClick={handleSubmit}>
//         Save Item
//       </button>
//     </div>
//   </div>
// </div>

//   );
// };

// export default MenuItemModal;






// import React, { useEffect, useState } from "react";

// const MenuItemModal = ({ show, onClose, onSave, editingItem }) => {
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

//   useEffect(() => {
//     if (editingItem) {
//       setForm({
//         name: editingItem.name,
//         category: editingItem.category,
//         price: editingItem.price,
//         portion_size: editingItem.portion_size,
//         description: editingItem.description || "",
//         status: editingItem.status,
//       });
//       setPreview(editingItem.image);
//       setImage(null);
//     } else {
//       setForm({
//         name: "",
//         category: "",
//         price: "",
//         portion_size: "",
//         description: "",
//         status: true,
//       });
//       setPreview(null);
//       setImage(null);
//     }
//   }, [editingItem, show]);

//   if (!show) return null;

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;

//     if (files?.length) {
//       const file = files[0];
//       if (!file.type.startsWith("image/")) {
//         alert("Please upload a valid image");
//         return;
//       }
//       setImage(file);
//       setPreview(URL.createObjectURL(file));
//       return;
//     }

//     setForm((p) => ({ ...p, [name]: value }));
//   };

//   const handleSubmit = () => {
//     if (!form.name || !form.category || !form.price || !form.portion_size) {
//       alert("Fill all required fields");
//       return;
//     }

//     const fd = new FormData();
//     Object.entries(form).forEach(([k, v]) => fd.append(k, v));
//     if (image) fd.append("image", image);

//     onSave(fd);
//   };

//   return (
//     <div className="modal_overlay">
//       <div className="order_modal">

//         {/* HEADER */}
//         <div className="modal_header">
//           <h3>
//             <i className="fa fa-utensils"></i>
//             {editingItem ? "Edit Item" : "Add New Item"}
//           </h3>
//           <button onClick={onClose}>✖</button>
//         </div>

//         {/* ACTION BAR */}
//         <div className="modal_actions">
//           <span className="muted">
//             {editingItem ? "Update existing item" : "Create a new menu item"}
//           </span>
//         </div>

//         {/* BASIC INFO */}
//         <div className="card">
//           <h5>Item Details</h5>

//           <div className="info_grid">
//             <div>
//               <b>Item Name</b>
//               <input
//                 name="name"
//                 value={form.name}
//                 onChange={handleChange}
//               />
//             </div>

//             <div>
//               <b>Category</b>
//               <select
//                 name="category"
//                 value={form.category}
//                 onChange={handleChange}
//               >
//                 <option value="">Select</option>
//                 <option>Main Course</option>
//                 <option>Rice</option>
//                 <option>Starter</option>
//                 <option>Dessert</option>
//               </select>
//             </div>

//             <div>
//               <b>Price (QAR )</b>
//               <input
//                 type="number"
//                 name="price"
//                 value={form.price}
//                 onChange={handleChange}
//               />
//             </div>

//             <div>
//               <b>Portion Size</b>
//               <select
//                 name="portion_size"
//                 value={form.portion_size}
//                 onChange={handleChange}
//               >
//                 <option value="">Select</option>
//                 <option>1 Plate</option>
//                 <option>Half</option>
//                 <option>Full</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* DESCRIPTION */}
//         <div className="card">
//           <h5>Description</h5>
//           <textarea
//             rows="3"
//             name="description"
//             value={form.description}
//             onChange={handleChange}
//           />
//         </div>

//         {/* IMAGE */}
//         <div className="card">
//           <h5>Item Image</h5>
//           <div className="image_upload_box">
//             <input type="file" accept="image/*" onChange={handleChange} />
//             {preview ? (
//               <img src={preview} alt="preview" />
//             ) : (
//               <span>Click to upload image</span>
//             )}
//           </div>
//         </div>

//         {/* FOOTER */}
//         <div className="modal_footer">
//           <button className="btn cancel" onClick={onClose}>
//             Cancel
//           </button>
//           <button className="btn accept" onClick={handleSubmit}>
//             💾 Save Item
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default MenuItemModal;



     //sultan's below



// import React, { useEffect, useState } from "react";

// const MenuItemModal = ({ show, onClose, onSave, editingItem }) => {
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

//   useEffect(() => {
//     if (editingItem) {
//       setForm({
//         name: editingItem.name,
//         category: editingItem.category,
//         price: editingItem.price,
//         portion_size: editingItem.portion_size,
//         description: editingItem.description || "",
//         status: editingItem.status,
//       });
//       setPreview(editingItem.image);
//       setImage(null);
//     } else {
//       setForm({
//         name: "",
//         category: "",
//         price: "",
//         portion_size: "",
//         description: "",
//         status: true,
//       });
//       setPreview(null);
//       setImage(null);
//     }
//   }, [editingItem, show]);

//   if (!show) return null;

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;

//     if (files?.length) {
//       const file = files[0];
//       if (!file.type.startsWith("image/")) {
//         alert("Please upload a valid image");
//         return;
//       }
//       setImage(file);
//       setPreview(URL.createObjectURL(file));
//       return;
//     }

//     setForm((p) => ({ ...p, [name]: value }));
//   };

//   const handleSubmit = () => {
//     if (!form.name || !form.category || !form.price || !form.portion_size) {
//       alert("Fill all required fields");
//       return;
//     }

//     const fd = new FormData();
//     Object.entries(form).forEach(([k, v]) => fd.append(k, v));
//     if (image) fd.append("image", image);

//     onSave(fd);
//   };

//  return (
//   <div className="modal_overlay">
//     <div className="modal_card_v2">

//       {/* HEADER */}
//       <div className="modal_header">
//         <h3>
//           <i className="fa fa-utensils"></i>
//           {editingItem ? "Edit Item" : "Add New Item"}
//         </h3>
//         <button onClick={onClose}>×</button>
//       </div>

//       {/* FORM */}
//       <div className="modal_body">

//         <div>
//           <label>Item Name</label>
//           <input
//             name="name"
//             value={form.name}
//             onChange={handleChange}
//             placeholder="Enter item name"
//           />
//         </div>

//         <div>
//           <label>Category</label>
//           <select
//             name="category"
//             value={form.category}
//             onChange={handleChange}
//           >
//             <option value="">Select</option>
//             <option>Main Course</option>
//             <option>Rice</option>
//             <option>Starter</option>
//             <option>Dessert</option>
//           </select>
//         </div>

//         <div>
//           <label>Price (QAR )</label>
//           <input
//             type="number"
//             name="price"
//             value={form.price}
//             onChange={handleChange}
//             placeholder="Enter price"
//           />
//         </div>

//         <div>
//           <label>Portion Size</label>
//           <select
//             name="portion_size"
//             value={form.portion_size}
//             onChange={handleChange}
//           >
//             <option value="">Select</option>
//             <option>1 Plate</option>
//             <option>Half</option>
//             <option>Full</option>
//           </select>
//         </div>

//         <div>
//           <label>Description</label>
//           <textarea
//             rows="3"
//             name="description"
//             value={form.description}
//             onChange={handleChange}
//           />
//         </div>

//         <div>
//           <label>Item Image</label>
//           <div className="image_upload_box">
//             <input type="file" accept="image/*" onChange={handleChange} />
//             {preview ? (
//               <img src={preview} alt="preview" />
//             ) : (
//               <span>Click to upload image</span>
//             )}
//           </div>
//         </div>

//       </div>

//       {/* FOOTER */}
//       <div className="modal_footer">
//         <button className="btn_cancel" onClick={onClose}>
//           Cancel
//         </button>

//         <button className="btn_save" onClick={handleSubmit}>
//           Save Item
//         </button>
//       </div>

//     </div>
//   </div>
// );
// };

// export default MenuItemModal;

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const MenuItemModal = ({ show, onClose, onSave, editingItem }) => {
  const { t, i18n } = useTranslation();

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    portion_size: "",
    description: "",
    status: true,
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (editingItem) {
      setForm({
        name: editingItem.name,
        category: editingItem.category,
        price: editingItem.price,
        portion_size: editingItem.portion_size,
        description: editingItem.description || "",
        status: editingItem.status,
      });
      setPreview(editingItem.image);
      setImage(null);
    } else {
      setForm({
        name: "",
        category: "",
        price: "",
        portion_size: "",
        description: "",
        status: true,
      });
      setPreview(null);
      setImage(null);
    }
  }, [editingItem, show]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files?.length) {
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        alert(t("pleaseUploadValidImage"));
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.category || !form.price || !form.portion_size) {
      alert(t("fillAllRequiredFields"));
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append("image", image);

    onSave(fd);
  };

  return (
    <div
      className="modal_overlay"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="modal_card_v2">

        {/* HEADER */}
        <div className="modal_header">
          <h3>
            <i className="fa fa-utensils"></i>
            {editingItem ? t("editItem") : t("addNewItem")}
          </h3>
          <button onClick={onClose}>×</button>
        </div>

        {/* FORM */}
        <div className="modal_body">

          <div>
            <label>{t("itemName")}</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={t("enterItemName")}
            />
          </div>

          <div>
            <label>{t("category")}</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">{t("select")}</option>
              <option>Main Course</option>
              <option>Rice</option>
              <option>Starter</option>
              <option>Dessert</option>
            </select>
          </div>

          <div>
            <label>
              {t("price")} ({i18n.language === "ar" ? "ر.ق" : "QAR"})
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder={t("enterPrice")}
            />
          </div>

          <div>
            <label>{t("portionSize")}</label>
            <select
              name="portion_size"
              value={form.portion_size}
              onChange={handleChange}
            >
              <option value="">{t("select")}</option>
              <option>1 Plate</option>
              <option>Half</option>
              <option>Full</option>
            </select>
          </div>

          <div>
            <label>{t("description")}</label>
            <textarea
              rows="3"
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>{t("itemImage")}</label>
            <div className="image_upload_box">
              <input type="file" accept="image/*" onChange={handleChange} />
              {preview ? (
                <img src={preview} alt="preview" />
              ) : (
                <span>{t("clickToUploadImage")}</span>
              )}
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="modal_footer">
          <button className="btn_cancel" onClick={onClose}>
            {t("cancel")}
          </button>

          <button className="btn_save" onClick={handleSubmit}>
            {t("saveItem")}
          </button>
        </div>

      </div>
    </div>
  );
};

export default MenuItemModal;