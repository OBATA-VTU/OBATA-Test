import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../types';
import { buyAirtime, buyData, buyCable, payElectricity, validateMeter, validateCable } from '../services/api';
import { CreditCard, Check, Search, Loader2, Wallet, FileText, XCircle, ArrowRight, UserCheck, Phone, LayoutGrid, Banknote } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ConnectionFormProps {
  onSubmit: (config: any) => void; // We pass plain config object to be handled by parent
  isLoading: boolean;
  initialService?: string;
  dataPlans?: any[];
  cablePlans?: any[];
  electricityProviders?: any[];
}

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
  const [service, setService] = useState<string>(initialService || 'AIRTIME');
  
  useEffect(() => {
    if (initialService) setService(initialService);
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

  // Field Validation State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setValidatedName(null);
    setValidationError(null);
    setErrors({});
  }, [iucNumber, meterNumber, meterType, discoId, service, networkId]);

  const filteredDataPlans = dataPlans.filter(p => {
      if(networkId === '1') return p.provider === 'MTN';
      if(networkId === '2') return p.provider === 'AIRTEL';
      if(networkId === '3') return p.provider === 'GLO';
      if(networkId === '4') return p.provider === '9MOBILE';
      return false;
  });

  const validateInputs = () => {
      const newErrors: { [key: string]: string } = {};
      const phoneRegex = /^0\d{10}$/;
      
      if (service === 'AIRTIME' || service === 'DATA') {
          if (!phoneRegex.test(phone)) newErrors.phone = "Invalid format (e.g. 08012345678)";
      }
      if (service === 'AIRTIME') {
          if (!amount || Number(amount) < 50) newErrors.amount = "Minimum amount is ₦50";
      }
      if (service === 'DATA') {
          if (!planId) newErrors.planId = "Please select a data plan";
      }
      if (service === 'CABLE') {
          if (!cablePlanId) newErrors.cablePlanId = "Select a package";
          if (iucNumber.length < 10) newErrors.iucNumber = "Invalid IUC Number";
          if (!validatedName) newErrors.validation = "Please verify IUC first";
      }
      if (service === 'ELECTRICITY') {
          if (!amount || Number(amount) < 500) newErrors.amount = "Minimum amount is ₦500";
          if (meterNumber.length < 10) newErrors.meterNumber = "Invalid Meter Number";
          if (!validatedName) newErrors.validation = "Please verify Meter first";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleVerify = async () => {
    setValidationError(null);
    setValidatedName(null);
    setIsValidating(true);

    try {
      let res;
      if (service === 'CABLE') {
        res = await validateCable(cablePlanId, iucNumber);
      } else if (service === 'ELECTRICITY') {
        res = await validateMeter(discoId, meterNumber, meterType);
      }

      if (res?.success && res.data?.status === 'success') {
        setValidatedName(res.data.data.customerName || 'Verified Customer');
      } else {
        setValidationError(res?.error || 'Validation Failed');
      }
    } catch (e: any) {
      setValidationError('System Error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    // We pass a configuration object to the parent to handle the API call logic
    // This abstracts the logic so ServicesPage can handle the PIN modal flow
    const config: any = {
        type: service,
        details: {}
    };

    if (service === 'AIRTIME') config.details = { network: networkId, amount, phone };
    if (service === 'DATA') config.details = { planId, phone, amount: 0 }; // Amount usually from plan
    if (service === 'CABLE') config.details = { planId: cablePlanId, iuc: iucNumber };
    if (service === 'ELECTRICITY') config.details = { discoId, meterNumber, amount, meterType };

    onSubmit(config);
  };

  const NetworkSelector = ({ selected, onSelect }: any) => (
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
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="08012345678" className={`w-full bg-slate-950 border rounded-xl p-4 text-white focus:border-blue-500 text-lg tracking-wide ${errors.phone ? 'border-red-500' : 'border-slate-700'}`} />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-1.5 flex items-center"><Banknote className="w-4 h-4 mr-2" /> Amount (₦)</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="100" className={`w-full bg-slate-950 border rounded-xl p-4 text-white focus:border-blue-500 text-lg font-bold ${errors.amount ? 'border-red-500' : 'border-slate-700'}`} />
                        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                    </div>
                </div>
             </div>
          )}

          {service === 'DATA' && (
            <div className="animate-fade-in-up">
                 <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Choose Network</label>
                <NetworkSelector selected={networkId} onSelect={(id: string) => { setNetworkId(id); setPlanId(''); }} />

                <div className="space-y-5">
                     <div>
                        <label className="text-sm font-medium text-slate-300 mb-1.5 flex items-center"><LayoutGrid className="w-4 h-4 mr-2" /> Data Plan</label>
                        <select value={planId} onChange={e => setPlanId(e.target.value)} className={`w-full bg-slate-950 border rounded-xl p-4 text-white focus:border-blue-500 appearance-none ${errors.planId ? 'border-red-500' : 'border-slate-700'}`}>
                            <option value="">-- Select Data Bundle --</option>
                            {filteredDataPlans.map(plan => (
                            <option key={plan.id} value={plan.apiId}>
                                {plan.name} - ₦{plan.price} ({plan.validity})
                            </option>
                            ))}
                        </select>
                        {errors.planId && <p className="text-red-500 text-xs mt-1">{errors.planId}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-1.5 flex items-center"><Phone className="w-4 h-4 mr-2" /> Phone Number</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="08012345678" className={`w-full bg-slate-950 border rounded-xl p-4 text-white focus:border-blue-500 text-lg tracking-wide ${errors.phone ? 'border-red-500' : 'border-slate-700'}`} />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                </div>
             </div>
          )}

          {service === 'CABLE' && (
             <div className="space-y-5 animate-fade-in-up">
                <div>
                   <label className="text-sm font-medium text-slate-300 mb-1.5 block">Select Package</label>
                   <select value={cablePlanId} onChange={e => setCablePlanId(e.target.value)} className={`w-full bg-slate-950 border rounded-xl p-4 text-white focus:border-blue-500 ${errors.cablePlanId ? 'border-red-500' : 'border-slate-700'}`}>
                      <option value="">-- Select --</option>
                      {cablePlans.map(p => <option key={p.id} value={p.apiId}>{p.provider} - {p.name} (₦{p.price})</option>)}
                   </select>
                   {errors.cablePlanId && <p className="text-red-500 text-xs mt-1">{errors.cablePlanId}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1.5 block">SmartCard / IUC Number</label>
                  <div className="flex gap-2">
                    <input type="text" value={iucNumber} onChange={e => setIucNumber(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 7027914329" className={`flex-1 bg-slate-950 border rounded-xl p-4 text-white focus:border-blue-500 ${errors.iucNumber ? 'border-red-500' : 'border-slate-700'}`} />
                    <button type="button" onClick={handleVerify} disabled={!iucNumber || isValidating} className="bg-slate-800 hover:bg-slate-700 text-white px-6 rounded-xl font-bold disabled:opacity-50 transition-colors">
                      {isValidating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                    </button>
                  </div>
                  {validatedName && <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex items-center text-blue-400 text-sm mt-3"><UserCheck className="w-4 h-4 mr-2" /> <span>Account: <span className="font-bold text-white">{validatedName}</span></span></div>}
                  {validationError && <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center text-red-400 text-sm mt-3"><XCircle className="w-4 h-4 mr-2" /> <span>{validationError}</span></div>}
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
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="1000" className={`w-full bg-slate-950 border rounded-xl p-4 text-white focus:border-blue-500 font-bold ${errors.amount ? 'border-red-500' : 'border-slate-700'}`} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1.5 block">Meter Number</label>
                  <div className="flex gap-2">
                    <input type="text" value={meterNumber} onChange={e => setMeterNumber(e.target.value.replace(/\D/g, ''))} placeholder="Meter No" className={`flex-1 bg-slate-950 border rounded-xl p-4 text-white focus:border-blue-500 ${errors.meterNumber ? 'border-red-500' : 'border-slate-700'}`} />
                    <button type="button" onClick={handleVerify} disabled={!meterNumber || isValidating} className="bg-slate-800 hover:bg-slate-700 text-white px-6 rounded-xl font-bold disabled:opacity-50 transition-colors">
                      {isValidating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                    </button>
                  </div>
                  {validatedName && <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex items-center text-blue-400 text-sm mt-3"><UserCheck className="w-4 h-4 mr-2" /> <span>Account: <span className="font-bold text-white">{validatedName}</span></span></div>}
                  {validationError && <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center text-red-400 text-sm mt-3"><XCircle className="w-4 h-4 mr-2" /> <span>{validationError}</span></div>}
                </div>
             </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl shadow-lg text-lg font-bold text-white transition-all duration-200 ${
            isLoading ? 'bg-slate-800 cursor-not-allowed opacity-80' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
          }`}
        >
          {isLoading ? <><Loader2 className="animate-spin mr-2 h-6 w-6 text-white" /> Processing...</> : <><CreditCard className="w-6 h-6" /><span>Purchase Now</span><ArrowRight className="w-6 h-6 ml-2" /></>}
        </button>
      </form>
    </div>
  );
};