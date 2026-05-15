import React from "react";
// import Header from "../components/Header";
import Header from "../components/Mahal/Header";
import Topbar from "../components/Mahal/Topbar";
import PageBreadcrumb from "../components/About/PageBreadcrumb";
import Wishlistitems from "./Wishlistitems";


import Footer from "../components/Footer";
import ScrollToTopProgress from "../components/ScrollToTopProgress";

const Wishlist = () => {
  return (
    <>
        <Topbar />
      <Header />
      {/* <Header /> */}

      {/* <PageBreadcrumb title="Wishlist" /> */}

     <Wishlistitems />

      <Footer />

      <ScrollToTopProgress />

    </>
  );
};

export default Wishlist;
