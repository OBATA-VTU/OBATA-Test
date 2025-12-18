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
    } catch (e) { console.error("Local sync fault."); }
  };

  useEffect(() => { loadLocalServices(); }, []);

  const syncServices = async () => {
    setIsSyncing(true);
    setRawResponse(null);
    const tid = toast.loading("Connecting to our central network...");
    
    try {
      const res = await fetch('/api/terminal/services');
      const apiData = await res.json();
      
      if (apiData.status !== 'success') {
        setRawResponse({ status: "LINK_FAULT", data: apiData });
        throw new Error("System Connection Error.");
      }

      setRawResponse({ 
          step: "SYNC_PROCESSING", 
          counts: {
              airtime: apiData.data.airtime?.length || 0,
              data: apiData.data.dataPlans?.length || 0,
              cable: apiData.data.cablePlans?.length || 0,
              power: apiData.data.electricity?.length || 0
          }
      });

      const batch = writeBatch(db);
      const data = apiData.data;
      
      // FIXED: Using network-prefixed IDs to prevent duplicates and ensure updates
      data.airtime?.forEach((item: any) => {
          const docId = `AIRTIME_${item.network}`.toUpperCase();
          batch.set(doc(db, 'synced_services', docId), { 
              ...item, 
              type: 'AIRTIME', 
              label: `${item.network} Instant Recharge`, 
              lastUpdate: new Date().toISOString() 
          });
      });

      data.dataPlans?.forEach((item: any) => {
          const docId = `DATA_${item.serviceID}`.toUpperCase();
          batch.set(doc(db, 'synced_services', docId), { 
              ...item, 
              type: 'DATA', 
              label: `${item.network} ${item.dataPlan}`, 
              lastUpdate: new Date().toISOString() 
          });
      });

      data.cablePlans?.forEach((item: any) => {
          const docId = `CABLE_${item.serviceID}`.toUpperCase();
          batch.set(doc(db, 'synced_services', docId), { 
              ...item, 
              type: 'CABLE', 
              label: `${item.cable} - ${item.cablePlan}`, 
              lastUpdate: new Date().toISOString() 
          });
      });

      data.electricity?.forEach((item: any) => {
          const docId = `POWER_${item.serviceID}`.toUpperCase();
          batch.set(doc(db, 'synced_services', docId), { 
              ...item, 
              type: 'POWER', 
              label: item.disco, 
              lastUpdate: new Date().toISOString() 
          });
      });

      await batch.commit();
      toast.success("System Catalog Updated!", { id: tid });
      setRawResponse({ status: "SYNC_COMPLETE", message: "Our service database is now up to date." });
      loadLocalServices();
    } catch (e: any) {
      toast.error(e.message, { id: tid });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in text-left">
      <div className="flex justify-between items-end border-b border-slate-800 pb-10">
          <div>
              <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter flex items-center">
                <Database className="w-10 h-10 mr-4 text-blue-600 shadow-2xl" /> 
                System Sync
              </h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-3">Refresh all service pricing and availability</p>
          </div>
          <button onClick={syncServices} disabled={isSyncing} className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center transition-all shadow-2xl shadow-blue-600/20 active:scale-95">
              {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin mr-3" /> : <HardDriveDownload className="w-4 h-4 mr-3" />}
              Update Records
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-[500px]">
          <div className="bg-slate-950 border border-slate-900 rounded-[3rem] p-10 overflow-y-auto no-scrollbar shadow-inner">
             {syncedServices.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-6">
                    <Activity className="w-24 h-24" />
                    <p className="font-black uppercase tracking-widest text-xs">Waiting for Sync...</p>
                 </div>
             ) : (
                <div className="space-y-3">
                    {syncedServices.map(s => (
                        <div key={s.id} className="bg-slate-900 p-6 rounded-[1.8rem] flex items-center justify-between border border-slate-800 hover:border-blue-600/30 transition-all group">
                            <span className="text-white font-black uppercase text-xs tracking-tight group-hover:text-blue-400 transition-colors">{s.label}</span>
                            <span className="text-slate-800 font-mono text-[9px] font-black uppercase group-hover:text-slate-600">{s.id}</span>
                        </div>
                    ))}
                </div>
             )}
          </div>
          <div className="bg-black border border-slate-900 rounded-[3rem] p-10 font-mono text-[11px] text-blue-500 overflow-auto no-scrollbar shadow-2xl leading-relaxed">
              {!rawResponse ? "> System awaiting update command..." : JSON.stringify(rawResponse, null, 2)}
          </div>
      </div>
    </div>
  );
};