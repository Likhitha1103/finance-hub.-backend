import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import Index from "./pages/Index.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import TransactionsPage from "./pages/TransactionsPage.tsx";
import UserManagementPage from "./pages/UserManagementPage.tsx";
import NotFound from "./pages/NotFound.tsx";

function RequireAuth({
  children,
  requireAnalyst = false,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAnalyst?: boolean;
  requireAdmin?: boolean;
}) {
  const { user, loading, canAnalyze, canManage } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !canManage) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireAnalyst && !canAnalyze) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<AuthPage />} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardPage />
                </RequireAuth>
              }
            />
            <Route
              path="/transactions"
              element={
                <RequireAuth requireAnalyst>
                  <TransactionsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/users"
              element={
                <RequireAuth requireAdmin>
                  <UserManagementPage />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  </TooltipProvider>
);

export default App;
