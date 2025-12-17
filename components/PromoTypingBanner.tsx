import React, { useState, useEffect } from 'react';

const PHRASES = [
  "Buy Cheap Data Bundles...",
  "Pay Electricity Bills Instantly...",
  "Top-up Airtime with Bonus...",
  "Subscribe Cable TV Zero Stress...",
  "Convert Airtime to Cash...",
  "Send Money to Friends..."
];

export const PromoTypingBanner: React.FC = () => {
  const [text, setText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const handleTyping = () => {
      const currentPhrase = PHRASES[phraseIndex];
      
      if (isDeleting) {
        setText(currentPhrase.substring(0, text.length - 1));
        setTypingSpeed(50);
      } else {
        setText(currentPhrase.substring(0, text.length + 1));
        setTypingSpeed(100);
      }

      if (!isDeleting && text === currentPhrase) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, phraseIndex, typingSpeed]);

  return (
    <div className="h-6 flex items-center">
      <span className="text-sm md:text-base font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
        {text}
      </span>
      <span className="w-0.5 h-5 bg-blue-400 ml-1 animate-pulse"></span>
    </div>
  );
};