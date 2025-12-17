import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Smartphone, Wifi, Tv, Zap, ArrowLeft } from 'lucide-react';
import { useServices } from '../contexts/ServiceContext';
import { buyAirtime, buyData, buyCable, payElectricity } from '../services/api';
import { ConnectionForm } from '../components/ConnectionForm';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { TransactionPinModal } from '../components/TransactionPinModal';
import { ReceiptModal } from '../components/ReceiptModal';

export const ServicesPage: React.FC = () => {
  const { serviceType } = useParams<{ serviceType: string }>();
  const navigate = useNavigate();
  const { dataPlans, cablePlans, electricityProviders } = useServices();

  const [showConfirm, setShowConfirm] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingConfig, setPendingConfig] = useState<any>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [displayAmount, setDisplayAmount] = useState(0);

  if (!serviceType) return <Navigate to="/services/airtime" replace />;

  const tabs = [
    { id: 'airtime', label: 'Airtime', icon: Smartphone },
    { id: 'data', label: 'Data', icon: Wifi },
    { id: 'cable', label: 'Cable TV', icon: Tv },
    { id: 'electricity', label: 'Electricity', icon: Zap },
  ];

  const handleFormSubmit = (config: any) => {
      let amount = Number(config.details.amount) || 0;
      
      // Resolve amount for Data/Cable if planId is present
      if (config.type === 'DATA' && config.details.planId) {
          const plan = dataPlans.find(p => p.apiId === config.details.planId);
          if (plan) amount = plan.price;
      } else if (config.type === 'CABLE' && config.details.planId) {
          const plan = cablePlans.find(p => p.apiId === config.details.planId);
          if (plan) amount = plan.price;
      }

      setDisplayAmount(amount);
      setPendingConfig({ ...config, resolvedAmount: amount });
      setShowConfirm(true);
  };

  const handleConfirm = () => {
      setShowConfirm(false);
      setShowPin(true);
  };

  const executeTransaction = async () => {
      setShowPin(false);
      setIsProcessing(true);
      setShowReceipt(true);

      try {
          const { type, details } = pendingConfig;
          const requestId = `REQ-${Date.now()}`;
          let res;

          if (type === 'AIRTIME') {
              res = await buyAirtime(details.network, details.amount, details.phone, requestId);
          } else if (type === 'DATA') {
              res = await buyData(details.planId, details.phone, requestId);
          } else if (type === 'CABLE') {
              res = await buyCable(details.planId, details.iuc, requestId);
          } else if (type === 'ELECTRICITY') {
              res = await payElectricity(details.discoId, details.meterNumber, details.amount, details.meterType, requestId);
          }

          setLastResponse(res);
      } catch (e: any) {
          setLastResponse({ success: false, data: { message: e.message } });
      } finally {
          setIsProcessing(false);
      }
  };

  // Helper to format details for modal
  const getModalDetails = () => {
      if (!pendingConfig) return [];
      const { details, type } = pendingConfig;
      const list = [];
      
      if (type === 'AIRTIME') {
          list.push({ label: 'Service', value: 'Airtime Top-up' });
          list.push({ label: 'Phone', value: details.phone });
      } else if (type === 'DATA') {
          const plan = dataPlans.find(p => p.apiId === details.planId);
          list.push({ label: 'Service', value: 'Data Bundle' });
          list.push({ label: 'Plan', value: plan ? `${plan.name} (${plan.validity})` : 'Unknown Plan' });
          list.push({ label: 'Phone', value: details.phone });
      } else if (type === 'CABLE') {
          const plan = cablePlans.find(p => p.apiId === details.planId);
          list.push({ label: 'Service', value: 'Cable TV' });
          list.push({ label: 'Package', value: plan ? plan.name : 'Unknown' });
          list.push({ label: 'IUC/SmartCard', value: details.iuc });
      } else if (type === 'ELECTRICITY') {
          const provider = electricityProviders.find(p => p.id === details.discoId);
          list.push({ label: 'Service', value: 'Electricity Token' });
          list.push({ label: 'Provider', value: provider ? provider.name : details.discoId });
          list.push({ label: 'Meter No', value: details.meterNumber });
      }
      return list;
  };

  return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-2">
              <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-white capitalize">Service Top-up</h1>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar mb-6">
              {tabs.map(tab => (
                  <button
                      key={tab.id}
                      onClick={() => navigate(`/services/${tab.id}`)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                          serviceType === tab.id 
                              ? 'bg-blue-600 text-white shadow-lg' 
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                  >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                  </button>
              ))}
          </div>

          {/* Main Form Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <ConnectionForm 
                  initialService={serviceType.toUpperCase()}
                  onSubmit={handleFormSubmit}
                  isLoading={isProcessing}
                  dataPlans={dataPlans}
                  cablePlans={cablePlans}
                  electricityProviders={electricityProviders}
              />
          </div>

          {/* Modals */}
          <ConfirmationModal 
              isOpen={showConfirm}
              onClose={() => setShowConfirm(false)}
              onConfirm={handleConfirm}
              details={getModalDetails()}
              amount={displayAmount}
          />

          <TransactionPinModal 
              isOpen={showPin}
              onClose={() => setShowPin(false)}
              onSuccess={executeTransaction}
              amount={displayAmount}
          />

          <ReceiptModal 
              isOpen={showReceipt}
              onClose={() => { setShowReceipt(false); setLastResponse(null); }}
              response={lastResponse}
              loading={isProcessing}
          />
      </div>
  );
};