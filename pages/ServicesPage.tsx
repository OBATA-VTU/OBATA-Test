import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
// Added ShieldCheck to the lucide-react imports
import { Smartphone, Wifi, Tv, Zap, ArrowLeft, Loader2, Sparkles, LayoutGrid, ShieldCheck } from 'lucide-react';
import { useServices } from '../contexts/ServiceContext';
import { buyAirtime, buyData, buyCable, payElectricity } from '../services/api';
import { ConnectionForm } from '../components/ConnectionForm';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { TransactionPinModal } from '../components/TransactionPinModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const ServicesPage: React.FC = () => {
  const { serviceType } = useParams<{ serviceType: string }>();
  const navigate = useNavigate();
  const { dataPlans, cablePlans, electricityProviders } = useServices();

  const [showConfirm, setShowConfirm] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingConfig, setPendingConfig] = useState<any>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [displayAmount, setDisplayAmount] = useState(0);
  
  // Dynamic Asset State
  const [providerAssets, setProviderAssets] = useState<any>({});

  useEffect(() => {
    const fetchBranding = async () => {
        try {
            const snap = await getDoc(doc(db, 'settings', 'assets'));
            if (snap.exists()) setProviderAssets(snap.data());
        } catch (e) { console.error("Identity fetch failed"); }
    };
    fetchBranding();
  }, []);

  if (!serviceType) return <Navigate to="/services/airtime" replace />;

  const tabs = [
    { id: 'airtime', label: 'Airtime', icon: Smartphone, color: 'text-blue-500' },
    { id: 'data', label: 'Data Hub', icon: Wifi, color: 'text-emerald-500' },
    { id: 'cable', label: 'TV Sub', icon: Tv, color: 'text-purple-500' },
    { id: 'electricity', label: 'Power', icon: Zap, color: 'text-amber-500' },
  ];

  const handleFormSubmit = (config: any) => {
      let amount = Number(config.details.amount) || 0;
      if (config.type === 'DATA' && config.details.planId) {
          const plan = dataPlans.find(p => p.apiId === config.details.planId);
          if (plan) amount = plan.price;
      } else if (config.type === 'CABLE' && config.details.planId) {
          const plan = cablePlans.find(p => p.apiId === config.details.planId);
          if (plan) amount = plan.price;
      }
      setDisplayAmount(amount);
      setPendingConfig({ ...config, resolvedAmount: amount });
      setShowConfirm(true);
  };

  const executeTransaction = async () => {
      setShowPin(false);
      setIsProcessing(true);
      setShowReceipt(true);
      try {
          const { type, details } = pendingConfig;
          const requestId = `REQ-${Date.now()}`;
          let res;
          if (type === 'AIRTIME') res = await buyAirtime(details.network, details.amount, details.phone, requestId);
          else if (type === 'DATA') res = await buyData(details.planId, details.phone, requestId);
          else if (type === 'CABLE') res = await buyCable(details.planId, details.iuc, requestId);
          else if (type === 'ELECTRICITY') res = await payElectricity(details.discoId, details.meterNumber, details.amount, details.meterType, requestId);
          setLastResponse(res);
      } catch (e: any) {
          setLastResponse({ success: false, data: { message: e.message } });
      } finally {
          setIsProcessing(false);
      }
  };

  const getModalDetails = () => {
      if (!pendingConfig) return [];
      const { details, type } = pendingConfig;
      const list = [];
      if (type === 'AIRTIME') { 
          list.push({ label: 'Service', value: 'Instant Airtime' }); 
          list.push({ label: 'Recipient', value: details.phone }); 
      }
      else if (type === 'DATA') { 
          const plan = dataPlans.find(p => p.apiId === details.planId); 
          list.push({ label: 'Bundle', value: plan?.name || 'SME Data' }); 
          list.push({ label: 'Phone', value: details.phone }); 
      }
      return list;
  };

  return (
      <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-32">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
              <div className="flex items-center space-x-5">
                  <button onClick={() => navigate('/dashboard')} className="p-4 bg-slate-900 border border-slate-800 rounded-[1.5rem] text-slate-500 hover:text-white transition-all active:scale-90 hover:border-blue-500/50">
                      <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div>
                      <h1 className="text-4xl font-black text-white tracking-tighter">Digital Hub</h1>
                      <div className="flex items-center text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
                          <Sparkles className="w-3 h-3 mr-2" />
                          <span>Instant Provisioning Active</span>
                      </div>
                  </div>
              </div>

              {/* Dynamic Provider Visuals */}
              {(serviceType === 'airtime' || serviceType === 'data') && (
                <div className="flex items-center space-x-3 bg-slate-900/50 p-3 rounded-[1.8rem] border border-slate-800">
                    {['MTN', 'AIRTEL', 'GLO', '9MOBILE'].map(p => (
                        <div key={p} className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center p-2 group relative">
                            {providerAssets[p] ? (
                                <img src={providerAssets[p]} alt={p} className="w-full h-full object-contain grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                            ) : (
                                <span className="text-[8px] font-black text-slate-600">{p[0]}</span>
                            )}
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border border-slate-950"></div>
                        </div>
                    ))}
                </div>
              )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-900 p-2 rounded-[2.2rem] border border-slate-800 overflow-x-auto no-scrollbar shadow-2xl">
              {tabs.map(tab => (
                  <button
                      key={tab.id}
                      onClick={() => navigate(`/services/${tab.id}`)}
                      className={`flex-1 flex items-center justify-center space-x-3 py-5 px-8 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-500 ${
                          serviceType === tab.id 
                              ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30 scale-100' 
                              : 'text-slate-500 hover:text-white hover:bg-slate-800'
                      }`}
                  >
                      <tab.icon className={`w-4 h-4 ${serviceType === tab.id ? 'text-white' : tab.color}`} />
                      <span>{tab.label}</span>
                  </button>
              ))}
          </div>

          {/* Form Container */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-14 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <LayoutGrid className="w-64 h-64 text-blue-500" />
                </div>
                <div className="relative z-10">
                    <ConnectionForm 
                        initialService={serviceType.toUpperCase()}
                        onSubmit={handleFormSubmit}
                        isLoading={isProcessing}
                        dataPlans={dataPlans}
                        cablePlans={cablePlans}
                        electricityProviders={electricityProviders}
                    />
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                 <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
                    <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6 flex items-center">
                        <ShieldCheck className="w-4 h-4 mr-3 text-blue-500" /> Secure Protocol
                    </h4>
                    <ul className="space-y-4">
                        {[
                            "Direct API Handshake",
                            "Encrypted Transaction PIN",
                            "Auto-Refund on Failure",
                            "Verified Service Providers"
                        ].map((txt, i) => (
                            <li key={i} className="flex items-center text-slate-400 text-xs font-bold">
                                <div className="w-1 h-1 bg-blue-500 rounded-full mr-3"></div>
                                {txt}
                            </li>
                        ))}
                    </ul>
                 </div>
                 
                 <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-70">Support Hub</p>
                        <h4 className="text-xl font-black tracking-tight mb-4">Having Issues?</h4>
                        <p className="text-blue-100 text-xs leading-relaxed mb-6 font-medium">Our system is monitored 24/7 by the Oracle. If a transaction fails, click history and report it instantly.</p>
                        <button onClick={() => navigate('/history')} className="w-full bg-white text-blue-900 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all">Report Transaction</button>
                    </div>
                    <Zap className="absolute -bottom-8 -right-8 w-40 h-40 opacity-10 rotate-12" />
                 </div>
              </div>
          </div>

          <ConfirmationModal isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={() => { setShowConfirm(false); setShowPin(true); }} details={getModalDetails()} amount={displayAmount} />
          <TransactionPinModal isOpen={showPin} onClose={() => setShowPin(false)} onSuccess={executeTransaction} amount={displayAmount} />
          <ReceiptModal isOpen={showReceipt} onClose={() => { setShowReceipt(false); setLastResponse(null); }} response={lastResponse} loading={isProcessing} />
      </div>
  );
};