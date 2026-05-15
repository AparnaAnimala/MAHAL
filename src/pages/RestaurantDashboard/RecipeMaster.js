import React, { useState, useEffect } from "react";
import "../css/RecipeMaster.css";
import { useTranslation } from "react-i18next";

export default function RecipeMaster() {
  const [menuItems, setMenuItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState("");
  const restaurantId = localStorage.getItem("linked_id"); // or restaurant_id
  const { t, i18n } = useTranslation();

  // 👉 Start with 10 empty rows
  const [ingredientRows, setIngredientRows] = useState(
    Array.from({ length: 10 }, () => ({ name: "", quantity: "", unit: "" }))
  );

  // ===============================
  // FETCH MENU ITEMS
  // ===============================
 useEffect(() => {
  if (!restaurantId) return;

  fetch(
    `http://192.168.2.9:5000/api/recipes/menu-items?restaurant_id=${restaurantId}`
  )
    .then(res => res.json())
    .then(data => setMenuItems(Array.isArray(data) ? data : []))
    .catch(() => setMenuItems([]));
}, [restaurantId]);

  // ===============================
  // FETCH UNITS FROM GENERAL_MASTER
  // ===============================
  useEffect(() => {
    fetch(`http://192.168.2.9:5000/api/recipes/units?lang=${i18n.language}`)
      .then(res => res.json())
      .then(data => setUnits(Array.isArray(data) ? data : []))
      .catch(() => setUnits([]));
  }, [i18n.language]);

  // ===============================
  // UPDATE ROW
  // ===============================
  const updateRow = (i, field, value) => {
    const updated = [...ingredientRows];
    updated[i][field] = value;
    setIngredientRows(updated);

    const isLast = i === ingredientRows.length - 1;
    const filled = updated[i].name || updated[i].quantity || updated[i].unit;

    if (isLast && filled) {
      setIngredientRows([
        ...updated,
        { name: "", quantity: "", unit: "" }
      ]);
    }
  };

  // ===============================
  // 🔥 CLEAR ROW (REPLACES DELETE)
  // ===============================
  const clearRow = (i) => {
    const updated = [...ingredientRows];
    updated[i] = { name: "", quantity: "", unit: "" };
    setIngredientRows(updated);
  };

  // ===============================
  // SAVE RECIPE
  // ===============================
  const saveRecipe = () => {
    // const filteredRows = ingredientRows.filter(
    //   row => row.name.trim() !== "" || row.quantity.trim() !== ""
    // );

    const filteredRows = ingredientRows.filter(
      row =>
        row.name.trim() !== "" &&
        row.quantity.trim() !== "" &&
        row.unit.trim() !== ""
    );

    if (!selectedMenu) {
      alert(t("pleaseSelectMenuItem"));
      return;
    }

    if (filteredRows.length === 0) {
      alert(t("pleaseEnterIngredient"));
      return;
    }

    fetch("http://192.168.2.9:5000/api/recipes/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      restaurant_id: Number(restaurantId),
      menu_id: Number(selectedMenu),
      ingredients: filteredRows
    })

    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        window.location.reload();
      });
  };

  const selectedMenuItem = menuItems.find(
    item => item.id === Number(selectedMenu)
  );

 return (
  <div className="dashboard_page" dir={i18n.language === "ar" ? "rtl" : "ltr"}>

    {/* HEADER */}
    <div className="page_header">
      <div>
        <h2 className="mb-0">{t("addRecipe")}</h2>
      </div>
    </div>

    {/* ===== MENU ITEM ===== */}
    <div className="section_card soft mt-3">
      <label className="form-label fw-semibold">
        {t("menuItem")} <span className="text-danger">*</span>
      </label>

      <div className="d-flex gap-4 align-items-center">
        <select
          className="form-select"
          style={{ maxWidth: "300px" }}
          value={selectedMenu}
          onChange={(e) => setSelectedMenu(e.target.value)}
        >
          <option value="">{t("selectMenuItem")}</option>

          {menuItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        {selectedMenuItem?.image && (
          <div className="menu-image-preview">
            <img
              src={`data:image/jpeg;base64,${selectedMenuItem.image}`}
              alt={selectedMenuItem.name}
              width="120"
              style={{ borderRadius: "8px" }}
            />
          </div>
        )}
      </div>
    </div>

    {/* ===== INGREDIENT TABLE ===== */}
    <div className="section_card soft mt-3">
      <table className="table recipe_table">
        <thead>
          <tr>
            <th>{t("ingredient")}</th>
            <th>{t("quantity")}</th>
            <th>{t("unit")}</th>
            <th style={{ width: "140px" }}>{t("action")}</th>
          </tr>
        </thead>

        <tbody>
          {ingredientRows.map((row, i) => (
            <tr key={i}>

              {/* INGREDIENT */}
              <td>
                <input
                  className="form-control"
                  placeholder={t("egOnion")}
                  value={row.name}
                  onChange={(e) =>
                    updateRow(i, "name", e.target.value)
                  }
                />
              </td>

              {/* QTY */}
              <td>
                <input
                  type="number"
                  className="form-control"
                 placeholder={t("quantity")}
                  value={row.quantity}
                  onChange={(e) =>
                    updateRow(i, "quantity", e.target.value)
                  }
                />
              </td>

              {/* UNIT */}
              <td>
                <select
                  className="form-select"
                  value={row.unit}
                  onChange={(e) =>
                    updateRow(i, "unit", e.target.value)
                  }
                >
                  <option value="">{t("selectUnit")}</option>

                  {units.map((u, idx) => (
                    <option key={idx} value={u.value}>
                      {u.label} ({u.value})
                    </option>
                  ))}
                </select>
              </td>

              {/* ACTION */}
              <td className="d-flex gap-2">
                <button
                  className="btn btn-orange btn-sm"
                  onClick={() =>
                    setIngredientRows([
                      ...ingredientRows,
                      { name: "", quantity: "", unit: "" }
                    ])
                  }
                >
                  +
                </button>

                <button
                  className="btn btn-orange btn-sm"
                  onClick={() => clearRow(i)}
                >
                  −
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== SAVE BUTTON ===== */}
      <div className="mt-3 text-center m-auto">
        <button className="btn btn-outline-orange" onClick={saveRecipe}>
          {t("saveRecipe")}
        </button>
      </div>
    </div>
  </div>
);
}