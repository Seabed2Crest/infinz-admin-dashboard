import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { validateEnv } from "@/config/env";
import { toast } from "sonner";

// Pages
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";
import LoanRequests from "./pages/LoanRequests";
import BusinessManagement from "./pages/BusinessManagement";
import LeadsManagement from "./pages/LeadsManagement";
import RolesPermissions from "@/pages/RolesPermissions";
import NotFound from "./pages/NotFound";
import EmployeeForm from "./pages/EmployeeForm";
import DownloadLogsPage from "./pages/Logs";

// BLOG PAGES
import BlogList from "./pages/BlogList";
import BlogForm from "./pages/BlogForm";
import TestimonialsList from "./pages/TestimonialsList";
import AddTestimonial from "./pages/AddTestimonial";
import UtmLink from "./pages/LoanTable";
import FinancialDictionaryAdmin from "./pages/financial-dictionary";
import NewsAdmin from "./pages/NewsAdmin";

const queryClient = new QueryClient();

// ==========================
//  AUTH PROTECTED ROUTE
// ==========================
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    setIsAuthenticated(!!token);
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// ==========================
//  PERMISSION ROUTE
// ==========================
interface RequirePermissionProps {
  module: string;
  action: string;
  children: React.ReactNode;
}

const RequirePermission = ({
  module,
  action,
  children,
}: RequirePermissionProps) => {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const accessLevel = localStorage.getItem("adminAccessLevel");
      if (accessLevel === "god_level") {
        setAllowed(true);
        return;
      }

      const raw = localStorage.getItem("adminPermissions");
      if (!raw) {
        setAllowed(true);
        return;
      }

      const perms = JSON.parse(raw) as Record<string, string[]>;
      const actions = perms[module] || [];

      if (actions.includes(action)) {
        setAllowed(true);
      } else {
        setAllowed(false);
        toast.error("You do not have permission to access this page");
      }
    } catch (err) {
      setAllowed(true);
    }
  }, [module, action]);

  if (allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// ==========================
//  APP ROUTER
// ==========================
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* PROTECTED AREA */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* DASHBOARD */}
            <Route path="dashboard" element={<Dashboard />} />

            {/* USERS */}
            <Route path="leads" element={<Users />} />
            <Route path="user-details/:userId" element={<UserDetails />} />

            {/* LOAN REQUESTS */}
            <Route path="loan-requests" element={<LoanRequests />} />

            {/* BUSINESS MGMT */}
            <Route
              path="business-management"
              element={<BusinessManagement />}
            />

            {/* LEADS MGMT */}
            <Route path="leads-management" element={<LeadsManagement />} />

            {/* DOWNLOAD LOGS */}
            <Route path="logs" element={<DownloadLogsPage />} />

            {/* BLOG ROUTES (FIXED) */}
            <Route path="admin/blogs" element={<BlogList />} />
            <Route path="admin/blogs/add" element={<BlogForm />} />
            <Route path="admin/blogs/edit/:id" element={<BlogForm />} />
            <Route path="admin/testimonials" element={<TestimonialsList />} />
            <Route path="admin/testimonials/add" element={<AddTestimonial />} />
            <Route path="admin/financial-dictionary" element={<FinancialDictionaryAdmin />} />
            <Route path="admin/news" element={<NewsAdmin />} />
            <Route
              path="admin/utm-links"
              element={<UtmLink />}
            />
            {/* ROLES & PERMISSIONS */}
            <Route
              path="roles-permissions"
              element={
                <RequirePermission module="employee-management" action="view">
                  <RolesPermissions />
                </RequirePermission>
              }
            />

            {/* EMPLOYEE MGMT */}
            <Route
              path="roles-permissions/create-employee"
              element={<EmployeeForm />}
            />
            <Route
              path="roles-permissions/update-employee/:employeeId"
              element={<EmployeeForm />}
            />


            {/* RESET PASSWORD */}
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>

          {/* 404 FALLBACK */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
