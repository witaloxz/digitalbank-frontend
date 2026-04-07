import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute"; // ← IMPORTE AQUI

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import CreditCards from "./pages/CreditCards";
import Loans from "./pages/Loans";
import Services from "./pages/Services";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";
import NewTransfer from "./pages/NewTransfer";
import Support from "./pages/services/Support";
import Statements from "./pages/services/Statements";
import BillPayments from "./pages/services/BillPayments";
import LifeInsurance from "./pages/services/LifeInsurance";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLoans from "./pages/admin/AdminLoans";
import AdminInsurance from "./pages/admin/AdminInsurance";
import Maintenance from "./pages/Maintenance";
import Index from "./pages/Index";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/maintenance" element={<Maintenance />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/transactions" element={<Transactions />} />
              <Route path="/dashboard/transfer" element={<NewTransfer />} />
              <Route path="/dashboard/accounts" element={<Accounts />} />
              <Route path="/dashboard/cards" element={<CreditCards />} />
              <Route path="/dashboard/loans" element={<Loans />} />
              <Route path="/dashboard/services" element={<Services />} />
              <Route path="/dashboard/settings" element={<SettingsPage />} />

              <Route path="/dashboard/services/life-insurance" element={<LifeInsurance />} />
              <Route path="/dashboard/services/bill-payments" element={<BillPayments />} />
              <Route path="/dashboard/services/statements" element={<Statements />} />
              <Route path="/dashboard/services/support" element={<Support />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/transactions" element={<AdminTransactions />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/loans" element={<AdminLoans />} />
              <Route path="/admin/insurance" element={<AdminInsurance />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;