// import React from "react";

// const Reports = () => {
//   const topProducts = [
//     { name: "Tomatoes", qty: "420 Kg", revenue: "QAR 21,000" },
//     { name: "Onions", qty: "380 Kg", revenue: "QAR 18,200" },
//     { name: "Potatoes", qty: "310 Kg", revenue: "QAR 15,500" }
//   ];

//   return (
//     <div className="reports_page">
//       <h3 className="page_title">Reports & Analytics</h3>

//       {/* KPI CARDS */}
//       <div className="kpi_grid">
//         <div className="kpi_card">
//           <i className="fa fa-rupee-sign"></i>
//           <p>Total Revenue</p>
//           <h3>QAR  1,25,450</h3>
//         </div>
//         <div className="kpi_card">
//           <i className="fa fa-shopping-cart"></i>
//           <p>Total Orders</p>
//           <h3>324</h3>
//         </div>
//         <div className="kpi_card">
//           <i className="fa fa-box"></i>
//           <p>Products Sold</p>
//           <h3>1,280 Units</h3>
//         </div>
//         <div className="kpi_card alert">
//           <i className="fa fa-exclamation-circle"></i>
//           <p>Low Stock Items</p>
//           <h3>8 Products</h3>
//         </div>
//       </div>

//       {/* TOP PRODUCTS */}
//       <div className="card">
//         <h4>Top Selling Products</h4>
//         <table className="mini_table">
//           <thead>
//             <tr>
//               <th>Product</th>
//               <th>Sold Qty</th>
//               <th>Revenue</th>
//             </tr>
//           </thead>
//           <tbody>
//             {topProducts.map((p, i) => (
//               <tr key={i}>
//                 <td>{p.name}</td>
//                 <td>{p.qty}</td>
//                 <td>{p.revenue}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//     </div>
//   );
// };

// export default Reports;


import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
/* DASHBOARD SECTIONS */
// import ReportsHome from "../../components/Dashboard/ReportsHome";

/* REPORT MODULES */
import InventoryReport from "../Reports/InventoryReport";
import ProductReport from "../Reports/ProductReport";
import OrderReport from "../Reports/OrderReport";
import InvoiceReport from "../Reports/InvoiceReport";

const API = "http://192.168.2.9:5000/api";
const LOW_STOCK_LIMIT = 10;

const Reports = () => {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const { t, i18n } = useTranslation();

  /* ================= KPI STATES ================= */
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [productsSold, setProductsSold] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  /* ================= TOP PRODUCTS ================= */
  const [topProducts, setTopProducts] = useState([]);

  const supplierId = localStorage.getItem("linked_id");
  const token = localStorage.getItem("token");
  const getProductName = (r) => {
    return i18n.language === "ar"
      ? (r.product_name_arabic || r.product_name_english)
      : r.product_name_english;
  };

  /* ================= LOAD KPI + TOP PRODUCTS ================= */
  const loadKPIs = async () => {
    if (!supplierId) return;

    try {
      /* ================= ORDERS ================= */
      const ordersRes = await fetch(
        `${API}/reports/orders?supplier_id=${supplierId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const orders = await ordersRes.json();
      const rows = Array.isArray(orders) ? orders : [];

      /* -------- TOTAL ORDERS -------- */
      const uniqueOrders = new Set(rows.map(r => r.order_id));
      setTotalOrders(uniqueOrders.size);

      /* -------- TOTAL REVENUE -------- */
      const revenue = rows.reduce(
        (sum, r) => sum + Number(r.item_total || 0),
        0
      );
      setTotalRevenue(revenue);

      /* -------- PRODUCTS SOLD -------- */
      const soldQty = rows.reduce(
        (sum, r) => sum + Number(r.quantity || 0),
        0
      );
      setProductsSold(soldQty);

      /* -------- TOP SELLING PRODUCTS -------- */
      const productMap = {};

      rows.forEach(r => {
        if (!productMap[r.product_id]) {
          productMap[r.product_id] = {
            name: getProductName(r),
            qty: 0,
            revenue: 0,
          };
        }

        productMap[r.product_id].qty += Number(r.quantity || 0);
        productMap[r.product_id].revenue += Number(r.item_total || 0);
      });

      const top = Object.values(productMap)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 3);

      setTopProducts(top);

      /* ================= INVENTORY (LOW STOCK) ================= */
      const invRes = await fetch(
        `${API}/products/inventory?supplier_id=${supplierId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const inventory = await invRes.json();
      const invArray = Array.isArray(inventory) ? inventory : [];

      const lowStock = invArray.filter(
        p => Number(p.stock_availability || 0) <= LOW_STOCK_LIMIT
      );

      setLowStockCount(lowStock.length);

    } catch (err) {
      console.error("Failed to load reports KPIs", err);
    }
  };

  useEffect(() => {
    loadKPIs();
  }, [supplierId]);

  /* ================= RENDER REPORT ================= */
  const renderReport = () => {
    switch (activeSubmenu) {
      case "inventory-report":
        return <InventoryReport />;
      case "product-report":
        return <ProductReport />;
      case "order-report":
        return <OrderReport />;
      case "invoice-report":
        return <InvoiceReport />;
      default:
        return null;
    }
  };
  const formatNumber = (num) => {
    return new Intl.NumberFormat(
      i18n.language === "ar" ? "ar-EG" : "en-US"
    ).format(num);
  };
  return (
  <div className="reports_page">
    <h3 className="page_title">{t("reports_analytics")}</h3>

    {/* KPI CARDS */}
    <div className="kpi_grid">
      <div className="kpi_card">
        <i className="fa fa-rupee-sign"></i>
        <p>{t("total_revenue")}</p>
        <h3>{t("currency")} {formatNumber(totalRevenue)}</h3>
      </div>

      <div className="kpi_card">
        <i className="fa fa-shopping-cart"></i>
        <p>{t("total_orders")}</p>
        <h3>{formatNumber(totalOrders)}</h3>
      </div>

      <div className="kpi_card">
        <i className="fa fa-box"></i>
        <p>{t("products_sold")}</p>
        <h3>{formatNumber(productsSold)} {t("units")}</h3>
      </div>

      <div className="kpi_card alert">
        <i className="fa fa-exclamation-circle"></i>
        <p>{t("low_stock_items")}</p>
        <h3>{formatNumber(lowStockCount)} {t("products")}</h3>
      </div>
    </div>

    {/* TOP PRODUCTS */}
    <div className="card">
      <h4>{t("top_selling_products")}</h4>
      <table className="mini_table">
        <thead>
          <tr>
            <th>{t("product")}</th>
            <th>{t("sold_qty")}</th>
            <th>{t("revenue")}</th>
          </tr>
        </thead>
        <tbody>
          {topProducts.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                {t("no_sales_data")}
              </td>
            </tr>
          ) : (
            topProducts.map((p, i) => (
              <tr key={i}>
                <td>{p.name}</td>
                <td>{formatNumber(p.qty)}</td>
                <td>{t("currency")} {formatNumber(p.revenue)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* REPORT MODULES */}
    {!activeSubmenu ? (
      <div className="reports_section">
        <h4>{t("reports")}</h4>
        <p className="sub_text">{t("select_report_module")}</p>

        <div className="report_cards">
          <div className="report_card" onClick={() => setActiveSubmenu("inventory-report")}>
            <i className="fa fa-warehouse"></i>
            <h5>{t("inventory_report")}</h5>
            <p>{t("inventory_desc")}</p>
          </div>

          <div className="report_card" onClick={() => setActiveSubmenu("product-report")}>
            <i className="fa fa-box-open"></i>
            <h5>{t("product_report")}</h5>
            <p>{t("product_desc")}</p>
          </div>

          <div className="report_card" onClick={() => setActiveSubmenu("order-report")}>
            <i className="fa fa-shopping-cart"></i>
            <h5>{t("order_report")}</h5>
            <p>{t("order_desc")}</p>
          </div>

          <div className="report_card" onClick={() => setActiveSubmenu("invoice-report")}>
            <i className="fa fa-file-invoice"></i>
            <h5>{t("invoice_report")}</h5>
            <p>{t("invoice_desc")}</p>
          </div>
        </div>
      </div>
    ) : (
      <>
        <button className="back_btn" onClick={() => setActiveSubmenu(null)}>
         ← {t("back_to_reports")}
        </button>
        {renderReport()}
      </>
    )}
  </div>
);
};

export default Reports;


