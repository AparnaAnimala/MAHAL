import React, { useEffect, useState } from "react";
// import "../css/restaurantcredit.css";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {  useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
const API = "http://192.168.2.22:5000/api/restaurant/credit";

export default function RestaurantCreditWallet(){
const location = useLocation();
const token = localStorage.getItem("token");
const navigate = useNavigate();
const [summary,setSummary] = useState({});
const [orders,setOrders] = useState([]);
const [settlements,setSettlements] = useState([]);
const [previewUrl,setPreviewUrl] = useState(null);
const [previewType,setPreviewType] = useState(null);
const [rotation,setRotation] = useState(0);
const [expandedRow, setExpandedRow] = useState(null);
const { t, i18n } = useTranslation();
const [searchOrder, setSearchOrder] = useState("");
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
const [searchSettlement, setSearchSettlement] = useState("");
const [payFromDate, setPayFromDate] = useState("");
const [payToDate, setPayToDate] = useState("");

const toArabicDigits = (value) => {
  if (i18n.language !== "ar") return value;

  return String(value).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat(
    i18n.language === "ar" ? "ar-QA" : "en-US"
  ).format(value || 0);
};
const [activeTab, setActiveTab] = useState(
  location.state?.openTab || "orders"
);// NEW
const toggleExpand = (id) => {
  setExpandedRow(prev => (prev === id ? null : id));
};
useEffect(()=>{

fetch(`${API}/summary`,{
headers:{Authorization:`Bearer ${token}`}
})
.then(res=>res.json())
.then(data=>setSummary(data));

fetch(`${API}/orders`,{
headers:{Authorization:`Bearer ${token}`,
"Accept-Language": i18n.language}
        
})
.then(res=>res.json())
.then(data=>setOrders(data));

fetch(`${API}/settlements`,{
headers:{Authorization:`Bearer ${token}`,
"Accept-Language": i18n.language}
         
})
.then(res=>res.json())
.then(data=>setSettlements(data));

},[token,i18n.language]);

const usedPercent = summary.credit_limit
? (summary.credit_used / summary.credit_limit) * 100
: 0;


const viewReceipt = async (id) => {

try{

const res = await fetch(`${API}/receipt/${id}`,{
headers:{Authorization:`Bearer ${token}`,
"Accept-Language": i18n.language}
});

if(!res.ok){
alert(t("receiptNotAvailable"));
return;
}

const blob = await res.blob();

const url = window.URL.createObjectURL(blob);

setPreviewUrl(url);
setPreviewType(blob.type);

}catch(err){
console.error(err);
}

};

const formatCurrency = (value) =>
  `${i18n.language === "ar" ? "ر.ق" : "QAR"} ${formatNumber(value)}`;

const translateStatus = (status) => {
  const val = (status || "").toUpperCase();

  if (val === "PAID") return t("paid");
  if (val === "UNPAID") return t("unpaid");
  if (val === "PARTIAL") return t("partial");
  if (val === "OVERDUE") return t("overdue");

  return status;
};

const translatePaymentMode = (mode) => {
  const val = (mode || "").toUpperCase();

  if (val === "CASH") return t("cash");
  if (val === "CARD") return t("card");
  if (val === "BANK") return t("bank");
  if (val === "ONLINE") return t("online");

  return mode;
};

const downloadSettlementPDF = async (id) => {

try{

const res = await fetch(`${API}/settlement-pdf/${id}`,{
headers:{
Authorization:`Bearer ${token}`,"Accept-Language": i18n.language
}
});

if(!res.ok){
alert(t("unableDownloadPdf"));
return;
}

const blob = await res.blob();

const url = window.URL.createObjectURL(blob);

const a = document.createElement("a");
a.href = url;
a.download =
  i18n.language === "ar"
    ? `تسوية_${id}.pdf`
    : `Settlement_${id}.pdf`;
document.body.appendChild(a);
a.click();
a.remove();

}catch(err){
console.error(err);
}

};
useEffect(() => {
  if (location.state?.settlementId && settlements.length > 0) {
    setExpandedRow(parseInt(location.state.settlementId));
  }
}, [settlements, location.state]);
return(

<div className="credit_page" dir={i18n.language === "ar" ? "rtl" : "ltr"}>

<h2 className="page_title">{t("creditWallet")}</h2>

{/* SUMMARY CARDS */}
<div className="credit_cards">

<div className="credit_card limit">
<div className="card_icon">💳</div>
<div>
<span>{t("creditLimit")}</span>
<h3>{formatCurrency(summary.credit_limit)}</h3>
</div>
</div>

<div className="credit_card used">
<div className="card_icon">📉</div>
<div>
<span>{t("usedCredit")}</span>
<h3>{formatCurrency(summary.credit_used)}</h3>
</div>
</div>

<div className="credit_card available">
<div className="card_icon">✅</div>
<div>
<span>{t("available")}</span>
<h3>{formatCurrency(summary.credit_available)}</h3>
</div>
</div>

<div className="credit_card days">
<div className="card_icon">📅</div>
<div>
<span>{t("creditDays")}</span>
<h3>{summary.credit_days || 0}</h3>
</div>
</div>

</div>


{/* CREDIT USAGE BAR */}
<div className="credit_usage">

<div className="usage_header">
<span>{t("creditUsage")}</span>
<span>{usedPercent.toFixed(0)}%</span>
</div>

<div className="progress_bar">
<div
className="progress_fill"
style={{width:`${usedPercent}%`}}
></div>
</div>

</div>


{/* TAB BUTTONS */}

<div className="credit_tabs">

<button
className={activeTab==="orders"?"active":""}
onClick={()=>setActiveTab("orders")}
>
{t("outstandingOrders")}
</button>

<button
className={activeTab==="payments"?"active":""}
onClick={()=>setActiveTab("payments")}
>
{t("paymentHistory")}
</button>

</div>



{/* ORDERS TAB */}

{activeTab==="orders" && (

<div className="section_card">
  <div className="filters_bar">

  {/* SEARCH */}
  <input
    type="text"
    placeholder={t("searchOrder")}
    value={searchOrder}
    onChange={(e) => setSearchOrder(e.target.value)}
    className="filter_input"
  />

  {/* FROM DATE */}
  <input
    type="date"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
    className="filter_input"
  />

  {/* TO DATE */}
  <input
    type="date"
    value={toDate}
    onChange={(e) => setToDate(e.target.value)}
    className="filter_input"
  />

  {/* RESET */}
  <button
    className="reset_btn1"
    onClick={() => {
      setSearchOrder("");
      setFromDate("");
      setToDate("");
    }}
  >
    {t("reset")}
  </button>

</div>

<table className="credit_table">

<thead>
<tr>
<th>{t("order")}</th>
<th>{t("total")}</th>
<th>{t("due")}</th>
<th>{t("dueDate")}</th>
<th>{t("status")}</th>
</tr>
</thead>

<tbody>
{orders.length === 0 && (
  <tr>
    <td colSpan="5" style={{ textAlign: "center" }}>
      {t("noData")}
    </td>
  </tr>
)}
{orders
  .filter(o => {

    // 🔍 SEARCH FILTER
    const matchesSearch =
      !searchOrder ||
      o.order_id?.toLowerCase().includes(searchOrder.toLowerCase());

    // 📅 DATE FILTER
    const orderDate = o.credit_due_date
      ? new Date(o.credit_due_date)
      : null;

    const matchesFrom =
      !fromDate || (orderDate && orderDate >= new Date(fromDate));

    const matchesTo =
      !toDate || (orderDate && orderDate <= new Date(toDate));

    return matchesSearch && matchesFrom && matchesTo;
  })
  .map(o => (

<tr key={o.order_id}>

<td>{o.order_id}</td>

<td>{formatCurrency(o.total_amount)}</td>

<td className="due_amount">
  {formatCurrency(o.restaurant_due_amount)}
</td>

<td>{toArabicDigits(o.credit_due_date)}</td>

<td>
<span className={`status ${o.restaurant_payment_status?.toLowerCase()}`}>
{translateStatus(o.restaurant_payment_status)}
</span>
</td>

</tr>

))}

</tbody>

</table>

</div>

)}



{/* PAYMENTS TAB */}

{activeTab==="payments" && (

<div className="section_card">
{activeTab === "payments" && (
  <div className="filters_bar">

    {/* SEARCH */}
    <input
      type="text"
      placeholder={t("searchSettlement")}
      value={searchSettlement}
      onChange={(e) => setSearchSettlement(e.target.value)}
      className="filter_input"
    />

    {/* FROM DATE */}
    <input
      type="date"
      value={payFromDate}
      onChange={(e) => setPayFromDate(e.target.value)}
      className="filter_input"
    />

    {/* TO DATE */}
    <input
      type="date"
      value={payToDate}
      onChange={(e) => setPayToDate(e.target.value)}
      className="filter_input"
    />

    {/* RESET */}
    <button
      className="reset_btn1"
      onClick={() => {
        setSearchSettlement("");
        setPayFromDate("");
        setPayToDate("");
      }}
    >
      {t("reset")}
    </button>

  </div>
)}
<table className="credit_table">

<thead>
<tr>
<th>{t("settlementId")}</th>
<th>{t("ordersPaid")}</th>
<th>{t("amount")}</th>
<th>{t("mode")}</th>
<th>{t("date")}</th>
<th>{t("receipt")}</th>
</tr>
</thead>

<tbody>

{settlements
  .filter(s => {

    // 🔍 SEARCH
    const matchesSearch =
      !searchSettlement ||
      String(s.settlement_id)
        .toLowerCase()
        .includes(searchSettlement.toLowerCase());

    // 📅 PAYMENT DATE FILTER
    const payDate = s.created_at
      ? new Date(s.created_at)
      : null;

    const matchesFrom =
      !payFromDate || (payDate && payDate >= new Date(payFromDate));

    const matchesTo =
      !payToDate || (payDate && payDate <= new Date(payToDate));

    return matchesSearch && matchesFrom && matchesTo;
  })
  .map(s => (

<tr key={s.settlement_id}>

<td>{formatNumber(s.settlement_id)}</td>

<td>
  <div className="order_ids_container">
    {s.order_ids?.slice(0, 3).map(id => (
      <span
        key={id}
        className="order_chip"
        onClick={() => navigate(`/restaurantdashboard/orders/${id}`)}
      >
        {t("order")} #{id}
      </span>
    ))}

    {s.order_ids?.length > 3 && (
      <span
        className="expand_chip"
        onClick={() => toggleExpand(s.settlement_id)}
      >
        +{s.order_ids.length - 3}
      </span>
    )}
  </div>

  {/* EXPANDED VIEW */}
  {expandedRow === s.settlement_id && (
    <div className="expanded_orders">
      {s.order_ids.map(id => (
        <div
          key={id}
          className="expanded_order_item"
          onClick={() => navigate(`/restaurantdashboard/orders/${id}`)}
        >
         {t("order")} #{id}
        </div>
      ))}
    </div>
  )}
</td>

<td className="paid_amount">
  <strong>{formatCurrency(s.amount)}</strong>
</td>

<td>{translatePaymentMode(s.payment_mode)}</td>

<td>
  <div className="date_block">
<span>
  {new Date(s.created_at).toLocaleDateString(
    i18n.language === "ar" ? "ar-QA" : "en-US"
  )}
</span>

<small>
  {new Date(s.created_at).toLocaleTimeString(
    i18n.language === "ar" ? "ar-QA" : "en-US"
  )}
</small>
  </div>
</td>

<td className="receipt_actions">

{/* <button
className="receipt_btn"
onClick={() => viewReceipt(s.settlement_id)}
>
{t("view")}
</button> */}

<button
className="pdf_btn"
onClick={() => downloadSettlementPDF(s.settlement_id)}
>
{t("pdf")}
</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

)}

{previewUrl && (

<div className="receipt_modal">

<div className="receipt_box">

<div className="receipt_header">
<span>{t("receiptPreview")}</span>

<button
className="close_btn"
onClick={()=>setPreviewUrl(null)}
>
{t("close")}
</button>
</div>

{previewType === "application/pdf" ? (

<iframe
src={previewUrl}
className="receipt_preview"
title="receipt"
/>

) : (

<TransformWrapper>

{({ zoomIn, zoomOut, resetTransform }) => (

<>

<div className="receipt_toolbar">

<button onClick={() => zoomIn()}>+</button>
<button onClick={() => zoomOut()}>-</button>
<button onClick={() => resetTransform()}>{t("reset")}</button>
<button onClick={()=>setRotation(rotation+90)}>
{t("rotate")}
</button>

</div>

<TransformComponent>

<img
src={previewUrl}
alt="receipt"
className="receipt_image"
style={{transform:`rotate(${rotation}deg)`}}
/>

</TransformComponent>

</>

)}

</TransformWrapper>

)}

<div className="receipt_footer">

<a
href={previewUrl}
download="receipt"
className="download_btn"
>
{t("download")}
</a>

</div>

</div>

</div>

)}

</div>
);
}