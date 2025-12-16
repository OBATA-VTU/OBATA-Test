import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { ConnectionForm } from './components/ConnectionForm';
import { ResponseDisplay } from './components/ResponseDisplay';
import { executeApiRequest } from './services/api';
import { ApiConfig, ApiResponse } from './types';
import { Activity, Radio, Wallet } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);

  const handleTestConnection = async (config: ApiConfig) => {
    setLoading(true);
    setResponse(null);
    try {
      const result = await executeApiRequest(config);
      setResponse(result);
    } catch (error) {
      console.error("Unexpected error in App:", error);
      setResponse({
        success: false,
        status: 0,
        statusText: 'Client Error',
        data: { error: 'An unexpected error occurred within the application.' },
        headers: {},
        duration: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-emerald-600 rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Purchase Services</h2>
                <p className="text-sm text-slate-400">Select a service to test buying from Inlomax</p>
              </div>
            </div>
            <ConnectionForm onSubmit={handleTestConnection} isLoading={loading} />
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-emerald-400" />
              Developer Note
            </h3>
            <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
              <li>This terminal simulates your backend calling the Inlomax API.</li>
              <li>Responses shown on the right are raw outputs from the API provider.</li>
              <li>Verify response codes: <code>200</code> usually means success, <code>401</code> means invalid API Key.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7">
           <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg h-full min-h-[500px] flex flex-col">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Transaction Status</h2>
                <p className="text-sm text-slate-400">Live API Response Log</p>
              </div>
            </div>
            
            <div className="flex-1">
              <ResponseDisplay response={response} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default App;