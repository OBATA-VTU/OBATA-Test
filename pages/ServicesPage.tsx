import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Smartphone, Wifi, Tv, Zap, Loader2, CheckCircle, Search, ChevronRight, ArrowLeft } from 'lucide-react';
import { useServices } from '../contexts/ServiceContext';
import { useAuth } from '../contexts/AuthContext';
import { buyAirtime, buyData, buyCable, payElectricity, validateMeter, validateCable } from '../services/api';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { TransactionPinModal } from '../components/TransactionPinModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { toast } from 'react-hot-toast';

export const ServicesPage: React.FC = () => {
  const { serviceType } = useParams<{ serviceType: string }>();
  const navigate = useNavigate();
  const { dataPlans, cablePlans, electricityProviders, getNetworkId } = useServices();

  // State Declarations (Must come before any return statements)
  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [dataTab, setDataTab] = useState<'SME' | 'DIRECT' | 'GIFTING'>('SME');
  
  // Verification State
  const [meterNum, setMeterNum] = useState('');
  const [disco, setDisco] = useState('');
  const [iuc, setIuc] = useState('');
  const [cableProvider, setCableProvider] = useState('');
  const [verifiedName, setVerifiedName] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Modals
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);

  // Network Detection
  useEffect(() => {
    if ((serviceType === 'airtime' || serviceType === 'data') && phone.length >= 4) {
        const detected = getNetworkId(phone);
        if (detected) setNetwork(detected);
    }
  }, [phone, serviceType, getNetworkId]);

  // FIX: Early return must happen AFTER hooks
  if (!serviceType) {
      return <Navigate to="/services/airtime" replace />;
  }

  const handleVerify = async () => {
      setIsValidating(true);
      setVerifiedName('');
      try {
          let res;
          if (serviceType === 'electricity') {
             res = await validateMeter(disco, meterNum, '1'); // Defaulting to Prepaid '1' for demo
          } else if (serviceType === 'cable') {
             res = await validateCable(cableProvider, iuc);
          }
          
          if (res?.success && res.data?.status === 'success') {
              setVerifiedName(res.data.data.customerName || 'Verified User');
              toast.success("Verification Successful");
          } else {
              toast.error("Verification Failed. Check details.");
          }
      } catch (e) { toast.error("Error verifying details"); }
      finally { setIsValidating(false); }
  };

  const handleBuyClick = (e: React.FormEvent) => {
      e.preventDefault();
      // Basic Validation
      if (!amount && !selectedPlan) {
          toast.error("Please fill all fields");
          return;
      }
      setShowConfirm(true);
  };

  const executeTransaction = async () => {
      setShowPin(false);
      setIsProcessing(true);
      setShowSuccess(true); // Show modal in loading state

      const requestId = `REQ-${Date.now()}`;
      let res;

      try {
          if (serviceType === 'airtime') {
              res = await buyAirtime(network, Number(amount), phone, requestId);
          } else if (serviceType === 'data') {
              res = await buyData(selectedPlan.apiId, phone, requestId);
          } else if (serviceType === 'cable') {
              res = await buyCable(selectedPlan.apiId, iuc, requestId);
          } else if (serviceType === 'electricity') {
              res = await payElectricity(disco, meterNum, Number(amount), '1', requestId);
          }
          setLastResponse(res);
      } catch (e: any) {
          setLastResponse({ success: false, data: { message: e.message } });
      } finally {
          setIsProcessing(false);
      }
  };

  const getConfirmDetails = () => {
      if (serviceType === 'airtime') return [{ label: 'Network', value: network }, { label: 'Phone', value: phone }];
      if (serviceType === 'data') return [{ label: 'Plan', value: selectedPlan?.name }, { label: 'Phone', value: phone }];
      if (serviceType === 'electricity') return [{ label: 'Disco', value: disco }, { label: 'Meter', value: meterNum }, { label: 'Name', value: verifiedName }];
      if (serviceType === 'cable') return [{ label: 'Provider', value: cableProvider }, { label: 'IUC', value: iuc }, { label: 'Name', value: verifiedName }];
      return [];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
        {/* Modals */}
        <ConfirmationModal 
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={() => { setShowConfirm(false); setShowPin(true); }}
            details={getConfirmDetails()}
            amount={Number(amount || selectedPlan?.price || 0)}
        />
        <TransactionPinModal 
            isOpen={showPin}
            onClose={() => setShowPin(false)}
            onSuccess={executeTransaction}
            amount={Number(amount || selectedPlan?.price || 0)}
        />
        <ReceiptModal 
            isOpen={showSuccess}
            onClose={() => setShowSuccess(false)}
            response={lastResponse}
            loading={isProcessing}
        />

        {/* Header Tabs */}
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
            {['airtime', 'data', 'cable', '