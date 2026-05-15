import sideBar from "./sideBar";
import restaurantDashboard from "./restaurantDashboard";
import orders from "./orders";
import ordersDetails from "./ordersDetails";
import ratingAndReviews from "./ratingAndReviews";
import orderIssue from "./orderIssue";
import createGRN from "./createGRN";
import invoice from "./invoice";
import invoicDetails from "./invoicDetails";
import inventory from "./inventory";
import issueToKitchen from "./issueToKitchen";
import creditWallet from "./creditWallet";
import menuItems from "./menuItems";
import recipeMaster from "./recipeMaster";
import reports from "./reports";
import orderIssueList from "./orderIssueList";
import resModification from "./resModification";
import resDocumentation from "./resDocumentation";
import ResInvoiceReports from "./ResInvoiceReports";
import resPurchaseReport from "./resPurchaseReport";
import resEditOrder from "./resEditOrder";
import resHelps from "./resHelps";

export default{
    ...sideBar,
    ...restaurantDashboard,
    ...orders,
    ...ordersDetails,
    ...ratingAndReviews,
    ...orderIssue,
    ...createGRN,
    ...invoice,
    ...invoicDetails,
    ...inventory,
    ...issueToKitchen,
    ...creditWallet,
    ...menuItems,
    ...recipeMaster,
    ...reports,
    ...orderIssueList,
    ...resModification,
    ...resDocumentation,
    ...ResInvoiceReports,
    ...resPurchaseReport,
    ...resEditOrder,
    ...resHelps
    
}