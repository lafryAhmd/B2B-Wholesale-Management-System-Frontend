import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProductManagement from './ProductManagement';
import OrderList from './pages/OrderList';
import CreateOrder from './pages/CreateOrder';
import OrderDetails from './pages/OrderDetails';
import MarketplacePage from './pages/MarketplacePage';
import { MyInvoicesPage, InvoiceDetailPage } from './pages/payments/InvoicesPage';
import { FinanceInvoicesPage, OverdueInvoicesPage, AuditTrailPage } from './pages/payments/FinancePages';
import OrderPayment from './pages/OrderPayment';
import { InventoryPage, StockAlertsPage } from './pages/InventoryPages';
import { SalesReportPage, RevenueReportPage, UnpaidReportPage, TopClientsPage } from './pages/ReportPages';
import ProductDetailPage from './pages/ProductDetailPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/products" element={<ProductManagement />} />
                <Route path="/orders" element={<OrderList />} />
                <Route path="/create-order" element={<CreateOrder />} />
                <Route path="/orders/:id" element={<OrderDetails />} />
                <Route path="/orders/:id/pay" element={<OrderPayment />} />
                {/* Payment & Invoice Pages */}
                <Route path="/invoices" element={<MyInvoicesPage />} />
                <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
                <Route path="/finance/invoices" element={<FinanceInvoicesPage />} />
                <Route path="/finance/overdue" element={<OverdueInvoicesPage />} />
                <Route path="/finance/audit" element={<AuditTrailPage />} />
                {/* Inventory Pages */}
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/inventory/alerts" element={<StockAlertsPage />} />
                {/* Report Pages */}
                <Route path="/reports/sales" element={<SalesReportPage />} />
                <Route path="/reports/revenue" element={<RevenueReportPage />} />
                <Route path="/reports/unpaid" element={<UnpaidReportPage />} />
                <Route path="/reports/top-clients" element={<TopClientsPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;