import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../types';
import { validateMeter, validateCable } from '../services/api';
import { CreditCard, Check, Loader2, XCircle, ArrowRight, UserCheck, Phone, LayoutGrid, Banknote } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ConnectionFormProps {
  onSubmit: (config: any) => void; 
  isLoading: boolean;
  initialService?: string;
  dataPlans?: any[];
  cablePlans?: any[];
  electricityProviders?: any[];
}

const NETWORKS = [
  { id: '1', name: 'MTN', color: 'bg-yellow-400', inlomaxId: '1' },
  { id: '2', name: 'AIRTEL', color: 'bg-red-500', inlomaxId: '2' },
  { id: '3', name: 'GLO', color: 'bg-green-500', inlomaxId: '3' },
  { id: '4', name: '9MOBILE', color: 'bg-green-700', inlomaxId: '4' },
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setValidatedName(null);
    setValidationError(null);
    setErrors({});
  }, [iucNumber, meterNumber, meterType, discoId, service, networkId]);

  const filteredDataPlans = dataPlans.filter(p => {
      const selected = NETWORKS.find(n => n.id === networkId);
      return p.provider?.toUpperCase() === selected?.name;
  });

  const validateInputs = () => {
      const newErrors: { [key: string]: string } = {};
      const phoneRegex = /^0\d{10}$/;
      
      if (service === 'AIRTIME' || service === 'DATA') {
          if (!phoneRegex.test(phone)) newErrors.phone = "Invalid format (e.g. 08012345678)";
      }
      if (service === 'AIRTIME') {
          if (!amount || Number(amount) < 50) newErrors.amount = "Minimum ₦50";
      }
      if (service === 'DATA') {
          if (!planId) newErrors.planId = "Select plan";
      }
      if (service === 'CABLE') {
          if (!cablePlanId) newErrors.cablePlanId = "Select package";
          if (iucNumber.length < 9) newErrors.iucNumber = "Invalid IUC";
          if (!validatedName) newErrors.validation = "Verify IUC first";
      }
      if (service === 'ELECTRICITY') {
          if (!amount || Number(amount) < 500) newErrors.amount = "Minimum ₦500";
          if (meterNumber.length < 9) newErrors.meterNumber = "Invalid Meter";
          if (!validatedName) newErrors.validation = "Verify Meter first";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleVerify = async () => {
    if ((service === 'CABLE' && !iucNumber) || (service === 'ELECTRICITY' && !meterNumber)) return;
    setValidationError(null);
    setValidatedName(null);
    setIsValidating(true);

    try {
      let res;
      if (service === 'CABLE') {
        // Find which provider it is based on cablePlanId (usually DSTV/GOTV/STARTIMES)
        const selectedPlan = cablePlans.find(p => p.apiId === cablePlanId);
        const providerName = selectedPlan?.provider?.toUpperCase() || '';
        let serviceID = 'dstv';
        if (providerName.includes('GOTV')) serviceID = 'gotv';
        else if (providerName.includes('STARTIMES')) serviceID = 'startimes';

        res = await validateCable(serviceID, iucNumber);
      } else if (service === 'ELECTRICITY') {
        const disco = electricityProviders.find(d => d.id === discoId);
        const serviceID = disco?.name?.toLowerCase()?.includes('ikeja') ? 'ikeja-electric' : 
                          disco?.name?.toLowerCase()?.includes('eko') ? 'eko-electric' :
                          disco?.name?.toLowerCase()?.includes('abuja') ? 'abuja-electric' : 'jos-electric';
        
        // Fixed: Argument of type 'string' is not assignable to parameter of type 'number'.
        // meterType is '1' for prepaid and '2' for postpaid.
        res = await validateMeter(serviceID, meterNumber, parseInt(meterType));
      }

      if (res?.success && (res.data?.status === 'success' || res.data?.customerName)) {
        const name = res.data?.data?.customerName || res.data?.customerName || 'Verified Customer';
        setValidatedName(name);
        toast.success(`Verified: ${name}`);
      } else {
        const err = res?.error || res?.data?.message || 'Verification Failed';
        setValidationError(err);
        toast.error(err);
      }
    } catch (e: any) {
      setValidationError('System Error');
      toast.error('System connection failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    const config: any = {
        type: service,
        details: {}
    };

    if (service === 'AIRTIME') config.details = { network: networkId, amount, phone };
    if (service === 'DATA') config.details = { planId, phone, amount: 0 }; 
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
                className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${selected === n.id ? 'bg-blue-600/10 border-blue-500 shadow-lg' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
              >
                  <div className={`w-8 h-8 rounded-full ${n.color} mb-2 shadow-sm shadow-black/20 group-hover:scale-110 transition-transform`}></div>
                  <span className={`text-[10px] font-black tracking-widest ${selected === n.id ? 'text-white' : 'text-slate-500'}`}>{n.name}</span>
                  {selected === n.id && <div className="absolute top-1 right-1"><Check className="w-3 h-3 text-blue-500" /></div>}
              </button>
          ))}
      </div>
  );

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="min-h-[200px]">
          {service === 'AIRTIME' && (
             <div className="animate-fade-in-up">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Select Network</label>
                <NetworkSelector selected={networkId} onSelect={setNetworkId} />
                
                <div className="space-y-5">
                    <div>
                        <label className="text-sm font-bold text-slate-300 mb-2 flex items-center"><Phone className="w-4 h-4 mr-2 text-blue-500" /> Recipient Number</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="08012345678" className={`w-full bg-slate-950 border rounded-2xl p-4 text-white focus:border-blue-500 text-lg font-mono tracking-widest ${errors.phone ? 'border-rose-500' : 'border-slate-800'}`} />
                        {errors.phone && <p className="text-rose-500 text-xs mt-2 font-bold">{errors.phone}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-300 mb-2 flex items-center"><Banknote className="w-4 h-4 mr-2 text-emerald-500" /> Top-up Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">₦</span>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="100" className={`w-full bg-slate-950 border rounded-2xl p-4 pl-10 text-white focus:border-blue-500 text-xl font-black ${errors.amount ? 'border-rose-500' : 'border-slate-800'}`} />
                        </div>
                        {errors.amount && <p className="text-rose-500 text-xs mt-2 font-bold">{errors.amount}</p>}
                    </div>
                </div>
             </div>
          )}

          {service === 'DATA' && (
            <div className="animate-fade-in-up">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Select Network</label>
                <NetworkSelector selected={networkId} onSelect={(id: string) => { setNetworkId(id); setPlanId(''); }} />

                <div className="space-y-5">
                     <div>
                        <label className="text-sm font-bold text-slate-300 mb-2 flex items-center"><LayoutGrid className="w-4 h-4 mr-2 text-blue-500" /> Choose Data Bundle</label>
                        <select value={planId} onChange={e => setPlanId(e.target.value)} className={`w-full bg-slate-950 border rounded-2xl p-4 text-white focus:border-blue-500 appearance-none font-bold ${errors.planId ? 'border-rose-500' : 'border-slate-800'}`}>
                            <option value="">-- Select Bundle --</option>
                            {filteredDataPlans.map(plan => (
                            <option key={plan.id} value={plan.apiId}>
                                {plan.name} - ₦{plan.price} ({plan.validity})
                            </option>
                            ))}
                        </select>
                        {errors.planId && <p className="text-rose-500 text-xs mt-2 font-bold">{errors.planId}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-300 mb-2 flex items-center"><Phone className="w-4 h-4 mr-2 text-emerald-500" /> Phone Number</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="08012345678" className={`w-full bg-slate-950 border rounded-2xl p-4 text-white focus:border-blue-500 text-lg font-mono tracking-widest ${errors.phone ? 'border-rose-500' : 'border-slate-800'}`} />
                    </div>
                </div>
             </div>
          )}

          {service === 'CABLE' && (
             <div className="space-y-5 animate-fade-in-up">
                <div>
                   <label className="text-sm font-bold text-slate-300 mb-2 block tracking-wide">TV Package</label>
                   <select value={cablePlanId} onChange={e => setCablePlanId(e.target.value)} className={`w-full bg-slate-950 border rounded-2xl p-4 text-white focus:border-blue-500 font-bold ${errors.cablePlanId ? 'border-rose-500' : 'border-slate-800'}`}>
                      <option value="">-- Select Provider/Plan --</option>
                      {cablePlans.map(p => <option key={p.id} value={p.apiId}>{p.provider} - {p.name} (₦{p.price})</option>)}
                   </select>
                   {errors.cablePlanId && <p className="text-rose-500 text-xs mt-2 font-bold">{errors.cablePlanId}</p>}
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-300 mb-2 block tracking-wide">SmartCard / IUC Number</label>
                  <div className="flex gap-2">
                    <input type="text" value={iucNumber} onChange={e => setIucNumber(e.target.value.replace(/\D/g, ''))} placeholder="Enter Number" className={`flex-1 bg-slate-950 border rounded-2xl p-4 text-white focus:border-blue-500 tracking-widest font-mono ${errors.iucNumber ? 'border-rose-500' : 'border-slate-800'}`} />
                    <button type="button" onClick={handleVerify} disabled={!iucNumber || isValidating} className="bg-slate-800 hover:bg-slate-700 text-white px-8 rounded-2xl font-black disabled:opacity-50 transition-all active:scale-95">
                      {isValidating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'VERIFY'}
                    </button>
                  </div>
                  {validatedName && <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center text-emerald-400 text-sm mt-4 font-bold animate-fade-in"><UserCheck className="w-5 h-5 mr-3" /> <span>NAME: <span className="text-white uppercase">{validatedName}</span></span></div>}
                  {validationError && <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center text-rose-400 text-sm mt-4 font-bold animate-pulse"><XCircle className="w-5 h-5 mr-3" /> <span>{validationError}</span></div>}
                </div>
             </div>
          )}

          {service === 'ELECTRICITY' && (
             <div className="space-y-5 animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-bold text-slate-300 mb-2 block">Disco Provider</label>
                    <select value={discoId} onChange={e => setDiscoId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500">
                      {electricityProviders.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-300 mb-2 block">Meter Type</label>
                    <select value={meterType} onChange={e => setMeterType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500">
                      <option value="1">Prepaid</option>
                      <option value="2">Postpaid</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-300 mb-2 block">Amount (₦)</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="1000" className={`w-full bg-slate-950 border rounded-2xl p-4 text-white focus:border-blue-500 font-black text-xl ${errors.amount ? 'border-rose-500' : 'border-slate-800'}`} />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-300 mb-2 block">Meter Number</label>
                  <div className="flex gap-2">
                    <input type="text" value={meterNumber} onChange={e => setMeterNumber(e.target.value.replace(/\D/g, ''))} placeholder="Meter No" className={`flex-1 bg-slate-950 border rounded-2xl p-4 text-white focus:border-blue-500 tracking-widest font-mono ${errors.meterNumber ? 'border-rose-500' : 'border-slate-800'}`} />
                    <button type="button" onClick={handleVerify} disabled={!meterNumber || isValidating} className="bg-slate-800 hover:bg-slate-700 text-white px-8 rounded-2xl font-black disabled:opacity-50 transition-all active:scale-95">
                      {isValidating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'VERIFY'}
                    </button>
                  </div>
                  {validatedName && <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center text-emerald-400 text-sm mt-4 font-bold animate-fade-in"><UserCheck className="w-5 h-5 mr-3" /> <span>NAME: <span className="text-white uppercase">{validatedName}</span></span></div>}
                  {validationError && <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center text-rose-400 text-sm mt-4 font-bold animate-pulse"><XCircle className="w-5 h-5 mr-3" /> <span>{validationError}</span></div>}
                </div>
             </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex items-center justify-center space-x-3 py-5 px-6 rounded-2xl shadow-2xl text-lg font-black text-white transition-all duration-300 transform active:scale-[0.98] ${
            isLoading ? 'bg-slate-800 cursor-not-allowed opacity-80' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 hover:shadow-blue-500/25'
          }`}
        >
          {isLoading ? <><Loader2 className="animate-spin mr-3 h-6 w-6 text-white" /> PROCESSING...</> : <><CreditCard className="w-6 h-6" /><span>PURCHASE NOW</span><ArrowRight className="w-6 h-6 ml-2" /></>}
        </button>
      </form>
    </div>
  );
};