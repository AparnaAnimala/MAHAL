import React, { useState } from "react";

import Topbar from "../components/Mahal/Topbar";
import Header from "../components/Mahal/Header";

/* MAHAL COMPONENTS */
import CategoryBar from "../components/Mahal/CategoryBar";
import CategoryDrawer from "../components/Mahal/CategoryDrawer";
 
import PromoStrip from "./Mahal/PromoStrip";
import FeaturedSections from "./Mahal/FeaturedSections";
import MahalCategoryGrid from "./Mahal/MahalCategoryGrid";
import MahalIntentSection from "./Mahal/MahalIntentSection";
import MahalStealDeals from "./Mahal/MahalStealDeals";
import MahalSponsoredSection from "./Mahal/MahalSponsoredSection";
import MahalDealsOfDay from "./Mahal/MahalDealsOfDay";

import MahalCampaignTiles from "./Mahal/MahalCampaignTiles";






import HeroSection from "./Mahal/HeroSection";
import HotDealsSection from "./Mahal/HotDealsSection";
import VerifiedSuppliers from "./Mahal/VerifiedSuppliers";
import CategoryWise from "./Mahal/CategoryWise";
import CategoriesSections from "./Mahal/CategoriesSections";
import MahalCategoryRow from "./Mahal/MahalCategoryRow";





/* RESTAURANT SECTIONS */
import RestaurantBanner from "./Mahal/OffersBanner";
import OffersBanner from "./Mahal/Banner";
import BestSellProducts from "./Mahal/BestSellProducts";
import FreshProducts from "./Mahal/FreshProducts";
import SpecialProducts from "./Mahal/SpecialProducts";
 
import DeliveryStrip from "./Mahal/DeliveryStrip";

import BrandPartners from "./Mahal/BrandPartners";
import Categories from "./Mahal/Categories";
import AddBannerSection from "./Mahal/AddBannerSection";
import NewProducts from "./Mahal/NewProducts";
import Footer from "../components/Mahal/Footer";
import ScrollToTopProgress from "../components/ScrollToTopProgress";

const RestaurantOffers = () => {
  // 🔥 SINGLE SOURCE OF TRUTH
  const [activeCategory, setActiveCategory] = useState("All");
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className=" ">


      <Topbar />
      
      <Header />

      {/*   CATEGORY BAR */}
      <CategoryBar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onAllClick={() => setDrawerOpen(true)}
      />

      {/*  STYLE DRAWER */}
      <CategoryDrawer
        open={drawerOpen}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onClose={() => setDrawerOpen(false)}
      />

      

      <OffersBanner />
             <MahalIntentSection /> {/* What Are You Ordering Today? */}

      <FeaturedSections />

      
      {/* <HeroSection /> */}

       {/* <CategoryWise /> */}

       {/* <MahalCampaignTiles /> */}

            

      <HotDealsSection />   {/* // Limited Time Procurement Deals */}
      

<VerifiedSuppliers />

       <MahalDealsOfDay />
      
      

      <MahalSponsoredSection />   {/* Supplier Spotlight */}

      <PromoStrip />

      

      

     {/* <PromoStrip /> */}

      <MahalStealDeals />

     <BestSellProducts />
 
       <NewProducts /> {/*Discover what people are loving today  */}

      <RestaurantBanner />

      <AddBannerSection />

      <FreshProducts />   {/* Our Fresh Products */}





      <SpecialProducts />
   {/* <Categories /> */}

 
    <CategoriesSections />
      {/* <BrandPartners /> */}

      <DeliveryStrip />

      <Footer />

      <ScrollToTopProgress />

    </div>
  );
};

export default RestaurantOffers;
