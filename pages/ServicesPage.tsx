import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Smartphone, Wifi, Tv, Zap, ArrowLeft, ChevronRight, Sparkles, ShieldCheck, Database } from 'lucide-react';
import { useServices } from '../contexts/ServiceContext';
import { buyAirtime, buyData, buyCable, payElectricity } from '../services/api';
import { ConnectionForm } from '../components/ConnectionForm';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { TransactionPinModal } from '../components/TransactionPinModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { toast } from 'react-hot-toast';

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

  useEffect(() => { refreshServices(); }, []);

  const serviceCategories = [
    { id: 'airtime', label: 'Buy Airtime', icon: Smartphone, color: 'bg-blue-600', desc: 'Instant recharge for all networks.' },
    { id: 'data', label: 'Buy Data', icon: Wifi, color: 'bg-emerald-600', desc: 'Cheap SME & Corporate bundles.' },
    { id: 'cable', label: 'Cable TV', icon: Tv, color: 'bg-purple-600', desc: 'DSTV, GOTV & Startimes renewal.' },
    { id: 'electricity', label: 'Electric Bills', icon: Zap, color: 'bg-amber-600', desc: 'Prepaid & Postpaid bill payment.' },
  ];

  if (serviceType === 'hub' || !serviceType) {
    return (
        <div className="space-y-12 animate-fade-in pb-20 text-left">
            <div className="px-2">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Service Hub</h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-2">What would you like to do today?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {serviceCategories.map((s) => (
                    <button 
                        key={s.id} 
                        onClick={() => navigate(`/services/${s.id}`)}
                        className="group bg-slate-900 border border-slate-800 rounded-[3.5rem] p-12 hover:border-blue-600/50 transition-all duration-500 relative overflow-hidden text-left shadow-2xl flex items-center justify-between"
                    >
                        <div className="flex items-center gap-8 relative z-10">
                            <div className={`w-16 h-16 rounded-2xl ${s.color} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform`}>
                                <s.icon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-1">{s.label}</h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{s.desc}</p>
                            </div>
                        </div>
                        <div className="relative z-10 bg-slate-950 p-4 rounded-full text-slate-700 group-hover:text-blue-500 transition-colors">
                            <ChevronRight className="w-6 h-6" />
                        </div>
                        <s.icon className="absolute -right-12 -bottom-12 w-64 h-64 opacity-5 group-hover:opacity-10 transition-opacity" />
                    </button>
                ))}
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-10 shadow-inner">
                <div className="bg-blue-600/10 p-6 rounded-[2rem] border border-blue-500/10"><Sparkles className="w-12 h-12 text-blue-500" /></div>
                <div className="flex-1">
                    <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">Automated Provisioning</h4>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed mt-2 italic">All services are processed by our dedicated system in real-time. We ensure zero delay in service delivery for our users.</p>
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
          
          if(res.success) {
            setLastResponse({ success: true, data: { amount: displayAmount, type, description: `Purchase: ${type} for ${details.phone || details.iuc || details.meterNumber}`, reference: reqId } });
          } else {
            setLastResponse({ success: false, data: { message: res.error?.message || "Transaction Rejected" } });
          }
      } catch (e: any) {
          setLastResponse({ success: false, data: { message: "System Linkage Error" } });
      } finally {
          setIsProcessing(false);
      }
  };

  return (
      <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-32 text-left">
          <div className="flex items-center space-x-6 px-2">
              <button onClick={() => navigate('/services/hub')} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 hover:text-white transition-all active:scale-90 shadow-xl"><ArrowLeft className="w-6 h-6" /></button>
              <div>
                  <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">{serviceType}</h1>
                  <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">System Tunnel Connected</p>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"><Zap className="w-64 h-64 text-blue-500" /></div>
                  <ConnectionForm 
                      initialService={serviceType.toUpperCase()}
                      onSubmit={handleFormSubmit}
                      isLoading={isProcessing}
                      dataPlans={dataPlans}
                      cablePlans={cablePlans}
                      electricityProviders={electricityProviders}
                  />
              </div>

              <div className="lg:col-span-4 space-y-8">
                 <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                    <ShieldCheck className="w-10 h-10 text-blue-500 mb-8" />
                    <h4 className="text-white font-black text-xs uppercase tracking-[0.4em] mb-6">Security Logs</h4>
                    <ul className="space-y-6">
                        {["Secure Tunnel Active", "System Check: OK", "Automatic Refund: ON", "Latency: 12ms"].map((txt, i) => (
                            <li key={i} className="flex items-center text-slate-500 text-[10px] font-black uppercase tracking-widest"><div className="w-2 h-2 bg-blue-600 rounded-full mr-4 shadow-xl shadow-blue-600/40"></div>{txt}</li>
                        ))}
                    </ul>
                 </div>
                 <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                    <div className="flex items-center gap-4 text-emerald-500 text-[10px] font-black tracking-widest uppercase">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-xl shadow-emerald-600/50"></div>
                        Our Terminal is Online
                    </div>
                 </div>
              </div>
          </div>

          <ConfirmationModal isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={() => { setShowConfirm(false); setShowPin(true); }} details={[]} amount={displayAmount} />
          <TransactionPinModal isOpen={showPin} onClose={() => setShowPin(false)} onSuccess={executeTransaction} amount={displayAmount} />
          <ReceiptModal isOpen={showReceipt} onClose={() => { setShowReceipt(false); setLastResponse(null); }} response={lastResponse} loading={isProcessing} />
      </div>
  );
};