import React, { useState, useEffect } from 'react';
import { Layout, PageView, DashboardTab } from './components/Layout';
import { ConnectionForm } from './components/ConnectionForm';
import { LandingPage } from './components/LandingPage';
import { ResponseDisplay } from './components/ResponseDisplay';
import { DashboardOverview } from './components/DashboardOverview';
import { WalletPage } from './components/WalletPage';
import { SavingsPage } from './components/SavingsPage';
import { HistoryPage } from './components/HistoryPage';
import { ResellerPage, RewardsPage, ApiDocsPage, ProfilePage } from './components/SecondaryPages';
import { AdminPanel } from './components/AdminPanel';
import { PrivacyPolicy, TermsOfService, AboutUs, ContactSupport } from './components/StaticPages';
import { AuthPage } from './components/AuthPage';
import { PaystackForm } from './components/PaystackForm';
import { ServicesPage } from './components/ServicesPage';
import { ReceiptModal } from './components/ReceiptModal';
import { executeApiRequest } from './services/api';
import { ApiConfig, ApiResponse } from './types';
import { Activity, ArrowLeft, Loader2, Zap } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from './services/firebase';

const AuthenticatedApp: React.FC = () => {
  const { currentUser, userProfile, loading: authLoading, updateRole, refreshProfile } = useAuth();
  
  const [view, setView] = useState<PageView>('LANDING');
  const [activeTab, setActiveTab] = useState<DashboardTab>('OVERVIEW');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Reseller Upgrade Modal State
  const [showResellerModal, setShowResellerModal] = useState(false);

  // Check for pending upgrade on load
  useEffect(() => {
    if (userProfile) {
        // @ts-ignore
        if (userProfile.pendingUpgrade) {
            setShowResellerModal(true);
        }
    }
  }, [userProfile]);

  const handleNavigate = (page: PageView) => {
    if (page === 'DASHBOARD' && !currentUser) {
       // Logic handled by main return if not logged in
    }
    setView(page);
    window.scrollTo(0, 0);
  };

  const handleDashboardNavigate = (tab: DashboardTab) => {
    setActiveTab(tab);
    setResponse(null); 
    window.scrollTo(0, 0);
  };

  const handleApiRequest = async (config: ApiConfig) => {
    setLoading(true);
    setResponse(null);
    setIsReceiptOpen(true); // Open modal immediately to show loading state
    try {
      const result = await executeApiRequest(config);
      setResponse(result);
      // ReceiptModal stays open, now showing result
    } catch (error) {
      console.error("Unexpected error in App:", error);
      setResponse({
        success: false,
        status: 0,
        statusText: 'Client Error',
        data: { error: 'An unexpected error occurred within the application.' },
        headers: {},
        duration: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResellerPaymentSuccess = async () => {
      if (currentUser) {
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
              isReseller: true,
              pendingUpgrade: deleteField()
          });
          await refreshProfile();
          setShowResellerModal(false);
          alert("Upgrade Successful! You are now a Reseller.");
      }
  };

  if (authLoading) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
      );
  }

  if (!currentUser && (view === 'DASHBOARD')) {
      return <AuthPage onSuccess={() => setView('DASHBOARD')} />;
  }

  if (showResellerModal && currentUser) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-amber-500 rounded-2xl p-8 max-w-md w-full shadow-2xl">
                  <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 rounded-full mb-4">
                          <Zap className="w-10 h-10 text-amber-500" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">Complete Reseller Upgrade</h2>
                      <p className="text-slate-400">You selected the Reseller package. Please pay the one-time fee of ₦1,000 to activate your account benefits.</p>
                  </div>

                  <PaystackForm 
                    onSubmit={() => {}} 
                    isLoading={false}
                    forcedAmount="1000"
                    forcedAction="INITIALIZE"
                    title="Reseller Upgrade Fee"
                    onSuccess={handleResellerPaymentSuccess}
                  />
                  
                  <button 
                    onClick={async () => {
                        const userRef = doc(db, 'users', currentUser.uid);
                        await updateDoc(userRef, { pendingUpgrade: deleteField() });
                        await refreshProfile();
                        setShowResellerModal(false);
                    }}
                    className="mt-4 text-slate-500 text-sm hover:text-white underline w-full text-center"
                  >
                      Cancel Upgrade (Stay as Regular User)
                  </button>
              </div>
          </div>
      )
  }

  // 1. Landing Page
  if (view === 'LANDING') {
    return <LandingPage onGetStarted={() => currentUser ? setView('DASHBOARD') : setView('DASHBOARD')} onNavigate={handleNavigate} onDashboardNavigate={handleDashboardNavigate} />;
  }

  // 2. Static Pages
  if (['PRIVACY', 'TERMS', 'ABOUT', 'SUPPORT'].includes(view)) {
    return (
      <Layout onNavigate={handleNavigate} isDashboard={false}>
         <div className="pt-8">
           <div className="mb-6 max-w-7xl mx-auto">
             <button 
                  onClick={() => handleNavigate('LANDING')}
                  className="flex items-center text-slate-400 hover:text-white transition-colors"
              >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
              </button>
           </div>
           
           {view === 'PRIVACY' && <PrivacyPolicy />}
           {view === 'TERMS' && <TermsOfService />}
           {view === 'ABOUT' && <AboutUs />}
           {view === 'SUPPORT' && <ContactSupport />}
         </div>
      </Layout>
    );
  }

  // 3. Dashboard View
  return (
    <Layout 
      onNavigate={handleNavigate} 
      isDashboard={true} 
      activeTab={activeTab}
      onDashboardNavigate={handleDashboardNavigate}
    >
      <div className="w-full">
        {/* Breadcrumb / Logout Mobile Only */}
        <div className="md:hidden mb-6">
            <button 
                onClick={() => handleNavigate('LANDING')}
                className="flex items-center text-slate-400 hover:text-white transition-colors text-sm"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back / Logout
            </button>
        </div>

        {/* Global Receipt Modal */}
        <ReceiptModal 
            isOpen={isReceiptOpen} 
            onClose={() => setIsReceiptOpen(false)} 
            response={response} 
            loading={loading} 
        />

        {/* Dynamic Content Switching */}
        {activeTab === 'OVERVIEW' && (
           <DashboardOverview 
              onNavigate={handleDashboardNavigate} 
              onTriggerUpgrade={() => setShowResellerModal(true)} 
           />
        )}

        {activeTab === 'SERVICES' && (
            <div className="grid grid-cols-1 gap-6 animate-fade-in-up">
              {/* Only show Debug Panel for Admins */}
              {userProfile?.isAdmin ? (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                       <div className="lg:col-span-7">
                           <ServicesPage onSubmit={handleApiRequest} isLoading={loading} />
                       </div>
                       <div className="lg:col-span-5">
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-full min-h-[500px] flex flex-col sticky top-24">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-white flex items-center">
                                        <Activity className="w-5 h-5 mr-2 text-red-500" /> Admin Monitor
                                    </h2>
                                    <div className="flex items-center space-x-1.5">
                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                        <span className="text-xs text-red-500 font-bold uppercase">Live Log</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <ResponseDisplay response={response} loading={loading} />
                                </div>
                            </div>
                       </div>
                   </div>
              ) : (
                  // Normal User View: Just the form, centered
                  <div className="max-w-4xl mx-auto w-full">
                      <ServicesPage onSubmit={handleApiRequest} isLoading={loading} />
                  </div>
              )}
           </div>
        )}

        {activeTab === 'WALLET' && <WalletPage onSubmit={handleApiRequest} isLoading={loading} />}
        {activeTab === 'SAVINGS' && <SavingsPage />}
        {activeTab === 'HISTORY' && <HistoryPage />}
        {activeTab === 'RESELLER' && <ResellerPage onTriggerUpgrade={() => setShowResellerModal(true)} />}
        {activeTab === 'REWARDS' && <RewardsPage />}
        {activeTab === 'API' && <ApiDocsPage />}
        {activeTab === 'PROFILE' && <ProfilePage />}
        {activeTab === 'ADMIN' && userProfile?.isAdmin && <AdminPanel />}
        
      </div>
    </Layout>
  );
};

// Wrap main App component with Provider
const App: React.FC = () => {
    return (
        <AuthProvider>
            <AuthenticatedApp />
        </AuthProvider>
    )
}

export default App;