import React, { createContext, useContext, useState, useEffect } from 'react';
import { ServicePlan } from '../types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

interface ServiceContextType {
  dataPlans: ServicePlan[];
  cablePlans: ServicePlan[];
  electricityProviders: any[];
  refreshServices: () => Promise<void>;
  getNetworkId: (phone: string) => string;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (!context) throw new Error('useServices must be used within ServiceProvider');
  return context;
};

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataPlans, setDataPlans] = useState<ServicePlan[]>([]);
  const [cablePlans, setCablePlans] = useState<ServicePlan[]>([]);
  const [electricityProviders] = useState([
    { id: '01', name: 'Ikeja Electric (IKEDC)', type: 'both' },
    { id: '02', name: 'Eko Electric (EKEDC)', type: 'both' },
    { id: '03', name: 'Abuja Electric (AEDC)', type: 'both' },
    { id: '04', name: 'Kano Electric (KEDCO)', type: 'both' },
    { id: '05', name: 'Port Harcourt Electric (PHED)', type: 'both' },
  ]);

  const refreshServices = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'services'));
        const services: ServicePlan[] = [];
        querySnapshot.forEach((doc) => {
            services.push({ id: doc.id, ...doc.data() } as ServicePlan);
        });
        
        setDataPlans(services.filter(s => s.category === 'DATA'));
        setCablePlans(services.filter(s => s.category === 'CABLE'));
    } catch (e) {
        console.error("Failed to fetch services", e);
    }
  };

  // Helper to auto-detect network
  const getNetworkId = (phone: string): string => {
    const p = phone.replace('+234', '0').substring(0, 4);
    if (['0803','0806','0703','0706','0813','0816','0810','0814','0903','0906','0913','0916'].includes(p)) return 'MTN';
    if (['0805','0807','0705','0815','0811','0905'].includes(p)) return 'GLO';
    if (['0802','0808','0708','0812','0902','0907','0901','0912'].includes(p)) return 'AIRTEL';
    if (['0809','0818','0817','0909','0908'].includes(p)) return '9MOBILE';
    return '';
  };

  useEffect(() => {
      refreshServices();
  }, []);

  return (
    <ServiceContext.Provider value={{ dataPlans, cablePlans, electricityProviders, refreshServices, getNetworkId }}>
      {children}
    </ServiceContext.Provider>
  );
};