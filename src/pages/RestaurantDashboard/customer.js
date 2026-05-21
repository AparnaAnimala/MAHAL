import React, { useEffect, useState } from "react";

const CustomersPage = () => {
    const [viewCustomer, setViewCustomer] = useState(null);

  const customers = [
    {
      id: 1,
      name: "Arun Kumar",
      phone: "9876543210",
      email: "arun@gmail.com",
      orders: 12,
      spent: 5400,
      status: "Active"
    },
    {
      id: 2,
      name: "Priya Sharma",
      phone: "9123456780",
      email: "priya@gmail.com",
      orders: 5,
      spent: 2100,
      status: "Active"
    },
    {
      id: 3,
      name: "Mohammed Ali",
      phone: "9988776655",
      email: "ali@gmail.com",
      orders: 2,
      spent: 650,
      status: "Inactive"
    }
  ];

  return (
    <div className="customers-wrapper">

      <h2 className="page-title">👥 Customers</h2>

      {/* ===== STATS ===== */}
      <div className="customer-stats">

        <div className="stat-card">
          <h3>320</h3>
          <p>Total Customers</p>
        </div>

        <div className="stat-card">
          <h3>25</h3>
          <p>New This Month</p>
        </div>

        <div className="stat-card">
          <h3>180</h3>
          <p>Active Customers</p>
        </div>

        <div className="stat-card">
          <h3>QAR  1,25,000</h3>
          <p>Total Revenue</p>
        </div>

      </div>


      {/* ===== SEARCH ===== */}
      <div className="customer-toolbar">

        <input
          type="text"
          placeholder="Search customers..."
          className="search-input"
        />

        <select className="filter-select">
          <option>All</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>

      </div>


      {/* ===== TABLE ===== */}
      <div className="customer-table">

        <div className="table-header">
          <div>Customer</div>
          <div>Phone</div>
          <div>Orders</div>
          <div>Total Spent</div>
          <div>Status</div>
          <div>Action</div>
        </div>

        {customers.map(c => (
          <div className="table-row" key={c.id}>

            <div className="customer-info">
              <div className="avatar">
                {c.name.charAt(0)}
              </div>
              <div>
                <b>{c.name}</b>
                <p>{c.email}</p>
              </div>
            </div>

            <div>{c.phone}</div>

            <div>{c.orders}</div>

            <div>QAR  {c.spent}</div>

            <div>
              <span className={`status ${c.status}`}>
                {c.status}
              </span>
            </div>

            <div>
              <button
                className="view-btn"
                onClick={() => setViewCustomer(c)}
                >
                View
                </button>
            </div>

          </div>
        ))}

      </div>
        {viewCustomer && (

  <div className="modal-backdrop">

    <div className="customer-modal">

      <h3>Customer Details</h3>

      <div className="customer-profile">

        <div className="avatar large">
          {viewCustomer.name.charAt(0)}
        </div>

        <div>
          <h4>{viewCustomer.name}</h4>
          <p>{viewCustomer.phone}</p>
          <p>{viewCustomer.email}</p>
        </div>

      </div>


      <div className="customer-stats-box">

        <div>
          <span>Total Orders</span>
          <b>{viewCustomer.orders}</b>
        </div>

        <div>
          <span>Total Spent</span>
          <b>QAR  {viewCustomer.spent}</b>
        </div>

      </div>


      {/* Actions */}
      <div className="modal-actions">

        <a
          href={`tel:${viewCustomer.phone}`}
          className="action-btn call"
        >
          📞 Call
        </a>

        <a
          href={`https://wa.me/91${viewCustomer.phone}`}
          target="_blank"
          rel="noreferrer"
          className="action-btn whatsapp"
        >
          💬 WhatsApp
        </a>

        <button
          className="action-btn close"
          onClick={() => setViewCustomer(null)}
        >
          Close
        </button>

      </div>

    </div>

  </div>
)}

    </div>
  );
};

export default CustomersPage;
