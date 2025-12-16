import React, { useState } from 'react';
import { Layout, PageView } from './components/Layout';
import { ConnectionForm } from './components/ConnectionForm';
import { PaystackForm } from './components/PaystackForm';
import { ImgBBForm } from './components/ImgBBForm';
import { LandingPage } from './components/LandingPage';
import { ResponseDisplay } from './components/ResponseDisplay';
import { PrivacyPolicy, TermsOfService, AboutUs, ContactSupport } from './components/StaticPages';
import { executeApiRequest } from './services/api';
import { ApiConfig, ApiResponse } from './types';
import { Activity, Wallet, CreditCard, Image as ImageIcon, ArrowLeft } from 'lucide-react';

type TabType = 'VTU' | 'WALLET' | 'UPLOAD';

const App: React.FC = () => {
  const [view, setView] = useState<PageView>('LANDING');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('VTU');

  const handleNavigate = (page: PageView) => {
    setView(page);
    window.scrollTo(0, 0);
  };

  const handleApiRequest = async (config: ApiConfig) => {
    setLoading(true);
    setResponse(null);
    try {
      const result = await executeApiRequest(config);
      setResponse(result);
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

  // 1. Landing Page
  if (view === 'LANDING') {
    return <LandingPage onGetStarted={() => handleNavigate('DASHBOARD')} onNavigate={handleNavigate} />;
  }

  // 2. Static Pages (Wrapped in Layout)
  if (['PRIVACY', 'TERMS', 'ABOUT', 'SUPPORT'].includes(view)) {
    return (
      <Layout onNavigate={handleNavigate}>
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

  // 3. Dashboard View (Wrapped in Layout)
  return (
    <Layout onNavigate={handleNavigate} isDashboard={true}>
      <div className="max-w-6xl mx-auto">
        
        {/* Back to Home Navigation */}
        <div className="mb-6 flex items-center justify-between">
            <button 
                onClick={() => handleNavigate('LANDING')}
                className="flex items-center text-slate-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </button>
            <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                Logged in as Guest
            </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Input Form */}
            <div className="lg:col-span-7 space-y-6">
            
            {/* Dashboard Tabs */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex space-x-1 shadow-xl">
                <button 
                    onClick={() => { setActiveTab('VTU'); setResponse(null); }}
                    className={`flex-1 py-3 px-3 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all duration-200 ${activeTab === 'VTU' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                >
                    <Wallet className="w-4 h-4" />
                    <span>Bill Payment</span>
                </button>
                <button 
                    onClick={() => { setActiveTab('WALLET'); setResponse(null); }}
                    className={`flex-1 py-3 px-3 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all duration-200 ${activeTab === 'WALLET' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                >
                    <CreditCard className="w-4 h-4" />
                    <span>Fund Wallet</span>
                </button>
                <button 
                    onClick={() => { setActiveTab('UPLOAD'); setResponse(null); }}
                    className={`flex-1 py-3 px-3 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all duration-200 ${activeTab === 'UPLOAD' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                >
                    <ImageIcon className="w-4 h-4" />
                    <span>KYC Upload</span>
                </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -z-10"></div>

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-1">
                        {activeTab === 'VTU' && 'Top-up & Utilities'}
                        {activeTab === 'WALLET' && 'Add Funds'}
                        {activeTab === 'UPLOAD' && 'Upload Documents'}
                    </h2>
                    <p className="text-sm text-slate-400">
                        {activeTab === 'VTU' && 'Select a service below to proceed.'}
                        {activeTab === 'WALLET' && 'Securely fund your wallet via Paystack.'}
                        {activeTab === 'UPLOAD' && 'Upload ID for verification (ImgBB).'}
                    </p>
                </div>
                
                {activeTab === 'VTU' && (
                <ConnectionForm onSubmit={handleApiRequest} isLoading={loading} />
                )}
                {activeTab === 'WALLET' && (
                <PaystackForm onSubmit={handleApiRequest} isLoading={loading} />
                )}
                {activeTab === 'UPLOAD' && (
                <ImgBBForm onSubmit={handleApiRequest} isLoading={loading} />
                )}

            </div>
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-5">
               <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-full min-h-[500px] flex flex-col sticky top-24">
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-lg font-bold text-white flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-emerald-500" /> Activity Monitor
                   </h2>
                   <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span className="text-xs text-emerald-500 font-bold uppercase">System Online</span>
                   </div>
                </div>
                
                <div className="flex-1">
                  <ResponseDisplay response={response} loading={loading} />
                </div>
              </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default App;