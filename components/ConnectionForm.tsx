/// <reference types="vite/client" />
import React, { useState } from 'react';
import { ApiConfig, KeyValuePair } from '../types';
import { executeApiRequest } from '../services/api'; 
import { CreditCard, Smartphone, Wifi, Tv, Zap, Check, GraduationCap, Search, Loader2, Wallet, FileText, XCircle } from 'lucide-react';

interface ConnectionFormProps {
  onSubmit: (config: ApiConfig) => void;
  isLoading: boolean;
}

type ServiceType = 'AIRTIME' | 'DATA' | 'CABLE' | 'ELECTRICITY' | 'EDUCATION' | 'BALANCE' | 'TRANSACTION';

// Configuration from Env Vars
const BASE_URL = import.meta.env.VITE_INLOMAX_BASE_URL || 'https://inlomax.com/api';
const API_KEY = import.meta.env.VITE_INLOMAX_API_KEY || ''; // Fallback empty string if not set
const USE_PROXY = true;

const NETWORKS = [
  { id: '1', name: 'MTN' },
  { id: '2', name: 'AIRTEL' },
  { id: '3', name: 'GLO' },
  { id: '4', name: '9MOBILE' },
  { id: '5', name: 'VITEL' }
];

const DATA_PLANS: Record<string, { id: string; name: string; price: string; validity?: string }[]> = {
  '1': [ // MTN
    { id: '202', name: '1GB + 3 mins', price: '488', validity: 'Daily' },
    { id: '203', name: '2.5GB', price: '738', validity: 'Daily' },
    { id: '210', name: '1GB+5mins', price: '788', validity: 'Weekly' },
    { id: '98', name: '1GB (SME)', price: '590', validity: '30 Days' },
    { id: '16', name: '1GB (CG)', price: '640', validity: '30 Days' },
    { id: '17', name: '2GB (CG)', price: '1360', validity: '30 Days' },
    { id: '18', name: '3GB (CG)', price: '1650', validity: '30 Days' },
    { id: '19', name: '5GB (CG)', price: '2350', validity: '30 Days' },
  ],
  '3': [ // GLO
    { id: '36', name: '1GB (CG)', price: '430', validity: '30 Days' },
    { id: '37', name: '2GB (CG)', price: '860', validity: '30 Days' },
    { id: '38', name: '3GB (CG)', price: '1290', validity: '30 Days' },
    { id: '39', name: '5GB (CG)', price: '2150', validity: '30 Days' },
  ],
  '2': [ // AIRTEL
     { id: '331', name: '1GB', price: '789', validity: '7 Days' },
     { id: '300', name: '2GB', price: '1479', validity: '30 Days' },
     { id: '301', name: '3GB', price: '1972', validity: '30 Days' },
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

export const ConnectionForm: React.FC<ConnectionFormProps> = ({ onSubmit, isLoading }) => {
  const [service, setService] = useState<ServiceType>('AIRTIME');
  
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

  React.useEffect(() => {
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
    if (service === 'AIRTIME') return phone && amount;
    if (service === 'DATA') return phone && planId;
    if (service === 'CABLE') return iucNumber && cablePlanId && validatedName; 
    if (service === 'ELECTRICITY') return meterNumber && amount && validatedName; 
    if (service === 'EDUCATION') return quantity;
    if (service === 'TRANSACTION') return txnReference;
    if (service === 'BALANCE') return true;
    return false;
  };

  if (!API_KEY) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-2xl text-center">
        <h3 className="text-red-500 font-bold mb-2">Configuration Error</h3>
        <p className="text-slate-400 text-sm">API Keys not found. Please set VITE_INLOMAX_API_KEY in your Vercel Environment Variables.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Service Selection Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-700">
        {[
          { id: 'BALANCE', icon: Wallet, label: 'Wallet' },
          { id: 'AIRTIME', icon: Smartphone, label: 'Airtime' },
          { id: 'DATA', icon: Wifi, label: 'Data' },
          { id: 'CABLE', icon: Tv, label: 'TV' },
          { id: 'ELECTRICITY', icon: Zap, label: 'Power' },
          { id: 'EDUCATION', icon: GraduationCap, label: 'Exam' },
          { id: 'TRANSACTION', icon: FileText, label: 'History' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setService(item.id as ServiceType)}
            className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 flex-grow lg:flex-grow-0 ${
              service === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
        {/* Dynamic Form Fields (Same as before) */}
        <div className="min-h-[200px]">
          {service === 'BALANCE' && (
            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
               <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                  <Wallet className="w-8 h-8 text-blue-400" />
               </div>
               <h3 className="text-lg font-medium text-white mb-2">Check Wallet Balance</h3>
               <p className="text-sm max-w-xs">View your current available balance for transactions.</p>
            </div>
          )}

          {service === 'AIRTIME' && (
             <div className="space-y-5 animate-fade-in-up">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Select Network</label>
                  <select value={networkId} onChange={e => setNetworkId(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                    {NETWORKS.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Amount (₦)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-3.5 text-slate-500">₦</span>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="100" className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Phone Number</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>
             </div>
          )}

          {service === 'DATA' && (
            <div className="space-y-5 animate-fade-in-up">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Select Network</label>
                  <select 
                    value={networkId} 
                    onChange={e => { setNetworkId(e.target.value); setPlanId(''); }} 
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500"
                  >
                    {NETWORKS.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Data Plan</label>
                  <select 
                    value={planId} 
                    onChange={e => setPlanId(e.target.value)} 
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500"
                  >
                    <option value="">-- Select Data Plan --</option>
                    {DATA_PLANS[networkId]?.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - ₦{plan.price} ({plan.validity})
                      </option>
                    )) || <option disabled>No plans available</option>}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Phone Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500" />
                </div>
             </div>
          )}

          {service === 'CABLE' && (
             <div className="space-y-5 animate-fade-in-up">
                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-300">Select Package</label>
                   <select value={cablePlanId} onChange={e => setCablePlanId(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500">
                      {CABLE_PLANS.map(p => (
                        <option key={p.id} value={p.id}>{p.provider} - {p.name}</option>
                      ))}
                   </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">SmartCard / IUC Number</label>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      value={iucNumber} 
                      onChange={e => setIucNumber(e.target.value)} 
                      placeholder="e.g. 7027914329" 
                      className="flex-1 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500" 
                    />
                    <button
                      type="button"
                      onClick={handleVerify}
                      disabled={!iucNumber || isValidating}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-6 rounded-lg font-bold disabled:opacity-50"
                    >
                      {isValidating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                    </button>
                  </div>
                  {validatedName && (
                    <div className="bg-blue-900/30 border border-blue-500/30 p-3 rounded-lg flex items-center text-blue-400 text-sm">
                      <Check className="w-4 h-4 mr-2" /> 
                      <span>Account: <span className="font-bold text-white">{validatedName}</span></span>
                    </div>
                  )}
                  {validationError && (
                    <div className="bg-red-900/30 border border-red-500/30 p-3 rounded-lg flex items-center text-red-400 text-sm">
                      <XCircle className="w-4 h-4 mr-2" /> 
                      <span>{validationError}</span>
                    </div>
                  )}
                </div>
             </div>
          )}

          {service === 'ELECTRICITY' && (
             <div className="space-y-5 animate-fade-in-up">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Disco Provider</label>
                  <select value={discoId} onChange={e => setDiscoId(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500">
                    {ELECTRICITY_DISCOS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Meter Type</label>
                    <select value={meterType} onChange={e => setMeterType(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500">
                      <option value="1">Prepaid</option>
                      <option value="2">Postpaid</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Amount (₦)</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="1000" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Meter Number</label>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      value={meterNumber} 
                      onChange={e => setMeterNumber(e.target.value)} 
                      placeholder="Meter No" 
                      className="flex-1 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500" 
                    />
                    <button
                      type="button"
                      onClick={handleVerify}
                      disabled={!meterNumber || isValidating}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-6 rounded-lg font-bold disabled:opacity-50"
                    >
                      {isValidating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                    </button>
                  </div>
                  {validatedName && (
                    <div className="bg-blue-900/30 border border-blue-500/30 p-3 rounded-lg flex items-center text-blue-400 text-sm">
                      <Check className="w-4 h-4 mr-2" /> 
                      <span>Account: <span className="font-bold text-white">{validatedName}</span></span>
                    </div>
                  )}
                   {validationError && (
                    <div className="bg-red-900/30 border border-red-500/30 p-3 rounded-lg flex items-center text-red-400 text-sm">
                      <XCircle className="w-4 h-4 mr-2" /> 
                      <span>{validationError}</span>
                    </div>
                  )}
                </div>
             </div>
          )}

          {service === 'EDUCATION' && (
             <div className="space-y-5 animate-fade-in-up">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Exam Body</label>
                  <select value={examId} onChange={e => setExamId(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500">
                    {EXAM_TYPES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Quantity</label>
                  <input type="number" min="1" max="10" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500" />
                </div>
             </div>
          )}

          {service === 'TRANSACTION' && (
             <div className="space-y-5 animate-fade-in-up">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Transaction Reference ID</label>
                  <input type="text" value={txnReference} onChange={e => setTxnReference(e.target.value)} placeholder="Enter transaction ID..." className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 font-mono" />
                </div>
             </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !isFormValid()}
          className={`w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl shadow-lg text-base font-bold text-white transition-all duration-200 ${
            isLoading || !isFormValid()
              ? 'bg-slate-700 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 hover:shadow-blue-500/30 active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5 text-white" />
              Processing Request...
            </>
          ) : (
            <>
              {service === 'BALANCE' ? <Wallet className="w-5 h-5" /> : 
               service === 'TRANSACTION' ? <Search className="w-5 h-5" /> :
               <CreditCard className="w-5 h-5" />}
              <span>
                {service === 'BALANCE' ? 'Check Balance' :
                 service === 'TRANSACTION' ? 'Verify Status' :
                 'Confirm Purchase'}
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};