import React, { useState, useEffect } from 'react';
import { ApiConfig, KeyValuePair } from '../types';
import { executeApiRequest } from '../services/api'; 
import { CreditCard, Check, Search, Loader2, Wallet, FileText, XCircle, ArrowRight, UserCheck, Phone, LayoutGrid, Banknote } from 'lucide-react';

interface ConnectionFormProps {
  onSubmit: (config: ApiConfig) => void;
  isLoading: boolean;
  initialService?: string;
}

type ServiceType = 'AIRTIME' | 'DATA' | 'CABLE' | 'ELECTRICITY' | 'EDUCATION' | 'BALANCE' | 'TRANSACTION';

// Helper to safely get environment variables
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return import.meta.env?.[key] || '';
  } catch {
    return '';
  }
};

// Configuration from Env Vars
const BASE_URL = getEnv('VITE_INLOMAX_BASE_URL') || 'https://inlomax.com/api';
const API_KEY = getEnv('VITE_INLOMAX_API_KEY') || '';
const USE_PROXY = true;

const NETWORKS = [
  { id: '1', name: 'MTN', color: 'bg-yellow-400' },
  { id: '2', name: 'AIRTEL', color: 'bg-red-500' },
  { id: '3', name: 'GLO', color: 'bg-green-500' },
  { id: '4', name: '9MOBILE', color: 'bg-green-700' },
];

const DATA_PLANS: Record<string, { id: string; name: string; price: string; validity?: string }[]> = {
  '1': [
    { id: '202', name: '1GB + 3 mins', price: '488', validity: 'Daily' },
    { id: '203', name: '2.5GB', price: '738', validity: 'Daily' },
    { id: '98', name: '1GB (SME)', price: '590', validity: '30 Days' },
    { id: '16', name: '1GB (CG)', price: '640', validity: '30 Days' },
    { id: '17', name: '2GB (CG)', price: '1360', validity: '30 Days' },
    { id: '18', name: '3GB (CG)', price: '1650', validity: '30 Days' },
    { id: '19', name: '5GB (CG)', price: '2350', validity: '30 Days' },
  ],
  '3': [
    { id: '36', name: '1GB (CG)', price: '430', validity: '30 Days' },
    { id: '37', name: '2GB (CG)', price: '860', validity: '30 Days' },
    { id: '38', name: '3GB (CG)', price: '1290', validity: '30 Days' },
  ],
  '2': [
     { id: '331', name: '1GB', price: '789', validity: '7 Days' },
     { id: '300', name: '2GB', price: '1479', validity: '30 Days' },
  ],
  '4': [],
  '5': []
};

const CABLE_PLANS = [
  { id: '101', name: 'Startimes Basic - ₦4000', provider: 'STARTIMES' },
  { id: '102', name: 'Startimes Smart - ₦5100', provider: 'STARTIMES' },
  { id: '90', name: 'DSTV Padi - ₦4400', provider: 'DSTV' },
  { id: '91', name: 'DSTV Yanga - ₦6000', provider: 'DSTV' },
  { id: '94', name: 'GOTV Smallie - ₦1900', provider: 'GOTV' },
  { id: '97', name: 'GOTV Jinja - ₦3900', provider: 'GOTV' },
];

const ELECTRICITY_DISCOS = [
  { id: '1', name: 'Ikeja Electricity (IKEDC)' },
  { id: '2', name: 'Eko Electricity (EKEDC)' },
  { id: '3', name: 'Kano Electricity (KEDCO)' },
  { id: '4', name: 'Port Harcourt Electricity (PHED)' },
  { id: '8', name: 'Abuja Electricity (AEDC)' },
  { id: '6', name: 'Ibadan Electricity (IBEDC)' },
];

const EXAM_TYPES = [
  { id: '1', name: 'WAEC - ₦3380' },
  { id: '2', name: 'NECO - ₦1300' },
  { id: '3', name: 'NABTEB - ₦900' },
];

export const ConnectionForm: React.FC<ConnectionFormProps> = ({ onSubmit, isLoading, initialService }) => {
  const [service, setService] = useState<ServiceType>((initialService as ServiceType) || 'AIRTIME');
  
  useEffect(() => {
    if (initialService) setService(initialService as ServiceType);
  }, [initialService]);

  // Form Fields
  const [networkId, setNetworkId] = useState('1'); 
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [planId, setPlanId] = useState('');
  
  const [cablePlanId, setCablePlanId] = useState(CABLE_PLANS[0].id);
  const [iucNumber, setIucNumber] = useState('');
  const [validatedName, setValidatedName] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const [discoId, setDiscoId] = useState('1'); 
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState('1'); 

  const [examId, setExamId] = useState('1');
  const [quantity, setQuantity] = useState('1');

  // New Fields for Query
  const [txnReference, setTxnReference] = useState('');

  useEffect(() => {
    setValidatedName(null);
    setValidationError(null);
  }, [iucNumber, meterNumber, meterType, discoId, service]);

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
        useProxy: USE_PROXY
      });
      
      let responseData = res.data;

      if (typeof responseData === 'string') {
        try {
           responseData = JSON.parse(responseData);
        } catch (e) {
           const firstOpen = responseData.indexOf('{');
           const lastClose = responseData.lastIndexOf('}');
           if (firstOpen !== -1 && lastClose !== -1) {
             try {
                responseData = JSON.parse(responseData.substring(firstOpen, lastClose + 1));
             } catch (e2) {}
           }
        }
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
      case 'EDUCATION':
        endpoint = '/education';
        bodyObj = {
          serviceID: examId,
          quantity: Number(quantity)
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
      useProxy: USE_PROXY
    });
  };

  const isFormValid = () => {
    if (service === 'AIRTIME') return phone.length >= 10 && amount;
    if (service === 'DATA') return phone.length >= 10 && planId;
    if (service === 'CABLE') return iucNumber.length >= 10 && cablePlanId && validatedName; 
    if (service === 'ELECTRICITY') return meterNumber.length >= 10 && amount && validatedName; 
    if (service === 'EDUCATION') return quantity;
    if (service === 'TRANSACTION') return txnReference;
    if (service === 'BALANCE') return true;
    return false;
  };

  if (!API_KEY) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-2xl text-center">
        <h3 className="text-red-500 font-bold mb-2">Configuration Warning</h3>
        <p className="text-slate-400 text-sm">VITE_INLOMAX_API_KEY environment variable is not set. API calls will fail.</p>
      </div>
    );
  }

  // Network Selection Component
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
                            {DATA_PLANS[networkId]?.map(plan => (
                            <option key={plan.id} value={plan.id}>
                                {plan.name} - ₦{plan.price} ({plan.validity})
                            </option>
                            )) || <option disabled>No plans available</option>}
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
                      {CABLE_PLANS.map(p => (
                        <option key={p.id} value={p.id}>{p.provider} - {p.name}</option>
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
                    {ELECTRICITY_DISCOS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
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

          {service === 'EDUCATION' && (
             <div className="space-y-5 animate-fade-in-up">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1.5 block">Exam Body</label>
                  <select value={examId} onChange={e => setExamId(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500">
                    {EXAM_TYPES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1.5 block">Quantity</label>
                  <input type="number" min="1" max="10" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500" />
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