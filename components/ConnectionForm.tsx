import React, { useState } from 'react';
import { ApiConfig, KeyValuePair } from '../types';
import { executeApiRequest } from '../services/api'; // Import for internal validation calls
import { Settings, CreditCard, Smartphone, Wifi, Tv, Zap, Check, GraduationCap, Search, Loader2, Globe } from 'lucide-react';

interface ConnectionFormProps {
  onSubmit: (config: ApiConfig) => void;
  isLoading: boolean;
}

type ServiceType = 'AIRTIME' | 'DATA' | 'CABLE' | 'ELECTRICITY' | 'EDUCATION';

// --- DATA CONSTANTS BASED ON DOCS ---

const NETWORKS = [
  { id: '1', name: 'MTN' },
  { id: '2', name: 'AIRTEL' },
  { id: '3', name: 'GLO' },
  { id: '4', name: '9MOBILE' },
  { id: '5', name: 'VITEL' }
];

const DATA_PLANS: Record<string, { id: string; name: string; price: string }[]> = {
  '1': [ // MTN
    { id: '97', name: '500MB (Share) - 7 Days', price: '390' },
    { id: '98', name: '1GB (Share) - 30 Days', price: '590' },
    { id: '99', name: '2GB (Share) - 30 Days', price: '1050' },
    { id: '100', name: '3GB (Share) - 30 Days', price: '1550' },
    { id: '101', name: '5GB (Share) - 30 Days', price: '1980' },
    { id: '202', name: '1GB + 3mins (Direct) - Daily', price: '488' },
    { id: '16', name: '1GB (CG) - 30 Days', price: '640' },
    { id: '17', name: '2GB (CG) - 30 Days', price: '1360' },
  ],
  '3': [ // GLO
    { id: '35', name: '500MB (CG) - 30 Days', price: '215' },
    { id: '36', name: '1GB (CG) - 30 Days', price: '430' },
    { id: '37', name: '2GB (CG) - 30 Days', price: '860' },
    { id: '113', name: '750MB (Awoof) - 1 Day', price: '210' },
    { id: '400', name: '1.0 GB (Direct) - 14 Days', price: '480' },
  ],
  '2': [ // AIRTEL
    { id: '104', name: '150MB (Awoof) - 1 Day', price: '68' },
    { id: '300', name: '2GB (Direct) - 30 Days', price: '1479' },
    { id: '301', name: '3GB (Direct) - 30 Days', price: '1972' },
    { id: '308', name: '1.5 GB (Social) - 7 Days', price: '496' },
    { id: '309', name: '500MB (Direct) - 7 Days', price: '493' },
  ],
  '4': [], // 9Mobile (None provided in prompt details)
  '5': [ // Vitel
    { id: '500', name: '75MB (Direct) - 1 Day', price: '75' },
    { id: '503', name: '500MB (Direct) - 1 Day', price: '350' },
  ]
};

const CABLE_PLANS = [
  // GOTV
  { id: '94', name: 'GOTV Smallie - ₦1900', provider: 'GOTV' },
  { id: '96', name: 'GOTV Jolli - ₦5800', provider: 'GOTV' },
  { id: '97', name: 'GOTV Jinja - ₦3900', provider: 'GOTV' },
  { id: '95', name: 'GOTV Max - ₦8500', provider: 'GOTV' },
  { id: '112', name: 'GOTV Supa - ₦11400', provider: 'GOTV' },
  // DSTV
  { id: '90', name: 'DSTV Padi - ₦4400', provider: 'DSTV' },
  { id: '91', name: 'DSTV Yanga - ₦6000', provider: 'DSTV' },
  { id: '92', name: 'DSTV Confam - ₦11000', provider: 'DSTV' },
  { id: '93', name: 'DSTV Compact - ₦19000', provider: 'DSTV' },
  // STARTIMES
  { id: '101', name: 'Startimes Basic - ₦4000', provider: 'STARTIMES' },
  { id: '102', name: 'Startimes Smart - ₦5100', provider: 'STARTIMES' },
  { id: '103', name: 'Startimes Classic - ₦7400', provider: 'STARTIMES' },
];

const ELECTRICITY_DISCOS = [
  { id: '1', name: 'Ikeja Electricity (IKEDC)' },
  { id: '2', name: 'Eko Electricity (EKEDC)' },
  { id: '3', name: 'Kano Electricity (KEDCO)' },
  { id: '4', name: 'Port Harcourt Electricity (PHED)' },
  { id: '5', name: 'Jos Electricity (JED)' },
  { id: '6', name: 'Ibadan Electricity (IBEDC)' },
  { id: '7', name: 'Kaduna Electricity (KAEDCO)' },
  { id: '8', name: 'Abuja Electricity (AEDC)' },
  { id: '9', name: 'Enugu Electricity (EEDC)' },
  { id: '10', name: 'Benin Electricity (BEDC)' },
  { id: '11', name: 'Yola Electricity (YEDC)' },
  { id: '12', name: 'Aba Power (APLEMD)' },
];

const EXAM_TYPES = [
  { id: '1', name: 'WAEC - ₦3380' },
  { id: '2', name: 'NECO - ₦1300' },
  { id: '3', name: 'NABTEB - ₦900' },
];

export const ConnectionForm: React.FC<ConnectionFormProps> = ({ onSubmit, isLoading }) => {
  const [service, setService] = useState<ServiceType>('AIRTIME');
  
  // API Config
  const [baseUrl, setBaseUrl] = useState('https://inlomax.com/api');
  const [apiKey, setApiKey] = useState('se2h4rl9cqhabg07tft55ivg4sp9b0a5jca1u3qe');
  const [useProxy, setUseProxy] = useState(true);
  const [showConfig, setShowConfig] = useState(false);

  // Form Fields
  const [networkId, setNetworkId] = useState('1'); // Default MTN
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [planId, setPlanId] = useState('');
  
  const [cablePlanId, setCablePlanId] = useState(CABLE_PLANS[0].id);
  const [iucNumber, setIucNumber] = useState('');
  const [validatedName, setValidatedName] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const [discoId, setDiscoId] = useState('1'); // Default IKEDC
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState('1'); // 1=Prepaid, 2=Postpaid

  const [examId, setExamId] = useState('1');
  const [quantity, setQuantity] = useState('1');

  // Reset validation when critical fields change
  React.useEffect(() => {
    setValidatedName(null);
  }, [iucNumber, meterNumber, meterType, discoId, service]);

  const getHeaders = (forService: ServiceType = service): KeyValuePair[] => {
    // DOCS SPECIFICITY:
    // Airtime/Data: "Authorization: Token KEY"
    // Cable/Electricity: "Authorization-Token: KEY" (based on samples in docs)
    
    const commonHeaders = [
      { key: 'Content-Type', value: 'application/json' },
    ];

    if (forService === 'CABLE' || forService === 'ELECTRICITY') {
      // Documentation says "Authorization-Token" for these
      return [
        ...commonHeaders,
        { key: 'Authorization-Token', value: apiKey } // Note: Sample shows plain key, check if "Token " prefix is needed. Docs say just KEY in sample? "Authorization-Token: YOUR_API_KEY". 
        // We will stick to exact key value without "Token " prefix for this header if the sample implies it.
        // BUT to be safe against inconsistent docs, let's look at the example: --header 'Authorization-Token: YOUR_API_KEY'
        // Unlike Airtime which says 'Authorization: Token YOUR_API_KEY'.
        // So we send just the key for Authorization-Token.
      ];
    } else {
      // Airtime, Data, Education etc
      return [
        ...commonHeaders,
        { key: 'Authorization', value: `Token ${apiKey}` }
      ];
    }
  };

  // Verification Handler
  const handleVerify = async () => {
    setIsValidating(true);
    setValidatedName(null);
    let url = '';
    let body = '';

    // Use current service header logic
    const verificationHeaders = getHeaders(service);

    if (service === 'CABLE') {
      url = `${baseUrl}/validatecable`;
      body = JSON.stringify({ serviceID: "1", iucNum: iucNumber }); 
    } else if (service === 'ELECTRICITY') {
      url = `${baseUrl}/validatemeter`;
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
        useProxy
      });
      
      if (res.success && res.data && res.data.status === 'success') {
        setValidatedName(res.data.data?.customerName || 'Verified Customer');
      } else {
        alert(`Validation Failed: ${res.data?.message || res.statusText || 'Unknown error'}`);
      }
    } catch (e) {
      alert('Validation error occurred');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let endpoint = '';
    let bodyObj: any = {};

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
        bodyObj = {
          serviceID: cablePlanId,
          iucNum: iucNumber
        };
        break;
      case 'ELECTRICITY':
        endpoint = '/payelectric';
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
    }

    onSubmit({
      url: `${baseUrl}${endpoint}`,
      method: 'POST',
      headers: getHeaders(service),
      body: JSON.stringify(bodyObj, null, 2),
      useProxy
    });
  };

  const isFormValid = () => {
    if (!apiKey) return false;
    if (service === 'AIRTIME') return phone && amount;
    if (service === 'DATA') return phone && planId;
    if (service === 'CABLE') return iucNumber && cablePlanId && validatedName; 
    if (service === 'ELECTRICITY') return meterNumber && amount && validatedName; 
    if (service === 'EDUCATION') return quantity;
    return false;
  };

  return (
    <div className="space-y-6">
      
      {/* API Configuration Section */}
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
        <button 
          type="button"
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center justify-between w-full text-left text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 hover:text-white"
        >
          <span className="flex items-center"><Settings className="w-3 h-3 mr-2" /> API Credentials & Settings</span>
          <span>{showConfig ? 'Hide' : 'Show'}</span>
        </button>
        
        {showConfig && (
          <div className="space-y-3 animate-fadeIn mt-2 pt-2 border-t border-slate-800">
             <div>
              <label className="block text-xs text-slate-500 mb-1">Authorization Token</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Base URL</label>
                <input
                  type="url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div className="flex items-end">
                 <label className="flex items-center space-x-2 cursor-pointer bg-slate-800 border border-slate-600 rounded px-3 py-2 w-full h-[38px]">
                    <input 
                      type="checkbox" 
                      checked={useProxy} 
                      onChange={(e) => setUseProxy(e.target.checked)} 
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-700 border-slate-500 focus:ring-offset-slate-800"
                    />
                    <div className="flex items-center text-sm text-slate-200">
                      <Globe className="w-3 h-3 mr-1.5 text-blue-400" />
                      <span>Use CORS Proxy</span>
                    </div>
                 </label>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic">
               Enable CORS Proxy if requests fail with network errors.
            </p>
          </div>
        )}
      </div>

      {/* Service Selection Tabs */}
      <div className="grid grid-cols-5 gap-1 sm:gap-2 bg-slate-900 p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'AIRTIME', icon: Smartphone, label: 'Airtime' },
          { id: 'DATA', icon: Wifi, label: 'Data' },
          { id: 'CABLE', icon: Tv, label: 'Cable' },
          { id: 'ELECTRICITY', icon: Zap, label: 'Power' },
          { id: 'EDUCATION', icon: GraduationCap, label: 'Exam' }
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setService(item.id as ServiceType)}
            className={`flex flex-col items-center justify-center py-2 sm:py-3 rounded-md transition-all duration-200 min-w-[60px] ${
              service === item.id 
                ? 'bg-slate-700 text-emerald-400 shadow-md ring-1 ring-slate-600' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
          >
            <item.icon className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Dynamic Form Fields */}
        <div className="p-1 min-h-[200px]">
          {service === 'AIRTIME' && (
             <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Network</label>
                  <select value={networkId} onChange={e => setNetworkId(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500">
                    {NETWORKS.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Amount (₦)</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="100" className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Phone Number</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678" className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500" />
                  </div>
                </div>
             </div>
          )}

          {service === 'DATA' && (
            <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Network</label>
                  <select 
                    value={networkId} 
                    onChange={e => { setNetworkId(e.target.value); setPlanId(''); }} 
                    className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500"
                  >
                    {NETWORKS.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Data Plan</label>
                  <select 
                    value={planId} 
                    onChange={e => setPlanId(e.target.value)} 
                    className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500"
                  >
                    <option value="">-- Select Plan --</option>
                    {DATA_PLANS[networkId]?.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - ₦{plan.price}
                      </option>
                    )) || <option disabled>No plans available for this network</option>}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Phone Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678" className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500" />
                </div>
             </div>
          )}

          {service === 'CABLE' && (
             <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                   <label className="text-xs text-slate-400">TV Bouquet / Plan</label>
                   <select value={cablePlanId} onChange={e => setCablePlanId(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500">
                      {CABLE_PLANS.map(p => (
                        <option key={p.id} value={p.id}>{p.provider} - {p.name}</option>
                      ))}
                   </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">IUC / SmartCard Number</label>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      value={iucNumber} 
                      onChange={e => setIucNumber(e.target.value)} 
                      placeholder="e.g. 7027914329" 
                      className="flex-1 bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500" 
                    />
                    <button
                      type="button"
                      onClick={handleVerify}
                      disabled={!iucNumber || isValidating}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded-md text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                      {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                    </button>
                  </div>
                  {validatedName && (
                    <div className="mt-2 text-xs text-emerald-400 flex items-center bg-emerald-900/20 p-2 rounded border border-emerald-900/50">
                      <Check className="w-3 h-3 mr-1.5" /> Customer: <strong>{validatedName}</strong>
                    </div>
                  )}
                </div>
             </div>
          )}

          {service === 'ELECTRICITY' && (
             <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Disco Provider</label>
                  <select value={discoId} onChange={e => setDiscoId(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500">
                    {ELECTRICITY_DISCOS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Meter Type</label>
                    <select value={meterType} onChange={e => setMeterType(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500">
                      <option value="1">Prepaid</option>
                      <option value="2">Postpaid</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Amount (₦)</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="1000" className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Meter Number</label>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      value={meterNumber} 
                      onChange={e => setMeterNumber(e.target.value)} 
                      placeholder="Meter No" 
                      className="flex-1 bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500" 
                    />
                    <button
                      type="button"
                      onClick={handleVerify}
                      disabled={!meterNumber || isValidating}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded-md text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                      {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                    </button>
                  </div>
                  {validatedName && (
                    <div className="mt-2 text-xs text-emerald-400 flex items-center bg-emerald-900/20 p-2 rounded border border-emerald-900/50">
                      <Check className="w-3 h-3 mr-1.5" /> Customer: <strong>{validatedName}</strong>
                    </div>
                  )}
                </div>
             </div>
          )}

          {service === 'EDUCATION' && (
             <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Exam Body</label>
                  <select value={examId} onChange={e => setExamId(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500">
                    {EXAM_TYPES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Quantity</label>
                  <input type="number" min="1" max="10" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500" />
                </div>
             </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !isFormValid()}
          className={`w-full flex items-center justify-center space-x-2 py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white uppercase tracking-wider transition-all duration-200 ${
            isLoading || !isFormValid()
              ? 'bg-slate-700 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5 text-white" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Purchase Now</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};