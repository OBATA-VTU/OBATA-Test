import React, { useState, useEffect } from 'react';
import { ApiConfig, HttpMethod, KeyValuePair } from '../types';
import { Play, Settings, CreditCard, Smartphone, Wifi, Tv, Zap, Check } from 'lucide-react';

interface ConnectionFormProps {
  onSubmit: (config: ApiConfig) => void;
  isLoading: boolean;
}

type ServiceType = 'AIRTIME' | 'DATA' | 'CABLE' | 'ELECTRICITY';

export const ConnectionForm: React.FC<ConnectionFormProps> = ({ onSubmit, isLoading }) => {
  const [service, setService] = useState<ServiceType>('AIRTIME');
  
  // API Config
  const [baseUrl, setBaseUrl] = useState('https://api.inlomax.com/api/v1');
  const [apiKey, setApiKey] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  // Form Fields
  const [network, setNetwork] = useState('MTN');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [planId, setPlanId] = useState('');
  const [cableProvider, setCableProvider] = useState('DSTV');
  const [iucNumber, setIucNumber] = useState('');
  const [disco, setDisco] = useState('AEDC');
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState('PREPAID');

  // Helper to get endpoint based on service
  const getEndpoint = () => {
    switch (service) {
      case 'AIRTIME': return '/buy-airtime';
      case 'DATA': return '/buy-data';
      case 'CABLE': return '/buy-cable';
      case 'ELECTRICITY': return '/pay-electricity';
      default: return '/';
    }
  };

  // Helper to construct body based on service
  const getBody = () => {
    switch (service) {
      case 'AIRTIME':
        return JSON.stringify({
          network: network,
          phone: phone,
          amount: Number(amount),
          ported_number: true,
          airtime_type: "VTU"
        }, null, 2);
      case 'DATA':
        return JSON.stringify({
          network: network,
          phone: phone,
          data_plan: planId,
          ported_number: true
        }, null, 2);
      case 'CABLE':
        return JSON.stringify({
          cablename: cableProvider, // cable_name
          smart_card_number: iucNumber,
          cableplan: planId // cable_plan
        }, null, 2);
      case 'ELECTRICITY':
        return JSON.stringify({
          disco_name: disco,
          amount: Number(amount),
          meter_number: meterNumber,
          MeterType: meterType
        }, null, 2);
      default:
        return '{}';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const headers: KeyValuePair[] = [
      { key: 'Authorization', value: `Token ${apiKey}` },
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Accept', value: 'application/json' }
    ];

    const fullUrl = `${baseUrl.replace(/\/$/, '')}${getEndpoint()}`;

    onSubmit({
      url: fullUrl,
      method: 'POST',
      headers,
      body: getBody(),
    });
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
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Inlomax API Token"
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Base URL</label>
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>
        )}
        {!showConfig && !apiKey && (
           <div className="text-amber-500 text-xs mt-1 flex items-center">
              ⚠️ Please set your API Token to transact.
           </div>
        )}
      </div>

      {/* Service Selection Tabs */}
      <div className="grid grid-cols-4 gap-2 bg-slate-900 p-1 rounded-lg">
        {[
          { id: 'AIRTIME', icon: Smartphone, label: 'Airtime' },
          { id: 'DATA', icon: Wifi, label: 'Data' },
          { id: 'CABLE', icon: Tv, label: 'Cable' },
          { id: 'ELECTRICITY', icon: Zap, label: 'Power' }
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setService(item.id as ServiceType)}
            className={`flex flex-col items-center justify-center py-3 rounded-md transition-all duration-200 ${
              service === item.id 
                ? 'bg-slate-700 text-emerald-400 shadow-md ring-1 ring-slate-600' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Dynamic Form Fields */}
        <div className="p-1">
          {service === 'AIRTIME' && (
             <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Network</label>
                    <select value={network} onChange={e => setNetwork(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500">
                      <option value="MTN">MTN</option>
                      <option value="GLO">GLO</option>
                      <option value="AIRTEL">AIRTEL</option>
                      <option value="9MOBILE">9MOBILE</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Amount (₦)</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="100" className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Phone Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678" className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500" />
                </div>
             </div>
          )}

          {service === 'DATA' && (
            <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Network</label>
                    <select value={network} onChange={e => setNetwork(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500">
                      <option value="MTN">MTN</option>
                      <option value="GLO">GLO</option>
                      <option value="AIRTEL">AIRTEL</option>
                      <option value="9MOBILE">9MOBILE</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Plan ID</label>
                    <input type="text" value={planId} onChange={e => setPlanId(e.target.value)} placeholder="e.g. 1000" className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Phone Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678" className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500" />
                </div>
             </div>
          )}

          {service === 'CABLE' && (
             <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Provider</label>
                    <select value={cableProvider} onChange={e => setCableProvider(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500">
                      <option value="DSTV">DSTV</option>
                      <option value="GOTV">GOTV</option>
                      <option value="STARTIMES">STARTIMES</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Plan Code</label>
                    <input type="text" value={planId} onChange={e => setPlanId(e.target.value)} placeholder="e.g. D100" className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Smart Card / IUC Number</label>
                  <input type="text" value={iucNumber} onChange={e => setIucNumber(e.target.value)} placeholder="1234567890" className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500" />
                </div>
             </div>
          )}

          {service === 'ELECTRICITY' && (
             <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Disco</label>
                    <select value={disco} onChange={e => setDisco(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500">
                      <option value="AEDC">AEDC (Abuja)</option>
                      <option value="IBEDC">IBEDC (Ibadan)</option>
                      <option value="EKEDC">EKEDC (Eko)</option>
                      <option value="IKEDC">IKEDC (Ikeja)</option>
                      <option value="PHEDC">PHEDC (Port Harcourt)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Meter Type</label>
                    <select value={meterType} onChange={e => setMeterType(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500">
                      <option value="PREPAID">Prepaid</option>
                      <option value="POSTPAID">Postpaid</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Meter Number</label>
                    <input type="text" value={meterNumber} onChange={e => setMeterNumber(e.target.value)} placeholder="Meter No" className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Amount (₦)</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="1000" className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500" />
                  </div>
                </div>
             </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !apiKey}
          className={`w-full flex items-center justify-center space-x-2 py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white uppercase tracking-wider transition-all duration-200 ${
            isLoading || !apiKey
              ? 'bg-slate-700 cursor-not-allowed opacity-70'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Transaction...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>{apiKey ? `Purchase ${service}` : 'Enter API Key to Purchase'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};