import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const DashboardCharts = ({ stats }) => {

  console.log("DASHBOARD DATA:", stats); // 🔥 DEBUG

  // ---------------- MONTHLY SPEND ----------------
  const spendData = {
    labels: stats?.monthly_spend?.map(m => m.month) || [],
    datasets: [
      {
        label: "Monthly Spend (QAR)",
        data: stats?.monthly_spend?.map(m => m.total_spent) || [],
        borderColor: "#28a745",
        backgroundColor: "rgba(40,167,69,0.2)",
        tension: 0.4,
      },
    ],
  };

  // ---------------- ORDERS ----------------
  const ordersData = {
    labels: stats?.monthly_orders?.map(m => m.month) || [],
    datasets: [
      {
        label: "Orders",
        data: stats?.monthly_orders?.map(m => m.total_orders) || [],
        backgroundColor: "#ff7a00",
      },
    ],
  };

  // ---------------- TOP SUPPLIERS ----------------
const supplierData = {
  labels: stats?.supplier_spend?.map(s => s.supplier_name) || [],
  datasets: [
    {
      label: "Amount (QAR)",
      data: stats?.supplier_spend?.map(s => s.total_spent) || [],
      backgroundColor: "#007bff",
      yAxisID: "y",   // 👈 LEFT AXIS
    },
    {
      label: "Orders",
      data: stats?.supplier_spend?.map(s => s.total_orders) || [],
      backgroundColor: "#28a745",
      yAxisID: "y1",  // 👈 RIGHT AXIS
    },
  ],
};

  // ---------------- ORDER STATUS ----------------
  const statusData = {
    labels: stats?.order_status?.map(s => s.status) || [],
    datasets: [
      {
        data: stats?.order_status?.map(s => s.count) || [],
        backgroundColor: ["#ffc107", "#28a745", "#dc3545", "#17a2b8"],
      },
    ],
  };

  return (
    <div className="row mt-4">

      {/* MONTHLY SPEND */}
      <div className="col-lg-6">
        <div className="card" id="tour-monthly-spent">
          <div className="card-header">
            <h5>Monthly Spend</h5>
          </div>
          <div className="card-body">
            <Line data={spendData} />
          </div>
        </div>
      </div>

      {/* ORDERS */}
      <div className="col-lg-6">
        <div className="card" id="tour-Orders-overview">
          <div className="card-header" >
            <h5>Orders Overview</h5>
          </div>
          <div className="card-body">
            <Bar data={ordersData} />
          </div>
        </div>
      </div>

      {/* TOP SUPPLIERS */}
      <div className="col-lg-6 mt-4">
        <div className="card" id="tour-Top-suppliers">
          <div className="card-header">
            <h5>Top Suppliers</h5>
          </div>
          <div className="card-body">
            <Bar
              data={supplierData}
              options={{
                responsive: true,
                scales: {
                  y: {
                    type: "linear",
                    position: "left",
                    title: {
                      display: true,
                      text: "Amount (QAR)",
                    },
                  },
                  y1: {
                    type: "linear",
                    position: "right",
                    grid: {
                      drawOnChartArea: false,
                    },
                    title: {
                      display: true,
                      text: "Orders",
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* ORDER STATUS */}
      <div className="col-lg-6 mt-4">
        <div className="card" id="tour-Order-status">
          <div className="card-header">
            <h5>Order Status</h5>
          </div>
          <div className="card-body">
            <Pie data={statusData} />
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardCharts;