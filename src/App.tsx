import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import CalendarPage from "./pages/Calendar";
import Performance from "./pages/Performance";
import InstantEstimator from "./pages/InstantEstimator";
import Measurements from "./pages/Measurements";
import Proposals from "./pages/Proposals";
import PDFSigner from "./pages/PDFSigner";
import MaterialOrders from "./pages/MaterialOrders";
import WorkOrders from "./pages/WorkOrders";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import Contacts from "./pages/Contacts";
import FileManager from "./pages/FileManager";
import Catalog from "./pages/Catalog";
import Automations from "./pages/Automations";
import Communications from "./pages/Communications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/instant-estimator" element={<InstantEstimator />} />
          <Route path="/measurements" element={<Measurements />} />
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/pdf-signer" element={<PDFSigner />} />
          <Route path="/material-orders" element={<MaterialOrders />} />
          <Route path="/work-orders" element={<WorkOrders />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/files" element={<FileManager />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/automations" element={<Automations />} />
          <Route path="/communications" element={<Communications />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
