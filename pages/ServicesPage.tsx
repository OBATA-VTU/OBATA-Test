import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Smartphone, Wifi, Tv, Zap, Loader2, CheckCircle, Search, ChevronRight, ArrowLeft } from 'lucide-react';
import { useServices } from '../contexts/ServiceContext';
import { useAuth } from '../contexts/AuthContext';
import { buyAirtime, buyData, buyCable, payElectricity, validateMeter, validateCable } from '../services/api';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { TransactionPinModal } from '../components/TransactionPinModal';
import { ReceiptModal } from '../components/ReceiptModal';

export const ServicesPage: React.FC = () => {
  const { serviceType } = useParams<{ serviceType: string }>();
  const navigate = useNavigate();
  const { dataPlans, cablePlans, electricityProviders, getNetworkId } = useServices();
  
  // FIX: Handle default route redirection gracefully without causing render loops
  if (!serviceType) {
      return <Navigate to="/services/airtime" replace />;
  }

  // State
  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [dataTab, setDataTab] = useState<'SME' | 'DIRECT' | 'GIFTING'>('SME');
  
  // Verification State
  const [meterNum, setMeterNum] = useState('');
  const [disco, setDisco] = useState('');
  const [iuc, setIuc] = useState('');
  const [cableProvider, setCableProvider] = useState('');
  const [verifiedName, setVerifiedName] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Modals
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);

  // Network Detection
  useEffect(() => {
    if ((serviceType === 'airtime' || serviceType === 'data') && phone.length >= 4) {
        const detected = getNetworkId(phone);
        if (detected) setNetwork(detected);
    }
  }, [phone, serviceType, getNetworkId]);

  const handleVerify = async () => {
      setIsValidating(true);
      setVerifiedName('');
      try {
          let res;
          if (serviceType === 'electricity') {
             res = await validateMeter(disco, meterNum, '1'); // Defaulting to Prepaid '1' for demo
          } else if (serviceType === 'cable') {
             res = await validateCable(cableProvider, iuc);
          }
          
          if (res?.success && res.data?.status === 'success') {
              setVerifiedName(res.data.data.customerName || 'Verified User');
          } else {
              alert("Verification Failed");
          }
      } catch (e) { alert("Error verifying"); }
      finally { setIsValidating(false); }
  };

  const handleBuyClick = (e: React.FormEvent) => {
      e.preventDefault();
      // Basic Validation
      if (!amount && !selectedPlan) return;
      setShowConfirm(true);
  };

  const executeTransaction = async () => {
      setShowPin(false);
      setIsProcessing(true);
      setShowSuccess(true); // Show modal in loading state

      const requestId = `REQ-${Date.now()}`;
      let res;

      try {
          if (serviceType === 'airtime') {
              res = await buyAirtime(network, Number(amount), phone, requestId);
          } else if (serviceType === 'data') {
              res = await buyData(selectedPlan.apiId, phone, requestId);
          } else if (serviceType === 'cable') {
              res = await buyCable(selectedPlan.apiId, iuc, requestId);
          } else if (serviceType === 'electricity') {
              res = await payElectricity(disco, meterNum, Number(amount), '1', requestId);
          }
          setLastResponse(res);
      } catch (e: any) {
          setLastResponse({ success: false, data: { message: e.message } });
      } finally {
          setIsProcessing(false);
      }
  };

  const getConfirmDetails = () => {
      if (serviceType === 'airtime') return [{ label: 'Network', value: network }, { label: 'Phone', value: phone }];
      if (serviceType === 'data') return [{ label: 'Plan', value: selectedPlan?.name }, { label: 'Phone', value: phone }];
      if (serviceType === 'electricity') return [{ label: 'Disco', value: disco }, { label: 'Meter', value: meterNum }, { label: 'Name', value: verifiedName }];
      if (serviceType === 'cable') return [{ label: 'Provider', value: cableProvider }, { label: 'IUC', value: iuc }, { label: 'Name', value: verifiedName }];
      return [];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
        {/* Modals */}
        <ConfirmationModal 
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={() => { setShowConfirm(false); setShowPin(true); }}
            details={getConfirmDetails()}
            amount={Number(amount || selectedPlan?.price || 0)}
        />
        <TransactionPinModal 
            isOpen={showPin}
            onClose={() => setShowPin(false)}
            onSuccess={executeTransaction}
            amount={Number(amount || selectedPlan?.price || 0)}
        />
        <ReceiptModal 
            isOpen={showSuccess}
            onClose={() => setShowSuccess(false)}
            response={lastResponse}
            loading={isProcessing}
        />

        {/* Header Tabs */}
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
            {['airtime', 'data', 'cable', 'electricity'].map(t => (
                <button 
                    key={t}
                    onClick={() => navigate(`/services/${t}`)}
                    className={`flex-1 py-4 px-6 rounded-xl font-bold text-sm capitalize whitespace-nowrap transition-all duration-300 ${serviceType === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                    {t}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Info Panel */}
            <div className="lg:col-span-1 hidden lg:block">
                <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl p-8 border border-white/5 relative overflow-hidden h-full">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        {serviceType === 'airtime' && <Smartphone className="w-40 h-40 text-white" />}
                        {serviceType === 'data' && <Wifi className="w-40 h-40 text-white" />}
                        {serviceType === 'cable' && <Tv className="w-40 h-40 text-white" />}
                        {serviceType === 'electricity' && <Zap className="w-40 h-40 text-white" />}
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold text-white mb-4 capitalize">{serviceType}</h2>
                        <p className="text-slate-400 leading-relaxed mb-8">
                            {serviceType === 'airtime' && "Top up airtime for any network instantly. Enjoy up to 3% bonus on every recharge."}
                            {serviceType === 'data' && "Get cheap SME, Corporate Gifting, and Direct Data bundles valid for 30 days."}
                            {serviceType === 'cable' && "Never miss your favorite shows. Renew your DSTV, GOTV, and Startimes subscriptions."}
                            {serviceType === 'electricity' && "Pay your electricity bills from the comfort of your home. Prepaid and Postpaid supported."}
                        </p>
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                            <p className="text-xs text-blue-200 font-bold uppercase mb-1">Support</p>
                            <p className="text-white text-sm">Having issues? Contact our 24/7 support team.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Panel */}
            <div className="lg:col-span-2">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <form onSubmit={handleBuyClick} className="space-y-8">
                        
                        {/* AIRTIME & DATA Common Fields */}
                        {(serviceType === 'airtime' || serviceType === 'data') && (
                            <>
                                <div>
                                    <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-3">Select Network</label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {['MTN', 'AIRTEL', 'GLO', '9MOBILE'].map(n => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setNetwork(n)}
                                                className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all h-24 ${network === n ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                                            >
                                                <span className="font-bold text-[10px] md:text-xs">{n}</span>
                                                {network === n && <CheckCircle className="w-4 h-4 mt-2 text-white" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                                        <input 
                                            type="tel" 
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white text-lg tracking-widest focus:border-blue-500 transition-colors"
                                            placeholder="08012345678"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* AIRTIME Specific */}
                        {serviceType === 'airtime' && (
                            <div>
                                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Amount (₦)</label>
                                <input 
                                    type="number" 
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-2xl font-bold focus:border-blue-500 transition-colors"
                                    placeholder="100"
                                />
                            </div>
                        )}

                        {/* DATA Specific */}
                        {serviceType === 'data' && (
                            <div>
                                <div className="flex bg-slate-800 rounded-xl p-1 mb-4">
                                    {['SME', 'DIRECT', 'GIFTING'].map((tab: any) => (
                                        <button
                                            key={tab}
                                            type="button"
                                            onClick={() => setDataTab(tab)}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${dataTab === tab ? 'bg-slate-700 text-white shadow' : 'text-slate-400'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Select Bundle</label>
                                <select 
                                    onChange={(e) => {
                                        const plan = dataPlans.find(p => p.id === e.target.value);
                                        setSelectedPlan(plan);
                                    }}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500 transition-colors"
                                >
                                    <option value="">-- Choose Data Plan --</option>
                                    {dataPlans.filter(p => p.provider === network).map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - ₦{p.price}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* ELECTRICITY Specific */}
                        {serviceType === 'electricity' && (
                            <>
                                <div>
                                    <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Disco Provider</label>
                                    <select 
                                        value={disco}
                                        onChange={e => setDisco(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500 transition-colors"
                                    >
                                        <option value="">-- Select --</option>
                                        {electricityProviders.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Meter Number</label>
                                        <input 
                                            type="text" 
                                            value={meterNum}
                                            onChange={e => setMeterNum(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={handleVerify}
                                        disabled={isValidating || !meterNum}
                                        className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-4 rounded-xl font-bold h-[58px] transition-colors"
                                    >
                                        {isValidating ? <Loader2 className="animate-spin" /> : 'Verify'}
                                    </button>
                                </div>
                                {verifiedName && (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 text-sm font-bold flex items-center">
                                        <CheckCircle className="w-5 h-5 mr-2" /> {verifiedName}
                                    </div>
                                )}
                                <div>
                                    <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Amount (₦)</label>
                                    <input 
                                        type="number" 
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-2xl font-bold focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </>
                        )}

                        {/* CABLE Specific */}
                        {serviceType === 'cable' && (
                            <>
                                <div>
                                    <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Cable Provider</label>
                                    <select 
                                        value={cableProvider}
                                        onChange={e => setCableProvider(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500 transition-colors"
                                    >
                                        <option value="">-- Select Provider --</option>
                                        <option value="GOTV">GOTV</option>
                                        <option value="DSTV">DSTV</option>
                                        <option value="STARTIMES">STARTIMES</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Package / Plan</label>
                                    <select 
                                        onChange={(e) => {
                                            const plan = cablePlans.find(p => p.id === e.target.value);
                                            setSelectedPlan(plan);
                                        }}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500 transition-colors"
                                    >
                                        <option value="">-- Select Package --</option>
                                        {cablePlans.filter(p => p.provider === cableProvider).map(p => (
                                            <option key={p.id} value={p.id}>{p.name} - ₦{p.price}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">IUC / SmartCard</label>
                                        <input 
                                            type="text" 
                                            value={iuc}
                                            onChange={e => setIuc(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={handleVerify}
                                        disabled={isValidating || !iuc}
                                        className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-4 rounded-xl font-bold h-[58px] transition-colors"
                                    >
                                        {isValidating ? <Loader2 className="animate-spin" /> : 'Verify'}
                                    </button>
                                </div>
                                {verifiedName && (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 text-sm font-bold flex items-center">
                                        <CheckCircle className="w-5 h-5 mr-2" /> {verifiedName}
                                    </div>
                                )}
                            </>
                        )}

                        <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-[0.98] mt-6">
                            Proceed to Payment
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
  );
};