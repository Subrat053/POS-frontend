import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import AuthLayout from '../components/layout/AuthLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

// Auth Pages
import Login from '../modules/auth/Login';
import ForgotPassword from '../modules/auth/ForgotPassword';
import Unauthorized from '../modules/auth/Unauthorized';

// Dashboard Pages
import Dashboard from '../modules/dashboard/Dashboard';

// Products Pages
import ProductList from '../modules/products/ProductList';
import ProductForm from '../modules/products/ProductForm';

// POS Pages
import PosTerminal from '../modules/pos/PosTerminal';

// Inventory Pages
import InventoryDashboard from '../modules/inventory/InventoryDashboard';

// Purchases & Procurement Pages
import PurchasesDashboard from '../modules/purchases/PurchasesDashboard';

// People Pages
import CustomersList from '../modules/people/CustomersList';

// Expenses Pages
import ExpensesDashboard from '../modules/expenses/ExpensesDashboard';

// HR Pages
import HrAttendance from '../modules/hr/HrAttendance';

// Reports & Analytics Pages
import ReportsAnalytics from '../modules/reports/ReportsAnalytics';

// Settings Pages
import Settings from '../modules/settings/Settings';

// Admin Governance Pages
import AccessGovernance from '../modules/admin/AccessGovernance';

// Profile Pages
import UserProfile from '../modules/profile/UserProfile';

// Common Placeholders for subsequent modules
import Placeholder from '../components/common/Placeholder';


export function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
      </Route>

      {/* Unauthorized Access Fallback */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Dashboard Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Core Pages */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute module="dashboard">
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/pos" 
          element={
            <ProtectedRoute module="pos">
              <PosTerminal />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/products" 
          element={
            <ProtectedRoute module="products">
              <ProductList />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/products/new" 
          element={
            <ProtectedRoute module="products">
              <ProductForm />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/products/edit/:id" 
          element={
            <ProtectedRoute module="products">
              <ProductForm />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/inventory" 
          element={
            <ProtectedRoute module="inventory">
              <InventoryDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/purchases" 
          element={
            <ProtectedRoute module="purchases">
              <PurchasesDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/expenses" 
          element={
            <ProtectedRoute module="expenses">
              <ExpensesDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/hr" 
          element={
            <ProtectedRoute module="hr">
              <HrAttendance />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/customers" 
          element={
            <ProtectedRoute module="pos">
              <CustomersList />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/access" 
          element={
            <ProtectedRoute module="access">
              <AccessGovernance />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute module="reports">
              <ReportsAnalytics />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute module="settings">
              <Settings />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
