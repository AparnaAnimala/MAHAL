import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import OrderTrack from "./TrackOrder";
import OrderDetails from "./OrderDetails";
import { useTranslation } from "react-i18next";


const API = "http://192.168.2.9:5000/api/v1/orders/restaurant/orders";

export default function RestaurantOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  // const [dateRange, setDateRange] = useState("30"); 
  const [showRecurring, setShowRecurring] = useState(false);
  const navigate = useNavigate();
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [detailsOrderId, setDetailsOrderId] = useState(null);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [weekdays, setWeekdays] = useState([]);
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
const [dateRange, setDateRange] = useState("30");
const [selectedOrder, setSelectedOrder] = useState(null);
const [frequency, setFrequency] = useState("DAILY");
const [startDate, setStartDate] = useState(
  new Date().toISOString().split("T")[0]
);
const [endDate, setEndDate] = useState("");
const token = localStorage.getItem("token");
const { t, i18n } = useTranslation();
const [last30, setLast30] = useState(true);
const [expandedOrders, setExpandedOrders] = useState({});
const toggleOrderExpand = (id) => {
  setExpandedOrders((prev) => ({
    ...prev,
    [id]: !prev[id],
  }));
};
const formatCurrency = (value) => {
  return new Intl.NumberFormat(
    i18n.language === "ar" ? "ar-QA" : "en-US",
    {
      style: "currency",
      currency: "QAR",
    }
  ).format(value);
};

const formatDateTime = (date) => {
  const d = new Date(date);

  return {
    date: d.toLocaleDateString(i18n.language === "ar" ? "ar-QA" : "en-US"),
    time: d.toLocaleTimeString(i18n.language === "ar" ? "ar-QA" : "en-US"),
  };
};

const formatOrderId = (id) => {
  if (i18n.language !== "ar") return id;

  return id.replace(/\d/g, (d) =>
    new Intl.NumberFormat("ar-QA").format(d)
  );
};

const localText = {
  more: t("resmore"),
  daily: t("resdaily"),
  weekly: t("resweekly"),
  confirmCancel: t("resconfirm_cancel_order"),
  cancelSuccess: t("rescancel_success"),
  pauseConfirm: t("respause_confirm"),
  pauseSuccess: t("respause_success"),
  activated: t("resrecurring_activated"),
  wrong: t("ressomething_wrong"),
  repeatDaily: t("resrepeat_daily_from"),
  repeatWeekly: t("resrepeat_weekly_on"),
};

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = () => {
    const params = new URLSearchParams({
      search,
      status,
      last30: last30 ? "1" : "0",
    });

    fetch(`${API}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]));
  };

  useEffect(() => {
    if (trackingOrderId || detailsOrderId) return;
    fetchOrders();
  }, [search, status, last30, trackingOrderId, detailsOrderId]);

  /* ================= STATUS HELPERS ================= */
const statusLabel = (s) => {
  if (s === "PACKED") return t("respacked");
  if (s === "OUT_FOR_DELIVERY") return t("resout_for_delivery");
  if (s === "ACCEPTED") return t("resaccepted");
  if (s === "DELIVERED") return t("resdelivered");
  if (s === "REJECTED") return t("resrejected");
  return t("resplaced");
};


const statusClass = (s) => {
  if (s === "DELIVERED") return "success";
  if (s === "PACKED") return "warning";
  if (s === "OUT_FOR_DELIVERY") return "primary";
  if (s === "REJECTED") return "danger";
  return "info";
};
  
  /* ================= CANCEL ORDER ================= */
 const handleCancel = async (orderId) => {
const confirm = window.confirm(localText.confirmCancel);

  if (!confirm) return;

  try {
    const res = await fetch(
      `http://192.168.2.9:5000/api/v1/orders/restaurant/${orderId}/cancel`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || localText.wrong);
      return;
    }

    alert(localText.cancelSuccess);
    fetchOrders();

  } catch (err) {
    alert("Something went wrong");
  }
};


  /* ================= TRACK SCREEN ================= */
  if (trackingOrderId) {
    return (
      <OrderTrack
        orderId={trackingOrderId}
        onBack={() => setTrackingOrderId(null)}
      />
    );
  }

  if (detailsOrderId) {
    return (
      <OrderDetails
        orderId={detailsOrderId}
        onBack={() => setDetailsOrderId(null)}
        onTrack={(id) => setTrackingOrderId(id)}
      />
    );
  }


const activateRecurring = async () => {
  if (!selectedOrder) return;

  try {
    const res = await fetch(
      "http://192.168.2.9:5000/api/v1/orders/restaurant/recurring/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
       body: JSON.stringify({
          order_id: selectedOrder.order_id,
          frequency,
          start_date: startDate,
          end_date: endDate || null,
          weekdays: frequency === "WEEKLY" ? weekdays : []
        }),

      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || localText.wrong);
      return;
    }

    alert(localText.activated);

    setShowRecurringModal(false);
    setSelectedOrder(null);
    fetchOrders();

  } catch (err) {
    alert(localText.wrong);
  }
};



const handlePauseRecurring = async (orderId) => {
const confirm = window.confirm(localText.pauseConfirm);

  if (!confirm) return;

  try {
    const res = await fetch(
      `http://192.168.2.9:5000/api/v1/orders/restaurant/recurring/pause/${orderId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || localText.wrong);
      return;
    }

    alert(localText.pauseSuccess);

    fetchOrders();

  } catch (err) {
    alert(localText.wrong);
  }
};

const filteredOrders = orders.filter((group) => {

  const matchingSplitOrders = (group.split_orders || []).filter((o) => {

    /* SEARCH */
    const searchText = search.toLowerCase();

    const matchesSearch =
      !search ||

     String(o.order_id || "").toLowerCase().includes(searchText) ||

      String(group.master_order_id || "").toLowerCase()
        .includes(searchText) ||

      String(o.company_name_english || "").toLowerCase()
        .includes(searchText) ||

      String(o.company_name_arabic || "").toLowerCase()
        .includes(searchText);

    /* STATUS */
    const matchesStatus =
      status === "ALL" ||
      o.status === status;

    /* DATE */
    const orderDate = o.order_date
      ? new Date(o.order_date)
      : null;

    let matchesRange = true;

    if (dateRange !== "all") {

      const days = parseInt(dateRange);

      const pastDate = new Date();

      pastDate.setHours(0, 0, 0, 0);

      pastDate.setDate(
        pastDate.getDate() - days
      );

      matchesRange =
        orderDate &&
        orderDate >= pastDate;
    }

    const matchesFrom =
      !fromDate ||
      (
        orderDate &&
        orderDate >= new Date(fromDate)
      );

    const matchesTo =
      !toDate ||
      (
        orderDate &&
        orderDate <= new Date(
          `${toDate}T23:59:59`
        )
      );

    /* RECURRING */
    const matchesRecurring =
      !showRecurring ||
      o.is_recurring === true;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesRange &&
      matchesFrom &&
      matchesTo &&
      matchesRecurring
    );

  });

  return matchingSplitOrders.length > 0;

});

  /* ================= ORDER LIST ================= */
  return (
    <div className="dashboard_page">
      {/* HEADER */}
      <div className="page_header">
        <h2>{t("resmy_orders")}</h2>
        <p className="page_subtitle">
          {t("resorders_subtitle")}
        </p>
      </div>
       
       <div className="filter_right">
            <button
              className={`btn btn-sm ${showRecurring ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => setShowRecurring(!showRecurring)}
            >
              {showRecurring ? t("resshow_normal_orders") : t("resshow_recurring_orders")}
            </button>

            
          </div>


      {/* FILTER BAR */}
      <div className="card filter_bar">
        <div className="filter_left">
          <input
            type="text"
            className="form-control search_input"
            placeholder={
              i18n.language === "ar"
                ? "ابحث برقم الطلب أو المرجع أو المورد..."
                : "Search by Order ID, Reference ID or Supplier..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <input
            type="date"
            className="form-control"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />

          <input
            type="date"
            className="form-control"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />

          <select
            className="form-select status_select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ALL">{t("resall_status")}</option>
            <option value="PLACED">{t("resplaced")}</option>
            <option value="ACCEPTED">{t("resconfirmed")}</option>
            <option value="OUT_FOR_DELIVERY">{t("resout_for_delivery")}</option>
            <option value="DELIVERED">{t("resdelivered")}</option>
            <option value="REJECTED">{t("resrejected")}</option>
            
          </select>
          <select
            className="form-select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7">{t("last7days")}</option>
            <option value="30">{t("last30days")}</option>
            <option value="90">{t("last3months")}</option>
            <option value="all">{t("all")}</option>
          </select>
        </div>

        <div className="filter_right">
          <span className="orders_found">
            {filteredOrders.length} {t("resorders_found")}
          </span>
        </div>
      </div>

      {/* TABLE */}
      <div className="card mt-3">
        <table className="table order_table">
          {/* <thead>
            <tr>
              <th>{t("resorder_id")}</th>
              <th>{t("resdate")}</th>
              <th>{t("resproducts")}</th>
              <th>{t("restotal")}</th>
              <th>{t("resstatus")}</th>
              <th className="text-end">{t("resdaily")}</th>
              <th className="text-end">{t("resaction")}</th>

            </tr>
          </thead> */}

          <tbody>
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  {t("resno_orders")}
                </td>
              </tr>
            )}

{filteredOrders.map((group) => (

  <React.Fragment key={group.master_order_id}>

    {/* MASTER ORDER ROW */}
<tr className="master_order_row">
  <td colSpan="7">

    <div
      className={`master_order_card_new ${
        group.split_orders.length > 1
          ? "split_mode"
          : "single_mode"
      }`}
    >

      {/* LEFT */}
      <div className="master_order_left">

        <div className="reference_icon">
          {group.split_orders.length > 1
            ? "🚚"
            : "📦"}
        </div>

        <div>

          <div className="reference_label">
            {t("reference")}
          </div>

          <div className="reference_id">
            {group.master_order_id}
          </div>

          <span
            className={
              group.split_orders.length > 1
                ? "split_chip"
                : "single_chip"
            }
          >
            {group.split_orders.length > 1
              ? `${group.split_orders.length} Split Deliveries`
              : "Single Delivery"}
          </span>

        </div>

      </div>

      {/* RIGHT */}
      <div className="master_order_right">

        <div>

          <div className="master_total_label">
            {t("grand_total")}
          </div>

          <div className="master_total_amount">
            {formatCurrency(group.grand_total)}
          </div>

        </div>

        <button
          className="expand_btn"
          onClick={() =>
            toggleOrderExpand(
              group.master_order_id
            )
          }
        >
          {expandedOrders[group.master_order_id]
            ? "Hide ▲"
            : "View ▼"}
        </button>

      </div>

    </div>

  </td>
</tr>

    {/* SPLIT ORDERS */}
{/* SPLIT ORDERS */}
{expandedOrders[group.master_order_id] && (

  <>

    <tr className="delivery_header_row">

      <th>{t("resorder_id")}</th>

      <th>{t("resdate")}</th>

      <th>{t("resproducts")}</th>

      <th>{t("restotal")}</th>

      <th>{t("resstatus")}</th>

      <th className="text-center">
        {t("resdaily")}
      </th>

      <th className="text-end">
        {t("resaction")}
      </th>

    </tr>

    {group.split_orders.map((o) => (

      <tr
        key={o.order_id}
        className="split_order_row"
      >

        {/* ORDER ID */}
        <td className="supplier_order_cell">

          <div className="supplier_name">
            🚚 {
              i18n.language === "ar"
                ? o.company_name_arabic ||
                  o.company_name_english
                : o.company_name_english
            }
          </div>

          <div className="supplier_order_id">
            {formatOrderId(o.order_id)}
          </div>

          <span className="supplier_split_badge">
            Supplier Delivery
          </span>

        </td>

        {/* DATE */}
        <td>
          {formatDateTime(o.order_date).date}

          <br />

          <small>
            {formatDateTime(o.order_date).time}
          </small>
        </td>

        {/* PRODUCTS */}
        <td>

          {o.items?.slice(0, 2).map((item, i) => (

            <div key={i}>

              {
                i18n.language === "ar"
                  ? item.product_name_arabic ||
                    item.product_name_english
                  : item.product_name_english
              }

              {" "}
              (x{item.quantity})

            </div>

          ))}

          {o.items?.length > 2 && (

            <small>
              +{o.items.length - 2}
              {" "}
              {localText.more}
            </small>

          )}

        </td>

        {/* TOTAL */}
        <td dir="ltr">
          {formatCurrency(o.total_amount)}
        </td>

        {/* STATUS */}
        <td>

          <span
            className={`status_badge ${statusClass(o.status)}`}
          >
            {statusLabel(o.status)}
          </span>

          {o.is_recurring && (

            <span className="badge bg-dark ms-2">
              {localText.daily}
            </span>

          )}

        </td>

        {/* DAILY */}
        <td className="text-end">

          {o.status === "PLACED" &&
            o.is_recurring !== true && (

            <button
              className="btn btn-success btn-sm me-2"
              onClick={() => {
                setSelectedOrder(o);
                setShowRecurringModal(true);
              }}
            >
              {t("resmake_daily")}
            </button>

          )}

          {o.is_recurring === true && (

            <button
              className="btn btn-secondary btn-sm me-2"
              onClick={() =>
                handlePauseRecurring(o.order_id)
              }
            >
              {t("respause")}
            </button>

          )}

        </td>

        {/* ACTIONS */}
        <td className="text-end">

          <button
            className="btn btn-primary btn-sm me-2"
            onClick={() =>
              setDetailsOrderId(o.order_id)
            }
          >
            {t("resview")}
          </button>

          {o.status === "PLACED" && (

            <>

              <button
                className="btn btn-warning btn-sm me-2"
                onClick={() =>
                  navigate(
                    `/restaurantdashboard/edit-order/${o.order_id}`
                  )
                }
              >
                {t("resmodify")}
              </button>

              <button
                className="btn btn-danger btn-sm"
                onClick={() =>
                  handleCancel(o.order_id)
                }
              >
                {t("rescancel")}
              </button>

            </>

          )}

        </td>

      </tr>

    ))}

  </>

)}

  </React.Fragment>

))}
          </tbody>
        </table>
        {showRecurringModal && (
  <div className="modal_overlay">
    <div className="modal_box">

      <h4>{t("resrecurring_setup")}</h4>

      <div className="mb-3">
        <label>{t("resfrequency")}</label>
        <select
          className="form-select"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          <option value="DAILY">{t("resdaily")}</option>
          <option value="WEEKLY">{t("resweekly")}</option>
        </select>
      </div>
        
        {frequency === "WEEKLY" && (
          <div className="mb-3">
            <label>{t("resselect_days")}</label>

            /* REPLACE weekly days block */
            <div className="weekday_grid">
              {[
                { key: "MONDAY", label: t("monday") },
                { key: "TUESDAY", label: t("tuesday") },
                { key: "WEDNESDAY", label: t("wednesday") },
                { key: "THURSDAY", label: t("thursday") },
                { key: "FRIDAY", label: t("friday") },
                { key: "SATURDAY", label: t("saturday") },
                { key: "SUNDAY", label: t("sunday") },
              ].map((day) => (
                <label key={day.key} className="weekday_option">
                  <input
                    type="checkbox"
                    checked={weekdays.includes(day.key)}
                    onChange={() => {
                      if (weekdays.includes(day.key)) {
                        setWeekdays(weekdays.filter((d) => d !== day.key));
                      } else {
                        setWeekdays([...weekdays, day.key]);
                      }
                    }}
                  />
                  {day.label}
                </label>
              ))}
            </div>
          </div>
        )}

      <div className="mb-3">
        <label>{t("resstart_date")}</label>
        <input
          type="date"
          className="form-control"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label>{t("resend_date")}</label>
        <input
          type="date"
          className="form-control"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className="preview_box">
        <small>
          {frequency === "DAILY" &&
            `${localText.repeatDaily} ${startDate}.`}

          {frequency === "WEEKLY" &&
            `${localText.repeatWeekly} ${weekdays.join(", ")} ${localText.repeatDaily} ${startDate}.`}
        </small>
      </div>

      <div className="text-end mt-3">
        <button
          className="btn btn-secondary me-2"
          onClick={() => setShowRecurringModal(false)}
        >
          {t("rescancel")}
        </button>

        <button
          className="btn btn-success"
          onClick={activateRecurring}
        >
          {t("resactivate")}
        </button>
      </div>

    </div>
  </div>
)}

      </div>
    </div>
  );
}


// import { useNavigate } from "react-router-dom";
// import React, { useEffect, useState } from "react";
// import OrderTrack from "./TrackOrder";
// import OrderDetails from "./OrderDetails";
// import { useTranslation } from "react-i18next";


// const API = "http://192.168.2.9:5000/api/v1/orders/restaurant/orders";

// export default function RestaurantOrders() {
//   const [orders, setOrders] = useState([]);
//   const [search, setSearch] = useState("");
//   const [status, setStatus] = useState("ALL");
//   // const [dateRange, setDateRange] = useState("30"); 
//   const [showRecurring, setShowRecurring] = useState(false);
//   const navigate = useNavigate();
//   const [trackingOrderId, setTrackingOrderId] = useState(null);
//   const [detailsOrderId, setDetailsOrderId] = useState(null);
//   const [showRecurringModal, setShowRecurringModal] = useState(false);
//   const [weekdays, setWeekdays] = useState([]);
// const [fromDate, setFromDate] = useState("");
// const [toDate, setToDate] = useState("");
// const [dateRange, setDateRange] = useState("30");
// const [selectedOrder, setSelectedOrder] = useState(null);
// const [frequency, setFrequency] = useState("DAILY");
// const [startDate, setStartDate] = useState(
//   new Date().toISOString().split("T")[0]
// );
// const [endDate, setEndDate] = useState("");
// const token = localStorage.getItem("token");
// const { t, i18n } = useTranslation();
// const [last30, setLast30] = useState(true);
// const formatCurrency = (value) => {
//   return new Intl.NumberFormat(
//     i18n.language === "ar" ? "ar-QA" : "en-US",
//     {
//       style: "currency",
//       currency: "QAR",
//     }
//   ).format(value);
// };

// const formatDateTime = (date) => {
//   const d = new Date(date);

//   return {
//     date: d.toLocaleDateString(i18n.language === "ar" ? "ar-QA" : "en-US"),
//     time: d.toLocaleTimeString(i18n.language === "ar" ? "ar-QA" : "en-US"),
//   };
// };

// const formatOrderId = (id) => {
//   if (i18n.language !== "ar") return id;

//   return id.replace(/\d/g, (d) =>
//     new Intl.NumberFormat("ar-QA").format(d)
//   );
// };

// const localText = {
//   more: t("resmore"),
//   daily: t("resdaily"),
//   weekly: t("resweekly"),
//   confirmCancel: t("resconfirm_cancel_order"),
//   cancelSuccess: t("rescancel_success"),
//   pauseConfirm: t("respause_confirm"),
//   pauseSuccess: t("respause_success"),
//   activated: t("resrecurring_activated"),
//   wrong: t("ressomething_wrong"),
//   repeatDaily: t("resrepeat_daily_from"),
//   repeatWeekly: t("resrepeat_weekly_on"),
// };

//   /* ================= FETCH ORDERS ================= */
//   const fetchOrders = () => {
//     const params = new URLSearchParams({
//       search,
//       status,
//       last30: last30 ? "1" : "0",
//     });

//     fetch(`${API}?${params}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((res) => res.json())
//       .then((data) => setOrders(Array.isArray(data) ? data : []))
//       .catch(() => setOrders([]));
//   };

//   useEffect(() => {
//     if (trackingOrderId || detailsOrderId) return;
//     fetchOrders();
//   }, [search, status, last30, trackingOrderId, detailsOrderId]);

//   /* ================= STATUS HELPERS ================= */
// const statusLabel = (s) => {
//   if (s === "PACKED") return t("respacked");
//   if (s === "OUT_FOR_DELIVERY") return t("resout_for_delivery");
//   if (s === "ACCEPTED") return t("resaccepted");
//   if (s === "DELIVERED") return t("resdelivered");
//   if (s === "REJECTED") return t("resrejected");
//   return t("resplaced");
// };


// const statusClass = (s) => {
//   if (s === "DELIVERED") return "success";
//   if (s === "PACKED") return "warning";
//   if (s === "OUT_FOR_DELIVERY") return "primary";
//   if (s === "REJECTED") return "danger";
//   return "info";
// };
  
//   /* ================= CANCEL ORDER ================= */
//  const handleCancel = async (orderId) => {
// const confirm = window.confirm(localText.confirmCancel);

//   if (!confirm) return;

//   try {
//     const res = await fetch(
//       `http://192.168.2.9:5000/api/v1/orders/restaurant/${orderId}/cancel`,
//       {
//         method: "PUT",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     const data = await res.json();

//     if (!res.ok) {
//       alert(data.error || localText.wrong);
//       return;
//     }

//     alert(localText.cancelSuccess);
//     fetchOrders();

//   } catch (err) {
//     alert("Something went wrong");
//   }
// };


//   /* ================= TRACK SCREEN ================= */
//   if (trackingOrderId) {
//     return (
//       <OrderTrack
//         orderId={trackingOrderId}
//         onBack={() => setTrackingOrderId(null)}
//       />
//     );
//   }

//   if (detailsOrderId) {
//     return (
//       <OrderDetails
//         orderId={detailsOrderId}
//         onBack={() => setDetailsOrderId(null)}
//         onTrack={(id) => setTrackingOrderId(id)}
//       />
//     );
//   }


// const activateRecurring = async () => {
//   if (!selectedOrder) return;

//   try {
//     const res = await fetch(
//       "http://192.168.2.9:5000/api/v1/orders/restaurant/recurring/create",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//        body: JSON.stringify({
//           order_id: selectedOrder.order_id,
//           frequency,
//           start_date: startDate,
//           end_date: endDate || null,
//           weekdays: frequency === "WEEKLY" ? weekdays : []
//         }),

//       }
//     );

//     const data = await res.json();

//     if (!res.ok) {
//       alert(data.error || localText.wrong);
//       return;
//     }

//     alert(localText.activated);

//     setShowRecurringModal(false);
//     setSelectedOrder(null);
//     fetchOrders();

//   } catch (err) {
//     alert(localText.wrong);
//   }
// };



// const handlePauseRecurring = async (orderId) => {
// const confirm = window.confirm(localText.pauseConfirm);

//   if (!confirm) return;

//   try {
//     const res = await fetch(
//       `http://192.168.2.9:5000/api/v1/orders/restaurant/recurring/pause/${orderId}`,
//       {
//         method: "PUT",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     const data = await res.json();

//     if (!res.ok) {
//       alert(data.error || localText.wrong);
//       return;
//     }

//     alert(localText.pauseSuccess);

//     fetchOrders();

//   } catch (err) {
//     alert(localText.wrong);
//   }
// };



//   /* ================= ORDER LIST ================= */
//   return (
//     <div className="dashboard_page">
//       {/* HEADER */}
//       <div className="page_header">
//         <h2>{t("resmy_orders")}</h2>
//         <p className="page_subtitle">
//           {t("resorders_subtitle")}
//         </p>
//       </div>
       
//        <div className="filter_right">
//             <button
//               className={`btn btn-sm ${showRecurring ? "btn-dark" : "btn-outline-dark"}`}
//               onClick={() => setShowRecurring(!showRecurring)}
//             >
//               {showRecurring ? t("resshow_normal_orders") : t("resshow_recurring_orders")}
//             </button>

            
//           </div>


//       {/* FILTER BAR */}
//       <div className="card filter_bar">
//         <div className="filter_left">
//           <input
//             type="text"
//             className="form-control search_input"
//             placeholder={t("ressearch_order")}
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />

//           <input
//             type="date"
//             className="form-control"
//             value={fromDate}
//             onChange={(e) => setFromDate(e.target.value)}
//           />

//           <input
//             type="date"
//             className="form-control"
//             value={toDate}
//             onChange={(e) => setToDate(e.target.value)}
//           />

//           <select
//             className="form-select status_select"
//             value={status}
//             onChange={(e) => setStatus(e.target.value)}
//           >
//             <option value="ALL">{t("resall_status")}</option>
//             <option value="PLACED">{t("resplaced")}</option>
//             <option value="ACCEPTED">{t("resconfirmed")}</option>
//             <option value="OUT_FOR_DELIVERY">{t("resout_for_delivery")}</option>
//             <option value="DELIVERED">{t("resdelivered")}</option>
//             <option value="REJECTED">{t("resrejected")}</option>
            
//           </select>
//           <select
//             className="form-select"
//             value={dateRange}
//             onChange={(e) => setDateRange(e.target.value)}
//           >
//             <option value="7">{t("last7days")}</option>
//             <option value="30">{t("last30days")}</option>
//             <option value="90">{t("last3months")}</option>
//             <option value="all">{t("all")}</option>
//           </select>
//         </div>

//         <div className="filter_right">
//           <span className="orders_found">
//             {orders.length} {t("resorders_found")}
//           </span>
//         </div>
//       </div>

//       {/* TABLE */}
//       <div className="card mt-3">
//         <table className="table order_table">
//           <thead>
//             <tr>
//               <th>{t("resorder_id")}</th>
//               <th>{t("resdate")}</th>
//               <th>{t("resproducts")}</th>
//               <th>{t("restotal")}</th>
//               <th>{t("resstatus")}</th>
//               <th className="text-end">{t("resdaily")}</th>
//               <th className="text-end">{t("resaction")}</th>

//             </tr>
//           </thead>

//           <tbody>
//             {orders.length === 0 && (
//               <tr>
//                 <td colSpan="6" className="text-center py-4">
//                   {t("resno_orders")}
//                 </td>
//               </tr>
//             )}

//             {orders
//               .filter((o) => {

//                 // 🔍 SEARCH
//                 const matchesSearch =
//                   !search ||
//                   o.order_id?.toLowerCase().includes(search.toLowerCase());

//                 // 📦 STATUS
//                 const matchesStatus =
//                   status === "ALL" || o.status === status;

//                 // 📅 DATE LOGIC
//                 const orderDate = o.order_date
//                   ? new Date(o.order_date)
//                   : null;

//                 let matchesRange = true;

//                 if (dateRange !== "all") {
//                   const days = parseInt(dateRange);
//                   const pastDate = new Date();
//                   pastDate.setDate(pastDate.getDate() - days);

//                   matchesRange = orderDate && orderDate >= pastDate;
//                 }

//                 const matchesFrom =
//                   !fromDate || (orderDate && orderDate >= new Date(fromDate));

//                 const matchesTo =
//                   !toDate || (orderDate && orderDate <= new Date(toDate));

//                 return (
//                   matchesSearch &&
//                   matchesStatus &&
//                   matchesRange &&
//                   matchesFrom &&
//                   matchesTo
//                 );
//               })
//               .map((o) => (

//               <tr key={o.order_id}>
//                 <td
//                   dir="ltr"
//                   style={{
//                     textAlign: i18n.language === "ar" ? "right" : "left",
//                     unicodeBidi: "isolate",
//                     fontFamily: "monospace",
//                   }}
//                 >
//                   {formatOrderId(o.order_id)}
//                 </td>

//                 <td>
//                   {formatDateTime(o.order_date).date}
//                   <br />
//                   <small>{formatDateTime(o.order_date).time}</small>
//                 </td>

//                 <td>
//                   {o.items?.slice(0, 2).map((item, i) => (
//                     <div key={i}>
//                       {(i18n.language === "ar"
//                         ? item.product_name_arabic || item.product_name_english
//                         : item.product_name_english)} (x{item.quantity})
//                     </div>
//                   ))}
//                   {o.items?.length > 2 && (
//                     <small>
//                       +{o.items.length - 2} {localText.more}
//                     </small>
//                   )}
//                 </td>

//                 <td dir="ltr">
//                   {formatCurrency(o.total_amount)}
//                 </td>

//                 <td>
//                   <span className={`status_badge ${statusClass(o.status)}`}>
//                     {statusLabel(o.status)}
//                   </span>

//                     {o.is_recurring && (
//                       <span className="badge bg-dark ms-2">
//                         {localText.daily}
//                       </span>
//                     )}
//                 </td>

//                <td className="text-end">
//                   {o.status === "PLACED" && o.is_recurring !== true && (
//                           <button
//                             className="btn btn-success btn-sm me-2"
//                             onClick={() => {
//                               console.log("CLICKED MAKE DAILY");
//                               setSelectedOrder(o);
//                               setShowRecurringModal(true);
//                             }}
//                           >
//                             {t("resmake_daily")}
//                           </button>
//                         )}

//                         {o.is_recurring === true&& (
//                               <button
//                                 className="btn btn-secondary btn-sm me-2"
//                                 onClick={() => handlePauseRecurring(o.order_id)}
//                               >
//                                 {t("respause")}
//                               </button>
//                             )}
//                 </td>

//                 <td className="text-end">
//                   <button
//                     className="btn btn-primary btn-sm me-2"
//                     onClick={() => setDetailsOrderId(o.order_id)}
//                   >
//                     {t("resview")}
//                   </button>

//                   {o.status === "PLACED" && (
//                     <>
//                       <button
//                         className="btn btn-warning btn-sm me-2"
//                         onClick={() =>
//                           navigate(
//                             `/restaurantdashboard/edit-order/${o.order_id}`
//                           )
//                         }
//                       >
//                         {t("resmodify")}
//                       </button>
                      
//                       <button
//                         className="btn btn-danger btn-sm"
//                         onClick={() => handleCancel(o.order_id)}
//                       >
//                         {t("rescancel")}
//                       </button>
//                     </>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         {showRecurringModal && (
//   <div className="modal_overlay">
//     <div className="modal_box">

//       <h4>{t("resrecurring_setup")}</h4>

//       <div className="mb-3">
//         <label>{t("resfrequency")}</label>
//         <select
//           className="form-select"
//           value={frequency}
//           onChange={(e) => setFrequency(e.target.value)}
//         >
//           <option value="DAILY">{t("resdaily")}</option>
//           <option value="WEEKLY">{t("resweekly")}</option>
//         </select>
//       </div>
        
//         {frequency === "WEEKLY" && (
//           <div className="mb-3">
//             <label>{t("resselect_days")}</label>

//             /* REPLACE weekly days block */
//             <div className="weekday_grid">
//               {[
//                 { key: "MONDAY", label: t("monday") },
//                 { key: "TUESDAY", label: t("tuesday") },
//                 { key: "WEDNESDAY", label: t("wednesday") },
//                 { key: "THURSDAY", label: t("thursday") },
//                 { key: "FRIDAY", label: t("friday") },
//                 { key: "SATURDAY", label: t("saturday") },
//                 { key: "SUNDAY", label: t("sunday") },
//               ].map((day) => (
//                 <label key={day.key} className="weekday_option">
//                   <input
//                     type="checkbox"
//                     checked={weekdays.includes(day.key)}
//                     onChange={() => {
//                       if (weekdays.includes(day.key)) {
//                         setWeekdays(weekdays.filter((d) => d !== day.key));
//                       } else {
//                         setWeekdays([...weekdays, day.key]);
//                       }
//                     }}
//                   />
//                   {day.label}
//                 </label>
//               ))}
//             </div>
//           </div>
//         )}

//       <div className="mb-3">
//         <label>{t("resstart_date")}</label>
//         <input
//           type="date"
//           className="form-control"
//           value={startDate}
//           onChange={(e) => setStartDate(e.target.value)}
//         />
//       </div>

//       <div className="mb-3">
//         <label>{t("resend_date")}</label>
//         <input
//           type="date"
//           className="form-control"
//           value={endDate}
//           onChange={(e) => setEndDate(e.target.value)}
//         />
//       </div>

//       <div className="preview_box">
//         <small>
//           {frequency === "DAILY" &&
//             `${localText.repeatDaily} ${startDate}.`}

//           {frequency === "WEEKLY" &&
//             `${localText.repeatWeekly} ${weekdays.join(", ")} ${localText.repeatDaily} ${startDate}.`}
//         </small>
//       </div>

//       <div className="text-end mt-3">
//         <button
//           className="btn btn-secondary me-2"
//           onClick={() => setShowRecurringModal(false)}
//         >
//           {t("rescancel")}
//         </button>

//         <button
//           className="btn btn-success"
//           onClick={activateRecurring}
//         >
//           {t("resactivate")}
//         </button>
//       </div>

//     </div>
//   </div>
// )}

//       </div>
//     </div>
//   );
// }