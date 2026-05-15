// import React, { useState } from "react";
// import { LocationContext } from "./pages/LocationContext";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import "leaflet/dist/leaflet.css";

// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";

// // pages
// import Home from "./pages/Home";
// import Restaurants from "./pages/Restaurants";
// import Suppliers from "./pages/Suppliers";
// import About from "./pages/About";
// import Blog from "./pages/Blog";
// import CategorieList from "./pages/CategorieList";
// import Contact from "./pages/Contact";
// import ShopDetails from "./pages/ShopDetails";
// import CartView from "./pages/Cart";
// import Checkout from "./pages/CheckItems";
// import Payment from "./pages/PaymentPage";
// import Wishlist from "./pages/Wishlist";
// import Wishlistitems from "./pages/Wishlistitems";
// import OrderSuccess from "./pages/OrderSuccess"; 
// import Success from "./pages/Success"; 
// // components
// import RelatedProducts from "./components/RelatedProducts";

// // auth pages
// import SupplierLogIn from "./pages/SupplierLogIn";
// import RestaurantLogIn from "./pages/RestaurantLogIn";
// import Registration from "./pages/Registration";
// import OtpVerification from "./pages/OtpVerification";
// import RestaurantOffers from"./pages/RestaurantOffers";

// // DASHBOARD
// import DashboardHome from "./pages/SupplierDashboard/DashboardHome";
// import DashboardLayout from "./pages/SupplierDashboard/DashboardLayout";
// import MyProducts from "./pages/SupplierDashboard/Products";
// import AddProduct from "./pages/SupplierDashboard/AddProduct";
// import Offers from "./pages/SupplierDashboard/Offers";
// import Orders from "./pages/SupplierDashboard/Orders";
// import Invoice from "./pages/SupplierDashboard/Invoice";
// import ReceiptManager from "./pages/SupplierDashboard/ReceiptManager";
// import Help from "./pages/SupplierDashboard/Help";
// import Reports from "./pages/SupplierDashboard/Reports";
// import OrderIssues from "./pages/SupplierDashboard/OrderIssues";
// import DriverTracking from "./pages/SupplierDashboard/DriverTracking";
// import SupplierTrack from "./pages/SupplierDashboard/SupplierTrack";
// import DeliveryBoys from "./pages/SupplierDashboard/DeliveryBoys";


// import Documentation from "./pages/SupplierDashboard/Documentation";
// /* ================= RESTAURANT DASHBOARD ================= */
// import RestaurantDashboardLayout from "./pages/RestaurantDashboard/DashboardLayout";
// import RestaurantDashboardHome from "./pages/RestaurantDashboard/DashboardHome";
// import RestaurantOrders from "./pages/RestaurantDashboard/Orders";
// import OrderDetails from "./pages/RestaurantDashboard/OrderDetails";
// import TrackOrder from "./pages/RestaurantDashboard/TrackOrder";
// import MenuItems from "./pages/RestaurantDashboard/MenuItems";
// import RestaurantInventory from "./pages/RestaurantDashboard/RestaurantInventory";
// // import MenuMasterForm from "./pages/RestaurantDashboard/MenuMasterForm";
// import RecipeMaster from "./pages/RestaurantDashboard/RecipeMaster";
// import RestaurantModificationRequests from "./pages/RestaurantDashboard/RestaurantModificationRequests";
// import ProfileSetup from "./pages/ProfileSetup";
// import InvoiceForm from "./pages/RestaurantDashboard/RestaurantInvoiceForm";
// import CreateGRN from "./pages/RestaurantDashboard/CreateGRN";
// import GRNList from "./pages/RestaurantDashboard/GRNList";
// import OrderIssue from "./pages/RestaurantDashboard/OrderIssue";
// import OrderIssueList from "./pages/RestaurantDashboard/OrderIssueList";
// import Notifications from "./components/Dashboard/Notifications";
// import RestaurantHelp from "./pages/RestaurantDashboard/Help";
// import RestaurantDocumentation from "./pages/RestaurantDashboard/Documentation";
// import IssueToKitchen from "./pages/RestaurantDashboard/IssueToKitchen";
// import RatingsAndReviews from "./pages/RestaurantDashboard/RatingsAndReviews";
// import RestaurantNotifications from "./components/RestaurantDashboard/RestaurantNotifications";
// import RestaurantReports from "./pages/RestaurantDashboard/RestaurantReports";
// import CustomersPage from "./pages/RestaurantDashboard/customer";

// import AdminDashboardLayout from "./pages/AdminDashboard/AdminDashboardLayout";
// import AdminLogin from "./pages/AdminDashboard/AdminLogin";
// import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
// import AdminGuard from "./pages/AdminDashboard/AdminGuard";

// /* ========== SUPPLIER PROFILE ========== */
// import SupplierProfileLayout from "./pages/MyProfile/Supplier/SupplierProfileLayout";
// import SupplierOverview from "./pages/MyProfile/Supplier/Overview";
// import SupplierBasicInfo from "./pages/MyProfile/Supplier/BasicInfo";
// import SupplierCompanyInfo from "./pages/MyProfile/Supplier/CompanyInfo";
// import SupplierAddress from "./pages/MyProfile/Supplier/Address";
// import SupplierBankDetails from "./pages/MyProfile/Supplier/BankDetails";
// import SupplierDocuments from "./pages/MyProfile/Supplier/Documents";
// import SupplierBranches from "./pages/MyProfile/Supplier/Branches";
// import SupplierSettings from "./pages/MyProfile/Supplier/Settings";


// /* ========== Restuarent PROFILE ========== */
// import RestaurantProfileLayout from "./pages/MyProfile/Restuarent/RestaurantProfileLayout";
// import RestaurantOverview from "./pages/MyProfile/Restuarent/Overview";
// import RestaurantBasicInfo from "./pages/MyProfile/Restuarent/BasicInfo";
// import RestaurantCompanyInfo from "./pages/MyProfile/Restuarent/CompanyInfo";
// import RestaurantAddress from "./pages/MyProfile/Restuarent/Address";
// import RestaurantBankDetails from "./pages/MyProfile/Restuarent/BankDetails";
// import RestaurantDocuments from "./pages/MyProfile/Restuarent/Documents";
// import RestaurantBranches from "./pages/MyProfile/Restuarent/Branches";
// import RestaurantStore from "./pages/MyProfile/Restuarent/RestaurantStore";
// import RestaurantSettings from "./pages/MyProfile/Restuarent/Settings";

// // styles
// import "./styles/style.css";

// function App() {
//   const [locationName, setLocationName] = useState("");
//   return (
//     <LocationContext.Provider value={{ locationName, setLocationName }}>
//       <BrowserRouter>
//       <Routes>
//         {/* NORMAL WEBSITE */}
//         <Route path="/" element={<Home />} />
//         <Route path="/restaurants" element={<Restaurants />} />
//         <Route path="/suppliers" element={<Suppliers />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/blog" element={<Blog />} />
//         {/* <Route path="/categorielist" element={<CategorieList />} /> */}
//         <Route path="/contact" element={<Contact />} />
          

//     <Route path="cartview" element={<CartView />} />
//            <Route path="shopdetails/:productId" element={<ShopDetails />} />
//           <Route path="checkout" element={<Checkout />} />
//           <Route path="payment" element={<Payment />} />
//           <Route path="restaurantoffers" element={<RestaurantOffers />} />
//           <Route path="wishlist" element={<Wishlist />} />
//           <Route path="wishlistitems" element={<Wishlistitems />} />
//           <Route path="ordersuccess" element={<OrderSuccess />} />
//           <Route path="categorielist" element={<CategorieList />} />
//           <Route path="success" element={<Success />} />
//         {/* AUTH */}
//         <Route path="/supplierlogin" element={<SupplierLogIn />} />
//         <Route path="/restaurantlogin" element={<RestaurantLogIn />} />
//         <Route path="/registration" element={<Registration />} />
//         <Route path="/otpverification" element={<OtpVerification />} />
//          <Route path="/admin/login" element={<AdminLogin />} />
//         <Route
//             path="/admin/profile/:role/:id"
//             element={<ProfileSetup adminEdit={true} />}
//           />

//           {/* DRIVER TRACKING PUBLIC LINK */}
//           <Route path="/driver" element={<DriverTracking />} />


//         {/* DASHBOARD   */}
//         <Route path="/dashboard" element={<DashboardLayout />}>

//   {/* DEFAULT PAGE */}
//   <Route index element={<DashboardHome />} />

//   <Route path="products" element={<MyProducts />} />
//   <Route path="add-product" element={<AddProduct />} />
//   <Route path="offers" element={<Offers />} />
//   <Route path="orders" element={<Orders />} />
//   <Route path="invoice" element={<Invoice />} />
//   <Route path="receipt-manager" element={<ReceiptManager />} />
//   <Route path="help" element={<Help />} />
//   <Route path="documentation" element={<Documentation />} />
//   <Route path="order-issues" element={<OrderIssues />} />
//   <Route path="reports" element={<Reports />} />
//   <Route path="notifications" element={<Notifications />} />
//   <Route path="track/:orderId" element={<SupplierTrack />} />
//   <Route path="/dashboard/delivery-boys" element={<DeliveryBoys />} />



// </Route>

// {/* ========== RESTAURANT DASHBOARD ========== */}
//         <Route
//           path="/restaurantdashboard/*"
//           element={<RestaurantDashboardLayout />}
//         >
//           <Route index element={<RestaurantDashboardHome />} />
//           <Route path="orders" element={<RestaurantOrders />} />
//           <Route path="orders/:id" element={<OrderDetails />} />
//           <Route path="orders/:id/track" element={<TrackOrder />} />
//           <Route path="menu-items" element={<MenuItems />} />
//           <Route path="inventory" element={<RestaurantInventory />} />
//           {/* <Route path="menu-master" element={<MenuMasterForm />} /> */}
//           <Route path="receipe-master" element={<RecipeMaster/>} />
//           <Route path="RestaurantModificationRequests" element={<RestaurantModificationRequests />}/>
//           {/* 🔥 ADD THIS */}
    
//             <Route path="invoice" element={<Invoice />} />
         
//           <Route path="invoices" element={<InvoiceForm />}/>
//           <Route path="orders" element={<Orders />} />
//           <Route path="orders/:orderId" element={<OrderDetails />} />
//           <Route path="grn" element={<GRNList />} />
//           <Route path="grn/:orderId" element={<CreateGRN />} />
//           <Route path="issues" element={<OrderIssueList />} />
//           <Route path="issues/:orderId" element={<OrderIssue />} />
//           <Route path="help" element={<RestaurantHelp />}/>
//           <Route path="documentation"element={<RestaurantDocumentation />}/>
//           <Route  path="issue-to-kitchen" element={<IssueToKitchen />}/>
//           <Route path="reviews" element={<RatingsAndReviews />}/>
//           <Route path="notifications" element={<RestaurantNotifications />} />
//           <Route path="reports" element={<RestaurantReports />} />
//           <Route path="customers" element={<CustomersPage/>} />



//         </Route>

//     {/* ========== ADMIN DASHBOARD ========== */}
//       <Route
//         path="/admin/dashboard"
//         element={
//           <AdminGuard>
//             <AdminDashboardLayout />
//           </AdminGuard>
//         }
//       >
//         <Route index element={<AdminDashboard />} />
        
//       </Route>
      
// {/* ========== SUPPLIER PROFILE ========== */}
// <Route path="/my-profile/supplier" element={<SupplierProfileLayout />}>
//   <Route index element={<SupplierOverview />} />
//   <Route path="basic" element={<SupplierBasicInfo />} />
//   <Route path="company" element={<SupplierCompanyInfo />} />
//   <Route path="address" element={<SupplierAddress />} />
//   <Route path="bank" element={<SupplierBankDetails />} />
//   <Route path="documents" element={<SupplierDocuments />} />
//   <Route path="branches" element={<SupplierBranches />} />
//   <Route path="settings" element={<SupplierSettings />} />
// </Route>


// {/* ========== Restuarent PROFILE ========== */}
// <Route path="/my-profile/restuarent" element={<RestaurantProfileLayout />}>
//   <Route index element={<RestaurantOverview />} />
//   <Route path="basic" element={<RestaurantBasicInfo />} />
//   <Route path="company" element={<RestaurantCompanyInfo />} />
//   <Route path="address" element={<RestaurantAddress />} />
//   <Route path="bank" element={<RestaurantBankDetails />} />
//   <Route path="documents" element={<RestaurantDocuments />} />
//   <Route path="branches" element={<RestaurantBranches />} />
//     <Route path="store" element={<RestaurantStore />} />
//   <Route path="settings" element={<RestaurantSettings />} />
// </Route>
//       </Routes>
//     </BrowserRouter>
//     </LocationContext.Provider>
//   );
// }

// export default App;





import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LocationContext } from "./pages/LocationContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// pages
import Home from "./pages/Home";
import Restaurants from "./pages/Restaurants";
import Suppliers from "./pages/Suppliers";
import About from "./pages/About";
import Blog from "./pages/Blog";
import CategorieList from "./pages/CategorieList";
import Contact from "./pages/Contact";
import ShopDetails from "./pages/ShopDetails";
import CartView from "./pages/Cart";
import Checkout from "./pages/CheckItems";
import Payment from "./pages/PaymentPage";
import Wishlist from "./pages/Wishlist";
import Wishlistitems from "./pages/Wishlistitems";
import OrderSuccess from "./pages/OrderSuccess";
import Success from "./pages/Success";

// auth
import SupplierLogIn from "./pages/SupplierLogIn";
import RestaurantLogIn from "./pages/RestaurantLogIn";
import Registration from "./pages/Registration";
import OtpVerification from "./pages/OtpVerification";
import RestaurantOffers from "./pages/RestaurantOffers";
import SupportTickets from "./pages/SupportTickets";

// Supplier Dashboard
import DashboardHome from "./pages/SupplierDashboard/DashboardHome";
import DashboardLayout from "./pages/SupplierDashboard/DashboardLayout";
import MyProducts from "./pages/SupplierDashboard/Products";
import AddProduct from "./pages/SupplierDashboard/AddProduct";
import Offers from "./pages/SupplierDashboard/Offers";
import Orders from "./pages/SupplierDashboard/Orders";
import Invoice from "./pages/SupplierDashboard/Invoice";
import ReceiptManager from "./pages/SupplierDashboard/ReceiptManager";
import Help from "./pages/SupplierDashboard/Help";
import Reports from "./pages/SupplierDashboard/Reports";
import OrderIssues from "./pages/SupplierDashboard/OrderIssues";
import DriverTracking from "./pages/SupplierDashboard/DriverTracking";
import SupplierTrack from "./pages/SupplierDashboard/SupplierTrack";
import DeliveryBoys from "./pages/SupplierDashboard/DeliveryBoys";
import Documentation from "./pages/SupplierDashboard/Documentation";
import SupplierPromotionReview from "./components/Dashboard/SupplierPromotionReview";
import SupplierPromotionList from "./components/Dashboard/SupplierPromotionList";
import SupplierPromotionRequest from "./pages/SupplierPromotionRequest";
import SupplierCreditWallet from "./pages/SupplierDashboard/SupplierCreditWallet";
// Restaurant Dashboard
import RestaurantDashboardLayout from "./pages/RestaurantDashboard/DashboardLayout";
import RestaurantDashboardHome from "./pages/RestaurantDashboard/DashboardHome";
import RestaurantOrders from "./pages/RestaurantDashboard/Orders";
import OrderDetails from "./pages/RestaurantDashboard/OrderDetails";
import TrackOrder from "./pages/RestaurantDashboard/TrackOrder";
import MenuItems from "./pages/RestaurantDashboard/MenuItems";
import RestaurantInventory from "./pages/RestaurantDashboard/RestaurantInventory";
import RecipeMaster from "./pages/RestaurantDashboard/RecipeMaster";
import RestaurantModificationRequests from "./pages/RestaurantDashboard/RestaurantModificationRequests";
import InvoiceForm from "./pages/RestaurantDashboard/RestaurantInvoiceForm";
import CreateGRN from "./pages/RestaurantDashboard/CreateGRN";
import GRNList from "./pages/RestaurantDashboard/GRNList";
import OrderIssue from "./pages/RestaurantDashboard/OrderIssue";
import OrderIssueList from "./pages/RestaurantDashboard/OrderIssueList";
import RestaurantHelp from "./pages/RestaurantDashboard/Help";
import RestaurantDocumentation from "./pages/RestaurantDashboard/Documentation";
import IssueToKitchen from "./pages/RestaurantDashboard/IssueToKitchen";
import RatingsAndReviews from "./pages/RestaurantDashboard/RatingsAndReviews";
import RestaurantNotifications from "./components/RestaurantDashboard/RestaurantNotifications";
import RestaurantReports from "./pages/RestaurantDashboard/RestaurantReports";
import CustomersPage from "./pages/RestaurantDashboard/customer";
import RestaurantCreditWallet from "./pages/RestaurantDashboard/RestaurantCreditWallet";
import Notifications from "./components/Dashboard/Notifications";

// Admin
import AdminDashboardLayout from "./pages/AdminDashboard/AdminDashboardLayout";
import AdminLogin from "./pages/AdminDashboard/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import AdminGuard from "./pages/AdminDashboard/AdminGuard";
import AdminCreditSettlement from "./pages/AdminDashboard/AdminCreditSettlement";
import AdminCreditManagement from "./pages/AdminDashboard/AdminCreditManagement";
import AdminSupplierPayments from "./pages/AdminDashboard/AdminSupplierPayments";
import AdminSupplierPromotionRequests from "./pages/AdminSupplierPromotionRequests";
import AdminNotifications from "./pages/AdminDashboard/AdminNotifications";
import ManagePaidPromotions from "./pages/AdminDashboard/ManagePaidPromotions";
import AdminPromotionReview from "./pages/AdminPromotionReview";
import AdminRestaurantReview from "./pages/AdminRestaurantReview";
import EditOrder from "./pages/RestaurantDashboard/EditOrder";
import AdminCreateUser from "./pages/AdminDashboard/AdminCreateUser";
// profile
import RestaurantProfileLayout from "./pages/MyProfile/Profile/RestaurantProfileLayout";
import RestaurantOverview from "./pages/MyProfile/Profile/Overview";
import RestaurantBasicInfo from "./pages/MyProfile/Profile/BasicInfo";
import RestaurantCompanyInfo from "./pages/MyProfile/Profile/CompanyInfo";
import RestaurantAddress from "./pages/MyProfile/Profile/Address";
import RestaurantBankDetails from "./pages/MyProfile/Profile/BankDetails";
import RestaurantDocuments from "./pages/MyProfile/Profile/Documents";
import RestaurantBranches from "./pages/MyProfile/Profile/Branches";
import RestaurantStore from "./pages/MyProfile/Profile/RestaurantStore";
import RestaurantSettings from "./pages/MyProfile/Profile/Settings";
import SupplierPromotionGrid from "./pages/AdminDashboard/SupplierPromotionGrid";
// Styles
import "./styles/style.css";



function App() {
  const [locationName, setLocationName] = useState("");

  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  useEffect(() => {
    const lang = localStorage.getItem("lang") || "en";
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, []);

  return (
    <LocationContext.Provider value={{ locationName, setLocationName }}>
      <BrowserRouter>
        <Routes>

          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/categorielist" element={<CategorieList />} />
          <Route path="/supplier-promotions/:promotionId" element={<CategorieList />} />
          <Route path="/cartview" element={<CartView />} />
          <Route path="/shopdetails/:productId" element={<ShopDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/restaurantoffers" element={<RestaurantOffers />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/wishlistitems" element={<Wishlistitems />} />
          {/* <Route path="/ordersuccess" element={<OrderSuccess />} /> */}
          <Route path="/success" element={<Success />} />

          {/* AUTH */}
          <Route path="/supplierlogin" element={<SupplierLogIn />} />
          <Route path="/restaurantlogin" element={<RestaurantLogIn />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/otpverification" element={<OtpVerification />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/driver" element={<DriverTracking />} />

          {/* SUPPLIER DASHBOARD */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="support" element={<SupportTickets />} />
            <Route path="products" element={<MyProducts />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="offers" element={<Offers />} />
            <Route path="orders" element={<Orders />} />
            <Route path="invoice" element={<Invoice />} />
            <Route path="receipt-manager" element={<ReceiptManager />} />
            <Route path="help" element={<Help />} />
            <Route path="documentation" element={<Documentation />} />
            <Route path="order-issues" element={<OrderIssues />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="reports" element={<Reports />} />
            <Route path="track/:orderId" element={<SupplierTrack />} />
            <Route path="delivery-boys" element={<DeliveryBoys />} />
                      <Route
              path="promotion-request"
              element={<SupplierPromotionRequest />}
            />
            {/* <Route path="promotion-request/:promoId" element={<SupplierPromotionReview />} /> */}
            <Route
              path="promotion-review"
              element={<SupplierPromotionList />}
            />
            <Route
              path="promotion-review/:promoId"
              element={<SupplierPromotionReview />}
            />
            <Route path="credit-wallet" element={<SupplierCreditWallet />} />
          </Route>

          {/* RESTAURANT DASHBOARD */}
          <Route path="/restaurantdashboard" element={<RestaurantDashboardLayout />}>
          
            <Route index element={<RestaurantDashboardHome />} />
            <Route path="orders" element={<RestaurantOrders />} />
            <Route path="support" element={<SupportTickets />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="orders/:id/track" element={<TrackOrder />} />
            <Route path="menu-items" element={<MenuItems />} />
            <Route path="inventory" element={<RestaurantInventory />} />
            <Route path="receipe-master" element={<RecipeMaster />} />
            <Route
              path="RestaurantModificationRequests"
              element={<RestaurantModificationRequests />}
            />
            <Route path="invoice" element={<Invoice />} />
           
            <Route path="edit-order/:orderId" element={<EditOrder />} />
            <Route path="invoices" element={<InvoiceForm />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:orderId" element={<OrderDetails />} />
            <Route path="grn" element={<GRNList />} />
            <Route path="grn/:orderId" element={<CreateGRN />} />
            <Route path="issues" element={<OrderIssueList />} />
            <Route path="issues/:orderId" element={<OrderIssue />} />
            <Route path="help" element={<RestaurantHelp />} />
            <Route path="documentation" element={<RestaurantDocumentation />} />
            <Route path="issue-to-kitchen" element={<IssueToKitchen />} />
            <Route path="reviews" element={<RatingsAndReviews />} />
            <Route path="notifications" element={<RestaurantNotifications />} />
            <Route path="reports" element={<RestaurantReports />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="credit-wallet" element={<RestaurantCreditWallet />} />
          </Route>

          {/* ========== ADMIN DASHBOARD ========== */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminGuard>
                <AdminDashboardLayout />
              </AdminGuard>
            }
          >
            <Route index element={<AdminDashboard />} />

            <Route
              path="promotion-requests"
              element={<AdminSupplierPromotionRequests />}
            />
            <Route path="promotion-review" element={<AdminPromotionReview />} />
            <Route
              path="restaurant-review"
              element={<AdminRestaurantReview />}
            />
            <Route path="create-user" element={<AdminCreateUser />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="credit" element={<AdminCreditManagement />} />
            <Route
              path="credit-settlement"
              element={<AdminCreditSettlement />}
            />
            <Route
              path="supplier-payments"
              element={<AdminSupplierPayments />}
            />
            
            <Route path="promotions" element={<ManagePaidPromotions />} />

            <Route path="paid-promotions" element={<AdminDashboard />} />
            <Route path="coupons" element={<AdminDashboard />} />
            <Route path="support" element={<AdminDashboard />} />
          </Route>
          {/* ========== Restuarent PROFILE ========== */}
          <Route
            path="/profile/:role/:id"
            element={<RestaurantProfileLayout />}
          >
            <Route path="/profile/:role/:id" element={<RestaurantProfileLayout />}></Route>
            <Route index element={<RestaurantOverview />} />
            <Route path="overview" element={<RestaurantOverview />} />
            <Route path="company" element={<RestaurantCompanyInfo />} />
            <Route path="address" element={<RestaurantAddress />} />
            <Route path="bank" element={<RestaurantBankDetails />} />
            <Route path="documents" element={<RestaurantDocuments />} />
            <Route path="branches" element={<RestaurantBranches />} />
            <Route path="store" element={<RestaurantStore />} />
            <Route path="settings" element={<RestaurantSettings />} />
            <Route
              path="basic"
              element={
                <RestaurantBasicInfo
                  roleLower={localStorage.getItem("role")}
                  id={localStorage.getItem("linked_id")}
                />
              }
            />
          </Route>

          <Route
            path="/admin/profile/:role/:id"
            element={
              <AdminGuard>
                <RestaurantProfileLayout isAdmin={true} />
              </AdminGuard>
            }
          >
            <Route index element={<RestaurantOverview />} />
            <Route path="basic" element={<RestaurantBasicInfo />} />
            <Route path="company" element={<RestaurantCompanyInfo />} />
            <Route path="address" element={<RestaurantAddress />} />
            <Route path="bank" element={<RestaurantBankDetails />} />
            <Route path="documents" element={<RestaurantDocuments />} />
            <Route path="branches" element={<RestaurantBranches />} />
            <Route path="store" element={<RestaurantStore />} />
            <Route path="settings" element={<RestaurantSettings />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </LocationContext.Provider>
  );
}

export default App;