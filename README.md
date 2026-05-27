# B2B Wholesale Management System - Frontend

This is the frontend application for the **B2B Wholesale Management System**, a full-stack wholesale business management platform. The frontend is built using **React** and provides a user-friendly interface for managing businesses, products, orders, inventory, invoices, payments, RFQs, reviews, and reports.

---

## Project Overview

The frontend allows users to interact with the B2B Wholesale Management System through a modern web interface. It connects with the Spring Boot backend using REST APIs and provides separate pages for marketplace browsing, product management, order handling, invoice tracking, payment processing, inventory management, and sales reporting.

---

## Technologies Used

- React
- Vite
- JavaScript
- React Router DOM
- Axios
- Lucide React
- CSS

---

## Main Features

- User login and registration
- Business registration interface
- Marketplace product browsing
- Product detail view
- Product management dashboard
- Order creation and order tracking
- Inventory and low-stock alert pages
- Invoice management pages
- Payment and finance management
- RFQ management
- Review and rating features
- Sales report dashboard
- Admin dashboard pages

---

## System Modules

### Authentication Pages

- Login page
- Register page
- Business registration form
- User session handling

### Dashboard

- Main dashboard interface
- Summary cards
- Navigation to system modules
- Business and admin overview sections

### Marketplace

- View listed products
- Search products
- Filter products by category
- View product details
- Place orders from product pages

### Product Management

- Add new products
- Update product details
- Delete products
- View products by business
- Enable or disable product availability
- Manage product approval status

### Order Management

- Create new orders
- View order list
- View order details
- Track order status
- Approve or reject orders
- Proceed to payment for approved orders

### Inventory Management

- View inventory items
- Update stock quantity
- Set stock threshold
- View low-stock products
- View stock alert history

### Invoice Management

- View invoices
- View invoice details
- Generate invoice from order
- View overdue invoices
- Cancel invoices
- Verify signed invoices

### Payment and Finance Management

- Pay invoices
- Record manual payments
- View payment history
- View audit trail
- Manage overdue payments

### RFQ Management

RFQ means **Request for Quotation**.

- Create RFQs
- View sent and received RFQs
- Respond to RFQs
- Accept or reject quotations

### Review Management

- Add product reviews
- View product reviews
- View review summaries
- Add business responses
- Mark reviews as helpful

### Report Management

- View sales report
- View report history
- Track revenue, total orders, average order value, and active customers

---

## Project Structure

```text
B2B-Wholesale-Management-System-Frontend/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── MarketplacePage.jsx
│   │   ├── ProductDetailPage.jsx
│   │   ├── ProductManagement.jsx
│   │   ├── CreateOrder.jsx
│   │   ├── OrderList.jsx
│   │   ├── OrderDetails.jsx
│   │   ├── InventoryPages.jsx
│   │   ├── InvoicesPage.jsx
│   │   ├── FinancePages.jsx
│   │   └── ReportPages.jsx
│   │
│   ├── services/
│   ├── styles/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
├── vite.config.js
└── README.md
