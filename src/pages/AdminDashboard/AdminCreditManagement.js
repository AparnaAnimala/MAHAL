import React, { useEffect, useState } from "react";
import "../css/admincredit.css";
import {
  FiCreditCard,
  FiBarChart2,
  FiDollarSign,
  FiAlertTriangle,
  FiRotateCcw,
  FiHome,
  FiEye,
  FiSettings
} from "react-icons/fi";
const API = "http://192.168.2.9:5000/api";

export default function AdminCreditManagement() {

  const token = localStorage.getItem("admin_token"); // ✅ IMPORTANT

  const [restaurants, setRestaurants] = useState([]);
  const [summary, setSummary] = useState(null);

  const [selected, setSelected] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustRemarks, setAdjustRemarks] = useState("");
  const [showAdjust, setShowAdjust] = useState(false);
  const [showLedger, setShowLedger] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [usageFilter, setUsageFilter] = useState("ALL");
  const [adjustData, setAdjustData] = useState({
    amount: "",
    payment_mode: "CASH",
    remarks: "",
    receipt: null
  });


  const [editData, setEditData] = useState({
    credit_limit: 0,
    credit_days: 0,
    is_credit_blocked: false
  });

  /* ================= LOAD ================= */
  const loadData = async () => {
    try {

      const r1 = await fetch(`${API}/admin/credit/restaurants`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data1 = await r1.json();
      setRestaurants(Array.isArray(data1) ? data1 : []);

      const r2 = await fetch(`${API}/admin/credit/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data2 = await r2.json();
      setSummary(data2 || null);

    } catch (err) {
      console.error("LOAD ERROR:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  /* ================= UPDATE ================= */
  const updateCredit = async () => {

    await fetch(`${API}/admin/credit/update/${selected.restaurant_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(editData)
    });

    loadData();
    alert("Credit updated");
  };

  /* ================= ADJUST ================= */
  // const adjustCredit = async () => {

  //   if (!adjustData.amount) {
  //     alert("Enter amount");
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("restaurant_id", selected.restaurant_id);
  //   formData.append("amount", adjustData.amount);
  //   formData.append("payment_mode", adjustData.payment_mode);
  //   formData.append("remarks", adjustData.remarks);

  //   if (adjustData.receipt) {
  //     formData.append("receipt", adjustData.receipt);
  //   }

  //   await fetch(`${API}/admin/credit/adjust`, {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${token}`
  //     },
  //     body: formData
  //   });

  //   setShowAdjust(false);

  //   setAdjustData({
  //     amount: "",
  //     payment_mode: "CASH",
  //     remarks: "",
  //     receipt: null
  //   });

  //   loadData();
  //   alert("Payment adjusted successfully");
  // };

  const openPopup = async (restaurant) => {

    setSelected(restaurant);

    setEditData({
      credit_limit: restaurant.credit_limit,
      credit_days: restaurant.credit_days,
      is_credit_blocked: restaurant.is_credit_blocked
    });

    try {
      const res = await fetch(
        `${API}/admin/credit/ledger/${restaurant.restaurant_id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setLedger(data);
      } else {
        setLedger([]);
      }

    } catch (err) {
      console.error(err);
      setLedger([]);
    }
  };


  const filteredRestaurants = restaurants.filter(r => {

    // search
    if (
      search &&
      !r.restaurant_name_english
        .toLowerCase()
        .includes(search.toLowerCase())
    ) return false;

    // status filter
    if (statusFilter === "ACTIVE" && r.is_credit_blocked) return false;
    if (statusFilter === "BLOCKED" && !r.is_credit_blocked) return false;

    // usage filter
    if (usageFilter === "OVERUSED" && r.credit_used <= r.credit_limit) return false;
    if (usageFilter === "AVAILABLE" && r.credit_used >= r.credit_limit) return false;

    return true;
  });



  return (
    <div className="cm-page">

      {/* HEADER */}
      <div className="cm-header">
        <span className="cm-line"></span>

        <h2>
          Credit Management
        </h2>

        <span className="cm-line"></span>
      </div>

      {/* SUMMARY */}
      {summary && (
        <div className="cm-stat-grid">

          <div className="cm-stat-card">
            <div className="cm-stat-icon orange"><FiCreditCard /></div>
            <div>
              <div className="cm-stat-title">Total Limit</div>
              <div className="cm-stat-value">QAR {summary.total_limit}</div>
            </div>
          </div>

          <div className="cm-stat-card">
            <div className="cm-stat-icon blue"><FiBarChart2 /></div>
            <div>
              <div className="cm-stat-title">Total Used</div>
              <div className="cm-stat-value">QAR {summary.total_used}</div>
            </div>
          </div>

          <div className="cm-stat-card">
            <div className="cm-stat-icon green"><FiDollarSign /></div>
            <div>
              <div className="cm-stat-title">Total Available</div>
              <div className="cm-stat-value">QAR {summary.total_available}</div>
            </div>
          </div>

          <div className="cm-stat-card">
            <div className="cm-stat-icon red"><FiAlertTriangle /></div>
            <div>
              <div className="cm-stat-title">Overdue</div>
              <div className="cm-stat-value">{summary.overdue_accounts}</div>
            </div>
          </div>

        </div>
      )}

      {/* FILTER */}
      <div className="cm-filter-card">
        <div className="cm-filter-grid">

          <div>
            <label className="cm-label">Search</label>
            <input
              className="cm-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <label className="cm-label">Status</label>
            <select
              className="cm-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="ACTIVE">Active</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>

          <div>
            <label className="cm-label">Usage</label>
            <select
              className="cm-input"
              value={usageFilter}
              onChange={(e) => setUsageFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="OVERUSED">Over Limit</option>
              <option value="AVAILABLE">Within Limit</option>
            </select>
          </div>

          <button
            className="cm-reset-btn"
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
              setUsageFilter("ALL");
            }}
          >
            <FiRotateCcw />
          </button>

        </div>
      </div>

      {/* TABLE */}
      <div className="cm-table-card">
        <table className="cm-table">

          <thead>
            <tr>
              <th>Restaurant</th>
              <th>Limit</th>
              <th>Used</th>
              <th>Available</th>
              <th>Days</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filteredRestaurants.map(r => {

              const usagePercent =
                r.credit_limit > 0
                  ? Math.round((r.credit_used / r.credit_limit) * 100)
                  : 0;

              return (
                <tr key={r.restaurant_id}>

                  <td>
                    <div className="cm-restaurant">
                      <div className="cm-restaurant-icon">
                        <FiHome />
                      </div>
                      {r.restaurant_name_english}
                    </div>
                  </td>

                  <td>QAR {r.credit_limit}</td>

                  <td>
                    <div className="cm-usage">
                      <div>QAR {r.credit_used}</div>

                      <div className="cm-bar">
                        <div
                          className={`cm-fill ${usagePercent >= 90
                            ? "red"
                            : usagePercent >= 70
                              ? "orange"
                              : "green"
                            }`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>

                      <div className="cm-usage-text">
                        {usagePercent}%
                      </div>
                    </div>
                  </td>

                  <td className="text-success">
                    QAR {r.credit_available}
                  </td>

                  <td>{r.credit_days}d</td>

                  <td>

                    {r.is_credit_blocked && (
                      <span className="cm-pill overdue">Blocked</span>
                    )}

                    {r.is_overdue && (
                      <span className="cm-pill overdue">
                        Overdue ({r.overdue_days}d)
                      </span>
                    )}

                    {!r.is_overdue && r.is_due_soon && (
                      <span className="cm-pill warning">
                        Due in {r.next_due_in_days}d
                      </span>
                    )}

                    <span className="cm-pill success">
                      {usagePercent}% Used
                    </span>

                  </td>

                  <td>
                    <button
                      className="cm-manage-btn"
                      onClick={() => openPopup(r)}
                    >
                      <FiSettings className="me-1" />
                      Manage
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>
      </div>

      {/* ================= POPUP (UNCHANGED LOGIC, STYLED) ================= */}
      {selected && (
        <div className="modal_show">

          <div className="modal_box cm-modal">

            <div className="cm-modal-header">
              <h3>
                <FiSettings className="me-2" />
                Manage Credit — {selected.restaurant_name_english}
              </h3>

            </div>

            <div className="cm-modal-body">

              <div className="row">

                <div className="col-md-4">
                  <label>Credit Limit</label>
                  <input
                    className="cm-input"
                    value={editData.credit_limit}
                    onChange={e =>
                      setEditData({
                        ...editData,
                        credit_limit: e.target.value
                      })
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label>Credit Days</label>
                  <input
                    className="cm-input"
                    value={editData.credit_days}
                    onChange={e =>
                      setEditData({
                        ...editData,
                        credit_days: e.target.value
                      })
                    }
                  />
                </div>

                <div className="col-md-4 mt-4">
                  <label>
                    <input
                      type="checkbox"
                      checked={editData.is_credit_blocked}
                      onChange={e =>
                        setEditData({
                          ...editData,
                          is_credit_blocked: e.target.checked
                        })
                      }
                    />
                    Block Credit
                  </label>
                </div>

              </div>

              <div className="mt-3">
                <button
                  className="cm-manage-btn me-2"
                  onClick={updateCredit}
                >
                  Save Changes
                </button>

                <button
                  className="cm-reset-btn"
                  onClick={() => setSelected(null)}
                >
                  Close
                </button>
              </div>

              <hr />

              <button
                className="cm-manage-btn"
                onClick={() => setShowLedger(true)}
              >
                <FiEye className="me-1" />
                View History
              </button>
              {showLedger && (
                <div className="modal_show">

                  <div className="modal_box" style={{ width: 800 }}>

                    <h4>Transaction History</h4>

                    <table className="cm-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Type</th>
                          <th>Payment</th>
                          <th>Remarks</th>
                          <th>Receipt</th>
                        </tr>
                      </thead>

                      <tbody>
                        {ledger.map((l, i) => (
                          <tr key={i}>
                            <td>{l.created_at}</td>
                            <td>{l.amount}</td>
                            <td>{l.type}</td>
                            <td>{l.payment_mode}</td>
                            <td>{l.remarks}</td>

                            <td>
                              {l.receipt_filename && l.receipt_filename !== "" && (
                                l.type === "SETTLEMENT" ? (
                                  <a
                                    href={`${API}/admin/credit/settlement-receipt/${l.id}?token=${token}`}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    View
                                  </a>
                                ) : (
                                  <a
                                    href={`${API}/admin/credit/receipt/${l.id}?token=${token}`}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    View
                                  </a>
                                )
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="mt-3 text-end">
                      <button
                        className="cm-reset-btn"
                        onClick={() => setShowLedger(false)}
                      >
                        Close
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}