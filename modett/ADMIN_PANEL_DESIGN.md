# Modett Admin Panel - Design & Feature Specification

**Document Version:** 1.1 (Single Warehouse Focus)
**Date:** December 30, 2024
**Prepared By:** Development Team
**Status:** Draft for Review

---

## ⚠️ IMPORTANT: Single Warehouse Configuration
This design assumes **ONE CENTRAL WAREHOUSE** for inventory management.
Multi-location features have been simplified or removed.

---

## Table of Contents
1. [Overview](#overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Core Features](#core-features)
4. [Inventory Management - Detailed Design](#inventory-management---detailed-design)
5. [Screen Designs & Workflows](#screen-designs--workflows)
6. [Priority & Implementation Phases](#priority--implementation-phases)

---

## Overview

### Purpose
The Modett Admin Panel is a web-based management system for staff to:
- Manage inventory in our central warehouse
- Process orders and track fulfillment
- View analytics and business insights
- Manage products and catalog
- Handle customer service tasks

### Target Users
- **Admin/Manager**: Oversee all operations
- **Inventory Staff**: Manage stock levels, receive shipments
- **Customer Service**: Process orders, handle returns
- **Analyst**: View reports and analytics

---

## User Roles & Permissions

### 1. Admin (Full Access)
**Complete system access**
- Manage all inventory
- Add/edit products
- Process all orders
- Access all reports
- User management
- System settings

### 2. Inventory Staff
**Focus on stock management**
- Receive shipments
- Adjust stock levels
- View inventory reports
- Update product stock
- Cannot process refunds
- Cannot access financial reports

### 3. Customer Service
**Focus on orders and customers**
- View all orders
- Update order status
- Process returns/refunds
- Contact customers
- Cannot modify inventory
- Cannot add/edit products

### 4. Analyst (Read-only)
**View-only access for reporting**
- View all reports and analytics
- Export data
- Cannot make any changes

---

## Core Features

### 1. Dashboard (Landing Page)
**What it shows:**
- Today's sales summary (revenue, orders, average order value)
- Low stock alerts (products below reorder point)
- Pending orders requiring action
- Recent customer activity
- Quick stats: total products, total inventory value
- Analytics highlights from customer tracking

**Actions:**
- Quick search products/orders
- Jump to critical tasks (process orders, receive inventory)

---

### 2. Inventory Management ⭐ (Priority #1)

#### A. Stock Overview
**Screen: Inventory List**

**What it shows:**
```
┌─────────────────────────────────────────────────────────────────┐
│  INVENTORY MANAGEMENT                         [+ Add Product]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Filters:                                                       │
│  [All Categories ▼] [All Brands ▼] [🔍 Search products...]     │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Product           │ SKU      │ In Stock │ Reserved │ Avail ││
│  ├────────────────────────────────────────────────────────────┤│
│  │ Black T-Shirt     │ TSH-001  │   150    │    20    │  130  ││
│  │ (S/M/L/XL)        │          │          │          │       ││
│  │ [⚠️ Low Stock]     │          │          │          │       ││
│  ├────────────────────────────────────────────────────────────┤│
│  │ Blue Jeans        │ JNS-002  │   285    │    15    │  270  ││
│  │ (28/30/32/34/36)  │          │          │          │       ││
│  │ [✓ Good Stock]    │          │          │          │       ││
│  ├────────────────────────────────────────────────────────────┤│
│  │ White Sneakers    │ SNK-003  │     5    │     3    │    2  ││
│  │ (7/8/9/10/11/12)  │          │          │          │       ││
│  │ [🔴 Critical]     │          │          │          │       ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Stock Columns Explained:**
- **In Stock**: Total physical units in warehouse
- **Reserved**: Units in pending orders (not yet shipped)
- **Available**: In Stock - Reserved = Can be sold

**Features:**
- Color-coded stock levels:
  - 🔴 Red: Critical (< 10 units available)
  - 🟡 Yellow: Low (< reorder point)
  - 🟢 Green: Good stock
- Filter by category, brand, stock status
- Search by product name, SKU, barcode
- Click product → View detailed stock breakdown by variant (size/color)

**Actions:**
- [Receive Stock] → Go to receiving workflow
- [Adjust Stock] → Manual correction
- [View History] → Stock movement log
- [Export to Excel] → Download inventory report

---

#### B. Receiving Inventory (When shipment arrives)

**Workflow:**
```
Step 1: Receive Shipment at Warehouse
   ↓
Step 2: Select Source
   - From Purchase Order (PO)
   - From Supplier (manual entry)
   ↓
Step 3: Scan/Enter Products
   - Scan barcode OR search product
   - Enter quantity received
   - Note any damages/defects
   ↓
Step 4: Review & Confirm
   - Shows summary of items
   - Expected vs Received
   ↓
Step 5: Save → Stock Auto-Updates in Warehouse
   ↓
Step 6: Print Receiving Report
```

**Screen: Receive Inventory**

```
┌─────────────────────────────────────────────────────────────────┐
│  RECEIVE INVENTORY                                    [Cancel]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Source: [Purchase Order #PO-2024-001 ▼]                      │
│  Supplier: Acme Apparel Co.                                    │
│  Receiving Date: [Dec 30, 2024]                               │
│  Received By: [Current User]                                   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Product         │ SKU     │Expected│ Received │ Damaged   ││
│  ├────────────────────────────────────────────────────────────┤│
│  │ Black T-Shirt S │TSH-001-S│   50   │ [  50  ] │ [  0  ]  ││
│  │ Black T-Shirt M │TSH-001-M│   100  │ [  98  ] │ [  2  ]  ││
│  │ Black T-Shirt L │TSH-001-L│   75   │ [  75  ] │ [  0  ]  ││
│  │ Black T-Shirt XL│TSH-001-XL│  50   │ [  50  ] │ [  0  ]  ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  📷 [Scan Barcode] or 🔍 [Search to Add More]                 │
│                                                                 │
│  Notes: [2 Medium T-shirts damaged in transit - boxes wet]     │
│                                                                 │
│  Total Expected: 275 units                                     │
│  Total Received: 273 units                                     │
│  Damaged: 2 units                                              │
│  Variance: -2 units                                            │
│                                                                 │
│  [Save & Print Receipt]  [Save Draft]                         │
└─────────────────────────────────────────────────────────────────┘
```

**What happens after saving:**
1. Warehouse stock levels update immediately
2. Transaction recorded in inventory history
3. If damaged items → Create damage report & reduce stock
4. If shortage → Flag for follow-up with supplier
5. Email notification sent to admin/manager

---

#### C. Stock Adjustment (Manual Corrections)

**Use Case:** Physical count doesn't match system count

**Screen: Adjust Stock**

```
┌─────────────────────────────────────────────────────────────────┐
│  STOCK ADJUSTMENT                                     [Cancel]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Product: [Black T-Shirt - Medium]                            │
│  SKU: TSH-001-M                                                │
│  Adjusted By: [Current User]                                   │
│  Date: Dec 30, 2024                                            │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  Current System Stock: 150 units                          ││
│  │  Actual Physical Count: 147 units                         ││
│  │  Difference: -3 units (shortage)                          ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Reason for Adjustment:                                        │
│  [ Damaged/Defective  ▼]                                       │
│                                                                 │
│  Options:                                                      │
│  - Physical count discrepancy                                  │
│  - Damaged/Defective                                           │
│  - Lost/Stolen                                                 │
│  - Found (extra stock)                                         │
│  - System error correction                                     │
│  - Returned to supplier                                        │
│  - Other                                                       │
│                                                                 │
│  Notes: [3 units found damaged during inventory check]        │
│                                                                 │
│  ⚠️ This will adjust stock from 150 → 147 units               │
│                                                                 │
│  [Confirm Adjustment]                                          │
└─────────────────────────────────────────────────────────────────┘
```

**Approval Required:**
- Small adjustments (< 5 units): Auto-approve
- Medium adjustments (5-20 units): Manager approval
- Large adjustments (> 20 units): Executive approval

---

#### D. Low Stock Alerts & Reordering

**Screen: Stock Alerts**

```
┌─────────────────────────────────────────────────────────────────┐
│  STOCK ALERTS                           [Configure Alerts]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔴 CRITICAL (Out of Stock) - 5 items                          │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Product         │ SKU     │Current│Reorder│ Action        ││
│  │                 │         │Stock  │Point  │               ││
│  ├────────────────────────────────────────────────────────────┤│
│  │ White T-Shirt L │TSH-002-L│   0   │  20   │[Create PO]   ││
│  │ Blue Jeans 32   │JNS-002-32│  1   │  15   │[Create PO]   ││
│  │ Gray Hoodie XL  │HDI-003-XL│  2   │  25   │[Create PO]   ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  🟡 LOW STOCK (Below Reorder Point) - 18 items                │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Product         │ SKU      │Current│Reorder│ Action       ││
│  ├────────────────────────────────────────────────────────────┤│
│  │ Black T-Shirt S │TSH-001-S │   18  │  50   │[Create PO]  ││
│  │ Black T-Shirt M │TSH-001-M │   45  │  50   │[Create PO]  ││
│  │ Running Shoes 9 │SHO-005-9 │   12  │  30   │[Create PO]  ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  [Create Bulk Purchase Order]  [Export Alert List]            │
└─────────────────────────────────────────────────────────────────┘
```

**Automated Actions:**
- Daily email summary of alerts sent to admin
- Auto-create draft purchase orders for critical items
- Predictive alerts based on sales velocity (using analytics!)

---

#### E. Inventory Reports

**Available Reports:**

1. **Stock Level Report**
   - Current stock in warehouse
   - Stock value ($ amount)
   - Export to Excel/PDF

2. **Stock Movement Report**
   - All ins and outs for date range
   - Received, sold, adjusted
   - Track inventory flow

3. **Low Stock Forecast**
   - Predicts when products will run out
   - Based on sales velocity (from your analytics!)
   - Suggests reorder dates and quantities

4. **Inventory Valuation**
   - Total inventory value in warehouse
   - Cost vs retail value
   - Profit margin analysis

5. **Slow-Moving Stock**
   - Products not selling (low turn rate)
   - Days in inventory
   - Candidates for promotion/clearance/discount

6. **Inventory Turnover Report**
   - How fast inventory sells
   - Identify fast-moving vs slow-moving items
   - Optimize purchasing decisions

---

### 3. Product Management

#### A. Product Catalog

**Screen: Products List**

```
┌─────────────────────────────────────────────────────────────────┐
│  PRODUCTS                                [+ Add New Product]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [All Categories ▼] [All Brands ▼] [Active ▼] [🔍 Search...]  │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Image  │ Name            │ SKU      │Category│Price │Status││
│  ├────────────────────────────────────────────────────────────┤│
│  │ [IMG]  │ Black T-Shirt   │ TSH-001  │ Tops  │$29.99│Active││
│  │        │ 4 variants      │          │       │      │  ✏️  ││
│  ├────────────────────────────────────────────────────────────┤│
│  │ [IMG]  │ Blue Jeans      │ JNS-002  │ Pants │$79.99│Active││
│  │        │ 8 variants      │          │       │      │  ✏️  ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Actions:**
- Add new product
- Edit product details
- Manage variants (sizes, colors)
- Upload/edit images
- Set pricing
- Activate/deactivate

---

#### B. Add/Edit Product

**Product Information:**
- Basic Info: Name, description, brand
- Categories & tags
- Pricing: Cost, retail price, sale price
- Variants: Create size/color combinations
- Images: Upload main + variant images
- SEO: URL slug, meta description
- Stock: Link to inventory

---

### 4. Order Management

#### A. Orders List

**Screen: Orders**

```
┌─────────────────────────────────────────────────────────────────┐
│  ORDERS                                    [Export to CSV]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Today ▼] [All Statuses ▼] [🔍 Search order/customer...]     │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Order ID  │Customer      │Date    │Items│Total  │Status   ││
│  ├────────────────────────────────────────────────────────────┤│
│  │ #ORD-2024 │John Doe      │Dec 30  │  3  │$189.97│🟡Pending││
│  │           │john@email.com│10:30 AM│     │       │ [View] ││
│  ├────────────────────────────────────────────────────────────┤│
│  │ #ORD-2023 │Jane Smith    │Dec 30  │  1  │ $29.99│🟢Shipped││
│  │           │jane@email.com│09:15 AM│     │       │ [View] ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Order Status Flow:**
- 🟡 **Pending** → New order, awaiting processing
- 🔵 **Processing** → Being picked/packed
- 🟢 **Shipped** → Out for delivery
- ✅ **Delivered** → Completed
- 🔴 **Cancelled** → Cancelled by customer/admin
- 🔄 **Returned** → Customer returned

---

#### B. Order Detail & Processing

**Screen: Order Detail**

```
┌─────────────────────────────────────────────────────────────────┐
│  ORDER #ORD-2024-001234                          [Print]  [✕]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Status: 🟡 Pending                      [Update Status ▼]     │
│  Date: Dec 30, 2024 10:30 AM                                   │
│                                                                 │
│  ┌─ CUSTOMER INFO ──────────────────────────────────────────┐ │
│  │ John Doe                         john.doe@email.com      │ │
│  │ Phone: +1 234-567-8900                                   │ │
│  │                                                           │ │
│  │ Shipping Address:                                        │ │
│  │ 123 Main Street, Apt 4B                                  │ │
│  │ New York, NY 10001                                       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─ ORDER ITEMS ────────────────────────────────────────────┐ │
│  │ Product              │ SKU       │Qty│Price  │Subtotal  │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ Black T-Shirt (M)    │TSH-001-M  │ 2 │$29.99 │ $59.98   │ │
│  │ Blue Jeans (32)      │JNS-002-32 │ 1 │$79.99 │ $79.99   │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ Subtotal:                                    │ $139.97   │ │
│  │ Shipping:                                    │  $10.00   │ │
│  │ Tax:                                         │  $12.00   │ │
│  │ TOTAL:                                       │ $161.97   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─ ORDER HISTORY ──────────────────────────────────────────┐ │
│  │ Dec 30, 10:30 AM - Order placed                          │ │
│  │ Dec 30, 10:31 AM - Payment confirmed                     │ │
│  │ Dec 30, 10:45 AM - Inventory reserved                    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Process Order] [Cancel Order] [Contact Customer]            │
└─────────────────────────────────────────────────────────────────┘
```

**Actions Available:**
- Update order status
- Print packing slip / invoice
- Cancel order (with reason)
- Process refund
- Add internal notes
- Contact customer

---

### 5. Analytics Dashboard (Using Your New Tracking!)

**Screen: Analytics Overview**

```
┌─────────────────────────────────────────────────────────────────┐
│  ANALYTICS & INSIGHTS                    [Last 30 Days ▼]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─ KEY METRICS ────────────────────────────────────────────┐  │
│  │  Total Sales: $45,289  │  Orders: 342  │  AOV: $132.43  │  │
│  │  Product Views: 8,432  │  Purchases: 342 │  Conv: 4.05% │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ TOP VIEWED PRODUCTS ────────────────────────────────────┐  │
│  │ Product          │ Views │ Purchases │ Conv Rate        │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ Black T-Shirt    │ 1,234 │    156    │  12.6% 🟢       │  │
│  │ Blue Jeans       │   987 │     89    │   9.0% 🟢       │  │
│  │ White Sneakers   │   654 │     12    │   1.8% 🔴       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ TRAFFIC SOURCES ────────────────────────────────────────┐  │
│  │ Source          │ Sessions │ Purchases │ Conv Rate      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ Search          │  2,341   │    156    │  6.7%          │  │
│  │ Category Browse │  3,456   │    102    │  2.9%          │  │
│  │ Direct          │  1,234   │     45    │  3.6%          │  │
│  │ Recommendations │    567   │     39    │  6.9%          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ CUSTOMER BEHAVIOR ──────────────────────────────────────┐  │
│  │ Browse Abandonment: 71.2%                                │  │
│  │ Avg Time to Purchase: 2.3 days                           │  │
│  │ Avg Products Viewed Before Purchase: 3.8                │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [View Detailed Reports] [Export Data]                         │
└─────────────────────────────────────────────────────────────────┘
```

**Reports Available:**
- Product performance (views vs sales)
- Customer journey analysis
- Conversion funnel
- Traffic source effectiveness
- Low-converting products (high views, low sales)

---

## Priority & Implementation Phases

### 🔥 Phase 1: Critical Features (Build First)

**Priority 1A: Inventory Management Core**
1. Stock Overview (view current levels)
2. Receive Inventory workflow
3. Stock Adjustments
4. Low Stock Alerts

**Priority 1B: Basic Product Management**
5. Product list view
6. Add/edit products
7. Manage variants

**Priority 1C: Order Processing**
8. Orders list
9. Order detail view
10. Update order status

**Estimated Timeline:** 3-4 weeks

---

### 📊 Phase 2: Advanced Features

**Priority 2A: Inventory Advanced**
1. Purchase order management
2. Advanced inventory reports
3. Stock forecasting & predictions

**Priority 2B: Analytics Dashboard**
4. Implement analytics viewing (using your tracking data!)
5. Product performance reports
6. Traffic source analysis
7. Customer behavior insights

**Estimated Timeline:** 2-3 weeks

---

### 🎨 Phase 3: Polish & Enhancement

**Priority 3:**
1. Customer service features (returns, refunds)
2. Advanced reporting
3. User role management
4. Notifications system

**Estimated Timeline:** 2 weeks

---

## Technical Architecture

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: Tailwind CSS + Shadcn/ui components
- **State Management**: React Query for API calls
- **Charts**: Recharts or Chart.js for analytics

### Backend (Already Built!)
- All APIs already exist in your modules
- Just need to consume them from admin UI

### Authentication
- Admin users must have staff role
- Use existing JWT authentication
- Add role-based access control

---

## Next Steps

### For Manager Review
Please review and provide feedback on:

1. **Priority**: Do these priorities match business needs?
2. **Features**: Any critical features missing?
3. **Workflows**: Do the inventory workflows make sense?
4. **Timeline**: Are timelines realistic?

### Questions for Manager
1. How many staff members will use this admin system?
2. What's the most painful inventory process today?
3. Are there any specific reports you need regularly?
4. Do we need barcode scanning support for receiving inventory?
5. Do we need mobile access or is desktop-only fine?
6. Will we expand to multiple locations in the future?

---

## Appendix: Screen Flow Diagrams

### Inventory Receiving Flow (Single Warehouse)
```
Dashboard
   → Click "Receive Inventory"
      → Select PO or Manual Entry
         → Scan/Enter Products & Quantities
            → Note any damaged/missing items
               → Review Summary (Expected vs Received)
                  → Confirm Receipt
                     → Stock Auto-Updates in Warehouse
                        → Print Receiving Report
                           → Back to Dashboard
```

### Order Processing Flow
```
Dashboard
   → View "Pending Orders"
      → Click Order
         → Review Details
            → Check Inventory Available in Warehouse
               → Update Status to "Processing"
                  → Print Packing Slip
                     → Pick Items from Warehouse
                        → Pack & Mark as "Shipped"
                           → Email Customer Tracking Info
```

### Low Stock Alert Flow
```
Dashboard / Stock Alerts Page
   → View Critical/Low Stock Items
      → Click "Create Purchase Order"
         → Select Supplier
            → Add Products & Quantities
               → Submit PO to Supplier
                  → Wait for Shipment
                     → Receive Inventory (see Receiving Flow)
                        → Stock Replenished
```

---

**End of Document**

_This document is a living specification and will be updated based on feedback and requirements._
