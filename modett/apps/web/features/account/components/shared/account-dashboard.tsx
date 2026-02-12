"use client";

import { DashboardCard } from "./dashboard-card";
import { AccountNavigation } from "./account-nav";
import { ACCOUNT_CLASSES, ACCOUNT_COLORS } from "../../constants/styles";
import { useWishlistId, useWishlistItems } from "@/features/engagement/queries";

export const AccountDashboard = () => {
  const { wishlistId } = useWishlistId();
  const { data: wishlistItems = [] } = useWishlistItems(wishlistId);
  const wishlistCount = wishlistItems.length;

  return (
    <div
      className={ACCOUNT_CLASSES.pageContainer}
      style={{ backgroundColor: ACCOUNT_COLORS.background }}
    >
      <div className={ACCOUNT_CLASSES.sectionContainer}>
        {/* Welcome Header */}
        <div className={ACCOUNT_CLASSES.headerContainer}>
          <h1 className={ACCOUNT_CLASSES.welcomeTitle}>
            Welcome to your Modett
          </h1>
          <p className={ACCOUNT_CLASSES.subTitle}>My Account</p>
        </div>

        <div className={ACCOUNT_CLASSES.gridContainer}>
          <DashboardCard
            title={`My Wishlist (${wishlistCount})`}
            imageSrc="/images/account/wishlist.png"
            buttonText="SEE MY WISHLIST"
            href="/account/wishlist"
          />
          <DashboardCard
            title="Order History"
            imageSrc="/images/account/latest_orders.jpg"
            buttonText="SEE LATEST ORDERS"
            href="/account/orders"
          />
        </div>

        {/* Navigation Links */}
        <AccountNavigation />
      </div>
    </div>
  );
};
