import React, { useState } from 'react';
import { Zap } from 'lucide-react';

interface LogoProps {
  className?: string;
  showRing?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-10 w-10", showRing = true }) => {
  const [imgError, setImgError] = useState(false);

  // Using a cache-busting timestamp to ensure the logo refreshes if the user uploads a new one
  const logoSrc = `/logo.png?v=${Date.now()}`;

  const LogoContent = () => {
    if (imgError) {
      return (
        <div className={`flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl text-white shadow-lg ${className}`}>
          <Zap className="w-3/5 h-3/5 fill-current" />
        </div>
      );
    }
    return (
      <img 
        src={logoSrc} 
        alt="OBATA VTU" 
        className={`object-contain rounded-2xl bg-white p-1 shadow-inner ${className}`} 
        onError={() => setImgError(true)}
      />
    );
  };

  if (showRing) {
    return (
      <div className="relative group">
         <div className="absolute -inset-1 bg-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
         <div className="relative">
            <LogoContent />
         </div>
      </div>
    );
  }

  return <LogoContent />;
};