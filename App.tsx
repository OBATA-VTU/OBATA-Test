import React, { PropsWithChildren } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ServiceProvider } from './contexts/ServiceContext';
import { AppDataProvider } from './contexts/AppDataContext';
import { Layout } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import { AuthPage } from './pages/AuthPage'; 
import { Dashboard } from './pages/Dashboard';
import { ServicesPage } from './pages/ServicesPage';
import { FundWallet } from './pages/FundWallet';
import { P2PTransfer } from './pages/P2PTransfer';
import { KoloPage } from './pages/KoloPage';
import { ProfilePage } from './components/SecondaryPages'; 
import { HistoryPage } from './components/HistoryPage';
import { AdminPanel } from './components/AdminPanel';
import { PaymentVerificationPage } from './pages/PaymentVerificationPage';

const ProtectedRoute = ({ children }: PropsWithChildren) => {
    const { currentUser, loading } = useAuth();
    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;
    return currentUser ? <>{children}</> : <Navigate to="/auth" />;
};

const AdminRoute = ({ children }: PropsWithChildren) => {
     const { currentUser, isReseller, loading } = useAuth(); 
     if (loading) return null;
     return currentUser ? <>{children}</> : <Navigate to="/dashboard" />;
};

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppDataProvider>
            <ServiceProvider>
              <Toaster position="top-center" />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage onGetStarted={() => window.location.href='/auth'} onNavigate={() => {}} />} />
                <Route path="/auth" element={<AuthPage onSuccess={() => window.location.href='/dashboard'} />} />
                <Route path="/verify-payment" element={<PaymentVerificationPage />} />

                {/* Protected Dashboard Routes */}
                <Route element={<Layout />}>
                    <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="services/:serviceType?" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
                    <Route path="wallet" element={<ProtectedRoute><FundWallet /></ProtectedRoute>} />
                    <Route path="transfer" element={<ProtectedRoute><P2PTransfer /></ProtectedRoute>} />
                    <Route path="kolo" element={<ProtectedRoute><KoloPage /></ProtectedRoute>} />
                    <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                    <Route path="admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </ServiceProvider>
          </AppDataProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;