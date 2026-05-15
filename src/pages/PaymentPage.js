import React from "react";

import Header from "../components/Mahal/Header";
import Topbar from "../components/Mahal/Topbar";

// import PageBreadcrumb from "../components/PageBreadcrumb";

import Payment from "../components/Payment";

import Footer from "../components/Footer";

import ScrollToTopProgress from "../components/ScrollToTopProgress";

const PaymentPage = () => {
  return (
    <>
      <Topbar />  

      <Header />

      {/* <PageBreadcrumb title="Payment" /> */}

      <Payment />

      <Footer />

      <ScrollToTopProgress />
    </>
  );
};

export default PaymentPage ;
