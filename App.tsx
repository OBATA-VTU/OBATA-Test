import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { ServicesPage } from './pages/ServicesPage';
import { FundWallet } from './pages/FundWallet';
import { P2PTransfer } from './pages/P2PTransfer';
import { HistoryPage } from './components/HistoryPage';
import { ProfilePage } from './components/SecondaryPages';
import { PricingPage } from './components/PricingPage';
import { AdminPanel } from './components/AdminPanel';
import { Layout } from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppDataProvider } from './contexts/AppDataContext';
import { ServiceProvider } from './contexts/ServiceContext';
import { ErrorBoundary } from './components/ErrorBoundary';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  return currentUser ? <>{children}</> : <Navigate to="/auth" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, loading } = useAuth();
  if (loading) return null;
  return userProfile?.role === 'admin' ? <>{children}</> : <Navigate to="/dashboard" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage onSuccess={() => window.location.href = '/dashboard'} />} />
      <Route path="/pricing" element={<PricingPage />} />
      
      {/* Protected Dashboard Routes */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Support both base path and specific service paths to prevent redirects */}
        <Route path="/services" element={<Navigate to="/services/airtime" replace />} />
        <Route path="/services/:serviceType" element={<ServicesPage />} />
        <Route path="/wallet" element={<FundWallet />} />
        <Route path="/transfer" element={<P2PTransfer />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<AdminRoute><Layout /></AdminRoute>}>
        <Route path="/admin" element={<AdminPanel />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppDataProvider>
            <ServiceProvider>
              <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600/30">
                <Toaster 
                  position="top-center" 
                  toastOptions={{
                    style: {
                      background: '#1e293b',
                      color: '#fff',
                      border: '1px solid #334155',
                      borderRadius: '1rem',
                      fontSize: '13px',
                      fontWeight: '700'
                    }
                  }} 
                />
                <AppRoutes />
              </div>
            </ServiceProvider>
          </AppDataProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;