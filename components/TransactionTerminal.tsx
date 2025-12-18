import React, { useState, useEffect } from 'react';
import { 
  Zap, Smartphone, Wifi, Database, RefreshCw, AlertTriangle, Activity, Terminal, HardDriveDownload
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../services/firebase';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';

export const TransactionTerminal: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedServices, setSyncedServices] = useState<any[]>([]);
  const [rawResponse, setRawResponse] = useState<any>(null);

  const loadLocalServices = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'synced_services'));
        const services: any[] = [];
        querySnapshot.forEach((doc) => services.push({ id: doc.id, ...doc.data() }));
        setSyncedServices(services);
    } catch (e) { console.error("Local sync error."); }
  };

  useEffect(() => { loadLocalServices(); }, []);

  const syncServices = async () => {
    setIsSyncing(true);
    setRawResponse(null);
    const tid = toast.loading("Checking for newest plans...");
    
    try {
      const res = await fetch('/api/terminal/services');
      const apiData = await res.json();
      
      if (apiData.status !== 'success') {
        setRawResponse({ step: "FETCH_FAILURE", data: apiData });
        throw new Error("System Error.");
      }

      setRawResponse({ 
          step: "PROCESSING", 
          counts: {
              airtime: apiData.data.airtime?.length || 0,
              data: apiData.data.dataPlans?.length || 0,
              cable: apiData.data.cablePlans?.length || 0,
              power: apiData.data.electricity?.length || 0
          }
      });

      const batch = writeBatch(db);
      const data = apiData.data;
      
      // Use explicit ID mapping to prevent duplicates during sync
      data.airtime?.forEach((item: any) => {
          const id = `AIRTIME_${item.network}`.toUpperCase();
          batch.set(doc(db, 'synced_services', id), { ...item, type: 'AIRTIME', label: `${item.network} Airtime`, lastUpdate: new Date().toISOString() });
      });

      data.dataPlans?.forEach((item: any) => {
          const id = `DATA_${item.serviceID}`.toUpperCase();
          batch.set(doc(db, 'synced_services', id), { ...item, type: 'DATA', label: `${item.network} ${item.dataPlan}`, lastUpdate: new Date().toISOString() });
      });

      data.cablePlans?.forEach((item: any) => {
          const id = `CABLE_${item.serviceID}`.toUpperCase();
          batch.set(doc(db, 'synced_services', id), { ...item, type: 'CABLE', label: `${item.cable} - ${item.cablePlan}`, lastUpdate: new Date().toISOString() });
      });

      data.electricity?.forEach((item: any) => {
          const id = `POWER_${item.serviceID}`.toUpperCase();
          batch.set(doc(db, 'synced_services', id), { ...item, type: 'POWER', label: item.disco, lastUpdate: new Date().toISOString() });
      });

      await batch.commit();
      toast.success("Database Updated!", { id: tid });
      setRawResponse({ status: "COMPLETE", message: "Catalog synchronized." });
      loadLocalServices();
    } catch (e: any) {
      toast.error(e.message, { id: tid });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in text-left">
      <div className="flex justify-between items-end border-b border-slate-800 pb-8">
          <div>
              <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center"><Database className="w-8 h-8 mr-3 text-blue-500" /> Catalog Sync</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Update local database with provider plans.</p>
          </div>
          <button onClick={syncServices} disabled={isSyncing} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center transition-all">
              {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin mr-3" /> : <HardDriveDownload className="w-4 h-4 mr-3" />}
              Sync Now
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[400px]">
          <div className="bg-slate-950/50 border border-slate-900 rounded-[2.5rem] p-8 overflow-y-auto no-scrollbar shadow-inner">
             {syncedServices.length === 0 ? (
                 <div className="h-full flex items-center justify-center opacity-10"><Activity className="w-20 h-20" /></div>
             ) : (
                <div className="space-y-3">
                    {syncedServices.map(s => (
                        <div key={s.id} className="bg-slate-900 p-4 rounded-2xl flex items-center justify-between border border-slate-800">
                            <span className="text-white font-black uppercase text-[10px] tracking-tight truncate">{s.label}</span>
                            <span className="text-slate-700 font-mono text-[8px] uppercase">{s.id}</span>
                        </div>
                    ))}
                </div>
             )}
          </div>
          <div className="bg-black border border-slate-900 rounded-[2.5rem] p-8 font-mono text-[10px] text-blue-400 overflow-auto no-scrollbar shadow-2xl">
              {!rawResponse ? "_ Awaiting data packets..." : JSON.stringify(rawResponse, null, 2)}
          </div>
      </div>
    </div>
  );
};