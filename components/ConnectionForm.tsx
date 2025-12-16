import React, { useState } from 'react';
import { ApiConfig, KeyValuePair } from '../types';
import { executeApiRequest } from '../services/api'; 
import { Settings, CreditCard, Smartphone, Wifi, Tv, Zap, Check, GraduationCap, Search, Loader2, Globe, Wallet, Server, FileText, Building } from 'lucide-react';

interface ConnectionFormProps {
  onSubmit: (config: ApiConfig) => void;
  isLoading: boolean;
}

type ServiceType = 'AIRTIME' | 'DATA' | 'CABLE' | 'ELECTRICITY' | 'EDUCATION' | 'BALANCE' | 'SERVICES' | 'TRANSACTION' | 'BANK';

// --- FULL DATASETS FROM DOCS ---

const NETWORKS = [
  { id: '1', name: 'MTN' },
  { id: '2', name: 'AIRTEL' },
  { id: '3', name: 'GLO' },
  { id: '4', name: '9MOBILE' },
  { id: '5', name: 'VITEL' }
];

const DATA_PLANS: Record<string, { id: string; name: string; price: string; validity?: string }[]> = {
  '1': [ // MTN
    { id: '97', name: '500MB (Share)', price: '390', validity: '7 Days' },
    { id: '98', name: '1GB (Share)', price: '590', validity: '30 Days' },
    { id: '99', name: '2GB (Share)', price: '1050', validity: '30 Days' },
    { id: '100', name: '3GB (Share)', price: '1550', validity: '30 Days' },
    { id: '101', name: '5GB (Share)', price: '1980', validity: '30 Days' },
    { id: '202', name: '1GB + 3 mins (Direct)', price: '488', validity: 'Daily' },
    { id: '203', name: '2.5GB (Direct)', price: '738', validity: 'Daily' },
    { id: '205', name: '2.5GB (Direct)', price: '887', validity: '2 Days' },
    { id: '210', name: '1GB+5mins (Direct)', price: '788', validity: 'Weekly' },
    { id: '214', name: '6GB (Direct)', price: '2463', validity: 'Weekly' },
    { id: '217', name: '2.7GB+5mins (Direct)', price: '1970', validity: '30 Days' },
    { id: '222', name: '12.5GB (Direct)', price: '5500', validity: '30 Days' },
    { id: '223', name: '16.5GB+10mins (Direct)', price: '6403', validity: '30 Days' },
    { id: '216', name: '2GB (Direct)', price: '1478', validity: '30 Days' },
    { id: '226', name: '10GB+10mins (Direct)', price: '4448', validity: '30 Days' },
    { id: '227', name: '3.5GB (Direct)', price: '2463', validity: '30 Days' },
    { id: '228', name: '36GB (Direct)', price: '10835', validity: '30 Days' },
    { id: '229', name: '1.8GB + 35mins (Direct)', price: '1478', validity: '30 Days' },
    { id: '231', name: '2GB (TikTok) (Social)', price: '398', validity: '7 Days' },
    { id: '232', name: '1.2GB (All Social) (Social)', price: '444', validity: '30 Days' },
    { id: '234', name: '1.2GB (Pulse) (Direct)', price: '788', validity: '7 Days' },
    { id: '235', name: '90GB (Direct)', price: '24525', validity: '60 Days' },
    { id: '236', name: '165GB (Direct)', price: '34300', validity: '30 Days' },
    { id: '237', name: '150GB (Direct)', price: '39000', validity: '60 Days' },
    { id: '238', name: '200GB (Direct)', price: '49000', validity: '60 Days' },
    { id: '239', name: '800GB (Direct)', price: '123000', validity: '1 Year' },
    { id: '240', name: '1GB (Share)', price: '470', validity: '7 Days' },
    { id: '16', name: '1GB (CG)', price: '640', validity: '30 Days' },
    { id: '17', name: '2GB (CG)', price: '1360', validity: '30 Days' },
    { id: '18', name: '3GB (CG)', price: '1650', validity: '30 Days' },
    { id: '19', name: '5GB (CG)', price: '2350', validity: '30 Days' },
    { id: '245', name: '1GB (CG)', price: '540', validity: '7 Days' },
    { id: '247', name: 'Talkmore 1k', price: '330', validity: '7 Days' },
    { id: '248', name: 'Talkmore 4k', price: '1350', validity: '14 Days' },
    { id: '249', name: 'Talkmore 8k', price: '2400', validity: '14 Days' },
    { id: '250', name: 'Talkmore 20k', price: '6350', validity: '14 Days' },
    { id: '251', name: 'Talkmore 400', price: '175', validity: '7 Days' },
    { id: '246', name: '2GB (CG)', price: '1150', validity: '7 Days' },
    { id: '252', name: '600MB (Direct)', price: '493', validity: '7 Days' },
    { id: '253', name: '1.5GB (Direct)', price: '985', validity: '7 Days' },
    { id: '254', name: '3.5GB (Direct)', price: '1478', validity: '7 Days' },
    { id: '255', name: '20GB (Direct)', price: '4925', validity: '7 Days' },
    { id: '256', name: '11GB (Direct)', price: '3448', validity: '7 Days' },
    { id: '257', name: '1.5GB (Direct)', price: '591', validity: '2 Days' },
    { id: '258', name: '230MB (Direct)', price: '197', validity: '1 Day' },
    { id: '259', name: '500MB (Direct)', price: '345', validity: '1 Day' },
    { id: '260', name: '2GB (Direct)', price: '730', validity: '2 Days' },
    { id: '126', name: '3.2GB (Direct)', price: '985', validity: '2 Days' }
  ],
  '3': [ // GLO
    { id: '35', name: '500MB (CG)', price: '215', validity: '30 Days' },
    { id: '36', name: '1GB (CG)', price: '430', validity: '30 Days' },
    { id: '37', name: '2GB (CG)', price: '860', validity: '30 Days' },
    { id: '38', name: '3GB (CG)', price: '1290', validity: '30 Days' },
    { id: '39', name: '5GB (CG)', price: '2150', validity: '30 Days' },
    { id: '40', name: '10GB (CG)', price: '4300', validity: '30 Days' },
    { id: '113', name: '750MB (Awoof)', price: '210', validity: '1 Day' },
    { id: '114', name: '1.5GB (Awoof)', price: '315', validity: '1 Day' },
    { id: '115', name: '2.5GB (Awoof)', price: '515', validity: '2 Days' },
    { id: '116', name: '10GB (Awoof)', price: '1920', validity: '7 Days' },
    { id: '400', name: '1.0 GB (Direct)', price: '480', validity: '14 Days' },
    { id: '401', name: '2.6 GB (Direct)', price: '960', validity: '30 Days' },
    { id: '402', name: '6.15 GB (Direct)', price: '1900', validity: '30 Days' },
    { id: '403', name: '7.5 GB (Direct)', price: '2400', validity: '30 Days' },
    { id: '404', name: '10.0 GB (Direct)', price: '2850', validity: '30 Days' },
    { id: '405', name: '14.0 GB (Direct)', price: '3800', validity: '30 Days' },
    { id: '406', name: '18.0 GB (Direct)', price: '4800', validity: '30 Days' },
    { id: '407', name: '28GB (Direct)', price: '7275', validity: '30 Days' },
    { id: '408', name: '875MB (Direct)', price: '196', validity: '2 Days' },
    { id: '409', name: '1GB (CG)', price: '285', validity: '3 Days' },
    { id: '410', name: '3GB (CG)', price: '850', validity: '3 Days' },
    { id: '411', name: '5GB (CG)', price: '1425', validity: '3 Days' },
    { id: '412', name: '1GB (CG)', price: '340', validity: '7 Days' },
    { id: '413', name: '3GB (CG)', price: '1020', validity: '7 Days' },
    { id: '414', name: '5GB (CG)', price: '1680', validity: '7 Days' },
    { id: '415', name: '1.5 GB (Social)', price: '485', validity: '7 Days' },
    { id: '416', name: '300MB (Social)', price: '97', validity: '1 Day' },
    { id: '417', name: '1GB (Social)', price: '291', validity: '3 Days' },
    { id: '418', name: '3.5GB (Social)', price: '970', validity: '30 Days' },
    { id: '425', name: '45MB (Direct)', price: '50', validity: '1 Day' },
    { id: '426', name: '100MB + 5MB Night', price: '97', validity: '1 Day' },
    { id: '427', name: '210MB + 25MB Night', price: '194', validity: '2 Days' },
    { id: '428', name: '500MB + 1GB Night', price: '485', validity: '7 Days' },
    { id: '429', name: '1GB + 1GB Night', price: '485', validity: '1 Day' },
    { id: '430', name: '1.55GB + 2GB Night', price: '582', validity: '2 Days' },
    { id: '431', name: '3.1GB + 2GB night', price: '970', validity: '2 Days' },
    { id: '432', name: '3.9GB + 2GB Night', price: '1455', validity: '7 Days' }
  ],
  '2': [ // AIRTEL
    { id: '104', name: '150MB (Awoof)', price: '68', validity: '1 Day' },
    { id: '105', name: '300MB (Awoof)', price: '125', validity: '2 Days' },
    { id: '109', name: '10GB (Awoof)', price: '3080', validity: '30 Days' },
    { id: '111', name: '600MB (Awoof)', price: '230', validity: '2 Days' },
    { id: '300', name: '2GB (Direct)', price: '1479', validity: '30 Days' },
    { id: '301', name: '3GB (Direct)', price: '1972', validity: '30 Days' },
    { id: '302', name: '4GB (Direct)', price: '2465', validity: '30 Days' },
    { id: '303', name: '8GB (Direct)', price: '2958', validity: '30 Days' },
    { id: '304', name: '10GB (Direct)', price: '3944', validity: '30 Days' },
    { id: '305', name: '13GB (Direct)', price: '4930', validity: '30 Days' },
    { id: '307', name: '25GB (Direct)', price: '7888', validity: '30 Days' },
    { id: '308', name: '1.5 GB (Social)', price: '496', validity: '7 Days' },
    { id: '309', name: '500MB (Direct)', price: '493', validity: '7 days' },
    { id: '310', name: '3.5 GB (Direct)', price: '1479', validity: '7 Days' },
    { id: '306', name: '18GB (Direct)', price: '5916', validity: '30 Days' },
    { id: '313', name: '200MB (Social)', price: '98', validity: '5 Days' },
    { id: '314', name: '1GB (Social)', price: '297', validity: '3 Days' },
    { id: '320', name: '3GB (Awoof)', price: '1050', validity: '2 Days' },
    { id: '321', name: '35GB (Direct)', price: '9860', validity: '30 Days' },
    { id: '322', name: '60GB (Direct)', price: '14790', validity: '30 Days' },
    { id: '323', name: '100GB (Direct)', price: '19720', validity: '30 Days' },
    { id: '324', name: '210GB (Direct)', price: '39440', validity: '30 Days' },
    { id: '325', name: '300GB (Direct)', price: '49300', validity: '90 Days' },
    { id: '326', name: '350GB (Direct)', price: '59160', validity: '120 Days' },
    { id: '327', name: '650GB (Direct)', price: '98600', validity: '365 Days' },
    { id: '328', name: '5GB (Direct)', price: '1479', validity: '7 Days' },
    { id: '329', name: '6GB (Direct)', price: '2465', validity: '7 Days' },
    { id: '330', name: '10GB (Direct)', price: '2958', validity: '7 Days' },
    { id: '331', name: '1GB (Direct)', price: '789', validity: '7 Days' },
    { id: '332', name: '1.5GB (Direct)', price: '986', validity: '7 Days' },
    { id: '333', name: '18GB (Direct)', price: '4930', validity: '7 Days' },
    { id: '334', name: '100MB (Direct)', price: '99', validity: '1 Day' },
    { id: '335', name: '200MB (Direct)', price: '197', validity: '2 Days' },
    { id: '336', name: '250MB (Direct)', price: '50', validity: '1 Day' },
    { id: '337', name: '300MB (Direct)', price: '296', validity: '2 Days' },
    { id: '338', name: '1GB (Direct)', price: '493', validity: '1 Day' },
    { id: '339', name: '2GB (Direct)', price: '739', validity: '2 Days' },
    { id: '340', name: '1.5GB (Direct)', price: '591', validity: '2 Days' },
    { id: '341', name: '3GB (Direct)', price: '986', validity: '2 Days' },
    { id: '342', name: '75MB (Direct)', price: '75', validity: '1 Day' },
    { id: '343', name: '100GB + 2GB daily (Router)', price: '19720', validity: '30 Days' },
    { id: '344', name: 'Router Unlimited 20MBPS', price: '29550', validity: '30 Days' },
    { id: '345', name: 'Router Unlimited 60MBPS', price: '49300', validity: '30 Days' },
    { id: '346', name: 'Router Unlimited 20MBPS', price: '78800', validity: '90 Days' },
    { id: '347', name: 'Router Unlimited 60MBPS', price: '132975', validity: '90 Days' },
    { id: '348', name: 'Router Unlimited 20MBPS', price: '147750', validity: '180 Days' },
    { id: '349', name: '13GB + 1GB daily (Mifi)', price: '4930', validity: '30 Days' },
    { id: '350', name: '35GB + 2 daily (Mifi)', price: '9860', validity: '30 Days' },
    { id: '351', name: '5GB (Awoof)', price: '1479', validity: '7 Days' },
    { id: '352', name: '1.5GB (Binge)', price: '500', validity: '1 Day' },
    { id: '353', name: '2GB (Binge)', price: '600', validity: '2 Days' },
    { id: '354', name: '3GB (Binge)', price: '750', validity: '2 Days' },
    { id: '355', name: '5GB (Binge)', price: '1500', validity: '2 Days' }
  ],
  '4': [], // 9Mobile (None provided in prompt details)
  '5': [ // Vitel
    { id: '500', name: '75MB (Direct)', price: '75', validity: '1 Day' },
    { id: '501', name: '120MB (Direct)', price: '100', validity: '1 Day' },
    { id: '502', name: '230MB (Direct)', price: '200', validity: '1 Day' },
    { id: '503', name: '500MB (Direct)', price: '350', validity: '1 Day' },
    { id: '504', name: '500MB (Direct)', price: '500', validity: '7 Days' },
    { id: '505', name: '1.5GB (Direct)', price: '600', validity: '2 Days' },
    { id: '506', name: '1GB (Direct)', price: '800', validity: '7 Days' },
    { id: '507', name: '2.5GB (Direct)', price: '900', validity: '2 Days' },
    { id: '508', name: '1.5GB (Direct)', price: '1000', validity: '7 Days' },
    { id: '509', name: '3.2GB (Direct)', price: '1000', validity: '2 Days' },
    { id: '510', name: '3.5GB (Direct)', price: '1500', validity: '7 Days' },
    { id: '511', name: '6GB (Direct)', price: '2500', validity: '7 Days' },
    { id: '512', name: '4.25GB (Direct)', price: '3000', validity: '30 Days' },
    { id: '513', name: '6.75GB (Direct)', price: '3250', validity: '30 Days' },
    { id: '514', name: '7GB (Direct)', price: '3500', validity: '30 Days' },
    { id: '515', name: '12.5GB (Direct)', price: '5500', validity: '30 Days' },
    { id: '516', name: '36GB (Direct)', price: '11000', validity: '30 Days' },
    { id: '517', name: '65GB (Direct)', price: '16000', validity: '30 Days' }
  ]
};

const CABLE_PLANS = [
  // STARTIMES
  { id: '101', name: 'Startimes Basic - ₦4000', provider: 'STARTIMES' },
  { id: '102', name: 'Startimes Smart - ₦5100', provider: 'STARTIMES' },
  { id: '103', name: 'Startimes Classic - ₦7400', provider: 'STARTIMES' },
  { id: '104', name: 'Startimes Super - ₦9500', provider: 'STARTIMES' },
  // DSTV
  { id: '90', name: 'DSTV Padi - ₦4400', provider: 'DSTV' },
  { id: '91', name: 'DSTV Yanga - ₦6000', provider: 'DSTV' },
  { id: '92', name: 'DSTV Confam - ₦11000', provider: 'DSTV' },
  { id: '93', name: 'DSTV Compact - ₦19000', provider: 'DSTV' },
  { id: '105', name: 'DSTV Compact Plus - ₦30000', provider: 'DSTV' },
  { id: '106', name: 'DSTV Premium - ₦44500', provider: 'DSTV' },
  // GOTV
  { id: '94', name: 'GOTV Smallie - ₦1900', provider: 'GOTV' },
  { id: '98', name: 'GOTV Smallie Quarterly - ₦5100', provider: 'GOTV' },
  { id: '99', name: 'GOTV Smallie Yearly - ₦15000', provider: 'GOTV' },
  { id: '96', name: 'GOTV Jolli - ₦5800', provider: 'GOTV' },
  { id: '97', name: 'GOTV Jinja - ₦3900', provider: 'GOTV' },
  { id: '95', name: 'GOTV Max - ₦8500', provider: 'GOTV' },
  { id: '112', name: 'GOTV Supa - ₦11400', provider: 'GOTV' },
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
  { id: '13', name: 'Apapa Power (APLENMD)' },
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
  const [networkId, setNetworkId] = useState('1'); 
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [planId, setPlanId] = useState('');
  
  const [cablePlanId, setCablePlanId] = useState(CABLE_PLANS[0].id);
  const [iucNumber, setIucNumber] = useState('');
  const [validatedName, setValidatedName] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const [discoId, setDiscoId] = useState('1'); 
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState('1'); 

  const [examId, setExamId] = useState('1');
  const [quantity, setQuantity] = useState('1');

  // New Fields for Query
  const [txnReference, setTxnReference] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNum, setAccountNum] = useState('');

  // Reset validation when critical fields change
  React.useEffect(() => {
    setValidatedName(null);
  }, [iucNumber, meterNumber, meterType, discoId, service]);

  const getHeaders = (endpointType: 'standard' | 'purchase_utility'): KeyValuePair[] => {
    // According to Docs:
    // Airtime/Data/Services/Balance/Validation uses "Authorization: Token KEY"
    // Cable Purchase/Electricity Purchase uses "Authorization-Token: KEY"
    
    const commonHeaders = [
      { key: 'Content-Type', value: 'application/json' },
    ];

    if (endpointType === 'purchase_utility') {
      return [
        ...commonHeaders,
        { key: 'Authorization-Token', value: apiKey } 
      ];
    } else {
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

    // Validation endpoints use standard Token header per docs
    const verificationHeaders = getHeaders('standard');

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
        headerType = 'purchase_utility'; // Specific header
        bodyObj = {
          serviceID: cablePlanId,
          iucNum: iucNumber
        };
        break;
      case 'ELECTRICITY':
        endpoint = '/payelectric';
        headerType = 'purchase_utility'; // Specific header
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
      case 'SERVICES':
        endpoint = '/services';
        method = 'GET';
        bodyObj = undefined;
        break;
      case 'TRANSACTION':
        endpoint = '/transaction';
        bodyObj = { reference: txnReference };
        break;
      case 'BANK':
        endpoint = '/transaction';
        bodyObj = { bankCode, acctNum: accountNum };
        break;
    }

    onSubmit({
      url: `${baseUrl}${endpoint}`,
      method: method,
      headers: getHeaders(headerType),
      body: bodyObj ? JSON.stringify(bodyObj, null, 2) : undefined,
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
    if (service === 'TRANSACTION') return txnReference;
    if (service === 'BANK') return bankCode && accountNum;
    if (service === 'BALANCE' || service === 'SERVICES') return true;
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
          </div>
        )}
      </div>

      {/* Service Selection Tabs */}
      <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-lg">
        {[
          { id: 'BALANCE', icon: Wallet, label: 'Balance' },
          { id: 'SERVICES', icon: Server, label: 'Services' },
          { id: 'AIRTIME', icon: Smartphone, label: 'Airtime' },
          { id: 'DATA', icon: Wifi, label: 'Data' },
          { id: 'CABLE', icon: Tv, label: 'Cable' },
          { id: 'ELECTRICITY', icon: Zap, label: 'Power' },
          { id: 'EDUCATION', icon: GraduationCap, label: 'Exam' },
          { id: 'TRANSACTION', icon: FileText, label: 'Status' },
          { id: 'BANK', icon: Building, label: 'Bank' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setService(item.id as ServiceType)}
            className={`flex flex-col items-center justify-center p-2 rounded-md transition-all duration-200 flex-1 min-w-[70px] ${
              service === item.id 
                ? 'bg-slate-700 text-emerald-400 shadow-md ring-1 ring-slate-600' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
          >
            <item.icon className="w-4 h-4 mb-1" />
            <span className="text-[9px] font-bold uppercase tracking-wide">{item.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Dynamic Form Fields */}
        <div className="p-1 min-h-[200px]">
          {service === 'BALANCE' && (
            <div className="space-y-4 animate-fadeIn flex flex-col items-center justify-center h-48 text-center text-slate-400">
               <Wallet className="w-12 h-12 mb-3 opacity-20" />
               <p className="text-sm">Click "Check Balance" to retrieve your current wallet balance.</p>
            </div>
          )}

          {service === 'SERVICES' && (
             <div className="space-y-4 animate-fadeIn flex flex-col items-center justify-center h-48 text-center text-slate-400">
                <Server className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Retrieve all active service IDs and pricing from the API.</p>
             </div>
          )}

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
                        {plan.name} - ₦{plan.price} ({plan.validity})
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

          {service === 'TRANSACTION' && (
             <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Transaction Reference ID</label>
                  <input type="text" value={txnReference} onChange={e => setTxnReference(e.target.value)} placeholder="e.g. INL|NQJK56QVZV..." className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500 font-mono" />
                </div>
             </div>
          )}

          {service === 'BANK' && (
             <div className="space-y-4 animate-fadeIn">
                 <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Bank Code</label>
                    <input type="text" value={bankCode} onChange={e => setBankCode(e.target.value)} placeholder="e.g. 100033" className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Account Number</label>
                    <input type="text" value={accountNum} onChange={e => setAccountNum(e.target.value)} placeholder="e.g. 8060689551" className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-emerald-500 font-mono" />
                  </div>
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
              {service === 'BALANCE' ? <Wallet className="w-5 h-5" /> : 
               service === 'SERVICES' ? <Server className="w-5 h-5" /> :
               service === 'TRANSACTION' || service === 'BANK' ? <Search className="w-5 h-5" /> :
               <CreditCard className="w-5 h-5" />}
              <span>
                {service === 'BALANCE' ? 'Check Balance' :
                 service === 'SERVICES' ? 'Fetch API Services' :
                 service === 'TRANSACTION' ? 'Verify Transaction' :
                 service === 'BANK' ? 'Resolve Account' :
                 'Purchase Now'}
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};