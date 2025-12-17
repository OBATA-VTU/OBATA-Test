import React, { useState, useEffect } from 'react';
import { ApiConfig, KeyValuePair } from '../types';
import { executeApiRequest } from '../services/api'; 
import { CreditCard, Check, Search, Loader2, Wallet, FileText, XCircle, ArrowRight, UserCheck, Phone, LayoutGrid, Banknote } from 'lucide-react';

interface ConnectionFormProps {
  onSubmit: (config: ApiConfig) => void;
  isLoading: boolean;
  initialService?: string;
  dataPlans?: any[];
  cablePlans?: any[];
  electricityProviders?: any[];
}

type ServiceType = 'AIRTIME' | 'DATA' | 'CABLE' | 'ELECTRICITY' | 'EDUCATION' | 'BALANCE' | 'TRANSACTION';

const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return import.meta.env?.[key] || '';
  } catch {
    return '';
  }
};

const BASE_URL = getEnv('VITE_INLOMAX_BASE_URL') || 'https://inlomax.com/api';
const API_KEY = getEnv('VITE_INLOMAX_API_KEY') || '';
// Check keys
if (!API_KEY) console.warn("Missing VITE_INLOMAX_API_KEY. API calls will fail.");

const NETWORKS = [
  { id: '1', name: 'MTN', color: 'bg-yellow-400' },
  { id: '2', name: 'AIRTEL', color: 'bg-red-500' },
  { id: '3', name: 'GLO', color: 'bg-green-500' },
  { id: '4', name: '9MOBILE', color: 'bg-green-700' },
];

export const ConnectionForm: React.FC<ConnectionFormProps> = ({ 
    onSubmit, 
    isLoading, 
    initialService,
    dataPlans = [],
    cablePlans = [],
    electricityProviders = []
}) => {
  const [service, setService] = useState<ServiceType>((initialService as ServiceType) || 'AIRTIME');
  
  useEffect(() => {
    if (initialService) setService(initialService as ServiceType);
  }, [initialService]);

  // Form Fields
  const [networkId, setNetworkId] = useState('1'); 
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [planId, setPlanId] = useState('');
  
  const [cablePlanId, setCablePlanId] = useState('');
  const [iucNumber, setIucNumber] = useState('');
  const [validatedName, setValidatedName] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const [discoId, setDiscoId] = useState('1'); 
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState('1'); 

  // New Fields for Query
  const [txnReference, setTxnReference] = useState('');

  useEffect(() => {
    setValidatedName(null);
    setValidationError(null);
  }, [iucNumber, meterNumber, meterType, discoId, service]);

  const filteredDataPlans = dataPlans.filter(p => {
      if(networkId === '1') return p.provider === 'MTN';
      if(networkId === '2') return p.provider === 'AIRTEL';
      if(networkId === '3') return p.provider === 'GLO';
      if(networkId === '4') return p.provider === '9MOBILE';
      return false;
  });

  const getHeaders = (endpointType: 'standard' | 'purchase_utility'): KeyValuePair[] => {
    const commonHeaders = [
      { key: 'Content-Type', value: 'application/json' },
    ];

    if (endpointType === 'purchase_utility') {
      return [
        ...commonHeaders,
        { key: 'Authorization-Token', value: API_KEY } 
      ];
    } else {
      return [
        ...commonHeaders,
        { key: 'Authorization', value: `Token ${API_KEY}` }
      ];
    }
  };

  const handleVerify = async () => {
    if (!API_KEY) return setValidationError("System Error: API Key Config Missing");
    
    setIsValidating(true);
    setValidatedName(null);
    setValidationError(null);
    let url = '';
    let body = '';

    const verificationHeaders = getHeaders('standard');

    if (service === 'CABLE') {
      url = `${BASE_URL}/validatecable`;
      body = JSON.stringify({ serviceID: cablePlanId, iucNum: iucNumber }); 
    } else if (service === 'ELECTRICITY') {
      url = `${BASE_URL}/validatemeter`;
      body = JSON.stringify({ 
        serviceID: discoId, 
        meterNum: meterNumber, 
        meterType: Number(meterType) 
      });
    }

    try {
      const res = await executeApiRequest({
        url,
        method: 'POST',
        headers: verificationHeaders,
        body,
        useProxy: true // Always force proxy/CORS handling if available
      });
      
      let responseData = res.data;
      if (typeof responseData === 'string') {
        try { responseData = JSON.parse(responseData); } catch (e) {}
      }

      if ((res.success || res.status === 200) && responseData && responseData.status === 'success') {
        setValidatedName(responseData.data?.customerName || 'Verified Customer');
      } else {
        const errorMsg = responseData?.message || res.statusText || 'Validation Failed';
        setValidationError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }
    } catch (e: any) {
      setValidationError(e.message || 'System Error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!API_KEY) {
        alert("Configuration Error: API Key missing");
        return;
    }

    let endpoint = '';
    let bodyObj: any = {};
    let method: 'POST' | 'GET' = 'POST';
    let headerType: 'standard' | 'purchase_utility' = 'standard';

    switch (service) {
      case 'AIRTIME':
        endpoint = '/airtime';
        bodyObj = {
          serviceID: networkId,
          amount: Number(amount),
          mobileNumber: phone
        };
        break;
      case 'DATA':
        endpoint = '/data';
        bodyObj = {
          serviceID: planId,
          mobileNumber: phone
        };
        break;
      case 'CABLE':
        endpoint = '/subcable';
        headerType = 'purchase_utility';
        bodyObj = {
          serviceID: cablePlanId,
          iucNum: iucNumber
        };
        break;
      case 'ELECTRICITY':
        endpoint = '/payelectric';
        headerType = 'purchase_utility';
        bodyObj = {
          serviceID: discoId,
          meterNum: meterNumber,
          meterType: Number(meterType),
          amount: Number(amount)
        };
        break;
      case 'BALANCE':
        endpoint = '/balance';
        method = 'GET';
        bodyObj = undefined;
        break;
      case 'TRANSACTION':
        endpoint = '/transaction';
        bodyObj = { reference: txnReference };
        break;
    }

    onSubmit({
      url: `${BASE_URL}${endpoint}`,
      method: method,
      headers: getHeaders(headerType),
      body: bodyObj ? JSON.stringify(bodyObj, null, 2) : undefined,
      useProxy: true
    });
  };

  const isFormValid = () => {
    if (service === 'AIRTIME') return phone.length >= 10 && amount;
    if (service === 'DATA') return phone.length >= 10 && planId;
    if (service === 'CABLE') return iucNumber.length >= 10 && cablePlanId && validatedName; 
    if (service === 'ELECTRICITY') return meterNumber.length >= 10 && amount && validatedName; 
    if (service === 'TRANSACTION') return txnReference;
    if (service === 'BALANCE') return true;
    return false;
  };

  const NetworkSelector = ({ selected, onSelect }: { selected: string, onSelect: (id: string) => void }) => (
      <div className="grid grid-cols-4 gap-3 mb-6">
          {NETWORKS.map(n => (
              <button 
                key={n.id}
                type="button"
                onClick={() => onSelect(n.id)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${selected === n.id ? 'bg-slate-800 border-blue-500 shadow-lg shadow-blue-900/20' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}
              >
                  <div className={`w-8 h-8 rounded-full ${n.color} mb-2`}></div>
                  <span className={`text-[10px] font-bold ${selected === n.id ? 'text-white' : 'text-slate-500'}`}>{n.name}</span>
                  {selected === n.id && <div className="absolute top-1 right-1"><Check className="w-3 h-3 text-blue-500" /></div>}
              </button>
          ))}
      </div>
  );

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="min-h-[200px]">
          {service === 'AIRTIME' && (
             <div className="animate-fade-in-up">
                <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Choose Network</label>
                <NetworkSelector selected={networkId} onSelect={setNetworkId} />
                
                <div className="space-y-5">
                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-1.5 flex items-center"><Phone className="w-4 h-4 mr-2" /> Phone Number</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500 text-lg tracking-wide" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-1.5 flex items-center"><Banknote className="w-4 h-4 mr-2" /> Amount (₦)</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="100" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500 text-lg font-bold" />
                    </div>
                </div>
             </div>
          )}

          {service === 'DATA' && (
            <div className="animate-fade-in-up">
                 <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Choose Network</label>
                <NetworkSelector selected={networkId} onSelect={(id) => { setNetworkId(id); setPlanId(''); }} />

                <div className="space-y-5">
                     <div>
                        <label className="text-sm font-medium text-slate-300 mb-1.5 flex items-center"><LayoutGrid className="w-4 h-4 mr-2" /> Data Plan</label>
                        <select 
                            value={planId} 
                            onChange={e => setPlanId(e.target.value)} 
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500 appearance-none"
                        >
                            <option value="">-- Select Data Bundle --</option>
                            {filteredDataPlans.map(plan => (
                            <option key={plan.id} value={plan.apiId}>
                                {plan.name} - ₦{plan.price} ({plan.validity})
                            </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-1.5 flex items-center"><Phone className="w-4 h-4 mr-2" /> Phone Number</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500 text-lg tracking-wide" />
                    </div>
                </div>
             </div>
          )}

          {service === 'CABLE' && (
             <div className="space-y-5 animate-fade-in-up">
                <div>
                   <label className="text-sm font-medium text-slate-300 mb-1.5 block">Select Package</label>
                   <select value={cablePlanId} onChange={e => setCablePlanId(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500">
                      <option value="">-- Select --</option>
                      {cablePlans.map(p => (
                        <option key={p.id} value={p.apiId}>{p.provider} - {p.name} (₦{p.price})</option>
                      ))}
                   </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1.5 block">SmartCard / IUC Number</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={iucNumber} 
                      onChange={e => setIucNumber(e.target.value)} 
                      placeholder="e.g. 7027914329" 
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500" 
                    />
                    <button
                      type="button"
                      onClick={handleVerify}
                      disabled={!iucNumber || isValidating}
                      className="bg-slate-800 hover:bg-slate-700 text-white px-6 rounded-xl font-bold disabled:opacity-50 transition-colors"
                    >
                      {isValidating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                    </button>
                  </div>
                  {validatedName && (
                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex items-center text-blue-400 text-sm mt-3 animate-fade-in">
                      <UserCheck className="w-4 h-4 mr-2" /> 
                      <span>Account: <span className="font-bold text-white">{validatedName}</span></span>
                    </div>
                  )}
                  {validationError && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center text-red-400 text-sm mt-3 animate-fade-in">
                      <XCircle className="w-4 h-4 mr-2" /> 
                      <span>{validationError}</span>
                    </div>
                  )}
                </div>
             </div>
          )}

          {service === 'ELECTRICITY' && (
             <div className="space-y-5 animate-fade-in-up">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1.5 block">Disco Provider</label>
                  <select value={discoId} onChange={e => setDiscoId(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500">
                    {electricityProviders.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-1.5 block">Meter Type</label>
                    <select value={meterType} onChange={e => setMeterType(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500">
                      <option value="1">Prepaid</option>
                      <option value="2">Postpaid</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-1.5 block">Amount (₦)</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="1000" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500 font-bold" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1.5 block">Meter Number</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={meterNumber} 
                      onChange={e => setMeterNumber(e.target.value)} 
                      placeholder="Meter No" 
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500" 
                    />
                    <button
                      type="button"
                      onClick={handleVerify}
                      disabled={!meterNumber || isValidating}
                      className="bg-slate-800 hover:bg-slate-700 text-white px-6 rounded-xl font-bold disabled:opacity-50 transition-colors"
                    >
                      {isValidating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                    </button>
                  </div>
                  {validatedName && (
                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex items-center text-blue-400 text-sm mt-3 animate-fade-in">
                      <UserCheck className="w-4 h-4 mr-2" /> 
                      <span>Account: <span className="font-bold text-white">{validatedName}</span></span>
                    </div>
                  )}
                   {validationError && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center text-red-400 text-sm mt-3 animate-fade-in">
                      <XCircle className="w-4 h-4 mr-2" /> 
                      <span>{validationError}</span>
                    </div>
                  )}
                </div>
             </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !isFormValid()}
          className={`w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl shadow-lg text-lg font-bold text-white transition-all duration-200 ${
            isLoading || !isFormValid()
              ? 'bg-slate-800 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/30 active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-6 w-6 text-white" />
              Processing...
            </>
          ) : (
            <>
              {service === 'BALANCE' ? <Wallet className="w-6 h-6" /> : 
               service === 'TRANSACTION' ? <Search className="w-6 h-6" /> :
               <CreditCard className="w-6 h-6" />}
              <span>
                {service === 'BALANCE' ? 'Check Balance' :
                 service === 'TRANSACTION' ? 'Verify Status' :
                 'Purchase Now'}
              </span>
              <ArrowRight className="w-6 h-6 ml-2" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};