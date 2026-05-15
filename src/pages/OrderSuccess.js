import React, {
  useEffect,
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

const OrderSuccess = () => {

  const navigate = useNavigate();

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  // ============================================
  // FETCH SUCCESS ORDERS
  // ============================================
  useEffect(() => {

    try {

      const storedOrders =
        localStorage.getItem(
          "success_orders"
        );

      console.log(
        "RAW STORAGE:",
        storedOrders
      );

      if (!storedOrders) {

        setError(true);
        setLoading(false);

        return;
      }

      const parsedOrders =
        JSON.parse(storedOrders);

      console.log(
        "PARSED ORDERS:",
        parsedOrders
      );

      // MULTIPLE ORDERS
      if (
        Array.isArray(parsedOrders)
      ) {

        setOrders(parsedOrders);

      }

      // SINGLE ORDER
      else if (
        parsedOrders &&
        typeof parsedOrders === "object"
      ) {

        setOrders([parsedOrders]);

      }

      else {

        setOrders([]);

      }

      // CLEAR STORAGE
      localStorage.removeItem(
        "success_orders"
      );

    } catch (err) {

      console.error(err);

      setError(true);

    } finally {

      setLoading(false);

    }

  }, []);

  // ============================================
  // ERROR REDIRECT
  // ============================================
  useEffect(() => {

    if (error) {

      console.log(
        "No order data"
      );

    }

  }, [error, navigate]);

  // ============================================
  // LOADING
  // ============================================
  if (loading) {

    return (

      <h3
        style={{
          textAlign: "center",
          marginTop: "50px"
        }}
      >
        Loading...
      </h3>

    );
  }

  // ============================================
  // EMPTY
  // ============================================
  if (!orders.length) {

    return (

      <section className="order_success_page">

        <div className="success_card">

          <div className="success_icon">
            <i className="fas fa-check"></i>
          </div>

          <h2>
            Order Placed Successfully 🎉
          </h2>

          <p>
            Your order has been confirmed
          </p>

          <h5
            style={{
              color: "#ff6600"
            }}
          >
            No Orders Found
          </h5>

          <div className="success_actions">

            <Link
              to="/restaurantoffers"
              className="success_btn"
            >
              Continue Shopping
            </Link>

          </div>

        </div>

      </section>

    );
  }

  // ============================================
  // GRAND TOTAL
  // ============================================
  const grandTotal =
    orders.reduce(
      (sum, o) =>
        sum +
        Number(
          o.amount || 0
        ),
      0
    ).toFixed(2);

  return (

    <section className="order_success_page">

      <div className="success_card">

        {/* SUCCESS ICON */}
        <div className="success_icon">
          <i className="fas fa-check"></i>
        </div>

        {/* HEADER */}
        <h2>
          Order Placed Successfully 🎉
        </h2>

        <p>
          Your order has been confirmed
        </p>

        <p>
          Your cart was automatically split into
          multiple supplier orders.
        </p>

        {/* ========================================= */}
        {/* SUPPLIER ORDERS */}
        {/* ========================================= */}

        <div className="supplier_orders_wrapper">

          {orders.map((ord, index) => (

            <div
              key={index}
              className="supplier_order_card"
            >

              {/* TOP */}
              <div className="supplier_top">

                <h5>

                  {
                    ord?.supplier_name_english ||
                    "Supplier"
                  }

                </h5>

                <span className="supplier_badge">

                  Supplier Order

                </span>

              </div>

              {/* DETAILS */}
              <div className="supplier_details">

              <p>
  Reference ID:
  <span className="reference_id">
    {orders[0]?.master_order_id}
  </span>
</p>

                <p>

                  <b>Order ID:</b>

                  {" "}
                  #{ord?.order_id}

                </p>

                <p>

                  <b>Payment Method:</b>

                  {" "}
                  {ord?.payment_method || "COD"}

                </p>

                <p>

                  <b>Supplier Amount:</b>

                  {" "}
                  QAR {

                    Number(
                      ord?.amount || 0
                    ).toFixed(2)

                  }

                </p>

              </div>

            </div>

          ))}

        </div>

        {/* ========================================= */}
        {/* SUMMARY */}
        {/* ========================================= */}

        <div className="success_summary">

          <h4>

            Total Supplier Orders:

            <span style={{
              color: "#ff6600"
            }}>

              {" "}
              {orders.length}

            </span>

          </h4>

          <h3>

            Grand Total:

            <span style={{
              color: "#28a745"
            }}>

              {" "}
              QAR {grandTotal}

            </span>

          </h3>

        </div>

        {/* ========================================= */}
        {/* ACTIONS */}
        {/* ========================================= */}

        <div className="success_actions">

          <Link
            to="/restaurantoffers"
            className="success_btn"
          >
            Continue Shopping
          </Link>

          <Link
            to="/restaurantdashboard/orders"
            className="success_btn outline"
          >
            View Orders
          </Link>

        </div>

      </div>

    </section>
  );
};

export default OrderSuccess;