import React, { useState } from 'react';
import { Smartphone, Wifi, Tv, Zap, GraduationCap, ArrowLeft } from 'lucide-react';
import { ConnectionForm } from './ConnectionForm';
import { PinVerifyModal } from './PinVerifyModal'; // New Import
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
    { id: 'AIRTIME', label: 'Buy Airtime', icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', desc: 'Top up MTN, GLO, Airtel & 9Mobile' },
    { id: 'DATA', label: 'Buy Data', icon: Wifi, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', desc: 'Cheap SME, CG & Corporate Data' },
    { id: 'CABLE', label: 'Cable TV', icon: Tv, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', desc: 'DSTV, GOTV & Startimes Subscription' },
    { id: 'ELECTRICITY', label: 'Pay Bills', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', desc: 'Prepaid & Postpaid Meter Tokens' },
    { id: 'EDUCATION', label: 'Education', icon: GraduationCap, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20', desc: 'WAEC, NECO & NABTEB Pins' },
  ];

  const handleFormSubmit = (config: ApiConfig) => {
      // Store the config and show PIN modal
      setPendingConfig(config);
      setShowPinModal(true);
  };

  const onPinVerified = () => {
      if (pendingConfig) {
          onSubmit(pendingConfig);
          setShowPinModal(false);
          setPendingConfig(null);
      }
  };

  if (activeService) {
    return (
      <div className="animate-fade-in-up">
        {/* PIN Modal */}
        <PinVerifyModal 
            isOpen={showPinModal} 
            onClose={() => setShowPinModal(false)} 
            onVerified={onPinVerified}
            title={`Confirm ${activeService} Purchase`}
        />

        <button 
          onClick={() => setActiveService(null)}
          className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Services
        </button>

        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 relative shadow-2xl">
           <div className="mb-6 flex items-center space-x-3 pb-6 border-b border-slate-800">
              <div className={`p-3 rounded-xl ${services.find(s => s.id === activeService)?.bg}`}>
                {(() => {
                    const SvcIcon = services.find(s => s.id === activeService)?.icon || Zap;
                    return <SvcIcon className={`w-6 h-6 ${services.find(s => s.id === activeService)?.color}`} />;
                })()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {services.find(s => s.id === activeService)?.label}
                </h2>
                <p className="text-sm text-slate-500">Instant delivery to your destination.</p>
              </div>
           </div>

           <ConnectionForm 
              onSubmit={handleFormSubmit} // Intercept submit
              isLoading={isLoading} 
              initialService={activeService} 
           />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center max-w-2xl mx-auto mb-8">
         <h2 className="text-3xl font-bold text-white mb-3">Available Services</h2>
         <p className="text-slate-400">Choose a category below to initiate a transaction.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveService(item.id as ServiceType)}
            className={`group flex items-start text-left p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${item.bg} ${item.border} hover:bg-slate-800 bg-slate-900/50`}
          >
            <div className={`p-4 rounded-xl bg-slate-900 mr-4 shadow-sm group-hover:scale-110 transition-transform ${item.color}`}>
              <item.icon className="w-8 h-8" />
            </div>
            <div>
              <span className="block font-bold text-lg text-slate-100 mb-1 group-hover:text-white">{item.label}</span>
              <span className="text-sm text-slate-400 leading-relaxed">{item.desc}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};