import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Smartphone, Wifi, Tv, Zap, Loader2, CheckCircle, Search } from 'lucide-react';
import { useServices } from '../contexts/ServiceContext';
import { useAuth } from '../contexts/AuthContext';
import { buyAirtime, buyData, validateMeter, validateCable } from '../services/api';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { TransactionPinModal } from '../components/TransactionPinModal';
import { ReceiptModal } from '../components/ReceiptModal';

export const ServicesPage: React.FC = () => {
  const { serviceType } = useParams<{ serviceType: string }>();
  const navigate = useNavigate();
  const { dataPlans, cablePlans, electricityProviders, getNetworkId } = useServices();
  const { userProfile } = useAuth();

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

  if (!serviceType) {
      // Redirect to airtime by default or show menu
      useEffect(() => { navigate('/services/airtime'); }, []);
      return null;
  }

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
          } else {
              // Mock success for cable/power for now as structure is similar
              res = { success: true, data: { message: "Transaction Successful", amount: amount || selectedPlan?.price, reference: requestId } };
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
      return [];
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
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

        {/* Navigation Tabs */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto">
            {['airtime', 'data', 'cable', 'electricity'].map(t => (
                <button 
                    key={t}
                    onClick={() => navigate(`/services/${t}`)}
                    className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm capitalize whitespace-nowrap ${serviceType === t ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                    {t}
                </button>
            ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 capitalize">{serviceType} Purchase</h2>
            
            <form onSubmit={handleBuyClick} className="space-y-6">
                
                {/* AIRTIME & DATA Common Fields */}
                {(serviceType === 'airtime' || serviceType === 'data') && (
                    <>
                        <div className="grid grid-cols-4 gap-3 mb-4">
                            {['MTN', 'AIRTEL', 'GLO', '9MOBILE'].map(n => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => setNetwork(n)}
                                    className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${network === n ? 'bg-blue-600/10 border-blue-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                >
                                    <span className="font-bold text-xs">{n}</span>
                                    {network === n && <CheckCircle className="w-3 h-3 mt-1 text-blue-500" />}
                                </button>
                            ))}
                        </div>

                        <div>
                            <label className="text-slate-400 text-sm font-bold block mb-2">Phone Number</label>
                            <input 
                                type="tel" 
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-lg tracking-widest"
                                placeholder="08012345678"
                            />
                        </div>
                    </>
                )}

                {/* AIRTIME Specific */}
                {serviceType === 'airtime' && (
                    <div>
                        <label className="text-slate-400 text-sm font-bold block mb-2">Amount (₦)</label>
                        <input 
                            type="number" 
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-lg font-bold"
                            placeholder="100"
                        />
                    </div>
                )}

                {/* DATA Specific */}
                {serviceType === 'data' && (
                    <div>
                        <div className="flex bg-slate-800 rounded-lg p-1 mb-4">
                            {['SME', 'DIRECT', 'GIFTING'].map((tab: any) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setDataTab(tab)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-md ${dataTab === tab ? 'bg-slate-700 text-white shadow' : 'text-slate-400'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <label className="text-slate-400 text-sm font-bold block mb-2">Select Plan</label>
                        <select 
                            onChange={(e) => {
                                const plan = dataPlans.find(p => p.id === e.target.value);
                                setSelectedPlan(plan);
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white"
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
                            <label className="text-slate-400 text-sm font-bold block mb-2">Disco Provider</label>
                            <select 
                                value={disco}
                                onChange={e => setDisco(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white"
                            >
                                <option value="">-- Select --</option>
                                {electricityProviders.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <label className="text-slate-400 text-sm font-bold block mb-2">Meter Number</label>
                                <input 
                                    type="text" 
                                    value={meterNum}
                                    onChange={e => setMeterNum(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white"
                                />
                            </div>
                            <button 
                                type="button"
                                onClick={handleVerify}
                                disabled={isValidating || !meterNum}
                                className="bg-slate-800 text-white px-6 py-4 rounded-xl font-bold h-[58px]"
                            >
                                {isValidating ? <Loader2 className="animate-spin" /> : 'Verify'}
                            </button>
                        </div>
                        {verifiedName && (
                            <div className="bg-green-900/20 border border-green-500/30 p-3 rounded-lg text-green-400 text-sm font-bold">
                                {verifiedName}
                            </div>
                        )}
                        <div>
                            <label className="text-slate-400 text-sm font-bold block mb-2">Amount (₦)</label>
                            <input 
                                type="number" 
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-lg font-bold"
                            />
                        </div>
                    </>
                )}

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg mt-4">
                    Buy Now
                </button>
            </form>
        </div>
    </div>
  );
};