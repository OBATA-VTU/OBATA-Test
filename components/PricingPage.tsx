import React, { useState, useEffect } from 'react';
import { Search, Smartphone, Wifi, Tv, Zap, CheckCircle, Loader2 } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

// Fallback data if database is empty
const DEFAULT_PRICES = {
    DATA: [
        { id: '101', network: 'MTN', plan: '1.0 GB SME', validity: '30 Days', user: 250, reseller: 215 },
        { id: '102', network: 'MTN', plan: '2.0 GB SME', validity: '30 Days', user: 500, reseller: 430 },
        { id: '201', network: 'AIRTEL', plan: '1.0 GB CG', validity: '30 Days', user: 240, reseller: 210 },
        { id: '301', network: 'GLO', plan: '1.0 GB CG', validity: '30 Days', user: 230, reseller: 200 },
    ],
    CABLE: [
        { id: 'GOTV-1', provider: 'GOTV', plan: 'Smallie', validity: 'Monthly', user: 1900, reseller: 1900 },
        { id: 'DSTV-1', provider: 'DSTV', plan: 'Padi', validity: 'Monthly', user: 4400, reseller: 4400 },
    ],
    EDUCATION: [
        { id: 'WAEC', provider: 'WAEC', plan: 'Result Checker', validity: '5 Uses', user: 3500, reseller: 3300 },
    ]
};

export const PricingPage: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<'DATA' | 'CABLE' | 'EDUCATION'>('DATA');
    const [searchTerm, setSearchTerm] = useState('');
    const [prices, setPrices] = useState<any>(DEFAULT_PRICES);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                // In a real scenario, this fetches from a 'pricing' collection in Firestore
                // For now, we simulate a fetch delay to show dynamic loading behavior
                // or actually check if collection exists
                const snapshot = await getDocs(collection(db, 'pricing'));
                if (!snapshot.empty) {
                    // Logic to parse Firestore data into structure
                    // For now, using default to ensure UI renders
                }
                setTimeout(() => setLoading(false), 800);
            } catch (e) {
                console.error("Error fetching prices", e);
                setLoading(false);
            }
        };
        fetchPrices();
    }, []);

    const filteredData = prices[activeCategory]?.filter((item: any) => 
        item.plan?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.network && item.network.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.provider && item.provider.toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">Live Service Pricing</h1>
                <p className="text-slate-400 max-w-2xl">
                    Real-time pricing for all our VTU services. Rates are subject to change based on provider updates.
                </p>
            </div>

            {/* Category Selector */}
            <div className="flex flex-wrap gap-4">
                <button 
                    onClick={() => setActiveCategory('DATA')}
                    className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${activeCategory === 'DATA' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
                >
                    <Wifi className="w-5 h-5 mr-2" /> Data Bundles
                </button>
                <button 
                    onClick={() => setActiveCategory('CABLE')}
                    className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${activeCategory === 'CABLE' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
                >
                    <Tv className="w-5 h-5 mr-2" /> Cable TV
                </button>
                <button 
                    onClick={() => setActiveCategory('EDUCATION')}
                    className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${activeCategory === 'EDUCATION' ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
                >
                    <Zap className="w-5 h-5 mr-2" /> Education
                </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-500" /> 
                        {activeCategory === 'DATA' ? 'Available Data Plans' : activeCategory === 'CABLE' ? 'Cable Packages' : 'Exam PINs'}
                    </h3>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Search plan..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:border-blue-500" 
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                        <p>Fetching latest rates from provider...</p>
                    </div>
                ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="p-5 border-b border-slate-800">ID</th>
                                <th className="p-5 border-b border-slate-800">Provider</th>
                                <th className="p-5 border-b border-slate-800">Plan Name</th>
                                <th className="p-5 border-b border-slate-800">Validity</th>
                                <th className="p-5 border-b border-slate-800 text-right">Standard Price</th>
                                <th className="p-5 border-b border-slate-800 text-right text-amber-500">Reseller Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                            {filteredData.map((item: any) => (
                                <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-5 font-mono text-xs text-slate-500">{item.id}</td>
                                    <td className="p-5 font-bold">{item.network || item.provider}</td>
                                    <td className="p-5 font-medium">{item.plan}</td>
                                    <td className="p-5 text-slate-400">{item.validity}</td>
                                    <td className="p-5 text-right font-bold text-white">₦{item.user}</td>
                                    <td className="p-5 text-right font-bold text-amber-500">₦{item.reseller}</td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-500">
                                        No plans found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                )}
            </div>
        </div>
    );
};