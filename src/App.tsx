import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import Wallets from './components/Wallets';
import ScreeningDetail from './components/ScreeningDetail';
import ApiKeys from './components/ApiKeys';
import OrgBlacklist from './components/OrgBlacklist';
import AdminBlacklist from './components/AdminBlacklist';
import AdminApiUsage from './components/AdminApiUsage';
import AdminIngestion from './components/AdminIngestion';
import AdminRules from './components/AdminRules';
import BlacklistDetail from './components/BlacklistDetail';
import ProtectedRoute from './components/ProtectedRoute';
import HomeRedirect from './components/HomeRedirect.tsx';
import { MenuBarProvider } from './components/menuBar/MenuBarContext.tsx';
import { UserProvider } from './context/UserContext.tsx';
import './App.css';

function App() {
  return (
    <MenuBarProvider>
      <UserProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomeRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/walletScreenings"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <Wallets adminView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adminBlacklist"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminBlacklist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adminApiUsage"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminApiUsage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adminIngestion"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminIngestion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adminrules"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminRules />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/screenings"
            element={
              <ProtectedRoute>
                <Wallets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/screenings/:screeningId"
            element={
              <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
                <ScreeningDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blacklist"
            element={
              <ProtectedRoute>
                <OrgBlacklist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blacklist/:blacklistEntryId"
            element={
              <ProtectedRoute>
                <BlacklistDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/apiKeys"
            element={
              <ProtectedRoute>
                <ApiKeys />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UserProvider>
    </MenuBarProvider>
  );
}

export default App;
