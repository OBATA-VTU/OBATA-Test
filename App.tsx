import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout, PageView, DashboardTab } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { DashboardOverview } from './components/DashboardOverview';
import { ServicesPage } from './components/ServicesPage';
import { WalletPage } from './components/WalletPage';
import { SavingsPage } from './components/SavingsPage';
import { HistoryPage } from './components/HistoryPage';
import { PricingPage } from './components/PricingPage';
import { AdminPanel } from './components/AdminPanel';
import { ReceiptModal } from './components/ReceiptModal';
import { ApiConfig, ApiResponse } from './types';
import { executeApiRequest } from './services/api';
import { PrivacyPolicy, TermsOfService, AboutUs, ContactSupport } from './components/StaticPages';
import { ResellerPage, ReferralsPage, RewardsPage, ApiDocsPage, ProfilePage } from './components/SecondaryPages';

const MainApp: React.FC = () => {
  const { currentUser, userProfile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageView>('LANDING');
  const [activeDashboardTab, setActiveDashboardTab] = useState<DashboardTab>('OVERVIEW');
  
  // Transaction State
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<ApiResponse | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Handle Initial Redirects
  useEffect(() => {
    if (!loading) {
      if (currentUser && currentPage === 'LANDING') {
        setCurrentPage('DASHBOARD');
      }
    }
  }, [loading, currentUser]);

  const handleApiSubmit = async (config: ApiConfig) => {
    setIsProcessing(true);
    try {
      const response = await executeApiRequest(config);
      setLastResponse(response);
      setShowReceipt(true);
      // If success, user might need to refresh balance in dashboard
      // Ideally AuthContext listens to real-time updates so it's automatic
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const navigateTo = (page: PageView) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const navigateDashboard = (tab: DashboardTab) => {
    setCurrentPage('DASHBOARD');
    setActiveDashboardTab(tab);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-t-blue-500 border-r-amber-500 border-b-blue-500 border-l-amber-500 animate-spin"></div>
        <p className="text-slate-400">Initializing OBATA VTU...</p>
      </div>
    );
  }

  // Render Full Page Views (No Sidebar)
  if (currentPage === 'LANDING') {
    return <LandingPage onGetStarted={() => currentUser ? setCurrentPage('DASHBOARD') : setCurrentPage('DASHBOARD')} onNavigate={navigateTo} onDashboardNavigate={navigateDashboard} />;
  }

  // Authentication is handled inside Layout if user is null for Dashboard, 
  // But here we might want a dedicated Auth screen if not logged in
  if (currentPage === 'DASHBOARD' && !currentUser) {
    return <AuthPage onSuccess={() => setCurrentPage('DASHBOARD')} />;
  }

  // Helper for Dashboard Content
  const renderDashboardContent = () => {
    switch (activeDashboardTab) {
      case 'OVERVIEW': return <DashboardOverview onNavigate={navigateDashboard} onTriggerUpgrade={() => setActiveDashboardTab('RESELLER')} />;
      case 'SERVICES': return <ServicesPage onSubmit={handleApiSubmit} isLoading={isProcessing} />;
      case 'WALLET': return <WalletPage onSubmit={handleApiSubmit} isLoading={isProcessing} />;
      case 'SAVINGS': return <SavingsPage />;
      case 'HISTORY': return <HistoryPage />;
      case 'RESELLER': return <ResellerPage onTriggerUpgrade={() => setActiveDashboardTab('WALLET')} />;
      case 'REWARDS': return <RewardsPage />;
      case 'REFERRALS': return <ReferralsPage />;
      case 'API': return <ApiDocsPage />;
      case 'PROFILE': return <ProfilePage />;
      case 'ADMIN': return userProfile?.isAdmin ? <AdminPanel /> : <div className="p-8 text-center text-red-500">Access Denied</div>;
      default: return <DashboardOverview onNavigate={navigateDashboard} onTriggerUpgrade={() => setActiveDashboardTab('RESELLER')} />;
    }
  };

  return (
    <Layout 
      onNavigate={navigateTo} 
      isDashboard={currentPage === 'DASHBOARD'} 
      activeTab={activeDashboardTab}
      onDashboardNavigate={navigateDashboard}
    >
      <Toaster position="top-right" />
      <ReceiptModal 
        isOpen={showReceipt} 
        onClose={() => setShowReceipt(false)} 
        response={lastResponse}
        loading={isProcessing}
      />
      
      {currentPage === 'DASHBOARD' ? (
        renderDashboardContent()
      ) : (
        // Public Static Pages inside Layout
        <div className="py-12">
           {currentPage === 'PRICING_PUBLIC' && <PricingPage />}
           {currentPage === 'PRIVACY' && <PrivacyPolicy />}
           {currentPage === 'TERMS' && <TermsOfService />}
           {currentPage === 'ABOUT' && <AboutUs />}
           {currentPage === 'SUPPORT' && <ContactSupport />}
        </div>
      )}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;