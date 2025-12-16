import React, { useState } from 'react';
import { Smartphone, Wifi, Tv, Zap, GraduationCap, ArrowLeft, Check, AlertCircle, ChevronRight } from 'lucide-react';
import { ConnectionForm } from './ConnectionForm';
import { PinVerifyModal } from './PinVerifyModal';
import { ApiConfig } from '../types';

interface ServicesPageProps {
  onSubmit: (config: ApiConfig) => void;
  isLoading: boolean;
}

type ServiceType = 'AIRTIME' | 'DATA' | 'CABLE' | 'ELECTRICITY' | 'EDUCATION' | null;

export const ServicesPage: React.FC<ServicesPageProps> = ({ onSubmit, isLoading }) => {
  const [activeService, setActiveService] = useState<ServiceType>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingConfig, setPendingConfig] = useState<ApiConfig | null>(null);

  const services = [
    { 
        id: 'AIRTIME', 
        label: 'Buy Airtime', 
        icon: Smartphone, 
        color: 'text-blue-400', 
        gradient: 'from-blue-600 to-indigo-700', 
        desc: 'Instant Top-up for MTN, GLO, Airtel & 9Mobile.' 
    },
    { 
        id: 'DATA', 
        label: 'Buy Data Bundle', 
        icon: Wifi, 
        color: 'text-emerald-400', 
        gradient: 'from-emerald-600 to-teal-700', 
        desc: 'Cheap SME, CG & Corporate Data plans. Valid for 30 days.' 
    },
    { 
        id: 'CABLE', 
        label: 'Cable TV Sub', 
        icon: Tv, 
        color: 'text-purple-400', 
        gradient: 'from-purple-600 to-fuchsia-700', 
        desc: 'Renew DSTV, GOTV & Startimes instantly.' 
    },
    { 
        id: 'ELECTRICITY', 
        label: 'Pay Electric Bill', 
        icon: Zap, 
        color: 'text-amber-400', 
        gradient: 'from-amber-600 to-orange-700', 
        desc: 'Get Prepaid Token or Pay Postpaid bills for all discos.' 
    },
    { 
        id: 'EDUCATION', 
        label: 'Exam Pins', 
        icon: GraduationCap, 
        color: 'text-pink-400', 
        gradient: 'from-pink-600 to-rose-700', 
        desc: 'WAEC, NECO & NABTEB Result Checker Pins.' 
    },
  ];

  const handleFormSubmit = (config: ApiConfig) => {
      // 1. Capture the config
      setPendingConfig(config);
      // 2. Open PIN Modal
      setShowPinModal(true);
  };

  const onPinVerified = () => {
      // 3. Only if PIN is verified, execute the API call
      if (pendingConfig) {
          setShowPinModal(false);
          onSubmit(pendingConfig);
          setPendingConfig(null);
      }
  };

  if (activeService) {
    return (
      <div className="animate-fade-in-up">
        <PinVerifyModal 
            isOpen={showPinModal} 
            onClose={() => setShowPinModal(false)} 
            onVerified={onPinVerified}
            title={`Confirm ${activeService} Purchase`}
        />

        <div className="flex items-center mb-6">
            <button 
                onClick={() => setActiveService(null)}
                className="flex items-center text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 rounded-full pl-3 pr-5 py-2 hover:border-slate-600"
            >
                <div className="bg-slate-800 rounded-full p-1 mr-2"><ArrowLeft className="w-4 h-4" /></div>
                <span className="font-medium text-sm">Back to Services</span>
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className={`rounded-3xl p-8 bg-gradient-to-br ${services.find(s => s.id === activeService)?.gradient} relative overflow-hidden shadow-2xl`}>
                    <div className="relative z-10 text-white">
                         {(() => {
                            const SvcIcon = services.find(s => s.id === activeService)?.icon || Zap;
                            return <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm"><SvcIcon className="w-8 h-8 text-white" /></div>;
                        })()}
                        <h2 className="text-3xl font-bold mb-2">{services.find(s => s.id === activeService)?.label}</h2>
                        <p className="text-white/80 text-sm leading-relaxed">{services.find(s => s.id === activeService)?.desc}</p>
                    </div>
                    <div className="absolute -bottom-12 -right-12 opacity-10">
                        {(() => {
                            const SvcIcon = services.find(s => s.id === activeService)?.icon || Zap;
                            return <SvcIcon className="w-64 h-64 text-white" />;
                        })()}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
                    <ConnectionForm 
                        onSubmit={handleFormSubmit} 
                        isLoading={isLoading} 
                        initialService={activeService} 
                    />
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center max-w-2xl mx-auto mb-12">
         <h2 className="text-3xl font-bold text-white mb-4">Select a Service</h2>
         <p className="text-slate-400 text-lg">Choose a category below to initiate a transaction.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveService(item.id as ServiceType)}
            className="group relative bg-slate-900 border border-slate-800 rounded-3xl p-6 text-left hover:border-slate-600 transition-all hover:translate-y-[-4px] hover:shadow-2xl overflow-hidden"
          >
             <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
             
             <div className="flex justify-between items-start mb-6">
                 <div className={`w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform ${item.color}`}>
                     <item.icon className="w-7 h-7" />
                 </div>
                 <div className="bg-slate-950 p-2 rounded-full text-slate-600 group-hover:text-white transition-colors">
                     <ChevronRight className="w-4 h-4" />
                 </div>
             </div>
             
             <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{item.label}</h3>
             <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};