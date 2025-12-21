import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import CalendarPage from "./pages/Calendar";
import Performance from "./pages/Performance";
import InstantEstimator from "./pages/InstantEstimator";
import Measurements from "./pages/Measurements";
import Proposals from "./pages/Proposals";
import MaterialOrders from "./pages/MaterialOrders";
import WorkOrders from "./pages/WorkOrders";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import Contacts from "./pages/Contacts";
import FileManager from "./pages/FileManager";
import Catalog from "./pages/Catalog";
import Automations from "./pages/Automations";
import Communications from "./pages/Communications";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isRecoveryMode = new URLSearchParams(location.search).get("mode") === "recovery";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user && !isRecoveryMode) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
    <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
    <Route path="/performance" element={<ProtectedRoute><Performance /></ProtectedRoute>} />
    <Route path="/instant-estimator" element={<ProtectedRoute><InstantEstimator /></ProtectedRoute>} />
    <Route path="/measurements" element={<ProtectedRoute><Measurements /></ProtectedRoute>} />
    <Route path="/proposals" element={<ProtectedRoute><Proposals /></ProtectedRoute>} />
    <Route path="/material-orders" element={<ProtectedRoute><MaterialOrders /></ProtectedRoute>} />
    <Route path="/work-orders" element={<ProtectedRoute><WorkOrders /></ProtectedRoute>} />
    <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
    <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
    <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
    <Route path="/files" element={<ProtectedRoute><FileManager /></ProtectedRoute>} />
    <Route path="/catalog" element={<ProtectedRoute><Catalog /></ProtectedRoute>} />
    <Route path="/automations" element={<ProtectedRoute><Automations /></ProtectedRoute>} />
    <Route path="/communications" element={<ProtectedRoute><Communications /></ProtectedRoute>} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
