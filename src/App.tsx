import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { validateEnv } from "@/config/env";
import { toast } from "sonner";
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

const queryClient = new QueryClient();

// Validate environment variables on app startup
validateEnv();

// Protected Route Component
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

// Optional: route-level permission guard wrapper

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
        setAllowed(true); // default allow if no permissions set
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
      setAllowed(true); // fallback allow
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leads" element={<Users />} />
            <Route path="logs" element={<DownloadLogsPage />} />
            <Route path="user-details/:userId" element={<UserDetails />} />
            <Route path="loan-requests" element={<LoanRequests />} />
            <Route
              path="business-management"
              element={<BusinessManagement />}
            />
            <Route path="leads-management" element={<LeadsManagement />} />
            <Route
              path="roles-permissions"
              element={
                <RequirePermission module="employee-management" action="view">
                  <RolesPermissions />
                </RequirePermission>
              }
            />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route
              path="roles-permissions/create-employee"
              element={<EmployeeForm />}
            />
            <Route
              path="roles-permissions/update-employee/:employeeId"
              element={<EmployeeForm />}
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
