import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Smartphone, Wifi, Tv, Zap, ArrowLeft, LayoutGrid, ShieldCheck, ChevronRight, Sparkles, Database } from 'lucide-react';
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
  const { dataPlans, cablePlans, electricityProviders, refreshServices } = useServices();

  const [showConfirm, setShowConfirm] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingConfig, setPendingConfig] = useState<any>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [displayAmount, setDisplayAmount] = useState(0);

  useEffect(() => {
    // Ensure services are loaded when arriving here
    refreshServices();
  }, []);

  const serviceCategories = [
    { id: 'airtime', label: 'Airtime', icon: Smartphone, color: 'text-blue-400', bg: 'bg-blue-600', desc: 'Instant Recharge' },
    { id: 'data', label: 'Data Hub', icon: Wifi, color: 'text-emerald-400', bg: 'bg-emerald-600', desc: 'Cheap SME Data' },
    { id: 'cable', label: 'Cable TV', icon: Tv, color: 'text-purple-400', bg: 'bg-purple-600', desc: 'TV Subscription' },
    { id: 'electricity', label: 'Utility', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-600', desc: 'Bills & Power' },
  ];

  if (serviceType === 'hub' || !serviceType) {
    return (
        <div className="space-y-10 animate-fade-in pb-20 text-left">
            <div className="px-2">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Services</h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Instant Automated Provisioning Hub</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {serviceCategories.map((s) => (
                    <button 
                        key={s.id} 
                        onClick={() => navigate(`/services/${s.id}`)}
                        className="group bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 hover:border-blue-500/50 transition-all duration-500 relative overflow-hidden"
                    >
                        <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform`}>
                            <s.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">{s.label}</h3>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{s.desc}</p>
                        <div className="mt-8 flex items-center text-blue-500 text-[10px] font-black uppercase group-hover:text-white transition-colors">
                            OPEN NODE <ChevronRight className="w-4 h-4 ml-2" />
                        </div>
                        <div className={`absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity`}>
                            <s.icon className="w-48 h-48" />
                        </div>
                    </button>
                ))}
            </div>

            <div className="bg-slate-950/50 border border-slate-900 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-8 shadow-inner">
                <div className="bg-blue-600/10 p-5 rounded-3xl"><Sparkles className="w-10 h-10 text-blue-500" /></div>
                <div className="flex-1">
                    <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">Automatic Delivery</h4>
                    <p className="text-slate-500 text-xs font-bold leading-relaxed mt-1 uppercase tracking-wider">All transactions are processed by our intelligence oracle in real-time. Delivery takes less than 10 seconds.</p>
                </div>
            </div>
        </div>
    );
  }

  const handleFormSubmit = (config: any) => {
      let amt = Number(config.details.amount) || 0;
      if (config.type === 'DATA') {
          const plan = dataPlans.find(p => p.apiId === config.details.planId);
          if (plan) amt = plan.price;
      } else if (config.type === 'CABLE') {
          const plan = cablePlans.find(p => p.apiId === config.details.planId);
          if (plan) amt = plan.price;
      }
      setDisplayAmount(amt);
      setPendingConfig({ ...config, resolvedAmount: amt });
      setShowConfirm(true);
  };

  const executeTransaction = async () => {
      setShowPin(false);
      setIsProcessing(true);
      setShowReceipt(true);
      try {
          const { type, details } = pendingConfig;
          const reqId = `REQ-${Date.now()}`;
          let res;
          if (type === 'AIRTIME') res = await buyAirtime(details.network, details.amount, details.phone, reqId);
          else if (type === 'DATA') res = await buyData(details.planId, details.phone, reqId);
          else if (type === 'CABLE') res = await buyCable(details.planId, details.iuc, reqId);
          else if (type === 'ELECTRICITY') res = await payElectricity(details.discoId, details.meterNumber, details.amount, details.meterType, reqId);
          setLastResponse({ success: res.success, data: { ...res.data, type, amount: displayAmount, description: `Purchase: ${type} ${details.phone || details.iuc || details.meterNumber}` } });
      } catch (e: any) {
          setLastResponse({ success: false, data: { message: e.message } });
      } finally {
          setIsProcessing(false);
      }
  };

  return (
      <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-32 text-left">
          <div className="flex items-center space-x-6 px-2">
              <button onClick={() => navigate('/services/hub')} className="p-4 bg-slate-900 border border-slate-800 rounded-[1.5rem] text-slate-500 hover:text-white transition-all active:scale-90"><ArrowLeft className="w-6 h-6" /></button>
              <div>
                  <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">{serviceType} Hub</h1>
                  <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Authorized Connection Active</p>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group">
                  <ConnectionForm 
                      initialService={serviceType.toUpperCase()}
                      onSubmit={handleFormSubmit}
                      isLoading={isProcessing}
                      dataPlans={dataPlans}
                      cablePlans={cablePlans}
                      electricityProviders={electricityProviders}
                  />
              </div>

              <div className="space-y-6">
                 <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
                    <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8 flex items-center"><ShieldCheck className="w-4 h-4 mr-3 text-blue-500" /> SYSTEM LOGS</h4>
                    <ul className="space-y-5">
                        {["Secure API Bridge: OK", "Wallet Lock: ACTIVE", "Refund Protocol: LOADED", "Node Latency: 15ms"].map((txt, i) => (
                            <li key={i} className="flex items-center text-slate-500 text-[10px] font-black uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-4"></div>{txt}</li>
                        ))}
                    </ul>
                 </div>
              </div>
          </div>

          <ConfirmationModal isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={() => { setShowConfirm(false); setShowPin(true); }} details={[]} amount={displayAmount} />
          <TransactionPinModal isOpen={showPin} onClose={() => setShowPin(false)} onSuccess={executeTransaction} amount={displayAmount} />
          <ReceiptModal isOpen={showReceipt} onClose={() => { setShowReceipt(false); setLastResponse(null); }} response={lastResponse} loading={isProcessing} />
      </div>
  );
};