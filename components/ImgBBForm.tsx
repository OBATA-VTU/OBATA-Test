import React, { useState } from 'react';
import { ApiConfig } from '../types';
import { Settings, Image as ImageIcon, UploadCloud, Loader2, Globe, FileUp } from 'lucide-react';

interface ImgBBFormProps {
  onSubmit: (config: ApiConfig) => void;
  isLoading: boolean;
}

export const ImgBBForm: React.FC<ImgBBFormProps> = ({ onSubmit, isLoading }) => {
  const [apiKey, setApiKey] = useState('');
  const [useProxy, setUseProxy] = useState(false); // ImgBB supports CORS usually
  const [showConfig, setShowConfig] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    // Build FormData
    const formData = new FormData();
    formData.append('image', selectedFile);

    // Construct URL with key
    const url = `https://api.imgbb.com/1/upload?key=${apiKey}`;

    onSubmit({
      url,
      method: 'POST',
      headers: [], // No manual Content-Type for FormData
      body: formData,
      useProxy
    });
  };

  const isFormValid = () => {
    return apiKey && selectedFile;
  };

  return (
    <div className="space-y-6">
      
      {/* API Configuration */}
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
        <button 
          type="button"
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center justify-between w-full text-left text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 hover:text-white"
        >
          <span className="flex items-center"><Settings className="w-3 h-3 mr-2" /> ImgBB Settings</span>
          <span>{showConfig ? 'Hide' : 'Show'}</span>
        </button>
        
        {showConfig && (
          <div className="space-y-3 animate-fadeIn mt-2 pt-2 border-t border-slate-800">
             <div>
              <label className="block text-xs text-slate-500 mb-1">API Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ex: 38290..."
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
            <div className="flex items-end">
                 <label className="flex items-center space-x-2 cursor-pointer bg-slate-800 border border-slate-600 rounded px-3 py-2 w-full h-[38px]">
                    <input 
                      type="checkbox" 
                      checked={useProxy} 
                      onChange={(e) => setUseProxy(e.target.checked)} 
                      className="w-4 h-4 rounded text-purple-500 bg-slate-700 border-slate-500 focus:ring-offset-slate-800"
                    />
                    <div className="flex items-center text-sm text-slate-200">
                      <Globe className="w-3 h-3 mr-1.5 text-blue-400" />
                      <span>Use CORS Proxy</span>
                    </div>
                 </label>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="min-h-[150px] flex flex-col justify-center">
            <label 
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                selectedFile ? 'border-purple-500 bg-purple-900/20' : 'border-slate-600 hover:bg-slate-800'
              }`}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {selectedFile ? (
                      <>
                        <ImageIcon className="w-8 h-8 mb-3 text-purple-400" />
                        <p className="mb-2 text-sm text-purple-300 font-semibold">{selectedFile.name}</p>
                        <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 mb-3 text-slate-400" />
                        <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-slate-500">PNG, JPG or GIF (MAX. 32MB)</p>
                      </>
                    )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
        </div>

        <button
          type="submit"
          disabled={isLoading || !isFormValid()}
          className={`w-full flex items-center justify-center space-x-2 py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white uppercase tracking-wider transition-all duration-200 ${
            isLoading || !isFormValid()
              ? 'bg-slate-700 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:shadow-purple-500/20 active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5 text-white" />
              Uploading...
            </>
          ) : (
            <>
              <FileUp className="w-5 h-5" />
              <span>Upload Image</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};