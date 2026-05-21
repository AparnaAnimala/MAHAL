import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
  ResponsiveContainer
} from "recharts";

import "../css/ControlTower.css";

const API = "http://192.168.2.22:5000/api/v1/admin/dashboard-metrics";

const COLORS = {
  Pending: "color-pending",
  Completed: "color-completed",
  Failed: "color-failed"
};

const formatCurrency = (val) =>
  `QAR ${Number(val || 0).toLocaleString("en-QA")}`;

const formatPercent = (val) =>
  `${Number(val || 0).toFixed(1)}%`;

const KpiCard = ({ title, value, highlight }) => (
  <div className={`kpi-card ${highlight || ""}`}>
    <div className="kpi-title">{title}</div>
    <div className="kpi-value">{value}</div>
  </div>
);

const normalizeStatusData = (data = []) => {
  const map = {};
  data.forEach((item) => {
    const key = item.status;
    if (!map[key]) map[key] = 0;
    map[key] += Number(item.total || 0);
  });

  return Object.keys(map).map((k) => ({
    status: k,
    total: map[k]
  }));
};

export default function ControlTower() {

  const [data, setData] = useState(null);
  const [range, setRange] = useState("7d");
  const token = localStorage.getItem("admin_token");

  const fetchData = () => {
    fetch(`${API}?range=${range}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  };

  useEffect(() => { fetchData(); }, [range]);

  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [range]);

  if (!data) return <div>Loading dashboard...</div>;

  const {
    kpis,
    order_trend,
    revenue_trend,
    order_status_distribution,
    top_suppliers,
    alerts,
    recent_activity,
    extra
  } = data;

  const pieData = normalizeStatusData(order_status_distribution);
  return (
    <div className="droid-container">
      <div className="page-center ">
        <div className="page-content ">
          <div className="ct-container">

            {/* ===== HEADER ===== */}
            <div className="droid-header">
              <div>
                <h2>📊 Control Tower</h2>
                <p>Real-time platform insights & monitoring</p>
              </div>

              <div className="header-actions">
                <button onClick={() => setRange("today")}>Today</button>
                <button onClick={() => setRange("7d")}>7 Days</button>
                <button onClick={() => setRange("month")}>Month</button>
              </div>
            </div>

            {/* ===== KPI ===== */}
            <div className="droid-kpis">
              <KpiCard title="Today Orders" value={kpis.today_orders} />
              <KpiCard title="Pending Orders" value={kpis.pending_orders} />
              <KpiCard title="Active Suppliers" value={kpis.active_suppliers} />
              <KpiCard title="Active Restaurants" value={kpis.active_restaurants} />
            </div>

            {/* ===== MAIN GRID ===== */}
            <div className="droid-main">

              {/* ===== LEFT SIDE ===== */}
              <div className="droid-left">

                {/* BIG CHART ONLY */}
                <div className="ct-card big">
                  <h4>Orders Trend</h4>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={order_trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="total" stroke="#6c63ff" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* TABLE MOVED HERE */}
                <div className="ct-card">
                  <h4>Recent Activity</h4>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent_activity.map((a, i) => (
                        <tr key={i}>
                          <td>{a.order_id}</td>
                          <td>{a.status}</td>
                          <td>{new Date(a.order_date).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>

              {/* ===== RIGHT SIDE ===== */}
              <div className="droid-right">

                {/* MOVED Revenue HERE */}
                <div className="ct-card">
                  <h4>Revenue Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={revenue_trend}>
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip formatter={(val) => formatCurrency(val)} />
                      <Bar dataKey="total" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="ct-card">
                  <h4>Order Status</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} dataKey="total" outerRadius={70}>
                        {pieData.map((entry, i) => (
                          <Cell key={i} className={COLORS[entry.status]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="ct-card">
                  <h4>Top Suppliers</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={top_suppliers}>
                      <XAxis dataKey="supplier_id" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total_orders" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* MOVED FINANCIAL HERE */}
                <div className="ct-card">
                  <h4>Financial & Health</h4>
                  <div className="kpi-financial-grid">
                    <KpiCard title="Credit Given" value={formatCurrency(kpis.credit_given)} />
                    <KpiCard title="Credit Collected" value={formatCurrency(kpis.credit_collected)} />
                    <KpiCard title="Outstanding Credit" value={formatCurrency(kpis.outstanding_credit)} />
                    <KpiCard title="Overdue Credit" value={formatCurrency(kpis.overdue_credit)} />
                    <KpiCard title="Avg Order Value" value={formatCurrency(kpis.avg_order_value)} />
                    <KpiCard title="Success Rate" value={formatPercent(kpis.success_rate)} />
                    <KpiCard title="Cancellation Rate" value={formatPercent(kpis.cancellation_rate)} />
                  </div>
                </div>

                <div className="ct-alert-card">
                  <h4>🚨 Needs Attention</h4>
                  <div className="alert-grid">
                    <div>⚠ Stuck Orders: {alerts.stuck_orders}</div>
                    <div>❌ Failed Payments: {alerts.failed_payments}</div>
                    <div>🕒 Pending Suppliers: {alerts.pending_suppliers}</div>
                    <div>🔥 High Priority Tickets: {alerts.high_priority_tickets}</div>
                    <div>⏱ SLA Breach: {alerts.sla_breach}</div>
                    <div>💰 Overdue Credit: {formatCurrency(alerts.overdue_credit)}</div>
                  </div>
                </div>

                <div className="ct-card">
                  <h4>⚡ System Insights</h4>
                  <div>⚠ Credit Risk Restaurants: {kpis.credit_risk_restaurants}</div>
                  <div>🚫 Inactive Suppliers: {extra?.inactive_suppliers}</div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}