import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Wallets from './components/Wallets';
import ProtectedRoute from './components/ProtectedRoute';
import { MenuBarProvider } from './components/menuBar/MenuBarContext.tsx';
import './App.css';

function App() {
  return (
    <MenuBarProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallets"
          element={
            <ProtectedRoute>
              <Wallets />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MenuBarProvider>
  );
}

export default App;
