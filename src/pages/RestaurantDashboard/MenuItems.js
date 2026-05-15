// import React, { useState } from "react";
// import MenuItemModal from "./MenuItemModal";

// const MenuItems = () => {
//   const [items, setItems] = useState([
//     {
//       id: 1,
//       name: "Chicken Biryani",
//       category: "Main Course",
//       price: 220,
//       status: true,
//       image: "/images/food-placeholder.png",
//     },
//     {
//       id: 2,
//       name: "Veg Fried Rice",
//       category: "Rice",
//       price: 150,
//       status: false,
//       image: "/images/food-placeholder.png",
//     },
//   ]);

//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("All");
//   const [selected, setSelected] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);

//   /* FILTER */
//   const filteredItems = items.filter(
//     (item) =>
//       item.name.toLowerCase().includes(search.toLowerCase()) &&
//       (category === "All" || item.category === category),
//   );

//   /* TOGGLE STATUS */
//   const toggleStatus = (id) => {
//     setItems((prev) =>
//       prev.map((i) => (i.id === id ? { ...i, status: !i.status } : i)),
//     );
//   };

//   /* SAVE ITEM */
//   const handleSave = (data) => {
//     if (editingItem) {
//       setItems((prev) =>
//         prev.map((i) => (i.id === editingItem.id ? { ...i, ...data } : i)),
//       );
//     } else {
//       setItems((prev) => [...prev, { ...data, id: Date.now() }]);
//     }
//     setShowModal(false);
//     setEditingItem(null);
//   };

//   /* BULK ENABLE / DISABLE */
//   const bulkUpdate = (status) => {
//     setItems((prev) =>
//       prev.map((i) => (selected.includes(i.id) ? { ...i, status } : i)),
//     );
//     setSelected([]);
//   };

//   return (
//     <div className="dashboard_page">
        
//       {/* HEADER */}
//       <div className="page_header">
//         <div>
//           <h2>Menu Items</h2>
//           <p>Manage your restaurant food items</p>
//         </div>

//         <button className="btn_add_item_v2" onClick={() => setShowModal(true)}>
//           <i className="fa fa-plus"></i>
//           <span>Add Item</span>
//         </button>
//       </div>

//       {/* FILTER */}
//       <div className="card filter_bar">
//         <div className="filter_row">
//           <input
//             className="form-control search_input"
//             placeholder="Search item name"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />

//           <select
//             className="form-select status_select"
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//           >
//             <option value="All">All Categories</option>
//             <option value="Main Course">Main Course</option>
//             <option value="Rice">Rice</option>
//           </select>
//         </div>
//       </div>

     
//       {/* BULK ACTION BAR */}
// {selected.length > 0 && (
//   <div className="bulk_action_bar">
//     <div className="bulk_left">
//       <i className="fa fa-check-circle"></i>
//       <span>
//         <b>{selected.length}</b> item
//         {selected.length > 1 && "s"} selected
//       </span>
//     </div>

//     <div className="bulk_actions">
//       <button
//         className="bulk_btn enable"
//         onClick={() => bulkUpdate(true)}
//       >
//         <i className="fa fa-toggle-on"></i>
//         Enable
//       </button>

//       <button
//         className="bulk_btn disable"
//         onClick={() => bulkUpdate(false)}
//       >
//         <i className="fa fa-ban"></i>
//         Disable
//       </button>
//     </div>
//   </div>
// )}


//       {/* TABLE */}
//       <div className="card mt-3">
//         <table className="table menu_table">
//           <thead>
//             <tr>
//               <th>
//                 <input
//                   type="checkbox"
//                   checked={
//                     selected.length === filteredItems.length &&
//                     filteredItems.length > 0
//                   }
//                   onChange={(e) =>
//                     setSelected(
//                       e.target.checked ? filteredItems.map((i) => i.id) : [],
//                     )
//                   }
//                 />
//               </th>
//               <th>Item</th>
//               <th>Item Images</th>
//               <th>Category</th>
//               <th>Price</th>
//               <th>Status</th>
//               <th>Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {filteredItems.length === 0 ? (
//               <tr>
//                 <td colSpan="6" className="text-center">
//                   No items found
//                 </td>
//               </tr>
//             ) : (
//               filteredItems.map((item) => (
//                 <tr key={item.id}>
//                   <td>
//                     <input
//                       type="checkbox"
//                       checked={selected.includes(item.id)}
//                       onChange={() =>
//                         setSelected((prev) =>
//                           prev.includes(item.id)
//                             ? prev.filter((id) => id !== item.id)
//                             : [...prev, item.id],
//                         )
//                       }
//                     />
//                   </td>
//                     <td>
//                     <div className="item_cell">
                      
//                       {item.name}
//                     </div>
//                   </td>
//                   <td>
//                     <div className="item_cell">
//                       <img
//                         src={item.image}
//                         className="item_img"
//                         alt={item.name}
//                       />
                       
//                     </div>
//                   </td>

//                   <td>{item.category}</td>
//                   <td>QAR {item.price}</td>

//                   <td>
//                     <span
//                       className={`status_badge ${
//                         item.status ? "success" : "cancelled"
//                       }`}
//                     >
//                       {item.status ? "Available" : "Unavailable"}
//                     </span>
//                   </td>

//                   <td>
//   <div className="action_icons">
//     <button
//       className="icon_btn edit"
//       onClick={() => {
//         setEditingItem(item);
//         setShowModal(true);
//       }}
//     >
//       <i className="fa fa-pen"></i>
//     </button>

//     <button
//       className={`icon_btn ${item.status ? "disable" : "enable"}`}
//       onClick={() => toggleStatus(item.id)}
//     >
//       <i className={`fa ${item.status ? "fa-eye-slash" : "fa-eye"}`}></i>
//     </button>
//   </div>
// </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* MODAL */}
//       <MenuItemModal
//         show={showModal}
//         onClose={() => setShowModal(false)}
//         onSave={handleSave}
//         editingItem={editingItem}
//       />
//     </div>
//   );
// };

// export default MenuItems;





// import React, { useEffect, useState } from "react";
// import MenuItemModal from "./MenuItemModal";
// import { useTranslation } from "react-i18next";

// const API = "http://192.168.2.9:5000/api/menu-items";

// const MenuItems = () => {
//   const [items, setItems] = useState([]);
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("All");
//   const [selected, setSelected] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);
//   const { t, i18n } = useTranslation();

//   // 🔥 GET RESTAURANT ID (from login)
//   const restaurantId = localStorage.getItem("linked_id");

//   /* ================= LOAD MENU ITEMS ================= */
//   const loadItems = async () => {
//     if (!restaurantId) return;

//     const res = await fetch(
//       `${API}?restaurant_id=${restaurantId}`
//     );
//     const data = await res.json();
//     setItems(data || []);
//   };

//   useEffect(() => {
//     loadItems();
//   }, [restaurantId]);

//   /* ================= FILTER ================= */
//   const filteredItems = items.filter(
//     (item) =>
//       item.name.toLowerCase().includes(search.toLowerCase()) &&
//       (category === "All" || item.category === category)
//   );

//   /* ================= TOGGLE STATUS ================= */
//   const toggleStatus = async (item) => {
//     const fd = new FormData();

//     fd.append("restaurant_id", restaurantId);
//     fd.append("name", item.name);
//     fd.append("category", item.category);
//     fd.append("price", item.price);
//     fd.append("portion_size", item.portion_size);
//     fd.append("description", item.description || "");
//     fd.append("status", (!item.status).toString());

//     await fetch(`${API}/${item.id}`, {
//       method: "PUT",
//       body: fd,
//     });

//     loadItems();
//   };

//   /* ================= SAVE (ADD / EDIT) ================= */
//   const handleSave = async (formData) => {
//     formData.append("restaurant_id", restaurantId);

//     const url = editingItem ? `${API}/${editingItem.id}` : API;
//     const method = editingItem ? "PUT" : "POST";

//     const res = await fetch(url, {
//       method,
//       body: formData,
//     });

//     if (!res.ok) {
//       alert("Failed to save item");
//       return;
//     }

//     setShowModal(false);
//     setEditingItem(null);
//     loadItems();
//   };

//   /* ================= BULK UPDATE ================= */
//   const bulkUpdate = async (status) => {
//     for (const id of selected) {
//       const item = items.find((i) => i.id === id);
//       if (!item) continue;

//       const fd = new FormData();
//       fd.append("restaurant_id", restaurantId);
//       fd.append("name", item.name);
//       fd.append("category", item.category);
//       fd.append("price", item.price);
//       fd.append("portion_size", item.portion_size);
//       fd.append("description", item.description || "");
//       fd.append("status", status.toString());

//       await fetch(`${API}/${item.id}`, {
//         method: "PUT",
//         body: fd,
//       });
//     }

//     setSelected([]);
//     loadItems();
//   };

//   return (
//     <div
//   className="dashboard_page"
//   dir={i18n.language === "ar" ? "rtl" : "ltr"}
// >

//       {/* HEADER */}
//       <div className="page_header">
//         <div>
//           <h2>{t("menuItems")}</h2>
//           <p>{t("manageRestaurantMenu")}</p>
//         </div>

//         <button
//           className="btn_add_item_v2"
//           onClick={() => setShowModal(true)}
//         >
//           <i className="fa fa-plus"></i>
//           <span>{t("addItem")}</span>
//         </button>
//       </div>

//       {/* FILTER */}
//       <div className="card filter_bar">
//         <div className="filter_row">
//           <input
//             className="form-control search_input"
//             placeholder={t("searchItemName")}
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />

//           <select
//             className="form-select status_select"
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//           >
//             <option value="All">{t("allCategories")}</option>
//             <option value="Main Course">{t("mainCourse")}</option>
//             <option value="Rice">{t("rice")}</option>
//             <option value="Starters">{t("starters")}</option>
//             <option value="Dessert">{t("dessert")}</option>
//           </select>
//         </div>
//       </div>

//       {/* BULK ACTION BAR */}
//       {selected.length > 0 && (
//         <div className="bulk_action_bar">
//           <div className="bulk_left">
//             <i className="fa fa-check-circle"></i>
//             <span>
//               <b>{selected.length}</b> {t("item")}
//               {selected.length > 1 && ` ${t("items")}`} {t("selected")}
//             </span>
//           </div>

//           <div className="bulk_actions">
//             <button
//               className="bulk_btn enable"
//               onClick={() => bulkUpdate(true)}
//             >
//               <i className="fa fa-toggle-on"></i>
//               {t("enable")}
//             </button>

//             <button
//               className="bulk_btn disable"
//               onClick={() => bulkUpdate(false)}
//             >
//               <i className="fa fa-ban"></i>
//               {t("disable")}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* TABLE */}
//       <div className="card mt-3">
//         <table className="table menu_table">
//           <thead>
//             <tr>
//               <th>
//                 <input
//                   type="checkbox"
//                   checked={
//                     selected.length === filteredItems.length &&
//                     filteredItems.length > 0
//                   }
//                   onChange={(e) =>
//                     setSelected(
//                       e.target.checked
//                         ? filteredItems.map((i) => i.id)
//                         : []
//                     )
//                   }
//                 />
//               </th>
//                 <th>{t("item")}</th>
//                 <th>{t("image")}</th>
//                 <th>{t("category")}</th>
//                 <th>{t("price")}</th>
//                 <th>{t("status")}</th>
//                 <th>{t("action")}</th>
//             </tr>
//           </thead>

//           <tbody>
//             {filteredItems.length === 0 ? (
//               <tr>
//                 <td colSpan="7" className="text-center">
//                   {t("noItemsFound")}
//                 </td>
//               </tr>
//             ) : (
//               filteredItems.map((item) => (
//                 <tr key={item.id}>
//                   <td>
//                     <input
//                       type="checkbox"
//                       checked={selected.includes(item.id)}
//                       onChange={() =>
//                         setSelected((prev) =>
//                           prev.includes(item.id)
//                             ? prev.filter((id) => id !== item.id)
//                             : [...prev, item.id]
//                         )
//                       }
//                     />
//                   </td>

//                   <td>{item.name}</td>

//                   <td>
//                     {item.image && (
//                       <img
//                         src={item.image}
//                         alt={item.name}
//                         className="item_img"
//                       />
//                     )}
//                   </td>

//                   <td>{item.category}</td>
//                   <td>
//                       {i18n.language === "ar" ? "ر.ق" : "QAR"} {item.price}
//                     </td>

//                   <td>
//                     <span
//                       className={`status_badge ${
//                         item.status ? "success" : "cancelled"
//                       }`}
//                     >
//                       {item.status ? t("available") : t("unavailable")}
//                     </span>
//                   </td>

//                   <td>
//                     <div className="action_icons">
//                       <button
//                         className="icon_btn edit"
//                         onClick={() => {
//                           setEditingItem(item);
//                           setShowModal(true);
//                         }}
//                       >
//                         <i className="fa fa-pen"></i>
//                       </button>

//                       <button
//                         className={`icon_btn ${
//                           item.status ? "disable" : "enable"
//                         }`}
//                         onClick={() => toggleStatus(item)}
//                       >
//                         <i
//                           className={`fa ${
//                             item.status ? "fa-eye-slash" : "fa-eye"
//                           }`}
//                         ></i>
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* MODAL */}
//       <MenuItemModal
//         show={showModal}
//         onClose={() => {
//           setShowModal(false);
//           setEditingItem(null);
//         }}
//         onSave={handleSave}
//         editingItem={editingItem}
//       />
//     </div>
//   );
// };

// export default MenuItems;


import React, { useEffect, useState } from "react";
import MenuItemModal from "./MenuItemModal";
import { useTranslation } from "react-i18next";

const API = "http://192.168.2.9:5000/api/menu-items";

const MenuItems = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { t, i18n } = useTranslation();

  const restaurantId = localStorage.getItem("linked_id");

  /* ================= CATEGORY LABEL ================= */
const getCategoryLabel = (cat) => {
  const value = String(cat || "").trim().toLowerCase();

  switch (value) {
    case "main course":
      return t("mainCourse");

    case "rice":
      return t("rice");

    case "starter":
    case "starters":
      return t("starters");

    case "dessert":
    case "desserts":
      return t("dessert");

    default:
      return cat;
  }
};

  /* ================= LOAD MENU ITEMS ================= */
  const loadItems = async () => {
    if (!restaurantId) return;

    const res = await fetch(
      `${API}?restaurant_id=${restaurantId}&lang=${i18n.language}`
    );
    const data = await res.json();
    setItems(data || []);
  };

 useEffect(() => {
  loadItems();
}, [restaurantId, i18n.language]);

  /* ================= FILTER ================= */
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All" || item.category === category)
  );

  /* ================= TOGGLE STATUS ================= */
  const toggleStatus = async (item) => {
    const fd = new FormData();

    fd.append("restaurant_id", restaurantId);
    fd.append("name", item.name);
    fd.append("category", item.category);
    fd.append("price", item.price);
    fd.append("portion_size", item.portion_size);
    fd.append("description", item.description || "");
    fd.append("status", (!item.status).toString());

    await fetch(`${API}/${item.id}`, {
      method: "PUT",
      body: fd,
    });

    loadItems();
  };

  /* ================= SAVE (ADD / EDIT) ================= */
  const handleSave = async (formData) => {
    formData.append("restaurant_id", restaurantId);

    const url = editingItem ? `${API}/${editingItem.id}` : API;
    const method = editingItem ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      body: formData,
    });

    if (!res.ok) {
      alert("Failed to save item");
      return;
    }

    setShowModal(false);
    setEditingItem(null);
    loadItems();
  };

  /* ================= BULK UPDATE ================= */
  const bulkUpdate = async (status) => {
    for (const id of selected) {
      const item = items.find((i) => i.id === id);
      if (!item) continue;

      const fd = new FormData();
      fd.append("restaurant_id", restaurantId);
      fd.append("name", item.name);
      fd.append("category", item.category);
      fd.append("price", item.price);
      fd.append("portion_size", item.portion_size);
      fd.append("description", item.description || "");
      fd.append("status", status.toString());

      await fetch(`${API}/${item.id}`, {
        method: "PUT",
        body: fd,
      });
    }

    setSelected([]);
    loadItems();
  };

  return (
    <div
      className="dashboard_page"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >

      {/* HEADER */}
      <div className="page_header">
        <div>
          <h2>{t("menuItems")}</h2>
          <p>{t("manageRestaurantMenu")}</p>
        </div>

        <button
          className="btn_add_item_v2"
          onClick={() => setShowModal(true)}
        >
          <i className="fa fa-plus"></i>
          <span>{t("addItem")}</span>
        </button>
      </div>

      {/* FILTER */}
      <div className="card filter_bar">
        <div className="filter_row">
          <input
            className="form-control search_input"
            placeholder={t("searchItemName")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="form-select status_select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">{t("allCategories")}</option>
            <option value="Main Course">{t("mainCourse")}</option>
            <option value="Rice">{t("rice")}</option>
            <option value="Starters">{t("starters")}</option>
            <option value="Dessert">{t("dessert")}</option>
          </select>
        </div>
      </div>

      {/* BULK ACTION BAR */}
      {selected.length > 0 && (
        <div className="bulk_action_bar">
          <div className="bulk_left">
            <i className="fa fa-check-circle"></i>
            <span>
              <b>{selected.length}</b> {t("item")}
              {selected.length > 1 && ` ${t("items")}`} {t("selected")}
            </span>
          </div>

          <div className="bulk_actions">
            <button
              className="bulk_btn enable"
              onClick={() => bulkUpdate(true)}
            >
              <i className="fa fa-toggle-on"></i>
              {t("enable")}
            </button>

            <button
              className="bulk_btn disable"
              onClick={() => bulkUpdate(false)}
            >
              <i className="fa fa-ban"></i>
              {t("disable")}
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="card mt-3">
        <table className="table menu_table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selected.length === filteredItems.length &&
                    filteredItems.length > 0
                  }
                  onChange={(e) =>
                    setSelected(
                      e.target.checked
                        ? filteredItems.map((i) => i.id)
                        : []
                    )
                  }
                />
              </th>
              <th>{t("item")}</th>
              <th>{t("image")}</th>
              <th>{t("category")}</th>
              <th>{t("price")}</th>
              <th>{t("status")}</th>
              <th>{t("action")}</th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  {t("noItemsFound")}
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(item.id)}
                      onChange={() =>
                        setSelected((prev) =>
                          prev.includes(item.id)
                            ? prev.filter((id) => id !== item.id)
                            : [...prev, item.id]
                        )
                      }
                    />
                  </td>

                  <td>{item.name}</td>

                  <td>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="item_img"
                      />
                    )}
                  </td>

                  <td>{getCategoryLabel(item.category)}</td>

                  <td>
                    {i18n.language === "ar" ? "ر.ق" : "QAR"} {item.price}
                  </td>

                  <td>
                    <span
                      className={`status_badge ${
                        item.status ? "success" : "cancelled"
                      }`}
                    >
                      {item.status ? t("available") : t("unavailable")}
                    </span>
                  </td>

                  <td>
                    <div className="action_icons">
                      <button
                        className="icon_btn edit"
                        onClick={() => {
                          setEditingItem(item);
                          setShowModal(true);
                        }}
                      >
                        <i className="fa fa-pen"></i>
                      </button>

                      <button
                        className={`icon_btn ${
                          item.status ? "disable" : "enable"
                        }`}
                        onClick={() => toggleStatus(item)}
                      >
                        <i
                          className={`fa ${
                            item.status ? "fa-eye-slash" : "fa-eye"
                          }`}
                        ></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      <MenuItemModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        editingItem={editingItem}
      />
    </div>
  );
};

export default MenuItems;