import React, { useState } from 'react';
import { Zap } from 'lucide-react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-10 w-10" }) => {
  const [imgError, setImgError] = useState(false);
  // Use a unique version parameter to bypass cache during updates
  const logoSrc = `/logo.png?v=${Date.now()}`;

  if (imgError) {
    return (
      <div className={`flex items-center justify-center text-blue-500 ${className}`}>
        <Zap className="w-full h-full fill-current" />
      </div>
    );
  }

  return (
    <img 
      src={logoSrc} 
      alt="OBATA VTU" 
      className={`object-contain ${className}`} 
      onError={() => setImgError(true)}
    />
  );
};