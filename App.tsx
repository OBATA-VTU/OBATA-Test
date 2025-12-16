import React, { useState } from 'react';
import { Layout, PageView, DashboardTab } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { DashboardOverview } from './components/DashboardOverview';
import { WalletPage } from './components/WalletPage';
import { SavingsPage } from './components/SavingsPage';
import { HistoryPage } from './components/HistoryPage';
import { ResellerPage, RewardsPage, ReferralsPage, ApiDocsPage, ProfilePage } from './components/SecondaryPages';
import { AdminPanel } from './components/AdminPanel';
import { PrivacyPolicy, TermsOfService, AboutUs, ContactSupport } from './components/StaticPages';
import { PaystackForm } from './components/PaystackForm';
import { ServicesPage } from './components/ServicesPage';
import { ReceiptModal } from './components/ReceiptModal';
import { PricingPage } from './components/PricingPage';
import { executeApiRequest } from './services/api';
import { ApiConfig, ApiResponse } from './types';
import { ArrowLeft, Loader2, Zap } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { db } from './services/firebase';
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';

const AuthenticatedApp: React.FC = () => {
  const { currentUser, userProfile, loading: authLoading, updateRole, refreshProfile } = useAuth();
  
  const [view, setView] = useState<PageView>('LANDING'); // Default to Landing/Home
  const [activeTab, setActiveTab] = useState<DashboardTab>('OVERVIEW');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [showResellerModal, setShowResellerModal] = useState(false);

  const handleNavigate = (page: PageView) => {
    setView(page);
    window.scrollTo(0, 0);
  };

  const handleDashboardNavigate = (tab: DashboardTab) => {
    setActiveTab(tab);
    setResponse(null); 
    window.scrollTo(0, 0);
  };

  const handleLandingToDashboard = () => {
    setView('DASHBOARD');
    setActiveTab('OVERVIEW');
    window.scrollTo(0, 0);
  };

  const processCommission = async (purchaseAmount: number, type: string) => {
      if (!currentUser || !userProfile?.isReseller) return;

      // Reseller Commission Logic (Cashback)
      // 1% Cashback on Airtime
      let commission = 0;
      if (type.includes('AIRTIME')) {
          commission = purchaseAmount * 0.01; 
      } else if (type.includes('DATA')) {
          // Flat rate commission for data (simulated as difference)
          commission = 50; 
      }

      if (commission > 0) {
          try {
             const userRef = doc(db, 'users', currentUser.uid);
             await updateDoc(userRef, {
                 commissionBalance: increment(commission)
             });
             // Log the commission
             await addDoc(collection(db, 'transactions'), {
                 userId: currentUser.uid,
                 type: 'CREDIT',
                 amount: commission,
                 description: 'Reseller Cashback Commission',
                 status: 'SUCCESS',
                 date: serverTimestamp()
             });
          } catch (e) {
              console.error("Failed to credit commission", e);
          }
      }
  };

  const handleApiRequest = async (config: ApiConfig) => {
    setLoading(true);
    setResponse(null);
    setIsReceiptOpen(true); 
    try {
      const result = await executeApiRequest(config);
      setResponse(result);
      
      // If transaction successful, trigger commission logic
      if (result.success) {
          // Parse amount from config or response if possible
          let amount = 0;
          try {
             if (typeof config.body === 'string') {
                const body = JSON.parse(config.body);
                amount = Number(body.amount) || 0;
             }
          } catch (e) {}
          
          if (amount > 0) {
             const type = config.url.toUpperCase();
             await processCommission(amount, type);
             await refreshProfile();
          }
      }
    } catch (error: any) {
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
      updateRole(true);
      setShowResellerModal(false);
      alert("Upgrade Successful! You are now a Reseller.");
  };

  if (authLoading) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
      );
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
                    onClick={() => setShowResellerModal(false)}
                    className="mt-4 text-slate-500 text-sm hover:text-white underline w-full text-center"
                  >
                      Cancel Upgrade
                  </button>
              </div>
          </div>
      )
  }

  // 1. Landing / Home Page
  if (view === 'LANDING') {
    return <LandingPage onGetStarted={handleLandingToDashboard} onNavigate={handleNavigate} onDashboardNavigate={handleDashboardNavigate} />;
  }

  // 2. Public Pricing Page (Standalone)
  if (view === 'PRICING_PUBLIC') {
      return (
        <Layout onNavigate={handleNavigate} isDashboard={false}>
            <div className="pt-8">
               <div className="mb-6 max-w-7xl mx-auto px-4">
                 <button 
                      onClick={() => handleNavigate('LANDING')}
                      className="flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                  </button>
               </div>
               <div className="max-w-7xl mx-auto px-4">
                   <PricingPage />
               </div>
            </div>
        </Layout>
      )
  }

  // 3. Static Pages
  if (['PRIVACY', 'TERMS', 'ABOUT', 'SUPPORT'].includes(view)) {
    return (
      <Layout onNavigate={handleNavigate} isDashboard={false}>
         <div className="pt-8">
           <div className="mb-6 max-w-7xl mx-auto px-4">
             <button 
                  onClick={() => handleNavigate('LANDING')}
                  className="flex items-center text-slate-400 hover:text-white transition-colors"
              >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
              </button>
           </div>
           
           <div className="px-4">
              {view === 'PRIVACY' && <PrivacyPolicy />}
              {view === 'TERMS' && <TermsOfService />}
              {view === 'ABOUT' && <AboutUs />}
              {view === 'SUPPORT' && <ContactSupport />}
           </div>
         </div>
      </Layout>
    );
  }

  // 4. Dashboard View
  return (
    <Layout 
      onNavigate={handleNavigate} 
      isDashboard={true} 
      activeTab={activeTab}
      onDashboardNavigate={handleDashboardNavigate}
    >
      <div className="w-full">
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
            <div className="max-w-5xl mx-auto w-full animate-fade-in-up">
               <ServicesPage onSubmit={handleApiRequest} isLoading={loading} />
            </div>
        )}

        {/* Wallet Tab */}
        {activeTab === 'WALLET' && <WalletPage onSubmit={handleApiRequest} isLoading={loading} />}
        
        {/* Savings Tab */}
        {activeTab === 'SAVINGS' && <SavingsPage />}

        {/* History Tab */}
        {activeTab === 'HISTORY' && <HistoryPage onTransactionClick={(txn) => {
             setResponse({
                 success: txn.status === 'SUCCESS',
                 status: 200,
                 statusText: 'OK',
                 data: { message: txn.description, data: txn },
                 headers: {},
                 duration: 0
             });
             setIsReceiptOpen(true);
        }} />}

        {activeTab === 'RESELLER' && <ResellerPage onTriggerUpgrade={() => setShowResellerModal(true)} />}
        {activeTab === 'REWARDS' && <RewardsPage />}
        {activeTab === 'REFERRALS' && <ReferralsPage />}
        {activeTab === 'API' && <ApiDocsPage />}
        {activeTab === 'PROFILE' && <ProfilePage />}
        {activeTab === 'ADMIN' && userProfile?.isAdmin && <AdminPanel />}
        
      </div>
    </Layout>
  );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AuthenticatedApp />
        </AuthProvider>
    )
}

export default App;