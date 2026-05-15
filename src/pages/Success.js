// import React from "react";
// import Header from "../components/Header";
// import PageBreadcrumb from "../components/About/PageBreadcrumb";
// import OrderSuccess from "./OrderSuccess";


// import Footer from "../components/Footer";
// import ScrollToTopProgress from "../components/ScrollToTopProgress";

// const  Success = () => {
//   return (
//     <>

//       <Header />

//       <PageBreadcrumb title="Order Success" />

//      <OrderSuccess />

//       <Footer />

//       <ScrollToTopProgress />

//     </>
//   );
// };

// export default Success;




import React from "react";
// import Header from "../components/Header";
import Header from "../components/Mahal/Header";
import Topbar from "../components/Mahal/Topbar";
import PageBreadcrumb from "../components/About/PageBreadcrumb";
import Footer from "../components/Footer";
import ScrollToTopProgress from "../components/ScrollToTopProgress";

// ⚠️ OrderSuccess import untouched
import OrderSuccess from "./OrderSuccess";

const Success = () => {
  return (
    <>
          <Topbar />
      <Header />
      {/* <PageBreadcrumb title="Order Success" /> */}

      {/* ⛔ duplicate mount prevent */}
      <OrderSuccess />

      <Footer />
      <ScrollToTopProgress />
    </>
  );
};

export default Success;



